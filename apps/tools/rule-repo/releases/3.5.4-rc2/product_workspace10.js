/* 我的规则仓库 3.5.4-rc2 - Product Workspace 10.0 structural UI */
(function(R){
R.productWorkspaceVersion='10.0.0';
R.metricAssetRoot='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/tools/rule-repo/assets/ui/metrics/';

R.workspaceMetricDigit=function(value){
 var n=Math.max(0,Math.round(Number(value)||0));
 return this.metricAssetRoot+(n<10?'digit-'+n:'digit-many')+'.svg';
};

R.metricCard=function(title,value,view,active,key){
 var on=String(active)===String(view),img=this.workspaceMetricDigit(value);
 return{title:(on?'● ':'')+String(title||'')+' '+String(value==null?0:value),img:img,pic_url:img,col_type:'icon_small_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,id:'rule-repo-workspace10-metric-'+String(view),cls:'rule-repo-workspace10-metric'}};
};

R.nativeCategoryTab=function(cat,active,key){
 var on=String(active)===String(cat.id);
 return{title:(on?'● ':'')+String(cat.name||'分类')+(on?' '+String(cat.count||0):''),col_type:'flex_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);if(k==='hc_repo_category'){clearMyVar('hc_repo_sub');clearMyVar('hc_repo_tag');putMyVar('hc_repo_home_category',v);putMyVar('hc_repo_home_sub','all');putMyVar('hc_repo_home_view','all');}else{putMyVar('hc_repo_category',v);clearMyVar('hc_repo_home_sub');}refreshPage(false);return'hiker://empty';},key,cat.id),extra:{lineVisible:false,id:'rule-repo-workspace10-category-'+String(cat.id)}};
};

R.workspaceScopeCard=function(title,value,active,key,count){
 var on=String(active)===String(value);
 return{title:(on?'● ':'')+String(title||'')+' '+String(count==null?0:count),col_type:'text_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,textAlign:'center',id:'rule-repo-workspace10-scope-'+String(value)}};
};

R.workspaceMainCategoryRow=function(cat){
 var icon=this.uiIcon('category');
 return{title:String(cat.name||'分类'),desc:String(cat.count||0)+' 个程序',img:icon,pic_url:icon,url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_category',v);clearMyVar('hc_repo_sub');clearMyVar('hc_repo_tag');putMyVar('hc_repo_home_category',v);putMyVar('hc_repo_home_sub','all');putMyVar('hc_repo_home_view','all');refreshPage(false);return'hiker://empty';},String(cat.id||'all')),col_type:'avatar',extra:{lineVisible:false,id:'rule-repo-workspace10-main-'+String(cat.id||'all')}};
};

R.workspaceSubCategoryRow=function(cat,sub){
 var title=String(sub.id||'all')==='all'?'全部'+String(cat.name||'分类'):String(sub.name||'子分类'),icon=this.uiIcon('filter');
 return{title:title,desc:String(sub.count||0)+' 个程序',img:icon,pic_url:icon,url:$('#noLoading#').lazyRule(function(c,s){putMyVar('hc_repo_category',c);putMyVar('hc_repo_sub',s);putMyVar('hc_repo_home_category',c);putMyVar('hc_repo_home_sub',s);putMyVar('hc_repo_home_view','all');return'hiker://page/ruleRepoHome?rule=&simple=true';},String(cat.id||'all'),String(sub.id||'all')),col_type:'avatar',extra:{lineVisible:false,id:'rule-repo-workspace10-sub-'+String(cat.id||'all')+'-'+String(sub.id||'all')}};
};

R.workspaceSettingCard=function(title,value,url,id){
 return{title:String(title||'')+'  '+String(value||''),url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false,textAlign:'left',id:'rule-repo-workspace10-setting-'+String(id||'item')}};
};

R.home=function(){
 setPageTitle(this.productTitle());var d=[],m,items;
 try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}catch(e){setResult([{title:'暂时无法打开程序库',desc:this.friendlyError(e),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),sub=String(getMyVar('hc_repo_home_sub','all')||'all'),sort=String(getMyVar('hc_repo_home_sort','default')||'default'),cats=this.nativeCategories(items),filtered=this.nativeHomeItems(items,view,cat,sub,sort),sortLabel=sort==='default'?'默认排序':(sort==='updated'?'最近更新':(sort==='name'?'名称排序':'版本排序'));
 d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://page/ruleRepoAbout?rule=&simple=true'));
 for(var ci=0;ci<cats.length;ci++)d.push(this.nativeCategoryTab(cats[ci],cat,'hc_repo_home_category'));
 d.push(this.metricCard('全部',stats.all,'all',view,'hc_repo_home_view'));
 d.push(this.metricCard('已安装',stats.installed,'installed',view,'hc_repo_home_view'));
 d.push(this.metricCard('可更新',stats.updates,'updates',view,'hc_repo_home_view'));
 d.push(this.metricCard('收藏',stats.favorites,'favorites',view,'hc_repo_home_view'));
 if(stats.updates>0)d.push(this.compactInfo('有 '+stats.updates+' 个程序可以更新','进入更新中心逐项确认','hiker://page/ruleRepoUpdates?rule=&simple=true'));
 d.push(this.sectionLine());d.push(this.sectionToolbar('我的程序 · '+filtered.length,'search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 var sortCode="(function(){var map={'默认排序':'default','最近更新':'updated','名称排序':'name','版本排序':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return 'hiker://empty';})()";
 d.push(this.nativeTool(sortLabel,'filter',this.selectRoute('排序方式',['默认排序','最近更新','名称排序','版本排序'],sortCode,2),'sort'));
 d.push(this.nativeTool(cat==='all'?'分类管理':'分类 · '+String((cats.filter(function(x){return x.id===cat;})[0]||{}).name||''),'category','hiker://page/ruleRepoCategory?rule=&simple=true','category'));
 d.push(this.nativeTool('同步目录','sync',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();r.clearPresenceCache&&r.clearPresenceCache();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),'sync'));
 for(var i=0;i<filtered.length;i++)this.pushProgram(d,filtered[i]);
 if(!filtered.length)this.pushEmpty(d,'没有匹配程序','切换状态、分类或在分类页重新选择。');
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.categoryPage=function(){
 setPageTitle('分类管理');var d=[],items;
 try{items=this.items(false);}catch(e){setResult([{title:'暂时无法读取分类',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 var active=String(getMyVar('hc_repo_category','all')||'all'),cats=this.nativeCategories(items),activeCat=null,i;
 for(i=0;i<cats.length;i++)if(cats[i].id===active){activeCat=cats[i];break;}if(!activeCat){active='all';activeCat=cats[0];}
 d.push(this.sectionToolbar('分类目录 · '+items.length+' 个程序','search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 for(i=0;i<cats.length;i++)d.push(this.nativeCategoryTab(cats[i],active,'hc_repo_category'));
 d.push(this.sectionLine());
 if(active==='all'){
  this.pushSection(d,'全部分类','选择主分类后查看子分类');
  for(i=1;i<cats.length;i++)d.push(this.workspaceMainCategoryRow(cats[i]));
 }else{
  var subs=this.subCategories(items,active);this.pushSection(d,activeCat.name+' · '+activeCat.count,'选择子分类后直接返回程序工作台');
  for(i=0;i<subs.length;i++)d.push(this.workspaceSubCategoryRow(activeCat,subs[i]));
  if(!subs.length)this.pushEmpty(d,'暂无子分类','可以选择“全部'+activeCat.name+'”查看该类程序。');
 }
 d.push(this.sectionLine());this.pushNav(d,'category');setResult(d);
};

R.searchPage=function(){
 setPageTitle('搜索');var d=[],items;
 try{items=this.items(false);}catch(e){setResult([{title:'搜索暂时不可用',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var raw=String(getParam('kw','')||getParam('s','')||''),pkw=this.safeDecodeKeyword(raw),kw=pkw||this.safeDecodeKeyword(getMyVar('hc_repo_search_kw','')),scope=String(getMyVar('hc_repo_search_scope','all')||'all'),mode=String(getMyVar('hc_repo_search_mode','all')||'all'),stats=this.stats(items);
 if(pkw){putMyVar('hc_repo_search_kw',pkw);this.recordSearch(pkw);}
 d.push({title:'搜索',url:$.toString(function(){var q=String(input||'').trim();putMyVar('hc_repo_search_kw',q);var r=$.require('hiker://page/ruleRepoCore');if(q)r.recordSearch(q);refreshPage(false);return'hiker://empty';}),col_type:'input',extra:{defaultValue:kw,hint:'搜索名称、功能、标签或版本',onChange:$.toString(function(){putMyVar('hc_repo_search_kw',String(input||''));})}});
 d.push(this.workspaceScopeCard('全部','all',scope,'hc_repo_search_scope',stats.all));
 d.push(this.workspaceScopeCard('已安装','installed',scope,'hc_repo_search_scope',stats.installed));
 d.push(this.workspaceScopeCard('可更新','updates',scope,'hc_repo_search_scope',stats.updates));
 d.push(this.workspaceScopeCard('收藏','favorites',scope,'hc_repo_search_scope',stats.favorites));
 var pool=items.slice(),self=this;
 if(scope==='installed')pool=pool.filter(function(x){return self.actualInstalled?self.actualInstalled(x):!!self.installedVersion(x);});
 else if(scope==='updates')pool=pool.filter(function(x){return x.entryType!=='channel-group'&&(self.actualStatus?self.actualStatus(x):self.statusOf(x))==='可更新';});
 else if(scope==='favorites')pool=pool.filter(function(x){return self.isFav(x);});
 if(mode==='remote')pool=pool.filter(function(x){return x.mode==='remote';});else if(mode==='local')pool=pool.filter(function(x){return x.mode!=='remote';});
 var modeLabel=mode==='remote'?'远程':(mode==='local'?'本地':'全部运行方式');
 if(kw){
  var a=pool.filter(function(x){return self.matchKeyword(x,kw);});d.push(this.sectionLine());d.push(this.sectionToolbar('搜索结果 · '+a.length+' · '+modeLabel,'filter',this.nativeSearchMenu(mode,false)));
  for(var i=0;i<a.length;i++)this.pushProgram(d,a[i]);
  if(!a.length)this.pushEmpty(d,'没有找到相关程序','换一个名称、功能、标签或搜索范围试试。');
 }else{
  var hist=this.searchHistory(),tags=this.popularTags(items,6),recent=this.recentItems?this.recentItems(pool,3):[];
  d.push(this.sectionLine());d.push(this.sectionToolbar(hist.length?'最近搜索 · '+hist.length:'发现程序 · '+modeLabel,'more',this.nativeSearchMenu(mode,hist.length>0)));
  for(var h=0;h<Math.min(hist.length,5);h++)d.push({title:String(hist[h]),col_type:'flex_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_search_kw',v);var r=$.require('hiker://page/ruleRepoCore');r.recordSearch(v);refreshPage(false);return'hiker://empty';},hist[h]),extra:{lineVisible:false,id:'rule-repo-workspace10-history-'+h}});
  if(tags.length){d.push(this.sectionLine());this.pushSection(d,'热门标签','点击标签直接搜索');for(var t=0;t<tags.length;t++)d.push({title:'#'+String(tags[t].name||''),col_type:'flex_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_search_kw',v);var r=$.require('hiker://page/ruleRepoCore');r.recordSearch(v);refreshPage(false);return'hiker://empty';},String(tags[t].name||'')),extra:{lineVisible:false,id:'rule-repo-workspace10-tag-'+t}});}
  if(recent.length){d.push(this.sectionLine());d.push(this.sectionToolbar('最近使用 · '+recent.length,'history','hiker://page/ruleRepoHistory?rule=&simple=true'));for(var rr=0;rr<recent.length;rr++)this.pushProgram(d,recent[rr]);}
  if(!hist.length&&!tags.length&&!recent.length)this.pushEmpty(d,'搜索你的程序','支持名称、描述、标签、分类和版本。');
 }
 d.push(this.sectionLine());this.pushNav(d,'search');setResult(d);
};

R.detailPage=function(){
 var params=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},id=String(params.hc_repo_item_id||getParam('id')||''),item=this.findById(id,false),d=[];
 if(!item){setResult([{title:'这个程序暂时不可用',desc:'云端目录可能已经更新，请返回首页重新同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);
 setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}
 this.clearPresenceCache&&this.clearPresenceCache();var st=this.nativeStatusMeta(item),lastImport=this.lastImportedTime(item),lastOpen=this.lastOpenedTime?this.lastOpenedTime(item):0,localVersion=this.installedVersion(item)||'未记录',size=item.bytes?Math.max(1,Math.round(Number(item.bytes)/1024))+' KB':'轻量规则';
 d.push(this.hero(item.name,this.nativeVersionText(item)+' · '+st.label+' · '+String(item.categoryName||'程序'),this.iconOf(item),'hiker://empty'));
 d.push(this.infoPair('云端',this.nativeVersionText(item)));d.push(this.infoPair('本地',localVersion));d.push(this.infoPair('状态',st.label));d.push(this.infoPair('类型',item.mode==='remote'?'远程代码':'本地代码'));
 d.push(this.compactInfo('更新时间 · 大小',String(item.updatedAt||'--')+' · '+size,'hiker://empty'));
 d.push(this.nativeDetailTagRow(item));d.push(this.compactInfo('程序说明',String(item.desc||this.nativeProgramSummary(item)),'hiker://empty'));
 d.push(this.sectionLine());d.push(this.primaryAction('打开程序',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)));d.push(this.secondaryAction(st.label==='可更新'?'更新到最新版':'导入 / 覆盖',$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))));
 d.push(this.sectionLine());
 d.push(this.quickAction5(this.isFav(item)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));
 d.push(this.quickAction5('检查更新','updates',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';r.clearPresenceCache&&r.clearPresenceCache();return'toast://'+r.nativeStatusMeta(x).label+' · 云端 '+r.nativeVersionText(x);},item.id)));
 d.push(this.quickAction5('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.quickAction5('备份','backup',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 var moreCode="(function(){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||''),id="+JSON.stringify(item.id)+";if(v==='设置')return 'hiker://page/ruleRepoSettings?rule=&simple=true';if(v==='清除版本记录'){r.removeInstalled(id);refreshPage(false);return 'toast://已清除仓库版本记录';}return 'hiker://empty';})()";d.push(this.quickAction5('更多','more',this.selectRoute('更多操作',['设置','清除版本记录'],moreCode,2)));
 if(lastImport||lastOpen){var recent=[];if(lastImport)recent.push('导入 '+this.formatShortTime(lastImport));if(lastOpen)recent.push('打开 '+this.formatShortTime(lastOpen));d.push(this.compactInfo('最近使用',recent.join(' · '),'hiker://page/ruleRepoHistory?rule=&simple=true'));}
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.channelPage=function(parent){
 setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),cs,i,stable=null,test=null,local=null;
 if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 try{setPagePicUrl(this.iconOf(parent));}catch(e){}
 cs=meta.channels||[];for(i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];else if(cs[i].channel==='test')test=cs[i];else if(cs[i].channel==='local')local=cs[i];}
 var selfRepo=String(parent.id||'')==='rule-repo',coexist=selfRepo||!!(parent.raw&&parent.raw.allowCoexist),currentChannel=selfRepo?(this.isTestChannel()?'test':'stable'):'',openName=selfRepo&&this.isTestChannel()?'我的规则仓库·测试版':String(parent.name||'');
 d.push(this.hero(parent.name,'稳定使用、抢先体验与恢复入口',this.iconOf(parent),'hiker://empty'));
 d.push(this.compactInfo('当前运行',selfRepo?(this.isTestChannel()?'测试版 '+this.version:'正式版 '+this.version):'请选择下方版本','hiker://empty'));
 d.push(this.infoPair('正式',stable?String(stable.version||'--'):'暂无'));d.push(this.infoPair('测试',test?String(test.version||'--'):'暂无'));d.push(this.infoPair('本地',local?String(local.version||'有'):'暂无'));d.push(this.infoPair('版本',String(cs.length)+' 个'));
 d.push(this.sectionLine());d.push(this.primaryAction('打开程序','hiker://home@'+openName+'||hiker://home'));d.push(this.secondaryAction('检查版本',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://版本信息已更新':'toast://当前已是最新';}catch(e){hideLoading();return'toast://同步失败';}})));
 d.push(this.sectionLine());d.push(this.sectionToolbar('可用版本 · '+cs.length,'updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 if(stable)this.pushChannelBlock(d,parent,stable,currentChannel==='stable');if(test)this.pushChannelBlock(d,parent,test,currentChannel==='test');if(local)this.pushChannelBlock(d,parent,local,currentChannel==='local');
 d.push(this.sectionLine());
 d.push(this.quickAction5(this.isFav(parent)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},parent.id)));
 d.push(this.quickAction5('同步','sync',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败';}})));
 d.push(this.quickAction5('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.quickAction5('设置','settings','hiker://page/ruleRepoSettings?rule=&simple=true'));d.push(this.quickAction5('返回仓库','home','hiker://page/ruleRepoHome?rule=&simple=true'));
 d.push(this.sectionLine());d.push(this.compactInfo('恢复保障',coexist?'正式版与测试版可同时保留；测试异常时从正式版重新导入即可恢复。':(local?'正式版与测试版同名覆盖；本地版独立命名，可与远程版并存。':'正式版与测试版同名覆盖；测试异常时重新导入正式版即可恢复。'),'hiker://empty'));
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.settingsPage=function(){
 setPageTitle('设置');var d=[],cache=this.cacheMs(),probe=this.probeMs(),presence=this.installProbeEnabled&&this.installProbeEnabled();
 d.push(this.hero('设置','同步、数据安全与诊断',this.uiIcon('settings'),'hiker://empty'));
 var probeCode="(function(){var map={'关闭':0,'30秒':30000,'60秒':60000,'180秒':180000,'300秒':300000},r=$.require('hiker://page/ruleRepoCore');r.setSetting('probe_ms',map[String(input||'60秒')]);refreshPage(false);return 'toast://已设置';})()";
 var cacheCode="(function(){var map={'5分钟':300000,'15分钟':900000,'30分钟':1800000,'60分钟':3600000},r=$.require('hiker://page/ruleRepoCore');r.setSetting('cache_ms',map[String(input||'30分钟')]||1800000);refreshPage(false);return 'toast://已设置';})()";
 d.push(this.sectionToolbar('同步与更新','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 d.push(this.workspaceSettingCard('自动检查',probe<=0?'关闭':Math.round(probe/1000)+' 秒',this.selectRoute('自动检查频率',['关闭','30秒','60秒','180秒','300秒'],probeCode,2),'probe'));
 d.push(this.workspaceSettingCard('离线缓存',Math.round(cache/60000)+' 分钟',this.selectRoute('离线缓存时间',['5分钟','15分钟','30分钟','60分钟'],cacheCode,2),'cache'));
 d.push(this.workspaceSettingCard('立即同步','更新目录',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();r.clearPresenceCache&&r.clearPresenceCache();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://同步完成':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),'sync'));
 d.push(this.workspaceSettingCard('版本中心','更新 / 回退','hiker://page/ruleRepoUpdate?rule=&simple=true','update'));
 d.push(this.sectionLine());d.push(this.sectionToolbar('数据与恢复','backup','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction('备份','backup',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 var restoreCode="(function(){try{var r=$.require('hiker://page/ruleRepoCore');r.restoreState(String(input||''));r.clearSelection();r.clearPresenceCache&&r.clearPresenceCache();refreshPage(false);return 'toast://已恢复';}catch(e){return 'toast://恢复失败';}})()";d.push(this.quickAction('恢复','history',this.inputRoute('粘贴备份 JSON',restoreCode,'')));
 d.push(this.quickAction('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 var clearCode="(function(){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||'');if(v==='最近打开')r.clearOpenHistory();else if(v==='搜索历史')r.clearSearchHistory();else if(v==='收藏')r.clearFavorites();else if(v==='导入记录'){r.clearImportHistory();r.clearInstalled();}r.clearPresenceCache&&r.clearPresenceCache();refreshPage(false);return 'toast://已清理 '+v;})()";d.push(this.quickAction('清理记录','more',this.selectRoute('选择要清理的内容',['最近打开','搜索历史','收藏','导入记录'],clearCode,2)));
 if(this.isTestChannel()){
  var presenceCode="(function(){var r=$.require('hiker://page/ruleRepoCore'),on=String(input||'开启')==='开启';r.setSetting('install_probe',on?'1':'0');r.clearPresenceCache&&r.clearPresenceCache();refreshPage(false);return 'toast://安装状态识别已'+(on?'开启':'关闭');})()";
  d.push(this.compactInfo('测试能力 · 安装状态识别',(presence?'已开启':'已关闭')+' · 点击调整',this.selectRoute('安装状态识别',['开启','关闭'],presenceCode,2)));
 }
 d.push(this.sectionLine());d.push(this.sectionToolbar('关于与诊断','settings','hiker://page/ruleRepoAbout?rule=&simple=true'));
 d.push(this.quickAction('版本信息','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.quickAction('产品说明','home','hiker://page/ruleRepoAbout?rule=&simple=true'));d.push(this.quickAction('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction('诊断信息','settings',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore'),src=r.lastCloudSource?r.lastCloudSource():'--',rev=String(getItem(r.manifestRevisionKey,'--')||'--');return'confirm://Core '+r.version+'\nbuild '+r.build+'\nUI '+String(r.releaseLabel||'--')+'\nrevision '+rev+'\nsource '+src;})));
 d.push(this.sectionLine());this.pushNav(d,'settings');setResult(d);
};

R.aboutPage=function(){
 setPageTitle('关于');var d=[],repo=this.findById('rule-repo')||{},channel=this.isTestChannel()?'测试版':'正式版';
 d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://empty'));
 d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.quickAction('搜索','search','hiker://page/ruleRepoSearch?rule=&simple=true'));d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.quickAction('备份恢复','backup','hiker://page/ruleRepoSettings?rule=&simple=true'));
 d.push(this.sectionLine());d.push(this.sectionToolbar('版本与通道','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 d.push(this.infoPair('当前',String(this.version||'--')));d.push(this.infoPair('通道',channel));d.push(this.infoPair('正式',String(this.baseStableVersion||this.version||'--')));d.push(this.infoPair('界面','Workspace 10.0'));
 d.push(this.compactInfo('运行信息','Build '+String(this.build||'--')+' · Stable/Test 分层 · 异常可恢复','hiker://empty'));
 d.push(this.compactInfo('产品原则','稳定优先 · 主任务优先 · 原生组件优先 · 工程信息后置','hiker://empty'));
 d.push(this.sectionLine());this.pushNav(d,'settings');setResult(d);
};

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.3',build:377,path:'apps/tools/rule-repo/rule_repo_remote_v353.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'实机验证稳定 · 日常使用与恢复入口',highlights:['首页状态工作台','程序状态与标签分层','安全同步与多镜像'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.4-rc2',baseVersion:'3.5.3',targetVersion:'3.5.4',build:379,path:'apps/tools/rule-repo/rule_repo_test_v125.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Product Workspace 10.0 · 首页、分类、搜索和设置结构重建',highlights:['远程数字工作台','可换行分类导航','子分类清单','等宽搜索范围','压缩设置中心'],icon:icon}
 ]};
};
})(HikerRuleRepo);
