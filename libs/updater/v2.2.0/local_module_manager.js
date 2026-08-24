/* asset-core Local Module Manager v2.2.0
 * Remote publish, local run using Hiker native require(file://...).
 * Runtime JS is persisted under hiker://files/rules/asset-core-local/.
 */
var HikerLocalModules=(function(){
  var VERSION='2.2.0';
  function now(){return new Date().getTime();}
  function clone(o){return o?JSON.parse(JSON.stringify(o)):o;}
  function safeId(s){return String(s||'app').replace(/[^0-9A-Za-z_.-]/g,'_');}
  function normPath(p){return String(p||'').replace(/^\/+/, '');}
  function normText(s){s=String(s==null?'':s);if(s.charCodeAt(0)===0xFEFF)s=s.substring(1);return s.replace(/\r\n?/g,'\n').replace(/\n+$/,'');}
  function errorLike(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return /^(?:Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:error|failed)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Bad Gateway\b|Too Many Requests\b|Service Unavailable\b|Gateway Timeout\b|Not Found\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
  function validText(t){t=String(t==null?'':t);return !!t.trim()&&!/^\s*<!doctype\b/i.test(t)&&!/^\s*<html\b/i.test(t)&&!errorLike(t);}
  function release(r,id){if(!r||typeof r!=='object')throw new Error('版本描述为空');var x=clone(r);x.id=String(x.id||id||'');x.version=String(x.version||'0.0.0');x.build=Number(x.build||0);x.ref=String(x.ref||'main');if(!x.id||!x.build)throw new Error('版本描述缺少 id/build');if(!Array.isArray(x.modules)||!x.modules.length)throw new Error('版本描述缺少 modules');return x;}
  function root(c,r){return'hiker://files/rules/asset-core-local/'+safeId(c.id)+'/b'+Number(r.build||0)+'/';}
  function moduleFile(c,r,i){return root(c,r)+'m'+String(i)+'.js';}
  function stateFile(c){return'__hclocal22_'+safeId(c.id)+'_state.json';}
  function packageFile(c,r){return'__hclocal22_'+safeId(c.id)+'_b'+Number(r.build||0)+'.json';}
  function readPrivate(n){try{if(!fileExist(n))return null;var s=String(readFile(n,0)||'');return s?JSON.parse(s):null;}catch(e){return null;}}
  function writePrivate(n,o){saveFile(n,typeof o==='string'?o:JSON.stringify(o),0);if(!fileExist(n))throw new Error('状态文件写入失败: '+n);}
  function templates(c){return c&&Array.isArray(c.repoTemplates)&&c.repoTemplates.length?c.repoTemplates.slice():['https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}','https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}','https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'];}
  function urls(c,path,ref){path=normPath(path);ref=String(ref||'main');return templates(c).map(function(t){return String(t).replace(/\{ref\}/g,ref).replace(/\{path\}/g,path);});}
  function fetchModule(c,m,r){var us=urls(c,m.path,r.ref),es=[];for(var i=0;i<us.length;i++){try{var t=String(fetch(us[i],{timeout:Number(c.timeout||8000),headers:{'Cache-Control':'no-cache'}})||'');if(!validText(t))throw new Error('无效JS响应');return{text:t,source:us[i]};}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('模块 '+String(m.name||m.path)+' 全部镜像失败: '+es.join(' | '));}
  function writePublic(path,text){writeFile(path,String(text));if(!fileExist(path))throw new Error('本地模块未生成: '+path);var back=String(fetch(path)||'');if(!back.trim())throw new Error('本地模块回读为空: '+path);if(normText(back)!==normText(text))throw new Error('本地模块写入校验失败: '+path);return back;}
  function probe(c){var p='hiker://files/rules/asset-core-local/'+safeId(c.id)+'/native_require_probe.js';var mark='HC_LOCAL_REQUIRE_PROBE_'+safeId(c.id).replace(/[.-]/g,'_');var code='var '+mark+'=2200;';writePublic(p,code);try{eval(mark+'=undefined');}catch(e){}try{require(getPath(p));}catch(e1){throw new Error('本地 require 探针执行失败: '+String(e1.message||e1));}var ok=false;try{ok=eval('typeof '+mark+"!=='undefined'&&"+mark+'===2200');}catch(e2){}if(!ok)throw new Error('本地 require 探针未导出全局变量');return true;}
  function complete(c,r){r=release(r,c.id);var p=readPrivate(packageFile(c,r));if(!p||Number(p.build||0)!==r.build||!Array.isArray(p.files)||p.files.length!==r.modules.length)return null;for(var i=0;i<p.files.length;i++){var f=p.files[i];if(!f||!f.file||!fileExist(String(f.file)))return null;try{var t=String(fetch(String(f.file))||'');if(!validText(t))return null;if(f.md5&&String(md5(t))!==String(f.md5))return null;}catch(e){return null;}}return p;}
  function install(c,r,force){r=release(r,c.id);probe(c);if(!force){var e=complete(c,r);if(e)return{ok:true,cached:true,release:r,package:e};}
    var files=[];for(var i=0;i<r.modules.length;i++){var m=r.modules[i]||{},g=fetchModule(c,m,r),f=moduleFile(c,r,i),back=writePublic(f,g.text);files.push({name:String(m.name||('module'+(i+1))),path:String(m.path||''),file:f,md5:String(md5(back)),source:g.source});}
    var pkg={schema:4,id:r.id,version:r.version,build:r.build,ref:r.ref,installedAt:now(),manager:VERSION,execution:'native-require-file',files:files,verify:clone(r.verify||null)};writePrivate(packageFile(c,r),pkg);if(!complete(c,r))throw new Error('本地运行包完整性复核失败');var s=readPrivate(stateFile(c))||{schema:1,current:null,previous:null};if(s.current&&Number(s.current.build||0)!==r.build)s.previous=clone(s.current);s.current={version:r.version,build:r.build,packageFile:packageFile(c,r)};s.updatedAt=now();writePrivate(stateFile(c),s);return{ok:true,cached:false,release:r,package:pkg,state:s};}
  function load(c,r){r=release(r,c.id);var p=complete(c,r);if(!p)throw new Error('本地运行包不存在或不完整');for(var i=0;i<p.files.length;i++){var f=p.files[i],u=getPath(String(f.file));putMyVar('__hc_local_module_loading',String(f.name||i));try{require(u);}catch(e){throw new Error('本地模块 '+String(f.name||i)+' require失败: '+String(e.message||e));}}clearMyVar('__hc_local_module_loading');return p;}
  function ensure(c,r){try{return install(c,r,false);}catch(e){return{ok:false,error:String(e.message||e),release:release(r,c.id)};}}
  function removeBuild(c,b){var r={id:c.id,build:Number(b),version:'0',ref:'main',modules:[]},p=readPrivate(packageFile(c,r));if(p&&Array.isArray(p.files))for(var i=0;i<p.files.length;i++)try{deleteFile(String(p.files[i].file));}catch(e){}try{deleteFile(packageFile(c,r));}catch(e2){}return true;}
  return{version:VERSION,probe:probe,install:install,ensure:ensure,load:load,complete:complete,removeBuild:removeBuild,stateFile:stateFile,packageFile:packageFile};
})();