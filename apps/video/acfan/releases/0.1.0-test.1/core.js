/* ACFAN 0.1.0-test.1 clean core */
var ACFANCore=(function(){
  var VERSION='0.1.0-test.1',BUILD=10101;
  var UA='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var H5_DEFAULT='https://aasf.wwvgadm0.work/mobile';
  var STATIC_API=['https://sjacfanapi.sexbar.site','https://api2.uszim.com','https://acg.imscc.cc','https://acapp.sexbar.site'];
  var CONFIG_URLS=['https://tc-jp-alijs-1375272368.cos.ap-tokyo.myqcloud.com/acfun.json','https://d3q70k4zzxh07f.cloudfront.net/acfun.json'];
  var K={device:'acfan_v1_device',token:'acfan_v1_token',host:'acfan_v1_host',imgDomain:'acfan_v1_img_domain',h5:'acfan_v1_h5',diag:'acfan_v1_diag',fav:'acfan_v1_fav',history:'acfan_v1_history',search:'acfan_v1_search',hosts:'acfan_v1_hosts_cache',hostsTs:'acfan_v1_hosts_ts',pageSize:'acfan_v1_page_size'};
  function s(v,d){if(v===undefined||v===null)return d===undefined?'':String(d);var x=String(v);return x==='null'||x==='undefined'?(d===undefined?'':String(d)):x;}
  function clean(v){return s(v).replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;/ig,"'").replace(/&quot;/ig,'"').replace(/\s+/g,' ').trim();}
  function html(v){return clean(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
  function n(v){var x=s(v);return /^-?\d+$/.test(x)?Number(x):x;}
  function pick(o,keys,d){o=o||{};for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!==undefined&&v!==null&&v!==''&&v!=='null'&&v!=='undefined')return v;}return d===undefined?'':d;}
  function deep(o,keys,depth){if(!o||typeof o!=='object'||depth>9)return'';var wanted={},i,k,v;for(i=0;i<keys.length;i++)wanted[String(keys[i]).toLowerCase()]=1;if(!Array.isArray(o)){for(k in o)if(wanted[String(k).toLowerCase()]&&o[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k];}if(Array.isArray(o)){for(i=0;i<o.length;i++){v=deep(o[i],keys,depth+1);if(v!==''&&v!==null&&v!==undefined)return v;}}else{for(k in o)if(o[k]&&typeof o[k]==='object'){v=deep(o[k],keys,depth+1);if(v!==''&&v!==null&&v!==undefined)return v;}}return'';}
  function first(v){if(v===undefined||v===null)return'';if(typeof v==='string'||typeof v==='number')return s(v);if(Array.isArray(v)){for(var i=0;i<v.length;i++){var a=first(v[i]);if(a)return a;}return'';}if(typeof v==='object'){var ks=['url','path','src','image','img','cover','videoUrl','playUrl','audioUrl'];for(var j=0;j<ks.length;j++){if(v[ks[j]]!==undefined){var b=first(v[ks[j]]);if(b)return b;}}}return'';}
  function arr(v){if(Array.isArray(v))return v;if(!v||typeof v!=='object')return[];var keys=['list','items','records','rows','dataList','videoList','videos','content','resultList','stationList','stations','classTypeList','comicsBaseList','comicsList','fictionList','dynamicList','categoryList','tagList','chapterList','chapters'],i,k,a;for(i=0;i<keys.length;i++)if(Array.isArray(v[keys[i]]))return v[keys[i]];for(i=0;i<keys.length;i++){if(v[keys[i]]&&typeof v[keys[i]]==='object'){a=arr(v[keys[i]]);if(a.length)return a;}}for(k in v)if(Array.isArray(v[k])&&v[k].length)return v[k];return[];}
  function merge(a,b){var out={},k;for(k in(a||{}))out[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')out[k]=b[k];return out;}
  function uniq(rows,keyFn){var out=[],seen={},i,k;for(i=0;i<(rows||[]).length;i++){k=s(keyFn(rows[i]));if(!k||seen[k])continue;seen[k]=1;out.push(rows[i]);}return out;}
  function fmtNum(v){var x=Number(v);if(!isFinite(x))return s(v);if(x>=1e8)return(x/1e8).toFixed(x>=1e9?0:1)+'亿';if(x>=1e4)return(x/1e4).toFixed(x>=1e5?0:1)+'万';return String(x);}
  function enc(v){return encodeURIComponent(s(v));}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true';p=p||{};for(var k in p)if(p[k]!==undefined&&p[k]!==null&&s(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);return u;}
  function param(k,d){try{var v=s(getParam(k,d===undefined?'':d));try{return decodeURIComponent(v.replace(/\+/g,'%20'));}catch(e){return v;}}catch(e2){return d===undefined?'':s(d);}}
  function pageNo(){try{return Math.max(1,Number(MY_PAGE||1)||1);}catch(e){return 1;}}
  function getH5(){var u=s(getItem(K.h5,H5_DEFAULT)).trim();return /^https?:\/\//i.test(u)?u:H5_DEFAULT;}
  function setH5(u){u=s(u).trim();if(u&&!/^https?:\/\//i.test(u))u='https://'+u.replace(/^\/+/, '');if(u)setItem(K.h5,u);return u;}
  function readList(key){try{var x=JSON.parse(getItem(key,'[]')||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}}
  function writeList(key,a,max){try{setItem(key,JSON.stringify((a||[]).slice(0,max||100)));return true;}catch(e){return false;}}
  function normalizeItem(x){x=x||{};return{kind:s(x.kind),id:s(x.id),title:clean(x.title),img:s(x.img),author:clean(x.author),desc:clean(x.desc),uri:s(x.uri),data:s(x.data),ts:Date.now()};}
  function upsert(key,x,max){x=normalizeItem(x);if(!x.id)return;var a=readList(key),out=[x];for(var i=0;i<a.length;i++)if(a[i]&&!(s(a[i].kind)===x.kind&&s(a[i].id)===x.id))out.push(a[i]);writeList(key,out,max);}
  function favorites(){return readList(K.fav);}
  function history(){return readList(K.history);}
  function isFav(kind,id){var a=favorites();for(var i=0;i<a.length;i++)if(a[i]&&s(a[i].kind)===s(kind)&&s(a[i].id)===s(id))return true;return false;}
  function toggleFav(x){x=normalizeItem(x);var a=favorites(),out=[],found=false;for(var i=0;i<a.length;i++){if(a[i]&&s(a[i].kind)===x.kind&&s(a[i].id)===x.id)found=true;else out.push(a[i]);}if(!found)out.unshift(x);writeList(K.fav,out,160);return!found;}
  function addHistory(x){upsert(K.history,x,120);}
  function searchHistory(){return readList(K.search).map(function(x){return typeof x==='string'?x:s(x&&x.title);}).filter(Boolean);}
  function saveSearch(q){q=clean(q);if(!q)return;var a=searchHistory().filter(function(x){return x!==q;});a.unshift(q);writeList(K.search,a,20);}
  function clear(which){if(which==='fav')writeList(K.fav,[]);else if(which==='history')writeList(K.history,[]);else if(which==='search')writeList(K.search,[]);else if(which==='session'){setItem(K.token,'');setItem(K.host,'');setItem(K.hosts,'[]');setItem(K.hostsTs,'0');}}
  function diag(stage,msg,extra){var x={time:Date.now(),version:VERSION,build:BUILD,stage:s(stage),msg:s(msg).slice(0,1600),extra:extra||{}};try{setItem(K.diag,JSON.stringify(x));}catch(e){}return x;}
  function getDiag(){try{return JSON.parse(getItem(K.diag,'{}')||'{}');}catch(e){return{};}}
  function pageSize(){var x=Number(getItem(K.pageSize,'12')||12);return Math.max(8,Math.min(20,x));}
  return{version:VERSION,build:BUILD,ua:UA,h5Default:H5_DEFAULT,staticApiHosts:STATIC_API,configUrls:CONFIG_URLS,K:K,s:s,clean:clean,html:html,n:n,pick:pick,deep:deep,first:first,arr:arr,merge:merge,uniq:uniq,fmtNum:fmtNum,page:page,param:param,pageNo:pageNo,getH5:getH5,setH5:setH5,favorites:favorites,history:history,isFav:isFav,toggleFav:toggleFav,addHistory:addHistory,searchHistory:searchHistory,saveSearch:saveSearch,clear:clear,diag:diag,getDiag:getDiag,pageSize:pageSize};
})();
