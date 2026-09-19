/* 黄果短剧 0.1.0-test.2 Core / hardened Endpoint Discovery */
var HuangGuoCoreV1=(function(){
  var VERSION='0.1.0-test.2',BUILD=10102;
  var UA='Mozilla/5.0 (Linux; Android 13; zh-Hans-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var DISCOVERY=['https://huangguoai.ai/','https://huangguo.com/'];
  var KEY_ENDPOINT='huangguo_endpoint_v1';
  var KEY_DIAG='huangguo_diag_v1';
  var KEY_FAV='huangguo_favs_v1';
  var KEY_HISTORY='huangguo_history_v1';
  var KEY_SEARCH='huangguo_search_history_v1';
  function clean(v){v=String(v==null?'':v).replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();return (v==='null'||v==='undefined')?'':v;}
  function mask(v){return clean(v);}
  function origin(u){var m=String(u||'').match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
  function abs(u,base){u=String(u||'').trim();base=origin(base||getEndpoint(false)||'');if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(u.charAt(0)==='/')return base+u;return base+'/'+u.replace(/^\.\//,'');}
  function pageParam(name,def){var u=String(typeof MY_URL==='undefined'?'':MY_URL),re=new RegExp('[?&]'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'=([^&#]*)'),m=u.match(re);if(!m)return def==null?'':def;try{return decodeURIComponent(m[1]);}catch(e){return m[1];}}
  function headers(ref){var h={'User-Agent':UA,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'};if(ref)h.Referer=ref;return h;}
  function fetchText(url,opt){opt=opt||{};var o={timeout:opt.timeout||9000,headers:opt.headers||headers(opt.referer||origin(url)+'/')};try{return String(fetch(url,o)||'');}catch(e){diag('REQUEST_FAIL',url,String(e.message||e));return'';}}
  function businessHtml(s){s=String(s||'');return s.length>500&&(s.indexOf('hg-drama')>=0||s.indexOf('hg-card-grid')>=0||/href=["'][^"']*\/recommend\//i.test(s)||s.indexOf('/search/video/')>=0);}
  function lineCandidates(html){var out=[],seen={},s=String(html||''),re=/线路\s*\d+[\s\S]{0,800}?([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,})/g,m;while((m=re.exec(s))!==null){var o=origin('https://'+m[1]);if(o&&!seen[o]){seen[o]=1;out.push(o);}}return out;}
  function fallbackCandidates(html){var out=[],seen={},blocked={},i,s=String(html||''),re=/https?:\\?\/\\?\/([a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,})(?:[\\\/"'\s]|$)/g,m;for(i=0;i<DISCOVERY.length;i++)blocked[origin(DISCOVERY[i])]=1;while((m=re.exec(s))!==null){var o=origin('https://'+m[1].replace(/\\/g,''));if(o&&!blocked[o]&&!seen[o]){seen[o]=1;out.push(o);}}return out;}
  function validate(o){var h=fetchText(o+'/',{timeout:4500});if(businessHtml(h))return true;h=fetchText(o+'/recommend/1/',{timeout:4500});return businessHtml(h);}
  function storeEndpoint(o){if(!o)return;setItem(KEY_ENDPOINT,JSON.stringify({url:o,t:Date.now()}));}
  function cachedEndpoint(){try{var x=JSON.parse(getItem(KEY_ENDPOINT,'{}')||'{}');return origin(x.url||'');}catch(e){return'';}}
  function discover(){var line=[],fallback=[],seen={},i,j,h,cs;function add(arr,o){o=origin(o);if(o&&!seen[o]){seen[o]=1;arr.push(o);}}for(i=0;i<DISCOVERY.length;i++){h=fetchText(DISCOVERY[i],{timeout:7000});cs=lineCandidates(h);for(j=0;j<cs.length;j++)add(line,cs[j]);if(!cs.length){cs=fallbackCandidates(h);for(j=0;j<cs.length;j++)add(fallback,cs[j]);}}var all=line.length?line:fallback;for(i=0;i<all.length;i++){if(validate(all[i])){storeEndpoint(all[i]);diag('ENDPOINT_OK',all[i],'discovery');return all[i];}}diag('ENDPOINT_FAIL','discovery','no-valid-business-origin');return'';}
  function getEndpoint(force){if(!force){var c=cachedEndpoint();if(c)return c;}return discover();}
  function invalidateEndpoint(){setItem(KEY_ENDPOINT,'{}');}
  function req(path,opt){opt=opt||{};var b=getEndpoint(false);if(!b)throw new Error('线路获取失败');var url=/^https?:\/\//i.test(String(path||''))?String(path):abs(path,b),html=fetchText(url,{timeout:opt.timeout||10000,referer:b+'/'});if(html&&html.length>80)return html;if(opt.noRetry)throw new Error('请求失败');invalidateEndpoint();var b2=getEndpoint(true);if(!b2)throw new Error('线路重试失败');if(/^https?:\/\//i.test(String(path||''))){var p=String(path).replace(/^https?:\/\/[^\/]+/i,'');url=abs(p,b2);}else url=abs(path,b2);html=fetchText(url,{timeout:opt.timeout||10000,referer:b2+'/'});if(!html||html.length<80)throw new Error('页面读取失败');return html;}
  function diag(stage,url,error,extra){var x={time:Date.now(),app:'huangguo',version:VERSION,build:BUILD,stage:String(stage||''),origin:origin(url||''),error:clean(error||''),extra:extra||{}};try{setItem(KEY_DIAG,JSON.stringify(x));}catch(e){}return x;}
  function getDiag(){try{return JSON.parse(getItem(KEY_DIAG,'{}')||'{}');}catch(e){return{};}}
  function hash(s){s=String(s||'');var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return (h>>>0).toString(36);}
  function readList(k){try{var a=JSON.parse(getItem(k,'[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function writeList(k,a){setItem(k,JSON.stringify(Array.isArray(a)?a:[]));}
  function normalizeItem(x){x=x||{};return{url:String(x.url||''),title:clean(x.title||''),cover:String(x.cover||x.img||''),episode:clean(x.episode||x.ep||''),desc:clean(x.desc||''),time:Date.now()};}
  function addHistory(x){x=normalizeItem(x);if(!x.url)return;var a=readList(KEY_HISTORY).filter(function(i){return i&&i.url!==x.url;});a.unshift(x);writeList(KEY_HISTORY,a.slice(0,80));}
  function getHistory(){return readList(KEY_HISTORY);}
  function getFavs(){return readList(KEY_FAV);}
  function isFav(url){var a=getFavs();for(var i=0;i<a.length;i++)if(a[i]&&a[i].url===url)return true;return false;}
  function toggleFav(x){x=normalizeItem(x);if(!x.url)return false;var a=getFavs(),on=false,out=[];for(var i=0;i<a.length;i++){if(a[i]&&a[i].url===x.url)on=true;else out.push(a[i]);}if(!on)out.unshift(x);writeList(KEY_FAV,out.slice(0,200));return !on;}
  function searchHistory(){return readList(KEY_SEARCH).map(function(x){return typeof x==='string'?x:(x&&x.title)||'';}).filter(Boolean);}
  function saveSearch(q){q=clean(q);if(!q)return;var a=searchHistory().filter(function(x){return x!==q;});a.unshift(q);writeList(KEY_SEARCH,a.slice(0,20));}
  function clearLocal(which){if(which==='history')writeList(KEY_HISTORY,[]);else if(which==='fav')writeList(KEY_FAV,[]);else if(which==='search')writeList(KEY_SEARCH,[]);}
  return{version:VERSION,build:BUILD,ua:UA,clean:clean,mask:mask,origin:origin,abs:abs,pageParam:pageParam,headers:headers,fetchText:fetchText,req:req,getEndpoint:getEndpoint,discover:discover,invalidateEndpoint:invalidateEndpoint,diag:diag,getDiag:getDiag,hash:hash,addHistory:addHistory,getHistory:getHistory,getFavs:getFavs,isFav:isFav,toggleFav:toggleFav,searchHistory:searchHistory,saveSearch:saveSearch,clearLocal:clearLocal};
})();
