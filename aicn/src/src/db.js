/**
 * src/db.js
 */

import { DEFAULT_CONFIG, SCHEMA, INITIAL_DATA } from './config.js';
import { hash, genToken } from './utils.js';

export class DB {
    constructor(d1) { this.d1 = d1; }

    async init() {
        for (const stmt of SCHEMA.split(';').filter(s => s.trim())) await this.d1.prepare(stmt).run();
        await this.ensureSchemaUpgrades();
        try {
             const r = await this.d1.prepare("SELECT count(*) as c FROM groups").first();
             if (r && r.c === 0) {
                 for (const stmt of INITIAL_DATA.split(';').filter(s => s.trim())) await this.d1.prepare(stmt).run();
             }
        } catch {}
    }

    async hasColumn(table, column) {
        try {
            const r = await this.d1.prepare(`PRAGMA table_info(${table})`).all();
            return (r.results || []).some(x => x.name === column);
        } catch {
            return false;
        }
    }

    async ensureSchemaUpgrades() {
        try {
            await this.d1.prepare(`
                CREATE TABLE IF NOT EXISTS user_api_keys (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    key_hash TEXT UNIQUE NOT NULL,
                    key_prefix TEXT NOT NULL,
                    allowed_models TEXT DEFAULT '["*"]',
                    budget_points INTEGER DEFAULT -1,
                    used_points INTEGER DEFAULT 0,
                    enabled INTEGER DEFAULT 1,
                    created_at INTEGER DEFAULT (strftime('%s','now')),
                    last_used_at INTEGER
                )
            `).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON user_api_keys(user_id)`).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_hash ON user_api_keys(key_hash)`).run();
        } catch {}
        try {
            await this.d1.prepare(`
                CREATE TABLE IF NOT EXISTS oauth_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    provider TEXT NOT NULL,
                    provider_user_id TEXT NOT NULL,
                    created_at INTEGER DEFAULT (strftime('%s','now')),
                    updated_at INTEGER DEFAULT (strftime('%s','now')),
                    UNIQUE(provider, provider_user_id)
                )
            `).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id)`).run();
        } catch {}
        try {
            await this.d1.prepare(`
                CREATE TABLE IF NOT EXISTS quota_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    message_text TEXT,
                    requested_points INTEGER DEFAULT 0,
                    image_key TEXT,
                    image_name TEXT,
                    image_type TEXT,
                    image_size INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    admin_note TEXT,
                    approved_points INTEGER DEFAULT 0,
                    reviewed_by INTEGER,
                    created_at INTEGER DEFAULT (strftime('%s','now')),
                    updated_at INTEGER DEFAULT (strftime('%s','now')),
                    reviewed_at INTEGER
                )
            `).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_quota_requests_user ON quota_requests(user_id)`).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_quota_requests_status ON quota_requests(status)`).run();
        } catch {}
        try {
            await this.d1.prepare(`
                CREATE TABLE IF NOT EXISTS notices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    content TEXT NOT NULL,
                    enabled INTEGER DEFAULT 1,
                    created_by INTEGER,
                    created_at INTEGER DEFAULT (strftime('%s','now')),
                    updated_at INTEGER DEFAULT (strftime('%s','now'))
                )
            `).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_notices_enabled ON notices(enabled)`).run();
        } catch {}
        try {
            await this.d1.prepare(`
                CREATE TABLE IF NOT EXISTS recharge_orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    provider TEXT DEFAULT 'linuxdo',
                    out_trade_no TEXT UNIQUE NOT NULL,
                    gateway_trade_no TEXT,
                    amount REAL NOT NULL,
                    points INTEGER NOT NULL,
                    status TEXT DEFAULT 'pending',
                    raw_payload TEXT,
                    created_at INTEGER DEFAULT (strftime('%s','now')),
                    updated_at INTEGER DEFAULT (strftime('%s','now')),
                    paid_at INTEGER
                )
            `).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_recharge_orders_user ON recharge_orders(user_id)`).run();
            await this.d1.prepare(`CREATE INDEX IF NOT EXISTS idx_recharge_orders_status ON recharge_orders(status)`).run();
        } catch {}

        const upgrades = [
            { table: 'users', column: 'quota_limit_units', sql: "ALTER TABLE users ADD COLUMN quota_limit_units INTEGER" },
            { table: 'groups', column: 'cost_multiplier', sql: "ALTER TABLE groups ADD COLUMN cost_multiplier REAL DEFAULT 1.0" },
            { table: 'api_configs', column: 'api_format', sql: "ALTER TABLE api_configs ADD COLUMN api_format TEXT DEFAULT 'openai'" },
            { table: 'api_configs', column: 'api_keys', sql: "ALTER TABLE api_configs ADD COLUMN api_keys TEXT DEFAULT '[]'" },
            { table: 'api_configs', column: 'owner_user_id', sql: "ALTER TABLE api_configs ADD COLUMN owner_user_id INTEGER" },
            { table: 'models', column: 'upstream_model_id', sql: "ALTER TABLE models ADD COLUMN upstream_model_id TEXT" },
            { table: 'models', column: 'pricing_mode', sql: "ALTER TABLE models ADD COLUMN pricing_mode TEXT DEFAULT 'usage'" },
            { table: 'models', column: 'price_per_1k_tokens', sql: "ALTER TABLE models ADD COLUMN price_per_1k_tokens REAL DEFAULT 0" },
            { table: 'models', column: 'price_per_request', sql: "ALTER TABLE models ADD COLUMN price_per_request REAL DEFAULT 0" }
        ];
        for (const u of upgrades) {
            if (!(await this.hasColumn(u.table, u.column))) {
                try { await this.d1.prepare(u.sql).run(); } catch {}
            }
        }
    }

    // ==================== IP Usage (New) ====================
    async getIPUsage(ip) {
        const r = await this.d1.prepare('SELECT tokens_used FROM ip_usage WHERE ip=?').bind(ip).first();
        return r?.tokens_used || 0;
    }

    async addIPUsage(ip, count) {
        // 使用 Upsert 语法：如果存在则累加，不存在则插入
        await this.d1.prepare(`
            INSERT INTO ip_usage (ip, tokens_used) VALUES (?, ?)
            ON CONFLICT(ip) DO UPDATE SET
            tokens_used = tokens_used + ?,
            updated_at = strftime('%s','now')
        `).bind(ip, count, count).run();
    }

    // ==================== Settings ====================
    async getSetting(k) {
        const r = await this.d1.prepare('SELECT value FROM settings WHERE key=?').bind(k).first();
        return r?.value;
    }

    async setSetting(k, v) {
        await this.d1.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').bind(k, v).run();
    }

    async getSettings() {
        const r = await this.d1.prepare('SELECT * FROM settings').all();
        return Object.fromEntries(r.results.map(s => [s.key, s.value]));
    }

    // ==================== Users ====================
    async getUserByEmail(e) {
        return this.d1.prepare('SELECT * FROM users WHERE email=?').bind(e).first();
    }

    async getUserById(id) {
        return this.d1.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
    }

    async getUserCount() {
        return (await this.d1.prepare('SELECT COUNT(*) as c FROM users').first()).c;
    }

    async getIPCount(ip) {
        return (await this.d1.prepare('SELECT COUNT(*) as c FROM users WHERE ip=?').bind(ip).first()).c;
    }

    async createUser(email, pass, ip) {
        const h = await hash(pass);
        const gid = (await this.getUserCount()) === 0 ? 1 : 2;
        await this.d1.prepare('INSERT INTO users (email,password,group_id,ip) VALUES (?,?,?,?)').bind(email, h, gid, ip).run();
        return this.getUserByEmail(email);
    }

    async updateUser(id, data) {
        if (data.group_id !== undefined) {
            const user = await this.getUserById(id);
            if (!user) throw new Error('User not found');
            if (user.group_id === 1 && data.group_id !== 1) throw new Error('Cannot change admin to other group');
            if (![1, 2].includes(Number(data.group_id))) throw new Error('Only admin/user roles are allowed');
        }
        const keys = Object.keys(data);
        if (!keys.length) return;
        const sets = keys.map(k => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE users SET ${sets} WHERE id=?`).bind(...Object.values(data), id).run();
    }

    async getUsers() {
        return (await this.d1.prepare('SELECT id,email,group_id,created_at,tokens_used,default_model,quota_limit_units FROM users').all()).results;
    }

    async deleteUser(id) {
        const user = await this.getUserById(id);
        if (user && user.group_id === 1) throw new Error('Cannot delete admin user');
        await this.d1.prepare('DELETE FROM users WHERE id=?').bind(id).run();
    }

    // ==================== Sessions ====================
    async createSession(uid) {
        const t = genToken();
        const exp = Date.now() + DEFAULT_CONFIG.SESSION_DURATION;
        await this.d1.prepare('DELETE FROM sessions WHERE expires_at<?').bind(Date.now()).run();
        await this.d1.prepare('INSERT INTO sessions (user_id,token,expires_at) VALUES (?,?,?)').bind(uid, t, exp).run();
        return t;
    }

    async getSession(t) {
        const s = await this.d1.prepare('SELECT * FROM sessions WHERE token=? AND expires_at>?').bind(t, Date.now()).first();
        return s ? this.getUserById(s.user_id) : null;
    }

    async deleteSession(t) {
        await this.d1.prepare('DELETE FROM sessions WHERE token=?').bind(t).run();
    }

    // ==================== OAuth Accounts ====================
    async getOAuthAccount(provider, providerUserId) {
        return this.d1.prepare(`
            SELECT * FROM oauth_accounts
            WHERE provider=? AND provider_user_id=?
        `).bind(String(provider || '').trim(), String(providerUserId || '').trim()).first();
    }

    async upsertOAuthAccount(provider, providerUserId, userId) {
        const p = String(provider || '').trim();
        const puid = String(providerUserId || '').trim();
        if (!p || !puid || !Number.isFinite(Number(userId))) throw new Error('Invalid oauth account payload');
        await this.d1.prepare(`
            INSERT INTO oauth_accounts (user_id, provider, provider_user_id, created_at, updated_at)
            VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
            ON CONFLICT(provider, provider_user_id)
            DO UPDATE SET user_id=excluded.user_id, updated_at=strftime('%s','now')
        `).bind(Number(userId), p, puid).run();
    }

    // ==================== Groups ====================
    async getGroups() {
        return (await this.d1.prepare('SELECT * FROM groups ORDER BY sort_order').all()).results;
    }

    async getGroup(id) {
        return this.d1.prepare('SELECT * FROM groups WHERE id=?').bind(id).first();
    }

    async createGroup(d) {
        await this.d1.prepare(`INSERT INTO groups (name, display_name, price, models, token_limit, rate_period, can_purchase, sort_order, enabled, cost_multiplier) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(d.name, d.display_name || d.name, 0, d.models || '["*"]', d.token_limit ?? 0, d.rate_period ?? 86400, d.can_purchase ?? 1, d.sort_order ?? 10, d.enabled ?? 1, d.cost_multiplier ?? 1.0).run();
    }

    async updateGroup(id, d) {
        const payload = { ...d };
        delete payload.id;
        delete payload.price;
        const entries = Object.entries(payload);
        if (!entries.length) return;
        const sets = entries.map(([k]) => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE groups SET ${sets} WHERE id=?`).bind(...entries.map(([, v]) => v), id).run();
    }

    async deleteGroup(id) {
        if (id <= 3) throw new Error('Cannot delete system groups');
        await this.d1.prepare('UPDATE users SET group_id=2 WHERE group_id=?').bind(id).run();
        await this.d1.prepare('DELETE FROM groups WHERE id=?').bind(id).run();
    }

    async ensureSystemGroups() {
        try {
            const g1 = await this.d1.prepare('SELECT id FROM groups WHERE id=1').first();
            if (!g1) await this.d1.prepare(`INSERT INTO groups (id, name, display_name, price, models, token_limit, rate_period, can_purchase, sort_order, enabled, cost_multiplier) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(1, 'root', 'Administrator', 0, '["*"]', -1, 86400, 0, 0, 1, 1.0).run();
            const g2 = await this.d1.prepare('SELECT id FROM groups WHERE id=2').first();
            if (!g2) await this.d1.prepare(`INSERT INTO groups (id, name, display_name, price, models, token_limit, rate_period, can_purchase, sort_order, enabled, cost_multiplier) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(2, 'default', 'Standard', 0, '["*"]', 0, 86400, 1, 10, 1, 1.0).run();
            await this.d1.prepare(`UPDATE groups SET token_limit = 0 WHERE id = 2 AND token_limit IN (1000000, 100000, 10000, 100)`).run();
            await this.d1.prepare(`UPDATE groups SET display_name = COALESCE(NULLIF(display_name, ''), name) WHERE id IN (1,2) AND (display_name IS NULL OR display_name = '')`).run();
            await this.d1.prepare(`UPDATE groups SET cost_multiplier = 1.0 WHERE cost_multiplier IS NULL OR cost_multiplier <= 0`).run();
            await this.d1.prepare(`UPDATE groups SET enabled = 0 WHERE id = 3`).run();
            await this.d1.prepare(`UPDATE users SET group_id = 2 WHERE group_id NOT IN (1,2)`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('token_units_per_usd', '10000')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('points_per_usd', '10000')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_register', 'true')`).run();
            await this.d1.prepare(`UPDATE settings SET value='10000' WHERE key='token_units_per_usd' AND (value IS NULL OR value='' OR value='100000')`).run();
            await this.d1.prepare(`UPDATE settings SET value='10000' WHERE key='points_per_usd' AND (value IS NULL OR value='' OR value='100')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('site_icon_url', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_pay_enabled', 'false')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_points_per_credit', '100')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_pid', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_key', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_pay_type', 'epay')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_return_url', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_notify_url', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_gateway_url', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_enabled', 'false')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_client_id', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_client_secret', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_redirect_uri', '')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_authorize_url', 'https://connect.linux.do/oauth2/authorize')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_token_url', 'https://connect.linux.do/oauth2/token')`).run();
            await this.d1.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('linuxdo_oauth_user_url', 'https://connect.linux.do/api/user')`).run();
            await this.d1.prepare(`UPDATE settings SET value='硬核科技局 AI 站' WHERE key='site_name' AND (value IS NULL OR value='' OR value='AI Chat')`).run();
        } catch {}
    }

    // ==================== API Configs ====================
    async getAPIConfigs() {
        return (await this.d1.prepare('SELECT * FROM api_configs ORDER BY priority DESC, id DESC').all()).results;
    }

    async getAPIConfig(id) {
        return this.d1.prepare('SELECT * FROM api_configs WHERE id=?').bind(id).first();
    }

    async getAPIConfigForUser(id, user) {
        if (user?.group_id === 1) return this.getAPIConfig(id);
        return this.d1.prepare('SELECT * FROM api_configs WHERE id=? AND (owner_user_id IS NULL OR owner_user_id=?)').bind(id, user?.id || -1).first();
    }

    async getAPIConfigsForUser(user, { includeDisabled = false } = {}) {
        if (user?.group_id === 1) {
            if (includeDisabled) return this.getAPIConfigs();
            return (await this.d1.prepare('SELECT * FROM api_configs WHERE enabled=1 ORDER BY priority DESC, id DESC').all()).results;
        }
        if (includeDisabled) {
            return (await this.d1.prepare('SELECT * FROM api_configs WHERE owner_user_id=? ORDER BY priority DESC, id DESC').bind(user?.id || -1).all()).results;
        }
        return (await this.d1.prepare('SELECT * FROM api_configs WHERE enabled=1 AND (owner_user_id IS NULL OR owner_user_id=?) ORDER BY priority DESC, id DESC').bind(user?.id || -1).all()).results;
    }

    normalizeAPIKeys(api_key, api_keys) {
        let keys = [];
        if (typeof api_keys === 'string') {
            const s = api_keys.trim();
            if (s) {
                try {
                    const parsed = JSON.parse(s);
                    keys = Array.isArray(parsed) ? parsed : s.split('\n');
                } catch {
                    keys = s.split('\n');
                }
            }
        } else if (Array.isArray(api_keys)) {
            keys = api_keys;
        }
        if (api_key && !keys.length) keys = [api_key];
        keys = [...new Set(keys.map(k => String(k || '').trim()).filter(Boolean))];
        return keys;
    }

    async createAPIConfig(d) {
        const keys = this.normalizeAPIKeys(d.api_key, d.api_keys);
        const primary = keys[0] || '';
        const res = await this.d1.prepare(`INSERT INTO api_configs (name, base_url, api_key, enabled, priority, api_format, api_keys, owner_user_id) VALUES (?,?,?,?,?,?,?,?) RETURNING id`).bind(d.name, d.base_url, primary, d.enabled ?? 1, d.priority || 0, d.api_format || 'openai', JSON.stringify(keys), d.owner_user_id ?? null).first();
        return res;
    }

    async updateAPIConfig(id, d) {
        const payload = { ...d };
        delete payload.id;
        if (payload.api_key !== undefined || payload.api_keys !== undefined) {
            const keys = this.normalizeAPIKeys(payload.api_key, payload.api_keys);
            payload.api_keys = JSON.stringify(keys);
            payload.api_key = keys[0] || '';
        }
        const entries = Object.entries(payload);
        if (!entries.length) return;
        const sets = entries.map(([k]) => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE api_configs SET ${sets} WHERE id=?`).bind(...entries.map(([, v]) => v), id).run();
    }

    async deleteAPIConfig(id) {
        await this.d1.prepare('DELETE FROM api_configs WHERE id=?').bind(id).run();
    }

    // ==================== User API Keys (Local /v1) ====================
    async getUserAPIKeys(userId) {
        return (await this.d1.prepare(`
            SELECT id, user_id, name, key_prefix, allowed_models, budget_points, used_points, enabled, created_at, last_used_at
            FROM user_api_keys
            WHERE user_id=?
            ORDER BY id DESC
        `).bind(userId).all()).results;
    }

    async getUserAPIKey(id, userId = null) {
        if (userId === null || userId === undefined) {
            return this.d1.prepare(`SELECT * FROM user_api_keys WHERE id=?`).bind(id).first();
        }
        return this.d1.prepare(`SELECT * FROM user_api_keys WHERE id=? AND user_id=?`).bind(id, userId).first();
    }

    async getUserAPIKeyByHash(keyHash) {
        return this.d1.prepare(`SELECT * FROM user_api_keys WHERE key_hash=? AND enabled=1`).bind(keyHash).first();
    }

    async createUserAPIKey(d) {
        const r = await this.d1.prepare(`
            INSERT INTO user_api_keys (user_id, name, key_hash, key_prefix, allowed_models, budget_points, used_points, enabled)
            VALUES (?,?,?,?,?,?,?,?)
            RETURNING id, user_id, name, key_prefix, allowed_models, budget_points, used_points, enabled, created_at, last_used_at
        `).bind(
            d.user_id,
            d.name,
            d.key_hash,
            d.key_prefix,
            d.allowed_models || '["*"]',
            Number.isFinite(Number(d.budget_points)) ? Math.round(Number(d.budget_points)) : -1,
            Number.isFinite(Number(d.used_points)) ? Math.max(0, Math.round(Number(d.used_points))) : 0,
            d.enabled ? 1 : 0
        ).first();
        return r;
    }

    async updateUserAPIKey(id, userId, data) {
        const payload = { ...data };
        delete payload.id;
        delete payload.user_id;
        delete payload.key_hash;
        delete payload.key_prefix;
        const entries = Object.entries(payload);
        if (!entries.length) return;
        const sets = entries.map(([k]) => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE user_api_keys SET ${sets} WHERE id=? AND user_id=?`).bind(...entries.map(([, v]) => v), id, userId).run();
    }

    async deleteUserAPIKey(id, userId) {
        await this.d1.prepare(`DELETE FROM user_api_keys WHERE id=? AND user_id=?`).bind(id, userId).run();
    }

    async addUserAPIKeyUsage(id, points) {
        const p = Math.max(0, Math.round(Number(points) || 0));
        if (!p) return;
        await this.d1.prepare(`
            UPDATE user_api_keys
            SET used_points = used_points + ?, last_used_at = strftime('%s','now')
            WHERE id=?
        `).bind(p, id).run();
    }

    // ==================== Quota Requests ====================
    async createQuotaRequest(d) {
        const now = Math.floor(Date.now() / 1000);
        const r = await this.d1.prepare(`
            INSERT INTO quota_requests (user_id, message_text, requested_points, image_key, image_name, image_type, image_size, status, approved_points, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            RETURNING *
        `).bind(
            d.user_id,
            d.message_text || '',
            Math.max(0, Math.round(Number(d.requested_points) || 0)),
            d.image_key || null,
            d.image_name || null,
            d.image_type || null,
            Math.max(0, Math.round(Number(d.image_size) || 0)),
            'pending',
            0,
            now,
            now
        ).first();
        return r;
    }

    async getQuotaRequest(id) {
        return this.d1.prepare('SELECT * FROM quota_requests WHERE id=?').bind(id).first();
    }

    async getQuotaRequestsByUser(userId) {
        return (await this.d1.prepare(`
            SELECT id, user_id, message_text, requested_points, image_key, image_name, image_type, image_size, status, admin_note, approved_points, reviewed_by, created_at, updated_at, reviewed_at
            FROM quota_requests
            WHERE user_id=?
            ORDER BY id DESC
        `).bind(userId).all()).results;
    }

    async getAllQuotaRequests() {
        return (await this.d1.prepare(`
            SELECT q.*, u.email AS user_email
            FROM quota_requests q
            LEFT JOIN users u ON u.id = q.user_id
            ORDER BY q.id DESC
        `).all()).results;
    }

    async reviewQuotaRequest(id, d) {
        const payload = { ...d, updated_at: Math.floor(Date.now() / 1000) };
        if (payload.status !== 'pending') payload.reviewed_at = Math.floor(Date.now() / 1000);
        const entries = Object.entries(payload);
        if (!entries.length) return;
        const sets = entries.map(([k]) => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE quota_requests SET ${sets} WHERE id=?`).bind(...entries.map(([, v]) => v), id).run();
    }

    // ==================== Notices ====================
    async getNotices({ includeDisabled = false, limit = 50 } = {}) {
        const lim = Math.max(1, Math.min(200, Number(limit) || 50));
        const where = includeDisabled ? '' : 'WHERE n.enabled=1';
        return (await this.d1.prepare(`
            SELECT n.*, u.email AS created_by_email
            FROM notices n
            LEFT JOIN users u ON u.id = n.created_by
            ${where}
            ORDER BY n.id DESC
            LIMIT ${lim}
        `).all()).results;
    }

    async createNotice(d) {
        const now = Math.floor(Date.now() / 1000);
        return this.d1.prepare(`
            INSERT INTO notices (title, content, enabled, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        `).bind(
            d.title || null,
            d.content,
            d.enabled ? 1 : 0,
            d.created_by ?? null,
            now,
            now
        ).first();
    }

    async updateNotice(id, d) {
        const exists = await this.d1.prepare('SELECT id FROM notices WHERE id=?').bind(id).first();
        if (!exists) return 0;
        const payload = { ...d, updated_at: Math.floor(Date.now() / 1000) };
        const entries = Object.entries(payload);
        if (!entries.length) return 1;
        const sets = entries.map(([k]) => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE notices SET ${sets} WHERE id=?`).bind(...entries.map(([, v]) => v), id).run();
        return 1;
    }

    async deleteNotice(id) {
        const res = await this.d1.prepare('DELETE FROM notices WHERE id=?').bind(id).run();
        return Number(res?.meta?.changes || 0);
    }

    // ==================== Recharge Orders ====================
    async createRechargeOrder(d) {
        const now = Math.floor(Date.now() / 1000);
        return this.d1.prepare(`
            INSERT INTO recharge_orders (user_id, provider, out_trade_no, amount, points, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `).bind(
            d.user_id,
            d.provider || 'linuxdo',
            d.out_trade_no,
            Number(d.amount) || 0,
            Math.max(0, Math.round(Number(d.points) || 0)),
            d.status || 'pending',
            now,
            now
        ).first();
    }

    async getRechargeOrderByOutTradeNo(outTradeNo) {
        return this.d1.prepare(`SELECT * FROM recharge_orders WHERE out_trade_no=?`).bind(outTradeNo).first();
    }

    async getRechargeOrdersByUser(userId, limit = 20) {
        const lim = Math.max(1, Math.min(200, Number(limit) || 20));
        return (await this.d1.prepare(`
            SELECT id, provider, out_trade_no, gateway_trade_no, amount, points, status, created_at, updated_at, paid_at
            FROM recharge_orders
            WHERE user_id=?
            ORDER BY id DESC
            LIMIT ${lim}
        `).bind(userId).all()).results;
    }

    async markRechargeOrderPaid(id, data = {}) {
        const now = Math.floor(Date.now() / 1000);
        const res = await this.d1.prepare(`
            UPDATE recharge_orders
            SET status='success', gateway_trade_no=?, raw_payload=?, paid_at=?, updated_at=?
            WHERE id=? AND status!='success'
        `).bind(
            data.gateway_trade_no || null,
            data.raw_payload || null,
            now,
            now,
            id
        ).run();
        return Number(res?.meta?.changes || 0);
    }

    // ==================== Models ====================
    async getModels() {
        return (await this.d1.prepare('SELECT * FROM models WHERE enabled=1').all()).results;
    }

    async getAllModels() {
        return (await this.d1.prepare('SELECT * FROM models').all()).results;
    }

    async getModel(id) {
        return this.d1.prepare('SELECT * FROM models WHERE model_id=?').bind(id).first();
    }

    async upsertModel(d) {
        await this.d1.prepare(`
            INSERT INTO models (model_id, display_name, icon, multiplier, allowed_groups, api_config_id, enabled, upstream_model_id, pricing_mode, price_per_1k_tokens, price_per_request)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(model_id) DO UPDATE SET
                display_name=excluded.display_name,
                icon=excluded.icon,
                multiplier=excluded.multiplier,
                allowed_groups=excluded.allowed_groups,
                api_config_id=excluded.api_config_id,
                enabled=excluded.enabled,
                upstream_model_id=excluded.upstream_model_id,
                pricing_mode=excluded.pricing_mode,
                price_per_1k_tokens=excluded.price_per_1k_tokens,
                price_per_request=excluded.price_per_request
        `).bind(
            d.model_id,
            d.display_name || d.model_id,
            d.icon || '🤖',
            d.multiplier || 1.0,
            d.allowed_groups || '["*"]',
            d.api_config_id || null,
            d.enabled ?? 1,
            d.upstream_model_id || null,
            d.pricing_mode || 'usage',
            Number(d.price_per_1k_tokens) || 0,
            Number(d.price_per_request) || 0
        ).run();
    }

    async deleteModel(id) {
        await this.d1.prepare('DELETE FROM models WHERE model_id=?').bind(id).run();
    }

    async deleteModelsByAPI(apiId) {
        await this.d1.prepare('DELETE FROM models WHERE api_config_id=?').bind(apiId).run();
    }

    // ==================== Chats ====================
    async getChats(uid) {
        // IP 访客 uid 是 null 或字符串，SQL查询需要整数，所以如果是 IP 访客，直接返回空
        if (typeof uid !== 'number') return [];
        return (await this.d1.prepare(`SELECT id, title, model, updated_at FROM chats WHERE user_id=? ORDER BY updated_at DESC LIMIT 50`).bind(uid).all()).results;
    }

    async getChat(id, uid) {
        if (typeof uid !== 'number') return null;
        return this.d1.prepare('SELECT * FROM chats WHERE id=? AND user_id=?').bind(id, uid).first();
    }

    async createChat(uid, title, model) {
        if (typeof uid !== 'number') throw new Error('Guests cannot save history');
        const r = await this.d1.prepare(`INSERT INTO chats (user_id, title, model) VALUES (?,?,?) RETURNING id`).bind(uid, title, model || '').first();
        return r.id;
    }

    async updateChat(id, uid, d) {
        if (typeof uid !== 'number') return;
        d.updated_at = Math.floor(Date.now() / 1000);
        const sets = Object.keys(d).map(k => `${k}=?`).join(',');
        await this.d1.prepare(`UPDATE chats SET ${sets} WHERE id=? AND user_id=?`).bind(...Object.values(d), id, uid).run();
    }

    async deleteChat(id, uid) {
        if (typeof uid !== 'number') return;
        await this.d1.prepare('DELETE FROM chats WHERE id=? AND user_id=?').bind(id, uid).run();
    }

    async exportData(types = []) {
        const requested = new Set(Array.isArray(types) && types.length ? types : ['users', 'groups', 'apis', 'models', 'settings', 'oauth_accounts', 'quota_requests', 'notices', 'recharge_orders']);
        const out = {};

        if (requested.has('users')) out.users = (await this.d1.prepare('SELECT * FROM users ORDER BY id').all()).results;
        if (requested.has('groups')) out.groups = (await this.d1.prepare('SELECT * FROM groups ORDER BY id').all()).results;
        if (requested.has('apis')) out.apis = (await this.d1.prepare('SELECT * FROM api_configs ORDER BY id').all()).results;
        if (requested.has('models')) out.models = (await this.d1.prepare('SELECT * FROM models ORDER BY id').all()).results;
        if (requested.has('oauth_accounts')) out.oauth_accounts = (await this.d1.prepare('SELECT * FROM oauth_accounts ORDER BY id').all()).results;
        if (requested.has('quota_requests')) out.quota_requests = (await this.d1.prepare('SELECT * FROM quota_requests ORDER BY id').all()).results;
        if (requested.has('notices')) out.notices = (await this.d1.prepare('SELECT * FROM notices ORDER BY id').all()).results;
        if (requested.has('recharge_orders')) out.recharge_orders = (await this.d1.prepare('SELECT * FROM recharge_orders ORDER BY id').all()).results;
        if (requested.has('settings')) out.settings = await this.getSettings();

        return out;
    }

    async importData(data, mode = 'merge') {
        const replace = mode === 'replace';
        const stats = {};

        if (Array.isArray(data.users)) {
            if (replace) await this.d1.prepare('DELETE FROM users').run();
            let count = 0;
            for (const u of data.users) {
                if (!u?.email || !u?.password) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO users (id, email, password, group_id, created_at, ip, tokens_used, default_model, quota_limit_units)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    u.id ?? null,
                    u.email,
                    u.password,
                    [1, 2].includes(Number(u.group_id)) ? Number(u.group_id) : 2,
                    u.created_at ?? Math.floor(Date.now() / 1000),
                    u.ip ?? null,
                    u.tokens_used ?? 0,
                    u.default_model ?? null,
                    u.quota_limit_units ?? null
                ).run();
                count++;
            }
            stats.users = count;
        }

        if (Array.isArray(data.groups)) {
            if (replace) await this.d1.prepare('DELETE FROM groups').run();
            let count = 0;
            for (const g of data.groups) {
                if (!g?.name) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO groups (id, name, display_name, price, models, token_limit, rate_period, can_purchase, sort_order, enabled, cost_multiplier)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    g.id ?? null,
                    g.name,
                    g.display_name ?? g.name,
                    0,
                    g.models ?? '["*"]',
                    g.token_limit ?? 0,
                    g.rate_period ?? 86400,
                    g.can_purchase ?? 1,
                    g.sort_order ?? 0,
                    g.enabled ?? 1,
                    g.cost_multiplier ?? 1.0
                ).run();
                count++;
            }
            stats.groups = count;
        }

        if (Array.isArray(data.apis)) {
            if (replace) await this.d1.prepare('DELETE FROM api_configs').run();
            let count = 0;
            for (const c of data.apis) {
                if (!c?.name || !c?.base_url) continue;
                const keys = this.normalizeAPIKeys(c.api_key, c.api_keys);
                if (!keys.length) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO api_configs (id, name, base_url, api_key, enabled, priority, api_format, api_keys, owner_user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    c.id ?? null,
                    c.name,
                    c.base_url,
                    keys[0],
                    c.enabled ?? 1,
                    c.priority ?? 0,
                    c.api_format ?? 'openai',
                    JSON.stringify(keys),
                    c.owner_user_id ?? null
                ).run();
                count++;
            }
            stats.apis = count;
        }

        if (Array.isArray(data.models)) {
            if (replace) await this.d1.prepare('DELETE FROM models').run();
            let count = 0;
            for (const m of data.models) {
                if (!m?.model_id) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO models (id, model_id, display_name, icon, multiplier, allowed_groups, api_config_id, enabled, upstream_model_id, pricing_mode, price_per_1k_tokens, price_per_request)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    m.id ?? null,
                    m.model_id,
                    m.display_name ?? m.model_id,
                    m.icon ?? '🤖',
                    m.multiplier ?? 1.0,
                    m.allowed_groups ?? '["*"]',
                    m.api_config_id ?? null,
                    m.enabled ?? 1,
                    m.upstream_model_id ?? null,
                    m.pricing_mode ?? 'usage',
                    m.price_per_1k_tokens ?? 0,
                    m.price_per_request ?? 0
                ).run();
                count++;
            }
            stats.models = count;
        }

        if (Array.isArray(data.oauth_accounts)) {
            if (replace) await this.d1.prepare('DELETE FROM oauth_accounts').run();
            let count = 0;
            for (const o of data.oauth_accounts) {
                const userId = Number(o?.user_id);
                const provider = String(o?.provider || '').trim();
                const providerUserId = String(o?.provider_user_id || '').trim();
                if (!Number.isFinite(userId) || !provider || !providerUserId) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO oauth_accounts (id, user_id, provider, provider_user_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                    o.id ?? null,
                    userId,
                    provider,
                    providerUserId,
                    o.created_at ?? Math.floor(Date.now() / 1000),
                    o.updated_at ?? Math.floor(Date.now() / 1000)
                ).run();
                count++;
            }
            stats.oauth_accounts = count;
        }

        if (Array.isArray(data.quota_requests)) {
            if (replace) await this.d1.prepare('DELETE FROM quota_requests').run();
            let count = 0;
            for (const q of data.quota_requests) {
                if (!q?.user_id) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO quota_requests (id, user_id, message_text, requested_points, image_key, image_name, image_type, image_size, status, admin_note, approved_points, reviewed_by, created_at, updated_at, reviewed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    q.id ?? null,
                    q.user_id,
                    q.message_text ?? '',
                    q.requested_points ?? 0,
                    q.image_key ?? null,
                    q.image_name ?? null,
                    q.image_type ?? null,
                    q.image_size ?? 0,
                    q.status ?? 'pending',
                    q.admin_note ?? null,
                    q.approved_points ?? 0,
                    q.reviewed_by ?? null,
                    q.created_at ?? Math.floor(Date.now() / 1000),
                    q.updated_at ?? Math.floor(Date.now() / 1000),
                    q.reviewed_at ?? null
                ).run();
                count++;
            }
            stats.quota_requests = count;
        }

        if (Array.isArray(data.notices)) {
            if (replace) await this.d1.prepare('DELETE FROM notices').run();
            let count = 0;
            for (const n of data.notices) {
                if (!n?.content) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO notices (id, title, content, enabled, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    n.id ?? null,
                    n.title ?? null,
                    n.content,
                    n.enabled ?? 1,
                    n.created_by ?? null,
                    n.created_at ?? Math.floor(Date.now() / 1000),
                    n.updated_at ?? Math.floor(Date.now() / 1000)
                ).run();
                count++;
            }
            stats.notices = count;
        }

        if (Array.isArray(data.recharge_orders)) {
            if (replace) await this.d1.prepare('DELETE FROM recharge_orders').run();
            let count = 0;
            for (const o of data.recharge_orders) {
                if (!o?.user_id || !o?.out_trade_no) continue;
                await this.d1.prepare(`
                    INSERT OR REPLACE INTO recharge_orders (id, user_id, provider, out_trade_no, gateway_trade_no, amount, points, status, raw_payload, created_at, updated_at, paid_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    o.id ?? null,
                    o.user_id,
                    o.provider ?? 'linuxdo',
                    o.out_trade_no,
                    o.gateway_trade_no ?? null,
                    Number(o.amount) || 0,
                    Math.max(0, Math.round(Number(o.points) || 0)),
                    o.status ?? 'pending',
                    o.raw_payload ?? null,
                    o.created_at ?? Math.floor(Date.now() / 1000),
                    o.updated_at ?? Math.floor(Date.now() / 1000),
                    o.paid_at ?? null
                ).run();
                count++;
            }
            stats.recharge_orders = count;
        }

        if (data.settings && typeof data.settings === 'object') {
            if (replace) await this.d1.prepare('DELETE FROM settings').run();
            let count = 0;
            if (Array.isArray(data.settings)) {
                for (const s of data.settings) {
                    if (!s?.key) continue;
                    await this.setSetting(s.key, String(s.value ?? ''));
                    count++;
                }
            } else {
                for (const [k, v] of Object.entries(data.settings)) {
                    await this.setSetting(k, String(v ?? ''));
                    count++;
                }
            }
            stats.settings = count;
        }

        await this.ensureSystemGroups();
        await this.setSetting('initialized', 'true');
        return stats;
    }

    async reset() {
        try {
            const tables = ['users', 'groups', 'api_configs', 'models', 'sessions', 'chats', 'settings', 'ip_usage', 'user_api_keys', 'oauth_accounts', 'quota_requests', 'notices', 'recharge_orders'];
            for (const t of tables) await this.d1.prepare(`DROP TABLE IF EXISTS ${t}`).run();
        } catch (e) { console.error(e); }
        await this.init();
        await this.ensureSystemGroups();
        await this.setSetting('initialized', 'true');
    }
}
