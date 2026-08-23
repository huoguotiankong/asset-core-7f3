/* ACFun Web Bootstrap v1.0.0 */
var ACFUN_WEB_BOOTSTRAP_VERSION='1.0.0-web';
var ACFUN_WEB_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_web_v100.js?v=11001';
var ACFUN_WEB_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var ACFUN_WEB_CONFIG={
 id:'acfun-web',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/web.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:11001,
 defaultRelease:{schema:1,id:'acfun-web',name:'ACFun · 网页版',version:'1.0.0-web1',build:11001,ref:'main',modules:[
  {name:'web-core',path:'apps/video/acfun/web/acfun_web_core_v100.js'}
 ],verify:{global:'ACFunWeb',property:'build',equals:'2026.08.23-v1.0.0-web1'}}
};
var ACFunWebBoot={
 requireManager:function(){require(ACFUN_WEB_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 loadOnly:function(){var m=this.requireManager(),r=m.load(ACFUN_WEB_CONFIG);if(!r||!r.ok||typeof ACFunWeb!=='object')throw new Error('ACFun Web 模块加载失败');setItem('acfun_web_active_runtime',String(ACFunWeb.build||''));return r;},
 run:function(action){this.loadOnly();switch(String(action||'home')){case'home':return ACFunWeb.home();case'settings':return ACFunWeb.settings();case'diag':return ACFunWeb.diag();default:throw new Error('未知 ACFun Web 动作: '+action);}},
 info:function(){return this.requireManager().info(ACFUN_WEB_CONFIG);},
 check:function(){return this.requireManager().check(ACFUN_WEB_CONFIG);},
 update:function(){return this.requireManager().update(ACFUN_WEB_CONFIG);},
 reinstall:function(){return this.requireManager().reinstall(ACFUN_WEB_CONFIG);},
 rollback:function(){return this.requireManager().rollback(ACFUN_WEB_CONFIG);},
 resetDefault:function(){return this.requireManager().resetToDefault(ACFUN_WEB_CONFIG);}
};
