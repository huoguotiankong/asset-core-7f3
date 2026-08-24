/* 黄豆短剧 Bootstrap 1.9.1-test.3 - Native Local-First */
var HUANGDOU_BOOT_VERSION='1.9.1-test.3';
var HuangDouBoot=(function(){
  var MANAGER_URLS=[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js'
  ];
  var C={id:'huangdou-test',timeout:8000,repoTemplates:[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}'
  ]};
  var R={"schema":1,"id":"huangdou-test","name":"黄豆短剧","version":"1.9.1-test.3","build":19103,"ref":"2328da698091bc30f518a943149e801297b7bd5b","baseStable":{"version":"1.9.0","build":19006,"release":"apps/video/huangdou/releases/1.9.0/release.json"},"previousTest":{"version":"1.9.1-test.2","build":19102,"release":"apps/video/huangdou/releases/1.9.1-test.2/release.json","status":"superseded-by-native-local-modules"},"modules":[{"name":"core-native","path":"apps/video/huangdou/releases/1.9.1-test.3/core_local_native.js"},{"name":"ui-native","path":"apps/video/huangdou/releases/1.9.1-test.3/ui_base_local_native.js"},{"name":"playback-adapter","path":"apps/video/huangdou/releases/1.9.0-test.4/playback.js"},{"name":"content-pages","path":"apps/video/huangdou/releases/1.9.0-test.1/pages_content.js"},{"name":"detail-native","path":"apps/video/huangdou/releases/1.9.1-test.3/detail_local_native.js"},{"name":"runtime","path":"apps/video/huangdou/releases/1.9.1-test.3/runtime.js"}],"verify":{"global":"HuangDouRemoteRuntime","property":"build","equals":"1.9.1-test.3"},"delivery":{"mode":"local-first-native","moduleManager":"2.2.0","execution":"require(file://)","code":"hiker-files-rules","assets":"hiker-files-rules","controlPlane":"remote-on-install-update-only"},"notes":"由 Stable 1.9.0 rebase。Test3 将可执行模块迁移到 Local Module Manager 2.2.0 + 海阔原生 require(file://)；Core/Detail 固定基线作为本地只读资产安装，正常启动不访问 GitHub/CDN。"};
  var ASSET_REF='1275b58058f85b72b3ca06c0f18e553192273bd1';
  var ROOT='hiker://files/rules/asset-core-local/huangdou-test/assets/';
  function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
  function fetchAny(path,check,label){
    var us=[
      'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ASSET_REF+'/'+path,
      'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ASSET_REF+'/'+path,
      'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ASSET_REF+'/'+path
    ],es=[];
    for(var i=0;i<us.length;i++)try{var t=String(fetch(us[i],{timeout:8000,headers:{'Cache-Control':'no-cache'}})||'');if(bad(t)||!check(t))throw new Error('内容校验失败');return t;}catch(e){es.push((i+1)+':'+String(e.message||e));}
    throw new Error(String(label||path)+' 全部镜像失败：'+es.join(' | '));
  }
  function writeAsset(name,text,check){
    var p=ROOT+name;
    writeFile(p,String(text));
    if(!fileExist(p))throw new Error('本地资产写入失败：'+name);
    var back=String(fetch(p)||'');
    if(!check(back)||String(md5(back))!==String(md5(text)))throw new Error('本地资产回读校验失败：'+name);
    return p;
  }
  function installAssets(force){
    var defs=[
      ['core_182.txt','apps/video/huangdou/releases/1.8.2-test.1/source_local_1.8.2.txt',function(t){return t.indexOf('海阔视界，首页频道￥home_rule￥')===0;}],
      ['detail_test5.js','apps/video/huangdou/releases/1.9.0-test.5/pages_detail.js',function(t){return t.indexOf('var HuangDouDetailV190')>=0;}],
      ['library.svg','apps/video/huangdou/assets/v190/library.svg',function(t){return /<svg\b/i.test(t);}],
      ['topic.svg','apps/video/huangdou/assets/v190/topic.svg',function(t){return /<svg\b/i.test(t);}],
      ['mine.svg','apps/video/huangdou/assets/v190/mine.svg',function(t){return /<svg\b/i.test(t);}],
      ['settings.svg','apps/video/huangdou/assets/v190/settings.svg',function(t){return /<svg\b/i.test(t);}]
    ],ok=0;
    for(var i=0;i<defs.length;i++){
      var d=defs[i],p=ROOT+d[0],cur='';
      try{if(!force&&fileExist(p))cur=String(fetch(p)||'');}catch(e){cur='';}
      if(!cur||!d[2](cur))writeAsset(d[0],fetchAny(d[1],d[2],d[0]),d[2]);
      ok++;
    }
    return ok;
  }
  function manager(){
    var es=[];
    for(var i=0;i<MANAGER_URLS.length;i++)try{
      var src=String(fetch(MANAGER_URLS[i],{timeout:8000,headers:{'Cache-Control':'no-cache'}})||'');
      if(bad(src))throw new Error('无效响应');
      var HikerLocalModules;eval(src);
      if(typeof HikerLocalModules!=='object'||String(HikerLocalModules.version)!=='2.2.0')throw new Error('导出校验失败');
      return HikerLocalModules;
    }catch(e){es.push((i+1)+':'+String(e.message||e));}
    throw new Error('Local Module Manager 2.2.0 全部镜像失败：'+es.join(' | '));
  }
  function release(){return JSON.parse(JSON.stringify(R));}
  function installLocal(force){
    installAssets(!!force);
    var m=manager(),x=m.install(C,R,!!force);
    if(!x||!x.ok)throw new Error(x&&x.error?x.error:'黄豆本地模块包安装失败');
    return x;
  }
  function loadLocal(){
    var m=manager();m.load(C,R);
    if(typeof HuangDouRemoteRuntime!=='object'||String(HuangDouRemoteRuntime.build)!=='1.9.1-test.3')throw new Error('黄豆 Local-First Runtime 校验失败');
    return HuangDouRemoteRuntime.module();
  }
  return{version:HUANGDOU_BOOT_VERSION,config:C,release:release,manager:manager,installAssets:installAssets,installLocal:installLocal,loadLocal:loadLocal};
})();
