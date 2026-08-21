/* 我的规则仓库 3.5.3-rc2 - premium home */
(function(R){
R.home=function(){
 setPageTitle(this.productTitle());var d=[],m,items;
 try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法打开程序库',desc:this.friendlyError(e),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),sort=String(getMyVar('hc_repo_home_sort','default')||'default');
 d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心\n'+stats.all+' 个程序 · '+(this.isTestChannel()?'测试通道':'正式通道'),this.iconOf(repo),'hiker://page/ruleRepoAbout?rule=&simple=true'));
 this.pushNav(d,'home');
 this.pushSpacer(d);
 d.push(this.metricCard('全部',stats.all,'all',view,'hc_repo_home_view'));
 d.push(this.metricCard('已记录',stats.installed,'installed',view,'hc_repo_home_view'));
 d.push(this.metricCard('可更新',stats.updates,'updates',view,'hc_repo_home_view'));
 d.push(this.metricCard('收藏',stats.favorites,'favorites',view,'hc_repo_home_view'));
 this.pushSpacer(d);this.pushSection(d,'快捷入口','常用操作集中在这里');
 d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));
 d.push(this.quickAction('搜索程序','search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdates?rule=&simple=true'));
 d.push(this.quickAction('备份恢复','history','hiker://page/ruleRepoSettings?rule=&simple=true'));
 this.pushSpacer(d);this.pushSection(d,'程序分类','快速缩小范围');
 var cats=this.categories(items);for(var ci=0;ci<cats.length;ci++)d.push(this.scopeChip(cats[ci].name+(cats[ci].id==='all'?' '+cats[ci].count:''),cats[ci].id,cat,'hc_repo_home_category'));
 if(stats.updates>0){this.pushSpacer(d);d.push(this.compactInfo('发现 '+stats.updates+' 个可更新程序','进入更新中心统一查看','hiker://page/ruleRepoUpdates?rule=&simple=true'));}
 this.pushSpacer(d);this.pushSection(d,'我的程序',cat==='all'?'全部程序':this.categoryName(cat));
 d.push({title:'排序',url:$('默认排序,最近更新,名称,版本','排序方式').select(function(){var map={'默认排序':'default','最近更新':'updated','名称':'name','版本':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return'hiker://empty';}),col_type:'flex_button',extra:{lineVisible:false}});
 d.push({title:'同步',url:$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),col_type:'flex_button',extra:{lineVisible:false}});
 var state={keyword:'',view:view,category:cat,subCategory:'all',tag:'all',sort:sort,mode:'all'},filtered=this.applyFilters(items,state);filtered.forEach(function(x){d.push(R.itemCard(x));});if(!filtered.length)this.pushEmpty(d,view==='updates'?'当前没有待更新程序':'这里暂时没有程序',view==='favorites'?'收藏后会显示在这里。':'可以切换分类或状态查看。');
 setResult(d);
};
})(HikerRuleRepo);
