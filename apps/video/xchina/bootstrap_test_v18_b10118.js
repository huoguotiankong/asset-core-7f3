/* xChina Remote Test Bootstrap 0.1.0-test.18 */
var XCHINA_BOOT_CONFIG={id:'xchina-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/xchina/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10118,defaultRelease:{"schema":1,"id":"xchina-test","appId":"xchina","name":"小黄书","channel":"test","version":"0.1.0-test.18","build":10118,"ref":"main","baseStable":null,"modules":[{"name":"categories","path":"apps/video/xchina/releases/0.1.0-test.9/categories.js"},{"name":"categoryFix","path":"apps/video/xchina/releases/0.1.0-test.9/category_fix.js"},{"name":"coreBase","path":"apps/video/xchina/releases/0.1.0-test.9/core.js"},{"name":"prepatch","path":"apps/video/xchina/releases/0.1.0-test.13/prepatch.js"},{"name":"pagesBase","path":"apps/video/xchina/releases/0.1.0-test.9/pages.js"},{"name":"postpatch","path":"apps/video/xchina/releases/0.1.0-test.13/postpatch.js"},{"name":"playbackPatch","path":"apps/video/xchina/releases/0.1.0-test.15/playback_patch.js"},{"name":"uxPatch","path":"apps/video/xchina/releases/0.1.0-test.16/ux_patch.js"},{"name":"repairPatch","path":"apps/video/xchina/releases/0.1.0-test.17/repair_patch.js"},{"name":"diagnostics","path":"apps/video/xchina/releases/0.1.0-test.18/diagnostic_patch.js"}],"verify":{"global":"XChinaRemoteRuntime","property":"version","equals":"0.1.0-test.18"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.17","build":10117,"release":"apps/video/xchina/releases/0.1.0-test.17/release.json"},"notes":"Diagnostic-only: report live page structure and actual image URLs; no claim of playback/image repair."}};
var XChinaBoot={
  manager:function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201',{headers:{'Cache-Control':'no-cache'}},201);return HikerCloudRemote;},
  loadOnly:function(){return this.manager().load(XCHINA_BOOT_CONFIG);},
  module:function(){this.loadOnly();return XChinaRemoteRuntime.module();},
  info:function(){return this.manager().info(XCHINA_BOOT_CONFIG);},
  check:function(){return this.manager().check(XCHINA_BOOT_CONFIG);},
  update:function(){return this.manager().update(XCHINA_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(XCHINA_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(XCHINA_BOOT_CONFIG);}
};
