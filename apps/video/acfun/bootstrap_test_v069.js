/* ACFun Test Bootstrap v6.9.0 - alpha13 current-context playback + fullscreen comics */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v068.js?v=6800',{headers:{'Cache-Control':'no-cache'}},6800);

ACFUN_BOOTSTRAP_VERSION='6.9.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v069.js?v=6900';
(function(){
 var prev=ACFUN_HC_CONFIG.defaultRelease||{},mods=(prev.modules||[]).slice();
 mods.push({name:'runtime-a13',path:'apps/video/acfun/acfun_runtime_v060_a13.js'});
 mods.push({name:'current-short-home-a13',path:'apps/video/acfun/acfun_ui_v060_a13_home.js'});
 mods.push({name:'fullscreen-current-detail-a13',path:'apps/video/acfun/acfun_ui_v060_a13_detail.js'});
 mods.push({name:'shell-settings-a13',path:'apps/video/acfun/acfun_ui_v060_a13_delivery.js'});
 ACFUN_HC_CONFIG.minBuild=164;
 ACFUN_HC_CONFIG.defaultRelease={schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha13',build:164,ref:'main',modules:mods,verify:{global:'ac',property:'build',equals:'2026.08.23-v0.6.0-alpha13'}};
})();
ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},6900);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<164){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha13失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha13');}};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 版本与恢复');var info;try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\nAlpha12 已实机确认漫画 chapterId 单参数链恢复。Alpha13 将漫画章节入口直接改为 pics:// 原生多图阅读，去掉系统二级页上方冗余区域；同时修复一个明确的播放上下文问题：旧视频详情“播放”按钮会 eval 仅 core v018，再调用被重置后的 ac.play，导致 Alpha12 的播放修复实际上没有执行。Alpha13 的普通视频、短视频、有声点击全部重新绑定当前 Bootstrap v069，并加入 APK 1.9.7 明确存在的 m3u8/player/referer、playbackAuthKey 兼容。播放器页面不再把收藏/评论做成同级可播放项。封面继续对小说、社区和部分视频做类型化字段恢复。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:'打开我的规则仓库',desc:'进入 ACFun 版本中心，选择“测试版”并导入 / 覆盖。',col_type:'text_1',url:'hiker://home@我的规则仓库||hiker://home'});
 d.push({title:'重新加载当前测试版',desc:'清当前 Test 业务模块缓存后重新拉取，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存 '+r.current.version:'失败：'+r.error)}catch(e){hideLoading();return'toast://重新加载失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6900)});
 d.push({title:'恢复 Alpha13 安全基线',desc:'强制恢复本壳内置 0.6.0-alpha13 / Build 164，不删除收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('恢复安全版本…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.resetDefault();hideLoading();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://恢复失败：'+r.error}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6900)});
 d.push({title:'回退上一业务版本',desc:pre?('上一测试版本：'+pre.version+' / Build '+pre.build):'当前没有上一测试版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return'toast://已回退 '+r.current.version}return'toast://'+r.error}catch(e){return'toast://回退失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6900)});
 d.push({title:'恢复正式版',desc:'回到“我的规则仓库” → ACFun → 正式版，导入即可同名覆盖恢复 Stable 0.4.9。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});setResult(d);
};
