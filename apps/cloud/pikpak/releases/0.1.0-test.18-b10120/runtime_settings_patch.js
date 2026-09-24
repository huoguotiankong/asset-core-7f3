/* PikPak Test18 Build10120 - image/cleanup settings runtime */
(function(C,P,R){
    var baseModule=R.module;
    function clearHandoff(){try{clearMyVar('pikpak_v3_temp_origin');clearMyVar('pikpak_v3_handoff_session');}catch(e){}}
    R.module=function(){
        var m=baseModule(),baseCleanup=m.cleanupHandoffSessionAction;
        m.setHandoffCleanupAction=function(v){var on=String(v||'')!=='关闭';C.set('handoff_auto_trash',on?'on':'off');toast(on?'已开启：退出调用页后自动移入回收站':'已关闭：退出调用页后保留 My Pack 文件');refreshPage();return 'hiker://empty';};
        m.cleanupHandoffSessionAction=function(session){if(!P.handoffAutoTrashEnabled()){clearHandoff();return {ok:true,skipped:true,reason:'handoff-auto-trash-disabled'};}return baseCleanup(session);};
        return m;
    };
})(PikPakCore,PikPakProvider,PikPakRemoteRuntime);

