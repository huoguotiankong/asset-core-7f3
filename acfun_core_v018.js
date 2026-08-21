var ac = {
    name: 'ACFun',
    build: '2026.08.20-v0.1.8',
    appVersion: '1.9.7',
    channel: 'acfan',
    frontendBase: 'https://acapp.sexbar.site',
    configUrls: [
        'https://tc-jp-alijs-1375272368.cos.ap-tokyo.myqcloud.com/acfun.json',
        'https://d3q70k4zzxh07f.cloudfront.net/acfun.json'
    ],
    fallbackHosts: [
        'https://acapp.sexbar.site',
        'https://sjacfanapi.sexbar.site',
        'https://api2.uszim.com',
        'https://acg.imscc.cc'
    ],
    ua: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Chrome/122.0 Mobile Safari/537.36',
    d: [],

    safeJson: function(s) {
        if (s == null) return null;
        if (typeof s == 'object') return s;
        s = String(s).trim();
        if (!s) return null;
        try { return JSON.parse(s); } catch(e) {}
        try {
            var b = base64Decode(s);
            if (b && /^[\[{]/.test(String(b).trim())) return JSON.parse(b);
        } catch(e) {}
        return null;
    },

    uniq: function(arr) {
        var o = {}, r = [];
        (arr || []).forEach(function(x){
            x = String(x || '').trim();
            if (!x || o[x]) return;
            o[x] = 1; r.push(x);
        });
        return r;
    },

    str: function(v, def) {
        if (v === undefined || v === null) return def || '';
        if (typeof v == 'string' || typeof v == 'number') return String(v);
        return def || '';
    },

    deepFind: function(obj, keys, depth) {
        if (!obj || depth > 8) return null;
        var lower = {};
        keys.forEach(function(k){ lower[String(k).toLowerCase()] = 1; });
        if (typeof obj == 'object' && !Array.isArray(obj)) {
            for (var k in obj) {
                if (lower[String(k).toLowerCase()] && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
            }
            for (var k2 in obj) {
                var v = obj[k2];
                if (v && typeof v == 'object') {
                    var got = ac.deepFind(v, keys, depth + 1);
                    if (got !== null && got !== undefined && got !== '') return got;
                }
            }
        } else if (Array.isArray(obj)) {
            for (var i=0;i<obj.length;i++) {
                var got2 = ac.deepFind(obj[i], keys, depth + 1);
                if (got2 !== null && got2 !== undefined && got2 !== '') return got2;
            }
        }
        return null;
    },

    deepStrings: function(obj, out, depth) {
        out = out || []; depth = depth || 0;
        if (depth > 8 || obj == null) return out;
        if (typeof obj == 'string') { out.push(obj); return out; }
        if (Array.isArray(obj)) {
            obj.forEach(function(v){ ac.deepStrings(v, out, depth+1); });
        } else if (typeof obj == 'object') {
            for (var k in obj) ac.deepStrings(obj[k], out, depth+1);
        }
        return out;
    },

    decodeData: function(res) {
        if (!res || typeof res != 'object') return res;
        var data = res.data;
        if (typeof data != 'string') return res;
        var txt = data.trim();
        if (/^[\[{]/.test(txt)) {
            try { res.data = JSON.parse(txt); } catch(e) {}
            return res;
        }
        try {
            var a = base64Decode(txt);
            if (/^[\[{]/.test(String(a).trim())) { res.data = JSON.parse(a); return res; }
            try {
                var rev = String(a).split('').reverse().join('');
                var b = base64Decode(rev);
                if (/^[\[{]/.test(String(b).trim())) { res.data = JSON.parse(b); return res; }
            } catch(e2) {}
        } catch(e) {}
        return res;
    },

    parseResp: function(raw) {
        if (raw == null) return null;
        var res = ac.safeJson(raw);
        if (res == null) return null;
        res = ac.decodeData(res);
        if (res && res.data !== undefined) return res.data;
        if (res && res.result !== undefined) return res.result;
        if (res && res.rows !== undefined) return res.rows;
        return res;
    },

    normalizeHost: function(u) {
        u = String(u || '').trim();
        if (!u) return '';
        if (!/^https?:\/\//i.test(u) && /^[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/.test(u)) u = 'https://' + u;
        if (!/^https?:\/\//i.test(u)) return '';
        var m = u.match(/^(https?:\/\/[^/?#]+)(?:\/.*)?$/i);
        return (m ? m[1] : u).replace(/\/+$/, '');
    },

    collectDomainField: function(obj, wanted, out, depth) {
        out = out || []; depth = depth || 0;
        if (!obj || depth > 8) return out;
        var push = function(v){
            if (v == null) return;
            if (typeof v == 'string') {
                var h = ac.normalizeHost(v);
                if (h) out.push(h);
            } else if (Array.isArray(v)) {
                v.forEach(push);
            } else if (typeof v == 'object') {
                for (var kk in v) push(v[kk]);
            }
        };
        if (typeof obj == 'object' && !Array.isArray(obj)) {
            for (var k in obj) {
                if (wanted[String(k).toLowerCase()]) push(obj[k]);
            }
            for (var k2 in obj) {
                if (obj[k2] && typeof obj[k2] == 'object') ac.collectDomainField(obj[k2], wanted, out, depth+1);
            }
        } else if (Array.isArray(obj)) {
            obj.forEach(function(v){ if (v && typeof v=='object') ac.collectDomainField(v,wanted,out,depth+1); });
        }
        return out;
    },

    pullPriorityHosts: function(cfg) {
        var wanted={};
        ['last_success_domains','lastsuccessdomains','domainlist','availabledomains','generateddomains','domains','fulldomain','convertedsubdomain','originalsubdomainl','api_last_success_domain','apilastsuccessdomain'].forEach(function(k){wanted[k]=1;});
        return ac.uniq(ac.collectDomainField(cfg,wanted,[],0));
    },

    pullHosts: function(cfg) {
        var r = [];
        var keys = ['baseUrl','baseURL','BaseURL','apiUrl','apiURL','apiDomain','apiHost','domain','host','playbackDomain','imgDomain','mp4Domain'];
        keys.forEach(function(k){
            var x = ac.deepFind(cfg, [k], 0);
            if (typeof x == 'string') { var h=ac.normalizeHost(x); if(h)r.push(h); }
            if (Array.isArray(x)) x.forEach(function(v){ var h=ac.normalizeHost(v); if(h)r.push(h); });
        });
        var all = ac.deepStrings(cfg, [], 0);
        all.forEach(function(v){
            if (typeof v!='string') return;
            if (/acfun\.json|\.(png|jpg|jpeg|webp|gif|svg|m3u8|mp4)(\?|$)/i.test(v)) return;
            var h=ac.normalizeHost(v);
            if(h) r.push(h);
        });
        return ac.uniq(r);
    },

    fetchConfig: function(force) {
        var cache = getItem('acfun_remote_config', '');
        var c0 = ac.safeJson(cache);
        if (!force && c0) return c0;
        var lastErr = '';
        for (var i=0;i<ac.configUrls.length;i++) {
            try {
                var raw = fetch(ac.configUrls[i], {timeout:1600, headers:{'User-Agent':ac.ua,'X-Config-Channel':ac.channel,'Accept':'application/json','Cache-Control':'no-cache'}});
                var cfg = ac.safeJson(raw);
                if (!cfg && raw) { try { cfg = ac.safeJson(base64Decode(raw)); } catch(e0) {} }
                if (cfg) {
                    setItem('acfun_remote_config', JSON.stringify(cfg));
                    setItem('acfun_remote_config_ts', String(Date.now()));
                    setItem('acfun_config_url', ac.configUrls[i]);
                    setItem('acfun_last_config_error','');
                    return cfg;
                }
            } catch(e) { lastErr = e.message || String(e); }
        }
        setItem('acfun_last_config_error', lastErr);
        return c0 || {};
    },

    normalizeBase: function(u) {
        u=String(u||'').trim();
        if(!u)return '';
        if(!/^https?:\/\//i.test(u) && /^[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/.test(u))u='https://'+u;
        if(!/^https?:\/\//i.test(u))return '';
        return u.replace(/[?#].*$/,'').replace(/\/+$/,'');
    },

    getRouterNodes: function(force) {
        var cfg=ac.fetchConfig(!!force), r=[];
        if(cfg&&typeof cfg==='object'){
            r=r.concat(ac.pullPriorityHosts(cfg));
            r=r.concat(ac.pullHosts(cfg));
        }
        return ac.uniq(r.map(ac.normalizeBase).filter(function(x){return !!x;}));
    },

    getDiscovered: function() {
        try{return JSON.parse(getItem('acfun_frontend_discovery','{}'))||{};}catch(e){return {};}
    },

    getApiBases: function(force) {
        var r=[], manual=ac.normalizeBase(getItem('acfun_manual_host','')),
            good=ac.normalizeBase(getItem('acfun_good_host','')),
            fd=ac.getDiscovered();
        if(manual)r.push(manual);
        if(good)r.push(good);
        if(fd&&Array.isArray(fd.bases))r=r.concat(fd.bases);
        // Only explicit config fields that look like API/base URLs are allowed here.
        var cfg=ac.fetchConfig(!!force);
        if(cfg&&typeof cfg==='object'){
            ['baseURL','baseUrl','apiURL','apiUrl','apiBaseUri','apiDomain','apiHost'].forEach(function(k){
                var v=ac.deepFind(cfg,[k],0);
                if(typeof v==='string'){var b=ac.normalizeBase(v);if(b)r.push(b);}
                if(Array.isArray(v))v.forEach(function(x){var b=ac.normalizeBase(x);if(b)r.push(b);});
            });
        }
        r=r.concat(ac.fallbackHosts);
        // Random .work domains from router config are router nodes, not direct /video REST roots.
        r=ac.uniq(r.map(ac.normalizeBase).filter(function(x){return !!x && !/\.work(?:\/|$)/i.test(x);}));
        return r.slice(0,10);
    },

    getHosts: function(force) { return ac.getApiBases(force); },

    absoluteUrl: function(base, rel) {
        rel=String(rel||'').trim(); if(!rel)return '';
        if(/^https?:\/\//i.test(rel))return rel;
        var m=String(base||'').match(/^(https?:\/\/[^/]+)/i); if(!m)return '';
        if(rel.indexOf('//')===0)return 'https:'+rel;
        if(rel.charAt(0)==='/')return m[1]+rel;
        var p=String(base||'').replace(/[?#].*$/,'');
        p=p.replace(/\/[^/]*$/,'/');
        return p+rel;
    },

    scanFrontendText: function(text, origin, out, label) {
        text=String(text||''); if(!text)return;
        out=out||{bases:[],prefixes:[],routes:{},snippets:[],scripts:[],version:'',build:''};
        var targets=['video/guessLike','video/list','video/getByClassify','video/classifyList','search/keyWordV2','search/keyWord','video/getVideoById','video/commentList','video/danmaku/list','sys/getDynamicDomain'];
        // Absolute URLs / baseURL literals.
        var m,re=/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&()*+,;=%-]+/g,c=0;
        while((m=re.exec(text))&&c++<160){
            var u=String(m[0]).replace(/\\\//g,'/').replace(/["'`)\]}>,;]+$/,'');
            if(/\.(js|css|png|jpg|jpeg|svg|webp|gif|woff2?)(\?|$)/i.test(u))continue;
            if(/acfun\.json/i.test(u))continue;
            var base=ac.normalizeBase(u);
            if(base && !/sentry|flutter\.dev|github\.com|pub\.dev/i.test(base))out.bases.push(base);
            targets.forEach(function(t){
                var p=u.indexOf(t);if(p>=0){
                    var rb=u.slice(p); out.routes[t]=rb;
                    var b0=ac.normalizeBase(u.slice(0,p)); if(b0)out.bases.push(b0);
                    var pref=u.slice((u.match(/^https?:\/\/[^/]+/i)||[''])[0].length,p);
                    if(pref)out.prefixes.push(pref);
                }
            });
        }
        // Quoted strings containing known logical routes. This recovers exact prefixes such as /api/v1/.
        targets.forEach(function(t){
            var pos=0,n=0;
            while((pos=text.indexOf(t,pos))>=0 && n++<10){
                var a=Math.max(0,pos-220),b=Math.min(text.length,pos+t.length+220),w=text.slice(a,b);
                if(out.snippets.length<40)out.snippets.push((label||'js')+' :: '+w.replace(/\s+/g,' ').slice(0,420));
                // find nearest URL/path-shaped token around the target
                var local=pos-a, left=local, right=local+t.length;
                while(left>0 && !/["'`\s(){}\[\],;]/.test(w.charAt(left-1)) && local-left<220)left--;
                while(right<w.length && !/["'`\s(){}\[\],;]/.test(w.charAt(right)) && right-local<260)right++;
                var token=w.slice(left,right).replace(/\\\//g,'/').replace(/^[=:]+|[=:]+$/g,'');
                if(token.length<320 && token.indexOf(t)>=0){
                    if(/^https?:\/\//i.test(token)){
                        var idx=token.indexOf(t), base=ac.normalizeBase(token.slice(0,idx)); if(base)out.bases.push(base);
                        out.routes[t]=token.slice(idx);
                    }else{
                        var idx2=token.indexOf(t), pref=token.slice(0,idx2);
                        if(pref && /^\/?[A-Za-z0-9_./-]+$/.test(pref))out.prefixes.push(pref);
                        if(/^\/?[A-Za-z0-9_./-]+(?:\?.*)?$/.test(token))out.routes[t]=token.replace(/^\/+/, '');
                    }
                }
                pos+=t.length;
            }
        });
        // Common SPA baseURL/api-base patterns.
        var br=/(?:baseURL|baseUrl|apiBaseUri|apiBase|apiUrl|apiURL)\s*[:=]\s*["'`]([^"'`]+)["'`]/g,bc=0;
        while((m=br.exec(text))&&bc++<30){var bu=ac.absoluteUrl(origin,m[1]);if(bu)out.bases.push(ac.normalizeBase(bu));}
        // Version/build info from inline console logs.
        var vm=text.match(/Version:\s*([0-9.]+)/i); if(vm)out.version=vm[1];
        var bm=text.match(/Build:\s*([0-9.]+)/i); if(bm)out.build=bm[1];
        // security markers are diagnostic clues only; do not invent signing.
        ['X-Signature','X-Timestamp','X-Device-Fingerprint','signKey','authKey'].forEach(function(k){
            var p=text.indexOf(k);if(p>=0&&out.snippets.length<40)out.snippets.push((label||'js')+' security '+k+' :: '+text.slice(Math.max(0,p-160),Math.min(text.length,p+260)).replace(/\s+/g,' '));
        });
    },

    discoverFrontend: function(force) {
        var cached=ac.getDiscovered(); if(!force && cached && cached.time && cached.scripts && cached.scripts.length)return cached;
        var out={time:Date.now(),base:ac.frontendBase,bases:[],prefixes:[],routes:{},snippets:[],scripts:[],version:'',build:'',errors:[]};
        try{
            var html=fetch(ac.frontendBase+'/?_t='+Date.now(),{timeout:2600,headers:{'User-Agent':ac.ua,'Accept':'text/html,*/*','Cache-Control':'no-cache'}});
            ac.scanFrontendText(html,ac.frontendBase,out,'html');
            var scripts=[], mm, rr=/<script[^>]+src=["']([^"']+)["']/ig;
            while((mm=rr.exec(String(html||'')))&&scripts.length<30){var su=ac.absoluteUrl(ac.frontendBase,mm[1]);if(su&&scripts.indexOf(su)<0)scripts.push(su);}
            scripts.sort(function(a,b){
                function score(x){var q=0;if(/app|main|index|page|chunk/i.test(x))q-=8;if(/polyfill|webpack|runtime/i.test(x))q+=3;return q;}
                return score(a)-score(b);
            });
            var scanned=0;
            for(var i=0;i<scripts.length && scanned<12;i++){
                try{
                    var js=fetch(scripts[i],{timeout:2200,headers:{'User-Agent':ac.ua,'Accept':'*/*','Referer':ac.frontendBase+'/'}});
                    scanned++;out.scripts.push(scripts[i]);
                    ac.scanFrontendText(js,scripts[i],out,'js'+scanned);
                    // Once the critical list/detail/search routes have been observed, further chunks add little value.
                    if(out.routes['video/list'] && (out.routes['video/guessLike']||out.routes['video/getByClassify']) && out.routes['video/getVideoById'] && scanned>=4)break;
                }catch(e1){out.errors.push('JS '+scripts[i]+' : '+String(e1.message||e1));}
            }
        }catch(e){out.errors.push('HTML: '+String(e.message||e));}
        out.bases=ac.uniq(out.bases.map(ac.normalizeBase).filter(function(x){return !!x && !/\.work(?:\/|$)/i.test(x);}));
        // Same-origin is a useful candidate only when the bundle exposes relative API paths.
        var hasRel=false;for(var k in out.routes){if(String(out.routes[k]||'').charAt(0)!=='h')hasRel=true;}
        if(hasRel)out.bases.unshift(ac.frontendBase);
        out.bases=ac.uniq(out.bases).slice(0,16);
        out.prefixes=ac.uniq(out.prefixes.map(function(p){
            p=String(p||'').replace(/^https?:\/\/[^/]+/i,'');
            if(!p)return '';
            if(p.charAt(0)!=='/')p='/'+p;
            if(p.charAt(p.length-1)!=='/')p+='/';
            return p;
        }).filter(function(p){return p.length<100;}));
        if(out.prefixes.indexOf('/api/')<0)out.prefixes.push('/api/');
        if(out.prefixes.indexOf('/')<0)out.prefixes.push('/');
        out.prefixes=out.prefixes.slice(0,12);
        setItem('acfun_frontend_discovery',JSON.stringify(out));
        return out;
    },

    discoveredSummary: function(fd) {
        fd=fd||ac.getDiscovered();
        var r=[];
        r.push('前端：'+(fd.base||ac.frontendBase));
        if(fd.version||fd.build)r.push('Web '+(fd.version||'')+' build '+(fd.build||''));
        r.push('脚本：'+((fd.scripts||[]).length)+' 个');
        r.push('API Bases：\n'+((fd.bases||[]).join('\n')||'未识别'));
        r.push('Prefixes：'+((fd.prefixes||[]).join('  ')||'未识别'));
        var ks=[];for(var k in (fd.routes||{}))ks.push(k+' => '+fd.routes[k]);
        r.push('Routes：\n'+(ks.join('\n')||'未识别'));
        if(fd.errors&&fd.errors.length)r.push('Errors：\n'+fd.errors.slice(-6).join('\n'));
        return r.join('\n');
    },

    randomDevice: function() {
        var d = getItem('acfun_device_id','');
        if (d) return d;
        d = 'hk' + String(Date.now()) + String(Math.floor(Math.random()*1000000));
        setItem('acfun_device_id', d);
        return d;
    },

    headers: function() {
        var t = getItem('acfun_token','');
        var cfg = ac.safeJson(getItem('acfun_remote_config','')) || {};
        var cfgApp = ac.deepFind(cfg,['appCode','app_code','appId','app_id'],0);
        var appCode = (typeof cfgApp=='string' && cfgApp.length<100) ? cfgApp : ac.channel;
        var h = {
            'User-Agent': ac.ua,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Config-Channel': ac.channel,
            'appCode': appCode,
            'channel': ac.channel,
            'version': ac.appVersion,
            'appVersion': ac.appVersion,
            'platform': 'android',
            'deviceId': ac.randomDevice()
        };
        if (t) {
            h['token'] = t;
            h['userToken'] = t;
            h['accessToken'] = t;
            h['Authorization'] = 'Bearer ' + t;
        }
        return h;
    },

    storeToken: function(obj) {
        var t = ac.deepFind(obj, ['token','userToken','accessToken'], 0);
        if (t && typeof t == 'string' && t.length > 6) { setItem('acfun_token', t); return true; }
        return false;
    },

    candidateTargets: function(path) {
        path=String(path||'').replace(/^\/+/, '');
        var fd=ac.getDiscovered(), bases=ac.getApiBases(false), out=[];
        var route=fd&&fd.routes?String(fd.routes[path]||''):'';
        if(route){
            if(/^https?:\/\//i.test(route))out.push(route);
            else bases.forEach(function(b){out.push(ac.normalizeBase(b)+'/'+route.replace(/^\/+/,''));});
        }
        var prefs=fd&&Array.isArray(fd.prefixes)?fd.prefixes.slice():[];
        if(prefs.indexOf('/api/')<0)prefs.push('/api/');
        if(prefs.indexOf('/')<0)prefs.push('/');
        prefs=ac.uniq(prefs).slice(0,8);
        bases.forEach(function(b){
            b=ac.normalizeBase(b);if(!b)return;
            prefs.forEach(function(p){
                p=String(p||'/'); if(p.charAt(0)!=='/')p='/'+p;if(p.charAt(p.length-1)!=='/')p+='/';
                out.push(b+p+path);
            });
        });
        return ac.uniq(out).slice(0,48);
    },

    isRouteMiss: function(jr, status, body) {
        if (Number(status)===404) return true;
        if (!jr || typeof jr!='object') return false;
        var code = Number(jr.code!==undefined?jr.code:(jr.status!==undefined?jr.status:jr.statusCode));
        var msg = String(jr.message || jr.msg || jr.error || body || '').toLowerCase();
        if (code===404) return true;
        if (/resource\s+not\s+found|route\s+not\s+found|endpoint\s+not\s+found|no\s+route|not\s+found/.test(msg) && (jr.data==null || jr.result==='fail')) return true;
        return false;
    },

    isBusinessError: function(jr) {
        if (!jr || typeof jr!='object') return false;
        var c = jr.code!==undefined?Number(jr.code):(jr.statusCode!==undefined?Number(jr.statusCode):NaN);
        if (isNaN(c) || c===0 || c===200) return false;
        if (c===404) return true;
        var hasData = jr.data!==undefined && jr.data!==null;
        var result = String(jr.result||'').toLowerCase();
        return !hasData || result==='fail' || result==='error';
    },

    apiRaw: function(path, params, opt) {
        params=params||{};opt=opt||{};
        var urls=ac.candidateTargets(path), errs=[],attempts=[],maxAttempts=Number(opt.maxAttempts||12),count=0;
        var methods=opt.method?[String(opt.method).toUpperCase()]:(opt.write===true||opt.allowGet===false?['POST']:['GET','POST']);
        // If exact frontend route discovery exists, test it before generic prefix permutations.
        outer:for(var mi=0;mi<methods.length;mi++){
            var method=methods[mi];
            for(var ui=0;ui<urls.length;ui++){
                if(count++>=maxAttempts)break outer;
                var u=urls[ui];
                try{
                    var target=u,options={timeout:Number(opt.timeout||1050),headers:ac.headers(),method:method,withStatusCode:true};
                    if(method==='GET')target=buildUrl(u,params);else options.body=JSON.stringify(params||{});
                    var got=fetch(target,options),wrap=ac.safeJson(got);
                    if(!wrap){var e0=method+' '+target+' -> EMPTY';attempts.push(e0);errs.push(e0);continue;}
                    var status=Number(wrap.statusCode||wrap.status||0),body=wrap.body!==undefined?wrap.body:got,jr=ac.safeJson(body),code=jr&&jr.code!==undefined?jr.code:'',msg=jr?String(jr.message||jr.msg||jr.error||''):String(body||'');
                    var line=method+' '+target+' -> HTTP '+status+(code!==''?' code='+code:'')+(msg?' '+msg.replace(/\s+/g,' ').slice(0,110):'');attempts.push(line);
                    if(ac.isRouteMiss(jr,status,body)||status===405){errs.push(line);continue;}
                    if(status>=200&&status<300&&jr&&!ac.isBusinessError(jr)){
                        ac.storeToken(jr);
                        var origin=(target.match(/^https?:\/\/[^/]+/i)||[''])[0];if(origin)setItem('acfun_good_host',origin);
                        setItem('acfun_last_api',target);setItem('acfun_last_status',String(status));setItem('acfun_last_business_code',String(code));setItem('acfun_last_attempts',attempts.join('\n'));setItem('acfun_last_success_body',String(body||'').slice(0,1800));
                        return {ok:true,raw:typeof body==='string'?body:JSON.stringify(body),json:jr,url:target,status:status,attempts:attempts};
                    }
                    errs.push(line+' BODY='+String(body||'').replace(/\s+/g,' ').slice(0,220));
                }catch(e){var ee=method+' '+u+' -> '+String(e.message||e);attempts.push(ee);errs.push(ee);}
            }
        }
        setItem('acfun_last_attempts',attempts.join('\n'));setItem('acfun_last_probe_error',errs.slice(-20).join('\n'));
        return {ok:false,error:errs.slice(-20).join(' | '),attempts:attempts};
    },

    api: function(path, params, opt) {
        var r = ac.apiRaw(path, params, opt);
        if (!r.ok) throw new Error(r.error || ('接口失败: '+path));
        var data = ac.parseResp(r.raw);
        if (data == null) data = r.json;
        return data;
    },

    ensureTraveler: function() {
        if (getItem('acfun_token','')) return true;
        var now=Date.now(), last=Number(getItem('acfun_traveler_try_ts','0'));
        if (last && now-last < 10*60*1000) return false;
        setItem('acfun_traveler_try_ts',String(now));
        var p = {deviceId:ac.randomDevice(), appCode:ac.channel, channel:ac.channel, version:ac.appVersion, platform:'android'};
        try {
            var r = ac.apiRaw('user/traveler/', p, {timeout:1000,maxAttempts:4,write:true});
            if (r.ok && ac.storeToken(r.json)) return true;
        } catch(e) {}
        return false;
    },

    arr: function(data) {
        if (Array.isArray(data)) return data;
        if (!data || typeof data != 'object') return [];
        var keys = ['list','records','rows','items','dataList','videoList','videos','content','resultList'];
        for (var i=0;i<keys.length;i++) if (Array.isArray(data[keys[i]])) return data[keys[i]];
        for (var k in data) {
            if (Array.isArray(data[k]) && data[k].length) return data[k];
        }
        for (var k2 in data) {
            if (data[k2] && typeof data[k2]=='object') {
                var a = ac.arr(data[k2]); if (a.length) return a;
            }
        }
        return [];
    },

    pick: function(o, keys, def) {
        if (!o) return def || '';
        for (var i=0;i<keys.length;i++) {
            var k=keys[i]; if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
        }
        return def || '';
    },

    itemInfo: function(x) {
        x = x || {};
        var v = x.video || x.videoInfo || x.content || x;
        if (v && v.video && typeof v.video=='object') v=v.video;
        var u = x.user || x.userInfo || x.blogger || v.user || v.userInfo || {};
        var id = ac.pick(v,['videoId','id','vid','lsjVideoId'], ac.pick(x,['videoId','id','vid'],''));
        var title = ac.pick(v,['videoTitle','title','name','video_title'], ac.pick(x,['title','name'], '未命名'));
        var img = ac.pick(v,['videoCover','cover','coverUrl','img','image','imgurl','poster','defaultVideoPoster'], ac.pick(x,['cover','img','image'],''));
        var author = ac.pick(u,['nickname','nickName','name','username','userName'], ac.pick(v,['author','userName','nickname'],''));
        var duration = ac.pick(v,['duration','videoDuration','video_duration'], '');
        var watch = ac.pick(v,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'], '');
        var like = ac.pick(v,['likeNum','likes','favoriteNum'], '');
        var uri = ac.pick(v,['videoUri','videoUrl','playUrl','url','movieurl'], '');
        return {id:String(id||''),title:String(title||'未命名'),img:String(img||''),author:String(author||''),duration:String(duration||''),watch:String(watch||''),like:String(like||''),uri:String(uri||''),raw:v};
    },

    image: function(u) {
        u = String(u || ''); if (!u) return '';
        if (/^https?:\/\//.test(u)) return u + '@Referer=';
        var cfg=ac.fetchConfig(false);
        var d=ac.deepFind(cfg,['imgDomain','imageDomain','cdnDomain'],0);
        if (typeof d=='string' && /^https?:\/\//.test(d)) return ac.normalizeHost(d)+'/'+u.replace(/^\/+/, '')+'@Referer=';
        return u;
    },

    fmtNum: function(v) {
        var n=Number(v); if (!isFinite(n)) return String(v||'');
        if (n>=10000) return (n/10000).toFixed(n>=100000?0:1)+'万';
        return String(n);
    },

    detailUrl: function(info) {
        return 'hiker://page/acfun_detail?rule=' + encodeURIComponent(MY_RULE.title) + '&simple=true#noHistory#';
    },

    addVideoCard: function(d, x, col) {
        var info=ac.itemInfo(x);
        var desc=[];
        if (info.author) desc.push(info.author);
        if (info.watch) desc.push('▶ '+ac.fmtNum(info.watch));
        if (info.like) desc.push('♥ '+ac.fmtNum(info.like));
        if (info.duration) desc.push(info.duration);
        d.push({
            title: info.title,
            desc: desc.join('  '),
            img: ac.image(info.img),
            url: ac.detailUrl(info),
            col_type: col || getItem('acfun_card_style','movie_2'),
            extra: {
                video_id: info.id,
                video_title: info.title,
                video_img: info.img,
                video_uri: info.uri,
                video_data: JSON.stringify(info.raw || {}),
                pageTitle: info.title,
                longClick: [
                    {title:'加入本地收藏', js: $.toString(function(){ var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在，请重新打开ACFun';eval(__s);var c=ac; return c.favoriteFromParams(); })},
                    {title:'复制标题', js: $.toString(function(){ return 'copy://'+(MY_PARAMS.video_title||''); })}
                ]
            }
        });
    },

    categoryList: function() {
        try { return ac.arr(ac.api('video/classifyList', {}, {timeout:950,maxAttempts:10})); } catch(e) { setItem('acfun_last_classify_error', e.message||String(e)); }
        return [];
    },

    videoList: function(tab, page) {
        var size=Number(getItem('acfun_page_size','20')) || 20;
        var cid=getMyVar('acfun_classify_id','');
        var p={pageNum:page,page:page,pageSize:size,limit:size,sortType:tab,orderBy:tab,classifyId:cid};
        if (tab=='short') { p.videoContentType='shortVideo'; p.videoType='shortVideo'; p.videoTypeName='shortVideo'; }
        var tries = cid ? [['video/getByClassify',p],['video/list',p]] : (tab=='recommend' ? [['video/guessLike',p],['video/list',p]] : [['video/list',p]]);
        for (var i=0;i<tries.length;i++) {
            try {
                var data=ac.api(tries[i][0], tries[i][1], {timeout:950,maxAttempts:10});
                var a=ac.arr(data); if (a.length) return a;
            } catch(e) { setItem('acfun_last_list_error', e.message || String(e)); }
        }
        return [];
    },

    nav: function(d) {
        var tabs=[['推荐','recommend'],['最新','new'],['热门','hot'],['分类','classify'],['短视频','short']];
        var cur=getMyVar('acfun_tab','recommend');
        tabs.forEach(function(t){
            d.push({
                title: cur==t[1] ? '““””<b><font color="#7B61FF">'+t[0]+'</font></b>' : t[0],
                col_type:'scroll_button',
                url: $('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_tab',v); if(v!='classify') clearMyVar('acfun_classify_id'); refreshPage(); return 'hiker://empty';}, t[1])
            });
        });
        [['收藏','acfun_favorites'],['历史','acfun_history'],['设置','acfun_settings']].forEach(function(t){
            d.push({title:t[0],col_type:'scroll_button',url:'hiker://page/'+t[1]+'?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:t[0]}});
        });
    },

    home: function() {
        var d=[];
        if (MY_PAGE==1) {
            d.push({title:'搜索',desc:'搜索视频 / UP / 标签',col_type:'input',url:$.toString(function(){return 'hiker://search?s='+encodeURIComponent(input)+'&rule='+encodeURIComponent(MY_RULE.title);}),extra:{defaultValue:'',onChange:$.toString(function(){})}});
            ac.nav(d);
            var tab=getMyVar('acfun_tab','recommend');
            if (tab=='classify') {
                var cs=ac.categoryList();
                if (!cs.length) d.push({title:'分类接口暂未返回数据',desc:'可到“设置 → 接口诊断”查看真实响应',col_type:'text_center_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
                cs.forEach(function(c,i){
                    var id=ac.pick(c,['classifyId','id','videoTypeId','typeId'], String(i));
                    var name=ac.pick(c,['classifyName','name','title','videoTypeName'],'分类'+(i+1));
                    var cur=getMyVar('acfun_classify_id','');
                    d.push({title:cur==String(id)?'““””<b><font color="#7B61FF">'+name+'</font></b>':String(name),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_classify_id',String(v));refreshPage();return 'hiker://empty';},String(id))});
                });
            }
        }
        var tab2=getMyVar('acfun_tab','recommend');
        if (tab2=='classify' && !getMyVar('acfun_classify_id','')) {
            var cs2=ac.categoryList();
            if (cs2.length) putMyVar('acfun_classify_id', String(ac.pick(cs2[0],['classifyId','id','videoTypeId','typeId'],'0')));
        }
        var list=ac.videoList(tab2, MY_PAGE);
        list.forEach(function(x){ac.addVideoCard(d,x);});
        if (!list.length && MY_PAGE==1) {
            var fd=ac.getDiscovered();
            d.push({title:(fd&&fd.scripts&&fd.scripts.length?'重新解析当前 Web 前端接口':'首次使用：解析当前 Web 前端接口'),desc:'已确认 .work 域名属于路由节点，不再把它们当 /video API 直接请求。这里会读取 acapp.sexbar.site 当前页面及 JS bundle，自动提取真实 API Base、路径前缀和 video/search 路由，结果只需缓存一次。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('正在解析 Web 前端接口…');var __s=getItem('acfun_core_src_v018','');if(!__s){hideLoading();return 'toast://核心缓存不存在，请重新导入/打开 ACFun';}eval(__s);var fd=ac.discoverFrontend(true);clearItem('acfun_good_host');hideLoading();refreshPage(false);return 'toast://解析完成：'+((fd.scripts||[]).length)+' 个脚本，'+Object.keys(fd.routes||{}).length+' 条路由';})});
            d.push({title:'暂未获取到内容',desc:'如果点上面的“解析当前 Web 前端接口”后仍为空，再进入接口诊断查看 Frontend Discovery 和真实请求，不再需要等待全域名探针。',col_type:'long_text',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        }
        setResult(d);
    },

    search: function() {
        var d=[];
        var kw=getParam('kw','') || getParam('s','') || getMyVar('acfun_search_kw','');
        if (!kw) {
            try { kw=decodeURIComponent(getParam('q','')); } catch(e) {}
        }
        putMyVar('acfun_search_kw',kw);
        var size=Number(getItem('acfun_page_size','20'))||20;
        var p={keyword:kw,keyWord:kw,name:kw,pageNum:MY_PAGE,page:MY_PAGE,pageSize:size,limit:size,searchType:'video'};
        var list=[];
        try { list=ac.arr(ac.api('search/keyWordV2',p,{timeout:950,maxAttempts:10})); } catch(e) { setItem('acfun_last_search_error',e.message||String(e)); }
        if (!list.length) try { list=ac.arr(ac.api('search/keyWord',p,{timeout:950,maxAttempts:10})); } catch(e2) {}
        list.forEach(function(x){ac.addVideoCard(d,x,'movie_2');});
        if (!list.length && MY_PAGE==1) d.push({title:'没有搜索到结果',desc:'关键词：'+kw+'\n如 APP 内能搜到而这里为空，请从设置页打开接口诊断。',col_type:'long_text',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        setResult(d);
    },

    getDetail: function(id, fallback) {
        var obj = fallback || {};
        if (id) {
            try {
                var data=ac.api('video/getVideoById',{videoId:id,id:id},{timeout:950,maxAttempts:10});
                if (data && typeof data=='object') obj=data.video || data.videoInfo || data;
            } catch(e) { setItem('acfun_last_detail_error',e.message||String(e)); }
        }
        return obj || {};
    },

    favoriteList: function() { try{return JSON.parse(getItem('acfun_favs','[]'))||[];}catch(e){return[];} },
    historyList: function() { try{return JSON.parse(getItem('acfun_hist','[]'))||[];}catch(e){return[];} },
    saveList: function(key,list,max) { setItem(key,JSON.stringify((list||[]).slice(0,max||300))); },
    upsert: function(list,item) { var id=String(item.id||''); list=(list||[]).filter(function(x){return String(x.id||'')!=id || !id;}); item.time=Date.now(); list.unshift(item); return list; },
    paramItem: function() { return {id:String(MY_PARAMS.video_id||''),title:String(MY_PARAMS.video_title||''),img:String(MY_PARAMS.video_img||''),uri:String(MY_PARAMS.video_uri||''),data:String(MY_PARAMS.video_data||'{}')}; },
    favoriteFromParams: function() { var it=ac.paramItem(); var l=ac.upsert(ac.favoriteList(),it); ac.saveList('acfun_favs',l,500); return 'toast://已加入本地收藏'; },
    removeFavorite: function(id) { var l=ac.favoriteList().filter(function(x){return String(x.id)!=String(id);}); ac.saveList('acfun_favs',l,500); return true; },
    addHistory: function(item) { var l=ac.upsert(ac.historyList(),item); ac.saveList('acfun_hist',l,300); },

    isFavorite: function(id) { return ac.favoriteList().some(function(x){return String(x.id)==String(id);}); },

    detail: function() {
        var d=[];
        var id=String(MY_PARAMS.video_id||'');
        var fb=ac.safeJson(MY_PARAMS.video_data||'{}')||{};
        if (MY_PARAMS.video_title && !fb.title) fb.title=MY_PARAMS.video_title;
        if (MY_PARAMS.video_img && !fb.cover) fb.cover=MY_PARAMS.video_img;
        if (MY_PARAMS.video_uri && !fb.videoUri) fb.videoUri=MY_PARAMS.video_uri;
        var obj=ac.getDetail(id,fb); var info=ac.itemInfo(obj);
        if (!info.id) info.id=id; if (!info.title) info.title=MY_PARAMS.video_title||'视频详情';
        setPageTitle(info.title);
        setPagePicUrl(ac.image(info.img));
        var desc=[]; if(info.author)desc.push('UP：'+info.author); if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch)); if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
        d.push({title:info.title,desc:desc.join('  '),img:ac.image(info.img),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
        d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在，请重新打开ACFun';eval(__s);var c=ac;var it={id:vid,title:title,img:img,uri:uri,data:raw};c.addHistory(it);return c.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
        d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在，请重新打开ACFun';eval(__s);var c=ac;if(c.isFavorite(vid)){c.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=c.favoriteList();l=c.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});c.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
        d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
        var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');
        if (intro) d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
        var tags=ac.pick(obj,['videoTags','tags','tagList'],[]); if(Array.isArray(tags)&&tags.length){d.push({title:'标签：'+tags.map(function(t){return ac.pick(t,['name','title','tagName'],String(t));}).join(' · '),col_type:'long_text',url:'hiker://empty'});}
        var rel=[]; try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e){}
        if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
        rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
        setResult(d);
    },

    urlScore: function(u) {
        var s=0; u=String(u||'');
        if (/^https?:\/\//.test(u)) s+=3;
        if (/\.m3u8(\?|$)/i.test(u)) s+=8;
        if (/\.mp4(\?|$)/i.test(u)) s+=7;
        if (/play|video|m3u8|mp4/i.test(u)) s+=2;
        return s;
    },

    collectMedia: function(obj, arr, names, depth, keyName) {
        arr=arr||[];names=names||[];depth=depth||0;if(depth>9||obj==null)return;
        if(typeof obj=='string'){
            if(ac.urlScore(obj)>=6){arr.push(obj);names.push(String(keyName||'线路'));} return;
        }
        if(Array.isArray(obj)){obj.forEach(function(v,i){ac.collectMedia(v,arr,names,depth+1,keyName?keyName+(i+1):('线路'+(i+1)));});return;}
        if(typeof obj=='object'){
            var label=ac.pick(obj,['qualityName','clarityName','quality','clarity','resolution','name','title','bitrate'],keyName||'线路');
            for(var k in obj){
                var v=obj[k];
                if(typeof v=='string' && ac.urlScore(v)>=6){arr.push(v);names.push(String(label||k));}
            }
            for(var k2 in obj){var v2=obj[k2]; if(v2&&typeof v2=='object')ac.collectMedia(v2,arr,names,depth+1,label);}
        }
    },

    danmuFile: function(id) {
        if (getItem('acfun_auto_danmu','1')!='1' || !id) return '';
        try {
            var data=ac.api('video/danmaku/list',{videoId:id,pageNum:1,pageSize:5000});
            var list=ac.arr(data), out=[];
            list.forEach(function(x){
                var text=ac.pick(x,['text','content','danmakuContent','comment_content'],'');
                var time=Number(ac.pick(x,['time','position','playTime','second','videoTime'],0));
                if(time>100000)time=time/1000;
                if(text)out.push({text:String(text),time:time||0});
            });
            if(!out.length)return '';
            var p='hiker://files/cache/acfun_danmu_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.json';
            writeFile(p,JSON.stringify(out));
            return p;
        } catch(e){return '';}
    },

    play: function(id, raw, direct) {
        var obj=ac.safeJson(raw)||{}; var urls=[],names=[];
        if(direct && ac.urlScore(direct)>=6){urls.push(direct);names.push('默认');}
        ac.collectMedia(obj,urls,names,0,'默认');
        if(!urls.length && id){
            var tries=[['video/can/watch',{videoId:id}],['video/cdn/refresh',{videoId:id}],['api/m3u8/play',{videoId:id}],['m3u8/play',{videoId:id}]];
            for(var i=0;i<tries.length && !urls.length;i++){
                try{var data=ac.api(tries[i][0],tries[i][1]);ac.collectMedia(data,urls,names,0,'线路');}catch(e){}
            }
        }
        var seen={},u2=[],n2=[];
        for(var j=0;j<urls.length;j++){var u=String(urls[j]);if(!seen[u]){seen[u]=1;u2.push(u);n2.push(names[j]||('线路'+(u2.length)));}}
        if(!u2.length)return 'toast://未解析到播放地址，请到设置→接口诊断查看详情/播放接口返回';
        var ret={urls:u2,names:n2,headers:u2.map(function(){return {'User-Agent':ac.ua,'Referer':''};})};
        var dm=ac.danmuFile(id); if(dm)ret.danmu=dm;
        return JSON.stringify(ret);
    },

    comments: function() {
        var d=[];var id=String(MY_PARAMS.video_id||'');setPageTitle('评论 · '+String(MY_PARAMS.video_title||''));
        if(MY_PAGE==1){
            var cur=getMyVar('acfun_comment_sort','hot');
            [['最热','hot'],['最新','new']].forEach(function(t){d.push({title:cur==t[1]?'““””<b><font color="#7B61FF">'+t[0]+'</font></b>':t[0],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_comment_sort',v);refreshPage();return 'hiker://empty';},t[1])});});
        }
        var p={videoId:id,pageNum:MY_PAGE,pageSize:30,sortType:getMyVar('acfun_comment_sort','hot')}, list=[];
        try{list=ac.arr(ac.api('video/commentList',p));}catch(e){setItem('acfun_last_comment_error',e.message||String(e));}
        list.forEach(function(x){
            var u=x.user||x.userInfo||{};
            var name=ac.pick(u,['nickname','name','userName'],ac.pick(x,['userName','nickname'],'匿名'));
            var text=ac.pick(x,['content','commentContent','comment_content','text'],'');
            var tm=ac.pick(x,['createTime','time','createdAt'],'');
            var lk=ac.pick(x,['likeNum','likes','likeCount'],'');
            var title='<b>'+name+'</b>'+(lk?'　♥ '+ac.fmtNum(lk):'')+'<br>'+String(text||'').replace(/\n/g,'<br>')+(tm?'<br><small>'+tm+'</small>':'');
            d.push({title:title,col_type:'rich_text',url:'hiker://empty'});
        });
        if(!list.length&&MY_PAGE==1)d.push({title:'暂无评论或评论接口参数仍需校准',col_type:'text_center_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        setResult(d);
    },

    localPage: function(type) {
        var d=[], list=type=='fav'?ac.favoriteList():ac.historyList();
        setPageTitle(type=='fav'?'本地收藏':'播放历史');
        if(MY_PAGE==1)d.push({title:'共 '+list.length+' 条　｜　清空',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(k){setItem(k,'[]');refreshPage();return 'toast://已清空';},type=='fav'?'acfun_favs':'acfun_hist')});
        list.forEach(function(it){
            var raw=ac.safeJson(it.data)||{};
            ac.addVideoCard(d,{videoId:it.id,title:it.title,cover:it.img,videoUri:it.uri,video:raw},'movie_2');
        });
        if(!list.length)d.push({title:type=='fav'?'还没有本地收藏':'还没有播放历史',col_type:'text_center_1',url:'hiker://empty'});
        setResult(d);
    },

    settings: function() {
        var d=[]; setPageTitle('ACFun 设置');
        d.push({title:'接口与播放',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
        d.push({title:'接口诊断',desc:'查看 Router 节点、Web 前端自动发现的 API Base/精确路由，以及最近真实请求',col_type:'text_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#'});
        d.push({title:'刷新动态域名',desc:'当前 Direct API：'+(getItem('acfun_good_host','')||'尚未探测成功'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_remote_config','');setItem('acfun_remote_config_ts','');setItem('acfun_good_host','');setItem('acfun_traveler_try_ts','0');refreshPage(false);return 'toast://接口缓存已清空，重新打开后会重新探测';})});
        d.push({title:'手动 API 域名',desc:getItem('acfun_manual_host','未设置，默认自动识别'),col_type:'text_1',url:$(getItem('acfun_manual_host',''),'填写完整 API 域名，例如 https://example.com').input(function(){if(input.trim())setItem('acfun_manual_host',input.trim().replace(/\/+$/,''));else setItem('acfun_manual_host','');refreshPage(false);return 'toast://已保存';})});
        d.push({title:'自动弹幕：'+(getItem('acfun_auto_danmu','1')=='1'?'开':'关'),desc:'播放时自动请求 video/danmaku/list 并转换为海阔 JSON 弹幕',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_auto_danmu',getItem('acfun_auto_danmu','1')=='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
        d.push({title:'每页数量：'+getItem('acfun_page_size','20'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['12','20','30','40'];return 'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:a.indexOf(getItem('acfun_page_size','20')),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false);})});})});
        d.push({title:'卡片样式：'+getItem('acfun_card_style','movie_2'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['movie_2','movie_3','movie_3_marquee'];return 'select://'+JSON.stringify({title:'首页卡片样式',options:a,selectedIndex:a.indexOf(getItem('acfun_card_style','movie_2')),col:1,js:$.toString(function(){setItem('acfun_card_style',input);refreshPage(false);})});})});
        d.push({title:'重置接口缓存/登录态',desc:'不会清除收藏和历史',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){['acfun_remote_config','acfun_remote_config_ts','acfun_good_host','acfun_token','acfun_last_api','acfun_last_status'].forEach(function(k){setItem(k,'');});return 'toast://已重置';})});
        d.push({title:'版本 '+ac.build,desc:'基于你提供的 acfun_1.9.7 APK 资源与接口字符串重构。二级页采用独立 simple 页面，不使用沉浸式标题栏。',col_type:'long_text',url:'hiker://empty'});
        setResult(d);
    },

    diagBlock: function(title, text) {
        return {title:'<b>'+title+'</b><br><small>'+String(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</small>',col_type:'rich_text',url:'hiker://empty'};
    },

    diag: function() {
        var d=[];setPageTitle('接口诊断');
        var fd=ac.getDiscovered(), routers=ac.getRouterNodes(false), bases=ac.getApiBases(false);
        d.push(ac.diagBlock('版本','小程序：'+ac.build+'\nAPK：'+ac.appVersion+'\nWeb入口：'+ac.frontendBase));
        d.push(ac.diagBlock('Router 节点（不再作为 /video API）',routers.join('\n')||'无'));
        d.push(ac.diagBlock('Direct API Bases',bases.join('\n')||'无'));
        d.push(ac.diagBlock('Frontend Discovery',fd&&fd.time?ac.discoveredSummary(fd):'尚未运行。请点“解析当前 Web 前端接口”。'));
        d.push(ac.diagBlock('最近一次真实 API 请求','Last='+getItem('acfun_last_api','')+'\nHTTP='+getItem('acfun_last_status','')+' code='+getItem('acfun_last_business_code','')+'\n\n'+getItem('acfun_last_attempts','暂无请求记录')));
        var le=getItem('acfun_last_list_error','');if(le)d.push(ac.diagBlock('列表错误',le));
        d.push({title:'解析当前 Web 前端接口',desc:'读取 '+ac.frontendBase+' 当前 HTML 和最多 12 个关联 JS bundle，自动提取 API Base、/api/v1 等前缀、video/search 精确路由。只有点这里时才执行，诊断页本身秒开。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('解析 Web 前端中…');var __s=getItem('acfun_core_src_v018','');if(!__s){hideLoading();return 'toast://核心缓存不存在，请先打开首页';}eval(__s);var fd=ac.discoverFrontend(true);clearItem('acfun_good_host');hideLoading();refreshPage(false);return 'toast://完成：'+((fd.scripts||[]).length)+' 个脚本，'+Object.keys(fd.routes||{}).length+' 条路由';})});
        d.push({title:'复制前端解析摘要',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var __s=getItem('acfun_core_src_v018','');if(__s)eval(__s);return 'copy://'+(typeof ac!=='undefined'?ac.discoveredSummary(ac.getDiscovered()):getItem('acfun_frontend_discovery',''));})});
        d.push({title:'复制完整诊断摘要',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var x='ACFun v0.1.8\nFrontend='+getItem('acfun_frontend_discovery','')+'\nHost='+getItem('acfun_good_host','')+'\nLast='+getItem('acfun_last_api','')+'\nAttempts=\n'+getItem('acfun_last_attempts','')+'\nListErr='+getItem('acfun_last_list_error','')+'\nSearchErr='+getItem('acfun_last_search_error','')+'\nDetailErr='+getItem('acfun_last_detail_error','')+'\nCommentErr='+getItem('acfun_last_comment_error','');return 'copy://'+x;})});
        setResult(d);
    }

};
$.exports = ac;