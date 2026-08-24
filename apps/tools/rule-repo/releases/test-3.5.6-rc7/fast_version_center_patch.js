/* 我的规则仓库 3.5.6-rc7 - Fast Version Center 14.6 */
(function(R){
var baseWorkspaceData=R.workspaceData;
var baseHybridDocument=R.hybridDocument;
var baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;

R.version='3.5.6-rc7';
R.build=397;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.6 · Fast Version Center';
R.fastHomeVersion='14.6.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v142.js';
R.workspaceBootstrapCache=142;
R.isTestChannel=function(){return true;};

/* 版本中心缓存只与当前程序自己的目录摘要绑定，避免其它程序更新导致无谓失效。 */
R.channelCacheSignature=function(item){
 item=item||{};
 return [String(item.id||''),String(item.channelsPath||item.raw&&item.raw.channelsPath||''),String(item.version||item.raw&&item.raw.version||''),String(item.updatedAt||item.raw&&item.raw.updatedAt||'')].join('|');
};
R.fastChannelCache=function(item){
 try{
  var key=this.fastChannelCacheKey(item&&item.id),x=this.safeJson(getItem(key,''),null),sig=this.channelCacheSignature(item);
  if(x&&x.meta&&Array.isArray(x.meta.channels)&&x.meta.channels.length>0){
   if(!x.sig){x.sig=sig;x.schema=4;try{setItem(key,JSON.stringify(x));}catch(e0){}return x;}
   if(String(x.sig)===sig)return x;
  }
  if(x){try{clearItem(key);}catch(e1){try{setItem(key,'');}catch(e2){}}}
 }catch(e){}
 return null;
};
R.saveFastChannelCache=function(item,meta){
 if(!item||!meta||!Array.isArray(meta.channels)||meta.channels.length===0)return null;
 var x={schema:4,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),sig:this.channelCacheSignature(item),meta:meta};
 try{setItem(this.fastChannelCacheKey(String(item.id||'')),JSON.stringify(x));}catch(e){}
 return x;
};

R.channelMetaMatchesCatalog=function(item,data){
 if(!data||!Array.isArray(data.channels)||data.channels.length===0)return false;
 var targets={};try{targets=this.catalogTargets?this.catalogTargets(item):{};}catch(e){}
 var keys=['stable','test','local'],map={},i,c,k,checked=0;
 for(i=0;i<data.channels.length;i++){c=data.channels[i]||{};k=String(c.channel||'').toLowerCase();if(k)map[k]=String(c.version||'');}
 for(i=0;i<keys.length;i++){k=keys[i];if(targets&&targets[k]){checked++;if(!map[k]||String(map[k])!==String(targets[k]))return false;}}
 return checked?true:true;
};
R._channelMetaText=function(url,path,source,timeout){
 var t=fetch(String(url),{timeout:Number(timeout||4500),headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});
 t=String(t==null?'':t);
 if(typeof this._validCloudText==='function')t=this._validCloudText(path,t);
 else{if(!t)throw new Error('空响应');JSON.parse(t);}
 try{if(typeof this._rememberCloud==='function')this._rememberCloud(source,'');}catch(e){}
 return t;
};
R._channelMetaApiText=function(path,timeout){
 var clean=String(path||'').replace(/^\/+/,''),u='https://api.github.com/repos/'+this.repo+'/contents/'+clean+'?ref='+encodeURIComponent(this.branch)+'&_t='+Date.now();
 var t=fetch(u,{timeout:Number(timeout||6500),headers:{Accept:'application/vnd.github+json','Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}),j=JSON.parse(String(t||'{}'));
 if(!j||!j.content)throw new Error('GitHub API 内容为空');
 var s=base64Decode(String(j.content).replace(/\s+/g,''));
 if(typeof this._validCloudText==='function')s=this._validCloudText(path,s);else JSON.parse(String(s||''));
 try{if(typeof this._rememberCloud==='function')this._rememberCloud('GitHub API','');}catch(e){}
 return String(s||'');
};
R._channelMetaCandidate=function(item,text,source){
 var d=this.safeJson(String(text||''),null);
 if(!d||!Array.isArray(d.channels)||d.channels.length===0)throw new Error(source+' 返回空版本');
 if(!this.channelMetaMatchesCatalog(item,d))throw new Error(source+' 版本摘要滞后');
 d._source=source;return d;
};

/* 小 JSON 使用 CDN 快路径；只有快路径失败/滞后才进入短超时兜底。 */
R.loadChannelMetaLive=function(item){
 var path=String(item&&item.channelsPath||item&&item.raw&&item.raw.channelsPath||'').replace(/^\/+/,''),errs=[],d=null,self=this;
 if(!path){if(String(item&&item.id||'')==='rule-repo')return this.ruleRepoChannelFallback();throw new Error('channelsPath 为空');}
 function take(source,fn){try{var x=fn();d=self._channelMetaCandidate(item,x,source);return true;}catch(e){errs.push(source+' '+String(e.message||e));return false;}}
 var cdn='https://cdn.jsdelivr.net/gh/'+this.repo+'@'+this.branch+'/'+path+'?t='+Date.now();
 if(take('jsDelivr',function(){return self._channelMetaText(cdn,path,'jsDelivr',4500);} ))return d;
 if(take('GitHub API',function(){return self._channelMetaApiText(path,6500);} ))return d;
 var web='https://github.com/'+this.repo+'/raw/refs/heads/'+this.branch+'/'+path+'?t='+Date.now();
 if(take('WebRaw',function(){return self._channelMetaText(web,path,'GitHub Web Raw',4500);} ))return d;
 var raw='https://raw.githubusercontent.com/'+this.repo+'/'+this.branch+'/'+path+'?_t='+Date.now();
 if(take('Raw',function(){return self._channelMetaText(raw,path,'GitHub Raw',4500);} ))return d;
 if(String(item&&item.id||'')==='rule-repo'){try{return this.ruleRepoChannelFallback();}catch(e2){errs.push('fallback '+String(e2.message||e2));}}
 throw new Error('版本信息快速通道全部失败：'+errs.join(' | '));
};
R.refreshFastChannelCache=function(item){
 var old=this.fastChannelCache(item);if(old&&old.meta&&old.meta.channels&&old.meta.channels.length)return old;
 var meta=this.loadChannelMetaLive(item),saved=this.saveFastChannelCache(item,meta);
 if(!saved||!saved.meta||!saved.meta.channels||!saved.meta.channels.length)throw new Error('版本元数据为空');
 return saved;
};

R.workspaceData=function(items,initialView,initialId){
 var d=baseWorkspaceData.call(this,items,initialView,initialId);
 d.ui='Single Workspace 14.6';
 d.performance={mode:'cache-first',livePresence:false,channelMeta:'detail-fast-cdn-first',renderGuard:true,installIndex:'verified',stateMigration:'runtime-authoritative',identityParser:'nested-home-rule-v2',versionCenter:'optimistic-detail'};
 return d;
};

/* 先渲染详情，再异步触发版本加载；网络不再挡住页面进入。 */
R.hybridDocument=function(title,data,body,script){
 var html=String(baseHybridDocument.call(this,title,data,body,script));
 function rep(a,b){if(html.indexOf(a)>=0)html=html.replace(a,b);}
 rep("function go(view,id){if(view==='detail'){var dp=byId(String(id||''));if(dp&&dp.channel&&!dp.channelsLoaded&&dp.actions&&dp.actions.loadChannels){runAction(dp.actions.loadChannels,'loadChannels',dp);return;}}rememberScroll();if(state.view!==view||String(state.id)!==String(id||''))state.stack.push(snapshot());state.view=view;state.id=view==='detail'?String(id||''):'';render();}",
     "function go(view,id){rememberScroll();if(state.view!==view||String(state.id)!==String(id||''))state.stack.push(snapshot());state.view=view;state.id=view==='detail'?String(id||''):'';render();if(view==='detail'){var dp=byId(String(id||''));if(dp&&dp.channel&&!dp.channelsLoaded&&dp.actions&&dp.actions.loadChannels){setTimeout(function(){runAction(dp.actions.loadChannels,'loadChannels',dp);},40);}}}");
 rep("infoCard('版本数量',p.channelsLoaded?p.channels.length+' 个':'待加载')","infoCard('版本数量',p.channelsLoaded?p.channels.length+' 个':'加载中…')");
 rep("<span class=\"section-count\">'+(p.channelsLoaded?p.channels.length+' 个 · 点击导入或切换':'点击“加载版本”后显示')+'</span>","<span class=\"section-count\">'+(p.channelsLoaded?p.channels.length+' 个 · 点击导入或切换':'正在快速加载版本…')+'</span>");
 html=html.replace(/Single Workspace 14\.5/g,'Single Workspace 14.6');
 html=html.replace(/Render Guard 14\.5 · RC6 patches/g,'Render Guard 14.6 · RC7 patches');
 return html;
};

R.ruleRepoChannelFallback=function(){
 var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],test=null,i;
 for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){test=list[i];break;}
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg'};list.push(test);}
 test.version='3.5.6-rc7';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=397;test.displayVersion='Test 3.5.6-rc7 · Build 397 · Fast Version Center 14.6';test.path='apps/tools/rule-repo/rule_repo_test_v143.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='优化多版本详情首次进入速度：缓存优先、CDN 快路径、短超时容灾与先渲染后加载';test.highlights=['已加载版本中心直接读本地缓存','首次 channels.json 使用 jsDelivr CDN 优先','CDN 失败才短超时回退 API/WebRaw/Raw','缓存按程序自身摘要签名避免无关失效','详情页先立即显示再自动加载版本'];
 if(data){data.channels=list;data.updatedAt='2026-08-24 16:xx';}
 return data;
};

if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
