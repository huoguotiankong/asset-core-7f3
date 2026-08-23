/* 汤头条 Remote Test Bootstrap 0.1.0-test.5 / Build 10105 */
var TTT_BOOT_VERSION='0.1.0-test.5';
var TTT_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var TTT_BOOT_CONFIG={
  id:'tangtoutiao-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/tangtoutiao/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10105,
  defaultRelease:{"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.5","build":10105,"ref":"main","baseStable":null,"baseTest":{"version":"0.1.0-test.4","build":10104,"release":"apps/video/tangtoutiao/releases/0.1.0-test.4/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.4/protocol.js"},{"name":"image","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/image.js"},{"name":"core","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/core.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/playback.js"},{"name":"pages","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/pages.js"},{"name":"runtime","path":"apps/video/tangtoutiao/releases/0.1.0-test.5/runtime.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.5"},"notes":"根据 Test4 实机修复：thumb_cover 按 APK 自定义 Glide 解析 ori/360/720 JSON 并执行图片解密；主播放改为单清晰度 #isVideo=true#，多线路改为海阔对象字面量；漫画 /api/comic/home 改分类导航并接 /api//book/list_filter；诊断直接在设置页显示，移除会触发 ArticleListModel URL 错误的子规则。"}
};
var TangTouTiaoBoot={
  manager:function(){require(TTT_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  loadOnly:function(){var r=this.manager().load(TTT_BOOT_CONFIG);if(!r||!r.ok||typeof TangTouTiaoRemoteRuntime!=='object')throw new Error('汤头条远程测试运行时加载失败');return r;},
  module:function(){this.loadOnly();return TangTouTiaoRemoteRuntime.module();},
  info:function(){return this.manager().info(TTT_BOOT_CONFIG);},check:function(){return this.manager().check(TTT_BOOT_CONFIG);},update:function(){return this.manager().update(TTT_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(TTT_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(TTT_BOOT_CONFIG);}
};
