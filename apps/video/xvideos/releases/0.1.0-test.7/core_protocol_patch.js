/* XVideos Core Protocol Patch 0.1.0-test.7 */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test7 patch');
  var C=XVideosCore;
  C.version='0.1.0-test.7';C.build=10107;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/bootstrap_test_v7_b10107.js?v=10107';

  function str(v){return v===undefined||v===null?'':String(v);}
  function arr(v){return Object.prototype.toString.call(v)==='[object Array]'?v:[];}
  function trim(v){return C.clean(v);}
  function rootProfileUrl(url){
    var u=str(url).split('#')[0].split('?')[0].replace(/\/+$/,'');
    u=u.replace(/\/videos\/(?:best|new)(?:\/[^\/]+)?\/\d+$/i,'');
    u=u.replace(/\/videos\/(?:best|new)$/i,'');
    return u.replace(/\/+$/,'');
  }
  function pathOf(u){return str(u).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];}
  function defaultAvatar(u){return /(?:default|placeholder|no[_-]?(?:photo|avatar|image)|silhouette|anonymous|profile[_-]?(?:blank|default))/i.test(str(u));}

  C.apiHeadersV7=function(ref,auth,accept){
    var h=C.headers(ref||C.base()+'/',!!auth,accept||'application/json, text/plain, */*');
    h['Accept']=accept||'application/json, text/plain, */*';
    h['Accept-Language']='en-US,en;q=0.9';
    h['Referer']=ref||C.base()+'/';
    h['X-Requested-With']='XMLHttpRequest';
    h['Connection']='keep-alive';
    h['Sec-Fetch-Dest']='empty';
    h['Sec-Fetch-Mode']='cors';
    h['Sec-Fetch-Site']='same-origin';
    var ck='';try{ck=auth&&C.liveCookie?C.liveCookie():'';}catch(e){ck='';}if(ck)h.Cookie=ck;
    return h;
  };

  C.apiRequestV7=function(url,opt){
    opt=opt||{};var h=C.apiHeadersV7(opt.ref||C.base()+'/',!!opt.auth,opt.accept||'application/json, text/plain, */*'),o={timeout:opt.timeout||14000,headers:h},body='';
    if(opt.method){o.method=String(opt.method).toUpperCase();}
    if(o.method==='POST'){
      h['Content-Type']=opt.contentType||'application/x-www-form-urlencoded; charset=UTF-8';
      o.body=opt.body===undefined?'':opt.body;
    }
    try{body=str(fetch(url,o));}catch(e){body='';}
    return body;
  };

  function apiVideoCard(o,ref){
    if(!o||typeof o!=='object')return null;
    var eid=trim(o.eid||o.video_id||o.videoId||o.id||''),u=trim(o.u||o.url||o.video_url||o.videoUrl||o.href||o.link||''),title,img,dur,views,pn,pu,pv;
    if(u)u=C.abs(str(u).replace(/\\\//g,'/'),C.base()+'/');
    if((!u||!C.isVideoLink(u))&&eid)u=C.base()+'/video.'+eid+'/_';
    if(!u||!C.isVideoLink(u))return null;
    title=trim(C.decode(o.tf||o.t||o.title||o.name||''));if(!title)title=eid?('Video '+eid):'Video';
    img=trim(o.i||o.thumbnail_url||o.thumbnailUrl||o.thumbnail||o.thumb_url||o.thumb||o.image||o.img||'');img=C.abs(str(img).replace(/\\\//g,'/'),u);
    dur=trim(o.d||o.length||o.duration||o.duration_str||o.durationStr||'');
    views=trim(o.views||o.view_count||o.viewCount||o.n||'');
    pn=trim(o.pn||o.uploader_name||o.uploaderName||o.author||'');
    pu=trim(o.pu||o.uploader_url||o.uploaderUrl||o.author_url||'');if(pu)pu=C.abs(str(pu).replace(/\\\//g,'/'),C.base()+'/');
    pv=trim(o.pvv||o.preview_video_url||o.previewVideoUrl||o.preview||'');if(pv)pv=C.abs(str(pv).replace(/\\\//g,'/'),u);
    return{url:u,title:title,rawImg:img,img:C.image(img,u),duration:dur,views:views,preview:pv,uploader:pn,uploaderUrl:pu,desc:[dur,views?(views+' views'):'',pn].filter(function(x){return!!x;}).join(' · ')};
  }

  C.parseApiVideoPayloadV7=function(body,ref){
    var raw=str(body).replace(/^\uFEFF/,''),j=null,videos=[],cards=[],seen={},total=0,perPage=0,currentPage=0,hasMore=null,code=null,i,k,c,extra=[];
    try{j=JSON.parse(raw);}catch(e){j=null;}
    if(j!==null){
      if(Object.prototype.toString.call(j)==='[object Array]')videos=j;
      else if(typeof j==='object'){
        code=j.code;
        total=parseInt(j.nb_videos||j.total_videos||j.totalVideos||j.total||j.count||0,10)||0;
        perPage=parseInt(j.nb_per_page||j.per_page||j.perPage||0,10)||0;
        currentPage=parseInt(j.current_page||j.currentPage||0,10)||0;
        if(j.hasMoreVideos!==undefined)hasMore=!!j.hasMoreVideos;
        if(Object.prototype.toString.call(j.videos)==='[object Array]')videos=j.videos;
        else if(j.videos&&typeof j.videos==='object'){
          if(j.videos.eid||j.videos.u||j.videos.url)videos=[j.videos];
          else for(k in j.videos)if(j.videos.hasOwnProperty(k)&&j.videos[k]&&typeof j.videos[k]==='object')videos.push(j.videos[k]);
        }
        extra=[j.html,j.content,j.items_html,j.videos_html,j.template,j.data&&j.data.html];
      }
    }
    for(i=0;i<videos.length;i++){c=apiVideoCard(videos[i],ref);if(c&&!seen[c.url]){seen[c.url]=1;cards.push(c);}}
    for(i=0;i<extra.length;i++)if(typeof extra[i]==='string'&&extra[i].indexOf('<')>=0){var a=C.parseVideoCards(extra[i],ref),z;for(z=0;z<a.length;z++)if(a[z]&&!seen[a[z].url]){seen[a[z].url]=1;cards.push(a[z]);}}
    if(!cards.length&&raw.indexOf('<')>=0){var b=C.parseVideoCards(raw,ref),q;for(q=0;q<b.length;q++)if(b[q]&&!seen[b[q].url]){seen[b[q].url]=1;cards.push(b[q]);}}
    return{cards:cards,total:total,perPage:perPage,currentPage:currentPage,hasMore:hasMore,code:code,json:j,raw:raw};
  };

  C.profileVideos=function(url,page){
    var p=Math.max(0,(parseInt(page,10)||1)-1),base=rootProfileUrl(url),path=pathOf(base),form='main_cats%5B%5D=straight&main_cats%5B%5D=shemale&main_cats%5B%5D=gay',cands=[],best={cards:[],total:0,perPage:0,raw:'',url:'',source:''},i,it,body,x;
    if(/^\/channels\//i.test(path)||/^\/amateur-channels\//i.test(path)){
      cands.push({url:base+'/videos/best/straight/'+p,method:'POST',body:form,ref:base,source:'channel-best-straight'});
      cands.push({url:base+'/videos/new/'+p,method:'POST',body:'',ref:base,source:'channel-new'});
      cands.push({url:base+'/videos/best/'+p,method:'GET',ref:base,source:'channel-best'});
    }else{
      cands.push({url:base+'/videos/best/'+p,method:'GET',ref:base,source:'profile-best-get'});
      cands.push({url:base+'/videos/best/'+p,method:'POST',body:'',ref:base,source:'profile-best-post'});
      cands.push({url:base+'/videos/new/'+p,method:'POST',body:'',ref:base,source:'profile-new'});
      cands.push({url:base+'/videos/best/straight/'+p,method:'POST',body:form,ref:base,source:'profile-best-straight'});
    }
    for(i=0;i<cands.length;i++){
      it=cands[i];body=C.apiRequestV7(it.url,{method:it.method,body:it.body,ref:it.ref,auth:C.authEnabled(),timeout:12000});if(!body)continue;
      x=C.parseApiVideoPayloadV7(body,it.url);if(x.total&&!best.total)best.total=x.total;if(x.perPage&&!best.perPage)best.perPage=x.perPage;if(body.length>best.raw.length){best.raw=body;best.url=it.url;best.source=it.source;}
      if(x.cards.length){best.cards=x.cards;best.total=x.total||best.total;best.perPage=x.perPage||best.perPage;best.raw=body;best.url=it.url;best.source=it.source;break;}
    }
    if(!best.cards.length&&typeof fetchCodeByWebView==='function'){
      try{
        var rendered=fetchCodeByWebView(base+'#_tabVideos',{headers:C.headers(base,C.authEnabled()),blockRules:['.mp4','.m3u8','videopreview'],timeout:12000,checkJs:$.toString(function(){try{var a=document.querySelectorAll('div.frame-block');return a&&a.length?a.length:null;}catch(e){return null;}})}),webCards=C.parseVideoCards(rendered,base),w;
        if(webCards.length){best.cards=[];for(w=0;w<webCards.length&&w<80;w++)best.cards.push(webCards[w]);best.raw=rendered;best.url=base+'#_tabVideos';best.source='webview-tab-videos';}
      }catch(e2){}
    }
    return{url:best.url||base+'/videos/best/'+p,cards:best.cards,total:best.total,perPage:best.perPage,raw:best.raw,source:best.source};
  };

  var oldProfile=C.profile;
  C.profile=function(url,page,seed){
    var x=oldProfile(url,page),raw=trim(x.rawImg||''),fallback=trim(seed||'');
    if((!raw||defaultAvatar(raw))&&fallback){x.rawImg=fallback;x.img=C.image(fallback,url);}
    if((!x.rawImg||defaultAvatar(x.rawImg))&&x.videos&&x.videos.length&&x.videos[0].rawImg){x.rawImg=x.videos[0].rawImg;x.img=C.image(x.rawImg,url);}
    return x;
  };

  C.regionDisplayV7=function(name,url){
    var s=(trim(name)+' '+pathOf(url)).toLowerCase(),m=[
      [/\b(?:china|chinese|cn)\b|中国/,'中国'],[/\b(?:thailand|thai|th)\b|泰国/,'泰国'],[/\b(?:japan|japanese|jp)\b|日本/,'日本'],[/\b(?:taiwan|taiwanese|tw)\b|台湾/,'台湾'],[/\b(?:korea|korean|kr)\b|韩国/,'韩国'],[/\b(?:usa|us|united[-_ ]states|american)\b|美国/,'美国'],[/\b(?:france|french|fr)\b|法国/,'法国'],[/\b(?:uk|united[-_ ]kingdom|british|gb)\b|英国/,'英国'],[/\b(?:germany|german|de)\b|德国/,'德国'],[/\b(?:spain|spanish|es)\b|西班牙/,'西班牙'],[/\b(?:italy|italian|it)\b|意大利/,'意大利'],[/\b(?:brazil|brazilian|br)\b|巴西/,'巴西'],[/\b(?:russia|russian|ru)\b|俄罗斯/,'俄罗斯'],[/\b(?:india|indian|in)\b|印度/,'印度'],[/\b(?:mexico|mexican|mx)\b|墨西哥/,'墨西哥'],[/\b(?:philippines|filipina|filipino|ph)\b|菲律宾/,'菲律宾'],[/\b(?:vietnam|vietnamese|vn)\b|越南/,'越南'],[/\b(?:asia|asian)\b|亚洲/,'亚洲']
    ],i;for(i=0;i<m.length;i++)if(m[i][0].test(s))return m[i][1];return'';
  };
  var oldCreatorList=C.creatorList;
  C.creatorList=function(kind,page,q,urlOverride){
    var r=oldCreatorList(kind,page,q,urlOverride),out=[],seen={},i,n;
    if(kind==='pornstars'&&r.regions){for(i=0;i<r.regions.length;i++){n=C.regionDisplayV7(r.regions[i].name,r.regions[i].url);if(!n||seen[n])continue;seen[n]=1;out.push({name:n,url:r.regions[i].url});}r.regions=out;}
    return r;
  };

  C.fetchAccountPage=function(url){
    var body=C.apiRequestV7(url,{method:'POST',body:'',ref:C.base()+'/',auth:true,timeout:14000}),x=C.parseApiVideoPayloadV7(body,url);
    if(!body||(!x.cards.length&&x.json===null&&body.length<120))body=C.apiRequestV7(url,{method:'GET',ref:C.base()+'/',auth:true,accept:'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',timeout:14000});
    return body;
  };
  C.accountVideos=function(kind,page){
    var u=C.accountUrl(kind,page);if(!u)return{url:'',cards:[],error:'未知账号列表'};
    var h=C.fetchAccountPage(u),api=C.parseApiVideoPayloadV7(h,u),cards=api.cards,region,loginHtml=false,rendered='';
    if(!cards.length&&h){region=C.mainVideoRegion?C.mainVideoRegion(h):h;cards=C.parseVideoCards(region,u);if(!cards.length&&region!==h)cards=C.parseVideoCards(h,u);}
    loginHtml=!!(h&&/(?:login|sign[ -]?in|connexion|iniciar sesi[oó]n)/i.test(C.strip(h).slice(0,4000))&&!/frame-block|"videos"\s*:/i.test(h));
    if(!cards.length&&!loginHtml&&typeof fetchCodeByWebView==='function'){
      try{rendered=fetchCodeByWebView(u,{headers:C.headers(C.base()+'/',true),blockRules:['.mp4','.m3u8','videopreview'],timeout:11000,checkJs:$.toString(function(){try{var a=document.querySelectorAll('div.frame-block');return a&&a.length?a.length:null;}catch(e){return null;}})});cards=C.parseVideoCards(rendered,u);}catch(e){}
    }
    return{url:u,cards:cards,error:!h?'账号列表请求没有返回内容':(loginHtml?'官网登录态未传递到原生请求':(!cards.length?'当前账号列表返回成功，但本页没有可解析视频':'')),session:C.authFingerprint(),htmlLength:h?h.length:0,apiCode:api.code,apiTotal:api.total,source:cards.length?(api.cards.length?'account-json':(rendered?'account-webview':'account-html')):''};
  };

  C.parseRenderedCommentsV7=function(html,url){
    var s=str(html),out=C.parseComments(s,url),seen={},a=C.allAnchors(s,url),i,j,ctx,user,text,nodes,cand,key,href,img,time,likes;
    if(out.length)return out;
    for(i=0;i<a.length&&out.length<120;i++){
      href=a[i].href;if(!/\/(?:profiles|channels|pornstars)\//i.test(pathOf(href)))continue;ctx=C.context(s,a[i].index,120,3600);if(!/(?:report|reply|comment|like|vote)/i.test(C.strip(ctx)))continue;
      user=trim(C.decode(a[i].text||a[i].title));if(!user||user.length>80)continue;text='';nodes=ctx.match(/<p\b[^>]*>[\s\S]*?<\/p>/ig)||[];
      for(j=0;j<nodes.length;j++){cand=C.strip(nodes[j]);if(cand.length>text.length&&cand.length>2&&cand.length<1800&&cand!==user&&!/^(?:report|reply|like|unlike|more|less)$/i.test(cand))text=cand;}
      if(!text){var tm=ctx.match(/<(?:div|span)[^>]+class=["'][^"']*(?:text|message|body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i);if(tm)text=C.strip(tm[1]);}
      if(!text)continue;key=user+'|'+text;if(seen[key])continue;seen[key]=1;img=C.imgFrom(ctx,url);var dm=ctx.match(/<(?:span|small|time)[^>]*>([^<]*(?:ago|前|hour|day|week|month|year)[^<]*)</i);time=dm?C.strip(dm[1]):'';var lm=ctx.match(/(?:like|vote)[\s\S]{0,120}?([\d,.]+\s*[KMB]?)/i);likes=lm?C.strip(lm[1]):'';out.push({user:user,text:C.decode(text),time:time,img:C.image(img,url),url:href,likes:likes});
    }
    return out;
  };

  C.renderedCommentHtmlV7=function(url){
    if(typeof fetchCodeByWebView!=='function')return'';var h=C.headers(url,C.authEnabled()),html='';
    try{html=str(fetchCodeByWebView(url+'#comments',{headers:h,blockRules:['.mp4','.m3u8','videopreview','videothumbs'],timeout:15000,checkJs:$.toString(function(){try{var b=document.querySelector('button.comments.tab-button,button.tab-button.comments,[data-tab*=comment],a[href="#comments"],a[href*="#comment"]');if(b&&!window.__hk_xv_c7){window.__hk_xv_c7=1;try{b.click();}catch(e){}}var a=document.querySelectorAll('[class*=comment], [id*=comment]');if(a&&a.length){for(var i=0;i<a.length;i++){var t=(a[i].innerText||'').trim();if(t.length>8&&!/^comments?\s*\d*$/i.test(t))return a.length;}}return null;}catch(e2){return null;}})}));}catch(e3){html='';}
    return html;
  };

  C.commentsForVideo=function(url,html){
    html=html||C.fetchText(url,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000});var direct=C.parseComments(html,url);if(direct.length)return{comments:direct,candidates:[],videoId:C.videoNumericId?C.videoNumericId(html,url):'',source:'detail-html'};
    var rendered=C.renderedCommentHtmlV7(url),out=rendered?C.parseRenderedCommentsV7(rendered,url):[];if(out.length)return{comments:out.slice(0,120),candidates:[],videoId:C.videoNumericId?C.videoNumericId(html,url):'',source:'rendered-webview',renderedLength:rendered.length};
    var probe=C.commentCandidatesV6?C.commentCandidatesV6(html,url):{urls:[],id:''},i,body,merged=[],seen={};
    function add(list){for(var q=0;q<(list||[]).length;q++){var k=(list[q].user||'')+'|'+(list[q].text||'');if(k!=='|'&&!seen[k]){seen[k]=1;merged.push(list[q]);}}}
    for(i=0;i<probe.urls.length&&i<3&&!merged.length;i++){body=C.apiRequestV7(probe.urls[i],{method:'GET',ref:url,auth:C.authEnabled(),timeout:8000});add(C.parseComments(body,probe.urls[i]));if(!merged.length&&probe.id){body=C.apiRequestV7(probe.urls[i],{method:'POST',body:C.form({video_id:probe.id,id:probe.id}),ref:url,auth:C.authEnabled(),timeout:8000});add(C.parseComments(body,probe.urls[i]));}}
    return{comments:merged.slice(0,120),candidates:probe.urls||[],videoId:probe.id||'',source:merged.length?'ajax':'none',renderedLength:rendered.length};
  };
})();
