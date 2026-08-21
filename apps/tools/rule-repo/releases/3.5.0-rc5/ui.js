/* 我的规则仓库 v3.5.0-rc5 - refined product UI */
(function(R){
R.statusLabel=function(item){if(item&&item.entryType==='channel-group')return'多版本';var s=this.statusOf(item);return s==='可更新'?'可更新':(s==='已同步'?'已同步':'未记录');};
R.statusIcon=function(item){var s=this.statusLabel(item);return s==='可更新'?'↑':(s==='已同步'?'✓':(s==='多版本'?'◇':'·'));};
R.itemCard=function(item){
  var group=item.entryType==='channel-group',st=this.statusLabel(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,line1,line2;
  if(group){line1='正式 / 测试 · 统一入口';line2='多版本通道 · 点击选择需要的版本';}
  else{line1=[String(item.version||'未标记'),this.modeText(item.mode),this.statusIcon(item)+' '+st].join(' · ');line2=item.categoryName+' / '+item.subCategory+(last?' · 最近使用 '+this.formatTime(last).slice(5):'');}
  var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id};
  if(!group)extra.longClick=[{title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},{title:st==='可更新'?'更新程序':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},{title:fav?'取消收藏':'加入收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}];
  return{title:(fav?'★ ':'')+item.name+(st==='可更新'?'  ↑':''),desc:line1+'\n'+line2,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'movie_1_left_pic',extra:extra};
};
R.compactApp=function(item,subtitle){return{title:item.name,desc:subtitle||String(item.version||''),img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'avatar',extra:{lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id}};};
R.actionChip=function(title,url){return{title:title,url:url||'hiker://empty',col_type:'flex_button',extra:{lineVisible:false}};};
R.metric=function(title,value,url){return{title:title+'  '+String(value),url:url||'hiker://empty',col_type:'text_4',extra:{lineVisible:false}};};
})(HikerRuleRepo);
