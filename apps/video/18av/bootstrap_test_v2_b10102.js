/* 18AV Remote Test Bootstrap 0.1.0-test.2 */
var AV18_BOOT_CONFIG={
  id:'18av',branch:'main',latestPath:'apps/video/18av/test.json',minBuild:10102,timeout:12000,moduleHeaders:{'Cache-Control':'no-cache'},
  repoTemplates:[
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}',
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}'
  ],
  defaultRelease:{schema:1,id:'18av',name:'18AV',channel:'test',version:'0.1.0-test.2',build:10102,ref:'main',modules:[
    {name:'core',path:'apps/video/18av/releases/0.1.0-test.2/core.js'},
    {name:'runtime',path:'apps/video/18av/releases/0.1.0-test.2/runtime.js'}
  ],verify:{global:'AV18RemoteRuntime',property:'version',equals:'0.1.0-test.2'},notes:'18AV pre-device Test2.'}
};
var AV18Boot={
  manager:function(){if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4')return HikerCloudRemote;var urls=[
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/libs/updater/v2.0.4/remote_manager.js?v=204',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/libs/updater/v2.0.4/remote_manager.js?v=204',
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.4/remote_manager.js?v=204'
  ],last='';for(var i=0;i<urls.length;i++){try{require(urls[i],{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object')return HikerCloudRemote;}catch(e){last=String(e.message||e);}}throw new Error('远程模块管理器加载失败：'+last);},
  loadOnly:function(){return this.manager().load(AV18_BOOT_CONFIG);},module:function(){this.loadOnly();return AV18RemoteRuntime.module();},info:function(){return this.manager().info(AV18_BOOT_CONFIG);},check:function(){return this.manager().check(AV18_BOOT_CONFIG);},update:function(){return this.manager().update(AV18_BOOT_CONFIG);},rollback:function(){return this.manager().rollback(AV18_BOOT_CONFIG);},reinstall:function(){return this.manager().reinstall(AV18_BOOT_CONFIG);}
};
