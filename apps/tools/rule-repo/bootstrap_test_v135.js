/* 我的规则仓库·测试版 Bootstrap v1.0.35 - Stable 3.5.5 aligned baseline */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='fe26fe9f8f9c40efd60f93753b84b350af6a7612',BASE_PATH='apps/tools/rule-repo/bootstrap_test_v134.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],135,'Test Bootstrap 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.0.35-test';
var MGR_SHA='fe26fe9f8f9c40efd60f93753b84b350af6a7612',MGR_PATH='libs/updater/v2.0.4/remote_manager.js';
var MGR_URLS=[
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+MGR_SHA+'/'+MGR_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+MGR_SHA+'/'+MGR_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+MGR_SHA+'/'+MGR_PATH
];
RULE_REPO_MANAGER_URL=MGR_URLS[0];
RULE_REPO_CONFIG.minBuild=390;
RULE_REPO_CONFIG.repoTemplates=[
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}',
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}'
];
var old=RULE_REPO_CONFIG.defaultRelease,mods=[],src=old.modules||[];
for(var i=0;i<src.length;i++){var n=String(src[i]&&src[i].name||'');if(n==='testStatePatch'||n==='testBaselinePatch'||n==='updateProtocolPatch')continue;mods.push(src[i]);}
mods.push({name:'stablePromotionPatch355',path:'apps/tools/rule-repo/releases/3.5.5/stable_patch.js'});
mods.push({name:'testStatePatch',path:'apps/tools/rule-repo/test/v1.0.0/state_patch.js'});
mods.push({name:'testBaselinePatch355',path:'apps/tools/rule-repo/releases/test-3.5.5-sync1/test_baseline_patch.js'});
RULE_REPO_CONFIG.defaultRelease={schema:1,id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.5-test.1',build:390,ref:'main',modules:mods,verify:{global:'HikerRuleRepo',property:'version',equals:'3.5.5-test.1'}};
RuleRepoBoot.manager=function(){reqAny(MGR_URLS,204,'Remote Manager 2.0.4');if(typeof HikerCloudRemote!=='object'||String(HikerCloudRemote.version||'')!=='2.0.4')throw new Error('远程模块管理器版本异常');return HikerCloudRemote;};
RuleRepoBoot.updatePage=function(){setPageTitle('测试版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null,cfg=JSON.stringify(RULE_REPO_CONFIG),mgrs=JSON.stringify(MGR_URLS);
 d.push({title:'我的规则仓库·测试版',desc:'当前 '+cur.version+' · Build '+cur.build+'\nStable 3.5.5 同基线 · Updater 2.0.4',img:RULE_REPO_ICON,pic_url:RULE_REPO_ICON,col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
 d.push({title:'检查更新',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在检查…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var x=m.check(cfg);hideLoading();if(x.hasUpdate)return'toast://发现 '+x.latest.version+' / Build '+x.latest.build;if(x.offline)return'toast://当前版本可用；云端更新指针暂不可达，稍后重试';if(x.metadataLag)return'toast://云端指针仍在传播，当前版本保持不变';return'toast://已经是最新测试版';}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({title:'升级测试版',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在升级…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.update(cfg);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(r.changed){refreshPage(false);return'toast://已升级到 '+r.current.version;}if(r.offline)return'toast://当前 '+r.current.version+' 可正常使用；云端元数据暂不可达';if(r.metadataLag)return'toast://云端指针仍在传播，已保持当前版本';return'toast://已经是最新测试版';}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({col_type:'line'});
 d.push({title:'回退到上一版本',desc:prev?'可回退到 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在回退…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.rollback(cfg);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({title:'重新加载当前版本',desc:'页面异常或模块缓存异常时使用',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在重新加载…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.reinstall(cfg);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://已重新加载';}catch(e){hideLoading();return'toast://操作失败：'+String(e.message||e);}},cfg,mgrs)});setResult(d);};
})();
