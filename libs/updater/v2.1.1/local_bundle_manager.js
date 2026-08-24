/* asset-core Local Bundle Manager v2.1.1
 * Local-first runtime installer with Hiker private-file text normalization support.
 */
var HikerLocalBundle=(function(){
  var VERSION='2.1.1';
  function now(){return new Date().getTime();}
  function clone(o){return o?JSON.parse(JSON.stringify(o)):o;}
  function safeId(s){return String(s||'app').replace(/[^0-9A-Za-z_.-]/g,'_');}
  function normPath(p){return String(p||'').replace(/^\/+/, '');}
  function normText(s){s=String(s==null?'':s);if(s.charCodeAt(0)===0xFEFF)s=s.substring(1);return s.replace(/\r\n?/g,'\n').replace(/\n+$/,'');}
  function validText(t){t=String(t==null?'':t);if(!t.trim())return false;if(/^\s*<!doctype\b/i.test(t)||/^\s*<html\b/i.test(t)||/^\s*(Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found)/i.test(t))return false;return true;}
  function parse(s,l){try{return JSON.parse(String(s||''));}catch(e){throw new Error((l||'JSON')+'解析失败: '+String(e.message||e));}}
  function release(r,id){if(!r||typeof r!=='object')throw new Error('版本描述为空');var x=clone(r);x.id=String(x.id||id||'');x.version=String(x.version||'0.0.0');x.build=Number(x.build||0);x.ref=String(x.ref||'main');if(!x.id||!x.build)throw new Error('版本描述缺少 id/build');if(!Array.isArray(x.modules)||!x.modules.length)throw new Error('版本描述缺少 modules');for(var i=0;i<x.modules.length;i++)if(!x.modules[i]||!x.modules[i].path)throw new Error('modules['+i+']缺少 path');return x;}
  function stateFile(c){return'__hclocal_'+safeId(c.id)+'_state.json';}
  function packageFile(c,r){return'__hclocal_'+safeId(c.id)+'_b'+Number(r.build||0)+'.json';}
  function moduleFile(c,r,i){return'__hclocal_'+safeId(c.id)+'_b'+Number(r.build||0)+'_m'+String(i)+'.js';}
  function readJsonFile(n){try{if(!fileExist(n))return null;var s=readFile(n,0);return s?parse(s,n):null;}catch(e){return null;}}
  function writeText(n,s){s=String(s==null?'':s);saveFile(n,s,0);if(!fileExist(n))throw new Error('本地文件未生成: '+n);var back=String(readFile(n,0)||'');if(!back.length)throw new Error('本地文件回读为空: '+n);if(normText(back)!==normText(s))throw new Error('本地写入校验失败: '+n);return back;}
  function readState(c){var x=readJsonFile(stateFile(c));return x&&typeof x==='object'?x:{schema:1,current:null,previous:null,updatedAt:0};}
  function saveState(c,s){writeText(stateFile(c),JSON.stringify(s));return s;}
  function templates(c){var a=c&&Array.isArray(c.repoTemplates)&&c.repoTemplates.length?c.repoTemplates:['https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}','https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}','https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'];return a.slice();}
  function urls(c,path,ref){path=normPath(path);ref=String(ref||'main');return templates(c).map(function(t){return String(t).replace(/\{ref\}/g,ref).replace(/\{path\}/g,path);});}
  function fetchOne(u,timeout){var text=fetch(String(u),{timeout:Number(timeout||8000),headers:{'Cache-Control':'no-cache'}});if(!validText(text))throw new Error('无效响应');return String(text);}
  function fetchModule(c,m,r){var us=urls(c,m.path,r.ref),es=[];for(var i=0;i<us.length;i++){try{return{text:fetchOne(us[i],c.timeout||8000),source:us[i]};}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('模块 '+String(m.name||m.path)+' 全部镜像失败: '+es.join(' | '));}
  function complete(c,r){r=release(r,c.id);var p=readJsonFile(packageFile(c,r));if(!p||Number(p.build||0)!==r.build||!Array.isArray(p.files)||p.files.length!==r.modules.length)return null;for(var i=0;i<p.files.length;i++){var f=p.files[i];if(!f||!f.file||!fileExist(String(f.file)))return null;try{var t=String(readFile(String(f.file),0)||'');if(!validText(t))return null;if(f.md5&&String(md5(t))!==String(f.md5))return null;}catch(e){return null;}}return p;}
  function install(c,r){r=release(r,c.id);var existing=complete(c,r),s=readState(c);if(existing){if(!s.current||Number(s.current.build||0)!==r.build){var old=s.current&&Number(s.current.build||0)!==r.build?clone(s.current):s.previous;s.previous=old||null;s.current={version:r.version,build:r.build,packageFile:packageFile(c,r)};s.updatedAt=now();saveState(c,s);}return{ok:true,cached:true,release:r,package:existing,state:s};}
    var texts=[],files=[],sources=[];
    var primary=urls(c,'__dummy__',r.ref)[0],useBatch=typeof batchFetch==='function'&&primary.indexOf('cdn.jsdelivr.net')>=0;
    if(useBatch){try{var reqs=[];for(var bi=0;bi<r.modules.length;bi++){var pu=urls(c,r.modules[bi].path,r.ref)[0];reqs.push({url:pu,options:{timeout:Number(c.timeout||8000),headers:{'Cache-Control':'no-cache'}}});}var rs=batchFetch(reqs);for(var bj=0;bj<r.modules.length;bj++){var bt=rs&&rs[bj]!=null?String(rs[bj]):'';if(validText(bt)){texts[bj]=bt;sources[bj]=reqs[bj].url;}}}catch(be){}}
    for(var i=0;i<r.modules.length;i++){
      var m=r.modules[i],text=texts[i],src=sources[i]||'';
      if(!validText(text)){var got=fetchModule(c,m,r);text=got.text;src=got.source;}
      var fn=moduleFile(c,r,i),back=writeText(fn,text),sum=String(md5(back));
      if(!validText(back))throw new Error('模块本地内容无效: '+String(m.name||m.path));
      files.push({name:String(m.name||('module'+(i+1))),path:String(m.path),file:fn,md5:sum,source:src,normalized:normText(back)!==String(back)});
    }
    var pkg={schema:2,id:r.id,version:r.version,build:r.build,ref:r.ref,installedAt:now(),manager:VERSION,files:files,verify:clone(r.verify||null)};writeText(packageFile(c,r),JSON.stringify(pkg));
    if(!complete(c,r))throw new Error('本地运行包完整性复核失败');
    var prev=s.current&&Number(s.current.build||0)!==r.build?clone(s.current):s.previous;s.previous=prev||null;s.current={version:r.version,build:r.build,packageFile:packageFile(c,r)};s.updatedAt=now();s.lastInstallError='';saveState(c,s);
    return{ok:true,cached:false,release:r,package:pkg,state:s};
  }
  function ensure(c,r){try{return install(c,r);}catch(e){var s=readState(c);s.lastInstallError=String(e.message||e);try{saveState(c,s);}catch(e2){}return{ok:false,error:String(e.message||e),state:s,release:release(r,c.id)};}}
  function status(c){var s=readState(c),cur=null,prev=null;if(s.current&&s.current.packageFile)cur=readJsonFile(String(s.current.packageFile));if(s.previous&&s.previous.packageFile)prev=readJsonFile(String(s.previous.packageFile));return{version:VERSION,state:s,current:cur,previous:prev};}
  function removeBuild(c,b){var st=readState(c),pf='__hclocal_'+safeId(c.id)+'_b'+Number(b)+'.json',p=readJsonFile(pf);if(p&&Array.isArray(p.files))for(var i=0;i<p.files.length;i++)try{deleteFile(String(p.files[i].file));}catch(e){}try{deleteFile(pf);}catch(e2){}if(st.current&&Number(st.current.build||0)===Number(b))st.current=null;if(st.previous&&Number(st.previous.build||0)===Number(b))st.previous=null;saveState(c,st);return true;}
  return{version:VERSION,ensure:ensure,install:install,status:status,complete:complete,readState:readState,removeBuild:removeBuild,stateFile:stateFile,packageFile:packageFile,normalizeText:normText};
})();
