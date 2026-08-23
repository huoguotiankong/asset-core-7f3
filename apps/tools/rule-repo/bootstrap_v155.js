/* 我的规则仓库 Remote Bootstrap v1.5.5 - Stable 3.5.5 / Delivery Protocol 2.0 */
(function(){
function reqAny(urls,ver,label){var errs=[];for(var i=0;i<urls.length;i++){try{require(String(urls[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return String(urls[i]);}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error(String(label||'模块')+'全部镜像失败：'+errs.join(' | '));}
var BASE_SHA='f2430a7d6fd0b59a6eb26fca087c16d92cb8bc8e',BASE_PATH='apps/tools/rule-repo/bootstrap_v154.js';
reqAny([
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BASE_SHA+'/'+BASE_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BASE_SHA+'/'+BASE_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BASE_SHA+'/'+BASE_PATH
],155,'Stable Bootstrap 基线');
RULE_REPO_BOOTSTRAP_VERSION='1.5.5';
var MGR_SHA='fe26fe9f8f9c40efd60f93753b84b350af6a7612',MGR_PATH='libs/updater/v2.0.4/remote_manager.js';
var MGR_URLS=[
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+MGR_SHA+'/'+MGR_PATH,
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+MGR_SHA+'/'+MGR_PATH,
 'https://github.com/huoguotiankong/asset-core-7f3/raw/'+MGR_SHA+'/'+MGR_PATH
];
RULE_REPO_MANAGER_URL=MGR_URLS[0];
RULE_REPO_CONFIG.minBuild=389;
RULE_REPO_CONFIG.repoTemplates=[
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}',
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}'
];
var d=JSON.parse(JSON.stringify(RULE_REPO_CONFIG.defaultRelease));
d.version='3.5.5';d.build=389;d.modules=d.modules||[];
d.modules.push({name:'syncRefreshPatch',path:'apps/tools/rule-repo/releases/test-3.5.4-sync2/sync_refresh_patch.js'});
d.modules.push({name:'iconDeliveryPatch',path:'apps/tools/rule-repo/releases/test-3.5.5-rc1/icon_delivery_patch.js'});
d.modules.push({name:'channelIconPatch',path:'apps/tools/rule-repo/releases/test-3.5.5-rc2/channel_icon_patch.js'});
d.modules.push({name:'stablePromotionPatch355',path:'apps/tools/rule-repo/releases/3.5.5/stable_patch.js'});
d.verify={global:'HikerRuleRepo',property:'version',equals:'3.5.5'};RULE_REPO_CONFIG.defaultRelease=d;
RuleRepoBoot.manager=function(){reqAny(MGR_URLS,204,'Remote Manager 2.0.4');if(typeof HikerCloudRemote!=='object'||String(HikerCloudRemote.version||'')!=='2.0.4')throw new Error('远程模块管理器版本异常');return HikerCloudRemote;};
RuleRepoBoot.updatePage=function(){setPageTitle('正式版更新');var d=[],m=this.manager(),info=m.info(RULE_REPO_CONFIG),cur=info.current||RULE_REPO_CONFIG.defaultRelease,prev=info.previous||null,cfg=JSON.stringify(RULE_REPO_CONFIG),mgrs=JSON.stringify(MGR_URLS);
 d.push({title:'我的规则仓库',desc:'当前 '+cur.version+' · Build '+cur.build+'\nStable 3.5.5 · Updater 2.0.4 · 原子发布',img:RULE_REPO_ICON,pic_url:RULE_REPO_ICON,col_type:'icon_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
 d.push({title:'检查更新',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在检查…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var x=m.check(cfg);hideLoading();if(x.hasUpdate)return'toast://发现 '+x.latest.version+' / Build '+x.latest.build;if(x.offline)return'toast://当前版本可用；云端更新指针暂不可达，稍后重试';if(x.metadataLag)return'toast://云端指针仍在传播，当前版本保持不变';return'toast://已经是最新正式版';}catch(e){hideLoading();return'toast://检查失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({title:'升级正式版',col_type:'text_2',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在升级…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.update(cfg);hideLoading();if(!r.ok)return'toast://升级失败：'+r.error;if(r.changed){refreshPage(false);return'toast://已升级到 '+r.current.version;}if(r.offline)return'toast://当前 '+r.current.version+' 可正常使用；云端元数据暂不可达';if(r.metadataLag)return'toast://云端指针仍在传播，已保持当前版本';return'toast://已经是最新正式版';}catch(e){hideLoading();return'toast://升级失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({col_type:'line'});
 d.push({title:'回退到上一稳定版',desc:prev?'可回退到 '+prev.version:'当前没有可回退版本',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在回退…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.rollback(cfg);hideLoading();if(!r.ok)return'toast://回退失败：'+r.error;refreshPage(false);return'toast://已回退到 '+r.current.version;}catch(e){hideLoading();return'toast://回退失败：'+String(e.message||e);}},cfg,mgrs)});
 d.push({title:'重新加载当前版本',desc:'页面异常或模块缓存异常时使用',col_type:'text_1',url:$('#noLoading#').lazyRule(function(c,u){showLoading('正在重新加载…');try{var cfg=JSON.parse(c),us=JSON.parse(u||'[]'),m=null,es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4'){m=HikerCloudRemote;break;}}catch(e){es.push((i+1)+':'+String(e.message||e));}if(!m)throw new Error('Remote Manager 全部镜像失败：'+es.join(' | '));var r=m.reinstall(cfg);hideLoading();if(!r.ok)return'toast://失败：'+r.error;refreshPage(false);return'toast://已重新加载';}catch(e){hideLoading();return'toast://操作失败：'+String(e.message||e);}},cfg,mgrs)});setResult(d);};
})();
