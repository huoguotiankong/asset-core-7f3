/* PikPak Test21 Build10123 - Web Session token rotation and stale-session recovery */
(function(C){
    var baseSave=C.saveSession,baseImport=C.importWebCredential,baseRefresh=C.refreshAccess,baseError=C.errorText;
    var baseRequest=C.request,baseDrive=C.requestDrive,basePublic=C.requestPublic,baseUser=C.requestUser;
    var mode='';
    function text(v){return String(v==null?'':v);}
    function clone(o){try{return JSON.parse(JSON.stringify(o||{}));}catch(e){return {};}}
    function merge(a,b){var out=clone(a),k;for(k in (b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')out[k]=b[k];return out;}
    function jwtSubject(token){
        token=text(token).replace(/^Bearer\s+/i,'');var p=token.split('.');if(p.length<2)return '';
        try{var s=text(p[1]).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var raw='';
            try{raw=text(new java.lang.String(java.util.Base64.getDecoder().decode(s),'UTF-8'));}catch(e){try{raw=base64Decode(s);}catch(e2){return '';}}
            var o=JSON.parse(raw);return text(o.sub||o.user_id||o.userId||'');
        }catch(e3){return '';}
    }
    function invalidRefresh(r){var t='';try{t=baseError(r);}catch(e){t=text(r&&r.error_description||r&&r.error||'');}return /invalid refresh token|refreshed by other process|refresh token.*invalid/i.test(text(t)+' '+text(r&&r.error_description||'')+' '+text(r&&r.error||''));}
    function mark(r){if(invalidRefresh(r)){C.set('session_recovery_required','1');C.set('session_recovery_reason','refresh_rotated');return true;}return false;}
    function healthy(r){if(r&&!r.error&&!r.error_code&&!r._network_error)C.clear('session_recovery_required');return r;}
    C.saveSession=function(s,profile,deviceId){
        s=clone(s);var old=C.session(),current=C.item('current_account_id',''),rotating=false;
        if(!s.sub&&s.access_token)s.sub=jwtSubject(s.access_token);
        rotating=mode==='refresh'||(mode!=='import'&&current&&!s.sub&&String(s._auth_profile||'')==='web'&&String(old&&old._auth_profile||'')==='web');
        if(rotating&&old&&(old.access_token||old.refresh_token))s=merge(old,s);
        var out=baseSave(s,profile,deviceId);
        if(rotating&&current&&C.readJsonItem&&C.writeJsonItem){
            var a=C.readJsonItem('accounts',[]),next=[],found=false,i,x;
            if(a instanceof Array){for(i=0;i<a.length;i++){x=a[i]||{};if(x.id===current){x.session=clone(out);x.savedAt=new Date().getTime();x.lastUsed=x.savedAt;next.push(x);found=true;}else if(!(x.session&&(text(x.session.refresh_token)===text(out&&out.refresh_token)||text(x.session.access_token)===text(out&&out.access_token))))next.push(x);}if(found){C.writeJsonItem('accounts',next);C.set('current_account_id',current);}}
        }
        return out;
    };
    C.importWebCredential=function(o){
        o=clone(o);if(!o.sub&&o.access_token)o.sub=jwtSubject(o.access_token);mode='import';
        try{var r=baseImport(o);if(r&&!r.error&&!r.error_code&&r.access_token){C.clear('session_recovery_required');C.clear('session_recovery_reason');}else mark(r);return r;}finally{mode='';}
    };
    C.refreshAccess=function(){mode='refresh';try{var r=baseRefresh();mark(r);return healthy(r);}finally{mode='';}};
    function wrap(fn,args){var r=fn.apply(C,args);mark(r);return r;}
    C.request=function(){return wrap(baseRequest,arguments);};
    C.requestDrive=function(){return wrap(baseDrive,arguments);};
    C.requestPublic=function(){return wrap(basePublic,arguments);};
    C.requestUser=function(){return wrap(baseUser,arguments);};
    C.isInvalidRefresh=invalidRefresh;
    C.sessionRecoveryRequired=function(){return C.item('session_recovery_required','')==='1';};
    C.errorText=function(r){if(invalidRefresh(r))return '当前 Web Session 已被官方网页或其他进程更新，请重新读取网页登录会话恢复；无需账号密码登录';return baseError(r);};
})(PikPakCore);
