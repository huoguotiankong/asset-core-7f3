/* 我的规则仓库 v3.0.0 - home renderer */
(function(R){
    R.fmtTitle = function(text, active) {
        return active ? '““””<b><font color="#2F7CF6">' + text + '</font></b>' : text;
    };

    R.modeText = function(mode) {
        return mode === 'remote' ? '远程' : (mode === 'share' ? '分享版' : '本地');
    };

    R.itemCard = function(item) {
        var self = this;
        var tags = (item.tags || []).slice(0, 4).map(function(t){ return '#' + t; }).join('  ');
        var desc = [item.categoryName + ' / ' + item.subCategory, tags, item.desc].filter(Boolean).join('\n');
        var fav = this.isFav(item);
        return {
            title: item.name + (item.version ? '  <small><font color="#8A8F98">v' + item.version + '</font></small>' : ''),
            desc: desc,
            img: this.iconOf(item),
            pic_url: this.iconOf(item),
            url: 'hiker://page/ruleRepoDetail?rule=&simple=true',
            col_type: 'movie_1_left_pic',
            extra: {
                lineVisible: false,
                pageTitle: item.name,
                hc_repo_item_id: item.id,
                longClick: [
                    {title:'立即导入/更新', js: $.toString(function(raw){ return $.require('hiker://page/ruleRepoCore').importRule(raw); }, JSON.stringify(item.raw))},
                    {title:fav ? '取消仓库收藏' : '加入仓库收藏', js: $.toString(function(id){ var r=$.require('hiker://page/ruleRepoCore'); var x=r.findById(id); if(!x)return 'toast://规则不存在'; var on=r.toggleFav(x); refreshPage(false); return 'toast://'+(on?'已收藏':'已取消收藏'); }, item.id)}
                ]
            }
        };
    };

    R.home = function() {
        setPageTitle('我的规则仓库');
        var d = [], items, manifest;
        try {
            manifest = this.manifest(false);
            items = (manifest.items || []).map(this.normalizeItem.bind(this));
        } catch (e) {
            d.push({title:'仓库读取失败',desc:String(e.message||e),url:'hiker://empty',col_type:'long_text'});
            setResult(d); return;
        }

        var state = this.filterState();
        var stats = this.stats(items);
        var repoItem = this.findById('rule-repo') || {name:'我的规则仓库',category:'tools'};
        d.push({
            title:'<b>天空的海阔云仓库</b><br><small><font color="#7A8089">规则管理中心 · ' + items.length + ' 个程序 · ' + stats.remote + ' 个远程版</font></small>',
            img:this.iconOf(repoItem), pic_url:this.iconOf(repoItem),
            url:'hiker://page/ruleRepoVersions?rule=&simple=true',
            col_type:'movie_1_left_pic', extra:{lineVisible:false,pageTitle:'版本中心'}
        });

        d.push({
            title:'搜索名称 / 描述 / 标签 / 分类 / 版本',
            url:$.toString(function(){ putMyVar('hc_repo_kw',String(input||'').trim()); refreshPage(false); }),
            col_type:'input',
            extra:{titleVisible:false,defaultValue:state.keyword,onChange:$.toString(function(){ putMyVar('hc_repo_kw',String(input||'')); })}
        });

        d.push({title:'刷新',col_type:'text_3',url:$('#noLoading#').lazyRule(function(){ var r=$.require('hiker://page/ruleRepoCore'); r.clearManifestCache(); refreshPage(false); return 'toast://仓库索引已刷新'; }),extra:{lineVisible:false}});
        d.push({title:'版本',col_type:'text_3',url:'hiker://page/ruleRepoVersions?rule=&simple=true',extra:{lineVisible:false,pageTitle:'版本中心'}});
        d.push({title:'设置',col_type:'text_3',url:'hiker://page/ruleRepoSettings?rule=&simple=true',extra:{lineVisible:false,pageTitle:'仓库设置'}});
        d.push({col_type:'blank_block'});

        this.categories(items).forEach(function(c){
            d.push({
                title:R.fmtTitle(c.name,state.category===c.id), col_type:'scroll_button',
                url:$('#noLoading#').lazyRule(function(id){ putMyVar('hc_repo_category',id); putMyVar('hc_repo_sub','all'); putMyVar('hc_repo_tag','all'); refreshPage(false); return 'hiker://empty'; },c.id)
            });
        });

        var subs = this.subCategories(items,state.category);
        if (subs.length > 2) {
            d.push({col_type:'blank_block'});
            subs.forEach(function(s){
                var title=s==='all'?'全部子类':s;
                d.push({title:R.fmtTitle(title,state.subCategory===s),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_sub',v);putMyVar('hc_repo_tag','all');refreshPage(false);return 'hiker://empty';},s)});
            });
        }

        if (this.getSetting('show_tags','1') === '1') {
            var tags = this.tagsFor(items,state);
            if (tags.length) {
                d.push({col_type:'blank_block'});
                d.push({title:R.fmtTitle('全部标签',state.tag==='all'),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(){putMyVar('hc_repo_tag','all');refreshPage(false);return 'hiker://empty';})});
                tags.forEach(function(t){ d.push({title:R.fmtTitle('#'+t,state.tag===t),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_tag',v);refreshPage(false);return 'hiker://empty';},t)}); });
            }
        }

        d.push({col_type:'blank_block'});
        [['默认','default'],['最近更新','updated'],['名称','name'],['版本','version']].forEach(function(s){
            d.push({title:R.fmtTitle(s[0],state.sort===s[1]),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_sort',v);refreshPage(false);return 'hiker://empty';},s[1])});
        });

        var filtered = this.applyFilters(items,state);
        d.push({title:'▌ 程序  ' + filtered.length + ' / ' + items.length + (state.keyword ? '  ·  搜索：' + state.keyword : ''),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        filtered.forEach(function(x){ d.push(R.itemCard(x)); });
        if (!filtered.length) d.push({title:'没有匹配的程序',desc:'可以清空搜索词或切换分类 / 子分类 / 标签。',url:'hiker://empty',col_type:'text_center_1'});

        d.push({col_type:'blank_block'});
        d.push({title:'云端索引',desc:'Schema ' + (manifest.schema||'?') + ' · ' + (manifest.updated||'') + '\n筛选、分类与图标直接读取 manifest 元数据，避免逐个远程解析规则。',url:'hiker://empty',col_type:'long_text'});
        setResult(d);
    };

    R.searchPage = function() {
        setPageTitle('搜索规则');
        var d=[], kw=String(getParam('kw','')||getParam('s','')||'').trim(), items;
        try{items=this.items(false);}catch(e){d.push({title:'仓库读取失败',desc:String(e.message||e),url:'hiker://empty',col_type:'long_text'});setResult(d);return;}
        d.push({title:'搜索规则',url:$.toString(function(){return 'hiker://search?s='+encodeURIComponent(input)+'&rule='+encodeURIComponent(MY_RULE.title);}),col_type:'input',extra:{titleVisible:false,defaultValue:kw}});
        var a=items.filter(function(x){return R.matchKeyword(x,kw);});
        d.push({title:'▌ 搜索结果  '+a.length+' / '+items.length+(kw?'  ·  '+kw:''),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        a.forEach(function(x){d.push(R.itemCard(x));});
        if(!a.length)d.push({title:'没有匹配的程序',url:'hiker://empty',col_type:'text_center_1'});
        setResult(d);
    };
})(HikerRuleRepo);
