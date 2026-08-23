/* Pornhub Remote Core Patch 0.1.0-test.7 */
(function(){
  if(typeof PornhubCore!=='object')throw new Error('PornhubCore missing for Test7 core patch');
  var C=PornhubCore;
  C.version='0.1.0-test.7';
  C.build=10107;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/bootstrap_test_v7_b10107.js?v=10107';

  C.shortCanonical=function(u){
    u=C.clean(u);var m=u.match(/\/shorties\/([a-z0-9]+)/i)||u.match(/\/short\/([a-z0-9]+)/i);
    return m?C.base()+'/shorties/'+m[1]:'';
  };
  C.shortImageFrom=function(raw,base){
    raw=C.s(raw);var m=raw.match(/<video\b[^>]*(?:poster|data-poster)=["']([^"']+)["'][^>]*>/i)
      ||raw.match(/(?:poster|thumbnail(?:Url)?|thumb(?:Url)?|image(?:Url)?|cover(?:Url)?)\s*["']?\s*[:=]\s*["']([^"']+)["']/i)
      ||raw.match(/<img\b[^>]*(?:data-mediumthumb|data-thumb_url|data-src|data-original|data-lazy-src|src)\s*=\s*["']([^"']+)["'][^>]*>/i)
      ||raw.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);
    return m?C.abs(m[1],base||C.base()):'';
  };
  C.shortTitleFrom=function(raw){
    raw=C.s(raw);var m=raw.match(/(?:title|caption|description)\s*["']?\s*[:=]\s*["']([^"']{2,180})["']/i)
      ||raw.match(/<(?:h1|h2|h3|h4)\b[^>]*>([\s\S]{1,300}?)<\/(?:h1|h2|h3|h4)>/i)
      ||raw.match(/<img\b[^>]*(?:alt|title)=["']([^"']{2,180})["'][^>]*>/i);
    var t=m?C.clean(m[1]):'';
    if(!t||/^(shorts?|watch|play)$/i.test(t))return'';
    return C.decode(t);
  };
  C.parseShortCards=function(html,base){
    var s=C.s(html),a=C.allAnchors(s,base||C.base()),out=[],seen={},i,it,u,ctx,img,t,id,re,m;
    function push(url,raw){
      var cu=C.shortCanonical(url);if(!cu||seen[cu])return;
      var mm=cu.match(/\/shorties\/([a-z0-9]+)/i);id=mm?mm[1]:'';
      img=C.shortImageFrom(raw,cu);t=C.shortTitleFrom(raw);
      if(!t)t='Shorts'+(id?' · '+id.slice(-6):'');
      seen[cu]=1;out.push({url:cu,title:t,img:C.image(img,cu),rawImg:img,desc:'Shorts'});
    }
    for(i=0;i<a.length;i++){
      it=a[i];u=C.shortCanonical(it.href);if(!u)continue;
      ctx=C.context(s,it.index,2200,3200);push(u,(it.raw||'')+ctx);
    }
    re=/(?:https?:\\?\/\\?\/[^"'\s]+)?\\?\/shorties\\?\/([a-z0-9]{6,})/ig;
    while((m=re.exec(s))){
      u=C.base()+'/shorties/'+m[1];ctx=C.context(s,m.index,2600,3800);push(u,ctx);
      if(out.length>=80)break;
    }
    return out;
  };
  C.shortList=function(page){
    var u=C.queryPage(C.base()+'/shorties',page||1),h=C.fetchText(u,{ttl:2*60*1000,timeout:10000}),cards=C.parseShortCards(h,u),route='shorties';
    return{url:u,cards:cards,route:cards.length?route:'empty',html:h};
  };

  C.playlistCanonical=function(u){
    u=C.clean(u);var m=u.match(/\/playlist\/(\d+)/i);return m?C.base()+'/playlist/'+m[1]:'';
  };
  C.isGenericPlaylistLabel=function(v){
    v=C.clean(C.decode(v)).replace(/\s+/g,' ');
    return !v||v.length>180||/^(?:view\s+playlist|playlist|play\s*all|watch\s*all|view|open|more|videos?)$/i.test(v)||/^\d[\d,.]*\s*(?:videos?|视频|影片)$/i.test(v);
  };
  C.playlistImageFrom=function(raw,base){
    raw=C.s(raw);var m=raw.match(/<img\b[^>]*(?:data-mediumthumb|data-thumb_url|data-src|data-original|data-lazy-src|data-image|data-thumb|src)\s*=\s*["']([^"']+)["'][^>]*>/i)
      ||raw.match(/(?:poster|thumbnail(?:Url)?|thumb(?:Url)?|image(?:Url)?|cover(?:Url)?)\s*["']?\s*[:=]\s*["']([^"']+)["']/i)
      ||raw.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);
    var u=m?C.abs(m[1],base||C.base()):'';
    return /(?:default|placeholder|blank|loading)/i.test(u)?'':u;
  };
  C.playlistTitleFrom=function(raw,url){
    raw=C.s(raw);var c=[],m,re,a,i,t;
    re=/<(?:h1|h2|h3|h4|h5|strong)\b[^>]*>([\s\S]{1,420}?)<\/(?:h1|h2|h3|h4|h5|strong)>/ig;
    while((m=re.exec(raw)))c.push(C.strip(m[1]));
    re=/<[^>]*class=["'][^"']*(?:playlist[^"']*(?:title|name)|(?:title|name)[^"']*playlist)[^"']*["'][^>]*>([\s\S]{1,420}?)<\/[^>]+>/ig;
    while((m=re.exec(raw)))c.push(C.strip(m[1]));
    a=C.allAnchors(raw,url||C.base());
    for(i=0;i<a.length;i++){
      if(C.playlistCanonical(a[i].href)!==C.playlistCanonical(url))continue;
      c.push(C.attr(a[i].raw,'aria-label'));c.push(C.attr(a[i].raw,'data-title'));c.push(a[i].title);c.push(a[i].text);
    }
    re=/<img\b[^>]*(?:alt|title)=["']([^"']+)["'][^>]*>/ig;while((m=re.exec(raw)))c.push(m[1]);
    for(i=0;i<c.length;i++){t=C.clean(C.decode(c[i])).replace(/\s+/g,' ');if(!C.isGenericPlaylistLabel(t))return t;}
    return'';
  };
  C.parsePlaylistCards=function(html,base){
    var s=C.s(html),out=[],seen={},blocks=[],m,re,i,b,a,j,u,title,img,count,id,ctx;
    re=/<(?:li|article)\b[^>]*>[\s\S]*?<\/(?:li|article)>/ig;
    while((m=re.exec(s)))if(/\/playlist\/\d+/i.test(m[0]))blocks.push(m[0]);
    function pushBlock(block){
      a=C.allAnchors(block,base||C.base());
      for(j=0;j<a.length;j++){
        u=C.playlistCanonical(a[j].href);if(!u||seen[u])continue;
        title=C.playlistTitleFrom(block,u);img=C.playlistImageFrom(block,u);
        id=(u.match(/\/playlist\/(\d+)/)||[])[1]||'';
        if(!title)title='片单'+(id?' #'+id:'');
        count='';m=block.match(/(\d[\d,.]*)\s*(?:videos?|视频|影片)/i);if(m)count=m[1]+' 个视频';
        seen[u]=1;out.push({url:u,title:title,img:C.image(img,u),rawImg:img,desc:count||'公开片单'});
      }
    }
    for(i=0;i<blocks.length;i++)pushBlock(blocks[i]);
    if(!out.length){
      a=C.allAnchors(s,base||C.base());
      for(i=0;i<a.length;i++){
        u=C.playlistCanonical(a[i].href);if(!u||seen[u])continue;
        ctx=C.context(s,a[i].index,1800,2600);pushBlock((a[i].raw||'')+ctx);
      }
    }
    return out;
  };
  C.playlistList=function(page){
    var u=C.queryPage(C.base()+'/playlists',page||1),h=C.fetchText(u,{ttl:4*60*1000}),cards=C.parsePlaylistCards(h,u);
    return{url:u,cards:cards,html:h};
  };
  C.playlistMeta=function(html,url){
    var s=C.s(html),title=C.meta(s,'og:title')||'',desc=C.meta(s,'og:description')||'',img=C.meta(s,'og:image')||'',m,j,raw;
    title=C.clean(title.replace(/\s*[-|｜]\s*Pornhub.*$/i,''));
    if(!title||C.isGenericPlaylistLabel(title)){
      m=s.match(/(?:playlistObject|PLAYLIST_VIEW)\s*=\s*({[\s\S]+?});/i);
      if(m){try{j=JSON.parse(m[1]);title=C.clean(j.title||'');desc=C.clean(j.description||desc);}catch(e){}}
    }
    if(!title||C.isGenericPlaylistLabel(title)){m=s.match(/>Videos\s+in\s+(.+?)\s+[Pp]laylist</i);if(m)title=C.strip(m[1]);}
    if(!title||C.isGenericPlaylistLabel(title))title=C.playlistTitleFrom(s.substring(0,Math.min(s.length,24000)),url);
    return{title:title||'片单',desc:C.clean(desc),img:img};
  };
  C.playlistContract=function(html,url){
    var s=C.s(html),m,id='',count=0,token='';
    m=s.match(/var\s+playlistId\s*=\s*["']([^"']+)["']/i);if(m)id=m[1];
    if(!id){m=C.s(url).match(/\/playlist\/(\d+)/i);if(m)id=m[1];}
    m=s.match(/var\s+itemsCount\s*=\s*([0-9]+)\s*\|\|/i)||s.match(/\bitemsCount\s*[:=]\s*([0-9]+)/i);if(m)count=parseInt(m[1],10)||0;
    m=s.match(/var\s+token\s*=\s*["']([^"']+)["']/i)||s.match(/\btoken\s*[:=]\s*["']([^"']+)["']/i);if(m)token=C.decode(m[1]);
    return{id:id,count:count,token:token,pages:count>36?(Math.ceil((count-36)/40)+1):1};
  };
  C.playlistDetail=function(url,page){
    page=parseInt(page||1,10)||1;
    var h=C.fetchText(url,{ttl:4*60*1000,auth:C.accountReady()}),meta=C.playlistMeta(h,url),ct=C.playlistContract(h,url),body=h,videos=[];
    if(page>1&&ct.id&&ct.token){
      var chunk=C.base()+'/playlist/viewChunked?id='+C.q(ct.id)+'&page='+page+'&token='+C.q(ct.token);
      body=C.fetchText(chunk,{ttl:4*60*1000,auth:C.accountReady(),ref:url,timeout:10000});
    }
    videos=C.parseVideoBlocks?C.parseVideoBlocks(body,page>1?url:url):[];
    if(!videos.length)videos=C.parseVideoCards(body,url);
    return{url:url,title:meta.title,desc:meta.desc,rawImg:meta.img,img:C.image(meta.img,url),videos:videos,html:h,count:ct.count,pages:ct.pages,page:page,contract:ct};
  };
})();
