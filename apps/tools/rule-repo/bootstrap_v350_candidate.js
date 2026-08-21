/* 我的规则仓库 Candidate Bootstrap v1.5.0 - isolated preview */
var RULE_REPO_BOOTSTRAP_VERSION='1.5.0-candidate';
var RULE_REPO_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.1/remote_manager.js';
var RULE_REPO_CONFIG={
  id:'rule-repo-preview',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',minBuild:350,
  moduleHeaders:{'Cache-Control':'no-cache'},
  defaultRelease:{schema:1,id:'rule-repo-preview',name:'我的规则仓库 Candidate',version:'3.5.0-rc1',build:350,ref:'main',modules:[
    {name:'repository',path:'apps/tools/rule-repo/releases/3.4.1/repository.js'},
    {name:'filter',path:'apps/tools/rule-repo/releases/3.4.0/filter.js'},
    {name:'stabilityPatch',path:'apps/tools/rule-repo/releases/3.4.3/stability_patch.js'},
    {name:'management',path:'apps/tools/rule-repo/releases/3.5.0-rc1/management.js'},
    {name:'ui',path:'apps/tools/rule-repo/releases/3.5.0-rc1/ui.js'},
    {name:'home',path:'apps/tools/rule-repo/releases/3.5.0-rc1/home.js'},
    {name:'category',path:'apps/tools/rule-repo/releases/3.5.0-rc1/category.js'},
    {name:'search',path:'apps/tools/rule-repo/releases/3.4.0/search.js'},
    {name:'updates',path:'apps/tools/rule-repo/releases/3.4.0/updates.js'},
    {name:'detail',path:'apps/tools/rule-repo/releases/3.5.0-rc1/detail.js'},
    {name:'history',path:'apps/tools/rule-repo/releases/3.4.0/history.js'},
    {name:'settings',path:'apps/tools/rule-repo/releases/3.5.0-rc1/settings.js'},
    {name:'candidatePatch',path:'apps/tools/rule-repo/releases/3.5.0-rc1/candidate_patch.js'}
  ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.0-rc1'}}
};
var RuleRepoBoot={
  manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库 Candidate 加载失败');return r;},
  info:function(){return this.manager().info(RULE_REPO_CONFIG);},
  run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
  updatePage:function(){setPageTitle('Candidate 信息');var d=[],info=this.info(),cur=info.current||RULE_REPO_CONFIG.defaultRelease;d.push({title:'Candidate Core '+cur.version,desc:'build '+cur.build+' · Bootstrap '+RULE_REPO_BOOTSTRAP_VERSION+'\n隔离测试通道，不修改正式版 Stable/latest。',col_type:'text_1',url:'hiker://empty'});d.push({title:'重新加载 Candidate',desc:'清理 Candidate 业务模块缓存并重新下载。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('重新加载…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.reinstall(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://Candidate 已重新加载';}catch(e){hideLoading();return'toast://失败：'+String(e.message||e);}})});setResult(d);}
};
