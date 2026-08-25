/* 我的规则仓库 3.5.6-rc38 - Native Detail + Batch Presence */
(function(R){
var VERSION='3.5.6-rc38',BUILD=428;
var baseManifest=R.manifest;
var baseWorkspaceData=R.workspaceData;
var baseWorkspaceAction=R.workspaceAction;
var baseHybridProgramData=R.hybridProgramData;
var baseWorkspaceHtml=R.workspaceHtml;
var baseChannelMeta=R.channelMeta;
var baseLoadChannelMetaLive=R.loadChannelMetaLive;
var baseActualInstalled=R.actualInstalled;
var baseClearPresenceCache=R.clearPresenceCache;

function selfMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-25 23:05',channels:[
 {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389 · 救援基线',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定救援基线'},
 {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · Native Detail',path:'apps/tools/rule-repo/rule_repo_test_v175.txt',mode:'remote-cache-first',updatedAt:'2026-08-25',recommended:false,desc:'保留快速首页；多版本程序详情改用当前规则上下文的原生二级页，当前程序 channels 按需加载'}
]};}
function sanitizeManifest(x){
 if(!x||!Array.isArray(x.items))return x;
 var out=[];
 for(var i=0;i<x.items.length;i++){
  var it=x.items[i]||{};
  if(String(it.id||'')==='rule-repo-test-upgrade')continue;
  if(String(it.id||'')==='rule-repo'){
   it.version='Stable 3.5.5 / Test '+VERSION;
   it.desc='Stable 3.5.5 / Build389 继续冻结；Test '+VERSION+' / Build'+BUILD+' 保留快首页，版本详情按当前程序懒加载并使用原生二级页。';
   it.updatedAt='2026-08-25';
  }
  out.push(it);
 }
 x.items=out;return x;
}
function normalizeTitle(s){return String(s||'').replace(/\|/g,'').trim();}
function recordFromRule(v){
 if(v==null)return null;
 if(typeof v==='string'){
  var s=String(v).trim(),mark='海阔视界，首页频道￥home_rule￥',p=s.indexOf(mark),o=null;
  if(p>=0)try{o=JSON.parse(s.substring(p+mark.length));}catch(e){}
  if(!o&&s.charAt(0)==='{')try{o=JSON.parse(s);}catch(e2){}
  return o?recordFromRule(o):null;
 }
 if(typeof v==='object'){
  if(v.rule!==undefined&&v.rule!==v){var q=recordFromRule(v.rule);if(q)return q;}
  var name=normalizeTitle(v.title||v.name||v.ruleTitle||''),rv=Number(v.version||v.ruleVersion||v.ver||0);
  if(name)return{title:name,ruleVersion:isNaN(rv)?0:rv};
  var ks=['content','source','ruleText','data'];
  for(var i=0;i<ks.length;i++)if(v[ks[i]]!==undefined&&v[ks[i]]!==v){var z=recordFromRule(v[ks[i]]);if(z)return z;}
 }
 return null;
}
R._rc38Presence=null;
R._rc38PresenceAt=0;
R.preparePresenceSnapshot=function(force){
 var now=Date.now();if(!force&&this._rc38Presence&&now-Number(this._rc38PresenceAt||0)<30000)return this._rc38Presence;
 var map={},raw=[],count=64;
 try{count=Math.max(64,Number(getRuleCount()||0));}catch(e){}
 try{raw=getLastRules(count);}catch(e2){raw=[];}
 if(typeof raw==='string')try{raw=JSON.parse(raw);}catch(e3){raw=[raw];}
 if(raw&&typeof raw.toArray==='function')try{raw=raw.toArray();}catch(e4){}
 if(!raw||raw.length===undefined)raw=[];
 for(var i=0;i<raw.length;i++){var r=recordFromRule(raw[i]);if(r&&r.title)map[normalizeTitle(r.title)]={ruleVersion:Number(r.ruleVersion||0)};}
 this._rc38Presence=map;this._rc38PresenceAt=now;return map;
};
R.clearPresenceCache=function(){try{if(typeof baseClearPresenceCache==='function')baseClearPresenceCache.call(this);}catch(e){}this._rc38Presence=null;this._rc38PresenceAt=0;};
R.actualInstalled=function(item){
 try{if(baseActualInstalled.call(this,item))return true;}catch(e){}
 if(!item)return false;if(String(item.id||'')==='rule-repo')return true;
 var map=this.preparePresenceSnapshot(false),title='';
 try{title=this.presenceTitle?this.presenceTitle(item):String(item.raw&&item.raw.openTitle||item.openTitle||item.name||'');}catch(e2){title=String(item.name||'');}
 return !!map[normalizeTitle(title)];
};
R.manifest=function(force){return sanitizeManifest(baseManifest.call(this,force));};
R.ruleRepoChannelFallback=function(){return selfMeta();};
R.channelMeta=function(item){if(String(item&&item.id||'')==='rule-repo')return selfMeta();return baseChannelMeta.call(this,item);};
R.loadChannelMetaLive=function(item){if(String(item&&item.id||'')==='rule-repo')return selfMeta();return baseLoadChannelMetaLive.call(this,item);};
R.workspaceData=function(items,initialView,initialId){this.preparePresenceSnapshot(false);return baseWorkspaceData.call(this,items,initialView,initialId);};
R.workspaceAction=function(kind,item){
 if(String(kind||'')!=='load-channels')return baseWorkspaceAction.call(this,kind,item);
 var id=String(item&&item.id||''),spec=this.workspaceCoreSpec();
 return $(this.workspaceActionUrl('load-channels')).lazyRule(function(appId,s){
  function core(raw){var c=JSON.parse(raw||'{}'),r=null,first='';try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}if(!r||typeof r.loadChannelMetaLive!=='function'){try{require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||175));RuleRepoBoot.load();r=HikerRuleRepo;}catch(e2){throw new Error('动作 Core 加载失败'+(first?'（'+first+'）':'')+'；'+String(e2.message||e2));}}return r;}
  var loading=false;
  try{
   showLoading('正在读取当前程序版本…');loading=true;
   var r=core(s),it=r.findById(appId,false);if(!it)throw new Error('程序不存在');
   var m=r.channelMeta(it);if(!m||!m.channels||!m.channels.length)m=r.loadChannelMetaLive(it);
   try{r.repairInstalledIdentityFast&&r.repairInstalledIdentityFast(it);}catch(_e){}
   hideLoading();loading=false;
   return'hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(appId)+'#noHistory#';
  }catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://版本加载失败：'+String(e.message||e);}
 },id,spec);
};
R.hybridProgramData=function(item,index){var p=baseHybridProgramData.call(this,item,index);if(p&&p.channel){p.actions=p.actions||{};p.actions.loadChannels=this.workspaceAction('load-channels',item);}return p;};
R.workspaceHtml=function(items,initialView,initialId){
 var html=baseWorkspaceHtml.call(this,items,initialView,initialId);
 var old="if((v=el.getAttribute('data-program'))){go('detail',v);return;}";
 var neu="if((v=el.getAttribute('data-program'))){var dp=byId(v);if(dp&&dp.channel&&(!dp.channels||!dp.channels.length)&&dp.actions&&dp.actions.loadChannels){runAction(dp.actions.loadChannels,'loadChannels',dp);return;}go('detail',v);return;}";
 if(String(html).indexOf(old)<0)throw new Error('RC38 workspace client hook 未命中');
 return String(html).replace(old,neu);
};
R.version=VERSION;R.build=BUILD;R.releaseLabel='Stable-derived Fast Hybrid 22.2 · Native Detail';R.updatedAt='2026-08-25';
R.workspaceBootstrapUrl=typeof RULE_REPO_TEST_BOOTSTRAP_URL==='string'?RULE_REPO_TEST_BOOTSTRAP_URL:R.workspaceBootstrapUrl;R.workspaceBootstrapCache=175;
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
