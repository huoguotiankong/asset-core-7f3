/* ACFAN Remote Test Bootstrap 0.1.0-test.4 */
var ACFAN_BOOT_CONFIG={id:'acfan-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.4',build:10104,modules:[
{name:'core',path:'apps/video/acfan/releases/0.1.0-test.1/core.js'},
{name:'protocol',path:'apps/video/acfan/releases/0.1.0-test.1/protocol.js'},
{name:'provider-t4',path:'apps/video/acfan/releases/0.1.0-test.4/provider_v4.js'},
{name:'image-t4',path:'apps/video/acfan/releases/0.1.0-test.4/image_v4.js'},
{name:'playback-t4',path:'apps/video/acfan/releases/0.1.0-test.4/playback_v4.js'},
{name:'ui-t4',path:'apps/video/acfan/releases/0.1.0-test.4/ui_v4.js'},
{name:'pages-t4',path:'apps/video/acfan/releases/0.1.0-test.4/pages_v4.js'},
{name:'runtime',path:'apps/video/acfan/releases/0.1.0-test.4/runtime.js'}]};
var ACFANBoot={loadOnly:function(){var root=ACFAN_BOOT_CONFIG.repoRawRoot+ACFAN_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;for(i=0;i<ACFAN_BOOT_CONFIG.modules.length;i++){m=ACFAN_BOOT_CONFIG.modules[i];url=root+m.path+'?acfan_release=0.1.0-test.4';require(url,{headers:{'Cache-Control':'no-cache'}},10104);loaded.push({name:m.name,url:url});}if(typeof ACFANRuntime==='undefined'||String(ACFANRuntime.version)!=='0.1.0-test.4')throw new Error('ACFAN Test4 运行时校验失败');return{ok:true,release:{id:'acfan-test',version:'0.1.0-test.4',build:10104},loaded:loaded};},module:function(){this.loadOnly();return ACFANRuntime.module();},info:function(){return{managerVersion:'direct-loader',current:{id:'acfan-test',version:'0.1.0-test.4',build:10104}};},reinstall:function(){return this.loadOnly();}};
