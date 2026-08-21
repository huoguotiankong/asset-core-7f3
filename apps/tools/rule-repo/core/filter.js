/* 我的规则仓库 v3.0.0 - filter/search/taxonomy layer */
(function(R){
    R.filterState = function() {
        return {
            keyword: String(getMyVar('hc_repo_kw', '') || '').trim(),
            category: String(getMyVar('hc_repo_category', 'all') || 'all'),
            subCategory: String(getMyVar('hc_repo_sub', 'all') || 'all'),
            tag: String(getMyVar('hc_repo_tag', 'all') || 'all'),
            sort: String(getMyVar('hc_repo_sort', 'default') || 'default')
        };
    };

    R.resetSubFilters = function() {
        putMyVar('hc_repo_sub', 'all');
        putMyVar('hc_repo_tag', 'all');
    };

    R.matchKeyword = function(item, kw) {
        kw = String(kw || '').trim().toLowerCase();
        if (!kw) return true;
        var hay = [item.name,item.version,item.desc,item.categoryName,item.subCategory,(item.tags||[]).join(' '),item.mode].join(' ').toLowerCase();
        var parts = kw.split(/\s+/).filter(Boolean);
        for (var i = 0; i < parts.length; i++) if (hay.indexOf(parts[i]) < 0) return false;
        return true;
    };

    R.applyFilters = function(items, state) {
        var self = this;
        state = state || this.filterState();
        var favs = this.favIds();
        var recent = this.recentIds();
        var a = items.filter(function(x) {
            if (state.category === 'favorites' && favs.indexOf(x.id) < 0) return false;
            if (state.category === 'recent' && recent.indexOf(x.id) < 0) return false;
            if (['all','favorites','recent'].indexOf(state.category) < 0 && x.category !== state.category) return false;
            if (state.subCategory !== 'all' && x.subCategory !== state.subCategory) return false;
            if (state.tag !== 'all' && (x.tags || []).indexOf(state.tag) < 0) return false;
            return self.matchKeyword(x, state.keyword);
        });

        if (state.category === 'recent') {
            var order = {}; recent.forEach(function(id, i) { order[id] = i; });
            a.sort(function(x,y){ return (order[x.id] == null ? 9999 : order[x.id]) - (order[y.id] == null ? 9999 : order[y.id]); });
            return a;
        }
        if (state.sort === 'name') a.sort(function(x,y){ return x.name.localeCompare(y.name); });
        else if (state.sort === 'updated') a.sort(function(x,y){ return String(y.updatedAt||'').localeCompare(String(x.updatedAt||'')); });
        else if (state.sort === 'version') a.sort(function(x,y){ return String(y.version||'').localeCompare(String(x.version||'')); });
        else a.sort(function(x,y){ return x.sort - y.sort; });
        return a;
    };

    R.categories = function(items) {
        var base = [
            {id:'all',name:'全部'},
            {id:'favorites',name:'收藏'},
            {id:'recent',name:'最近'},
            {id:'video',name:'视频'},
            {id:'comic',name:'漫画'},
            {id:'cloud',name:'网盘'},
            {id:'tools',name:'工具'},
            {id:'aggregate',name:'聚合'}
        ];
        var present = {};
        items.forEach(function(x){ present[x.category] = true; });
        return base.filter(function(x){ return ['all','favorites','recent'].indexOf(x.id) >= 0 || present[x.id]; });
    };

    R.subCategories = function(items, category) {
        if (['favorites','recent'].indexOf(category) >= 0) return ['all'];
        var o = {}, a = ['all'];
        items.forEach(function(x) {
            if (category !== 'all' && x.category !== category) return;
            var s = String(x.subCategory || '其它');
            if (!o[s]) { o[s] = 1; a.push(s); }
        });
        return a;
    };

    R.tagsFor = function(items, state) {
        var counts = {};
        items.forEach(function(x) {
            if (['all','favorites','recent'].indexOf(state.category) < 0 && x.category !== state.category) return;
            if (state.subCategory !== 'all' && x.subCategory !== state.subCategory) return;
            (x.tags || []).forEach(function(t){ counts[t] = (counts[t] || 0) + 1; });
        });
        return Object.keys(counts).sort(function(a,b){ return counts[b] - counts[a] || a.localeCompare(b); }).slice(0, 14);
    };
})(HikerRuleRepo);
