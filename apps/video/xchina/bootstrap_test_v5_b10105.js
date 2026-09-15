/* xChina Remote Test Bootstrap 0.1.0-test.5 */
var XCHINA_BOOT_CONFIG={id:'xchina-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/xchina/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10105,defaultRelease:{"schema":1,"id":"xchina-test","appId":"xchina","name":"小黄书","channel":"test","version":"0.1.0-test.5","build":10105,"ref":"main","baseStable":null,"modules":[{"name":"runtimeBundle","path":"apps/video/xchina/releases/0.1.0-test.5/runtime_bundle.js"}],"verify":{"global":"XChinaRemoteRuntime","property":"version","equals":"0.1.0-test.5"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.4","build":10104,"release":"apps/video/xchina/releases/0.1.0-test.4/release.json"},"notes":"Test5 keeps Test4 business parsers and adds X5 shared-cookie verification plus live getCookie() forwarding for HTML/image requests."}};
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
