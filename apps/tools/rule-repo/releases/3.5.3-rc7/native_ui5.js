/* 我的规则仓库 3.5.3-rc7 - Native App Shell 5.0 */
(function(R){
R.nativeUi5Version='5.0.0';
R.uiActiveRoot='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/ui/active/';
R.uiIconState=function(name,active){return active?this.uiActiveRoot+name+'.svg':this.uiIcon(name);};
R.selectRoute=function(title,options,code,col){return 'select://'+JSON.stringify({title:String(title||'请选择'),options:options||[],col:Number(col||3),js:String(code||"'hiker://empty'")});};
R.inputRoute=function(hint,code,value){return 'input://'+JSON.stringify({value:String(value||''),hint:String(hint||'请输入内容'),js:String(code||"'hiker://empty'")});};
R.sectionLine=function(){return{col_type:'line',url:'hiker://empty'};};
R.metricCard=function(title,value,view,active,key){var on=String(active)===String(view),map={all:'category',installed:'installed',updates:'updates',favorites:'favorite'},icon=map[String(view)]||'category';return{title:(on?'● ':'')+String(title)+' '+String(value),img:this.uiActiveRoot+icon+'.svg',pic_url:this.uiActiveRoot+icon+'.svg',col_type:'icon_small_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,id:'rule-repo-metric5-'+String(view),cls:'rule-repo-metric5'}};};
R.pushNav=function(d,active){var nav=[['首页','home','home'],['分类','category','category'],['搜索','search','search'],['更新','updates','updates'],['设置','settings','settings']],self=this;nav.forEach(function(x){var on=active===x[1],ico=self.uiIconState(x[2],on);d.push({title:(on?'● ':'')+x[0],img:ico,pic_url:ico,url:self.navPages[x[1]],col_type:'icon_5_no_crop',extra:{lineVisible:false,id:'rule-repo-nav5-'+x[1]}});});};
R.quickAction5=function(title,icon,url){return{title:String(title||''),img:this.uiIcon(icon),pic_url:this.uiIcon(icon),url:url||'hiker://empty',col_type:'icon_5_no_crop',extra:{lineVisible:false}};};
R.productStatusShort=function(item){var s=this.premiumStatusText(item);if(s==='可更新')return'↑ 可更新';if(s==='已安装')return'✓ 已安装';if(s==='已记录')return'✓ 已记录';if(s==='版本中心')return'版本中心';return'未安装';};
R.itemCard=function(item){
 var group=item.entryType==='channel-group',st=this.productStatusShort(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,meta='',desc='',tags=[];
 if(group){meta='正式版 / 测试版 / 本地版';desc='版本管理 · 更新 · 恢复';tags=['正式版','测试版','版本中心'];}
 else{meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序')+' · '+st;tags=(item.tags||[]).slice(0,3);desc=tags.length?tags.join(' / '):String(item.subCategory||item.desc||'');if(last)desc+=' · '+this.formatShortTime(last)+' 使用';}
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,id:'rule-repo-item5-'+String(item.id),cls:'rule-repo-program-card5'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st.indexOf('可更新')>=0?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:(fav?'★ ':'')+item.name,desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.pushProgram=function(d,item,withTags){d.push(this.itemCard(item));if(withTags!==false){var tags=item.entryType==='channel-group'?['正式版','测试版','版本中心']:(item.tags||[]).slice(0,3);for(var i=0;i<tags.length;i++)d.push(this.tagChip(tags[i],i,item.id));}d.push(this.programLine());};
R.channelProductCard=function(parent,c,current){var ch=String(c.channel||''),label=ch==='stable'?'正式版 · 推荐':(ch==='test'?'测试版 · 抢先体验':(ch==='local'?'本地版 · 独立安装':'版本')),raw=this.channelInstallRaw(parent,c),line=String(c.version||'');if(current)line+=' · 当前运行';if(c.baseVersion)line+=' · 基于 '+String(c.baseVersion);return{title:label,desc:line+'\n'+String(c.desc||''),img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false,id:'rule-repo-channel5-'+ch,cls:'rule-repo-channel5'}};};
R.pushChannelBlock=function(d,parent,c,current){d.push(this.channelProductCard(parent,c,current));var hl=Array.isArray(c.highlights)?c.highlights.slice(0,3):[];for(var i=0;i<hl.length;i++)d.push({title:String(hl[i]),col_type:'scroll_button',url:'hiker://empty',extra:{lineVisible:false}});d.push(this.programLine());};
R.infoRow=function(title,value,url){return{title:String(title||'')+'    '+String(value==null?'--':value),url:url||'hiker://empty',col_type:'text_1',extra:{lineVisible:false,textAlign:'left'}};};
})(HikerRuleRepo);
