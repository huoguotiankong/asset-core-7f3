/* PikPak Test10 Android Runtime identity */
(function(C,R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.10';m.build=10111;
        m.importRefreshToken=function(token){
            token=String(token||'').replace(/^\s+|\s+$/g,'');
            if(!token)return 'toast://Refresh Token 不能为空';
            C.saveSession({refresh_token:token},{name:'legacy'},C.getDeviceId());
            showLoading('正在按 Android 认证档恢复会话…');var r=C.refreshAccess();hideLoading();
            if(r&&!r.error&&!r.error_code&&r.access_token){toast('Android 会话恢复成功');try{refreshPage(false);}catch(e){refreshPage();}return 'hiker://empty';}
            C.clearSession();return 'toast://'+C.errorText(r);
        };
        return m;
    };
    R.version='0.1.0-test.10';R.build=10111;
})(PikPakCore,PikPakRemoteRuntime);
