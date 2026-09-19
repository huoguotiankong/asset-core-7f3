/* ACFAN Remote Test Bootstrap 0.1.0-test.1 - immutable modular direct loader */
var ACFAN_BOOT_CONFIG={id:'acfan-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.1',build:10101,modules:[
{name:'core',path:'apps/video/acfan/releases/0.1.0-test.1/core.js'},
{name:'protocol',path:'apps/video/acfan/releases/0.1.0-test.1/protocol.js'},
{name:'provider',path:'apps/video/acfan/releases/0.1.0-test.1/provider.js'},
{name:'image',path:'apps/video/acfan/releases/0.1.0-test.1/image.js'},
{name:'playback',path:'apps/video/acfan/releases/0.1.0-test.1/playback.js'},
{name:'ui',path:'apps/video/acfan/releases/0.1.0-test.1/ui.js'},
{name:'pages',path:'apps/video/acfan/releases/0.1.0-test.1/pages.js'},
{name:'runtime',path:'apps/video/acfan/releases/0.1.0-test.1/runtime.js'}]};
var ACFANBoot={loadOnly:function(){var root=ACFAN_BOOT_CONFIG.repoRawRoot+ACFAN_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;for(i=0;i<ACFAN_BOOT_CONFIG.modules.length;i++){m=ACFAN_BOOT_CONFIG.modules[i];url=root+m.path+'?acfan_release=0.1.0-test.1';require(url,{headers:{'Cache-Control':'no-cache'}},10101);loaded.push({name:m.name,url:url});}if(typeof ACFANRuntime==='undefined'||String(ACFANRuntime.version)!=='0.1.0-test.1')throw new Error('ACFAN Test1 运行时校验失败');return{ok:true,release:{id:'acfan-test',version:'0.1.0-test.1',build:10101},loaded:loaded};},module:function(){this.loadOnly();return ACFANRuntime.module();},info:function(){return{managerVersion:'direct-loader',current:{id:'acfan-test',version:'0.1.0-test.1',build:10101}};},reinstall:function(){return this.loadOnly();}};
