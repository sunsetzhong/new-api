/**
 * src/config.js
 */

export const DEFAULT_CONFIG = {
    SESSION_DURATION: 7 * 24 * 60 * 60 * 1000,
    MAX_CHATS: 50
};

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, group_id INTEGER DEFAULT 2, created_at INTEGER DEFAULT (strftime('%s','now')), ip TEXT, tokens_used INTEGER DEFAULT 0, default_model TEXT, quota_limit_units INTEGER);
CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, display_name TEXT, price REAL DEFAULT 0, models TEXT DEFAULT '["*"]', token_limit INTEGER DEFAULT 0, rate_period INTEGER DEFAULT 86400, can_purchase INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, cost_multiplier REAL DEFAULT 1.0);
CREATE TABLE IF NOT EXISTS api_configs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, base_url TEXT NOT NULL, api_key TEXT NOT NULL, enabled INTEGER DEFAULT 1, priority INTEGER DEFAULT 0, api_format TEXT DEFAULT 'openai', api_keys TEXT DEFAULT '[]', owner_user_id INTEGER);
CREATE TABLE IF NOT EXISTS models (id INTEGER PRIMARY KEY AUTOINCREMENT, model_id TEXT UNIQUE NOT NULL, display_name TEXT, icon TEXT DEFAULT '🤖', multiplier REAL DEFAULT 1.0, allowed_groups TEXT DEFAULT '["*"]', api_config_id INTEGER, enabled INTEGER DEFAULT 1, upstream_model_id TEXT, pricing_mode TEXT DEFAULT 'usage', price_per_1k_tokens REAL DEFAULT 0, price_per_request REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT DEFAULT 'New Chat', messages TEXT DEFAULT '[]', model TEXT, created_at INTEGER DEFAULT (strftime('%s','now')), updated_at INTEGER DEFAULT (strftime('%s','now')));
CREATE TABLE IF NOT EXISTS user_api_keys (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, key_hash TEXT UNIQUE NOT NULL, key_prefix TEXT NOT NULL, allowed_models TEXT DEFAULT '["*"]', budget_points INTEGER DEFAULT -1, used_points INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, created_at INTEGER DEFAULT (strftime('%s','now')), last_used_at INTEGER);
CREATE TABLE IF NOT EXISTS oauth_accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, created_at INTEGER DEFAULT (strftime('%s','now')), updated_at INTEGER DEFAULT (strftime('%s','now')), UNIQUE(provider, provider_user_id));
CREATE TABLE IF NOT EXISTS quota_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, message_text TEXT, requested_points INTEGER DEFAULT 0, image_key TEXT, image_name TEXT, image_type TEXT, image_size INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', admin_note TEXT, approved_points INTEGER DEFAULT 0, reviewed_by INTEGER, created_at INTEGER DEFAULT (strftime('%s','now')), updated_at INTEGER DEFAULT (strftime('%s','now')), reviewed_at INTEGER);
CREATE TABLE IF NOT EXISTS notices (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT NOT NULL, enabled INTEGER DEFAULT 1, created_by INTEGER, created_at INTEGER DEFAULT (strftime('%s','now')), updated_at INTEGER DEFAULT (strftime('%s','now')));
CREATE TABLE IF NOT EXISTS recharge_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, provider TEXT DEFAULT 'linuxdo', out_trade_no TEXT UNIQUE NOT NULL, gateway_trade_no TEXT, amount REAL NOT NULL, points INTEGER NOT NULL, status TEXT DEFAULT 'pending', raw_payload TEXT, created_at INTEGER DEFAULT (strftime('%s','now')), updated_at INTEGER DEFAULT (strftime('%s','now')), paid_at INTEGER);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS ip_usage (ip TEXT PRIMARY KEY, tokens_used INTEGER DEFAULT 0, updated_at INTEGER DEFAULT (strftime('%s','now')));
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_hash ON user_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_requests_user ON quota_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_requests_status ON quota_requests(status);
CREATE INDEX IF NOT EXISTS idx_notices_enabled ON notices(enabled);
CREATE INDEX IF NOT EXISTS idx_recharge_orders_user ON recharge_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_orders_status ON recharge_orders(status);
`;

export const INITIAL_DATA = `
INSERT OR IGNORE INTO groups (id, name, display_name, price, can_purchase, token_limit, sort_order) VALUES (1, 'root', 'Administrator', 0, 0, -1, 0), (2, 'default', 'Standard', 0, 1, 0, 10);
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', '硬核科技局 AI 站'), ('site_icon_url', ''), ('allow_register', 'true'), ('turnstile_enabled', 'false'), ('turnstile_site_key', ''), ('turnstile_secret_key', ''), ('max_accounts_per_ip', '3'), ('default_system_prompt', 'You are a helpful assistant.'), ('initialized', 'false'), ('default_model', ''), ('token_units_per_usd', '10000'), ('points_per_usd', '10000'), ('linuxdo_pay_enabled', 'false'), ('linuxdo_points_per_credit', '100'), ('linuxdo_pid', ''), ('linuxdo_key', ''), ('linuxdo_pay_type', 'epay'), ('linuxdo_return_url', ''), ('linuxdo_notify_url', ''), ('linuxdo_gateway_url', ''), ('linuxdo_oauth_enabled', 'false'), ('linuxdo_oauth_client_id', ''), ('linuxdo_oauth_client_secret', ''), ('linuxdo_oauth_redirect_uri', ''), ('linuxdo_oauth_authorize_url', 'https://connect.linux.do/oauth2/authorize'), ('linuxdo_oauth_token_url', 'https://connect.linux.do/oauth2/token'), ('linuxdo_oauth_user_url', 'https://connect.linux.do/api/user');
INSERT OR IGNORE INTO notices (id, title, content, enabled, created_by, created_at, updated_at) VALUES (1, '系统通知', '关注视频号“硬核科技局-深度”可以获得 10 积分。', 1, NULL, strftime('%s','now'), strftime('%s','now'));
`;
