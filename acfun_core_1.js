var ac = {
    name: 'ACFun',
    build: '2026.08.20-v0.1',
    appVersion: '1.9.7',
    channel: 'acfan',
    configUrls: [
        'https://tc-jp-alijs-1375272368.cos.ap-tokyo.myqcloud.com/acfun.json',
        'https://d3q70k4zzxh07f.cloudfront.net/acfun.json'
    ],
    fallbackHosts: [
        'https://api2.uszim.com',
        'https://sjacfanapi.sexbar.site'
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
        if (!/^https?:\/\//i.test(u)) return '';
        return u.replace(/\/+$/, '');
    },

    pullHosts: function(cfg) {
        var r = [];
        var keys = ['baseUrl','baseURL','apiUrl','apiURL','apiDomain','apiHost','domain','host','playbackDomain'];
        keys.forEach(function(k){
            var x = ac.deepFind(cfg, [k], 0);
            if (typeof x == 'string' && /^https?:\/\//.test(x)) r.push(ac.normalizeHost(x));
            if (Array.isArray(x)) x.forEach(function(v){ if (typeof v=='string' && /^https?:\/\//.test(v)) r.push(ac.normalizeHost(v)); });
        });
        var all = ac.deepStrings(cfg, [], 0);
        all.forEach(function(s){
            if (/^https?:\/\//.test(s) && !/\.(png|jpg|jpeg|webp|gif|svg|m3u8|mp4)(\?|$)/i.test(s) && s.indexOf('acfun.json') < 0) {
                try {
                    var m = s.match(/^https?:\/\/[^/]+(?:\/[^?#]*)?/);
                    if (m) r.push(ac.normalizeHost(m[0].replace(/\/(video|search|user|sys|comics|fiction|community|station|blogger|all|activity|signIn|information|aiboxNew).*$/,'')));
                } catch(e) {}
            }
        });
        return ac.uniq(r);
    },

    fetchConfig: function(force) {
        var cache = getItem('acfun_remote_config', '');
        var ts = Number(getItem('acfun_remote_config_ts','0'));
        if (!force && cache && Date.now() - ts < 6*3600*1000) {
            var c = ac.safeJson(cache); if (c) return c;
        }
        var lastErr = '';
        for (var i=0;i<ac.configUrls.length;i++) {
            try {
                var raw = fetch(ac.configUrls[i], {timeout:5000, headers:{'User-Agent':ac.ua,'X-Config-Channel':ac.channel,'Accept':'application/json'}});
                var cfg = ac.safeJson(raw);
                if (!cfg && raw) {
                    try { cfg = ac.safeJson(base64Decode(raw)); } catch(e0) {}
                }
                if (cfg) {
                    setItem('acfun_remote_config', JSON.stringify(cfg));
                    setItem('acfun_remote_config_ts', String(Date.now()));
                    setItem('acfun_config_url', ac.configUrls[i]);
                    return cfg;
                }
            } catch(e) { lastErr = e.message || String(e); }
        }
        setItem('acfun_last_config_error', lastErr);
        return ac.safeJson(cache) || {};
    },

    getHosts: function(force) {
        var manual = ac.normalizeHost(getItem('acfun_manual_host',''));
        var cfg = ac.fetchConfig(!!force);
        var r = [];
        if (manual) r.push(manual);
        r = r.concat(ac.pullHosts(cfg));
        var good = ac.normalizeHost(getItem('acfun_good_host',''));
        if (good) r.push(good);
        r = r.concat(ac.fallbackHosts);
        return ac.uniq(r.map(ac.normalizeHost).filter(function(x){return !!x;}));
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
        var h = {
            'User-Agent': ac.ua,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-Config-Channel': ac.channel,
            'appCode': ac.channel,
            'channel': ac.channel,
            'version': ac.appVersion,
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

    candidates: function(host, path) {
        path = String(path || '').replace(/^\/+/, '');
        var out = [];
        var h = ac.normalizeHost(host);
        if (!h) return out;
        out.push(h + '/' + path);
        if (!/\/api$/i.test(h) && path.indexOf('api/') !== 0) out.push(h + '/api/' + path);
        return ac.uniq(out);
    },

    apiRaw: function(path, params, opt) {
        params = params || {}; opt = opt || {};
        var hosts = ac.getHosts(false), errs = [], attempts = [];
        for (var hi=0;hi<hosts.length;hi++) {
            var urls = ac.candidat