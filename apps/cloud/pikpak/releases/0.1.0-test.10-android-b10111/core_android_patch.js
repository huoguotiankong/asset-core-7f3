/* PikPak Test10 Android Auth Patch - current Android profile, no Web 2.0 signin */
(function(C){
    var A={
        client_id:'YNxT9w7GMdWvEOKa',
        client_secret:'dbw2OtmVEeuUvIptb1Coyg',
        client_version:'1.53.2',
        package_name:'com.pikcloud.pikpak',
        sdk_version:'2.0.6.206003',
        redirect_uri:'xlaccsdk01://xbase.cloud/callback?state=harbor',
        algorithms:[
            'SOP04dGzk0TNO7t7t9ekDbAmx+eq0OI1ovEx',
            'nVBjhYiND4hZ2NCGyV5beamIr7k6ifAsAbl',
            'Ddjpt5B/Cit6EDq2a6cXgxY9lkEIOw4yC1GDF28KrA',
            'VVCogcmSNIVvgV6U+AochorydiSymi68YVNGiz',
            'u5ujk5sM62gpJOsB/1Gu/zsfgfZO',
            'dXYIiBOAHZgzSruaQ2Nhrqc2im',
            'z5jUTBSIpBN9g4qSJGlidNAutX6',
            'KJE2oveZ34du/g1tiimm'
        ]
    };
    function trim(v){return String(v==null?'':v).replace(/^\s+|\s+$/g,'');}
    function errCode(o){return String(o&&o.error_code!=null?o.error_code:'');}
    function okToken(o){return !!(o&&!o.error&&!o.error_code&&o.access_token);}
    function sha1hex(msg){
        msg=String(msg||'');
        var words=[],i,j,t,w=new Array(80),h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476,h4=0xC3D2E1F0;
        function rol(n,s){return (n<<s)|(n>>>(32-s));}
        function hex(n){var s='',k;for(k=7;k>=0;k--)s+=((n>>>(k*4))&15).toString(16);return s;}
        for(i=0;i<msg.length;i++)words[i>>2]|=msg.charCodeAt(i)<<(24-(i%4)*8);
        var bitLen=msg.length*8;
        words[bitLen>>5]|=0x80<<(24-bitLen%32);
        words[((bitLen+64>>9)<<4)+15]=bitLen;
        for(i=0;i<words.length;i+=16){
            var a=h0,b=h1,c=h2,d=h3,e=h4;
            for(j=0;j<80;j++){
                w[j]=j<16?(words[i+j]||0):rol(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
                var f,k;
                if(j<20){f=(b&c)|((~b)&d);k=0x5A827999;}
                else if(j<40){f=b^c^d;k=0x6ED9EBA1;}
                else if(j<60){f=(b&c)|(b&d)|(c&d);k=0x8F1BBCDC;}
                else{f=b^c^d;k=0xCA62C1D6;}
                t=(rol(a,5)+f+e+k+w[j])|0;e=d;d=c;c=rol(b,30);b=a;a=t;
            }
            h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;
        }
        return hex(h0)+hex(h1)+hex(h2)+hex(h3)+hex(h4);
    }
    function deviceId(user,pass){
        user=trim(user);pass=String(pass||'');
        var s=C.session(),d=s&&s._device_id?String(s._device_id):'';
        if(user&&pass)d=md5(user+pass);
        if(!d)d=C.item('device_id_android','');
        if(!d)d=md5(String(new Date().getTime())+'|'+String(Math.random())+'|pikpak-android');
        C.set('device_id_android',d);
        return d;
    }
    function deviceSign(did){
        var base=String(did||'')+A.package_name+'1appkey';
        return 'div101.'+String(did||'')+md5(sha1hex(base));
    }
    function userAgent(did,userId){
        did=String(did||'');userId=String(userId||'');
        return 'ANDROID-'+A.package_name+'/'+A.client_version+' '
            +'protocolVersion/200 accesstype/ clientid/'+A.client_id+' clientversion/'+A.client_version+' '
            +'action_type/ networktype/WIFI sessionid/ deviceid/'+did+' providername/NONE '
            +'devicesign/'+deviceSign(did)+' refresh_token/ sdkversion/'+A.sdk_version+' '
            +'datetime/'+String(new Date().getTime())+' usrno/'+userId+' appname/android-'+A.package_name+' '
            +'session_origin/ grant_type/ appid/ clientip/ devicename/Xiaomi_M2004j7ac '
            +'osversion/13 platformversion/10 accessmode/ devicemodel/M2004J7AC';
    }
    function apiDomain(){var d=C.item('api_domain','');if(!d){d='mypikpak.net';C.setDomain(d);}return d;}
    function altDomain(d){return d==='mypikpak.net'?'mypikpak.com':'mypikpak.net';}
    function replaceDomain(url,to){return String(url||'').replace(/mypikpak\.(?:com|net)/i,to);}
    function rawWithFallback(url,method,body,headers,timeout){
        var r=C.raw(url,method,body,headers,timeout||10000);
        if(r&&r._network_error&&/mypikpak\.(com|net)/i.test(url)){
            var m=String(url).match(/mypikpak\.(com|net)/i),from=m?('mypikpak.'+m[1]):apiDomain(),alt=replaceDomain(url,altDomain(from));
            if(alt!==url)r=C.raw(alt,method,body,headers,timeout||10000);
        }
        return r;
    }
    function commonHeaders(did,token,userId){
        var h={'User-Agent':userAgent(did,userId),'X-Device-ID':did,'X-Client-ID':A.client_id,'X-Client-Version':A.client_version,'Content-Type':'application/json; charset=utf-8'};
        if(token)h['X-Captcha-Token']=String(token);
        return h;
    }
    function captchaSign(did,ts){
        var s=A.client_id+A.client_version+A.package_name+String(did||'')+String(ts||'');
        for(var i=0;i<A.algorithms.length;i++)s=md5(s+A.algorithms[i]);
        return '1.'+s;
    }
    function identityMeta(user){
        user=trim(user);var m={};
        if(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(user))m.email=user;
        else if(user.length>=11&&user.length<=18)m.phone_number=user;
        else m.username=user;
        return m;
    }
    function actionOf(method,url){var m=String(url||'').match(/^[a-z]+:\/\/[^/]+([^?#]*)/i);return String(method||'GET').toUpperCase()+':'+(m&&m[1]?m[1]:'/');}
    function captchaInitLogin(user,pass,oldToken){
        user=trim(user);pass=String(pass||'');
        if(!user||!pass)return {error:'EMPTY_ACCOUNT',error_description:'请输入账号和密码'};
        var did=deviceId(user,pass),body={action:'POST:/v1/auth/signin',captcha_token:String(oldToken||''),client_id:A.client_id,device_id:did,meta:identityMeta(user),redirect_uri:A.redirect_uri};
        var url='https://user.mypikpak.net/v1/shield/captcha/init?client_id='+A.client_id;
        var r=rawWithFallback(url,'POST',body,commonHeaders(did,oldToken,''),10000);
        if(r&&r.captcha_token)C.set('captcha_token',String(r.captcha_token));
        var vu=String(r&&(r.url||r.verify_url||r.captcha_url)||'');
        if(vu)return {needsVerification:true,review:true,captcha_token:String(r.captcha_token||oldToken||''),verify_url:vu,device_id:did,raw:r};
        if(!r||r.error||r.error_code||!r.captcha_token)return r&&typeof r==='object'?r:{error:'CAPTCHA_INIT_FAILED',error_description:'PikPak Android 登录验证初始化失败'};
        return {captcha_token:String(r.captcha_token),device_id:did,raw:r};
    }
    function signin(user,pass,token,did){
        user=trim(user);pass=String(pass||'');token=String(token||'');did=String(did||deviceId(user,pass));
        if(!token)return {error:'CAPTCHA_TOKEN_EMPTY',error_description:'验证令牌为空，请重新登录'};
        var body={captcha_token:token,client_id:A.client_id,client_secret:A.client_secret,username:user,password:pass};
        var url='https://user.mypikpak.net/v1/auth/signin?client_id='+A.client_id;
        var r=rawWithFallback(url,'POST',body,{'Content-Type':'application/json; charset=utf-8'},12000);
        if(okToken(r)){
            C.set('captcha_token',token);C.setUsername(user);C.saveSession(r,{name:'legacy'},did);C.clear('last_login_issue');return r;
        }
        var vu=String(r&&(r.url||r.verify_url||r.captcha_url)||'');
        if(vu)return {needsVerification:true,review:true,captcha_token:token,verify_url:vu,device_id:did,raw:r};
        if(C.isCaptchaError(r)){
            C.set('captcha_token','');
            var next=captchaInitLogin(user,pass,'');
            if(next&&next.needsVerification)return next;
            if(next&&next.captcha_token){
                body.captcha_token=String(next.captcha_token);
                r=rawWithFallback(url,'POST',body,{'Content-Type':'application/json; charset=utf-8'},12000);
                if(okToken(r)){C.set('captcha_token',body.captcha_token);C.setUsername(user);C.saveSession(r,{name:'legacy'},next.device_id||did);C.clear('last_login_issue');}
            }
        }
        return r;
    }
    function begin(user,pass){
        var cap=captchaInitLogin(user,pass,'');
        if(!cap||cap.error||cap.error_code||cap.needsVerification)return cap;
        return signin(user,pass,cap.captcha_token,cap.device_id);
    }
    function finish(user,pass,token){return signin(user,pass,token,deviceId(user,pass));}
    function reload(user,pass,oldToken){return captchaInitLogin(user,pass,oldToken||'');}
    function refreshCaptchaPostLogin(action,userId){
        var s=C.session(),did=deviceId(C.username(),''),ts=String(new Date().getTime()),uid=String(userId||s.sub||C.item('user_id','')||'');
        var meta={client_version:A.client_version,package_name:A.package_name,user_id:uid,timestamp:ts,captcha_sign:captchaSign(did,ts)};
        var body={action:action||'GET:/drive/v1/files',captcha_token:String(C.item('captcha_token','')||''),client_id:A.client_id,device_id:did,meta:meta,redirect_uri:A.redirect_uri};
        var url='https://user.mypikpak.net/v1/shield/captcha/init?client_id='+A.client_id;
        var r=rawWithFallback(url,'POST',body,commonHeaders(did,body.captcha_token,uid),10000);
        if(r&&r.captcha_token){C.set('captcha_token',String(r.captcha_token));return String(r.captcha_token);}
        return '';
    }
    function refreshAccess(){
        var s=C.session(),rt=String((s&&s.refresh_token)||C.item('refresh_token','')||'');
        if(!rt)return {error:'NO_REFRESH_TOKEN',error_description:'登录已失效，请重新登录'};
        var did=String((s&&s._device_id)||deviceId(C.username(),''));
        var body={client_id:A.client_id,client_secret:A.client_secret,grant_type:'refresh_token',refresh_token:rt};
        var url='https://user.mypikpak.net/v1/auth/token?client_id='+A.client_id;
        var r=rawWithFallback(url,'POST',body,{'Content-Type':'application/json; charset=utf-8','User-Agent':''},10000);
        if(okToken(r)){
            if(!r.refresh_token)r.refresh_token=rt;
            C.saveSession(r,{name:'legacy'},did);
            return r;
        }
        return r;
    }
    function authHeaders(){
        var s=C.session(),did=String((s&&s._device_id)||deviceId(C.username(),'')),uid=String((s&&s.sub)||C.item('user_id','')||''),tok=String(C.item('captcha_token','')||'');
        var h=commonHeaders(did,tok,uid);delete h['Content-Type'];if(s&&s.access_token)h.Authorization='Bearer '+s.access_token;return h;
    }
    function publicHeaders(){
        var s=C.session(),did=String((s&&s._device_id)||deviceId(C.username(),'')),uid=String((s&&s.sub)||C.item('user_id','')||''),tok=String(C.item('captcha_token','')||'');
        var h=commonHeaders(did,tok,uid);delete h['Content-Type'];return h;
    }
    function request(method,url,body,opt){
        opt=opt||{};method=String(method||'GET').toUpperCase();var auth=opt.auth!==false;
        if(auth){var s=C.session();if(!s.access_token){var rr=refreshAccess();if(!okToken(rr))return rr;}}
        var headers=auth?authHeaders():publicHeaders(),k;if(opt.headers)for(k in opt.headers)headers[k]=opt.headers[k];
        var r=C.raw(url,method,body,headers,opt.timeout||10000),code=errCode(r);
        if(r&&r._network_error&&!opt._domainRetried&&/mypikpak\.(com|net)/i.test(url)){
            opt._domainRetried=true;var m=String(url).match(/mypikpak\.(com|net)/i),from=m?('mypikpak.'+m[1]):apiDomain(),alt=replaceDomain(url,altDomain(from));if(alt!==url)return request(method,alt,body,opt);
        }
        if(auth&&(C.isAuthError(r)||code==='4121'||code==='4122'||code==='16')&&!opt._authRetried){
            var ar=refreshAccess();if(okToken(ar)){opt._authRetried=true;return request(method,url,body,opt);}return ar;
        }
        if((C.isCaptchaError(r)||code==='9'||code==='4002')&&!opt._captchaRetried){
            var s2=C.session(),uid=String((s2&&s2.sub)||C.item('user_id','')||'');
            if(refreshCaptchaPostLogin(actionOf(method,url),uid)){opt._captchaRetried=true;return request(method,url,body,opt);}
        }
        return r;
    }
    function rootHost(prefix){return 'https://'+prefix+'.'+apiDomain();}
    function requestDrive(method,path,body,opt){return request(method,rootHost('api-drive')+path,body,opt||{});}
    function requestPublic(method,path,body,opt){opt=opt||{};opt.auth=false;return request(method,rootHost('api-drive')+path,body,opt);}
    function requestUser(method,path,body,opt){opt=opt||{};opt.auth=false;return request(method,rootHost('user')+path,body,opt);}

    if(!C.item('api_domain',''))C.setDomain('mypikpak.net');
    C.clientId=A.client_id;C.clientVersion=A.client_version;C.packageName=A.package_name;C.userAgent='ANDROID-'+A.package_name+'/'+A.client_version;
    C.getDeviceId=function(){return deviceId(C.username(),'');};
    C.beginPasswordLogin=begin;C.finishPasswordLogin=finish;C.refreshPasswordChallenge=reload;C.login=begin;
    C.refreshAccess=refreshAccess;C.refreshCaptcha=refreshCaptchaPostLogin;C.authHeaders=authHeaders;C.publicHeaders=publicHeaders;
    C.request=request;C.requestDrive=requestDrive;C.requestPublic=requestPublic;C.requestUser=requestUser;
    C.buildPasswordReviewUrl=function(r){return String(r&&(r.verify_url||(r.raw&&(r.raw.url||r.raw.verify_url)))||'');};
    C.androidAuthProfile=function(){return {client_id:A.client_id,client_version:A.client_version,package_name:A.package_name,sdk_version:A.sdk_version,device_id:deviceId(C.username(),'')};};
})(PikPakCore);
