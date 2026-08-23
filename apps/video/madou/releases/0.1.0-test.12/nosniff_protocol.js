/* 麻豆传媒 Test12B - HTTP-only protocol resolver */
var MadouT12Protocol=(function(){
  if(typeof MadouCore==='undefined'||typeof MadouT12State==='undefined') throw new Error('Madou Test12 state unavailable');
  var C=MadouCore,S=MadouT12State;
  function str(v){return S.str(v);}
  function normalizeText(s){
    s=str(s);try{s=C.decode(s);}catch(e0){}
    s=s.replace(/&#x([0-9a-fA-F]+);/g,function(_,h){return String.fromCharCode(parseInt(h,16));})
       .replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(parseInt(n,10));});
    return s.replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\u0026/g,'&').replace(/\\x2[fF]/g,'/').replace(/\\x3[aA]/g,':').replace(/\\\//g,'/');
  }
  function abs(raw,base){try{return C.abs(normalizeText(raw),base);}catch(e){return'';}}
  function isMedia(u){return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(str(u));}
  function badMedia(u){return /(advert|ads|promo|banner|trailer|sample|preview-ad|preload-ad)/i.test(str(u));}
  function mediaScore(u){var n=0;try{n=C.mediaScore(u);}catch(e){}if(/master|index/i.test(str(u)))n+=2;if(badMedia(u))n-=20;return n;}
  function b64decode(input){
    var s=str(input).replace(/-/g,'+').replace(/_/g,'/').replace(/[^A-Za-z0-9+\/=]/g,''),chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',out='',i=0,e1,e2,e3,e4,c1,c2,c3;
    while(i<s.length){e1=chars.indexOf(s.charAt(i++));e2=chars.indexOf(s.charAt(i++));e3=chars.indexOf(s.charAt(i++));e4=chars.indexOf(s.charAt(i++));if(e1<0||e2<0)break;c1=(e1<<2)|(e2>>4);out+=String.fromCharCode(c1);if(e3>=0){c2=((e2&15)<<4)|(e3>>2);out+=String.fromCharCode(c2);}if(e4>=0){c3=((e3&3)<<6)|e4;out+=String.fromCharCode(c3);}}return out;
  }
  function percentDecode(s){var x=str(s);try{x=decodeURIComponent(x);}catch(e0){try{x=unescape(x);}catch(e1){}}return normalizeText(x);}
  function unescapeJs(s){return str(s).replace(/\\x([0-9a-fA-F]{2})/g,function(_,h){return String.fromCharCode(parseInt(h,16));}).replace(/\\u([0-9a-fA-F]{4})/g,function(_,h){return String.fromCharCode(parseInt(h,16));}).replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\\\/g,'\\');}
  function encodeRadix(num,radix){var alpha='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',n=Number(num),out='';if(n===0)return'0';while(n>0){out=alpha.charAt(n%radix)+out;n=Math.floor(n/radix);}return out;}
  function unpackPacker(src){var s=str(src),m=s.match(/}\(\s*'((?:\\.|[^'])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'])*)'\.split\(\s*'\|'\s*\)/);if(!m)m=s.match(/}\(\s*"((?:\\.|[^"])*)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*"((?:\\.|[^"])*)"\.split\(\s*"\|"\s*\)/);if(!m)return'';var payload=unescapeJs(m[1]),radix=parseInt(m[2],10)||36,count=parseInt(m[3],10)||0,words=unescapeJs(m[4]).split('|'),i,k,re;if(radix<2||radix>62)return'';for(i=count-1;i>=0;i--){if(!words[i])continue;k=encodeRadix(i,radix);try{re=new RegExp('\\b'+k+'\\b','g');payload=payload.replace(re,words[i]);}catch(e){}}return payload;}
  function expandedTexts(src){var base=normalizeText(src),q=[base],out=[],seen={},depth=0,i,s,m,re,dec,packed;while(q.length&&depth<32){s=str(q.shift());depth++;if(!s||seen[s])continue;seen[s]=1;out.push(s);if(/%2[fF]|%3[aA]|%68%74%74%70/i.test(s)){try{dec=decodeURIComponent(s);if(dec&&dec!==s&&dec.length<700000)q.push(normalizeText(dec));}catch(e0){}}packed=unpackPacker(s);if(packed&&packed!==s&&packed.length<700000)q.push(normalizeText(packed));re=/(?:atob|base64_decode)\s*\(\s*["']([A-Za-z0-9+\/_=-]{20,})["']\s*\)/ig;while((m=re.exec(s))){dec=b64decode(m[1]);if(dec&&dec.length<500000)q.push(normalizeText(dec));}re=/["']([A-Za-z0-9+\/_=-]{72,})["']/g;i=0;while((m=re.exec(s))&&i<12){i++;dec=b64decode(m[1]);if(/https?:|m3u8|mp4|source|file|player|video|url|parse/i.test(dec))q.push(normalizeText(dec));}}return out;}
  function scanMedia(src,base){var texts=expandedTexts(src),best=null,seen={},i,s,re,m;function push(raw,ref){var x=abs(raw,ref||base);if(!x||!isMedia(x)||badMedia(x)||seen[x])return;seen[x]=1;var it={url:x,ref:ref||base,score:mediaScore(x)};if(!best||it.score>best.score)best=it;}for(i=0;i<texts.length;i++){s=texts[i];re=/(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;while((m=re.exec(s)))push(m[1],base);re=/(\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;while((m=re.exec(s)))push(m[1],base);re=/(?:file|src|source|videoUrl|video_url|playUrl|play_url|m3u8|url)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig;while((m=re.exec(s)))push(m[1],base);re=/<(?:video|source)\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],base);}return best;}
  function playerConfig(src,base){
    var s=normalizeText(src),m,enc=0,play='',from='',parsers=[],re;
    m=s.match(/player_(?:aaaa|data)\s*=\s*\{([\s\S]{0,12000}?)\}\s*;?/i);
    if(m){var b=m[1],um=b.match(/["']?url["']?\s*:\s*["']([^"']+)["']/i),em=b.match(/["']?encrypt["']?\s*:\s*["']?(\d+)/i),fm=b.match(/["']?(?:from|flag)["']?\s*:\s*["']([^"']+)["']/i);if(um)play=um[1];if(em)enc=parseInt(em[1],10)||0;if(fm)from=fm[1];}
    if(play){if(enc===2){play=percentDecode(b64decode(play));}else if(enc===1){play=percentDecode(play);}else{play=percentDecode(play);}play=abs(play,base)||play;}
    re=/(?:["']parse["']|parse_api|parseApi|jx_url|jxUrl)\s*[:=]\s*["']([^"']+)["']/ig;while((m=re.exec(s))){var p=abs(m[1],base);if(p&&/^https?:\/\//i.test(p)&&parsers.indexOf(p)<0)parsers.push(p);}
    re=/["']parse["']\s*:\s*["']([^"']+)["']/ig;while((m=re.exec(s))){var p2=abs(m[1],base);if(p2&&/^https?:\/\//i.test(p2)&&parsers.indexOf(p2)<0)parsers.push(p2);}
    return{play:play,from:from,parsers:parsers.slice(0,8)};
  }
  function collectTargets(src,base){
    var texts=expandedTexts(src),arr=[],seen={},i,s,re,m,u,cfg;
    function push(raw,score,type){var x=abs(raw,base);if(!x||!/^https?:\/\//i.test(x)||isMedia(x)||seen[x])return;if(/\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|woff2?)(?:[?#]|$)/i.test(x))return;seen[x]=1;arr.push({url:x,score:score||0,type:type||'player'});}
    cfg=playerConfig(src,base);for(i=0;i<cfg.parsers.length;i++)push(cfg.parsers[i],125,'parser');
    for(i=0;i<texts.length;i++){s=texts[i];re=/<iframe\b[^>]*(?:src|data-src|data-url)\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],140,'iframe');re=/(?:playerUrl|player_url|embedUrl|embed_url|iframe|player|embed|playUrl|play_url|parseUrl|parse_url|jx)\s*[:=]\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1],115,'player');re=/(?:fetch|axios\.get|\$\.get)\s*\(\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1],/(api|source|parse|play|video|url)/i.test(m[1])?105:40,'api');re=/<script\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],/(player|video|hls|play|source|config|app)/i.test(m[1])?90:20,'script');re=/(?:location(?:\.href)?|window\.location)\s*=\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1],90,'redirect');re=/(https?:\/\/[^\s"'<>]+)/ig;while((m=re.exec(s))){u=m[1];if(/(player|embed|parse|jx|play|video|source|api)/i.test(u))push(u,60,'player');}}
    arr.sort(function(a,b){return b.score-a.score;});return arr;
  }
  function headerValue(headers,name){var k;headers=headers||{};for(k in headers)if(headers.hasOwnProperty(k)&&String(k).toLowerCase()===String(name).toLowerCase()){var v=headers[k];return Object.prototype.toString.call(v)==='[object Array]'?str(v[0]):str(v);}return'';}
  function httpInfo(url,ref,timeout,noRedirect){var raw='',o={body:'',headers:{},statusCode:0,url:url};try{raw=str(fetch(url,{timeout:Number(timeout||3800),headers:C.headers(ref||url),withStatusCode:true,redirect:noRedirect?false:true}));o=JSON.parse(raw);o.url=url;o.body=str(o.body||'');o.headers=o.headers||{};o.statusCode=Number(o.statusCode||0);}catch(e){o.body='';}return o;}
  function hlsLike(info,url){var ct=headerValue(info.headers,'content-type');return /^\s*#EXTM3U/i.test(str(info.body))||/(mpegurl|m3u8)/i.test(ct)||/\.m3u8(?:[?#]|$)/i.test(url);}
  function locationOf(info,base){var l=headerValue(info.headers,'location');return l?abs(l,base):'';}
  function sanitize(u){var x=str(u);try{x=x.replace(/([?&](?:token|auth|sign|key|expires|e|t)=)[^&#]+/ig,'$1***');}catch(e){}if(x.length>220)x=x.substring(0,220)+'…';return x;}
  function readPlayCache(url){var a=S.readJson(S.PLAY_CACHE_FILE,[]),now=Date.now(),i,x;if(Object.prototype.toString.call(a)!=='[object Array]')return null;for(i=0;i<a.length;i++){x=a[i];if(x&&x.page===url&&x.media&&now-Number(x.ts||0)<S.PLAY_TTL)return x;}return null;}
  function savePlayCache(page,media,ref,stage){var a=S.readJson(S.PLAY_CACHE_FILE,[]),out=[{page:str(page).substring(0,1600),media:str(media).substring(0,4000),ref:str(ref).substring(0,1600),stage:str(stage).substring(0,100),ts:Date.now()}],i;for(i=0;i<a.length&&out.length<24;i++)if(a[i]&&a[i].page!==page&&Date.now()-Number(a[i].ts||0)<S.PLAY_TTL)out.push(a[i]);S.writeJson(S.PLAY_CACHE_FILE,out,160000);}
  function saveDiag(lines){S.writeFile(S.PLAY_DIAG_FILE,str(lines).substring(0,12000));}
  function readDiag(){return S.readFile(S.PLAY_DIAG_FILE,'');}
  function playerOut(media,ref){var r=ref||C.base+'/',o='';try{o=C.origin(r);}catch(e){}return media+';{User-Agent@'+C.ua+'&&Referer@'+r+(o?'&&Origin@'+o:'')+'}#isVideo=true#';}
  function parserUrls(parser,play){var out=[],p=str(parser),v=str(play);if(!p||!v)return out;if(/(?:\?|&)url=$/i.test(p)||/[?&]url=$/i.test(p)||/=\s*$/.test(p)){out.push(p+v);out.push(p+encodeURIComponent(v));}else if(p.indexOf('{url}')>=0){out.push(p.replace('{url}',encodeURIComponent(v)));}else if(/[?&]url=/i.test(p)){out.push(p.replace(/([?&]url=)[^&]*/i,'$1'+encodeURIComponent(v)));}else{out.push(p+(p.indexOf('?')>=0?'&':'?')+'url='+encodeURIComponent(v));}return out;}
  C.resolveNoSniff=function(detailUrl){
    var cached=readPlayCache(detailUrl),diag=[],detail=httpInfo(detailUrl,detailUrl,4600,false),hit=null,cfg,targets=[],seen={},i,j,t,info,more=[],scriptBudget=0,apiBudget=0,parserBudget=0,hint='',loc='',built=[];
    if(cached){saveDiag('CACHE '+cached.stage+'\n'+sanitize(cached.media));return playerOut(cached.media,cached.ref||detailUrl);}
    diag.push('Test12 HTTP_ONLY');diag.push('detail '+detail.statusCode+' len='+detail.body.length+' ct='+headerValue(detail.headers,'content-type'));
    loc=locationOf(detail,detailUrl);if(loc&&isMedia(loc)){savePlayCache(detailUrl,loc,detailUrl,'detail-location');saveDiag(diag.join('\n')+'\nHIT detail-location '+sanitize(loc));return playerOut(loc,detailUrl);}
    if(hlsLike(detail,detailUrl)&&detail.body){savePlayCache(detailUrl,detailUrl,detailUrl,'detail-hls');saveDiag(diag.join('\n')+'\nHIT detail-hls');return playerOut(detailUrl,detailUrl);}
    if(detail.body){
      hit=scanMedia(detail.body,detailUrl);if(hit){savePlayCache(detailUrl,hit.url,hit.ref||detailUrl,'detail');saveDiag(diag.join('\n')+'\nHIT detail '+sanitize(hit.url));return playerOut(hit.url,hit.ref||detailUrl);}
      cfg=playerConfig(detail.body,detailUrl);if(cfg.play){diag.push('playerData enc/url '+sanitize(cfg.play));if(isMedia(cfg.play)){savePlayCache(detailUrl,cfg.play,detailUrl,'player-data');saveDiag(diag.join('\n')+'\nHIT player-data');return playerOut(cfg.play,detailUrl);}for(i=0;i<cfg.parsers.length;i++){built=parserUrls(cfg.parsers[i],cfg.play);for(j=0;j<built.length;j++)targets.push({url:built[j],score:210,type:'parse-built'});}}
      more=collectTargets(detail.body,detailUrl);for(i=0;i<more.length;i++)targets.push(more[i]);
    }
    try{hint=str(getMyVar('madou_t12_player_hint_'+S.hash(detailUrl),''));}catch(e0){}if(hint)targets.unshift({url:hint,score:230,type:'hint'});
    targets.sort(function(a,b){return(b.score||0)-(a.score||0);});
    for(i=0;i<targets.length&&i<12;i++){
      t=targets[i];if(!t||!t.url||seen[t.url])continue;seen[t.url]=1;
      if(t.type==='script'&&scriptBudget>=3)continue;if(t.type==='api'&&apiBudget>=3)continue;if(/parse/.test(t.type)&&parserBudget>=4)continue;
      if(t.type==='script')scriptBudget++;if(t.type==='api')apiBudget++;if(/parse/.test(t.type))parserBudget++;
      info=httpInfo(t.url,detailUrl,t.type==='script'?3000:3900,false);diag.push(t.type+'#'+i+' '+info.statusCode+' len='+info.body.length+' '+sanitize(t.url));
      loc=locationOf(info,t.url);if(loc&&isMedia(loc)){savePlayCache(detailUrl,loc,t.url,t.type+'-location');saveDiag(diag.join('\n')+'\nHIT location '+sanitize(loc));return playerOut(loc,t.url);}
      if(hlsLike(info,t.url)&&info.body){savePlayCache(detailUrl,t.url,detailUrl,t.type+'-hls');saveDiag(diag.join('\n')+'\nHIT hls '+sanitize(t.url));return playerOut(t.url,detailUrl);}
      if(!info.body)continue;
      hit=scanMedia(info.body,t.url);if(hit){savePlayCache(detailUrl,hit.url,hit.ref||t.url,t.type);saveDiag(diag.join('\n')+'\nHIT '+t.type+' '+sanitize(hit.url));return playerOut(hit.url,hit.ref||t.url);}
      cfg=playerConfig(info.body,t.url);if(cfg.play){diag.push('nested playerData '+sanitize(cfg.play));if(isMedia(cfg.play)){savePlayCache(detailUrl,cfg.play,t.url,'nested-player-data');saveDiag(diag.join('\n')+'\nHIT nested-player-data');return playerOut(cfg.play,t.url);}for(j=0;j<cfg.parsers.length;j++){built=parserUrls(cfg.parsers[j],cfg.play);for(var z=0;z<built.length&&targets.length<24;z++)targets.push({url:built[z],score:205,type:'parse-built'});}}
      more=collectTargets(info.body,t.url);for(j=0;j<more.length&&targets.length<24;j++)if(more[j]&&!seen[more[j].url]&&(more[j].type==='api'||more[j].type==='script'||more[j].type==='parser'||more[j].score>=90))targets.push(more[j]);
    }
    saveDiag(diag.join('\n')+'\nMISS HTTP_ONLY');return'';
  };
  return{resolve:C.resolveNoSniff,readCache:readPlayCache,clearCache:function(){return S.deleteFile(S.PLAY_CACHE_FILE);},readDiag:readDiag,scanMedia:scanMedia,collectTargets:collectTargets};
})();