/* 我的规则仓库 v3.5.3-rc1 - Stable/Test/Local lineage-aware version center */
(function(R){
R.ruleRepoChannelFallback=function(){
  var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
  return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
    {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.2',build:364,displayVersion:'Stable 3.5.2 · Shell 1.5.2',path:'apps/tools/rule-repo/rule_repo_remote_v352.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'已验证稳定 · 日常使用与测试版恢复入口',highlights:['稳定日常使用','安全同步与多镜像','测试版异常可从这里恢复'],icon:icon},
    {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.3-rc1',baseVersion:'3.5.2',targetVersion:'3.5.3',build:365,displayVersion:'Test 3.5.3-rc1 · Shell 1.0.12',path:'apps/tools/rule-repo/rule_repo_test_v112.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'基于 Stable 3.5.2 续线 · UI Luxe 与三通道能力继续验证',highlights:['Test 已 rebase Stable 3.5.2','版本谱系修正','保留 Stable/Test/Local 能力','继续验证 UI Luxe'],icon:icon}
  ]};
};
R.channelMeta=function(parent){
  var path=String(parent&&parent.channelsPath||parent&&parent.raw&&parent.raw.channelsPath||''),key=this.statePrefix+'channel_meta_'+String(parent&&parent.id||'default');
  if(path){
    try{
      var x=JSON.parse(this.apiText(path));
      if(x&&Array.isArray(x.channels)&&x.channels.length){setItem(key,JSON.stringify(x));return x;}
    }catch(e){}
  }
  try{
    var cached=JSON.parse(String(getItem(key,'')||''));
    if(cached&&Array.isArray(cached.channels)&&cached.channels.length)return cached;
  }catch(e){}
  if(String(parent&&parent.id||'')==='rule-repo')return this.ruleRepoChannelFallback();
  return null;
};
R.channelInstallRaw=function(parent,c){
  return{
    id:String(c.id||''),name:String(c.name||parent.name||''),version:String(c.version||''),desc:String(c.desc||''),path:String(c.path||''),
    codec:String(c.codec||''),meta:String(c.meta||''),runtime:String(c.runtime||''),localTitle:String(c.localTitle||''),localRuleVersion:c.localRuleVersion,
    stripAuthor:!!c.stripAuthor,forcedTitle:String(c.forcedTitle||''),forcedRuleVersion:c.forcedRuleVersion,bytes:c.bytes,sha256:String(c.sha256||''),
    baseVersion:String(c.baseVersion||''),derivedFromChannel:String(c.derivedFromChannel||''),derivedFromVersion:String(c.derivedFromVersion||''),targetVersion:String(c.targetVersion||''),
    category:parent.category,categoryName:parent.categoryName,subCategory:parent.subCategory,
    tags:['版本',String(c.channel||'')==='stable'?'正式':(String(c.channel||'')==='test'?'测试':(String(c.channel||'')==='local'?'本地':'其它'))],
    mode:String(c.mode||'remote'),updatedAt:String(c.updatedAt||''),icon:String(c.icon||this.iconOf(parent)),openTitle:String(c.openTitle||c.name||parent.name||'')
  };
};
R.channelProductCard=function(parent,c,current){
  var ch=String(c.channel||''),label=ch==='stable'?'正式版 · 推荐':(ch==='test'?'测试版 · 抢先体验':(ch==='local'?'本地版 · 独立安装':'版本'));
  var raw=this.channelInstallRaw(parent,c),line=String(c.version||'');
  if(current)line+=' · 当前运行';
  if(ch==='test'&&c.baseVersion)line+=' · 基于 '+String(c.baseVersion);
  if(ch==='local'&&c.baseVersion)line+=' · 基于 '+String(c.baseVersion);
  var hl=Array.isArray(c.highlights)?c.highlights.slice(0,2):[];
  var desc=line+'\n'+String(c.desc||'')+(hl.length?'\n'+hl.join(' · '):'')+'\n点击导入';
  return{title:label,desc:desc,img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'icon_1_left_pic',extra:{lineVisible:false}};
};
R.channelPage=function(parent){
  setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),cs,i,stable=null,test=null,local=null;
  if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页后执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
  try{setPagePicUrl(this.iconOf(parent));}catch(e){}
  cs=meta.channels||[];
  for(i=0;i<cs.length;i++){
    if(cs[i].channel==='stable')stable=cs[i];
    else if(cs[i].channel==='test')test=cs[i];
    else if(cs[i].channel==='local')local=cs[i];
  }
  var selfRepo=String(parent.id||'')==='rule-repo',coexist=selfRepo||!!(parent.raw&&parent.raw.allowCoexist);
  var heroDesc=coexist?'正式版与测试版独立保留 · 测试异常可从正式版恢复':(local?'正式/测试同名覆盖 · 本地版独立保留':'正式/测试同名覆盖 · 测试异常重新导入正式版');
  d.push(this.hero(parent.name,heroDesc,this.iconOf(parent),'hiker://empty'));
  if(stable)d.push(this.channelProductCard(parent,stable,selfRepo&&!this.isTestChannel()));
  if(test)d.push(this.channelProductCard(parent,test,selfRepo&&this.isTestChannel()));
  if(local)d.push(this.channelProductCard(parent,local,false));
  this.pushSpacer(d);
  if(local){
    d.push(this.compactInfo('版本关系',coexist?'正式/测试用于远程管理；本地版为纯本地独立安装。':'正式版与测试版同名覆盖；本地版使用独立名称，可以同时保留。','hiker://empty'));
  }else if(coexist){
    d.push(this.compactInfo('恢复保障','“我的规则仓库”正式版与测试版分名并存。测试版异常时用正式版重新导入测试版即可。','hiker://empty'));
  }else{
    d.push(this.compactInfo('恢复保障','正式版与测试版同名覆盖。测试异常时重新导入正式版即可恢复。','hiker://empty'));
  }
  setResult(d);
};
})(HikerRuleRepo);
