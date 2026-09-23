/* 色花堂 0.1.0-test.31 / Build 10131 - list/search latency optimization without UI regression */
var SeHuaTangPatchTest31=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var VERSION='0.1.0-test.31',BUILD=10131;
var LIST_CACHE_TTL=120000,SEARCH_CACHE_TTL=300000,FORMHASH_TTL=1800000;
var LK_URL='sht_v31_list_url',LK_TS='sht_v31_list_ts',LK_HTML='sht_v31_list_html';
var SK_PREFIX='sht_v31_search_',FK_HASH='sht_v31_search_formhash',FK_TS='sht_v31_search_formhash_ts';
var SEARCH_STATE='sht_search_state_v11';
function s(v){return v==null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function now(){return new Date().getTime()}
function gv(k){try{return s(getVar(k,'')||'')}catch(e){return''}}
function pv(k,v){try{putVar(k,s(v))}catch(e){}}
function gi(k){try{return s(getItem(k,'')||'')}catch(e){return''}}
function si(k,v){try{setItem(k,s(v))}catch(e){}}
function fastFetch(u,pc,timeout){try{return s(fetch(u,{headers:C.headers(!!pc,u),timeout:timeout||6500}))}catch(e){return''}}
function threadCount(h){var x=s(h),re=/(?:[?&](?:tid|ptid)=|\/thread-)(\d+)/ig,m,seen={},n=0;while((m=re.exec(x))!==null){if(!seen[m[1]]){seen[m[1]]=1;n++}if(n>=120)break}return n}
function imgHintCount(h){var m=s(h).match(/\b(?:data-original|data-src|data-lazy-src|data-echo|zoomfile|file|srcset)\s*=/ig);return m?m.length:0}
function isGuide(u){return /[?&]mod=guide(?:&|$)/i.test(s(u))}
function isBoard(u){u=s(u);return /(?:forumdisplay|[?&]fid=\d+|\/forum-\d+-\d+\.html)/i.test(u)&&!isGuide(u)}
function listCacheRead(u){var cu=gv(LK_URL),ts=Number(gv(LK_TS)||0),h=gv(LK_HTML);if(cu!==s(u)||!h||now()-ts>LIST_CACHE_TTL)return'';return h}
function listCacheWrite(u,h){h=s(h);if(!h||h.length>1400000)return;pv(LK_URL,u);pv(LK_TS,String(now()));pv(LK_HTML,h)}
function ageReadyJs(){return $.toString(function(ck,ak){
  var body=String((document.body&&document.body.innerText)||'');
  if(/满\s*18\s*岁|年满\s*18|over\s*18|please\s*click\s*here/i.test(body)){
    var n=document.querySelectorAll('a,button,input,[onclick],[role="button"],div');
    for(var i=0;i<n.length;i++){
      var x=String(n[i].innerText||n[i].textContent||n[i].value||'');
      if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(x)){try{n[i].click();return null}catch(e){}}
    }
    return null;
  }
  try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ck,c);fba.putVar(ak,'1')}catch(e2){}
  return document.querySelector('a[href*="tid="],a[href*="thread-"]')?'ready':null;
},'sht_web_cookie_v5','sht_access_ok_v7')}
function fastGuideRender(u){var h='';try{h=s(fetchCodeByWebView(u,{headers:C.headers(false,u),timeout:14000,blockRules:['.jpg','.jpeg','.png','.gif','.webp','.avif','.bmp','.mp4','.m3u8','.woff','.woff2','.ttf'],checkJs:ageReadyJs()}))}catch(e){}return h}
function installFastRender(){
  if(C.__shtV31RenderInstalled)return;
  var old=C.renderList;
  C.renderList=function(u){var x=s(u),h=listCacheRead(x),tc,ic;if(h)return h;
    if(isGuide(x)){
      h=fastGuideRender(x);tc=threadCount(h);
      if(tc>=3){listCacheWrite(x,h);return h}
    }else if(isBoard(x)){
      h=fastFetch(x,false,6500);tc=threadCount(h);ic=imgHintCount(h);
      if(tc>=5&&ic>=2){listCacheWrite(x,h);return h}
    }
    h=old(x);if(threadCount(h)>=3)listCacheWrite(x,h);return h;
  };
  C.__shtV31RenderInstalled=1;
}
function hashKey(v){var x=s(v),h=2166136261,i;for(i=0;i<x.length;i++){h^=x.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}return (h>>>0).toString(36)}
function searchCacheKey(kw,p){return SK_PREFIX+hashKey(kw)+'_'+Math.max(1,Number(p||1))}
function searchCacheRead(kw,p){var x=gi(searchCacheKey(kw,p));if(!x)return null;try{var o=JSON.parse(x);if(!o||!o.ts||!o.items||now()-Number(o.ts)>SEARCH_CACHE_TTL)return null;return o}catch(e){return null}}
function searchCacheWrite(kw,p,o){try{si(searchCacheKey(kw,p),JSON.stringify({ts:now(),items:o.items||[],url:o.url||'',id:o.id||'',source:o.source||''}))}catch(e){}}
function readSearchState(kw){try{var x=JSON.parse(gi(SEARCH_STATE)||'{}');if(x.kw===kw&&x.id)return x}catch(e){}return null}
function writeSearchState(kw,id){if(!id)return;try{si(SEARCH_STATE,JSON.stringify({kw:kw,id:id,time:now()}))}catch(e){}}
function searchId(h){var m=s(h).match(/[?&]searchid=(\d+)/i);return m?m[1]:''}
function formhashFrom(h){var m=s(h).match(/name=["']formhash["'][^>]*value=["']([^"']+)/i)||s(h).match(/value=["']([^"']+)["'][^>]*name=["']formhash["']/i);return m?m[1]:''}
function getFormhash(){var ts=Number(gi(FK_TS)||0),fh=gi(FK_HASH),u,h;if(fh&&now()-ts<FORMHASH_TTL)return fh;u=C.origin()+'/search.php?mod=forum&mobile=2';h=fastFetch(u,false,5000);fh=formhashFrom(h);if(fh){si(FK_HASH,fh);si(FK_TS,String(now()))}return fh}
function parseItems(m,h,u){var fn=(m._debug&&m._debug.parseCardsV11)||(m._debug&&m._debug.parseCardsV15),a=[];try{if(fn)a=fn(h,u,0)||[]}catch(e){a=[]}return a}
function directSearchById(m,kw,id,p){var u=C.origin()+'/search.php?mod=forum&searchid='+encodeURIComponent(id)+'&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page='+Math.max(1,Number(p||1))+'&mobile=2',h=fastFetch(u,false,6500),a=parseItems(m,h,u);if(!a.length){var pu=C.toPc(u);h=fastFetch(pu,true,6500);a=parseItems(m,h,pu);if(a.length)u=pu}return{html:h,url:u,items:a,id:id,source:'searchid-fast'}}
function directInitialSearch(m,kw){var fh=getFormhash(),u=C.origin()+'/search.php?mod=forum&mobile=2',h='',a=[],id='',opt;if(!fh)return null;opt={method:'POST',headers:C.headers(false,u),body:'formhash='+encodeURIComponent(fh)+'&srchtxt='+encodeURIComponent(kw)+'&searchsubmit=yes',timeout:6500};opt.headers['Content-Type']='application/x-www-form-urlencoded';try{h=s(fetch(u,opt))}catch(e){h=''}id=searchId(h);a=parseItems(m,h,u);if(id)writeSearchState(kw,id);if(!a.length&&id){var r=directSearchById(m,kw,id,1);if(r.items.length)return r}if(!a.length)return null;return{html:h,url:u,items:a,id:id,source:'search-post-fast'}}
function searchInput(kw){return{title:'搜索主题',desc:'搜索',col_type:'input',url:"(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('sht_search_kw_v1',w);return 'hiker://page/shtSearch?rule=色花堂&simple=true&kw='+encodeURIComponent(w)+'&sht_p=1';})()",extra:{defaultValue:kw||'',titleVisible:true}}}
function pbtn(t,kw,p,on){return{title:t,url:on?C.route('shtSearch',{kw:kw,sht_p:p}):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function imageRows(d,it,ref,u){var imgs=it.imgs||[],i,p,ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(i=0;i<imgs.length&&i<3;i++){p=C.imageUrl(imgs[i],ref);if(p)d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v31_search_preview'}})}}
function renderSearch(d,items,ref){var i,it,u;for(i=0;i<(items||[]).length;i++){it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});d.push({title:it.title,desc:it.summary||'查看帖子',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v31_search_card'}});imageRows(d,it,ref,u);d.push(C.line('sht_v31_search_sep'))}}
function fastSearchPage(m,oldSearch){var kw=trim(C.pageParam('kw',getMyVar('sht_search_kw_v1',''))),p=Math.max(1,Number(C.pageParam('sht_p','1')||1)),cache,st,r,d=[];if(!kw)return oldSearch();cache=searchCacheRead(kw,p);if(cache){r={items:cache.items,url:cache.url,id:cache.id,source:'cache'}}else{st=readSearchState(kw);if(st&&st.id)r=directSearchById(m,kw,st.id,p);if((!r||!r.items||!r.items.length)&&p===1)r=directInitialSearch(m,kw);if(!r||!r.items||!r.items.length)return oldSearch();searchCacheWrite(kw,p,r)}
  setPageTitle('搜索');C.saveDiag('search.fast.v31','kw='+kw+' p='+p+' source='+r.source+' items='+(r.items||[]).length);d.push(searchInput(kw));d.push(C.section('搜索结果','“'+kw+'” · 第 '+p+' 页 · '+r.items.length+' 条 · '+(r.source==='cache'?'缓存':'快速直取')));d.push(pbtn(p>1?'上一页':'第一页',kw,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',kw,1,p>1));d.push(pbtn(r.items.length?'下一页':'已到底',kw,p+1,r.items.length>0));d.push(C.line());renderSearch(d,r.items,r.url);setResult(d)
}
function module(){installFastRender();var m=BASE.module(),oldSearch=m.search;m.version=VERSION;m.build=BUILD;m.search=function(){return fastSearchPage(m,oldSearch)};m._debug=m._debug||{};m._debug.performanceV31={listCacheTtl:LIST_CACHE_TTL,searchCacheTtl:SEARCH_CACHE_TTL};return m}
var P={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
