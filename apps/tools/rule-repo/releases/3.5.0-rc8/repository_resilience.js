/* 我的规则仓库 v3.5.0-rc8 - cloud resilience + transactional sync */
(function(R){
R.cloudStateKey=function(name){return this.statePrefix+'cloud_'+name;};
R._validCloudText=function(path,t){
  t=String(t==null?'':t);
  if(!t)throw new Error('空响应');
  if(/^\s*<!doctype\b/i.test(t)||/^\s*<html\b/i.test(t)||/^\s*(Too Many Requests|Bad Gateway|Service Unavailable|Gateway Timeout)/i.test(t)||/^\s*\{\s*"message"\s*:/i.test(t))throw new Error('服务返回错误页');
  if(/\.json(?:$|\?)/i.test(String(path||''))){try{JSON.parse(t);}catch(e){throw new Error('JSON响应无效');}}
  return t;
};
R._rememberCloud=function(source,error){
  if(source){setItem(this.cloudStateKey('source'),String(source));setItem(this.cloudStateKey('ok_ts'),String(Date.now()));}
  if(error!==undefined)setItem(this.cloudStateKey('last_error'),String(error||''));
};
R.lastCloudSource=function(){return getItem(this.cloudStateKey('source'),'--');};
R.lastCloudError=function(){return getItem(this.cloudStateKey('last_error'),'');};
R._fetchTextUrl=function(url,path,source){var t=fetch(url,{timeout:20000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}});t=this._validCloudText(path,t);this._rememberCloud(source,'');return t;};
R.cdnUrl=function(path){return'https://cdn.jsdelivr.net/gh/'+this.repo+'@'+this.branch+'/'+String(path||'').replace(/^\/+/, '')+'?t='+Date.now();};
R.webRawUrl=function(path){return'https://github.com/'+this.repo+'/raw/refs/heads/'+this.branch+'/'+String(path||'').replace(/^\/+/, '')+'?t='+Date.now();};
R.apiText=function(path){
  var errs=[];
  try{var a=base64Decode(String(this.apiJson(path).content).replace(/\s+/g,''));a=this._validCloudText(path,a);this._rememberCloud('GitHub API','');return a;}catch(e1){errs.push('API '+String(e1.message||e1));}
  try{return this._fetchTextUrl(this.rawUrl(path),path,'GitHub Raw');}catch(e2){errs.push('Raw '+String(e2.message||e2));}
  try{return this._fetchTextUrl(this.cdnUrl(path),path,'jsDelivr');}catch(e3){errs.push('CDN '+String(e3.message||e3));}
  try{return this._fetchTextUrl(this.webRawUrl(path),path,'GitHub Web Raw');}catch(e4){errs.push('WebRaw '+String(e4.message||e4));}
  var msg='云端读取失败：'+path+'；'+errs.join('；');this._rememberCloud('',msg);throw new Error(msg);
};
R._readManifestCache=function(){var cached=getItem(this.cacheKey,''),stale=cached?this.safeJson(cached,null):null;return stale&&Array.isArray(stale.items)?stale:null;};
R._fetchManifestStrict=function(now){var x=JSON.parse(this.apiText(this.manifestPath));if(!x||!Array.isArray(x.items))throw new Error('manifest格式错误');this._saveManifest(x,now||Date.now());return x;};
R._fetchManifestFresh=function(now,stale){try{return this._fetchManifestStrict(now);}catch(e){if(stale&&Array.isArray(stale.items)){setItem(this.cloudStateKey('fallback_ts'),String(Date.now()));setItem(this.cloudStateKey('last_error'),String(e.message||e));return stale;}throw e;}};
R.syncManifest=function(){
  var stale=this._readManifestCache();
  try{var x=this._fetchManifestStrict(Date.now());return{ok:true,fresh:true,manifest:x,source:this.lastCloudSource()};}
  catch(e){if(stale){setItem(this.cloudStateKey('fallback_ts'),String(Date.now()));setItem(this.cloudStateKey('last_error'),String(e.message||e));return{ok:true,fresh:false,usingCache:true,manifest:stale,error:String(e.message||e)};}return{ok:false,fresh:false,error:String(e.message||e)};}
};
R.manifest=function(force){
  var now=Date.now(),ts=Number(getItem(this.cacheTsKey,'0')||0),stale=this._readManifestCache(),valid=!!stale,age=now-ts;
  if(force)return this._fetchManifestFresh(now,stale);
  if(valid&&age<this.cacheMs()){
    var probe=this.probeMs(),pts=Number(getItem(this.manifestProbeTsKey,'0')||0);if(probe<=0||now-pts<probe)return stale;setItem(this.manifestProbeTsKey,String(now));
    try{var meta=JSON.parse(this.apiText(this.manifestMetaPath)),remote=String(meta&&meta.revision||''),local=String(getItem(this.manifestRevisionKey,String(stale.revision||''))||'');if(remote&&remote!==local)return this._fetchManifestFresh(now,stale);if(remote&&!local)setItem(this.manifestRevisionKey,remote);}catch(e){}
    return stale;
  }
  return this._fetchManifestFresh(now,stale);
};
})(HikerRuleRepo);
