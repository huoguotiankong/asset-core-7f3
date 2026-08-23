/* 汤头条 Remote Test Bootstrap 0.1.0-test.4 / Build 10104 */
var TTT_BOOT_VERSION='0.1.0-test.4';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10104,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.4","build":10104,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.3","build":10103,"release":"apps/video/tangtoutiao/releases/0.1.0-test.3/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/protocol.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/core.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/playback.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.4"},"notes":"根据 Test3 实机：推荐误取广告、全站封面灰块、播放进入本地代理但0kb/s。APK模型复核后改为 SeeMoreDataBean.data.list[].list 精确推荐解析，封面固定 thumb_cover，详情固定 data.detail，播放固定 source_240/480/720/1080；启动响应持久化 player_cfg.dekey/refer/x_auth，PlaybackAdapter 用 startProxyServer + AES-CFB + fixM3u8 复刻 APP 加密索引播放。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
