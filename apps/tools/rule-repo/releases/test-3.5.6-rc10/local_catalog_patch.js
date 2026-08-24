/* 我的规则仓库 3.5.6-rc10 - Local Catalog Snapshot 15.1 */
(function(R){
  var baseSyncManifest=R.syncManifest,baseWorkspaceData=R.workspaceData,baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;
  R.version='3.5.6-rc10';R.build=400;R.channel='test';R.baseStableVersion='3.5.5';R.baseStableBuild=389;R.targetVersion='3.5.6';
  R.releaseLabel='Single Workspace 15.1 · Local-First Runtime + Local Catalog';R.localFirstRuntimeVersion='15.1';
  R.syncLocalChannelCatalog=function(items){
    items=Array.isArray(items)?items:[];var groups=[],i,it,path;
    for(i=0;i<items.length;i++){it=items[i]||{};path=String(it.channelsPath||it.raw&&it.raw.channelsPath||'').replace(/^\/+/, '');if(path)groups.push({item:it,path:path});}
    var result={total:groups.length,ok:0,fail:0,errors:[]},texts=[],reqs=[];
    if(typeof batchFetch==='function'&&groups.length){
      try{
        for(i=0;i<groups.length;i++)reqs.push({url:'https://raw.githubusercontent.com/'+this.repo+'/'+this.branch+'/'+groups[i].path+'?_sync='+Date.now()+'_'+i,options:{timeout:6500,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}});
        var rs=batchFetch(reqs);for(i=0;i<groups.length;i++)if(rs&&rs[i]!=null)texts[i]=String(rs[i]);
      }catch(be){result.errors.push('batch '+String(be.message||be));}
    }
    for(i=0;i<groups.length;i++){
      var g=groups[i],meta=null,err='';
      try{if(texts[i])meta=this._channelMetaCandidate(g.item,texts[i],'Sync Raw');}catch(e1){err=String(e1.message||e1);}
      if(!meta)try{meta=this.loadChannelMetaLive(g.item);}catch(e2){err+=(err?' | ':'')+String(e2.message||e2);}
      if(meta&&Array.isArray(meta.channels)&&meta.channels.length){this.saveFastChannelCache(g.item,meta);result.ok++;}
      else{result.fail++;result.errors.push(String(g.item.id||g.item.name||i)+': '+(err||'空版本'));}
    }
    try{setItem('hc_repo_local_catalog_sync_v1',JSON.stringify({schema:1,time:Date.now(),result:result}));}catch(e3){}
    return result;
  };
  R.syncManifest=function(){var x=baseSyncManifest.apply(this,arguments);if(x&&x.ok){try{x.localChannels=this.syncLocalChannelCatalog(this.items(false));}catch(e){x.localChannelError=String(e.message||e);}}return x;};
  R.workspaceData=function(items,initialView,initialId){var d=baseWorkspaceData.call(this,items,initialView,initialId);d.ui='Single Workspace 15.1';d.performance={mode:'local-first',runtime:'rule-private-bundle',catalog:'sync-local-snapshot',icons:'local-cache',livePresence:false,versionCenter:'local-cache-first'};return d;};
  R.ruleRepoChannelFallback=function(){var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],test=null,i;for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){test=list[i];break;}if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版'};list.push(test);}test.version='3.5.6-rc10';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=400;test.displayVersion='Test 3.5.6-rc10 · Build 400 · Local-First 15.1';test.path='apps/tools/rule-repo/rule_repo_test_v146.txt';test.mode='remote';test.updatedAt='2026-08-24';test.desc='远程发布、本地运行试点：代码、图标与多版本索引在安装/同步时落地，本地正常运行不依赖 GitHub';test.highlights=['Release 模块写入规则私有本地包','新包完整校验后才切 active','同步时缓存全部程序图标','同步时并行缓存全部 channels 版本索引','正常首页/版本详情只读本地缓存'];if(data){data.channels=list;data.updatedAt='2026-08-24 17:xx';}return data;};
  if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
