/* xChina Remote Runtime Core 0.1.0-test.9
 * Clean source-contract rebuild from uploaded reading source (2025-11-13).
 */
var XChinaTest9Core=(function(){
  var VERSION='0.1.0-test.9',BUILD=10109;
  var C={
    primary:'https://xchina.co',
    fallback:'https://xchina001.ink',
    comic:'https://litu100.xyz',
    publish:'https://xiaohuangshu.me',
    ua:"Mozilla/5.0 (Linux; U; Android 13; zh-Hans-CN; PFJM10 Build/TP1A.220905.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/135.0.4896.58 Quark/6.13.6.581 Mobile Safari/537.36",
    baseKey:'xc_t9_base',lastBaseKey:'xc_t9_last_base',cachePrefix:'xc_t9_html_'
  };
  var CATEGORY_GROUPS=(typeof XChinaTest9Categories==='object'&&XChinaTest9Categories)||{};
  function s(v){return v===undefined||v===null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function decode(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(parseInt(n,10));}catch(e){return _;}});}
  function strip(v){return trim(decode(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n'));}
  function safeDecode(v){try{return decodeURIComponent(s(v));}catch(e){return s(v);}}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.primary;}
  function abs(u,base){u=decode(trim(u)).replace(/\\\//g,'/');base=base||C.primary;if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(/^javascript:/i.test(u)||u==='#')return'';var o=origin(base);if(u.charAt(0)==='/')return o+u;return s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h);}
  function badHtml(h){var x=s(h),l=x.toLowerCase();return x.length<160||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('cloudflare ray id')>=0;}
  function cookieFor(url){var c='',u=s(url||C.primary);try{if(typeof getCookie==='function')c=s(getCookie(u)||'');}catch(e){}if(!c){try{if(typeof getCookie==='function')c=s(getCookie(origin(u)+'/')||'');}catch(e2){}}return c;}
  function headersFor(url,ref){var r=ref||origin(url)+'/',h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':r},c=cookieFor(url);if(c)h.Cookie=c;return h;}
  function coverImage(u){u=abs(u,C.primary);if(!u)return'';var h={'User-Agent':C.ua,'Referer':C.primary+'/'},c=cookieFor(u);if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h);}
  function contentImage(u,type){var ref=type==='comic'?C.comic+'/':C.primary+'/';u=abs(u,ref);if(!u)return'';var h={'User-Agent':C.ua,'Referer':ref},c=cookieFor(u);if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h);}

  function domArray(html,sel){try{if(typeof pdfa==='function')return pdfa(s(html),sel)||[];if(typeof parseDomForArray==='function')return parseDomForArray(s(html),sel)||[];}catch(e){}return[];}
  function domHtml(html,sel){try{if(typeof pdfh==='function')return s(pdfh(s(html),sel)||'');if(typeof parseDomForHtml==='function')return s(parseDomForHtml(s(html),sel)||'');}catch(e){}return'';}
  function domUrl(html,sel,base){try{if(typeof pd==='function')return s(pd(s(html),sel,base)||'');if(typeof parseDom==='function')return s(parseDom(s(html),sel,base)||'');}catch(e){}return'';}
  function attr(tag,name){var m=s(tag).match(new RegExp(name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'));return m?decode(m[1]):'';}
  function cssUrl(style,base){var m=decode(s(style)).match(/url\(\s*["']?([^"'\)]+)["']?\s*\)/i);return m?abs(m[1],base):'';}
  function og(html,name){var n=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),m=s(html).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+n+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));if(!m)m=s(html).match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+n+'["\\\']','i'));return m?decode(m[1]):'';}

  function getFixedBase(){var b='';try{b=getItem(C.baseKey,'');}catch(e){}return /^https?:\/\//i.test(b)?b.replace(/\/$/,''):'';}
  function getLastBase(){var b='';try{b=getItem(C.lastBaseKey,'');}catch(e){}return /^https?:\/\//i.test(b)?b.replace(/\/$/,''):'';}
  function setLastBase(b){try{setItem(C.lastBaseKey,s(b).replace(/\/$/,''));}catch(e){}}
  function cacheFile(url){return C.cachePrefix+hash(url)+'.html';}
  function readCache(url){try{return s(readFile(cacheFile(url))||'');}catch(e){return'';}}
  function writeCache(url,html){try{if(html&&html.length<800000)saveFile(cacheFile(url),html);}catch(e){}}
  function webFetch(url){try{if(typeof fetchCodeByWebView==='function')return s(fetchCodeByWebView(url,{timeout:18000,headers:headersFor(url,origin(url)+'/'),blockRules:['.woff','.woff2','.ttf','.ico']})||'');}catch(e){}return'';}
  function mainBases(){var xs=[getFixedBase(),getLastBase(),C.primary,C.fallback],a=[],seen={},i,x;for(i=0;i<xs.length;i++){x=s(xs[i]).replace(/\/$/,'');if(x&&!seen[x]){seen[x]=1;a.push(x);}}return a;}
  function pathOnly(url){var m=s(url).match(/^https?:\/\/[^\/]+(\/[^#]*)?/i);return m?(m[1]||'/'):s(url);}
  function fetchPage(input,type,opt){
    opt=opt||{};var raw=s(input||'/'),isComic=type==='comic'||/^https?:\/\/(?:[^\/]+\.)?litu100\.xyz/i.test(raw),candidates=[],i,url,h='',old='';
    if(/^https?:\/\//i.test(raw)){
      if(isComic)candidates=[raw];
      else{var ro=origin(raw),rp=pathOnly(raw);if(ro===C.primary||ro===C.fallback||ro===getLastBase()||ro===getFixedBase()){var rb=mainBases();for(i=0;i<rb.length;i++)candidates.push(rb[i]+rp);}else candidates=[raw];}
    }
    else if(isComic){candidates=[C.comic.replace(/\/$/,'')+(raw.charAt(0)==='/'?'':'/')+raw];}
    else{var bs=mainBases();for(i=0;i<bs.length;i++)candidates.push(bs[i]+(raw.charAt(0)==='/'?'':'/')+raw);}
    for(i=0;i<candidates.length;i++){
      url=candidates[i];try{h=s(fetch(url,{timeout:opt.timeout||11000,headers:headersFor(url,origin(url)+'/')}));}catch(e1){h='';}
      if(!badHtml(h)){if(!isComic)setLastBase(origin(url));writeCache(url,h);return{ok:true,html:h,url:url,base:origin(url),via:'fetch'};}
      old=readCache(url);if(old&&!badHtml(old))return{ok:true,html:old,url:url,base:origin(url),via:'stale'};
    }
    if(!opt.noWeb){for(i=0;i<Math.min(candidates.length,isComic?1:2);i++){url=candidates[i];h=webFetch(url);if(!badHtml(h)){if(!isComic)setLastBase(origin(url));writeCache(url,h);return{ok:true,html:h,url:url,base:origin(url),via:'webview'};}}}
    return{ok:false,html:h||'',url:candidates[0]||raw,base:origin(candidates[0]||raw),blocked:true,via:'blocked'};
  }

  function param(name,def){var v='';try{v=getParam(name,'');}catch(e){}return v?v:(def||'');}
  function currentPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function page(path,params){var a=['rule=','simple=true'],k;params=params||{};for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(s(params[k])));return'hiker://page/'+path+'?'+a.join('&');}
  function section(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function btn(t,u){return{title:t,url:u,col_type:'text_4',extra:{lineVisible:false}};}
  function active(t,on){return(on?'● ':'')+t;}
  function refreshType(key,val){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,val);}
  function typeName(t){return t==='fiction'?'小说':t==='photo'?'套图':t==='comic'?'漫画':t==='video'?'视频':t==='amateur'?'自拍':t==='model'?'模特':'内容';}
  function typeIcon(t){return t==='fiction'?'📕':t==='photo'?'🖼️':t==='comic'?'🎨':t==='video'?'💽':t==='amateur'?'📷':t==='model'?'👩':'📚';}
  function tabs(d,key,current){var xs=[['📕 小说','fiction'],['🖼️ 套图','photo'],['🎨 漫画','comic'],['💽 视频','video']],i;for(i=0;i<xs.length;i++)d.push({title:active(xs[i][0],current===xs[i][1]),url:refreshType(key,xs[i][1]),col_type:'scroll_button',extra:{lineVisible:false}});}

  function listPath(type,p){p=parseInt(p,10)||1;if(type==='comic')return C.comic+'/comics/'+p+'.html';if(type==='fiction')return'/fictions/'+p+'.html';if(type==='amateur')return'/amateurs/'+p+'.html';if(type==='model')return p===1?'/models.html':'/models/'+p+'.html';if(type==='photo')return p===1?'/photos.html':'/photos/'+p+'.html';return p===1?'/videos.html':'/videos/'+p+'.html';}
  function searchPath(type,kw,p){p=parseInt(p,10)||1;kw=encodeURIComponent(trim(kw));if(type==='comic')return C.comic+'/comics/kk-'+kw+'/'+p+'.html';if(type==='photo')return'/photos/keyword-'+kw+'/'+p+'.html';if(type==='video')return'/videos/keyword-'+kw+'/'+p+'.html';return'/fictions/keyword-'+kw+'/'+p+'.html';}

  function cardBlocks(html,type){
    var sels=type==='fiction'?['.list&&.item.fiction','body&&.item.fiction']:type==='photo'?['.list&&.item.photo','body&&.item.photo']:type==='comic'?['body&&.item.comic','.item.comic']:type==='amateur'?['body&&.item.amateur','.item.amateur']:type==='video'?['body&&.item.video','.item.video']:['body&&.item.model','.item.model'],i,a;
    for(i=0;i<sels.length;i++){a=domArray(html,sels[i]);if(a&&a.length)return a;}
    var out=[],re=new RegExp('class=["\\\'][^"\\\']*\\bitem\\b[^"\\\']*\\b'+type+'\\b[^"\\\']*["\\\']','ig'),m,ps=[];while((m=re.exec(s(html))))ps.push(m.index);for(i=0;i<ps.length;i++){var st=s(html).lastIndexOf('<',ps[i]);if(st<0)st=ps[i];var en=i+1<ps.length?s(html).lastIndexOf('<',ps[i+1]):Math.min(s(html).length,st+7000);out.push(s(html).substring(st,en));}return out;
  }
  function cardFromBlock(block,listUrl,type){
    var title=strip(domHtml(block,'.title&&Text')||domHtml(block,'a&&title')),href=domUrl(block,'a,0&&href',listUrl)||domUrl(block,'a&&href',listUrl),style=domHtml(block,'.img&&style'),img=cssUrl(style,listUrl),author='',brief=strip(domHtml(block,'.brief&&Text'));
    if(!img)img=domUrl(block,'.img&&img&&src',listUrl)||domUrl(block,'img&&data-original',listUrl)||domUrl(block,'img&&data-src',listUrl)||domUrl(block,'img&&src',listUrl);
    if(type==='fiction')author=strip(domHtml(block,'.author&&Text')||domHtml(block,'.tag&&Text')).replace(/^作者[:：]\s*/,'');
    else if(type==='comic')author=strip(domHtml(block,'.author&&Text')).replace(/^作者[:：]\s*/,'');
    else author=strip(domHtml(block,'.model-container&&Text')||domHtml(block,'.model-item&&Text')||domHtml(block,'.author&&Text'));
    if(!title){var mt=s(block).match(/class=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\//i);title=mt?strip(mt[1]):'';}
    if(!href){var mh=s(block).match(/<a\b[^>]*href=["']([^"']+)["']/i);href=mh?abs(mh[1],listUrl):'';}
    if(!img){var ms=s(block).match(/class=["'][^"']*\bimg\b[^"']*["'][^>]*style=["']([^"']+)["']/i);img=ms?cssUrl(ms[1],listUrl):'';}
    if(!title||!href)return null;
    return{type:type,title:title,href:href,img:coverImage(img),rawImg:img,author:author,brief:brief};
  }
  function parseCards(html,listUrl,type){var bs=cardBlocks(html,type),out=[],seen={},i,c,key;for(i=0;i<bs.length;i++){c=cardFromBlock(bs[i],listUrl,type);if(!c)continue;key=c.href;if(seen[key])continue;seen[key]=1;out.push(c);}return out;}
  function detailPage(type){return type==='video'?'xchinaVideo':type==='photo'||type==='amateur'?'xchinaPhoto':type==='fiction'?'xchinaFiction':type==='comic'?'xchinaComic':type==='model'?'xchinaModel':'xchinaVideo';}
  function card(x){var ds=[];if(x.author)ds.push(x.author);if(x.brief)ds.push(x.brief);return{title:x.title,desc:ds.join(' · '),img:x.img||'',pic_url:x.img||'',url:page(detailPage(x.type),{xc_url:x.href,t:x.type}),col_type:x.type==='fiction'?'text_2':'movie_3',extra:{lineVisible:false,pageTitle:x.title}};}
  function listResult(type,path){var r=fetchPage(path,type);return{r:r,items:parseCards(r.html,r.url,type)};}

  function detailInfo(html,url,type){
    var title='',cover=domUrl(html,'.cover&&img&&src',url)||og(html,'og:image'),intro='';
    if(type==='fiction'||type==='comic')title=strip(domHtml(html,'.title&&Text'));
    else title=strip(domHtml(html,'.item,0&&.text&&Text')||domHtml(html,'.text&&Text')||domHtml(html,'.title&&Text'));
    if(!title)title=strip(og(html,'og:title')).replace(/\s*[-_|]\s*小黄书.*$/i,'');
    if(type==='fiction')intro=strip(domHtml(html,'.fiction-overview-brief&&Text'));
    else if(type==='comic')intro=strip(domHtml(html,'.comic-info&&Html')||domHtml(html,'.comic-info&&Text'));
    else if(type==='video')intro=strip(domHtml(html,'.video-detail&&Html')||domHtml(html,'.video-detail&&Text'));
    else intro=strip(domHtml(html,'.photo-detail&&Html')||domHtml(html,'.photo-detail&&Text'));
    return{title:title||typeName(type),cover:cover,img:coverImage(cover),intro:intro};
  }
  function chapterLinks(html,url,type){var sel=type==='comic'?'.chapters&&a':'.chapter-container&&a',a=domArray(html,sel),out=[],seen={},i,b,n,u;for(i=0;i<a.length;i++){b=a[i];n=strip(domHtml(b,'a&&Text')||domHtml(b,'Text')||b);u=domUrl(b,'a&&href',url);if(!u){var m=s(b).match(/href=["']([^"']+)["']/i);u=m?abs(m[1],url):'';}if(u&&n&&!seen[u]){seen[u]=1;out.push({name:n,href:u});}}return out;}
  function pagerMax(html){var a=domArray(html,'.pager&&a'),max=1,i,n;for(i=0;i<a.length;i++){n=parseInt(strip(domHtml(a[i],'a&&Text')||domHtml(a[i],'Text')),10);if(n>max)max=n;}if(max===1){var re=/<[^>]+class=["'][^"']*pager-num[^"']*["'][^>]*>(\d+)<\/[^>]+>/ig,m;while((m=re.exec(s(html)))){n=parseInt(m[1],10);if(n>max)max=n;}}return max;}
  function extractImages(html,url,type){var sel=type==='comic'?'.comic-img-box&&Html':type==='amateur'?'.amateur-image&&Html':'.photo-image&&Html',scope=domHtml(html,sel)||s(html),out=[],seen={},re=/(https?:\/\/[^\s"'<>]+?\.(?:webp|jpe?g|png|gif)(?:\?[^\s"'<>]*)?)/ig,m,u;while((m=re.exec(scope))){u=decode(m[1]).replace(/\\\//g,'/');if(u&&!seen[u]){seen[u]=1;out.push(u);}}if(!out.length){var as=domArray(scope,'body&&img'),i;for(i=0;i<as.length;i++){u=domUrl(as[i],'img&&src',url)||domUrl(as[i],'img&&data-original',url)||domUrl(as[i],'img&&data-src',url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}}return out;}
  function mediaFromHtml(html,url,type){
    var container=domHtml(html,'.main-container&&Html')||s(html),out=[],seen={},m,u,domain='',videos=[],i,v;
    m=container.match(/['"](https?:\/\/[^'"]*?\.m3u8\b[^'"]*)['"]/i);if(m){u=decode(m[1]).replace(/\\/g,'');if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    if(!out.length){var md=container.match(/var\s+domain\s*=\s*["']([^"']+)["']/i);if(md)domain=md[1];var mv=container.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);if(mv&&mv[1]){try{videos=JSON.parse(mv[1]);}catch(e){var rx=/["']url["']\s*:\s*["']([^"']+)["']/ig,mm;while((mm=rx.exec(mv[1])))videos.push({url:mm[1]});}for(i=0;i<videos.length;i++){v=videos[i]||{};u=s(v.url||'').replace(/\\/g,'');if(u&&!/^https?:\/\//i.test(u))u=(domain||origin(url)).replace(/\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;u=abs(u,url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}}}
    return out;
  }
  function directPlayer(u){return s(u)+'#isVideo=true#';}
  function headerPlayer(u,pageUrl){var hs='Referer@'+origin(pageUrl)+'/&&User-Agent@'+C.ua,c=cookieFor(u)||cookieFor(pageUrl);if(c)hs+='&&Cookie@'+c;return s(u)+';{'+hs+'}#isVideo=true#';}
  return {version:VERSION,build:BUILD,C:C,CATEGORY_GROUPS:CATEGORY_GROUPS,s:s,trim:trim,decode:decode,strip:strip,safeDecode:safeDecode,origin:origin,abs:abs,badHtml:badHtml,cookieFor:cookieFor,headersFor:headersFor,coverImage:coverImage,contentImage:contentImage,domArray:domArray,domHtml:domHtml,domUrl:domUrl,attr:attr,cssUrl:cssUrl,og:og,getFixedBase:getFixedBase,getLastBase:getLastBase,setLastBase:setLastBase,fetchPage:fetchPage,param:param,currentPage:currentPage,page:page,section:section,empty:empty,btn:btn,active:active,refreshType:refreshType,typeName:typeName,typeIcon:typeIcon,tabs:tabs,listPath:listPath,searchPath:searchPath,cardBlocks:cardBlocks,cardFromBlock:cardFromBlock,parseCards:parseCards,detailPage:detailPage,card:card,listResult:listResult,detailInfo:detailInfo,chapterLinks:chapterLinks,pagerMax:pagerMax,extractImages:extractImages,mediaFromHtml:mediaFromHtml,directPlayer:directPlayer,headerPlayer:headerPlayer};
})();
