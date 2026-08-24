/* 黄豆短剧 Bootstrap 1.9.1-test.2 - Local-First Runtime */
var HUANGDOU_BOOT_VERSION='1.9.1-test.2';
var HUANGDOU_LOCAL_MANAGER_VERSION=210;
var HUANGDOU_LOCAL_MANAGER_URLS=[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/c55bf6781ea0fdd41bbbfb0768e30c53eabc736b/libs/updater/v2.1.0/local_bundle_manager.js'
];
var HUANGDOU_RELEASE_URLS=[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@be0b28b50a1a3d244192e864fc502cdbab487c16/apps/video/huangdou/releases/1.9.1-test.2/release.json',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/be0b28b50a1a3d244192e864fc502cdbab487c16/apps/video/huangdou/releases/1.9.1-test.2/release.json',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/be0b28b50a1a3d244192e864fc502cdbab487c16/apps/video/huangdou/releases/1.9.1-test.2/release.json'
];
var HUANGDOU_LOCAL_CONFIG={id:'huangdou-test',timeout:8000,repoTemplates:[
 'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}',
 'https://github.com/huoguotiankong/asset-core-7f3/raw/{ref}/{path}'
]};
var HUANGDOU_ASSET_BASE='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@1275b58058f85b72b3ca06c0f18e553192273bd1/apps/video/huangdou/assets/v190/';
function hddjValid(t){t=String(t==null?'':t);return !!t.trim()&&!/^\s*(<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found)/i.test(t);}
function hddjFetchAny(us,label){var es=[];for(var i=0;i<us.length;i++)try{var t=fetch(String(us[i]),{timeout:8000,headers:{'Cache-Control':'no-cache'}});if(!hddjValid(t))throw new Error('无效响应');return String(t);}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error(String(label||'资源')+'全部镜像失败：'+es.join(' | '));}
function hddjRequireAny(us,ver,label){var es=[];for(var i=0;i<us.length;i++)try{require(String(us[i]),{headers:{'Cache-Control':'no-cache'}},Number(ver||1));return;}catch(e){es.push((i+1)+':'+String(e.message||e));}throw new Error(String(label||'模块')+'全部镜像失败：'+es.join(' | '));}
function hddjRelease(){var r=JSON.parse(hddjFetchAny(HUANGDOU_RELEASE_URLS,'黄豆 Local-First Release'));if(String(r.id)!=='huangdou-test'||Number(r.build)!==19102)throw new Error('黄豆 Local-First Release 身份异常');return r;}
function hddjManager(){hddjRequireAny(HUANGDOU_LOCAL_MANAGER_URLS,HUANGDOU_LOCAL_MANAGER_VERSION,'Local Bundle Manager 2.1.0');if(typeof HikerLocalBundle!=='object'||String(HikerLocalBundle.version)!=='2.1.0')throw new Error('Local Bundle Manager 版本异常');return HikerLocalBundle;}
function hddjAsset(name){return'hiker://files/cache/asset-core-local/huangdou/19102/'+String(name)+'.svg';}
function hddjInstallAssets(){var names=['library','topic','mine','settings'],ok=0;for(var i=0;i<names.length;i++){var p=hddjAsset(names[i]);try{if(!fileExist(p))downloadFile(HUANGDOU_ASSET_BASE+names[i]+'.svg',p);if(!fileExist(p))throw new Error('写入失败');ok++;}catch(e){throw new Error('本地图标 '+names[i]+' 安装失败：'+String(e.message||e));}}return ok;}
var HuangDouBoot={
 version:HUANGDOU_BOOT_VERSION,
 installLocal:function(force){var m=hddjManager(),r=hddjRelease();if(force)try{m.removeBuild(HUANGDOU_LOCAL_CONFIG,r.build);}catch(e){}hddjInstallAssets();var x=m.ensure(HUANGDOU_LOCAL_CONFIG,r);if(!x||!x.ok)throw new Error(x&&x.error?x.error:'黄豆本地运行包安装失败');return x;},
 status:function(){try{return hddjManager().status(HUANGDOU_LOCAL_CONFIG);}catch(e){return{error:String(e.message||e)};}},
 module:function(){this.installLocal(false);var p=JSON.parse(String(readFile('__hclocal_huangdou-test_b19102.json',0)||'{}'));if(!p||!Array.isArray(p.files)||!p.files.length)throw new Error('黄豆本地运行包描述为空');for(var i=0;i<p.files.length;i++){var f=p.files[i]||{},n=String(f.name||'');if(n==='core-snapshot'||n==='detail-base')continue;eval(String(readFile(String(f.file),0)||''));}if(typeof HuangDouRemoteRuntime!=='object')throw new Error('黄豆 Local-First Runtime 加载失败');return HuangDouRemoteRuntime.module();}
};
