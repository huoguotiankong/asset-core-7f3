/* 黄果短剧 Remote Test Bootstrap 0.1.0-test.1 - immutable direct loader */
var HUANGGUO_BOOT_CONFIG={
  id:'huangguo-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.1',build:10101,
  modules:[
    {name:'core',path:'apps/video/huangguo/releases/0.1.0-test.1/core.js'},
    {name:'provider',path:'apps/video/huangguo/releases/0.1.0-test.1/provider.js'},
    {name:'image',path:'apps/video/huangguo/releases/0.1.0-test.1/image.js'},
    {name:'playback',path:'apps/video/huangguo/releases/0.1.0-test.1/playback.js'},
    {name:'ui',path:'apps/video/huangguo/releases/0.1.0-test.1/ui.js'},
    {name:'pages',path:'apps/video/huangguo/releases/0.1.0-test.1/pages.js'},
    {name:'runtime',path:'apps/video/huangguo/releases/0.1.0-test.1/runtime.js'}
  ]
};
var HuangGuoBoot={
  loadOnly:function(){
    var root=HUANGGUO_BOOT_CONFIG.repoRawRoot+HUANGGUO_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;
    for(i=0;i<HUANGGUO_BOOT_CONFIG.modules.length;i++){
      m=HUANGGUO_BOOT_CONFIG.modules[i];url=root+m.path+'?huangguo_release=0.1.0-test.1';
      require(url,{headers:{'Cache-Control':'no-cache'}},10101);loaded.push({name:m.name,url:url});
    }
    if(typeof HuangGuoRemoteRuntime==='undefined'||String(HuangGuoRemoteRuntime.version)!=='0.1.0-test.1')throw new Error('黄果短剧 Test1 运行时校验失败');
    return{ok:true,release:{id:'huangguo-test',version:'0.1.0-test.1',build:10101},loaded:loaded};
  },
  module:function(){this.loadOnly();return HuangGuoRemoteRuntime.module();},
  info:function(){return{managerVersion:'direct-loader',current:{id:'huangguo-test',version:'0.1.0-test.1',build:10101}};},
  check:function(){return{ok:true,current:{id:'huangguo-test',version:'0.1.0-test.1',build:10101},hasUpdate:false};},
  update:function(){return{ok:false,changed:false,error:'当前为首版测试通道，请从我的规则仓库覆盖新测试版'};},
  rollback:function(){return{ok:false,error:'当前无更早黄果短剧测试版'};},
  reinstall:function(){return this.loadOnly();}
};
