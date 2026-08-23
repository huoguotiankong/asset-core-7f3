/* 麻豆传媒 Test2 - large HTML storage safety patch */
(function(){
  if(typeof MadouCore==='undefined') throw new Error('MadouCore unavailable');
  var C=MadouCore;
  var oldPrefix=C.cachePrefix||'madou_v1_';
  function safeClear(k){
    try{if(typeof clearItem==='function'){clearItem(k);return;}}catch(e){}
    try{setItem(k,'');}catch(e2){}
  }
  function oldKey(s){var x=C.s(s),h=0,i;for(i=0;i<x.length;i++)h=((h<<5)-h+x.charCodeAt(i))|0;return oldPrefix+Math.abs(h);}
  try{
    var legacy=[oldKey(C.base),oldKey(C.base+'/')];
    for(var i=0;i<legacy.length;i++){safeClear(legacy[i]);safeClear(legacy[i]+'_ts');}
  }catch(e3){}

  C.cachePrefix='madou_v2_';
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/bootstrap_test_v2_b10102.js?v=10102';
  C._htmlMem={};
  C._htmlMemTs={};
  C.clearHtmlCache=function(url){
    url=C.s(url||C.base+'/');
    try{delete C._htmlMem[url];delete C._htmlMemTs[url];}catch(e){}
    var k=C.cacheKey(url);safeClear(k);safeClear(k+'_ts');
  };
  C.fetchHtml=function(url,force){
    url=C.s(url||C.base+'/');
    var now=new Date().getTime(),mem=C._htmlMem[url]||'',mts=C._htmlMemTs[url]||0,h='';
    if(!force&&mem&&now-mts<3*60*1000)return mem;

    // Test1 stored full HTML in setItem. A homepage can exceed the 1 MB private-storage limit.
    // Always remove any legacy raw-HTML slot for this URL and keep full HTML only in memory.
    C.clearHtmlCache(url);
    try{h=C.s(fetch(url,{timeout:9000,headers:C.headers(url)}));}catch(e1){h='';}
    if(C.isBadHtml(h)){
      try{h=C.s(fetchCodeByWebView(url,{timeout:15000,headers:C.headers(url)}));}catch(e2){}
    }
    if(!C.isBadHtml(h)){
      C._htmlMem[url]=h;C._htmlMemTs[url]=now;
      try{setItem('madou_diag_last_html_len',String(h.length));}catch(e3){}
      try{setItem('madou_diag_last_fetch_ts',String(now));}catch(e4){}
      return h;
    }
    return mem||h;
  };
})();
