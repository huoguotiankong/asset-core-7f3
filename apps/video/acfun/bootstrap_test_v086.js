/* ACFun Next Test Bootstrap v8.6.0 - alpha7 stable playback/fullscreen comic */
var ACFUN_NEXT_BOOTSTRAP_VERSION='8.6.0-test';
var ACFUN_NEXT_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v086.js?v=8600';
var ACFUN_NEXT_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var ACFUN_NEXT_CONFIG={
 id:'acfun-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:10007,
 defaultRelease:{schema:1,id:'acfun-test',name:'ACFun',version:'1.0.0-alpha7',build:10007,ref:'main',modules:[
  {name:'core',path:'apps/video/acfun/next/acfun_next_core_v100_a1.js'},
  {name:'protocol',path:'apps/video/acfun/next/acfun_next_protocol_v100_a1.js'},
  {name:'provider',path:'apps/video/acfun/next/acfun_next_provider_v100_a1.js'},
  {name:'media',path:'apps/video/acfun/next/acfun_next_media_v100_a1.js'},
  {name:'ui',path:'apps/video/acfun/next/acfun_next_ui_v100_a1.js'},
  {name:'device-regression-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a2.js'},
  {name:'player-comic-transport-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a3.js'},
  {name:'cdn-chapter-model-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a4.js'},
  {name:'signed-hls-comic-full-image-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a5.js'},
  {name:'native-m3u8-comic-ux-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a6.js'},
  {name:'stable-playback-fullscreen-comic-fix',path:'apps/video/acfun/next/acfun_next_fix_v100_a7.js'}
 ],verify:{global:'ACFunNext',property:'build',equals:'2026.08.23-v1.0.0-alpha7'}}
};
var ACFunNextBoot={
 requireManager:function(){require(ACFUN_NEXT_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 loadOnly:function(){var m=this.requireManager(),r=m.load(ACFUN_NEXT_CONFIG);if(!r||!r.ok||typeof ACFunNext!=='object')throw new Error('ACFun Next 业务模块加载失败');setItem('acfun_next_active_runtime',String(ACFunNext.build||''));return r;},
 run:function(action){this.loadOnly();switch(String(action||'home')){
  case'home':return ACFunNext.home();
  case'search':return ACFunNext.search();
  case'searchCenter':return ACFunNext.searchCenter();
  case'station':return ACFunNext.stationPage();
  case'detail':return ACFunNext.detail();
  case'comicReader':return ACFunNext.comicReader();
  case'fictionReader':return ACFunNext.fictionReader();
  case'comments':return ACFunNext.comments();
  case'favorites':return ACFunNext.localPage('fav');
  case'history':return ACFunNext.localPage('hist');
  case'mine':return ACFunNext.mine();
  case'settings':return ACFunNext.settings();
  case'diag':return ACFunNext.diag();
  default:throw new Error('未知 ACFun Next 动作: '+action);
 }},
 info:function(){return this.requireManager().info(ACFUN_NEXT_CONFIG);},
 check:function(){var r=this.requireManager().check(ACFUN_NEXT_CONFIG);setItem('acfun_next_last_check',JSON.stringify(r));return r;},
 update:function(){var r=this.requireManager().update(ACFUN_NEXT_CONFIG);setItem('acfun_next_last_update',JSON.stringify(r));return r;},
 reinstall:function(){var r=this.requireManager().reinstall(ACFUN_NEXT_CONFIG);setItem('acfun_next_last_update',JSON.stringify(r));return r;},
 rollback:function(){var r=this.requireManager().rollback(ACFUN_NEXT_CONFIG);setItem('acfun_next_last_update',JSON.stringify(r));return r;},
 resetDefault:function(){var r=this.requireManager().resetToDefault(ACFUN_NEXT_CONFIG);setItem('acfun_next_last_update',JSON.stringify(r));return r;},
 updatePage:function(){
  var d=[];setPageTitle('ACFun 版本与恢复');var info;
  try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}
  var cur=info.current||ACFUN_NEXT_CONFIG.defaultRelease,pre=info.previous||null;
  d.push({title:'当前测试版 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_NEXT_BOOTSTRAP_VERSION+'\nAlpha7 把播放头完整回归 Stable 0.4.9 已验证合同；漫画阅读改为 #fullTheme# 纯图片全屏。Stable 0.4.9 保持不变。',col_type:'long_text',url:'hiker://empty'});
  d.push({title:'检查测试通道更新',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('检查中…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunNextBoot.check();hideLoading();refreshPage(false);return'toast://'+(r.hasUpdate?('发现 '+r.latest.version):'已是当前测试版')}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e)}},ACFUN_NEXT_BOOTSTRAP_URL,8600)});
  d.push({title:'重新加载当前测试版',desc:'清当前版本模块缓存后重新拉取，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunNextBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新加载':'失败：'+r.error)}catch(e){hideLoading();return'toast://失败：'+String(e.message||e)}},ACFUN_NEXT_BOOTSTRAP_URL,8600)});
  d.push({title:'回退上一测试版本',desc:pre?(pre.version+' / Build '+pre.build):'暂无上一测试版本',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunNextBoot.rollback();if(r.ok){refreshPage(false);return'toast://已回退 '+r.current.version}return'toast://'+r.error}catch(e){return'toast://回退失败：'+String(e.message||e)}},ACFUN_NEXT_BOOTSTRAP_URL,8600)});
  d.push({title:'恢复 Alpha7 基线',desc:'强制回到本壳内置 Build10007，不清用户数据。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunNextBoot.resetDefault();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://'+r.error}catch(e){return'toast://恢复失败：'+String(e.message||e)}},ACFUN_NEXT_BOOTSTRAP_URL,8600)});
  d.push({title:'恢复正式版 Stable 0.4.9',desc:'到“我的规则仓库 → ACFun → 正式版”覆盖导入。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});
  setResult(d);
 }
};
