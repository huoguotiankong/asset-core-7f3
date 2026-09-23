(function(){
    // Preserve the legacy app credential locally instead of publishing it in the remote runtime.
    // The uploaded PikPak v1 already contains it; Test1 only migrates it into this device's private Item.
    try{
        var raw=String(request('hiker://home@PikPak')||'');
        var p=raw.indexOf('￥home_rule￥');if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
        var old=JSON.parse(raw),pages=typeof old.pages==='string'?JSON.parse(old.pages):(old.pages||[]),code='';
        for(var i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==='pikpak'){code=String(pages[i].rule||'');break;}
        var m=code.match(/client_secret\s*=\s*["']([^"']+)["']/);
        if(m&&m[1])setItem('pikpak_v2_client_secret',String(m[1]));
    }catch(e){}
    // Remove legacy plaintext password Items even if the old login session cannot be migrated.
    try{clearItem('password');clearItem('password_bak');}catch(e2){}
    return request('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/dfab18eab0899b2b5047c130339ab1b3493aef8f/apps/cloud/pikpak/pikpak_remote_test_v1_b10101.txt');
})()