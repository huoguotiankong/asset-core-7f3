/* 我的规则仓库 3.5.6-rc3 - Verified Device Install Index 14.2 */
(function(R){
var baseWorkspaceStaticActions=R.workspaceStaticActions;
var baseImportRule=R.importRule;
var baseFastGroupState=R.fastGroupState;

R.version='3.5.6-rc3';
R.build=393;
R.channel='test';
R.releaseLabel='Single Workspace 14.2 · Verified Device Install Index';
R.fastHomeVersion='14.2.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v138.js';
R.workspaceBootstrapCache=138;
R.verifiedInstallSchema=1;

R.verifiedInstallKey=function(){return this.statePrefix+'verified_install_index_v1';};
R.readVerifiedInstallIndex=function(){
 try{var x=this.safeJson(getItem(this.verifiedInstallKey(),''),null);return x&&x.schema===1&&x.apps?x:null;}catch(e){return null;}
};
R.saveVerifiedInstallIndex=function(x){try{setItem(this.verifiedInstallKey(),JSON.stringify(x||{}));}catch(e){}return x;};
R.deviceRuleRecord=function(x){
 if(x===null||x===undefined)return null;
 var o=x;
 if(typeof o==='string'){
  var s=String(o||'').trim();if(!s)return null;
  try{o=JSON.parse(s);}catch(e){return{title:s,ruleVersion:0,raw:null};}
 }
 try{
  if(o&&typeof o==='object'&&o.rule){
   var rr=o.rule;if(typeof rr==='string'){try{rr=JSON.parse(rr);}catch(e2){}}
   if(rr&&typeof rr==='object')o=rr;
  }
  var title=String(o.title||o.name||o.ruleTitle||'').replace(/\|/g,'').trim();
  var v=Number(o.version||o.ruleVersion||o.ver||0);
  return title?{title:title,ruleVersion:isNaN(v)?0:v,raw:o}:null;
 }catch(e3){return null;}
};
R.deviceRuleSnapshot=function(){
 var arr=[],count=0,raw=null,i,r,map={};
 try{count=Math.max(1,Number(getRuleCount()||0));}catch(e){count=64;}
 try{raw=getLastRules(Math.max(count,64));}catch(e2){raw=[];}
 if(typeof raw==='string'){try{raw=JSON.parse(raw);}catch(e3){raw=[raw];}}
 if(raw&&typeof raw.toArray==='function'){try{raw=raw.toArray();}catch(e4){}}
 if(!raw||raw.length===undefined)raw=[];
 for(i=0;i<raw.length;i++){r=this.deviceRuleRecord(raw[i]);if(r&&r.title){arr.push(r);map[r.title]=r;}}
 return{count:count,rules:arr,byTitle:map};
};
R.probeTitlePresence=function(title){
 title=String(title||'').replace(/\|/g,'').trim();if(!title)return false;
 try{var raw=request('hiker://home@'+title);return !(raw===null||raw===undefined||String(raw)==='null'||String(raw)==='');}catch(e){return false;}
};
R.channelDeviceTitle=function(parent,c){
 if(String(parent&&parent.id||'')==='rule-repo')return String(c&&c.channel||'')==='test'?'我的规则仓库·测试版':'我的规则仓库';
 return String(c&&c.localTitle||c&&c.forcedTitle||c&&c.name||parent&&parent.name||'').replace(/\|/g,'').trim();
};
R.extractRuleVersionFromText=function(text){
 text=String(text||'');var mark='海阔视界，首页频道￥home_rule￥',p=text.indexOf(mark),o=null;
 if(p>=0){try{o=JSON.parse(text.substring(p+mark.length));}catch(e){}}
 if(o&&o.version!==undefined){var n=Number(o.version);if(!isNaN(n)&&n>0)return n;}
 var m=text.match(/["']version["']\s*:\s*(\d{3,})/i);return m?Number(m[1]):0;
};
R.channelFingerprintKey=function(id){return this.statePrefix+'channel_fingerprint_v1_'+String(id||'').replace(/[^0-9A-Za-z_.-]/g,'_');};
R.readChannelFingerprint=function(item){try{var x=this.safeJson(getItem(this.channelFingerprintKey(item&&item.id),''),null);return x&&x.schema===1?x:null;}catch(e){return null;}};
R.saveChannelFingerprint=function(item,x){try{setItem(this.channelFingerprintKey(item&&item.id),JSON.stringify(x));}catch(e){}return x;};
R.buildChannelFingerprint=function(item,meta,force){
 var cached=this.readChannelFingerprint(item),rev=String(getItem(this.manifestRevisionKey,'')||''),cs=meta&&meta.channels||[],out={schema:1,revision:rev,time:Date.now(),channels:[]},i,c,path,rv,title,old;
 for(i=0;i<cs.length;i++){
  c=cs[i]||{};path=String(c.path||'');rv=Number(c.ruleVersion||c.localRuleVersion||c.forcedRuleVersion||0);title=this.channelDeviceTitle(item,c);
  if(!rv&&cached&&Array.isArray(cached.channels)){
   for(var j=0;j<cached.channels.length;j++){old=cached.channels[j]||{};if(String(old.channel||'')===String(c.channel||'')&&String(old.path||'')===path&&Number(old.ruleVersion||0)>0){rv=Number(old.ruleVersion);break;}}
  }
  if(!rv&&path&&force){
   try{rv=this.extractRuleVersionFromText(this.apiText(path));}catch(e){}
  }
  out.channels.push({channel:String(c.channel||''),title:title,version:String(c.version||''),build:Number(c.build||0),path:path,ruleVersion:Number(rv||0)});
 }
 return this.saveChannelFingerprint(item,out);
};
R.singleFingerprint=function(item,force){
 var key=this.statePrefix+'single_fingerprint_v1_'+String(item&&item.id||'').replace(/[^0-9A-Za-z_.-]/g,'_'),path=String(item&&item.path||item&&item.raw&&item.raw.path||''),old=null,rv=0;
 try{old=this.safeJson(getItem(key,''),null);}catch(e){}
 if(old&&String(old.path||'')===path&&Number(old.ruleVersion||0)>0)rv=Number(old.ruleVersion);
 if(!rv&&path&&force){try{rv=this.extractRuleVersionFromText(this.apiText(path));}catch(e2){}}
 var x={schema:1,path:path,ruleVersion:Number(rv||0),time:Date.now()};try{setItem(key,JSON.stringify(x));}catch(e3){}return x;
};
R.refreshVerifiedInstallIndex=function(items,full){
 items=items||this.items(false);full=full!==false;
 var snap=this.deviceRuleSnapshot(),by=snap.byTitle||{},apps={},titlePresence={},installed=0,recognized=0,updates=0,unknown=0,self=this;
 function present(title){title=String(title||'');if(!title)return false;if(by[title])return true;if(Object.prototype.hasOwnProperty.call(titlePresence,title))return titlePresence[title];var v=full?self.probeTitlePresence(title):false;titlePresence[title]=v;return v;}
 for(var i=0;i<items.length;i++){
  var item=items[i],id=String(item.id||''),group=String(item.entryType||'')==='channel-group'||!!item.channelsPath,rec={installed:false,recognized:false,update:false,updateKnown:false,channel:'',installedVersion:'',targetVersion:'',title:'',ruleVersion:0,verifiedAt:Date.now(),source:'device'};
  if(id==='rule-repo'){rec.installed=true;rec.recognized=true;rec.updateKnown=true;rec.channel=this.isTestChannel()?'test':'stable';rec.installedVersion=String(this.version||'');rec.targetVersion=String(this.version||'');rec.title=this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库';rec.ruleVersion=0;apps[id]=rec;installed++;recognized++;continue;}
  if(group){
   var meta=null;try{meta=full?this.refreshFastChannelCache(item):(this.fastChannelCache(item)||{}).meta;}catch(e){var fc=this.fastChannelCache(item);meta=fc&&fc.meta||null;}
   var cs=meta&&meta.channels||[],fp=this.buildChannelFingerprint(item,meta||{channels:[]},full),fps=fp.channels||[],presentCandidates=[],exact=[],c,fpr,lr,title,k;
   for(var ci=0;ci<fps.length;ci++){
    fpr=fps[ci]||{};title=String(fpr.title||'');if(!present(title))continue;
    lr=by[title]||null;presentCandidates.push({fp:fpr,local:lr});
    if(lr&&Number(lr.ruleVersion||0)>0&&Number(fpr.ruleVersion||0)>0&&Number(lr.ruleVersion)===Number(fpr.ruleVersion))exact.push({fp:fpr,local:lr});
   }
   if(presentCandidates.length){rec.installed=true;rec.title=String(presentCandidates[0].fp.title||'');installed++;}
   if(!fps.length){title=String(this.presenceTitle?this.presenceTitle(item):item.name||'').replace(/\|/g,'');if(present(title)){rec.installed=true;rec.title=title;installed++;}}
   if(exact.length===1){
    fpr=exact[0].fp;lr=exact[0].local;rec.recognized=true;rec.updateKnown=true;rec.channel=fpr.channel;rec.installedVersion=fpr.version;rec.targetVersion=fpr.version;rec.ruleVersion=Number(lr.ruleVersion||0);recognized++;
   }else if(presentCandidates.length){
    var titles={};for(ci=0;ci<fps.length;ci++){title=String(fps[ci].title||'');titles[title]=(titles[title]||0)+1;}
    if(presentCandidates.length===1&&titles[String(presentCandidates[0].fp.title||'')]===1){
     fpr=presentCandidates[0].fp;lr=presentCandidates[0].local;rec.recognized=true;rec.updateKnown=true;rec.channel=fpr.channel;rec.installedVersion=fpr.version;rec.targetVersion=fpr.version;rec.ruleVersion=Number(lr&&lr.ruleVersion||0);recognized++;
    }else{
     var actual=0,minTarget=0,allHave=true;for(ci=0;ci<presentCandidates.length;ci++){lr=presentCandidates[ci].local;if(lr&&Number(lr.ruleVersion||0)>0){actual=Number(lr.ruleVersion);break;}}
     for(ci=0;ci<presentCandidates.length;ci++){var tr=Number(presentCandidates[ci].fp.ruleVersion||0);if(!tr){allHave=false;break;}if(!minTarget||tr<minTarget)minTarget=tr;}
     if(actual&&allHave&&minTarget>actual){rec.update=true;rec.updateKnown=true;rec.ruleVersion=actual;updates++;}
    }
   }
   if(rec.installed&&!rec.recognized&&!rec.updateKnown)unknown++;
  }else{
   title=String(this.presenceTitle?this.presenceTitle(item):item.name||'').replace(/\|/g,'');lr=by[title]||null;rec.title=title;rec.installed=!!lr||present(title);
   if(rec.installed){installed++;var sf=this.singleFingerprint(item,full),actualRv=Number(lr&&lr.ruleVersion||0),targetRv=Number(sf.ruleVersion||0);rec.ruleVersion=actualRv;if(actualRv&&targetRv){rec.recognized=true;rec.updateKnown=true;rec.installedVersion=actualRv===targetRv?String(item.version||''):String(actualRv);rec.targetVersion=String(item.version||'');rec.update=targetRv>actualRv;if(rec.update)updates++;recognized++;}else{unknown++;}}
  }
  apps[id]=rec;
 }
 var index={schema:1,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),deviceRuleCount:Number(snap.count||0),listedRules:Number((snap.rules||[]).length),installed:installed,recognized:recognized,updates:updates,unknown:unknown,apps:apps};
 return this.saveVerifiedInstallIndex(index);
};
R.ensureVerifiedInstallIndex=function(items){
 var x=this.readVerifiedInstallIndex();if(x)return x;
 try{return this.refreshVerifiedInstallIndex(items,false);}catch(e){return this.saveVerifiedInstallIndex({schema:1,time:Date.now(),revision:'',installed:1,recognized:1,updates:0,unknown:0,apps:{'rule-repo':{installed:true,recognized:true,updateKnown:true,update:false,channel:'test',installedVersion:String(this.version||''),targetVersion:String(this.version||'')}}});}
};
R.fastGroupState=function(item){
 var idx=this.readVerifiedInstallIndex(),id=String(item&&item.id||''),v=idx&&idx.apps&&idx.apps[id];
 if(v&&v.installed)return{parentId:id,channel:String(v.channel||''),version:String(v.installedVersion||''),build:0,time:Number(v.verifiedAt||idx.time||0),verified:true,updateKnown:!!v.updateKnown,update:!!v.update,recognized:!!v.recognized,ruleVersion:Number(v.ruleVersion||0)};
 if(v&&!v.installed)return null;
 return null;
};
R.fastItemState=function(item){
 var idx=this.readVerifiedInstallIndex(),id=String(item&&item.id||''),v=idx&&idx.apps&&idx.apps[id],group=String(item&&item.entryType||'')==='channel-group'||!!(item&&item.channelsPath);
 if(!idx){idx=this.ensureVerifiedInstallIndex(this.items(false));v=idx&&idx.apps&&idx.apps[id];}
 if(v)return{group:group,installed:!!v.installed,channel:String(v.channel||''),installedVersion:String(v.installedVersion||''),targetVersion:String(v.targetVersion||''),update:!!v.update,updateKnown:!!v.updateKnown,recognized:!!v.recognized,ruleVersion:Number(v.ruleVersion||0)};
 return{group:group,installed:false,channel:'',installedVersion:'',targetVersion:'',update:false,updateKnown:false,recognized:false,ruleVersion:0};
};
R.fastStatusMeta=function(item){var s=this.fastItemState(item);if(s.update)return{label:'可更新',color:'#F59E0B'};if(s.installed&&!s.recognized)return{label:'已安装',color:'#22A06B'};if(s.installed)return{label:'已安装',color:'#22A06B'};if(s.group)return{label:'版本中心',color:'#1677FF'};return{label:'未安装',color:'#8A8F98'};};
R.stats=function(items){items=items||[];var idx=this.ensureVerifiedInstallIndex(items),out={all:items.length,remote:0,local:0,installed:0,updates:0,favorites:this.favIds().length,recent:this.recentIds().length,groups:0},i,x,s;for(i=0;i<items.length;i++){x=items[i];if(x.mode==='remote')out.remote++;else out.local++;if(String(x.entryType||'')==='channel-group')out.groups++;s=this.fastItemState(x);if(s.installed)out.installed++;if(s.update)out.updates++;}out.installUnknown=Number(idx&&idx.unknown||0);out.installIndexTime=Number(idx&&idx.time||0);return out;};

R.importRule=function(raw){
 var ret=baseImportRule.call(this,raw),x=null;try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;}catch(e){}
 if(x&&String(ret||'').indexOf('海阔视界')===0){
  try{
   var idx=this.readVerifiedInstallIndex()||{schema:1,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),apps:{}},pid=String(x.__repoParentId||x.id||''),ch=String(x.__repoChannel||''),v=String(x.version||'');
   if(pid){idx.apps=idx.apps||{};idx.apps[pid]={installed:true,recognized:!!ch,update:false,updateKnown:!!ch,channel:ch,installedVersion:v,targetVersion:v,title:String(x.name||''),ruleVersion:Number(x.version&&typeof x.version==='number'?x.version:0),verifiedAt:Date.now(),source:'repo-import'};idx.time=Date.now();this.saveVerifiedInstallIndex(idx);}
  }catch(e2){}
 }
 return ret;
};

R.workspaceStaticActions=function(){
 var a=baseWorkspaceStaticActions.call(this),spec=this.workspaceCoreSpec();
 a.sync=$(this.workspaceActionUrl('sync-verified')).lazyRule(function(s){
  showLoading('正在同步目录并刷新安装状态…');
  function core(raw){var c=JSON.parse(raw||'{}'),r=null;try{r=$.require(String(c.page||''));}catch(e){}if(!r||typeof r.refreshVerifiedInstallIndex!=='function'){require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||138));RuleRepoBoot.load();r=HikerRuleRepo;}return r;}
  try{var r=core(s),m=r.syncManifest(),idx=r.refreshVerifiedInstallIndex(r.items(false),true);hideLoading();return'toast://目录与安装状态已刷新：已安装 '+Number(idx.installed||0)+'，可更新 '+Number(idx.updates||0)+(Number(idx.unknown||0)?'，'+Number(idx.unknown||0)+' 个版本待识别':'');}catch(e){hideLoading();return'toast://刷新失败：'+String(e.message||e);}
 },spec);
 return a;
};

R.hybridProgramData=(function(base){return function(item,index){var p=base.call(this,item,index),s=this.fastItemState(item);if(s.installed&&!s.recognized){p.localVersion='待识别';p.activeChannel='';p.targetVersion='';p.update=false;p.status='已安装';p.summary='已安装 · 版本待识别，点“同步”刷新真实版本';}return p;};})(R.hybridProgramData);

R.workspaceData=(function(base){return function(items,initialView,initialId){this.ensureVerifiedInstallIndex(items);var d=base.call(this,items,initialView,initialId),idx=this.readVerifiedInstallIndex();d.ui='Single Workspace 14.2';d.performance={mode:'cache-first',livePresence:false,channelMeta:'lazy',renderGuard:true,installIndex:'verified'};d.installIndex={time:Number(idx&&idx.time||0),installed:Number(idx&&idx.installed||0),updates:Number(idx&&idx.updates||0),unknown:Number(idx&&idx.unknown||0)};return d;};})(R.workspaceData);

R.ruleRepoChannelFallback=(function(base){return function(){var data=base.call(this),list=data&&data.channels||[];for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){list[i].version='3.5.6-rc3';list[i].baseVersion='3.5.5';list[i].targetVersion='3.5.6';list[i].build=393;list[i].displayVersion='Test 3.5.6-rc3 · Build 393 · Verified Install Index 14.2';list[i].path='apps/tools/rule-repo/rule_repo_test_v139.txt';list[i].updatedAt='2026-08-24';list[i].desc='真实设备安装索引 · 同步时扫描 · 首页只读缓存';list[i].highlights=['真实规则表优先，不再用导入历史猜安装状态','同名 Stable/Test 用数值 version 指纹识别','无法识别版本时不误报更新','同步目录同时刷新安装状态','普通首页保持零逐项扫描'];}return data;};})(R.ruleRepoChannelFallback);
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
