/* PikPak 0.1.0-test.9 Core Patch - current txCaptcha signin verification contract */
(function(C){
    function reviewUrl(r){
        r=r||{};
        var existing=String(r.verify_url||'');
        if(/\/captcha\/v2\/txCaptcha\.html/i.test(existing))return existing;
        var token=String(r.captcha_token||(r.raw&&r.raw.captcha_token)||C.item('captcha_token','')||'');
        if(!token)return existing;
        var did=String(r.device_id||C.item('device_id_web','')||C.getDeviceId()||'');
        var host='user.mypikpak.net';
        return 'https://'+host+'/captcha/v2/txCaptcha.html'
            +'?action='+encodeURIComponent('POST:/v1/auth/signin')
            +'&appName=NONE&appid=XBASE'
            +'&captcha_token='+encodeURIComponent(token)
            +'&clientVersion=NONE'
            +'&client_id='+encodeURIComponent(C.clientId)
            +'&creditkey='+encodeURIComponent(token)
            +'&credittype=1'
            +'&device_id='+encodeURIComponent(did)
            +'&deviceid='+encodeURIComponent(did)
            +'&event=signin_check'
            +'&platformVersion=NONE&privateStyle='
            +'&redirect_uri='+encodeURIComponent('xlaccsdk01://xbase.cloud/callback?state=harbor');
    }
    function ensure(r){
        if(r&&r.needsVerification)r.verify_url=reviewUrl(r);
        return r;
    }
    var baseBegin=C.beginPasswordLogin,baseReload=C.refreshPasswordChallenge;
    C.beginPasswordLogin=function(user,pass){return ensure(baseBegin(user,pass));};
    C.login=C.beginPasswordLogin;
    C.refreshPasswordChallenge=function(user,pass,oldToken){return ensure(baseReload(user,pass,oldToken));};
    C.buildPasswordReviewUrl=reviewUrl;
})(PikPakCore);
