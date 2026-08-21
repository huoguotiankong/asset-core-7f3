/* 我的规则仓库 3.5.3-rc8 - Native App Shell 5.1 visual density */
(function(R){
R.visualDensityVersion='5.1.0';
R.metricCard=function(title,value,view,active,key){
 var on=String(active)===String(view),map={all:'category',installed:'installed',updates:'updates',favorites:'favorite'},icon=map[String(view)]||'category',img=on?this.uiIconState(icon,true):this.uiIcon(icon);
 return{title:String(title)+' '+String(value),img:img,pic_url:img,col_type:'icon_small_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,id:'rule-repo-metric51-'+String(view),cls:'rule-repo-metric51'}};
};
R.pushNav=function(d,active){
 var nav=[['首页','home','home'],['分类','category','category'],['搜索','search','search'],['更新','updates','updates'],['设置','settings','settings']],self=this;
 nav.forEach(function(x){var on=active===x[1],ico=self.uiIconState(x[2],on);d.push({title:x[0],img:ico,pic_url:ico,url:self.navPages[x[1]],col_type:'icon_5_no_crop',extra:{lineVisible:false,id:'rule-repo-nav51-'+x[1]}});});
};
R.itemCard=function(item){
 var group=item.entryType==='channel-group',st=this.productStatusShort(item),fav=this.isFav(item),meta='',desc='',tags=[];
 if(group){meta='正式版 / 测试版 / 本地版';desc='版本管理 · 更新 · 恢复';}
 else{meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序')+' · '+st;tags=(item.tags||[]).slice(0,3);desc=tags.length?tags.join(' · '):String(item.subCategory||item.desc||'');if(fav)desc+=(desc?' · ':'')+'★ 收藏';}
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,id:'rule-repo-item51-'+String(item.id),cls:'rule-repo-program-card51'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st.indexOf('可更新')>=0?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:item.name,desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.pushProgram=function(d,item){d.push(this.itemCard(item));d.push(this.programLine());};
R.channelProductCard=function(parent,c,current){
 var ch=String(c.channel||''),label=ch==='stable'?'正式版 · 推荐':(ch==='test'?'测试版 · 抢先体验':(ch==='local'?'本地版 · 独立安装':'版本')),raw=this.channelInstallRaw(parent,c),line=String(c.version||'');
 if(current)line+=' · 当前运行';if(c.baseVersion)line+=' · 基于 '+String(c.baseVersion);
 var hl=Array.isArray(c.highlights)?c.highlights.slice(0,2):[],detail=hl.length?hl.join(' · '):String(c.desc||'');
 return{title:label,desc:line+'\n'+detail,img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false,id:'rule-repo-channel51-'+ch,cls:'rule-repo-channel51'}};
};
R.pushChannelBlock=function(d,parent,c,current){d.push(this.channelProductCard(parent,c,current));d.push(this.programLine());};
R.ruleRepoChannelFallback=function(){var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.2',build:364,path:'apps/tools/rule-repo/rule_repo_remote_v352.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'已验证稳定 · 日常使用与恢复入口',highlights:['稳定日常使用','安全同步与多镜像'],icon:icon},{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.3-rc8',baseVersion:'3.5.2',targetVersion:'3.5.3',build:373,path:'apps/tools/rule-repo/rule_repo_test_v120.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Native App Shell 5.1 · 视觉密度收敛',highlights:['排序实机通过','活动图标选中态','单卡标签信息','紧凑分类与版本中心'],icon:icon}]};};
})(HikerRuleRepo);
