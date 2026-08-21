/* 我的规则仓库 v3.5.0-rc11 - simplified category center */
(function(R){
R.categoryPage=function(){
 setPageTitle('分类');var d=[],items;
 try{items=this.items(false);}catch(e){setResult([{title:'分类暂时不可用',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 var state=this.filterState(),batch=this.batchMode(),advanced=String(getMyVar('hc_repo_category_advanced','0'))==='1';
 this.pushNav(d,'category');
 this.pushSection(d,'分类管理','先选主分类，需要时再展开高级筛选');
 var cats=this.categories(items);for(var i=0;i<cats.length;i++)d.push(this.categoryChip(cats[i].name+' '+cats[i].count,cats[i].id,state.category));
 state=this.filterState();
 if(state.category!=='all'){
  var subs=this.subCategories(items,state.category);
  if(subs.length>1){this.pushSpacer(d);this.pushSection(d,'子分类','');for(var si=0;si<subs.length;si++)d.push(this.scopeChip(subs[si].name+' '+subs[si].count,subs[si].id,state.subCategory,'hc_repo_sub'));}
 }
 this.pushSpacer(d);
 d.push({title:advanced?'收起高级筛选':'高级筛选',url:$('#noLoading#').lazyRule(function(){var on=String(getMyVar('hc_repo_category_advanced','0'))==='1';putMyVar('hc_repo_category_advanced',on?'0':'1');refreshPage(false);return'hiker://empty';}),col_type:'flex_button',extra:{lineVisible:false}});
 d.push({title:'重置',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.clearAllFilters();refreshPage(false);return'toast://筛选已重置';}),col_type:'flex_button',extra:{lineVisible:false}});
 if(advanced){
  state=this.filterState();var tags=this.tagsFor(items,state);
  if(tags.length){this.pushSpacer(d);this.pushSection(d,'能力标签','按功能继续缩小范围');d.push(this.scopeChip('全部','all',state.tag,'hc_repo_tag'));for(var ti=0;ti<Math.min(tags.length,12);ti++)d.push(this.scopeChip(tags[ti].name+' '+tags[ti].count,tags[ti].name,state.tag,'hc_repo_tag'));}
  this.pushSpacer(d);this.pushSection(d,'运行方式','');[['全部','all'],['远程','remote'],['本地','local']].forEach(function(x){d.push(R.scopeChip(x[0],x[1],state.mode,'hc_repo_mode'));});
  this.pushSection(d,'排序','');[['默认','default'],['最近更新','updated'],['名称','name'],['版本','version']].forEach(function(x){d.push(R.scopeChip(x[0],x[1],state.sort,'hc_repo_sort'));});
  d.push({title:batch?'退出批量':'批量管理',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.setBatchMode(!r.batchMode());refreshPage(false);return'hiker://empty';}),col_type:'flex_button',extra:{lineVisible:false}});
 }
 state=this.filterState();var result=this.applyFilters(items,state);
 if(batch){var n=this.selectedIds().length;this.pushSpacer(d);this.pushSection(d,'批量管理','已选择 '+n+' 个程序');d.push({title:'收藏',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),n=r.batchFavorite(true);refreshPage(false);return'toast://已处理 '+n+' 项';}),col_type:'text_3'});d.push({title:'取消收藏',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),n=r.batchFavorite(false);refreshPage(false);return'toast://已处理 '+n+' 项';}),col_type:'text_3'});d.push({title:'清空选择',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.clearSelection();refreshPage(false);return'toast://已清空';}),col_type:'text_3'});}
 this.pushSpacer(d);this.pushSection(d,batch?'选择程序':'分类结果','共 '+result.length+' 个 · '+this.filterSummary(state));
 result.forEach(function(x){d.push(batch?R.selectCard(x):R.itemCard(x));});
 if(!result.length)this.pushEmpty(d,'没有匹配结果','调整分类或重置筛选后再试。');
 setResult(d);
};
})(HikerRuleRepo);
