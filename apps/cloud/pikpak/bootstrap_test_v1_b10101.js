/* PikPak Remote Test Bootstrap 0.1.0-test.1 - immutable direct loader */
var PIKPAK_BOOT_CONFIG={id:'pikpak-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',version:'0.1.0-test.1',build:10101,modules:[
{name:'core',path:'apps/cloud/pikpak/releases/0.1.0-test.1/core.js'},
{name:'provider',path:'apps/cloud/pikpak/releases/0.1.0-test.1/provider.js'},
{name:'playback',path:'apps/cloud/pikpak/releases/0.1.0-test.1/playback.js'},
{name:'ui',path:'apps/cloud/pikpak/releases/0.1.0-test.1/ui.js'},
{name:'pages',path:'apps/cloud/pikpak/releases/0.1.0-test.1/pages.js'},
{name:'runtime',path:'apps/cloud/pikpak/releases/0.1.0-test.1/runtime.js'}]};
var PikPakBoot={
loadOnly:function(){
    var root=PIKPAK_BOOT_CONFIG.repoRawRoot+PIKPAK_BOOT_CONFIG.branch+'/',loaded=[],i,m,url;
    for(i=0;i<PIKPAK_BOOT_CONFIG.modules.length;i++){
        m=PIKPAK_BOOT_CONFIG.modules[i];
        url=root+m.path+'?pikpak_release=0.1.0-test.1';
        require(url,{headers:{'Cache-Control':'no-cache'}},10101);
        loaded.push({name:m.name,url:url});
    }
    if(typeof PikPakRemoteRuntime==='undefined'||String(PikPakRemoteRuntime.version)!=='0.1.0-test.1'||Number(PikPakRemoteRuntime.build)!==10101)throw new Error('PikPak Test1 运行时校验失败');
    return {ok:true,release:{id:'pikpak-test',version:'0.1.0-test.1',build:10101},loaded:loaded};
},
module:function(){this.loadOnly();return PikPakRemoteRuntime.module();},
info:function(){return {managerVersion:'direct-loader',current:{id:'pikpak-test',version:'0.1.0-test.1',build:10101}};},
check:function(){return {ok:true,current:{id:'pikpak-test',version:'0.1.0-test.1',build:10101},hasUpdate:false};},
update:function(){return {ok:false,changed:false,error:'测试版采用完整导入口令覆盖更新'};},
rollback:function(){return {ok:false,error:'需要时覆盖导入上一版本'};},
reinstall:function(){return this.loadOnly();}
};