/* Shise Remote Runtime 0.1.0-test.1
 * Test-first native Hiker client for https://shise.me/
 * Architecture: request/session -> parser -> playback -> native pages.
 */
var ShiseRemoteRuntime=(function(){
  var R={};
  R.version='0.1.0-test.1';
  R.build=10101;

  var C={
    primary:'https://shise.me',
    ua:'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    baseKey:'shise_base_v1',
    lastBaseKey:'shise_last_good_base_v1',
    cachePrefix:'shise_t1_',
    ruleTitle:'视色',
    boot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/shise/bootstrap_test_v1_b10101.js?v=10101'
  };

  function s(v){return v===undefined||v===null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function decode(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(parseInt(n,10));}catch(e){return _;}});}
  function strip(v){return trim(decode(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n'));}
  function safeDecode(v){try{return decodeURIComponent(s(v));}catch(e){return s(v);}}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return h;}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.primary;}
  function pathOnly(url){var m=s(url).match(/^https?:\/\/[^\/]+(\/[^#]*)?/i);return m?(m[1]||'/'):s(url);}
  function abs(u,base){
    u=decode(trim(u)).replace(/\\\//g,'/');base=base||C.primary;
    if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;
    if(/^javascript:/i.test(u)||u==='#'||/^data:/i.test(u))return'';
    var o=origin(base);if(u.charAt(0)==='/')return o+u;
    return s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;
  }
  function currentBase(){var b='';try{b=getItem(C.baseKey,'');}catch(e){}if(!/^https?:\/\//i.test(b)){try{b=getItem(C.lastBaseKey,'');}catch(e2){}}return /^https?:\/\//i.test(b)?b.replace(/\/$/,''):C.primary;}
  function cookieFor(url){var c='';try{if(typeof getCookie==='function')c=s(getCookie(url)||'');}catch(e){}if(!c){try{if(typeof getCookie==='function')c=s(getCookie(origin(url)+'/')||'');}catch(e2){}}return c;}
  function headers(ref){var r=ref||currentBase()+'/',h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':r},c=cookieFor(r);if(c)h.Cookie=c;return h;}
  function image(u,ref){u=abs(u,ref||currentBase());if(!u)return'';var r=ref||origin(u)+'/',h={'User-Agent':C.ua,'Referer':r},c=cookieFor(u);if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h);}
  function badHtml(h){var x=s(h),l=x.toLowerCase();return x.length<160||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('cloudflare ray id')>=0||l.indexOf('access denied')>=0||l.indexOf('<title>403')>=0;}
  function cacheFile(key){return C.cachePrefix+key+'.html';}
  function readCache(key){try{return s(readFile(cacheFile(key))||'');}catch(e){return'';}}
  function writeCache(key,body,now){try{if(body&&body.length>160&&body.length<900000){saveFile(cacheFile(key),body);setItem(C.cachePrefix+key+'_t',String(now));}}catch(e){}}
  function webFetch(url,timeout){try{if(typeof fetchCodeByWebView==='function')return s(fetchCodeByWebView(url,{timeout:timeout||18000,headers:headers(origin(url)+'/'),blockRules:['.woff','.woff2','.ttf','.ico']})||'');}catch(e){}return'';}
  function fetchPage(input,opt){
    opt=opt||{};var base=currentBase(),raw=s(input||'/'),url=/^https?:\/\//i.test(raw)?raw:base.replace(/\/$/,'')+(raw.charAt(0)==='/'?'':'/')+raw;
    if(/^https?:\/\//i.test(raw)&&origin(raw)!==origin(base))url=base+pathOnly(raw);
    var key=String(Math.abs(hash(url))),old=readCache(key),now=Date.now(),ts=parseInt(getItem(C.cachePrefix+key+'_t','0'),10)||0,ttl=opt.ttl===undefined?180000:opt.ttl,h='';
    if(!opt.force&&old&&now-ts<ttl)return{html:old,url:url,base:origin(url),ok:true,cache:true,via:'cache'};
    try{h=s(fetch(url,{timeout:opt.timeout||11000,headers:headers(origin(url)+'/')}));}catch(e1){h='';}
    if(!badHtml(h)){try{setItem(C.lastBaseKey,origin(url));}catch(e2){}writeCache(key,h,now);return{html:h,url:url,base:origin(url),ok:true,via:'fetch'};}
    if(!opt.noWebView){var w=webFetch(url,opt.webTimeout||18000);if(!badHtml(w)){try{setItem(C.lastBaseKey,origin(url));}catch(e3){}writeCache(key,w,now);return{html:w,url:url,base:origin(url),ok:true,via:'webview'};}if(w.length>h.length)h=w;}
    if(old)return{html:old,url:url,base:origin(url),ok:true,cache:true,stale:true,via:'stale'};
    return{html:h,url:url,base:origin(url),ok:false,blocked:true,via:'blocked'};
  }

  function rawParam(name){
    var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));
    if(m)return safeDecode(m[1]);
    try{var v=getParam(name,'');if(v)return safeDecode(v);}catch(e){}
    return'';
  }
  function param(name,def){var v=rawParam(name);return v===''?(def||''):v;}
  function currentPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function page(path,params){
    var a=['rule=','simple=true'],k;params=params||{};
    for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(s(params[k])));
    return'hiker://page/'+path+'?'+a.join('&');
  }
  function setTitle(t){try{setPageTitle(t);}catch(e){}}
  function section(title,desc){return{title:'‘‘’’<b><font color="#7C3AED">'+title+'</font></b>',desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(title,desc){return{title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function textButton(title,url,desc){return{title:title,desc:desc||'',url:url,col_type:'text_4',extra:{lineVisible:false}};}
  function smallButton(title,url){return{title:title,url:url,col_type:'scroll_button',extra:{lineVisible:false}};}
  function matchAttr(tag,name){var m=s(tag).match(new RegExp(name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'));return m?decode(m[1]):'';}
  function classText(ctx,cls){var re=new RegExp('<[^>]+class=["\\\'][^"\\\']*\\b'+cls.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\b[^"\\\']*["\\\'][^>]*>([\\s\\S]*?)<\\/[^>]+>','i'),m=s(ctx).match(re);return m?strip(m[1]):'';}
  function firstImg(ctx,base){
    var x=decode(s(ctx)).replace(/\\\//g,'/'),m,u='';
    m=x.match(/(?:data-original|data-src|data-lazy-src|data-url|data-bg|data-background|poster|src)\s*=\s*["']([^"']+)["']/i);
    if(!m)m=x.match(/(?:background(?:-image)?\s*:\s*)?url\(\s*["']?([^"'\)]+)["']?\s*\)/i);
    if(!m)m=x.match(/srcset\s*=\s*["']([^"',\s]+)[^"']*["']/i);
    u=m?trim(m[1]):'';if(/^data:image\//i.test(u)||/^(?:about:blank|javascript:)/i.test(u))u='';return u?abs(u,base):'';
  }
  function titleFromHtml(html){var m=s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i),t=m?strip(m[1]):'';return t.replace(/\s*[-_|]\s*视色.*$/i,'').replace(/\s*[-_|]\s*成人影片.*$/i,'');}
  function og(html,key){var re=new RegExp('<meta[^>]+(?:property|name)=["\\\']'+key+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'),m=s(html).match(re);if(!m){re=new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+key+'["\\\']','i');m=s(html).match(re);}return m?decode(m[1]):'';}
  function allAnchors(html,base){var out=[],re=/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,href,text;while((m=re.exec(s(html)))){href=abs(m[2],base);text=strip(m[4]);if(href)out.push({href:href,text:text,raw:m[0],index:m.index,attrs:m[1]+' '+m[3]});}return out;}
  function codeFrom(v){var m=s(v).toUpperCase().match(/\b([A-Z]{2,12}[-_ ]?\d{2,6})\b/);return m?m[1].replace(/[_ ]+/g,'-'):'';}
  function durationFrom(v){var m=strip(v).match(/\b(\d{1,2}:\d{2}:\d{2})\b/);return m?m[1]:'';}
  function parseCards(html,listUrl,kind){
    var body=s(html),a=allAnchors(body,listUrl),out=[],seen={},seenSig={},i,x,u,t,from,to,ctx,img,brief,code,dur,sig,pat=kind==='model'?/\/model\//:/\/video\//;
    for(i=0;i<a.length;i++){
      x=a[i];u=x.href;if(!pat.test(u)||seen[u])continue;
      from=Math.max(0,x.index-260);to=Math.min(body.length,x.index+s(x.raw).length+1000);ctx=body.substring(from,to);
      t=classText(x.raw,'title')||matchAttr(x.raw,'title')||classText(ctx,'title')||x.text;t=trim(t);
      if(!t||t.length<2||t.length>180)continue;
      img=firstImg(x.raw,listUrl)||firstImg(ctx,listUrl);if(!img&&/^(?:最新|热门|更多|全部|分类|女优|模特|影片|视频)$/i.test(t))continue;
      brief=classText(x.raw,'brief')||classText(ctx,'brief')||classText(ctx,'meta')||'';code=codeFrom(t+' '+ctx);dur=durationFrom(ctx);
      sig=t.replace(/\s+/g,'').toLowerCase()+'|'+img;if(seenSig[sig])continue;seen[u]=1;seenSig[sig]=1;
      out.push({href:u,type:kind,title:t,img:image(img,listUrl),rawImg:img,brief:brief,code:code,duration:dur});
    }
    return out;
  }
  function videoCard(x){var ds=[];if(x.code)ds.push(x.code);if(x.duration)ds.push(x.duration);if(x.brief&&ds.join(' · ').indexOf(x.brief)<0)ds.push(x.brief);return{title:x.title,desc:ds.join(' · '),img:x.img||'',pic_url:x.img||'',url:page('shiseVideo',{url:x.href}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:x.title}};}
  function modelCard(x){return{title:x.title,desc:x.brief||'',img:x.img||'',pic_url:x.img||'',url:page('shiseModel',{url:x.href,title:x.title}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:x.title}};}
  function renderCards(d,xs,kind){var i;for(i=0;i<xs.length;i++)d.push(kind==='model'?modelCard(xs[i]):videoCard(xs[i]));}
  function listPath(p){p=parseInt(p,10)||1;return p===1?'/videos.html':'/videos/'+p+'.html';}
  function modelPath(p){p=parseInt(p,10)||1;return p===1?'/models.html':'/models/'+p+'.html';}
  function searchPath(kw,p){p=parseInt(p,10)||1;return'/videos/keyword-'+encodeURIComponent(trim(kw))+'/'+p+'.html';}
  function normalizePath(p,pageno){
    p=s(p||'/videos.html');pageno=parseInt(pageno,10)||1;
    if(pageno<=1)return p;
    if(/\/\d+\.html(?:[?#].*)?$/.test(p))return p.replace(/\/\d+\.html([?#].*)?$/, '/'+pageno+'.html$1');
    if(/\.html(?:[?#].*)?$/.test(p))return p.replace(/\.html([?#].*)?$/, '/'+pageno+'.html$1');
    return p.replace(/\/$/,'')+'/'+pageno+'.html';
  }
  function parseNav(html,base){
    var a=allAnchors(html,base),out=[],seen={},i,x,t,p;
    for(i=0;i<a.length;i++){x=a[i];p=pathOnly(x.href);t=trim(x.text);if(!t||t.length>18||seen[p])continue;if(!/^\/videos(?:\/|\.html)/.test(p))continue;if(/\/video\//.test(p)||/\/keyword-/.test(p)||/^\d+$/.test(t))continue;if(/下一页|上一页|next|prev/i.test(t))continue;seen[p]=1;out.push({title:t,path:p});if(out.length>=30)break;}
    return out;
  }
  function parseModelsFromDetail(html,url){var xs=parseCards(html,url,'model'),out=[],seen={},i;for(i=0;i<xs.length;i++){if(seen[xs[i].href])continue;seen[xs[i].href]=1;out.push(xs[i]);}return out;}
  function detailInfo(html,url){
    var title=og(html,'og:title')||titleFromHtml(html)||'影片详情',img=og(html,'og:image')||firstImg(html,url),desc=og(html,'og:description'),plain=strip(s(html).substring(0,120000)),code=codeFrom(title+' '+plain),dur=durationFrom(plain),tags=[],models=parseModelsFromDetail(html,url),a=allAnchors(html,url),seen={},i,t,p;
    for(i=0;i<a.length;i++){p=pathOnly(a[i].href);t=trim(a[i].text);if(!t||t.length>18)continue;if(/^\/videos\//.test(p)&&!seen[p]&&!/keyword-/.test(p)){seen[p]=1;tags.push({title:t,path:p});if(tags.length>=12)break;}}
    return{title:title,img:image(img,url),intro:desc||'',code:code,duration:dur,tags:tags,models:models};
  }
  function cleanMedia(u,url,domain){u=decode(s(u)).replace(/\\\//g,'/').replace(/\\u002[fF]/g,'/');if(u&&!/^https?:\/\//i.test(u))u=(domain||origin(url)).replace(/\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;u=abs(u,url);return /^https?:\/\//i.test(u)&&!/(?:doubleclick|googlesyndication|\.js(?:$|\?)|\.css(?:$|\?))/i.test(u)?u:'';}
  function mediaFromHtml(html,url){
    var x=decode(s(html)).replace(/\\\//g,'/'),out=[],seen={},m,re,domain='',u,vs=[],i,v,arr;
    m=x.match(/var\s+domain\s*=\s*["']([^"']+)["']/i);if(m)domain=m[1];
    arr=x.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);
    if(arr){try{vs=JSON.parse(arr[1]);}catch(e){var mm,rx=/["'](?:url|src)["']\s*:\s*["']([^"']+)["']/ig;while((mm=rx.exec(arr[1])))vs.push({url:mm[1]});}for(i=0;i<vs.length;i++){v=vs[i]||{};u=cleanMedia(v.url||v.src||'',url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}}
    re=/<(?:video|source)\b[^>]+(?:src|data-src)=["']([^"']+)["']/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    re=/(?:file|src|url)\s*[:=]\s*["']([^"']+?\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    re=/["']([^"']*?\.m3u8(?:\?[^"']*)?)["']/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    re=/(https?:\/\/[^\s"'<>]+?\.mp4(?:\?[^\s"'<>]*)?)/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    return out.slice(0,12);
  }
  function mediaHeaders(media,pageUrl){var h={'User-Agent':C.ua,'Referer':pageUrl,'Origin':origin(pageUrl)},ck=cookieFor(media)||cookieFor(pageUrl);if(ck)h.Cookie=ck;return h;}
  function mediaKind(u){return /m3u8/i.test(s(u))?'HLS':/\.mp4(?:$|[?#])/i.test(s(u))?'MP4':'媒体直链';}
  function playerUrl(u,pageUrl){var h=mediaHeaders(u,pageUrl),hs='Referer@'+h.Referer+'&&Origin@'+h.Origin+'&&User-Agent@'+h['User-Agent'];if(h.Cookie)hs+='&&Cookie@'+h.Cookie;return u+'#isVideo=true#;{'+hs+'}';}
  function blockedMessage(res){return(res&&res.ok)?'页面已取得，但当前解析规则没有识别出内容':'站点可能需要浏览器验证。请到“设置”打开当前线路完成验证，再回来刷新。';}
  function clearRuntimeCache(){try{for(var i=0;i<120;i++){clearItem(C.cachePrefix+i+'_t');}}catch(e){}return'toast://已清理索引状态；HTML 文件缓存会按新请求自动刷新';}

  R.home=function(){
    var d=[],p=currentPage(),res=fetchPage(listPath(p)),items=parseCards(res.html,res.url,'video'),nav;
    if(p===1){
      d.push({title:'视色',desc:'原生浏览 · 搜索 · 女优 · 多线路播放',img:C.primary+'/favicon.ico',pic_url:C.primary+'/favicon.ico',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});
      d.push({title:'⌕ 搜索影片',desc:'片名 / 番号 / 关键词',url:page('shiseSearch',{}),col_type:'text_center_1',extra:{lineVisible:false}});
      d.push(textButton('分类',page('shiseCategories',{})));
      d.push(textButton('女优',page('shiseModels',{})));
      d.push(textButton('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));
      d.push(textButton('历史','hiker://history?rule='+encodeURIComponent(C.ruleTitle)));
      d.push(textButton('设置',page('shiseSettings',{})));
      nav=parseNav(res.html,res.url);if(nav.length){d.push(section('快速分类','来自当前站点导航'));for(var n=0;n<Math.min(nav.length,10);n++)d.push(smallButton(nav[n].title,page('shiseCatalog',{path:nav[n].path,title:nav[n].title})));}
      d.push(section('最新影片',items.length?'当前页 '+items.length+' 条':''));
    }
    if(!items.length)d.push(empty('没有解析到影片',blockedMessage(res)+'\n'+res.url));else renderCards(d,items,'video');setResult(d);
  };

  R.catalog=function(){
    var d=[],p=currentPage(),path=param('path','/videos.html'),title=param('title','影片'),real=normalizePath(path,p),res=fetchPage(real),items=parseCards(res.html,res.url,'video');setTitle(title);
    if(p===1)d.push(section(title,'共 '+items.length+' 条 / 当前页'));
    if(!items.length)d.push(empty('没有解析到内容',blockedMessage(res)));else renderCards(d,items,'video');setResult(d);
  };

  R.categories=function(){
    var d=[],res=fetchPage('/videos.html'),nav=parseNav(res.html,res.url),i;setTitle('分类');
    d.push(section('影片分类','分类来自站点当前导航，域名切换后会自动跟随'));
    d.push({title:'全部 / 最新',url:page('shiseCatalog',{path:'/videos.html',title:'最新影片'}),col_type:'flex_button',extra:{lineVisible:false}});
    for(i=0;i<nav.length;i++)d.push({title:nav[i].title,url:page('shiseCatalog',{path:nav[i].path,title:nav[i].title}),col_type:'flex_button',extra:{lineVisible:false}});
    if(!nav.length)d.push(empty('暂未解析到分类',blockedMessage(res)));setResult(d);
  };

  R.search=function(){
    var kw=param('kw','');if(!kw){try{kw=s(MY_URL).match(/[?&]kw=([^&#]*)/)?safeDecode(s(MY_URL).match(/[?&]kw=([^&#]*)/)[1]):'';}catch(e){}}
    if(!kw){setResult([empty('请输入搜索词','支持片名、番号、关键词')]);return;}
    var p=currentPage(),res=fetchPage(searchPath(kw,p)),items=parseCards(res.html,res.url,'video'),d=[];if(!items.length)d.push(empty('没有搜索到结果',blockedMessage(res)));else renderCards(d,items,'video');setResult(d);
  };
  R.searchPage=function(){
    var d=[],kw=param('kw','');setTitle('搜索');
    if(!kw){d.push({title:'⌕ 打开搜索',desc:'片名 / 番号 / 关键词',url:'hiker://search?s=&rule='+encodeURIComponent(C.ruleTitle),col_type:'text_center_1',extra:{lineVisible:false}});d.push(section('搜索提示','也可以直接使用海阔顶部搜索框'));d.push(empty('等待搜索','输入关键词后展示原生结果卡片'));setResult(d);return;}
    R.search();
  };

  R.models=function(){
    var d=[],p=currentPage(),res=fetchPage(modelPath(p)),items=parseCards(res.html,res.url,'model');setTitle('女优 / 模特');if(p===1)d.push(section('女优 / 模特',items.length?'当前页 '+items.length+' 位':''));if(!items.length)d.push(empty('没有解析到人物列表',blockedMessage(res)));else renderCards(d,items,'model');setResult(d);
  };

  R.model=function(){
    var d=[],url=param('url',''),res=fetchPage(url),title=param('title','')||titleFromHtml(res.html)||'女优 / 模特',img=og(res.html,'og:image')||firstImg(res.html,res.url),desc=og(res.html,'og:description'),works=parseCards(res.html,res.url,'video');setTitle(title);
    d.push({title:title,desc:desc||('关联影片 '+works.length+' 部'),img:image(img,res.url),pic_url:image(img,res.url),url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    d.push(textButton('我的收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(textButton('原站','web://'+res.url));
    if(desc)d.push({title:desc,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    if(works.length){d.push(section('相关影片',works.length+' 条'));renderCards(d,works,'video');}else d.push(empty('没有解析到关联影片',blockedMessage(res)));setResult(d);
  };

  R.detail=function(){
    var d=[],url=param('url','');if(!url){setResult([empty('缺少详情地址','')]);return;}
    var res=fetchPage(url),info=detailInfo(res.html,res.url),media=mediaFromHtml(res.html,res.url),meta=[],i,recs=parseCards(res.html,res.url,'video');setTitle(info.title);
    if(info.code)meta.push(info.code);if(info.duration)meta.push(info.duration);if(media.length)meta.push(media.length+' 条播放线路');
    d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(media.length)d.push({title:'▶ 立即播放',desc:mediaKind(media[0])+(media.length>1?' · 共 '+media.length+' 条线路':''),url:playerUrl(media[0],res.url),col_type:'text_center_1',extra:{lineVisible:false}});
    else d.push({title:'▶ 网页嗅探播放',desc:'当前 HTML 未解析到稳定直链，交给海阔嗅探媒体',url:'video://'+res.url,col_type:'text_center_1',extra:{lineVisible:false}});
    d.push(textButton('播放线路',page('shiseMedia',{url:res.url}),media.length?media.length+' 条':'嗅探兜底'));
    d.push(textButton('我的收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(textButton('原站','web://'+res.url));
    if(info.models.length){d.push(section('女优 / 模特',''));for(i=0;i<Math.min(info.models.length,8);i++)d.push(smallButton(info.models[i].title,page('shiseModel',{url:info.models[i].href,title:info.models[i].title})));}
    if(info.tags.length){d.push(section('分类标签',''));for(i=0;i<info.tags.length;i++)d.push(smallButton(info.tags[i].title,page('shiseCatalog',{path:info.tags[i].path,title:info.tags[i].title})));}
    if(info.intro){d.push(section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    var filtered=[],seen={};for(i=0;i<recs.length;i++)if(recs[i].href!==res.url&&!seen[recs[i].href]){seen[recs[i].href]=1;filtered.push(recs[i]);if(filtered.length>=12)break;}
    if(filtered.length){d.push(section('相关推荐',''));renderCards(d,filtered,'video');}
    if(!res.ok)d.push(empty('当前页可能仍被验证页拦截','请进入设置 → 打开当前线路完成验证'));setResult(d);
  };

  R.media=function(){
    var d=[],url=param('url',''),res=fetchPage(url),xs=mediaFromHtml(res.html,res.url),i;setTitle('播放线路');
    if(!xs.length){d.push(empty('未直接解析到媒体地址','可以继续使用网页嗅探'));d.push({title:'▶ 网页嗅探播放',url:'video://'+res.url,col_type:'text_center_1',extra:{lineVisible:false}});}else{
      d.push(section('可播放线路','检测到 '+xs.length+' 条；直链携带 Referer / Origin / UA / Cookie'));
      for(i=0;i<xs.length;i++)d.push({title:'线路 '+(i+1),desc:mediaKind(xs[i]),url:playerUrl(xs[i],res.url),col_type:'text_1',extra:{lineVisible:false}});
      d.push({title:'网页嗅探兜底',desc:'直链若出现 0 kb/s / 00:00，可用此入口比对',url:'video://'+res.url,col_type:'text_1',extra:{lineVisible:false}});
    }setResult(d);
  };

  R.settings=function(){
    var d=[],b=currentBase(),ck=cookieFor(b);setTitle('视色设置');
    d.push(section('站点与验证','当前线路 '+b));
    d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / Just a moment / 空列表时先使用此项',url:'x5://'+b+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'Cookie 状态',desc:ck?'已读取当前浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'恢复官方域名',desc:C.primary,url:$('#noLoading#').lazyRule(function(k,last,v){clearItem(k);clearItem(last);refreshPage(false);return'toast://已恢复官方域名';},C.baseKey,C.lastBaseKey,C.primary),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'清理页面缓存',desc:'站点结构变化或验证后仍显示旧内容时使用',url:$('#noLoading#').lazyRule(function(prefix){try{for(var i=0;i<120;i++)clearItem(prefix+i+'_t');}catch(e){}refreshPage(false);return'toast://索引缓存已清理';},C.cachePrefix),col_type:'text_1',extra:{lineVisible:false}});
    d.push(section('快捷入口',''));
    d.push(textButton('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(textButton('历史','hiker://history?rule='+encodeURIComponent(C.ruleTitle)));d.push(textButton('原站','web://'+b));
    d.push(section('版本状态','Test 0.1.0-test.1 · Build 10101'));
    d.push({title:'当前能力',desc:'视频 / 分类 / 搜索 / 女优 / 详情 / 多线路播放 / 收藏历史 / X5 会话验证 / stale cache',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    d.push({title:'实机测试说明',desc:'第一版先验证首页封面、搜索、女优、详情和播放链。若站点字段存在差异，下一版只修对应 Parser/播放层，不破坏已正常模块。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    setResult(d);
  };

  R.module=function(){return{
    home:R.home,catalog:R.catalog,categories:R.categories,search:R.search,searchPage:R.searchPage,
    models:R.models,model:R.model,detail:R.detail,media:R.media,settings:R.settings
  };};
  return R;
})();
