/* PikPak 0.1.0-test.5 Core Fix - synthesize official review URL when API omits it */
(function(C){
    function reviewUrl(r){
        r=r||{};
        if(r.verify_url)return String(r.verify_url);
        if(r.raw&&r.raw.url)return String(r.raw.url);
        var token=String(r.captcha_token||(r.raw&&r.raw.captcha_token)||C.item('captcha_token','')||'');
        if(!token)return '';
        var did=String(r.device_id||C.item('device_id_web','')||C.getDeviceId()||''),host='user.'+C.domain();
        var action='POST:https://'+host+'/v1/auth/signin';
        return 'https://'+host+'/captcha/v2/spritePuzzle.html'
            +'?action='+encodeURIComponent(action)
            +'&appName=NONE&appid=XBASE'
            +'&captcha_token='+encodeURIComponent(token)
            +'&clientVersion=NONE'
            +'&client_id='+encodeURIComponent(C.clientId)
            +'&creditkey='+encodeURIComponent(token)
            +'&credittype=1'
            +'&device_id='+encodeURIComponent(did)
            +'&deviceid='+encodeURIComponent(did)
            +'&event=shield-captcha-init'
            +'&mainHost='+encodeURIComponent(host)
            +'&platformVersion=NONE&privateStyle=&traceid='
            +'&redirect_uri='+encodeURIComponent('https://mypikpak.com/loading')
            +'&state='+encodeURIComponent('getcaptcha'+String(new Date().getTime()));
    }
    function ensure(r){
        if(r&&r.needsVerification&&!r.verify_url)r.verify_url=reviewUrl(r);
        return r;
    }
    var baseBegin=C.beginPasswordLogin,baseReload=C.refreshPasswordChallenge;
    C.beginPasswordLogin=function(user,pass){return ensure(baseBegin(user,pass));};
    C.login=C.beginPasswordLogin;
    C.refreshPasswordChallenge=function(user,pass,oldToken){return ensure(baseReload(user,pass,oldToken));};
    C.buildPasswordReviewUrl=reviewUrl;
})(PikPakCore);
