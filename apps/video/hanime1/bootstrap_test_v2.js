/* Hanime1 Remote Test Bootstrap 2.0.0-test.5 */
var HANIME_BOOT_VERSION='2.0.0-test.5';
var HANIME_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HANIME_BOOT_CONFIG={
  id:'hanime1-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/hanime1/test.json',
  moduleHeaders:{'Cache-Control':'no-cache'},minBuild:20005,
  defaultRelease:{"schema":1,"id":"hanime1-test","name":"Hanime1","version":"2.0.0-test.5","build":20005,"ref":"main","baseVersion":"2.0.0-test.4","modules":[{"name":"core","path":"apps/video/hanime1/releases/2.0.0-test.1/core.js"},{"name":"provider","path":"apps/video/hanime1/releases/2.0.0-test.1/provider.js"},{"name":"raw-html-hotfix","path":"apps/video/hanime1/releases/2.0.0-test.3/hotfix.js"},{"name":"test4-common","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_common.js"},{"name":"test4-media","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_media.js"},{"name":"test4-account","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_account.js"},{"name":"test5-comments","path":"apps/video/hanime1/releases/2.0.0-test.5/patch_comments.js"},{"name":"pages-explore","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_explore.js"},{"name":"pages-library","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_library.js"},{"name":"pages-account","path":"apps/video/hanime1/releases/2.0.0-test.1/pages_account.js"},{"name":"test4-ui-common","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_ui_common.js"},{"name":"test4-ui-explore","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_ui_explore.js"},{"name":"test4-ui-account","path":"apps/video/hanime1/releases/2.0.0-test.4/patch_ui_account.js"},{"name":"test5-finalize","path":"apps/video/hanime1/releases/2.0.0-test.5/finalize.js"}],"verify":{"global":"HanimePages","property":"build","equals":"2.0.0-test.5"},"notes":"Pre-handoff audit hotfix over Test4: fixes comments runtime helper binding; reuses all SHA-verified Test4 common/media/account/UI modules and adds a tiny final build marker."}
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
