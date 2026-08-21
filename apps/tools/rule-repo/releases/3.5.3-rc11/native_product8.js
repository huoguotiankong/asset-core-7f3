/* 我的规则仓库 3.5.3-rc11 - Native Product 8.0 reference-fidelity UI */
(function(R){
R.nativeProductVersion='8.0.0';

R.nativeHtml=function(value){
 return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

R.nativeVersionText=function(item){
 var s=this.cleanVersion(item&&item.version||'').replace(/^Stable\s*/i,'').replace(/\s*·.*$/,'').trim(),m=s.match(/(\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.]+)?)/);
 if(m)s=m[1].replace(/-b\d+$/i,'');
 if(s.length>18)s=s.slice(0,18)+'…';
 return s||'--';
};

R.nativeStatusMeta=function(item){
 var group=String(item&&item.entryType||'')==='channel-group',s=group?'版本中心':String(this.premiumStatusText?this.premiumStatusText(item):this.displayStatus(item));
 if(s==='可更新'||s==='有新版本')return{label:'可更新',color:'#F59E0B'};
 if(s==='已安装'||s==='已记录'||s==='已同步'||s==='已导入')return{label:s==='已安装'?'已安装':'已同步',color:'#22A06B'};
 if(group||s==='版本中心'||s==='多版本')return{label:'版本中心',color:'#1677FF'};
 return{label:'未安装',color:'#8A8F98'};
};

R.nativeStatusRich=function(item){
 var s=this.nativeStatusMeta(item);return'<font color="'+s.color+'"><b>'+this.nativeHtml(s.label)+'</b></font>';
};

R.nativeProgramSummary=function(item){
 if(String(item&&item.entryType||'')==='channel-group')return'正式 / 测试 / 本地统一管理 · 支持更新与恢复';
 var a=[String(item&&item.subCategory||item&&item.categoryName||'程序'),String(item&&item.mode||'')==='remote'?'远程代码':'本地代码'];
 if(this.isFav(item))a.push('已收藏');
 return a.join(' · ');
};

R.nativeProgramTags=function(item){
 var source=String(item&&item.entryType||'')==='channel-group'?[String(item.categoryName||'程序'),'管理','版本']:[String(item.categoryName||'程序')].concat(item.tags||[]),out=[],seen={};
 for(var i=0;i<source.length&&out.length<3;i++){var v=String(source[i]||'').trim();if(v&&!seen[v]){seen[v]=1;out.push(v);}}
 return out;
};

R.nativeProgramMetaRow=function(item){
 var tags=this.nativeProgramTags(item),bits=[];for(var i=0;i<tags.length;i++)bits.push('<font color="#1677FF">'+this.nativeHtml(tags[i])+'</font>');
 return{title:'　　　　'+bits.join('　')+'<br>　　　　<small><font color="#7A7F87">'+this.nativeHtml(this.nativeProgramSummary(item))+'</font></small>',col_type:'rich_text',extra:{textSize:13,lineSpacing:0,id:'rule-repo-native-meta-'+String(item.id||''),cls:'rule-repo-native-program-meta'}};
};

R.nativeProgramCard=function(item){
 var group=String(item&&item.entryType||'')==='channel-group',st=this.nativeStatusMeta(item),fav=this.isFav(item),detail='hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(String(item.id||'')),extra={lineVisible:false,pageTitle:String(item.name||'程序'),hc_repo_item_id:String(item.id||''),id:'rule-repo-native-card-'+String(item.id||''),cls:'rule-repo-native-program-card'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st.label==='可更新'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:String(item.name||'程序')+'  '+this.nativeVersionText(item),desc:this.nativeStatusRich(item),img:this.iconOf(item),pic_url:this.iconOf(item),url:detail,col_type:'avatar',extra:extra};
};

R.itemCard=function(item){return this.nativeProgramCard(item);};
R.pushProgram=function(d,item){d.push(this.nativeProgramCard(item));d.push(this.nativeProgramMetaRow(item));d.push(this.programLine());};

R.nativeMetricArt=function(value,color,active){
 var bg=active?color:'#F7F9FC',fg=active?'#FFFFFF':color,border=active?color:'#E5EAF1',svg='<svg xmlns="http://www.w3.org/2000/svg" width="112" height="84" viewBox="0 0 112 84"><rect x="2" y="2" width="108" height="80" rx="18" fill="'+bg+'" stroke="'+border+'" stroke-width="2"/><text x="56" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="'+fg+'">'+String(value||0)+'</text></svg>';
 return'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
};

R.metricCard=function(title,value,view,active,key){
 var on=String(active)===String(view),colors={all:'#1677FF',installed:'#22A06B',updates:'#F59E0B',favorites:'#E2558D'},color=colors[String(view)]||'#1677FF',img=this.nativeMetricArt(value,color,on);
 return{title:String(title||''),img:img,pic_url:img,col_type:'icon_small_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,id:'rule-repo-native-metric-'+String(view),cls:'rule-repo-native-metric'}};
};

R.nativeCategories=function(items){
 var count=this.categoryCounts(items),base=[['all','全部'],['video','视频'],['comic','漫画'],['cloud','网盘'],['tools','工具'],['aggregate','聚合']],out=[];
 for(var i=0;i<base.length;i++)out.push({id:base[i][0],name:base[i][1],count:base[i][0]==='all'?items.length:Number(count[base[i][0]]||0)});
 return out;
};

R.nativeCategoryTab=function(cat,active,key){
 var on=String(active)===String(cat.id),title=on?cat.name+' '+cat.count:cat.name;
 return{title:title,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);clearMyVar('hc_repo_home_sub');refreshPage(false);return'hiker://empty';},key,cat.id),extra:{lineVisible:false,id:'rule-repo-native-tab-'+String(cat.id)}};
};

R.nativeHomeItems=function(items,view,category,sub,sort){
 var state={keyword:'',view:'all',category:category,subCategory:sub,tag:'all',sort:sort,mode:'all'},a=this.applyFilters(items,state),self=this,favs=this.favIds();
 if(view==='installed')a=a.filter(function(x){return self.actualInstalled?self.actualInstalled(x):!!self.installedVersion(x);});
 else if(view==='updates')a=a.filter(function(x){return(self.actualStatus?self.actualStatus(x):self.statusOf(x))==='可更新';});
 else if(view==='favorites')a=a.filter(function(x){return favs.indexOf(String(x.id||''))>=0;});
 return a;
};

R.nativeTool=function(title,icon,url,id){var img=this.uiIcon(icon);return{title:String(title||''),img:img,pic_url:img,url:url||'hiker://empty',col_type:'icon_small_3',extra:{lineVisible:false,id:'rule-repo-native-tool-'+String(id||icon)}};};

R.nativeTransparentIcon=function(){return'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"></svg>');};

R.nativePaneCell=function(title,count,value,active,key,kind,category){
 var on=String(active)===String(value),icon=kind==='main'?this.uiIconState('category',on):this.uiIcon(kind==='group'?'category':'filter'),url;
 if(kind==='main'||kind==='group')url=$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);clearMyVar('hc_repo_sub');clearMyVar('hc_repo_tag');refreshPage(false);return'hiker://empty';},key,value);
 else url=$('#noLoading#').lazyRule(function(cat,sub){putMyVar('hc_repo_category',cat);putMyVar('hc_repo_sub',sub);putMyVar('hc_repo_home_category',cat);putMyVar('hc_repo_home_sub',sub);putMyVar('hc_repo_home_view','all');return'hiker://page/ruleRepoHome?rule=&simple=true';},category,value);
 return{title:(kind==='sub'?'　':'')+String(title||'')+'  '+String(count||0),img:icon,pic_url:icon,url:url,col_type:'icon_2',extra:{lineVisible:false,id:'rule-repo-native-pane-'+String(kind)+'-'+String(category||value)+'-'+String(value)}};
};

R.nativeEmptyPaneCell=function(id){var img=this.nativeTransparentIcon();return{title:' ',img:img,pic_url:img,url:'hiker://empty',col_type:'icon_2',extra:{lineVisible:false,id:'rule-repo-native-pane-empty-'+String(id)}};};

R.nativeCategoryTree=function(items,category){
 var cats=this.nativeCategories(items),out=[],self=this;
 function append(cat){if(cat.id==='all'||!cat.count)return;out.push({kind:'group',category:cat.id,id:cat.id,title:cat.name,count:cat.count});var subs=self.subCategories(items,cat.id);for(var j=1;j<subs.length;j++)out.push({kind:'sub',category:cat.id,id:subs[j].id,title:subs[j].name,count:subs[j].count});}
 if(category==='all'){for(var i=0;i<cats.length;i++)append(cats[i]);}
 else{for(var k=0;k<cats.length;k++)if(cats[k].id===category){append(cats[k]);break;}}
 return out;
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
 if(stats.updates>0)d.push(this.compactInfo('有 '+stats.updates+' 个程序可以更新','进入更新中心查看','hiker://page/ruleRepoUpdates?rule=&simple=true'));
 d.push(this.sectionLine());d.push(this.sectionToolbar('我的程序 · '+filtered.length,'search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 var sortCode="(function(){var map={'默认排序':'default','最近更新':'updated','名称排序':'name','版本排序':'version'};putMyVar('hc_repo_home_sort',map[String(input||'默认排序')]||'default');refreshPage(false);return 'hiker://empty';})()";
 d.push(this.nativeTool(sortLabel,'filter',this.selectRoute('排序方式',['默认排序','最近更新','名称排序','版本排序'],sortCode,2),'sort'));
 d.push(this.nativeTool('分类筛选','category','hiker://page/ruleRepoCategory?rule=&simple=true','category'));
 d.push(this.nativeTool('同步目录','sync',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();r.clearPresenceCache&&r.clearPresenceCache();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://云端目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败，已保留当前目录';}}),'sync'));
 for(var i=0;i<filtered.length;i++)this.pushProgram(d,filtered[i]);
 if(!filtered.length)this.pushEmpty(d,'没有匹配程序','切换状态、分类或在分类页重置筛选。');
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.categoryPage=function(){
 setPageTitle('分类管理');var d=[],items;
 try{items=this.items(false);}catch(e){setResult([{title:'暂时无法读取分类',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 var active=String(getMyVar('hc_repo_category','all')||'all'),cats=this.nativeCategories(items),tree=this.nativeCategoryTree(items,active),rows=Math.max(cats.length,tree.length);
 d.push(this.sectionToolbar('主分类　/　子分类','search','hiker://page/ruleRepoSearch?rule=&simple=true'));
 for(var i=0;i<rows;i++){
  if(i<cats.length)d.push(this.nativePaneCell(cats[i].name,cats[i].count,cats[i].id,active,'hc_repo_category','main',cats[i].id));else d.push(this.nativeEmptyPaneCell('left-'+i));
  if(i<tree.length)d.push(this.nativePaneCell(tree[i].title,tree[i].count,tree[i].id,active,'hc_repo_category',tree[i].kind,tree[i].category));else d.push(this.nativeEmptyPaneCell('right-'+i));
 }
 d.push(this.sectionLine());this.pushNav(d,'category');setResult(d);
};

R.nativeDetailTagRow=function(item){
 var tags=this.nativeProgramTags(item),bits=[];for(var i=0;i<tags.length;i++)bits.push('<font color="#1677FF">'+this.nativeHtml(tags[i])+'</font>');
 return{title:bits.join('　'),col_type:'rich_text',extra:{textSize:13,lineSpacing:0,id:'rule-repo-native-detail-tags-'+String(item.id||'')}};
};

R.detailPage=function(){
 var params=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},id=String(params.hc_repo_item_id||getParam('id')||''),item=this.findById(id,false),d=[];
 if(!item){setResult([{title:'这个程序暂时不可用',desc:'云端目录可能已经更新，请返回首页重新同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 if(item.entryType==='channel-group'||item.channelsPath)return this.channelPage(item);
 setPageTitle(item.name);try{setPagePicUrl(this.iconOf(item));}catch(e){}
 this.clearPresenceCache&&this.clearPresenceCache();var st=this.nativeStatusMeta(item),lastImport=this.lastImportedTime(item),lastOpen=this.lastOpenedTime?this.lastOpenedTime(item):0,localVersion=this.installedVersion(item)||'未记录',size=item.bytes?Math.max(1,Math.round(Number(item.bytes)/1024))+' KB':'轻量规则';
 d.push(this.hero(item.name,this.nativeVersionText(item)+' · '+st.label+' · '+String(item.categoryName||'程序'),this.iconOf(item),'hiker://empty'));
 d.push(this.infoRow('云端版本',this.nativeVersionText(item)));d.push(this.infoRow('本地版本',localVersion));d.push(this.infoRow('大小',size));d.push(this.infoRow('类型',item.mode==='remote'?'远程代码程序':'本地代码程序'));d.push(this.infoRow('更新时间',item.updatedAt||'--'));
 d.push(this.nativeDetailTagRow(item));d.push(this.compactInfo('程序说明',String(item.desc||this.nativeProgramSummary(item)),'hiker://empty'));
 d.push(this.sectionLine());d.push(this.primaryAction('打开程序',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)));d.push(this.secondaryAction(st.label==='可更新'?'更新到最新版':'导入 / 覆盖',$('#noLoading#').lazyRule(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))));
 d.push(this.sectionLine());
 d.push(this.quickAction5(this.isFav(item)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)));
 d.push(this.quickAction5('检查更新','updates',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id,true);if(!x)return'toast://程序不存在';r.clearPresenceCache&&r.clearPresenceCache();return'toast://'+r.nativeStatusMeta(x).label+' · 云端 '+r.nativeVersionText(x);},item.id)));
 d.push(this.quickAction5('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));
 d.push(this.quickAction5('备份','backup',$('#noLoading#').lazyRule(function(){var r=$.require('hiker://page/ruleRepoCore');return'copy://'+r.exportState();})));
 var moreCode="(function(){var r=$.require('hiker://page/ruleRepoCore'),v=String(input||''),id="+JSON.stringify(item.id)+";if(v==='设置')return 'hiker://page/ruleRepoSettings?rule=&simple=true';if(v==='清除版本记录'){r.removeInstalled(id);refreshPage(false);return 'toast://已清除仓库版本记录';}return 'hiker://empty';})()";d.push(this.quickAction5('更多','more',this.selectRoute('更多操作',['设置','清除版本记录'],moreCode,2)));
 if(lastImport||lastOpen){var recent=[];if(lastImport)recent.push('导入 '+this.formatShortTime(lastImport));if(lastOpen)recent.push('打开 '+this.formatShortTime(lastOpen));d.push(this.compactInfo('最近使用',recent.join(' · '),'hiker://page/ruleRepoHistory?rule=&simple=true'));}
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.nativeChannelCard=function(parent,c,current){
 var ch=String(c.channel||''),label=ch==='stable'?'正式版':(ch==='test'?'测试版':(ch==='local'?'本地版':'版本')),raw=this.channelInstallRaw(parent,c),color=current?'#22A06B':(ch==='stable'?'#1677FF':(ch==='test'?'#F59E0B':'#8D68F8')),status=current?'当前运行':(ch==='stable'?'稳定推荐':(ch==='test'?'抢先体验':'独立安装'));
 return{title:label+'  '+String(c.version||'--'),desc:'<font color="'+color+'"><b>'+status+'</b></font>',img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'avatar',extra:{lineVisible:false,id:'rule-repo-native-channel-'+ch,cls:'rule-repo-native-channel'}};
};

R.channelProductCard=function(parent,c,current){return this.nativeChannelCard(parent,c,current);};
R.pushChannelBlock=function(d,parent,c,current){
 d.push(this.nativeChannelCard(parent,c,current));var hl=Array.isArray(c.highlights)?c.highlights.slice(0,3):[],bits=[];for(var i=0;i<hl.length;i++)bits.push('<font color="#1677FF">'+this.nativeHtml(hl[i])+'</font>');
 d.push({title:'　　　　'+bits.join('　')+'<br>　　　　<small><font color="#7A7F87">点击整行即可导入或切换此版本</font></small>',col_type:'rich_text',extra:{textSize:13,lineSpacing:0,id:'rule-repo-native-channel-meta-'+String(c.channel||'')}});d.push(this.programLine());
};

R.channelPage=function(parent){
 setPageTitle(parent.name);var d=[],meta=this.channelMeta(parent),cs,i,stable=null,test=null,local=null;
 if(!meta){setResult([{title:'版本信息暂时不可用',desc:'请稍后重试，或返回首页执行一次同步。',url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 try{setPagePicUrl(this.iconOf(parent));}catch(e){}
 cs=meta.channels||[];for(i=0;i<cs.length;i++){if(cs[i].channel==='stable')stable=cs[i];else if(cs[i].channel==='test')test=cs[i];else if(cs[i].channel==='local')local=cs[i];}
 var selfRepo=String(parent.id||'')==='rule-repo',coexist=selfRepo||!!(parent.raw&&parent.raw.allowCoexist),currentChannel=selfRepo?(this.isTestChannel()?'test':'stable'):'',openName=selfRepo&&this.isTestChannel()?'我的规则仓库·测试版':String(parent.name||'');
 d.push(this.hero(parent.name,'正式 / 测试 / 本地统一版本中心',this.iconOf(parent),'hiker://empty'));
 d.push(this.infoRow('当前版本',selfRepo?(this.isTestChannel()?'测试版 '+this.version:'正式版 '+this.version):'请选择下方版本'));
 if(stable)d.push(this.infoRow('正式版本',String(stable.version||'--')));if(test)d.push(this.infoRow('测试版本',String(test.version||'--')));d.push(this.infoRow('本地版本',local?String(local.version||'有'):'暂无'));
 d.push(this.sectionLine());d.push(this.primaryAction('打开程序','hiker://home@'+openName+'||hiker://home'));d.push(this.secondaryAction('检查版本',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://版本信息已更新':'toast://当前已是最新';}catch(e){hideLoading();return'toast://同步失败';}})));
 d.push(this.sectionLine());d.push(this.sectionToolbar('可用版本 · '+cs.length,'updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));
 if(stable)this.pushChannelBlock(d,parent,stable,currentChannel==='stable');if(test)this.pushChannelBlock(d,parent,test,currentChannel==='test');if(local)this.pushChannelBlock(d,parent,local,currentChannel==='local');
 d.push(this.sectionLine());
 d.push(this.quickAction5(this.isFav(parent)?'已收藏':'收藏','favorite',$('#noLoading#').lazyRule(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},parent.id)));
 d.push(this.quickAction5('同步','sync',$('#noLoading#').lazyRule(function(){showLoading('正在同步…');try{var r=$.require('hiker://page/ruleRepoCore'),x=r.syncManifest();hideLoading();if(!x.ok)return'toast://同步失败，已保留当前目录';refreshPage(false);return x.fresh?'toast://目录已更新':'toast://当前已是最新目录';}catch(e){hideLoading();return'toast://同步失败';}})));
 d.push(this.quickAction5('活动记录','history','hiker://page/ruleRepoHistory?rule=&simple=true'));d.push(this.quickAction5('设置','settings','hiker://page/ruleRepoSettings?rule=&simple=true'));d.push(this.quickAction5('返回仓库','home','hiker://page/ruleRepoHome?rule=&simple=true'));
 d.push(this.sectionLine());if(coexist)d.push(this.compactInfo('版本关系','正式版与测试版可同时保留；测试异常时从正式版重新导入即可恢复。','hiker://empty'));else if(local)d.push(this.compactInfo('版本关系','正式版与测试版同名覆盖；本地版独立命名，可与远程版并存。','hiker://empty'));else d.push(this.compactInfo('版本关系','正式版与测试版同名覆盖；测试异常时重新导入正式版即可恢复。','hiker://empty'));
 d.push(this.sectionLine());this.pushNav(d,'home');setResult(d);
};

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.2',build:364,path:'apps/tools/rule-repo/rule_repo_remote_v352.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'已验证稳定 · 日常使用与恢复入口',highlights:['稳定日常使用','安全同步与多镜像'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.3-rc11',baseVersion:'3.5.2',targetVersion:'3.5.3',build:376,path:'apps/tools/rule-repo/rule_repo_test_v123.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Native Product 8.0 · 参考图关键视觉关系重建',highlights:['动态统计卡','状态右标与标签层','双栏分类树','紧凑版本详情'],icon:icon}
 ]};
};
})(HikerRuleRepo);
