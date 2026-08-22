/* Hanime1 Test26: creator hub + detail/search/settings UX */
(function(C,P,E,H,U,L){
var BUILD='2.0.0-test.26';
var BUILDNO=20026;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/hanime1/bootstrap_test_v4.js?v=20024';
var BOOTVER=20024;
var ARTIST_CACHE_PREFIX='hanime_artist_meta26_';
var ARTIST_CACHE_TTL=10*60*1000;
var oldResults=E.videoResultsPage;
var oldFilter=E.videoFilterPage;
var oldSearchPage=E.searchPage;
function clean(v){return C.clean(String(v==null?'':v));}
function nodes(html,sel){try{return pdfa(String(html||''),sel)||[];}catch(e){return [];}}
function text(node,sel){try{return clean(pdfh(node,sel)||'');}catch(e){return '';}}
function attr(node,sel){try{return String(pdfh(node,sel)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
function firstText(node,sels){for(var i=0;i<sels.length;i++){var v=text(node,sels[i]);if(v)return v;}return '';}
function firstAttr(node,sels){for(var i=0;i<sels.length;i++){var v=attr(node,sels[i]);if(v)return v;}return '';}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function pageCount(h,def){var total=Number(def||1),a=nodes(h,'ul.pagination li.page-item a.page-link');for(var i=0;i<a.length;i++){var n=parseInt(text(a[i],'Text'),10);if(n>total)total=n;}return total;}
function artistCacheKey(name){var s='';try{s=encodeURIComponent(String(name||''));}catch(e){s=String(name||'');}return ARTIST_CACHE_PREFIX+s.slice(0,120);}
function artistRead(name){try{var raw=getItem(artistCacheKey(name),'');if(!raw)return null;var x=JSON.parse(raw);if(!x||new Date().getTime()-Number(x.ts||0)>ARTIST_CACHE_TTL){clearItem(artistCacheKey(name));return null;}return x.item||null;}catch(e){return null;}}
function artistWrite(name,item){try{setItem(artistCacheKey(name),JSON.stringify({ts:new Date().getTime(),item:item||{}}));}catch(e){}}
P.artistDirectory26=function(query,page){
  var base=C.resolveHost(false),p=Number(page||1),q=String(query||'').trim(),url=C.query(base+'/search',{page:p,query:q,type:'artist'}),r=C.get(url,{base:base,referer:base+'/',timeout:15000});
  if(r&&r.challenge)throw new Error('NEED_VERIFY|'+url+'|作者搜索');
  if(!r||Number(r.statusCode||0)>=400)throw new Error('作者搜索失败：HTTP '+Number((r&&r.statusCode)||0));
  var h=String(r.body||''),cards=nodes(h,'.search-artist-card'),out=[];
  for(var i=0;i<cards.length;i++){
    var n=cards[i],name=firstText(n,['.search-artist-title&&Text','.title&&Text']),img=firstAttr(n,['img[style*=object-fit]&&src','img&&data-src','img&&src']),href=firstAttr(n,['a.overlay&&href','a&&href']),aq='';
    try{aq=decodeURIComponent((String(href||'').match(/[?&]query=([^&]+)/)||[])[1]||'');}catch(e){}
    var count=firstText(n,['.search-artist-count&&Text','.meta&&Text']);
    if(!name)continue;
    var item={name:name,avatar:abs(base,img),query:aq||name,count:count};out.push(item);artistWrite(name,item);
  }
  return {items:out,page:p,totalPages:pageCount(h,p),query:q};
};
P.artistMeta26=function(name){
  name=clean(name);if(!name)return null;var cached=artistRead(name);if(cached)return cached;
  var r=P.artistDirectory26(name,1),a=r.items||[],pick=null;
  for(var i=0;i<a.length;i++){if(clean(a[i].name)===name){pick=a[i];break;}}
  if(!pick&&a.length)pick=a[0];if(pick)artistWrite(name,pick);return pick;
};
P.artistWorks26=function(query,page){return P.search({query:String(query||''),page:Number(page||1),type:''});};
function creatorRoute(type,o){o=o||{};o.creatorType=type;return H.route('hanimeVideoResults',o);}
function creatorHeader(d,name,role,avatar,meta){d.push({title:name||role,desc:[role,meta].filter(Boolean).join(' · '),pic_url:avatar||'',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});}
function renderArtistProfile(){
  var page=Number(H.pv('page','1')||1),name=H.pv('creatorName',''),query=H.pv('creatorQuery','')||name,avatar=H.pv('creatorAvatar',''),count=H.pv('creatorCount',''),meta=null;
  if(!name)throw new Error('缺少作者名称');
  if(!avatar||!query||query===name){try{meta=P.artistMeta26(name);}catch(e){}if(meta){if(!avatar)avatar=meta.avatar||'';if(!count)count=meta.count||'';query=meta.query||query;}}
  var r=P.artistWorks26(query,page),list=(r&&r.items)||[],d=[];
  setPageTitle(name);
  creatorHeader(d,name,'作者',avatar,count||('第 '+page+' 页'));
  d.push(H.btn('在全部影片中搜索',H.route('hanimeVideoResults',{query:query}),'text_2'));
  d.push(H.btn('作者目录',creatorRoute('directory',{query:name}),'text_2'));
  d.push(H.sec('作者作品',list.length?('第 '+page+' 页 · '+list.length+' 部'):'当前页暂无匹配作品'));
  for(var i=0;i<list.length;i++)d.push(L.video(list[i],'results'));
  if(page>1)d.push(H.btn('‹ 上一页',creatorRoute('artist',{creatorName:name,creatorQuery:query,creatorAvatar:avatar,creatorCount:count,page:page-1})));
  if(page<Number(r.totalPages||page))d.push(H.btn('下一页 ›',creatorRoute('artist',{creatorName:name,creatorQuery:query,creatorAvatar:avatar,creatorCount:count,page:page+1})));
  setResult(d);
}
function renderUploaderProfile(){
  var page=Number(H.pv('page','1')||1),uid=H.pv('userId',''),name=H.pv('creatorName','')||H.pv('userName',''),seedAvatar=H.pv('creatorAvatar','');
  if(!uid)return oldResults();
  var r=P.userUploads17(uid,name,page),list=r.items||[],d=[],avatar=r.avatar||seedAvatar;
  setPageTitle(r.name||name||'上传者');
  creatorHeader(d,r.name||name||('用户 '+uid),'上传者',avatar,'公开上传 · 第 '+page+' 页');
  d.push(H.btn('打开官网主页',r.url||'hiker://empty','text_2'));
  d.push(H.btn('搜索同名影片',H.route('hanimeVideoResults',{query:r.name||name}),'text_2'));
  d.push(H.sec('公开上传',list.length?('本页 '+list.length+' 部'):'当前页暂无公开作品'));
  for(var i=0;i<list.length;i++)d.push(L.video(list[i],'results'));
  if(page>1)d.push(H.btn('‹ 上一页',creatorRoute('uploader',{userId:uid,creatorName:r.name||name,creatorAvatar:avatar,page:page-1})));
  if(page<Number(r.totalPages||page))d.push(H.btn('下一页 ›',creatorRoute('uploader',{userId:uid,creatorName:r.name||name,creatorAvatar:avatar,page:page+1})));
  setResult(d);
}
function renderArtistDirectory(){
  var page=Number(H.pv('page','1')||1),q=H.pv('query',getMyVar('hanime26_artist_q','')),r=P.artistDirectory26(q,page),list=r.items||[],d=[];
  setPageTitle('作者目录');
  d.push({title:'搜索作者',url:"putMyVar('hanime26_artist_q',input);refreshPage(false);return 'hiker://empty';",col_type:'input',extra:{hint:'输入作者名；留空浏览当前作者结果',defaultValue:q,lineVisible:false}});
  d.push(H.btn('影片筛选',H.route('hanimeVideoFilter',{}),'text_2'));
  d.push(H.btn('综合搜索',H.route('hanimeSearch',{}),'text_2'));
  d.push(H.sec(q?('作者 · '+q):'作者目录',list.length?('第 '+page+' 页 · '+list.length+' 位'):'暂无作者结果，可输入作者名搜索'));
  for(var i=0;i<list.length;i++){var x=list[i];d.push({title:x.name,desc:x.count||'点击查看作者作品',pic_url:x.avatar||'',url:creatorRoute('artist',{creatorName:x.name,creatorQuery:x.query,creatorAvatar:x.avatar,creatorCount:x.count}),col_type:'avatar',extra:{lineVisible:false}});}
  if(page>1)d.push(H.btn('‹ 上一页',creatorRoute('directory',{query:q,page:page-1})));
  if(page<Number(r.totalPages||page))d.push(H.btn('下一页 ›',creatorRoute('directory',{query:q,page:page+1})));
  setResult(d);
}
E.videoResultsPage=function(){var type=H.pv('creatorType','');try{if(type==='artist')return renderArtistProfile();if(type==='uploader')return renderUploaderProfile();if(type==='directory')return renderArtistDirectory();return oldResults();}catch(x){setResult([{title:'创作者页面加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};
E.videoFilterPage=function(){
  try{
    setPageTitle('影片筛选');var d=[],cat=P.filterCatalog||{},section=H.pv('section',''),groups=Object.keys(cat.tags||{});
    d.push(H.sec('发现内容','先按作者或影片条件进入，再逐步缩小范围。'));
    d.push(H.btn('作者目录',creatorRoute('directory',{}),'text_2'));
    d.push(H.btn('综合搜索',H.route('hanimeSearch',{}),'text_2'));
    function one(title,key,items){if(section==='tags')return;d.push(H.sec(title));for(var n=0;n<(items||[]).length;n++){var o=items[n],p={};p[key]=o[1];d.push(H.chip(o[0],H.route('hanimeVideoResults',p)));}}
    one('影片类型','genre',cat.genres);one('排序方式','sort',cat.sorts);one('发布日期','date',cat.dates);one('影片时长','duration',cat.durations);
    for(var g=0;g<groups.length;g++){d.push(H.sec(groups[g]));var arr=cat.tags[groups[g]]||[];for(var i=0;i<arr.length;i++)d.push(H.chip(arr[i],H.route('hanimeVideoResults',{tag:arr[i]})));}
    setResult(d);
  }catch(x){try{return oldFilter();}catch(e){setResult([{title:'分类页加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}}
};
E.searchPage=function(){
  try{
    setPageTitle('搜索');var q=H.pv('q',getMyVar('hanime2_search_q','')),page=Number(H.pv('page','1')||1),d=[];
    d.push({title:'搜索',url:"putMyVar('hanime2_search_q',input);refreshPage(false);return 'hiker://empty';",col_type:'input',extra:{hint:'输入影片 / 作者关键词',defaultValue:q,lineVisible:false}});
    d.push(H.btn('高级分类',H.route('hanimeVideoFilter',{}),'text_2'));
    d.push(H.btn(q?'查找同名作者':'作者目录',creatorRoute('directory',q?{query:q}:{}),'text_2'));
    if(!q){d.push(H.sec('输入关键词开始搜索','也可以直接进入作者目录或高级分类。'));setResult(d);return;}
    var r=P.search({query:q,page:page}),list=r.items||[];d.push(H.sec('影片结果','“'+q+'” · 第 '+page+' 页 · '+list.length+' 部'));
    for(var i=0;i<list.length;i++)d.push(L.video(list[i],'search'));
    if(page>1)d.push(H.btn('‹ 上一页',H.route('hanimeSearch',{q:q,page:page-1})));
    if(page<Number(r.totalPages||page))d.push(H.btn('下一页 ›',H.route('hanimeSearch',{q:q,page:page+1})));
    setResult(d);
  }catch(x){try{return oldSearchPage();}catch(e){setResult([{title:'搜索失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}}
};
function playUrl(id){return $('#noLoading#').lazyRule(function(x){return $.require('hanime').play(x);},id);}
function action(title,url){return {title:title,url:url,col_type:'text_4',extra:{lineVisible:false}};}
E.detail=function(){
  try{
    var id=H.pv('id','');if(!id)throw new Error('缺少视频 ID');var v=P.video(id),d=[],top=(v.sources&&v.sources.length)?String(v.sources[0].quality||'最高'):'最高',logged=false;
    try{logged=!!C.activeAccount();}catch(e){}
    setPageTitle(v.title);
    d.push({title:v.title,desc:[v.genre,v.views?('观看 '+v.views):'',v.upload].filter(Boolean).join(' · '),pic_url:v.cover||'',url:playUrl(id),col_type:'movie_1_vertical_pic_blur',extra:{gradient:true,lineVisible:false,inheritTitle:false,pageTitle:v.title}});
    d.push(action('▶ 播放',playUrl(id)));
    d.push(action('评论'+(v.commentCount!==undefined?' '+v.commentCount:''),H.route('hanimeComments',{id:id,title:v.title})));
    d.push(action('加入片单',logged?H.route('hanimePlaylistPicker',{id:id}):H.route('hanimeLogin',{})));
    d.push(action(v.download?'下载原片':'原片暂无',v.download?('download://'+v.download):'hiker://empty'));
    var pl=v.playlist||[];
    if(pl.length>1){d.push(H.sec('选集 · '+pl.length,'点任意一集直接播放'));for(var p=0;p<pl.length;p++){var ep=pl[p],sel=String(ep.id)===String(id),lab=(sel?'▶ ':'')+U.epLabel(ep,p);d.push({title:lab,url:playUrl(ep.id),col_type:'scroll_button',extra:{lineVisible:false,inheritTitle:false,pageTitle:ep.title||v.title}});}d.push({col_type:'line_blank'});}
    if(v.artist||(v.uploader&&v.uploader.name)){
      d.push(H.sec('创作者','作者与上传账号分开呈现，点击进入各自主页。'));
      if(v.artist)d.push({title:v.artist,desc:'作者 · 查看作者主页与作品',pic_url:v.artistAvatar||'',url:creatorRoute('artist',{creatorName:v.artist,creatorAvatar:v.artistAvatar||''}),col_type:'avatar',extra:{lineVisible:false}});
      if(v.uploader&&v.uploader.name)d.push({title:v.uploader.name,desc:'上传者 · 查看公开上传主页',pic_url:v.uploader.avatar||'',url:(v.uploader.id?creatorRoute('uploader',{userId:v.uploader.id,creatorName:v.uploader.name,creatorAvatar:v.uploader.avatar||''}):H.route('hanimeVideoResults',{query:v.uploader.name})),col_type:'avatar',extra:{lineVisible:false}});
    }
    d.push(H.sec('作品信息'));
    if(v.genre)d.push(H.chip('类型 · '+v.genre,H.route('hanimeVideoResults',{genre:v.genre})));
    if(v.views)d.push(H.chip('观看 · '+v.views,'hiker://empty'));
    if(v.upload)d.push(H.chip('上传 · '+v.upload,'hiker://empty'));
    if(v.duration)d.push(H.chip('时长 · '+v.duration,'hiker://empty'));
    if(v.tags&&v.tags.length){d.push(H.sec('内容标签'));for(var i=0;i<Math.min(12,v.tags.length);i++){var tg=v.tags[i];d.push(H.chip(tg.name+(tg.count?' · '+tg.count:''),H.route('hanimeVideoResults',{tag:tg.name})));}if(v.tags.length>12)d.push(H.chip('全部标签 · '+v.tags.length,H.route('hanimeVideoFilter',{section:'tags'})));}
    if(v.caption)d.push({title:'简介',desc:v.caption,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false,textSize:16}});
    if(v.sources&&v.sources.length)d.push(H.sec('画质','默认优先 '+top+' · '+v.sources.map(function(s){return s.quality||'默认';}).join(' / ')));
    if(v.related&&v.related.length){d.push(H.sec('相关推荐',v.related.length+' 部'));for(var j=0;j<v.related.length;j++)d.push(L.video(v.related[j],'related'));}
    setResult(d);
  }catch(x){setResult([{title:'详情加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}
};
function bootAction(kind){return $('#noLoading#').lazyRule(function(boot,ver,action){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r;if(action==='check'){r=HanimeBoot.check();return 'toast://'+(r.hasUpdate?'发现新测试版 '+r.latest.version:'当前已是最新测试版');}if(action==='update'){r=HanimeBoot.update();if(r.ok&&r.changed){refreshPage(false);return 'toast://已更新到 '+r.current.version;}return 'toast://'+(r.error||'暂无更新');}if(action==='rollback'){r=HanimeBoot.rollback();if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}return 'toast://'+(r.error||'没有可回退版本');}if(action==='reinstall'){r=HanimeBoot.reinstall();if(r.ok){refreshPage(false);return 'toast://当前测试版已重新加载';}return 'toast://'+(r.error||'重新加载失败');}if(action==='reset'){r=HanimeBoot.reset();if(r.ok){refreshPage(false);return 'toast://已恢复兼容基线';}return 'toast://'+(r.error||'恢复失败');}return 'toast://未知操作';}catch(e){return 'toast://更新链异常：'+String(e.message||e);}},BOOT,BOOTVER,kind);}
E.renderSettings=function(d){
  var st=C.state(),acc=C.activeAccount();
  d.push(H.sec('账号',acc?(acc.name+(acc.email?' · '+acc.email:'')):'未登录'));
  d.push(H.btn(acc?'账号中心':'登录 Hanime1',acc?H.route('hanimeAccount',{}):H.route('hanimeLogin',{}),'text_center_1'));
  d.push(H.sec('界面','主要页面可独立设置封面列数与图文排版。'));
  d.push(H.btn('页面封面布局',H.route('hanimeLayoutSettings',{}),'text_center_1'));
  d.push(H.sec('网络','当前线路 · '+st.base));
  d.push(H.btn('重新检测线路',$('#noLoading#').lazyRule(function(){clearItem('hanime2_active_host');clearItem('hanime2_host_ts');try{var h=$.require('hanime').core().resolveHost(true);refreshPage(false);return 'toast://当前线路 '+h;}catch(e){return 'toast://'+String(e.message||e);}}),'text_2'));
  d.push(H.btn('浏览器验证',H.route('hanimeVerify',{url:st.base}),'text_2'));
  d.push(H.sec('测试版本',BUILD+' · Build '+BUILDNO+' · Shell v4'));
  d.push(H.btn('检查更新',bootAction('check'),'text_2'));
  d.push(H.btn('更新测试版',bootAction('update'),'text_2'));
  d.push(H.sec('维护','仅在更新异常或需要回退时使用。'));
  d.push(H.btn('重新加载当前版本',bootAction('reinstall'),'text_3'));
  d.push(H.btn('回退上一测试版',bootAction('rollback'),'text_3'));
  d.push(H.btn('恢复兼容基线',bootAction('reset'),'text_3'));
};
HanimePages.build=BUILD;HanimeCore.build=BUILD;HanimeProvider.build=BUILD;
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9,HanimeUI10,HanimeLayout12);
