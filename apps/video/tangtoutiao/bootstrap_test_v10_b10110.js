/* 汤头条 Remote Test Bootstrap 0.1.0-test.10 / Build 10110 */
var TTT_BOOT_VERSION='0.1.0-test.10';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10110,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.10","build":10110,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.9","build":10109,"release":"apps/video/tangtoutiao/releases/0.1.0-test.9/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/protocol.js"},{"name":"protocolGate","path":"apps/video/tangtoutiao/releases/0.1.0-test.7/protocol_gate.js"},{"name":"image","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/image.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.10/core.js"},{"name":"compat","path":"apps/video/tangtoutiao/releases/0.1.0-test.10/compat.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.10/playback.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.10/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.10"},"notes":"根据 Test9 实机回归修正两个架构错误：完整重建 Core，让 item/detail/漫画/排行内部真正统一走 image helper；不再依赖 .m3u8 后缀识别媒体，先探 Content-Type/包装形态，对 yd-long/.../https://... 同时检查外层与内层候选，无后缀 HLS 同样执行 AES-CFB/M3U8 解析并按详情标称时长校验。短视频继续列表直接播放。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
