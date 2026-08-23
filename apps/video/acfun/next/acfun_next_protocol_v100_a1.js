/** ACFun Next 1.0.0-alpha1 - protocol/auth/request */
(function(){
if (typeof ACFunNext !== 'object') throw new Error('ACFunNext core missing');
var A = ACFunNext;

A.safeJson = function(v) {
    if (v === undefined || v === null) return null;
    if (typeof v === 'object') return v;
    var s = String(v).trim();
    if (!s) return null;
    try { return JSON.parse(s); } catch (e) { return null; }
};
A.md5 = function(text) {
    try {
        var md = java.security.MessageDigest.getInstance('MD5');
        var bytes = md.digest(new java.lang.String(String(text || '')).getBytes('UTF-8'));
        var sb = new java.lang.StringBuilder();
        for (var i = 0; i < bytes.length; i++) {
            var v = bytes[i] & 255;
            if (v < 16) sb.append('0');
            sb.append(java.lang.Integer.toHexString(v));
        }
        return String(sb.toString());
    } catch (e) { return ''; }
};
A.deviceId = function() {
    var d = getItem('acfun_next_device_id', '');
    if (d) return d;
    d = A.md5(String(Date.now()) + '-' + String(Math.random()) + '-acfun-next');
    if (!d) d = 'hk' + String(Date.now()) + String(Math.floor(Math.random() * 1000000));
    setItem('acfun_next_device_id', d);
    return d;
};
A.headers = function(noAuth, origin) {
    var ts = String(Date.now()), sub = ts.length >= 8 ? ts.substring(3, 8) : ts;
    var base = origin || getItem('acfun_next_good_host', '') || A.staticApiHosts[0];
    var h = {
        'User-Agent': A.ua,
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
        'deviceId': A.deviceId(),
        't': ts,
        's': A.md5(sub),
        'User-Mark': A.userMark,
        'Origin': base,
        'Referer': base.replace(/\/+$/, '') + '/'
    };
    var token = getItem('acfun_next_token', '');
    if (!noAuth && token) h.aut = token;
    return h;
};
A.aesDecrypt = function(src) {
    src = A.s(src).trim();
    if (!src) return '';
    var token = A.s(getItem('acfun_next_token', ''));
    if (token.length < 18) throw new Error('响应需要令牌才能解密');
    var secret = token.substring(2, 18);
    try {
        var keyBytes = new java.lang.String(secret).getBytes('UTF-8');
        var key = new javax.crypto.spec.SecretKeySpec(keyBytes, 'AES');
        var iv = new javax.crypto.spec.IvParameterSpec(keyBytes);
        var cipher = javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding');
        cipher.init(javax.crypto.Cipher.DECRYPT_MODE, key, iv);
        var enc = java.util.Base64.getDecoder().decode(src.replace(/\s+/g, ''));
        return String(new java.lang.String(cipher.doFinal(enc), 'UTF-8'));
    } catch (e) { throw new Error('encData AES解密失败: ' + A.s(e.message || e)); }
};
A.decodeEnvelope = function(jr) {
    if (!jr || typeof jr !== 'object') return jr;
    if (jr.encData !== undefined && jr.encData !== null && A.s(jr.encData).trim()) {
        var plain = A.aesDecrypt(jr.encData), val = A.safeJson(plain);
        jr.data = val === null ? plain : val;
    }
    return jr;
};
A.storeSession = function(jr) {
    if (!jr || typeof jr !== 'object') return;
    var t = A.deep(jr, ['token','userToken','accessToken'], 0);
    if (typeof t === 'string' && t.length > 16) setItem('acfun_next_token', t);
    var img = A.deep(jr, ['imgDomain','imageDomain','cdnDomain'], 0);
    if (typeof img === 'string' && /^https?:\/\//i.test(img)) setItem('acfun_next_img_domain', img.replace(/\/+$/, ''));
};
A.payload = function(raw) {
    var jr = A.safeJson(raw);
    if (!jr) return null;
    A.storeSession(jr);
    jr = A.decodeEnvelope(jr);
    if (jr.data !== undefined) return jr.data;
    if (jr.result !== undefined && typeof jr.result !== 'string') return jr.result;
    if (jr.rows !== undefined) return jr.rows;
    return jr;
};
A.normalizeHost = function(u) {
    u = A.s(u).trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) return '';
    var m = u.match(/^(https?:\/\/[^/?#]+)/i);
    return m ? m[1].replace(/\/+$/, '') : '';
};
A.extractConfigHosts = function(root) {
    var out = [], seen = {}, wanted = {baseurl:1, apiurl:1, apidomain:1, apihost:1, apibaseuri:1, host:1}, count = 0;
    function add(v) {
        if (typeof v !== 'string') return;
        var h = A.normalizeHost(v);
        if (!h || /\.work$/i.test(h) || seen[h]) return;
        seen[h] = 1; out.push(h);
    }
    function walk(v, depth) {
        if (!v || depth > 7 || count++ > 1200) return;
        if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) walk(v[i], depth + 1); return; }
        if (typeof v !== 'object') return;
        for (var k in v) {
            if (wanted[String(k).toLowerCase()]) {
                if (Array.isArray(v[k])) for (var j = 0; j < v[k].length; j++) add(v[k][j]);
                else add(v[k]);
            }
        }
        for (var k2 in v) if (v[k2] && typeof v[k2] === 'object') walk(v[k2], depth + 1);
    }
    walk(root, 0);
    return out;
};
A.remoteConfig = function(force) {
    var c = A.cacheRead('protocol-config', 6 * 3600 * 1000, 7 * 86400 * 1000);
    if (!force && c.fresh && c.data) return c.data;
    var last = '';
    for (var i = 0; i < A.configUrls.length; i++) {
        try {
            var raw = fetch(A.configUrls[i] + '?_acf=' + Date.now(), {timeout:1800, headers:{'User-Agent':A.ua,'Accept':'application/json,*/*','Cache-Control':'no-cache','X-Config-Channel':A.channel}});
            var j = A.safeJson(raw);
            if (j) { A.cacheWrite('protocol-config', j); return j; }
        } catch (e) { last = A.s(e.message || e); }
    }
    A.setDiag('config_error', last);
    return c.hit ? c.data : {};
};
A.apiHosts = function(forceConfig) {
    var out = [], seen = {};
    function add(h) { h = A.normalizeHost(h); if (!h || /\.work$/i.test(h) || seen[h]) return; seen[h] = 1; out.push(h); }
    add(getItem('acfun_next_manual_host', ''));
    add(getItem('acfun_next_good_host', ''));
    var cfg = A.remoteConfig(!!forceConfig), hs = A.extractConfigHosts(cfg);
    for (var i = 0; i < hs.length; i++) add(hs[i]);
    for (var j = 0; j < A.staticApiHosts.length; j++) add(A.staticApiHosts[j]);
    return out.slice(0, 8);
};
A.isAuthCode = function(code) {
    code = Number(code);
    return code === 301 || code === 302 || code === 401 || code === 403 || code === 1001 || code === 1003;
};
A.rawRequest = function(host, path, params, opt) {
    opt = opt || {}; params = params || {};
    var p = A.s(path).replace(/^\/+/, ''), method = A.s(opt.method || 'GET').toUpperCase();
    var url = host.replace(/\/+$/, '') + '/api/' + p, target = url;
    var options = {timeout:Number(opt.timeout || 2200), headers:A.headers(!!opt.noAuth, host), method:method, withStatusCode:true};
    if (method === 'GET') target = buildUrl(url, params); else options.body = JSON.stringify(params);
    var got = fetch(target, options), wrap = A.safeJson(got);
    if (!wrap) return {ok:false, error:'EMPTY_WRAPPER', url:target, status:0};
    var status = Number(wrap.statusCode || wrap.status || 0), body = wrap.body !== undefined ? wrap.body : got;
    body = body === undefined || body === null ? '' : String(body);
    if (status < 200 || status >= 300) return {ok:false, error:'HTTP_' + status, url:target, status:status, body:body};
    if (!body.trim()) return {ok:false, error:'EMPTY_BODY', url:target, status:status};
    var jr = A.safeJson(body);
    if (!jr) return {ok:false, error:'NON_JSON', url:target, status:status, body:body};
    A.storeSession(jr);
    var code = jr.code !== undefined ? Number(jr.code) : (jr.statusCode !== undefined ? Number(jr.statusCode) : NaN);
    if (A.isAuthCode(code)) return {ok:false, auth:true, error:'AUTH_' + code, url:target, status:status, json:jr, body:body};
    if (!isNaN(code) && code !== 0 && code !== 200) {
        var msg = A.s(jr.message || jr.msg || jr.error || '');
        return {ok:false, business:true, error:'CODE_' + code + (msg ? '_' + msg : ''), url:target, status:status, json:jr, body:body};
    }
    return {ok:true, url:target, status:status, json:jr, body:body};
};
A.ensureTraveler = function(force) {
    if (!force && getItem('acfun_next_token', '')) return true;
    var last = Number(getItem('acfun_next_traveler_ts', '0'));
    if (!force && last && Date.now() - last < 90000) return false;
    setItem('acfun_next_traveler_ts', String(Date.now()));
    var hosts = A.apiHosts(false), did = A.deviceId(), bodies = [
        {deviceId:did, chCode:A.channel},
        {deviceId:did, chCode:A.channel, code:'', bza:'bza'},
        {deviceId:did, chCode:A.channel, ttb:'A'}
    ], errs = [];
    for (var h = 0; h < hosts.length; h++) {
        for (var b = 0; b < bodies.length; b++) {
            try {
                var r = A.rawRequest(hosts[h], 'user/traveler/', bodies[b], {method:'POST', noAuth:true, timeout:2600});
                if (r.ok) {
                    A.storeSession(r.json);
                    if (getItem('acfun_next_token', '')) {
                        setItem('acfun_next_good_host', hosts[h]);
                        A.setDiag('traveler', 'OK ' + hosts[h]);
                        return true;
                    }
                }
                errs.push(hosts[h] + ' ' + (r.error || 'token missing'));
            } catch (e) { errs.push(hosts[h] + ' ' + A.s(e.message || e)); }
        }
    }
    A.setDiag('traveler_error', errs.slice(-12).join('\n'));
    return false;
};
A.api = function(path, params, opt) {
    opt = opt || {}; params = params || {};
    var isTraveler = /^user\/traveler\/?$/i.test(A.s(path));
    if (!opt.noAuth && !isTraveler) A.ensureTraveler(false);
    var hosts = A.apiHosts(false), errs = [], authSeen = false, i, r;
    for (i = 0; i < hosts.length; i++) {
        try {
            r = A.rawRequest(hosts[i], path, params, opt);
            if (r.ok) {
                setItem('acfun_next_good_host', hosts[i]);
                A.setDiag('last_api', (opt.method || 'GET') + ' ' + r.url + ' HTTP ' + r.status);
                var data = A.payload(r.body);
                if (data !== null && data !== undefined) return data;
                errs.push(hosts[i] + ' EMPTY_DATA');
            } else {
                if (r.auth) authSeen = true;
                errs.push(hosts[i] + ' ' + r.error);
            }
        } catch (e) { errs.push(hosts[i] + ' ' + A.s(e.message || e)); }
    }
    if (authSeen && !opt.noAuth && !opt.__retriedAuth && !isTraveler) {
        setItem('acfun_next_token', '');
        setItem('acfun_next_traveler_ts', '0');
        if (A.ensureTraveler(true)) {
            var opt2 = A.merge(opt, {__retriedAuth:true});
            return A.api(path, params, opt2);
        }
    }
    A.setDiag('api_error', A.s(path) + '\n' + errs.slice(-12).join('\n'));
    throw new Error('接口失败 ' + A.s(path) + ': ' + errs.slice(-4).join(' | '));
};
A.tryApi = function(path, params, methods, opt) {
    methods = methods || ['GET']; opt = opt || {};
    var errs = [];
    for (var i = 0; i < methods.length; i++) {
        try { return A.api(path, params, A.merge(opt, {method:methods[i]})); }
        catch (e) { errs.push(methods[i] + ':' + A.s(e.message || e)); }
    }
    throw new Error(errs.join(' | '));
};
})();
