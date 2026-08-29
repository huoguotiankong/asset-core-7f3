/* 夜社短剧 Remote Test Bootstrap 0.1.0-test.2 */
var YESHE_BOOT_CONFIG={
  id:'yeshe-test',
  branch:'main',
  latestPath:'apps/video/yeshe/test.json',
  minBuild:10102,
  timeout:12000,
  moduleHeaders:{'Cache-Control':'no-cache'},
  repoTemplates:[
    'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@{ref}/{path}',
    'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/{ref}/{path}',
    'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/{ref}/{path}'
  ],
  defaultRelease:{
    schema:1,id:'yeshe-test',name:'夜社短剧',channel:'test',version:'0.1.0-test.2',build:10102,
    ref:'1d6f6df60ed451942f3fc394ac2ac4795442eb9f',
    modules:[
      {name:'protocol',path:'apps/video/yeshe/releases/0.1.0-test.2/protocol.js'},
      {name:'provider',path:'apps/video/yeshe/releases/0.1.0-test.1/provider.js'},
      {name:'playback',path:'apps/video/yeshe/releases/0.1.0-test.1/playback.js'},
      {name:'runtime',path:'apps/video/yeshe/releases/0.1.0-test.2/runtime.js'}
    ],
    verify:{global:'YesheRemoteRuntime',property:'version',equals:'0.1.0-test.2'}
  }
};
var YesheBoot={
  manager:function(){
    if(typeof HikerCloudRemote==='object'&&String(HikerCloudRemote.version||'')==='2.0.4')return HikerCloudRemote;
    var urls=[
      'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/libs/updater/v2.0.4/remote_manager.js?v=204',
      'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/libs/updater/v2.0.4/remote_manager.js?v=204',
      'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/v2.0.4/remote_manager.js?v=204'
    ],last='',i;
    for(i=0;i<urls.length;i++)try{require(urls[i],{headers:{'Cache-Control':'no-cache'}},204);if(typeof HikerCloudRemote==='object')return HikerCloudRemote;}catch(e){last=String(e.message||e);}
    throw new Error('夜社远程模块管理器加载失败：'+last);
  },
  loadOnly:function(){return this.manager().load(YESHE_BOOT_CONFIG);},
  module:function(){this.loadOnly();return YesheRemoteRuntime.module();},
  info:function(){return this.manager().info(YESHE_BOOT_CONFIG);},
  check:function(){return this.manager().check(YESHE_BOOT_CONFIG);},
  update:function(){return this.manager().update(YESHE_BOOT_CONFIG);},
  rollback:function(){return this.manager().rollback(YESHE_BOOT_CONFIG);},
  reinstall:function(){return this.manager().reinstall(YESHE_BOOT_CONFIG);}
};