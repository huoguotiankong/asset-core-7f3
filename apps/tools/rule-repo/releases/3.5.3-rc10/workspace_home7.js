/* 我的规则仓库 3.5.3-rc10 - Workspace 7.0 structural home rebuild */
(function(R){
R.workspaceHomeVersion='7.0.0';

R.workspaceSearchCard=function(){
 var icon=this.uiIcon('search');
 return{title:'搜索程序、分类或功能',desc:'名称 · 标签 · 版本',img:icon,pic_url:icon,url:'hiker://page/ruleRepoSearch?rule=&simple=true',col_type:'icon_1_search',extra:{lineVisible:false,id:'rule-repo-workspace-search'}};
};

R.workspaceStateChip=function(title,count,value,active,key){
 var on=String(active)===String(value);
 return{title:(on?'● ':'')+String(title||'')+' '+String(count||0),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,id:'rule-repo-workspace-state-'+String(value)}};
};

R.workspaceCategoryChip=function(title,value,active,key){
 var on=String(active)===String(value);
 return{title:(on?'● ':'')+String(title||''),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,id:'rule-repo-workspace-category-'+String(value)}};
};

R.workspaceQuickItems=function(items){
 var out=[],seen={},recent=this.recentItems?this.recentItems(items,8):[],favs=this.favoriteItems?this.favoriteItems(items):[],installed=[],i,pools;
 for(i=0;i<items.length;i++)if(this.actualInstalled?this.actualInstalled(items[i]):!!this.installedVersion(items[i]))installed.push(items[i]);
 pools=[recent,favs,installed,items];
 function add(list,groups){
  for(var j=0;j<list.length&&out.length<4;j++){
   var x=list[j],group=String(x&&x.entryType||'')==='channel-group';
   if(!x||group!==groups||seen[String(x.id||'')])continue;
   seen[String(x.id||'')]=1;out.push(x);
  }
 }
 for(i=0;i<pools.length&&out.length<4;i++)add(pools[i],false);
 for(i=0;i<pools.length&&out.length<4;i++)add(pools[i],true);
 return out;
};

R.workspaceQuickTile=function(item){
 var group=String(item&&item.entryType||'')==='channel-group',installed=this.actualInstalled?this.actualInstalled(item):!!this.installedVersion(item),detail='hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(String(item.id||'')),url=detail;
 if(!group&&installed)url=$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id);
 return{title:String(item.name||'程序'),img:this.iconOf(item),pic_url:this.iconOf(item),url:url,col_type:'icon_small_4',extra:{lineVisible:false,id:'rule-repo-workspace-quick-'+String(item.id||''),pageTitle:String(item.name||'程序'),hc_repo_item_id:String(item.id||''),longClick:[{title:'查看详情',js:$.toString(function(id){return'hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(String(id||''));},item.id)}]}};
};

R.workspaceProgramCard=function(item){
 var group=String(item&&item.entryType||'')==='channel-group',st=this.productStatusShort(item),fav=this.isFav(item),desc='';
 st=String(st||'').replace(/^[✓↑]\s*/, '');
 if(group)desc='版本中心 · 正式 / 测试 / 本地';
 else desc=st+' · '+this.cleanVersion(item.version)+' · '+String(item.categoryName||'程序');
 var detail='hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(String(item.id||'')),extra={lineVisible:false,pageTitle:item.name,hc_repo_item_id:item.id,id:'rule-repo-workspace-item-'+String(item.id),cls:'rule-repo-workspace-program'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st==='可更新'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:(fav?'★ ':'')+String(item.name||'程序'),desc:desc,img:this.iconOf(item),pic_url:this.iconOf(item),url:detail,col_type:'icon_1_left_pic',extra:extra};
};

R.pushWorkspaceProgram=function(d,item){d.push(this.workspaceProgramCard(item));d.push(this.programLine());};

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.2',build:364,path:'apps/tools/rule-repo/rule_repo_remote_v352.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'已验证稳定 · 日常使用与恢复入口',highlights:['稳定日常使用','安全同步与多镜像'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.3-rc10',baseVersion:'3.5.2',targetVersion:'3.5.3',build:375,path:'apps/tools/rule-repo/rule_repo_test_v122.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Workspace 7.0 · 首页结构重建',highlights:['原生搜索入口','最近/常用程序直达','双层紧凑筛选','单行状态可见'],icon:icon}
 ]};
};

R.home=function(){
 setPageTitle(this.productTitle());
 var d=[],m,items;
 try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));}
 catch(e){setResult([{title:'暂时无法打开程序库',desc:this.friendlyError(e),url:'hiker://page/ruleRepoUpdates?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var stats=this.stats(items),repo=this.findById('rule-repo')||{name:'我的规则仓库',category:'tools'},view=String(getMyVar('hc_repo_home_view','all')||'all'),cat=String(getMyVar('hc_repo_home_category','all')||'all'),sort=String(getMyVar('hc_repo_home_sort','default')||'default'),quick=this.workspaceQuickItems(items),recent=this.recentItems?this.recentItems(items,1):[];

 // Workspace identity: dynamic user-facing state replaces static marketing copy.
 d.push(this.hero('我的规则仓库',stats.installed+' 已安装 · '+stats.updates+' 可更新 · '+stats.all+' 个程序',this.iconOf(repo),'hiker://page/ruleRepoAbout?rule=&simple=true'));
 d.push(this.workspaceSearchCard());

 // Daily workspace: direct-entry app shortcuts make the home useful between updates.
 if(quick.length){
  d.push(this.sectionToolbar(recent.length?'继续使用':'常用程序','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
  for(var qi=0;qi<quick.length;qi++)d.push(this.workspaceQuickTile(quick[qi]));
 }
 if(stats.updates>0)d.push(this.compactInfo('有 '+stats.updates+' 个程序可以更新','进入更新中心逐项确认','hiker://page/ruleRepoUpdates?rule=&simple=true'));

 var state={keyword:'',view:view,category:cat,subCategory:'all',tag:'all',sort:sort,mode:'all'},filtered=this.applyFilters(items,state),sortLabel=sort==='default'?'默认排序':(sort==='updated'?'最近更新':(sort==='name'?'名称排序':'版本排序'));
 d.push(this.sectionLine());
 d.push(this.sectionToolbar('程序库 · '+filtered.length,'filter','hiker://page/ruleRepoCategory?rule=&simple=true'));

 // State and category are two explicit rows; both remain compact and independently understandable.
 d.push(this.workspaceStateChip('全部',stats.all,'all',view,'hc_repo_home_view'));
 d.push(this.workspaceStateChip('已安装',stats.installed,'installed',view,'hc_repo_home_view'));
 d.push(this.workspaceStateChip('可更新',stats.updates,'updates',view,'hc_repo_home_view'));
 d.push(this.workspaceStateChip('收藏',stats.favorites,'favorites',view,'hc_repo_home_view'));
 d.push({col_type:'blank_block',extra:{id:'rule-repo-workspace-break-state'}});
 var cats=this.categories(items);
 for(var ci=0;ci<cats.length;ci++)d.push(this.workspaceCategoryChip(cats[ci].name,cats[ci].id,cat,'hc_repo_home_category'));
 d.push({col_type:'blank_block',extra:{id:'rule-repo-workspace-break-category'}});

 var sortCode="(function(){var map={'默认排序':'default','最近更新':'updated','名称排序':'name','版本排序':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return 'hiker://empty';})()";
 d.push({title:sortLabel+' ▾',col_type:'scroll_button',url:this.selectRoute('排序方式',['默认排序','最近更新','名称排序','版本排序'],sortCode,2),extra:{lineVisible:false}});
 d.push({title:'同步目录',col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();r.clearPresenceCache&&r.clearPresenceCache();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),extra:{lineVisible:false}});

 for(var i=0;i<filtered.length;i++)this.pushWorkspaceProgram(d,filtered[i]);
 if(!filtered.length)this.pushEmpty(d,view==='updates'?'当前没有待更新程序':'这里暂时没有程序',view==='favorites'?'收藏后会显示在这里。':'可以切换分类或状态查看。');
 d.push(this.sectionLine());
 this.pushNav(d,'home');
 setResult(d);
};
})(HikerRuleRepo);
