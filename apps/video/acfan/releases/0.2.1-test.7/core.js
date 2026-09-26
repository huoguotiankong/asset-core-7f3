/* ACFAN 0.2.1-test.7 core */
var ACFAN7Core=(function(){
  var VERSION='0.2.1-test.7',BUILD=10207;
  var UA='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var DALVIK='Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)';
  var H5_DEFAULT='https://aasf.wwvgadm0.work/mobile';
  var IMAGE_CDN='https://cdn.ukaim.com/';
  var API_HOSTS=['https://sjacfanapi.sexbar.site','https://acapp.sexbar.site','https://api2.uszim.com','https://acg.imscc.cc'];
  var CONFIG_URLS=['https://d3q70k4zzxh07f.cloudfront.net/acfun.json','https://tc-jp-alijs-1375272368.cos.ap-tokyo.myqcloud.com/acfun.json'];
  var K={prefix:'acfan_t7_',device:'acfan_t7_device',token:'acfan_t7_token',apiHost:'acfan_t7_api_host',apiHosts:'acfan_t7_api_hosts',apiHostsTs:'acfan_t7_api_hosts_ts',imgDomain:'acfan_t7_img_domain',h5:'acfan_t7_h5',h5Candidates:'acfan_t7_h5_candidates',diag:'acfan_t7_diag',fav:'acfan_t7_fav',history:'acfan_t7_history',search:'acfan_t7_search',pageSize:'acfan_t7_page_size',imageQuality:'acfan_t7_image_quality',playMode:'acfan_t7_play_mode'};
  function s(v,d){if(v===undefined||v===null)return d===undefined?'':String(d);var x=String(v);return x==='null'||x==='undefined'?(d===undefined?'':String(d)):x;}
  function clean(v){return s(v).replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;/ig,"'").replace(/&quot;/ig,'"').replace(/\s+/g,' ').trim();}
  function html(v){return s(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>');}
  function n(v){var x=s(v);return /^-?\d+$/.test(x)?Number(x):x;}
  function pick(o,keys,d){o=o||{};for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!==undefined&&v!==null&&v!==''&&v!=='null'&&v!=='undefined')return v;}return d===undefined?'':d;}
  function deep(o,keys,depth){if(!o||typeof o!=='object'||depth>10)return'';var wanted={},i,k,v;for(i=0;i<keys.length;i++)wanted[s(keys[i]).toLowerCase()]=1;if(!Array.isArray(o)){for(k in o)if(wanted[s(k).toLowerCase()]&&o[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k];}if(Array.isArray(o)){for(i=0;i<o.length;i++){v=deep(o[i],keys,depth+1);if(v!==''&&v!==null&&v!==undefined)return v;}}else{for(k in o)if(o[k]&&typeof o[k]==='object'){v=deep(o[k],keys,depth+1);if(v!==''&&v!==null&&v!==undefined)return v;}}return'';}
  function first(v){if(v===undefined||v===null)return'';if(typeof v==='string'||typeof v==='number')return s(v);if(Array.isArray(v)){for(var i=0;i<v.length;i++){var a=first(v[i]);if(a)return a;}return'';}if(typeof v==='object'){var ks=['url','path','src','image','img','cover','videoUrl','playUrl','audioUrl','value'];for(var j=0;j<ks.length;j++){if(v[ks[j]]!==undefined){var b=first(v[ks[j]]);if(b)return b;}}}return'';}
  function arr(v){if(Array.isArray(v))return v;if(!v||typeof v!=='object')return[];var keys=['list','items','records','rows','dataList','videoList','videos','content','resultList','stationList','stations','classTypeList','classifyList','comicsBaseList','comicsList','fictionList','dynamicList','categoryList','tagList','chapterList','chapters','squareList'],i,k,a;for(i=0;i<keys.length;i++)if(Array.isArray(v[keys[i]]))return v[keys[i]];for(i=0;i<keys.length;i++){if(v[keys[i]]&&typeof v[keys[i]]==='object'){a=arr(v[keys[i]]);if(a.length)return a;}}for(k in v)if(Array.isArray(v[k])&&v[k].length)return v[k];return[];}
  function merge(a,b){var out={},k;for(k in(a||{}))out[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')out[k]=b[k];return out;}
  function uniq(rows,keyFn){var out=[],seen={},i,k;for(i=0;i<(rows||[]).length;i++){k=s(keyFn(rows[i]));if(!k||seen[k])continue;seen[k]=1;out.push(rows[i]);}return out;}
  function fmtNum(v){var x=Number(v);if(!isFinite(x))return s(v);if(x>=1e8)return(x/1e8).toFixed(x>=1e9?0:1)+'亿';if(x>=1e4)return(x/1e4).toFixed(x>=1e5?0:1)+'万';return String(x);}
  function enc(v){return encodeURIComponent(s(v));}
  function page(path,p,opt){var u='hiker://page/'+path+'?rule=&simple=true';p=p||{};for(var k in p)if(p[k]!==undefined&&p[k]!==null&&s(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);if(opt&&opt.theme)u+='#'+opt.theme+'#';return u;}
  function param(k,d){var def=d===undefined?'':s(d),u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^&#]*)'));if(m){try{return decodeURIComponent(m[1].replace(/\+/g,'%20'));}catch(e){return m[1];}}try{var v=s(getParam(k,def));try{return decodeURIComponent(v.replace(/\+/g,'%20'));}catch(e2){return v;}}catch(e3){return def;}}
  function pageNo(){try{return Math.max(1,Number(MY_PAGE||1)||1);}catch(e){return 1;}}
  function getH5(){var u=s(getItem(K.h5,H5_DEFAULT)).trim();return /^https?:\/\//i.test(u)?u:H5_DEFAULT;}
  function setH5(u){u=s(u).trim();if(u&&!/^https?:\/\//i.test(u))u='https://'+u.replace(/^\/+/, '');if(u){if(!/\/mobile(?:[/?#]|$)/i.test(u))u=u.replace(/\/+$/,'')+'/mobile';setItem(K.h5,u);}return u;}
  function readJson(key,def){try{var x=JSON.parse(getItem(key,JSON.stringify(def)));return x===undefined||x===null?def:x;}catch(e){return def;}}
  function writeJson(key,v){try{setItem(key,JSON.stringify(v));return true;}catch(e){return false;}}
  function normalizeItem(x){x=x||{};return{kind:s(x.kind),id:s(x.id),title:clean(x.title),img:s(x.img),author:clean(x.author),desc:clean(x.desc),uri:s(x.uri),badge:clean(x.badge),ts:Date.now()};}
  function upsert(key,x,max){x=normalizeItem(x);if(!x.id)return;var a=readJson(key,[]),out=[x];for(var i=0;i<a.length;i++)if(a[i]&&!(s(a[i].kind)===x.kind&&s(a[i].id)===x.id))out.push(a[i]);writeJson(key,out.slice(0,max||100));}
  function favorites(){var a=readJson(K.fav,[]);return Array.isArray(a)?a:[];}
  function history(){var a=readJson(K.history,[]);return Array.isArray(a)?a:[];}
  function isFav(kind,id){var a=favorites();for(var i=0;i<a.length;i++)if(a[i]&&s(a[i].kind)===s(kind)&&s(a[i].id)===s(id))return true;return false;}
  function toggleFav(x){x=normalizeItem(x);var a=favorites(),out=[],found=false;for(var i=0;i<a.length;i++){if(a[i]&&s(a[i].kind)===x.kind&&s(a[i].id)===x.id)found=true;else out.push(a[i]);}if(!found)out.unshift(x);writeJson(K.fav,out.slice(0,240));return!found;}
  function addHistory(x){upsert(K.history,x,180);}
  function searchHistory(){var a=readJson(K.search,[]);return(Array.isArray(a)?a:[]).map(function(x){return clean(typeof x==='string'?x:x&&x.title);}).filter(Boolean);}
  function saveSearch(q){q=clean(q);if(!q)return;var a=searchHistory().filter(function(x){return x!==q;});a.unshift(q);writeJson(K.search,a.slice(0,24));}
  function removeSearch(q){q=clean(q);writeJson(K.search,searchHistory().filter(function(x){return x!==q;}));}
  function clear(which){if(which==='fav')writeJson(K.fav,[]);else if(which==='history')writeJson(K.history,[]);else if(which==='search')writeJson(K.search,[]);else if(which==='session'){setItem(K.token,'');setItem(K.apiHost,'');setItem(K.apiHosts,'[]');setItem(K.apiHostsTs,'0');setItem(K.imgDomain,'');}}
  function migrate(){var pairs=[[K.device,'acfan_t6_device'],[K.token,'acfan_t6_token'],[K.apiHost,'acfan_t6_api_host'],[K.apiHosts,'acfan_t6_api_hosts'],[K.apiHostsTs,'acfan_t6_api_hosts_ts'],[K.imgDomain,'acfan_t6_img_domain'],[K.h5,'acfan_t6_h5'],[K.h5Candidates,'acfan_t6_h5_candidates'],[K.fav,'acfan_t6_fav'],[K.history,'acfan_t6_history'],[K.search,'acfan_t6_search'],[K.pageSize,'acfan_t6_page_size'],[K.imageQuality,'acfan_t6_image_quality']];for(var i=0;i<pairs.length;i++){try{if(!getItem(pairs[i][0],'')&&getItem(pairs[i][1],''))setItem(pairs[i][0],getItem(pairs[i][1],''));}catch(e){}}}
  function diag(stage,msg,extra){var x={time:Date.now(),version:VERSION,build:BUILD,stage:s(stage),msg:s(msg).slice(0,2400),extra:extra||{}};try{setItem(K.diag,JSON.stringify(x));}catch(e){}return x;}
  function getDiag(){return readJson(K.diag,{});}
  function pageSize(){var x=Number(getItem(K.pageSize,'15')||15);return Math.max(9,Math.min(30,x));}
  migrate();
  return{version:VERSION,build:BUILD,ua:UA,dalvik:DALVIK,h5Default:H5_DEFAULT,imageCdn:IMAGE_CDN,staticApiHosts:API_HOSTS,configUrls:CONFIG_URLS,K:K,s:s,clean:clean,html:html,n:n,pick:pick,deep:deep,first:first,arr:arr,merge:merge,uniq:uniq,fmtNum:fmtNum,page:page,param:param,pageNo:pageNo,getH5:getH5,setH5:setH5,readJson:readJson,writeJson:writeJson,favorites:favorites,history:history,isFav:isFav,toggleFav:toggleFav,addHistory:addHistory,searchHistory:searchHistory,saveSearch:saveSearch,removeSearch:removeSearch,clear:clear,diag:diag,getDiag:getDiag,pageSize:pageSize};
})();
