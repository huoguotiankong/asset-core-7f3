/* 我的规则仓库 Core v3.0.0 - repository/data/import layer */
var HikerRuleRepo = {
    version: '3.0.0',
    build: 300,
    schema: 7,
    title: '我的规则仓库',
    repo: 'huoguotiankong/asset-core-7f3',
    branch: 'main',
    manifestPath: 'manifest.json',
    cacheKey: 'hc_repo_manifest_v3',
    cacheTsKey: 'hc_repo_manifest_v3_ts',
    recentKey: 'hc_repo_recent_v3',
    favKey: 'hc_repo_favs_v3',
    statePrefix: 'hc_repo_v3_',
    defaultCacheMs: 60000,

    apiJson: function(path) {
        var u = 'https://api.github.com/repos/' + this.repo + '/contents/' + String(path || '').replace(/^\/+/, '') + '?ref=' + encodeURIComponent(this.branch) + '&_t=' + new Date().getTime();
        var t = fetch(u, {
            timeout: 20000,
            headers: {
                'Accept': 'application/vnd.github+json',
                'Cache-Control': 'no-cache, no-store, max-age=0',
                'Pragma': 'no-cache'
            }
        });
        var j = JSON.parse(String(t || '{}'));
        if (!j || !j.content) throw new Error('GitHub读取失败：' + path);
        return j;
    },

    apiText: function(path) {
        return base64Decode(String(this.apiJson(path).content).replace(/\s+/g, ''));
    },

    apiBytes: function(path) {
        return java.util.Base64.getDecoder().decode(String(this.apiJson(path).content).replace(/\s+/g, ''));
    },

    sha256: function(bytes) {
        var md = java.security.MessageDigest.getInstance('SHA-256');
        var a = md.digest(bytes), s = '';
        for (var i = 0; i < a.length; i++) {
            var v = a[i]; if (v < 0) v += 256;
            var h = v.toString(16); if (h.length < 2) h = '0' + h;
            s += h;
        }
        return s;
    },

    unzipRule: function(bytes) {
        var zis = new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(bytes));
        var e, b = null;
        while ((e = zis.getNextEntry()) !== null) {
            var n = String(e.getName() || '');
            if (n === 'rule.json' || /\/rule\.json$/i.test(n)) {
                b = new java.io.ByteArrayOutputStream();
                var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096), k;
                while ((k = zis.read(buf)) > 0) b.write(buf, 0, k);
                break;
            }
        }
        zis.close();
        if (b === null) throw new Error('hkzip中未找到rule.json');
        return String(new java.lang.String(b.toByteArray(), 'UTF-8'));
    },

    safeJson: function(s, fallback) {
        try { return JSON.parse(String(s || '')); } catch (e) { return fallback; }
    },

    getSetting: function(key, def) {
        return getItem(this.statePrefix + key, def == null ? '' : String(def));
    },

    setSetting: function(key, value) {
        setItem(this.statePrefix + key, String(value == null ? '' : value));
    },

    cacheMs: function() {
        var n = Number(this.getSetting('cache_ms', this.defaultCacheMs));
        return n >= 0 ? n : this.defaultCacheMs;
    },

    manifest: function(force) {
        var now = new Date().getTime();
        var ts = Number(getItem(this.cacheTsKey, '0') || 0);
        if (!force && now - ts < this.cacheMs()) {
            var c = getItem(this.cacheKey, '');
            if (c) {
                var cached = this.safeJson(c, null);
                if (cached && Array.isArray(cached.items)) return cached;
            }
        }
        var m = JSON.parse(this.apiText(this.manifestPath));
        if (!m || !Array.isArray(m.items)) throw new Error('manifest格式错误');
        setItem(this.cacheKey, JSON.stringify(m));
        setItem(this.cacheTsKey, String(now));
        return m;
    },

    clearManifestCache: function() {
        clearItem(this.cacheKey);
        clearItem(this.cacheTsKey);
    },

    normalizeItem: function(x, index) {
        x = x || {};
        var tags = Array.isArray(x.tags) ? x.tags.slice() : [];
        var category = String(x.category || 'other');
        var categoryName = String(x.categoryName || this.categoryName(category));
        return {
            id: String(x.id || ('item-' + index)),
            name: String(x.name || '未命名'),
            version: String(x.version || ''),
            desc: String(x.desc || ''),
            path: String(x.path || ''),
            codec: String(x.codec || ''),
            bytes: x.bytes,
            sha256: String(x.sha256 || ''),
            icon: String(x.icon || ''),
            category: category,
            categoryName: categoryName,
            subCategory: String(x.subCategory || '其它'),
            tags: tags,
            mode: String(x.mode || 'local'),
            updatedAt: String(x.updatedAt || ''),
            sort: Number(x.sort == null ? index : x.sort),
            featured: !!x.featured,
            raw: x
        };
    },

    items: function(force) {
        var self = this;
        var m = this.manifest(!!force);
        return (m.items || []).map(function(x, i) { return self.normalizeItem(x, i); });
    },

    categoryName: function(id) {
        var map = {video:'视频', comic:'漫画', cloud:'网盘', tools:'工具', aggregate:'聚合', other:'其它'};
        return map[String(id || '')] || String(id || '其它');
    },

    colorFor: function(item) {
        var map = {video:'4F7CFF', comic:'8D68F8', cloud:'37A978', tools:'2F7CF6', aggregate:'E28A35', other:'6F7785'};
        return map[item && item.category] || '6F7785';
    },

    fallbackIcon: function(item) {
        var text = String((item && item.name) || '?').replace(/[^0-9A-Za-z\u4e00-\u9fa5]/g, '').slice(0, 2) || '仓';
        var color = this.colorFor(item);
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#' + color + '"/><text x="64" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">' + text + '</text></svg>';
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    },

    iconOf: function(item) {
        return item && item.icon ? String(item.icon) : this.fallbackIcon(item);
    },

    readList: function(key) {
        var a = this.safeJson(getItem(key, '[]'), []);
        return Array.isArray(a) ? a : [];
    },

    writeList: function(key, list) {
        setItem(key, JSON.stringify(list || []));
    },

    recordRecent: function(item) {
        var a = this.readList(this.recentKey);
        var id = String(item.id || item.name || '');
        a = a.filter(function(x) { return String(x.id || '') !== id; });
        a.unshift({id:id, name:item.name, version:item.version, time:new Date().getTime()});
        if (a.length > 30) a = a.slice(0, 30);
        this.writeList(this.recentKey, a);
    },

    recentIds: function() {
        return this.readList(this.recentKey).map(function(x) { return String(x.id || ''); });
    },

    favIds: function() {
        return this.readList(this.favKey).map(function(x) { return String(x || ''); });
    },

    isFav: function(item) {
        return this.favIds().indexOf(String(item.id || '')) >= 0;
    },

    toggleFav: function(item) {
        var id = String(item.id || '');
        if (!id) return false;
        var a = this.favIds(), i = a.indexOf(id), on;
        if (i >= 0) { a.splice(i, 1); on = false; }
        else { a.unshift(id); on = true; }
        this.writeList(this.favKey, a);
        return on;
    },

    findById: function(id, force) {
        id = String(id || '');
        var a = this.items(!!force);
        for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
        return null;
    },

    importRule: function(raw) {
        try {
            var x = typeof raw === 'string' ? JSON.parse(raw) : raw;
            x = x && x.raw ? x.raw : x;
            if (!x) throw new Error('规则元数据为空');
            var item = this.normalizeItem(x, 0);
            this.recordRecent(item);
            if (x.codec === 'hkzip') {
                var b = this.apiBytes(x.path || '');
                if (x.bytes && Number(x.bytes) !== b.length) return 'toast://hkzip长度校验失败';
                if (x.sha256 && this.sha256(b).toLowerCase() !== String(x.sha256).toLowerCase()) return 'toast://hkzip SHA256校验失败';
                var o = JSON.parse(this.unzipRule(b));
                if (!o || !o.title) return 'toast://rule.json内容无效';
                return '海阔视界，首页频道￥home_rule￥' + JSON.stringify(o);
            }
            var s = this.apiText(x.path || '');
            if (!s || s.indexOf('海阔视界') !== 0) return 'toast://规则文件格式错误';
            return s;
        } catch (e) {
            return 'toast://导入失败：' + String(e.message || e);
        }
    },

    stats: function(items) {
        var out = {all:items.length, video:0, comic:0, cloud:0, tools:0, aggregate:0, other:0, remote:0, local:0};
        items.forEach(function(x) {
            if (out[x.category] == null) out[x.category] = 0;
            out[x.category]++;
            if (x.mode === 'remote') out.remote++; else out.local++;
        });
        return out;
    }
};
