/* 我的规则仓库 v3.5.0-rc4 - cleaner dashboard */
(function(R){
R.home=function(){
setPageTitle(this.statePrefix.indexOf('test')>=0?'我的规则仓库·测试版':'我的规则仓库');var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'仓库读取失败',desc:String(e.message||e),url:'hiker://empty',col_type:'long_text'}]);return;}
var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),edition=this.statePrefix.indexOf('test')>=0?'测试通道':'正式通道';
d.push({title:'我的规则仓库',desc:'海阔视界专属 · 云端程序管理中心\nCore '+this.version+' · '+edition+' · 索引自动同步',img:this.iconOf(repo),pic_url:this.iconOf(repo),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'movie_1_left_pic',extra:{lineVisible:false,pageTitle:'更新中心'}});
var cats=this.categories(items);for(var ci=0;ci<cats.length;ci++)d.push(this.categoryTab(cats[ci].name,cats[ci].id,cat));
this.pushNav(d,'home');
var statUrl=function(v){return $('#noLoading#').lazyRule(function(x){putMyVar('hc_repo_home_view',x);refreshPage(false);return'hiker://empty';},v);};
d.push(this.statCard('全部程序',stats.all,statUrl('all')));d.push(this.statCard('已记录',stats.installed,statUrl('installed')));d.push(this.statCard('可更新',stats.updates,statUrl('updates')));d.push(this.statCard('收藏',stats.favorites,statUrl('favorites')));
this.pushSpacer(d);this.pushSection(d,'程序库','当前分类 '+(cat==='all'?'全部':this.categoryName(cat))+' · '+({all:'全部',installed:'已记录',updates:'可更新',favorites:'收藏'}[view]||view));
d.push({title:'排序：'+({'default':'默认','updated':'最近更新','name':'名称','version':'版本'}[String(getMyVar('hc_repo_home_sort','default')||'default')]||'默认'),url:$('默认排序,最近更新,名称,版本','选择排序').select(function(){var map={'默认排序':'default','最近更新':'updated','名称':'name','版本':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
d.push({title:'刷新云端',url:$('#noLoading#').lazyRule(function(){showLoading('同步云端索引…');try{var r=$.require('hiker://page/ruleRepoCore');r.clearManifestCache();r.manifest(true);hideLoading();refreshPage(false);return'toast://云端索引已同步';}catch(e){hideLoading();return'toast://同步失败：'+String(e.message||e);}}),col_type:'text_2',extra:{lineVisible:false}});
var state={keyword:'',view:view,category:cat,subCategory:'all',tag:'all',sort:String(getMyVar('hc_repo_home_sort','default')||'default'),mode:'all'},filtered=this.applyFilters(items,state);filtered.forEach(function(x){d.push(R.itemCard(x));});if(!filtered.length)this.pushEmpty(d,'这里暂时没有程序',view==='updates'?'当前记录的程序都已是最新版本。':'可以切换分类或状态查看。');
d.push({col_type:'blank_block'});d.push({title:'Core '+this.version+' · Schema '+(m.schema||'?'),desc:'云端索引 '+String(m.updated||m.updatedAt||'未标记')+' · 自动探测变更 · 旧缓存兜底',url:'hiker://page/ruleRepoSettings?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}});setResult(d);
};
})(HikerRuleRepo);
