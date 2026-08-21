// ACFun v0.3.5 ImageAdapter - direct page module InputStream bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.5';
ac.imageCipher='xor:2020-zq3-888 / direct hiker page / prefix 100';

// Install the decoder body into rule storage. The shell page acfunImageDecoder only evals
// this string, so future decoder fixes do not require adding more page modules.
ac.__v035InstallDecoder=function(){
    var src="(function(){try{setItem('acfun_decoder_last_error','');setItem('acfun_decoder_last_hit','start:'+Date.now());var javaImport=new JavaImporter();javaImport.importPackage(Packages.com.example.hikerview.utils);with(javaImport){var bytes=FileUtil.toBytes(input);var key=[50,48,50,48,45,122,113,51,45,56,56,56];var n=Math.min(100,bytes.length);for(var i=0;i<n;i++){bytes[i]=bytes[i]^key[i%key.length];}setItem('acfun_decoder_last_hit','ok:'+bytes.length+':'+Date.now());$.exports=FileUtil.toInputStream(bytes);}}catch(e){setItem('acfun_decoder_last_error',String(e.message||e));setItem('acfun_decoder_last_hit','fail:'+Date.now());throw e;}})();";
    setItem('acfun_image_decoder_runtime_v035',src);
};
ac.__v035InstallDecoder();

ac.__v035Plain=function(u){
    if(typeof ac.__cleanPlainImage==='function')return ac.__cleanPlainImage(u);
    u=String(u||'').trim();if(!u)return '';
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

// Follow official Hiker recommendation literally:
// URL@js=$.require("hiker://page/des?rule=RULE")
ac.image=function(u){
    var plain=ac.__v035Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return plain+'@js=$.require("hiker://page/acfunImageDecoder?rule=ACFun")';
    return plain;
};

ac.__v035Verify=function(url){
    var plain=ac.__v035Plain(url),key=[50,48,50,48,45,122,113,51,45,56,56,56];
    setItem('acfun_v035_verify_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,512),out='';
        for(var i=0;i<n;i+=2){var pos=i/2,v=parseInt(hex.substring(i,i+2),16);if(pos<100)v=v^key[pos%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_v035_verify_magic',magic);setItem('acfun_v035_verify_prefix',out.substring(0,200));
        return {ok:true,magic:magic,prefix:out.substring(0,200)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v035_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    ac.__v035InstallDecoder();
    var d=[];setPageTitle('ACFun 封面诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v035Plain(raw),magic=getItem('acfun_v035_verify_magic',''),pref=getItem('acfun_v035_verify_prefix',''),err=getItem('acfun_v035_verify_err','');
    var hit=getItem('acfun_decoder_last_hit','未执行'),derr=getItem('acfun_decoder_last_error','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：clean UI + direct page decoder\n图片算法：'+ac.imageCipher+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('图片线程解码器','DecoderHit='+hit+'\nDecoderErr='+(derr||'无')+'\n页面调用：@js=$.require("hiker://page/acfunImageDecoder?rule=ACFun")'));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        var pic=ac.image(plain);
        d.push({title:'直接页面 InputStream',desc:'官方推荐最短链路；仅 XOR 前100字节。',pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'刷新图片线程状态',desc:'图片卡加载后点这里，查看 DecoderHit / DecoderErr 是否变化。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){refreshPage(false);return 'toast://DecoderHit='+getItem('acfun_decoder_last_hit','未执行')+' | Err='+(getItem('acfun_decoder_last_error','')||'无');})});
        d.push({title:'验证前100字节文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v4.js?v=412',{headers:{'Cache-Control':'no-cache'}},412);ACFunBoot.loadOnly();var r=ac.__v035Verify(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('前100字节解密后 '+r.magic):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制 0.3.5 诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecoderHit='+getItem('acfun_decoder_last_hit','')+'\nDecoderErr='+getItem('acfun_decoder_last_error','')+'\nDecryptMagic='+getItem('acfun_v035_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_v035_verify_prefix','')+'\nDecryptErr='+getItem('acfun_v035_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();
