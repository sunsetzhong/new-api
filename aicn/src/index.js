/**
 * index.js
 */

import { DB } from './src/db.js';
import { api } from './src/api.js';
import { pages } from './src/views.js';
import { htmlRes, errRes } from './src/utils.js';
import { getLang } from './src/i18n.js';
import { getUser } from './src/middleware.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const db = new DB(env.DB);

        try {
            const init = await db.getSetting('initialized');
            if (init !== 'true') {
                await db.init();
                await db.ensureSystemGroups();
                await db.setSetting('initialized', 'true');
            } else {
                await db.ensureSystemGroups();
            }
        } catch {
            await db.init();
            await db.ensureSystemGroups();
            await db.setSetting('initialized', 'true');
        }
        await db.ensureSchemaUpgrades();

        let user = await getUser(request, db);
        const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
        const settings = await db.getSettings();
        const lang = getLang(request);

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
        }

            try {
                if (path === '/v1' && request.method === 'GET') return api.v1Info(request, db);
                if (path === '/v1/models' && request.method === 'GET') return api.v1Models(request, db);
                if (path === '/v1/chat/completions' && request.method === 'POST') return api.v1ChatCompletions(request, db, ctx);

                if (path.startsWith('/api/')) {
                    const r = path.slice(5);
                if (r === 'register' && request.method === 'POST') return api.register(request, db, ip);
                if (r === 'login' && request.method === 'POST') return api.login(request, db);
                if (r === 'auth/linuxdo/start' && request.method === 'GET') return api.linuxDoOAuthStart(request, db, env);
                if (r === 'auth/linuxdo/callback' && request.method === 'GET') return api.linuxDoOAuthCallback(request, db, env, ip);
                if (r === 'logout' && request.method === 'POST') return api.logout(request, db);
                if (r === 'me') return api.me(request, db, user);
                if (r === 'password' && request.method === 'POST') return api.updatePassword(request, db, user);
                if (r === 'profile' && request.method === 'PUT') return api.updateProfile(request, db, user);
                if (r === 'models') return api.models(request, db, user);
                if (r === 'apis') return api.apis(request, db, user);
                if (r === 'notices' && request.method === 'GET') return api.notices(request, db, user);
                if (r === 'pay/linuxdo/create' && request.method === 'POST') return api.linuxDoCreatePayment(request, db, user, env);
                if (r === 'pay/linuxdo/orders' && request.method === 'GET') return api.linuxDoOrders(request, db, user);
                if (r === 'pay/linuxdo/notify' && ['GET', 'POST'].includes(request.method)) return api.linuxDoNotify(request, db, env);
                if (r === 'admin/site-images' && request.method === 'POST') return api.adminUploadSiteImage(request, db, user, env);
                if (r.startsWith('site-images/') && request.method === 'GET') return api.siteImage(request, db, decodeURIComponent(r.slice('site-images/'.length)), env);
                
                if (r === 'chat' && request.method === 'POST') return api.chat(request, db, user, ctx);
                if (r === 'sync-models' && request.method === 'POST') return api.syncModels(request, db, user);
                if (r === 'check-models' && request.method === 'POST') return api.checkModels(request, db, user);
                
                if (r === 'chats' && request.method === 'GET') return api.getChats(request, db, user);
                if (r === 'chats' && request.method === 'POST') return api.saveChat(request, db, user);
                if (r.match(/^chats\/\d+$/) && request.method === 'GET') return api.getChat(request, db, user, r.split('/')[1]);
                if (r.match(/^chats\/\d+$/) && request.method === 'DELETE') return api.deleteChat(request, db, user, r.split('/')[1]);
                if (r === 'admin/settings') return api.adminSettings(request, db, user);
                if (r === 'admin/users') return api.adminUsers(request, db, user);
                if (r === 'admin/notices') return api.adminNotices(request, db, user);
                if (r === 'admin/apis') return api.adminAPIs(request, db, user);
                if (r === 'admin/models') return api.adminModels(request, db, user);
                if (r === 'admin/sync-models' && request.method === 'POST') return api.syncModels(request, db, user);
                if (r === 'admin/check-models' && request.method === 'POST') return api.checkModels(request, db, user);
                if (r === 'admin/reset-db' && request.method === 'POST') return api.resetDatabase(request, db, user);
                if (r === 'admin/export' && request.method === 'POST') return api.adminExport(request, db, user);
                if (r === 'admin/import' && request.method === 'POST') return api.adminImport(request, db, user);
                if (r === 'quota-requests' && request.method === 'GET') return api.quotaRequests(request, db, user);
                if (r === 'quota-requests' && request.method === 'POST') return api.quotaRequests(request, db, user, env);
                if (r.match(/^quota-requests\/\d+\/image$/) && request.method === 'GET') return api.quotaRequestImage(request, db, user, r.split('/')[1], env);
                if (r === 'admin/quota-requests' && request.method === 'GET') return api.adminQuotaRequests(request, db, user, env);
                if (r === 'admin/quota-requests' && request.method === 'PUT') return api.adminQuotaRequests(request, db, user, env);
                if (r.match(/^admin\/quota-requests\/\d+\/image$/) && request.method === 'GET') return api.adminQuotaRequestImage(request, db, user, r.split('/')[2], env);

                return errRes('Not Found', 404);
            }

            if (path === '/login') return htmlRes(pages.login(settings, lang));
            if (path === '/register') {
                const allowRegister = String(settings.allow_register || 'true').toLowerCase() !== 'false';
                if (!allowRegister) return Response.redirect(url.origin + '/login', 302);
                return htmlRes(pages.register(settings, lang));
            }
            if (path === '/pricing') return Response.redirect(url.origin + '/', 302);
            if (path === '/help') return Response.redirect(url.origin + '/', 302);
            if (path === '/profile') return Response.redirect(url.origin + '/settings', 302);

            if (!user && !['/login', '/register'].includes(path)) {
                return Response.redirect(url.origin + '/login', 302);
            }

            if (path === '/') return htmlRes(pages.chat(user, settings, lang));
            if (path === '/settings') {
                return htmlRes(pages.profile(user, await db.getGroups(), settings, lang, await db.getModels()));
            }
            if (path === '/quota-request') {
                if (!user || user.group_id === 1) return Response.redirect(url.origin + '/', 302);
                return htmlRes(pages.quotaRequest(user, settings, lang));
            }
            if (path === '/admin') {
                if (!user || user.group_id !== 1) return Response.redirect(url.origin + '/', 302);
                return Response.redirect(url.origin + '/admin/settings', 302);
            }
            if (path.startsWith('/admin/')) {
                if (!user || user.group_id !== 1) return Response.redirect(url.origin + '/', 302);
                const tabMap = {
                    '/admin/settings': 'settings',
                    '/admin/notices': 'notices',
                    '/admin/users': 'users',
                    '/admin/requests': 'requests',
                    '/admin/apis': 'apis',
                    '/admin/models': 'models',
                    '/admin/data': 'data'
                };
                const tab = tabMap[path];
                if (!tab) return new Response('Not Found', { status: 404 });
                return htmlRes(pages.admin(user, settings, lang, tab));
            }

            return new Response('Not Found', { status: 404 });
        } catch (e) {
            console.error(e);
            return e.status ? errRes(e.message, e.status) : errRes('Internal Server Error', 500);
        }
    }
};
