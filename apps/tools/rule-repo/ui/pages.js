/* 我的规则仓库 v3.0.0 - detail/settings/version pages */
(function(R){
    R.detail = function() {
        var id = String((MY_PARAMS && MY_PARAMS.hc_repo_item_id) || getParam('id') || '');
        var item = this.findById(id, false), d=[];
        if(!item){ d.push({title:'规则不存在或云端索引已更新',col_type:'text_center_1',url:'hiker://empty'}); setResult(d); return; }
        setPageTitle(item.name);
        try{ setPagePicUrl(this.iconOf(item)); }catch(e){}
        d.push({title:'<b>'+item.name+'</b><br><small>'+item.categoryName+' / '+item.subCategory+'</small>',desc:item.desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
        d.push({title:'导入 / 更新',col_type:'text_2',url:$('#noLoading#').lazyRule(function(raw){ return $.require('hiker://page/ruleRepoCore').importRule(raw); },JSON.stringify(item.raw)),extra:{lineVisible:false}});
        d.push({title:this.isFav(item)?'★ 已收藏':'☆ 收藏',col_type:'text_2',url:$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore');var x=r.findById(id);if(!x)return 'toast://规则不存在';var on=r.toggleFav(x);refreshPage(false);return 'toast://'+(on?'已收藏':'已取消收藏');},item.id),extra:{lineVisible:false}});
        d.push({col_type:'blank_block'});
        d.push({title:'版本',desc:item.version||'未标记',url:'hiker://empty',col_type:'text_1'});
        d.push({title:'运行模式',desc:item.mode==='remote'?'自用远程代码版':(item.mode==='share'?'纯本地分享版':'本地/旧架构'),url:'hiker://empty',col_type:'text_1'});
        d.push({title:'分类',desc:item.categoryName+' / '+item.subCategory,url:'hiker://empty',col_type:'text_1'});
        d.push({title:'标签',desc:(item.tags||[]).join(' · ')||'无',url:'hiker://empty',col_type:'text_1'});
        d.push({title:'更新时间',desc:item.updatedAt||'未标记',url:'hiker://empty',col_type:'text_1'});
        d.push({title:'仓库路径',desc:item.path,url:'copy://'+item.path,col_type:'text_1'});
        setResult(d);
    };

    R.versions = function() {
        setPageTitle('版本中心');
        var d=[], m, items;
        try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){d.push({title:'读取失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'});setResult(d);return;}
        var remoteInfo='';
        try{ if(typeof RuleRepoBoot==='object'){ var i=RuleRepoBoot.info(); remoteInfo='当前核心 '+(i.current&&i.current.version||this.version)+' (build '+(i.current&&i.current.build||this.build)+')'+(i.previous?'\n上一核心 '+i.previous.version+' (build '+i.previous.build+')':''); } }catch(e){}
        d.push({title:'我的规则仓库',desc:'Core '+this.version+' / build '+this.build+'\n'+(remoteInfo||'Remote Module 架构'),img:this.iconOf(this.findById('rule-repo')||{}),url:'hiker://page/ruleRepoUpdate?rule=&simple=true',col_type:'movie_1_left_pic',extra:{lineVisible:false,pageTitle:'远程更新'}});
        d.push({title:'云端程序版本',desc:'索引 Schema '+(m.schema||'?')+' · '+(m.updated||''),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        items.forEach(function(x){d.push({title:x.name+'  '+x.version,desc:x.categoryName+' / '+x.subCategory+' · '+(x.mode==='remote'?'远程':'本地'),img:R.iconOf(x),pic_url:R.iconOf(x),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'avatar',extra:{lineVisible:false,pageTitle:x.name,hc_repo_item_id:x.id}});});
        setResult(d);
    };

    R.settings = function() {
        setPageTitle('仓库设置');
        var d=[], showTags=this.getSetting('show_tags','1'), cache=this.cacheMs();
        d.push({title:'显示标签筛选：'+(showTags==='1'?'开':'关'),desc:'程序较多时可通过标签二次筛选。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.setSetting('show_tags',r.getSetting('show_tags','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
        d.push({title:'索引缓存：'+Math.round(cache/1000)+' 秒',desc:'只缓存 manifest；点击首页“刷新”可立即更新。',col_type:'text_1',url:$(['0','30','60','180','600'].map(function(x){return x+' 秒';}).join(','),'选择缓存秒数').select(function(){var v=String(input||'60 秒').replace(/\D/g,'')||'60';var r=$.require('hiker://page/ruleRepoCore');r.setSetting('cache_ms',Number(v)*1000);r.clearManifestCache();refreshPage(false);return 'toast://已设置';})});
        d.push({title:'清空搜索与筛选',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){['hc_repo_kw','hc_repo_category','hc_repo_sub','hc_repo_tag','hc_repo_sort'].forEach(function(k){clearMyVar(k);});refreshPage(false);return 'toast://已重置';})});
        d.push({title:'清空仓库索引缓存',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.clearManifestCache();return 'toast://缓存已清空';})});
        d.push({title:'远程更新与回退',desc:'检查我的规则仓库 Core 新版本、重新加载当前版本或回退上一稳定版本。',col_type:'text_1',url:'hiker://page/ruleRepoUpdate?rule=&simple=true'});
        d.push({title:'架构信息',desc:'Shell / Bootstrap / Repository Core / Filter / Home UI / Pages UI 分层。以后新增功能优先修改对应模块，避免一个改动影响其它页面。',url:'hiker://empty',col_type:'long_text'});
        d.push({title:'版本',desc:'我的规则仓库 Core v'+this.version+' · build '+this.build,url:'hiker://empty',col_type:'text_1'});
        setResult(d);
    };
})(HikerRuleRepo);
