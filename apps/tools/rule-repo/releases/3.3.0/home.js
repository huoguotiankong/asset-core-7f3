/* 我的规则仓库 v3.3.0 - professional dashboard home */
(function(R){
R.home=function(){setPageTitle('我的规则仓库');var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'仓库读取失败',desc:String(e.message||e),url:'hiker://empty',col_type:'long_text'}]);return;}var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all');
d.push({title:'我的规则仓库',desc:'海阔视界专属 · 规则管理中心\nCore '+this.version+' · '+stats.all+' 个程序 · '+stats.remote+' 个远程版',img:this.iconOf(repo),pic_url:this.iconOf(repo),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'movie_1_left_pic',extra:{lineVisible:false,pageTitle:'更新中心'}});
this.pushNav(d,'home');
var statUrl=function(v){return $('#noLoading#').lazyRule(function(x){putMyVar('hc_repo_home_view',x);refreshPage(false);return'hiker://empty';},v);};
d.push(this.statCard('全部',stats.all,statUrl('all')));d.push(this.statCard('已记录',stats.installed,statUrl('installed')));d.push(this.statCard('可更新',stats.updates,statUrl('updates')));d.push(this.statCard('收藏',stats.favorites,statUrl('favorites')));
var state={keyword:'',view:view,category:'all',subCategory:'all',tag:'all',sort:'default',mode:'all'},filtered=this.applyFilters(items,state),viewName={all:'全部程序',installed:'已记录',updates:'可更新',favorites:'我的收藏',recent:'最近使用'}[view]||'全部程序';
d.push({title:viewName+'  '+filtered.length,url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false,textAlign:'left'}});d.push({title:'分类 / 筛选',url:'hiker://page/ruleRepoCategory?rule=&simple=true',col_type:'text_2',extra:{lineVisible:false}});
filtered.forEach(function(x){d.push(R.itemCard(x));});if(!filtered.length)this.pushEmpty(d,'这里暂时没有程序',view==='updates'?'当前记录的程序都已是最新版本。':'可以切换其它状态查看。');
d.push({col_type:'blank_block'});d.push({title:'Core '+this.version+' · Schema '+(m.schema||'?'),desc:'首页只保留高频入口；分类、搜索、更新和设置均已独立成页。',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});setResult(d);};
})(HikerRuleRepo);
