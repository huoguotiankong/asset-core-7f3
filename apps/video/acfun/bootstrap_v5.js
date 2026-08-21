/* ACFun Remote Bootstrap v5.11.3 - repair stale 0.4.8 activeRelease */
require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);

ACFUN_BOOTSTRAP_VERSION='5.11.3';
ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113';
ACFUN_HC_CONFIG.minBuild=149;
ACFUN_HC_CONFIG.defaultRelease={schema:1,id:'acfun',name:'ACFun',version:'0.4.9',build:149,ref:'main',modules:[
 {name:'core',path:'acfun_core_v018.js'},
 {name:'protocol',path:'acfun_patch_v019.js'},
 {name:'instant-ui',path:'acfun_ui_v042.js'},
 {name:'functional-fix',path:'acfun_fix_v043.js'},
 {name:'fast-playback',path:'acfun_fix_v045.js'},
 {name:'app-source-taxonomy-comics-short',path:'apps/video/acfun/acfun_fix_v047.js'},
 {name:'apk197-tags',path:'apps/video/acfun/acfun_fix_v048.js'},
 {name:'release-repair',path:'apps/video/acfun/acfun_fix_v049.js'}
],verify:{global:'ac',property:'build',equals:'2026.08.21-v0.4.9'}};

ACFunBoot.legacyLoaderCode=function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},5113);ACFunBoot.loadOnly();";};
ACFunBoot.ensureBaseline=function(m){
 var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};
 if(Number(cur.build||0)<149){
  var r=m.resetToDefault(ACFUN_HC_CONFIG);
  if(!r||!r.ok)throw new Error('ACFun迁移0.4.9失败：'+((r&&r.error)||'unknown'));
  setItem('acfun_bootstrap_migrated','0.4.9');
 }
};

ACFunBoot.updatePage=function(){
 var d=[];setPageTitle('ACFun 远程更新');var info;
 try{info=this.info();}catch(e){setResult([{title:'更新管理器加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}
 var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null,lc={};
 try{lc=JSON.parse(getItem('hc_acfun_last_check','{}'))||{};}catch(e0){}
 var latest=lc.latest||null;
 d.push({title:'当前业务版本 '+cur.version,desc:'Build：'+cur.build+'\n启动壳：'+ACFUN_BOOTSTRAP_VERSION+'\n实际运行：'+(getItem('acfun_active_runtime','未记录'))+'\n结构：APP Source Taxonomy + Cache-First + Fast HLS'+(pre?'\n上一版本：'+pre.version+' / '+pre.build:''),col_type:'long_text',url:'hiker://empty'});
 d.push({title:latest?('云端版本 '+latest.version+(lc.hasUpdate?' ↑ 可更新':' ✓ 已是最新')):'检查云端版本',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('检查更新…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);var r=ACFunBoot.check();hideLoading();refreshPage(false);return 'toast://'+(r.hasUpdate?('发现 '+r.latest.version):'已是最新版');}catch(e){hideLoading();return 'toast://检查失败：'+(e.message||e);}})});
 d.push({title:'立即更新',desc:'若程序内更新异常，可直接从“我的规则仓库”覆盖导入当前稳定基线。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('更新中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);var r=ACFunBoot.update();hideLoading();if(r.ok){clearItem('hc_acfun_last_check');refreshPage(false);return 'toast://'+(r.changed?('已更新到 '+r.current.version):'已经是最新版');}return 'toast://更新失败：'+r.error;}catch(e){hideLoading();return 'toast://更新异常：'+(e.message||e);}})});
 d.push({title:'重新加载当前版本',desc:'清除当前业务模块缓存并重新拉取，不清除收藏历史。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('重新加载…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);var r=ACFunBoot.reinstall();hideLoading();return 'toast://'+(r.ok?'已重新缓存':'失败：'+r.error);})});
 d.push({title:'回退上一版本',desc:pre?('上一版本：'+pre.version):'没有上一版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}return 'toast://'+r.error;})});
 d.push({title:'恢复稳定基线 0.4.9',desc:'恢复 Build 149，不删除收藏、历史和登录态。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=5113',{headers:{'Cache-Control':'no-cache'}},5113);var r=ACFunBoot.resetDefault();if(r.ok){refreshPage(false);return 'toast://已恢复 '+r.current.version;}return 'toast://失败：'+r.error;})});
 setResult(d);
};
