// ACFun v0.3.3 ImageAdapter - page-module decoder / prefix-length probe
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.3';
ac.imageCipher='xor:2020-zq3-888 / page module / prefix 100';

ac.__v033Plain=function(u){
    if(typeof ac.__cleanPlainImage==='function')return ac.__cleanPlainImage(u);
    u=String(u||'').trim();if(!u)return '';
    var p=u.indexOf('@js=');if(p>=0)u=u.substring(0,p);
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

// Mirror the mature Hiker pattern used by working image-decrypt rules:
// $(pic).image(shortCallback, arg) -> $.require(pageModule).decode(arg).
ac.__v033Image=function(url,limit){
    return $(String(url)).image(function(n){
        return $.require('acfunImageDecoder').decode(n);
    },Number(limit||100));
};

ac.image=function(u){
    var plain=ac.__v033Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return ac.__v033Image(plain,100);
    return plain;
};

ac.__v033Verify=function(url){
    var plain=ac.__v033Plain(url),key=[50,48,50,48,45,122,113,51,45,56,56,56];
    setItem('acfun_v033_verify_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,512),out='';
        for(var i=0;i<n;i+=2){
            var pos=i/2,v=parseInt(hex.substring(i,i+2),16);
            if(pos<100)v=v^key[pos%key.length];
            out+=('0'+v.toString(16)).slice(-2);
        }
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_v033_verify_magic',magic);setItem('acfun_v033_verify_prefix',out.substring(0,200));
        return {ok:true,magic:magic,prefix:out.substring(0,200)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v033_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 封面诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v033Plain(raw),magic=getItem('acfun_v033_verify_magic',''),pref=getItem('acfun_v033_verify_prefix',''),err=getItem('acfun_v033_verify_err','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：clean UI + ImageAdapter\n图片算法：'+ac.imageCipher+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        d.push({title:'前100字节',desc:'默认：首页也使用这一模式。',pic_url:ac.__v033Image(plain,100),img:ac.__v033Image(plain,100),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'前128字节',desc:'同一图片，仅改变 XOR 长度。',pic_url:ac.__v033Image(plain,128),img:ac.__v033Image(plain,128),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'前256字节',desc:'同一图片，仅改变 XOR 长度。',pic_url:ac.__v033Image(plain,256),img:ac.__v033Image(plain,256),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'全文件',desc:'旧版本方式，用作对照。',pic_url:ac.__v033Image(plain,-1),img:ac.__v033Image(plain,-1),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证前100字节文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=410',{headers:{'Cache-Control':'no-cache'}},410);ACFunBoot.loadOnly();var r=ac.__v033Verify(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('前100字节解密后 '+r.magic):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 0.3.3 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecryptMagic='+getItem('acfun_v033_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_v033_verify_prefix','')+'\nDecryptErr='+getItem('acfun_v033_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();
