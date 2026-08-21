/* 我的规则仓库 3.5.3-rc8 - Native App Shell 5.1 compact category center */
(function(R){
R.categoryPage=function(){
 setPageTitle('分类管理');var d=[],items;try{items=this.items(false);}catch(e){setResult([{title:'暂时无法读取分类',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var state=this.filterState(),advanced=String(getMyVar('hc_repo_category_advanced','0'))==='1',batch=this.batchMode(),cats=this.categories(items),subs=this.subCategories(items,state.category),i;
 d.push(this.sectionToolbar('分类与标签','search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 this.pushSection(d,'主分类','按内容类型快速缩小范围');
 for(i=0;i<cats.length;i++)d.push(this.scopeChip(cats[i].name+' '+cats[i].count,cats[i].id,state.category,'hc_repo_category'));
 this.pushSection(d,'子分类',state.category==='all'?'按功能或内容继续细分':'当前主分类下继续细分');
 for(i=0;i<subs.length;i++)d.push(this.scopeChip(subs[i].name+' '+subs[i].count,subs[i].id,state.subCategory,'hc_repo_sub'));
 d.push(this.sectionLine());
 d.push({title:advanced?'收起高级筛选':'高级筛选',col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(){var on=String(getMyVar('hc_repo_category_advanced','0'))==='1';putMyVar('hc_repo_category_advanced',on?'0':'1');refreshPage(false);return'hiker://empty';}),extra:{lineVisible:false}});
 d.push({title:'重置',col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.clearAllFilters();clearMyVar('hc_repo_category_advanced');r.clearSelection();r.setBatchMode(false);refreshPage(false);return'toast://筛选已重置';}),extra:{lineVisible:false}});
 if(advanced){
  var fresh=this.filterState(),tags=this.tagsFor(items,fresh);
  this.pushSection(d,'能力标签','需要时再展开，不占日常首屏');d.push(this.scopeChip('全部','all',fresh.tag,'hc_repo_tag'));for(var t=0;t<Math.min(tags.length,10);t++)d.push(this.scopeChip(tags[t].name+' '+tags[t].count,tags[t].name,fresh.tag,'hc_repo_tag'));
  this.pushSection(d,'运行方式','');d.push(this.scopeChip('全部','all',fresh.mode,'hc_repo_mode'));d.push(this.scopeChip('远程','remote',fresh.mode,'hc_repo_mode'));d.push(this.scopeChip('本地','local',fresh.mode,'hc_repo_mode'));
  this.pushSection(d,'排序与管理','');[['默认','default'],['最近更新','updated'],['名称','name'],['版本','version']].forEach(function(x){d.push(R.scopeChip(x[0],x[1],fresh.sort,'hc_repo_sort'));});d.push({title:batch?'退出批量':'批量管理',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.setBatchMode(!r.batchMode());refreshPage(false);return'hiker://empty';}),col_type:'scroll_button',extra:{lineVisible:false}});
 }
 var current=this.filterState(),result=this.applyFilters(items,current);
 if(batch){this.pushSection(d,'批量管理','已选择 '+this.selectedIds().length+' 个');d.push({title:'收藏',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),n=r.batchFavorite(true);refreshPage(false);return'toast://已处理 '+n+' 项';}),col_type:'text_3'});d.push({title:'取消收藏',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),n=r.batchFavorite(false);refreshPage(false);return'toast://已处理 '+n+' 项';}),col_type:'text_3'});d.push({title:'清空选择',url:$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');r.clearSelection();refreshPage(false);return'toast://已清空';}),col_type:'text_3'});}
 d.push(this.sectionLine());d.push(this.sectionToolbar('分类结果 · '+result.length,'filter','hiker://empty'));d.push({title:this.filterSummary(current),col_type:'scroll_button',url:'hiker://empty',extra:{lineVisible:false}});
 for(i=0;i<result.length;i++){if(batch)d.push(this.selectCard(result[i]));else this.pushProgram(d,result[i],false);}if(!result.length)this.pushEmpty(d,'没有匹配程序','调整分类或重置筛选后再试。');
 d.push(this.sectionLine());this.pushNav(d,'category');setResult(d);
};
})(HikerRuleRepo);
