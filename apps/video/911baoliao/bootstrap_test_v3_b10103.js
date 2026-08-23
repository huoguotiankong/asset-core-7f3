/* 911爆料 Remote Test Bootstrap 0.1.0-test.3 */
var BL911_BOOT_CONFIG={
  id:'911baoliao-test',
  branch:'main',
  latestPath:'apps/video/911baoliao/test.json',
  minBuild:10103,
  timeout:12000,
  moduleHeaders:{'Cache-Control':'no-cache'},
  repoTemplates:[
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}',
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}'
  ],
  defaultRelease:{
    schema:1,id:'911baoliao-test',name:'911爆料',channel:'test',version:'0.1.0-test.3',build:10103,ref:'main',
    modules:[
      {name:'core',path:'apps/video/911baoliao/releases/0.1.0-test.1/core.js'},
      {name:'runtime',path:'apps/video/911baoliao/releases/0.1.0-test.1/runtime.js'},
      {name:'routePatch',path:'apps/video/911baoliao/releases/0.1.0-test.2/route_patch.js'},
      {name:'transportPatch',path:'apps/video/911baoliao/releases/0.1.0-test.3/transport_patch.js'}
    ],
    verify:{global:'Bl911RemoteRuntime',property:'version',equals:'0.1.0-test.3'},
    notes:'Test3 CDN/multi-mirror transport hotfix.'
  }
};
var Bl911Boot={
  manager:function(){
    if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.2')return HikerCloudRemote;
    var urls=[
      'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/libs/updater/v2.0.2/remote_manager.js?v=202',
      'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/libs/updater/v2.0.2/remote_manager.js?v=202',
      'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.2/remote_manager.js?v=202'
    ],last='';
    for(var i=0;i<urls.length;i++){
      try{require(urls[i],{headers:{'Cache-Control':'no-cache'}},202);if(typeof HikerCloudRemote==='object')return HikerCloudRemote;}catch(e){last=String(e.message||e);}
    }
    throw new Error('远程模块管理器加载失败：'+last);
  },
  loadOnly:function(){return this.manager().load(BL911_BOOT_CONFIG);},
  module:function(){this.loadOnly();return Bl911RemoteRuntime.module();},
  info:function(){return this.manager().info(BL911_BOOT_CONFIG);},
  check:function(){return this.manager().check(BL911_BOOT_CONFIG);},
  update:function(){return this.manager().update(BL911_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(BL911_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(BL911_BOOT_CONFIG);}
};
