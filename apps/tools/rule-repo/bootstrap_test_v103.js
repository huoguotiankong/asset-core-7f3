/* 我的规则仓库·测试版 Bootstrap v1.0.3 */
var RULE_REPO_BOOTSTRAP_VERSION='1.0.3-test';
var RULE_REPO_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.1/remote_manager.js';
var RULE_REPO_CONFIG={
  id:'rule-repo-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/tools/rule-repo/test.json',minBuild:354,
  moduleHeaders:{'Cache-Control':'no-cache'},
  defaultRelease:{schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.0-rc5',build:354,ref:'main',modules:[
    {name:'repository',path:'apps/tools/rule-repo/releases/3.4.1/repository.js'},
    {name:'filter',path:'apps/tools/rule-repo/releases/3.4.0/filter.js'},
    {name:'stabilityPatch',path:'apps/tools/rule-repo/releases/3.4.3/stability_patch.js'},
    {name:'testStatePatch',path:'apps/tools/rule-repo/test/v1.0.0/state_patch.js'},
    {name:'management',path:'apps/tools/rule-repo/releases/3.5.0-rc1/management.js'},
    {name:'taxonomyPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc2/taxonomy_patch.js'},
    {name:'repositoryPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc4/repository_patch.js'},
    {name:'productState',path:'apps/tools/rule-repo/releases/3.5.0-rc5/product_state.js'},
    {name:'uiBase',path:'apps/tools/rule-repo/releases/3.5.0-rc1/ui.js'},
    {name:'ui',path:'apps/tools/rule-repo/releases/3.5.0-rc5/ui.js'},
    {name:'home',path:'apps/tools/rule-repo/releases/3.5.0-rc5/home.js'},
    {name:'category',path:'apps/tools/rule-repo/releases/3.5.0-rc5/category.js'},
    {name:'search',path:'apps/tools/rule-repo/releases/3.5.0-rc5/search.js'},
    {name:'updates',path:'apps/tools/rule-repo/releases/3.5.0-rc5/updates.js'},
    {name:'detail',path:'apps/tools/rule-repo/releases/3.5.0-rc5/detail.js'},
    {name:'history',path:'apps/tools/rule-repo/releases/3.5.0-rc5/history.js'},
    {name:'settings',path:'apps/tools/rule-repo/releases/3.5.0-rc5/settings.js'},
    {name:'candidatePatch',path:'apps/tools/rule-repo/releases/3.5.0-rc5/candidate_patch.js'}
  ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.0-rc5'}}
};
var RuleRepoBoot={
  manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库测试版 Core 加载失败');return r;},
  info:function(){return this.manager().info(RULE_REPO_CONFIG);},
  run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
  updatePage:function(){setPageTitle('测试版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null;d.push({title:'我的规则仓库·测试版',desc:'Test / Candidate\n当前 '+cur.version+' · build '+cur.build+' · Bootstrap '+RULE_REPO_BOOTSTRAP_VERSION, col_type:'text_1',url:'hiker://empty'});d.push({title:'检查更新',desc:'只检查测试通道，不影响正式版。',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('检查更新…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var x=HikerCloudRemote.check(RULE_REPO_CONFIG);hideLoading();return x.hasUpdate?'toast://发现新测试版 '+x.latest.version:'toast://当前已是最新测试版';}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}})});d.push({title:'升级',desc:'预加载并验证新 release 后再切换。',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('升级测试版…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.update(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(!r.changed)return'toast://已是当前测试版';refreshPage(false);return'toast://已升级到 '+r.current.version;}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}})});d.push({title:'回退到上一版本',desc:prev?'可回退 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('回退测试版…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.rollback(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败：'+String(e.message||e);}})});d.push({title:'重新加载当前版本',desc:'用于模块缓存异常或云端修复后的手动恢复。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('重新加载…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.reinstall(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://当前测试版已重新加载';}catch(e){hideLoading();return'toast://失败：'+String(e.message||e);}})});setResult(d);}
};
