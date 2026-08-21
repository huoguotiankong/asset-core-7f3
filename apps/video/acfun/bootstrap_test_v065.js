/* ACFun Test Bootstrap v6.5.0 - alpha9 taxonomy/fiction/community baseline */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);

ACFUN_BOOTSTRAP_VERSION='6.5.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v065.js?v=6500';
ACFUN_HC_CONFIG={
 id:'acfun-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:160,
 defaultRelease:{schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha9',build:160,ref:'main',modules:[
  {name:'core',path:'acfun_core_v018.js'},
  {name:'protocol',path:'acfun_patch_v019.js'},
  {name:'instant-ui',path:'acfun_ui_v042.js'},
  {name:'functional-fix',path:'acfun_fix_v043.js'},
  {name:'fast-playback',path:'acfun_fix_v045.js'},
  {name:'app-source-taxonomy-comics-short',path:'apps/video/acfun/acfun_fix_v047.js'},
  {name:'apk197-tags',path:'apps/video/acfun/acfun_fix_v048.js'},
  {name:'release-repair',path:'apps/video/acfun/acfun_fix_v049.js'},
  {name:'taxonomy-runtime',path:'apps/video/acfun/acfun_ui_v050_rc1.js'},
  {name:'runtime-a3',path:'apps/video/acfun/acfun_runtime_v060_a3.js'},
  {name:'home-category-search-a3',path:'apps/video/acfun/acfun_ui_v060_a3_home.js'},
  {name:'library-settings-a3',path:'apps/video/acfun/acfun_ui_v060_a3_tools.js'},
  {name:'detail-a3',path:'apps/video/acfun/acfun_ui_v060_a3_detail.js'},
  {name:'comments-a3',path:'apps/video/acfun/acfun_ui_v060_a3_comments.js'},
  {name:'apk197-resource-runtime-a4',path:'apps/video/acfun/acfun_runtime_v060_a4.js'},
  {name:'home-resource-hubs-search-a4',path:'apps/video/acfun/acfun_ui_v060_a4_home.js'},
  {name:'typed-detail-readers-a4',path:'apps/video/acfun/acfun_ui_v060_a4_detail.js'},
  {name:'typed-comments-a4',path:'apps/video/acfun/acfun_ui_v060_a4_comments.js'},
  {name:'shelves-settings-diagnostics-a4',path:'apps/video/acfun/acfun_ui_v060_a4_tools.js'},
  {name:'cloud-shell-delivery-a5',path:'apps/video/acfun/acfun_ui_v060_a5_delivery.js'},
  {name:'resource-runtime-repair-a6',path:'apps/video/acfun/acfun_runtime_v060_a6.js'},
  {name:'filter-resource-ui-a6',path:'apps/video/acfun/acfun_ui_v060_a6_home.js'},
  {name:'shell-settings-a6',path:'apps/video/acfun/acfun_ui_v060_a6_delivery.js'},
  {name:'resource-runtime-a7',path:'apps/video/acfun/acfun_runtime_v060_a7.js'},
  {name:'interaction-ui-a7',path:'apps/video/acfun/acfun_ui_v060_a7_home.js'},
  {name:'reader-detail-a7',path:'apps/video/acfun/acfun_ui_v060_a7_detail.js'},
  {name:'shell-settings-a7',path:'apps/video/acfun/acfun_ui_v060_a7_delivery.js'},
  {name:'runtime-a8',path:'apps/video/acfun/acfun_runtime_v060_a8.js'},
  {name:'single-page-ui-a8',path:'apps/video/acfun/acfun_ui_v060_a8_home.js'},
  {name:'native-reader-detail-a8',path:'apps/video/acfun/acfun_ui_v060_a8_detail.js'},
  {name:'shell-settings-a8',path:'apps/video/acfun/acfun_ui_v060_a8_delivery.js'},
  {name:'runtime-a9',path:'apps/video/acfun/acfun_runtime_v060_a9.js'},
  {name:'clean-inline-ui-a9',path:'apps/video/acfun/acfun_ui_v060_a9_home.js'},
  {name:'fiction-community-detail-a9',path:'apps/video/acfun/acfun_ui_v060_a9_detail.js'},
  {name:'shell-settings-a9',path:'apps/video/acfun/acfun_ui_v060_a9_delivery.js'}
 ],verify:{global:'ac',property:'build',equals:'2026.08.22-v0.6.0-alpha9'}}
};

ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},6500);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<160){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha9失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha9');}};
ACFunBoot.check=function(){var r=this.requireManager().check(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_check',JSON.stringify(r));return r;};
ACFunBoot.update=function(){var r=this.requireManager().update(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.rollback=function(){var r=this.requireManager().rollback(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.reinstall=function(){var r=this.requireManager().reinstall(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.resetDefault=function(){var r=this.requireManager().resetToDefault(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.run=function(action){this.loadOnly();switch(String(action||'home')){case'home':return ac.home();case'search':return ac.search();case'detail':return ac.detail();case'comments':return ac.comments();case'favorites':return ac.localPage('fav');case'history':return ac.localPage('hist');case'settings':return ac.settings();case'diag':return ac.diag();case'category':return ac.categoryCenter();case'searchCenter':return ac.searchCenter();default:throw new Error('未知ACFun动作:'+action);}};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 版本与恢复');var info;try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\nAlpha9 重做严格分类数据链，清理旧筛选状态；首页筛选修复原始 HTML 文本问题；默认关闭无封面焦点大卡；小说/有声章节增加 chapterInfo GET/POST、fictionUrl 外链正文、longFormAudio/voice/media 恢复；社区详情合并 Feed 原始对象与 dynamicInfo。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:'打开我的规则仓库',desc:'进入 ACFun 版本中心，选择“测试版”并导入 / 覆盖。',col_type:'text_1',url:'hiker://home@我的规则仓库||hiker://home'});
 d.push({title:'重新加载当前测试版',desc:'清当前 Test 业务模块缓存后重新拉取，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存 '+r.current.version:'失败：'+r.error)}catch(e){hideLoading();return'toast://重新加载失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6500)});
 d.push({title:'恢复 Alpha9 安全基线',desc:'强制恢复本壳内置 0.6.0-alpha9 / Build 160，不删除收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('恢复安全版本…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.resetDefault();hideLoading();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://恢复失败：'+r.error}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6500)});
 d.push({title:'回退上一业务版本',desc:pre?('上一测试版本：'+pre.version+' / Build '+pre.build):'当前没有上一测试版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return'toast://已回退 '+r.current.version}return'toast://'+r.error}catch(e){return'toast://回退失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,6500)});
 d.push({title:'恢复正式版',desc:'回到“我的规则仓库” → ACFun → 正式版，导入即可同名覆盖恢复 Stable 0.4.9。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});setResult(d);
};