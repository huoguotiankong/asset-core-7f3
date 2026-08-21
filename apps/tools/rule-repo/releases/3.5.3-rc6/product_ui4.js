/* 我的规则仓库 3.5.3-rc6 - Product UI 4.0 compact management renderer */
(function(R){
R.productUi4Version='4.0.0';
R.metricCard=function(title,value,view,active,key){var on=String(active)===String(view);return{title:(on?'● ':'')+String(title)+' '+String(value),col_type:'text_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,textAlign:'center',id:'rule-repo-metric-'+String(view),cls:'rule-repo-metric-compact'}};};
R.metricInfo=function(title,value){return{title:String(title)+'  '+String(value),col_type:'text_4',url:'hiker://empty',extra:{lineVisible:false,textAlign:'center'}};};
R.tagChip=function(tag,index,id){return{title:String(tag||''),col_type:'scroll_button',url:'hiker://page/ruleRepoSearch?rule=&simple=true&kw='+encodeURIComponent(String(tag||'')),extra:{lineVisible:false,id:'rule-repo-tag-'+String(id||'x')+'-'+String(index||0)}};};
R.productStatusShort=function(item){var s=this.premiumStatusText(item);if(s==='可更新')return'可更新';if(s==='已安装')return'已安装';if(s==='已记录')return'已记录';if(s==='版本中心')return'版本中心';return'未安装';};
R.itemCard=function(item){
 var group=item.entryType==='channel-group',st=this.productStatusShort(item),fav=this.isFav(item),last=this.lastOpenedTime?this.lastOpenedTime(item):0,meta='',desc='',tags=[];
 if(group){meta='正式版 / 测试版 / 本地版';desc='版本管理 · 更新 · 恢复';tags=['正式版','测试版','版本中心'];}
 else{meta=this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序')+' · '+st;tags=(item.tags||[]).slice(0,3);desc=tags.length?tags.join(' · '):String(item.subCategory||item.desc||'');if(last)desc+=' · '+this.formatShortTime(last)+' 使用';}
 var extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,id:'rule-repo-item-'+String(item.id),cls:'rule-repo-program-card-compact'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st==='可更新'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:(fav?'★ ':'')+item.name,desc:meta+'\n'+desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://page/ruleRepoDetail?rule=&simple=true',col_type:'icon_1_left_pic',extra:extra};
};
R.pushProgram=function(d,item,withTags){d.push(this.itemCard(item));if(withTags!==false){var tags=item.entryType==='channel-group'?['正式版','测试版','版本中心']:(item.tags||[]).slice(0,3);for(var i=0;i<tags.length;i++)d.push(this.tagChip(tags[i],i,item.id));}d.push(this.programLine());};
R.channelProductCard=function(parent,c,current){var ch=String(c.channel||''),label=ch==='stable'?'正式版 · 推荐':(ch==='test'?'测试版 · 抢先体验':(ch==='local'?'本地版 · 独立安装':'版本')),raw=this.channelInstallRaw(parent,c),line=String(c.version||'');if(current)line+=' · 当前运行';if(c.baseVersion)line+=' · 基于 '+String(c.baseVersion);return{title:label,desc:line+'\n'+String(c.desc||''),img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false,id:'rule-repo-channel-'+ch,cls:'rule-repo-channel-compact'}};};
R.pushChannelBlock=function(d,parent,c,current){d.push(this.channelProductCard(parent,c,current));var hl=Array.isArray(c.highlights)?c.highlights.slice(0,3):[];for(var i=0;i<hl.length;i++)d.push({title:String(hl[i]),col_type:'scroll_button',url:'hiker://empty',extra:{lineVisible:false}});d.push(this.programLine());};
R.infoPair=function(title,value){return{title:String(title)+'  '+String(value==null?'--':value),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false,textAlign:'left'}};};
R.sectionTitlePair=function(title,actionTitle,actionUrl){return[{title:String(title||''),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false,textAlign:'left'}},{title:String(actionTitle||''),col_type:'text_2',url:actionUrl||'hiker://empty',extra:{lineVisible:false,textAlign:'right'}}];};
R.ruleRepoChannelFallback=function(){var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.2',build:364,path:'apps/tools/rule-repo/rule_repo_remote_v352.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'已验证稳定 · 日常使用与恢复入口',highlights:['稳定日常使用','安全同步与多镜像'],icon:icon},{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.3-rc6',baseVersion:'3.5.2',targetVersion:'3.5.3',build:371,path:'apps/tools/rule-repo/rule_repo_test_v118.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Product UI 4.0 · 紧凑管理中心强化',highlights:['紧凑状态与程序卡','详情/版本中心产品化'],icon:icon}]};};
})(HikerRuleRepo);
