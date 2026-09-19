/* 黄果短剧 0.1.0-test.5 PlaybackAdapter - direct videoSrc only, no webpage fallback */
var HuangGuoPlaybackV1=(function(){
  var C=HuangGuoCoreV1;
  function cleanUrl(u){
    u=String(u||'').replace(/\\u0026/g,'&').replace(/\\\//g,'/').replace(/&amp;/g,'&').trim();
    if(/^\/\//.test(u))u='https:'+u;
    return u;
  }
  function resolve(pageUrl){
    var html=String(C.req(pageUrl)||''),m=html.match(/"videoSrc":"([^"]+)",/),u=m?cleanUrl(m[1]):'';
    if(!u){m=html.match(/"videoSrc"\s*:\s*"([^"]+)"/);u=m?cleanUrl(m[1]):'';}
    if(u&&u.indexOf('http')!==0)u=C.abs(u,C.origin(pageUrl));
    if(/^https?:\/\//i.test(u)){
      C.diag('PLAY_DIRECT',u,'',{route:'videoSrc'});
      return{ok:true,url:u,route:'videoSrc'};
    }
    C.diag('PLAY_SOURCE_PARSE',pageUrl,'videoSrc missing',{route:'direct-only'});
    return{ok:false,url:'',route:'direct-only'};
  }
  function play(pageUrl,seedJson){
    var seed={};
    try{seed=typeof seedJson==='string'?JSON.parse(seedJson):seedJson||{};}catch(e){}
    try{C.addHistory({url:seed.detailUrl||seed.url||pageUrl,title:seed.title||'',cover:seed.cover||'',episode:seed.episode||'',desc:seed.desc||''});}catch(e){}
    try{
      var r=resolve(pageUrl);
      if(r.ok)return r.url+'#isVideo=true#';
    }catch(e){C.diag('PLAY_ERROR',pageUrl,String(e.message||e));}
    return'toast://视频直链解析失败，请反馈该剧集';
  }
  return{version:'0.1.0-test.5',resolve:resolve,play:play};
})();
