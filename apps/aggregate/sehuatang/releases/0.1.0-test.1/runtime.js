/* 色花堂 0.1.0-test.1 / Build 10101 - Phase 1 forum runtime */
var SeHuaTangRemoteRuntime = (function () {
    var VERSION = '0.1.0-test.1';
    var BUILD = 10101;
    var RULE_NAME = '色花堂';
    var DEFAULT_ORIGIN = 'https://sehuatang.org';
    var UA = 'Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
    var LOGO = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/aggregate/sehuatang/assets/v1/logo.svg';
    var KEY_ORIGIN = 'sht_origin_v1';
    var KEY_SEARCH = 'sht_search_kw_v1';
    var KEY_DIAG = 'sht_diag_v1';

    function s(v) { return v == null ? '' : String(v); }
    function trim(v) { return s(v).replace(/^\s+|\s+$/g, ''); }
    function uniq(arr) {
        var out = [], seen = {}, i, k;
        for (i = 0; i < (arr || []).length; i++) {
            k = s(arr[i]);
            if (!k || seen[k]) continue;
            seen[k] = 1;
            out.push(arr[i]);
        }
        return out;
    }
    function safeDecode(v) {
        v = s(v);
        try { return decodeURIComponent(v); } catch (e) { return v; }
    }
    function htmlDecode(v) {
        return s(v)
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&apos;/gi, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&#(\d+);/g, function (_, n) {
                try { return String.fromCharCode(Number(n)); } catch (e) { return _; }
            });
    }
    function stripHtml(v) {
        var x = htmlDecode(v)
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/<\/p\s*>/gi, '\n')
            .replace(/<\/div\s*>/gi, '\n')
            .replace(/<\/li\s*>/gi, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[\t\r]+/g, ' ')
            .replace(/ *\n */g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/ {2,}/g, ' ');
        return trim(x);
    }
    function shortText(v, n) {
        var x = stripHtml(v);
        n = Number(n || 70);
        return x.length > n ? x.slice(0, n) + '…' : x;
    }
    function pageParam(name, def) {
        var u = s(typeof MY_URL === 'undefined' ? '' : MY_URL);
        var m = u.match(new RegExp('[?&]' + name + '=([^&#]*)'));
        if (!m) return def == null ? '' : def;
        return safeDecode(m[1]);
    }
    function currentOrigin() {
        var o = trim(getItem(KEY_ORIGIN, DEFAULT_ORIGIN));
        if (!/^https?:\/\//i.test(o)) o = DEFAULT_ORIGIN;
        return o.replace(/\/+$/, '');
    }
    function originOf(url) {
        var m = s(url).match(/^(https?:\/\/[^\/]+)/i);
        return m ? m[1] : currentOrigin();
    }
    function absUrl(href, base) {
        href = htmlDecode(trim(href));
        base = trim(base || currentOrigin());
        if (!href) return '';
        if (/^https?:\/\//i.test(href)) return href;
        if (/^\/\//.test(href)) return 'https:' + href;
        if (/^(javascript:|mailto:|tel:|#)/i.test(href)) return '';
        var om = base.match(/^(https?:\/\/[^\/]+)/i), origin = om ? om[1] : currentOrigin();
        if (href.charAt(0) === '/') return origin + href;
        var clean = base.split('#')[0].split('?')[0];
        if (clean.charAt(clean.length - 1) !== '/') clean = clean.replace(/\/[^\/]*$/, '/');
        return clean + href.replace(/^\.\//, '');
    }
    function addMobile(url) {
        url = s(url);
        if (!url || /[?&]mobile=2(?:&|$)/i.test(url)) return url;
        if (/^https?:\/\//i.test(url) && originOf(url) !== currentOrigin()) return url;
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'mobile=2';
    }
    function withPage(url, page) {
        page = Math.max(1, Number(page || 1));
        url = s(url);
        if (/\/forum-\d+-\d+\.html(?:\?|$)/i.test(url)) {
            return url.replace(/\/forum-(\d+)-\d+\.html/i, '/forum-$1-' + page + '.html');
        }
        if (/([?&])page=\d+/i.test(url)) return url.replace(/([?&])page=\d+/i, '$1page=' + page);
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + page;
    }
    function saveDiag(stage, url, error) {
        try {
            setItem(KEY_DIAG, JSON.stringify({
                stage: s(stage),
                origin: originOf(url || currentOrigin()),
                error: shortText(error || '', 180),
                time: new Date().getTime()
            }));
        } catch (e) { }
    }
    function getDiag() {
        try { return JSON.parse(getItem(KEY_DIAG, '{}') || '{}'); } catch (e) { return {}; }
    }
    function headersFor(url) {
        var o = originOf(url), c = '';
        try { c = getCookie(o) || ''; } catch (e) { c = ''; }
        var h = { 'User-Agent': UA, 'Referer': o + '/' };
        if (c) h.Cookie = c;
        return h;
    }
    function requestHtml(url, stage) {
        url = addMobile(url);
        try {
            var body = fetch(url, { headers: headersFor(url), timeout: 9000 });
            body = s(body);
            if (!body || body.length < 80) throw new Error('页面返回为空或过短');
            saveDiag(stage, url, '');
            return body;
        } catch (e) {
            saveDiag(stage, url, e && (e.message || e));
            throw e;
        }
    }
    function anchorList(html, base) {
        var out = [], re = /<a\b([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi, m;
        while ((m = re.exec(s(html))) !== null) {
            out.push({ href: absUrl(m[2], base), rawHref: htmlDecode(m[2]), text: stripHtml(m[4]), attrs: m[1] + ' ' + m[3], inner: m[4], index: m.index });
            if (out.length > 4000) break;
        }
        return out;
    }
    function forumKey(url) {
        var m = s(url).match(/[?&]fid=(\d+)/i) || s(url).match(/\/forum-(\d+)-\d+\.html/i);
        return m ? m[1] : s(url);
    }
    function threadKey(url) {
        var m = s(url).match(/[?&]tid=(\d+)/i) || s(url).match(/\/thread-(\d+)-\d+-\d+\.html/i);
        return m ? m[1] : s(url);
    }
    function isForumHref(url) {
        return /forum\.php\?[^#]*\bmod=forumdisplay\b[^#]*\bfid=\d+/i.test(s(url)) || /\/forum-\d+-\d+\.html(?:\?|$)/i.test(s(url));
    }
    function isThreadHref(url) {
        return /forum\.php\?[^#]*\bmod=viewthread\b[^#]*\btid=\d+/i.test(s(url)) || /\/thread-\d+-\d+-\d+\.html(?:\?|$)/i.test(s(url));
    }
    function parseForums(html, base) {
        var a = anchorList(html, base), out = [], seen = {}, i, x, key, t;
        for (i = 0; i < a.length; i++) {
            x = a[i];
            if (!isForumHref(x.href)) continue;
            t = trim(x.text);
            if (!t || t.length < 2 || /^(首页|论坛|返回|更多|发帖|登录|注册)$/i.test(t)) continue;
            key = forumKey(x.href);
            if (seen[key]) continue;
            seen[key] = 1;
            out.push({ id: key, title: t, url: addMobile(x.href) });
        }
        return out.slice(0, 80);
    }
    function nearbyText(html, index) {
        var from = Math.max(0, Number(index || 0) - 420), to = Math.min(s(html).length, Number(index || 0) + 900);
        return shortText(s(html).slice(from, to), 120);
    }
    function parseThreads(html, base) {
        var a = anchorList(html, base), out = [], seen = {}, i, x, key, t, meta;
        for (i = 0; i < a.length; i++) {
            x = a[i];
            if (!isThreadHref(x.href)) continue;
            t = trim(x.text);
            if (!t || t.length < 2 || /^(回复|查看|最后发表|上一页|下一页|返回)$/i.test(t)) continue;
            key = threadKey(x.href);
            if (seen[key]) continue;
            seen[key] = 1;
            meta = '';
            out.push({ id: key, title: t, url: addMobile(x.href), desc: meta });
        }
        return out.slice(0, 80);
    }
    function extractImages(fragment, base) {
        var out = [], seen = {}, re = /<img\b([^>]*?)>/gi, m, attrs, sm, url;
        while ((m = re.exec(s(fragment))) !== null) {
            attrs = m[1];
            sm = attrs.match(/(?:zoomfile|file|data-original|data-src|src)\s*=\s*["']([^"']+)["']/i);
            if (!sm) continue;
            url = absUrl(sm[1], base);
            if (!url || /static\/image\/(?:smiley|common)|avatar\.php|noavatar|loading|logo/i.test(url)) continue;
            if (seen[url]) continue;
            seen[url] = 1;
            out.push(url);
            if (out.length >= 30) break;
        }
        return out;
    }
    function magnetClean(v) {
        v = htmlDecode(trim(v));
        v = v.replace(/[)\]}>，。；;]+$/g, '');
        return v;
    }
    function extractMagnets(fragment) {
        var text = htmlDecode(s(fragment)), out = [], seen = {}, m, re;
        re = /magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s"'<>]*)?/ig;
        while ((m = re.exec(text)) !== null) {
            var x = magnetClean(m[0]);
            if (!seen[x]) { seen[x] = 1; out.push(x); }
            if (out.length >= 30) break;
        }
        re = /magnet%3A%3Fxt%3Durn%3Abtih%3A[a-z0-9%._~-]{32,220}/ig;
        while ((m = re.exec(text)) !== null) {
            var d = magnetClean(safeDecode(m[0]));
            if (/^magnet:\?xt=urn:btih:/i.test(d) && !seen[d]) { seen[d] = 1; out.push(d); }
            if (out.length >= 30) break;
        }
        return out;
    }
    function capturePostMessageBlocks(html) {
        var src = s(html), marks = [], re = /id\s*=\s*["']postmessage_(\d+)["']/gi, m, i, start, end, gt, block;
        while ((m = re.exec(src)) !== null) marks.push({ id: m[1], index: m.index });
        var out = [];
        for (i = 0; i < marks.length; i++) {
            start = marks[i].index;
            gt = src.indexOf('>', start);
            if (gt < 0) continue;
            end = i + 1 < marks.length ? marks[i + 1].index : Math.min(src.length, gt + 60000);
            block = src.slice(gt + 1, end);
            out.push({ id: marks[i].id, html: block });
            if (out.length >= 50) break;
        }
        return out;
    }
    function captureClassMessageBlocks(html) {
        var src = s(html), out = [], re = /<(?:div|td)\b[^>]*class\s*=\s*["'][^"']*\b(?:message|pct|pcb)\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|td)>/gi, m, n = 0;
        while ((m = re.exec(src)) !== null) {
            var plain = stripHtml(m[1]);
            if (plain.length < 4) continue;
            out.push({ id: String(++n), html: m[1] });
            if (out.length >= 50) break;
        }
        return out;
    }
    function parsePosts(html, base) {
        var raw = capturePostMessageBlocks(html);
        if (!raw.length) raw = captureClassMessageBlocks(html);
        if (!raw.length) raw = [{ id: '1', html: s(html) }];
        var out = [], i, b, text, imgs, magnets;
        for (i = 0; i < raw.length; i++) {
            b = raw[i];
            text = stripHtml(b.html);
            imgs = extractImages(b.html, base);
            magnets = extractMagnets(b.html);
            if (!text && !imgs.length && !magnets.length) continue;
            if (text.length > 12000) text = text.slice(0, 12000) + '\n…';
            out.push({ id: b.id, text: text, images: imgs, magnets: magnets });
            if (out.length >= 30) break;
        }
        return out;
    }
    function replyUrl(html, base, threadUrl) {
        var a = anchorList(html, base), i;
        for (i = 0; i < a.length; i++) {
            if (/mod=post[^#]*action=reply|action=reply[^#]*mod=post/i.test(a[i].rawHref) || /post\.php\?[^#]*action=reply/i.test(a[i].rawHref)) return addMobile(a[i].href);
        }
        return addMobile(threadUrl);
    }
    function imageWithHeaders(url, referer) {
        var h = headersFor(referer || url);
        return url + '@headers=' + JSON.stringify(h);
    }
    function route(path, params) {
        var u = 'hiker://page/' + path + '?rule=' + RULE_NAME + '&simple=true';
        var k;
        for (k in (params || {})) if (params.hasOwnProperty(k) && params[k] != null) u += '&' + k + '=' + encodeURIComponent(s(params[k]));
        return u;
    }
    function inputSearch(home) {
        var js = home
            ? "(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('" + KEY_SEARCH + "',w);return 'hiker://page/shtSearch?rule=" + RULE_NAME + "&simple=true&kw='+encodeURIComponent(w);})()"
            : "(function(){var w=String(input||'').trim();putMyVar('" + KEY_SEARCH + "',w);refreshPage(false);return 'hiker://empty';})()";
        return { title: '搜索主题', desc: '搜索', col_type: 'input', url: js, extra: { defaultValue: home ? '' : pageParam('kw', getMyVar(KEY_SEARCH, '')), titleVisible: true } };
    }
    function section(title, desc) { return { title: title, desc: desc || '', url: 'hiker://empty', col_type: 'text_1', extra: { lineVisible: false } }; }
    function line() { return { col_type: 'line' }; }
    function empty(title, desc) { return { title: title, desc: desc || '', url: 'hiker://empty', col_type: 'text_center_1', extra: { lineVisible: false } }; }
    function quick(title, url) { return { title: title, img: LOGO, url: url, col_type: 'icon_small_4', extra: { lineVisible: false } }; }
    function forumItem(x) {
        return { title: x.title, desc: '进入板块', img: LOGO, url: route('shtForum', { sht_url: x.url, sht_name: x.title }), col_type: 'movie_1', extra: { lineVisible: false } };
    }
    function threadItem(x) {
        return { title: x.title, desc: x.desc ? shortText(x.desc, 90) : '查看帖子', img: LOGO, url: route('shtThread', { sht_url: x.url, sht_name: x.title }), col_type: 'movie_1', extra: { lineVisible: false } };
    }
    function web(url) { return 'x5://' + addMobile(url); }
    function cloud115(magnet) { return 'hiker://page/115Offline?rule=115.简&page=fypage&add=' + encodeURIComponent(magnet); }
    function cloudXunlei(magnet) { return 'hiker://page/diaoyong?rule=迅雷&page=fypage#' + magnet; }
    function cloudPikPak(magnet) { return 'pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=' + magnet; }

    function home() {
        var d = [], origin = currentOrigin(), html = '', forums = [], i;
        setPageTitle('色花堂');
        d.push(inputSearch(true));
        d.push(quick('登录', web(origin + '/member.php?mod=logging&action=login')));
        d.push(quick('签到', web(origin + '/plugin.php?id=dd_sign:index')));
        d.push(quick('搜索', route('shtSearch')));
        d.push(quick('设置', route('shtSettings')));
        d.push(line());
        d.push({ title: '最新主题', desc: 'Discuz 最新主题 / 导读', img: LOGO, url: route('shtForum', { sht_url: origin + '/forum.php?mod=guide&view=newthread&mobile=2', sht_name: '最新主题' }), col_type: 'movie_1', extra: { lineVisible: false } });
        try {
            html = requestHtml(origin + '/portal.php?mod=index&mobile=2', 'home.portal');
            forums = parseForums(html, origin + '/');
            if (!forums.length) {
                html = requestHtml(origin + '/forum.php?forumlist=1&mobile=2', 'home.forumlist');
                forums = parseForums(html, origin + '/');
            }
            d.push(line());
            d.push(section('论坛分区', forums.length ? ('识别到 ' + forums.length + ' 个板块') : '未识别到板块'));
            for (i = 0; i < forums.length; i++) d.push(forumItem(forums[i]));
            if (!forums.length) {
                d.push(empty('暂未识别到论坛分区', '可先打开官网确认当前线路，实机截图后继续适配'));
                d.push({ title: '打开论坛网页版', desc: origin, url: web(origin + '/forum.php?forumlist=1'), col_type: 'text_1' });
            }
        } catch (e) {
            d.push(line());
            d.push(empty('首页加载失败', shortText(e && (e.message || e), 140)));
            d.push({ title: '打开官网', desc: origin, url: web(origin + '/portal.php?mod=index'), col_type: 'text_1' });
        }
        setResult(d);
    }

    function forum() {
        var d = [], seed = pageParam('sht_url', ''), name = pageParam('sht_name', '主题列表'), pg = Math.max(1, Number(typeof MY_PAGE === 'undefined' ? 1 : MY_PAGE || 1));
        setPageTitle(name || '主题列表');
        if (!seed) { setResult([empty('板块参数缺失')]); return; }
        try {
            var u = withPage(seed, pg), html = requestHtml(u, 'forum.list'), list = parseThreads(html, u), i;
            if (pg === 1) {
                d.push({ title: '网页版', desc: '当前板块 · 网页发帖/高级操作', img: LOGO, url: web(seed), col_type: 'icon_small_4', extra: { lineVisible: false } });
                d.push({ title: '搜索', desc: '全站主题搜索', img: LOGO, url: route('shtSearch'), col_type: 'icon_small_4', extra: { lineVisible: false } });
                d.push(line());
                d.push(section(name, list.length ? ('当前页 ' + list.length + ' 条主题') : '当前页暂无主题'));
            }
            for (i = 0; i < list.length; i++) d.push(threadItem(list[i]));
            if (!list.length) d.push(empty('没有解析到主题', '可能需要登录、站点模板已变化，或当前页确实为空'));
        } catch (e) { d.push(empty('主题列表加载失败', shortText(e && (e.message || e), 160))); }
        setResult(d);
    }

    function search() {
        var d = [], q = trim(pageParam('kw', getMyVar(KEY_SEARCH, ''))), pg = Math.max(1, Number(typeof MY_PAGE === 'undefined' ? 1 : MY_PAGE || 1)), origin = currentOrigin();
        if (q) putMyVar(KEY_SEARCH, q);
        setPageTitle('搜索');
        if (pg === 1) d.push(inputSearch(false));
        if (!q) {
            if (pg === 1) d.push(empty('输入关键词开始搜索', '首版优先搜索论坛主题'));
            setResult(d); return;
        }
        try {
            var u = origin + '/search.php?mod=forum&searchsubmit=yes&srchtxt=' + encodeURIComponent(q) + '&page=' + pg + '&mobile=2';
            var html = requestHtml(u, 'search.native'), list = parseThreads(html, u), i;
            if (pg === 1) d.push(section('搜索结果', list.length ? ('“' + q + '” · ' + list.length + ' 条') : '原生搜索暂未解析到结果'));
            for (i = 0; i < list.length; i++) d.push(threadItem(list[i]));
            if (!list.length && pg === 1) {
                d.push(empty('暂无原生搜索结果', 'Discuz 搜索可能要求额外权限或表单参数，可先使用网页搜索'));
                d.push({ title: '打开网页搜索', desc: q, img: LOGO, url: web(u), col_type: 'movie_1', extra: { lineVisible: false } });
            }
        } catch (e) {
            d.push(empty('搜索失败', shortText(e && (e.message || e), 160)));
            d.push({ title: '打开网页搜索', desc: q, url: web(origin + '/search.php?mod=forum&searchsubmit=yes&srchtxt=' + encodeURIComponent(q)), col_type: 'text_1' });
        }
        setResult(d);
    }

    function thread() {
        var d = [], url = pageParam('sht_url', ''), title = pageParam('sht_name', '帖子详情'), i, j;
        setPageTitle(title || '帖子详情');
        if (!url) { setResult([empty('帖子参数缺失')]); return; }
        try {
            var html = requestHtml(url, 'thread.detail'), posts = parsePosts(html, url), reply = replyUrl(html, url, url);
            d.push({ title: title || '帖子详情', desc: '原帖 / 回复 / 磁链云播', img: LOGO, url: web(url), col_type: 'movie_1', extra: { lineVisible: false } });
            d.push(quick('原帖', web(url)));
            d.push(quick('回复', web(reply)));
            d.push({ title: '复制链接', img: LOGO, url: 'copy://' + url, col_type: 'icon_small_4', extra: { lineVisible: false } });
            d.push(quick('设置', route('shtSettings')));
            d.push(line());
            if (!posts.length) d.push(empty('未解析到正文', '可先打开原帖；收到实机截图后继续适配模板'));
            for (i = 0; i < posts.length; i++) {
                var p = posts[i];
                d.push(section((i === 0 ? '楼主' : ('回复 ' + (i + 1))), [p.images.length ? p.images.length + ' 图' : '', p.magnets.length ? p.magnets.length + ' 条磁链' : ''].filter(Boolean).join(' · ')));
                if (p.text) d.push({ title: p.text, url: 'hiker://empty', col_type: 'long_text', extra: { lineVisible: false } });
                for (j = 0; j < p.images.length; j++) {
                    var img = imageWithHeaders(p.images[j], url);
                    d.push({ title: '', pic_url: img, url: img, col_type: 'pic_1_full', extra: { lineVisible: false } });
                }
                for (j = 0; j < p.magnets.length; j++) {
                    var m = p.magnets[j], hash = (m.match(/btih:([a-z0-9]{32,40})/i) || [])[1] || '';
                    d.push({ title: '磁链 ' + (j + 1), desc: hash ? hash.slice(0, 12) + '…' : '已识别', url: 'copy://' + m, col_type: 'text_1', extra: { lineVisible: false } });
                    d.push({ title: '115', img: LOGO, url: cloud115(m), col_type: 'icon_small_4', extra: { lineVisible: false } });
                    d.push({ title: '迅雷', img: LOGO, url: cloudXunlei(m), col_type: 'icon_small_4', extra: { lineVisible: false } });
                    d.push({ title: 'PikPak', img: LOGO, url: cloudPikPak(m), col_type: 'icon_small_4', extra: { lineVisible: false } });
                    d.push({ title: '复制', img: LOGO, url: 'copy://' + m, col_type: 'icon_small_4', extra: { lineVisible: false } });
                }
                d.push(line());
            }
        } catch (e) {
            d.push(empty('帖子加载失败', shortText(e && (e.message || e), 160)));
            d.push({ title: '打开原帖', desc: url, url: web(url), col_type: 'text_1' });
        }
        setResult(d);
    }

    function settings() {
        var d = [], origin = currentOrigin(), cookie = '', dg = getDiag();
        try { cookie = getCookie(origin) || ''; } catch (e) { cookie = ''; }
        setPageTitle('色花堂设置');
        d.push(section('账号', cookie ? '浏览器 Cookie 已存在（是否已登录以网页实际状态为准）' : '当前未检测到 Cookie'));
        d.push({ title: '网页登录', desc: '支持验证码/安全验证', img: LOGO, url: web(origin + '/member.php?mod=logging&action=login'), col_type: 'movie_1', extra: { lineVisible: false } });
        d.push({ title: '每日签到', desc: '首版使用官方签到页', img: LOGO, url: web(origin + '/plugin.php?id=dd_sign:index'), col_type: 'movie_1', extra: { lineVisible: false } });
        d.push(line());
        d.push(section('访问线路', origin));
        d.push({
            title: '切换域名',
            desc: '仅在当前域名不可用时切换',
            url: 'select://' + JSON.stringify({ title: '访问域名', options: ['sehuatang.org', 'sehuatang.net', 'sehuatang.com'], col: 1, js: "var v=String(input||'').trim();if(v){setItem('" + KEY_ORIGIN + "','https://'+v);refreshPage(false);} 'hiker://empty'" }),
            col_type: 'text_1'
        });
        d.push({ title: '恢复默认线路', desc: DEFAULT_ORIGIN, url: $('#noLoading#').lazyRule(function (k, v) { setItem(k, v); refreshPage(false); return 'toast://已恢复默认线路'; }, KEY_ORIGIN, DEFAULT_ORIGIN), col_type: 'text_1' });
        d.push(line());
        d.push(section('云播调用', '帖子磁链自动显示 115 / 迅雷 / PikPak / 复制'));
        d.push({ title: '115.简', desc: '调用 115Offline 离线播放入口', url: 'hiker://home@115.简', col_type: 'text_1' });
        d.push({ title: '迅雷', desc: '调用 迅雷 diaoyong 入口', url: 'hiker://home@迅雷', col_type: 'text_1' });
        d.push({ title: 'PikPak', desc: '调用 PikPak 官方 App Deep Link', url: 'pikpakapp://mypikpak.com/xpan/main_tab?tab=1', col_type: 'text_1' });
        d.push(line());
        d.push(section('诊断', 'Test ' + VERSION + ' · Build ' + BUILD));
        d.push({ title: '最近阶段：' + (dg.stage || '暂无'), desc: [dg.origin || '', dg.error || ''].filter(Boolean).join(' · '), url: 'hiker://empty', col_type: 'long_text', extra: { lineVisible: false } });
        d.push({ title: '清除本程序登录 Cookie', desc: '仅在账号状态异常时使用；不会清除其它站点 Cookie', url: $('#noLoading#').lazyRule(function (o) { try { clearCookie(o); } catch (e) { return 'toast://当前海阔版本不支持按域名清 Cookie'; } refreshPage(false); return 'toast://已清除当前域名 Cookie'; }, origin), col_type: 'text_1' });
        setResult(d);
    }

    function module() {
        return {
            version: VERSION,
            build: BUILD,
            home: home,
            forum: forum,
            search: search,
            thread: thread,
            settings: settings,
            _debug: {
                parseForums: parseForums,
                parseThreads: parseThreads,
                extractMagnets: extractMagnets,
                parsePosts: parsePosts
            }
        };
    }

    return { version: VERSION, build: BUILD, module: module };
})();
