(function(){
    var old=null,oldIcon='';
    try{
        var raw=String(request('hiker://home@PikPak')||'');
        var p=raw.indexOf('￥home_rule￥');
        if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
        old=JSON.parse(raw);
        oldIcon=String(old.icon||'');
        var pages=typeof old.pages==='string'?JSON.parse(old.pages):(old.pages||[]),code='';
        for(var i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==='pikpak'){code=String(pages[i].rule||'');break;}
        var m=code.match(/client_secret\s*=\s*["']([^"']+)["']/);
        if(m&&m[1])setItem('pikpak_v2_client_secret',String(m[1]));
    }catch(e){}
    try{clearItem('password');clearItem('password_bak');}catch(e2){}
    var shell=String(request('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/92be045c39a80ecafe235cf982352f2b01cc3deb/apps/cloud/pikpak/pikpak_remote_test_v2_b10102.txt')||'');
    var mark='￥home_rule￥',idx=shell.indexOf(mark);
    if(idx<0)return shell;
    var prefix=shell.substring(0,idx+mark.length),body=shell.substring(idx+mark.length),next=JSON.parse(body);
    if(oldIcon)next.icon=oldIcon;
    return prefix+JSON.stringify(next);
})()