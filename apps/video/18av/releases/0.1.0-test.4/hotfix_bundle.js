/* 18AV Remote Test4 hotfix bundle: repair Test3 regex compile limit without mutating Test3 */
(function(){
  var VERSION='0.1.0-test.4', BUILD=10104;
  var ROOT='apps/video/18av/releases/0.1.0-test.3/';
  var REPO='huoguotiankong/asset-core-7f3';
  function fetchAny(path,mark){
    var urls=[
      'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+path,
      'https://github.com/'+REPO+'/raw/refs/heads/main/'+path,
      'https://raw.githubusercontent.com/'+REPO+'/main/'+path
    ],errs=[],i,t,u;
    for(i=0;i<urls.length;i++){
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'av18_hotfix='+BUILD+'&_t='+Date.now();
      try{
        t=String(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}})||'');
        if(t.length<500||t.indexOf(mark)<0)throw new Error('响应无效 len='+t.length);
        return t;
      }catch(e){errs.push((i+1)+':'+String(e.message||e));}
    }
    throw new Error('Test3 '+path+'读取失败：'+errs.join(' | '));
  }
  function commonPatch(t){
    return String(t||'')
      .replace(/0\.1\.0-test\.3/g,VERSION)
      .replace(/10103/g,String(BUILD))
      .replace(/bootstrap_test_v3_b10104/g,'bootstrap_test_v4_b10104');
  }
  var core=fetchAny(ROOT+'core.js','AV18Core');
  /* Rhino/Hiker regex repeat upper bound is 50000. Test3 used {0,250000}, which fails at module compile time. */
  core=core.replace(/\{0,250000\}/g,'*');
  core=commonPatch(core).replace(/^var\s+AV18Core\s*=/m,'AV18Core=');
  eval(core);
  if(typeof AV18Core!=='object'||String(AV18Core.version||'')!==VERSION)throw new Error('Test4 core hotfix校验失败');
  var runtime=fetchAny(ROOT+'runtime.js','AV18RemoteRuntime');
  runtime=commonPatch(runtime).replace(/^var\s+AV18RemoteRuntime\s*=/m,'AV18RemoteRuntime=');
  eval(runtime);
  if(typeof AV18RemoteRuntime!=='object'||String(AV18RemoteRuntime.version||'')!==VERSION)throw new Error('Test4 runtime hotfix校验失败');
})();
