/* ACFun Test Bootstrap v6.0.0 - forced alpha2 baseline / isolated test channel */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);

ACFUN_BOOTSTRAP_VERSION='6.0.0-test';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v060.js?v=6000';
ACFUN_HC_CONFIG={
 id:'acfun-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:153,
 defaultRelease:{schema:1,id:'acfun-test',name:'ACFun',version:'0.6.0-alpha2',build:153,ref:'main',modules:[
  {name:'core',path:'acfun_core_v018.js'},
  {name:'protocol',path:'acfun_patch_v019.js'},
  {name:'instant-ui',path:'acfun_ui_v042.js'},
  {name:'functional-fix',path:'acfun_fix_v043.js'},
  {name:'fast-playback',path:'acfun_fix_v045.js'},
  {name:'app-source-taxonomy-comics-short',path:'apps/video/acfun/acfun_fix_v047.js'},
  {name:'apk197-tags',path:'apps/video/acfun/acfun_fix_v048.js'},
  {name:'release-repair',path:'apps/video/acfun/acfun_fix_v049.js'},
  {name:'taxonomy-runtime',path:'apps/video/acfun/acfun_ui_v050_rc1.js'},
  {name:'discovery-category-search-a2',path:'apps/video/acfun/acfun_ui_v060_a2_discovery.js'},
  {name:'library-settings-a2',path:'apps/video/acfun/acfun_ui_v060_a2_tools.js'},
  {name:'detail-a2',path:'apps/video/acfun/acfun_ui_v060_a2_detail.js'}
 ],verify:{global:'ac',property:'build',equals:'2026.08.21-v0.6.0-alpha2'}}
};

ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},6000);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<153){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun测试版迁移0.6.0-alpha2失败：'+((r&&r.error)||'unknown'));setItem('acfun_test_bootstrap_migrated','0.6.0-alpha2');}};
ACFunBoot.check=function(){var r=this.manager().check(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_check',JSON.stringify(r));return r;};
ACFunBoot.update=function(){var r=this.manager().update(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.rollback=function(){var r=this.manager().rollback(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.reinstall=function(){var r=this.manager().reinstall(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.resetDefault=function(){var r=this.manager().resetToDefault(ACFUN_HC_CONFIG);setItem('hc_acfun_test_last_result',JSON.stringify(r));return r;};
ACFunBoot.run=function(action){this.loadOnly();switch(String(action||'home')){case'home':return ac.home();case'search':return ac.search();case'detail':return ac.detail();case'comments':return ac.comments();case'favorites':return ac.localPage('fav');case'history':return ac.localPage('hist');case'settings':return ac.settings();case'diag':return ac.diag();case'category':return ac.categoryCenter();case'searchCenter':return ac.searchCenter();default:throw new Error('未知ACFun动作:'+action);}};
ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 测试通道');var info;
 try{info=this.info();}catch(e){setResult([{title:'测试通道加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}
 var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null,lc={};try{lc=JSON.parse(getItem('hc_acfun_test_last_check','{}'))||{};}catch(e0){}var latest=lc.latest||null;
 d.push({title:'当前测试版本 '+cur.version,desc:'Build '+cur.build+' · Shell '+ACFUN_BOOTSTRAP_VERSION+'\n0.6 系列使用新测试壳强制越过旧 RC 缓存；Stable 0.4.9 不受影响。',col_type:'long_text',url:'hiker://empty'});
 d.push({title:latest?('测试通道 '+latest.version+(lc.hasUpdate?' · 有更新':' · 当前最新')):'检查测试通道更新',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('检查中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v060.js?v=6000',{headers:{'Cache-Control':'no-cache'}},6000);var r=ACFunBoot.check();hideLoading();refreshPage(false);return'toast://'+(r.hasUpdate?('发现 '+r.latest.version):'当前已是最新测试版');}catch(e){hideLoading();return'toast://检查失败：'+(e.message||e);}})});
 d.push({title:'更新测试版',desc:'只更新 Test 通道，不修改 Stable。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('更新中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v060.js?v=6000',{headers:{'Cache-Control':'no-cache'}},6000);var r=ACFunBoot.update();hideLoading();if(r.ok){clearItem('hc_acfun_test_last_check');refreshPage(false);return'toast://'+(r.changed?('已更新到 '+r.current.version):'已经是最新测试版');}return'toast://更新失败：'+r.error;}catch(e){hideLoading();return'toast://更新异常：'+(e.message||e);}})});
 d.push({title:'重新加载 Alpha2',desc:'清当前 Test 模块缓存后重新拉取，不清收藏、历史和封面缓存。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('重新加载…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v060.js?v=6000',{headers:{'Cache-Control':'no-cache'}},6000);var r=ACFunBoot.reinstall();hideLoading();return'toast://'+(r.ok?'已重新缓存':'失败：'+r.error);})});
 d.push({title:'回退上一测试版本',desc:pre?('上一测试版本：'+pre.version):'当前没有上一测试版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v060.js?v=6000',{headers:{'Cache-Control':'no-cache'}},6000);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return'toast://已回退 '+r.current.version;}return'toast://'+r.error;})});
 d.push({title:'恢复正式版',desc:'回到“我的规则仓库” → ACFun → 正式版，导入即可同名覆盖恢复 Stable 0.4.9。',col_type:'long_text',url:'hiker://empty'});
 setResult(d);
};
