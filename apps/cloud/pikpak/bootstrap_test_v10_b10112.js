/* PikPak Remote Test Bootstrap 0.1.0-test.10 Build10112 - clean Android auth */
var PIKPAK_BOOT_CONFIG={id:'pikpak-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.10',build:10112,modules:[
{name:"core-base",path:"apps/cloud/pikpak/releases/0.1.0-test.3/core.js"},
{name:"core-test10-current-android-auth",path:"apps/cloud/pikpak/releases/0.1.0-test.10-b10112/core_android_patch.js"},
{name:"core-test10-android-migration",path:"apps/cloud/pikpak/releases/0.1.0-test.10-b10112/auth_migration_patch.js"},
{name:"provider",path:"apps/cloud/pikpak/releases/0.1.0-test.1/provider.js"},
{name:"provider-test5-safe-cleanup",path:"apps/cloud/pikpak/releases/0.1.0-test.5/provider_patch.js"},
{name:"provider-test6-handoff",path:"apps/cloud/pikpak/releases/0.1.0-test.6/provider_patch.js"},
{name:"playback",path:"apps/cloud/pikpak/releases/0.1.0-test.1/playback.js"},
{name:"ui",path:"apps/cloud/pikpak/releases/0.1.0-test.1/ui.js"},
{name:"pages-base",path:"apps/cloud/pikpak/releases/0.1.0-test.1/pages.js"},
{name:"pages-test5-verification-runtime-contract",path:"apps/cloud/pikpak/releases/0.1.0-test.5/pages_patch.js"},
{name:"pages-test7-cleanup-semantics",path:"apps/cloud/pikpak/releases/0.1.0-test.7/pages_patch.js"},
{name:"pages-test10-android-auth",path:"apps/cloud/pikpak/releases/0.1.0-test.10-b10112/pages_android_patch.js"},
{name:"runtime-base",path:"apps/cloud/pikpak/releases/0.1.0-test.1/runtime.js"},
{name:"runtime-test5-verification",path:"apps/cloud/pikpak/releases/0.1.0-test.5/runtime_patch.js"},
{name:"runtime-test6-handoff",path:"apps/cloud/pikpak/releases/0.1.0-test.6/runtime_patch.js"},
{name:"runtime-test10-android-auth",path:"apps/cloud/pikpak/releases/0.1.0-test.10-b10112/runtime_android_patch.js"}
]};
var PikPakBoot={
loadOnly:function(){
    var root=PIKPAK_BOOT_CONFIG.repoRawRoot+PIKPAK_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;
    for(i=0;i<PIKPAK_BOOT_CONFIG.modules.length;i++){
        m=PIKPAK_BOOT_CONFIG.modules[i];url=root+m.path+'?pikpak_release=0.1.0-test.10-b10112';
        require(url,{headers:{'Cache-Control':'no-cache'}},10112);loaded.push({name:m.name,url:url});
    }
    if(typeof PikPakRemoteRuntime==='undefined'||String(PikPakRemoteRuntime.version)!=='0.1.0-test.10'||Number(PikPakRemoteRuntime.build)!==10112)throw new Error('PikPak Test10 Build10112 运行时校验失败');
    return {ok:true,release:{id:'pikpak-test',version:'0.1.0-test.10',build:10112,variant:'android-auth-clean'},loaded:loaded};
},
module:function(){this.loadOnly();return PikPakRemoteRuntime.module();},
info:function(){return {managerVersion:'direct-loader',current:{id:'pikpak-test',version:'0.1.0-test.10',build:10112,variant:'android-auth-clean'}};},
check:function(){return {ok:true,current:{id:'pikpak-test',version:'0.1.0-test.10',build:10112,variant:'android-auth-clean'},hasUpdate:false};},
update:function(){return {ok:false,changed:false,error:'测试版采用完整导入口令覆盖更新'};},
rollback:function(){return {ok:false,error:'需要时覆盖导入上一版本'};},
reinstall:function(){return this.loadOnly();}
};
