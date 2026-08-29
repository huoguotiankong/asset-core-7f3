/* 夜社短剧 PlaybackAdapter 0.1.0-test.1 */
var YeshePlayback=(function(){
  var P=YesheProtocol,VERSION='0.1.0-test.1',BUILD=10101,DIAG='yeshe_play_diag_v1',FALLBACK='yeshe_play_fallback_v1';
  function s(v){return v==null?'':String(v);}
  function save(o){try{o=o||{};o.time=new Date().getTime();setItem(DIAG,JSON.stringify(o));}catch(e){}}
  function diag(){try{return JSON.parse(getItem(DIAG,'{}')||'{}');}catch(e){return{};}}
  function decodeEntities(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;/ig,"'").replace(/\\\//g,'/').replace(/\\u0026/ig,'&').replace(/\\u003d/ig,'=').replace(/\\u002f/ig,'/');}
  function isMedia(u){return /\.(m3u8|mp4|m4v|mp3|m4a|aac|flac|ts)(?:[?#]|$)/i.test(s(u));}
  function normal(u,base){u=decodeEntities(u).replace(/^['"]|['"]$/g,'');if(!u)return'';try{u=decodeURIComponent(u);}catch(e){}return P.abs(u,base);}
  function attr(html,name){var m=s(html).match(new RegExp('\\b'+name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'));return m?m[1]:'';}
  function directTags(html,base){
    var out=[],seen={},m,u,re=/<(?:video|source|audio)\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/ig;
    while((m=re.exec(s(html)))!==null&&out.length<8){u=normal(m[1],base);if(u&&isMedia(u)&&!seen[u]){seen[u]=1;out.push(u);}}
    re=/(https?:\\?\/\\?\/[A-Za-z0-9._~%\-/?:#\[\]@!$&'()*+,;=]+?\.(?:m3u8|mp4|m4v|mp3|m4a|aac|flac)(?:\?[^"'<>\\s\\]*)?)/ig;
    while((m=re.exec(s(html)))!==null&&out.length<8){u=normal(m[1],base);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    return out;
  }
  function objectAfter(text,marker){
    text=s(text);var p=text.indexOf(marker),start=-1,i,ch,depth=0,quote='',esc=false;if(p<0)return'';
    for(i=p+marker.length;i<text.length;i++){ch=text.charAt(i);if(ch==='{'){start=i;break;}}if(start<0)return'';
    for(i=start;i<text.length;i++){ch=text.charAt(i);if(quote){if(esc){esc=false;continue;}if(ch==='\\'){esc=true;continue;}if(ch===quote)quote='';continue;}if(ch==='"'||ch==="'"){quote=ch;continue;}if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0)return text.substring(start,i+1);}}
    return'';
  }
  function decodePlayerUrl(o,base){
    if(!o||!o.url)return'';var u=s(o.url),enc=Number(o.encrypt||0)||0;
    try{if(enc===1)u=unescape(u);else if(enc===2){try{u=base64Decode(u);}catch(e){}u=unescape(u);}}catch(ignore){}
    return normal(u,base);
  }
  function playerObject(html,base){
    var markers=['var player_aaaa','player_aaaa','var player_data','player_data'],i,obj='',o=null,u='';
    for(i=0;i<markers.length;i++){obj=objectAfter(html,markers[i]);if(!obj)continue;try{o=JSON.parse(obj);}catch(e){o=null;}if(o){u=decodePlayerUrl(o,base);if(u)return{url:u,raw:o,route:'player-json'};}}
    return null;
  }
  function iframe(html,base){var re=/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i,m=s(html).match(re);return m?P.abs(decodeEntities(m[1]),base):'';}
  function resolvePage(url,allowIframe){
    var p=P.requestUrl(url,{timeout:11000}),html=s(p.body),arr=directTags(html,url),po=null,fr='',p2=null,arr2=[];
    if(arr.length)return{ok:true,url:arr[0],route:'source-tag',page:url,status:p.status};
    po=playerObject(html,url);if(po&&po.url&&isMedia(po.url))return{ok:true,url:po.url,route:po.route,page:url,status:p.status};
    if(allowIframe!==false){fr=iframe(html,url);if(fr&&fr!==url){try{p2=P.requestUrl(fr,{timeout:9000});arr2=directTags(p2.body,fr);if(arr2.length)return{ok:true,url:arr2[0],route:'iframe-source',page:url,iframe:fr,status:p2.status};po=playerObject(p2.body,fr);if(po&&po.url&&isMedia(po.url))return{ok:true,url:po.url,route:'iframe-player-json',page:url,iframe:fr,status:p2.status};}catch(e){}}}
    return{ok:false,page:url,status:p.status,error:'未解析到结构化媒体地址'};
  }
  function headerSuffix(url,referer){
    var vals=['User-Agent@'+s(P.ua).replace(/;/g,'；；'),'Referer@'+s(referer).replace(/;/g,'；；')],ck='';try{ck=s(getCookie(P.discover(false))||'');}catch(e){}if(ck)vals.push('Cookie@'+ck.replace(/;/g,'；；'));
    return url+';{'+vals.join('&&')+'}';
  }
  function play(url){
    url=s(url).replace(/^\s+|\s+$/g,'');if(!url)return'toast://缺少播放地址';
    try{
      var r=resolvePage(url,true);if(r.ok){save({ok:true,stage:'READY',route:r.route,page:url,mediaHost:(r.url.match(/^(https?:\/\/[^\/]+)/)||[])[1]||'',status:r.status});return headerSuffix(r.url,r.iframe||url);}
      var fb=getItem(FALLBACK,'sniff');save({ok:false,stage:'SOURCE_PARSE',route:fb,page:url,status:r.status,error:r.error});
      if(fb==='web')return'web://'+url;
      if(fb==='none')return'toast://未解析到直链，已记录播放诊断';
      return'video://'+url;
    }catch(e){save({ok:false,stage:'PLAY_ERROR',route:'exception',page:url,error:s(e.message||e)});return'toast://播放解析失败：'+s(e.message||e);}
  }
  return{version:VERSION,build:BUILD,diagKey:DIAG,fallbackKey:FALLBACK,diag:diag,play:play,resolvePage:resolvePage};
})();