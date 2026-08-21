/* ACFun Remote Bootstrap v4.1.1 - clean runtime + scoped image decoder module */
var ACFUN_BOOTSTRAP_VERSION='4.1.1';
var ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411';
var ACFUN_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var ACFUN_HC_CONFIG={
 id:'acfun',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/acfun/latest.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:134,
 defaultRelease:{schema:1,id:'acfun',name:'ACFun',version:'0.3.4',build:134,ref:'main',modules:[
  {name:'core',path:'acfun_core_v018.js'},
  {name:'protocol',path:'acfun_patch_v019.js'},
  {name:'ui-clean',path:'acfun_ui_v031.js'},
  {name:'image-adapter',path:'acfun_ui_v034.js'}
 ],verify:{global:'ac',property:'build',equals:'2026.08.20-v0.3.4'}}
};
var ACFunBoot={
 requireManager:function(){require(ACFUN_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 legacyLoaderCode:function(){return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},411);ACFunBoot.loadOnly();";},
 installCompatibility:function(){var s=this.legacyLoaderCode();setItem('acfun_core_src_v018',s);setItem('acfun_core_src_v019',s);setItem('acfun_remote_bundle_src',s);},
 ensureBaseline:function(m){var info=m.info(ACFUN_HC_CONFIG),cur=info.current||{};if(Number(cur.build||0)<134){var r=m.resetToDefault(ACFUN_HC_CONFIG);if(!r||!r.ok)throw new Error('ACFun迁移0.3.4失败：'+((r&&r.error)||'unknown'));setItem('acfun_bootstrap_migrated','0.3.4');}},
 patchNav:function(){if(typeof ac!=='object'||ac.__hcRemoteNavPatched)return;var old=ac.nav;if(typeof old!=='function')return;ac.nav=function(d){old.call(ac,d);d.push({title:'更新',col_type:'scroll_button',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 远程更新'}});};ac.__hcRemoteNavPatched=true;},
 loadOnly:function(){var m=this.requireManager();this.ensureBaseline(m);var r=m.load(ACFUN_HC_CONFIG);if(!r||!r.ok||typeof ac!=='object')throw new Error('ACFun远程核心加载失败');this.installCompatibility();this.patchNav();setItem('acfun_active_runtime',String(ac.build||''));return r;},
 run:function(action){this.loadOnly();switch(String(action||'home')){case'home':return ac.home();case'search':return ac.search();case'detail':return ac.detail();case'comments':return ac.comments();case'favorites':return ac.localPage('fav');case'history':return ac.localPage('hist');case'settings':return ac.settings();case'diag':return ac.diag();default:throw new Error('未知ACFun动作:'+action);}},
 info:function(){return this.requireManager().info(ACFUN_HC_CONFIG);},
 check:function(){var r=this.requireManager().check(ACFUN_HC_CONFIG);setItem('hc_acfun_last_check',JSON.stringify(r));return r;},
 update:function(){var r=this.requireManager().update(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
 rollback:function(){var r=this.requireManager().rollback(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
 reinstall:function(){var r=this.requireManager().reinstall(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
 resetDefault:function(){var r=this.requireManager().resetToDefault(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
 updatePage:function(){
  var d=[];setPageTitle('ACFun 远程更新');var info;
  try{info=this.info();}catch(e){setResult([{title:'更新管理器加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}
  var cur=info.current||ACFUN_HC_CONFIG.defaultRelease,pre=info.previous||null,lc={};try{lc=JSON.parse(getItem('hc_acfun_last_check','{}'))||{};}catch(e0){}var latest=lc.latest||null;
  d.push({title:'当前业务版本 '+cur.version,desc:'Build：'+cur.build+'\n启动壳：'+ACFUN_BOOTSTRAP_VERSION+'\n实际运行：'+(getItem('acfun_active_runtime','未记录'))+'\n结构：Clean Runtime + scoped ImageAdapter'+(pre?'\n上一版本：'+pre.version+' / '+pre.build:''),col_type:'long_text',url:'hiker://empty'});
  d.push({title:latest?('云端版本 '+latest.version+(lc.hasUpdate?' ↑ 可更新':' ✓ 已是最新')):'检查云端版本',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('检查更新…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);var r=ACFunBoot.check();hideLoading();refreshPage(false);return 'toast://'+(r.hasUpdate?('发现 '+r.latest.version):'已是最新版');}catch(e){hideLoading();return 'toast://检查失败：'+(e.message||e);}})});
  d.push({title:'立即更新',desc:'加载并校验新模块后再切换版本。若更新异常，直接从云仓库覆盖导入。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('更新中…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);var r=ACFunBoot.update();hideLoading();if(r.ok){clearItem('hc_acfun_last_check');refreshPage(false);return 'toast://'+(r.changed?('已更新到 '+r.current.version):'已经是最新版');}return 'toast://更新失败：'+r.error;})});
  d.push({title:'重新加载当前版本',desc:'清除当前业务模块缓存并重新拉取，不清除收藏历史。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('重新加载…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);var r=ACFunBoot.reinstall();hideLoading();return 'toast://'+(r.ok?'已重新缓存':'失败：'+r.error);})});
  d.push({title:'回退上一版本',desc:pre?('上一版本：'+pre.version):'没有上一版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);var r=ACFunBoot.rollback();if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}return 'toast://'+r.error;})});
  d.push({title:'恢复稳定基线 0.3.4',desc:'恢复 Clean Runtime + scoped ImageAdapter Build 134，不删除收藏、历史和接口登录态。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=411',{headers:{'Cache-Control':'no-cache'}},411);var r=ACFunBoot.resetDefault();if(r.ok){refreshPage(false);return 'toast://已恢复 '+r.current.version;}return 'toast://失败：'+r.error;})});
  setResult(d);
 }
};
