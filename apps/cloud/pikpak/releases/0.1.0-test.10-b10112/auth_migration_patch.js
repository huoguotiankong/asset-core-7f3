/* PikPak Test10 Build10112 - Android auth migration guard */
(function(C){
    var KEY='android_auth_migration_build',TARGET='10112';
    if(String(C.item(KEY,'')||'')===TARGET)return;
    try{
        var s=C.session();
        if(s&&String(s._auth_profile||'').toLowerCase()==='web')C.clearSession();
    }catch(e){}
    var vars=['pikpak_v2_verify_url','pikpak_v2_verify_token','pikpak_v2_verify_handoff_done','pikpak_v2_verified_captcha','pikpak_v2_login_pass'];
    for(var i=0;i<vars.length;i++){try{clearMyVar(vars[i]);}catch(e2){}}
    try{clearVar('pikpak_review_orig_token');}catch(e3){}
    C.clear('last_login_issue');
    C.set(KEY,TARGET);
})(PikPakCore);
