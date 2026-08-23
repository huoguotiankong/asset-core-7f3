/* XVideos Core Feature Patch 0.1.0-test.6 */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test6 patch');
  var C=XVideosCore,S=C._t5Storage||{};
  C.version='0.1.0-test.6';C.build=10106;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/bootstrap_test_v6_b10106.js?v=10106';

  function str(v){return v===undefined||v===null?'':String(v);}
  function clone(o){var x={},k;for(k in (o||{}))if(o.hasOwnProperty(k))x[k]=o[k];return x;}
  function pathOf(u){return str(u).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];}
  function slugOf(u){var p=pathOf(u).replace(/^\/+|\/+$/g,''),a=p?p.split('/'):[];return a.length?a[a.length-1]:'';}
  function slugName(u){var s=slugOf(u);try{s=decodeURIComponent(s);}catch(e){}s=s.replace(/-\d+$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');return s.replace(/\b[a-z]/g,function(m){return m.toUpperCase();});}
  function countryLike(n,u){n=C.clean(n).toLowerCase();var s=slugOf(u).toLowerCase();return !!((C._creatorCountries&&C._creatorCountries[n])||(C._creatorCountries&&C._creatorCountries[s]));}
  function explicitType(u,ctx,expected){
    var p=pathOf(u),lc=str(ctx).toLowerCase();
    if(/^\/pornstars\/[^\/]+/i.test(p))return'pornstar';
    if(/^\/channels\/[^\/]+/i.test(p))return'channel';
    if(/^\/profiles\/[^\/]+/i.test(p))return'profile';
    if(/^\/amateur-channels\/[^\/]+/i.test(p))return'channel';
    if(/^\/[^\/]+\/?$/i.test(p)){
      if(expected==='channels'&&/(?:\bchannel\b|videos?\s*<|videos?|subscribers?)/i.test(lc))return'channel';
      if(expected==='profiles'&&/(?:\bprofile\b|\buser\b|subscribers?)/i.test(lc))return'profile';
    }
    return'';
  }
  C.creatorPathKindV6=function(u,ctx,expected){return explicitType(u,ctx||'',expected||'');};

  C.parseCreatorCards=function(html,base,expected){
    var s=str(html),out=[],regions=[],seen={},seenRegion={},blocks=[],re=/<(?:div|li|article)\b[^>]*class=["'][^"']*(?:profile|channel|pornstar|model|thumb|item|list)[^"']*["'][^>]*>/ig,m,i,start,end,chunk,a,j,it,kind,name,img,videoCount,subs,vm,sm,regionName,key;
    while((m=re.exec(s))&&blocks.length<450)blocks.push(m.index);
    if(!blocks.length)blocks=[0];
    function addCard(it,ctx){
      kind=explicitType(it.href,ctx,expected);if(!kind)return;
      if(expected==='pornstars'&&kind!=='pornstar')return;
      if(expected==='channels'&&kind!=='channel')return;
      if(expected==='profiles'&&kind!=='profile')return;
      name=C.clean(C.decode(it.title||it.text));
      if(!name||name.length<2||name.length>90||countryLike(name,it.href)||/^(?:pornstars?|channels?|profiles?|users?|videos?|more|next|previous)$/i.test(name))name=slugName(it.href);
      if(!name||countryLike(name,it.href))return;
      img=C.imgFrom(it.raw,it.href)||C.imgFrom(ctx,it.href);if(!img)return;
      vm=str(ctx).match(/([\d,.]+\s*[KMB]?)\s*(?:videos?|vid[eé]os?|视频)/i);videoCount=vm?C.strip(vm[1]):'';
      sm=str(ctx).match(/([\d,.]+\s*[KMB]?)\s*(?:subscribers?|followers?|订阅)/i);subs=sm?C.strip(sm[1]):'';
      if(seen[it.href])return;seen[it.href]=1;
      out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:kind,videoCount:videoCount,subscribers:subs,desc:(expected==='channels'?'频道':expected==='profiles'?'创作者':'演员')+(videoCount?' · '+videoCount+' 视频':'')+(subs?' · '+subs+' 订阅':'')});
    }
    for(i=0;i<blocks.length;i++){
      start=blocks[i];end=i+1<blocks.length?Math.min(blocks[i+1],start+6500):Math.min(s.length,start+6500);chunk=s.substring(start,end);a=C.allAnchors(chunk,base||C.base());
      for(j=0;j<a.length;j++)addCard(a[j],chunk);
    }
    if(!out.length){a=C.allAnchors(s,base||C.base());for(i=0;i<a.length;i++)addCard(a[i],C.context(s,a[i].index,300,1800));}
    a=C.allAnchors(s,base||C.base());
    for(i=0;i<a.length;i++){
      regionName=C.clean(C.decode(a[i].text||a[i].title));if(!regionName||!countryLike(regionName,a[i].href))continue;
      regionName=C.countryZh?C.countryZh(regionName):regionName;key=regionName.toLowerCase();if(seenRegion[key])continue;seenRegion[key]=1;regions.push({name:regionName,url:a[i].href});
    }
    return{profiles:out.slice(0,120),regions:regions.slice(0,40)};
  };

  C.creatorList=function(kind,page,q,urlOverride){
    var b=C.base(),path=kind==='channels'?'channels':kind==='profiles'?'profiles':'pornstars',u=urlOverride||b+'/'+path;
    if(q&&!urlOverride)u+=(u.indexOf('?')>=0?'&':'?')+'k='+C.q(q);
    u=C.queryPage(u,page||1);
    var h=C.fetchText(u,{ttl:180000,auth:C.authEnabled()}),x=C.parseCreatorCards(h,u,kind),k;
    if(q){k=C.clean(q).toLowerCase();x.profiles=x.profiles.filter(function(v){return C.clean(v.title).toLowerCase().indexOf(k)>=0;});}
    return{url:u,profiles:x.profiles,regions:x.regions,html:h};
  };

  function normalizePayload(body){
    var s=str(body);
    return s.replace(/\\u003[cC]/g,'<').replace(/\\u003[eE]/g,'>').replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/\\"/g,'"').replace(/\\n/g,'\n').replace(/\\t/g,' ');
  }
  function cardFromObject(o,base,seen,out){
    if(!o||typeof o!=='object')return;
    var u=C.abs(o.url||o.video_url||o.videoUrl||o.link||o.href||o.page_url||o.pageUrl||'',base);if(!C.isVideoLink(u)||seen[u])return;
    var img=C.abs(o.thumbnail_url||o.thumbnailUrl||o.thumbnail||o.thumb_url||o.thumb||o.image||o.img||'',u),dur=C.clean(o.length||o.duration||o.duration_str||o.durationStr||''),views=C.clean(o.views||o.view_count||o.viewCount||''),pv=C.abs(o.preview_video_url||o.previewVideoUrl||o.preview||'',u);
    seen[u]=1;out.push({url:u,title:C.clean(C.decode(o.title||o.name||slugName(u)||'Video')),rawImg:img,img:C.image(img,u),duration:dur,views:views,preview:pv,desc:[dur,views?views+' views':''].filter(function(x){return!!x;}).join(' · ')});
  }
  C.profilePayloadVideos=function(body,base){
    var raw=str(body),norm=normalizePayload(raw),out=[],seen={},j=null,total=0;
    function mergeCards(text,ref){var a=C.parseVideoCards(normalizePayload(text),ref||base),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url&&!seen[a[i].url]){seen[a[i].url]=1;out.push(a[i]);}}
    mergeCards(norm,base);
    try{j=JSON.parse(raw);}catch(e){try{j=JSON.parse(norm);}catch(e2){j=null;}}
    function walk(v,depth){
      if(depth>7||v===null||v===undefined)return;
      if(typeof v==='string'){if(v.indexOf('video')>=0||v.indexOf('frame-block')>=0||v.indexOf('thumb-block')>=0)mergeCards(v,base);return;}
      if(Object.prototype.toString.call(v)==='[object Array]'){for(var i=0;i<v.length;i++){cardFromObject(v[i],base,seen,out);walk(v[i],depth+1);}return;}
      if(typeof v==='object'){
        if(!total)total=parseInt(v.nb_videos||v.total_videos||v.totalVideos||v.total||v.count||0,10)||0;
        cardFromObject(v,base,seen,out);for(var k in v)if(v.hasOwnProperty(k))walk(v[k],depth+1);
      }
    }
    if(j)walk(j,0);
    var re=/(?:https?:\\?\/\\?\/[^"'\\\s]+)?\\?\/video(?:[._-]?[A-Za-z0-9]+)\\?\/[^"'\\\s<]+/ig,m,href,ctx,cards,i;
    while((m=re.exec(raw))&&out.length<120){href=normalizePayload(m[0]);href=C.abs(href,base);if(!C.isVideoLink(href)||seen[href])continue;ctx=normalizePayload(raw.substring(Math.max(0,m.index-2200),Math.min(raw.length,m.index+4200)));cards=C.parseVideoCards(ctx,base);for(i=0;i<cards.length;i++)if(cards[i].url&&!seen[cards[i].url]){seen[cards[i].url]=1;out.push(cards[i]);}if(!seen[href]){seen[href]=1;out.push({url:href,title:slugName(href)||'Video',rawImg:'',img:'',duration:'',views:'',preview:'',desc:''});}}
    return{cards:out.slice(0,120),total:total};
  };

  C.profileVideos=function(url,page){
    var p=Math.max(0,(parseInt(page,10)||1)-1),base=str(url).split('#')[0].split('?')[0].replace(/\/+$/,''),u=base+'/videos/best/'+p,body=C.fetchProfilePayload(u,90000),x=C.profilePayloadVideos(body,u),post='';
    if(!x.cards.length){try{post=str(fetch(u,{timeout:12000,method:'POST',body:'',headers:C.headers(u,C.authEnabled(),'application/json, text/plain, */*')}));}catch(e){post='';}if(post){var y=C.profilePayloadVideos(post,u);if(y.cards.length||y.total){x=y;body=post;}}}
    return{url:u,cards:x.cards,total:x.total,raw:body};
  };

  C.profile=function(url,page){
    var h=C.fetchText(url,{ttl:300000,auth:C.authEnabled()}),name='',img='',desc=C.meta(h,'og:description')||'',m,ctx,stats=[],ids,i,pv;
    m=str(h).match(/class=["'][^"']*profile-pic[^"']*["'][\s\S]{0,1200}?<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);if(m)img=C.abs(m[1],url);
    m=str(h).match(/<h2[^>]*>[\s\S]{0,260}?<strong[^>]*>([^<]+)<\/strong>/i);if(m)name=C.strip(m[1]);
    if(!name)name=C.meta(h,'og:title')||slugName(url)||'Creator';
    if(!img)img=C.abs(C.meta(h,'og:image')||'',url);
    ids=[['pinfo-profile-hits','浏览'],['pinfo-subscribers','订阅'],['pinfo-videos-views','播放'],['pinfo-signedup','加入'],['pinfo-lastactivity','活跃'],['pinfo-sex','性别'],['pinfo-age','年龄']];
    for(i=0;i<ids.length;i++){m=str(h).match(new RegExp('id=["\\\']'+ids[i][0]+'["\\\'][\\s\\S]{0,360}?<span[^>]*>([^<]+)<\\/span>','i'));if(m)stats.push({name:ids[i][1],value:C.strip(m[1])});}
    pv=C.profileVideos(url,page||1);if(pv.total)stats.unshift({name:'视频',value:String(pv.total)});
    return{name:C.clean(C.decode(name.replace(/\s*[-|｜]\s*XVideos.*$/i,'')))||slugName(url)||'Creator',img:C.image(img,url),rawImg:img,desc:C.clean(C.decode(desc)),stats:stats,videos:pv.cards,totalVideos:pv.total,videoUrl:pv.url};
  };

  C.fetchAccountPage=function(url){
    var h='',headers=C.headers(url,true,'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8');headers['X-Requested-With']='XMLHttpRequest';
    try{h=str(fetch(url,{timeout:14000,method:'POST',body:'',headers:headers}));}catch(e){h='';}
    if(C.isBad(h)||h.length<120){try{h=C.fetchText(url,{force:true,ttl:0,auth:true,timeout:14000});}catch(e2){h='';}}
    return h;
  };
  C.accountUrl=function(kind,page){var b=C.base(),n=Math.max(0,(parseInt(page,10)||1)-1);if(kind==='history'||kind==='recommended')return b+'/history/'+n;if(kind==='liked')return b+'/videos-i-like/'+n;if(kind==='watchlater')return b+'/watch-later/'+n;if(kind==='home')return b+'/account';return'';};
  C.accountVideos=function(kind,page){
    var u=C.accountUrl(kind,page);if(!u)return{url:'',cards:[],error:'未知账号列表'};
    var h=C.fetchAccountPage(u),region=C.mainVideoRegion?C.mainVideoRegion(h):h,cards=C.parseVideoCards(region,u);
    if(!cards.length&&region!==h)cards=C.parseVideoCards(h,u);
    return{url:u,cards:cards,error:C.isBad(h)?'账号页返回异常或登录态失效':(!cards.length?'当前账号页已返回，但主视频列表尚未恢复或该列表为空':''),session:C.authFingerprint(),htmlLength:h.length};
  };
  C.accountIdentity=function(){
    var u=C.loginUrl(),h=C.fetchText(u,{force:true,ttl:0,auth:true,timeout:14000}),name=C.detectAccountName(h),profileUrl='',avatar='',a=C.allAnchors(h,u),i,ctx;
    for(i=0;i<a.length;i++){
      if(!/^\/profiles\/[^\/]+/i.test(pathOf(a[i].href)))continue;ctx=C.context(h,a[i].index,400,1200);if(/(?:account|current-user|profile|logout|my\s+profile)/i.test(ctx)){profileUrl=a[i].href;if(!name)name=C.clean(C.decode(a[i].text||a[i].title));avatar=C.imgFrom(ctx,a[i].href);break;}
    }
    return{name:name||'',profileUrl:profileUrl,avatar:avatar?C.image(avatar,profileUrl||u):'',html:h};
  };
  C.syncWebCookie=function(){
    var cookie=C.liveCookie();if(!cookie)return{ok:false,message:'未读取到 X5 登录 Cookie。请先打开官方账号页完成登录，再返回同步。'};
    var id=C.accountIdentity(),logged=/session_token(?:_auth)?=/i.test(cookie)||/\b(?:logout|sign out|my account|my profile)\b/i.test(C.strip(id.html));
    if(!logged)return{ok:false,message:'已读取 Cookie，但官网账号页仍未确认登录。请在 X5 完成登录后再同步。'};
    var st={enabled:true,name:id.name||'',profileUrl:id.profileUrl||'',avatar:id.avatar||'',fingerprint:C.authFingerprint(cookie),syncedAt:new Date().getTime()};
    if(S.writeJson)S.writeJson(S.ACCOUNT_FILE,st,18000);return{ok:true,name:st.name,profileUrl:st.profileUrl,fingerprint:st.fingerprint,message:st.name?('已连接当前 X5 账号：'+st.name):('已连接当前 X5 登录会话 · '+st.fingerprint)};
  };

  C.videoNumericId=function(html,url){var s=str(html),m=s.match(/data-videoid=["'](\d+)["']/i)||s.match(/["']video_id["']\s*[:=]\s*["']?(\d+)/i)||s.match(/\bvideoId\s*[:=]\s*["']?(\d+)/i);return m?m[1]:'';};
  C.commentCandidatesV6=function(html,url){
    var out=C.commentCandidates?C.commentCandidates(html,url):[],seen={},i,s=str(html),id=C.videoNumericId(html,url),re=/["']([^"']{0,180}comment[^"']{0,180})["']/ig,m,u;
    for(i=0;i<out.length;i++)seen[out[i]]=1;
    while((m=re.exec(s))&&out.length<24){u=C.clean(m[1]);if(!u)continue;u=u.replace(/\\\//g,'/');if(id)u=u.replace(/\{(?:video_?id|id)\}|%VIDEO_ID%|VIDEO_ID/ig,id);if(/^\//.test(u)||/^https?:\/\//i.test(u)){u=C.abs(u,url);if(u&&C.origin(u)===C.origin(url)&&!seen[u]){seen[u]=1;out.push(u);}}}
    return{urls:out,id:id};
  };
  var oldCommentsForVideo=C.commentsForVideo;
  C.commentsForVideo=function(url,html){
    html=html||C.fetchText(url,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000});var first=oldCommentsForVideo?oldCommentsForVideo(url,html):{comments:[],candidates:[]};if(first.comments&&first.comments.length)return first;
    var probe=C.commentCandidatesV6(html,url),out=[],seen={},i,u,body,jv;
    function merge(a){for(var k=0;k<(a||[]).length;k++){var key=(a[k].user||'')+'|'+(a[k].text||'');if(key!=='|'&&!seen[key]){seen[key]=1;out.push(a[k]);}}}
    function jsonWalk(v,depth,base){if(depth>6||v===null||v===undefined)return;if(typeof v==='string'){if(v.indexOf('<')>=0)merge(C.parseComments(v,base));return;}if(Object.prototype.toString.call(v)==='[object Array]'){for(var q=0;q<v.length;q++)jsonWalk(v[q],depth+1,base);return;}if(typeof v==='object'){var user=C.clean(v.username||v.user_name||v.author_name||v.author||v.name||(v.user&&v.user.name)||''),text=C.clean(v.comment||v.message||v.body||v.text||v.content||''),time=C.clean(v.time||v.date||v.created_at||v.createdAt||''),avatar=C.clean(v.avatar||v.image||(v.user&&v.user.avatar)||'');if(user&&text&&text.indexOf('<')<0)merge([{user:C.decode(user),text:C.decode(text),time:C.decode(time),img:C.image(avatar,base),url:'',likes:C.clean(v.likes||v.votes||'')}]);for(var k in v)if(v.hasOwnProperty(k))jsonWalk(v[k],depth+1,base);}}
    for(i=0;i<probe.urls.length&&i<12&&out.length<120;i++){
      u=probe.urls[i];body=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),xhr:true,accept:'application/json, text/html, */*',timeout:9000});merge(C.parseComments(body,u));try{jv=JSON.parse(body);}catch(e){jv=null;}if(jv)jsonWalk(jv,0,u);
      if(!out.length&&probe.id){try{body=str(fetch(u,{timeout:9000,method:'POST',body:{video_id:probe.id,id:probe.id},headers:C.headers(u,C.authEnabled(),'application/json, text/html, */*')}));}catch(e2){body='';}merge(C.parseComments(body,u));try{jv=JSON.parse(body);}catch(e3){jv=null;}if(jv)jsonWalk(jv,0,u);}
    }
    if(out.length)return{comments:out.slice(0,120),candidates:probe.urls,videoId:probe.id};
    return{comments:[],candidates:probe.urls,videoId:probe.id};
  };
})();
