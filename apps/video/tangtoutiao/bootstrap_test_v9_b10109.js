/* 汤头条 Remote Test Bootstrap 0.1.0-test.9 / Build 10109 */
var TTT_BOOT_VERSION='0.1.0-test.9';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10109,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.9","build":10109,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.8","build":10108,"release":"apps/video/tangtoutiao/releases/0.1.0-test.8/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/protocol.js"},{"name":"protocolGate","path":"apps/video/tangtoutiao/releases/0.1.0-test.7/protocol_gate.js"},{"name":"image","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/image.js"},{"name":"coreBase","path":"apps/video/tangtoutiao/releases/0.1.0-test.8/core.js"},{"name":"corePatch","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/core_patch.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/playback_fixed.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.9"},"notes":"Test8 实机精修：图片使用 @headers；长视频按标称时长过滤试看/占位源并增加 source_origin/preview fallback；短视频卡片直接播放；详情 UI 收敛。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
