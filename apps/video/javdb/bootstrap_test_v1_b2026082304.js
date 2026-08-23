var JDBBoot=(function(){
  var raw='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
  var webraw='https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/';
  var cdn='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/';
  var path='cloud/javdb/v3.9.43-test.3/runtime.js';
  var cacheKey='jdb3_boot_runtime_3943t3';
  function valid(s){s=String(s||'');return s&&s.indexOf('var JDBCLOUD=')>=0;}
  function runtime(){
    var s=String(getItem(cacheKey,'')||''),u=[cdn+path,webraw+path,raw+path],i,x,last='';
    if(valid(s))return s;
    for(i=0;i<u.length;i++){
      try{x=String(fetch(u[i],{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');if(valid(x)){setItem(cacheKey,x);return x;}if(x)last='内容校验失败';}
      catch(e){last=String(e.message||e);}
    }
    s=String(getItem(cacheKey,'')||'');
    if(valid(s))return s;
    throw new Error('JavDB Runtime 加载失败'+(last?'：'+last:''));
  }
  return {
    version:'2026082304',
    core:function(call){var s=runtime();eval(s);JDBCLOUD.core(call);},
    custom:function(key){var s=runtime();eval(s);JDBCLOUD.custom(key);},
    diagnostics:function(){return {version:this.version,cacheKey:cacheKey,runtimePath:path};}
  };
})();
