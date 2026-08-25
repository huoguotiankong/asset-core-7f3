/* 我的规则仓库 Test Bootstrap v1.7.5 - RC38 Native Detail */
(function(){
if(typeof RULE_REPO_TEST_BOOTSTRAP_URL==='undefined'||!String(RULE_REPO_TEST_BOOTSTRAP_URL||''))RULE_REPO_TEST_BOOTSTRAP_URL='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v175.js';
var STABLE_BOOT='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@5036c15d8beabd4ade6482b0bcdd02910ceb6d43/apps/tools/rule-repo/bootstrap_v155.js';
require(STABLE_BOOT,{headers:{'Cache-Control':'public, max-age=31536000, immutable'}},155);
if(typeof RuleRepoBoot!=='object'||typeof RULE_REPO_CONFIG!=='object')throw new Error('Stable 3.5.5 Bootstrap 未加载');
RULE_REPO_BOOTSTRAP_VERSION='1.7.5';
var d=JSON.parse(JSON.stringify(RULE_REPO_CONFIG.defaultRelease));
d.id='rule-repo-test';d.name='我的规则仓库·测试版';d.version='3.5.6-rc38';d.build=428;d.ref='6489b8a161fd7f56f539adbc8cd2d5927e79019f';d.modules=d.modules||[];
d.modules.push({name:'fastHybridControl',path:'apps/tools/rule-repo/releases/test-3.5.6-rc36/fast_hybrid_patch.js'});
d.modules.push({name:'nativeDetailBatchPresence',path:'apps/tools/rule-repo/releases/test-3.5.6-rc38/native_detail_batch_presence.js'});
d.verify={global:'HikerRuleRepo',property:'version',equals:'3.5.6-rc38'};
RULE_REPO_CONFIG.id='rule-repo-test';RULE_REPO_CONFIG.branch='main';RULE_REPO_CONFIG.latestPath='apps/tools/rule-repo/test.json';RULE_REPO_CONFIG.minBuild=428;RULE_REPO_CONFIG.defaultRelease=d;
RuleRepoBoot.updatePage=function(){
 setPageTitle('测试版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null,boot=String(RULE_REPO_TEST_BOOTSTRAP_URL||'');
 d.push({title:'我的规则仓库·测试版',desc:'当前 '+cur.version+' · Build '+cur.build+'\nRC38 Native Detail',img:RULE_REPO_ICON,pic_url:RULE_REPO_ICON,col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
 d.push({title:'检查测试版更新',desc:'直接读取 test.json；不依赖 GitHub main HEAD API',col_type:'text_2',url:$('#noLoading#').lazyRule(function(u){showLoading('正在检查…');try{require(String(u),{headers:{'Cache-Control':'no-cache'}},175);var x=RuleRepoBoot.manager().check(RULE_REPO_CONFIG);hideLoading();if(x.hasUpdate)return'toast://发现 '+x.latest.version+' / Build'+x.latest.build;if(x.offline)return'toast://当前版本可用；测试指针暂不可达';if(x.metadataLag)return'toast://测试指针仍在传播，保持当前版本';return'toast://已经是最新测试版';}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}},boot)});
 d.push({title:'升级测试版',desc:'更新 Runtime；规则 Shell 也可从版本卡覆盖导入',col_type:'text_2',url:$('#noLoading#').lazyRule(function(u){showLoading('正在升级 Runtime…');try{require(String(u),{headers:{'Cache-Control':'no-cache'}},175);var r=RuleRepoBoot.manager().update(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(r.changed){refreshPage(false);return'toast://Runtime 已升级到 '+r.current.version;}if(r.offline)return'toast://云端暂不可达，当前版本继续可用';return'toast://已经是最新测试版';}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}},boot)});
 d.push({col_type:'line'});
 d.push({title:'重新加载当前 Runtime',desc:'只在模块缓存异常时使用',col_type:'text_1',url:$('#noLoading#').lazyRule(function(u){showLoading('正在重新加载…');try{require(String(u),{headers:{'Cache-Control':'no-cache'}},175);var r=RuleRepoBoot.manager().reinstall(RULE_REPO_CONFIG);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://当前 Runtime 已重新加载';}catch(e){hideLoading();return'toast://操作失败：'+String(e.message||e);}},boot)});
 if(prev)d.push({title:'Runtime 回退',desc:'可回退到 '+prev.version+'；规则 Shell 不自动降级',col_type:'text_1',url:'hiker://empty'});
 setResult(d);
};
})();
