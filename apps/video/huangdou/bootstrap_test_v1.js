/* 黄豆短剧 Remote Test Bootstrap 1.8.2-test.1 */
var HUANGDOU_BOOT_VERSION='1.8.2-test.1';
var HUANGDOU_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HUANGDOU_BOOT_CONFIG={
  id:'huangdou-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/huangdou/test.json',
  moduleHeaders:{'Cache-Control':'no-cache'},minBuild:18201,
  defaultRelease:{"schema":1,"id":"huangdou-test","name":"黄豆短剧","version":"1.8.2-test.1","build":18201,"ref":"main","modules":[{"name":"runtime-loader","path":"apps/video/huangdou/releases/1.8.2-test.1/runtime.js"}],"verify":{"global":"HuangDouRemoteRuntime","property":"build","equals":"1.8.2-test.1"}}
};
var HuangDouBoot={
  manager:function(){require(HUANGDOU_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(HUANGDOU_BOOT_CONFIG);if(!r||!r.ok||typeof HuangDouRemoteRuntime!=='object')throw new Error('黄豆短剧远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return HuangDouRemoteRuntime.module();},
  info:function(){return this.manager().info(HUANGDOU_BOOT_CONFIG);},
  check:function(){return this.manager().check(HUANGDOU_BOOT_CONFIG);},
  update:function(){return this.manager().update(HUANGDOU_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(HUANGDOU_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(HUANGDOU_BOOT_CONFIG);}
};
