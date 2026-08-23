/* XVideos Remote Test Bootstrap 0.1.0-test.5 - direct immutable rescue loader */
var XVIDEOS_BOOT_CONFIG={
  id:'xvideos-test',branch:'main',repoRoot:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/',version:'0.1.0-test.5',build:10105,
  release:'apps/video/xvideos/releases/0.1.0-test.5/release.json',
  modules:[
    {name:'core',path:'apps/video/xvideos/releases/0.1.0-test.1/core.js'},
    {name:'runtime',path:'apps/video/xvideos/releases/0.1.0-test.1/runtime.js'},
    {name:'corePatch2',path:'apps/video/xvideos/releases/0.1.0-test.2/core_patch.js'},
    {name:'runtimePatch2',path:'apps/video/xvideos/releases/0.1.0-test.2/runtime_patch.js'},
    {name:'coreProductPatch3',path:'apps/video/xvideos/releases/0.1.0-test.3/core_product_patch.js'},
    {name:'uiProductPatch3',path:'apps/video/xvideos/releases/0.1.0-test.3/ui_product_patch.js'},
    {name:'routePatch3',path:'apps/video/xvideos/releases/0.1.0-test.3/route_patch.js'},
    {name:'coreAccountPatch4',path:'apps/video/xvideos/releases/0.1.0-test.4/core_account_patch.js'},
    {name:'uiAccountPatch4',path:'apps/video/xvideos/releases/0.1.0-test.4/ui_account_patch.js'},
    {name:'coreRescuePatch5',path:'apps/video/xvideos/releases/0.1.0-test.5/core_rescue_patch.js'},
    {name:'uiRescuePatch5',path:'apps/video/xvideos/releases/0.1.0-test.5/ui_rescue_patch.js'},
    {name:'transportPatch5',path:'apps/video/xvideos/releases/0.1.0-test.5/transport_patch.js'}
  ]
};
var XVideosBoot={
  loadOnly:function(){
    var root=XVIDEOS_BOOT_CONFIG.repoRoot,i,m,url,loaded=[];
    for(i=0;i<XVIDEOS_BOOT_CONFIG.modules.length;i++){
      m=XVIDEOS_BOOT_CONFIG.modules[i];url=root+m.path+'?xv_release=10105&module='+i;
      require(url,{headers:{'Cache-Control':'no-cache'}},10105);loaded.push({name:m.name,url:url});
    }
    if(typeof XVideosCore==='undefined'||String(XVideosCore.version)!=='0.1.0-test.5'||Number(XVideosCore.build)!==10105)throw new Error('XVideos Test5 Core 校验失败');
    if(typeof XVideosRemoteRuntime==='undefined'||String(XVideosRemoteRuntime.version)!=='0.1.0-test.5'||Number(XVideosRemoteRuntime.build)!==10105)throw new Error('XVideos Test5 Runtime 校验失败');
    return{ok:true,release:{id:'xvideos-test',version:'0.1.0-test.5',build:10105},loaded:loaded,rescueMode:true};
  },
  module:function(){this.loadOnly();return XVideosRemoteRuntime.module();},
  info:function(){return{managerVersion:'direct-loader-cdn',current:{id:'xvideos-test',version:'0.1.0-test.5',build:10105},rescueMode:true,note:'Direct immutable jsDelivr loader avoids saturated private-KV Remote Manager state and raw GitHub first-load failures.'};},
  check:function(){return{ok:true,current:{id:'xvideos-test',version:'0.1.0-test.5',build:10105},hasUpdate:false,rescueMode:true};},
  update:function(){return{ok:false,changed:false,error:'Test5 为私有存储救援版；请从“我的规则仓库”同步并覆盖新版本'};},
  rollback:function(){return{ok:false,error:'Test5 救援模式不写 Remote Manager 状态；回退请从“我的规则仓库”覆盖 Test4'};},
  reinstall:function(){return this.loadOnly();}
};
