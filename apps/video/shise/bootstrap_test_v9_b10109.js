/* Shise Remote Test Bootstrap 0.1.0-test.9 */
var SHISE_BOOT_CONFIG={id:'shise-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/shise/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10109,defaultRelease:{"schema":1,"id":"shise-test","appId":"shise","name":"视色","channel":"test","version":"0.1.0-test.9","build":10109,"ref":"main","baseStable":null,"modules":[{"name":"core","path":"apps/video/shise/releases/0.1.0-test.5/core.js"},{"name":"pages","path":"apps/video/shise/releases/0.1.0-test.5/pages.js"},{"name":"deviceFix","path":"apps/video/shise/releases/0.1.0-test.6/runtime_patch.js"},{"name":"pagingMetaFix","path":"apps/video/shise/releases/0.1.0-test.7/runtime_patch.js"},{"name":"playhlsSniffFix","path":"apps/video/shise/releases/0.1.0-test.8/runtime_patch.js"},{"name":"twoStagePlayerFix","path":"apps/video/shise/releases/0.1.0-test.9/runtime_patch.js"}],"verify":{"global":"ShiseRemoteRuntime","property":"version","equals":"0.1.0-test.9"},"promotedFrom":null,"previousTest":{"version":"0.1.0-test.8","build":10108,"release":"apps/video/shise/releases/0.1.0-test.8/release.json"},"notes":"Test9 follows the current Shise player contract: video.html?id -> player.html?id -> player-container src -> runtime media sniff; it also stops blocking ad-network scripts during player initialization and adds current series.html paging plus direct query paging for person pages."}};
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
