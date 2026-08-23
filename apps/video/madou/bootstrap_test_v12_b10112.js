/* 麻豆传媒 Remote Test Bootstrap 0.1.0-test.12 - storage rescue */
var MADOU_BOOT_CONFIG={
  id:'madou-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/madou/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:0,
  defaultRelease:{id:'madou-test',name:'麻豆传媒',version:'0.1.0-test.12',build:10112,ref:'main',modules:[
    {name:'core',path:'apps/video/madou/releases/0.1.0-test.1/core.js'},
    {name:'runtime',path:'apps/video/madou/releases/0.1.0-test.1/runtime.js'},
    {name:'performanceRuntime',path:'apps/video/madou/releases/0.1.0-test.10/performance_runtime.js'},
    {name:'storageRescue',path:'apps/video/madou/releases/0.1.0-test.12/storage_rescue.js'},
    {name:'noSniffProtocol',path:'apps/video/madou/releases/0.1.0-test.12/nosniff_protocol.js'},
    {name:'detailSettings',path:'apps/video/madou/releases/0.1.0-test.12/detail_settings.js'}
  ],verify:{global:'MadouRemoteRuntime',property:'version',equals:'0.1.0-test.12'}}
};
var MadouBoot={
  manager:function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201',{headers:{'Cache-Control':'no-cache'}},201);return HikerCloudRemote;},
  loadOnly:function(){return this.manager().loadRelease(MADOU_BOOT_CONFIG,MADOU_BOOT_CONFIG.defaultRelease,false);},
  module:function(){this.loadOnly();return MadouRemoteRuntime.module();},
  info:function(){return{managerVersion:'2.0.1',current:MADOU_BOOT_CONFIG.defaultRelease,rescueMode:true,note:'Test12 direct immutable release; bypasses setItem remote state'};},
  check:function(){return{ok:true,current:MADOU_BOOT_CONFIG.defaultRelease,hasUpdate:false,rescueMode:true};},
  update:function(){return{ok:false,changed:false,error:'Test12 为存储救援模式，请从我的规则仓库同步并覆盖新版本'};},
  rollback:function(){return{ok:false,error:'Test12 为存储救援模式；回退请从云仓覆盖旧版本'};},
  reinstall:function(){try{var m=this.manager();m.clearReleaseCache(MADOU_BOOT_CONFIG,MADOU_BOOT_CONFIG.defaultRelease);return{ok:true,loaded:this.loadOnly()};}catch(e){return{ok:false,error:String(e.message||e)};}}
};