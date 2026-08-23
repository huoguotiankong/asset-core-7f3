/* 汤头条 Remote Test Bootstrap 0.1.0-test.6 / Build 10106 */
var TTT_BOOT_VERSION='0.1.0-test.6';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10106,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.6","build":10106,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.5","build":10105,"release":"apps/video/tangtoutiao/releases/0.1.0-test.5/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/protocol.js"},{"name":"image","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/image.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/core.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/playback.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.6"},"notes":"Test5 实机确认播放器技术链已通但返回旧版本维护占位片、图片解密回调未执行、漫画 home 为顶层动态分类、排行榜缺 type。Test6 使用海阔官方 image helper + $.require，启动自动跟随 versionMsg.version 再握手，默认 source_240；漫画原样执行 api_list/params_list，排行榜补 all/daily/weekly/monthly。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
