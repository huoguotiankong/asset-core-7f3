/* ACFun Test Bootstrap v7.2.0 - Alpha16 focused media repair */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v071.js?v=7100',{headers:{'Cache-Control':'no-cache'}},7100);
ACFUN_BOOTSTRAP_VERSION='7.2.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v072.js?v=7200';
ACFUN_HC_CONFIG.minBuild=167;
ACFUN_HC_CONFIG.defaultRelease={schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha16',build:167,ref:'main',modules:[
 {name:'core',path:'acfun_core_v018.js'},
 {name:'protocol',path:'acfun_patch_v019.js'},
 {name:'instant-ui',path:'acfun_ui_v042.js'},
 {name:'functional-fix',path:'acfun_fix_v043.js'},
 {name:'fast-playback',path:'acfun_fix_v045.js'},
 {name:'app-source-taxonomy-comics-short',path:'apps/video/acfun/acfun_fix_v047.js'},
 {name:'apk197-tags',path:'apps/video/acfun/acfun_fix_v048.js'},
 {name:'release-repair',path:'apps/video/acfun/acfun_fix_v049.js'},
 {name:'clean-rebase-runtime-ui-a15',path:'apps/video/acfun/acfun_runtime_v060_a15_clean.js'},
 {name:'focused-media-repair-a16',path:'apps/video/acfun/acfun_fix_v060_a16_media.js'}
],verify:{global:'ac',property:'build',equals:'2026.08.23-v0.6.0-alpha16'}};
ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},7200);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<167||String(cur.version||'')!=='0.6.0-alpha16'){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha16失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha16');}};
// v4/v5 dispatcher did not know Alpha15 custom actions; extend it explicitly.
ACFunBoot.run=function(action){
 this.loadOnly();
 switch(String(action||'home')){
  case'home':return ac.home();
  case'search':return ac.search();
  case'searchCenter':return typeof ac.searchCenter==='function'?ac.searchCenter():ac.search();
  case'category':return typeof ac.category==='function'?ac.category():ac.home();
  case'detail':return ac.detail();
  case'comments':return ac.comments();
  case'favorites':return ac.localPage('fav');
  case'history':return ac.localPage('hist');
  case'settings':return ac.settings();
  case'diag':return ac.diag();
  default:throw new Error('未知ACFun动作:'+action);
 }
};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 版本与恢复');var info;try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\nAlpha16 保持 Alpha15 Clean Rebase，只追加一个媒体修复模块：视频封面 fallback-only、当前 Host GET-first 播放桥、短视频 loadType=2 恢复、Alpha12 已验证漫画 chapterId Reader、Bootstrap 新动作分发。小说/有声 POST-first 列表不改。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:'重新加载 Alpha16',desc:'重新拉取当前 Test 模块，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存 '+r.current.version:'失败：'+r.error)}catch(e){hideLoading();return'toast://重新加载失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7200)});
 d.push({title:'恢复 Alpha16 基线',desc:'强制切回 Build167，不删除用户数据。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('恢复中…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.resetDefault();hideLoading();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://恢复失败：'+r.error}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7200)});
 d.push({title:'上一业务版本',desc:pre?(pre.version+' / Build '+pre.build):'无上一版本记录',col_type:'text_1',url:'hiker://empty'});
 d.push({title:'恢复正式版 Stable 0.4.9',desc:'从“我的规则仓库” → ACFun → 正式版覆盖导入。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});setResult(d);
};
