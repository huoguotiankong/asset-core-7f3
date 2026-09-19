/* ACFAN Remote Test Bootstrap 0.1.0-test.3 */
var ACFAN_BOOT_CONFIG={id:'acfan-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.3',build:10103,modules:[
{name:'core',path:'apps/video/acfan/releases/0.1.0-test.1/core.js'},
{name:'protocol',path:'apps/video/acfan/releases/0.1.0-test.1/protocol.js'},
{name:'provider-t3',path:'apps/video/acfan/releases/0.1.0-test.3/provider_v3.js'},
{name:'image-t3',path:'apps/video/acfan/releases/0.1.0-test.3/image_v3.js'},
{name:'playback-t3',path:'apps/video/acfan/releases/0.1.0-test.3/playback_v3.js'},
{name:'ui-t3',path:'apps/video/acfan/releases/0.1.0-test.3/ui_v3.js'},
{name:'pages-t3',path:'apps/video/acfan/releases/0.1.0-test.3/pages_v3.js'},
{name:'runtime',path:'apps/video/acfan/releases/0.1.0-test.3/runtime.js'}]};
var ACFANBoot={loadOnly:function(){var root=ACFAN_BOOT_CONFIG.repoRawRoot+ACFAN_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;for(i=0;i<ACFAN_BOOT_CONFIG.modules.length;i++){m=ACFAN_BOOT_CONFIG.modules[i];url=root+m.path+'?acfan_release=0.1.0-test.3';require(url,{headers:{'Cache-Control':'no-cache'}},10103);loaded.push({name:m.name,url:url});}if(typeof ACFANRuntime==='undefined'||String(ACFANRuntime.version)!=='0.1.0-test.3')throw new Error('ACFAN Test3 运行时校验失败');return{ok:true,release:{id:'acfan-test',version:'0.1.0-test.3',build:10103},loaded:loaded};},module:function(){this.loadOnly();return ACFANRuntime.module();},info:function(){return{managerVersion:'direct-loader',current:{id:'acfan-test',version:'0.1.0-test.3',build:10103}};},reinstall:function(){return this.loadOnly();}};
