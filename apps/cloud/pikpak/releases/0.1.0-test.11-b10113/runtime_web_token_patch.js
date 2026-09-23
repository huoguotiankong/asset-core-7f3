/* PikPak Test11 Build10113 Runtime - Web token handoff */
(function(C,Pages,R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.11';m.build=10113;
        m.account=Pages.account;m.webLogin=Pages.webLogin;m.webDone=Pages.webDone;
        m.importWebRefreshToken=function(token){token=String(token||'').replace(/^\s+|\s+$/g,'');if(!token)return 'toast://Web Refresh Token 不能为空';showLoading('正在恢复 PikPak Web 会话…');var r=C.importWebCredential({refresh_token:token});hideLoading();if(r&&!r.error&&!r.error_code&&r.access_token){toast('PikPak Web 会话恢复成功');try{refreshPage(false);}catch(e){try{refreshPage();}catch(e2){}}return 'hiker://empty';}C.clearSession();return 'toast://'+C.errorText(r);};
        return m;
    };
    R.version='0.1.0-test.11';R.build=10113;
})(PikPakCore,PikPakPages,PikPakRemoteRuntime);
