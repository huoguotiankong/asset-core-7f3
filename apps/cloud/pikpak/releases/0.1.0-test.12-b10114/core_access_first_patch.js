/* PikPak Test12 Build10114 - access-token-first official Web handoff */
(function(C){
    var oldImport=C.importWebCredential;
    function trim(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
    function normalizeDid(v){
        v=trim(v);var m=v.match(/[0-9a-f]{32}/i);if(m)return m[0].toLowerCase();
        v=trim(C.item('device_id_web',''));if(/^[0-9a-f]{32}$/i.test(v))return v.toLowerCase();
        v=md5('pikpak-web|'+String(new Date().getTime())+'|'+String(Math.random()));
        C.set('device_id_web',v);return v;
    }
    C.importWebCredential=function(o){
        o=o||{};
        var access=trim(o.access_token||o.accessToken||''),refresh=trim(o.refresh_token||o.refreshToken||''),sub=trim(o.sub||o.user_id||o.userId||''),cap=trim(o.captcha_token||o.captchaToken||''),d=normalizeDid(o.device_id||o.deviceId||'');
        if(access){
            var seed={access_token:access,_auth_profile:'web',_device_id:d};
            if(refresh)seed.refresh_token=refresh;
            if(sub)seed.sub=sub;
            if(o.token_type)seed.token_type=o.token_type;
            if(o.expires_in)seed.expires_in=o.expires_in;
            if(cap)C.set('captcha_token',cap);
            C.saveSession(seed,C.webAuthProfile||{name:'web'},d);
            C.set('auth_profile','web');C.set('device_id_web',d);
            return seed;
        }
        return oldImport(o);
    };
})(PikPakCore);
