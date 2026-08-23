/* 麻豆传媒 Remote Test Bootstrap 0.1.0-test.11 */
var MADOU_BOOT_CONFIG={
  id:'madou-test',
  branch:'main',
  repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',
  latestPath:'apps/video/madou/test.json',
  moduleHeaders:{'Cache-Control':'no-cache'},
  minBuild:10111,
  defaultRelease:{
    id:'madou-test',
    name:'麻豆传媒',
    version:'0.1.0-test.11',
    build:10111,
    ref:'main',
    modules:[
      {name:'core',path:'apps/video/madou/releases/0.1.0-test.1/core.js'},
      {name:'runtime',path:'apps/video/madou/releases/0.1.0-test.1/runtime.js'},
      {name:'performanceRuntime',path:'apps/video/madou/releases/0.1.0-test.10/performance_runtime.js'},
      {name:'detailSettingsNoSniff',path:'apps/video/madou/releases/0.1.0-test.11/detail_settings_nosniff.js'}
    ],
    verify:{global:'MadouRemoteRuntime',property:'version',equals:'0.1.0-test.11'}
  }
};
var MadouBoot={
  manager:function(){
    require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201',{headers:{'Cache-Control':'no-cache'}},201);
    return HikerCloudRemote;
  },
  loadOnly:function(){return this.manager().load(MADOU_BOOT_CONFIG);},
  module:function(){this.loadOnly();return MadouRemoteRuntime.module();},
  info:function(){return this.manager().info(MADOU_BOOT_CONFIG);},
  check:function(){return this.manager().check(MADOU_BOOT_CONFIG);},
  update:function(){return this.manager().update(MADOU_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(MADOU_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(MADOU_BOOT_CONFIG);}
};
