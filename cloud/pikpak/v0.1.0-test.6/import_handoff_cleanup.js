(function(){
    var old=null,oldIcon='';
    try{
        var raw=String(request('hiker://home@PikPak')||'');
        var p=raw.indexOf('￥home_rule￥');
        if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
        old=JSON.parse(raw);oldIcon=String(old.icon||'');
    }catch(e){}
    try{clearItem('password');clearItem('password_bak');}catch(e2){}
    try{clearMyVar('pikpak_v3_temp_origin');clearMyVar('pikpak_v3_handoff_session');}catch(e3){}
    var shell=String(request('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/4e82db77e12f0e08af4abb82881ad5921d09aec3/apps/cloud/pikpak/pikpak_remote_test_v6_b10106.txt')||'');
    var mark='￥home_rule￥',idx=shell.indexOf(mark);
    if(idx<0)return shell;
    var prefix=shell.substring(0,idx+mark.length),body=shell.substring(idx+mark.length),next=JSON.parse(body);
    if(oldIcon)next.icon=oldIcon;
    return prefix+JSON.stringify(next);
})()