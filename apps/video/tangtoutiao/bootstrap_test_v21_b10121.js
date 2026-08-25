/* 汤头条 Bootstrap 0.1.0-test.21 - Native Local-First */
var TTT_BOOT_VERSION='0.1.0-test.21';
var TangTouTiaoBoot=(function(){
  var MANAGER_URLS=[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@e06542e60677d5505e7383435b17cb69ec7a21ba/libs/updater/v2.2.0/local_module_manager.js'
  ];
  var C={id:'tangtoutiao-test',timeout:8000,repoTemplates:[
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}',
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}'
  ]};
  var R={"schema":1,"id":"tangtoutiao-test","name":"汤头条","version":"0.1.0-test.21","build":10121,"ref":"e8f6c46a1b86a20c75b0f9cb5148984ad0a37b53","baseStable":null,"baseTest":{"version":"0.1.0-test.20","build":10120,"release":"apps/video/tangtoutiao/releases/0.1.0-test.20/release.json"},"previousBootable":{"version":"0.1.0-test.19","build":10119,"release":"apps/video/tangtoutiao/releases/0.1.0-test.19/release.json"},"modules":[{"name":"protocol","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/protocol.js"},{"name":"protocolGate","path":"apps/video/tangtoutiao/releases/0.1.0-test.7/protocol_gate.js"},{"name":"imageLegacy","path":"apps/video/tangtoutiao/releases/0.1.0-test.15/image.js"},{"name":"coreBase","path":"apps/video/tangtoutiao/releases/0.1.0-test.11/core.js"},{"name":"compatBase","path":"apps/video/tangtoutiao/releases/0.1.0-test.12/compat.js"},{"name":"compatAdaptive","path":"apps/video/tangtoutiao/releases/0.1.0-test.13/compat.js"},{"name":"pwa","path":"apps/video/tangtoutiao/releases/0.1.0-test.12/pwa.js"},{"name":"ui","path":"apps/video/tangtoutiao/releases/0.1.0-test.6/ui.js"},{"name":"playback","path":"apps/video/tangtoutiao/releases/0.1.0-test.10/playback.js"},{"name":"compat15","path":"apps/video/tangtoutiao/releases/0.1.0-test.15/compat.js"},{"name":"playbackBridge15","path":"apps/video/tangtoutiao/releases/0.1.0-test.15/playback_bridge.js"},{"name":"compat","path":"apps/video/tangtoutiao/releases/0.1.0-test.16/compat.js"},{"name":"playbackBridge","path":"apps/video/tangtoutiao/releases/0.1.0-test.17/playback_bridge.js"},{"name":"pagesBase","path":"apps/video/tangtoutiao/releases/0.1.0-test.9/pages.js"},{"name":"pagesAccess","path":"apps/video/tangtoutiao/releases/0.1.0-test.11/pages_patch.js"},{"name":"pagesDual","path":"apps/video/tangtoutiao/releases/0.1.0-test.12/pages_patch.js"},{"name":"pagesShort","path":"apps/video/tangtoutiao/releases/0.1.0-test.13/pages_patch.js"},{"name":"pagesLarge","path":"apps/video/tangtoutiao/releases/0.1.0-test.14/pages_patch.js"},{"name":"pagesStablePlayback","path":"apps/video/tangtoutiao/releases/0.1.0-test.15/pages_patch.js"},{"name":"pagesImageUi","path":"apps/video/tangtoutiao/releases/0.1.0-test.16/pages_patch.js"},{"name":"pagesFastTabs17","path":"apps/video/tangtoutiao/releases/0.1.0-test.17/pages_patch.js"},{"name":"pagesClassify18","path":"apps/video/tangtoutiao/releases/0.1.0-test.18/pages_patch.js"},{"name":"runtime19","path":"apps/video/tangtoutiao/releases/0.1.0-test.19/runtime.js"},{"name":"pages20","path":"apps/video/tangtoutiao/releases/0.1.0-test.20/pages_patch.js"},{"name":"runtime20","path":"apps/video/tangtoutiao/releases/0.1.0-test.20/runtime.js"},{"name":"localFirstOverlay","path":"apps/video/tangtoutiao/releases/0.1.0-test.21/final_local_patch.js"}],"verify":{"global":"TangTouTiaoRemoteRuntime","property":"version","equals":"0.1.0-test.21"},"delivery":{"mode":"local-first-native","moduleManager":"2.2.0","execution":"require(file://)","code":"hiker-files-rules","controlPlane":"remote-on-install-update-only","businessBase":"0.1.0-test.20"},"notes":"Delivery-only migration over Test20. The exact 25-module Test20 order is preserved and one final Local-First settings/version overlay is appended. Normal startup uses the installed native local package and does not load Remote Manager/Bootstrap or GitHub/CDN code. Test20 image, long-video/preview playback, content contracts and the known 2–3 second short-video limitation remain unchanged."};
  function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
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
    var m=manager(),x=m.install(C,R,!!force);
    if(!x||!x.ok)throw new Error(x&&x.error?x.error:'汤头条本地模块包安装失败');
    return x;
  }
  function loadLocal(){
    var m=manager();m.load(C,R);
    if(typeof TangTouTiaoRemoteRuntime!=='object'||String(TangTouTiaoRemoteRuntime.version)!=='0.1.0-test.21')throw new Error('汤头条 Local-First Runtime 校验失败');
    return TangTouTiaoRemoteRuntime.module();
  }
  return{version:TTT_BOOT_VERSION,config:C,release:release,manager:manager,installLocal:installLocal,loadLocal:loadLocal};
})();
