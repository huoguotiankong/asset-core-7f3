// ACFun v0.3.7 ImageAdapter - exact proven Hiker image() bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.7';
ac.imageCipher='xor:2020-zq3-888 / proven Hiker module image() / prefix 100';

ac.__v037Plain=function(u){
    if(typeof ac.__cleanPlainImage==='function')return ac.__cleanPlainImage(u);
    u=String(u||'').trim();if(!u)return '';
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

// Exact structure used by an existing working Hiker rule with the same key/algorithm.
ac.__v037Image=function(pic){
    return $(String(pic)).image(function(){
        return $.require('acfunImageDecoder?rule=ACFun').image();
    });
};

ac.image=function(u){
    var plain=ac.__v037Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return ac.__v037Image(plain);
    return plain;
};

ac.__v037Verify=function(url){
    var plain=ac.__v037Plain(url),key='2020-zq3-888'.split('').map(function(c){return c.charCodeAt(0);});
    setItem('acfun_v037_verify_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,512),out='';
        for(var i=0;i<n;i+=2){var pos=i/2,v=parseInt(hex.substring(i,i+2),16);if(pos<100)v=v^key[pos%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('474946')===0)magic='GIF';
        setItem('acfun_v037_verify_magic',magic);setItem('acfun_v037_verify_prefix',out.substring(0,200));
        return {ok:true,magic:magic,prefix:out.substring(0,200)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v037_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 封面诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v037Plain(raw),magic=getItem('acfun_v037_verify_magic',''),pref=getItem('acfun_v037_verify_prefix',''),err=getItem('acfun_v037_verify_err','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：clean UI + proven image module\n图片算法：'+ac.imageCipher+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        d.push({title:'同密钥实机写法',desc:'$(pic).image(() => $.require(...).image())；解码器无参直接读取 input。',img:ac.__v037Image(plain),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证前100字节文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v5.js?v=520',{headers:{'Cache-Control':'no-cache'}},520);ACFunBoot.loadOnly();var r=ac.__v037Verify(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('解密后 '+r.magic):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 0.3.7 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecryptMagic='+getItem('acfun_v037_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_v037_verify_prefix','')+'\nDecryptErr='+getItem('acfun_v037_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};
})();
