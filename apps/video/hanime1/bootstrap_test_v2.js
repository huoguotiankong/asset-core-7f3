/* Hanime1 Remote Test Bootstrap 2.0.0-test.2 */
var HANIME_BOOT_VERSION='2.0.0-test.2';
var HANIME_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HANIME_BOOT_CONFIG={
  id:'hanime1-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/hanime1/test.json',
  moduleHeaders:{'Cache-Control':'no-cache'},minBuild:20002,
  defaultRelease:{"schema":1,"id":"hanime1-test","name":"Hanime1","version":"2.0.0-test.2","build":20002,"ref":"main","baseVersion":"2.0.0-test.1","modules":[{"name":"core","path":"apps/video/hanime1/releases/2.0.0-test.1/core.js"},{"name":"provider","path":"apps/video/hanime1/releases/2.0.0-test.1/provider.js"},{"name":"device-hotfix","path":"apps/video/hanime1/releases/2.0.0-test.2/hotfix.js"},{"name":"pages-explore","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_explore.js"},{"name":"pages-library","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_library.js"},{"name":"pages-account","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_account.js"}],"verify":{"global":"HanimePages","property":"build","equals":"2.0.0-test.2"},"notes":"Device hotfix after Test1: parse homepage rows directly instead of Hiker next&&Html; broaden Cloudflare challenge recognition beyond 403 while keeping visible X5 fallback."}
};
var HanimeBoot={
  manager:function(){require(HANIME_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(HANIME_BOOT_CONFIG);if(!r||!r.ok||typeof HanimePages!=='object')throw new Error('Hanime1 远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return HanimePages;},
  info:function(){return this.manager().info(HANIME_BOOT_CONFIG);},
  check:function(){return this.manager().check(HANIME_BOOT_CONFIG);},
  update:function(){return this.manager().update(HANIME_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(HANIME_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(HANIME_BOOT_CONFIG);}
};
