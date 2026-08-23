/* 汤头条 Remote Test Bootstrap 0.1.0-test.8 / Build 10108 */
var TTT_BOOT_VERSION='0.1.0-test.8';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10108,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.8","build":10108,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.7","build":10107,"release":"apps/video/tangtoutiao/releases/0.1.0-test.7/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/protocol.js"},{"name":"protocolGate","path":"apps/video/tangtoutiao/releases/0.1.0-test.7/protocol_gate.js"},{"name":"image","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/image.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.8/core.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.8/playback.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.8/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.8/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.8"},"notes":"根据 Test7 实机精修：详情页只保留一个实际媒体返回项，清晰度按钮只修改状态，消除页面生成的连续选集/播放列表语义；播放前预检各 source_* 的 M3U8 时长，过滤数秒维护占位片并自动回退其它清晰度；picx.yrfmba.cn 普通 JPEG 直显，非标准图片继续走解密 Adapter；排行榜按真实创作者模型渲染。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
