// ACFun v0.3.0 official Hiker FileUtil image decrypt bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.0';
ac.imageCipher='xor:2020-zq3-888 / FileUtil';

ac.__v030Plain=function(u){
    u=String(u||'').trim();if(!u)return '';
    if(typeof ac.__v029Plain==='function')return ac.__v029Plain(u);
    var tags=['@js=','@headers=','@Referer='];
    for(var i=0;i<tags.length;i++){var p=u.indexOf(tags[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    if(typeof ac.__imageBase==='function')return ac.__imageBase(u);
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

// v0.2.6 once wrapped home/search/detail with a background download-and-update path.
// That downloads the still-encrypted CDN payload and may overwrite a decrypted card image.
// Keep the wrapper harmless from v0.3.0 onward.
ac.__prepareLocalImages=function(){return [];};
ac.__startLocalImageTasks=function(){};

// Official Hiker image-decrypt bridge:
// InputStream -> FileUtil.toBytes -> decrypt byte[] -> FileUtil.toInputStream.
ac.__v030Image=function(plain){
    var headers={};try{headers=ac.__imageHeaders?ac.__imageHeaders():{};}catch(e){}
    return $(plain,headers).image(function(){
        var javaImport=new JavaImporter();
        javaImport.importPackage(Packages.com.example.hikerview.utils);
        with(javaImport){
            var bytes=FileUtil.toBytes(input);
            var key=[50,48,50,48,45,122,113,51,45,56,56,56];
            for(var i=0;i<bytes.length;i++){
                var v=bytes[i];
                if(v<0)v+=256;
                v=v^key[i%key.length];
                if(v>127)v-=256;
                bytes[i]=v;
            }
            return FileUtil.toInputStream(bytes);
        }
    });
};

ac.image=function(u){
    var plain=ac.__v030Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return ac.__v030Image(plain);
    return plain;
};

// Force every video card to use the final v0.3.0 image pipeline, regardless of older wrappers.
var __v030OldCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var before=d.length;__v030OldCard.call(ac,d,x,col);
    if(d.length>before){
        var it=d[d.length-1],info=ac.itemInfo(x||{}),pic=ac.image(info.img);
        it.pic_url=pic;it.img=pic;
        if(info.img)setItem('acfun_last_cover_raw',String(info.img));
        setItem('acfun_last_cover_plain_v030',ac.__v030Plain(info.img));
        setItem('acfun_last_cover_final_v030',pic);
    }
};

ac.__v030Verify=function(url){
    var plain=ac.__v030Plain(url),key=[50,48,50,48,45,122,113,51,45,56,56,56];
    setItem('acfun_v030_verify_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000,headers:(ac.__imageHeaders?ac.__imageHeaders():{})})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,512),out='';
        for(var i=0;i<n;i+=2){var v=parseInt(hex.substring(i,i+2),16)^key[(i/2)%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';
        if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';
        else if(out.indexOf('ffd8ff')===0)magic='JPEG';
        else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_v030_verify_magic',magic);setItem('acfun_v030_verify_prefix',out.substring(0,160));
        return {ok:true,magic:magic,prefix:out.substring(0,160)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v030_verify_err',msg);return {ok:false,error:msg};}
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 封面解密诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain_v030','')||ac.__v030Plain(raw);
    var magic=getItem('acfun_v030_verify_magic',''),pref=getItem('acfun_v030_verify_prefix',''),err=getItem('acfun_v030_verify_err','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n图片算法：'+ac.imageCipher+'\n桥接：FileUtil.toBytes → XOR → FileUtil.toInputStream\nToken：'+(getItem('acfun_token','')?'YES':'NO')));
    d.push(ac.diagBlock('当前封面','Plain='+plain+'\nDecryptMagic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        var pic=ac.image(plain);
        d.push({title:'FileUtil 解密图片测试',desc:'使用海阔官方图片解密桥接方式。',pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证解密文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证中…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__v030Verify(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('解密后 '+r.magic):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push({title:'复制 0.3.0 解密诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecryptMagic='+getItem('acfun_v030_verify_magic','')+'\nDecryptPrefix='+getItem('acfun_v030_verify_prefix','')+'\nDecryptErr='+getItem('acfun_v030_verify_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();