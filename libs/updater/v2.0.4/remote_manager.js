/* asset-core Remote Module Manager v2.0.4
 * v2.0.4: resilient mutable metadata + last-known-good cache.
 * - Mutable pointer order: Raw -> WebRaw -> GitHub API -> jsDelivr.
 * - Stale pointers never downgrade below local/default build.
 * - Immutable release/modules keep multi-mirror delivery.
 * - Metadata outage keeps current/default release usable instead of reporting a false upgrade failure.
 */
var HikerCloudRemote=(function(){
var MANAGER_VERSION='2.0.4';
var DEFAULT_TEMPLATES=[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}'
];
function clone(o){return o?JSON.parse(JSON.stringify(o)):o;} function now(){return new Date().getTime();}
function norm(p){return String(p||'').replace(/^\/+/, '');} function branch(c){return String(c&&c.branch||'main');}
function key(id){return'hc_remote_state_'+String(id||'').replace(/[^0-9A-Za-z_.-]/g,'_');}
function metaKey(c,p){return'hc_remote_meta_'+String(c&&c.id||'app').replace(/[^0-9A-Za-z_.-]/g,'_')+'_'+String(p||'').replace(/[^0-9A-Za-z_.-]/g,'_');}
function parse(s,l){try{return JSON.parse(String(s||''));}catch(e){throw new Error((l||'JSON')+'解析失败: '+(e.message||e));}}
function templates(c){var a=c&&Array.isArray(c.repoTemplates)&&c.repoTemplates.length?c.repoTemplates:DEFAULT_TEMPLATES;return a.slice();}
function urls(c,p,ref){p=norm(p);ref=String(ref||branch(c));return templates(c).map(function(t){return String(t).replace(/\{ref\}/g,ref).replace(/\{path\}/g,p);});}
function validText(t){t=String(t==null?'':t);if(!t.trim())return false;if(/^\s*<!doctype\b/i.test(t)||/^\s*<html\b/i.test(t)||/^\s*(Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found)/i.test(t))return false;return true;}
function fetchOne(u,timeout){var sep=u.indexOf('?')>=0?'&':'?';var t=fetch(u+sep+'_hc_ts='+now(),{timeout:Number(timeout||10000),headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});if(!validText(t))throw new Error('无效响应');return String(t);}
function fetchFirst(c,p,label,ref){var us=urls(c,p,ref),errs=[];for(var i=0;i<us.length;i++){try{return{text:fetchOne(us[i],c&&c.timeout||10000),url:us[i],index:i};}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error((label||p)+'全部镜像失败：'+errs.join(' | '));}
function fetchJson(c,p,label,ref){return parse(fetchFirst(c,p,label,ref).text,label);}
function rawUrl(c,p,ref){return'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+encodeURIComponent(String(ref||branch(c))).replace(/%2F/g,'/')+'/'+norm(p);}
function webRawUrl(c,p,ref){return'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/'+encodeURIComponent(String(ref||branch(c))).replace(/%2F/g,'/')+'/'+norm(p);}
function cdnUrl(c,p,ref){return'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+encodeURIComponent(String(ref||branch(c))).replace(/%2F/g,'/')+'/'+norm(p);}
function apiUrl(c,p,ref){return'https://api.github.com/repos/huoguotiankong/asset-core-7f3/contents/'+norm(p)+'?ref='+encodeURIComponent(String(ref||branch(c)))+'&_hc_ts='+now();}
function apiText(c,p,label,ref){
 var u=apiUrl(c,p,ref),t=fetch(u,{timeout:Number(c&&c.timeout||10000),headers:{Accept:'application/vnd.github+json','Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}),j=parse(t,label||p);
 if(j&&j.message&&!j.content)throw new Error((label||p)+' GitHub API: '+String(j.message));
 if(!j||!j.content)throw new Error((label||p)+' GitHub API 内容为空');
 var s=base64Decode(String(j.content).replace(/\s+/g,''));if(!validText(s))throw new Error((label||p)+' GitHub API 响应无效');return String(s);
}
function normalizeRelease(r,id){if(!r||typeof r!=='object')throw new Error('版本描述为空');var o=clone(r);o.id=String(o.id||id||'');o.version=String(o.version||'0.0.0');o.build=Number(o.build||0);o.ref=String(o.ref||'main');if(!o.id)throw new Error('版本描述缺少id');if(!Array.isArray(o.modules)||!o.modules.length)throw new Error('版本描述缺少modules');o.modules.forEach(function(m,i){if(!m||!m.path)throw new Error('modules['+i+']缺少path');});return o;}
function pointerOk(x,c){return !!(x&&typeof x==='object'&&String(x.id||'')===String(c.id||'')&&isFinite(Number(x.build))&&Number(x.build)>=0&&String(x.release||''));}
function readMetaCache(c,p){try{var x=parse(getItem(metaKey(c,p),''),'元数据缓存');return x&&x.data?x:null;}catch(e){return null;}}
function saveMetaCache(c,p,data,source){try{setItem(metaKey(c,p),JSON.stringify({schema:1,time:now(),source:String(source||''),data:clone(data)}));}catch(e){}return data;}
function mutablePointer(c,p,label,ref,floor){
 var errs=[],best=null,bestSource='',min=Number(floor||0),cached=readMetaCache(c,p),raws=[
  {name:'Raw',url:rawUrl(c,p,ref)},
  {name:'WebRaw',url:webRawUrl(c,p,ref)}
 ];
 function consider(x,source){if(!pointerOk(x,c))throw new Error('指针字段不完整');var b=Number(x.build||0);if(!best||b>Number(best.build||0)){best=x;bestSource=source;}if(b>=min){saveMetaCache(c,p,x,source);return true;}return false;}
 for(var i=0;i<raws.length;i++)try{if(consider(parse(fetchOne(raws[i].url,c&&c.timeout||10000),label),raws[i].name))return{data:best,source:bestSource,cached:false};}catch(e1){errs.push(raws[i].name+' '+String(e1.message||e1));}
 try{if(consider(parse(apiText(c,p,label,ref),label),'GitHub API'))return{data:best,source:bestSource,cached:false};}catch(e2){errs.push('API '+String(e2.message||e2));}
 try{if(consider(parse(fetchOne(cdnUrl(c,p,ref),c&&c.timeout||10000),label),'jsDelivr'))return{data:best,source:bestSource,cached:false};}catch(e3){errs.push('CDN '+String(e3.message||e3));}
 if(best){saveMetaCache(c,p,best,bestSource);return{data:best,source:bestSource,cached:false,lag:Number(best.build||0)<min,errors:errs};}
 if(cached&&pointerOk(cached.data,c)&&Number(cached.data.build||0)>=min)return{data:cached.data,source:'本地最近成功元数据',cached:true,errors:errs};
 return{data:null,source:'',cached:false,errors:errs};
}
function defaultState(c){return{schema:2,current:normalizeRelease(c.defaultRelease,c.id),previous:null,updatedAt:0};}
function save(c,s){setItem(key(c.id),JSON.stringify(s));}
function enforce(c,s){var min=Number(c&&c.minBuild||0);if(!min||!s||!s.current||Number(s.current.build||0)>=min)return s;var d=normalizeRelease(c.defaultRelease,c.id);if(Number(d.build||0)<min)return s;var old=clone(s.current);s.previous=old;s.current=d;s.updatedAt=now();s.lastFallbackError='安全版本门槛触发：build '+Number(old.build||0)+' < '+min;save(c,s);return s;}
function state(c){var raw=getItem(key(c.id),''),s;if(!raw)s=defaultState(c);else try{s=parse(raw,'远程模块状态');if(!s.current)s=defaultState(c);else{s.current=normalizeRelease(s.current,c.id);if(s.previous)s.previous=normalizeRelease(s.previous,c.id);}}catch(e){s=defaultState(c);}return enforce(c,s);}
function readGlobal(n){n=String(n||'');if(!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(n))return;try{return eval('typeof '+n+'==="undefined"?undefined:'+n);}catch(e){}}
function prop(o,p){if(!p)return o;var cur=o;String(p).split('.').forEach(function(k){if(cur!=null)cur=cur[k];});return cur;}
function verify(r){if(!r.verify)return true;var o=readGlobal(r.verify.global);if(o==null)throw new Error('版本校验失败，未找到全局对象: '+r.verify.global);if(r.verify.property&&r.verify.equals!==undefined&&String(prop(o,r.verify.property))!==String(r.verify.equals))throw new Error('版本校验失败: '+r.verify.property);return true;}
function modUrls(c,r,m){return urls(c,m.path,r.ref).map(function(u){return u+(u.indexOf('?')>=0?'&':'?')+'hc_release='+encodeURIComponent(String(r.version||'0'));});}
function clear(c,r){r=normalizeRelease(r,c.id);var n=0;r.modules.forEach(function(m){modUrls(c,r,m).forEach(function(u){try{deleteCache(u);n++;}catch(e){}});});return n;}
function requireAny(c,r,m,force){var us=modUrls(c,r,m),errs=[];for(var i=0;i<us.length;i++){try{if(force)try{deleteCache(us[i]);}catch(e0){} require(us[i],{headers:c.moduleHeaders||{}},Number(r.build||1));return us[i];}catch(e){errs.push((i+1)+':'+String(e.message||e));}}throw new Error('模块 '+String(m.name||m.path)+' 全部镜像加载失败：'+errs.join(' | '));}
function loadRelease(c,r,force){r=normalizeRelease(r,c.id);var loaded=[];for(var i=0;i<r.modules.length;i++)loaded.push({name:r.modules[i].name||('module'+(i+1)),url:requireAny(c,r,r.modules[i],force)});verify(r);return{ok:true,release:r,loaded:loaded};}
function load(c){var s=state(c);try{return loadRelease(c,s.current,false);}catch(e){if(s.previous)try{var f=loadRelease(c,s.previous,false),broken=s.current;s.current=s.previous;s.previous=broken;s.updatedAt=now();s.lastFallbackError=String(e.message||e);save(c,s);f.fallback=true;return f;}catch(e2){}throw e;}}
function immutableRelease(c,path,label,ref){var mk=metaKey(c,'release:'+path),cached=null;try{cached=parse(getItem(mk,''),label);}catch(e0){}try{var r=normalizeRelease(fetchJson(c,path,label,ref),c.id);try{setItem(mk,JSON.stringify(r));}catch(e1){}return{release:r,cached:false};}catch(e2){if(cached)try{return{release:normalizeRelease(cached,c.id),cached:true};}catch(e3){}throw e2;}}
function latest(c){
 if(!c.latestPath)throw new Error('配置缺少latestPath');
 var s=state(c),d=normalizeRelease(c.defaultRelease,c.id),floor=Math.max(Number(s.current&&s.current.build||0),Number(d.build||0),Number(c.minBuild||0)),mp=mutablePointer(c,c.latestPath,'latest.json',branch(c),floor),l=mp.data;
 if(!l){return{latest:{id:c.id,build:d.build,release:'',notes:'云端元数据暂不可达，继续使用本地安全版本'},release:d,offline:true,source:'本地默认安全版本',errors:mp.errors||[]};}
 if(Number(l.build||0)<floor){return{latest:l,release:Number(d.build||0)>=Number(s.current.build||0)?d:s.current,offline:true,metadataLag:true,source:mp.source,errors:mp.errors||[]};}
 if(Number(l.build||0)===Number(d.build||0))return{latest:l,release:d,offline:!!mp.cached,source:mp.source,errors:mp.errors||[]};
 if(Number(l.build||0)===Number(s.current.build||0))return{latest:l,release:s.current,offline:!!mp.cached,source:mp.source,errors:mp.errors||[]};
 var ir=immutableRelease(c,l.release,'release.json',String(l.ref||branch(c))),r=ir.release;
 if(Number(r.build)!==Number(l.build))throw new Error('latest与release的build不一致');
 return{latest:l,release:r,offline:!!mp.cached||!!ir.cached,source:mp.source,errors:mp.errors||[]};
}
function info(c){var s=state(c);return{managerVersion:MANAGER_VERSION,current:clone(s.current),previous:clone(s.previous),updatedAt:s.updatedAt||0,lastFallbackError:s.lastFallbackError||''};}
function check(c){var x=latest(c),s=state(c);return{ok:true,current:clone(s.current),latest:clone(x.release),hasUpdate:Number(x.release.build||0)>Number(s.current.build||0),notes:x.latest.notes||'',offline:!!x.offline,metadataLag:!!x.metadataLag,source:x.source||'',errors:x.errors||[]};}
function update(c){var x;try{x=latest(c);var s=state(c);if(Number(x.release.build||0)<=Number(s.current.build||0))return{ok:true,changed:false,current:s.current,latest:x.release,offline:!!x.offline,metadataLag:!!x.metadataLag,source:x.source||''};loadRelease(c,x.release,false);var old=clone(s.current);s.previous=old;s.current=clone(x.release);s.updatedAt=now();s.lastFallbackError='';save(c,s);return{ok:true,changed:true,previous:old,current:s.current,offline:!!x.offline,source:x.source||''};}catch(e){return{ok:false,changed:false,error:String(e.message||e),latest:x?x.release:null};}}
function rollback(c){var s=state(c);if(!s.previous)return{ok:false,error:'没有可回退的上一版本'};try{loadRelease(c,s.previous,false);var cur=s.current;s.current=s.previous;s.previous=cur;s.updatedAt=now();s.lastFallbackError='';save(c,s);return{ok:true,current:s.current,previous:s.previous};}catch(e){return{ok:false,error:String(e.message||e)};}}
function reinstall(c){var s=state(c);try{clear(c,s.current);var r=loadRelease(c,s.current,false);return{ok:true,current:s.current,loaded:r.loaded};}catch(e){return{ok:false,error:String(e.message||e)};}}
function reset(c){try{var s=state(c),d=normalizeRelease(c.defaultRelease,c.id);loadRelease(c,d,false);if(Number(s.current.build)!==Number(d.build))s.previous=s.current;s.current=d;s.updatedAt=now();s.lastFallbackError='';save(c,s);return{ok:true,current:d};}catch(e){return{ok:false,error:String(e.message||e)};}}
return{version:MANAGER_VERSION,info:info,check:check,update:update,load:load,loadRelease:loadRelease,rollback:rollback,reinstall:reinstall,resetToDefault:reset,clearReleaseCache:clear};
})();
