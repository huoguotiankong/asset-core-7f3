/* ACFun 0.5.0-test.2 file-backed config/discovery guard */
(function(){
if(typeof ac!=='object')throw new Error('ACFun Stable 0.4.9 runtime missing');
var CFG='hiker://files/rules/asset-core-local/acfun-test/shared/remote_config.json';
var DISC='hiker://files/rules/asset-core-local/acfun-test/shared/frontend_discovery.json';
var cfgMem=null,discMem=null;
function readJson(p){try{if(!fileExist(p))return null;return JSON.parse(String(readFile(p)||''));}catch(e){return null;}}
function writeJson(p,o){try{writeFile(p,JSON.stringify(o));return fileExist(p);}catch(e){return false;}}
function smallSet(k,v){try{setItem(k,String(v==null?'':v).slice(0,1800));return true;}catch(e){return false;}}
ac.fetchConfig=function(force){
  if(!force&&cfgMem)return cfgMem;
  var c0=readJson(CFG);if(!force&&c0){cfgMem=c0;return c0;}
  var lastErr='';
  for(var i=0;i<ac.configUrls.length;i++){
    try{
      var raw=fetch(ac.configUrls[i],{timeout:1600,headers:{'User-Agent':ac.ua,'X-Config-Channel':ac.channel,'Accept':'application/json','Cache-Control':'no-cache'}});
      var cfg=ac.safeJson(raw);if(!cfg&&raw)try{cfg=ac.safeJson(base64Decode(raw));}catch(e0){}
      if(cfg){cfgMem=cfg;writeJson(CFG,cfg);smallSet('acfun_remote_config_ts',Date.now());smallSet('acfun_config_url',ac.configUrls[i]);smallSet('acfun_last_config_error','');return cfg;}
    }catch(e){lastErr=String(e.message||e);}
  }
  smallSet('acfun_last_config_error',lastErr);cfgMem=c0||{};return cfgMem;
};
var oldHeaders=ac.headers;
ac.headers=function(noAuth){
  var h=oldHeaders.call(ac,noAuth),cfg=cfgMem||readJson(CFG)||{},cfgApp=ac.deepFind(cfg,['appCode','app_code','appId','app_id'],0);
  if(typeof cfgApp==='string'&&cfgApp.length<100)h.appCode=cfgApp;
  return h;
};
ac.getDiscovered=function(){if(discMem)return discMem;discMem=readJson(DISC)||{};return discMem;};
ac.discoverFrontend=function(force){
  var cached=ac.getDiscovered();if(!force&&cached&&cached.time&&cached.scripts&&cached.scripts.length)return cached;
  var out={time:Date.now(),base:ac.frontendBase,bases:[],prefixes:[],routes:{},snippets:[],scripts:[],version:'',build:'',errors:[]};
  try{
    var html=fetch(ac.frontendBase+'/?_t='+Date.now(),{timeout:2600,headers:{'User-Agent':ac.ua,'Accept':'text/html,*/*','Cache-Control':'no-cache'}});
    ac.scanFrontendText(html,ac.frontendBase,out,'html');
    var scripts=[],mm,rr=/<script[^>]+src=["']([^"']+)["']/ig;
    while((mm=rr.exec(String(html||'')))&&scripts.length<30){var su=ac.absoluteUrl(ac.frontendBase,mm[1]);if(su&&scripts.indexOf(su)<0)scripts.push(su);}
    scripts.sort(function(a,b){function score(x){var q=0;if(/app|main|index|page|chunk/i.test(x))q-=8;if(/polyfill|webpack|runtime/i.test(x))q+=3;return q;}return score(a)-score(b);});
    var scanned=0;
    for(var i=0;i<scripts.length&&scanned<12;i++)try{
      var js=fetch(scripts[i],{timeout:2200,headers:{'User-Agent':ac.ua,'Accept':'*/*','Referer':ac.frontendBase+'/'}});scanned++;out.scripts.push(scripts[i]);ac.scanFrontendText(js,scripts[i],out,'js'+scanned);
      if(out.routes['video/list']&&(out.routes['video/guessLike']||out.routes['video/getByClassify'])&&out.routes['video/getVideoById']&&scanned>=4)break;
    }catch(e1){out.errors.push('JS '+scripts[i]+' : '+String(e1.message||e1));}
  }catch(e){out.errors.push('HTML: '+String(e.message||e));}
  out.bases=ac.uniq(out.bases.map(ac.normalizeBase).filter(function(x){return !!x&&!/\.work(?:\/|$)/i.test(x);}));
  var hasRel=false;for(var k in out.routes)if(String(out.routes[k]||'').charAt(0)!=='h')hasRel=true;
  if(hasRel)out.bases.unshift(ac.frontendBase);out.bases=ac.uniq(out.bases).slice(0,16);
  out.prefixes=ac.uniq(out.prefixes.map(function(p){p=String(p||'').replace(/^https?:\/\/[^/]+/i,'');if(!p)return'';if(p.charAt(0)!=='/')p='/'+p;if(p.charAt(p.length-1)!=='/')p+='/';return p;}).filter(function(p){return p.length<100;}));
  if(out.prefixes.indexOf('/api/')<0)out.prefixes.push('/api/');if(out.prefixes.indexOf('/')<0)out.prefixes.push('/');out.prefixes=out.prefixes.slice(0,12);
  if(out.snippets.length>24)out.snippets=out.snippets.slice(0,24);if(out.errors.length>12)out.errors=out.errors.slice(-12);
  discMem=out;writeJson(DISC,out);return out;
};
var oldSave=ac.saveList;
ac.saveList=function(key,list,max){
  try{return oldSave.call(ac,key,list,max);}catch(e){
    try{
      var a=(list||[]).slice(0,max||300),txt=JSON.stringify(a);if(txt.length>180000){a=a.slice(0,80);txt=JSON.stringify(a);}writeFile('hiker://files/rules/asset-core-local/acfun-user/'+String(key)+'.json',txt);
    }catch(e2){}return false;
  }
};
ac.storageGuardVersion='0.5.0-test.2';
})();
