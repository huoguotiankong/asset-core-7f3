/* 我的规则仓库 v3.5.0-rc6 - app-store style cards */
(function(R){
R.itemCard=function(item){
  var group=item.entryType==='channel-group',st=this.displayStatus(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,line1,line2;
  if(group){line1='正式版 / 测试版 · 统一入口';line2='进入后选择需要的版本';}
  else{line1=this.cleanVersion(item.version)+(st!=='未导入'?' · '+st:'');line2=String(item.desc||item.categoryName+' / '+item.subCategory);if(last)line2+=' · '+this.formatShortTime(last)+' 使用';}
  var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id};
  if(!group)extra.longClick=[{title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},{title:st==='有新版本'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},{title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}];
  return{title:(fav?'★ ':'')+item.name+(st==='有新版本'?'  ↑':''),desc:line1+'\n'+line2,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.selectCard=function(item){var on=this.isSelected(item);return{title:(on?'✓ ':'○ ')+item.name,desc:this.cleanVersion(item.version)+' · '+this.displayStatus(item),img:this.iconOf(item),pic_url:this.iconOf(item),url:$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';r.toggleSelected(x);refreshPage(false);return'hiker://empty';},item.id),col_type:'icon_1_left_pic',extra:{lineVisible:false}};};
R.recentTile=function(item){return{title:item.name,img:this.iconOf(item),pic_url:this.iconOf(item),url:$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id),col_type:'icon_small_4',extra:{lineVisible:false}};};
})(HikerRuleRepo);
