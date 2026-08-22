/* ACFun Test Bootstrap v7.1.0 - clean rebase on Stable 0.4.9 */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);
ACFUN_BOOTSTRAP_VERSION='7.1.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v071.js?v=7100';
ACFUN_HC_CONFIG.minBuild=166;
ACFUN_HC_CONFIG.defaultRelease={schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha15',build:166,ref:'main',modules:[
 {name:'core',path:'acfun_core_v018.js'},
 {name:'protocol',path:'acfun_patch_v019.js'},
 {name:'instant-ui',path:'acfun_ui_v042.js'},
 {name:'functional-fix',path:'acfun_fix_v043.js'},
 {name:'fast-playback',path:'acfun_fix_v045.js'},
 {name:'app-source-taxonomy-comics-short',path:'apps/video/acfun/acfun_fix_v047.js'},
 {name:'apk197-tags',path:'apps/video/acfun/acfun_fix_v048.js'},
 {name:'release-repair',path:'apps/video/acfun/acfun_fix_v049.js'},
 {name:'clean-rebase-runtime-ui-a15',path:'apps/video/acfun/acfun_runtime_v060_a15_clean.js'}
],verify:{global:'ac',property:'build',equals:'2026.08.23-v0.6.0-alpha15'}};
ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},7100);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<166||String(cur.version||'')!=='0.6.0-alpha15'){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha15失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha15');}};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 版本与恢复');var info;try{info=this.info();}catch(e){setResult([{title:'版本信息加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\n本版不是 Alpha14 补丁版，而是从 Stable 0.4.9 的 8 个已验证模块重新起链，只追加 1 个 Alpha15 clean runtime/UI。Alpha3~14 全部不进入活动 Release。视频 itemInfo、XOR 图片解密、cacheM3u8 播放、v047 漫画与短视频底座保持 Stable 原合同；社区/小说/有声以独立 Adapter 新增。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:'重新加载 Alpha15',desc:'清当前 Test 模块缓存并重新拉取，不清收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('重新加载…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存 '+r.current.version:'失败：'+r.error)}catch(e){hideLoading();return'toast://重新加载失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7100)});
 d.push({title:'恢复 Alpha15 Clean 基线',desc:'强制切回本壳内置 Build166，不删除收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){showLoading('恢复中…');try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r=ACFunBoot.resetDefault();hideLoading();if(r.ok){refreshPage(false);return'toast://已恢复 '+r.current.version}return'toast://恢复失败：'+r.error}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e)}},ACFUN_BOOTSTRAP_URL,7100)});
 d.push({title:'上一业务版本',desc:pre?(pre.version+' / Build '+pre.build):'无上一版本记录',col_type:'text_1',url:'hiker://empty'});
 d.push({title:'恢复正式版 Stable 0.4.9',desc:'进入“我的规则仓库” → ACFun → 正式版，覆盖导入即可恢复。',col_type:'long_text',url:'hiker://home@我的规则仓库||hiker://home'});setResult(d);
};
