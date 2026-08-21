/* 我的规则仓库 3.5.4-rc3 - Hybrid Workspace 11.0 fixed navigation shell */
(function(R){
var fallbackHome=R.home,fallbackCategory=R.categoryPage,fallbackSearch=R.searchPage;
R.hybridWorkspaceVersion='11.0.0';

R.hybridCanWeb=function(){
 try{var a=getColTypes();return !Array.isArray(a)||a.indexOf('x5_webview_single')>=0;}catch(e){return true;}
};

R.hybridRuleName=function(){
 try{var x=getRule();if(x&&x.title)return String(x.title);}catch(e){}
 try{if(typeof MY_RULE==='object'&&MY_RULE&&MY_RULE.title)return String(MY_RULE.title);}catch(e2){}
 return this.isTestChannel()?'我的规则仓库·测试版':'我的规则仓库';
};

R.hybridJson=function(value){
 return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
};

R.hybridDataUrl=function(html){
 return'data:text/html;base64,'+base64Encode(String(html||''));
};

R.hybridWebItem=function(html,id){
 return{title:'',url:this.hybridDataUrl(html),col_type:'x5_webview_single',desc:'float&&top',extra:{id:'rule-repo-hybrid11-'+String(id||'page'),canBack:false,showProgress:false,jsLoadingInject:false,lineVisible:false}};
};

R.hybridProgramData=function(item,index){
 var st=this.nativeStatusMeta(item),tags=(item.tags||[]).slice(0,3),installed=this.actualInstalled?this.actualInstalled(item):!!this.installedVersion(item),label=String(st.label||'未安装');
 return{
  id:String(item.id||''),name:String(item.name||'未命名程序'),version:this.nativeVersionText(item),status:label,statusColor:String(st.color||'#7A7F87'),
  installed:!!installed,update:label==='可更新',favorite:!!this.isFav(item),channel:item.entryType==='channel-group'||!!item.channelsPath,
  category:String(item.category||'other'),categoryName:String(item.categoryName||'程序'),subCategory:String(item.subCategory||''),mode:String(item.mode||''),
  tags:tags.map(function(x){return String(x);}),desc:String(item.desc||this.nativeProgramSummary(item)||''),icon:String(this.iconOf(item)||''),updatedAt:String(item.updatedAt||''),order:Number(index||0),
  search:[item.name,item.version,item.desc,item.categoryName,item.subCategory,(item.tags||[]).join(' ')].join(' ').toLowerCase()
 };
};

R.hybridPrograms=function(items){
 var out=[];for(var i=0;i<items.length;i++)out.push(this.hybridProgramData(items[i],i));return out;
};

R.hybridBaseCss=function(){return[
 '*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#20242A;background:#FFF}button,input,select{font:inherit}button{border:0;background:none;color:inherit}img{display:block}.page{min-height:100%;padding:10px 12px 24px}.muted{color:#8A9099}.blue{color:#1685F8}.hairline{height:1px;background:#EEF0F3}.shadow{box-shadow:0 4px 14px rgba(24,92,170,.08)}',
 '.hero{display:grid;grid-template-columns:58px minmax(0,1fr) 36px;gap:12px;align-items:center;padding:4px 0 10px}.hero-icon{width:58px;height:58px;border-radius:15px;object-fit:cover;background:#EDF4FF}.hero-title{font-size:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hero-sub{font-size:13px;color:#747B85;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.icon-btn{width:36px;height:36px;border-radius:18px;background:#F4F6F8;font-size:22px;display:flex;align-items:center;justify-content:center}',
 '.category-strip{display:flex;gap:7px;overflow-x:auto;padding:6px 0 10px;background:#FFF;position:sticky;top:0;z-index:5;scrollbar-width:none}.category-strip::-webkit-scrollbar{display:none}.chip{flex:0 0 auto;padding:7px 13px;border-radius:10px;background:#F5F6F8;color:#333;font-size:14px;white-space:nowrap}.chip.active{background:#E5F0FF;color:#087BF0;font-weight:650}',
 '.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:2px 0 14px}.metric{padding:10px 3px 9px;border:1px solid #EDF0F4;border-radius:12px;background:#FFF;text-align:center}.metric.active{border-color:#A9D2FF;background:#F4F9FF}.metric-num{font-size:26px;line-height:1.05;font-weight:720;color:#252A30}.metric.active .metric-num{color:#087BF0}.metric-name{font-size:12px;color:#68707A;margin-top:6px}',
 '.section-head{display:flex;align-items:center;gap:8px;margin:10px 0 7px}.section-title{font-size:17px;font-weight:700;flex:1}.section-count{font-size:12px;color:#90959D}.tool{padding:7px 9px;border-radius:9px;background:#F5F6F8;font-size:12px;color:#59616B}.tool-select{border:0;outline:0;background:#F5F6F8;border-radius:9px;padding:7px 22px 7px 9px;color:#59616B;font-size:12px}',
 '.recent{display:flex;gap:12px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.recent::-webkit-scrollbar{display:none}.recent-item{min-width:62px;text-align:center}.recent-item img{width:42px;height:42px;border-radius:11px;margin:0 auto 5px;object-fit:cover;background:#F1F3F5}.recent-item span{display:block;max-width:70px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
 '.program-list{border-top:1px solid #EEF0F3}.program{display:grid;grid-template-columns:46px minmax(0,1fr) auto;column-gap:10px;padding:12px 0;border-bottom:1px solid #EEF0F3;align-items:start}.program-icon{width:46px;height:46px;border-radius:12px;object-fit:cover;background:#F2F4F7}.program-main{min-width:0}.program-name{font-size:16px;line-height:22px;font-weight:620;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.program-version{font-size:13px;color:#818791;font-weight:400;margin-left:5px}.program-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:7px}.tag{font-size:12px;color:#1685F8}.program-desc{font-size:11px;color:#8C929A;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.status{font-size:12px;padding:3px 0 3px 8px;white-space:nowrap}.empty{padding:54px 12px;text-align:center;color:#8A9099;font-size:14px}',
 '.search-box{display:grid;grid-template-columns:minmax(0,1fr) 58px;gap:8px;margin:4px 0 10px}.search-input{width:100%;height:44px;border:1.5px solid #25282D;border-radius:12px;padding:0 13px;outline:0;font-size:16px}.search-go{height:44px;border-radius:12px;background:#1685F8;color:#FFF;font-weight:650}.scope-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.scope{padding:9px 3px;border-radius:10px;background:#F5F6F8;font-size:12px;text-align:center}.scope.active{background:#E5F0FF;color:#087BF0;font-weight:650}.tag-grid{display:flex;gap:8px;flex-wrap:wrap;padding:4px 0 10px}.tag-button{padding:8px 12px;border-radius:10px;background:#F5F6F8;color:#59616B;font-size:13px}',
 '.tree-page{height:100%;display:flex;flex-direction:column;overflow:hidden;background:#FFF}.tree-top{display:flex;align-items:center;gap:10px;padding:10px 12px 12px}.tree-summary{flex:1;font-size:14px;color:#7C838D}.tree-search{width:38px;height:38px;border-radius:19px;background:#F4F6F8;font-size:22px}.tree{flex:1;min-height:0;display:grid;grid-template-columns:35% 65%;border-top:1px solid #ECEFF3}.tree-left{overflow-y:auto;background:#F6F8FA;padding:6px}.main-cat{display:flex;width:100%;align-items:center;justify-content:space-between;text-align:left;padding:13px 9px;border-radius:10px;margin:2px 0;font-size:14px}.main-cat.active{background:#E3EFFF;color:#087BF0;font-weight:650}.cat-count{font-size:11px;color:#969CA4}.main-cat.active .cat-count{color:#1685F8}.tree-right{overflow-y:auto;padding:8px 12px 18px}.group-title{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:700;padding:10px 4px 8px}.sub-row{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 6px;border-bottom:1px solid #F0F2F5;text-align:left;font-size:14px}.sub-count{font-size:12px;color:#949AA2}.sub-arrow{color:#A4A9B0;margin-left:8px}',
 '@media(prefers-color-scheme:dark){html,body,.page,.category-strip,.tree-page{background:#111317;color:#F0F2F5}.chip,.tool,.tool-select,.icon-btn,.scope,.tag-button{background:#22262C;color:#D7DADE}.chip.active,.scope.active,.metric.active,.main-cat.active{background:#16375D;color:#67B3FF}.metric{background:#171A1F;border-color:#292D34}.metric-num{color:#F0F2F5}.program,.program-list,.hairline,.tree,.sub-row{border-color:#292D34}.tree-left{background:#181B20}.hero-sub,.muted,.program-version,.program-desc,.metric-name,.tree-summary{color:#9CA3AD}}'
 ].join('');};

R.hybridCommonScript=function(){return[
 'function B(){return typeof fba!=="undefined"?fba:(typeof fy_bridge_app!=="undefined"?fy_bridge_app:null)}',
 'function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&#39;")}',
 'function save(k,v){try{var b=B();if(b)b.putVar(k,String(v))}catch(e){}}',
 'function openPage(path,title,extra){try{var b=B();if(!b)return;extra=extra||{};var url="hiker://page/"+path+"?rule="+encodeURIComponent(DATA.ruleName);if(extra.id)url+="&id="+encodeURIComponent(extra.id);b.open(JSON.stringify({rule:DATA.ruleName,title:title||"我的规则仓库",url:url,group:"",col_type:"",findRule:"",preRule:"",extra:extra}))}catch(e){}}',
 'function actionEl(node){while(node&&node!==document.body){if(node.getAttribute&&node.getAttribute("data-action"))return node;node=node.parentNode}return null}',
 'function statusClass(p){if(p.channel)return"version";if(p.update)return"update";if(p.installed)return"installed";return"uninstalled"}',
 'function cardHtml(p){var tags=(p.tags||[]).map(function(x){return"<span class=\\"tag\\">"+esc(x)+"</span>"}).join("");var color=p.update?"#F59E0B":(p.installed?"#16A36A":(p.channel?"#1685F8":"#858B94"));return "<button class=\\"program\\" data-action=\\"program\\" data-id=\\""+esc(p.id)+"\\"><img class=\\"program-icon\\" src=\\""+esc(p.icon)+"\\"><span class=\\"program-main\\"><span class=\\"program-name\\">"+esc(p.name)+"<span class=\\"program-version\\">"+esc(p.version)+"</span></span><span class=\\"program-tags\\">"+tags+"</span><span class=\\"program-desc\\">"+esc(p.desc)+"</span></span><span class=\\"status\\" style=\\"color:"+color+"\\">"+esc(p.status)+"</span></button>"}',
 'document.addEventListener("click",function(e){var el=actionEl(e.target);if(!el)return;var a=el.getAttribute("data-action"),id=el.getAttribute("data-id")||"";if(a==="program"){var p=DATA.programs.filter(function(x){return x.id===id})[0];if(p)openPage("ruleRepoDetail",p.name,{id:p.id,hc_repo_item_id:p.id})}else if(a==="page"){openPage(el.getAttribute("data-page"),el.getAttribute("data-title")||"我的规则仓库",{})}});'
 ].join(';');};

R.hybridDocument=function(title,data,body,script){
 return'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>'+String(title||'我的规则仓库')+'</title><style>'+this.hybridBaseCss()+'</style></head><body>'+String(body||'')+'<script>var DATA='+this.hybridJson(data)+';'+this.hybridCommonScript()+String(script||'')+'<\/script></body></html>';
};

R.hybridHomeHtml=function(items){
 var stats=this.stats(items),cats=this.nativeCategories(items),programs=this.hybridPrograms(items),recentRaw=this.recentItems?this.recentItems(items,4):[],recent=[];
 for(var r=0;r<recentRaw.length;r++)recent.push(this.hybridProgramData(recentRaw[r],r));
 var initialCat=String(getVar('hc_repo_hybrid_category',getMyVar('hc_repo_home_category','all'))||'all'),initialSub=String(getVar('hc_repo_hybrid_sub',getMyVar('hc_repo_home_sub','all'))||'all'),initialScope=String(getVar('hc_repo_hybrid_scope',getMyVar('hc_repo_home_view','all'))||'all');
 var valid=false;for(var c=0;c<cats.length;c++)if(String(cats[c].id)===initialCat)valid=true;if(!valid){initialCat='all';initialSub='all';}
 var data={ruleName:this.hybridRuleName(),icon:String((this.findById('rule-repo')||{}).icon||this.uiIcon('home')),stats:stats,categories:cats,programs:programs,recent:recent,initialCategory:initialCat,initialSub:initialSub,initialScope:initialScope};
 var body='<main class="page"><section class="hero"><img class="hero-icon" src="'+String(data.icon)+'"><div><div class="hero-title">我的规则仓库</div><div class="hero-sub">海阔视界专属 · 规则管理中心</div></div><button class="icon-btn" data-action="page" data-page="ruleRepoSearch" data-title="搜索">⌕</button></section><div id="cats" class="category-strip"></div><section id="metrics" class="metrics"></section><section id="recentWrap"></section><section class="section-head"><div class="section-title">我的程序</div><span id="programCount" class="section-count"></span><select id="sort" class="tool-select"><option value="default">默认排序</option><option value="updated">最近更新</option><option value="name">名称排序</option><option value="version">版本排序</option></select><button class="tool" data-action="page" data-page="ruleRepoCategory" data-title="分类管理">分类</button><button class="tool" data-action="page" data-page="ruleRepoUpdate" data-title="版本更新">同步</button></section><div id="programs" class="program-list"></div></main>';
 var script=[
  ';var state={category:DATA.initialCategory||"all",sub:DATA.initialSub||"all",scope:DATA.initialScope||"all",sort:"default"};',
  'function renderCats(){document.getElementById("cats").innerHTML=DATA.categories.map(function(c){return"<button class=\\"chip "+(state.category===String(c.id)?"active":"")+"\\" data-cat=\\""+esc(c.id)+"\\">"+esc(c.name)+(state.category===String(c.id)?" "+esc(c.count):"")+"</button>"}).join("")}',
  'function metricCount(k){if(k==="all")return DATA.stats.all||0;if(k==="installed")return DATA.stats.installed||0;if(k==="updates")return DATA.stats.updates||0;return DATA.stats.favorites||0}',
  'function renderMetrics(){var a=[["全部","all"],["已安装","installed"],["可更新","updates"],["收藏","favorites"]];document.getElementById("metrics").innerHTML=a.map(function(x){return"<button class=\\"metric "+(state.scope===x[1]?"active":"")+"\\" data-scope=\\""+x[1]+"\\"><div class=\\"metric-num\\">"+metricCount(x[1])+"</div><div class=\\"metric-name\\">"+x[0]+"</div></button>"}).join("")}',
  'function visible(p){if(state.category!=="all"&&p.category!==state.category)return false;if(state.sub!=="all"&&p.subCategory!==state.sub)return false;if(state.scope==="installed"&&!p.installed)return false;if(state.scope==="updates"&&!p.update)return false;if(state.scope==="favorites"&&!p.favorite)return false;return true}',
  'function renderPrograms(){var a=DATA.programs.filter(visible).slice();if(state.sort==="updated")a.sort(function(x,y){return String(y.updatedAt).localeCompare(String(x.updatedAt))});else if(state.sort==="name")a.sort(function(x,y){return x.name.localeCompare(y.name)});else if(state.sort==="version")a.sort(function(x,y){return String(y.version).localeCompare(String(x.version))});document.getElementById("programCount").textContent=a.length+" 个";document.getElementById("programs").innerHTML=a.length?a.map(cardHtml).join(""):"<div class=\\"empty\\">没有匹配程序，换一个分类或状态试试</div>"}',
  'function renderRecent(){var w=document.getElementById("recentWrap");if(!DATA.recent.length){w.innerHTML="";return}w.innerHTML="<div class=\\"section-head\\"><div class=\\"section-title\\">继续使用</div><span class=\\"section-count\\">最近打开</span></div><div class=\\"recent\\">"+DATA.recent.map(function(p){return"<button class=\\"recent-item\\" data-action=\\"program\\" data-id=\\""+esc(p.id)+"\\"><img src=\\""+esc(p.icon)+"\\"><span>"+esc(p.name)+"</span></button>"}).join("")+"</div>"}',
  'document.getElementById("cats").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-cat"))el=el.parentNode;if(!el||el===this)return;state.category=el.getAttribute("data-cat");state.sub="all";save("hc_repo_hybrid_category",state.category);save("hc_repo_hybrid_sub","all");renderCats();renderPrograms()});',
  'document.getElementById("metrics").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-scope"))el=el.parentNode;if(!el||el===this)return;state.scope=el.getAttribute("data-scope");save("hc_repo_hybrid_scope",state.scope);renderMetrics();renderPrograms()});',
  'document.getElementById("sort").addEventListener("change",function(){state.sort=this.value;renderPrograms()});renderCats();renderMetrics();renderRecent();renderPrograms();'
 ].join('');
 return this.hybridDocument('我的规则仓库',data,body,script);
};

R.hybridCategoryHtml=function(items){
 var cats=this.nativeCategories(items),groups=[],programs=this.hybridPrograms(items),active=String(getVar('hc_repo_hybrid_category',getMyVar('hc_repo_category','all'))||'all');
 for(var i=0;i<cats.length;i++){var c=cats[i],subs=[];if(String(c.id)!=='all'){var raw=this.subCategories(items,String(c.id));for(var s=0;s<raw.length;s++)subs.push({id:String(raw[s].id||'all'),name:String(raw[s].id||'all')==='all'?'全部'+String(c.name):String(raw[s].name||'子分类'),count:Number(raw[s].count||0)});}groups.push({id:String(c.id),name:String(c.name),count:Number(c.count||0),subs:subs});}
 var data={ruleName:this.hybridRuleName(),programs:programs,groups:groups,active:active,total:items.length};
 var body='<main class="tree-page"><section class="tree-top"><div class="tree-summary">分类目录 · '+items.length+' 个程序</div><button class="tree-search" data-action="page" data-page="ruleRepoSearch" data-title="搜索">⌕</button></section><section class="tree"><nav id="mainCats" class="tree-left"></nav><div id="subCats" class="tree-right"></div></section></main>';
 var script=[
  ';var active=DATA.groups.some(function(x){return x.id===DATA.active})?DATA.active:"all";',
  'function renderLeft(){document.getElementById("mainCats").innerHTML=DATA.groups.map(function(g){return"<button class=\\"main-cat "+(active===g.id?"active":"")+"\\" data-main=\\""+esc(g.id)+"\\"><span>"+esc(g.name)+"</span><span class=\\"cat-count\\">"+g.count+"</span></button>"}).join("")}',
  'function subRows(g){var rows="<button class=\\"sub-row\\" data-choose-cat=\\""+esc(g.id)+"\\" data-choose-sub=\\"all\\"><span>全部"+esc(g.name)+"</span><span><span class=\\"sub-count\\">"+g.count+"</span><span class=\\"sub-arrow\\">›</span></span></button>";rows+=g.subs.filter(function(s){return s.id!=="all"}).map(function(s){return"<button class=\\"sub-row\\" data-choose-cat=\\""+esc(g.id)+"\\" data-choose-sub=\\""+esc(s.id)+"\\"><span>"+esc(s.name)+"</span><span><span class=\\"sub-count\\">"+s.count+"</span><span class=\\"sub-arrow\\">›</span></span></button>"}).join("");return rows}',
  'function groupHtml(g){return"<section><div class=\\"group-title\\"><span>"+esc(g.name)+"</span><span class=\\"sub-count\\">"+g.count+" 个</span></div>"+subRows(g)+"</section>"}',
  'function renderRight(){var el=document.getElementById("subCats");if(active==="all"){var all="<button class=\\"sub-row\\" data-choose-cat=\\"all\\" data-choose-sub=\\"all\\"><span>全部程序</span><span><span class=\\"sub-count\\">"+DATA.total+"</span><span class=\\"sub-arrow\\">›</span></span></button>";el.innerHTML=all+DATA.groups.filter(function(g){return g.id!=="all"}).map(groupHtml).join("")}else{var g=DATA.groups.filter(function(x){return x.id===active})[0];el.innerHTML=g?groupHtml(g):"<div class=\\"empty\\">暂无子分类</div>"}}',
  'document.getElementById("mainCats").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-main"))el=el.parentNode;if(!el||el===this)return;active=el.getAttribute("data-main");save("hc_repo_hybrid_category",active);save("hc_repo_hybrid_sub","all");renderLeft();renderRight()});',
  'document.getElementById("subCats").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-choose-cat"))el=el.parentNode;if(!el||el===this)return;var c=el.getAttribute("data-choose-cat"),s=el.getAttribute("data-choose-sub")||"all";save("hc_repo_hybrid_category",c);save("hc_repo_hybrid_sub",s);openPage("ruleRepoHome","我的规则仓库",{})});renderLeft();renderRight();'
 ].join('');
 return this.hybridDocument('分类管理',data,body,script);
};

R.hybridSearchHtml=function(items){
 var stats=this.stats(items),programs=this.hybridPrograms(items),hist=this.searchHistory?this.searchHistory().slice(0,6):[],tagsRaw=this.popularTags(items,8),tags=[],raw=String(getParam('kw','')||getParam('s','')||''),kw=this.safeDecodeKeyword(raw)||String(getVar('hc_repo_hybrid_search','')||'');
 for(var i=0;i<tagsRaw.length;i++)tags.push(String(tagsRaw[i].name||''));
 var data={ruleName:this.hybridRuleName(),programs:programs,stats:stats,history:hist,tags:tags,query:kw};
 var body='<main class="page"><section class="search-box"><input id="searchInput" class="search-input" type="search" placeholder="搜索名称、功能、标签或版本"><button id="searchGo" class="search-go">搜索</button></section><section id="scopes" class="scope-row"></section><section id="discover"></section><section class="section-head"><div id="searchTitle" class="section-title">搜索结果</div><span id="searchCount" class="section-count"></span></section><div id="searchPrograms" class="program-list"></div></main>';
 var script=[
  ';var state={query:DATA.query||"",scope:"all"};var input=document.getElementById("searchInput");input.value=state.query;',
  'function metricCount(k){if(k==="all")return DATA.stats.all||0;if(k==="installed")return DATA.stats.installed||0;if(k==="updates")return DATA.stats.updates||0;return DATA.stats.favorites||0}',
  'function renderScopes(){var a=[["全部","all"],["已安装","installed"],["可更新","updates"],["收藏","favorites"]];document.getElementById("scopes").innerHTML=a.map(function(x){return"<button class=\\"scope "+(state.scope===x[1]?"active":"")+"\\" data-scope=\\""+x[1]+"\\">"+x[0]+" "+metricCount(x[1])+"</button>"}).join("")}',
  'function match(p){if(state.scope==="installed"&&!p.installed)return false;if(state.scope==="updates"&&!p.update)return false;if(state.scope==="favorites"&&!p.favorite)return false;var q=state.query.trim().toLowerCase();return!q||p.search.indexOf(q)>=0}',
  'function renderDiscover(){var el=document.getElementById("discover");if(state.query){el.innerHTML="";return}var h=DATA.history.map(function(x){return"<button class=\\"tag-button\\" data-query=\\""+esc(x)+"\\">"+esc(x)+"</button>"}).join("");var t=DATA.tags.map(function(x){return"<button class=\\"tag-button\\" data-query=\\""+esc(x)+"\\">#"+esc(x)+"</button>"}).join("");el.innerHTML=(h?"<div class=\\"section-head\\"><div class=\\"section-title\\">最近搜索</div></div><div class=\\"tag-grid\\">"+h+"</div>":"")+(t?"<div class=\\"section-head\\"><div class=\\"section-title\\">热门标签</div></div><div class=\\"tag-grid\\">"+t+"</div>":"")}',
  'function renderResults(){var a=DATA.programs.filter(match);document.getElementById("searchTitle").textContent=state.query?"搜索结果":"全部程序";document.getElementById("searchCount").textContent=a.length+" 个";document.getElementById("searchPrograms").innerHTML=a.length?a.map(cardHtml).join(""):"<div class=\\"empty\\">没有找到相关程序，换个关键词试试</div>";renderDiscover()}',
  'function apply(){state.query=input.value||"";save("hc_repo_hybrid_search",state.query);renderResults()}document.getElementById("searchGo").addEventListener("click",apply);input.addEventListener("input",apply);input.addEventListener("keydown",function(e){if(e.key==="Enter")apply()});',
  'document.getElementById("scopes").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-scope"))el=el.parentNode;if(!el||el===this)return;state.scope=el.getAttribute("data-scope");renderScopes();renderResults()});',
  'document.getElementById("discover").addEventListener("click",function(e){var el=e.target;while(el&&el!==this&&!el.getAttribute("data-query"))el=el.parentNode;if(!el||el===this)return;input.value=el.getAttribute("data-query");apply()});renderScopes();renderResults();'
 ].join('');
 return this.hybridDocument('搜索',data,body,script);
};

R.home=function(){
 if(!this.hybridCanWeb())return fallbackHome.call(this);
 setPageTitle(this.productTitle());var d=[],m,items;try{m=this.manifest(false);items=(m.items||[]).map(this.normalizeItem.bind(this));var html=this.hybridHomeHtml(items);d.push(this.hybridWebItem(html,'home'));this.pushNav(d,'home');setResult(d);}catch(e){return fallbackHome.call(this);}
};

R.categoryPage=function(){
 if(!this.hybridCanWeb())return fallbackCategory.call(this);
 setPageTitle('分类管理');var d=[],items;try{items=this.items(false);d.push(this.hybridWebItem(this.hybridCategoryHtml(items),'category'));this.pushNav(d,'category');setResult(d);}catch(e){return fallbackCategory.call(this);}
};

R.searchPage=function(){
 if(!this.hybridCanWeb())return fallbackSearch.call(this);
 setPageTitle('搜索');var d=[],items;try{items=this.items(false);d.push(this.hybridWebItem(this.hybridSearchHtml(items),'search'));this.pushNav(d,'search');setResult(d);}catch(e){return fallbackSearch.call(this);}
};

R.nativeCategoryTab=function(cat,active,key){
 var on=String(active)===String(cat.id);return{title:(on?'● ':'')+String(cat.name||'分类')+(on?' '+String(cat.count||0):''),col_type:'flex_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,cat.id),extra:{lineVisible:false,backgroundColor:on?'#E5F0FF':'#F5F6F8',id:'rule-repo-hybrid11-category-'+String(cat.id)}};
};

R.workspaceScopeCard=function(title,value,active,key,count){
 var on=String(active)===String(value);return{title:(on?'● ':'')+String(title||'')+' '+String(count==null?0:count),col_type:'text_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,textAlign:'center',backgroundColor:on?'#E5F0FF':'#F5F6F8',id:'rule-repo-hybrid11-scope-'+String(value)}};
};

R.primaryAction=function(title,url){return{title:'<b><font color="#FFFFFF">'+String(title||'确认')+'</font></b>',url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false,textAlign:'center',backgroundColor:'#1685F8'}};};
R.secondaryAction=function(title,url){return{title:'<b><font color="#1685F8">'+String(title||'操作')+'</font></b>',url:url||'hiker://empty',col_type:'text_2',extra:{lineVisible:false,textAlign:'center',backgroundColor:'#E8F2FF'}};};

R.aboutPage=function(){
 setPageTitle('关于');var d=[],repo=this.findById('rule-repo')||{},channel=this.isTestChannel()?'测试版':'正式版';d.push(this.hero('我的规则仓库','海阔视界专属 · 规则管理中心',this.iconOf(repo),'hiker://empty'));d.push(this.quickAction('分类管理','category','hiker://page/ruleRepoCategory?rule=&simple=true'));d.push(this.quickAction('搜索','search','hiker://page/ruleRepoSearch?rule=&simple=true'));d.push(this.quickAction('版本更新','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.quickAction('备份恢复','backup','hiker://page/ruleRepoSettings?rule=&simple=true'));d.push(this.sectionLine());d.push(this.sectionToolbar('版本与通道','updates','hiker://page/ruleRepoUpdate?rule=&simple=true'));d.push(this.infoPair('当前',String(this.version||'--')));d.push(this.infoPair('通道',channel));d.push(this.infoPair('正式',String(this.baseStableVersion||this.version||'--')));d.push(this.infoPair('界面','Workspace 11.0'));d.push(this.compactInfo('运行信息','Build '+String(this.build||'--')+' · 固定底栏混合工作台 · Stable/Test 分层','hiker://empty'));d.push(this.compactInfo('产品原则','高频导航常驻 · 分类关系清晰 · 业务动作保持原生 · 异常可恢复','hiker://empty'));d.push(this.sectionLine());this.pushNav(d,'settings');setResult(d);
};

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-21',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.3',build:377,path:'apps/tools/rule-repo/rule_repo_remote_v353.txt',mode:'remote',updatedAt:'2026-08-21',recommended:true,desc:'实机验证稳定 · 日常使用与恢复入口',highlights:['首页状态工作台','程序状态与标签分层','安全同步与多镜像'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.4-rc3',baseVersion:'3.5.3',targetVersion:'3.5.4',build:380,path:'apps/tools/rule-repo/rule_repo_test_v126.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'Hybrid Workspace 11.0 · 固定底栏与双栏分类树',highlights:['首页固定底栏','左主类右子类','单行分类导航','网页可靠数字','混合原生动作'],icon:icon}
 ]};
};
})(HikerRuleRepo);
