/* PikPak Test26 Build10128 - verify official Web session before accepting handoff. */
(function(C){
    function clean(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
    function did(v){var m=clean(v).match(/[0-9a-f]{32}/i);if(m)return m[0].toLowerCase();var s=C.session()||{},n=clean(s._device_id||C.item('device_id_web',''));return /^[0-9a-f]{32}$/i.test(n)?n:C.getDeviceId();}
    function message(r){
        if(r&&r._network_error)return '无法连接 PikPak Drive API，请检查网络后重新检测';
        if(C.isAuthError(r))return '网页凭据存在，但 Drive API 拒绝授权：请在官方网页打开文件夹后重新同步';
        if(C.isCaptchaError(r))return 'Drive API 要求重新进行验证；请先在官方网页完成验证，不要重复登录';
        if(r&&(r.error||r.error_code))return 'Drive API 暂时拒绝访问（代码：'+String(r.error_code||r.error).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,30)+'）';
        return '未取得个人网盘的有效响应，请重新同步';
    }
    C.verifyWebAccess=function(credential){
        credential=credential||{};
        var token=clean(credential.access_token||credential.accessToken||''),d=did(credential.device_id||credential.deviceId||''),r;
        if(!token)return {ok:false,kind:'missing',message:'没有读取到官方网页 Access Token'};
        var h={'Authorization':'Bearer '+token,'X-Device-ID':d,'X-Client-ID':C.webAuthProfile.client_id,'X-Client-Version':C.webAuthProfile.client_version,'User-Agent':C.webAuthProfile.user_agent};
        var cap=clean(credential.captcha_token||credential.captchaToken||C.item('captcha_token',''));
        if(cap)h['X-Captcha-Token']=cap;
        r=C.raw('https://api-drive.mypikpak.com/drive/v1/about','GET',null,h,10000);
        if(r&&r._network_error)r=C.raw('https://api-drive.mypikpak.net/drive/v1/about','GET',null,h,10000);
        if(r&&!r.error&&!r.error_code&&r.quota)return {ok:true,kind:'verified',message:'官方 Web Session 已通过个人网盘 API 验证'};
        return {ok:false,kind:C.isAuthError(r)?'unauthorized':C.isCaptchaError(r)?'captcha':r&&r._network_error?'network':'api',message:message(r)};
    };
    C.webSessionDiagnostic=function(){
        var s=C.session()||{};
        if(!s.access_token)return {ok:false,kind:s.refresh_token?'refresh-only':'missing',message:s.refresh_token?'当前只有 Refresh Token，请从官方网页重新同步 Access Token':'小程序没有有效的 Web Session'};
        return C.verifyWebAccess(s);
    };
})(PikPakCore);
