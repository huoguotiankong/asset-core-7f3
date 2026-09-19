/* 黄果短剧 0.1.0-test.1 PlaybackAdapter */
var HuangGuoPlaybackV1=(function(){
  var C=HuangGuoCoreV1;
  function unescapeUrl(u){u=String(u||'').replace(/\\u0026/g,'&').replace(/\\\//g,'/').replace(/&amp;/g,'&');if(/^\/\//.test(u))u='https:'+u;return u;}
  function resolve(pageUrl){var html=C.req(pageUrl),m=html.match(/"videoSrc"\s*:\s*"([^"]+)"/i),u=m?unescapeUrl(m[1]):'';if(!u){m=html.match(/<source[^>]+src=["']([^"']+)["']/i);if(m)u=unescapeUrl(m[1]);}if(!u){m=html.match(/https?:\\?\/\\?\/[^"'\s<>]+?\.m3u8[^"'\s<>]*/i);if(m)u=unescapeUrl(m[0]);}if(!u){m=html.match(/https?:\\?\/\\?\/[^"'\s<>]+?\.mp4[^"'\s<>]*/i);if(m)u=unescapeUrl(m[0]);}if(u){u=C.abs(u,C.origin(pageUrl));C.diag('PLAY_DIRECT',u,'',{route:'source/videoSrc'});return{ok:true,url:u,route:'source'};}C.diag('PLAY_SOURCE_PARSE',pageUrl,'videoSrc/media field missing',{route:'video-fallback'});return{ok:false,url:'',route:'video-fallback'};}
  function play(pageUrl,seedJson){var seed={};try{seed=typeof seedJson==='string'?JSON.parse(seedJson):seedJson||{};}catch(e){}try{C.addHistory({url:seed.detailUrl||seed.url||pageUrl,title:seed.title||'',cover:seed.cover||'',episode:seed.episode||'',desc:seed.desc||''});}catch(e){}try{var r=resolve(pageUrl);if(r.ok)return r.url+'#isVideo=true#';}catch(e){C.diag('PLAY_ERROR',pageUrl,String(e.message||e));}return'video://'+pageUrl;}
  return{version:'0.1.0-test.1',resolve:resolve,play:play};
})();
