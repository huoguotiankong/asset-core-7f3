/* 我的规则仓库 3.5.6-rc6 - Generic Channel Hydration & Identity Parser 14.5 */
(function(R){
var baseDeviceRuleRecord=R.deviceRuleRecord;
var baseLoadChannelMetaLive=R.loadChannelMetaLive;
var baseWorkspaceData=R.workspaceData;
var baseHybridProgramData=R.hybridProgramData;
var baseHybridDocument=R.hybridDocument;
var baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;

R.version='3.5.6-rc6';
R.build=396;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.5 · Generic Channel Hydration & Identity Parser';
R.fastHomeVersion='14.5.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v141.js';
R.workspaceBootstrapCache=141;
R.isTestChannel=function(){return true;};

/* getLastRules() 在不同海阔版本可能把完整 home_rule 文本放在 rule/content/source 等字段中。 */
R.deviceRuleRecord=function(x){
 var base=null;
 try{base=baseDeviceRuleRecord.call(this,x);}catch(e){}
 function objRecord(o){
  if(!o||typeof o!=='object')return null;
  var title=String(o.title||o.name||o.ruleTitle||'').replace(/\|/g,'').trim();
  var v=Number(o.version||o.ruleVersion||o.ver||0);
  return title?{title:title,ruleVersion:isNaN(v)?0:v,raw:o}:null;
 }
 function textRecord(s){
  s=String(s==null?'':s).trim();if(!s)return null;
  var mark='海阔视界，首页频道￥home_rule￥',p=s.indexOf(mark),o=null,r=null;
  if(p>=0){try{o=JSON.parse(s.substring(p+mark.length));}catch(e1){}if(o){r=objRecord(o);if(r)return r;}}
  if(s.charAt(0)==='{'){try{o=JSON.parse(s);}catch(e2){}if(o){r=objRecord(o);if(r&&r.ruleVersion)return r;if(o.rule&&typeof o.rule==='string'){var rr=textRecord(o.rule);if(rr)return rr;}if(r)return r;}}
  return null;
 }
 function anyRecord(v){
  if(v===null||v===undefined)return null;
  if(typeof v==='string')return textRecord(v);
  if(typeof v==='object'){
   var r=objRecord(v);if(r&&r.ruleVersion)return r;
   var keys=['rule','content','source','ruleText','data'],i,q;
   for(i=0;i<keys.length;i++){q=v[keys[i]];if(q!==undefined&&q!==v){var z=anyRecord(q);if(z)return z;}}
   return r;
  }
  return null;
 }
 var parsed=anyRecord(x);
 if(base){
  if(parsed){if(!base.title&&parsed.title)base.title=parsed.title;if(!Number(base.ruleVersion||0)&&Number(parsed.ruleVersion||0)>0)base.ruleVersion=Number(parsed.ruleVersion);if(!base.raw&&parsed.raw)base.raw=parsed.raw;}
  return base;
 }
 return parsed;
};

/* 通用 channel-group loader：路径优先使用规范化字段，raw.channelsPath 作为兼容兜底。 */
R.loadChannelMetaLive=function(item){
 var path=String(item&&item.channelsPath||item&&item.raw&&item.raw.channelsPath||''),data=null,err='';
 if(path){try{data=this.safeJson(this.apiText(path),null);}catch(e){err=String(e.message||e);}}
 if((!data||!Array.isArray(data.channels)||data.channels.length===0)&&String(item&&item.id||'')==='rule-repo'){
  try{data=this.ruleRepoChannelFallback();}catch(e2){err+=(err?' | ':'')+String(e2.message||e2);}
 }
 if(!data||!Array.isArray(data.channels)||data.channels.length===0){
  if(typeof baseLoadChannelMetaLive==='function'){
   try{var b=baseLoadChannelMetaLive.call(this,item);if(b&&Array.isArray(b.channels)&&b.channels.length)return b;}catch(e3){err+=(err?' | ':'')+String(e3.message||e3);}
  }
  throw new Error('没有读取到可用版本'+(path?' ['+path+']':' [channelsPath 为空]')+(err?'：'+err:''));
 }
 data._error=err;
 return data;
};

/* 进入任何多版本详情，只加载当前一个程序的 channels.json，不回退到首页 N+1。 */
R.workspaceData=function(items,initialView,initialId){
 var pending='';try{pending=String(getVar('hc_repo_hybrid_pending_detail','')||'');}catch(e){}
 var wantId=String(initialId||pending||''),wantDetail=String(initialView||'')==='detail'||!!pending;
 if(wantDetail&&wantId){
  try{
   var it=this.findById(wantId,false),group=it&&(String(it.entryType||'')==='channel-group'||!!it.channelsPath||!!(it.raw&&it.raw.channelsPath));
   if(group&&!this.fastChannelCache(it))this.refreshFastChannelCache(it);
  }catch(e2){}
 }
 var d=baseWorkspaceData.call(this,items,initialView,initialId);
 d.ui='Single Workspace 14.5';
 d.performance={mode:'cache-first',livePresence:false,channelMeta:'detail-on-demand',renderGuard:true,installIndex:'verified',stateMigration:'runtime-authoritative',identityParser:'nested-home-rule-v2'};
 return d;
};

R.hybridProgramData=function(item,index){
 var p=baseHybridProgramData.call(this,item,index);
 if(p&&p.channel){
  var ch=String(p.activeChannel||''),label=ch==='test'?'测试版':(ch==='local'?'本地版':(ch==='stable'?'正式版':'')),lv=String(p.localVersion||'');
  if(p.installed){
   if(lv&&lv!=='暂无'&&lv!=='待识别')p.currentInstallText=(label?label+' ':'')+lv;
   else p.currentInstallText='已安装 · 版本待识别';
  }else p.currentInstallText='未安装';
 }
 return p;
};

/* 所有进入详情的路径统一在 go() 里按需加载，避免不同点击入口行为分叉。 */
R.hybridDocument=function(title,data,body,script){
 var html=String(baseHybridDocument.call(this,title,data,body,script));
 function rep(a,b){if(html.indexOf(a)>=0)html=html.replace(a,b);}
 rep("function go(view,id){rememberScroll();if(state.view!==view||String(state.id)!==String(id||''))state.stack.push(snapshot());state.view=view;state.id=view==='detail'?String(id||''):'';render();}",
     "function go(view,id){if(view==='detail'){var dp=byId(String(id||''));if(dp&&dp.channel&&!dp.channelsLoaded&&dp.actions&&dp.actions.loadChannels){runAction(dp.actions.loadChannels,'loadChannels',dp);return;}}rememberScroll();if(state.view!==view||String(state.id)!==String(id||''))state.stack.push(snapshot());state.view=view;state.id=view==='detail'?String(id||''):'';render();}");
 rep("if((v=el.getAttribute('data-program'))){var lp=byId(v);if(lp&&lp.channel&&!lp.channelsLoaded&&lp.actions&&lp.actions.loadChannels){runAction(lp.actions.loadChannels,'loadChannels',lp);return;}go('detail',v);return;}",
     "if((v=el.getAttribute('data-program'))){go('detail',v);return;}");
 rep("infoCard('当前版本',p.version)","infoCard('当前安装',p.currentInstallText||(p.installed?(p.localVersion||'版本待识别'):'未安装'))");
 html=html.replace(/Single Workspace 14\.4/g,'Single Workspace 14.5');
 html=html.replace(/Render Guard 14\.4 · RC5 patches/g,'Render Guard 14.5 · RC6 patches');
 return html;
};

R.ruleRepoChannelFallback=function(){
 var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],test=null,i;
 for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){test=list[i];break;}
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg'};list.push(test);}
 test.version='3.5.6-rc6';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=396;test.displayVersion='Test 3.5.6-rc6 · Build 396 · Generic Channel Hydration 14.5';test.path='apps/tools/rule-repo/rule_repo_test_v142.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='修复其它 channel-group 详情长期待加载、当前版本语义错误与嵌套本地规则 version 识别';test.highlights=['所有多版本程序进入详情自动按需加载当前 channels.json','不恢复首页 N+1 预取','当前安装与云端目录版本分离显示','getLastRules 嵌套 home_rule 解析 numeric version','保留 RC4/RC5 原生打开桥与状态迁移'];
 if(data){data.channels=list;data.updatedAt='2026-08-24 15:xx';}
 return data;
};

if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
