(function(){
    var old=null,oldIcon='';
    try{
        var raw=String(request('hiker://home@PikPak')||'');
        var p=raw.indexOf('￥home_rule￥');
        if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
        old=JSON.parse(raw);oldIcon=String(old.icon||'');
    }catch(e){}
    try{clearItem('password');clearItem('password_bak');}catch(e2){}
    try{clearMyVar('pikpak_v2_login_pass');}catch(e3){}
    var shell=String(request('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/f810e8b350b77f503759feb1c02293c6c6979c51/apps/cloud/pikpak/pikpak_remote_test_v10_b10110.txt')||'');
    var mark='￥home_rule￥',idx=shell.indexOf(mark);
    if(idx<0)return shell;
    var prefix=shell.substring(0,idx+mark.length),body=shell.substring(idx+mark.length),next=JSON.parse(body);
    if(oldIcon)next.icon=oldIcon;
    return prefix+JSON.stringify(next);
})()