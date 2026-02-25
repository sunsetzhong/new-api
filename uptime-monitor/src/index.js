const SITES_CONFIG = [{
  name: "路线1",
  url: "https://sunsetzhong.indevs.in",
  icon: "🔍",
  timeout: 10000
},];
const CONFIG = {
  title: "🌐 网站状态监控",
  historyDays: 30,
  historyPointsPerSite: 100,
  password: "",
};
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/':
        return new Response(generateHTML(), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      case '/api/status':
        return await handleGetStatus(env);
      case '/api/check':
        return await handleManualCheck(env, request);
      case '/api/history':
        const siteName = url.searchParams.get('site');
        return await handleGetHistory(env, siteName);
      default:
        return new Response('Not Found', {
          status: 404
        })
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAllSites(env))
  }
};
async function checkAllSites(env) {
  const results = [];
  const timestamp = Date.now();
  for (const site of SITES_CONFIG) {
    const result = await checkSite(site);
    results.push(result);
    await saveHistory(env, site.name, {
      ...result,
      timestamp
    })
  }
  await env.UPTIME_KV.put('latest_status', JSON.stringify({
    timestamp,
    results
  }));
  return results
}
async function checkSite(site) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), site.timeout || 10000);
    const response = await fetch(site.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Uptime-Monitor/1.0'
      }
    });
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    return {
      name: site.name,
      url: site.url,
      icon: site.icon,
      online: response.ok || response.status < 500,
      statusCode: response.status,
      responseTime,
      error: null
    }
  } catch (error) {
    return {
      name: site.name,
      url: site.url,
      icon: site.icon,
      online: false,
      statusCode: 0,
      responseTime: Date.now() - startTime,
      error: error.message
    }
  }
}
async function saveHistory(env, siteName, data) {
  const key = `history_${siteName}`;
  let history = [];
  try {
    const existing = await env.UPTIME_KV.get(key);
    if (existing) {
      history = JSON.parse(existing)
    }
  } catch (e) {
    history = []
  }
  history.push(data);
  if (history.length > CONFIG.historyPointsPerSite) {
    history = history.slice(-CONFIG.historyPointsPerSite)
  }
  await env.UPTIME_KV.put(key, JSON.stringify(history))
}
async function getHistory(env, siteName) {
  const key = `history_${siteName}`;
  try {
    const data = await env.UPTIME_KV.get(key);
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}
async function handleGetStatus(env) {
  try {
    const data = await env.UPTIME_KV.get('latest_status');
    if (data) {
      const status = JSON.parse(data);
      for (const result of status.results) {
        const history = await getHistory(env, result.name);
        result.uptime = calculateUptime(history);
        result.avgResponseTime = calculateAvgResponseTime(history)
      }
      return new Response(JSON.stringify(status), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    const results = await checkAllSites(env);
    return new Response(JSON.stringify({
      timestamp: Date.now(),
      results
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
async function handleManualCheck(env, request) {
  if (CONFIG.password) {
    const url = new URL(request.url);
    const pwd = url.searchParams.get('password');
    if (pwd !== CONFIG.password) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
  const results = await checkAllSites(env);
  return new Response(JSON.stringify({
    timestamp: Date.now(),
    results
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
async function handleGetHistory(env, siteName) {
  if (!siteName) {
    const allHistory = {};
    for (const site of SITES_CONFIG) {
      allHistory[site.name] = await getHistory(env, site.name)
    }
    return new Response(JSON.stringify(allHistory), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  const history = await getHistory(env, siteName);
  return new Response(JSON.stringify(history), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

function calculateUptime(history) {
  if (!history || history.length === 0) return 100;
  const online = history.filter(h => h.online).length;
  return Math.round((online / history.length) * 10000) / 100
}

function calculateAvgResponseTime(history) {
  if (!history || history.length === 0) return 0;
  const onlineHistory = history.filter(h => h.online);
  if (onlineHistory.length === 0) return 0;
  const total = onlineHistory.reduce((sum, h) => sum + h.responseTime, 0);
  return Math.round(total / onlineHistory.length)
}

function generateHTML() {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport"content="width=device-width, initial-scale=1.0"><title>${CONFIG.title}</title><style>:root{--bg-primary:#0f172a;--bg-secondary:#1e293b;--bg-card:#334155;--text-primary:#f1f5f9;--text-secondary:#94a3b8;--accent:#3b82f6;--success:#22c55e;--danger:#ef4444;--warning:#f59e0b}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}header{text-align:center;margin-bottom:40px;padding:30px;background:linear-gradient(135deg,var(--bg-secondary)0%,var(--bg-card)100%);border-radius:20px;border:1px solid rgba(255,255,255,0.1)}h1{font-size:2.5rem;margin-bottom:10px;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.subtitle{color:var(--text-secondary);font-size:1.1rem}.stats-bar{display:flex;justify-content:center;gap:40px;margin-top:20px;flex-wrap:wrap}.stat-item{text-align:center}.stat-value{font-size:2rem;font-weight:bold}.stat-label{color:var(--text-secondary);font-size:0.9rem}.stat-value.online{color:var(--success)}.stat-value.offline{color:var(--danger)}.controls{display:flex;justify-content:center;gap:15px;margin-bottom:30px;flex-wrap:wrap}.btn{padding:12px 24px;border:none;border-radius:10px;cursor:pointer;font-size:1rem;font-weight:600;transition:all 0.3s ease;display:flex;align-items:center;gap:8px}.btn-primary{background:linear-gradient(135deg,var(--accent),#8b5cf6);color:white}.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(59,130,246,0.3)}.btn-secondary{background:var(--bg-card);color:var(--text-primary);border:1px solid rgba(255,255,255,0.1)}.btn:disabled{opacity:0.6;cursor:not-allowed;transform:none!important}.sites-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px}.site-card{background:var(--bg-secondary);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.1);transition:all 0.3s ease;position:relative;overflow:hidden}.site-card:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,0.3);border-color:var(--accent)}.site-card.online{border-left:4px solid var(--success)}.site-card.offline{border-left:4px solid var(--danger)}.site-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.site-info{display:flex;align-items:center;gap:12px}.site-icon{font-size:2rem;width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:var(--bg-card);border-radius:12px}.site-name{font-size:1.2rem;font-weight:600}.site-url{font-size:0.85rem;color:var(--text-secondary);word-break:break-all}.status-badge{padding:6px 16px;border-radius:20px;font-size:0.9rem;font-weight:600;display:flex;align-items:center;gap:6px}.status-badge.online{background:rgba(34,197,94,0.2);color:var(--success)}.status-badge.offline{background:rgba(239,68,68,0.2);color:var(--danger)}.pulse{width:8px;height:8px;border-radius:50%;animation:pulse 2s infinite}.pulse.online{background:var(--success)}.pulse.offline{background:var(--danger)}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}.site-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px}.stat-box{background:var(--bg-card);padding:12px;border-radius:10px;text-align:center}.stat-box-value{font-size:1.3rem;font-weight:bold;color:var(--accent)}.stat-box-label{font-size:0.75rem;color:var(--text-secondary);margin-top:4px}.history-bar{display:flex;gap:2px;height:30px;background:var(--bg-card);border-radius:8px;padding:4px;overflow:hidden}.history-point{flex:1;min-width:3px;border-radius:3px;transition:all 0.2s ease;cursor:pointer}.history-point.online{background:var(--success)}.history-point.offline{background:var(--danger)}.history-point:hover{transform:scaleY(1.2);opacity:0.8}.history-label{display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-secondary);margin-top:8px}.loading{display:flex;justify-content:center;align-items:center;padding:60px}.spinner{width:50px;height:50px;border:4px solid var(--bg-card);border-top-color:var(--accent);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.last-update{text-align:center;color:var(--text-secondary);font-size:0.9rem;margin-top:30px}.tooltip{position:fixed;background:var(--bg-card);color:var(--text-primary);padding:10px 15px;border-radius:8px;font-size:0.85rem;pointer-events:none;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);display:none}.error-msg{background:rgba(239,68,68,0.1);border:1px solid var(--danger);color:var(--danger);padding:15px;border-radius:10px;text-align:center;margin:20px 0}@media(max-width:768px){.sites-grid{grid-template-columns:1fr}h1{font-size:1.8rem}.stats-bar{gap:20px}.stat-value{font-size:1.5rem}}.refresh-indicator{position:fixed;top:20px;right:20px;background:var(--accent);color:white;padding:10px 20px;border-radius:10px;display:none;animation:fadeIn 0.3s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}</style></head><body><div class="container"><header><h1>${CONFIG.title}</h1><p class="subtitle">实时监控网站可用性和响应时间</p><div class="stats-bar"><div class="stat-item"><div class="stat-value online"id="online-count">-</div><div class="stat-label">在线</div></div><div class="stat-item"><div class="stat-value offline"id="offline-count">-</div><div class="stat-label">离线</div></div><div class="stat-item"><div class="stat-value"id="total-count"style="color: var(--accent)">-</div><div class="stat-label">总计</div></div><div class="stat-item"><div class="stat-value"id="avg-uptime"style="color: var(--success)">-</div><div class="stat-label">平均可用性</div></div></div></header><div class="controls"><button class="btn btn-primary"id="refresh-btn"onclick="refreshStatus()">🔄立即检测</button><button class="btn btn-secondary"id="auto-refresh-btn"onclick="toggleAutoRefresh()">⏱️自动刷新:关</button></div><div id="sites-container"><div class="loading"><div class="spinner"></div></div></div><div class="last-update"id="last-update"></div></div><div class="tooltip"id="tooltip"></div><div class="refresh-indicator"id="refresh-indicator">正在刷新...</div><script>let autoRefreshInterval=null;let historyData={};document.addEventListener('DOMContentLoaded',()=>{loadStatus();loadHistory()});async function loadStatus(){try{const response=await fetch('/api/status');const data=await response.json();renderStatus(data)}catch(error){showError('加载状态失败: '+error.message)}}async function loadHistory(){try{const response=await fetch('/api/history');historyData=await response.json();updateHistoryBars()}catch(error){console.error('加载历史失败:',error)}}async function refreshStatus(){const btn=document.getElementById('refresh-btn');const indicator=document.getElementById('refresh-indicator');btn.disabled=true;btn.innerHTML='⏳ 检测中...';indicator.style.display='block';try{const response=await fetch('/api/check');const data=await response.json();renderStatus(data);await loadHistory()}catch(error){showError('检测失败: '+error.message)}finally{btn.disabled=false;btn.innerHTML='🔄 立即检测';indicator.style.display='none'}}function toggleAutoRefresh(){const btn=document.getElementById('auto-refresh-btn');if(autoRefreshInterval){clearInterval(autoRefreshInterval);autoRefreshInterval=null;btn.innerHTML='⏱️ 自动刷新: 关'}else{autoRefreshInterval=setInterval(()=>{loadStatus();loadHistory()},30000);btn.innerHTML='⏱️ 自动刷新: 开 (30s)'}}function renderStatus(data){if(!data||!data.results){showError('无数据');return}const container=document.getElementById('sites-container');const results=data.results;const online=results.filter(r=>r.online).length;const offline=results.length-online;const avgUptime=results.reduce((sum,r)=>sum+(r.uptime||100),0)/results.length;document.getElementById('online-count').textContent=online;document.getElementById('offline-count').textContent=offline;document.getElementById('total-count').textContent=results.length;document.getElementById('avg-uptime').textContent=avgUptime.toFixed(1)+'%';container.innerHTML='<div class="sites-grid">'+results.map(site=>renderSiteCard(site)).join('')+'</div>';const time=new Date(data.timestamp);document.getElementById('last-update').textContent='最后更新: '+time.toLocaleString('zh-CN');updateHistoryBars()}function renderSiteCard(site){const statusClass=site.online?'online':'offline';const statusText=site.online?'在线':'离线';const responseTime=site.responseTime?site.responseTime+'ms':'-';const uptime=site.uptime!==undefined?site.uptime.toFixed(1)+'%':'-';const avgTime=site.avgResponseTime?site.avgResponseTime+'ms':'-';return\`<div class="site-card \${statusClass}"><div class="site-header"><div class="site-info"><div class="site-icon">\${site.icon||'🌐'}</div><div><div class="site-name">\${site.name}</div><div class="site-url">\${site.url}</div></div></div><div class="status-badge \${statusClass}"><span class="pulse \${statusClass}"></span>\${statusText}</div></div><div class="site-stats"><div class="stat-box"><div class="stat-box-value">\${responseTime}</div><div class="stat-box-label">响应时间</div></div><div class="stat-box"><div class="stat-box-value">\${uptime}</div><div class="stat-box-label">可用性</div></div><div class="stat-box"><div class="stat-box-value">\${avgTime}</div><div class="stat-box-label">平均响应</div></div></div><div class="history-bar"id="history-\${site.name.replace(/[^a-zA-Z0-9]/g, '_')}"></div><div class="history-label"><span>30次前</span><span>最近</span></div></div>\`}function updateHistoryBars(){for(const[siteName,history]of Object.entries(historyData)){const barId='history-'+siteName.replace(/[^a-zA-Z0-9]/g,'_');const bar=document.getElementById(barId);if(bar&&history.length>0){const points=history.slice(-30);bar.innerHTML=points.map((point,i)=>{const statusClass=point.online?'online':'offline';const time=new Date(point.timestamp).toLocaleString('zh-CN');const info=point.online?\`\${point.responseTime}ms\`:\`离线:\${point.error||'无响应'}\`;return\`<div class="history-point \${statusClass}"data-info="\${time}&#10;\${info}"onmouseenter="showTooltip(event, this)"onmouseleave="hideTooltip()"></div>\`}).join('')}}}function showTooltip(event,element){const tooltip=document.getElementById('tooltip');tooltip.innerHTML=element.dataset.info.replace(/&#10;/g,'<br>');tooltip.style.display='block';tooltip.style.left=event.pageX+10+'px';tooltip.style.top=event.pageY+10+'px'}function hideTooltip(){document.getElementById('tooltip').style.display='none'}function showError(message){document.getElementById('sites-container').innerHTML='<div class="error-msg">❌ '+message+'</div>'}</script></body></html>`
}
