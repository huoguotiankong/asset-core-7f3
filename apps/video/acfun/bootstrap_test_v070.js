/* ACFun Test Bootstrap v6.10.0 - alpha14 recovery from device-proven Alpha12 */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v068.js?v=6800',{headers:{'Cache-Control':'no-cache'}},6800);

ACFUN_BOOTSTRAP_VERSION='6.10.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v070.js?v=7000';
(function(){
 var prev=ACFUN_HC_CONFIG.defaultRelease||{},mods=(prev.modules||[]).slice();
 mods.push({name:'recovery-runtime-a14',path:'apps/video/acfun/acfun_runtime_v060_a14.js'});
 mods.push({name:'current-short-home-a14',path:'apps/video/acfun/acfun_ui_v060_a14_home.js'});
 mods.push({name:'recovery-detail-a14',path:'apps/video/acfun/acfun_ui_v060_a14_detail.js'});
 mods.push({name:'shell-settings-a14',path:'apps/video/acfun/acfun_ui_v060_a14_delivery.js'});
 ACFUN_HC_CONFIG.minBuild=165;
 ACFUN_HC_CONFIG.defaultRelease={schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha14',build:165,ref:'main',modules:mods,verify:{global:'ac',property:'build',equals:'2026.08.23-v0.6.0-alpha14'}};
})();
ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},7000);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<165){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha14失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha14');}};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 版本与恢复');var info;try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\nAlpha13 已按多域回归事故隔离，不再作为恢复基线。本版从已实机确认漫画可读、部分封面正常的 Alpha12 直接恢复：不加载 Alpha13 封面评分覆盖，也不再使用 pics:// 承担加密漫画图片。漫画恢复 Alpha12 的 pic_1_full + ac.image 解密链，只在页面链接增加海阔官方 #fullTheme#。播放优先使用列表/详情已经返回的媒体 path；缺失时先 GET video/can/watch，再有限 POST 兼容，以适配当前实机 POST 405。短视频、有声和视频详情点击统一进入当前 Bootstrap v070。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:'打开我的规则仓库',desc:'进入 ACFun 版本中心，选择“测试版”并导入 / 覆盖。',col_type:'text_1',url:'hiker://home@我的规则仓库||hiker://home'});
 d.push({title:'重新加载当前测试版',desc:'清当前 Test 业务模块缓存后重新拉取，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存 '+r.current.version:'失败：'+r.error)}catch(e){hideLoading();return'toast://重新加载失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7000)});
 d.push({title:'恢复 Alpha14 安全基线',desc:'强制恢复本壳内置 0.6.0-alpha14 / Build 165，不删除收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('恢复安全版本…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.resetDefault();hideLoading();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://恢复失败：'+r.error}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7000)});
 d.push({title:'回退上一业务版本',desc:pre?('上一测试版本：'+pre.version+' / Build '+pre.build):'当前没有上一测试版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return'toast://已回退 '+r.current.version}return'toast://'+r.error}catch(e){return'toast://回退失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7000)});
 d.push({title:'恢复正式版',desc:'回到“我的规则仓库” → ACFun → 正式版，导入即可同名覆盖恢复 Stable 0.4.9。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});setResult(d);
};
