/* 我的规则仓库 Remote Bootstrap v1.5.0 */
var RULE_REPO_BOOTSTRAP_VERSION='1.5.0';
var RULE_REPO_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.1/remote_manager.js';
var RULE_REPO_ICON='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/icon.svg';
var RULE_REPO_CONFIG={
  id:'rule-repo',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/tools/rule-repo/latest.json',minBuild:356,
  moduleHeaders:{'Cache-Control':'no-cache'},
  defaultRelease:{schema:1,id:'rule-repo',name:'我的规则仓库',version:'3.5.0',build:356,ref:'main',modules:[
    {name:'repository',path:'apps/tools/rule-repo/releases/3.4.1/repository.js'},
    {name:'filter',path:'apps/tools/rule-repo/releases/3.4.0/filter.js'},
    {name:'stabilityPatch',path:'apps/tools/rule-repo/releases/3.4.3/stability_patch.js'},
    {name:'management',path:'apps/tools/rule-repo/releases/3.5.0-rc1/management.js'},
    {name:'taxonomyPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc2/taxonomy_patch.js'},
    {name:'repositoryPatch',path:'apps/tools/rule-repo/releases/3.5.0-rc4/repository_patch.js'},
    {name:'productState',path:'apps/tools/rule-repo/releases/3.5.0-rc5/product_state.js'},
    {name:'design',path:'apps/tools/rule-repo/releases/3.5.0-rc6/design.js'},
    {name:'ui',path:'apps/tools/rule-repo/releases/3.5.0-rc6/ui.js'},
    {name:'home',path:'apps/tools/rule-repo/releases/3.5.0-rc6/home.js'},
    {name:'category',path:'apps/tools/rule-repo/releases/3.5.0-rc6/category.js'},
    {name:'search',path:'apps/tools/rule-repo/releases/3.5.0-rc6/search.js'},
    {name:'updates',path:'apps/tools/rule-repo/releases/3.5.0-rc6/updates.js'},
    {name:'detail',path:'apps/tools/rule-repo/releases/3.5.0-rc6/detail.js'},
    {name:'history',path:'apps/tools/rule-repo/releases/3.5.0-rc5/history.js'},
    {name:'settings',path:'apps/tools/rule-repo/releases/3.5.0-rc6/settings.js'},
    {name:'stablePatch',path:'apps/tools/rule-repo/releases/3.5.0/stable_patch.js'}
  ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.0'}}
};
var RuleRepoBoot={
  manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
  load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库 Core 加载失败');return r;},
  info:function(){return this.manager().info(RULE_REPO_CONFIG);},
  run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
  updatePage:function(){setPageTitle('正式版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null;d.push({title:'我的规则仓库',desc:'当前 '+cur.version+'\nStable · 日常稳定使用',img:RULE_REPO_ICON,pic_url:RULE_REPO_ICON,col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});d.push({title:'检查更新',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('正在检查…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var x=HikerCloudRemote.check(RULE_REPO_CONFIG);hideLoading();return x.hasUpdate?'toast://发现 '+x.latest.version:'toast://已经是最新正式版';}catch(e){hideLoading();return'toast://检查失败';}})});d.push({title:'升级正式版',col_type:'text_2',url:$('#noLoading#').lazyRule(function(){showLoading('正在升级…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.update(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(!r.changed)return'toast://已经是最新正式版';refreshPage(false);return'toast://已升级到 '+r.current.version;}catch(e){hideLoading();return'toast://升级失败';}})});d.push({col_type:'blank_block'});d.push({title:'回退到上一稳定版',desc:prev?'可回退到 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('正在回退…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.rollback(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败';}})});d.push({title:'重新加载当前版本',desc:'仅在页面异常或云端修复后使用',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){showLoading('正在重新加载…');try{require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},201);var r=HikerCloudRemote.reinstall(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://已重新加载';}catch(e){hideLoading();return'toast://操作失败';}})});setResult(d);}
};
