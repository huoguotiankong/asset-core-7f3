/* 麻豆传媒 Stable Bootstrap 0.1.0 - immutable direct loader */
var MADOU_BOOT_CONFIG={
  id:'madou',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0',build:10114,
  modules:[
    {name:'core',path:'apps/video/madou/releases/0.1.0-test.1/core.js'},
    {name:'runtime',path:'apps/video/madou/releases/0.1.0-test.1/runtime.js'},
    {name:'performanceRuntime',path:'apps/video/madou/releases/0.1.0-test.10/performance_runtime.js'},
    {name:'storageRescue',path:'apps/video/madou/releases/0.1.0-test.12/storage_rescue.js'},
    {name:'defaultDetailPlayback',path:'apps/video/madou/releases/0.1.0-test.13/default_detail_playback.js'},
    {name:'stablePatch',path:'apps/video/madou/releases/0.1.0/stable_patch.js'}
  ]
};
var MadouBoot={
  loadOnly:function(){
    var root=MADOU_BOOT_CONFIG.repoRawRoot+MADOU_BOOT_CONFIG.branch+'/',i,m,url,loaded=[];
    for(i=0;i<MADOU_BOOT_CONFIG.modules.length;i++){
      m=MADOU_BOOT_CONFIG.modules[i];
      url=root+m.path+'?madou_release=0.1.0';
      require(url,{headers:{'Cache-Control':'no-cache'}},10114);
      loaded.push({name:m.name,url:url});
    }
    if(typeof MadouRemoteRuntime==='undefined'||String(MadouRemoteRuntime.version)!=='0.1.0'||Number(MadouRemoteRuntime.build)!==10114)throw new Error('麻豆传媒 Stable 0.1.0 运行时校验失败');
    return{ok:true,release:{id:'madou',version:'0.1.0',build:10114},loaded:loaded,rescueMode:true};
  },
  module:function(){this.loadOnly();return MadouRemoteRuntime.module();},
  info:function(){return{managerVersion:'direct-loader',current:{id:'madou',version:'0.1.0',build:10114},rescueMode:true,note:'Stable direct immutable loader; avoids saturated setItem remote state'};},
  check:function(){return{ok:true,current:{id:'madou',version:'0.1.0',build:10114},hasUpdate:false,rescueMode:true};},
  update:function(){return{ok:false,changed:false,error:'正式版采用直接加载模式；请从我的规则仓库同步并覆盖新版本'};},
  rollback:function(){return{ok:false,error:'正式版采用直接加载模式；回退请从我的规则仓库覆盖历史版本'};},
  reinstall:function(){return this.loadOnly();}
};
