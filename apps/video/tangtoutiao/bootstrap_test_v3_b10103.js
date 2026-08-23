/* 汤头条 Remote Test Bootstrap 0.1.0-test.3 / Build 10103 */
var TTT_BOOT_VERSION='0.1.0-test.3';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10103,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.3","build":10103,"ref":"main","modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.3/protocol.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.2/core.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.3/ui.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.3/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.3/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.3"}}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
