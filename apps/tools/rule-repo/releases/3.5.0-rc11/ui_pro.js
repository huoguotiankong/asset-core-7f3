/* 我的规则仓库 v3.5.0-rc11 - UI Pro helpers */
(function(R){
R.safeDecodeKeyword=function(v){
 var s=String(v||'').replace(/\+/g,' ').trim();
 if(!s)return'';
 try{if(/%[0-9a-f]{2}/i.test(s))s=decodeURIComponent(s);}catch(e){}
 return String(s||'').trim();
};
R.metricCard=function(title,value,view,active,key){
 return{title:(String(active)===String(view)?'● ':'')+title+' '+String(value),col_type:'text_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false}};
};
R.categoryChip=function(title,id,active){
 return{title:(String(active)===String(id)?'● ':'')+title,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_category',v);clearMyVar('hc_repo_sub');clearMyVar('hc_repo_tag');refreshPage(false);return'hiker://empty';},id),extra:{lineVisible:false}};
};
R.itemCard=function(item){
 var group=item.entryType==='channel-group',st=this.displayStatus(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,meta='',desc='';
 if(group){meta='正式版 / 测试版 · 版本中心';desc='进入后选择需要的版本，也可用于测试版恢复';}
 else{
  meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序');
  if(st!=='未导入')meta+=' · '+st;
  desc=String(item.desc||item.subCategory||'');
  if(last)desc+=' · '+this.formatShortTime(last)+' 使用';
 }
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st==='有新版本'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:(fav?'★ ':'')+item.name+(st==='有新版本'?'  ↑':''),desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'movie_1_left_pic',extra:extra};
};
R.channelCard=function(parent,c,label,current){
 var desc=String(c.version||'')+(current?' · 当前运行':'')+'\n'+String(c.desc||'');
 return{title:label,desc:desc,img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}};
};
R.channelImportAction=function(parent,c,label){
 var raw={id:String(c.id||''),name:String(c.name||parent.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,tags:['远程',String(c.channel||'')==='stable'?'正式':'测试','版本'],mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||''),icon:String(c.icon||this.iconOf(parent)),openTitle:String(c.name||parent.name||'')};
 return{title:label,url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'text_1',extra:{lineVisible:false,textAlign:'center'}};
};
R.uiProVersion='1.0.0';
})(HikerRuleRepo);
