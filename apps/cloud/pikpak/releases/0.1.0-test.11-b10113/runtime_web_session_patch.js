/* PikPak Test11 Build10113 - official web session runtime */
(function(C,Pages,R){
    var baseModule=R.module;
    function clean(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
    function routeError(r,fallback){return 'toast://'+(C.errorText(r)||fallback||'操作失败');}
    function importRefreshToken(token){
        token=clean(token);if(!token)return 'toast://Refresh Token 不能为空';
        try{C.clearSession();}catch(e){}
        C.saveWebSession({refresh_token:token});
        showLoading('正在恢复 PikPak Web 会话…');var r=C.refreshAccess();hideLoading();
        if(r&&!r.error&&!r.error_code&&r.access_token){toast('PikPak Web 会话恢复成功');try{refreshPage(false);}catch(e2){try{refreshPage();}catch(e3){}}return 'hiker://empty';}
        C.clearSession();return routeError(r,'Web Refresh Token 无效或已过期');
    }
    function refreshSessionAction(){
        showLoading('正在刷新 PikPak Web 会话…');var r=C.refreshAccess();hideLoading();
        if(r&&!r.error&&!r.error_code&&r.access_token){toast('登录状态已刷新');try{refreshPage(false);}catch(e){try{refreshPage();}catch(e2){}}return 'hiker://empty';}
        return routeError(r,'登录状态刷新失败');
    }
    function webLoginDone(){
        var access='',refresh='',sub='',tokenType='Bearer',expires='';
        try{access=clean(getParam('access_token',''));refresh=clean(getParam('refresh_token',''));sub=clean(getParam('sub',''));tokenType=clean(getParam('token_type','Bearer'))||'Bearer';expires=clean(getParam('expires_in',''));}catch(e){}
        if(!access&&!refresh){setResult([{title:'没有检测到网页登录凭据',desc:'请返回官方网页登录页，确认已经登录成功并进入 PikPak 文件页。',url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);return;}
        try{C.clearSession();}catch(e2){}
        var data={access_token:access,refresh_token:refresh,sub:sub,token_type:tokenType};if(expires)data.expires_in=expires;
        var s=C.importWebCredentials(data);
        if(s&&s.error){setResult([{title:'网页登录凭据读取失败',desc:C.errorText(s),url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);return;}
        if(!access&&refresh){showLoading('正在用官方 Refresh Token 恢复 API 会话…');var rr=C.refreshAccess();hideLoading();if(!rr||rr.error||rr.error_code||!rr.access_token){C.clearSession();setResult([{title:'官方网页登录成功，但 API 会话恢复失败',desc:C.errorText(rr),url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);return;}}
        try{clearMyVar('pikpak_v2_login_pass');clearMyVar('pikpak_v2_verify_url');clearMyVar('pikpak_v2_verify_token');clearMyVar('pikpak_v2_verified_captcha');}catch(e3){}
        setResult([{title:'✅ PikPak 登录成功',desc:access?'已直接接入 PikPak 官方网页当前 Access Token，并保存 Refresh Token 供后续自动刷新。':'已使用官方网页 Refresh Token 恢复 API 会话。',url:'hiker://home@PikPak',col_type:'text_center_1',extra:{lineVisible:false}},{title:'返回 PikPak 首页',url:'hiker://home@PikPak',col_type:'text_center_1'}]);
    }
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.11';m.build=10113;
        m.account=Pages.account;m.settings=Pages.settings;m.webLogin=Pages.webLogin;m.webLoginDone=webLoginDone;
        m.importRefreshToken=importRefreshToken;m.refreshSessionAction=refreshSessionAction;
        return m;
    };
    R.version='0.1.0-test.11';R.build=10113;
})(PikPakCore,PikPakPages,PikPakRemoteRuntime);
