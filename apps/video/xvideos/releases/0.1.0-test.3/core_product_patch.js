/* XVideos Core Product Patch 0.1.0-test.3 */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test3 patch');
  var C=XVideosCore;
  C.version='0.1.0-test.3';
  C.build=10103;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/bootstrap_test_v3_b10103.js?v=10103';
  C.searchHistoryKey='xv_search_history_v3';
  C.maxSearchHistory=20;

  C.searchHistory=function(){
    var a=[];try{a=JSON.parse(getItem(C.searchHistoryKey,'[]'));}catch(e){a=[];}
    return Object.prototype.toString.call(a)==='[object Array]'?a:[];
  };
  C.recordSearch=function(q){
    q=C.clean(q);if(!q)return;
    var a=C.searchHistory(),out=[q],i;
    for(i=0;i<a.length;i++)if(C.clean(a[i]).toLowerCase()!==q.toLowerCase())out.push(C.clean(a[i]));
    try{setItem(C.searchHistoryKey,JSON.stringify(out.slice(0,C.maxSearchHistory)));}catch(e){}
  };
  C.clearSearchHistory=function(){try{setItem(C.searchHistoryKey,'[]');}catch(e){}return true;};
  C.removeSearchHistory=function(q){
    q=C.clean(q).toLowerCase();var a=C.searchHistory(),out=[],i;
    for(i=0;i<a.length;i++)if(C.clean(a[i]).toLowerCase()!==q)out.push(a[i]);
    try{setItem(C.searchHistoryKey,JSON.stringify(out));}catch(e){}return true;
  };

  C.cleanTagName=function(v){
    var s=C.clean(v),m=s.match(/^(.*?)(?:\s+([\d][\d,. ]*))$/);
    if(m&&m[1]&&/[A-Za-z]/.test(m[1]))s=C.trim(m[1]);
    return s.replace(/\s+/g,' ');
  };
  C.tagList=function(force){
    var b=C.base(),u=b+'/tags',h=C.fetchText(u,{force:!!force,ttl:60*60*1000}),a=C.allAnchors(h,u),out=[],seen={},i,it,raw,n,count,m,path,letter;
    for(i=0;i<a.length;i++){
      it=a[i];path=C.s(it.href).replace(/^https?:\/\/[^\/]+/i,'');
      if(C.isVideoLink(it.href)||/\/(?:profiles|channels|pornstars)\//i.test(path))continue;
      if(!(/\/tags?\//i.test(path)||/\/c\//i.test(path)||/[?&]k=/.test(it.href)))continue;
      raw=C.clean(it.text||it.title);n=C.cleanTagName(raw);
      if(!n||n.length<2||n.length>58)continue;
      m=raw.match(/\s([\d][\d,. ]*)$/);count=m?C.trim(m[1]):'';
      if(seen[n.toLowerCase()])continue;seen[n.toLowerCase()]=1;
      letter=/^[A-Za-z]/.test(n)?n.charAt(0).toUpperCase():'#';
      out.push({name:n,rawName:raw,count:count,url:it.href,letter:letter});
    }
    return out.slice(0,500);
  };

  C._creatorCountries={china:1,japan:1,usa:1,'united states':1,france:1,germany:1,spain:1,italy:1,brazil:1,russia:1,uk:1,'united kingdom':1,canada:1,korea:1,india:1,thai:1,thailand:1,mexico:1,colombia:1,argentina:1,australia:1,asia:1,europe:1,latina:1};
  C._creatorReserved={tags:1,channels:1,pornstars:1,profiles:1,video:1,videos:1,best:1,new:1,history:1,'videos-i-like':1,'watch-later':1,login:1,account:1,search:1,gay:1,straight:1};
  C.creatorPathKind=function(u){
    var p=C.s(u).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0].replace(/^\/+|\/+$/g,''),parts=p?p.split('/'):[];
    if(!parts.length)return'';
    if(parts[0]==='channels'&&parts.length>1)return'channel';
    if(parts[0]==='profiles'&&parts.length>1)return'profile';
    if(parts[0]==='pornstars'&&parts.length>1)return'pornstar';
    if(parts.length===1&&!C._creatorReserved[parts[0].toLowerCase()])return'creator';
    return'';
  };
  C.profileType=function(u){return C.creatorPathKind(u);};

  C.parseCreatorCards=function(html,base,expected){
    var s=C.s(html),a=C.allAnchors(s,base||C.base()),out=[],regions=[],seen={},seenR={},i,it,kind,ctx,name,img,desc,sm,path,slug;
    for(i=0;i<a.length;i++){
      it=a[i];kind=C.creatorPathKind(it.href);if(!kind)continue;
      path=C.s(it.href).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];
      name=C.clean(it.title||it.text);
      ctx=C.context(s,it.index,450,1500);
      if(!name||name.length<2||name.length>100){
        var nm=ctx.match(/(?:title|alt)\s*=\s*["']([^"']{2,100})["']/i);name=nm?C.clean(C.decode(nm[1])):'';
      }
      if(!name)continue;
      slug=path.replace(/^\/+|\/+$/g,'').split('/').pop().toLowerCase();
      if(kind==='pornstar'&&(C._creatorCountries[name.toLowerCase()]||C._creatorCountries[slug])){
        if(!seenR[it.href]){seenR[it.href]=1;regions.push({name:name,url:it.href});}
        continue;
      }
      if(expected==='channels'&&kind!=='channel'&&kind!=='creator')continue;
      if(expected==='profiles'&&kind!=='profile'&&kind!=='creator')continue;
      if(kind==='creator'&&!/(videos?|subscribers?|profile|pornstar)/i.test(ctx))continue;
      img=C.imgFrom(it.raw,it.href)||C.imgFrom(ctx,it.href);
      if(!img)continue;
      if(seen[it.href])continue;
      desc=expected==='channels'?'频道':expected==='profiles'?'用户':'演员';
      sm=ctx.match(/([\d,.]+\s*[KMB]?)\s*(videos?|subscribers?|views?)/i);
      if(sm)desc+=' · '+C.strip(sm[1]+' '+sm[2]);
      seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:kind,desc:desc});
    }
    return{profiles:out.slice(0,120),regions:regions.slice(0,60)};
  };
  C.creatorList=function(kind,page,q,urlOverride){
    var b=C.base(),path=kind==='channels'?'channels':kind==='profiles'?'profiles':'pornstars',u=urlOverride||b+'/'+path;
    if(q&&!urlOverride)u+=(u.indexOf('?')>=0?'&':'?')+'k='+C.q(q);
    u=C.queryPage(u,page||1);
    var h=C.fetchText(u,{ttl:4*60*1000,auth:C.authEnabled()}),x=C.parseCreatorCards(h,u,kind);
    if(q){var k=C.clean(q).toLowerCase();x.profiles=x.profiles.filter(function(v){return C.clean(v.title).toLowerCase().indexOf(k)>=0;});}
    return{url:u,profiles:x.profiles,regions:x.regions,html:h};
  };

  C.modelLinks=function(html,url){
    var s=C.s(html),out=[],seen={},re=/<li\b[^>]*class=["'][^"']*\bmodel\b[^"']*["'][^>]*>/ig,m,start,chunk,a,i,n;
    while((m=re.exec(s))&&out.length<30){
      start=m.index;chunk=s.substring(start,Math.min(s.length,start+1200));a=C.allAnchors(chunk,url);
      for(i=0;i<a.length;i++){
        if(!C.creatorPathKind(a[i].href))continue;n=C.clean(a[i].text||a[i].title);
        if(!n||n.length>90||seen[a[i].href])continue;seen[a[i].href]=1;out.push({name:n,url:a[i].href});break;
      }
    }
    if(out.length)return out;
    var aa=C.allAnchors(s,url),t;
    for(i=0;i<aa.length&&out.length<25;i++){t=C.creatorPathKind(aa[i].href);if(!t)continue;n=C.clean(aa[i].text||aa[i].title);if(!n||n.length>80||seen[aa[i].href])continue;if(/model|pornstar/i.test(C.context(s,aa[i].index,200,500))){seen[aa[i].href]=1;out.push({name:n,url:aa[i].href});}}
    return out;
  };

  C.authorFrom=function(html,url){
    var s=C.s(html),m=s.match(/<li[^>]+class=["'][^"']*main-uploader[^"']*["'][\s\S]{0,1500}?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if(!m)return null;
    var u=C.abs(m[1],url),raw=C.strip(m[2]),name=raw.replace(/\s+[\d,.]+\s*[KMB]?\s*$/i,''),ctx=C.context(s,m.index,300,1500),img=C.imgFrom(ctx,u),subs='';
    var sm=raw.match(/([\d,.]+\s*[KMB]?)\s*$/i);if(sm)subs=sm[1];
    return{url:u,name:name||raw||'上传者',img:C.image(img,u),type:C.creatorPathKind(u)||'channel',subs:subs};
  };

  C.fetchProfilePayload=function(url,ttl){
    var key=C.cacheKey('profile-payload:'+url),tsKey=key+'_ts',now=new Date().getTime(),old=getItem(key,''),ts=parseInt(getItem(tsKey,'0'),10)||0;
    if(old&&now-ts<(ttl||180000))return old;
    var h=C.headers(url,C.authEnabled(),'application/json, text/plain, */*');h['X-Requested-With']='XMLHttpRequest';var body='';
    try{body=C.s(fetch(url,{timeout:12000,headers:h}));}catch(e){body='';}
    if(body){try{if(body.length<240000){setItem(key,body);setItem(tsKey,String(now));}}catch(e2){}return body;}return old||'';
  };
  C.profilePayloadVideos=function(body,base){
    body=C.s(body);var cards=C.parseVideoCards(body,base);if(cards.length)return{cards:cards,total:0};
    var j=null;try{j=JSON.parse(body);}catch(e){j=null;}if(!j)return{cards:[],total:0};
    var total=parseInt(j.nb_videos||j.total||j.count||0,10)||0,out=[],seen={};
    function pushObj(o){
      if(!o||typeof o!=='object')return;var u=C.abs(o.url||o.video_url||o.link||o.href||o.page_url||'',base);if(!C.isVideoLink(u)||seen[u])return;
      var img=C.abs(o.thumbnail_url||o.thumbnail||o.thumb||o.image||o.img||'',u),dur=C.clean(o.length||o.duration||o.duration_str||''),views=C.clean(o.views||o.view_count||'');
      seen[u]=1;out.push({url:u,title:C.clean(o.title||o.name||'Video'),rawImg:img,img:C.image(img,u),duration:dur,views:views,preview:C.abs(o.preview_video_url||o.preview||'',u),desc:[dur,views?views+' views':''].filter(function(x){return!!x;}).join(' · ')});
    }
    function walk(v,depth){
      if(depth>5||v===null||v===undefined)return;
      if(typeof v==='string'){if(v.indexOf('frame-block')>=0){var a=C.parseVideoCards(v,base);for(var z=0;z<a.length;z++)if(!seen[a[z].url]){seen[a[z].url]=1;out.push(a[z]);}}return;}
      if(Object.prototype.toString.call(v)==='[object Array]'){for(var i=0;i<v.length;i++){pushObj(v[i]);walk(v[i],depth+1);}return;}
      if(typeof v==='object'){pushObj(v);for(var k in v)if(v.hasOwnProperty(k))walk(v[k],depth+1);}
    }
    walk(j,0);return{cards:out,total:total};
  };
  C.profileVideos=function(url,page){
    var p=Math.max(0,(parseInt(page,10)||1)-1),u=C.s(url).replace(/\/+$/,'')+'/videos/best/'+p,body=C.fetchProfilePayload(u,150000),x=C.profilePayloadVideos(body,u);
    return{url:u,cards:x.cards,total:x.total,raw:body};
  };
  C.profile=function(url,page){
    var h=C.fetchText(url,{ttl:10*60*1000,auth:C.authEnabled()}),name=C.meta(h,'og:title')||'',img=C.meta(h,'og:image')||'',desc=C.meta(h,'og:description')||'',m;
    if(!name){m=C.s(h).match(/<h2[^>]*>[\s\S]{0,160}?<strong[^>]*>([^<]+)<\/strong>/i);if(m)name=C.strip(m[1]);}
    if(!img){m=C.s(h).match(/class=["'][^"']*profile-pic[^"']*["'][\s\S]{0,700}?<img[^>]+src=["']([^"']+)["']/i);if(m)img=C.abs(m[1],url);}
    var stats=[],ids=[['pinfo-profile-hits','浏览'],['pinfo-subscribers','订阅'],['pinfo-videos-views','播放'],['pinfo-signedup','加入'],['pinfo-lastactivity','活跃']];
    for(var i=0;i<ids.length;i++){m=C.s(h).match(new RegExp('id=["\\\']'+ids[i][0]+'["\\\'][\\s\\S]{0,260}?<span[^>]*>([^<]+)<\\/span>','i'));if(m)stats.push({name:ids[i][1],value:C.strip(m[1])});}
    var pv=C.profileVideos(url,page||1);if(pv.total)stats.unshift({name:'视频',value:String(pv.total)});
    return{name:C.clean(name.replace(/\s*[-|｜]\s*XVideos.*$/i,''))||'Creator',img:C.image(img,url),rawImg:img,desc:C.clean(desc),stats:stats,videos:pv.cards,totalVideos:pv.total,videoUrl:pv.url};
  };

  C.qualityScore=function(name,url){
    var s=(C.s(name)+' '+C.s(url)).toLowerCase(),m=s.match(/(?:^|[^\d])(2160|1440|1080|720|480|360|240)p?/);if(m)return parseInt(m[1],10);
    if(s.indexOf('4k')>=0)return 2160;if(s.indexOf('2k')>=0)return 1440;if(s.indexOf('high')>=0||s.indexOf('高清')>=0)return 720;if(s.indexOf('low')>=0||s.indexOf('流畅')>=0)return 360;if(s.indexOf('original')>=0||s.indexOf('原始')>=0)return 500;return 400;
  };
  C.resolveKnownSources=function(sources,ref){
    sources=sources||[];var out=[],seen={},i,j,src,vars,hasVariants=false;
    function push(name,u){u=C.clean(u);if(!u||seen[u])return;seen[u]=1;out.push({name:name||'视频',url:u,score:C.qualityScore(name,u)});}
    for(i=0;i<sources.length;i++){
      src=sources[i];if(!src||!src.url)continue;
      if(/\.m3u8(?:$|\?)/i.test(src.url)||/hls/i.test(C.s(src.name))){vars=C.expandHls(src.url,ref);if(vars.length){hasVariants=true;for(j=0;j<vars.length;j++)push(vars[j].name,vars[j].url);}}
    }
    for(i=0;i<sources.length;i++){
      src=sources[i];if(!src||!src.url)continue;
      if(hasVariants&&(/\.m3u8(?:$|\?)/i.test(src.url)||/hls/i.test(C.s(src.name))))continue;
      push(src.name,src.url);
    }
    out.sort(function(a,b){return b.score-a.score;});
    if(!out.length)return'video://'+ref;
    if(out.length===1)return C.videoUrl(out[0].url,ref);
    var urls=[],names=[],headers=[];for(i=0;i<out.length;i++){urls.push(out[i].url);names.push(out[i].name);headers.push({'Referer':ref,'User-Agent':'Mozilla/5.0'});}return JSON.stringify({urls:urls,names:names,headers:headers});
  };
  C.resolvePlay=function(url){
    var h=C.fetchText(url,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000}),x=C.detail(h,url);return C.resolveKnownSources(x.sources,url);
  };
})();
