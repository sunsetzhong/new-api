/**
 * src/api.js
 */

import { DEFAULT_CONFIG } from './config.js';
import { H, jsonRes, errRes, hash, verifyTurnstile } from './utils.js';
import { requireAuth, requireRoot } from './middleware.js';

const DEFAULT_TOKEN_UNITS_PER_USD = 10000;
const DEFAULT_POINTS_PER_USD = 10000;
const DEFAULT_LINUXDO_POINTS_PER_CREDIT = 100;
const LINUXDO_GATEWAY_URL = 'https://credit.linux.do/epay/pay/submit.php';
const LINUXDO_OAUTH_AUTHORIZE_URL = 'https://connect.linux.do/oauth2/authorize';
const LINUXDO_OAUTH_TOKEN_URL = 'https://connect.linux.do/oauth2/token';
const LINUXDO_OAUTH_USER_URL = 'https://connect.linux.do/api/user';

const getTokenUnitsPerUSD = (settings = {}) => {
    const n = parseInt(settings.token_units_per_usd, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_TOKEN_UNITS_PER_USD;
};

const getPointsPerUSD = (settings = {}) => {
    const n = parseInt(settings.points_per_usd, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_POINTS_PER_USD;
};

const toUSD = (units, tokenUnitsPerUSD) => {
    const n = Number(units);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return -1;
    return Number((n / tokenUnitsPerUSD).toFixed(4));
};

const toPoints = (units, tokenUnitsPerUSD, pointsPerUSD) => {
    const usd = toUSD(units, tokenUnitsPerUSD);
    if (usd === null) return null;
    if (usd < 0) return -1;
    return Number((usd * pointsPerUSD).toFixed(2));
};

const getLinuxDoPointsPerCredit = (settings = {}) => {
    const n = parseInt(settings.linuxdo_points_per_credit, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_LINUXDO_POINTS_PER_CREDIT;
};

const envValue = (env, key) => {
    const v = env?.[key];
    return v === undefined || v === null ? '' : String(v).trim();
};

const settingValue = (settings, key) => {
    const v = settings?.[key];
    return v === undefined || v === null ? '' : String(v).trim();
};

const firstNonEmpty = (...values) => {
    for (const v of values) {
        const s = v === undefined || v === null ? '' : String(v).trim();
        if (s) return s;
    }
    return '';
};

const getLinuxDoConfig = (settings = {}, env = {}, origin = '') => {
    const enabledRaw = firstNonEmpty(settingValue(settings, 'linuxdo_pay_enabled'), envValue(env, 'LINUXDO_PAY_ENABLED'), 'false').toLowerCase();
    const enabled = ['1', 'true', 'yes', 'on'].includes(enabledRaw);
    const pointsPerCreditRaw = firstNonEmpty(settingValue(settings, 'linuxdo_points_per_credit'), envValue(env, 'LINUXDO_POINTS_PER_CREDIT'));
    const pointsPerCreditNum = parseInt(pointsPerCreditRaw, 10);
    const pointsPerCredit = Number.isFinite(pointsPerCreditNum) && pointsPerCreditNum > 0
        ? pointsPerCreditNum
        : getLinuxDoPointsPerCredit(settings);
    const returnUrl = firstNonEmpty(envValue(env, 'LINUXDO_RETURN_URL'));
    const notifyUrl = firstNonEmpty(envValue(env, 'LINUXDO_NOTIFY_URL'), origin ? `${origin}/api/pay/linuxdo/notify` : '');
    return {
        enabled,
        pid: firstNonEmpty(settingValue(settings, 'linuxdo_pid'), envValue(env, 'LINUXDO_PID')),
        key: firstNonEmpty(settingValue(settings, 'linuxdo_key'), envValue(env, 'LINUXDO_KEY')),
        payType: 'epay',
        pointsPerCredit,
        returnUrl,
        notifyUrl,
        gatewayUrl: firstNonEmpty(envValue(env, 'LINUXDO_GATEWAY_URL'), LINUXDO_GATEWAY_URL)
    };
};

const getLinuxDoOAuthConfig = (settings = {}, env = {}, origin = '') => {
    const enabledRaw = firstNonEmpty(settingValue(settings, 'linuxdo_oauth_enabled'), envValue(env, 'LINUXDO_OAUTH_ENABLED'), 'false').toLowerCase();
    const enabled = ['1', 'true', 'yes', 'on'].includes(enabledRaw);
    const redirectUri = firstNonEmpty(envValue(env, 'LINUXDO_OAUTH_REDIRECT_URI'), origin ? `${origin}/api/auth/linuxdo/callback` : '');
    return {
        enabled,
        clientId: firstNonEmpty(settingValue(settings, 'linuxdo_oauth_client_id'), envValue(env, 'LINUXDO_OAUTH_CLIENT_ID')),
        clientSecret: firstNonEmpty(settingValue(settings, 'linuxdo_oauth_client_secret'), envValue(env, 'LINUXDO_OAUTH_CLIENT_SECRET')),
        redirectUri,
        authorizeUrl: firstNonEmpty(envValue(env, 'LINUXDO_OAUTH_AUTHORIZE_URL'), LINUXDO_OAUTH_AUTHORIZE_URL),
        tokenUrl: firstNonEmpty(envValue(env, 'LINUXDO_OAUTH_TOKEN_URL'), LINUXDO_OAUTH_TOKEN_URL),
        userUrl: firstNonEmpty(envValue(env, 'LINUXDO_OAUTH_USER_URL'), LINUXDO_OAUTH_USER_URL)
    };
};

const normalizeLinuxDoSignType = (signType = 'MD5') => String(signType || 'MD5').toUpperCase();

const linuxDoSignPairs = (data = {}) => Object.entries(data)
    .filter(([k, v]) => k !== 'sign' && k !== 'sign_type' && v !== undefined && v !== null && String(v) !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');

const md5Hex = (input = '') => {
    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

    const src = new TextEncoder().encode(String(input || ''));
    const bitLen = src.length * 8;
    const padLen = ((56 - ((src.length + 1) % 64)) + 64) % 64;
    const totalLen = src.length + 1 + padLen + 8;
    const data = new Uint8Array(totalLen);
    data.set(src);
    data[src.length] = 0x80;
    const bitLenLo = bitLen >>> 0;
    const bitLenHi = Math.floor(bitLen / 0x100000000) >>> 0;
    for (let i = 0; i < 4; i++) data[totalLen - 8 + i] = (bitLenLo >>> (i * 8)) & 0xff;
    for (let i = 0; i < 4; i++) data[totalLen - 4 + i] = (bitLenHi >>> (i * 8)) & 0xff;

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const M = new Uint32Array(16);

    for (let offset = 0; offset < totalLen; offset += 64) {
        for (let j = 0; j < 16; j++) {
            const base = offset + j * 4;
            M[j] = (data[base]) | (data[base + 1] << 8) | (data[base + 2] << 16) | (data[base + 3] << 24);
        }

        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;

        for (let i = 0; i < 64; i++) {
            let F = 0;
            let g = 0;
            if (i < 16) {
                F = (B & C) | ((~B) & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | ((~D) & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | (~D));
                g = (7 * i) % 16;
            }
            const tmpD = D;
            D = C;
            C = B;
            const x = (A + F + K[i] + M[g]) >>> 0;
            B = (B + ((x << S[i]) | (x >>> (32 - S[i])))) >>> 0;
            A = tmpD;
        }

        a0 = (a0 + A) >>> 0;
        b0 = (b0 + B) >>> 0;
        c0 = (c0 + C) >>> 0;
        d0 = (d0 + D) >>> 0;
    }

    const toHexLE = (n) => {
        let out = '';
        for (let i = 0; i < 4; i++) out += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
        return out;
    };
    return `${toHexLE(a0)}${toHexLE(b0)}${toHexLE(c0)}${toHexLE(d0)}`;
};

const signLinuxDo = async (data = {}, secret = '', signType = 'MD5') => {
    const t = normalizeLinuxDoSignType(signType);
    const pairs = linuxDoSignPairs(data);
    if (t !== 'MD5') throw new Error('Only MD5 sign_type is supported in current integration');
    return md5Hex(`${pairs}${String(secret || '')}`);
};

const readCookie = (req, name) => {
    const cookie = req.headers.get('Cookie') || '';
    const escaped = String(name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = cookie.match(new RegExp(`${escaped}=([^;]+)`));
    return m ? decodeURIComponent(m[1] || '') : '';
};

const redirectWithCookie = (url, cookieParts = []) => {
    const res = new Response(null, {
        status: 302,
        headers: { Location: String(url || '/') }
    });
    for (const c of cookieParts) {
        if (c) res.headers.append('Set-Cookie', c);
    }
    return res;
};

const parseModels = (models) => {
    try {
        const parsed = JSON.parse(models || '["*"]');
        return Array.isArray(parsed) ? parsed.map(x => String(x).trim()).filter(Boolean) : ['*'];
    } catch {
        return ['*'];
    }
};

const normalizeModelsInput = (raw) => {
    if (raw === undefined || raw === null || raw === '') return '["*"]';
    let values = [];
    if (Array.isArray(raw)) {
        values = raw;
    } else if (typeof raw === 'string') {
        const s = raw.trim();
        if (!s) return '["*"]';
        try {
            const parsed = JSON.parse(s);
            values = Array.isArray(parsed) ? parsed : [s];
        } catch {
            values = s.split(',');
        }
    } else {
        values = [raw];
    }
    const normalized = [...new Set(values.map(v => String(v || '').trim()).filter(Boolean))];
    if (!normalized.length || normalized.includes('*')) return '["*"]';
    return JSON.stringify(normalized);
};

const modelAllowed = (allowed, modelId, upstreamModelId = '') => {
    if (!Array.isArray(allowed) || !allowed.length || allowed.includes('*')) return true;
    const mid = String(modelId || '').trim();
    const upstream = String(upstreamModelId || '').trim();
    return allowed.some(raw => {
        const a = String(raw || '').trim();
        if (!a) return false;
        if (a === '*') return true;
        if (mid === a || upstream === a) return true;
        // Allow using upstream model ID against local model key like "12:gpt-5-nano".
        if (mid.endsWith(`:${a}`)) return true;
        // Minimal wildcard support: "gpt-*", "12:*", etc.
        if (a.includes('*')) {
            const re = new RegExp(`^${a.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
            return re.test(mid) || re.test(upstream);
        }
        return false;
    });
};

const parseBearerToken = (req) => {
    const auth = req.headers.get('Authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    return m ? String(m[1] || '').trim() : '';
};

const resolveUserLimitUnits = (user, group) => {
    if (Number(user?.group_id) === 1) return -1;
    const override = Number(user?.quota_limit_units);
    if (Number.isFinite(override)) return Math.round(override);
    const groupLimit = Number(group?.token_limit);
    return Number.isFinite(groupLimit) ? Math.round(groupLimit) : -1;
};

const getAccessibleModels = async (db, user) => {
    const dbModels = await db.getModels();
    const group = await db.getGroup(user.group_id);
    const allowedByGroup = parseModels(group?.models);
    const apiConfigs = await db.getAPIConfigsForUser(user, { includeDisabled: false });
    const allowedApiIds = new Set(apiConfigs.map(c => c.id));

    let models = dbModels
        .filter(m => allowedApiIds.has(m.api_config_id))
        .map(m => ({
            id: m.model_id,
            upstream_model_id: m.upstream_model_id || m.model_id,
            name: m.display_name || m.upstream_model_id || m.model_id,
            icon: m.icon || '🤖',
            multiplier: m.multiplier || 1.0,
            api_config_id: m.api_config_id,
            enabled: m.enabled,
            pricing_mode: m.pricing_mode || 'usage',
            price_per_1k_tokens: Number(m.price_per_1k_tokens) || 0,
            price_per_request: Number(m.price_per_request) || 0
        }));

    if (!allowedByGroup.includes('*')) {
        models = models.filter(m => modelAllowed(allowedByGroup, m.id, m.upstream_model_id));
    }
    return models;
};

const normalizeGroupModelsInput = (raw) => {
    if (raw === undefined || raw === null || raw === '') return '["*"]';

    let values = [];
    if (Array.isArray(raw)) {
        values = raw;
    } else if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return '["*"]';
        try {
            const parsed = JSON.parse(trimmed);
            values = Array.isArray(parsed) ? parsed : [trimmed];
        } catch {
            values = trimmed.split(',');
        }
    } else {
        values = [raw];
    }

    const normalized = [...new Set(values.map(v => String(v).trim()).filter(Boolean))];
    if (!normalized.length || normalized.includes('*')) return '["*"]';
    return JSON.stringify(normalized);
};

const normalizeGroupInput = (data, settings, { partial = false } = {}) => {
    const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
    const out = { ...data };

    if (!partial || out.name !== undefined) {
        if (!out.name || !String(out.name).trim()) throw new Error('Group name required');
        out.name = String(out.name).trim();
    }
    if (!partial || out.display_name !== undefined) {
        out.display_name = String(out.display_name || out.name || '').trim();
    }
    if (!partial || out.models !== undefined) {
        out.models = normalizeGroupModelsInput(out.models);
    }

    if (out.token_limit_usd !== undefined && out.token_limit_usd !== null && out.token_limit_usd !== '') {
        const usd = Number(out.token_limit_usd);
        if (!Number.isFinite(usd)) throw new Error('Invalid USD budget');
        out.token_limit = usd < 0 ? -1 : Math.max(0, Math.round(usd * tokenUnitsPerUSD));
    }
    if (out.token_limit !== undefined && out.token_limit !== null && out.token_limit !== '') {
        const limit = Number(out.token_limit);
        if (!Number.isFinite(limit)) throw new Error('Invalid token limit');
        out.token_limit = Math.round(limit);
    }

    if (out.rate_period !== undefined) out.rate_period = Math.max(1, Math.round(Number(out.rate_period) || 86400));
    if (out.can_purchase !== undefined) out.can_purchase = Number(out.can_purchase) ? 1 : 0;
    if (out.enabled !== undefined) out.enabled = Number(out.enabled) ? 1 : 0;
    if (out.sort_order !== undefined) out.sort_order = Math.round(Number(out.sort_order) || 0);
    if (out.cost_multiplier !== undefined) {
        const cm = Number(out.cost_multiplier);
        if (!Number.isFinite(cm) || cm <= 0) throw new Error('Invalid group multiplier');
        out.cost_multiplier = Number(cm.toFixed(4));
    }

    delete out.price;
    delete out.token_limit_usd;
    if (partial && out.display_name === '') delete out.display_name;
    return out;
};

const parseApiKeys = (cfg) => {
    let keys = [];
    try {
        const parsed = JSON.parse(cfg?.api_keys || '[]');
        if (Array.isArray(parsed)) keys = parsed;
    } catch {}
    if ((!keys || !keys.length) && cfg?.api_key) keys = [cfg.api_key];
    return [...new Set((keys || []).map(k => String(k || '').trim()).filter(Boolean))];
};

const normalizeApiFormat = (f) => {
    const x = String(f || 'openai').toLowerCase().trim();
    return ['openai', 'claude', 'gemini'].includes(x) ? x : 'openai';
};

const normalizeApiInput = (data, { partial = false } = {}) => {
    const out = { ...data };
    if (!partial || out.name !== undefined) {
        if (!out.name || !String(out.name).trim()) throw new Error('API name required');
        out.name = String(out.name).trim();
    }
    if (!partial || out.base_url !== undefined) {
        if (!out.base_url || !String(out.base_url).trim()) throw new Error('Base URL required');
        out.base_url = String(out.base_url).trim().replace(/\/+$/, '');
    }
    if (out.enabled !== undefined) out.enabled = Number(out.enabled) ? 1 : 0;
    if (out.priority !== undefined) out.priority = Math.round(Number(out.priority) || 0);
    if (!partial || out.api_format !== undefined) out.api_format = normalizeApiFormat(out.api_format);
    if (!partial || out.api_keys !== undefined || out.api_key !== undefined) {
        let keys = [];
        if (Array.isArray(out.api_keys)) keys = out.api_keys;
        else if (typeof out.api_keys === 'string') keys = out.api_keys.split(/\r?\n|,/g);
        else if (out.api_key) keys = [out.api_key];
        keys = [...new Set(keys.map(k => String(k || '').trim()).filter(Boolean))];
        if (!partial && !keys.length) throw new Error('At least one API key required');
        if (keys.length) {
            out.api_keys = keys;
            out.api_key = keys[0];
        } else {
            delete out.api_keys;
            delete out.api_key;
        }
    }
    delete out.id;
    return out;
};

const canManageAPI = (user, cfg) => {
    if (!user || !cfg) return false;
    return user.group_id === 1 || (cfg.owner_user_id && Number(cfg.owner_user_id) === Number(user.id));
};

const sseFromText = (text) => {
    const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
    return new Response(payload, { headers: H.SSE });
};

const toClaudeMessages = (reqMsgs) => {
    const out = [];
    for (const m of reqMsgs) {
        if (m.role === 'system') continue;
        if (m.role !== 'user' && m.role !== 'assistant') continue;
        out.push({ role: m.role, content: String(m.content || '') });
    }
    return out.length ? out : [{ role: 'user', content: 'Hello' }];
};

const toGeminiContents = (reqMsgs) => {
    const out = [];
    for (const m of reqMsgs) {
        if (m.role === 'system') continue;
        if (m.role !== 'user' && m.role !== 'assistant') continue;
        out.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content || '') }] });
    }
    return out.length ? out : [{ role: 'user', parts: [{ text: 'Hello' }] }];
};

const extractSystemPrompt = (reqMsgs) => {
    const sys = reqMsgs.find(m => m.role === 'system');
    return sys?.content ? String(sys.content) : '';
};

const extractTextFromClaude = (json) => {
    try {
        return (json?.content || []).map(x => x?.text || '').join('').trim();
    } catch {
        return '';
    }
};

const extractTextFromGemini = (json) => {
    try {
        return (json?.candidates?.[0]?.content?.parts || []).map(x => x?.text || '').join('').trim();
    } catch {
        return '';
    }
};

const resolveV1Auth = async (req, db) => {
    const token = parseBearerToken(req);
    if (!token) return null;
    const keyHash = await hash(token);
    const key = await db.getUserAPIKeyByHash(keyHash);
    if (!key || !key.enabled) return null;
    const user = await db.getUserById(key.user_id);
    if (!user) return null;
    return { user, key };
};

export const api = {
    async register(req, db, ip) {
        const { email, password, turnstile } = await req.json();
        if (!email || !password) return errRes('Email and password required');
        if (password.length < 6) return errRes('Password must be at least 6 characters');

        const settings = await db.getSettings();
        const allowRegister = String(settings.allow_register || 'true').toLowerCase() !== 'false';
        if (!allowRegister) return errRes('Registration is disabled', 403);
        if (settings.turnstile_enabled === 'true' && !await verifyTurnstile(turnstile, settings.turnstile_secret_key, ip)) {
            return errRes('Verification failed');
        }

        const maxIP = parseInt(settings.max_accounts_per_ip) || 3;
        if (await db.getIPCount(ip) >= maxIP) return errRes('Too many accounts from this IP');
        if (await db.getUserByEmail(email)) return errRes('Email already registered');

        const user = await db.createUser(email, password, ip);
        const token = await db.createSession(user.id);

        const res = jsonRes({ success: true, isRoot: user.group_id === 1 });
        res.headers.set('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${DEFAULT_CONFIG.SESSION_DURATION / 1000}`);
        return res;
    },

    async login(req, db) {
        const { email, password, turnstile } = await req.json();
        if (!email || !password) return errRes('Email and password required');

        const settings = await db.getSettings();
        if (settings.turnstile_enabled === 'true' && !await verifyTurnstile(turnstile, settings.turnstile_secret_key, '')) {
            return errRes('Verification failed');
        }

        const user = await db.getUserByEmail(email);
        if (!user || user.password !== await hash(password)) return errRes('Invalid credentials');

        const token = await db.createSession(user.id);
        const res = jsonRes({ success: true, group: user.group_id });
        res.headers.set('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${DEFAULT_CONFIG.SESSION_DURATION / 1000}`);
        return res;
    },

    async linuxDoOAuthStart(req, db, env) {
        const settings = await db.getSettings();
        const origin = new URL(req.url).origin;
        const cfg = getLinuxDoOAuthConfig(settings, env, origin);
        if (!cfg.enabled) return errRes('LinuxDo OAuth is not enabled');
        if (!cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) return errRes('LinuxDo OAuth is not configured');

        const state = crypto.randomUUID().replace(/-/g, '');
        const authUrl = new URL(cfg.authorizeUrl);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', cfg.clientId);
        authUrl.searchParams.set('redirect_uri', cfg.redirectUri);
        authUrl.searchParams.set('state', state);

        return redirectWithCookie(authUrl.toString(), [
            `linuxdo_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
        ]);
    },

    async linuxDoOAuthCallback(req, db, env, ip) {
        const origin = new URL(req.url).origin;
        const fail = (reason) => {
            const target = new URL('/login', origin);
            if (reason) target.searchParams.set('oauth_error', String(reason).slice(0, 120));
            return redirectWithCookie(target.toString(), [
                'linuxdo_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
            ]);
        };

        const settings = await db.getSettings();
        const cfg = getLinuxDoOAuthConfig(settings, env, origin);
        if (!cfg.enabled || !cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) return fail('LinuxDo OAuth not configured');

        const url = new URL(req.url);
        const code = String(url.searchParams.get('code') || '').trim();
        const state = String(url.searchParams.get('state') || '').trim();
        const stateCookie = String(readCookie(req, 'linuxdo_oauth_state') || '').trim();
        if (!code || !state || !stateCookie || state !== stateCookie) return fail('Invalid OAuth state');

        let accessToken = '';
        let tokenError = '';
        const tryFetchToken = async (useBasicAuth = false) => {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            };
            const bodyObj = {
                grant_type: 'authorization_code',
                code,
                redirect_uri: cfg.redirectUri
            };
            if (!useBasicAuth) {
                bodyObj.client_id = cfg.clientId;
                bodyObj.client_secret = cfg.clientSecret;
            } else {
                headers.Authorization = `Basic ${btoa(`${cfg.clientId}:${cfg.clientSecret}`)}`;
                bodyObj.client_id = cfg.clientId;
            }
            const tokenResp = await fetch(cfg.tokenUrl, {
                method: 'POST',
                headers,
                body: new URLSearchParams(bodyObj)
            });
            const ct = String(tokenResp.headers.get('content-type') || '').toLowerCase();
            const text = await tokenResp.text();
            let json = {};
            try { json = JSON.parse(text); } catch {}
            const sp = new URLSearchParams(text);
            const token = String(
                json?.access_token ??
                json?.accessToken ??
                json?.token ??
                json?.data?.access_token ??
                sp.get('access_token') ??
                sp.get('token') ??
                ''
            ).trim();
            const errMsg = String(
                json?.error_description ??
                json?.error ??
                json?.msg ??
                sp.get('error_description') ??
                sp.get('error') ??
                (!tokenResp.ok ? `HTTP ${tokenResp.status}` : '')
            ).trim();
            return { ok: tokenResp.ok, token, errMsg, contentType: ct, raw: text };
        };

        try {
            const t1 = await tryFetchToken(false);
            accessToken = t1.token;
            tokenError = t1.errMsg || '';
            if (!accessToken) {
                const t2 = await tryFetchToken(true);
                accessToken = t2.token;
                tokenError = t2.errMsg || tokenError;
                if (!t2.ok || !accessToken) return fail(tokenError || 'OAuth token failed');
            }
        } catch (e) {
            return fail(e?.message || 'OAuth token request failed');
        }

        let profile = null;
        try {
            const profileResp = await fetch(cfg.userUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
            });
            const profileRaw = await profileResp.json().catch(() => null);
            profile = profileRaw?.user || profileRaw?.data || profileRaw;
            if (!profileResp.ok || !profile || profile.id === undefined || profile.id === null) return fail('OAuth user profile failed');
        } catch (e) {
            return fail(e?.message || 'OAuth user request failed');
        }

        const provider = 'linuxdo';
        const providerUserId = String(profile.id).trim();
        if (!providerUserId) return fail('Invalid OAuth user id');
        const rawUsername = String(profile.username || profile.name || '').trim().toLowerCase();
        const safeUsername = rawUsername
            .replace(/[^a-z0-9._-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 40);
        const preferredIdentity = safeUsername || `uid_${providerUserId}`;
        const preferredEmail = `linuxdo_${preferredIdentity}@linuxdo.oauth`;

        let user = null;
        const oauthAccount = await db.getOAuthAccount(provider, providerUserId);
        if (oauthAccount?.user_id) user = await db.getUserById(oauthAccount.user_id);

        if (!user) {
            let email = preferredEmail;
            user = await db.getUserByEmail(email);
            if (!user) {
                user = await db.createUser(email, `${crypto.randomUUID()}${crypto.randomUUID()}`, ip || '');
            }
            await db.upsertOAuthAccount(provider, providerUserId, user.id);
        } else {
            const currentEmail = String(user.email || '').trim().toLowerCase();
            if (safeUsername && currentEmail.endsWith('@privaterelay.linux.do') && currentEmail !== preferredEmail) {
                const occupied = await db.getUserByEmail(preferredEmail);
                if (!occupied || Number(occupied.id) === Number(user.id)) {
                    await db.updateUser(user.id, { email: preferredEmail });
                    user.email = preferredEmail;
                }
            }
        }

        const token = await db.createSession(user.id);
        const target = new URL('/', origin).toString();
        const secureAttr = origin.startsWith('https://') ? '; Secure' : '';
        return redirectWithCookie(target, [
            `session=${token}; Path=/; HttpOnly; SameSite=Lax${secureAttr}; Max-Age=${DEFAULT_CONFIG.SESSION_DURATION / 1000}`,
            `linuxdo_oauth_state=; Path=/; HttpOnly; SameSite=Lax${secureAttr}; Max-Age=0`
        ]);
    },

    async logout(req, db) {
        const cookie = req.headers.get('Cookie') || '';
        const m = cookie.match(/session=([^;]+)/);
        if (m) await db.deleteSession(m[1]);
        const res = jsonRes({ success: true });
        res.headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
        return res;
    },

    async me(req, db, user) {
        if (!user) return jsonRes({ user: null });
        const group = await db.getGroup(user.group_id);
        const limitUnits = resolveUserLimitUnits(user, group);
        const settings = await db.getSettings();
        const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
        const pointsPerUSD = getPointsPerUSD(settings);
        return jsonRes({
            user: {
                id: user.id,
                email: user.email,
                group_id: user.group_id,
                group_name: group?.display_name,
                tokens_used: user.tokens_used,
                tokens_used_usd: toUSD(user.tokens_used, tokenUnitsPerUSD),
                tokens_used_points: toPoints(user.tokens_used, tokenUnitsPerUSD, pointsPerUSD),
                token_limit: limitUnits,
                token_limit_usd: toUSD(limitUnits, tokenUnitsPerUSD),
                token_limit_points: toPoints(limitUnits, tokenUnitsPerUSD, pointsPerUSD),
                default_model: user.default_model
            },
            token_units_per_usd: tokenUnitsPerUSD,
            points_per_usd: pointsPerUSD
        });
    },

    async updatePassword(req, db, user) {
        requireAuth(user);
        const { current, newPass } = await req.json();
        if (!current || !newPass) return errRes('Both passwords required');
        if (newPass.length < 6) return errRes('Password min 6 chars');
        if (user.password !== await hash(current)) return errRes('Wrong password');
        await db.updateUser(user.id, { password: await hash(newPass) });
        return jsonRes({ success: true });
    },

    async updateProfile(req, db, user) {
        requireAuth(user);
        const { default_model } = await req.json();
        await db.updateUser(user.id, { default_model: default_model || null });
        return jsonRes({ success: true });
    },

    async models(req, db, user) {
        if (!user) return errRes('Unauthorized', 401);
        const models = await getAccessibleModels(db, user);
        return jsonRes({ data: models });
    },

    async chat(req, db, user, ctx, extra = {}) {
        if (!user) return errRes('Unauthorized', 401);

        const group = await db.getGroup(user.group_id);
        if (!group || !group.enabled) return errRes('Access disabled', 403);
        const limitUnits = resolveUserLimitUnits(user, group);

        if (limitUnits >= 0 && user.tokens_used >= limitUnits) {
            return errRes('Insufficient quota points. Please request more quota.', 429);
        }

        const { messages, model } = await req.json();
        if (!messages?.length || !model) return errRes('Messages and model required');

        const groupAllowed = parseModels(group?.models);
        if (!modelAllowed(groupAllowed, model)) {
            return errRes('Model not allowed', 403);
        }

        const dbModel = await db.getModel(model);
        if (!dbModel) return errRes('Model not found', 404);
        if (Array.isArray(extra.allowed_models) && !modelAllowed(extra.allowed_models, model, dbModel.upstream_model_id || model)) {
            return errRes('Model not allowed by API key', 403);
        }

        const cfg = await db.getAPIConfigForUser(dbModel.api_config_id, user);
        if (!cfg || !cfg.enabled) return errRes('API not available', 500);

        const settings = await db.getSettings();
        const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
        const reqMsgs = Array.isArray(messages) ? messages : [];
        const promptLength = JSON.stringify(reqMsgs).length;
        const format = normalizeApiFormat(cfg.api_format);
        const keys = parseApiKeys(cfg);
        if (!keys.length) return errRes('No API key configured', 500);

        const commitUsage = async (tokens, contentLength = 0) => {
            const effectiveTokens = Number(tokens) > 0 ? Number(tokens) : Math.ceil((promptLength + contentLength) / 4);
            const groupMultiplier = 1.0;
            const pricingMode = (dbModel.pricing_mode || 'usage').toLowerCase();
            const pricePerRequest = Number(dbModel.price_per_request) || 0;
            const pricePer1k = Number(dbModel.price_per_1k_tokens) || 0;

            let addUnits = 0;
            if (pricingMode === 'request' && pricePerRequest > 0) {
                addUnits = Math.ceil(pricePerRequest * groupMultiplier * tokenUnitsPerUSD);
            } else if (pricePer1k > 0) {
                const baseUSD = (effectiveTokens / 1000) * pricePer1k;
                addUnits = Math.ceil(baseUSD * groupMultiplier * tokenUnitsPerUSD);
            } else {
                // Legacy fallback: token-based accounting
                addUnits = Math.ceil(effectiveTokens);
            }
            if (addUnits <= 0) return;

            let updatePromise;
            if (user.id) updatePromise = db.updateUser(user.id, { tokens_used: user.tokens_used + addUnits });

            if (updatePromise) {
                if (ctx && ctx.waitUntil) ctx.waitUntil(updatePromise);
                else await updatePromise;
            }
            if (typeof extra.onUsageUnits === 'function') {
                await extra.onUsageUnits(addUnits);
            }
        };

        const openAIRequestBody = {
            model: dbModel.upstream_model_id || model,
            messages: reqMsgs,
            stream: true,
            temperature: 0.7
        };
        if (cfg.base_url?.includes('openai.com') || settings.enable_stream_usage === 'true') {
            openAIRequestBody.stream_options = { include_usage: true };
        }

        if (format === 'openai') {
            let lastErr = null;
            for (const key of keys) {
                try {
                    const response = await fetch(`${cfg.base_url}/chat/completions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                        body: JSON.stringify(openAIRequestBody)
                    });
                    const contentType = response.headers.get('content-type') || '';
                    if (!response.ok) {
                        const errText = await response.text();
                        lastErr = `API Error ${response.status}: ${errText}`;
                        if ([401, 403, 429].includes(response.status)) continue;
                        return errRes(lastErr, response.status);
                    }
                    if (!contentType.includes('application/json') && !contentType.includes('text/event-stream')) {
                        const text = await response.text();
                        return errRes(`Upstream API Error: ${text.slice(0, 200)}`, 502);
                    }

                    const { readable, writable } = new TransformStream();
                    const streamPromise = (async () => {
                        const reader = response.body.getReader();
                        const writer = writable.getWriter();
                        const decoder = new TextDecoder();
                        let buffer = '';
                        let usage = null;
                        let contentLength = 0;

                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                await writer.write(value);
                                try {
                                    buffer += decoder.decode(value, { stream: true });
                                    const lines = buffer.split('\n');
                                    buffer = lines.pop() || '';
                                    for (const line of lines) {
                                        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
                                        try {
                                            const json = JSON.parse(line.slice(6));
                                            if (json.usage) usage = json.usage;
                                            const content = json.choices?.[0]?.delta?.content;
                                            if (content) contentLength += content.length;
                                        } catch {}
                                    }
                                } catch {}
                            }
                        } catch {
                            try { await writer.write(new TextEncoder().encode(`data: {"error":"Stream interrupted"}\n\n`)); } catch {}
                        } finally {
                            try { await writer.close(); } catch {}
                            const tokens = usage?.total_tokens || Math.ceil((promptLength + contentLength) / 4);
                            await commitUsage(tokens, contentLength);
                        }
                    })();
                    if (ctx && ctx.waitUntil) ctx.waitUntil(streamPromise);
                    return new Response(readable, { headers: H.SSE });
                } catch (e) {
                    lastErr = e.message;
                }
            }
            return errRes(`Network Error: ${lastErr || 'All API keys failed'}`, 500);
        }

        const upstreamModel = dbModel.upstream_model_id || model;
        let lastErr = null;
        for (const key of keys) {
            try {
                if (format === 'claude') {
                    const res = await fetch(`${cfg.base_url}/v1/messages`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': key,
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: upstreamModel,
                            max_tokens: 4096,
                            temperature: 0.7,
                            system: extractSystemPrompt(reqMsgs),
                            messages: toClaudeMessages(reqMsgs)
                        })
                    });
                    if (!res.ok) {
                        const t = await res.text();
                        lastErr = `Claude API Error ${res.status}: ${t}`;
                        if ([401, 403, 429].includes(res.status)) continue;
                        return errRes(lastErr, res.status);
                    }
                    const j = await res.json();
                    const text = extractTextFromClaude(j);
                    const contentLength = text.length;
                    await commitUsage(0, contentLength);
                    return sseFromText(text);
                }

                if (format === 'gemini') {
                    const url = `${cfg.base_url}/v1beta/models/${encodeURIComponent(upstreamModel)}:generateContent?key=${encodeURIComponent(key)}`;
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemInstruction: extractSystemPrompt(reqMsgs) ? { parts: [{ text: extractSystemPrompt(reqMsgs) }] } : undefined,
                            generationConfig: { temperature: 0.7 },
                            contents: toGeminiContents(reqMsgs)
                        })
                    });
                    if (!res.ok) {
                        const t = await res.text();
                        lastErr = `Gemini API Error ${res.status}: ${t}`;
                        if ([401, 403, 429].includes(res.status)) continue;
                        return errRes(lastErr, res.status);
                    }
                    const j = await res.json();
                    const text = extractTextFromGemini(j);
                    const contentLength = text.length;
                    await commitUsage(0, contentLength);
                    return sseFromText(text);
                }
            } catch (e) {
                lastErr = e.message;
            }
        }

        return errRes(`Network Error: ${lastErr || 'All API keys failed'}`, 500);
    },

    async getChats(req, db, user) {
        requireAuth(user);
        return jsonRes({ chats: await db.getChats(user.id) });
    },

    async getChat(req, db, user, id) {
        requireAuth(user);
        const chat = await db.getChat(parseInt(id), user.id);
        return chat ? jsonRes(chat) : errRes('Not found', 404);
    },

    async saveChat(req, db, user) {
        requireAuth(user);
        const { id, title, messages, model } = await req.json();
        if (id) {
            await db.updateChat(id, user.id, { title: title || 'New Chat', messages: JSON.stringify(messages || []), model: model || '' });
            return jsonRes({ id });
        } else {
            const newId = await db.createChat(user.id, title || 'New Chat', model || '');
            await db.updateChat(newId, user.id, { messages: JSON.stringify(messages || []) });
            return jsonRes({ id: newId });
        }
    },

    async deleteChat(req, db, user, id) {
        requireAuth(user);
        await db.deleteChat(parseInt(id), user.id);
        return jsonRes({ success: true });
    },

    async quotaRequests(req, db, user, env) {
        requireAuth(user);
        if (user.group_id === 1 && req.method === 'POST') return errRes('Admin does not need quota requests', 400);

        if (req.method === 'GET') {
            const rows = await db.getQuotaRequestsByUser(user.id);
            return jsonRes({
                requests: rows.map(r => ({
                    ...r,
                    image_url: r.image_key ? `/api/quota-requests/${r.id}/image` : null
                }))
            });
        }

        if (req.method === 'POST') {
            const form = await req.formData();
            const message = String(form.get('message') || '').trim();
            const requestedPointsRaw = Number(form.get('requested_points') || 0);
            const requestedPoints = Number.isFinite(requestedPointsRaw) ? Math.max(0, Math.round(requestedPointsRaw)) : 0;
            const image = form.get('image');
            const hasImage = !!(image && typeof image === 'object' && 'arrayBuffer' in image && Number(image.size) > 0);

            if (!message && !hasImage) {
                return errRes('Message or image is required');
            }

            let imageKey = null;
            let imageName = null;
            let imageType = null;
            let imageSize = 0;

            if (hasImage) {
                if (!env?.R2) return errRes('R2 storage is not configured', 500);
                imageType = String(image.type || '').toLowerCase();
                if (!imageType.startsWith('image/')) return errRes('Only image files are allowed');
                imageSize = Number(image.size) || 0;
                if (imageSize > 8 * 1024 * 1024) return errRes('Image too large (max 8MB)');
                imageName = String(image.name || 'upload');
                const ext = (imageName.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                imageKey = `quota/${user.id}/${Date.now()}-${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
                const buf = await image.arrayBuffer();
                await env.R2.put(imageKey, buf, {
                    httpMetadata: { contentType: imageType },
                    customMetadata: {
                        user_id: String(user.id),
                        request_type: 'quota'
                    }
                });
            }

            const created = await db.createQuotaRequest({
                user_id: user.id,
                message_text: message.slice(0, 4000),
                requested_points: requestedPoints,
                image_key: imageKey,
                image_name: imageName,
                image_type: imageType,
                image_size: imageSize
            });
            return jsonRes({ success: true, request: { ...created, image_url: created.image_key ? `/api/quota-requests/${created.id}/image` : null } });
        }
    },

    async quotaRequestImage(req, db, user, id, env) {
        requireAuth(user);
        const row = await db.getQuotaRequest(Number(id));
        if (!row) return errRes('Not found', 404);
        if (user.group_id !== 1 && Number(row.user_id) !== Number(user.id)) return errRes('Forbidden', 403);
        if (!row.image_key) return errRes('No image', 404);
        if (!env?.R2) return errRes('R2 storage is not configured', 500);
        const obj = await env.R2.get(row.image_key);
        if (!obj) return errRes('Image not found', 404);
        const headers = new Headers();
        headers.set('Content-Type', row.image_type || obj.httpMetadata?.contentType || 'application/octet-stream');
        headers.set('Cache-Control', 'private, max-age=60');
        return new Response(obj.body, { headers });
    },

    async adminQuotaRequests(req, db, user, env) {
        requireRoot(user);
        if (req.method === 'GET') {
            const rows = await db.getAllQuotaRequests();
            return jsonRes({
                requests: rows.map(r => ({
                    ...r,
                    image_url: r.image_key ? `/api/admin/quota-requests/${r.id}/image` : null
                }))
            });
        }

        if (req.method === 'PUT') {
            const body = await req.json();
            const id = Number(body?.id);
            const action = String(body?.action || '').toLowerCase();
            const note = String(body?.admin_note || '').trim().slice(0, 1000);
            if (!Number.isFinite(id)) return errRes('Invalid request id');
            if (!['approve', 'reject'].includes(action)) return errRes('Invalid action');

            const row = await db.getQuotaRequest(id);
            if (!row) return errRes('Request not found', 404);
            if (row.status !== 'pending') return errRes('Request already reviewed', 409);
            const clearImageFields = {
                image_key: null,
                image_name: null,
                image_type: null,
                image_size: 0
            };

            if (row.image_key && env?.R2) {
                try {
                    await env.R2.delete(row.image_key);
                } catch (e) {
                    console.warn('Failed to delete quota request image from R2:', e?.message || e);
                }
            }

            if (action === 'reject') {
                await db.reviewQuotaRequest(id, {
                    status: 'rejected',
                    admin_note: note || null,
                    approved_points: 0,
                    reviewed_by: user.id,
                    ...clearImageFields
                });
                return jsonRes({ success: true });
            }

            const approvedPointsRaw = Number(body?.approved_points);
            const approvedPoints = Number.isFinite(approvedPointsRaw)
                ? Math.max(0, Math.round(approvedPointsRaw))
                : Math.max(0, Math.round(Number(row.requested_points) || 0));

            const targetUser = await db.getUserById(row.user_id);
            if (!targetUser) return errRes('User not found', 404);

            const settings = await db.getSettings();
            const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
            const pointsPerUSD = getPointsPerUSD(settings);
            const approvedUnits = approvedPoints <= 0
                ? 0
                : Math.ceil((approvedPoints / Math.max(1, pointsPerUSD)) * tokenUnitsPerUSD);

            const targetGroup = await db.getGroup(targetUser.group_id);
            const currentLimit = resolveUserLimitUnits(targetUser, targetGroup);
            if (currentLimit >= 0 && approvedUnits > 0) {
                await db.updateUser(targetUser.id, { quota_limit_units: currentLimit + approvedUnits });
            } else if (currentLimit < 0) {
                await db.updateUser(targetUser.id, { quota_limit_units: -1 });
            }

            await db.reviewQuotaRequest(id, {
                status: 'approved',
                admin_note: note || null,
                approved_points: approvedPoints,
                reviewed_by: user.id,
                ...clearImageFields
            });
            return jsonRes({ success: true, approved_points: approvedPoints });
        }
    },

    async adminQuotaRequestImage(req, db, user, id, env) {
        requireRoot(user);
        return api.quotaRequestImage(req, db, user, id, env);
    },

    async linuxDoCreatePayment(req, db, user, env) {
        requireAuth(user);
        if (req.method !== 'POST') return errRes('Method not allowed', 405);
        if (Number(user.group_id) === 1) return errRes('Admin does not need recharge', 400);

        const settings = await db.getSettings();
        const origin = new URL(req.url).origin;
        const payCfg = getLinuxDoConfig(settings, env, origin);
        if (!payCfg.enabled) return errRes('Recharge is not enabled');
        if (!payCfg.pid || !payCfg.key) return errRes('Linux Do payment is not configured');

        const body = await req.json().catch(() => ({}));
        const amountRaw = Number(body?.amount);
        if (!Number.isFinite(amountRaw) || amountRaw <= 0) return errRes('Invalid recharge amount');
        const amount = Math.round(amountRaw * 100) / 100;
        if (amount < 0.01) return errRes('Recharge amount too small');
        if (amount > 200000) return errRes('Recharge amount too large');

        const points = Math.max(1, Math.round(amount * payCfg.pointsPerCredit));
        const outTradeNo = `ld${Date.now()}${String(user.id).padStart(4, '0')}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        await db.createRechargeOrder({
            user_id: user.id,
            provider: 'linuxdo',
            out_trade_no: outTradeNo,
            amount,
            points,
            status: 'pending'
        });

        const sign_type = 'MD5';
        const payload = {
            pid: payCfg.pid,
            type: payCfg.payType,
            out_trade_no: outTradeNo,
            notify_url: payCfg.notifyUrl,
            return_url: payCfg.returnUrl || `${origin}/settings?pay=success`,
            name: `${String(settings.site_name || 'AI 站')} 充值 ${points}积分`,
            money: amount.toFixed(2),
            sign_type
        };
        payload.sign = await signLinuxDo(payload, payCfg.key, sign_type);

        return jsonRes({
            success: true,
            action: payCfg.gatewayUrl,
            form: payload,
            order: { out_trade_no: outTradeNo, amount, points, status: 'pending' }
        });
    },

    async linuxDoOrders(req, db, user) {
        requireAuth(user);
        if (req.method !== 'GET') return errRes('Method not allowed', 405);
        return jsonRes({ orders: await db.getRechargeOrdersByUser(user.id, 50) });
    },

    async linuxDoNotify(req, db, env) {
        if (!['GET', 'POST'].includes(req.method)) return new Response('fail', { status: 405 });

        const settings = await db.getSettings();
        const payCfg = getLinuxDoConfig(settings, env, new URL(req.url).origin);
        if (!payCfg.pid || !payCfg.key) return new Response('fail');

        let params = {};
        try {
            if (req.method === 'GET') {
                const sp = new URL(req.url).searchParams;
                params = Object.fromEntries(sp.entries());
            } else {
                const ct = String(req.headers.get('content-type') || '').toLowerCase();
                if (ct.includes('application/json')) params = await req.json().catch(() => ({}));
                else params = Object.fromEntries((await req.formData()).entries());
            }
        } catch {
            params = {};
        }

        const signGiven = String(params.sign || '').trim().toLowerCase();
        const signType = normalizeLinuxDoSignType(params.sign_type || 'MD5');
        if (signType !== 'MD5') return new Response('fail');
        if (String(params.pid || '').trim() !== payCfg.pid) return new Response('fail');

        let signCalc = '';
        try {
            signCalc = await signLinuxDo(params, payCfg.key, signType);
        } catch {
            return new Response('fail');
        }
        if (signCalc.toLowerCase() !== signGiven) return new Response('fail');

        if (String(params.trade_status || '') !== 'TRADE_SUCCESS') return new Response('success');
        const outTradeNo = String(params.out_trade_no || '').trim();
        if (!outTradeNo) return new Response('fail');

        const order = await db.getRechargeOrderByOutTradeNo(outTradeNo);
        if (!order) return new Response('fail');
        if (String(order.status) === 'success') return new Response('success');

        const paidAmount = Number(params.money);
        if (Number.isFinite(paidAmount) && Math.abs(paidAmount - Number(order.amount || 0)) > 0.0001) return new Response('fail');

        const targetUser = await db.getUserById(order.user_id);
        if (!targetUser) return new Response('fail');
        const group = await db.getGroup(targetUser.group_id);

        const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
        const pointsPerUSD = getPointsPerUSD(settings);
        const grantPoints = Math.max(0, Math.round(Number(order.points) || 0));
        const grantUnits = grantPoints > 0 ? Math.ceil((grantPoints / Math.max(1, pointsPerUSD)) * tokenUnitsPerUSD) : 0;
        const currentLimit = resolveUserLimitUnits(targetUser, group);
        if (currentLimit >= 0 && grantUnits > 0) {
            await db.updateUser(targetUser.id, { quota_limit_units: currentLimit + grantUnits });
        }

        const gatewayTradeNo = String(params.trade_no || params.gateway_trade_no || '').trim() || null;
        await db.markRechargeOrderPaid(order.id, {
            gateway_trade_no: gatewayTradeNo,
            raw_payload: JSON.stringify(params)
        });

        return new Response('success', { headers: { 'Content-Type': 'text/plain;charset=UTF-8' } });
    },

    async adminUploadSiteImage(req, db, user, env) {
        requireRoot(user);
        if (req.method !== 'POST') return errRes('Method not allowed', 405);
        if (!env?.R2) return errRes('R2 storage is not configured', 500);

        const form = await req.formData().catch(() => null);
        const file = form?.get('file');
        if (!file || typeof file !== 'object' || !('arrayBuffer' in file)) return errRes('Image file required');
        const type = String(file.type || '').toLowerCase();
        if (!type.startsWith('image/')) return errRes('Only image files are allowed');
        const size = Number(file.size) || 0;
        if (size <= 0) return errRes('Empty image file');
        if (size > 8 * 1024 * 1024) return errRes('Image too large (max 8MB)');

        const origin = new URL(req.url).origin;
        const parseSiteImageKey = (raw) => {
            const s = String(raw || '').trim();
            if (!s) return '';
            try {
                const u = /^https?:\/\//i.test(s) ? new URL(s) : new URL(s, origin);
                const m = String(u.pathname || '').match(/^\/api\/site-images\/(.+)$/);
                return m?.[1] ? decodeURIComponent(m[1]).replace(/^\/+/, '') : '';
            } catch {
                const m = s.match(/^\/api\/site-images\/(.+)$/);
                return m?.[1] ? decodeURIComponent(m[1]).replace(/^\/+/, '') : '';
            }
        };

        const oldIconUrl = await db.getSetting('site_icon_url');
        const oldKey = parseSiteImageKey(oldIconUrl);
        const name = String(file.name || 'upload');
        const ext = (name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const key = `site/${Date.now()}-${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
        const buf = await file.arrayBuffer();
        await env.R2.put(key, buf, { httpMetadata: { contentType: type } });
        const url = `${origin}/api/site-images/${encodeURIComponent(key)}`;
        await db.setSetting('site_icon_url', url);
        if (oldKey && oldKey !== key) {
            try {
                await env.R2.delete(oldKey);
            } catch (e) {
                console.warn('Failed to delete old site icon from R2:', e?.message || e);
            }
        }
        return jsonRes({ success: true, key, url, old_deleted: Boolean(oldKey && oldKey !== key) });
    },

    async siteImage(req, db, key, env) {
        if (req.method !== 'GET') return errRes('Method not allowed', 405);
        if (!env?.R2) return errRes('R2 storage is not configured', 500);
        const safeKey = String(key || '').replace(/^\/+/, '').trim();
        if (!safeKey || safeKey.includes('..')) return errRes('Invalid image key');
        const obj = await env.R2.get(safeKey);
        if (!obj) return errRes('Image not found', 404);
        const headers = new Headers();
        headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
        headers.set('Cache-Control', 'public, max-age=3600');
        return new Response(obj.body, { headers });
    },

    async adminSettings(req, db, user) {
        requireRoot(user);
        if (req.method === 'GET') return jsonRes(await db.getSettings());
        const data = await req.json();
        for (const [k, v] of Object.entries(data)) await db.setSetting(k, String(v));
        return jsonRes({ success: true });
    },

    async adminUsers(req, db, user) {
        requireRoot(user);
        if (req.method === 'GET') {
            const settings = await db.getSettings();
            const defaultGroup = await db.getGroup(2);
            return jsonRes({
                users: await db.getUsers(),
                default_user_limit_units: Number.isFinite(Number(defaultGroup?.token_limit)) ? Number(defaultGroup?.token_limit) : 0,
                token_units_per_usd: getTokenUnitsPerUSD(settings),
                points_per_usd: getPointsPerUSD(settings)
            });
        }
        if (req.method === 'PUT') {
            const body = await req.json();
            const id = Number(body?.id);
            const group_id = body?.group_id;
            const tokens_used = body?.tokens_used;
            const quota_limit_units = body?.quota_limit_units;
            const quota_limit_points = body?.quota_limit_points;
            if (!Number.isFinite(id)) return errRes('Invalid user id');
            if (id === Number(user.id) && group_id !== undefined) return errRes('Cannot modify yourself');
            const targetUser = await db.getUserById(id);
            if (!targetUser) return errRes('User not found', 404);
            const settings = await db.getSettings();
            const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
            const pointsPerUSD = getPointsPerUSD(settings);
            const updates = {};
            if (group_id !== undefined) updates.group_id = [1, 2].includes(Number(group_id)) ? Number(group_id) : 2;
            if (tokens_used !== undefined) updates.tokens_used = tokens_used;
            const nextGroupId = updates.group_id ?? Number(targetUser.group_id);
            if (Number(nextGroupId) === 1) {
                updates.quota_limit_units = -1;
            } else if (quota_limit_units !== undefined) {
                const n = Number(quota_limit_units);
                if (!Number.isFinite(n)) return errRes('Invalid quota limit units');
                updates.quota_limit_units = Math.round(n);
            } else if (quota_limit_points !== undefined) {
                const p = Number(quota_limit_points);
                if (!Number.isFinite(p)) return errRes('Invalid quota limit points');
                if (p < 0) updates.quota_limit_units = -1;
                else updates.quota_limit_units = Math.round((p / Math.max(1, pointsPerUSD)) * tokenUnitsPerUSD);
            }
            await db.updateUser(id, updates);
            return jsonRes({ success: true });
        }
        if (req.method === 'DELETE') {
            const { id } = await req.json();
            if (id === user.id) return errRes('Cannot delete yourself');
            await db.deleteUser(id);
            return jsonRes({ success: true });
        }
    },

    async adminGroups(req, db, user) {
        requireRoot(user);
        const settings = await db.getSettings();
        const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
        const pointsPerUSD = getPointsPerUSD(settings);
        if (req.method === 'GET') {
            const groups = (await db.getGroups()).map(g => ({
                ...g,
                models_list: parseModels(g.models),
                token_limit_usd: toUSD(g.token_limit, tokenUnitsPerUSD),
                token_limit_points: toPoints(g.token_limit, tokenUnitsPerUSD, pointsPerUSD)
            }));
            return jsonRes({
                groups,
                token_units_per_usd: tokenUnitsPerUSD,
                points_per_usd: pointsPerUSD
            });
        }
        if (req.method === 'POST') {
            try {
                const payload = normalizeGroupInput(await req.json(), settings, { partial: false });
                await db.createGroup(payload);
                return jsonRes({ success: true });
            } catch (e) {
                return errRes(e.message || 'Invalid group payload');
            }
        }
        if (req.method === 'PUT') {
            const d = await req.json();
            const id = Number(d.id);
            if (!Number.isFinite(id)) return errRes('Invalid group id');
            try {
                const payload = normalizeGroupInput(d, settings, { partial: true });
                await db.updateGroup(id, payload);
                return jsonRes({ success: true });
            } catch (e) {
                return errRes(e.message || 'Invalid group payload');
            }
        }
        if (req.method === 'DELETE') { await db.deleteGroup((await req.json()).id); return jsonRes({ success: true }); }
    },

    async apis(req, db, user) {
        requireAuth(user);

        if (req.method === 'GET') {
            const keys = await db.getUserAPIKeys(user.id);
            const models = await getAccessibleModels(db, user);
            const settings = await db.getSettings();
            const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
            const pointsPerUSD = getPointsPerUSD(settings);
            const toBudgetUSD = (points) => {
                const p = Number(points);
                if (!Number.isFinite(p)) return null;
                if (p < 0) return -1;
                return Number((p / Math.max(1, pointsPerUSD)).toFixed(4));
            };
            return jsonRes({
                endpoint: '/v1',
                token_units_per_usd: tokenUnitsPerUSD,
                points_per_usd: pointsPerUSD,
                keys: keys.map(k => ({
                    ...k,
                    allowed_models_list: parseModels(k.allowed_models),
                    budget_usd: toBudgetUSD(k.budget_points),
                    used_usd: toBudgetUSD(k.used_points)
                })),
                models: models.map(m => ({ id: m.id, name: m.name, icon: m.icon }))
            });
        }

        if (req.method === 'POST') {
            try {
                const body = await req.json();
                const name = String(body?.name || '').trim();
                if (!name) return errRes('Name required');
                const rawKey = `ak-${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
                const keyHash = await hash(rawKey);
                const keyPrefix = rawKey.slice(0, 12);
                const settings = await db.getSettings();
                const pointsPerUSD = getPointsPerUSD(settings);
                let budgetPoints = -1;
                if (body?.budget_points !== undefined) {
                    const p = Number(body.budget_points);
                    budgetPoints = Number.isFinite(p) ? (p < 0 ? -1 : Math.round(p)) : -1;
                } else {
                    const budgetUSD = Number(body?.budget_usd);
                    if (Number.isFinite(budgetUSD)) budgetPoints = budgetUSD < 0 ? -1 : Math.round(budgetUSD * pointsPerUSD);
                }
                const created = await db.createUserAPIKey({
                    user_id: user.id,
                    name,
                    key_hash: keyHash,
                    key_prefix: keyPrefix,
                    allowed_models: normalizeModelsInput(body?.allowed_models),
                    budget_points: budgetPoints,
                    used_points: 0,
                    enabled: body?.enabled === undefined ? 1 : (Number(body.enabled) ? 1 : 0)
                });
                return jsonRes({ success: true, created, api_key: rawKey });
            } catch (e) {
                return errRes(e.message || 'Failed to create API key');
            }
        }

        if (req.method === 'PUT') {
            const data = await req.json();
            const id = Number(data.id);
            if (!Number.isFinite(id)) return errRes('Invalid key id');
            const key = await db.getUserAPIKey(id, user.id);
            if (!key) return errRes('Not found', 404);
            try {
                const settings = await db.getSettings();
                const pointsPerUSD = getPointsPerUSD(settings);
                const payload = {};
                if (data.name !== undefined) payload.name = String(data.name || '').trim();
                if (payload.name !== undefined && !payload.name) return errRes('Name required');
                if (data.allowed_models !== undefined) payload.allowed_models = normalizeModelsInput(data.allowed_models);
                if (data.budget_points !== undefined) {
                    const p = Number(data.budget_points);
                    if (!Number.isFinite(p)) return errRes('Invalid budget points');
                    payload.budget_points = p < 0 ? -1 : Math.round(p);
                } else if (data.budget_usd !== undefined) {
                    const usd = Number(data.budget_usd);
                    if (!Number.isFinite(usd)) return errRes('Invalid budget usd');
                    payload.budget_points = usd < 0 ? -1 : Math.round(usd * pointsPerUSD);
                }
                if (data.enabled !== undefined) payload.enabled = Number(data.enabled) ? 1 : 0;
                await db.updateUserAPIKey(id, user.id, payload);
                return jsonRes({ success: true });
            } catch (e) {
                return errRes(e.message || 'Failed to update API key');
            }
        }

        if (req.method === 'DELETE') {
            const { id } = await req.json();
            const key = await db.getUserAPIKey(Number(id), user.id);
            if (!key) return errRes('Not found', 404);
            await db.deleteUserAPIKey(Number(id), user.id);
            return jsonRes({ success: true });
        }
    },

    async adminAPIs(req, db, user) {
        requireRoot(user);
        if (req.method === 'GET') {
            const configs = await db.getAPIConfigs();
            const models = await db.getAllModels();
            return jsonRes({ configs, models });
        }
        if (req.method === 'POST') {
            try {
                const payload = normalizeApiInput(await req.json(), { partial: false });
                const created = await db.createAPIConfig(payload);
                return jsonRes({ success: true, id: created?.id || null });
            } catch (e) {
                return errRes(e.message || 'Invalid API payload');
            }
        }
        if (req.method === 'PUT') {
            const d = await req.json();
            const id = Number(d.id);
            if (!Number.isFinite(id)) return errRes('Invalid API id');
            try {
                const payload = normalizeApiInput(d, { partial: true });
                await db.updateAPIConfig(id, payload);
                return jsonRes({ success: true });
            } catch (e) {
                return errRes(e.message || 'Invalid API payload');
            }
        }
        if (req.method === 'DELETE') {
            const { id } = await req.json();
            await db.deleteModelsByAPI(id);
            await db.deleteAPIConfig(id);
            return jsonRes({ success: true });
        }
    },

    async syncModels(req, db, user) {
        requireRoot(user);
        const { api_id } = await req.json();
        const cfg = await db.getAPIConfig(Number(api_id));
        if (!cfg) return errRes('API not found', 404);
        if (!canManageAPI(user, cfg)) return errRes('Forbidden', 403);

        const format = normalizeApiFormat(cfg.api_format);
        const keys = parseApiKeys(cfg);
        if (!keys.length) return errRes('No API key configured');

        let modelsRaw = null;
        let lastErr = null;
        try {
            for (const key of keys) {
                try {
                    if (format === 'openai') {
                        const r = await fetch(`${cfg.base_url}/models`, {
                            headers: { Authorization: `Bearer ${key}` },
                            signal: AbortSignal.timeout(10000)
                        });
                        if (!r.ok) {
                            lastErr = `Failed to fetch models: ${r.status}`;
                            if ([401, 403, 429].includes(r.status)) continue;
                            return errRes(lastErr, r.status);
                        }
                        modelsRaw = await r.json();
                        break;
                    }
                    if (format === 'claude') {
                        const r = await fetch(`${cfg.base_url}/v1/models`, {
                            headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
                            signal: AbortSignal.timeout(10000)
                        });
                        if (!r.ok) {
                            lastErr = `Failed to fetch models: ${r.status}`;
                            if ([401, 403, 429].includes(r.status)) continue;
                            return errRes(lastErr, r.status);
                        }
                        modelsRaw = await r.json();
                        break;
                    }
                    if (format === 'gemini') {
                        const r = await fetch(`${cfg.base_url}/v1beta/models?key=${encodeURIComponent(key)}`, {
                            signal: AbortSignal.timeout(10000)
                        });
                        if (!r.ok) {
                            lastErr = `Failed to fetch models: ${r.status}`;
                            if ([401, 403, 429].includes(r.status)) continue;
                            return errRes(lastErr, r.status);
                        }
                        modelsRaw = await r.json();
                        break;
                    }
                } catch (e) {
                    lastErr = e.message;
                }
            }
            if (!modelsRaw) return errRes(`Sync failed: ${lastErr || 'No available API key'}`, 500);

            const list = Array.isArray(modelsRaw?.data)
                ? modelsRaw.data.map(x => x?.id || x?.name).filter(Boolean)
                : Array.isArray(modelsRaw?.models)
                    ? modelsRaw.models.map(x => x?.name || x?.id).filter(Boolean)
                    : [];

            const all = await db.getAllModels();
            let count = 0;
            for (const upstreamId of list) {
                const modelKey = `${api_id}:${upstreamId}`;
                const existing = all.find(x => x.model_id === modelKey);
                await db.upsertModel({
                    model_id: modelKey,
                    upstream_model_id: upstreamId,
                    display_name: existing?.display_name || upstreamId,
                    icon: existing?.icon || '🤖',
                    multiplier: existing?.multiplier || 1.0,
                    allowed_groups: existing?.allowed_groups || '["*"]',
                    api_config_id: Number(api_id),
                    enabled: existing?.enabled ?? 1,
                    pricing_mode: existing?.pricing_mode || 'usage',
                    price_per_1k_tokens: Number(existing?.price_per_1k_tokens) || 0,
                    price_per_request: Number(existing?.price_per_request) || 0
                });
                count++;
            }
            return jsonRes({ success: true, count });
        } catch (e) {
            return errRes('Sync failed: ' + e.message, 500);
        }
    },

    async checkModels(req, db, user) {
        requireRoot(user);
        const { model_ids } = await req.json();
        if (!Array.isArray(model_ids) || model_ids.length === 0) return errRes('No models selected');

        const models = await db.getAllModels();
        const configs = await db.getAPIConfigsForUser(user, { includeDisabled: true });
        const results = [];

        const checkOne = async (mid) => {
            const m = models.find(x => x.model_id === mid);
            if (!m) return { id: mid, status: 'error', error: 'Not found' };
            const cfg = configs.find(c => c.id === m.api_config_id);
            if (!cfg) return { id: mid, status: 'error', error: 'No Config' };

            const format = normalizeApiFormat(cfg.api_format);
            const keys = parseApiKeys(cfg);
            if (!keys.length) return { id: mid, status: 'error', error: 'No API key' };

            try {
                const upstreamModel = m.upstream_model_id || m.model_id;
                let ok = false;
                let err = null;
                for (const key of keys) {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    try {
                        let res;
                        if (format === 'openai') {
                            res = await fetch(`${cfg.base_url}/chat/completions`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                                body: JSON.stringify({ model: upstreamModel, messages: [{ role: 'user', content: 'Hi' }], stream: true, temperature: 0.7 }),
                                signal: controller.signal
                            });
                        } else if (format === 'claude') {
                            res = await fetch(`${cfg.base_url}/v1/messages`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
                                body: JSON.stringify({ model: upstreamModel, max_tokens: 1, messages: [{ role: 'user', content: 'Hi' }] }),
                                signal: controller.signal
                            });
                        } else {
                            res = await fetch(`${cfg.base_url}/v1beta/models/${encodeURIComponent(upstreamModel)}:generateContent?key=${encodeURIComponent(key)}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Hi' }] }] }),
                                signal: controller.signal
                            });
                        }
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            ok = true;
                            break;
                        }
                        err = `HTTP ${res.status}`;
                        if (![401, 403, 429].includes(res.status)) break;
                    } catch (e) {
                        err = e.message;
                    } finally {
                        clearTimeout(timeoutId);
                    }
                }
                await db.upsertModel({ ...m, enabled: ok ? 1 : 0 });
                return ok ? { id: mid, status: 'success' } : { id: mid, status: 'failed', error: err || 'Unknown error' };
            } catch (e) {
                await db.upsertModel({ ...m, enabled: 0 });
                return { id: mid, status: 'failed', error: e.message };
            }
        };

        const BATCH_SIZE = 5;
        for (let i = 0; i < model_ids.length; i += BATCH_SIZE) {
            const chunk = model_ids.slice(i, i + BATCH_SIZE);
            const chunkResults = await Promise.all(chunk.map(id => checkOne(id)));
            results.push(...chunkResults);
        }

        return jsonRes({ results });
    },

    async adminModels(req, db, user) {
        requireRoot(user);
        if (req.method === 'GET') {
            return jsonRes({ models: await db.getAllModels(), configs: await db.getAPIConfigs() });
        }
        if (req.method === 'PUT') {
            const payload = await req.json();
            if (!payload?.model_id) return errRes('model_id required');
            const existing = await db.getModel(payload.model_id);
            const merged = existing ? { ...existing, ...payload } : payload;
            const unifiedPriceRaw = payload?.price_usd ?? payload?.price;
            if (unifiedPriceRaw !== undefined) {
                const unifiedPrice = Math.max(0, Number(unifiedPriceRaw) || 0);
                merged.price_per_1k_tokens = unifiedPrice;
                merged.price_per_request = unifiedPrice;
            }
            if (!merged.upstream_model_id) merged.upstream_model_id = merged.model_id;
            if (merged.pricing_mode !== 'request') merged.pricing_mode = 'usage';
            merged.price_per_1k_tokens = Math.max(0, Number(merged.price_per_1k_tokens) || 0);
            merged.price_per_request = Math.max(0, Number(merged.price_per_request) || 0);
            merged.multiplier = 1;
            await db.upsertModel(merged);
            return jsonRes({ success: true, model: await db.getModel(merged.model_id) });
        }
        if (req.method === 'DELETE') { await db.deleteModel((await req.json()).model_id); return jsonRes({ success: true }); }
    },

    async notices(req, db, user) {
        requireAuth(user);
        if (req.method !== 'GET') return errRes('Method not allowed', 405);
        return jsonRes({ notices: await db.getNotices({ includeDisabled: false, limit: 20 }) });
    },

    async adminNotices(req, db, user) {
        requireRoot(user);
        if (req.method === 'GET') {
            return jsonRes({ notices: await db.getNotices({ includeDisabled: true, limit: 200 }) });
        }
        if (req.method === 'POST') {
            const body = await req.json();
            const title = String(body?.title || '').trim().slice(0, 120);
            const content = String(body?.content || '').trim().slice(0, 5000);
            if (!content) return errRes('Notice content required');
            const enabled = body?.enabled === undefined ? 1 : (Number(body.enabled) ? 1 : 0);
            const created = await db.createNotice({
                title: title || null,
                content,
                enabled,
                created_by: user.id
            });
            return jsonRes({ success: true, notice: created });
        }
        if (req.method === 'PUT') {
            const body = await req.json();
            const id = Number(body?.id);
            if (!Number.isFinite(id)) return errRes('Invalid notice id');
            const payload = {};
            if (body?.title !== undefined) payload.title = String(body.title || '').trim().slice(0, 120) || null;
            if (body?.content !== undefined) {
                const content = String(body.content || '').trim().slice(0, 5000);
                if (!content) return errRes('Notice content required');
                payload.content = content;
            }
            if (body?.enabled !== undefined) payload.enabled = Number(body.enabled) ? 1 : 0;
            const changed = await db.updateNotice(id, payload);
            if (!changed) return errRes('Notice not found', 404);
            return jsonRes({ success: true });
        }
        if (req.method === 'DELETE') {
            const body = await req.json();
            const id = Number(body?.id);
            if (!Number.isFinite(id)) return errRes('Invalid notice id');
            const changed = await db.deleteNotice(id);
            if (!changed) return errRes('Notice not found', 404);
            return jsonRes({ success: true });
        }
        return errRes('Method not allowed', 405);
    },

    async adminExport(req, db, user) {
        requireRoot(user);
        const { types } = await req.json();
        const data = await db.exportData(types);
        return jsonRes({ data });
    },

    async adminImport(req, db, user) {
        requireRoot(user);
        const { data, mode } = await req.json();
        if (!data || typeof data !== 'object') return errRes('Invalid import payload');
        const stats = await db.importData(data, mode === 'replace' ? 'replace' : 'merge');
        return jsonRes({ success: true, stats });
    },

    async v1Info(req, db) {
        const auth = await resolveV1Auth(req, db);
        if (!auth) return errRes('Invalid API key', 401);
        return jsonRes({
            object: 'info',
            endpoint: '/v1',
            user_id: auth.user.id,
            key_name: auth.key.name
        });
    },

    async v1Models(req, db) {
        const auth = await resolveV1Auth(req, db);
        if (!auth) return errRes('Invalid API key', 401);
        const allModels = await getAccessibleModels(db, auth.user);
        const keyAllowed = parseModels(auth.key.allowed_models);
        const filtered = allModels.filter(m => modelAllowed(keyAllowed, m.id, m.upstream_model_id));
        return jsonRes({
            object: 'list',
            data: filtered.map(m => ({
                id: m.id,
                object: 'model',
                created: 0,
                owned_by: 'aicn'
            }))
        });
    },

    async v1ChatCompletions(req, db, ctx) {
        const auth = await resolveV1Auth(req, db);
        if (!auth) return errRes('Invalid API key', 401);

        const key = auth.key;
        if (!key.enabled) return errRes('API key disabled', 403);
        if (Number(key.budget_points) >= 0 && Number(key.used_points) >= Number(key.budget_points)) {
            return errRes('API key points exhausted', 429);
        }

        const payload = await req.json();
        const stream = payload?.stream === true;
        const model = String(payload?.model || '').trim();
        const messages = Array.isArray(payload?.messages) ? payload.messages : [];
        if (!model || !messages.length) return errRes('Messages and model required');

        const keyAllowed = parseModels(key.allowed_models);
        const chatReq = { json: async () => ({ model, messages }) };

        const settings = await db.getSettings();
        const tokenUnitsPerUSD = getTokenUnitsPerUSD(settings);
        const pointsPerUSD = getPointsPerUSD(settings);

        const response = await api.chat(chatReq, db, auth.user, ctx, {
            allowed_models: keyAllowed,
            onUsageUnits: async (units) => {
                const usd = Number(units || 0) / tokenUnitsPerUSD;
                const points = Math.max(0, Math.ceil(usd * pointsPerUSD));
                if (points > 0) await db.addUserAPIKeyUsage(key.id, points);
            }
        });

        if (stream || !response.ok) return response;

        const text = await response.text();
        let content = '';
        for (const rawLine of text.split('\n')) {
            const line = rawLine.trim();
            if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
            try {
                const j = JSON.parse(line.slice(6));
                const chunk = j?.choices?.[0]?.delta?.content;
                if (chunk) content += chunk;
            } catch {}
        }

        return jsonRes({
            id: `chatcmpl-${crypto.randomUUID().replace(/-/g, '')}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }]
        });
    },

    async resetDatabase(req, db, user) {
        requireRoot(user);
        const { confirm } = await req.json();
        if (confirm !== true) return errRes('Confirmation required');
        try {
            await db.reset();
            return jsonRes({ success: true, message: 'Database reset successfully' });
        } catch (e) {
            return errRes('Failed to reset database: ' + e.message);
        }
    }
};
