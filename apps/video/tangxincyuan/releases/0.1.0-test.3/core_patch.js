/* 溏心次元 0.1.0-test.3 Core patch: same-rule routing + loose HTML diagnostics */
(function(){
  if(typeof TxcyCore==='undefined')throw new Error('Txcy Test3 core preflight failed');
  var C=TxcyCore;
  C.version='0.1.0-test.3';
  C.build=10103;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/bootstrap_test_v3_b10103.js?v=10103';
  C.fetchDiagKey='txcy_fetch_diag_v3';

  /* Inside the current mini-app, rule=&simple=true is the proven Hiker same-rule route.
     Encoding a Chinese rule title into rule= made Hiker look for the literal %E6... name. */
  C.ruleTitle=function(){return'';};
  C.page=function(path,params){
    var a=['rule=','simple=true'],k;params=params||{};
    for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));
    return'hiker://page/'+path+'?'+a.join('&');
  };

  C.fetchDiag=function(){try{return JSON.parse(getItem(C.fetchDiagKey,'{}'))||{};}catch(e){return{};}};
  C.saveFetchDiag=function(url,body,error){
    var s=C.s(body),title='',plain='',m;
    try{m=s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);title=m?C.strip(m[1]):'';}catch(e0){}
    try{plain=C.strip(s.substring(0,Math.min(s.length,12000))).substring(0,220);}catch(e1){}
    var x={time:new Date().getTime(),url:C.s(url),len:s.length,title:title,head:plain,error:C.s(error),html:/<(?:html|body|div|a|script|img)\b/i.test(s),challenge:/just a moment|cf-chl-|captcha|cloudflare/i.test(s)};
    try{setItem(C.fetchDiagKey,JSON.stringify(x));}catch(e2){}
    return x;
  };
  C.looksUsableHtml=function(body){
    var s=C.s(body),l=s.toLowerCase();
    if(s.length<300)return false;
    if(l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('captcha')>=0&&s.length<12000)return false;
    return /<(?:html|body|main|section|div|a|script|img)\b/i.test(s);
  };

  C.rawFetch=function(url,opt){
    opt=opt||{};var s='';
    try{
      s=C.s(fetch(url,{timeout:opt.timeout||10000,headers:C.headers(opt.ref||url,opt.accept),redirect:true}));
      C.saveFetchDiag(url,s,'');
      return s;
    }catch(e){
      C.saveFetchDiag(url,'',C.s(e));
      C.diag('request','fetch',url,C.s(e));
      return'';
    }
  };

  var oldRequest=C.request;
  C.request=function(pathOrUrl,opt){
    opt=opt||{};var r=oldRequest(pathOrUrl,opt);
    if(r&&!r.ok&&C.looksUsableHtml(r.html)){
      r.ok=true;r.loose=true;
      C.diag('ok-loose',opt.route||'html',r.url,'',{len:C.s(r.html).length});
    }
    return r;
  };

  var strictParse=C.parseCards;
  C.parseCards=function(html,base){
    var a=strictParse(html,base);if(a&&a.length)return a;
    var s=C.s(html),links=C.extractAnchors(s,base,1500),out=[],seen={},i,x,ctx,img,title,p,im,am,item;
    for(i=0;i<links.length&&out.length<100;i++){
      x=links[i];p=C.pathOf(x.url).toLowerCase();
      if(!x.url||seen[p]||C.urlLooksUtility(x.url,x.text)||C.looksCategoryName(x.text))continue;
      if(/\/(?:category|categories|cate|class|type|channel|tag|actor|star|model|performer|author)(?:\/|\?|$)/i.test(p))continue;
      ctx=C.context(s,x.index,650,1500);img=C.firstImage(x.inner,x.url)||C.firstImage(ctx,x.url);if(!img)continue;
      title=C.clean(C.attr(x.attrs,'title')||C.attr(x.attrs,'aria-label')||x.text);
      if(!title||title.length<4){im=x.inner.match(/<img\b([^>]*)>/i);if(im)title=C.clean(C.attr(im[1],'alt')||C.attr(im[1],'title'));}
      if(!title||title.length<4){am=ctx.match(/<(?:h2|h3|h4|p|span)[^>]*>([^<>]{4,180})<\/(?:h2|h3|h4|p|span)>/i);if(am)title=C.clean(am[1]);}
      if(!title||title.length<4||title.length>220||C.restrictedText(title))continue;
      if(C.origin(x.url)===C.origin(base)&&C.pathOf(x.url).replace(/[?#].*$/,'')===C.pathOf(base).replace(/[?#].*$/,''))continue;
      item={url:x.url,title:title,img:C.image(img,x.url),rawImg:img,date:C.dateFrom(ctx),category:'',desc:C.dateFrom(ctx)};
      if(!C.safeItem(item))continue;seen[p]=1;out.push(item);
    }
    return out;
  };

  C.module=function(){return C;};
})();