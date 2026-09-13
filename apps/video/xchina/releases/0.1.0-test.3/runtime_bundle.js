/* xChina Remote Test3: consolidated single-layer bundle over immutable Test1 */
(function(){
  var VERSION='0.1.0-test.3', BUILD=10103;
  var PATH='apps/video/xchina/releases/0.1.0-test.1/runtime.js';
  var REPO='huoguotiankong/asset-core-7f3';
  function fetchAny(path,mark){
    var urls=[
      'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+path,
      'https://github.com/'+REPO+'/raw/refs/heads/main/'+path,
      'https://raw.githubusercontent.com/'+REPO+'/main/'+path
    ],errs=[],i,u,t;
    for(i=0;i<urls.length;i++){
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'xc_t3='+BUILD+'&_t='+Date.now();
      try{
        t=String(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}})||'');
        if(t.length<10000||t.indexOf(mark)<0)throw new Error('响应无效 len='+t.length);
        return t;
      }catch(e){errs.push((i+1)+':'+String(e.message||e));}
    }
    throw new Error('Test1 Runtime读取失败：'+errs.join(' | '));
  }
  function need(src,from,to,label){
    if(src.indexOf(from)<0)throw new Error('Test3整合锚点缺失：'+label);
    return src.split(from).join(to);
  }
  var src=fetchAny(PATH,'XChinaRemoteRuntime');

  /* Fold Test2 route-contract fixes directly over immutable Test1. */
  src=need(src,"var a=['rule='+encodeURIComponent(ruleTitle()),'simple=true'];","var a=['rule=','simple=true'];",'中文rule继承');
  src=need(src,"param('url','')","param('xc_url','')",'业务URL读取命名空间');
  var routes=['xchinaPhoto','xchinaFiction','xchinaModel','xchinaVideo'];
  for(var i=0;i<routes.length;i++){
    var a="page('"+routes[i]+"',{url:",b="page('"+routes[i]+"',{xc_url:";
    if(src.indexOf(a)>=0)src=src.split(a).join(b);
  }
  src=need(src,"page('xchinaCatalog',{kind:kind,url:next})","page('xchinaCatalog',{kind:kind,xc_url:next})",'列表下一页URL');
  src=need(src,"page('xchinaCatalog',{kind:kind,url:out[i].url})","page('xchinaCatalog',{kind:kind,xc_url:out[i].url})",'分类URL');

  /* Replace Test1 network hot path as one unit: private-file HTML cache + bounded WebView fallback. */
  var re=/  function fetchPage\(input,opt\)\{[\s\S]*?\n  function attr\(/;
  if(!re.test(src))throw new Error('Test3整合锚点缺失：fetchPage');
  var replacement=[
    "  function cacheFile(key){return'xc_t3_'+key+'.html';}",
    "  function readHtmlCache(key){try{return String(readFile(cacheFile(key))||'');}catch(e){return'';}}",
    "  function writeHtmlCache(key,body,now){try{if(body&&body.length<700000){saveFile(cacheFile(key),body);setItem(key+'_t',String(now));}}catch(e){}}",
    "  function webFetch(u,opt){if(opt&&opt.noWebView)return'';try{if(typeof fetchCodeByWebView==='function')return String(fetchCodeByWebView(u,{timeout:(opt&&opt.webTimeout)||18000,headers:headers(u),blockRules:['.woff','.woff2','.ttf','.ico']})||'');}catch(e){}return'';}",
    "  function fetchPage(input,opt){opt=opt||{};var raw=s(input||'/'),candidates=[],i,d,u,body='',best='',bestUrl='',stale='',staleUrl='',ck,tk,now=Date.now(),ttl=opt.ttl===undefined?180000:opt.ttl,old='',ts=0,wb='';if(/^https?:\\/\\//i.test(raw)&&!sameSite(raw)){try{body=s(fetch(raw,{timeout:opt.timeout||12000,headers:headers(opt.ref||raw,opt.accept)}));}catch(e0){body='';}return{body:body,url:raw,blocked:isBlocked(body),domain:origin(raw),via:'fetch'};}var p=/^https?:\\/\\//i.test(raw)?pathOf(raw):raw;if(p.charAt(0)!=='/')p='/'+p;d=domains();for(i=0;i<d.length;i++)candidates.push(d[i].replace(/\\/+$/,'')+p);for(i=0;i<candidates.length;i++){u=candidates[i];ck=X.cachePrefix+hash(u);tk=ck+'_t';old=readHtmlCache(ck);ts=parseInt(getItem(tk,'0'),10)||0;if(!opt.force&&old&&now-ts<ttl)return{body:old,url:u,blocked:false,domain:origin(u),cache:true,via:'cache'};try{body=s(fetch(u,{timeout:opt.timeout||12000,headers:headers(opt.ref||u,opt.accept)}));}catch(e1){body='';}if(body.length>best.length){best=body;bestUrl=u;}if(!isBlocked(body)){try{setItem(X.lastBaseKey,origin(u));writeHtmlCache(ck,body,now);}catch(e2){}return{body:body,url:u,blocked:false,domain:origin(u),cache:false,via:'fetch'};}if(old&&!stale){stale=old;staleUrl=u;}}if(!opt.noWebView){for(i=0;i<candidates.length&&i<2;i++){u=candidates[i];wb=webFetch(u,opt);if(wb.length>best.length){best=wb;bestUrl=u;}if(!isBlocked(wb)){ck=X.cachePrefix+hash(u);try{setItem(X.lastBaseKey,origin(u));writeHtmlCache(ck,wb,now);}catch(e3){}return{body:wb,url:u,blocked:false,domain:origin(u),cache:false,via:'webview'};}}}if(stale)return{body:stale,url:staleUrl,blocked:false,domain:origin(staleUrl),cache:true,stale:true,via:'stale'};return{body:best,url:bestUrl||candidates[0],blocked:true,domain:origin(bestUrl||candidates[0]),via:'blocked'};}",
    "  function attr("
  ].join('\n');
  src=src.replace(re,replacement);
  src=need(src,"X.cachePrefix='xc_t1_';","X.cachePrefix='xc_t3_';",'缓存命名空间');

  src=src.split('0.1.0-test.1').join(VERSION);
  src=need(src,'X.build=10101;','X.build='+BUILD+';','Build');
  src=src.split('Build 10101').join('Build '+BUILD);
  src=src.replace(/^var\s+XChinaRemoteRuntime\s*=/m,'XChinaRemoteRuntime=');
  eval(src);
  if(typeof XChinaRemoteRuntime!=='object'||String(XChinaRemoteRuntime.version||'')!==VERSION||Number(XChinaRemoteRuntime.build||0)!==BUILD)throw new Error('Test3 Runtime校验失败');
})();
