/* 我的规则仓库 v3.5.0-rc8 - resilient visual home */
(function(R){
R.home=function(){
setPageTitle(this.productTitle());var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法连接云端仓库',desc:'当前也没有可用的本地目录缓存。\n请稍后重试，或进入“测试版更新”升级修复版本。',url:'hiker://page/ruleRepoUpdate?rule=&simple=true',col_type:'text_center_1'}]);return;}
var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),recent=this.recentItems?this.recentItems(items,4):[],favs=this.favoriteItems?this.favoriteItems(items).slice(0,4):[],edition=this.isTestChannel()?'测试版 · 新功能先行':'正式版 · 稳定通道';
d.push(this.hero(this.productTitle(),items.length+' 个程序 · '+edition+'\n云端目录自动保持最新',this.iconOf(repo),'hiker://page/ruleRepoUpdates?rule=&simple=true'));
this.pushNav(d,'home');this.pushUiNotice(d);
var cats=this.categories(items);for(var ci=0;ci<cats.length;ci++)d.push(this.scopeChip(cats[ci].name+' '+cats[ci].count,cats[ci].id,cat,'hc_repo_home_category'));
if(stats.updates>0)d.push({title:'发现 '+stats.updates+' 个程序有新版本',desc:'进入更新中心查看并逐项更新',url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'text_1',extra:{lineVisible:false}});
if(recent.length){this.pushSpacer(d);this.pushSection(d,'继续使用','最近从规则仓库打开过的程序');recent.forEach(function(x){d.push(R.recentTile(x));});}else if(favs.length){this.pushSpacer(d);this.pushSection(d,'我的收藏','常用程序会更容易找到');favs.forEach(function(x){d.push(R.recentTile(x));});}
this.pushSpacer(d);this.pushSection(d,'程序库',(cat==='all'?'全部分类':this.categoryName(cat))+' · '+({all:'全部',installed:'已导入',updates:'有更新',favorites:'收藏'}[view]||view));
d.push(this.scopeChip('全部 '+stats.all,'all',view,'hc_repo_home_view'));d.push(this.scopeChip('已导入 '+stats.installed,'installed',view,'hc_repo_home_view'));d.push(this.scopeChip('有更新 '+stats.updates,'updates',view,'hc_repo_home_view'));d.push(this.scopeChip('收藏 '+stats.favorites,'favorites',view,'hc_repo_home_view'));
d.push({title:'排序',url:$('默认排序,最近更新,名称,版本','排序方式').select(function(){var map={'默认排序':'default','最近更新':'updated','名称':'name','版本':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return'hiker://empty';}),col_type:'flex_button',extra:{lineVisible:false}});
d.push({title:'同步',url:$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，请稍后重试';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://云端暂不可用，已继续使用本地缓存';}catch(e){hideLoading();return'toast://同步失败，已保留原目录';}}),col_type:'flex_button',extra:{lineVisible:false}});
var state={keyword:'',view:view,category:cat,subCategory:'all',tag:'all',sort:String(getMyVar('hc_repo_home_sort','default')||'default'),mode:'all'},filtered=this.applyFilters(items,state);filtered.forEach(function(x){d.push(R.itemCard(x));});if(!filtered.length)this.pushEmpty(d,view==='updates'?'当前没有待更新程序':'这里暂时没有程序',view==='favorites'?'收藏后会显示在这里。':'可以切换分类或状态查看。');
d.push({col_type:'blank_block'});d.push({title:'云端目录可离线使用',desc:'最近同步 '+this.formatShortTime(this.lastManifestTime())+' · 网络异常不会主动删除有效缓存',url:'hiker://page/ruleRepoSettings?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}});setResult(d);
};
})(HikerRuleRepo);
