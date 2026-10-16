/* PikPak Test27 Build10129 - playback controls, history and diagnostics exports. */
(function(C,Play,Pages,R){
    var prev=R.module;
    R.version='0.1.0-test.27';R.build=10129;
    R.module=function(){
        var m=prev();
        m.version='0.1.0-test.27';m.build=10129;
        m.playHistory=Pages.playHistory;
        m.playDiagnostics=Pages.playDiagnostics;
        m.setPlaybackStartupAction=function(v){
            C.set('playback_startup_mode',String(v||'').indexOf('均衡')===0?'balanced':'official');
            toast(C.item('playback_startup_mode','official')==='balanced'?'已启用均衡画质优先（可随时切回）':'已恢复官方线路原始顺序');
            refreshPage(false);return 'hiker://empty';
        };
        m.setFreshLinkAction=function(v){
            C.set('playback_force_fresh',String(v||'').indexOf('开启')===0?'on':'off');
            toast(C.item('playback_force_fresh','off')==='on'?'播放时将重新向云盘取链':'已恢复默认短时播放详情缓存');
            refreshPage(false);return 'hiker://empty';
        };
        m.clearPlayHistoryAction=function(){Play.clearPlayHistory();toast('本机播放记录已清空');refreshPage(false);return 'hiker://empty';};
        return m;
    };
})(PikPakCore,PikPakPlayback,PikPakPages,PikPakRemoteRuntime);
