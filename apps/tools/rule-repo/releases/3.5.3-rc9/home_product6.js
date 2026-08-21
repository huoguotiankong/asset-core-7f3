/* 我的规则仓库 3.5.3-rc9 - Product Hub 6.0 home renderer */
(function(R){
R.homeProductVersion='6.0.0';
R.homeScopeChip=function(title,value,active,key){
 var on=String(active)===String(value),text=(on?'● ':'')+String(title||'');
 return{title:text,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,id:'rule-repo-home-scope-'+String(value)}};
};
R.homeProgramCard=function(item){
 var group=item.entryType==='channel-group',st=this.productStatusShort(item),fav=this.isFav(item),meta='',desc='',tags=[];
 if(group){
  meta='正式版 / 测试版 / 本地版';
  desc='版本中心 · 更新 · 恢复';
 }else{
  meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序');
  tags=(item.tags||[]).slice(0,2);
  desc=(tags.length?tags.join(' · '):String(item.subCategory||''));
  if(st)desc+=(desc?' · ':'')+st;
  if(fav)desc+=(desc?' · ':'')+'★ 收藏';
 }
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,id:'rule-repo-home-item6-'+String(item.id),cls:'rule-repo-home-program6'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st.indexOf('可更新')>=0?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:item.name,desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.pushHomeProgram=function(d,item){d.push(this.homeProgramCard(item));d.push(this.programLine());};
})(HikerRuleRepo);
