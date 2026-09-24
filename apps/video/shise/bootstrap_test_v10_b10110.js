/* Shise Remote Test Bootstrap 0.1.0-test.10 */
var SHISE_BOOT_CONFIG={id:'shise-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/shise/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10110,defaultRelease:{"schema":1,"id":"shise-test","appId":"shise","name":"视色","channel":"test","version":"0.1.0-test.10","build":10110,"ref":"main","baseStable":null,"modules":[{"name":"core","path":"apps/video/shise/releases/0.1.0-test.5/core.js"},{"name":"pages","path":"apps/video/shise/releases/0.1.0-test.5/pages.js"},{"name":"deviceFix","path":"apps/video/shise/releases/0.1.0-test.6/runtime_patch.js"},{"name":"pagingMetaFix","path":"apps/video/shise/releases/0.1.0-test.7/runtime_patch.js"},{"name":"playhlsSniffFix","path":"apps/video/shise/releases/0.1.0-test.8/runtime_patch.js"},{"name":"twoStagePlayerFix","path":"apps/video/shise/releases/0.1.0-test.9/runtime_patch.js"},{"name":"legacyDetailIdFix","path":"apps/video/shise/releases/0.1.0-test.10/runtime_patch.js"}],"verify":{"global":"ShiseRemoteRuntime","property":"version","equals":"0.1.0-test.10"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.9","build":10109,"release":"apps/video/shise/releases/0.1.0-test.9/release.json"},"notes":"Test10 fixes the device-confirmed current detail URL form /video/id-<id>.html, derives player.html?id=<id>, then continues the Test9 player-container src and runtime media chain."}};
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
