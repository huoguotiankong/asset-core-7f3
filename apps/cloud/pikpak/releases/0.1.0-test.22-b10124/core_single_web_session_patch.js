/* PikPak Test22 Build10124 - single official-Web account session */
(function(C){
    var baseSave=C.saveSession,baseImport=C.importWebCredential,baseRefresh=C.refreshAccess,baseError=C.errorText;
    var baseRequest=C.request,baseDrive=C.requestDrive,basePublic=C.requestPublic,baseUser=C.requestUser,mode='';
    function text(v){return String(v==null?'':v);}
    function clone(o){try{return JSON.parse(JSON.stringify(o||{}));}catch(e){return {};}}
    function merge(a,b){var out=clone(a),k;for(k in (b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')out[k]=b[k];return out;}
    function invalidRefresh(r){var t='';try{t=baseError(r);}catch(e){t=text(r&&r.error_description||r&&r.error||'');}return /invalid refresh token|refreshed by other process|refresh token.*invalid/i.test(t+' '+text(r&&r.error_description||'')+' '+text(r&&r.error||''));}
    function mark(r){if(invalidRefresh(r)){C.set('session_recovery_required','1');C.set('session_recovery_reason','refresh_rotated');return true;}return false;}
    /* Test19 multi-account state is intentionally retired; keep only pikpak_v2_session. */
    C.clear('accounts');C.clear('current_account_id');
    C.saveSession=function(s,profile,deviceId){s=clone(s);var old=C.session(),rotating=mode==='refresh'||(mode!=='import'&&!s.sub&&String(s._auth_profile||'')==='web');if(rotating&&old&&(old.access_token||old.refresh_token))s=merge(old,s);return baseSave(s,profile,deviceId);};
    C.importWebCredential=function(o){mode='import';try{var r=baseImport(clone(o));if(r&&!r.error&&!r.error_code&&r.access_token){C.clear('session_recovery_required');C.clear('session_recovery_reason');}else mark(r);return r;}finally{mode='';}};
    C.refreshAccess=function(){mode='refresh';try{var r=baseRefresh();if(r&&!r.error&&!r.error_code&&r.access_token){C.clear('session_recovery_required');C.clear('session_recovery_reason');}else mark(r);return r;}finally{mode='';}};
    function wrap(fn,args){var r=fn.apply(C,args);mark(r);return r;}
    C.request=function(){return wrap(baseRequest,arguments);};C.requestDrive=function(){return wrap(baseDrive,arguments);};C.requestPublic=function(){return wrap(basePublic,arguments);};C.requestUser=function(){return wrap(baseUser,arguments);};
    C.isInvalidRefresh=invalidRefresh;C.sessionRecoveryRequired=function(){return C.item('session_recovery_required','')==='1';};
    C.errorText=function(r){if(invalidRefresh(r))return '当前单账号 Web Session 已失效，请重新读取官方网页登录会话';return baseError(r);};
})(PikPakCore);
