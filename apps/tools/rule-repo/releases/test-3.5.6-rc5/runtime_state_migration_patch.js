/* 我的规则仓库 3.5.6-rc5 - Runtime State Migration 14.4 */
(function(R){
var baseReadVerifiedInstallIndex=R.readVerifiedInstallIndex;
var baseSaveVerifiedInstallIndex=R.saveVerifiedInstallIndex;
var baseFastGroupState=R.fastGroupState;
var baseFastItemState=R.fastItemState;
var baseWorkspaceData=R.workspaceData;
var baseHybridDocument=R.hybridDocument;
var baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;

R.version='3.5.6-rc5';
R.build=395;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.4 · Runtime State Migration';
R.fastHomeVersion='14.4.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v140.js';
R.workspaceBootstrapCache=140;
R.isTestChannel=function(){return true;};

R.runtimeStateEpoch=function(){return String(this.version||'')+'|'+String(this.build||0)+'|'+String(this.channel||'');};
R.runtimeStateEpochKey=function(){return this.statePrefix+'runtime_state_epoch_v1';};
R.selfVerifiedRecord=function(){
 return{installed:true,recognized:true,update:false,updateKnown:true,channel:this.isTestChannel()?'test':'stable',installedVersion:String(this.version||''),targetVersion:String(this.version||''),title:this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库',ruleVersion:0,verifiedAt:Date.now(),source:'runtime-self'};
};
R.repairSelfVerifiedIndex=function(force){
 var idx=null,changed=!!force,rec=this.selfVerifiedRecord(),old=null;
 try{idx=baseReadVerifiedInstallIndex.call(this);}catch(e){}
 if(!idx||!idx.apps){idx={schema:1,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),installed:1,recognized:1,updates:0,unknown:0,apps:{}};changed=true;}
 old=idx.apps['rule-repo'];
 if(!old||!old.installed||!old.recognized||String(old.channel||'')!==String(rec.channel)||String(old.installedVersion||'')!==String(rec.installedVersion)){changed=true;}
 if(changed){idx.apps['rule-repo']=rec;idx.time=Date.now();if(Number(idx.installed||0)<1)idx.installed=1;if(Number(idx.recognized||0)<1)idx.recognized=1;try{baseSaveVerifiedInstallIndex.call(this,idx);}catch(e2){}}
 return idx;
};
R.ensureRuntimeStateMigration=function(){
 var epoch=this.runtimeStateEpoch(),key=this.runtimeStateEpochKey(),old='';
 try{old=String(getItem(key,'')||'');}catch(e){}
 if(old===epoch){this.repairSelfVerifiedIndex(false);return false;}
 this.repairSelfVerifiedIndex(true);
 try{clearItem(this.fastChannelCacheKey('rule-repo'));}catch(e1){try{setItem(this.fastChannelCacheKey('rule-repo'),'');}catch(e2){}}
 try{clearItem(this.channelFingerprintKey('rule-repo'));}catch(e3){try{setItem(this.channelFingerprintKey('rule-repo'),'');}catch(e4){}}
 try{setItem(key,epoch);}catch(e5){}
 return true;
};
R.readVerifiedInstallIndex=function(){return this.repairSelfVerifiedIndex(false);};

/* 当前正在运行的规则仓库 Shell 是自身安装状态的最高优先级真相，不能被旧 Verified Index 覆盖。 */
R.fastGroupState=function(item){
 var id=String(item&&item.id||'');
 if(id==='rule-repo')return{parentId:id,channel:this.isTestChannel()?'test':'stable',version:String(this.version||''),build:Number(this.build||0),time:Date.now(),verified:true,updateKnown:true,update:false,recognized:true,ruleVersion:0,source:'runtime-self'};
 return baseFastGroupState.call(this,item);
};
R.fastItemState=function(item){
 var id=String(item&&item.id||'');
 if(id==='rule-repo'){
  var targets=this.catalogTargets?this.catalogTargets(item):{},ch=this.isTestChannel()?'test':'stable',target=String(targets[ch]||this.version||''),cur=String(this.version||''),up=false;
  try{up=!!target&&this.versionCmp(target,cur)>0;}catch(e){}
  return{group:true,installed:true,channel:ch,installedVersion:cur,targetVersion:target,update:up,updateKnown:true,recognized:true,ruleVersion:0,source:'runtime-self'};
 }
 return baseFastItemState.call(this,item);
};

R.workspaceData=function(items,initialView,initialId){
 this.ensureRuntimeStateMigration();
 var pending='';try{pending=String(getVar('hc_repo_hybrid_pending_detail','')||'');}catch(e){}
 var wantId=String(initialId||pending||''),wantDetail=String(initialView||'')==='detail'||!!pending;
 if(wantDetail&&wantId==='rule-repo'){
  try{var selfItem=this.findById('rule-repo',false);if(selfItem&&!this.fastChannelCache(selfItem))this.refreshFastChannelCache(selfItem);}catch(e2){}
 }
 var d=baseWorkspaceData.call(this,items,initialView,initialId),idx=this.readVerifiedInstallIndex();
 d.ui='Single Workspace 14.4';
 d.performance={mode:'cache-first',livePresence:false,channelMeta:'lazy',renderGuard:true,installIndex:'verified',stateMigration:'runtime-authoritative'};
 d.installIndex={time:Number(idx&&idx.time||0),installed:Number(idx&&idx.installed||0),updates:Number(idx&&idx.updates||0),unknown:Number(idx&&idx.unknown||0)};
 return d;
};

/* RC4“加载版本”复用了 open/check 动作名，导致成功后不刷新。RC5 显式改为 loadChannels。 */
R.hybridDocument=function(title,data,body,script){
 var html=String(baseHybridDocument.call(this,title,data,body,script));
 function rep(a,b){if(html.indexOf(a)>=0)html=html.replace(a,b);}
 rep("data-program-action=\"open\" data-id=\"'+esc(p.id)+'\">'+(p.channelsLoaded?'打开程序':'加载版本')", "data-program-action=\"'+(p.channelsLoaded?'open':'loadChannels')+'\" data-id=\"'+esc(p.id)+'\">'+(p.channelsLoaded?'打开程序':'加载版本')");
 rep("if((mode==='sync'||mode==='loadChannels')&&b.refreshPage)setTimeout(function(){b.refreshPage(true);},mode==='loadChannels'?120:500);return;", "if((mode==='sync'||mode==='loadChannels'||((mode==='open'||mode==='check')&&program&&program.channel&&!program.channelsLoaded))&&b.refreshPage)setTimeout(function(){b.refreshPage(true);},mode==='sync'?500:120);return;");
 html=html.replace(/Single Workspace 14\.2/g,'Single Workspace 14.4');
 html=html.replace(/Render Guard 14\.3 · RC4 patches/g,'Render Guard 14.4 · RC5 patches');
 return html;
};

R.ruleRepoChannelFallback=function(){
 var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],test=null,i;
 for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){test=list[i];break;}
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg'};list.push(test);}
 test.version='3.5.6-rc5';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=395;test.displayVersion='Test 3.5.6-rc5 · Build 395 · Runtime State Migration 14.4';test.path='apps/tools/rule-repo/rule_repo_test_v141.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='修复跨版本导入后旧 RC3 安装索引覆盖当前运行版本，以及加载版本成功后页面不刷新';test.highlights=['当前 Shell 始终作为规则仓库自身安装状态真相','升级后自动迁移旧 Verified Index','升级后自动清理自身旧版本中心缓存/指纹','加载版本显式使用 loadChannels 并刷新详情','界面标识统一为 Single Workspace 14.4'];
 if(data){data.channels=list;data.updatedAt='2026-08-24 12:xx';}
 return data;
};

R.ensureRuntimeStateMigration();
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
