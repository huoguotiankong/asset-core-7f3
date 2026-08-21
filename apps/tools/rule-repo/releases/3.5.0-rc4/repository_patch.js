/* 我的规则仓库 v3.5.0-rc4 - smart cloud index freshness + generic channel groups */
(function(R){
R.manifestMetaPath='manifest_meta.json';
R.manifestRevisionKey=R.statePrefix+'manifest_revision';
R.manifestProbeTsKey=R.statePrefix+'manifest_probe_ts';
R.defaultProbeMs=60000;
R.probeMs=function(){var n=Number(this.getSetting('probe_ms',String(this.defaultProbeMs)));return n>=0?n:this.defaultProbeMs;};
R._baseNormalizeItem=R.normalizeItem;
R.normalizeItem=function(x,index){var o=this._baseNormalizeItem(x,index);x=x||{};o.entryType=String(x.entryType||'app');o.channelsPath=String(x.channelsPath||'');o.badge=String(x.badge||'');return o;};
R._saveManifest=function(x,now){setItem(this.cacheKey,JSON.stringify(x));setItem(this.cacheTsKey,String(now));var rev=String(x&&x.revision||'');if(rev)setItem(this.manifestRevisionKey,rev);return x;};
R._fetchManifestFresh=function(now,stale){try{var x=JSON.parse(this.apiText(this.manifestPath));if(!x||!Array.isArray(x.items))throw new Error('manifest格式错误');return this._saveManifest(x,now);}catch(e){if(stale&&Array.isArray(stale.items))return stale;throw e;}};
R.manifest=function(force){var now=Date.now(),ts=Number(getItem(this.cacheTsKey,'0')||0),cached=getItem(this.cacheKey,''),stale=cached?this.safeJson(cached,null):null,valid=stale&&Array.isArray(stale.items),age=now-ts;if(force||!valid||age>=this.cacheMs())return this._fetchManifestFresh(now,stale);
var probe=this.probeMs(),pts=Number(getItem(this.manifestProbeTsKey,'0')||0);if(probe<=0||now-pts<probe)return stale;setItem(this.manifestProbeTsKey,String(now));
try{var meta=JSON.parse(this.apiText(this.manifestMetaPath)),remote=String(meta&&meta.revision||''),local=String(getItem(this.manifestRevisionKey,String(stale.revision||''))||'');if(remote&&remote!==local)return this._fetchManifestFresh(now,stale);if(remote&&!local)setItem(this.manifestRevisionKey,remote);}catch(e){}
return stale;};
R.clearManifestCache=function(){clearItem(this.cacheKey);clearItem(this.cacheTsKey);clearItem(this.manifestRevisionKey);clearItem(this.manifestProbeTsKey);};
R.entryStatus=function(item){if(item&&item.entryType==='channel-group')return'多版本';return this.statusOf(item);};
R._baseStats=R.stats;
R.stats=function(items){var out={all:items.length,remote:0,local:0,installed:0,updates:0,favorites:this.favIds().length,recent:this.recentIds().length,groups:0};for(var i=0;i<items.length;i++){var x=items[i];if(x.mode==='remote')out.remote++;else out.local++;if(x.entryType==='channel-group'){out.groups++;continue;}var st=this.statusOf(x);if(st!=='未记录')out.installed++;if(st==='可更新')out.updates++;}return out;};
})(HikerRuleRepo);
