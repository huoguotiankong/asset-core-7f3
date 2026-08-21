/* 我的规则仓库 v3.5.0-rc4 - compact product cards */
(function(R){
R.itemCard=function(item){
  var group=item.entryType==='channel-group',st=group?'多版本':this.statusOf(item),tags=(item.tags||[]).slice(0,2).map(function(t){return'#'+t;}).join('  '),line1,line2;
  if(group){line1='正式 / 测试双通道 · 点击选择版本';line2=item.categoryName+' / '+item.subCategory+(tags?' · '+tags:'');}
  else{line1=String(item.version||'未标记')+' · '+this.modeText(item.mode)+' · '+st;line2=item.categoryName+' / '+item.subCategory+(tags?' · '+tags:'');}
  var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id};
  if(!group)extra.longClick=[{title:st==='可更新'?'更新程序':'导入程序',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},{title:this.isFav(item)?'取消收藏':'加入收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}];
  return{title:item.name+(st==='可更新'?'  ↑':''),desc:line1+'\n'+line2,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'movie_1_left_pic',extra:extra};
};
R.channelBadge=function(c){return c.channel==='stable'?'正式版':(c.channel==='test'?'测试版':String(c.label||c.channel||'版本'));};
})(HikerRuleRepo);
