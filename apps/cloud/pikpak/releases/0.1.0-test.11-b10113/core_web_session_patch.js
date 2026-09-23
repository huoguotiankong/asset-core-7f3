/* PikPak Test11 Build10113 - official web session auth */
(function(C){
    var W={
        name:'web',
        client_id:'YUMx5nI8ZU8Ap8pm',
        client_secret:'dbw2OtmVEeuUvIptb1Coygx',
        client_version:'2.0.0',
        package_name:'mypikpak.com',
        user_agent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Mobile Safari/537.36'
    };
    function trim(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
    function domain(){return C.item('api_domain','mypikpak.com')||'mypikpak.com';}
    function altDomain(d){return String(d||domain())==='mypikpak.net'?'mypikpak.com':'mypikpak.net';}
    function userBase(d){return 'https://user.'+(d||domain());}
    function requestUserRaw(path,method,body,headers,timeout){
        var first=domain(),r=C.raw(userBase(first)+path,method,body,headers,timeout||10000);
        if(r&&r._network_error)r=C.raw(userBase(altDomain(first))+path,method,body,headers,timeout||10000);
        return r;
    }
    function deviceId(){
        var s=C.session(),d=trim((s&&s._device_id)||C.item('device_id_web',''));
        if(d)return d;
        d=md5(String(new Date().getTime())+'|'+String(Math.random())+'|PikPak|web');
        C.set('device_id_web',d);return d;
    }
    function saveWebSession(data){
        data=data||{};
        var old=C.session()||{},did=trim(data._device_id||old._device_id||deviceId());
        if(!data.refresh_token&&old.refresh_token)data.refresh_token=old.refresh_token;
        if(!data.access_token&&old.access_token)data.access_token=old.access_token;
        if(!data.sub&&old.sub)data.sub=old.sub;
        data._auth_profile='web';data._device_id=did;
        C.set('auth_profile','web');C.set('device_id_web',did);
        C.saveSession(data,W,did);
        return data;
    }
    function importWebCredentials(obj){
        obj=obj||{};
        var access=trim(obj.access_token),refresh=trim(obj.refresh_token),sub=trim(obj.sub||obj.user_id||'');
        if(!access&&!refresh)return {error:'WEB_CREDENTIALS_EMPTY',error_description:'官方网页凭据中没有检测到 access_token 或 refresh_token'};
        return saveWebSession({access_token:access,refresh_token:refresh,sub:sub,token_type:obj.token_type||'Bearer',expires_in:obj.expires_in||0});
    }
    function refreshAccess(){
        var s=C.session()||{},rt=trim(s.refresh_token||C.item('refresh_token',''));
        if(!rt)return {error:'NO_REFRESH_TOKEN',error_description:'网页登录状态已失效，请重新通过 PikPak 官方网页登录'};
        var did=trim(s._device_id||C.item('device_id_web','')||deviceId());
        var body={client_id:W.client_id,client_secret:W.client_secret,grant_type:'refresh_token',refresh_token:rt};
        var h={'User-Agent':'','X-Device-ID':did,'Content-Type':'application/json; charset=utf-8'};
        var r=requestUserRaw('/v1/auth/token?client_id='+W.client_id,'POST',body,h,10000);
        if(r&&!r.error&&!r.error_code&&r.access_token){if(!r.refresh_token)r.refresh_token=rt;saveWebSession(r);return r;}
        return r;
    }
    function authHeaders(){
        var s=C.session()||{},did=trim(s._device_id||C.item('device_id_web','')||deviceId());
        var h={'X-Device-ID':did,'User-Agent':W.user_agent};
        var ct=trim(C.item('captcha_token',''));if(ct)h['X-Captcha-Token']=ct;
        if(s.access_token)h.Authorization='Bearer '+s.access_token;
        return h;
    }
    function publicHeaders(){var h={'X-Device-ID':deviceId(),'User-Agent':W.user_agent};var ct=trim(C.item('captcha_token',''));if(ct)h['X-Captcha-Token']=ct;return h;}
    C.webAuthProfile=W;
    C.importWebCredentials=importWebCredentials;
    C.saveWebSession=saveWebSession;
    C.refreshAccess=refreshAccess;
    C.authHeaders=authHeaders;
    C.publicHeaders=publicHeaders;
})(PikPakCore);
