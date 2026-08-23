/* ACFun Web-Native Bootstrap 1.1.0-web2 */
var ACFUN_WEB_BOOTSTRAP_VERSION='1.1.0-web2';
var ACFUN_WEB_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var ACFUN_WEB_CONFIG={
 id:'acfun-web',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/web.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:11002,
 defaultRelease:{schema:1,id:'acfun-web',name:'ACFun · 网页版',version:'1.1.0-web2',build:11002,ref:'main',modules:[
  {name:'core',path:'apps/video/acfun/next/acfun_next_core_v100_a1.js'},
  {name:'protocol',path:'apps/video/acfun/next/acfun_next_protocol_v100_a1.js'},
  {name:'provider',path:'apps/video/acfun/next/acfun_next_provider_v100_a1.js'},
  {name:'media-model',path:'apps/video/acfun/next/acfun_next_media_v100_a1.js'},
  {name:'native-ui',path:'apps/video/acfun/next/acfun_next_ui_v100_a1.js'},
  {name:'device-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a2.js'},
  {name:'web-native-bridge',path:'apps/video/acfun/web/acfun_web_native_v110.js'},
  {name:'web-native-image',path:'apps/video/acfun/web/acfun_web_native_image_v110.js'}
 ],verify:{global:'ACFunWebNative',property:'build',equals:'2026.08.23-v1.1.0-web2'}}
};
var ACFunWebBoot={
 requireManager:function(){require(ACFUN_WEB_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 loadOnly:function(){var r=this.requireManager().load(ACFUN_WEB_CONFIG);if(!r||!r.ok||typeof ACFunWebNative!=='object')throw new Error('ACFun Web-Native 模块加载失败');return r;},
 run:function(action){this.loadOnly();var W=ACFunWebNative;switch(String(action||'home')){case'home':return W.home();case'search':return W.search();case'searchCenter':return W.searchCenter();case'station':return W.station();case'detail':return W.detail();case'bridge':return W.bridge();case'fictionReader':return W.fictionReader();case'comments':return W.comments();case'favorites':return W.favorites();case'history':return W.history();case'mine':return W.mine();case'settings':return W.settings();case'diag':return W.diag();default:throw new Error('未知 ACFun Web-Native 动作: '+action);}},
 info:function(){return this.requireManager().info(ACFUN_WEB_CONFIG);},check:function(){return this.requireManager().check(ACFUN_WEB_CONFIG);},update:function(){return this.requireManager().update(ACFUN_WEB_CONFIG);},reinstall:function(){return this.requireManager().reinstall(ACFUN_WEB_CONFIG);},rollback:function(){return this.requireManager().rollback(ACFUN_WEB_CONFIG);},resetDefault:function(){return this.requireManager().resetToDefault(ACFUN_WEB_CONFIG);}
};
