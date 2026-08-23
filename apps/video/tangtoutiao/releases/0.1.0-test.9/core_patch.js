/* 汤头条 0.1.0-test.9 Core Patch / header-image + media fallbacks */
var TangTouTiaoCoreV017=(function(){
  var V='0.1.0-test.9',B=TangTouTiaoCoreV016;
  function imageUrl(raw){
    var u=B.imageCandidate(raw);if(!u)return'';if(!/^https?:\/\//i.test(u))return u;
    var host=(u.match(/^https?:\/\/([^\/]+)/i)||[])[1]||'',plainExt=/\.(?:jpe?g|png|gif|webp|bmp)(?:\?|$)/i.test(u);
    if(plainExt&&/^(?:picx\.)?yrfmba\.cn$/i.test(host)){
      var h={'User-Agent':'Mozilla/5.0 (Linux; Android 13; HikerView) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36','Accept':'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'};
      var link=u+'@headers='+JSON.stringify(h);
      try{setItem('ttt_last_image_policy',JSON.stringify({time:Date.now(),host:host,mode:'header-public-image',headers:true,url:u.substring(0,180)}));}catch(e0){}
      return link;
    }
    try{setItem('ttt_last_image_policy',JSON.stringify({time:Date.now(),host:host,mode:'decrypt-helper',url:u.substring(0,180)}));}catch(e1){}
    return B.imageUrl(raw);
  }
  function patchItem(x){if(x&&x.coverRaw)x.cover=imageUrl(x.coverRaw);return x;}
  function patchList(a){a=Array.isArray(a)?a:[];for(var i=0;i<a.length;i++)patchItem(a[i]);return a;}
  function normalize(res,kind){return patchList(B.normalize(res,kind));}
  function exactFeatured(res){return patchList(B.exactFeatured(res));}
  function directList(res){return patchList(B.directList(res));}
  function detailItem(res,fb){return patchItem(B.detailItem(res,fb));}
  function mediaUrl(u){u=String(u||'').trim();return /^https?:\/\//i.test(u)&&(/\.(?:m3u8|mp4|m4v)(?:\?|$)/i.test(u)||/\/videos?\d*\//i.test(u));}
  function sources(it){
    var a=B.sources(it),seen={};for(var i=0;i<a.length;i++)seen[String(a[i].url||'')]=1;
    function add(name,u){u=String(u||'').trim();if(u&&mediaUrl(u)&&!seen[u]){seen[u]=1;a.push({name:name,url:u,fallback:true});}}
    add('原始',it&&it.sourceOrigin);add('预览',it&&it.preview);return a;
  }
  function qualitySources(it){var a=sources(it),o=[];for(var i=0;i<a.length;i++)if(/^\d+P$/i.test(String(a[i].name||'')))o.push(a[i]);return o;}
  function comicList(res){var a=B.comicList(res);for(var i=0;i<a.length;i++)if(a[i].coverRaw)a[i].cover=imageUrl(a[i].coverRaw);return a;}
  function rankCreators(res){var a=B.rankCreators(res);for(var i=0;i<a.length;i++)if(a[i].coverRaw)a[i].cover=imageUrl(a[i].coverRaw);return a;}
  var O={};for(var k in B)if(B.hasOwnProperty(k))O[k]=B[k];
  O.version=V;O.imageUrl=imageUrl;O.normalize=normalize;O.exactFeatured=exactFeatured;O.directList=directList;O.detailItem=detailItem;O.sources=sources;O.qualitySources=qualitySources;O.comicList=comicList;O.rankCreators=rankCreators;
  return O;
})();
