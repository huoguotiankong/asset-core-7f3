/* 麻豆传媒 Bootstrap 0.1.1-test.1 - Native Local-First */
var MADOU_BOOT_VERSION='0.1.1-test.1';
var MadouBoot=(function(){
  var MANAGER_URLS=[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js'
  ];
  var C={id:'madou-test',timeout:8000,repoTemplates:[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}'
  ]};
  var R={"schema":1,"id":"madou-test","name":"麻豆传媒","channel":"test","version":"0.1.1-test.1","build":10201,"ref":"6ed5b1033d69c6376a931969bf4b7f06c920b538","baseStable":{"version":"0.1.0","build":10114,"release":"apps/video/madou/releases/0.1.0/release.json"},"previousTest":{"version":"0.1.0-test.13","build":10113,"release":"apps/video/madou/releases/0.1.0-test.13/release.json","status":"promotion-source"},"modules":[{"name":"core","path":"apps/video/madou/releases/0.1.0-test.1/core.js"},{"name":"runtime","path":"apps/video/madou/releases/0.1.0-test.1/runtime.js"},{"name":"performance-local","path":"apps/video/madou/releases/0.1.1-test.1/performance_local_native.js"},{"name":"storage-rescue","path":"apps/video/madou/releases/0.1.0-test.12/storage_rescue.js"},{"name":"default-detail-playback","path":"apps/video/madou/releases/0.1.0-test.13/default_detail_playback.js"},{"name":"identity-local","path":"apps/video/madou/releases/0.1.1-test.1/identity_local_patch.js"}],"verify":{"global":"MadouRemoteRuntime","property":"version","equals":"0.1.1-test.1"},"delivery":{"mode":"local-first-native","moduleManager":"2.2.0","execution":"require(file://)","actionBootstrap":"local-file"}};
  var ASSET_REF='6ed5b1033d69c6376a931969bf4b7f06c920b538';
  var ROOT='hiker://files/rules/asset-core-local/madou-test/assets/';
  function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
  function fetchAny(path,check,label){var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ASSET_REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ASSET_REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ASSET_REF+'/'+path],es=[];for(var i=0;i<us.length;i++)try{var t=String(fetch(us[i],{timeout:8000,headers:{'Cache-Control':'no-cache'}})||'');if(bad(t)||!check(t))throw new Error('内容校验失败');return t;}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error(String(label||path)+' 全部镜像失败：'+es.join(' | '));}
  function writeAsset(name,text,check){var p=ROOT+name;writeFile(p,String(text));if(!fileExist(p))throw new Error('本地资产写入失败：'+name);var back=String(fetch(p)||'');if(!check(back)||String(md5(back))!==String(md5(text)))throw new Error('本地资产回读校验失败：'+name);return p;}
  function installAssets(force){
    var defs=[
      ['performance_test10.js','apps/video/madou/releases/0.1.0-test.10/performance_runtime.js',function(t){return t.indexOf('Test10 - performance-first runtime')>=0;}],
      ['quick_search.svg','apps/video/madou/assets/quick_search.svg',function(t){return /<svg\b/i.test(t);}],
      ['quick_categories.svg','apps/video/madou/assets/quick_categories.svg',function(t){return /<svg\b/i.test(t);}],
      ['quick_favorite.svg','apps/video/madou/assets/quick_favorite.svg',function(t){return /<svg\b/i.test(t);}],
      ['quick_history.svg','apps/video/madou/assets/quick_history.svg',function(t){return /<svg\b/i.test(t);}],
      ['action_bootstrap_b10201.js','apps/video/madou/releases/0.1.1-test.1/action_bootstrap.js',function(t){return t.indexOf("version:'0.1.1-test.1-local-action'")>=0;}]
    ],ok=0;
    for(var i=0;i<defs.length;i++){var d=defs[i],p=ROOT+d[0],cur='';try{if(!force&&fileExist(p))cur=String(fetch(p)||'');}catch(e){cur='';}if(!cur||!d[2](cur))writeAsset(d[0],fetchAny(d[1],d[2],d[0]),d[2]);ok++;}
    return ok;
  }
  function manager(){var es=[];for(var i=0;i<MANAGER_URLS.length;i++)try{var src=String(fetch(MANAGER_URLS[i],{timeout:8000,headers:{'Cache-Control':'no-cache'}})||'');if(bad(src))throw new Error('无效响应');var HikerLocalModules;eval(src);if(typeof HikerLocalModules!=='object'||String(HikerLocalModules.version)!=='2.2.0')throw new Error('导出校验失败');return HikerLocalModules;}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error('Local Module Manager 2.2.0 全部镜像失败：'+es.join(' | '));}
  function release(){return JSON.parse(JSON.stringify(R));}
  function installLocal(force){installAssets(!!force);var m=manager(),x=m.install(C,R,!!force);if(!x||!x.ok)throw new Error(x&&x.error?x.error:'麻豆传媒本地模块包安装失败');return x;}
  function loadLocal(){var m=manager();m.load(C,R);if(typeof MadouRemoteRuntime==='undefined'||String(MadouRemoteRuntime.version)!=='0.1.1-test.1'||Number(MadouRemoteRuntime.build)!==10201)throw new Error('麻豆传媒 Local-First Runtime 校验失败');return MadouRemoteRuntime.module();}
  return{version:MADOU_BOOT_VERSION,config:C,release:release,manager:manager,installAssets:installAssets,installLocal:installLocal,loadLocal:loadLocal};
})();
