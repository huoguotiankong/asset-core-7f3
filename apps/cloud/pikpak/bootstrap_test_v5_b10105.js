/* PikPak Remote Test Bootstrap 0.1.0-test.5 - immutable direct loader */
var PIKPAK_BOOT_CONFIG={id:'pikpak-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.5',build:10105,modules:[
{name:'core-base',path:'apps/cloud/pikpak/releases/0.1.0-test.3/core.js'},
{name:'core-test4-patch',path:'apps/cloud/pikpak/releases/0.1.0-test.4/core_patch.js'},
{name:'core-test5-fix',path:'apps/cloud/pikpak/releases/0.1.0-test.5/core_fix.js'},
{name:'provider',path:'apps/cloud/pikpak/releases/0.1.0-test.1/provider.js'},
{name:'provider-test5-safe-cleanup',path:'apps/cloud/pikpak/releases/0.1.0-test.5/provider_patch.js'},
{name:'playback',path:'apps/cloud/pikpak/releases/0.1.0-test.1/playback.js'},
{name:'ui',path:'apps/cloud/pikpak/releases/0.1.0-test.1/ui.js'},
{name:'pages-base',path:'apps/cloud/pikpak/releases/0.1.0-test.1/pages.js'},
{name:'pages-test5',path:'apps/cloud/pikpak/releases/0.1.0-test.5/pages_patch.js'},
{name:'runtime-base',path:'apps/cloud/pikpak/releases/0.1.0-test.1/runtime.js'},
{name:'runtime-test5',path:'apps/cloud/pikpak/releases/0.1.0-test.5/runtime_patch.js'}]};
var PikPakBoot={
loadOnly:function(){
    var root=PIKPAK_BOOT_CONFIG.repoRawRoot+PIKPAK_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;
    for(i=0;i<PIKPAK_BOOT_CONFIG.modules.length;i++){
        m=PIKPAK_BOOT_CONFIG.modules[i];
        url=root+m.path+'?pikpak_release=0.1.0-test.5';
        require(url,{headers:{'Cache-Control':'no-cache'}},10105);
        loaded.push({name:m.name,url:url});
    }
    if(typeof PikPakRemoteRuntime==='undefined'||String(PikPakRemoteRuntime.version)!=='0.1.0-test.5'||Number(PikPakRemoteRuntime.build)!==10105)throw new Error('PikPak Test5 运行时校验失败');
    return {ok:true,release:{id:'pikpak-test',version:'0.1.0-test.5',build:10105},loaded:loaded};
},
module:function(){this.loadOnly();return PikPakRemoteRuntime.module();},
info:function(){return {managerVersion:'direct-loader',current:{id:'pikpak-test',version:'0.1.0-test.5',build:10105}};},
check:function(){return {ok:true,current:{id:'pikpak-test',version:'0.1.0-test.5',build:10105},hasUpdate:false};},
update:function(){return {ok:false,changed:false,error:'测试版采用完整导入口令覆盖更新'};},
rollback:function(){return {ok:false,error:'需要时覆盖导入上一版本'};},
reinstall:function(){return this.loadOnly();}
};
