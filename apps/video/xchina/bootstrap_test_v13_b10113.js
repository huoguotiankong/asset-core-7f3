/* xChina Remote Test Bootstrap 0.1.0-test.13 */
var XCHINA_BOOT_CONFIG={id:'xchina-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/xchina/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10113,defaultRelease:{"schema":1,"id":"xchina-test","appId":"xchina","name":"小黄书","channel":"test","version":"0.1.0-test.13","build":10113,"ref":"main","baseStable":null,"modules":[{"name":"categories","path":"apps/video/xchina/releases/0.1.0-test.9/categories.js"},{"name":"categoryFix","path":"apps/video/xchina/releases/0.1.0-test.9/category_fix.js"},{"name":"coreBase","path":"apps/video/xchina/releases/0.1.0-test.9/core.js"},{"name":"prepatch","path":"apps/video/xchina/releases/0.1.0-test.13/prepatch.js"},{"name":"pagesBase","path":"apps/video/xchina/releases/0.1.0-test.9/pages.js"},{"name":"postpatch","path":"apps/video/xchina/releases/0.1.0-test.13/postpatch.js"}],"verify":{"global":"XChinaRemoteRuntime","property":"version","equals":"0.1.0-test.13"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.12","build":10112,"release":"apps/video/xchina/releases/0.1.0-test.12/release.json"},"notes":"Test13 fixes model-all pagination, removes promotional/duplicate video-detail text, and follows the uploaded reading source more literally for media extraction/playback: xchina.co Referer, main-container DOM extraction, primary re-fetch, rendered fallback, and no ad sniffing."}};
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
