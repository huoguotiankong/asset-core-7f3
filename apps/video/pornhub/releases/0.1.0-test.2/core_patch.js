/* Pornhub Remote Core Patch 0.1.0-test.2 */
(function(){
  if(typeof PornhubCore!=='object') throw new Error('PornhubCore missing for Test2 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.2';
  C.build=10102;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v2_b10102.js?v=10102';
  C.playCachePrefix='ph_play_v2_';
  C.playCacheTtl=4*60*1000;

  C.playCacheKey=function(url){return C.playCachePrefix+C.hash(url);};
  C.cachePlaySources=function(url,sources){
    if(!url||!sources||!sources.length)return;
    var a=[],i,s;
    for(i=0;i<sources.length;i++){
      s=sources[i]||{};
      if(!s.url)continue;
      a.push({url:C.clean(s.url),name:C.clean(s.name),quality:parseInt(s.quality,10)||0});
    }
    if(!a.length)return;
    try{setItem(C.playCacheKey(url),JSON.stringify({time:new Date().getTime(),sources:a}));}catch(e){}
  };
  C.readPlaySources=function(url){
    try{
      var o=JSON.parse(getItem(C.playCacheKey(url),'{}'));
      if(!o||!o.time||new Date().getTime()-o.time>C.playCacheTtl)return[];
      return Object.prototype.toString.call(o.sources)==='[object Array]'?o.sources:[];
    }catch(e){return[];}
  };
  C.playResult=function(url,sources){
    sources=sources||[];
    if(sources.length===1)return C.videoUrl(sources[0].url,url);
    if(sources.length>1){
      var urls=[],names=[],headers=[],i,s;
      for(i=0;i<sources.length;i++){
        s=sources[i];
        urls.push(s.url);
        names.push(s.name||((s.quality||0)+'P'));
        headers.push({'Referer':url,'User-Agent':'Mozilla/5.0'});
      }
      return JSON.stringify({urls:urls,names:names,headers:headers});
    }
    return'';
  };

  var detailV1=C.detail;
  C.detail=function(html,url){
    var x=detailV1(html,url);
    if(x&&x.sources&&x.sources.length)C.cachePlaySources(url,x.sources);
    return x;
  };

  C.resolvePlay=function(url){
    var s=C.readPlaySources(url),r=C.playResult(url,s);
    if(r)return r;
    var h=C.fetchText(url,{force:false,ttl:2*60*1000,auth:C.authEnabled(),timeout:8000});
    if(!C.isBad(h)){
      var x=C.detail(h,url);
      s=x&&x.sources?x.sources:[];
      r=C.playResult(url,s);
      if(r)return r;
    }
    return'video://'+url;
  };

  C.profileSlugName=function(url){
    var s=C.clean(url).replace(/[?#].*$/,'').replace(/\/+$/,''),m=s.match(/\/([^\/]+)$/),n=m?m[1]:'';
    if(!n)return'';
    try{n=decodeURIComponent(n);}catch(e){}
    n=n.replace(/[-_]+/g,' ').replace(/\s+/g,' ');
    return n.replace(/(^|\s)([a-z])/g,function(all,p1,p2){return p1+p2.toUpperCase();});
  };
  C.profileName=function(html,url){
    var n=C.meta(html,'og:title')||C.meta(html,'twitter:title')||'',m;
    n=C.clean(n.replace(/\s*[-|｜]\s*Pornhub.*$/i,''));
    if(!n||/^(creator|profile|pornhub)$/i.test(n)){
      m=C.s(html).match(/<h1\b[^>]*>([\s\S]{1,240}?)<\/h1>/i);
      if(m)n=C.strip(m[1]);
    }
    if(!n||/^(creator|profile|pornhub)$/i.test(n)){
      m=C.s(html).match(/class=["'][^"']*(?:profileUserName|username|name)[^"']*["'][^>]*>([\s\S]{1,180}?)<\//i);
      if(m)n=C.strip(m[1]);
    }
    if(!n||/^(creator|profile|pornhub)$/i.test(n))n=C.profileSlugName(url);
    return C.clean(n);
  };
  C.profileAvatar=function(html,url){
    var s=C.s(html),patterns=[
      /<img\b[^>]*(?:class|id)=["'][^"']*(?:profileAvatar|userAvatar|avatar|profilePic|profileImage|userImage|thumbImage)[^"']*["'][^>]*>/ig,
      /<img\b[^>]*(?:data-testid|itemprop)=["'][^"']*(?:avatar|image|photo)[^"']*["'][^>]*>/ig
    ],i,m,tag,img;
    for(i=0;i<patterns.length;i++){
      while((m=patterns[i].exec(s))){
        tag=m[0];img=C.imgFrom(tag,url)||C.abs(C.attr(tag,'src'),url)||C.abs(C.attr(tag,'data-src'),url);
        if(img&&!/(default|placeholder|blank|loading)/i.test(img))return img;
      }
    }
    m=s.match(/<img\b[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*(?:alt|title)=["'][^"']*(?:profile|avatar)[^"']*["'][^>]*>/i);
    if(m)return C.abs(m[1],url);
    return'';
  };

  C.authorFrom=function(html){
    var a=C.allAnchors(html,C.base()),i,t,n,ctx,img;
    for(i=0;i<a.length;i++){
      t=C.profileType(a[i].href);
      if(!t)continue;
      n=C.clean(a[i].text||a[i].title);
      if(!n||n.length>=100)continue;
      ctx=C.context(html,a[i].index,650,900);
      img=a[i].img||C.profileAvatar(ctx,a[i].href)||C.imgFrom(ctx,a[i].href);
      return{url:a[i].href,name:n,type:t,rawImg:img,img:C.image(img,a[i].href)};
    }
    return null;
  };

  var parseVideosV1=C.parseVideoCards;
  C.parseVideoCards=function(html,base){
    var a=parseVideosV1(html,base),out=[],i,t;
    for(i=0;i<a.length;i++){
      t=C.clean(a[i].title);
      if(!t||/^(play\s*all|watch\s*all|all\s*videos?)$/i.test(t))continue;
      out.push(a[i]);
    }
    return out;
  };

  C.parseProfiles=function(html,base,onlyType){
    var s=C.s(html),a=C.allAnchors(s,base||C.base()),out=[],seen={},i,it,typ,ctx,name,img,desc,sm;
    for(i=0;i<a.length;i++){
      it=a[i];typ=C.profileType(it.href);
      if(!typ||(onlyType&&typ!==onlyType)||seen[it.href])continue;
      ctx=C.context(s,it.index,850,1500);
      name=C.clean(it.title||it.text);
      if(!name||name.length>80||/^(creator|profile)$/i.test(name))name=C.profileName(ctx,it.href);
      img=it.img||C.profileAvatar(ctx,it.href)||C.imgFrom(ctx,it.href);
      if(!name)name=C.profileSlugName(it.href);
      if(!name)continue;
      desc=typ;
      sm=ctx.match(/([\d,.]+\s*(?:subscribers?|videos?|views?))/i);
      if(sm)desc+=' · '+C.strip(sm[1]);
      seen[it.href]=1;
      out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:typ,desc:desc});
    }
    return out;
  };

  C.profile=function(url){
    var h=C.fetchText(url,{ttl:10*60*1000,auth:C.authEnabled()}),name=C.profileName(h,url),rawImg=C.profileAvatar(h,url),desc=C.meta(h,'og:description')||C.meta(h,'description')||'',videos=C.parseVideoCards(h,url);
    if(!rawImg){
      var og=C.meta(h,'og:image');
      if(og&&!/(default|placeholder|blank|loading)/i.test(og))rawImg=og;
    }
    if(!videos.length){
      var vu=url.replace(/\/+$/,'')+'/videos',vh=C.fetchText(vu,{ttl:5*60*1000,auth:C.authEnabled()});
      videos=C.parseVideoCards(vh,vu);
      if(!rawImg)rawImg=C.profileAvatar(vh,url);
    }
    return{name:name||C.profileSlugName(url)||'Creator',img:C.image(rawImg,url),rawImg:rawImg,desc:C.clean(desc),videos:videos};
  };
})();
