// ACFun v0.3.8 ImageAdapter - request-header + decrypt convergence
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.8';
ac.imageCipher='xor:2020-zq3-888 / prefix 100 / guarded + request headers';

ac.__v038Plain=function(u){
    if(typeof ac.__cleanPlainImage==='function')return ac.__cleanPlainImage(u);
    u=String(u||'').trim();if(!u)return '';
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

ac.__v038Headers=function(mode){
    var dalvik='Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)';
    var webview='Mozilla/5.0 (Linux; Android 11; M2012K10C Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36';
    if(mode==='dalvik')return {'User-Agent':dalvik,'Referer':''};
    if(mode==='dalvik-api')return {'User-Agent':dalvik,'Referer':'https://acapp.sexbar.site/'};
    if(mode==='webview-api')return {'User-Agent':webview,'Referer':'https://acapp.sexbar.site/'};
    return null;
};

ac.__v038Image=function(pic,mode){
    var target=String(pic||'');
    var h=ac.__v038Headers(mode||'');
    if(h)target+='@headers='+JSON.stringify(h);
    return $(target).image(function(){
        return $.require('acfunImageDecoder?rule=ACFun').image();
    });
};

// Python implementation from the same API family explicitly uses Dalvik for image fetches.
// Use that as the production default; diagnostic page keeps the other modes side by side.
ac.image=function(u){
    var plain=ac.__v038Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return ac.__v038Image(plain,'dalvik');
    return plain;
};

ac.__v038Verify=function(url,mode){
    var plain=ac.__v038Plain(url),key='2020-zq3-888'.split('').map(function(c){return c.charCodeAt(0);});
    setItem('acfun_v038_verify_err','');
    try{
        var opts={toHex:true,timeout:12000},h=ac.__v038Headers(mode||'');if(h)opts.headers=h;
        var hex=String(fetch(plain,opts)||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var raw=hex.substring(0,24),isPlain=/^(ffd8ff|89504e470d0a1a0a|474946|52494646)/.test(raw),out='';
        var n=Math.min(hex.length,512);
        for(var i=0;i<n;i+=2){var pos=i/2,v=parseInt(hex.substring(i,i+2),16);if(!isPlain&&pos<100)v=v^key[pos%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('474946')===0)magic='GIF';
        else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_v038_verify_magic',magic);setItem('acfun_v038_verify_prefix',out.substring(0,200));setItem('acfun_v038_verify_mode',String(mode||'default'));
        return {ok:true,magic:magic,prefix:out.substring(0,200),plain:isPlain};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v038_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 封面诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v038Plain(raw),magic=getItem('acfun_v038_verify_magic',''),pref=getItem('acfun_v038_verify_prefix',''),err=getItem('acfun_v038_verify_err',''),vm=getItem('acfun_v038_verify_mode','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：clean UI + guarded decoder + header modes\n图片算法：'+ac.imageCipher+'\n默认图片请求：Dalvik / empty Referer\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nVerifyMode='+(vm||'未验证')+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        d.push({title:'A 默认请求+解密',desc:'不加自定义 headers。',img:ac.__v038Image(plain,''),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'B Dalvik+解密',desc:'同接口家族 Python 实现使用的图片 UA；Referer 置空。',img:ac.__v038Image(plain,'dalvik'),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'C Dalvik+API Referer',desc:'Dalvik UA + https://acapp.sexbar.site/',img:ac.__v038Image(plain,'dalvik-api'),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'D WebView+API Referer',desc:'Android WebView UA + API Referer。',img:ac.__v038Image(plain,'webview-api'),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证 Dalvik 请求文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=530',{headers:{'Cache-Control':'no-cache'}},530);ACFunBoot.loadOnly();var r=ac.__v038Verify(url,'dalvik');hideLoading();refreshPage(false);return 'toast://'+(r.ok?('Dalvik '+r.magic+(r.plain?' / 原始已明文':' / XOR后')):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 0.3.8 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nVerifyMode='+getItem('acfun_v038_verify_mode','')+'\nDecryptMagic='+getItem('acfun_v038_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_v038_verify_prefix','')+'\nDecryptErr='+getItem('acfun_v038_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};
})();
