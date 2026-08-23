/* 我的规则仓库 3.5.6-rc2 - Fast Home 14.1 render recovery */
(function(R){
var baseManifest=R.manifest;
var baseWorkspaceAction=R.workspaceAction;
var baseWorkspaceData=R.workspaceData;
var baseWorkspaceClient=R.workspaceClient;
var baseHybridDocument=R.hybridDocument;
var baseChannelInstallRaw=R.channelInstallRaw;
var baseImportRule=R.importRule;
var baseChannelMeta=R.channelMeta;
var baseIconOf=R.iconOf;

R.version='3.5.6-rc2';
R.build=392;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.6';
R.releaseLabel='Single Workspace 14.1 · Fast Home Render Recovery';
R.fastHomeVersion='14.1.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v137.js';
R.workspaceBootstrapCache=137;
R.isTestChannel=function(){return true;};

R.iconOf=function(item){var u=String(baseIconOf.call(this,item)||'');if(String(item&&item.id||'')==='madou'&&u.indexOf('apps/video/madou/assets/icon.svg')>=0&&u.indexOf('?')<0)u+='?v=2026082402';return u;};
R.manifest=function(force){if(force)return baseManifest.call(this,true);var cached=null;try{cached=this._readManifestCache?this._readManifestCache():this.safeJson(getItem(this.cacheKey,''),null);}catch(e){}if(cached&&Array.isArray(cached.items))return cached;return baseManifest.call(this,false);};

R.fastChannelCacheKey=function(id){return this.statePrefix+'channel_meta_fast_v2_'+String(id||'').replace(/[^0-9A-Za-z_.-]/g,'_');};
R.fastChannelCache=function(item){try{var x=this.safeJson(getItem(this.fastChannelCacheKey(item&&item.id),''),null);return x&&x.meta&&Array.isArray(x.meta.channels)?x:null;}catch(e){return null;}};
R.saveFastChannelCache=function(item,meta){if(!item||!meta||!Array.isArray(meta.channels))return meta;try{setItem(this.fastChannelCacheKey(item.id),JSON.stringify({schema:2,time:Date.now(),revision:String(getItem(this.manifestRevisionKey,'')||''),meta:meta}));}catch(e){}return meta;};
R.refreshFastChannelCache=function(item){var meta=baseChannelMeta.call(this,item);return this.saveFastChannelCache(item,meta);};

R.catalogTargets=function(item){var s=String(item&&item.version||item&&item.raw&&item.raw.version||''),out={};function take(label,key){var m=s.match(new RegExp('(?:^|\\/)\\s*'+label+'\\s+([^\\s/]+)','i'));if(m)out[key]=String(m[1]||'').trim();}take('Stable','stable');take('Test','test');take('Local','local');if(!out.stable&&!out.test&&!out.local){var m=s.match(/(\\d+\\.\\d+(?:\\.\\d+)?(?:-[0-9A-Za-z.]+)?)/);if(m)out.stable=m[1];}return out;};
R.fastGroupStateKey=function(id){return this.statePrefix+'group_install_v1_'+String(id||'').replace(/[^0-9A-Za-z_.-]/g,'_');};
R.saveFastGroupState=function(parentId,channel,version,build,name){if(!parentId||!version)return;try{setItem(this.fastGroupStateKey(parentId),JSON.stringify({schema:1,parentId:String(parentId),channel:String(channel||'stable'),version:String(version),build:Number(build||0),name:String(name||''),time:Date.now()}));}catch(e){}};
R.fastGroupState=function(item){var id=String(item&&item.id||'');if(!id)return null;if(id==='rule-repo')return{parentId:id,channel:this.isTestChannel()?'test':'stable',version:String(this.version||''),build:Number(this.build||0),time:Date.now()};try{var saved=this.safeJson(getItem(this.fastGroupStateKey(id),''),null);if(saved&&saved.version)return saved;}catch(e){}var best=null,h=this.importHistory?this.importHistory():[],i,x,k,ch;for(i=0;i<h.length;i++){x=h[i]||{};k=String(x.id||'');if(!(k===id||k.indexOf(id+'-')===0||String(x.name||'')===String(item.name||'')))continue;ch=/local/i.test(k)||/local/i.test(String(x.version||''))?'local':(/test|alpha|beta|rc/i.test(k)||/-test\.|-alpha|-beta|-rc/i.test(String(x.version||''))?'test':'stable');if(!best||Number(x.time||0)>Number(best.time||0))best={parentId:id,channel:ch,version:String(x.version||''),build:0,time:Number(x.time||0)};}var map=this.installedMap?this.installedMap():{};for(k in map)if(Object.prototype.hasOwnProperty.call(map,k)&&(k===id||k.indexOf(id+'-')===0)){x=map[k]||{};ch=/local/i.test(k)||/local/i.test(String(x.version||''))?'local':(/test|alpha|beta|rc/i.test(k)||/-test\.|-alpha|-beta|-rc/i.test(String(x.version||''))?'test':'stable');if(x.version&&(!best||Number(x.time||0)>Number(best.time||0)))best={parentId:id,channel:ch,version:String(x.version),build:Number(x.build||0),time:Number(x.time||0)};}return best;};
R.fastItemState=function(item){var group=String(item&&item.entryType||'')==='channel-group'||!!(item&&item.channelsPath),st,targets,target='',update=false;if(group){st=this.fastGroupState(item);targets=this.catalogTargets(item);if(st&&st.version){target=String(targets[st.channel]||'');if(target)update=this.versionCmp(target,st.version)>0;}return{group:true,installed:!!(st&&st.version),channel:st?String(st.channel||'stable'):'',installedVersion:st?String(st.version||''):'',targetVersion:target,update:update};}var v=String(this.installedVersion(item)||'');return{group:false,installed:!!v,channel:'',installedVersion:v,targetVersion:String(item&&item.version||''),update:!!v&&this.versionCmp(String(item&&item.version||''),v)>0};};
R.fastStatusMeta=function(item){var s=this.fastItemState(item);if(s.update)return{label:'可更新',color:'#F59E0B'};if(s.installed)return{label:'已安装',color:'#22A06B'};if(s.group)return{label:'版本中心',color:'#1677FF'};return{label:'未安装',color:'#8A8F98'};};
R.nativeStatusMeta=function(item){return this.fastStatusMeta(item);};
R.fastActualInstalled=function(item){return this.fastItemState(item).installed;};
R.fastActualStatus=function(item){var s=this.fastItemState(item);return s.update?'可更新':(s.installed?'已安装':(s.group?'版本中心':'未安装'));};
R.stats=function(items){items=items||[];var out={all:items.length,remote:0,local:0,installed:0,updates:0,favorites:this.favIds().length,recent:this.recentIds().length,groups:0},i,x,s;for(i=0;i<items.length;i++){x=items[i];if(x.mode==='remote')out.remote++;else out.local++;if(String(x.entryType||'')==='channel-group')out.groups++;s=this.fastItemState(x);if(s.installed)out.installed++;if(s.update)out.updates++;}return out;};
R.nativeHomeItems=(function(base){return function(items,view,category,sub,sort){var a=base.call(this,items,'all',category,sub,sort),self=this,favs=this.favIds();if(view==='installed')a=a.filter(function(x){return self.fastActualInstalled(x);});else if(view==='updates')a=a.filter(function(x){return self.fastActualStatus(x)==='可更新';});else if(view==='favorites')a=a.filter(function(x){return favs.indexOf(String(x.id||''))>=0;});return a;};})(R.nativeHomeItems);

R.channelInstallRaw=function(parent,c){var raw=baseChannelInstallRaw.call(this,parent,c);raw.__repoParentId=String(parent&&parent.id||'');raw.__repoChannel=String(c&&c.channel||'stable');raw.__repoBuild=Number(c&&c.build||0);return raw;};
R.importRule=function(raw){var x=null;try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;}catch(e){}var ret=baseImportRule.call(this,raw);if(x&&x.__repoParentId&&String(ret||'').indexOf('海阔视界')===0)this.saveFastGroupState(x.__repoParentId,x.__repoChannel,x.version,x.__repoBuild,x.name);return ret;};

R.workspaceAction=function(kind,item){if(kind==='load-channels'){var seed=this.workspaceActionUrl(kind),spec=this.workspaceCoreSpec(),id=String(item&&item.id||'');return $(seed).lazyRule(function(appId,s){function loadCore(raw){var c=JSON.parse(raw||'{}'),r=null,first='';try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}if(!r||typeof r.refreshFastChannelCache!=='function'){require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||137));RuleRepoBoot.load();r=HikerRuleRepo;}if(!r||typeof r.refreshFastChannelCache!=='function')throw new Error('动作 Core 接口不完整'+(first?'：'+first:''));return r;}try{var r=loadCore(s),x=r.findById(appId,false);if(!x)return'toast://程序不存在';r.refreshFastChannelCache(x);putVar('hc_repo_hybrid_pending_detail',appId);return'toast://版本信息已加载';}catch(e){return'toast://版本信息加载失败：'+String(e.message||e);}},id,spec);}return baseWorkspaceAction.call(this,kind,item);};

R.hybridProgramData=function(item,index){var state=this.fastItemState(item),st=this.fastStatusMeta(item),tags=this.nativeProgramTags?this.nativeProgramTags(item):(item.tags||[]).slice(0,3),group=state.group,channels=[],cache=null,cs=[],c,summary=String(this.nativeProgramSummary(item)||'');if(group){cache=this.fastChannelCache(item);if(cache){cs=cache.meta.channels||[];for(c=0;c<cs.length;c++)channels.push(this.workspaceChannelData(item,cs[c],c));}if(state.update)summary=(state.channel==='test'?'测试版':(state.channel==='local'?'本地版':'正式版'))+' '+state.installedVersion+' → '+state.targetVersion+' · 可更新';else if(state.installed)summary=(state.channel==='test'?'测试版':(state.channel==='local'?'本地版':'正式版'))+' '+state.installedVersion+' · 已安装';}return{id:String(item.id||''),name:String(item.name||'未命名程序'),version:this.nativeVersionText(item),localVersion:String(state.installedVersion||'暂无'),targetVersion:String(state.targetVersion||''),activeChannel:String(state.channel||''),status:String(st.label),statusColor:String(st.color),installed:!!state.installed,update:!!state.update,favorite:!!this.isFav(item),channel:group,channelsLoaded:!group||!!cache,category:String(item.category||'other'),categoryName:String(item.categoryName||'程序'),subCategory:String(item.subCategory||''),mode:String(item.mode||''),typeText:group?'多版本程序':(item.mode==='remote'?'远程代码程序':'本地代码程序'),sizeText:item.bytes?Math.max(1,Math.round(Number(item.bytes)/1024))+' KB':'轻量规则',tags:tags.map(function(x){return String(x);}),desc:String(item.desc||summary),summary:summary,icon:String(this.iconOf(item)||''),updatedAt:String(item.updatedAt||'--'),order:Number(index||0),channels:channels,actions:{open:this.workspaceAction('open',item),import:group?'':this.workspaceAction('import',item),favorite:this.workspaceAction('favorite',item),check:this.workspaceAction('check',item),loadChannels:group&&!cache?this.workspaceAction('load-channels',item):''},search:[item.name,item.version,item.desc,item.categoryName,item.subCategory,(item.tags||[]).join(' ')].join(' ').toLowerCase()};};
R.hybridPrograms=function(items){var out=[];for(var i=0;i<(items||[]).length;i++)out.push(this.hybridProgramData(items[i],i));return out;};
R.workspaceData=function(items,initialView,initialId){var d=baseWorkspaceData.call(this,items,initialView,initialId),pending=String(getVar('hc_repo_hybrid_pending_detail','')||'');if(pending){d.initialView='detail';d.initialId=pending;putVar('hc_repo_hybrid_pending_detail','');}d.ui='Single Workspace 14.1';d.performance={mode:'cache-first',livePresence:false,channelMeta:'lazy',renderGuard:true};return d;};

R.workspaceClient=baseWorkspaceClient;
R.hybridDocument=function(title,data,body,script){
 var client=String(baseWorkspaceClient.toString()),hits=0;
 function rep(a,b){if(client.indexOf(a)>=0){client=client.replace(a,b);hits++;}}
 rep("function updatesView(){var a=DATA.programs.filter(function(p){return p.update&&!p.channel;})","function updatesView(){var a=DATA.programs.filter(function(p){return p.update;})");
 rep("if((v=el.getAttribute('data-program'))){go('detail',v);return;}","if((v=el.getAttribute('data-program'))){var lp=byId(v);if(lp&&lp.channel&&!lp.channelsLoaded&&lp.actions&&lp.actions.loadChannels){runAction(lp.actions.loadChannels,'loadChannels',lp);return;}go('detail',v);return;}");
 rep("if(mode==='sync'&&b.refreshPage)setTimeout(function(){b.refreshPage(true);},500);return;","if((mode==='sync'||mode==='loadChannels')&&b.refreshPage)setTimeout(function(){b.refreshPage(true);},mode==='loadChannels'?120:500);return;");
 var wrapped="function(){try{("+client+")();}catch(e){var h=document.getElementById('viewHost'),n=document.getElementById('bottomNav');if(n)n.innerHTML='';if(h)h.innerHTML='<div style=\"padding:28px 18px;font-family:sans-serif;color:#20242a\"><div style=\"font-size:18px;font-weight:700;margin-bottom:10px\">工作区加载失败</div><div style=\"font-size:13px;color:#777;line-height:1.6;word-break:break-all\">'+String(e&&e.message||e)+'</div><div style=\"font-size:12px;color:#999;margin-top:12px\">Render Guard 14.1 · client patches "+hits+"/3</div></div>';}}";
 var old=this.workspaceClient,self=this;this.workspaceClient={toString:function(){return wrapped;}};try{return baseHybridDocument.call(self,title,data,body,script);}finally{this.workspaceClient=old;}
};

R.ruleRepoChannelFallback=(function(base){return function(){var data=base.call(this),list=data&&data.channels||[];for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){list[i].version='3.5.6-rc2';list[i].baseVersion='3.5.5';list[i].targetVersion='3.5.6';list[i].build=392;list[i].displayVersion='Test 3.5.6-rc2 · Build 392 · Fast Home 14.1';list[i].path='apps/tools/rule-repo/rule_repo_test_v138.txt';list[i].updatedAt='2026-08-24';list[i].desc='修复 RC1 X5 空白页 · 保留首页缓存优先 / 多版本更新索引 / 版本中心按需加载';list[i].highlights=['修复 workspaceClient 闭包序列化导致白屏','增加 Render Guard 显式错误页','首页继续零逐项安装探测','channels.json 继续按需加载','多版本程序继续参与可更新统计'];}return data;};})(R.ruleRepoChannelFallback);
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
