/* 我的规则仓库 Remote Bootstrap v1.4.4 - recovery shell */
var RULE_REPO_BOOTSTRAP_VERSION='1.4.4';
var RULE_REPO_MANAGER_URL='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/libs/updater/v2.0.2/remote_manager.js';
var RULE_REPO_CONFIG={
 id:'rule-repo',branch:'main',latestPath:'apps/tools/rule-repo/latest.json',minBuild:343,
 repoTemplates:[
  'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
  'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
  'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'
 ],moduleHeaders:{'Cache-Control':'no-cache'},
 defaultRelease:{schema:1,id:'rule-repo',name:'我的规则仓库',version:'3.4.3',build:343,ref:'main',modules:[
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
  {name:'stabilityPatch',path:'apps/tools/rule-repo/releases/3.4.3/stability_patch.js'}
 ],verify:{global:'HikerRuleRepo',property:'version',equals:'3.4.3'}}
};
var RuleRepoBoot={
 manager:function(){require(RULE_REPO_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},202);if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');return HikerCloudRemote;},
 load:function(){var r=this.manager().load(RULE_REPO_CONFIG);if(typeof HikerRuleRepo!=='object')throw new Error('规则仓库 Core 加载失败');return r;},
 info:function(){return this.manager().info(RULE_REPO_CONFIG);},
 run:function(page){this.load();page=page||'home';if(page==='home')return HikerRuleRepo.home();if(page==='category'||page==='filters')return HikerRuleRepo.categoryPage();if(page==='search')return HikerRuleRepo.searchPage();if(page==='updates'||page==='versions')return HikerRuleRepo.updatesPage();if(page==='detail')return HikerRuleRepo.detailPage();if(page==='history')return HikerRuleRepo.historyPage();if(page==='settings')return HikerRuleRepo.settingsPage();if(page==='about')return HikerRuleRepo.aboutPage();throw new Error('未知页面：'+page);},
 updatePage:function(){
  setPageTitle('Core 更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null,cfg=JSON.stringify(RULE_REPO_CONFIG),mgr=RULE_REPO_MANAGER_URL;
  d.push({title:'当前 Core '+cur.version,desc:'build '+cur.build+' · Bootstrap '+RULE_REPO_BOOTSTRAP_VERSION+' · Manager '+info.managerVersion,col_type:'text_1',url:'hiker://empty'});
  d.push({title:'检查正式版更新',desc:'多镜像读取 latest.json，不再依赖单一 GitHub Raw。',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('检查更新…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var x=HikerCloudRemote.check(cfg);hideLoading();return x.hasUpdate?'toast://发现新版本 '+x.latest.version:'toast://已是当前稳定版 '+x.current.version;}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({title:'升级正式版',desc:'先完整加载并校验新版本，成功后才切换。',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('升级中…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.update(cfg);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(!r.changed)return'toast://已经是当前稳定版';refreshPage(false);return'toast://已升级到 '+r.current.version;}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({col_type:'blank_block'});
  d.push({title:'回退上一版本',desc:prev?'可回退到 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('回退中…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.rollback(cfg);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({title:'重新加载当前版本',desc:'仅在页面异常时使用，不改变当前版本。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('重新加载…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.reinstall(cfg);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://当前版本已重新加载';}catch(e){hideLoading();return'toast://失败：'+String(e.message||e);}},cfg,mgr)});
  d.push({title:'恢复稳定基线 3.4.3',desc:'只在 Remote 状态异常时使用。',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('恢复中…');try{var cfg=JSON.parse(c);require(u,{headers:{'Cache-Control':'no-cache'}},202);var r=HikerCloudRemote.resetToDefault(cfg);hideLoading();if(!r.ok)return'toast://恢复失败：'+r.error;refreshPage(false);return'toast://已恢复到 '+r.current.version;}catch(e){hideLoading();return'toast://恢复失败：'+String(e.message||e);}},cfg,mgr)});
  setResult(d);
 }
};
