/* PikPak Remote Test Bootstrap 0.1.0-test.3 - immutable direct loader */
var PIKPAK_BOOT_CONFIG={id:'pikpak-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.3',build:10103,modules:[
{name:'core',path:'apps/cloud/pikpak/releases/0.1.0-test.3/core.js'},
{name:'provider',path:'apps/cloud/pikpak/releases/0.1.0-test.1/provider.js'},
{name:'playback',path:'apps/cloud/pikpak/releases/0.1.0-test.1/playback.js'},
{name:'ui',path:'apps/cloud/pikpak/releases/0.1.0-test.1/ui.js'},
{name:'pages-base',path:'apps/cloud/pikpak/releases/0.1.0-test.1/pages.js'},
{name:'pages-patch',path:'apps/cloud/pikpak/releases/0.1.0-test.3/pages_patch.js'},
{name:'runtime-base',path:'apps/cloud/pikpak/releases/0.1.0-test.1/runtime.js'},
{name:'runtime-patch',path:'apps/cloud/pikpak/releases/0.1.0-test.3/runtime_patch.js'}]};
var PikPakBoot={
loadOnly:function(){
    var root=PIKPAK_BOOT_CONFIG.repoRawRoot+PIKPAK_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;
    for(i=0;i<PIKPAK_BOOT_CONFIG.modules.length;i++){
        m=PIKPAK_BOOT_CONFIG.modules[i];
        url=root+m.path+'?pikpak_release=0.1.0-test.3';
        require(url,{headers:{'Cache-Control':'no-cache'}},10103);
        loaded.push({name:m.name,url:url});
    }
    if(typeof PikPakRemoteRuntime==='undefined'||String(PikPakRemoteRuntime.version)!=='0.1.0-test.3'||Number(PikPakRemoteRuntime.build)!==10103)throw new Error('PikPak Test3 运行时校验失败');
    return {ok:true,release:{id:'pikpak-test',version:'0.1.0-test.3',build:10103},loaded:loaded};
},
module:function(){this.loadOnly();return PikPakRemoteRuntime.module();},
info:function(){return {managerVersion:'direct-loader',current:{id:'pikpak-test',version:'0.1.0-test.3',build:10103}};},
check:function(){return {ok:true,current:{id:'pikpak-test',version:'0.1.0-test.3',build:10103},hasUpdate:false};},
update:function(){return {ok:false,changed:false,error:'测试版采用完整导入口令覆盖更新'};},
rollback:function(){return {ok:false,error:'需要时覆盖导入上一版本'};},
reinstall:function(){return this.loadOnly();}
};