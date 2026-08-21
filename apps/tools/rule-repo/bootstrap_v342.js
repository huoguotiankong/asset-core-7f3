/* 我的规则仓库 Remote Bootstrap v1.4.2 - forced rescue */
var RULE_REPO_BOOTSTRAP_VERSION='1.4.2';
var RULE_REPO_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=3';
var RULE_REPO_CONFIG={
  id:'rule-repo',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/tools/rule-repo/latest.json',minBuild:342,
  moduleHeaders:{'Cache-Control':'no-cache'},
  defaultRelease:{schema:1,id:'rule-repo',name:'我的规则仓库',version:'3.4.2',build:342,ref:'main',modules:[
    {name:'repository',path:'apps/tools/rule-repo/releases/3.4.1/repository.js'},
    {name:'filter',path:'apps/tools/rule-repo/releases/3.4.0/filter.js'},
    {name:'ui',path:'apps/tools/rule-repo/releases/3.4.0/ui.js'},
    {name:'home',path:'apps/tools/rule-repo/releases/3.4.0/home.js'},
    {name:'category',path:'apps/tools/rule-repo/releases/3.4.0/category.js'},
    {name:'search',path:'apps/tools/rule-repo/releases/3.4.0/search.js'},
    {name:'updates',path:'apps/tools/rule-repo/releases/3.4.0/updates.js'},
    {name:'detail',path:'apps/tools/rule-repo/releases/3.4.0/detail.js'},
    {name:'history',path:'apps/tools/rule-repo/releases/3.4.0/history.js'},
    {name:'settings',path:'apps/tools/rule-repo/releases/3.4.0/settings.js'},
    {name:'rescuePatch',path:'apps/tools/rule-repo/releases/3.4.2/rescue_patch.js'}
  ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.4.2'}}
};
var RuleRepoBoot={
  manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库 Core 加载失败');return r;},
  info:function(){return this.manager().info(RULE_REPO_CONFIG);},
  run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
  updatePage:function(){setPageTitle('Core 更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease;d.push({title:'当前 Core '+cur.version,desc:'build '+cur.build+' · Bootstrap '+RULE_REPO_BOOTSTRAP_VERSION+' · Manager '+info.managerVersion,col_type:'text_1',url:'hiker://empty'});if(info.lastFallbackError)d.push({title:'恢复状态',desc:info.lastFallbackError,col_type:'text_1',url:'hiker://empty'});d.push({title:'强制恢复到安全版本',desc:'重新加载 3.4.2，并覆盖低于 build 342 的旧激活状态。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('恢复安全版本…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=3',{'Cache-Control':'no-cache'},201);var cfg=RULE_REPO_CONFIG;var r=HikerCloudRemote.resetToDefault(cfg);hideLoading();if(!r.ok)return'toast://恢复失败：'+r.error;refreshPage(false);return'toast://已恢复到 '+r.current.version;}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e);}})});d.push({title:'检查 Core 更新',desc:'主动读取 latest.json。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('检查更新…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=3',{},201);var x=HikerCloudRemote.check(RULE_REPO_CONFIG);hideLoading();return x.hasUpdate?'toast://发现新版本 '+x.latest.version:'toast://已是最新版 '+x.current.version;}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}})});d.push({title:'重新加载当前版本',desc:'清理当前业务模块缓存并重新下载。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('重新加载…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=3',{},201);var r=HikerCloudRemote.reinstall(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://当前版本已重新加载';}catch(e){hideLoading();return'toast://失败：'+String(e.message||e);}})});setResult(d);}
};
