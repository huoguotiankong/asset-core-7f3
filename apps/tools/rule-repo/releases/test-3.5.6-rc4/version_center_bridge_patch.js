/* 我的规则仓库 3.5.6-rc4 - Version Center & Native Open Bridge 14.3 */
(function(R){
var baseWorkspaceAction=R.workspaceAction;
var baseHybridProgramData=R.hybridProgramData;
var baseHybridDocument=R.hybridDocument;
var baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;

R.version='3.5.6-rc4';
R.build=394;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.3 · Version Center & Native Open Bridge';
R.fastHomeVersion='14.3.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v139.js';
R.workspaceBootstrapCache=139;
R.isTestChannel=function(){return true;};

/* 空 channels 绝不能作为“已加载”的有效缓存。 */
R.fastChannelCache=function(item){
 try{
  var id=String(item&&item.id||''),key=this.fastChannelCacheKey(id),x=this.safeJson(getItem(key,''),null);
  if(x&&x.meta&&Array.isArray(x.meta.channels)&&x.meta.channels.length>0)return x;
  if(x){try{clearItem(key);}catch(e1){try{setItem(key,'');}catch(e2){}}}
 }catch(e){}
 return null;
};
R.saveFastChannelCache=function(item,meta){
 if(!item||!meta||!Array.isArray(meta.channels)||meta.channels.length===0)return null;
 try{setItem(this.fastChannelCacheKey(String(item.id||'')),JSON.stringify({schema:3,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),meta:meta}));}catch(e){}
 return{schema:3,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),meta:meta};
};

/* RC2 将 channelMeta 改成 cache-only，RC4 明确提供一次性 live loader。 */
R.loadChannelMetaLive=function(item){
 var data=null,err='';
 try{if(item&&item.channelsPath)data=this.safeJson(this.apiText(String(item.channelsPath)),null);}catch(e){err=String(e.message||e);}
 if(!data||!Array.isArray(data.channels)||data.channels.length===0){
  if(String(item&&item.id||'')==='rule-repo'){
   try{data=this.ruleRepoChannelFallback();}catch(e2){err+=(err?' | ':'')+String(e2.message||e2);}
  }
 }
 if(!data||!Array.isArray(data.channels)||data.channels.length===0){
  var msg='没有读取到可用版本';if(err)msg+='：'+err;throw new Error(msg);
 }
 data._error=err;
 return data;
};
R.refreshFastChannelCache=function(item){
 var meta=this.loadChannelMetaLive(item),saved=this.saveFastChannelCache(item,meta);
 if(!saved||!saved.meta||!saved.meta.channels||!saved.meta.channels.length)throw new Error('版本元数据为空');
 return saved;
};

/* 从海阔真实本地规则表构造网页桥可用的原生页面描述，禁止再从 X5 打 hiker://home@。 */
R.deviceRuleOpenDescriptor=function(item){
 var title=String(this.presenceTitle?this.presenceTitle(item):item&&item.name||'').replace(/\|/g,'').trim(),snap=null,rec=null,raw=null;
 if(!title)return null;
 try{snap=this.deviceRuleSnapshot?this.deviceRuleSnapshot():null;rec=snap&&snap.byTitle&&snap.byTitle[title];raw=rec&&rec.raw||null;}catch(e){}
 if(raw&&typeof raw==='object'&&raw.rule){
  var rr=raw.rule;
  if(typeof rr==='string'){try{rr=JSON.parse(rr);}catch(e2){}}
  if(rr&&typeof rr==='object')raw=rr;
 }
 if(!raw||typeof raw!=='object')return null;
 function text(v){return v===null||v===undefined?'':String(v);}
 var url=text(raw.url||raw.homeUrl||raw.ruleUrl||''),find=text(raw.find_rule||raw.findRule||''),pre=text(raw.preRule||raw.pre_rule||''),group=text(raw.group||''),col=text(raw.col_type||raw.colType||'movie_1_left_pic');
 if(!url||!find)return null;
 return{rule:title,title:title,url:url,group:group,col_type:col,findRule:find,preRule:pre,extra:{newWindow:true,windowId:'rule-repo-target-'+Date.now()}};
};

R.workspaceAction=function(kind,item){
 if(kind==='load-channels'){
  var seed=this.workspaceActionUrl(kind),spec=this.workspaceCoreSpec(),id=String(item&&item.id||'');
  return $(seed).lazyRule(function(appId,s){
   function loadCore(raw){var c=JSON.parse(raw||'{}'),r=null,first='';try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}if(!r||typeof r.refreshFastChannelCache!=='function'){require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||139));RuleRepoBoot.load();r=HikerRuleRepo;}if(!r||typeof r.refreshFastChannelCache!=='function')throw new Error('动作 Core 接口不完整'+(first?'：'+first:''));return r;}
   try{var r=loadCore(s),x=r.findById(appId,false);if(!x)return'toast://程序不存在';var c=r.refreshFastChannelCache(x),n=c&&c.meta&&c.meta.channels?c.meta.channels.length:0;if(!n)throw new Error('版本数量为 0');putVar('hc_repo_hybrid_pending_detail',appId);return'toast://版本信息已加载：'+n+' 个';}catch(e){return'toast://版本信息加载失败：'+String(e.message||e);}
  },id,spec);
 }
 if(kind==='open'){
  var seed2=this.workspaceActionUrl(kind),spec2=this.workspaceCoreSpec(),id2=String(item&&item.id||'');
  return $(seed2).lazyRule(function(appId,s){
   function loadCore(raw){var c=JSON.parse(raw||'{}'),r=null,first='';try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}if(!r||typeof r.deviceRuleOpenDescriptor!=='function'){require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||139));RuleRepoBoot.load();r=HikerRuleRepo;}if(!r||typeof r.deviceRuleOpenDescriptor!=='function')throw new Error('动作 Core 接口不完整'+(first?'：'+first:''));return r;}
   try{var r=loadCore(s),x=r.findById(appId,false);if(!x)return'toast://程序不存在';var d=r.deviceRuleOpenDescriptor(x);if(!d)return'toast://未取得已安装程序的真实规则描述，请先同步或重新导入';return'rr-native-open://'+encodeURIComponent(JSON.stringify(d));}catch(e){return'toast://打开失败：'+String(e.message||e);}
  },id2,spec2);
 }
 return baseWorkspaceAction.call(this,kind,item);
};

R.hybridProgramData=function(item,index){
 var p=baseHybridProgramData.call(this,item,index);
 if(p&&p.channel&&!p.channelsLoaded&&p.actions&&p.actions.loadChannels){p.actions.open=p.actions.loadChannels;p.actions.check=p.actions.loadChannels;}
 return p;
};

/* 在 RC2 已通过实机的 Render Guard HTML 上做纯文本补丁，不序列化 Rhino 闭包。 */
R.hybridDocument=function(title,data,body,script){
 var html=String(baseHybridDocument.call(this,title,data,body,script)),hits=0;
 function rep(a,b){if(html.indexOf(a)>=0){html=html.replace(a,b);hits++;}}
 rep("if(result.indexOf('海阔视界')===0||result.indexOf('rule://')===0){importToken(result);return;}","if(result.indexOf('rr-native-open://')===0){try{var od=JSON.parse(decodeURIComponent(result.substring(17)));if(!od||!od.url||!od.findRule)throw new Error('目标规则描述不完整');if(typeof b.open!=='function')throw new Error('当前环境缺少原生打开接口');b.open(JSON.stringify(od));return;}catch(oe){showToast('打开失败：'+String(oe.message||oe));return;}}if(result.indexOf('海阔视界')===0||result.indexOf('rule://')===0){importToken(result);return;}");
 rep("infoCard('版本数量',p.channels.length+' 个')","infoCard('版本数量',p.channelsLoaded?p.channels.length+' 个':'待加载')");
 rep("<span class=\"section-count\">'+p.channels.length+' 个 · 点击导入或切换</span>","<span class=\"section-count\">'+(p.channelsLoaded?p.channels.length+' 个 · 点击导入或切换':'点击“加载版本”后显示')+'</span>");
 rep("<button class=\"primary\" data-program-action=\"open\" data-id=\"'+esc(p.id)+'\">打开程序</button>","<button class=\"primary\" data-program-action=\"open\" data-id=\"'+esc(p.id)+'\">'+(p.channelsLoaded?'打开程序':'加载版本')+'</button>");
 rep("if(!nativeResult(result)){showToast('动作返回了不受支持的地址');return;}bridgeOpen(result,program?program.name:DATA.title,program?'rule-repo-business':(channel?'rule-repo-business':'rule-repo-action'));","if(result.indexOf('hiker://home@')===0){showToast('旧版首页跳转已禁用，请刷新规则版本');return;}if(!nativeResult(result)){showToast('动作返回了不受支持的地址');return;}bridgeOpen(result,program?program.name:DATA.title,program?'rule-repo-business':(channel?'rule-repo-business':'rule-repo-action'));");
 html=html.replace('Render Guard 14.1 · client patches 3/3','Render Guard 14.3 · RC4 patches '+hits+'/5');
 return html;
};

R.ruleRepoChannelFallback=function(){
 var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],stable=null,test=null,i,icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 for(i=0;i<list.length;i++){if(String(list[i].channel||'')==='stable')stable=list[i];else if(String(list[i].channel||'')==='test')test=list[i];}
 if(!stable){stable={channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',icon:icon};list.unshift(stable);}
 stable.version='3.5.5';stable.build=389;stable.displayVersion='Stable 3.5.5 · Build 389 · 已恢复推荐';stable.path='apps/tools/rule-repo/rule_repo_remote_v355.txt';stable.mode='remote';stable.updatedAt='2026-08-24';stable.recommended=true;stable.desc='已验证稳定回退基线';stable.highlights=['RC4 修复期间正式通道回退 3.5.5','旧 3.5.6 工件保留历史但不再推荐'];stable.icon=icon;
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:icon};list.push(test);}
 test.version='3.5.6-rc4';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=394;test.displayVersion='Test 3.5.6-rc4 · Build 394 · Version Center Bridge 14.3';test.path='apps/tools/rule-repo/rule_repo_test_v140.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='修复版本中心 0 个版本与打开程序 jsoup 空 selector';test.highlights=['空 channels 缓存自动失效并实时重载','版本详情支持显式加载恢复','打开程序改用真实本地规则描述 + fba.open','禁止 X5 再调用 hiker://home@规则名','Fast Home 与 Verified Install Index 保持不变'];test.icon=icon;
 if(data){data.channels=list;data.updatedAt='2026-08-24 09:xx';}
 return data;
};

if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
