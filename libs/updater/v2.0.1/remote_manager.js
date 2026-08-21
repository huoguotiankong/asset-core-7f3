/* hiker-cloud Remote Module Manager v2.0.1
 * 目标：云仓库只安装轻量启动壳，业务代码通过海阔 require(url, options, version) 加载。
 * 正常启动不请求 latest.json；只加载当前激活版本，已缓存版本由海阔直接命中缓存。
 * v2.0.1: 支持 config.minBuild，救援壳可强制越过已知损坏的旧激活版本。
 */
var HikerCloudRemote = (function () {
    var MANAGER_VERSION = '2.0.1';
    var DEFAULT_REPO_ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/';

    function clone(obj) { return obj ? JSON.parse(JSON.stringify(obj)) : obj; }
    function now() { return new Date().getTime(); }
    function normalizePath(path) { return String(path || '').replace(/^\/+/, ''); }
    function stateKey(appId) { return 'hc_remote_state_' + String(appId || '').replace(/[^0-9A-Za-z_.-]/g, '_'); }
    function parseJson(text, label) { try { return JSON.parse(String(text || '')); } catch (e) { throw new Error((label || 'JSON') + '解析失败: ' + (e.message || e)); } }
    function getRepoRoot(config) { var root = String((config && config.repoRawRoot) || DEFAULT_REPO_ROOT); return root.replace(/\/+$/, '') + '/'; }
    function getBranch(config) { return String((config && config.branch) || 'main'); }
    function metadataUrl(config, path) { return getRepoRoot(config) + getBranch(config) + '/' + normalizePath(path); }
    function moduleUrl(config, release, module) { var ref = String((release && release.ref) || getBranch(config)); var path = normalizePath(module && module.path); var version = encodeURIComponent(String((release && release.version) || '0')); return getRepoRoot(config) + ref + '/' + path + '?hc_release=' + version; }
    function fetchText(url, timeout) { var sep = String(url).indexOf('?') >= 0 ? '&' : '?'; var target = String(url) + sep + '_hc_ts=' + now(); var text = fetch(target, {timeout:Number(timeout || 10000),headers:{'Cache-Control':'no-cache'}}); if (text === undefined || text === null || !String(text).trim()) throw new Error('远程返回为空: ' + url); return String(text); }
    function fetchJson(url, label) { return parseJson(fetchText(url), label || '远程JSON'); }
    function normalizeRelease(release, appId) { if (!release || typeof release !== 'object') throw new Error('版本描述为空'); var out = clone(release); out.id = String(out.id || appId || ''); out.version = String(out.version || '0.0.0'); out.build = Number(out.build || 0); out.ref = String(out.ref || 'main'); if (!out.id) throw new Error('版本描述缺少id'); if (!Array.isArray(out.modules) || !out.modules.length) throw new Error('版本描述缺少modules'); out.modules.forEach(function(m,i){if(!m||!m.path)throw new Error('modules['+i+']缺少path');}); return out; }
    function defaultState(config) { return {schema:2,current:normalizeRelease(config.defaultRelease,config.id),previous:null,updatedAt:0}; }
    function saveState(config, state) { setItem(stateKey(config.id), JSON.stringify(state)); }
    function enforceMinimum(config, state) {
        var minBuild = Number((config && config.minBuild) || 0);
        if (!minBuild || !state || !state.current) return state;
        if (Number(state.current.build || 0) >= minBuild) return state;
        var def = normalizeRelease(config.defaultRelease, config.id);
        if (Number(def.build || 0) < minBuild) return state;
        var old = clone(state.current);
        state.previous = old;
        state.current = def;
        state.updatedAt = now();
        state.lastFallbackError = '安全版本门槛触发：build ' + Number(old.build || 0) + ' < ' + minBuild;
        saveState(config, state);
        return state;
    }
    function getState(config) {
        var key = stateKey(config.id), raw = getItem(key, ''), state;
        if (!raw) state = defaultState(config);
        else {
            try { state = parseJson(raw,'远程模块状态'); if(!state.current)state=defaultState(config); else { state.current=normalizeRelease(state.current,config.id); if(state.previous)state.previous=normalizeRelease(state.previous,config.id); } }
            catch(e){ state=defaultState(config); }
        }
        return enforceMinimum(config, state);
    }
    function readGlobal(name){name=String(name||'');if(!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(name))return undefined;try{return eval('typeof '+name+' === "undefined" ? undefined : '+name);}catch(e){}try{return $.hiker?$.hiker[name]:undefined;}catch(e2){}return undefined;}
    function readProperty(obj,path){if(!path)return obj;var cur=obj;String(path).split('.').forEach(function(k){if(cur!==undefined&&cur!==null)cur=cur[k];});return cur;}
    function verifyRelease(release){var verify=release.verify;if(!verify)return true;var obj=readGlobal(verify.global);if(obj===undefined||obj===null)throw new Error('版本校验失败，未找到全局对象: '+verify.global);if(verify.property){var actual=readProperty(obj,verify.property);if(verify.equals!==undefined&&String(actual)!==String(verify.equals))throw new Error('版本校验失败: '+verify.property+'='+actual+'，期望='+verify.equals);}return true;}
    function clearReleaseCache(config,release){release=normalizeRelease(release,config.id);var cleared=0;release.modules.forEach(function(m){var url=moduleUrl(config,release,m);try{deleteCache(url);cleared++;}catch(e){}});return cleared;}
    function loadRelease(config,release,force){release=normalizeRelease(release,config.id);var loaded=[];for(var i=0;i<release.modules.length;i++){var mod=release.modules[i],url=moduleUrl(config,release,mod);if(force){try{deleteCache(url);}catch(e0){}}require(url,{headers:config.moduleHeaders||{}},Number(release.build||1));loaded.push({name:mod.name||('module'+(i+1)),url:url});}verifyRelease(release);return{ok:true,release:release,loaded:loaded};}
    function load(config){var state=getState(config);try{return loadRelease(config,state.current,false);}catch(e){if(state.previous){try{var fallback=loadRelease(config,state.previous,false),broken=state.current;state.current=state.previous;state.previous=broken;state.updatedAt=now();state.lastFallbackError=String(e.message||e);saveState(config,state);fallback.fallback=true;fallback.error=String(e.message||e);return fallback;}catch(e2){}}throw e;}}
    function fetchLatest(config){if(!config.latestPath)throw new Error('配置缺少latestPath');var latest=fetchJson(metadataUrl(config,config.latestPath),'latest.json');if(!latest.id||latest.build===undefined||!latest.release)throw new Error('latest.json缺少id/build/release');if(String(latest.id)!==String(config.id))throw new Error('latest.json应用ID不匹配');var descriptor=fetchJson(metadataUrl(config,latest.release),'release.json');descriptor=normalizeRelease(descriptor,config.id);if(Number(descriptor.build)!==Number(latest.build))throw new Error('latest与release的build不一致');return{latest:latest,release:descriptor};}
    function info(config){var state=getState(config);return{managerVersion:MANAGER_VERSION,current:clone(state.current),previous:clone(state.previous),updatedAt:state.updatedAt||0,lastFallbackError:state.lastFallbackError||''};}
    function check(config){var remote=fetchLatest(config),state=getState(config);return{ok:true,current:clone(state.current),latest:clone(remote.release),hasUpdate:Number(remote.release.build||0)>Number(state.current.build||0),notes:remote.latest.notes||'',changelog:remote.latest.changelog||''};}
    function update(config){var remote;try{remote=fetchLatest(config);var state=getState(config);if(Number(remote.release.build||0)<=Number(state.current.build||0))return{ok:true,changed:false,current:state.current,latest:remote.release};loadRelease(config,remote.release,false);var old=clone(state.current);state.previous=old;state.current=clone(remote.release);state.updatedAt=now();state.lastFallbackError='';saveState(config,state);return{ok:true,changed:true,previous:old,current:state.current};}catch(e){return{ok:false,changed:false,error:String(e.message||e),latest:remote?remote.release:null};}}
    function rollback(config){var state=getState(config);if(!state.previous)return{ok:false,error:'没有可回退的上一版本'};try{loadRelease(config,state.previous,false);var current=state.current;state.current=state.previous;state.previous=current;state.updatedAt=now();state.lastFallbackError='';saveState(config,state);return{ok:true,current:state.current,previous:state.previous};}catch(e){return{ok:false,error:String(e.message||e)};}}
    function reinstall(config){var state=getState(config);try{clearReleaseCache(config,state.current);var result=loadRelease(config,state.current,false);return{ok:true,current:state.current,loaded:result.loaded};}catch(e){return{ok:false,error:String(e.message||e)};}}
    function resetToDefault(config){try{var state=getState(config),def=normalizeRelease(config.defaultRelease,config.id);loadRelease(config,def,false);if(Number(state.current.build)!==Number(def.build))state.previous=state.current;state.current=def;state.updatedAt=now();state.lastFallbackError='';saveState(config,state);return{ok:true,current:def};}catch(e){return{ok:false,error:String(e.message||e)};}}
    return{version:MANAGER_VERSION,info:info,check:check,update:update,load:load,loadRelease:loadRelease,rollback:rollback,reinstall:reinstall,resetToDefault:resetToDefault,clearReleaseCache:clearReleaseCache,moduleUrl:moduleUrl};
})();
