/* 溏心次元 0.1.0-test.5 Core patch: browser-source transport fallback */
(function(){
  if(typeof TxcyCore==='undefined')throw new Error('Txcy Test5 core preflight failed');
  var C=TxcyCore;
  C.version='0.1.0-test.5';
  C.build=10105;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/bootstrap_test_v5_b10105.js?v=10105';
  C.transportKey='txcy_transport_v5';
  C.webDiagKey='txcy_web_diag_v5';
  C.cfSessionKey='txcy_cf_session_v5';
  C.fetchDiagKey='txcy_fetch_diag_v5';

  C.transportMode=function(){
    var v='auto';
    try{v=C.clean(getItem(C.transportKey,'auto'))||'auto';}catch(e){}
    return /^(?:auto|native-cookie|webview)$/.test(v)?v:'auto';
  };
  C.setTransportMode=function(v){
    v=/^(?:auto|native-cookie|webview)$/.test(C.s(v))?C.s(v):'auto';
    try{setItem(C.transportKey,v);}catch(e){}
    return v;
  };
  C.readWebDiag=function(){try{return JSON.parse(getItem(C.webDiagKey,'{}'))||{};}catch(e){return{};}};
  C.saveWebDiag=function(x){try{setItem(C.webDiagKey,JSON.stringify(x||{}));}catch(e){}return x||{};};

  C.webCheckJs=function(){
    return function(){
      try{
        var t=((document.body&&document.body.innerText)||'').toLowerCase();
        var h=(location&&location.hostname)||'';
        if(!document.documentElement||!document.body)return null;
        if(t.indexOf('正在进行安全验证')>=0||t.indexOf('安全服务防护恶意自动程序')>=0||t.indexOf('just a moment')>=0||t.indexOf('verify you are human')>=0||t.indexOf('checking your browser')>=0)return null;
        if(document.querySelector('[id*="challenge"], [class*="challenge"], iframe[src*="challenge"], iframe[src*="turnstile"]'))return null;
        if(!h)return null;
        if(document.querySelector('a[href]')||document.querySelector('img')||document.querySelector('video')||document.querySelector('main,section,article'))return document.documentElement;
      }catch(e){}
      return null;
    };
  };

  C.browserFetch=function(url,opt){
    opt=opt||{};var start=new Date().getTime(),body='',err='',check,options={timeout:opt.timeout||30000,headers:{'User-Agent':C.ua,'Referer':opt.ref||url}};
    try{
      if(typeof fetchCodeByWebView!=='function')throw new Error('当前海阔环境不支持 fetchCodeByWebView');
      try{if(typeof $!=='undefined'&&$.toString)check=$.toString(C.webCheckJs());}catch(e0){check='';}
      if(check)options.checkJs=check;
      body=C.s(fetchCodeByWebView(url,options));
    }catch(e){err=C.s(e);body='';}
    var usable=C.looksUsableHtml?C.looksUsableHtml(body):(body.length>300&&!C.isChallengePage(body));
    var x={time:new Date().getTime(),url:C.s(url),len:body.length,elapsed:new Date().getTime()-start,ok:!!usable,challenge:C.isChallengePage(body),error:err,mode:'webview'};
    C.saveWebDiag(x);
    if(usable){C.setTransportMode('webview');C.saveFetchDiag(url,body,'');}
    else C.saveFetchDiag(url,body,err||'browser source unavailable');
    return{ok:!!usable,url:url,html:body,challenge:C.isChallengePage(body),error:err,diag:x,transport:'webview'};
  };

  C.nativeFetch=function(url,opt){
    opt=opt||{};var body='',err='';
    try{body=C.s(fetch(url,{timeout:opt.timeout||11500,headers:C.headers(opt.ref||url,opt.accept),redirect:true}));}
    catch(e){err=C.s(e);}
    C.saveFetchDiag(url,body,err);
    return{ok:!!(C.looksUsableHtml(body)||(opt.allowAny&&body.length>40)),url:url,html:body,challenge:C.isChallengePage(body),error:err,transport:'native'};
  };

  C.rawFetch=function(url,opt){
    opt=opt||{};var mode=C.transportMode(),n,w;
    if(mode==='webview'){
      w=C.browserFetch(url,{timeout:opt.webTimeout||opt.timeout||30000,ref:opt.ref||url});
      if(w.ok)return w.html;
      n=C.nativeFetch(url,opt);
      return n.html;
    }
    n=C.nativeFetch(url,opt);
    if(n.ok&&!n.challenge){
      if(C.liveCookie&&C.liveCookie())C.setTransportMode('native-cookie');
      return n.html;
    }
    if(n.challenge||!n.html||!C.looksUsableHtml(n.html)){
      w=C.browserFetch(url,{timeout:opt.webTimeout||30000,ref:opt.ref||url});
      if(w.ok)return w.html;
    }
    return n.html;
  };

  C.request=function(pathOrUrl,opt){
    opt=opt||{};
    var root=C.root(),u=/^https?:\/\//i.test(pathOrUrl)?pathOrUrl:C.abs(pathOrUrl,root),h=C.rawFetch(u,{timeout:opt.timeout||11500,webTimeout:opt.webTimeout||30000,ref:opt.ref||u,accept:opt.accept,allowAny:opt.allowAny});
    if(C.isChallengePage(h)){
      C.diag('challenge',opt.route||'html',u,'Cloudflare security verification',{len:h.length,transport:C.transportMode()});
      return{ok:false,challenge:true,url:u,html:h,root:root,transport:C.transportMode()};
    }
    if(C.isValidSiteHtml(h)||C.looksUsableHtml(h)||(opt.allowAny&&h.length>40)){
      C.diag('ok',opt.route||'html',u,'',{len:h.length,transport:C.transportMode()});
      return{ok:true,challenge:false,url:u,html:h,root:root,transport:C.transportMode()};
    }
    if(opt.noRetry){
      C.diag('request',opt.route||'html',u,'invalid html',{len:h.length,transport:C.transportMode()});
      return{ok:false,challenge:false,url:u,html:h,root:root,transport:C.transportMode()};
    }
    var d=C.discoverRoot(true);
    if(d&&d.ok){
      var u2=C.retarget(u,root,d.root),h2=C.rawFetch(u2,{timeout:opt.timeout||11500,webTimeout:opt.webTimeout||30000,ref:opt.ref||u2,accept:opt.accept,allowAny:opt.allowAny});
      if(C.isChallengePage(h2))return{ok:false,challenge:true,url:u2,html:h2,root:d.root,transport:C.transportMode()};
      if(C.isValidSiteHtml(h2)||C.looksUsableHtml(h2)||(opt.allowAny&&h2.length>40))return{ok:true,challenge:false,url:u2,html:h2,root:d.root,transport:C.transportMode()};
    }
    return{ok:false,challenge:false,url:u,html:h,root:C.root(),transport:C.transportMode()};
  };

  C.syncWebSession=function(){
    var root=C.root(),cookie=C.liveCookie?C.liveCookie():'',summary=C.cookieSummary?C.cookieSummary(cookie):{hasCookie:!!cookie,hasClearance:false,count:0,names:[],fingerprint:'none'},state={},nativeResult,webResult;
    if(cookie){
      nativeResult=C.nativeFetch(root,{timeout:14000,ref:root});
      if(nativeResult.ok&&!nativeResult.challenge){
        C.setTransportMode('native-cookie');
        state={ok:true,verifiedAt:new Date().getTime(),lastCheck:new Date().getTime(),transport:'native-cookie',fingerprint:summary.fingerprint||'cookie',hasClearance:!!summary.hasClearance,cookieNames:summary.names||[],htmlLen:nativeResult.html.length,error:''};
        C.writeCfState(state);
        return{ok:true,message:'站点会话已生效，当前使用原生 Cookie 请求。',summary:summary,len:nativeResult.html.length,transport:'native-cookie'};
      }
    }
    webResult=C.browserFetch(root,{timeout:32000,ref:root});
    if(webResult.ok){
      C.setTransportMode('webview');
      state={ok:true,verifiedAt:new Date().getTime(),lastCheck:new Date().getTime(),transport:'webview',fingerprint:summary.fingerprint||'none',hasClearance:!!summary.hasClearance,cookieNames:summary.names||[],htmlLen:webResult.html.length,error:''};
      C.writeCfState(state);
      return{ok:true,message:'验证后的真实页面已读取成功。当前改用浏览器会话取源码，不再依赖 getCookie。',summary:summary,len:webResult.html.length,transport:'webview'};
    }
    state={ok:false,lastCheck:new Date().getTime(),transport:'none',fingerprint:summary.fingerprint||'none',hasClearance:!!summary.hasClearance,cookieNames:summary.names||[],htmlLen:webResult.html?webResult.html.length:0,error:webResult.error||'浏览器源码仍未取得'};
    C.writeCfState(state);
    return{ok:false,message:'浏览器会话仍没有取到真实页面。请在验证页确认已经进入正常站点首页，再返回重试。',summary:summary,len:webResult.html?webResult.html.length:0,transport:'none',error:webResult.error||''};
  };

  C.cfStatus=function(){
    var live=C.cookieSummary?C.cookieSummary():{hasCookie:false,hasClearance:false,count:0,names:[],fingerprint:'none'},state=C.readCfState(),diag=C.fetchDiag(),web=C.readWebDiag();
    return{live:live,state:state,challenge:!!diag.challenge,lastUrl:diag.url||'',lastTitle:diag.title||'',lastLen:diag.len||0,transport:C.transportMode(),web:web};
  };
  C.clearCfState=function(){C.writeCfState({});C.setTransportMode('auto');C.saveWebDiag({});return true;};

  C.resolvePlay=(function(oldResolve){
    return function(url){
      var x=C.detail(url);
      if(x&&x.challenge)return'toast://请先完成站点安全验证';
      if(C.transportMode()==='webview'&&x&&(!x.media||!x.media.length))return'video://'+url;
      return oldResolve.call(C,url);
    };
  })(C.resolvePlay);

  C.module=function(){return C;};
})();
