/* 我的规则仓库 v3.5.0-rc12 - UI Luxe helpers */
(function(R){
R.metricCard=function(title,value,view,active,key){
 return{title:(String(active)===String(view)?'● ':'')+title+' '+String(value),col_type:'text_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false}};
};
R.metricInfo=function(title,value){return{title:title+' '+String(value),col_type:'text_4',url:'hiker://empty',extra:{lineVisible:false}};};
R.categoryTile=function(title,count,id,active,key){
 return{title:(String(active)===String(id)?'● ':'')+title+' '+String(count||0),col_type:'text_3',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);if(k==='hc_repo_category'){clearMyVar('hc_repo_sub');clearMyVar('hc_repo_tag');}refreshPage(false);return'hiker://empty';},key,id),extra:{lineVisible:false}};
};
R.itemCard=function(item){
 var group=item.entryType==='channel-group',st=this.displayStatus(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,meta='',desc='',tags=[];
 if(group){meta='正式版 / 测试版 · 版本中心';desc='一个入口管理版本与恢复';}
 else{meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序');if(st!=='未导入')meta+=' · '+st;tags=(item.tags||[]).slice(0,4);desc=tags.length?tags.join(' / '):String(item.subCategory||item.desc||'');if(last)desc+=' · '+this.formatShortTime(last)+' 使用';}
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st==='有新版本'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:(fav?'★ ':'')+item.name+(st==='有新版本'?'  ↑':''),desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.quickAction=function(title,icon,url){return{title:title,img:this.uiIcon(icon),pic_url:this.uiIcon(icon),url:url||'hiker://empty',col_type:'icon_4_card',extra:{lineVisible:false}};};
R.channelRaw=function(parent,c){return{id:String(c.id||''),name:String(c.name||parent.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,tags:['远程',String(c.channel||'')==='stable'?'正式':'测试','版本'],mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||''),icon:String(c.icon||this.iconOf(parent)),openTitle:String(c.name||parent.name||'')};};
R.channelCard=function(parent,c,label,current){var raw=this.channelRaw(parent,c),desc=String(c.version||'')+(current?' · 当前运行':'')+'\n'+String(c.desc||'')+' · 点击导入';return{title:label,desc:desc,img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false}};};
R.channelImportAction=function(parent,c,label){var raw=this.channelRaw(parent,c);return{title:label,url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'text_2',extra:{lineVisible:false}};};
R.uiLuxeVersion='1.0.2';
})(HikerRuleRepo);
