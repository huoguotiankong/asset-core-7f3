/** ACFun Next 1.0.0-alpha1 - clean core */
var ACFunNext = {
    name: 'ACFun',
    version: '1.0.0-alpha1',
    buildNumber: 10001,
    build: '2026.08.23-v1.0.0-alpha1',
    runtimeMode: 'clean-next',
    appVersion: '1.9.7',
    channel: 'acfan',
    userMark: 'acfun',
    h5Base: 'https://ac001dhzh5.d24m42dh.work/home',
    webBase: 'https://ac6688.a10hkxu0.work/',
    imageCdn: 'https://cdn.ukaim.com/',
    configUrls: [
        'https://tc-jp-alijs-1375272368.cos.ap-tokyo.myqcloud.com/acfun.json',
        'https://d3q70k4zzxh07f.cloudfront.net/acfun.json'
    ],
    staticApiHosts: [
        'https://sjacfanapi.sexbar.site',
        'https://api2.uszim.com',
        'https://acg.imscc.cc',
        'https://acapp.sexbar.site'
    ],
    ua: 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 Chrome/122.0 Mobile Safari/537.36',
    repoAsset: 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/acfun/assets/',
    cacheSchema: 'acf-next-a1',

    s: function(v, d) {
        if (v === undefined || v === null) return d === undefined ? '' : String(d);
        var x = String(v);
        if (x === 'null' || x === 'undefined') return d === undefined ? '' : String(d);
        return x;
    },
    n: function(v) {
        var s = this.s(v);
        return /^-?\d+$/.test(s) ? Number(s) : s;
    },
    clean: function(v) {
        return this.s(v).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    },
    html: function(v) {
        return this.clean(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    },
    pick: function(o, keys, d) {
        o = o || {};
        for (var i = 0; i < keys.length; i++) {
            var v = o[keys[i]];
            if (v !== undefined && v !== null && v !== '' && v !== 'null' && v !== 'undefined') return v;
        }
        return d === undefined ? '' : d;
    },
    deep: function(o, keys, depth) {
        if (o === undefined || o === null || depth > 9) return '';
        if (typeof o !== 'object') return '';
        var wanted = {}, i, k, v;
        for (i = 0; i < keys.length; i++) wanted[String(keys[i]).toLowerCase()] = 1;
        if (!Array.isArray(o)) {
            for (k in o) {
                if (wanted[String(k).toLowerCase()] && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
            }
        }
        if (Array.isArray(o)) {
            for (i = 0; i < o.length; i++) {
                v = this.deep(o[i], keys, depth + 1);
                if (v !== '' && v !== null && v !== undefined) return v;
            }
        } else {
            for (k in o) {
                if (o[k] && typeof o[k] === 'object') {
                    v = this.deep(o[k], keys, depth + 1);
                    if (v !== '' && v !== null && v !== undefined) return v;
                }
            }
        }
        return '';
    },
    first: function(v) {
        if (v === undefined || v === null) return '';
        if (typeof v === 'string' || typeof v === 'number') return this.s(v);
        if (Array.isArray(v)) {
            for (var i = 0; i < v.length; i++) {
                var a = this.first(v[i]);
                if (a) return a;
            }
            return '';
        }
        if (typeof v === 'object') {
            var ks = ['url','path','src','image','img','cover','videoUrl','playUrl','audioUrl'];
            for (var j = 0; j < ks.length; j++) {
                if (v[ks[j]] !== undefined) {
                    var b = this.first(v[ks[j]]);
                    if (b) return b;
                }
            }
        }
        return '';
    },
    arr: function(v) {
        if (Array.isArray(v)) return v;
        if (!v || typeof v !== 'object') return [];
        var keys = ['list','items','records','rows','dataList','videoList','videos','content','resultList','stationList','stations','classTypeList','comicsBaseList','comicsList','fictionList','dynamicList','categoryList','tagList','chapterList','chapters'];
        var i, k, a;
        for (i = 0; i < keys.length; i++) if (Array.isArray(v[keys[i]])) return v[keys[i]];
        for (i = 0; i < keys.length; i++) {
            if (v[keys[i]] && typeof v[keys[i]] === 'object') {
                a = this.arr(v[keys[i]]);
                if (a.length) return a;
            }
        }
        for (k in v) {
            if (Array.isArray(v[k]) && v[k].length) return v[k];
        }
        return [];
    },
    merge: function(a, b) {
        var out = {}, k;
        for (k in (a || {})) out[k] = a[k];
        for (k in (b || {})) if (b[k] !== undefined && b[k] !== null && b[k] !== '') out[k] = b[k];
        return out;
    },
    uniq: function(rows, keyFn) {
        var out = [], seen = {}, i, k;
        for (i = 0; i < (rows || []).length; i++) {
            k = this.s(keyFn(rows[i]));
            if (!k || seen[k]) continue;
            seen[k] = 1;
            out.push(rows[i]);
        }
        return out;
    },
    fmtNum: function(v) {
        var n = Number(v);
        if (!isFinite(n)) return this.s(v);
        if (n >= 100000000) return (n / 100000000).toFixed(n >= 1000000000 ? 0 : 1) + '亿';
        if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1) + '万';
        return String(n);
    },
    icon: function(name) {
        return this.repoAsset + name + '.svg';
    },
    page: function(path, params) {
        var u = 'hiker://page/' + path + '?rule=ACFun&simple=true';
        params = params || {};
        for (var k in params) {
            if (params[k] === undefined || params[k] === null || params[k] === '') continue;
            u += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(this.s(params[k]));
        }
        return u;
    },
    param: function(k) {
        try { return this.s(getParam(k, '')); } catch (e) { return ''; }
    },
    pageNo: function() {
        try { return Math.max(1, Number(MY_PAGE || 1) || 1); } catch (e) { return 1; }
    },

    cacheKey: function(k) { return 'acfun_next_cache|' + this.cacheSchema + '|' + k; },
    cacheRead: function(k, freshMs, staleMs) {
        var raw = getItem(this.cacheKey(k), ''), obj = null, age = 1e18;
        if (!raw) return {hit:false, fresh:false, stale:false, data:null, age:age};
        try { obj = JSON.parse(raw); } catch (e) { return {hit:false, fresh:false, stale:false, data:null, age:age}; }
        if (!obj || obj.schema !== this.cacheSchema || obj.data === undefined) return {hit:false, fresh:false, stale:false, data:null, age:age};
        age = Date.now() - Number(obj.ts || 0);
        return {hit:true, fresh:age <= Number(freshMs || 0), stale:age <= Number(staleMs || freshMs || 0), data:obj.data, age:age};
    },
    cacheWrite: function(k, data) {
        if (data === undefined || data === null) return false;
        if (Array.isArray(data) && !data.length) return false;
        try {
            setItem(this.cacheKey(k), JSON.stringify({schema:this.cacheSchema, ts:Date.now(), data:data}));
            return true;
        } catch (e) { return false; }
    },
    cacheClearPrefix: function(prefix) {
        var keys = ['featured','lifan','anime','video','comic','short','community','fiction','audio','search','detail'];
        for (var i = 0; i < keys.length; i++) {
            if (!prefix || keys[i].indexOf(prefix) === 0) {
                try { clearItem(this.cacheKey(keys[i])); } catch (e) {}
            }
        }
    },

    listRead: function(key) {
        try {
            var x = JSON.parse(getItem(key, '[]'));
            return Array.isArray(x) ? x : [];
        } catch (e) { return []; }
    },
    listWrite: function(key, rows, max) {
        try { setItem(key, JSON.stringify((rows || []).slice(0, max || 300))); return true; } catch (e) { return false; }
    },
    upsert: function(rows, item) {
        var out = [item], id = this.s(item && item.id), i;
        for (i = 0; i < (rows || []).length; i++) if (this.s(rows[i] && rows[i].id) !== id) out.push(rows[i]);
        return out;
    },
    favoriteList: function() { return this.listRead('acfun_next_favorites'); },
    historyList: function() { return this.listRead('acfun_next_history'); },
    isFavorite: function(id) {
        var a = this.favoriteList();
        for (var i = 0; i < a.length; i++) if (this.s(a[i].id) === this.s(id)) return true;
        return false;
    },
    toggleFavorite: function(item) {
        var a = this.favoriteList(), id = this.s(item.id), out = [], removed = false;
        for (var i = 0; i < a.length; i++) {
            if (this.s(a[i].id) === id) { removed = true; continue; }
            out.push(a[i]);
        }
        if (!removed) out.unshift(item);
        this.listWrite('acfun_next_favorites', out, 500);
        return !removed;
    },
    addHistory: function(item) {
        this.listWrite('acfun_next_history', this.upsert(this.historyList(), item), 300);
    },

    setDiag: function(k, v) {
        try { setItem('acfun_next_diag|' + k, this.s(v).slice(0, 6000)); } catch (e) {}
    },
    getDiag: function(k) {
        try { return getItem('acfun_next_diag|' + k, ''); } catch (e) { return ''; }
    }
};
