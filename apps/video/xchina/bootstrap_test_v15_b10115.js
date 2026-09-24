/* xChina Remote Test Bootstrap 0.1.0-test.15 */
var XCHINA_BOOT_CONFIG={id:'xchina-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/xchina/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10115,defaultRelease:{"schema":1,"id":"xchina-test","appId":"xchina","name":"小黄书","channel":"test","version":"0.1.0-test.15","build":10115,"ref":"main","baseStable":null,"modules":[{"name":"categories","path":"apps/video/xchina/releases/0.1.0-test.9/categories.js"},{"name":"categoryFix","path":"apps/video/xchina/releases/0.1.0-test.9/category_fix.js"},{"name":"coreBase","path":"apps/video/xchina/releases/0.1.0-test.9/core.js"},{"name":"prepatch","path":"apps/video/xchina/releases/0.1.0-test.13/prepatch.js"},{"name":"pagesBase","path":"apps/video/xchina/releases/0.1.0-test.9/pages.js"},{"name":"postpatch","path":"apps/video/xchina/releases/0.1.0-test.13/postpatch.js"},{"name":"playbackPatch","path":"apps/video/xchina/releases/0.1.0-test.15/playback_patch.js"}],"verify":{"global":"XChinaRemoteRuntime","property":"version","equals":"0.1.0-test.15"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.14","build":10114,"release":"apps/video/xchina/releases/0.1.0-test.14/release.json"},"notes":"Test15 is playback-only and deliberately skips failed Test14. Device evidence showed Test14 returned a 1-second candidate because currentSrc/network capture was allowed before the uploaded reading-source contract. Test15 returns to the exact source rule: first quoted m3u8 inside main-container, with a separate >10s duration-gated network fallback."}};
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
