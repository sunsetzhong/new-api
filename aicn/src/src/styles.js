export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap');
*{box-sizing:border-box}
:root{
--bg:#eef2f6;
--bg-soft:#f8fafc;
--card:#ffffff;
--card-2:rgba(255,255,255,.78);
--text:#0f172a;
--muted:#475569;
--line:#dbe2ea;
--primary:#0f766e;
--primary-hover:#0d9488;
--danger:#dc2626;
--ok:#16a34a;
--shadow:0 20px 44px rgba(15,23,42,.08);
--shadow-soft:0 10px 24px rgba(15,23,42,.05);
}
html.dark{
--bg:#0b1322;
--bg-soft:#121d33;
--card:#0f1a2f;
--card-2:rgba(15,26,47,.78);
--text:#ecf2ff;
--muted:#99a9c2;
--line:#26344f;
--primary:#2dd4bf;
--primary-hover:#5eead4;
--danger:#f87171;
--ok:#34d399;
--shadow:0 24px 50px rgba(0,0,0,.35);
--shadow-soft:0 12px 26px rgba(0,0,0,.22);
}
html,body{height:100%}
body{
margin:0;
font:14px/1.6 "Plus Jakarta Sans","Noto Sans SC","PingFang SC","Microsoft YaHei",-apple-system,sans-serif;
background:radial-gradient(1200px 620px at 2% -10%,#d9f3ea 0%,transparent 65%),radial-gradient(900px 580px at 98% 0%,#fce8cd 0%,transparent 56%),var(--bg);
color:var(--text);
}
html.dark body{
background:radial-gradient(1000px 620px at 0% -10%,#153047 0%,transparent 60%),radial-gradient(900px 600px at 100% 0%,#3b2b1f 0%,transparent 56%),var(--bg);
}
a{color:var(--primary);text-decoration:none;font-weight:600}
a:hover{opacity:.92}
.container{max-width:1160px;margin:0 auto;padding:20px}
.nav{
position:sticky;top:0;z-index:40;
backdrop-filter:blur(12px);
background:var(--card-2);
border-bottom:1px solid color-mix(in srgb,var(--line) 88%,transparent);
box-shadow:var(--shadow-soft);
}
.nav .container{max-width:none;width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 20px}
.logo{font-size:18px;font-weight:800;letter-spacing:.01em;color:var(--text)}
.nav-r{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.card{
background:var(--card-2);
backdrop-filter:blur(6px);
border:1px solid color-mix(in srgb,var(--line) 92%,transparent);
border-radius:18px;
padding:20px;
margin-bottom:14px;
box-shadow:var(--shadow);
}
.btn{
border:1px solid var(--line);
background:var(--card);
color:var(--text);
padding:9px 14px;
border-radius:12px;
cursor:pointer;
font-weight:700;
letter-spacing:.01em;
transition:all .18s ease;
}
.btn:hover{transform:translateY(-1px);border-color:var(--primary);box-shadow:var(--shadow-soft)}
.btn:active{transform:translateY(0)}
.btn-p{background:var(--primary);border-color:var(--primary);color:#fff}
.btn-p:hover{background:var(--primary-hover);border-color:var(--primary-hover)}
.btn-d{background:var(--danger);border-color:var(--danger);color:#fff}
.btn-s{padding:7px 11px;font-size:12px;border-radius:10px}
.input{
width:100%;
border:1px solid var(--line);
background:var(--card);
color:var(--text);
border-radius:12px;
padding:10px 12px;
outline:none;
transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;
}
.input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 20%,transparent)}
.form-g{margin-bottom:12px}
.form-g label{display:block;margin-bottom:6px;color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.01em}
.auth-form .btn,.auth-oauth-btn{display:block;width:100%;text-align:center}
.auth-submit{margin-top:8px}
.oauth-entry{margin-top:12px;clear:both}
.cf-turnstile{display:block;clear:both;margin:10px 0 12px;overflow:hidden}
.cf-turnstile > div{max-width:100%}
.form-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.table{
width:100%;
border-collapse:separate;
border-spacing:0;
border:1px solid var(--line);
border-radius:14px;
overflow:hidden;
background:var(--card);
}
.table th,.table td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.table th{
font-size:11px;color:var(--muted);
background:color-mix(in srgb,var(--bg-soft) 86%,var(--card));
text-transform:uppercase;letter-spacing:.08em;font-weight:800
}
.table tr:last-child td{border-bottom:none}
.text-m{color:var(--muted)}
.text-s{font-size:13px}
.text-xs{font-size:12px}
.text-c{text-align:center}
.text-m-light{color:var(--muted)}
.flex{display:flex}
.flex-1{flex:1}
.flex-wrap{flex-wrap:wrap}
.grid{display:grid}
.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.gap-1{gap:4px}
.gap-2{gap:8px}
.gap-3{gap:12px}
.items-c{align-items:center}
.jc-b{justify-content:space-between}
.jc-c{justify-content:center}
.hidden{display:none!important}
.mb-2{margin-bottom:8px}
.mb-4{margin-bottom:16px}
.mt-2{margin-top:8px}
.pill{
display:inline-block;
border:1px solid color-mix(in srgb,var(--primary) 24%,var(--line));
background:color-mix(in srgb,var(--card) 88%,var(--bg-soft));
border-radius:999px;
padding:4px 10px;
font-size:12px;
color:var(--text);
font-weight:600;
}

.chat{
display:grid;
grid-template-columns:340px minmax(0,1fr);
gap:18px;
min-height:calc(100vh - 78px);
padding:20px;
max-width:1540px;
margin:0 auto;
}
.chat-side{
background:linear-gradient(160deg,color-mix(in srgb,var(--card) 82%,var(--bg-soft)) 0%,var(--card) 100%);
border:1px solid color-mix(in srgb,var(--line) 85%,transparent);
border-radius:24px;
padding:14px;
display:flex;
flex-direction:column;
box-shadow:var(--shadow);
min-width:0;
}
.side-top{
display:flex;
flex-direction:column;
gap:10px;
padding-bottom:10px;
border-bottom:1px solid color-mix(in srgb,var(--line) 86%,transparent);
}
.side-brand{
padding:10px 12px;
border-radius:14px;
background:color-mix(in srgb,var(--primary) 11%,var(--card));
border:1px solid color-mix(in srgb,var(--primary) 30%,var(--line));
}
.side-brand strong{display:block;font-size:15px;letter-spacing:.02em}
.side-brand span{display:block;margin-top:2px;font-size:12px;color:var(--muted)}
.chat-main{
display:flex;
flex-direction:column;
background:linear-gradient(160deg,color-mix(in srgb,var(--card) 88%,var(--bg-soft)) 0%,var(--card) 100%);
border:1px solid color-mix(in srgb,var(--line) 85%,transparent);
border-radius:24px;
overflow:hidden;
box-shadow:var(--shadow);
min-width:0;
}
.chat-head{
padding:14px 16px;
border-bottom:1px solid var(--line);
background:linear-gradient(180deg,color-mix(in srgb,var(--bg-soft) 74%,var(--card)) 0%,color-mix(in srgb,var(--card) 95%,transparent) 100%);
display:flex;
align-items:center;
gap:10px;
justify-content:space-between;
}
.chat-head strong{font-size:16px;letter-spacing:.01em}
.chat-head-sub{margin-top:2px;font-size:12px;color:var(--muted)}
.chat-head-left{display:flex;align-items:center;gap:10px}
.chat-head-right{
margin-left:auto;
display:flex;
align-items:center;
justify-content:flex-end;
gap:10px;
min-width:0;
}
.chat-model{width:320px;min-width:220px}
.quota-card{
min-width:0;
border:1px solid color-mix(in srgb,var(--primary) 30%,var(--line));
background:linear-gradient(130deg,color-mix(in srgb,var(--primary) 12%,var(--card)) 0%,color-mix(in srgb,var(--card) 95%,transparent) 100%);
border-radius:14px;
padding:10px 12px;
}
.side-quota{
margin-top:auto;
width:100%;
}
.quota-top{
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:7px;
font-size:12px;
}
.quota-grid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:8px;
}
.quota-item span{display:block;font-size:11px;color:var(--muted)}
.quota-item b{display:block;font-size:12px;margin-top:1px}
.quota-bar{
height:6px;
border-radius:999px;
background:color-mix(in srgb,var(--line) 70%,transparent);
overflow:hidden;
margin-top:8px;
}
.quota-fill{
display:block;
height:100%;
width:0%;
border-radius:999px;
background:linear-gradient(90deg,var(--primary) 0%,var(--primary-hover) 100%);
transition:width .2s ease;
}
.quota-hero{
margin-top:10px;
display:flex;
flex-wrap:wrap;
gap:8px;
}
.chat-body{
flex:1;
overflow:auto;
padding:22px;
background:
radial-gradient(650px 260px at 0% 0%,color-mix(in srgb,var(--primary) 8%,transparent) 0%,transparent 70%),
linear-gradient(180deg,color-mix(in srgb,var(--bg-soft) 50%,transparent) 0%,transparent 100%);
}
.notice-card{
border:1px solid color-mix(in srgb,var(--primary) 34%,var(--line));
background:color-mix(in srgb,var(--primary) 12%,var(--card));
border-radius:14px;
padding:10px 12px;
margin-bottom:12px;
}
.notice-title{
font-weight:800;
font-size:13px;
margin-bottom:4px;
}
.chat-input{
border-top:1px solid var(--line);
background:color-mix(in srgb,var(--card) 84%,var(--bg-soft));
padding:14px;
}
.chat-input .input{min-height:52px}
.msg{display:flex;margin-bottom:14px}
.msg.user{justify-content:flex-end}
.bubble{
max-width:min(860px,84%);
padding:12px 14px;
border-radius:15px;
border:1px solid var(--line);
background:var(--card);
box-shadow:var(--shadow-soft);
}
.msg.user .bubble{
background:linear-gradient(135deg,var(--primary) 0%,var(--primary-hover) 100%);
border-color:transparent;
color:#fff;
}
#welcome.card{
background:linear-gradient(125deg,color-mix(in srgb,var(--primary) 14%,var(--card)) 0%,var(--card) 58%);
border-color:color-mix(in srgb,var(--primary) 35%,var(--line));
}
.hist{
padding:9px 11px;
border:1px solid var(--line);
border-radius:12px;
cursor:pointer;
margin-bottom:8px;
background:var(--card);
transition:all .16s ease;
}
.hist:hover{transform:translateY(-1px);border-color:var(--primary)}
.hist.active{
border-color:var(--primary);
background:color-mix(in srgb,var(--primary) 14%,var(--card));
}
.hist-list{margin-top:12px;overflow:auto;padding-right:2px}
.hist-row{
display:flex;
align-items:center;
gap:8px;
border:1px solid color-mix(in srgb,var(--line) 90%,transparent);
border-radius:14px;
background:color-mix(in srgb,var(--card) 90%,transparent);
margin-bottom:8px;
padding:4px;
transition:all .16s ease;
}
.hist-row:hover{transform:translateY(-1px);border-color:var(--primary)}
.hist-row.active{
border-color:var(--primary);
background:color-mix(in srgb,var(--primary) 14%,var(--card));
}
.hist-title{
flex:1;
text-align:left;
border:none;
background:transparent;
color:var(--text);
padding:9px 10px;
border-radius:10px;
cursor:pointer;
font-weight:600;
}
.hist-del{
width:30px;
height:30px;
border:1px solid var(--line);
border-radius:10px;
background:var(--card);
color:var(--muted);
cursor:pointer;
font-weight:700;
}
.hist-del:hover{
color:#fff;
background:var(--danger);
border-color:var(--danger);
}
.tabs{
display:flex;
gap:8px;
flex-wrap:wrap;
margin-bottom:14px;
}
.tab{
border:1px solid var(--line);
background:var(--card);
color:var(--text);
padding:8px 12px;
border-radius:999px;
cursor:pointer;
font-weight:700;
display:inline-flex;
align-items:center;
}
.tab.active{
background:var(--primary);
border-color:var(--primary);
color:#fff;
}
.req-thumb{
width:54px;
height:54px;
object-fit:cover;
border-radius:10px;
border:1px solid var(--line);
display:block;
}
.req-detail{
max-height:260px;
overflow:auto;
padding:10px 12px;
border:1px solid var(--line);
border-radius:12px;
background:var(--card);
white-space:pre-wrap;
word-break:break-word;
}

.modal{position:fixed;inset:0;background:rgba(2,6,23,.5);display:none;align-items:center;justify-content:center;padding:16px}
.modal.show{display:flex}
.modal-box{
width:min(620px,96vw);
max-height:88vh;
overflow:auto;
background:var(--card);
border:1px solid var(--line);
border-radius:18px;
padding:18px;
box-shadow:var(--shadow);
}

.toast{
position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
padding:10px 14px;border-radius:10px;color:#fff;z-index:120;
font-weight:700;box-shadow:var(--shadow-soft)
}
.toast.success{background:var(--ok)}
.toast.error{background:var(--danger)}

@media (max-width:1200px){
.chat-head{flex-wrap:wrap}
.chat-head-right{width:100%;justify-content:flex-end}
.chat-model{width:100%}
}
@media (max-width:900px){
.container{padding:16px}
.chat{grid-template-columns:1fr;padding:12px;min-height:calc(100vh - 72px)}
.chat-side{
position:fixed;
left:-330px;
top:72px;
bottom:10px;
z-index:60;
transition:left .2s;
width:300px;
}
.chat-side.open{left:10px}
.chat-main{width:100%}
.chat-head-right{flex-direction:column}
.chat-model{width:100%}
.bubble{max-width:94%}
}
`;

export const initTheme = `(function(){const t=localStorage.getItem('theme')||'light';document.documentElement.classList.toggle('dark',t==='dark')})()`;
