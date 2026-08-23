/* XVideos Account/Pagination Core Patch 0.1.0-test.4 */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test4 account patch');
  var C=XVideosCore;
  C.version='0.1.0-test.4';
  C.build=10104;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/bootstrap_test_v4_b10104.js?v=10104';
  C.authSessionKey='xv_auth_session_v4';

  C.liveCookie=function(){
    var cookie='';
    try{cookie=C.clean(getCookie(C.base()));}catch(e){cookie='';}
    return cookie;
  };
  C.activeCookie=function(){
    if(!C.authEnabled())return'';
    return C.liveCookie()||C.clean(getItem(C.authCookieKey,''));
  };
  C.savedCookie=function(){return C.activeCookie();};
  C.authFingerprint=function(cookie){
    cookie=C.clean(cookie===undefined?C.activeCookie():cookie);
    if(!cookie)return'anon';
    return 's'+C.hash(cookie+'|'+cookie.length)+'l'+cookie.length;
  };
  C.headers=function(ref,auth,accept){
    var h={'User-Agent':C.ua,'Referer':ref||C.base()+'/','Accept':accept||'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9'};
    var cookie=auth?C.activeCookie():'';
    if(cookie)h.Cookie=cookie;
    return h;
  };
  C.fetchText=function(url,opt){
    opt=opt||{};
    var auth=!!opt.auth,cookie=auth?C.activeCookie():'',scope=auth?('auth:'+C.authFingerprint(cookie)+':'):'anon:';
    var key=C.cacheKey(scope+url),tsKey=key+'_ts',now=new Date().getTime(),ttl=opt.ttl===undefined?3*60*1000:opt.ttl;
    var old=getItem(key,''),ts=parseInt(getItem(tsKey,'0'),10)||0;
    if(!opt.force&&old&&now-ts<ttl)return old;
    var body='';
    try{body=C.s(fetch(url,{timeout:opt.timeout||12000,headers:C.headers(opt.ref||url,auth,opt.accept)}));}catch(e){body='';}
    if(!C.isBad(body)){
      if(body.length<240000){try{setItem(key,body);setItem(tsKey,String(now));}catch(e2){}}
      return body;
    }
    return old||body;
  };

  C.detectAccountName=function(html){
    var s=C.s(html),patterns=[
      /<(?:a|span|div)[^>]+class=["'][^"']*(?:account|current-user|user-profile|profile-name)[^"']*["'][^>]*>[\s\S]{0,600}?href=["']\/profiles\/([^"'\/?#]+)["']/i,
      /href=["']\/profiles\/([^"'\/?#]+)["'][^>]*>[\s\S]{0,200}?<(?:span|strong)[^>]+class=["'][^"']*(?:name|user)[^"']*["']/i
    ],m,i;
    for(i=0;i<patterns.length;i++){m=s.match(patterns[i]);if(m&&m[1]){try{return decodeURIComponent(m[1]);}catch(e){return m[1];}}}
    return'';
  };
  C.syncWebCookie=function(){
    var cookie=C.liveCookie();
    if(!cookie)return{ok:false,message:'未读取到 X5 登录 Cookie。请先在登录页用 X5 完成官网登录，再回来同步。'};
    setItem(C.authCookieKey,cookie);setItem(C.authEnabledKey,'1');setItem(C.accountNameKey,'');setItem(C.authSessionKey,C.authFingerprint(cookie));
    var h=C.fetchText(C.base()+'/',{force:true,ttl:0,auth:true,timeout:14000}),name=C.detectAccountName(h);
    if(name)setItem(C.accountNameKey,name);
    return{ok:true,message:name?('已同步当前 X5 会话：'+name):'当前 X5 Cookie 已同步。请进入喜欢/稍后看/历史核对账号私有内容。',name:name,fingerprint:C.authFingerprint(cookie)};
  };
  C.logoutLocal=function(){
    setItem(C.authEnabledKey,'0');setItem(C.authCookieKey,'');setItem(C.accountNameKey,'');setItem(C.authSessionKey,'');return true;
  };
  C.accountReady=function(){return C.authEnabled()&&!!C.activeCookie();};

  C.mainVideoRegion=function(html){
    var s=C.s(html),best='',bestCount=0,re=/<(?:div|section)\b[^>]*class=["'][^"']*(?:mozaique|video-list|videos-list|content-videos)[^"']*["'][^>]*>/ig,m,start,chunk,count;
    while((m=re.exec(s))){start=m.index;chunk=s.substring(start,Math.min(s.length,start+180000));count=(chunk.match(/class=["'][^"']*frame-block/ig)||[]).length;if(count>bestCount){bestCount=count;best=chunk;}}
    return bestCount?best:s;
  };
  C.accountVideos=function(kind,page){
    var u=C.accountUrl(kind,page);if(!u)return{url:'',cards:[],error:'未知账号列表'};
    var h=C.fetchText(u,{ttl:60*1000,auth:true}),region=C.mainVideoRegion(h),cards=C.parseVideoCards(region,u);
    return{url:u,cards:cards,error:C.isBad(h)?'账号页返回异常或登录态失效':'',session:C.authFingerprint()};
  };

  var oldComments=C.parseComments;
  C.parseComments=function(html,url){
    var s=C.s(html),out=[],seen={},re=/<(?:div|li|article)[^>]+class=["'][^"']*(?:comment|comments-item)[^"']*["'][^>]*>/ig,m,idx,ctx,a,i,user,text,time,img,key,tm,dm,nm;
    while((m=re.exec(s))&&out.length<100){
      idx=m.index;ctx=C.context(s,idx,100,2800);a=C.allAnchors(ctx,url);user='';
      for(i=0;i<a.length;i++)if(C.creatorPathKind&&C.creatorPathKind(a[i].href)){user=C.clean(a[i].text||a[i].title);if(user)break;}
      if(!user){nm=ctx.match(/<(?:span|strong|div)[^>]+class=["'][^"']*(?:comment-user|user-name|username|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|strong|div)>/i);if(nm)user=C.strip(nm[1]);}
      tm=ctx.match(/<(?:p|div|span)[^>]+class=["'][^"']*(?:comment-text|comment-body|comment-content|text)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|div|span)>/i);text=tm?C.strip(tm[1]):'';
      dm=ctx.match(/<(?:span|small|time)[^>]+class=["'][^"']*(?:date|time|ago)[^"']*["'][^>]*>([^<]+)</i);time=dm?C.strip(dm[1]):'';
      if(!user||!text||text.length<2||text.length>1600)continue;
      key=user+'|'+text;if(seen[key])continue;seen[key]=1;img=C.imgFrom(ctx,url);
      out.push({user:user,text:text,time:time,img:C.image(img,url),url:(a&&a.length&&C.creatorPathKind)?(function(){for(var z=0;z<a.length;z++)if(C.creatorPathKind(a[z].href))return a[z].href;return'';})():''});
    }
    if(out.length)return out;
    return oldComments?oldComments(html,url):[];
  };
})();
