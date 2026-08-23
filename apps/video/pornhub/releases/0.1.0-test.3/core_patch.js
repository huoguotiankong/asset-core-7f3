/* Pornhub Remote Core Patch 0.1.0-test.3 */
(function(){
  if(typeof PornhubCore!=='object')throw new Error('PornhubCore missing for Test3 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.3';
  C.build=10103;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v3_b10103.js?v=10103';
  C.accountAvatarKey='ph_account_avatar_v3';
  C.accountIdentitySourceKey='ph_account_identity_source_v3';

  C.isSafeUsername=function(v){
    v=C.clean(v);
    return !!v && v.length>=2 && v.length<=80 && !/^(login|logout|signup|register|users?|account|profile|settings)$/i.test(v) && !/^\d+$/.test(v);
  };
  C.isBadProfileLabel=function(v){
    v=C.clean(v);
    return !v || v.length>100 || /^\d+(?:[.,]\d+)?[KMB]?$/i.test(v) || /^(pornstar|model|channel|user|creator|profile|videos?|views?|subscribers?|rank|play\s*all|watch\s*all)$/i.test(v);
  };
  C.accountAvatar=function(){return C.clean(getItem(C.accountAvatarKey,''));};
  C.accountIdentitySource=function(){return C.clean(getItem(C.accountIdentitySourceKey,''));};
  C.accountIdentityReady=function(){return C.accountReady()&&C.isSafeUsername(C.accountName());};
  C.clearAccountIdentity=function(){setItem(C.accountNameKey,'');setItem(C.accountAvatarKey,'');setItem(C.accountIdentitySourceKey,'');};

  C.fetchWithCookie=function(url,cookie){
    var h=C.headers(url,false);h.Cookie=C.clean(cookie)||'platform=pc';
    try{return C.s(fetch(url,{timeout:12000,headers:h}));}catch(e){return'';}
  };
  C.valueAttr=function(tag){return C.decode(C.attr(tag,'value')||'');};
  C.securityIdentity=function(html){
    var s=C.s(html),m,tag,name='',source='';
    var re=/<input\b[^>]*>/ig;
    while((m=re.exec(s))){
      tag=m[0];
      var key=(C.attr(tag,'name')||C.attr(tag,'id')||'').toLowerCase();
      if(/^(?:username|user_name|user-name|profileusername|profile_username)$/.test(key)||/username/.test(key)){
        name=C.valueAttr(tag);
        if(C.isSafeUsername(name)){source='security-input';break;}
      }
    }
    if(!name){
      m=s.match(/\bdata-(?:user(?:name)?|profile-username)\s*=\s*["']([^"']+)["']/i);
      if(m&&C.isSafeUsername(m[1])){name=C.decode(m[1]);source='security-data';}
    }
    if(!name){
      var a=C.allAnchors(s,C.base()),i,u,raw,n;
      for(i=0;i<a.length;i++){
        u=a[i].href;raw=a[i].raw||'';
        m=u.match(/\/users\/([^\/?#]+)/i);
        if(!m)continue;
        n=C.decode(m[1]);
        if(!C.isSafeUsername(n))continue;
        if(/(?:profile|account|member|username|userMenu|user-menu|topRight|headerLogin)/i.test(raw)){
          name=n;source='security-header';break;
        }
      }
    }
    return{name:C.clean(name),source:source};
  };
  C.securityLooksLogged=function(html){
    var s=C.s(html),l=s.toLowerCase();
    if(C.isBad(s))return false;
    if(/change\s+your\s+username|email\s+and\s+password|user\/security|logout|log\s*out|my\s+settings/i.test(s))return true;
    if(l.indexOf('/front/authenticate')>=0&&l.indexOf('login')>=0)return false;
    return false;
  };
  C.refreshAccountAvatar=function(name,cookie){
    if(!C.isSafeUsername(name))return'';
    var u=C.base()+'/users/'+C.q(name),h=C.fetchWithCookie(u,cookie),img='';
    if(!C.isBad(h))img=C.profileAvatar(h,u)||C.meta(h,'og:image')||'';
    if(img&&!/(default|placeholder|blank|loading)/i.test(img)){setItem(C.accountAvatarKey,img);return img;}
    return'';
  };
  C.syncWebCookie=function(){
    var cookie='';try{cookie=C.clean(getCookie(C.base()));}catch(e){cookie='';}
    if(!cookie)return{ok:false,identity:false,message:'未读取到官方网页登录 Cookie，请先在完整网页完成登录。'};
    var sec=C.fetchWithCookie(C.base()+'/user/security',cookie),id=C.securityIdentity(sec),logged=C.securityLooksLogged(sec)||!!id.name;
    if(!logged){
      C.clearAccountIdentity();setItem(C.authEnabledKey,'0');setItem(C.authCookieKey,'');
      return{ok:false,identity:false,message:'Cookie 已读取，但账号安全页没有确认登录状态。请回到官方网页确认已登录后再同步。'};
    }
    setItem(C.authCookieKey,cookie);setItem(C.authEnabledKey,'1');C.clearAccountIdentity();
    if(id.name){
      setItem(C.accountNameKey,id.name);setItem(C.accountIdentitySourceKey,id.source||'security-page');C.refreshAccountAvatar(id.name,cookie);
      return{ok:true,identity:true,name:id.name,message:'登录状态已验证：'+id.name};
    }
    return{ok:true,identity:false,name:'',message:'Cookie 登录状态已验证，但没有可靠识别到用户名。请手动绑定自己的 Pornhub 用户名；本版不会再从普通推荐链接猜账号。'};
  };
  C.setAccountName=function(n){
    n=C.clean(n);
    if(!C.isSafeUsername(n))return'';
    setItem(C.accountNameKey,n);setItem(C.accountIdentitySourceKey,'manual');
    if(C.savedCookie())C.refreshAccountAvatar(n,C.savedCookie());
    return n;
  };
  C.logoutLocal=function(){setItem(C.authEnabledKey,'0');setItem(C.authCookieKey,'');C.clearAccountIdentity();return true;};

  var oldProfileAvatar=C.profileAvatar;
  C.profileAvatar=function(html,url){
    var s=C.s(html),m,tag,img='';
    m=s.match(/<img\b[^>]*id=["']getAvatar["'][^>]*>/i);
    if(m){tag=m[0];img=C.abs(C.attr(tag,'src')||C.attr(tag,'data-src')||C.attr(tag,'data-original'),url);if(img)return img;}
    m=s.match(/<(?:div|section|header)\b[^>]*class=["'][^"']*topProfileHeader[^"']*["'][^>]*>([\s\S]{0,7000}?)<\/(?:div|section|header)>/i);
    if(m){var im=m[1].match(/<img\b[^>]*(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/i);if(im){img=C.abs(im[1],url);if(img)return img;}}
    return oldProfileAvatar?oldProfileAvatar(html,url):'';
  };

  C.profileBlockName=function(block,href){
    var n='',m,imgs=C.s(block).match(/<img\b[^>]*>/ig)||[],i,tag;
    for(i=0;i<imgs.length;i++){
      tag=imgs[i];n=C.clean(C.attr(tag,'alt')||C.attr(tag,'title'));
      if(!C.isBadProfileLabel(n))return n;
    }
    var a=C.allAnchors(block,href),t;
    for(i=0;i<a.length;i++){
      t=C.clean(a[i].title||a[i].text);
      if(!C.isBadProfileLabel(t))return t;
    }
    n=C.profileSlugName(href);
    return C.isBadProfileLabel(n)?'':n;
  };
  C.profileBlockImage=function(block,href){
    var img=C.imgFrom(block,href),m;
    if(img&&!/(default|placeholder|blank|loading)/i.test(img))return img;
    m=C.s(block).match(/<img\b[^>]*(?:src|data-src|data-original|data-thumb_url)=["']([^"']+)["'][^>]*>/i);
    img=m?C.abs(m[1],href):'';
    return img&&!/(default|placeholder|blank|loading)/i.test(img)?img:'';
  };
  C.parseProfileBlocks=function(html,base,onlyType){
    var s=C.s(html),out=[],seen={},re=/<(?:li|article)\b[^>]*>[\s\S]*?<\/(?:li|article)>/ig,m,block,a,i,it,typ,name,img,desc,sm;
    while((m=re.exec(s))){
      block=m[0];a=C.allAnchors(block,base||C.base());it=null;typ='';
      for(i=0;i<a.length;i++){typ=C.profileType(a[i].href);if(typ&&(!onlyType||typ===onlyType)){it=a[i];break;}}
      if(!it||seen[it.href])continue;
      name=C.profileBlockName(block,it.href);img=C.profileBlockImage(block,it.href);
      if(!name||!img)continue;
      desc=typ;sm=block.match(/([\d,.]+\s*(?:subscribers?|videos?|views?))/i);if(sm)desc+=' · '+C.strip(sm[1]);
      seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:typ,desc:desc});
    }
    return out;
  };
  C.parseProfiles=function(html,base,onlyType){
    var s=C.s(html),region=s,m,out=[],a,i,it,typ,ctx,name,img,seen={};
    if(onlyType==='pornstar'){
      m=s.match(/<ul\b[^>]*id=["']popularPornstars["'][^>]*>([\s\S]*?)<\/ul>/i);
      if(m)region=m[1];
    }
    out=C.parseProfileBlocks(region,base,onlyType);
    if(out.length)return out;
    a=C.allAnchors(region,base||C.base());
    for(i=0;i<a.length;i++){
      it=a[i];typ=C.profileType(it.href);if(!typ||(onlyType&&typ!==onlyType)||seen[it.href])continue;
      ctx=C.context(region,it.index,500,900);name=C.clean(it.title||it.text);
      if(C.isBadProfileLabel(name))name=C.profileBlockName(it.raw+ctx,it.href);
      img=it.img||C.profileBlockImage(it.raw+ctx,it.href);
      if(!name||!img)continue;
      seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:typ,desc:typ});
    }
    return out;
  };
  C.creatorList=function(kind,page,q){
    var u=C.creatorUrl(kind,page,q),h=C.fetchText(u,{ttl:5*60*1000,auth:C.authEnabled()}),typ=kind==='pornstars'?'pornstar':kind==='channels'?'channel':kind==='models'?'model':'user';
    return{url:u,profiles:C.parseProfiles(h,u,q&&kind==='users'?'user':(!q?typ:'')),html:h};
  };
})();
