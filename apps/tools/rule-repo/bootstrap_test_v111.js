/* 我的规则仓库·测试版 Bootstrap v1.0.11 - RC12 UI Luxe */
var RULE_REPO_BOOTSTRAP_VERSION='1.0.11-test';
var RULE_REPO_MANAGER_URL='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/libs/updater/v2.0.2/remote_manager.js';
var RULE_REPO_ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
var RULE_REPO_CONFIG={
 id:'rule-repo-test',branch:'main',latestPath:'apps/tools/rule-repo/test.json',minBuild:363,
 repoTemplates:[
  'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
  'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
  'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'
 ],moduleHeaders:{'Cache-Control':'no-cache'},
 defaultRelease:{schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.0-rc12',build:363,ref:'main',modules:[
  {name:'repository',path:'apps/tools/rule-repo/releases/3.4.1/repository.js'},
  {name:'filter',path:'apps/tools/rule-repo/releases/3.4.0/filter.js'},
  {name:'stabilityPatch',path:'apps/tools/rule-repo/releases/3.4.3/stability_patch.js'},
  {name:'testStatePatch',path:'apps/tools/rule-repo/test/v1.0.0/state_patch.js'},
  {name:'management',path:'apps/tools/rule-repo/releases/3.5.0-rc1/management.js'},
  {name:'taxonomyPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc2/taxonomy_patch.js'},
  {name:'repositoryPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc4/repository_patch.js'},
  {name:'repositoryResilience',path:'apps/tools/rule-repo/releases/3.5.0-rc8/repository_resilience.js'},
  {name:'productState',path:'apps/tools/rule-repo/releases/3.5.0-rc5/product_state.js'},
  {name:'design',path:'apps/tools/rule-repo/releases/3.5.0-rc6/design.js'},
  {name:'ui',path:'apps/tools/rule-repo/releases/3.5.0-rc6/ui.js'},
  {name:'uiFoundation',path:'apps/tools/rule-repo/releases/3.5.0-rc9/ui_foundation.js'},
  {name:'uiPolish',path:'apps/tools/rule-repo/releases/3.5.0-rc10/ui_polish.js'},
  {name:'uiPro',path:'apps/tools/rule-repo/releases/3.5.0-rc11/ui_pro.js'},
  {name:'uiLuxe',path:'apps/tools/rule-repo/releases/3.5.0-rc12/ui_luxe.js'},
  {name:'home',path:'apps/tools/rule-repo/releases/3.5.0-rc12/home.js'},
  {name:'category',path:'apps/tools/rule-repo/releases/3.5.0-rc12/category.js'},
  {name:'search',path:'apps/tools/rule-repo/releases/3.5.0-rc12/search.js'},
  {name:'updates',path:'apps/tools/rule-repo/releases/3.5.0-rc12/updates.js'},
  {name:'detail',path:'apps/tools/rule-repo/releases/3.5.0-rc12/detail.js'},
  {name:'channelPage',path:'apps/tools/rule-repo/releases/3.5.0-rc12/channel_page.js'},
  {name:'history',path:'apps/tools/rule-repo/releases/3.5.0-rc5/history.js'},
  {name:'settings',path:'apps/tools/rule-repo/releases/3.5.0-rc12/settings.js'},
  {name:'runtimeContract',path:'apps/tools/rule-repo/releases/3.5.0-rc12/runtime_contract.js'},
  {name:'candidatePatch',path:'apps/tools/rule-repo/releases/3.5.0-rc12/candidate_patch.js'}
 ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.0-rc12'}}
};
var RuleRepoBoot={
 manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},202);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库测试版 Core 加载失败');return r;},
 info:function(){return this.manager().info(RULE_REPO_CONFIG);},
 run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
 updatePage:function(){setPageTitle('测试版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null,cfg=JSON.stringify(RULE_REPO_CONFIG),mgr=RULE_REPO_MANAGER_URL;
  d.push({title:'我的规则仓库·测试版',desc:'当前 '+cur.version+'\nUI Luxe 测试通道',img:RULE_REPO_ICON,pic_url:RULE_REPO_ICON,col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
  d.push({title:'检查更新',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在检查…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var x=HikerCloudRemote.check(cfg);hideLoading();return x.hasUpdate?'toast://发现 '+x.latest.version:'toast://已经是最新测试版';}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({title:'升级测试版',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在升级…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.update(cfg);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(!r.changed)return'toast://已经是最新测试版';refreshPage(false);return'toast://已升级到 '+r.current.version;}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({col_type:'blank_block'});
  d.push({title:'回退到上一版本',desc:prev?'可回退到 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在回退…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.rollback(cfg);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({title:'重新加载当前版本',desc:'页面异常或云端修复后可重新下载当前模块',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在重新加载…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.reinstall(cfg);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://已重新加载';}catch(e){hideLoading();return'toast://操作失败：'+String(e.message||e);}},cfg,mgr)});
  setResult(d);
 }
};
