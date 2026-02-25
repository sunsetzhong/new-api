/**
 * src/views.js
 */

import { escape } from './utils.js';
import { LANGS } from './i18n.js';
import { CSS, initTheme } from './styles.js';

const uiText = (lang) => {
    const zh = lang.startsWith('zh');
    return {
        zh,
        lightDark: zh ? '亮/暗' : 'Light/Dark',
        settings: zh ? '设置' : 'Settings',
        account: zh ? '账户' : 'Account',
        preferences: zh ? '偏好设置' : 'Preferences',
        language: zh ? '语言' : 'Language',
        theme: zh ? '主题' : 'Theme',
        toggleTheme: zh ? '切换亮/暗主题' : 'Toggle Light/Dark Theme',
        defaultModel: zh ? '默认模型' : 'Default Model',
        systemDefault: zh ? '系统默认' : 'System Default',
        notSet: zh ? '未设置' : 'None',
        usage: zh ? '用量' : 'Usage',
        limit: zh ? '额度' : 'Limit',
        remain: zh ? '剩余' : 'Remaining',
        points: zh ? '积分' : 'Units',
        localApi: zh ? '本站 API Key（/v1）' : 'Local API Keys (/v1)',
        localApiDesc: zh ? '系统生成 Key，Base URL 使用本站域名 + /v1。额度单位统一为积分（units）。' : 'System-generated keys. Base URL is your site + /v1. Quotas are shown in units.',
        endpoint: zh ? 'Base URL' : 'Base URL',
        addKey: zh ? '新增 Key' : 'New Key',
        editKey: zh ? '编辑 Key' : 'Edit Key',
        keyShownOnce: zh ? '新 Key 只显示一次，请立即保存。' : 'New key is shown once. Save it now.',
        copyOk: zh ? '已复制到剪贴板' : 'Copied to clipboard',
        noKeys: zh ? '暂无 API Key' : 'No API keys',
        keyPrefix: zh ? 'Key 前缀' : 'Key Prefix',
        allowedModels: zh ? '可用模型（逗号分隔，* 为全部）' : 'Allowed models (comma separated, * for all)',
        allModels: zh ? '全部模型' : 'All Models',
        budgetPoints: zh ? '额度（积分，-1 不限）' : 'Budget (Points, -1 unlimited)',
        usedPoints: zh ? '已用（积分）' : 'Used (Points)',
        status: zh ? '状态' : 'Status',
        enabled: zh ? '启用' : 'Enabled',
        disabled: zh ? '禁用' : 'Disabled',
        passwordHint: zh ? '至少 6 位' : 'At least 6 characters',
        noModels: zh ? '无可用模型' : 'No models',
        selectModel: zh ? '请选择模型' : 'Select model',
        exportFull: zh ? '仅支持完整数据导出（全部）。' : 'Only full export is supported.',
        importFull: zh ? '仅支持完整数据导入（全部）。' : 'Only full import is supported.',
        send: zh ? '发送' : 'Send',
        stop: zh ? '停止' : 'Stop',
        saveFailed: zh ? '保存失败' : 'Save failed',
        loadFailed: zh ? '加载失败' : 'Load failed',
        deleteFailed: zh ? '删除失败' : 'Delete failed',
        invalidJson: zh ? 'JSON 文件无效' : 'Invalid JSON file',
        createAccount: zh ? '创建新账户' : 'Create a new account',
        noAccount: zh ? '没有账户？' : 'No account?',
        hasAccount: zh ? '已有账户？' : 'Already have an account?',
        allowRegister: zh ? '允许邮箱注册' : 'Allow email registration',
        registerClosed: zh ? '注册已关闭，请使用 LinuxDo 登录。' : 'Registration is disabled. Please use LinuxDo sign-in.',
        loginWithLinuxDo: zh ? '使用 LinuxDo 登录' : 'Sign in with LinuxDo',
        chatWelcome: zh ? '有什么可以帮你？' : 'How can I help you today?',
        noQuotaError: zh ? '额度不足，请先申请额度。' : 'No quota left. Please request more quota.',
        quotaApply: zh ? '申请额度' : 'Quota Request',
        quotaApplyDesc: zh ? '提交文字或截图，申请提升积分额度。' : 'Submit text or screenshot to request more quota.',
        requestPoints: zh ? '申请积分' : 'Requested Points',
        requestText: zh ? '申请说明' : 'Request Message',
        requestImage: zh ? '截图（可选）' : 'Image (optional)',
        submitRequest: zh ? '提交申请' : 'Submit Request',
        myRequests: zh ? '我的申请记录' : 'My Requests',
        adminRequests: zh ? '额度申请审批' : 'Quota Requests',
        approve: zh ? '批准' : 'Approve',
        reject: zh ? '拒绝' : 'Reject',
        pending: zh ? '待处理' : 'Pending',
        approved: zh ? '已批准' : 'Approved',
        rejected: zh ? '已拒绝' : 'Rejected',
        role: zh ? '角色' : 'Role',
        userRole: zh ? '用户' : 'User',
        adminRole: zh ? '管理员' : 'Admin',
        image: zh ? '图片' : 'Image',
        note: zh ? '备注' : 'Note',
        time: zh ? '时间' : 'Time',
        saveUser: zh ? '保存用户' : 'Save User',
        notices: zh ? '通知' : 'Notices',
        noticeManage: zh ? '通知管理' : 'Notice Management',
        noticeTitle: zh ? '通知标题（可选）' : 'Notice Title (Optional)',
        noticeContent: zh ? '通知内容' : 'Notice Content',
        publishNotice: zh ? '发布通知' : 'Publish Notice',
        editNotice: zh ? '编辑通知' : 'Edit Notice',
        noNotices: zh ? '暂无通知' : 'No notices',
        recharge: zh ? '在线充值' : 'Recharge',
        rechargeDesc: zh ? '支付渠道：credit.linux.do（Linux Do 元）。' : 'Payment provider: credit.linux.do',
        rechargeRate: zh ? '汇率：1 Linux Do 元 = 100 积分' : 'Rate: 1 credit = 100 points',
        rechargeAmount: zh ? '充值数量（Linux Do 元）' : 'Amount (credit)',
        rechargeBtn: zh ? '去支付' : 'Pay Now',
        rechargeOrders: zh ? '充值记录' : 'Recharge Orders',
        rechargeOrderNo: zh ? '订单号' : 'Order No.',
        rechargeStatusPending: zh ? '待支付' : 'Pending',
        rechargeStatusSuccess: zh ? '已到账' : 'Paid',
        rechargeDisabled: zh ? '充值通道暂未开启，请联系管理员。' : 'Recharge is not enabled yet.',
        rechargeJumping: zh ? '正在跳转支付...' : 'Redirecting to payment...',
        rechargeNeedAmount: zh ? '请输入正确的充值数量' : 'Please enter a valid amount',
        rechargeLinuxDoSettings: zh ? 'Linux Do 支付配置' : 'Linux Do Pay Settings',
        oauthLinuxDoSettings: zh ? 'Linux Do 登录配置' : 'Linux Do OAuth Settings',
        oauthClientID: zh ? 'Client ID' : 'Client ID',
        oauthClientSecret: zh ? 'Client Secret' : 'Client Secret',
        oauthRedirectUri: zh ? '回调地址' : 'Redirect URI',
        oauthAuthorizeUrl: zh ? '授权端点' : 'Authorize URL',
        oauthTokenUrl: zh ? 'Token 端点' : 'Token URL',
        oauthUserUrl: zh ? '用户信息端点' : 'User Info URL',
        envPanelHint: zh ? '以下字段可在控制面板填写，优先于 Worker 环境变量。' : 'These fields are editable in panel and take precedence over Worker env vars.',
        siteName: zh ? '站点名称' : 'Site Name',
        siteIconUrl: zh ? '站点图标 URL' : 'Site Icon URL',
        siteIconUpload: zh ? '上传站点图标到 R2' : 'Upload site icon to R2',
        uploadImage: zh ? '上传图片' : 'Upload Image',
        openImage: zh ? '打开图片' : 'Open Image',
        siteIconPreview: zh ? '图标预览' : 'Icon Preview',
        selectImageFirst: zh ? '请先选择图片文件' : 'Please choose an image file first',
        uploadSuccess: zh ? '上传成功' : 'Upload succeeded',
        rechargePID: zh ? '应用 Client ID（支持字符串）' : 'Client ID (string supported)',
        rechargeKey: zh ? '商户 KEY' : 'Merchant KEY',
        rechargePayType: zh ? '支付类型' : 'Pay Type',
        rechargeReturnUrl: zh ? '支付完成回调页（可选）' : 'Return URL (optional)',
        rechargeNotifyUrlSetting: zh ? '异步通知 URL（可选）' : 'Notify URL (optional)',
        rechargeGatewayUrlSetting: zh ? '支付网关 URL（可选）' : 'Gateway URL (optional)',
        rechargeNotifyHint: zh ? '异步通知 URL：' : 'Notify URL: ',
        rechargePointRate: zh ? '积分倍率（每 1 Linux Do 元）' : 'Points per 1 credit'
    };
};

const baseHTML = (content, { title = '硬核科技局 AI 站', user = null, settings = {}, lang = 'zh-CN' } = {}) => {
    const t = LANGS[lang] || LANGS.en;
    const ui = uiText(lang);
    const ts = settings.turnstile_enabled === 'true';
    const iconUrl = String(settings.site_icon_url || '').trim();
    const iconTag = iconUrl ? `<link rel="icon" href="${escape(iconUrl)}">` : '';
    const authedNav = user && user.id
        ? `${user.group_id === 1 ? `<a href="/admin">${t.admin}</a>` : `<a href="/quota-request">${ui.quotaApply}</a>`}<a href="/settings">${t.profile}</a><a href="#" onclick="logout();return false">${t.logout}</a>`
        : `<a href="/login">${t.login}</a><a href="/register">${t.register}</a>`;

    return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} - ${escape(settings.site_name || '硬核科技局 AI 站')}</title>${iconTag}<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"><\/script><style>${CSS}</style><script>${initTheme}<\/script>${ts ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer><\/script>' : ''}</head><body><nav class="nav"><div class="container"><a href="/" class="logo">${escape(settings.site_name || '硬核科技局 AI 站')}</a><div class="nav-r"><button class="btn btn-s" onclick="toggleTheme();return false">${ui.lightDark}</button>${authedNav}</div></div></nav><main>${content}</main><script>window.__I18N=${JSON.stringify(t)};function toggleTheme(){const isDark=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark');localStorage.setItem('theme',isDark?'dark':'light')}function setLang(v){document.cookie='lang='+v+';path=/;max-age=31536000';location.reload()}function logout(){fetch('/api/logout',{method:'POST'}).then(()=>location.href='/login')}function toast(m,t='success'){const d=document.createElement('div');d.className='toast '+t;d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}<\/script></body></html>`;
};

const quotaSummary = (user, group, settings, ui, t) => {
    const tokenUnitsPerUSD = Math.max(1, Number(settings.token_units_per_usd) || 10000);
    const pointsPerUSD = Math.max(1, Number(settings.points_per_usd) || 10000);
    const toPoints = (units) => {
        const n = Number(units);
        if (!Number.isFinite(n)) return 0;
        if (n < 0) return -1;
        return Number(((n / tokenUnitsPerUSD) * pointsPerUSD).toFixed(2));
    };
    const usedPoints = toPoints(Number(user.tokens_used || 0));
    const limitUnits = Number.isFinite(Number(user.quota_limit_units)) ? Number(user.quota_limit_units) : Number(group?.token_limit ?? -1);
    const limitPoints = toPoints(limitUnits);
    const remainPoints = limitPoints < 0 ? -1 : Number(Math.max(0, limitPoints - usedPoints).toFixed(2));
    return {
        usedPoints,
        limitPoints,
        remainPoints,
        limitText: limitPoints < 0 ? t.unlimited : `${limitPoints.toFixed(2)} ${ui.points}`,
        remainText: remainPoints < 0 ? t.unlimited : `${remainPoints.toFixed(2)} ${ui.points}`
    };
};

const displayLoginName = (raw) => {
    const email = String(raw || '').trim();
    const suffix = '@linuxdo.oauth';
    if (email.startsWith('linuxdo_') && email.endsWith(suffix)) {
        const x = email.slice('linuxdo_'.length, -suffix.length).trim();
        return x || email;
    }
    return email;
};

export const pages = {
    login: (settings, lang) => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        const oauthEnabled = String(settings.linuxdo_oauth_enabled || '').toLowerCase() === 'true';
        const allowRegister = String(settings.allow_register || 'true').toLowerCase() !== 'false';
        const registerLine = allowRegister
            ? `<p class="text-m" style="margin:12px 0 0">${ui.noAccount} <a href="/register">${t.register}</a></p>`
            : `<p class="text-m" style="margin:12px 0 0">${ui.registerClosed}</p>`;
        return baseHTML(`<div class="container" style="max-width:420px"><div class="card"><h2 style="margin-top:0">${t.login}</h2><p class="text-m">${escape(settings.site_name || 'AI Chat')}</p><form id="f" class="auth-form"><div class="form-g"><label>${t.email}</label><input class="input" type="email" name="email" required></div><div class="form-g"><label>${t.password}</label><input class="input" type="password" name="password" required></div>${settings.turnstile_enabled === 'true' ? `<div class="cf-turnstile" data-sitekey="${settings.turnstile_site_key}"></div>` : ''}<div class="form-g auth-submit"><button class="btn btn-p" type="submit">${t.submit}</button></div></form>${oauthEnabled ? `<div class="form-g oauth-entry"><a class="btn auth-oauth-btn" href="/api/auth/linuxdo/start">${ui.loginWithLinuxDo}</a></div>` : ''}${registerLine}</div></div><script>const q=new URLSearchParams(location.search);const showErr=m=>{if(!m)return;if(typeof toast==='function')toast(m,'error');else alert(m)};const oe=q.get('oauth_error');if(oe)showErr(oe);document.getElementById('f').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const body={email:fd.get('email'),password:fd.get('password')};const tk=document.querySelector('[name="cf-turnstile-response"]');if(tk)body.turnstile=tk.value;try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(j.success)location.href='/';else toast(j.error,'error')}catch(err){showErr(err.message)}}<\/script>`, { title: t.login, settings, lang });
    },

    register: (settings, lang) => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        const oauthEnabled = String(settings.linuxdo_oauth_enabled || '').toLowerCase() === 'true';
        return baseHTML(`<div class="container" style="max-width:420px"><div class="card"><h2 style="margin-top:0">${t.register}</h2><p class="text-m">${ui.createAccount}</p><form id="f" class="auth-form"><div class="form-g"><label>${t.email}</label><input class="input" type="email" name="email" required></div><div class="form-g"><label>${t.password}</label><input class="input" type="password" name="password" minlength="6" required placeholder="${ui.passwordHint}"></div>${settings.turnstile_enabled === 'true' ? `<div class="cf-turnstile" data-sitekey="${settings.turnstile_site_key}"></div>` : ''}<div class="form-g auth-submit"><button class="btn btn-p" type="submit">${t.submit}</button></div></form>${oauthEnabled ? `<div class="form-g oauth-entry"><a class="btn auth-oauth-btn" href="/api/auth/linuxdo/start">${ui.loginWithLinuxDo}</a></div>` : ''}<p class="text-m" style="margin:12px 0 0">${ui.hasAccount} <a href="/login">${t.login}</a></p></div></div><script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const body={email:fd.get('email'),password:fd.get('password')};const tk=document.querySelector('[name="cf-turnstile-response"]');if(tk)body.turnstile=tk.value;try{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(j.success)location.href='/';else toast(j.error,'error')}catch(err){toast(err.message,'error')}}<\/script>`, { title: t.register, settings, lang });
    },
    chat: (user, settings, lang) => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        const siteName = String(settings.site_name || '硬核科技局 AI 站').trim() || '硬核科技局 AI 站';
        const siteIconUrl = String(settings.site_icon_url || '').trim();
        const iconTag = siteIconUrl ? `<link rel="icon" href="${escape(siteIconUrl)}">` : '';
        const roleText = user.group_id === 1 ? ui.adminRole : ui.userRole;
        const displayName = displayLoginName(user.email || '');
        return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(siteName)}</title>${iconTag}<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script><script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"><\/script><style>${CSS}</style><script>${initTheme}<\/script></head><body>
<nav class="nav"><div class="container"><a href="/" class="logo">${escape(siteName)}</a><div class="nav-r"><button class="btn btn-s" onclick="toggleTheme()">${ui.lightDark}</button>${user.group_id===1 ? `<a href="/admin">${t.admin}</a>` : `<a href="/quota-request">${ui.quotaApply}</a>`}<a href="/settings">${t.profile}</a><a href="#" onclick="logout();return false">${t.logout}</a></div></div></nav>
<div class="chat">
<aside id="side" class="chat-side">
<div class="side-top">
<div class="side-brand"><strong>${escape(siteName)}</strong><span>${escape(displayName)} · ${escape(roleText)}</span></div>
<div class="flex gap-2 items-c jc-b"><button class="btn btn-p" id="newBtn">+ ${t.newChat}</button><button class="btn btn-s" id="toggleSide" style="display:none">✕</button></div>
</div>
<div class="hist-list" id="hist"></div>
<div class="quota-card side-quota" id="quotaCard"><div class="quota-top"><strong>${ui.limit}</strong><span id="quotaStatus" class="text-m text-xs">-</span></div><div class="quota-grid"><div class="quota-item"><span>${ui.usage}</span><b id="quotaUsed">-</b></div><div class="quota-item"><span>${ui.limit}</span><b id="quotaLimit">-</b></div><div class="quota-item"><span>${ui.remain}</span><b id="quotaRemain">-</b></div></div><div id="quotaBar" class="quota-bar"><span id="quotaFill" class="quota-fill"></span></div></div>
</aside>
<section class="chat-main">
<div class="chat-head"><div class="chat-head-left"><button id="openSide" class="btn btn-s" style="display:none">☰</button><strong id="chatTitle">${t.newChat}</strong></div><div class="chat-head-right"><select id="model" class="input chat-model"></select></div></div>
<div class="chat-body"><div id="noticeWrap" class="hidden"></div><div id="msgs"></div></div>
<div class="chat-input"><div class="flex gap-2 items-c"><textarea id="inp" class="input" rows="2" placeholder="${t.inputPlaceholder}" style="resize:vertical"></textarea><button id="sendBtn" class="btn btn-p">${ui.send}</button><button id="stopBtn" class="btn btn-d hidden">${ui.stop}</button></div><div class="text-xs text-m" style="margin-top:6px">${t.disclaimer}</div></div>
</section>
</div>
<script>
const L=${JSON.stringify(t)};
const UI=${JSON.stringify(ui)};
const SYS_DEF=${JSON.stringify(String(settings.default_model || ''))};
const USER_DEF=${JSON.stringify(String(user.default_model || ''))};
let chats=[],cid=null,msgs=[],busy=false,ctrl=null,quotaState={unlimited:false,remain:0};
function $(x){return document.getElementById(x)}
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function toast(m,t='success'){const d=document.createElement('div');d.className='toast '+t;d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function toggleTheme(){const isDark=!document.documentElement.classList.contains('dark');document.documentElement.classList.toggle('dark');localStorage.setItem('theme',isDark?'dark':'light')}
function logout(){fetch('/api/logout',{method:'POST'}).then(()=>location.href='/login')}
function md(txt){if(!txt)return '';try{return DOMPurify.sanitize(marked.parse(txt))}catch{return esc(txt)}}
function fmtPoints(v){const n=Number(v);if(!Number.isFinite(n))return '0';return Number.isInteger(n)?String(n):n.toFixed(2)}
function fmtQuota(v){return Number(v)<0?L.unlimited:(fmtPoints(v)+' '+UI.points)}
function setText(id,text){const el=$(id);if(el)el.textContent=text}
function renderQuota(data){const u=data?.user||{};const used=Math.max(0,Number(u.tokens_used_points)||0);const rawLimit=Number(u.token_limit_points);const unlimited=!Number.isFinite(rawLimit)||rawLimit<0;const limit=unlimited?-1:Math.max(0,rawLimit);const remain=unlimited?-1:Math.max(0,limit-used);quotaState={unlimited,remain};setText('quotaUsed',fmtPoints(used)+' '+UI.points);setText('quotaLimit',fmtQuota(limit));setText('quotaRemain',fmtQuota(remain));const bar=$('quotaBar');const fill=$('quotaFill');if(bar&&fill){if(unlimited){bar.classList.add('hidden');setText('quotaStatus',L.unlimited)}else{bar.classList.remove('hidden');const pct=Math.max(0,Math.min(100,(used/Math.max(limit,1))*100));fill.style.width=pct.toFixed(1)+'%';setText('quotaStatus',pct.toFixed(1)+'%')}}const locked=!unlimited&&remain<=0;$('sendBtn').disabled=locked;$('inp').disabled=locked;if(locked){$('inp').placeholder=UI.noQuotaError}else{$('inp').placeholder=L.inputPlaceholder}}
function renderNotices(list){const wrap=$('noticeWrap');if(!wrap)return;const arr=(list||[]).filter(n=>n&&n.enabled!==0&&String(n.content||'').trim());if(!arr.length){wrap.classList.add('hidden');wrap.innerHTML='';return}wrap.classList.remove('hidden');wrap.innerHTML=arr.map(n=>'<div class="notice-card"><div class="notice-title">'+esc(n.title||'通知')+'</div><div class="text-s">'+esc(String(n.content||'')).replace(/\\n/g,'<br>')+'</div></div>').join('')}
async function loadNotices(){try{const r=await fetch('/api/notices');if(!r.ok)return;const j=await r.json();renderNotices(j.notices||[])}catch{}}
async function loadQuota(){try{const r=await fetch('/api/me');if(!r.ok)return;const j=await r.json();renderQuota(j)}catch{}}
async function loadModels(){try{const r=await fetch('/api/models');const j=await r.json();const arr=j.data||[];let selected=USER_DEF||SYS_DEF;if(!arr.find(x=>x.id===selected))selected=arr[0]?.id||'';$('model').innerHTML=arr.map(m=>'<option value="'+m.id+'">'+m.icon+' '+esc(m.name)+'</option>').join('')||'<option value="">'+UI.noModels+'</option>';if(selected)$('model').value=selected}catch{$('model').innerHTML='<option value="">'+UI.noModels+'</option>'}}
async function loadChats(){try{const r=await fetch('/api/chats');if(!r.ok)return;const j=await r.json();chats=j.chats||[];renderHist()}catch{}}
function renderHist(){const h=$('hist');if(!h)return;h.innerHTML=chats.map(c=>'<div class="hist-row'+(c.id===cid?' active':'')+'"><button class="hist-title" onclick="openChat('+c.id+')">'+esc(c.title||L.newChat)+'</button><button class="hist-del" title="'+(L.delete||'Delete')+'" onclick="event.stopPropagation();delChat('+c.id+')">×</button></div>').join('')}
function newChat(){cid=null;msgs=[];$('msgs').innerHTML='';$('chatTitle').textContent=L.newChat;renderHist()}
async function openChat(id){try{const r=await fetch('/api/chats/'+id);if(!r.ok)return;const c=await r.json();cid=c.id;msgs=JSON.parse(c.messages||'[]');$('chatTitle').textContent=c.title||L.newChat;$('msgs').innerHTML='';msgs.filter(m=>m.role!=='system').forEach(m=>appendMsg(m.role,m.content,false));if(c.model)$('model').value=c.model;renderHist();if(innerWidth<900)$('side').classList.remove('open')}catch{}}
async function delChat(id){if(!confirm(L.confirm))return;const r=await fetch('/api/chats/'+id,{method:'DELETE'});if(!r.ok){toast(UI.deleteFailed,'error');return}if(cid===id)newChat();await loadChats();toast(L.success)}
function appendMsg(role,text,scroll=true){const wrap=document.createElement('div');wrap.className='msg'+(role==='user'?' user':'');const bubble=document.createElement('div');bubble.className='bubble';bubble.innerHTML=role==='assistant'?md(text):esc(text);wrap.appendChild(bubble);$('msgs').appendChild(wrap);if(scroll)wrap.scrollIntoView({behavior:'smooth'});return bubble}
function toggleBusy(on){busy=on;$('sendBtn').classList.toggle('hidden',on);$('stopBtn').classList.toggle('hidden',!on)}
async function send(){if(busy)return;if(!quotaState.unlimited&&quotaState.remain<=0){toast(UI.noQuotaError,'error');return}const txt=$('inp').value.trim();if(!txt)return;const model=$('model').value;if(!model){toast(UI.selectModel,'error');return}$('inp').value='';appendMsg('user',txt);msgs.push({role:'user',content:txt});toggleBusy(true);const bubble=appendMsg('assistant','');bubble.innerHTML='<span class="text-m">...</span>';try{ctrl=new AbortController();const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:msgs,model}),signal:ctrl.signal});if(!r.ok){const tx=await r.text();try{const jj=JSON.parse(tx);throw new Error(jj.error||'API Error')}catch{throw new Error(tx||'API Error')}}const reader=r.body.getReader();const dec=new TextDecoder();let buf='',full='';while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});const lines=buf.split('\\n');buf=lines.pop()||'';for(const line of lines){if(!line.startsWith('data: ')||line.includes('[DONE]'))continue;try{const j=JSON.parse(line.slice(6));const c=j.choices?.[0]?.delta?.content;if(c){full+=c;bubble.innerHTML=md(full)}}catch{}}}msgs.push({role:'assistant',content:full});if(!cid){const title=txt.slice(0,30)+(txt.length>30?'...':'');$('chatTitle').textContent=title}const sr=await fetch('/api/chats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:cid,title:$('chatTitle').textContent||L.newChat,messages:msgs,model})});if(sr.ok){const sj=await sr.json().catch(()=>null);if(!cid&&sj?.id)cid=sj.id;loadChats()}await loadQuota()}catch(e){if(e.name!=='AbortError')bubble.innerHTML='<span style="color:#ef4444">'+esc(e.message)+'</span>'}finally{toggleBusy(false);ctrl=null}}
function stop(){ctrl?.abort()}
$('sendBtn').onclick=send;$('stopBtn').onclick=stop;$('newBtn').onclick=newChat;$('inp').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
if(innerWidth<900){$('openSide').style.display='inline-block';$('toggleSide').style.display='inline-block';$('openSide').onclick=()=>$('side').classList.add('open');$('toggleSide').onclick=()=>$('side').classList.remove('open')}
loadNotices();loadModels();loadChats();loadQuota();newChat();
<\/script></body></html>`;
    },


    profile: (user, groups, settings, lang, models = []) => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        const group = groups.find(g => g.id === user.group_id);
        const quota = quotaSummary(user, group, settings, ui, t);
        const modelOptions = models.filter(m => m.enabled).map(m => `<option value="${m.model_id}"${user.default_model===m.model_id?' selected':''}>${m.icon} ${escape(m.display_name)}</option>`).join('');
        const rechargePointsPerCredit = Math.max(1, Number(settings.linuxdo_points_per_credit) || 100);
        const rechargeRateText = lang.startsWith('zh')
            ? `汇率：1 Linux Do 元 = ${rechargePointsPerCredit} 积分`
            : `Rate: 1 credit = ${rechargePointsPerCredit} points`;

        return baseHTML(`<div class="container" style="max-width:980px"><h2 style="margin-top:0">${t.profile}</h2>
        <div class="card"><h3 style="margin-top:0">${ui.account}</h3><div class="form-row"><div class="form-g"><label>${t.email}</label><input class="input" value="${escape(displayLoginName(user.email))}" disabled></div><div class="form-g"><label>${ui.role}</label><input class="input" value="${user.group_id===1?ui.adminRole:ui.userRole}" disabled></div></div><div class="flex gap-3"><span class="pill">${ui.usage}: ${quota.usedPoints.toFixed(2)} ${ui.points}</span><span class="pill">${ui.limit}: ${quota.limitText}</span><span class="pill">${ui.remain}: ${quota.remainText}</span></div></div>

        ${user.group_id===1 ? '' : `<div class="card"><h3 style="margin-top:0">${ui.quotaApply}</h3><p class="text-m">${ui.quotaApplyDesc}</p><a class="btn btn-p" href="/quota-request">${ui.quotaApply}</a></div>`}
        ${user.group_id===1 ? '' : `<div class="card"><h3 style="margin-top:0">${ui.recharge}</h3><p class="text-m">${ui.rechargeDesc}</p><p class="text-m">${rechargeRateText}</p><div class="form-row"><div class="form-g"><label>${ui.rechargeAmount}</label><input id="rechargeAmount" class="input" type="number" min="0.01" step="0.01" value="1.00"></div><div class="form-g"><label>${ui.rechargePointRate}</label><input class="input" value="${rechargePointsPerCredit}" disabled></div></div><button id="rechargeBtn" class="btn btn-p" type="button">${ui.rechargeBtn}</button><div class="form-g" style="margin-top:12px"><label>${ui.rechargeOrders}</label><table class="table"><thead><tr><th>ID</th><th>${ui.rechargeOrderNo}</th><th>${ui.rechargeAmount}</th><th>${ui.requestPoints}</th><th>${ui.status}</th><th>${ui.time}</th></tr></thead><tbody id="rechargeBody"><tr><td colspan="6" class="text-m">-</td></tr></tbody></table></div></div>`}

        <div class="card"><h3 style="margin-top:0">${ui.preferences}</h3><form id="prefForm"><div class="form-row"><div class="form-g"><label>${ui.language}</label><select class="input" onchange="setLang(this.value)"><option value="zh-CN"${lang==='zh-CN'?' selected':''}>简体中文</option><option value="en"${lang==='en'?' selected':''}>English</option></select></div><div class="form-g"><label>${ui.defaultModel}</label><select name="default_model" class="input"><option value="">${ui.systemDefault} (${escape(settings.default_model || ui.notSet)})</option>${modelOptions}</select></div></div><button class="btn btn-p" type="submit">${t.save}</button></form><div class="form-g" style="margin-top:12px"><label>${ui.theme}</label><button class="btn" onclick="toggleTheme()">${ui.toggleTheme}</button></div></div>

        <div class="card"><h3 style="margin-top:0">${ui.localApi}</h3><p class="text-m">${ui.localApiDesc}</p><div class="form-g"><label>${ui.endpoint}</label><input id="apiEndpoint" class="input" readonly></div><div class="flex jc-b items-c" style="margin-bottom:10px"><span class="text-m text-s">${ui.keyShownOnce}</span><button class="btn btn-p btn-s" onclick="showApiKeyModal()">+ ${ui.addKey}</button></div><table class="table"><thead><tr><th>ID</th><th>${t.name}</th><th>${ui.keyPrefix}</th><th>${ui.allowedModels}</th><th>${ui.budgetPoints}</th><th>${ui.usedPoints}</th><th>${ui.status}</th><th></th></tr></thead><tbody id="keyBody"></tbody></table></div>

        <div class="card"><h3 style="margin-top:0">${t.changePass}</h3><form id="passForm"><div class="form-g"><label>${t.currentPass}</label><input class="input" type="password" name="current" required></div><div class="form-g"><label>${t.newPass}</label><input class="input" type="password" name="newPass" minlength="6" required placeholder="${ui.passwordHint}"></div><button class="btn btn-p" type="submit">${t.save}</button></form></div>

        <div id="keyModal" class="modal"><div class="modal-box"><h3 id="keyModalTitle" style="margin-top:0">${ui.addKey}</h3><form id="keyForm"><input type="hidden" name="id"><div class="form-g"><label>${t.name}</label><input name="name" class="input" required></div><div class="form-g"><label>${ui.allowedModels}</label><textarea name="allowed_models" class="input" rows="3" placeholder="*"></textarea></div><div class="form-row"><div class="form-g"><label>${ui.budgetPoints}</label><input class="input" type="number" step="1" name="budget_points" value="1000"></div><div class="form-g"><label>${ui.status}</label><select class="input" name="enabled"><option value="1">${ui.enabled}</option><option value="0">${ui.disabled}</option></select></div></div><div class="flex gap-2"><button class="btn btn-p" type="submit">${t.save}</button><button class="btn" type="button" onclick="hideApiKeyModal()">${t.cancel}</button></div></form></div></div>

        <script>const UI=${JSON.stringify(ui)};let keys=[];function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}function hideApiKeyModal(){document.getElementById('keyModal').classList.remove('show')}function showApiKeyModal(id){const k=typeof id==='number'?keys.find(x=>x.id===id):null;document.getElementById('keyModalTitle').textContent=k?UI.editKey:UI.addKey;const f=document.getElementById('keyForm');f.reset();f.id.value=k?.id||'';f.name.value=k?.name||'';f.allowed_models.value=(k?.allowed_models_list||['*']).join(', ');f.budget_points.value=(k?.budget_points ?? 1000);f.enabled.value=String(k?.enabled===0?0:1);document.getElementById('keyModal').classList.add('show')}function renderModels(arr){if(!Array.isArray(arr)||!arr.length||arr.includes('*'))return UI.allModels;return arr.join(', ')}function fmtPoints(v){const n=Number(v);if(!Number.isFinite(n))return '0';return Number.isInteger(n)?String(n):n.toFixed(2)}function payStatus(s){if(String(s)==='success')return UI.rechargeStatusSuccess;return UI.rechargeStatusPending}function fmtTime(ts){const n=Number(ts||0);if(!n)return '-';return new Date(n*1000).toLocaleString()}async function loadKeys(){try{const r=await fetch('/api/apis');const j=await r.json();if(!r.ok||j.error){toast(j.error||UI.loadFailed,'error');return}keys=j.keys||[];document.getElementById('apiEndpoint').value=location.origin+(j.endpoint||'/v1');document.getElementById('keyBody').innerHTML=keys.map(k=>'<tr><td>'+k.id+'<\/td><td>'+esc(k.name)+'<\/td><td><code>'+esc(k.key_prefix)+'***<\/code><\/td><td>'+esc(renderModels(k.allowed_models_list))+'<\/td><td>'+(Number(k.budget_points)<0?L.unlimited:(fmtPoints(k.budget_points)+' '+UI.points))+'<\/td><td>'+fmtPoints(k.used_points||0)+' '+UI.points+'<\/td><td>'+(k.enabled?UI.enabled:UI.disabled)+'<\/td><td><button class="btn btn-s" onclick="showApiKeyModal('+k.id+')">✎<\/button> <button class="btn btn-s btn-d" onclick="delKey('+k.id+')">✕<\/button><\/td><\/tr>').join('')||'<tr><td colspan="8" class="text-m">'+UI.noKeys+'<\/td><\/tr>'}catch(e){toast(e.message,'error')}}async function loadRechargeOrders(){const body=document.getElementById('rechargeBody');if(!body)return;try{const r=await fetch('/api/pay/linuxdo/orders');const j=await r.json().catch(()=>({}));if(!r.ok||j.error){body.innerHTML='<tr><td colspan=\"6\" class=\"text-m\">'+esc(j.error||'-')+'<\/td><\/tr>';return}const arr=j.orders||[];body.innerHTML=arr.map(o=>'<tr><td>'+o.id+'<\/td><td><code>'+esc(o.out_trade_no)+'<\/code><\/td><td>'+fmtPoints(o.amount)+'<\/td><td>'+fmtPoints(o.points)+' '+UI.points+'<\/td><td>'+esc(payStatus(o.status))+'<\/td><td>'+esc(fmtTime(o.created_at))+'<\/td><\/tr>').join('')||'<tr><td colspan=\"6\" class=\"text-m\">-<\/td><\/tr>'}catch(e){body.innerHTML='<tr><td colspan=\"6\" class=\"text-m\">'+esc(e.message)+'<\/td><\/tr>'}}async function startRecharge(){const el=document.getElementById('rechargeAmount');if(!el){return}const amount=Number(el.value);if(!Number.isFinite(amount)||amount<=0){toast(UI.rechargeNeedAmount,'error');return}const r=await fetch('/api/pay/linuxdo/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount})});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}const action=String(j.action||'').trim();const formData=j.form||{};if(!action||typeof formData!=='object'){toast('Invalid payment response','error');return}const form=document.createElement('form');form.method='POST';form.action=action;form.target='_blank';for(const [k,v] of Object.entries(formData)){const input=document.createElement('input');input.type='hidden';input.name=k;input.value=String(v??'');form.appendChild(input)}document.body.appendChild(form);form.submit();form.remove();toast(UI.rechargeJumping);setTimeout(loadRechargeOrders,800)}async function delKey(id){if(!confirm(L.confirm))return;const r=await fetch('/api/apis',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});const j=await r.json();if(!r.ok||j.error){toast(j.error||UI.deleteFailed,'error');return}toast(L.success);loadKeys()}document.getElementById('keyForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const d=Object.fromEntries(fd);d.enabled=+d.enabled;d.budget_points=Math.round(Number(d.budget_points));const method=d.id?'PUT':'POST';if(d.id)d.id=+d.id;else delete d.id;const r=await fetch('/api/apis',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json();if(!r.ok||j.error){toast(j.error||UI.saveFailed,'error');return}hideApiKeyModal();if(j.api_key){try{await navigator.clipboard.writeText(j.api_key);toast(UI.copyOk)}catch{}alert(UI.keyShownOnce+'\\n\\n'+j.api_key)}toast(L.success);loadKeys()};document.getElementById('keyModal').onclick=e=>{if(e.target.id==='keyModal')hideApiKeyModal()};document.getElementById('prefForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const r=await fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({default_model:fd.get('default_model')})});const j=await r.json().catch(()=>({}));if(r.ok&&j.success)toast(L.success);else toast(j.error||'Error','error')};document.getElementById('passForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const r=await fetch('/api/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({current:fd.get('current'),newPass:fd.get('newPass')})});const j=await r.json().catch(()=>({}));if(r.ok&&j.success){toast(L.success);e.target.reset()}else toast(j.error||'Error','error')};const rb=document.getElementById('rechargeBtn');if(rb)rb.onclick=startRecharge;loadKeys();loadRechargeOrders();<\/script>
        </div>`, { title: t.profile, user, settings, lang });
    },

    quotaRequest: (user, settings, lang) => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        return baseHTML(`<div class="container" style="max-width:980px"><h2 style="margin-top:0">${ui.quotaApply}</h2>
        <div class="card"><h3 style="margin-top:0">${ui.quotaApply}</h3><p class="text-m">${ui.quotaApplyDesc}</p><form id="reqForm" enctype="multipart/form-data"><div class="form-row"><div class="form-g"><label>${ui.requestPoints}</label><input class="input" type="number" min="0" name="requested_points" value="0"></div><div class="form-g"><label>${ui.requestImage}</label><input class="input" type="file" name="image" accept="image/*"></div></div><div class="form-g"><label>${ui.requestText}</label><textarea class="input" rows="5" name="message" placeholder="${ui.requestText}"></textarea></div><button class="btn btn-p" type="submit">${ui.submitRequest}</button></form></div>
        <div class="card"><h3 style="margin-top:0">${ui.myRequests}</h3><table class="table"><thead><tr><th>ID</th><th>${ui.status}</th><th>${ui.requestPoints}</th><th>${ui.approved}</th><th>${ui.note}</th><th>${ui.image}</th><th>${ui.time}</th></tr></thead><tbody id="reqBody"></tbody></table></div>
        <script>const UI=${JSON.stringify(ui)};function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}function statusText(s){if(s==='approved')return UI.approved;if(s==='rejected')return UI.rejected;return UI.pending}function fmtTime(ts){const n=Number(ts||0);if(!n)return '-';const d=new Date(n*1000);return d.toLocaleString()}async function loadReq(){const r=await fetch('/api/quota-requests');const j=await r.json();if(!r.ok||j.error){toast(j.error||'Error','error');return}const arr=j.requests||[];document.getElementById('reqBody').innerHTML=arr.map(x=>'<tr><td>'+x.id+'<\/td><td>'+esc(statusText(x.status))+'<\/td><td>'+Number(x.requested_points||0)+'<\/td><td>'+Number(x.approved_points||0)+'<\/td><td>'+esc(x.admin_note||'-')+'<\/td><td>'+(x.image_url?'<a href="'+x.image_url+'" target="_blank">View<\/a>':'-')+'<\/td><td>'+esc(fmtTime(x.created_at))+'<\/td><\/tr>').join('')||'<tr><td colspan="7" class="text-m">-<\/td><\/tr>'}document.getElementById('reqForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const r=await fetch('/api/quota-requests',{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}toast(L.success);e.target.reset();loadReq()};loadReq();<\/script>
        </div>`, { title: ui.quotaApply, user, settings, lang });
    },

    admin: (user, settings, lang, activeTab = 'settings') => {
        const t = LANGS[lang] || LANGS.en;
        const ui = uiText(lang);
        const active = ['settings', 'notices', 'users', 'requests', 'apis', 'models', 'data'].includes(activeTab) ? activeTab : 'settings';
        const tabClass = (k) => `tab${active === k ? ' active' : ''}`;
        const paneClass = (k) => active === k ? '' : 'hidden';

        return baseHTML(`<div class="container"><h1 class="mb-4">${t.admin}</h1>
<div class="tabs">
<a class="${tabClass('settings')}" href="/admin/settings">${t.siteSettings}</a>
<a class="${tabClass('notices')}" href="/admin/notices">${ui.notices}</a>
<a class="${tabClass('users')}" href="/admin/users">${t.users}</a>
<a class="${tabClass('requests')}" href="/admin/requests">${ui.adminRequests}</a>
<a class="${tabClass('apis')}" href="/admin/apis">${t.apiConfigs}</a>
<a class="${tabClass('models')}" href="/admin/models">${t.models}</a>
<a class="${tabClass('data')}" href="/admin/data">${t.dataManage || 'Data'}</a>
</div>

<div id="t-settings" class="${paneClass('settings')}"><div class="card"><form id="sf">
<div class="form-row">
<div class="form-g"><label>${ui.siteName}</label><input name="site_name" class="input" value="${escape(settings.site_name || '')}"></div>
<div class="form-g"><label>${t.maxAccountsPerIP}</label><input name="max_accounts_per_ip" type="number" class="input" value="${settings.max_accounts_per_ip || 3}"></div>
<div class="form-g"><label>${ui.allowRegister}</label><select name="allow_register" class="input"><option value="true"${String(settings.allow_register || 'true').toLowerCase() !== 'false' ? ' selected' : ''}>Yes</option><option value="false"${String(settings.allow_register || 'true').toLowerCase() === 'false' ? ' selected' : ''}>No</option></select></div>
</div>
<div class="form-row">
<div class="form-g"><label>${ui.siteIconUpload}</label><input id="siteIconFile" class="input" type="file" accept="image/*"></div>
<div class="form-g"><label>${ui.uploadImage}</label><button type="button" id="uploadIconBtn" class="btn btn-s">${ui.uploadImage}</button><div class="text-xs text-m mt-2">上传新图标时会自动删除旧图标。</div></div>
</div>

<div class="form-row">
<div class="form-g"><label>${t.turnstileEnabled}</label><select name="turnstile_enabled" class="input"><option value="false"${settings.turnstile_enabled !== 'true' ? ' selected' : ''}>No</option><option value="true"${settings.turnstile_enabled === 'true' ? ' selected' : ''}>Yes</option></select></div>
<div class="form-g"><label>${t.turnstileSiteKey}</label><input name="turnstile_site_key" class="input" value="${escape(settings.turnstile_site_key || '')}"></div>
<div class="form-g"><label>${t.turnstileSecretKey}</label><input name="turnstile_secret_key" type="password" class="input" value="${escape(settings.turnstile_secret_key || '')}"></div>
</div>
<div class="form-g"><label>${t.globalDefault || 'Global Default Model'}</label><input name="default_model" class="input" value="${escape(settings.default_model || '')}" placeholder="Model ID"></div>
<hr style="border:none;border-top:1px solid var(--line);margin:12px 0">
<h3 style="margin:0 0 10px">${ui.rechargeLinuxDoSettings}</h3>
<p class="text-xs text-m">${ui.envPanelHint}</p>
<div class="form-row">
<div class="form-g"><label>${ui.enabled}</label><select name="linuxdo_pay_enabled" class="input"><option value="false"${settings.linuxdo_pay_enabled !== 'true' ? ' selected' : ''}>No</option><option value="true"${settings.linuxdo_pay_enabled === 'true' ? ' selected' : ''}>Yes</option></select></div>
<div class="form-g"><label>${ui.rechargePID}</label><input name="linuxdo_pid" class="input" value="${escape(settings.linuxdo_pid || '')}" placeholder="Client ID（可为字符串）"></div>
<div class="form-g"><label>${ui.rechargeKey}</label><input name="linuxdo_key" type="password" class="input" value="${escape(settings.linuxdo_key || '')}" placeholder="Client Secret"></div>
</div>
<div class="form-row">
<div class="form-g"><label>${ui.rechargePointRate}</label><input name="linuxdo_points_per_credit" type="number" min="1" step="1" class="input" value="${escape(settings.linuxdo_points_per_credit || '100')}"></div>
</div>
<p class="text-xs text-m" style="margin-top:-4px">支付类型固定为 epay，网关与 LinuxDo API 地址使用系统默认。</p>
<hr style="border:none;border-top:1px solid var(--line);margin:12px 0">
<h3 style="margin:0 0 10px">${ui.oauthLinuxDoSettings}</h3>
<p class="text-xs text-m">${ui.envPanelHint}</p>
<div class="form-row">
<div class="form-g"><label>${ui.enabled}</label><select name="linuxdo_oauth_enabled" class="input"><option value="false"${settings.linuxdo_oauth_enabled !== 'true' ? ' selected' : ''}>No</option><option value="true"${settings.linuxdo_oauth_enabled === 'true' ? ' selected' : ''}>Yes</option></select></div>
<div class="form-g"><label>${ui.oauthClientID}</label><input name="linuxdo_oauth_client_id" class="input" value="${escape(settings.linuxdo_oauth_client_id || '')}" placeholder="Client ID"></div>
<div class="form-g"><label>${ui.oauthClientSecret}</label><input name="linuxdo_oauth_client_secret" type="password" class="input" value="${escape(settings.linuxdo_oauth_client_secret || '')}" placeholder="Client Secret"></div>
</div>
<p class="text-xs text-m" style="margin-top:-4px">LinuxDo 登录端点使用系统默认，不在页面显示。</p>
<button type="submit" class="btn btn-p">${t.save}</button>
</form></div></div>

<div id="t-notices" class="${paneClass('notices')}"><div class="card"><div class="flex jc-b items-c mb-4"><h2>${ui.noticeManage}</h2><button class="btn btn-p btn-s" onclick="showNM()">${ui.publishNotice}</button></div><table class="table"><thead><tr><th>ID</th><th>${ui.noticeTitle}</th><th>${ui.noticeContent}</th><th>${ui.status}</th><th>${ui.time}</th><th>${t.actions}</th></tr></thead><tbody id="ntb"></tbody></table></div></div>

<div id="t-users" class="${paneClass('users')}"><div class="card"><h2>${t.users}</h2><table class="table"><thead><tr><th>ID</th><th>${t.email}</th><th>${ui.role}</th><th>${ui.usage}</th><th>${ui.limit}</th><th>${t.actions}</th></tr></thead><tbody id="utb"></tbody></table></div></div>

<div id="t-requests" class="${paneClass('requests')}"><div class="card"><div class="flex jc-b items-c mb-4"><h2>${ui.adminRequests}</h2><button class="btn btn-s" onclick="loadReq()">${t.syncModels || 'Refresh'}</button></div><table class="table"><thead><tr><th>ID</th><th>${t.email}</th><th>${ui.status}</th><th>${ui.requestPoints}</th><th>${ui.requestText}</th><th>${ui.image}</th><th>${ui.time}</th><th>${t.actions}</th></tr></thead><tbody id="rtb"></tbody></table></div></div>

<div id="t-apis" class="${paneClass('apis')}"><div class="card"><div class="flex jc-b items-c mb-4"><h2>${t.apiConfigs}</h2><button class="btn btn-p btn-s" onclick="showAM()">+ ${t.add}</button></div><table class="table"><thead><tr><th>ID</th><th>${t.name}</th><th>${lang.startsWith('zh') ? '格式' : 'Format'}</th><th>${t.baseUrl}</th><th>#</th><th>${t.enabled}</th><th></th></tr></thead><tbody id="atb"></tbody></table></div></div>

<div id="t-models" class="${paneClass('models')}"><div class="card"><div class="flex jc-b items-c mb-4"><h2>${t.models}</h2><div class="flex gap-2"><button class="btn btn-s" onclick="batchModelAction('check')">${t.checkModels || 'Check'}</button><button class="btn btn-s" onclick="batchModelAction('enable')">${t.batchEnable || 'Enable'}</button><button class="btn btn-s" onclick="batchModelAction('disable')">${t.batchDisable || 'Disable'}</button><button class="btn btn-s" onclick="batchModelAction('pricing')">${lang.startsWith('zh') ? '批量改价' : 'Batch Pricing'}</button></div></div><div class="form-g"><label>${lang.startsWith('zh') ? '按API筛选' : 'Filter by API'}</label><select id="mf" class="input" onchange="renderM()"></select></div><table class="table"><thead><tr><th><input type="checkbox" onchange="toggleAllModels(this)"></th><th>ID</th><th>${t.displayName || 'Name'}</th><th>${ui.billing || 'Billing'}</th><th>${ui.endpoint}</th><th>${t.enabled}</th><th></th></tr></thead><tbody id="mtb"></tbody></table></div></div>

<div id="t-data" class="${paneClass('data')}"><div class="card"><h2 class="mb-4">📤 ${t.exportData || 'Export Data'}</h2><p class="text-m mb-4">${ui.exportFull}</p><button class="btn btn-p" onclick="exportData()">📥 ${lang.startsWith('zh') ? '导出全部 JSON' : (t.exportBtn || 'Export JSON')}</button></div><div class="card"><h2 class="mb-4">📥 ${t.importData || 'Import Data'}</h2><p class="text-m mb-4">${ui.importFull}</p><div class="form-g"><label>${t.importMode || 'Import mode'}</label><select id="importMode" class="input"><option value="merge">${t.mergeData || 'Merge (keep existing, add new)'}</option><option value="replace">${t.replaceData || 'Replace (overwrite existing)'}</option></select></div><div class="form-g"><label>${t.selectFile || 'Select file'}</label><input type="file" id="importFile" accept=".json" class="input"></div><button class="btn btn-p" onclick="importData()">📤 ${lang.startsWith('zh') ? '导入全部 JSON' : (t.importBtn || 'Import')}</button></div></div>

<div id="modal" class="modal"><div class="modal-box"><h3 id="mt"></h3><form id="mf2"></form></div></div>
<div id="reqModal" class="modal"><div class="modal-box" style="width:min(760px,96vw)"><h3 style="margin-top:0">${ui.adminRequests}</h3><div class="form-row"><div class="form-g"><label>ID</label><input id="reqId" class="input" readonly></div><div class="form-g"><label>${t.email}</label><input id="reqEmail" class="input" readonly></div><div class="form-g"><label>${ui.status}</label><input id="reqStatus" class="input" readonly></div></div><div class="form-row"><div class="form-g"><label>${ui.requestPoints}</label><input id="reqRequested" class="input" readonly></div><div class="form-g"><label>${ui.approved}</label><input id="reqApproved" class="input" type="number" min="0"></div></div><div class="form-g"><label>${ui.requestText}</label><div id="reqMessage" class="req-detail"></div></div><div class="form-g" id="reqImageWrap"><label>${ui.image}</label><a id="reqImageLink" target="_blank" rel="noreferrer"><img id="reqImage" class="req-thumb" alt="request image"></a></div><div class="form-g"><label>${ui.note}</label><textarea id="reqNote" class="input" rows="3"></textarea></div><div class="flex gap-2"><button class="btn btn-p" id="reqApproveBtn" type="button">${ui.approve}</button><button class="btn btn-d" id="reqRejectBtn" type="button">${ui.reject}</button><button class="btn" type="button" onclick="closeReqModal()">${t.cancel}</button></div></div></div>
</div>

<script>const L=${JSON.stringify(t)};const UI=${JSON.stringify(ui)};const ACTIVE=${JSON.stringify(active)};const ZH=${lang.startsWith('zh') ? 'true' : 'false'};let apis=[],models=[],users=[],reqs=[],notices=[],pointsPerUSD=10000,tokenUnitsPerUSD=10000,defaultUserLimitUnits=0,currentReqId=null;
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function showUser(v){const s=String(v||'').trim();const suffix='@linuxdo.oauth';if(s.startsWith('linuxdo_')&&s.endsWith(suffix)){const x=s.slice(8,-suffix.length).trim();return x||s}return s}
function toast(m,t='success'){const d=document.createElement('div');d.className='toast '+t;d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),3000)}
function hideM(){document.getElementById('modal').classList.remove('show')}
async function uploadSiteIcon(){const f=document.getElementById('siteIconFile');const file=f?.files?.[0];if(!file){toast(UI.selectImageFirst,'error');return}const fd=new FormData();fd.append('file',file);const btn=document.getElementById('uploadIconBtn');if(btn)btn.disabled=true;try{const r=await fetch('/api/admin/site-images',{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||UI.saveFailed,'error');return}let icon=document.querySelector('link[rel=\"icon\"]');if(!icon){icon=document.createElement('link');icon.setAttribute('rel','icon');document.head.appendChild(icon)}icon.setAttribute('href',String(j.url||''));toast(UI.uploadSuccess||L.success)}catch(e){toast(e.message,'error')}finally{if(btn)btn.disabled=false}}
function unitsToPoints(units){const u=Number(units);if(!Number.isFinite(u))return 0;if(u<0)return -1;return Number(((u/tokenUnitsPerUSD)*pointsPerUSD).toFixed(2))}
function statusText(s){if(s==='approved')return UI.approved;if(s==='rejected')return UI.rejected;return UI.pending}
function fmtTime(ts){const n=Number(ts||0);if(!n)return '-';return new Date(n*1000).toLocaleString()}
function closeReqModal(){document.getElementById('reqModal').classList.remove('show');currentReqId=null}
function openReqModal(id){const x=reqs.find(v=>Number(v.id)===Number(id));if(!x)return;currentReqId=Number(id);document.getElementById('reqId').value=String(x.id);document.getElementById('reqEmail').value=showUser(x.user_email||'-');document.getElementById('reqStatus').value=statusText(x.status);document.getElementById('reqRequested').value=String(Number(x.requested_points||0));document.getElementById('reqApproved').value=String(Number(x.requested_points||0));document.getElementById('reqMessage').textContent=x.message_text||'-';document.getElementById('reqNote').value=x.admin_note||'';const hasImage=!!x.image_url;const wrap=document.getElementById('reqImageWrap');wrap.classList.toggle('hidden',!hasImage);if(hasImage){document.getElementById('reqImage').src=x.image_url;document.getElementById('reqImageLink').href=x.image_url;}const pending=x.status==='pending';document.getElementById('reqApproveBtn').disabled=!pending;document.getElementById('reqRejectBtn').disabled=!pending;document.getElementById('reqModal').classList.add('show')}
async function submitReqReview(action){if(!currentReqId)return;const approved=Math.max(0,Math.round(Number(document.getElementById('reqApproved').value||0)));const note=String(document.getElementById('reqNote').value||'').trim();const body={id:currentReqId,action,admin_note:note};if(action==='approve')body.approved_points=approved;const r=await fetch('/api/admin/quota-requests',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}toast(L.success);closeReqModal();loadReq();loadU()}
document.getElementById('reqApproveBtn').onclick=()=>submitReqReview('approve');document.getElementById('reqRejectBtn').onclick=()=>submitReqReview('reject');

async function loadU(){try{const r=await(await fetch('/api/admin/users')).json();users=r.users||[];pointsPerUSD=Math.max(1,Number(r.points_per_usd)||pointsPerUSD);tokenUnitsPerUSD=Math.max(1,Number(r.token_units_per_usd)||tokenUnitsPerUSD);const d=Number(r.default_user_limit_units);if(Number.isFinite(d))defaultUserLimitUnits=d;document.getElementById('utb').innerHTML=users.map(u=>{const used=unitsToPoints(Number(u.tokens_used||0));const limitUnits=Number.isFinite(Number(u.quota_limit_units))?Number(u.quota_limit_units):defaultUserLimitUnits;const limitPoints=unitsToPoints(limitUnits);const limitText=limitPoints<0?L.unlimited:limitPoints.toFixed(2);return'<tr><td>'+u.id+'</td><td>'+esc(showUser(u.email))+'</td><td><select class=\"input\" id=\"role-'+u.id+'\"><option value=\"2\"'+(u.group_id===2?' selected':'')+'>'+UI.userRole+'</option><option value=\"1\"'+(u.group_id===1?' selected':'')+'>'+UI.adminRole+'</option></select></td><td>'+used.toFixed(2)+' '+UI.points+'</td><td><input class=\"input\" id=\"limit-'+u.id+'\" value=\"'+limitText+'\" placeholder=\"-1\"></td><td><button class=\"btn btn-s\" onclick=\"saveU('+u.id+')\">'+UI.saveUser+'</button> '+(u.group_id!==1?'<button class=\"btn btn-s btn-d\" onclick=\"delU('+u.id+')\">✕</button>':'')+'</td></tr>'}).join('')}catch(e){toast(e.message,'error')}}
async function saveU(id){const role=Number(document.getElementById('role-'+id).value||2);const limitPoints=Number(String(document.getElementById('limit-'+id).value||'').trim());if(!Number.isFinite(limitPoints)){toast('Invalid limit','error');return}const payload={id,group_id:role,quota_limit_points:limitPoints};const r=await fetch('/api/admin/users',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}toast(L.success);loadU()}
async function delU(id){if(!confirm(L.confirm))return;const r=await fetch('/api/admin/users',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}loadU()}

async function loadReq(){try{const r=await(await fetch('/api/admin/quota-requests')).json();reqs=r.requests||[];document.getElementById('rtb').innerHTML=reqs.map(x=>{const pending=x.status==='pending';const msg=esc(String(x.message_text||'').slice(0,120));const image=x.image_url?'<a href=\"'+x.image_url+'\" target=\"_blank\" rel=\"noreferrer\"><img class=\"req-thumb\" src=\"'+x.image_url+'\" alt=\"img\"></a>':'-';const actions=pending?'<button class=\"btn btn-s btn-p\" onclick=\"openReqModal('+x.id+')\">'+(ZH?'审批':'Review')+'</button>':'<span class=\"text-m\">-</span>';return'<tr><td>'+x.id+'</td><td>'+esc(showUser(x.user_email||'-'))+'</td><td>'+esc(statusText(x.status))+'</td><td>'+Number(x.requested_points||0)+'</td><td><div class=\"text-s\">'+msg+'</div>'+(x.admin_note?'<div class=\"text-xs text-m\" style=\"margin-top:4px\">'+esc(x.admin_note)+'</div>':'')+'</td><td>'+image+'</td><td>'+esc(fmtTime(x.created_at))+'</td><td>'+actions+'</td></tr>'}).join('')||'<tr><td colspan=\"8\" class=\"text-m\">-</td></tr>'}catch(e){toast(e.message,'error')}}

async function loadN(){try{const r=await(await fetch('/api/admin/notices')).json();notices=(r.notices||[]).map(n=>({...n,enabled:Number(n.enabled)===1}));document.getElementById('ntb').innerHTML=notices.map(n=>{const title=esc(n.title||'-');const content=esc(String(n.content||'').slice(0,120));const st=n.enabled?UI.enabled:UI.disabled;const id=Number(n.id);return'<tr><td>'+id+'</td><td>'+title+'</td><td>'+content+'</td><td>'+st+'</td><td>'+esc(fmtTime(n.updated_at||n.created_at))+'</td><td><button class=\"btn btn-s\" onclick=\"editN('+id+')\">✎</button> <button class=\"btn btn-s\" onclick=\"toggleN('+id+','+(n.enabled?0:1)+')\">'+(n.enabled?(ZH?'下线':'Disable'):(ZH?'上线':'Enable'))+'</button> <button class=\"btn btn-s btn-d\" onclick=\"delN('+id+')\">✕</button></td></tr>'}).join('')||'<tr><td colspan=\"6\" class=\"text-m\">'+UI.noNotices+'</td></tr>'}catch(e){toast(e.message,'error')}}
function showNM(n){const en=n?Number(n?.enabled)===1:true;document.getElementById('mt').textContent=n?UI.editNotice:UI.publishNotice;document.getElementById('mf2').innerHTML='<input type=\"hidden\" name=\"id\" value=\"'+(n?.id||'')+'\"><div class=\"form-g\"><label>'+UI.noticeTitle+'</label><input name=\"title\" class=\"input\" value=\"'+esc(n?.title||'')+'\" maxlength=\"120\"></div><div class=\"form-g\"><label>'+UI.noticeContent+'</label><textarea name=\"content\" class=\"input\" rows=\"6\" required>'+esc(n?.content||'')+'</textarea></div><div class=\"form-g\"><label>'+UI.status+'</label><select name=\"enabled\" class=\"input\"><option value=\"1\"'+(en?' selected':'')+'>'+UI.enabled+'</option><option value=\"0\"'+(!en?' selected':'')+'>'+UI.disabled+'</option></select></div><div class=\"flex gap-2\"><button type=\"submit\" class=\"btn btn-p\">'+L.save+'</button><button type=\"button\" class=\"btn\" onclick=\"hideM()\">'+L.cancel+'</button></div>';document.getElementById('mf2').onsubmit=saveN;document.getElementById('modal').classList.add('show')}
function editN(id){showNM(notices.find(x=>Number(x.id)===Number(id)))}
async function saveN(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.enabled=Number(d.enabled)?1:0;if(!String(d.content||'').trim()){toast('Notice content required','error');return}const m=d.id?'PUT':'POST';if(d.id)d.id=Number(d.id);else delete d.id;const r=await fetch('/api/admin/notices',{method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}hideM();loadN();toast(L.success)}
async function delN(id){const nid=Number(id);if(!Number.isFinite(nid)){toast('Invalid notice id','error');return}if(!confirm(L.confirm))return;const r=await fetch('/api/admin/notices',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:nid})});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}loadN();toast(L.success)}
async function toggleN(id,enabled){const nid=Number(id);if(!Number.isFinite(nid)){toast('Invalid notice id','error');return}const r=await fetch('/api/admin/notices',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:nid,enabled:Number(enabled)?1:0})});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}loadN()}

async function loadA(){try{const r=await(await fetch('/api/admin/apis')).json();apis=r.configs||[];models=r.models||[];const mc={};models.forEach(m=>mc[m.api_config_id]=(mc[m.api_config_id]||0)+1);document.getElementById('atb').innerHTML=apis.map(c=>'<tr><td>'+c.id+'</td><td>'+esc(c.name)+'</td><td>'+esc((c.api_format||'openai').toUpperCase())+'</td><td>'+esc(c.base_url)+'</td><td>'+(mc[c.id]||0)+'</td><td>'+(c.enabled?'✓':'✗')+'</td><td><button class=\"btn btn-s\" onclick=\"editA('+c.id+')\">✎</button> <button class=\"btn btn-s btn-p\" onclick=\"syncA('+c.id+')\">↻</button> <button class=\"btn btn-s btn-d\" onclick=\"delA('+c.id+')\">✕</button></td></tr>').join('')}catch(e){toast(e.message,'error')}}
function showAM(c){let keys=[];try{const p=JSON.parse(c?.api_keys||'[]');if(Array.isArray(p))keys=p}catch{}if(!keys.length&&c?.api_key)keys=[c.api_key];document.getElementById('mt').textContent=(c?L.edit:L.add)+' API';document.getElementById('mf2').innerHTML='<input type=\"hidden\" name=\"id\" value=\"'+(c?.id||'')+'\"><div class=\"form-g\"><label>'+L.name+'</label><input name=\"name\" class=\"input\" value=\"'+(c?.name||'')+'\" required></div><div class=\"form-row\"><div class=\"form-g\"><label>'+(ZH?'格式':'Format')+'</label><select name=\"api_format\" class=\"input\"><option value=\"openai\"'+((c?.api_format||'openai')==='openai'?' selected':'')+'>openai</option><option value=\"claude\"'+(c?.api_format==='claude'?' selected':'')+'>claude</option><option value=\"gemini\"'+(c?.api_format==='gemini'?' selected':'')+'>gemini</option></select></div><div class=\"form-g\"><label>'+L.baseUrl+'</label><input name=\"base_url\" class=\"input\" value=\"'+(c?.base_url||'')+'\" required></div></div><div class=\"form-g\"><label>'+(ZH?'API Keys（每行一个）':'API Keys (one per line)')+'</label><textarea name=\"api_keys\" class=\"input\" rows=\"4\" required>'+keys.join('\\n')+'</textarea></div><div class=\"form-g\"><label>'+L.enabled+'</label><select name=\"enabled\" class=\"input\"><option value=\"1\"'+(c?.enabled!==0?' selected':'')+'>Yes</option><option value=\"0\"'+(c?.enabled===0?' selected':'')+'>No</option></select></div><div class=\"form-g\"><label>'+L.priority+'</label><input name=\"priority\" type=\"number\" class=\"input\" value=\"'+(c?.priority||0)+'\"></div><div class=\"flex gap-2\"><button type=\"submit\" class=\"btn btn-p\">'+L.save+'</button><button type=\"button\" class=\"btn\" onclick=\"hideM()\">'+L.cancel+'</button></div>';document.getElementById('mf2').onsubmit=saveA;document.getElementById('modal').classList.add('show')}
function editA(id){showAM(apis.find(x=>x.id===id))}
async function saveA(e){e.preventDefault();const f=new FormData(e.target);const d=Object.fromEntries(f);d.enabled=+d.enabled;d.priority=+d.priority||0;d.api_format=String(d.api_format||'openai');d.api_keys=String(d.api_keys||'');if(!d.api_keys.trim()){toast(ZH?'请填写 API Keys':'API keys required','error');return}const m=d.id?'PUT':'POST';if(d.id)d.id=+d.id;else delete d.id;const r=await fetch('/api/admin/apis',{method:m,headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||'Error','error');return}hideM();await loadA();const targetId=Number(j.id)||Number(d.id)||Number((apis.find(x=>x.name===d.name&&x.base_url===d.base_url)||{}).id||0);if(targetId){await fetch('/api/admin/sync-models',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_id:targetId})});await loadM()}toast(L.success)}
async function syncA(id){const btn=event.target;btn.disabled=true;try{const r=await fetch('/api/admin/sync-models',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_id:id})});const d=await r.json();if(d.success){toast(L.success+': '+d.count);loadA();loadM()}else toast(d.error,'error')}finally{btn.disabled=false}}
async function delA(id){if(!confirm(L.confirm))return;await fetch('/api/admin/apis',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});loadA();loadM()}

async function apiJSON(url,opts){const r=await fetch(url,opts);const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw new Error(j.error||('HTTP '+r.status));return j}
function getFilteredModels(){const fv=document.getElementById('mf').value;return fv?models.filter(m=>String(m.api_config_id)===String(fv)):models}
async function loadM(){try{const r=await apiJSON('/api/admin/models');models=r.models||[];const cfgs=r.configs||[];const oldFilter=(document.getElementById('mf')||{}).value||'';document.getElementById('mf').innerHTML='<option value=\"\">All APIs</option>'+cfgs.map(c=>'<option value=\"'+c.id+'\">'+esc(c.name)+'</option>').join('');if(oldFilter&&cfgs.some(c=>String(c.id)===String(oldFilter)))document.getElementById('mf').value=oldFilter;window._cfgs=cfgs;renderM()}catch(e){toast(e.message,'error')}}
function renderM(){const cfgs=window._cfgs||[];const filtered=getFilteredModels();const bill=(m)=>{const mode=(m.pricing_mode||'usage')==='request'?'request':'usage';const p=mode==='request'?Number(m.price_per_request||0):Number(m.price_per_1k_tokens||0);const unitBase=Math.ceil(Math.max(0,p)*Math.max(1,Number(tokenUnitsPerUSD)||10000));const s=mode==='request'?(ZH?'次':'req'):'1k';return unitBase+' '+UI.points+'/'+s};document.getElementById('mtb').innerHTML=filtered.map(m=>{const cfg=cfgs.find(c=>c.id===m.api_config_id);const mid=JSON.stringify(String(m.model_id||''));return'<tr><td><input type=\"checkbox\" class=\"m-check\" value=\"'+esc(m.model_id)+'\"></td><td style=\"max-width:160px;overflow:hidden;text-overflow:ellipsis\">'+esc(m.model_id)+'</td><td>'+esc(m.display_name||'')+'</td><td>'+bill(m)+'</td><td>'+(cfg?esc(cfg.name):'—')+'</td><td>'+(m.enabled?'✓':'✗')+'</td><td><button class=\"btn btn-s\" onclick=\"editM('+mid+')\">✎</button> <button class=\"btn btn-s btn-d\" onclick=\"delM('+mid+')\">✕</button></td></tr>'}).join('')}
function toggleAllModels(el){document.querySelectorAll('.m-check').forEach(c=>c.checked=el.checked)}
function getSelectedModels(){return[...document.querySelectorAll('.m-check:checked')].map(c=>c.value)}
function getModelActionTargets(){const selected=getSelectedModels();if(selected.length)return selected;const fallback=getFilteredModels().map(m=>String(m.model_id||'')).filter(Boolean);return fallback}
async function batchModelAction(action){let ids=getModelActionTargets();if(!ids.length){toast(ZH?'没有可操作的模型':'No models to operate','error');return}if(!getSelectedModels().length){const ok=confirm((ZH?'未勾选模型，将对当前筛选全部模型执行。数量：':'No model selected. Apply to all filtered models. Count: ')+ids.length);if(!ok)return}try{if(action==='check'){const d=await apiJSON('/api/admin/check-models',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model_ids:ids})});if(d.results){let ok=0;d.results.forEach(x=>x.status==='success'&&ok++);toast('Results: '+ok+' OK, '+(d.results.length-ok)+' Failed');loadM()}else toast(d.error,'error')}else if(action==='enable'||action==='disable'){const enabled=action==='enable'?1:0;for(const model_id of ids){const m=models.find(x=>x.model_id===model_id);if(m)await apiJSON('/api/admin/models',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({model_id,api_config_id:m.api_config_id,enabled})})}toast(L.success);loadM()}else if(action==='pricing'){const mode=prompt(ZH?'输入计费模式（usage 或 request）':'Pricing mode (usage or request)');if(!mode)return;const m0=String(mode).toLowerCase().trim();if(!['usage','request'].includes(m0)){toast('Invalid mode','error');return}const val=prompt(ZH?'输入价格（USD）':'Price in USD');if(val===null||val==='')return;const p=Number(val);if(!Number.isFinite(p)||p<0){toast('Invalid price','error');return}for(const model_id of ids){const m=models.find(x=>x.model_id===model_id);if(m)await apiJSON('/api/admin/models',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({model_id,api_config_id:m.api_config_id,pricing_mode:m0,price_usd:p,multiplier:1})})}toast(L.success);loadM()}}catch(e){toast(e.message,'error')}}
function editM(id){const m=models.find(x=>x.model_id===id);if(!m)return;const p=(m.pricing_mode||'usage')==='request'?Number(m.price_per_request||0):Number(m.price_per_1k_tokens||0);document.getElementById('mt').textContent=L.edit;document.getElementById('mf2').innerHTML='<input type=\"hidden\" name=\"model_id\" value=\"'+m.model_id+'\"><input type=\"hidden\" name=\"api_config_id\" value=\"'+(m.api_config_id||'')+'\"><div class=\"form-g\"><label>ID</label><input class=\"input\" value=\"'+m.model_id+'\" disabled></div><div class=\"form-row\"><div class=\"form-g\"><label>'+L.displayName+'</label><input name=\"display_name\" class=\"input\" value=\"'+(m.display_name||'')+'\"></div><div class=\"form-g\"><label>'+L.icon+'</label><input name=\"icon\" class=\"input\" value=\"'+(m.icon||'🤖')+'\"></div></div><div class=\"form-g\"><label>'+(ZH?'上游模型ID':'Upstream Model ID')+'</label><input name=\"upstream_model_id\" class=\"input\" value=\"'+(m.upstream_model_id||m.model_id)+'\"></div><div class=\"form-row\"><div class=\"form-g\"><label>'+(ZH?'计费模式':'Billing Mode')+'</label><select name=\"pricing_mode\" class=\"input\"><option value=\"usage\"'+((m.pricing_mode||'usage')!=='request'?' selected':'')+'>usage</option><option value=\"request\"'+((m.pricing_mode||'usage')==='request'?' selected':'')+'>request</option></select></div><div class=\"form-g\"><label>'+L.enabled+'</label><select name=\"enabled\" class=\"input\"><option value=\"1\"'+(m.enabled!==0?' selected':'')+'>Yes</option><option value=\"0\"'+(m.enabled===0?' selected':'')+'>No</option></select></div></div><div class=\"form-g\"><label>'+(ZH?'价格（USD）':'Price (USD)')+'</label><input name=\"price_usd\" type=\"number\" step=\"0.000001\" min=\"0\" class=\"input\" value=\"'+p+'\"></div><div class=\"flex gap-2\"><button type=\"submit\" class=\"btn btn-p\">'+L.save+'</button><button type=\"button\" class=\"btn\" onclick=\"hideM()\">'+L.cancel+'</button></div>';document.getElementById('mf2').onsubmit=async e=>{e.preventDefault();try{const f=new FormData(e.target);const d=Object.fromEntries(f);d.enabled=+d.enabled;d.api_config_id=d.api_config_id?+d.api_config_id:null;d.pricing_mode=d.pricing_mode==='request'?'request':'usage';d.price_usd=Math.max(0,Number(d.price_usd)||0);d.multiplier=1;await apiJSON('/api/admin/models',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});hideM();loadM();toast(L.success)}catch(err){toast(err.message,'error')}};document.getElementById('modal').classList.add('show')}
async function delM(id){if(!confirm(L.confirm))return;try{await apiJSON('/api/admin/models',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({model_id:id})});loadM()}catch(e){toast(e.message,'error')}}

async function exportData(){const types=['users','groups','apis','models','settings','oauth_accounts','quota_requests','notices','recharge_orders'];try{const r=await fetch('/api/admin/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({types})});const d=await r.json();if(d.error){toast(d.error,'error');return}const blob=new Blob([JSON.stringify(d.data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='export_all_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);toast(L.success)}catch(e){toast(e.message,'error')}}
async function importData(){const file=document.getElementById('importFile').files[0];if(!file){toast('Select a file','error');return}const mode=document.getElementById('importMode').value;try{const text=await file.text();const data=JSON.parse(text);const r=await fetch('/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,mode})});const d=await r.json();if(d.success){toast(L.success+': '+JSON.stringify(d.stats));loadU();loadReq();loadN();loadA();loadM()}else toast(d.error,'error')}catch(e){toast('Invalid JSON file','error')}}

document.getElementById('sf').onsubmit=async e=>{e.preventDefault();const r=await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});const j=await r.json().catch(()=>({}));if(!r.ok||j.error){toast(j.error||UI.saveFailed,'error');return}toast(L.success)};
const uploadIconBtn=document.getElementById('uploadIconBtn');if(uploadIconBtn)uploadIconBtn.onclick=uploadSiteIcon;
document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')hideM()};
document.getElementById('reqModal').onclick=e=>{if(e.target.id==='reqModal')closeReqModal()};

if(['users','requests','notices','settings','apis','models','data'].includes(ACTIVE)){loadU();loadReq();loadN();loadA();loadM();}
</script>`, { title: t.admin, user, settings, lang });
    }
};
