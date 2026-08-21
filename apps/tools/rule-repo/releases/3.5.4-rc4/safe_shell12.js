/* 我的规则仓库 3.5.4-rc4 - Safe Workspace 12.0 real-device hotfix */
(function(R){
var previousHome=R.home,previousCategory=R.categoryPage,previousSearch=R.searchPage;
var previousCss=R.hybridBaseCss,previousScript=R.hybridCommonScript;
R.safeWorkspaceVersion='12.0.0';

R.hybridWebItem=function(html,id){
 return{title:'',url:this.hybridDataUrl(html),col_type:'x5_webview_single',desc:'list&&screen-100',extra:{id:'rule-repo-safe12-'+String(id||'page'),canBack:false,showProgress:false,jsLoadingInject:false,lineVisible:false}};
};

R.hybridBaseCss=function(){return previousCss.call(this)+[
 'html,body{max-width:100%;min-width:0;overflow-x:hidden;overscroll-behavior-x:none}body{position:relative;touch-action:pan-y}button{max-width:100%}.page,.tree-page{width:100%;max-width:100%;min-width:0;overflow-x:hidden}.page{padding-bottom:calc(82px + env(safe-area-inset-bottom))}.tree-page{padding-bottom:calc(66px + env(safe-area-inset-bottom))}',
 '.category-strip,.recent{max-width:100%;touch-action:pan-x}.section-head{max-width:100%;min-width:0;flex-wrap:wrap}.section-title{min-width:0}.tool,.tool-select{min-width:0}.program-list{width:100%;max-width:100%;min-width:0;overflow:hidden}.program{width:100%;max-width:100%;min-width:0;overflow:hidden}.program>*{min-width:0}.program-desc{max-width:100%}.tree,.tree-left,.tree-right{max-width:100%;min-width:0}',
 '.app-nav{position:fixed;left:0;right:0;bottom:0;z-index:40;height:calc(64px + env(safe-area-inset-bottom));padding:5px 3px env(safe-area-inset-bottom);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-items:stretch;background:rgba(255,255,255,.97);border-top:1px solid #E9ECF1;box-shadow:0 -5px 18px rgba(26,38,56,.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.app-nav-item{min-width:0;height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#656C75;font-size:11px;line-height:1}.app-nav-item img{width:25px;height:25px;object-fit:contain}.app-nav-item.active{color:#087BF0;font-weight:650}',
 '@media(prefers-color-scheme:dark){.app-nav{background:rgba(17,19,23,.97);border-color:#292D34}.app-nav-item{color:#A6ADB6}.app-nav-item.active{color:#67B3FF}}'
 ].join('');};

R.hybridCommonScript=function(){
 var source=previousScript.call(this).replace(/encodeURIComponent\(DATA\.ruleName\)/,'DATA.ruleName+"&simple=true"');
 return source+';window.addEventListener("scroll",function(){if(window.scrollX)window.scrollTo(0,window.scrollY)},{passive:true});';
};

R.hybridBottomNav=function(active){
 var nav=[['首页','home','home','ruleRepoHome'],['分类','category','category','ruleRepoCategory'],['搜索','search','search','ruleRepoSearch'],['更新','updates','updates','ruleRepoUpdates'],['设置','settings','settings','ruleRepoSettings']],out='<nav class="app-nav" aria-label="主导航">';
 for(var i=0;i<nav.length;i++){var x=nav[i],on=String(active)===x[1],icon=this.uiIconState(x[2],on);out+='<button class="app-nav-item '+(on?'active':'')+'" data-action="page" data-page="'+x[3]+'" data-title="'+x[0]+'"><img src="'+icon+'" alt=""><span>'+x[0]+'</span></button>';}
 return out+'</nav>';
};

R.hybridDocument=function(title,data,body,script){
 var active=title==='分类管理'?'category':(title==='搜索'?'search':'home');
 return'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><title>'+String(title||'我的规则仓库')+'</title><style>'+this.hybridBaseCss()+'</style></head><body>'+String(body||'')+this.hybridBottomNav(active)+'<script>var DATA='+this.hybridJson(data)+';'+this.hybridCommonScript()+String(script||'')+'<\/script></body></html>';
};

R.home=function(){
 if(!this.hybridCanWeb())return previousHome.call(this);
 setPageTitle(this.productTitle());var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));d.push(this.hybridWebItem(this.hybridHomeHtml(items),'home'));setResult(d);}catch(e){return previousHome.call(this);}
};

R.categoryPage=function(){
 if(!this.hybridCanWeb())return previousCategory.call(this);
 setPageTitle('分类管理');var d=[],items;try{items=this.items(false);d.push(this.hybridWebItem(this.hybridCategoryHtml(items),'category'));setResult(d);}catch(e){return previousCategory.call(this);}
};

R.searchPage=function(){
 if(!this.hybridCanWeb())return previousSearch.call(this);
 setPageTitle('搜索');var d=[],items;try{items=this.items(false);d.push(this.hybridWebItem(this.hybridSearchHtml(items),'search'));setResult(d);}catch(e){return previousSearch.call(this);}
};

R.aboutPage=function(){
 setPageTitle('关于');var d=[],repo=this.findById('rule-repo')||{},channel=this.isTestChannel()?'测试版':'正式版';d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://empty'));d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.quickAction('搜索','search','hiker://page/ruleRepoSearch?rule=&simple=true'));d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.quickAction('备份恢复','backup','hiker://page/ruleRepoSettings?rule=&simple=true'));d.push(this.sectionLine());d.push(this.sectionToolbar('版本与通道','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.infoPair('当前',String(this.version||'--')));d.push(this.infoPair('通道',channel));d.push(this.infoPair('正式',String(this.baseStableVersion||this.version||'--')));d.push(this.infoPair('界面','Safe Workspace 12.0'));d.push(this.compactInfo('运行信息','Build '+String(this.build||'--')+' · 固定五栏安全工作台 · Stable/Test 分层','hiker://empty'));d.push(this.compactInfo('产品原则','高频导航常驻 · 页面不横移 · 原生动作可达 · 异常可恢复','hiker://empty'));d.push(this.sectionLine());this.pushNav(d,'settings');setResult(d);
};

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.3',build:377,path:'apps/tools/rule-repo/rule_repo_remote_v353.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'实机验证稳定 · 日常使用与恢复入口',highlights:['首页状态工作台','程序状态与标签分层','安全同步与多镜像'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.4-rc4',baseVersion:'3.5.3',targetVersion:'3.5.4',build:381,path:'apps/tools/rule-repo/rule_repo_test_v127.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Safe Workspace 12.0 · 真机导航与跳转修复',highlights:['页面内固定五栏','横向溢出锁定','原生详情跳转修复','35/65 双栏分类树','Stable 恢复隔离'],icon:icon}
 ]};
};
})(HikerRuleRepo);
