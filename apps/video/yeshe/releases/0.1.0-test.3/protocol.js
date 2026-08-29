/* 夜社短剧 Protocol 0.1.0-test.3 */
var YesheProtocol=(function(){
  var VERSION='0.1.0-test.3',BUILD=10103;
  var UA='Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';
  var SEED='https://xn--f562sym-ph2mz2penax520c.baitasi.org';
  var LANDING='https://yeshe.tv/';
  var DISCOVERY='https://ysurl.win/755WwN';
  var HOST_KEY='yeshe_last_good_origin_v2',DIAG_KEY='yeshe_protocol_diag_v2',NAV_KEY='yeshe_nav_cache_v2';
  function s(v){return v==null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function decode(v){return s(v).replace(/\\u0026/ig,'&').replace(/\\\//g,'/').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;|&#x27;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');}
  function clean(v){return trim(decode(s(v).replace(/<br\s*\/?\s*>/ig,' ').replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' '));}
  function saveDiag(o){try{o=o||{};o.time=new Date().getTime();o.version=VERSION;o.build=BUILD;setItem(DIAG_KEY,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG_KEY,'{}')||'{}');}catch(e){return{};}}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
  function isHttp(u){return /^https?:\/\//i.test(s(u));}
  function abs(u,base){
    u=trim(decode(u));base=trim(base);
    if(!u||/^javascript:|^#/.test(u))return'';
    if(isHttp(u))return u;if(/^\/\//.test(u))return'https:'+u;
    var o=origin(base)||SEED;if(u.charAt(0)==='/')return o+u;
    if(u.charAt(0)==='?')return s(base).replace(/[?#].*$/,'')+u;
    return s(base||o+'/').replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;
  }
  function parsePack(raw){
    var text=s(raw),o=null;try{o=JSON.parse(text);}catch(e){}
    if(o&&typeof o==='object'&&(o.body!=null||o.statusCode!=null||o.headers!=null))return{body:s(o.body),status:Number(o.statusCode||o.status||200)||200,headers:o.headers||{}};
    return{body:text,status:200,headers:{}};
  }
  function header(h,name){
    var k,v,l=String(name||'').toLowerCase();
    if(h&&typeof h==='object')for(k in h)if(String(k).toLowerCase()===l){v=h[k];return Array.isArray(v)?s(v[0]):s(v);}
    h=s(h);var m=h.match(new RegExp('(?:^|\\n)'+name+'\\s*:\\s*([^\\r\\n]+)','i'));return m?trim(m[1]):'';
  }
  function looksHtml(h){h=s(h);if(h.length<300)return false;if(/just a moment|cf-chl-|captcha|checking your browser/i.test(h)&&h.length<8000)return false;return /<!doctype|<html\b|<body\b|<div\b|<a\b/i.test(h);}
  function fetchDirect(url,opt){
    opt=opt||{};var hs={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9'},k;
    if(opt.referer)hs.Referer=opt.referer;if(opt.headers)for(k in opt.headers)hs[k]=opt.headers[k];
    var cfg={headers:hs,timeout:Number(opt.timeout||10000),withHeaders:true,withStatusCode:true};
    if(opt.redirect===false)cfg.redirect=false;if(opt.method)cfg.method=opt.method;if(opt.body!=null)cfg.body=opt.body;
    return parsePack(fetch(url,cfg));
  }
  function fetchBrowser(url,opt){
    opt=opt||{};var h='';
    try{h=s(fetchCodeByWebView(url,{timeout:Number(opt.timeout||12000),checkJs:'document.body&&document.body.innerHTML&&document.body.innerHTML.length>200'}));}catch(e){return{body:'',status:598,headers:{},error:s(e.message||e)};}
    return{body:h,status:h?200:598,headers:{},browser:true};
  }
  function rawHtml(url,opt){
    opt=opt||{};var p=null,err='';
    try{p=fetchDirect(url,opt);}catch(e){p={body:'',status:599,headers:{}};err=s(e.message||e);}
    if(looksHtml(p.body))return{body:p.body,status:p.status,headers:p.headers,transport:'direct',url:url};
    if(opt.browser!==false){
      var b=fetchBrowser(url,opt);if(looksHtml(b.body))return{body:b.body,status:b.status,headers:b.headers,transport:'webview',url:url};
      if(b.error)err=(err?err+' | ':'')+b.error;
    }
    return{body:p&&p.body||'',status:p&&p.status||599,headers:p&&p.headers||{},transport:'direct',url:url,error:err||'响应不是可解析 HTML'};
  }
  function testOrigin(o){if(!isHttp(o))return false;var r=rawHtml(o+'/type/13.html?chl=yeshetv',{timeout:7000});return looksHtml(r.body);}
  function redirectOrigin(){try{var p=fetchDirect(DISCOVERY,{redirect:false,timeout:6500}),loc=header(p.headers,'location');return origin(loc);}catch(e){return'';}}
  function discover(force){
    var cached=trim(getItem(HOST_KEY,'')),candidates=[],seen={},i,o,rd;
    if(!force&&cached)return cached;
    rd=redirectOrigin();if(rd)candidates.push(rd);if(cached)candidates.push(cached);candidates.push(SEED);
    for(i=0;i<candidates.length;i++){o=trim(candidates[i]);if(!o||seen[o])continue;seen[o]=1;if(testOrigin(o)){setItem(HOST_KEY,o);saveDiag({ok:true,stage:'DISCOVER',host:o,source:o===rd?'shortlink':o===SEED?'seed':'cache'});return o;}}
    o=cached||SEED;setItem(HOST_KEY,o);saveDiag({ok:false,stage:'DISCOVER_FALLBACK',host:o,error:'候选线路探测失败，保留可恢复入口'});return o;
  }
  function requestUrl(url,opt){
    opt=opt||{};var base=discover(false),u=abs(url,base),r=rawHtml(u,opt),newHost='';
    if(looksHtml(r.body)||opt.allowNonHtml){saveDiag({ok:true,stage:'REQUEST',url:u,status:r.status,host:origin(u),transport:r.transport,len:s(r.body).length});return r;}
    if(origin(u)===base){newHost=discover(true);if(newHost&&newHost!==base){u=newHost+s(u).substring(base.length);r=rawHtml(u,opt);}}
    saveDiag({ok:looksHtml(r.body),stage:'REQUEST_FAIL',url:u,status:r.status,host:origin(u),transport:r.transport,len:s(r.body).length,error:r.error||'HTML 不可解析'});return r;
  }
  function requestPath(path,opt){return requestUrl(abs(path,discover(false)),opt);}
  function attr(tag,name){var m=s(tag).match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));return m?decode(m[1]):'';}
  function firstImage(raw,base){
    var re=/<img\b([^>]*)>/ig,m,u='';while((m=re.exec(s(raw)))){u=attr(m[1],'data-original')||attr(m[1],'data-src')||attr(m[1],'data-lazy-src')||attr(m[1],'data-echo')||attr(m[1],'src');u=abs(u,base);if(u&&!/(logo|favicon|icon[-_.]|avatar|loading|placeholder|banner|(?:^|\/)(?:ad|ads)(?:\/|[_.-])|qrcode)/i.test(u))return u;}return'';
  }
  function anchors(html,base){
    var re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,out=[],seen={},u,n,at;
    while((m=re.exec(s(html)))&&out.length<1800){u=abs(m[2],base);if(!u||seen[u])continue;at=m[1]+' '+m[3];n=clean(attr(at,'title')||attr(at,'aria-label')||m[4]);if(!n)n=clean(attr((m[4].match(/<img\b([^>]*)>/i)||[])[1]||'','alt'));seen[u]=1;out.push({href:u,text:n,title:n,img:firstImage(m[4],base),raw:m[0]});}
    return out;
  }
  function cards(html,base){
    var re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,out=[],seen={},u,at,title,img,desc,inner,ctx,dm;
    while((m=re.exec(s(html)))&&out.length<160){
      u=abs(m[2],base);if(!u||seen[u]||/login|register|logout|javascript:|\/type\/|\/category\/|\/search(?:\/|\.)|\/tag\/|\/actor\//i.test(u))continue;
      inner=m[4];img=firstImage(inner,base);if(!img)continue;at=m[1]+' '+m[3];title=clean(attr(at,'title')||attr(at,'aria-label')||attr((inner.match(/<img\b([^>]*)>/i)||[])[1]||'','alt'));if(!title)title=clean(inner);if(title.length<2||title.length>120)continue;
      ctx=s(html).substring(Math.max(0,m.index-300),Math.min(s(html).length,m.index+m[0].length+500));desc='';dm=ctx.match(/(?:更新至|共|第)\s*\d+\s*(?:集|话|章)|\d+\s*(?:小时前|分钟前|天前)|\d+(?:\.\d+)?[kKwW万]?\s*(?:播放|观看|人气)?/);if(dm)desc=clean(dm[0]);
      seen[u]=1;out.push({url:u,title:title,cover:img,desc:desc});
    }
    return out;
  }
  function nav(html,base){
    var as=anchors(html,base),map={},all=[],i,a,n;
    for(i=0;i<as.length;i++){a=as[i];n=clean(a.text||a.title);if(!n||n.length>20)continue;if(/\/type\/|\/list\/|\/category\/|\/class\//i.test(a.href)){if(!map[n])map[n]=a.href;all.push({name:n,url:a.href});}}
    return{map:map,all:all};
  }
  function navCached(force){
    var now=new Date().getTime(),old=null,base=discover(false),r,obj;
    if(!force){try{old=JSON.parse(getItem(NAV_KEY,'{}')||'{}');}catch(e){}if(old&&old.host===base&&now-Number(old.time||0)<21600000&&old.map)return old;}
    r=requestUrl(base+'/',{timeout:9000});if(!looksHtml(r.body))r=requestUrl(base+'/type/13.html?chl=yeshetv',{timeout:9000});
    obj=nav(r.body,base);obj.host=base;obj.time=now;obj.transport=r.transport||'';obj.len=s(r.body).length;try{setItem(NAV_KEY,JSON.stringify(obj));}catch(e2){}return obj;
  }
  function metaVal(html,key){
    var kk=s(key).replace(/[.*+?^$()|[\]\\]/g,'\\$&'),m=s(html).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+kk+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));if(!m)m=s(html).match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+kk+'["\\\']','i'));return m?decode(m[1]):'';
  }
  function meta(html,base){
    var title=metaVal(html,'og:title'),cover=metaVal(html,'og:image'),desc=metaVal(html,'description'),m;if(!title){m=s(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);if(m)title=clean(m[1]);}if(!title){m=s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);if(m)title=clean(m[1]);}if(!cover)cover=firstImage(html,base);return{title:clean(title).replace(/\s*[-_|].*夜社.*$/,''),cover:cover?abs(cover,base):'',desc:clean(desc)};
  }
  function episodes(html,base,current){
    var as=anchors(html,base),out=[],seen={},i,a,m,id='',cur=s(current).match(/\/play\/(\d+)\/(\d+)\/(\d+)\.html/i);if(cur)id=cur[1];
    for(i=0;i<as.length;i++){a=as[i];m=a.href.match(/\/play\/(\d+)\/(\d+)\/(\d+)\.html/i);if(!m)continue;if(id&&m[1]!==id)continue;if(seen[a.href])continue;seen[a.href]=1;out.push({id:m[1],line:Number(m[2])||1,episode:Number(m[3])||1,title:clean(a.text)||('第'+m[3]+'集'),url:a.href});}
    out.sort(function(x,y){if(x.line!==y.line)return x.line-y.line;return x.episode-y.episode;});return out;
  }
  function article(html){
    var sels=['.chapter-content','.novel-content','.article-content','#content','.content','.detail-content'],i,v='';for(i=0;i<sels.length;i++){try{v=pdfh(html,sels[i]+'&&Text');}catch(e){v='';}v=clean(v);if(v.length>120)return v;}return'';
  }
  function gallery(html,base){
    var re=/<img\b([^>]*)>/ig,m,out=[],seen={},u='';while((m=re.exec(s(html)))&&out.length<350){u=attr(m[1],'data-original')||attr(m[1],'data-src')||attr(m[1],'data-lazy-src')||attr(m[1],'data-echo')||attr(m[1],'src');u=abs(u,base);if(!u||seen[u]||/(logo|favicon|icon[-_.]|avatar|loading|placeholder|banner|(?:^|\/)(?:ad|ads)(?:\/|[_.-])|qrcode)/i.test(u))continue;seen[u]=1;out.push(u);}return out;
  }
  function loginUrl(){var n=navCached(false),keys=['登录','登陆','用户登录','会员登录'],i,k;for(i=0;i<keys.length;i++){k=keys[i];if(n.map[k])return n.map[k];}return discover(false)+'/user/login.html';}
  return{version:VERSION,build:BUILD,ua:UA,seed:SEED,landing:LANDING,discovery:DISCOVERY,diagKey:DIAG_KEY,discover:discover,requestUrl:requestUrl,requestPath:requestPath,abs:abs,clean:clean,cards:cards,anchors:anchors,nav:nav,navCached:navCached,meta:meta,episodes:episodes,article:article,gallery:gallery,loginUrl:loginUrl,diag:diag,saveDiag:saveDiag,looksHtml:looksHtml};
})();