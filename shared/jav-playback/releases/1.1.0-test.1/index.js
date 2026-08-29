/* Shared JAV Playback SDK 1.1.0-test.1 - stable base + provider upgrade */
var JAVPlayback;
(function(){
  var baseUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/releases/1.0.0-test.4/index.js';
  var patchUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/releases/1.1.0-test.1/upgrade.js';
  var baseKey='jav_playback_sdk_base_10004_for_11001',patchKey='jav_playback_upgrade_11001',src=getItem(baseKey,''),patch=getItem(patchKey,'');
  if(!src){src=fetch(baseUrl,{timeout:12000,headers:{'Cache-Control':'no-cache'}});if(!src||src.indexOf('1.0.0-test.4')<0)throw new Error('JAV Playback stable base加载失败');setItem(baseKey,src);}
  eval(src);
  if(!JAVPlayback)throw new Error('JAV Playback stable base导出失败');
  if(!patch){patch=fetch(patchUrl,{timeout:12000,headers:{'Cache-Control':'no-cache'}});if(!patch||patch.indexOf('1.1.0-test.1')<0)throw new Error('JAV Playback upgrade加载失败');setItem(patchKey,patch);}
  var JAVPlaybackUpgrade11001;
  patch=String(patch).replace(/var\s+JAVPlaybackUpgrade11001\s*=/,'JAVPlaybackUpgrade11001=');
  eval(patch);
  if(!JAVPlaybackUpgrade11001||typeof JAVPlaybackUpgrade11001.apply!=='function')throw new Error('JAV Playback upgrade导出失败');
  JAVPlayback=JAVPlaybackUpgrade11001.apply(JAVPlayback,{localReentry:false});
})();
if(typeof $!=='undefined')$.exports=JAVPlayback;
