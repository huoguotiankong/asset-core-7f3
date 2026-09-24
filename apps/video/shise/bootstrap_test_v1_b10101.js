/* Shise Remote Test Bootstrap 0.1.0-test.1 */
var SHISE_BOOT_CONFIG={id:'shise-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/shise/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10101,defaultRelease:{"schema":1,"id":"shise-test","appId":"shise","name":"视色","channel":"test","version":"0.1.0-test.1","build":10101,"ref":"main","baseStable":null,"modules":[{"name":"runtime","path":"apps/video/shise/releases/0.1.0-test.1/runtime.js"}],"verify":{"global":"ShiseRemoteRuntime","property":"version","equals":"0.1.0-test.1"},"promotedFrom":null,"previousTest":null,"notes":"Initial test: native video browsing/search/models/detail/multi-line playback with live Cookie, X5 verification and stale cache."}};
var ShiseBoot={
  manager:function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201',{headers:{'Cache-Control':'no-cache'}},201);return HikerCloudRemote;},
  loadOnly:function(){return this.manager().load(SHISE_BOOT_CONFIG);},
  module:function(){this.loadOnly();return ShiseRemoteRuntime.module();},
  info:function(){return this.manager().info(SHISE_BOOT_CONFIG);},
  check:function(){return this.manager().check(SHISE_BOOT_CONFIG);},
  update:function(){return this.manager().update(SHISE_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(SHISE_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(SHISE_BOOT_CONFIG);}
};
