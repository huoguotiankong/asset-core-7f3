/* 麻豆AI Remote Test Bootstrap 2.8.0-test.2 */
var MDAI_BOOT_VERSION='2.8.0-test.2';
var MDAI_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var MDAI_BOOT_CONFIG={
  id:'mdai-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/mdai/test.json',
  moduleHeaders:{'Cache-Control':'no-cache'},minBuild:28002,
  defaultRelease:{"schema":1,"id":"mdai-test","name":"麻豆AI","version":"2.8.0-test.2","build":28002,"ref":"main","modules":[{"name":"core-bridge","path":"apps/video/mdai/releases/2.7.0-test.1/core.js"},{"name":"playback-adapter","path":"apps/video/mdai/releases/2.7.0-test.1/playback.js"},{"name":"ui-base","path":"apps/video/mdai/releases/2.8.0-test.1/ui_base.js"},{"name":"content-pages","path":"apps/video/mdai/releases/2.8.0-test.1/pages_content.js"},{"name":"detail-pages","path":"apps/video/mdai/releases/2.8.0-test.1/pages_detail.js"},{"name":"settings","path":"apps/video/mdai/releases/2.8.0-test.1/settings.js"},{"name":"runtime","path":"apps/video/mdai/releases/2.8.0-test.2/runtime.js"}],"verify":{"global":"MDAIRemoteRuntime","property":"build","equals":"2.8.0-test.2"}}
};
var MDAIBoot={
  manager:function(){require(MDAI_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(MDAI_BOOT_CONFIG);if(!r||!r.ok||typeof MDAIRemoteRuntime!=='object')throw new Error('麻豆AI远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return MDAIRemoteRuntime.module();},
  info:function(){return this.manager().info(MDAI_BOOT_CONFIG);},
  check:function(){return this.manager().check(MDAI_BOOT_CONFIG);},
  update:function(){return this.manager().update(MDAI_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(MDAI_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(MDAI_BOOT_CONFIG);}
};
