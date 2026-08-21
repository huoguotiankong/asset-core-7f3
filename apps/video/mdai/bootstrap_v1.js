/* 麻豆AI Remote Stable Bootstrap 2.6.3 */
var MDAI_BOOT_VERSION='1.0.0';
var MDAI_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var MDAI_BOOT_CONFIG={
  id:'mdai',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/mdai/latest.json',
  moduleHeaders:{'Cache-Control':'no-cache'},minBuild:26301,
  defaultRelease:{schema:1,id:'mdai',name:'麻豆AI',version:'2.6.3',build:26301,ref:'main',modules:[{name:'runtime-loader',path:'apps/video/mdai/releases/2.6.3-test.1/runtime.js'}],verify:{global:'MDAIRemoteRuntime',property:'build',equals:'2.6.3-test.1'}}
};
var MDAIBoot={
  manager:function(){require(MDAI_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(MDAI_BOOT_CONFIG);if(!r||!r.ok||typeof MDAIRemoteRuntime!=='object')throw new Error('麻豆AI远程正式运行时加载失败');return r;},
  module:function(){this.loadOnly();return MDAIRemoteRuntime.module();},
  info:function(){return this.manager().info(MDAI_BOOT_CONFIG);},
  check:function(){return this.manager().check(MDAI_BOOT_CONFIG);},
  update:function(){return this.manager().update(MDAI_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(MDAI_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(MDAI_BOOT_CONFIG);}
};
