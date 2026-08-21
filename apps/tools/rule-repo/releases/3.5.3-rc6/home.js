/* 我的规则仓库 3.5.3-rc6 - Product UI 4.0 home */
(function(R){
R.home=function(){
 setPageTitle(this.productTitle());var d=[],m,items;
 try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法打开程序库',desc:this.friendlyError(e),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),sort=String(getMyVar('hc_repo_home_sort','default')||'default');
 d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://page/ruleRepoAbout?rule=&simple=true'));
 var cats=this.categories(items);for(var ci=0;ci<cats.length;ci++)d.push(this.scopeChip(cats[ci].name+(cats[ci].id==='all'?' '+cats[ci].count:''),cats[ci].id,cat,'hc_repo_home_category'));
 d.push(this.sectionLine());
 d.push(this.metricCard('全部',stats.all,'all',view,'hc_repo_home_view'));d.push(this.metricCard('已安装',stats.installed,'installed',view,'hc_repo_home_view'));d.push(this.metricCard('可更新',stats.updates,'updates',view,'hc_repo_home_view'));d.push(this.metricCard('收藏',stats.favorites,'favorites',view,'hc_repo_home_view'));
 d.push(this.sectionLine());
 var state={keyword:'',view:view,category:cat,subCategory:'all',tag:'all',sort:sort,mode:'all'},filtered=this.applyFilters(items,state),pair=this.sectionTitlePair('我的程序 · '+filtered.length,sort==='default'?'默认排序 ▾':(sort==='updated'?'最近更新 ▾':(sort==='name'?'名称排序 ▾':'版本排序 ▾')),$('默认排序,最近更新,名称排序,版本排序','排序方式').select(function(){var map={'默认排序':'default','最近更新':'updated','名称排序':'name','版本排序':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return'hiker://empty';}));
 d.push(pair[0]);d.push(pair[1]);
 d.push({title:'筛选',col_type:'scroll_button',url:'hiker://page/ruleRepoCategory?rule=&simple=true',extra:{lineVisible:false}});
 d.push({title:'同步',col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();r.clearPresenceCache&&r.clearPresenceCache();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),extra:{lineVisible:false}});
 d.push({title:view==='favorites'?'查看全部':'只看收藏',col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_home_view',v==='favorites'?'all':'favorites');refreshPage(false);return'hiker://empty';},view),extra:{lineVisible:false}});
 for(var i=0;i<filtered.length;i++)this.pushProgram(d,filtered[i],true);
 if(!filtered.length)this.pushEmpty(d,view==='updates'?'当前没有待更新程序':'这里暂时没有程序',view==='favorites'?'收藏后会显示在这里。':'可以切换分类或状态查看。');
 if(stats.updates>0)d.push(this.compactInfo('发现 '+stats.updates+' 个可更新程序','进入更新中心逐项确认','hiker://page/ruleRepoUpdates?rule=&simple=true'));
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};
})(HikerRuleRepo);
