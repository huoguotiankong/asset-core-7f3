/* 我的规则仓库 v3.5.0-rc4 - generic channel selector + polished detail */
(function(R){
R.channelMeta=function(parent){
  var path=String(parent&&parent.channelsPath||parent&&parent.raw&&parent.raw.channelsPath||'');
  if(path){try{var x=JSON.parse(this.apiText(path));if(x&&Array.isArray(x.channels)&&x.channels.length)return x;}catch(e){}}
  return null;
};
R.channelPage=function(parent){
  setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),self=this;if(!meta){setResult([{title:'版本通道读取失败',desc:'请刷新云端索引后重试。',url:'hiker://empty',col_type:'text_center_1'}]);return;}
  try{setPagePicUrl(this.iconOf(parent));}catch(e){}
  d.push({title:parent.name,desc:'一个程序 · 一个云端入口 · 多版本通道\n正式版用于稳定使用，测试版用于新功能验证',img:this.iconOf(parent),pic_url:this.iconOf(parent),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
  var cs=meta.channels||[],stable=null,test=null;for(var i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];if(cs[i].channel==='test')test=cs[i];}
  if(stable)d.push(this.quickCard('正式 '+String(stable.version||'--'),'hiker://empty'));if(test)d.push(this.quickCard('测试 '+String(test.version||'--'),'hiker://empty'));d.push(this.quickCard('通道 '+cs.length,'hiker://empty'));
  this.pushSpacer(d);this.pushSection(d,'选择版本','点击版本卡片直接导入；正式版和测试版可同时安装，数据与更新状态互不干扰。');
  cs.forEach(function(c){
    var raw={id:String(c.id||''),name:String(c.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,tags:['远程',c.channel==='test'?'测试':'正式','管理','版本'],mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||meta.updatedAt||''),icon:String(c.icon||self.iconOf(parent)),openTitle:String(c.openTitle||c.name||'')};
    var item=self.normalizeItem(raw,0),status=self.statusOf(item),badge=self.channelBadge(c),build=c.build!=null?'build '+c.build:'',date=String(c.updatedAt||meta.updatedAt||''),lineA=String(c.desc||''),lineB=[build,date].filter(function(x){return !!x;}).join(' · '),lineC='本仓库记录：'+status+' · 点击导入'+badge;
    d.push({title:badge+'   '+String(c.displayVersion||c.version||''),desc:lineA+(lineB?'\n'+lineB:'')+'\n'+lineC,img:String(c.icon||self.iconOf(parent)),pic_url:String(c.icon||self.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(Array.isArray(c.highlights)&&c.highlights.length)d.push({title:'本版重点',desc:c.highlights.join(' · '),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  });
  this.pushSpacer(d);this.pushSection(d,'版本策略','日常使用优先正式版；需要体验新功能时安装测试版。测试版验证通过后再晋级 Stable，正式版通过远程更新获得新功能，无需重复下载安装包。');
  d.push({title:'正式版 Stable',desc:'长期稳定 · 实机验证后发布 · 适合作为日常主版本',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:'测试版 Test / Candidate',desc:'新功能先行 · 独立更新/回退 · 出现问题不影响正式版',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  setResult(d);
};
R.detailPage=function(){
  var id=String((MY_PARAMS&&MY_PARAMS.hc_repo_item_id)||getParam('id')||''),item=this.findById(id,false),d=[];if(!item){setResult([{title:'程序不存在或云端索引已更新',url:'hiker://empty',col_type:'text_center_1'}]);return;}
  if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);
  setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}var st=this.statusOf(item),iv=this.installedVersion(item),modeDesc=item.mode==='remote'?'自用远程代码版':(item.mode==='share'?'纯本地分享版':'本地程序'),last=this.lastImportedTime(item),openTitle=String(item.raw&&item.raw.openTitle||item.name||'').replace(/\|/g,'');
  d.push({title:item.name,desc:String(item.version||'未标记')+' · '+modeDesc+'\n'+this.statusMark(item),img:this.iconOf(item),pic_url:this.iconOf(item),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
  d.push({title:'打开',col_type:'text_2',url:'hiker://home@'+openTitle+'||hiker://home',extra:{lineVisible:false}});d.push({title:st==='可更新'?'立即更新':'导入 / 覆盖',col_type:'text_2',url:$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw)),extra:{lineVisible:false}});
  d.push(this.statCard('云端',item.version||'--','hiker://empty'));d.push(this.statCard('已记录',iv||'--','hiker://empty'));d.push(this.statCard('状态',st,'hiker://empty'));d.push(this.statCard('模式',this.modeText(item.mode),'hiker://empty'));
  this.pushSpacer(d);this.pushSection(d,'快捷操作','常用操作集中在这里，减少页面层级。');d.push(this.quickCard(this.isFav(item)?'★ 已收藏':'☆ 收藏',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));d.push(this.quickCard('检查更新',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';return'toast://'+x.name+'：'+r.statusOf(x)+' / 云端 '+x.version;},item.id)));d.push(this.quickCard('导入记录','hiker://page/ruleRepoHistory?rule=&simple=true'));
  this.pushSpacer(d);this.pushSection(d,'程序信息',item.desc||'暂无说明');d.push({title:'分类',desc:item.categoryName+' / '+item.subCategory,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'运行模式',desc:modeDesc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'更新时间',desc:item.updatedAt||'未标记',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'最近导入',desc:last?this.formatTime(last):'未记录',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});if(item.bytes)d.push({title:'包体大小',desc:Math.round(Number(item.bytes)/1024)+' KB',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  if((item.tags||[]).length){this.pushSpacer(d);this.pushSection(d,'标签','');(item.tags||[]).forEach(function(t){d.push({title:'#'+t,col_type:'flex_button',url:'hiker://page/ruleRepoSearch?rule=&simple=true&kw='+encodeURIComponent(t)});});}
  this.pushSpacer(d);this.pushSection(d,'更多操作','仓库只管理导入记录，不伪装系统级删除能力。');d.push({title:'复制仓库路径',desc:item.path||'',url:'copy://'+(item.path||''),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'清除该程序版本记录',desc:'不删除海阔里已安装的小程序。',url:$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore');r.removeInstalled(id);refreshPage(false);return'toast://版本记录已清除';},item.id),col_type:'text_1',extra:{lineVisible:false}});setResult(d);
};
})(HikerRuleRepo);
