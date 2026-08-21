/* 我的规则仓库 3.5.4-rc7 - Context-free action bridge 13.2 */
(function(R){
var baseWorkspaceData=R.workspaceData,baseChannelFallback=R.ruleRepoChannelFallback;
R.singleWorkspaceVersion='13.2.0';
R.workspaceContextFreeActionsVersion='13.2.0';
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v130.js';
R.workspaceBootstrapCache=130;

R.workspaceCoreSpec=function(){
 var name=this.hybridRuleName?this.hybridRuleName():(this.isTestChannel&&this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库');
 name=String(name||'我的规则仓库·测试版').replace(/[?&#]/g,'');
 return JSON.stringify({page:'hiker://page/ruleRepoCore?rule='+name,bootstrap:this.workspaceBootstrapUrl,cache:Number(this.workspaceBootstrapCache||130)});
};

R.workspaceAction=function(kind,item){
 var seed=this.workspaceActionUrl(kind),spec=this.workspaceCoreSpec(),payload=JSON.stringify({id:String(item&&item.id||''),raw:item&&item.raw?item.raw:null});
 return $(seed).lazyRule(function(k,p,s){
  function loadCore(raw){
   var c=JSON.parse(raw||'{}'),r=null,first='';
   try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}
   if(!r||typeof r.importRule!=='function'){
    try{require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||130));RuleRepoBoot.load();r=HikerRuleRepo;}catch(e2){throw new Error('动作 Core 加载失败'+(first?'（页面模块：'+first+'）':'')+'；Bootstrap：'+String(e2.message||e2));}
   }
   if(!r||typeof r.findById!=='function')throw new Error('动作 Core 接口不完整');
   return r;
  }
  try{
   var r=loadCore(s),x=JSON.parse(p||'{}'),id=String(x.id||''),item;
   if(k==='import')return x.raw?r.importRule(x.raw):'toast://导入信息为空，请同步目录后重试';
   item=r.findById(id,k==='check');if(!item)return'toast://程序不存在，请先同步目录';
   if(k==='open'){
    if(String(item.id)==='rule-repo'&&r.isTestChannel&&r.isTestChannel()){r.recordOpen(item);return'hiker://home@我的规则仓库·测试版||hiker://home';}
    return r.openRule(item);
   }
   if(k==='favorite'){var on=r.toggleFav(item);return'toast://'+(on?'已收藏':'已取消收藏');}
   if(k==='check'){if(r.clearPresenceCache)r.clearPresenceCache();return'toast://'+r.nativeStatusMeta(item).label+' · 云端 '+r.nativeVersionText(item);}
   return'toast://未知程序操作';
  }catch(e){return'toast://操作失败：'+String(e.message||e);}
 },String(kind||''),payload,spec);
};

R.workspaceChannelData=function(parent,c,index){
 var raw=this.channelInstallRaw(parent,c),ch=String(c.channel||''),current=String(parent.id||'')==='rule-repo'&&((this.isTestChannel()&&ch==='test')||(!this.isTestChannel()&&ch==='stable'));
 return{channel:ch,label:ch==='stable'?'正式版':(ch==='test'?'测试版':(ch==='local'?'本地版':'版本')),version:String(c.version||'--'),displayVersion:String(c.displayVersion||c.version||'--'),desc:String(c.desc||''),updatedAt:String(c.updatedAt||''),icon:String(c.icon||this.iconOf(parent)),highlights:Array.isArray(c.highlights)?c.highlights.slice(0,4):[],current:current,status:current?'当前运行':(ch==='stable'?'稳定推荐':(ch==='test'?'抢先体验':'独立安装')),action:this.workspaceAction('import',{id:String(parent.id||''),raw:raw}),order:Number(index||0)};
};

R.workspaceStaticAction=function(kind){
 var seed=this.workspaceActionUrl(kind),spec=this.workspaceCoreSpec();
 return $(seed).lazyRule(function(k,s){
  function loadCore(raw){
   var c=JSON.parse(raw||'{}'),r=null,first='';
   try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}
   if(!r||typeof r.importRule!=='function'){
    try{require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||130));RuleRepoBoot.load();r=HikerRuleRepo;}catch(e2){throw new Error('动作 Core 加载失败'+(first?'（页面模块：'+first+'）':'')+'；Bootstrap：'+String(e2.message||e2));}
   }
   if(!r||typeof r.exportState!=='function')throw new Error('动作 Core 接口不完整');
   return r;
  }
  var loading=false;
  try{
   var r=loadCore(s);
   if(k==='sync'){showLoading('正在同步…');loading=true;var x=r.syncManifest();if(r.clearPresenceCache)r.clearPresenceCache();hideLoading();loading=false;if(!x.ok)return'toast://同步失败，已保留当前目录';return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}
   if(k==='backup')return'copy://'+r.exportState();
   if(k==='clearRecent'){r.clearOpenHistory();return'toast://最近打开已清空';}
   if(k==='clearSearch'){r.clearSearchHistory();return'toast://搜索历史已清空';}
   if(k==='clearImports'){r.clearImportHistory();return'toast://导入记录已清空';}
   if(k==='recordSearch'){var q=String(getVar('hc_repo_hybrid_search','')||'').trim();if(q)r.recordSearch(q);return'toast://';}
   if(k==='diagnostics'){var src=r.lastCloudSource?r.lastCloudSource():'--',rev=String(getItem(r.manifestRevisionKey,'--')||'--');return'confirm://Core '+r.version+'\\nbuild '+r.build+'\\nUI Single Workspace 13.2\\naction explicit-rule + bootstrap-fallback\\nrevision '+rev+'\\nsource '+src;}
   return'toast://未知设置操作';
  }catch(e){if(loading)try{hideLoading();}catch(x){}return'toast://操作失败：'+String(e.message||e);}
 },String(kind||''),spec);
};

R.workspaceStaticActions=function(){
 return{sync:this.workspaceStaticAction('sync'),backup:this.workspaceStaticAction('backup'),clearRecent:this.workspaceStaticAction('clearRecent'),clearSearch:this.workspaceStaticAction('clearSearch'),clearImports:this.workspaceStaticAction('clearImports'),recordSearch:this.workspaceStaticAction('recordSearch'),diagnostics:this.workspaceStaticAction('diagnostics')};
};

R.workspaceData=function(items,initialView,initialId){
 var data=baseWorkspaceData.call(this,items,initialView,initialId);data.ui='Single Workspace 13.2';data.actions=this.workspaceStaticActions();return data;
};

R.ruleRepoChannelFallback=function(){
 var data=baseChannelFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.4-rc7';list[i].build=384;list[i].path='apps/tools/rule-repo/rule_repo_test_v130.txt';list[i].desc='Single Workspace 13.2 · 脱离页面上下文也能执行导入、诊断与备份';list[i].highlights=['显式规则上下文','Bootstrap 双路恢复','导入与设置动作修复','错误页内收敛','Stable 恢复隔离'];
 }
 return data;
};
})(HikerRuleRepo);
