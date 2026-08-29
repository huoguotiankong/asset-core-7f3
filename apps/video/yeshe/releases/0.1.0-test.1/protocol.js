/* 夜社短剧 Protocol 0.1.0-test.1 */
var YesheProtocol=(function(){
  var VERSION='0.1.0-test.1',BUILD=10101;
  var UA='Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';
  var SEED='https://xn--f562sym-ph2mz2penax520c.baitasi.org';
  var LANDING='https://yeshe.tv/';
  var DISCOVERY='https://ysurl.win/755WwN';
  var HOST_KEY='yeshe_last_good_origin_v1',DIAG_KEY='yeshe_protocol_diag_v1',NAV_KEY='yeshe_nav_cache_v1';
  function s(v){return v==null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function clean(v){
    v=trim(v).replace(/<script[\s\S]*?<\/script>/ig,' ').replace(/<style[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ');
    return v.replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;/ig,"'").replace(/&lt;/ig,'<').replace(/&gt;/ig,'>').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');
  }
  function saveDiag(o){try{o=o||{};o.time=new Date().getTime();setItem(DIAG_KEY,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG_KEY,'{}')||'{}');}catch(e){return{};}}
  function parsePack(raw){
    var text=s(raw),o=null;
    try{o=JSON.parse(text);}catch(e){}
    if(o&&typeof o==='object'&&(o.body!=null||o.statusCode!=null||o.headers!=null))return{body:s(o.body),status:Number(o.statusCode||o.status||200)||200,headers:o.headers||{}};
    return{body:text,status:200,headers:{}};
  }
  function header(h,name){
    var k,v,lname=String(name||'').toLowerCase();
    if(h&&typeof h==='object')for(k in h)if(String(k).toLowerCase()===lname){v=h[k];return Array.isArray(v)?s(v[0]):s(v);}
    h=s(h);var re=new RegExp('(?:^|\\n)'+name+'\\s*:\\s*([^\\r\\n]+)','i'),m=h.match(re);return m?trim(m[1]):'';
  }
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
  function abs(u,base){
    u=trim(u).replace(/&amp;/ig,'&').replace(/\\\//g,'/');base=trim(base);
    if(!u)return'';
    if(/^https?:\/\//i.test(u))return u;
    if(/^\/\//.test(u))return'https:'+u;
    var o=origin(base);if(!o)o=discover(false);
    if(u.charAt(0)==='/')return o+u;
    var p=base.replace(/[?#].*$/,'').replace(/\/[^\/]*$/,'/');return p+u;
  }
  function fetchPack(url,opt){
    opt=opt||{};var hs={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9'};
    var k;if(opt.referer)hs.Referer=opt.referer;if(opt.headers)for(k in opt.headers)hs[k]=opt.headers[k];
    var cfg={headers:hs,timeout:Number(opt.timeout||10000),withHeaders:true,withStatusCode:true};
    if(opt.redirect===false)cfg.redirect=false;if(opt.method)cfg.method=opt.method;if(opt.body!=null)cfg.body=opt.body;
    return parsePack(fetch(url,cfg));
  }
  function looksHtml(p){return p&&p.status<500&&s(p.body).length>160&&/(<html\b|<body\b|<a\b|<div\b)/i.test(s(p.body));}
  function testOrigin(o){
    if(!/^https?:\/\//i.test(o))return false;
    try{var p=fetchPack(o+'/type/13.html?chl=yeshetv',{timeout:6500});return looksHtml(p)&&/(夜社|短剧|视频|动漫|漫画|小说|写真)/.test(p.body);}catch(e){return false;}
  }
  function discover(force){
    var cached=trim(getItem(HOST_KEY,''));if(!force&&cached)return cached;
    var list=[],loc='',p=null,i,o,seen={};
    if(cached)list.push(cached);list.push(SEED);
    try{p=fetchPack(DISCOVERY,{redirect:false,timeout:6500});loc=header(p.headers,'location');o=origin(loc);if(o)list.unshift(o);}catch(e){}
    for(i=0;i<list.length;i++){
      o=trim(list[i]);if(!o||seen[o])continue;seen[o]=1;
      if(testOrigin(o)){setItem(HOST_KEY,o);saveDiag({ok:true,stage:'DISCOVER',host:o,source:o===SEED?'seed':'redirect/cache'});return o;}
    }
    if(cached){saveDiag({ok:false,stage:'DISCOVER_STALE',host:cached,error:'候选线路探活失败，继续使用上次可用地址'});return cached;}
    setItem(HOST_KEY,SEED);saveDiag({ok:false,stage:'DISCOVER_FALLBACK',host:SEED,error:'未完成探活，使用用户当前入口'});return SEED;
  }
  function requestUrl(url,opt){
    opt=opt||{};var base=discover(false),u=abs(url,base),p=null,newHost='';
    try{p=fetchPack(u,opt);}catch(e){p={body:'',status:599,headers:{},error:s(e.message||e)};}
    if(looksHtml(p)||opt.allowNonHtml){saveDiag({ok:true,stage:'REQUEST',url:u,status:p.status,host:origin(u)});return p;}
    if(origin(u)===base){
      newHost=discover(true);
      if(newHost&&newHost!==base){u=newHost+s(u).substring(base.length);try{p=fetchPack(u,opt);}catch(e2){p={body:'',status:599,headers:{},error:s(e2.message||e2)};}}
    }
    saveDiag({ok:!!(p&&p.body),stage:'REQUEST_RETRY',url:u,status:p?p.status:0,host:origin(u),error:p&&p.error?p.error:'响应不可用'});return p||{body:'',status:599,headers:{}};
  }
  function requestPath(path,opt){return requestUrl(abs(path,discover(false)),opt);}
  function attr(html,name){
    var q=s(html),re=new RegExp('\\b'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'),m=q.match(re);if(m)return trim(m[1]);
    re=new RegExp('\\b'+name+'\\s*=\\s*([^\\s>]+)','i');m=q.match(re);return m?trim(m[1]):'';
  }
  function pick(html,selectors,field){
    var i,v='';for(i=0;i<selectors.length;i++){try{v=pdfh(html,selectors[i]+'&&'+field);}catch(e){v='';}v=trim(v);if(v&&v!=='null'&&v!=='undefined')return v;}return'';
  }
  function anchors(html,base){
    var nodes=[],out=[],i,n,h,t,title,img,seen={};
    try{nodes=pdfa(html,'a')||[];}catch(e){nodes=[];}
    if(!nodes.length){var re=/<a\b[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/ig,m;while((m=re.exec(s(html)))!==null&&out.length<1500)nodes.push(m[0]);}
    for(i=0;i<nodes.length&&out.length<1500;i++){
      n=s(nodes[i]);h=attr(n,'href');if(!h)continue;h=abs(h,base);if(!h||seen[h])continue;
      title=attr(n,'title');img='';try{img=pick(n,['img'], 'data-original')||pick(n,['img'],'data-src')||pick(n,['img'],'data-lazy-src')||pick(n,['img'],'src');}catch(ignore){}
      t=clean(title||n);seen[h]=1;out.push({href:h,text:t,title:clean(title),img:img?abs(img,base):'',raw:n});
    }
    return out;
  }
  function parseCardNode(n,base){
    var h='',title='',cover='',desc='';n=s(n);
    try{h=pick(n,['a'],'href');}catch(e){}if(!h)h=attr(n,'href');h=abs(h,base);
    try{title=pick(n,['img'],'alt')||pick(n,['a'],'title')||pick(n,['h1','h2','h3','h4','.title','.name'],'Text');}catch(e2){}
    try{cover=pick(n,['img'],'data-original')||pick(n,['img'],'data-src')||pick(n,['img'],'data-lazy-src')||pick(n,['img'],'src');}catch(e3){}
    try{desc=pick(n,['.pic-text','.remarks','.remark','.note','.subtitle','.meta','.time'],'Text');}catch(e4){}
    if(!title)title=clean(n);if(title.length>80)title=title.substring(0,80);
    return{url:h,title:clean(title),cover:cover?abs(cover,base):'',desc:clean(desc)};
  }
  function cards(html,base){
    var sels=['.module-item','.module-card-item','.stui-vodlist__box','.myui-vodlist__box','.vodlist_item','.public-list-box','.video-item','.card-item','.list-item'],nodes=[],items=[],seen={},i,j,c,a,as;
    for(i=0;i<sels.length;i++){try{nodes=pdfa(html,sels[i])||[];}catch(e){nodes=[];}if(nodes.length>=3){for(j=0;j<nodes.length&&items.length<120;j++){c=parseCardNode(nodes[j],base);if(c.url&&c.title&&!seen[c.url]){seen[c.url]=1;items.push(c);}}if(items.length>=3)break;}}
    if(items.length<3){as=anchors(html,base);for(i=0;i<as.length&&items.length<120;i++){a=as[i];if(!a.img)continue;if(!/(\/play\/|\/detail\/|\/voddetail\/|\/vod\/|\/read\/|\/view\/|\/book\/|\/novel\/|\/comic\/|\/album\/)/i.test(a.href))continue;if(seen[a.href])continue;seen[a.href]=1;items.push({url:a.href,title:a.title||a.text||'未命名内容',cover:a.img,desc:''});}}
    return items;
  }
  function nav(html,base){
    var as=anchors(html,base),map={},all=[],i,a,n;
    for(i=0;i<as.length;i++){a=as[i];n=clean(a.text||a.title);if(!n||n.length>18)continue;if(/\/type\/|\/list\/|\/category\/|\/class\//i.test(a.href)){if(!map[n])map[n]=a.href;all.push({name:n,url:a.href});}}
    return{map:map,all:all};
  }
  function navCached(force){
    var now=new Date().getTime(),old=null,h='',base=discover(false),obj=null;
    if(!force){try{old=JSON.parse(getItem(NAV_KEY,'{}')||'{}');}catch(e){}if(old&&old.host===base&&now-Number(old.time||0)<21600000&&old.map)return old;}
    h=requestUrl(base+'/',{timeout:9000}).body;if(!h||h.length<200)h=requestUrl(base+'/type/13.html?chl=yeshetv',{timeout:9000}).body;
    obj=nav(h,base);obj.host=base;obj.time=now;try{setItem(NAV_KEY,JSON.stringify(obj));}catch(e2){}return obj;
  }
  function meta(html,base){
    var title='',cover='',desc='';
    try{title=pick(html,['meta[property="og:title"]'],'content')||pick(html,['h1','.title','.video-title','.detail-title'],'Text')||pick(html,['title'],'Text');}catch(e){}
    try{cover=pick(html,['meta[property="og:image"]'],'content')||pick(html,['.detail-pic img','.vod-pic img','.poster img','.cover img'],'data-original')||pick(html,['.detail-pic img','.vod-pic img','.poster img','.cover img'],'src');}catch(e2){}
    try{desc=pick(html,['meta[name="description"]'],'content')||pick(html,['.vod-content','.detail-content','.content-desc','.desc'],'Text');}catch(e3){}
    return{title:clean(title).replace(/[-_|].*夜社.*$/,''),cover:cover?abs(cover,base):'',desc:clean(desc)};
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
    var nodes=[],out=[],seen={},i,u='';try{nodes=pdfa(html,'.content img')||[];}catch(e){}if(nodes.length<2)try{nodes=pdfa(html,'.article-content img')||[];}catch(e2){}if(nodes.length<2)try{nodes=pdfa(html,'img')||[];}catch(e3){}
    for(i=0;i<nodes.length&&out.length<300;i++){u=pick(nodes[i],['img'],'data-original')||pick(nodes[i],['img'],'data-src')||pick(nodes[i],['img'],'src')||attr(nodes[i],'src');u=abs(u,base);if(!u||seen[u]||/(logo|icon|avatar|favicon|banner|ads?)/i.test(u))continue;seen[u]=1;out.push(u);}return out;
  }
  function loginUrl(){var n=navCached(false),keys=['登录','登陆','用户登录','会员登录'],i,k;for(i=0;i<keys.length;i++){k=keys[i];if(n.map[k])return n.map[k];}return discover(false)+'/user/login.html';}
  return{version:VERSION,build:BUILD,ua:UA,seed:SEED,landing:LANDING,discovery:DISCOVERY,diagKey:DIAG_KEY,discover:discover,requestUrl:requestUrl,requestPath:requestPath,abs:abs,clean:clean,cards:cards,anchors:anchors,nav:nav,navCached:navCached,meta:meta,episodes:episodes,article:article,gallery:gallery,loginUrl:loginUrl,diag:diag,saveDiag:saveDiag};
})();