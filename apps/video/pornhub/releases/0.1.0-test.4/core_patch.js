/* Pornhub Remote Core Patch 0.1.0-test.4 */
(function(){
  if(typeof PornhubCore!=='object')throw new Error('PornhubCore missing for Test4 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.4';
  C.build=10104;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v4_b10104.js?v=10104';
  C.profileFavoriteKey='ph_local_profiles_v4';
  C.playlistFavoriteKey='ph_local_playlists_v4';
  C.authSessionKey='ph_auth_session_fp_v4';

  C.liveCookie=function(){
    var cookie='';
    try{cookie=C.clean(getCookie(C.base()));}catch(e){cookie='';}
    return cookie||C.savedCookie();
  };
  C.cookieFingerprint=function(cookie){cookie=C.clean(cookie||C.liveCookie());return cookie?String(C.hash(cookie+'|'+cookie.length)):'';};
  C.accountSessionFingerprint=function(){return C.clean(getItem(C.authSessionKey,''));};

  var oldHeaders=C.headers;
  C.headers=function(ref,auth,accept){
    var h=oldHeaders(ref,false,accept),cookie=auth?C.liveCookie():'';
    if(auth)h.Cookie=cookie||C.savedCookie()||'platform=pc';
    return h;
  };
  C.fetchAuthPage=function(url,opt){
    opt=opt||{};
    var cookie=C.liveCookie(),fp=C.cookieFingerprint(cookie),ttl=opt.ttl===undefined?60*1000:opt.ttl,now=new Date().getTime();
    if(!cookie)return'';
    var key='ph_auth4_'+fp+'_'+C.hash(url),tsKey=key+'_ts',old=getItem(key,''),ts=parseInt(getItem(tsKey,'0'),10)||0;
    if(!opt.force&&old&&now-ts<ttl)return old;
    var body='';
    try{body=C.s(fetch(url,{timeout:opt.timeout||12000,headers:C.headers(opt.ref||url,true,opt.accept)}));}catch(e){body='';}
    if(!C.isBad(body)){
      if(body.length<280000){try{setItem(key,body);setItem(tsKey,String(now));}catch(e2){}}
      return body;
    }
    return old||body;
  };
  C.authRequest=function(url,method,body,ref){
    var cookie=C.liveCookie();
    if(!cookie)return{ok:false,body:'',error:'未读取到 X5 网页登录 Cookie'};
    var h=C.headers(ref||url,true,'application/json,text/plain,*/*');
    h.Cookie=cookie;h['X-Requested-With']='XMLHttpRequest';
    if((method||'GET').toUpperCase()==='POST')h['Content-Type']='application/x-www-form-urlencoded; charset=UTF-8';
    var raw='';
    try{raw=C.s(fetch(url,{method:(method||'GET').toUpperCase(),body:body||'',timeout:12000,headers:h}));}
    catch(e){return{ok:false,body:'',error:C.s(e)}}
    return{ok:!!raw,body:raw,error:raw?'':'空响应'};
  };
  C.tokenFrom=function(html){
    var s=C.s(html),m=s.match(/\btoken\s*=\s*["']([^"']+)["']/i)||s.match(/<input\b[^>]*name=["']token["'][^>]*value=["']([^"']+)["']/i)||s.match(/<input\b[^>]*value=["']([^"']+)["'][^>]*name=["']token["']/i);
    return m?C.decode(m[1]):'';
  };

  C.syncWebCookie=function(){
    var cookie='';try{cookie=C.clean(getCookie(C.base()));}catch(e){cookie='';}
    if(!cookie)return{ok:false,identity:false,message:'没有读取到 Pornhub X5 登录 Cookie。请用本页的“X5 官方登录”完成登录，不要使用外部浏览器。'};
    var sec='';
    try{sec=C.s(fetch(C.base()+'/user/security',{timeout:12000,headers:(function(){var h=C.headers(C.base()+'/user/security',false);h.Cookie=cookie;return h;})()}));}catch(e2){sec='';}
    var id=C.securityIdentity?C.securityIdentity(sec):{name:'',source:''};
    var logged=(C.securityLooksLogged&&C.securityLooksLogged(sec))||!!id.name;
    if(!logged){
      if(C.clearAccountIdentity)C.clearAccountIdentity();setItem(C.authEnabledKey,'0');setItem(C.authCookieKey,'');setItem(C.authSessionKey,'');
      return{ok:false,identity:false,message:'X5 Cookie 已读取，但账号安全页没有确认登录。请在 X5 官方页面确认登录后再同步。'};
    }
    setItem(C.authCookieKey,cookie);setItem(C.authEnabledKey,'1');setItem(C.authSessionKey,C.cookieFingerprint(cookie));
    if(C.clearAccountIdentity)C.clearAccountIdentity();
    if(id.name&&C.isSafeUsername&&C.isSafeUsername(id.name)){
      setItem(C.accountNameKey,id.name);if(C.accountIdentitySourceKey)setItem(C.accountIdentitySourceKey,id.source||'x5-security');
      if(C.refreshAccountAvatar)C.refreshAccountAvatar(id.name,cookie);
      return{ok:true,identity:true,name:id.name,message:'X5 登录会话已同步：'+id.name};
    }
    return{ok:true,identity:false,name:'',message:'X5 登录会话已验证。用户名未可靠识别时不会猜号；推荐/Feed 可直接使用，用户名专属页面可手动绑定。'};
  };

  C.videoIdFrom=function(html){
    var s=C.s(html),m=s.match(/\bvideo_id["']?\s*[:=]\s*["']?(\d+)/i)||s.match(/\bdata-video-id=["'](\d+)["']/i)||s.match(/\bvideoId["']?\s*[:=]\s*["']?(\d+)/i)||s.match(/"video_id"\s*:\s*"?(\d+)"?/i);
    return m?m[1]:'';
  };
  C.viewKeyFrom=function(url,html){var m=C.s(url).match(/[?&]viewkey=([^&#]+)/i);if(m)return m[1];m=C.s(html).match(/\bvideo_url\b[\s\S]{0,300}?viewkey=([a-z0-9]+)/i);return m?m[1]:'';};
  C.onlineVideoFavoriteState=function(html){return /js-favoriteBtn[^>]*\bactive\b|\bactive\b[^>]*js-favoriteBtn/i.test(C.s(html));};
  C.toggleOnlineVideoFavorite=function(url){
    var h=C.fetchAuthPage(url,{force:true,ttl:0}),id=C.videoIdFrom(h),token=C.tokenFrom(h),on=C.onlineVideoFavoriteState(h);
    if(!h||C.isBad(h))return{ok:false,message:'账号会话未能读取当前视频页，请重新 X5 登录并同步。'};
    if(!id||!token)return{ok:false,message:'当前页面没有解析到在线视频收藏所需的 video id/token。'};
    var r=C.authRequest(C.base()+'/video/favourite','POST',C.form({toggle:on?0:1,id:id,token:token}),url),j=null;
    try{j=JSON.parse(r.body);}catch(e){}
    if(!r.ok||(j&&j.success===false))return{ok:false,message:(j&&j.message)||r.error||'在线收藏操作失败'};
    return{ok:true,on:!on,message:on?'已取消 Pornhub 在线收藏':'已加入 Pornhub 在线收藏'};
  };

  C.creatorSubscribeInfo=function(html,url){
    var s=C.s(html),re=/<(?:button|a)\b[^>]*(?:data-subscribe-url|data-unsubscribe-url)[^>]*>/ig,m,tag,sub,unsub,state;
    while((m=re.exec(s))){
      tag=m[0];sub=C.attr(tag,'data-subscribe-url');unsub=C.attr(tag,'data-unsubscribe-url');
      if(!sub&&!unsub)continue;
      state=C.attr(tag,'data-subscribed');
      return{subUrl:C.abs(sub,url),unsubUrl:C.abs(unsub,url),subscribed:state!==''?state==='1':/class=["'][^"']*\bsubscribed\b/i.test(tag)};
    }
    return{subUrl:'',unsubUrl:'',subscribed:false};
  };
  C.toggleCreatorSubscription=function(url){
    var h=C.fetchAuthPage(url,{force:true,ttl:0}),a=C.creatorSubscribeInfo(h,url),target=a.subscribed?a.unsubUrl:a.subUrl;
    if(!h||C.isBad(h))return{ok:false,message:'未能读取创作者页，请重新 X5 登录并同步。'};
    if(!target)return{ok:false,web:true,message:'当前页面未发现可直接调用的订阅动作，请在官方页完成。'};
    var r=C.authRequest(target,'GET','',url),j=null;
    try{j=JSON.parse(r.body);}catch(e){}
    if(!r.ok||(j&&j.success===false))return{ok:false,message:(j&&j.message)||r.error||'在线订阅操作失败'};
    return{ok:true,on:!a.subscribed,message:a.subscribed?'已取消在线订阅':'已在线订阅'};
  };

  C.isEntityFav=function(key,url){var a=C.readList(key),i;for(i=0;i<a.length;i++)if(a[i].url===url)return true;return false;};
  C.toggleEntityFav=function(key,x){
    x=C.sanitizeItem(x);var a=C.readList(key),out=[],found=false,i;
    for(i=0;i<a.length;i++){if(a[i].url===x.url){found=true;continue;}out.push(a[i]);}
    if(!found)out.unshift(x);C.writeList(key,out);return!found;
  };

  C.parseVideoBlocks=function(html,base){
    var s=C.s(html),out=[],seen={},re=/<li\b[^>]*class=["'][^"']*(?:videoblock|videoBlock)[^"']*["'][^>]*>[\s\S]*?<\/li>/ig,m,a,i;
    while((m=re.exec(s))){a=C.parseVideoCards(m[0],base);for(i=0;i<a.length;i++){if(!seen[a[i].url]){seen[a[i].url]=1;out.push(a[i]);}}}
    return out;
  };
  C.parseSubscriptionProfiles=function(html,base){
    var s=C.s(html),out=[],seen={},re=/<(?:li|div|article)\b[^>]*class=["'][^"']*(?:userLink|subscription|subscribed)[^"']*["'][^>]*>[\s\S]{0,3500}?<\/(?:li|div|article)>/ig,m,block,a,i,it,typ,name,img;
    while((m=re.exec(s))){
      block=m[0];a=C.allAnchors(block,base||C.base());it=null;typ='';
      for(i=0;i<a.length;i++){typ=C.profileType(a[i].href);if(typ){it=a[i];break;}}
      if(!it||seen[it.href])continue;
      name=C.clean(it.title||it.text);if(C.isBadProfileLabel&&C.isBadProfileLabel(name))name=C.profileBlockName?C.profileBlockName(block,it.href):'';
      img=it.img||(C.profileBlockImage?C.profileBlockImage(block,it.href):'');
      if(!name||!img)continue;seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:typ,desc:typ});
    }
    if(out.length)return out;
    var marker=/\buserLink\b/ig,marks=[];while((m=marker.exec(s)))marks.push(m.index);
    for(var z=0;z<marks.length;z++){
      block=s.substring(Math.max(0,marks[z]-250),Math.min(s.length,marks[z]+1800));a=C.allAnchors(block,base||C.base());
      for(i=0;i<a.length;i++){it=a[i];typ=C.profileType(it.href);if(!typ||seen[it.href])continue;name=C.clean(it.title||it.text);img=it.img||(C.profileBlockImage?C.profileBlockImage(block,it.href):'');if(!name||!img)continue;seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:typ,desc:typ});break;}
    }
    return out;
  };
  C.accountVideos=function(kind,page){
    var u=C.accountUrl(kind,page);if(!u)return{url:'',cards:[],error:'账号用户名缺失'};
    var h=C.fetchAuthPage(u,{ttl:60*1000}),cards=C.parseVideoBlocks(h,u);
    if(!cards.length&&(kind==='recommended'||kind==='feed'))cards=C.parseVideoCards(h,u);
    return{url:u,cards:cards,error:C.isBad(h)?'X5 登录会话在账号页未生效或页面返回异常':''};
  };
  C.subscriptions=function(page){
    var u=C.accountUrl('subscriptions',page);if(!u)return{url:'',profiles:[],error:'账号用户名缺失'};
    var h=C.fetchAuthPage(u,{ttl:90*1000}),p=C.parseSubscriptionProfiles(h,u);
    return{url:u,profiles:p,error:C.isBad(h)?'X5 登录会话在订阅页未生效或页面返回异常':''};
  };

  C.parsePlaylistCards=function(html,base){
    var s=C.s(html),a=C.allAnchors(s,base||C.base()),out=[],seen={},i,it,ctx,title,img,count,m;
    for(i=0;i<a.length;i++){
      it=a[i];if(!/\/playlist\/\d+/i.test(it.href)||seen[it.href])continue;
      ctx=C.context(s,it.index,500,1300);title=C.clean(it.title||it.text);
      if(!title||title.length>160){m=ctx.match(/(?:title|alt)=["']([^"']{2,160})["']/i);title=m?C.clean(m[1]):'';}
      if(!title||/^(playlist|play all)$/i.test(title))continue;
      img=it.img||C.imgFrom(ctx,it.href);count='';m=ctx.match(/(\d[\d,.]*)\s+videos?/i);if(m)count=m[1]+' videos';
      seen[it.href]=1;out.push({url:it.href,title:title,img:C.image(img,it.href),rawImg:img,desc:count});
    }
    return out;
  };
  C.playlistList=function(page){var u=C.queryPage(C.base()+'/playlists',page||1),h=C.fetchText(u,{ttl:5*60*1000}),cards=C.parsePlaylistCards(h,u);return{url:u,cards:cards};};
  C.playlistDetail=function(url){
    var h=C.fetchText(url,{ttl:4*60*1000,auth:C.accountReady()}),title=C.meta(h,'og:title')||'',desc=C.meta(h,'og:description')||'',img=C.meta(h,'og:image')||'',videos=C.parseVideoBlocks(h,url);
    title=C.clean(title.replace(/\s*[-|｜]\s*Pornhub.*$/i,''));
    if(!videos.length)videos=C.parseVideoCards(h,url);
    return{url:url,title:title||'Playlist',desc:C.clean(desc),rawImg:img,img:C.image(img,url),videos:videos,html:h};
  };
  C.playlistOnlineInfo=function(html,url){
    var s=C.s(html),re=/<(?:button|a)\b[^>]*(?:playlist|favorite|favourite|save)[^>]*>/ig,m,tag,act,state;
    while((m=re.exec(s))){
      tag=m[0];if(!/playlist/i.test(tag))continue;
      act=C.attr(tag,'data-subscribe-url')||C.attr(tag,'data-favorite-url')||C.attr(tag,'data-favourite-url')||C.attr(tag,'data-save-url')||C.attr(tag,'data-url');
      if(!act)continue;state=/\bactive\b|data-(?:subscribed|saved|favorite|favourite)=["']1["']/i.test(tag);
      return{url:C.abs(act,url),active:state};
    }
    return{url:'',active:false};
  };
  C.togglePlaylistOnline=function(url){
    var h=C.fetchAuthPage(url,{force:true,ttl:0}),a=C.playlistOnlineInfo(h,url);
    if(!h||C.isBad(h))return{ok:false,message:'未能用 X5 登录会话读取片单页。'};
    if(!a.url)return{ok:false,web:true,message:'当前片单没有暴露可安全直调的在线收藏动作，请在官方页完成。'};
    var r=C.authRequest(a.url,'GET','',url);if(!r.ok)return{ok:false,message:r.error||'在线片单操作失败'};
    return{ok:true,message:'在线片单操作已提交'};
  };

  C.commentCount=function(html){var s=C.s(html),m=s.match(/(?:comments?|评论)\s*\(?([\d,.]+)\)?/i)||s.match(/comment_count["']?\s*[:=]\s*["']?(\d+)/i);return m?C.clean(m[1]):'';};
  C.parseComments=function(html,url){
    var s=C.s(html),idx=s.search(/id=["']cmtContent["']|class=["'][^"']*commentBlock/i),region=idx>=0?s.substring(idx,Math.min(s.length,idx+180000)):s;
    var starts=[],re=/<(?:div|li)\b[^>]*class=["'][^"']*commentBlock[^"']*["'][^>]*>/ig,m;
    while((m=re.exec(region)))starts.push(m.index);
    var out=[],seen={},i,block,msg,author='',avatar='',time='',likes='',a,mm;
    for(i=0;i<starts.length&&i<60;i++){
      block=region.substring(starts[i],i+1<starts.length?starts[i+1]:Math.min(region.length,starts[i]+9000));
      mm=block.match(/class=["'][^"']*commentMessage[^"']*["'][^>]*>([\s\S]{0,3500}?)<\/(?:div|span|p)>/i);msg=mm?C.strip(mm[1]):'';
      if(!msg||msg.length<1||msg.length>3000)continue;
      a=C.allAnchors(block,url);author='';avatar='';
      for(var j=0;j<a.length;j++){if(C.profileType(a[j].href)){author=C.clean(a[j].text||a[j].title);avatar=a[j].img||C.imgFrom(block,a[j].href);if(author)break;}}
      if(!author){mm=block.match(/class=["'][^"']*(?:username|userName|commentUsername)[^"']*["'][^>]*>([\s\S]{0,200}?)<\//i);author=mm?C.strip(mm[1]):'用户';}
      if(!avatar)avatar=C.imgFrom(block,url);
      mm=block.match(/class=["'][^"']*(?:commentDate|date|timestamp|time)[^"']*["'][^>]*>([^<]{1,100})</i);time=mm?C.strip(mm[1]):'';
      mm=block.match(/class=["'][^"']*(?:votesUp|likes|voteCount)[^"']*["'][^>]*>([^<]{1,40})</i);likes=mm?C.strip(mm[1]):'';
      var key=author+'|'+msg;if(seen[key])continue;seen[key]=1;
      out.push({author:author,message:msg,time:time,likes:likes,img:C.image(avatar,url),rawImg:avatar});
    }
    return out;
  };
  C.comments=function(url){var h=C.fetchText(url,{force:false,ttl:2*60*1000,auth:C.accountReady()}),a=C.parseComments(h,url);return{url:url,comments:a,count:C.commentCount(h),html:h};};
})();
