/* 麻豆传媒 Test12A - private-file storage rescue */
var MadouT12State=(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined') throw new Error('Madou runtime unavailable');
  var C=MadouCore,R=MadouRemoteRuntime;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var S={};
  S.SETTINGS_FILE='madou_t12_settings.json';
  S.PLAY_CACHE_FILE='madou_t12_media_cache.json';
  S.PLAY_DIAG_FILE='madou_t12_play_diag.txt';
  S.FAVORITES_FILE='madou_t12_favorites.json';
  S.HISTORY_FILE='madou_t12_history.json';
  S.PAGE_TPL_FILE='madou_t12_page_templates.json';
  S.PLAY_TTL=30*60*1000;
  C.version='0.1.0-test.12';C.build=10112;R.version='0.1.0-test.12';R.build=10112;C.bootstrap=ROOT+'bootstrap_test_v12_b10112.js?v=10112';
  S.str=function(v){return v===undefined||v===null?'':String(v);};
  S.hash=function(v){var x=S.str(v),h=0,i;for(i=0;i<x.length;i++)h=((h<<5)-h+x.charCodeAt(i))|0;return Math.abs(h);};
  S.readFile=function(name,def){var s='';try{s=S.str(readFile(name));}catch(e){}return s||def||'';};
  S.writeFile=function(name,text){try{saveFile(name,S.str(text));return true;}catch(e){return false;}};
  S.deleteFile=function(name){try{deleteFile(name);return true;}catch(e){return false;}};
  S.readJson=function(name,def){var s=S.readFile(name,'');if(!s)return def;try{return JSON.parse(s);}catch(e){return def;}};
  S.writeJson=function(name,obj,maxChars){var s='';try{s=JSON.stringify(obj);}catch(e){return false;}if(maxChars&&s.length>maxChars)return false;return S.writeFile(name,s);};
  S.settings=function(){var o=S.readJson(S.SETTINGS_FILE,{});if(!o||typeof o!=='object')o={};return{detailMode:/^(manual|tags|all)$/.test(S.str(o.detailMode))?S.str(o.detailMode):'manual',sniffFallback:o.sniffFallback===true};};
  S.saveSettings=function(patch){var o=S.settings(),k;for(k in patch)if(patch.hasOwnProperty(k))o[k]=patch[k];return S.writeJson(S.SETTINGS_FILE,o,12000);};
  function legacyArray(key){var raw='[]',a=[];try{raw=S.str(getItem(key,'[]'));a=JSON.parse(raw);}catch(e){a=[];}return Object.prototype.toString.call(a)==='[object Array]'?a:[];}
  function fileForKey(key){return key===C.favoriteKey?S.FAVORITES_FILE:S.HISTORY_FILE;}
  C.slimItem=function(item){var x=item||{},img=S.str(x.img||''),raw=S.str(x.rawImg||'');if(img.length>1800||/^data:/i.test(img))img='';if(raw.length>1800||/^data:/i.test(raw))raw='';return{url:S.str(x.url||'').substring(0,1800),title:S.str(x.title||'影片').substring(0,180),img:img,rawImg:raw,desc:S.str(x.desc||'').substring(0,240),time:Number(x.time||Date.now())};};
  C.readList=function(key){var fn=fileForKey(key),a=S.readJson(fn,null),i,out=[];if(Object.prototype.toString.call(a)!=='[object Array]'){a=legacyArray(key);if(a.length)S.writeJson(fn,a,220000);}for(i=0;i<(a||[]).length;i++)if(a[i]&&a[i].url)out.push(C.slimItem(a[i]));return out;};
  C.writeList=function(key,items){var fn=fileForKey(key),src=items||[],out=[],max=key===C.historyKey?60:90,i,s;for(i=0;i<src.length&&i<max;i++)out.push(C.slimItem(src[i]));s=JSON.stringify(out);while(s.length>180000&&out.length>10){out=out.slice(0,Math.max(10,Math.floor(out.length/2)));s=JSON.stringify(out);}return S.writeFile(fn,s);};
  C.addHistory=function(item){var old=C.readList(C.historyKey),cur=C.slimItem(item),out=[cur],i;for(i=0;i<old.length&&out.length<60;i++)if(old[i]&&old[i].url!==cur.url)out.push(C.slimItem(old[i]));return C.writeList(C.historyKey,out);};
  C.toggleFav=function(item){var old=C.readList(C.favoriteKey),cur=C.slimItem(item),out=[],hit=false,i;for(i=0;i<old.length;i++){if(old[i]&&old[i].url===cur.url)hit=true;else out.push(C.slimItem(old[i]));}if(!hit)out.unshift(cur);C.writeList(C.favoriteKey,out);return !hit;};
  C.isFav=function(url){var a=C.readList(C.favoriteKey),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url===url)return true;return false;};
  C.pageUrl=function(base,page,html1){
    page=parseInt(page,10)||1;if(page<=1)return base;
    var map=S.readJson(S.PAGE_TPL_FILE,{}),key=String(S.hash('page2:'+base)),tpl=S.str(map[key]||'');
    if(!tpl&&html1){tpl=C.discoverPage2(html1,base);if(tpl){map[key]=tpl;S.writeJson(S.PAGE_TPL_FILE,map,70000);}}
    if(tpl){if(/[?&](page|paged|p)=\d+/i.test(tpl))return tpl.replace(/([?&](?:page|paged|p)=)\d+/i,'$1'+page);if(/\/page\/\d+\/?/i.test(tpl))return tpl.replace(/\/page\/\d+\/?/i,'/page/'+page+'/');if(/\/\d+\/?(?:\?|$)/.test(tpl))return tpl.replace(/\/\d+\/?(?=\?|$)/,'/'+page+'/');}
    if(/[?&](page|paged|p)=\d+/i.test(base))return base.replace(/([?&](?:page|paged|p)=)\d+/i,'$1'+page);if(/\/page\/\d+\/?/i.test(base))return base.replace(/\/page\/\d+\/?/i,'/page/'+page+'/');return base.replace(/\/$/,'')+'/page/'+page+'/';
  };
  C._t12Html={};C._t12HtmlTs={};
  C.fetchHtml=function(url,force){var target=S.str(url||C.base+'/'),now=Date.now(),old=C._t12Html[target]||'',ts=Number(C._t12HtmlTs[target]||0),h='';if(!force&&old&&now-ts<180000)return old;try{h=S.str(fetch(target,{timeout:6500,headers:C.headers(target)}));}catch(e){}if(!C.isBadHtml(h)){C._t12Html[target]=h;C._t12HtmlTs[target]=now;return h;}return old||h;};
  return S;
})();