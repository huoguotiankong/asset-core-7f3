/* 我的规则仓库 v3.4.0 - enhanced dashboard home */
(function(R){
R.home=function(){setPageTitle('我的规则仓库');var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'仓库读取失败',desc:String(e.message||e),url:'hiker://empty',col_type:'long_text'}]);return;}var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all');
d.push({title:'我的规则仓库',desc:'海阔视界专属 · 规则管理中心\nCore '+this.version+' · 共 '+stats.all+' 个程序 · 远程 '+stats.remote+' / 本地 '+stats.local,img:this.iconOf(repo),pic_url:this.iconOf(repo),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'movie_1_left_pic',extra:{lineVisible:false,pageTitle:'更新中心'}});
this.pushNav(d,'home');
var statUrl=function(v){return $('#noLoading#').lazyRule(function(x){putMyVar('hc_repo_home_view',x);refreshPage(false);return'hiker://empty';},v);};
d.push(this.statCard('全部',stats.all,statUrl('all')));d.push(this.statCard('已记录',stats.installed,statUrl('installed')));d.push(this.statCard('可更新',stats.updates,statUrl('updates')));d.push(this.statCard('收藏',stats.favorites,statUrl('favorites')));
this.pushSection(d,'快捷入口','常用管理操作');d.push(this.quickCard('分类筛选','hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.quickCard('导入记录','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.quickCard('更新中心','hiker://page/ruleRepoUpdates?rule=&simple=true'));
d.push({title:'状态',desc:'远程 '+stats.remote+' · 本地 '+stats.local+' · 最近使用 '+stats.recent+' · 上次索引 '+this.formatTime(this.lastManifestTime()),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
var state={keyword:'',view:view,category:'all',subCategory:'all',tag:'all',sort:'default',mode:'all'},filtered=this.applyFilters(items,state),viewName={all:'全部程序',installed:'已记录',updates:'可更新',favorites:'我的收藏',recent:'最近使用'}[view]||'全部程序';
d.push({title:viewName+'  '+filtered.length,url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false,textAlign:'left'}});d.push({title:'最近',url:$('#noLoading#').lazyRule(function(){putMyVar('hc_repo_home_view','recent');refreshPage(false);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
filtered.forEach(function(x){d.push(R.itemCard(x));});if(!filtered.length)this.pushEmpty(d,'这里暂时没有程序',view==='updates'?'当前记录的程序都已是最新版本。':'可以切换其它状态查看。');
d.push({col_type:'blank_block'});d.push({title:'Core '+this.version+' · Schema '+(m.schema||'?'),desc:'首页只保留总览、快捷入口和程序列表；低频管理集中到独立页面。',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});setResult(d);};
})(HikerRuleRepo);
