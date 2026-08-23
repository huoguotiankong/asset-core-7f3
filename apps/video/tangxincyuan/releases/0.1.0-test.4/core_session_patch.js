/* 溏心次元 0.1.0-test.4 Core patch: Cloudflare/X5 session bridge */
(function(){
  if(typeof TxcyCore==='undefined')throw new Error('Txcy Test4 core preflight failed');
  var C=TxcyCore;
  C.version='0.1.0-test.4';
  C.build=10104;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/bootstrap_test_v4_b10104.js?v=10104';
  C.cfSessionKey='txcy_cf_session_v4';
  C.fetchDiagKey='txcy_fetch_diag_v4';
  try{if(typeof MOBILE_UA!=='undefined'&&MOBILE_UA)C.ua=String(MOBILE_UA);}catch(e0){}

  C.liveCookie=function(){
    var root=C.root(),cookie='';
    try{cookie=C.clean(getCookie(root));}catch(e1){}
    if(!cookie){try{cookie=C.clean(getCookie(C.origin(root)+'/'));}catch(e2){}}
    return cookie;
  };
  C.cookieFingerprint=function(cookie){
    cookie=C.clean(cookie===undefined?C.liveCookie():cookie);
    if(!cookie)return'none';
    return 'c'+C.hash(cookie+'|'+cookie.length)+'l'+cookie.length;
  };
  C.cookieSummary=function(cookie){
    cookie=C.clean(cookie===undefined?C.liveCookie():cookie);
    var names=[],seen={},parts=cookie?cookie.split(';'):[],i,n;
    for(i=0;i<parts.length;i++){
      n=C.trim(parts[i]).split('=')[0];
      if(n&&!seen[n]){seen[n]=1;names.push(n);}
    }
    return {hasCookie:!!cookie,hasClearance:/(?:^|;\s*)cf_clearance=/i.test(cookie),count:names.length,names:names.slice(0,12),fingerprint:C.cookieFingerprint(cookie)};
  };
  C.readCfState=function(){try{return JSON.parse(getItem(C.cfSessionKey,'{}'))||{};}catch(e){return{};}};
  C.writeCfState=function(x){try{setItem(C.cfSessionKey,JSON.stringify(x||{}));}catch(e){}return x||{};};

  C.isChallengePage=function(body){
    var s=C.s(body),l=s.toLowerCase();
    if(!s)return false;
    return /正在进行安全验证|安全服务防护恶意自动程序|验证您不是自动程序|完成以下操作以确认您是真人|ray id/i.test(s)
      || l.indexOf('just a moment')>=0
      || l.indexOf('cf-chl-')>=0
      || l.indexOf('challenge-platform')>=0
      || l.indexOf('turnstile')>=0
      || (l.indexOf('cloudflare')>=0&&/验证|verification|challenge|security/i.test(s));
  };

  C.fetchDiag=function(){try{return JSON.parse(getItem(C.fetchDiagKey,'{}'))||{};}catch(e){return{};}};
  C.saveFetchDiag=function(url,body,error){
    var s=C.s(body),title='',plain='',m,cookie=C.cookieSummary();
    try{m=s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);title=m?C.strip(m[1]):'';}catch(e0){}
    try{plain=C.strip(s.substring(0,Math.min(s.length,14000))).substring(0,260);}catch(e1){}
    var x={time:new Date().getTime(),url:C.s(url),len:s.length,title:title,head:plain,error:C.s(error),html:/<(?:html|body|div|a|script|img)\b/i.test(s),challenge:C.isChallengePage(s),cookie:cookie};
    try{setItem(C.fetchDiagKey,JSON.stringify(x));}catch(e2){}
    return x;
  };

  var baseHeaders=C.headers;
  C.headers=function(ref,accept){
    var h=baseHeaders(ref,accept)||{},cookie=C.liveCookie();
    h['User-Agent']=C.ua;
    if(cookie)h.Cookie=cookie;
    return h;
  };
  C.image=function(u,ref){
    u=C.abs(u,ref||C.root());if(!u)return'';
    var h={'User-Agent':C.ua,'Referer':ref||C.root()},cookie=C.liveCookie();
    if(cookie&&C.origin(u)===C.origin(C.root()))h.Cookie=cookie;
    return u+'@headers='+JSON.stringify(h);
  };
  C.video=function(u,ref){
    u=C.clean(u);if(!u)return'';
    var x=';{Referer@'+(ref||C.root())+'&&User-Agent@'+C.ua,cookie=C.liveCookie();
    if(cookie&&C.origin(u)===C.origin(C.root()))x+='&&Cookie@'+cookie;
    return u+x+'}#isVideo=true#';
  };

  C.looksUsableHtml=function(body){
    var s=C.s(body);
    if(s.length<300||C.isChallengePage(s))return false;
    return /<(?:html|body|main|section|div|a|script|img)\b/i.test(s);
  };
  C.rawFetch=function(url,opt){
    opt=opt||{};var s='',err='';
    try{s=C.s(fetch(url,{timeout:opt.timeout||11000,headers:C.headers(opt.ref||url,opt.accept),redirect:true}));}
    catch(e){err=C.s(e);C.diag('request','fetch',url,err);}
    C.saveFetchDiag(url,s,err);
    return s;
  };

  C.request=function(pathOrUrl,opt){
    opt=opt||{};
    var root=C.root(),u=/^https?:\/\//i.test(pathOrUrl)?pathOrUrl:C.abs(pathOrUrl,root),h=C.rawFetch(u,{timeout:opt.timeout||11500,ref:opt.ref||u,accept:opt.accept});
    if(C.isChallengePage(h)){
      C.diag('challenge',opt.route||'html',u,'Cloudflare security verification',{len:h.length,cookie:C.cookieSummary()});
      return{ok:false,challenge:true,url:u,html:h,root:root};
    }
    if(C.isValidSiteHtml(h)||C.looksUsableHtml(h)||(opt.allowAny&&h.length>40)){
      C.diag('ok',opt.route||'html',u,'',{len:h.length,cookie:C.cookieSummary()});
      return{ok:true,challenge:false,url:u,html:h,root:root};
    }
    if(opt.noRetry){
      C.diag('request',opt.route||'html',u,'invalid html',{len:h.length,cookie:C.cookieSummary()});
      return{ok:false,challenge:false,url:u,html:h,root:root};
    }
    var d=C.discoverRoot(true);
    if(d&&d.ok){
      var u2=C.retarget(u,root,d.root),h2=C.rawFetch(u2,{timeout:opt.timeout||11500,ref:opt.ref||u2,accept:opt.accept});
      if(C.isChallengePage(h2))return{ok:false,challenge:true,url:u2,html:h2,root:d.root};
      if(C.isValidSiteHtml(h2)||C.looksUsableHtml(h2)||(opt.allowAny&&h2.length>40)){
        C.diag('ok',(opt.route||'html')+'-failover',u2,'',{len:h2.length,cookie:C.cookieSummary()});
        return{ok:true,challenge:false,url:u2,html:h2,root:d.root};
      }
    }
    C.diag('request','root-failover',u,'site html invalid',{len:h.length,cookie:C.cookieSummary()});
    return{ok:false,challenge:false,url:u,html:h,root:C.root()};
  };

  C.syncWebSession=function(){
    var cookie=C.liveCookie(),summary=C.cookieSummary(cookie),root=C.root(),h='',state=C.readCfState();
    if(!cookie){
      state.lastCheck=new Date().getTime();state.ok=false;state.error='未读取到 X5 Cookie';state.fingerprint='none';C.writeCfState(state);
      return{ok:false,message:'还没有读取到浏览器会话。请先打开安全验证页并完成验证，再返回检查。',summary:summary};
    }
    h=C.rawFetch(root,{timeout:14000,ref:root});
    summary=C.cookieSummary(cookie);
    if(C.isChallengePage(h)||!C.looksUsableHtml(h)){
      state.lastCheck=new Date().getTime();state.ok=false;state.error=C.isChallengePage(h)?'安全验证仍未通过':'返回页面仍不可用';state.fingerprint=summary.fingerprint;C.writeCfState(state);
      return{ok:false,message:C.isChallengePage(h)?'当前会话仍停留在安全验证页，请继续在 X5 中完成验证。':'已读取 Cookie，但首页还没有恢复，请再验证一次。',summary:summary,len:h.length};
    }
    state={ok:true,verifiedAt:new Date().getTime(),lastCheck:new Date().getTime(),fingerprint:summary.fingerprint,hasClearance:summary.hasClearance,cookieNames:summary.names,htmlLen:h.length,error:''};
    C.writeCfState(state);
    return{ok:true,message:'站点会话已生效，返回首页后会自动复用当前 X5 Cookie。',summary:summary,len:h.length};
  };
  C.cfStatus=function(){
    var live=C.cookieSummary(),state=C.readCfState(),diag=C.fetchDiag();
    return{live:live,state:state,challenge:!!diag.challenge,lastUrl:diag.url||'',lastTitle:diag.title||'',lastLen:diag.len||0};
  };
  C.clearCfState=function(){C.writeCfState({});return true;};

  function markChallenge(result){
    result=result||{};result.challenge=C.isChallengePage(result.html||'');return result;
  }
  var oldHome=C.home,oldCategory=C.category,oldSearch=C.search,oldDetail=C.detail;
  C.home=function(page){return markChallenge(oldHome(page));};
  C.category=function(url,page){return markChallenge(oldCategory(url,page));};
  C.search=function(q,page){return markChallenge(oldSearch(q,page));};
  C.detail=function(url){var x=oldDetail(url),fd=C.fetchDiag();if(fd.challenge){x.challenge=true;x.ok=false;}return x;};
  C.mediaHeaders=function(ref,url){var h={'Referer':ref||C.root(),'User-Agent':C.ua},cookie=C.liveCookie();if(cookie&&C.origin(url||'')===C.origin(C.root()))h.Cookie=cookie;return h;};
  C.resolvePlay=function(url){
    var x=C.detail(url),m=x.media||[],names=[],urls=[],headers=[],i;
    if(x.blocked)return'toast://该条目未在本程序中开放';
    if(x.challenge)return'toast://请先完成站点安全验证';
    if(m.length===1){C.diag('play','direct-'+m[0].route,m[0].url,'');return C.video(m[0].url,m[0].ref||x.url);}
    if(m.length>1){for(i=0;i<m.length&&i<10;i++){urls.push(m[i].url);names.push((m[i].route==='iframe'?'内嵌':'线路')+' '+(i+1));headers.push(C.mediaHeaders(m[i].ref||x.url,m[i].url));}C.diag('play','multi-direct',x.url,'',{count:urls.length});return JSON.stringify({urls:urls,names:names,headers:headers});}
    C.diag('play','video-sniff',x.url,'no structured media');return'video://'+x.url;
  };
  C.playMedia=function(media,ref){var m=media||[],names=[],urls=[],headers=[],i;if(m.length===1)return C.video(m[0].url,m[0].ref||ref);if(m.length>1){for(i=0;i<m.length&&i<10;i++){urls.push(m[i].url);names.push((m[i].route==='iframe'?'内嵌':'线路')+' '+(i+1));headers.push(C.mediaHeaders(m[i].ref||ref||C.root(),m[i].url));}return JSON.stringify({urls:urls,names:names,headers:headers});}return'';};

  C.module=function(){return C;};
})();
