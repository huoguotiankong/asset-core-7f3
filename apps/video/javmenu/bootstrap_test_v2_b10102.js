/* JavMenu Remote Test Bootstrap 0.1.0-test.2 - CDN direct immutable loader */
var JAVMENU_BOOT_CONFIG={
  id:'javmenu-test',version:'0.1.0-test.2',build:10102,
  repoCdnRoot:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/',
  release:'apps/video/javmenu/releases/0.1.0-test.2/release.json',
  modules:[
    {name:'core',path:'apps/video/javmenu/releases/0.1.0-test.2/core.js'},
    {name:'playback',path:'apps/video/javmenu/releases/0.1.0-test.2/playback_adapter.js'},
    {name:'runtime',path:'apps/video/javmenu/releases/0.1.0-test.2/runtime.js'}
  ]
};
var JavMenuBoot={
  loadOnly:function(){
    var root=JAVMENU_BOOT_CONFIG.repoCdnRoot,i,m,url,loaded=[];
    for(i=0;i<JAVMENU_BOOT_CONFIG.modules.length;i++){
      m=JAVMENU_BOOT_CONFIG.modules[i];url=root+m.path+'?jm_release=10102&module='+i;
      require(url,{headers:{'Cache-Control':'no-cache'}},10102);loaded.push({name:m.name,url:url});
    }
    if(typeof JavMenuCore==='undefined'||String(JavMenuCore.version)!=='0.1.0-test.2'||Number(JavMenuCore.build)!==10102)throw new Error('JavMenu Test2 Core 校验失败');
    if(typeof JavMenuPlayback==='undefined'||String(JavMenuPlayback.version)!=='0.1.0-test.2'||Number(JavMenuPlayback.build)!==10102)throw new Error('JavMenu Test2 Playback 校验失败');
    if(typeof JavMenuRuntime==='undefined'||String(JavMenuRuntime.version)!=='0.1.0-test.2'||Number(JavMenuRuntime.build)!==10102)throw new Error('JavMenu Test2 Runtime 校验失败');
    return{ok:true,release:{id:'javmenu-test',version:'0.1.0-test.2',build:10102},loaded:loaded,transport:'jsdelivr'};
  },
  module:function(){this.loadOnly();return JavMenuRuntime;},
  info:function(){return{managerVersion:'direct-loader-cdn',current:{id:'javmenu-test',version:'0.1.0-test.2',build:10102},transport:'jsdelivr'};},
  check:function(){return{ok:true,current:{id:'javmenu-test',version:'0.1.0-test.2',build:10102},hasUpdate:false};},
  update:function(){return{ok:false,changed:false,error:'Test2 使用 CDN 直接不可变加载；请从“我的规则仓库”覆盖新测试版'};},
  rollback:function(){return{ok:false,error:'JavMenu 尚无 Stable；如需回退请从云仓重新导入 Test1 工件'};},
  reinstall:function(){return this.loadOnly();}
};
