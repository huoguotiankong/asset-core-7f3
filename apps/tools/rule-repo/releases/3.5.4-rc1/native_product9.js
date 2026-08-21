/* 我的规则仓库 3.5.4-rc1 - Native Product 9.0 real-device polish */
(function(R){
R.nativeProductVersion='9.0.0';

R.nativeDigitArt=function(value,color){
 var patterns={
  '0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg',
  '5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg'
 },rects={
  a:[4,0,12,3],b:[16,3,3,12],c:[16,18,3,12],d:[4,30,12,3],
  e:[1,18,3,12],f:[1,3,3,12],g:[4,15,12,3]
 },s=String(Math.max(0,Math.round(Number(value)||0))).slice(0,3),gap=4,w=20,total=s.length*w+(s.length-1)*gap,start=(112-total)/2,y=25,out='';
 for(var i=0;i<s.length;i++){
  var p=patterns[s.charAt(i)]||patterns['0'],x=start+i*(w+gap);
  for(var j=0;j<p.length;j++){
   var q=rects[p.charAt(j)];out+='<rect x="'+(x+q[0])+'" y="'+(y+q[1])+'" width="'+q[2]+'" height="'+q[3]+'" rx="1.5"/>';
  }
 }
 return'<g fill="'+color+'">'+out+'</g>';
};

R.nativeMetricArt=function(value,color,active){
 var bg=active?color:'#F7F9FC',fg=active?'#FFFFFF':color,border=active?color:'#E5EAF1',svg='<svg xmlns="http://www.w3.org/2000/svg" width="112" height="84" viewBox="0 0 112 84"><rect x="2" y="2" width="108" height="80" rx="18" fill="'+bg+'" stroke="'+border+'" stroke-width="2"/>'+this.nativeDigitArt(value,fg)+'</svg>';
 return'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
};

R.metricCard=function(title,value,view,active,key){
 var on=String(active)===String(view),colors={all:'#1677FF',installed:'#22A06B',updates:'#F59E0B',favorites:'#E2558D'},color=colors[String(view)]||'#1677FF',img=this.nativeMetricArt(value,color,on);
 return{title:String(title||'')+' '+String(value==null?0:value),img:img,pic_url:img,col_type:'icon_small_4',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,view),extra:{lineVisible:false,id:'rule-repo-native9-metric-'+String(view),cls:'rule-repo-native9-metric'}};
};

R.nativeTransparentIcon=function(){
 var svg='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#FFFFFF" fill-opacity="0.001"/></svg>';
 return'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
};

R.nativeMetaIndent=function(){return'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';};

R.nativeProgramMetaRow=function(item){
 var tags=this.nativeProgramTags(item),bits=[],pad=this.nativeMetaIndent();
 for(var i=0;i<tags.length;i++)bits.push('<font color="#1677FF">'+this.nativeHtml(tags[i])+'</font>');
 return{title:pad+bits.join('　')+'<br>'+pad+'<small><font color="#7A7F87">'+this.nativeHtml(this.nativeProgramSummary(item))+'</font></small>',col_type:'rich_text',extra:{textSize:13,lineSpacing:0,id:'rule-repo-native9-meta-'+String(item.id||''),cls:'rule-repo-native9-program-meta'}};
};

R.nativeProgramCard=function(item){
 var group=String(item&&item.entryType||'')==='channel-group',st=this.nativeStatusMeta(item),fav=this.isFav(item),detail='hiker://page/ruleRepoDetail?rule=&simple=true&id='+encodeURIComponent(String(item.id||'')),extra={lineVisible:false,pageTitle:String(item.name||'程序'),hc_repo_item_id:String(item.id||''),id:'rule-repo-native9-card-'+String(item.id||''),cls:'rule-repo-native9-program-card'};
 if(!group)extra.longClick=[
  {title:'打开',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);return x?r.openRule(x):'toast://程序不存在';},item.id)},
  {title:st.label==='可更新'?'更新':'导入 / 覆盖',js:$.toString(function(raw){return $.require('hiker://page/ruleRepoCore').importRule(raw);},JSON.stringify(item.raw))},
  {title:fav?'取消收藏':'收藏',js:$.toString(function(id){var r=$.require('hiker://page/ruleRepoCore'),x=r.findById(id);if(!x)return'toast://程序不存在';var on=r.toggleFav(x);refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},item.id)}
 ];
 return{title:String(item.name||'程序')+'　'+this.nativeVersionText(item),desc:this.nativeStatusRich(item),img:this.iconOf(item),pic_url:this.iconOf(item),url:detail,col_type:'avatar',extra:extra};
};

R.itemCard=function(item){return this.nativeProgramCard(item);};
R.pushProgram=function(d,item){d.push(this.nativeProgramCard(item));d.push(this.nativeProgramMetaRow(item));d.push(this.programLine());};

R.nativeChannelCard=function(parent,c,current){
 var ch=String(c.channel||''),label=ch==='stable'?'正式版':(ch==='test'?'测试版':(ch==='local'?'本地版':'版本')),raw=this.channelInstallRaw(parent,c),color=current?'#22A06B':(ch==='stable'?'#1677FF':(ch==='test'?'#F59E0B':'#8D68F8')),status=current?'当前运行':(ch==='stable'?'稳定推荐':(ch==='test'?'抢先体验':'独立安装'));
 return{title:label+'　'+String(c.version||'--'),desc:'<font color="'+color+'"><b>'+status+'</b></font>',img:String(c.icon||this.iconOf(parent)),pic_url:String(c.icon||this.iconOf(parent)),url:$('#noLoading#').lazyRule(function(x){return $.require('hiker://page/ruleRepoCore').importRule(x);},JSON.stringify(raw)),col_type:'avatar',extra:{lineVisible:false,id:'rule-repo-native9-channel-'+ch,cls:'rule-repo-native9-channel'}};
};
R.channelProductCard=function(parent,c,current){return this.nativeChannelCard(parent,c,current);};

R.nativeSearchScope=function(title,value,active,key,count){
 var on=String(active)===String(value),suffix=count==null?'':' '+String(count);
 return{title:(on?'● ':'')+String(title||'')+suffix,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false,id:'rule-repo-native9-search-scope-'+String(value)}};
};

R.nativeSearchMenu=function(mode,canClear){
 var options=['全部运行方式','仅看远程','仅看本地'];if(canClear)options.push('清空最近搜索');
 var code="(function(){var v=String(input||'');if(v==='仅看远程')putMyVar('hc_repo_search_mode','remote');else if(v==='仅看本地')putMyVar('hc_repo_search_mode','local');else if(v==='清空最近搜索'){$.require('hiker://page/ruleRepoCore').clearSearchHistory();}else putMyVar('hc_repo_search_mode','all');refreshPage(false);return v==='清空最近搜索'?'toast://已清空最近搜索':'hiker://empty';})()";
 return this.selectRoute('搜索选项',options,code,2);
};

R.searchPage=function(){
 setPageTitle('搜索');var d=[],items;
 try{items=this.items(false);}catch(e){setResult([{title:'搜索暂时不可用',desc:this.friendlyError(e),url:'hiker://page/ruleRepoHome?rule=&simple=true',col_type:'text_center_1',extra:{lineVisible:false}}]);return;}
 this.clearPresenceCache&&this.clearPresenceCache();
 var raw=String(getParam('kw','')||getParam('s','')||''),pkw=this.safeDecodeKeyword(raw),kw=pkw||this.safeDecodeKeyword(getMyVar('hc_repo_search_kw','')),scope=String(getMyVar('hc_repo_search_scope','all')||'all'),mode=String(getMyVar('hc_repo_search_mode','all')||'all'),stats=this.stats(items);
 if(pkw){putMyVar('hc_repo_search_kw',pkw);this.recordSearch(pkw);}
 d.push({title:'搜索',url:$.toString(function(){var q=String(input||'').trim();putMyVar('hc_repo_search_kw',q);var r=$.require('hiker://page/ruleRepoCore');if(q)r.recordSearch(q);refreshPage(false);return'hiker://empty';}),col_type:'input',extra:{defaultValue:kw,hint:'搜索名称、功能、标签或版本',onChange:$.toString(function(){putMyVar('hc_repo_search_kw',String(input||''));})}});
 d.push(this.nativeSearchScope('全部','all',scope,'hc_repo_search_scope',stats.all));
 d.push(this.nativeSearchScope('已安装','installed',scope,'hc_repo_search_scope',stats.installed));
 d.push(this.nativeSearchScope('可更新','updates',scope,'hc_repo_search_scope',stats.updates));
 d.push(this.nativeSearchScope('收藏','favorites',scope,'hc_repo_search_scope',stats.favorites));
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
  var hist=this.searchHistory(),tags=this.popularTags(items,9),recent=this.recentItems?this.recentItems(pool,4):[];
  d.push(this.sectionLine());d.push(this.sectionToolbar(hist.length?'最近搜索 · '+hist.length:'发现程序 · '+modeLabel,'more',this.nativeSearchMenu(mode,hist.length>0)));
  for(var h=0;h<Math.min(hist.length,5);h++)d.push({title:String(hist[h]),desc:'再次搜索',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_search_kw',v);var r=$.require('hiker://page/ruleRepoCore');r.recordSearch(v);refreshPage(false);return'hiker://empty';},hist[h]),col_type:'text_1',extra:{lineVisible:false,id:'rule-repo-native9-search-history-'+h}});
  if(tags.length){d.push(this.sectionLine());this.pushSection(d,'热门标签','点击标签直接搜索');for(var t=0;t<tags.length;t++)d.push({title:'#'+String(tags[t].name||''),col_type:'text_3',url:$('#noLoading#').lazyRule(function(v){putMyVar('hc_repo_search_kw',v);var r=$.require('hiker://page/ruleRepoCore');r.recordSearch(v);refreshPage(false);return'hiker://empty';},String(tags[t].name||'')),extra:{lineVisible:false,id:'rule-repo-native9-hot-tag-'+t}});}
  if(recent.length){d.push(this.sectionLine());d.push(this.sectionToolbar('最近使用 · '+recent.length,'history','hiker://page/ruleRepoHistory?rule=&simple=true'));for(var r=0;r<recent.length;r++)this.pushProgram(d,recent[r]);}
  if(!hist.length&&!tags.length&&!recent.length)this.pushEmpty(d,'搜索你的程序','支持名称、描述、标签、分类和版本。');
 }
 d.push(this.sectionLine());this.pushNav(d,'search');setResult(d);
};
})(HikerRuleRepo);
