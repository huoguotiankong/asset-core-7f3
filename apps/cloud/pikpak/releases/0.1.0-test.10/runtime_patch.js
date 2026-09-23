/* PikPak 0.1.0-test.10 Runtime Patch - official web refresh-token login */
(function(C,Pages,R){
    var baseModule=R.module;
    function webLoginDone(){
        var token='';try{token=String(getParam('refresh_token','')||'');}catch(e){}
        if(!token){setResult([{title:'没有检测到 Refresh Token',desc:'请返回官方网页登录页，确认已经成功登录并进入 PikPak 文件页。',url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);return;}
        try{C.clearSession();}catch(e2){}
        C.saveSession({refresh_token:token,_auth_profile:'web'});
        showLoading('正在接入 PikPak 会话…');var r=C.refreshAccess();hideLoading();
        if(r&&!r.error&&!r.error_code&&r.access_token){
            try{clearMyVar('pikpak_v2_login_pass');clearMyVar('pikpak_v2_verify_url');clearMyVar('pikpak_v2_verify_token');clearMyVar('pikpak_v2_verified_captcha');}catch(e3){}
            setResult([{title:'✅ PikPak 登录成功',desc:'已从 PikPak 官方网页安全接入 Web Refresh Token，会话已保存。后续 Access Token 将由小程序自动刷新。',url:'hiker://home@PikPak',col_type:'text_center_1',extra:{lineVisible:false}},{title:'返回 PikPak 首页',url:'hiker://home@PikPak',col_type:'text_center_1'}]);
            return;
        }
        C.clearSession();
        setResult([{title:'官方网页登录已完成，但 API 会话恢复失败',desc:C.errorText(r),url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);
    }
    R.module=function(){var m=baseModule();m.version='0.1.0-test.10';m.build=10110;m.account=Pages.account;m.webLogin=Pages.webLogin;m.webLoginDone=webLoginDone;return m;};
    R.version='0.1.0-test.10';R.build=10110;
})(PikPakCore,PikPakPages,PikPakRemoteRuntime);
