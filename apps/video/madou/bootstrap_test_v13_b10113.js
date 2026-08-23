/* 麻豆传媒 Remote Test Bootstrap 0.1.0-test.13 - immutable direct loader */
var MADOU_BOOT_CONFIG={
  id:'madou-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.13',build:10113,
  modules:[
    {name:'core',path:'apps/video/madou/releases/0.1.0-test.1/core.js'},
    {name:'runtime',path:'apps/video/madou/releases/0.1.0-test.1/runtime.js'},
    {name:'performanceRuntime',path:'apps/video/madou/releases/0.1.0-test.10/performance_runtime.js'},
    {name:'storageRescue',path:'apps/video/madou/releases/0.1.0-test.12/storage_rescue.js'},
    {name:'defaultDetailPlayback',path:'apps/video/madou/releases/0.1.0-test.13/default_detail_playback.js'}
  ]
};
var MadouBoot={
  loadOnly:function(){
    var root=MADOU_BOOT_CONFIG.repoRawRoot+MADOU_BOOT_CONFIG.branch+'/',i,m,url,loaded=[];
    for(i=0;i<MADOU_BOOT_CONFIG.modules.length;i++){
      m=MADOU_BOOT_CONFIG.modules[i];
      url=root+m.path+'?madou_release=0.1.0-test.13';
      require(url,{headers:{'Cache-Control':'no-cache'}},10113);
      loaded.push({name:m.name,url:url});
    }
    if(typeof MadouRemoteRuntime==='undefined'||String(MadouRemoteRuntime.version)!=='0.1.0-test.13')throw new Error('麻豆传媒 Test13 运行时校验失败');
    return{ok:true,release:{id:'madou-test',version:'0.1.0-test.13',build:10113},loaded:loaded,rescueMode:true};
  },
  module:function(){this.loadOnly();return MadouRemoteRuntime.module();},
  info:function(){return{managerVersion:'direct-loader',current:{id:'madou-test',version:'0.1.0-test.13',build:10113},rescueMode:true,note:'Test13 direct immutable loader; no Remote Manager setItem state'};},
  check:function(){return{ok:true,current:{id:'madou-test',version:'0.1.0-test.13',build:10113},hasUpdate:false,rescueMode:true};},
  update:function(){return{ok:false,changed:false,error:'当前为直接加载测试版，请从我的规则仓库同步并覆盖新版本'};},
  rollback:function(){return{ok:false,error:'当前为直接加载测试版；回退请从云仓覆盖旧版本'};},
  reinstall:function(){return this.loadOnly();}
};