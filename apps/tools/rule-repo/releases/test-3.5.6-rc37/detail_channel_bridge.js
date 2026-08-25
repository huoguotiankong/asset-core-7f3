/* 我的规则仓库 3.5.6-rc37 - on-demand detail channel bridge */
(function(R){
var VERSION='3.5.6-rc37',BUILD=427;
var baseWorkspaceAction=R.workspaceAction;
var baseHybridProgramData=R.hybridProgramData;
var baseWorkspaceHtml=R.workspaceHtml;
var baseChannelMeta=R.channelMeta;
var baseLoadChannelMetaLive=R.loadChannelMetaLive;
function selfMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-25 22:40',channels:[
 {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389 · 救援基线',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定救援基线'},
 {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · Detail On-Demand',path:'apps/tools/rule-repo/rule_repo_test_v174.txt',mode:'remote-cache-first',updatedAt:'2026-08-25',recommended:false,desc:'首页保持缓存快启动；首次进入某个多版本程序详情时只读取该程序自己的 channels.json'}
]};}
R.version=VERSION;R.build=BUILD;R.releaseLabel='Stable-derived Fast Hybrid 22.1 · Detail On-Demand';R.updatedAt='2026-08-25';
R.ruleRepoChannelFallback=function(){return selfMeta();};
R.channelMeta=function(item){if(String(item&&item.id||'')==='rule-repo')return selfMeta();return baseChannelMeta.call(this,item);};
R.loadChannelMetaLive=function(item){if(String(item&&item.id||'')==='rule-repo')return selfMeta();return baseLoadChannelMetaLive.call(this,item);};
R.workspaceAction=function(kind,item){
 if(String(kind||'')!=='load-channels')return baseWorkspaceAction.call(this,kind,item);
 var id=String(item&&item.id||''),spec=this.workspaceCoreSpec();
 return $(this.workspaceActionUrl('load-channels')).lazyRule(function(appId,s){
  function core(raw){var c=JSON.parse(raw||'{}'),r=null,first='';try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}if(!r||typeof r.loadChannelMetaLive!=='function'){try{require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||174));RuleRepoBoot.load();r=HikerRuleRepo;}catch(e2){throw new Error('动作 Core 加载失败'+(first?'（'+first+'）':'')+'；'+String(e2.message||e2));}}return r;}
  var loading=false;try{showLoading('正在读取当前程序版本…');loading=true;var r=core(s),it=r.findById(appId,false);if(!it)throw new Error('程序不存在');var m=r.channelMeta(it);if(!m||!m.channels||!m.channels.length)m=r.loadChannelMetaLive(it);try{r.repairInstalledIdentityFast&&r.repairInstalledIdentityFast(it);}catch(_e){}hideLoading();loading=false;return'hiker://page/ruleRepoDetail?rule='+encodeURIComponent(String(r.hybridRuleName?r.hybridRuleName():'我的规则仓库·测试版'))+'&simple=true&id='+encodeURIComponent(appId)+'#noHistory#';}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://版本加载失败：'+String(e.message||e);}
 },id,spec);
};
R.hybridProgramData=function(item,index){var p=baseHybridProgramData.call(this,item,index);if(p&&p.channel){p.actions=p.actions||{};p.actions.loadChannels=this.workspaceAction('load-channels',item);}return p;};
R.workspaceHtml=function(items,initialView,initialId){
 var html=baseWorkspaceHtml.call(this,items,initialView,initialId);
 var old="if((v=el.getAttribute('data-program'))){go('detail',v);return;}";
 var neu="if((v=el.getAttribute('data-program'))){var dp=byId(v);if(dp&&dp.channel&&(!dp.channels||!dp.channels.length)&&dp.actions&&dp.actions.loadChannels){runAction(dp.actions.loadChannels,'loadChannels',dp);return;}go('detail',v);return;}";
 if(String(html).indexOf(old)<0)throw new Error('RC37 workspace client hook 未命中');
 return String(html).replace(old,neu);
};
R.workspaceBootstrapUrl=typeof RULE_REPO_TEST_BOOTSTRAP_URL==='string'?RULE_REPO_TEST_BOOTSTRAP_URL:R.workspaceBootstrapUrl;R.workspaceBootstrapCache=174;
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
