// ACFun v0.2.9 XOR image decrypt + GitHub Contents updater + v0.3.0 direct bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.9';
ac.imageCipher='xor:2020-zq3-888';

ac.__v029Plain=function(u){
    u=String(u||'').trim();if(!u)return '';
    if(typeof ac.__v028Plain==='function')u=ac.__v028Plain(u);
    var tags=['@js=','@headers=','@Referer='];
    for(var i=0;i<tags.length;i++){var p=u.indexOf(tags[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    if(typeof ac.__imageBase==='function')return ac.__imageBase(u);
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

ac.__v029StreamJs='(function(){var k=[50,48,50,48,45,122,113,51,45,56,56,56],o=new java.io.ByteArrayOutputStream(),b=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,8192),n,p=0,i,v;while((n=input.read(b))>0){for(i=0;i<n;i++){v=b[i];if(v<0)v+=256;v=v^k[p%12];p++;if(v>127)v-=256;b[i]=v;}o.write(b,0,n);}try{input.close();}catch(e){}return new java.io.ByteArrayInputStream(o.toByteArray());})()';

ac.image=function(u){
    var plain=ac.__v029Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(/\.asigoo\.com\//i.test(plain))return plain+'@js='+ac.__v029StreamJs;
    return plain;
};

var __v029OldCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var before=d.length;__v029OldCard.call(ac,d,x,col);
    if(d.length>before){
        var it=d[d.length-1],info=ac.itemInfo(x||{}),pic=ac.image(info.img);
        it.pic_url=pic;it.img=pic;
        if(info.img)setItem('acfun_last_cover_raw',String(info.img));
        setItem('acfun_last_cover_plain_v029',ac.__v029Plain(info.img));
    }
};

ac.__v029DecryptPrefix=function(url){
    var plain=ac.__v029Plain(url),key=[50,48,50,48,45,122,113,51,45,56,56,56];
    setItem('acfun_v029_dec_err','');
    try{
        var hex=String(fetch(plain,{toHex:true,timeout:12000,headers:(ac.__imageHeaders?ac.__imageHeaders():{})})||'').toLowerCase();
        if(!hex)throw new Error('empty hex');
        var n=Math.min(hex.length,256),out='';
        for(var i=0;i<n;i+=2){var v=parseInt(hex.substring(i,i+2),16)^key[(i/2)%key.length];out+=('0'+v.toString(16)).slice(-2);}
        var magic='UNKNOWN';if(out.indexOf('89504e470d0a1a0a')===0)magic='PNG';else if(out.indexOf('ffd8ff')===0)magic='JPEG';else if(out.indexOf('52494646')===0&&out.substring(16,24)==='57454250')magic='WEBP';
        setItem('acfun_v029_dec_magic',magic);setItem('acfun_v029_dec_prefix',out.substring(0,160));
        return {ok:true,magic:magic,prefix:out.substring(0,160),bytes:Math.floor(hex.length/2)};
    }catch(e){var msg=String(e.message||e);setItem('acfun_v029_dec_err',msg);return {ok:false,error:msg};}
};

ac.__ghText=function(path){
    var url='https://api.github.com/repos/huoguotiankong/asset-core-7f3/contents/'+String(path||'').replace(/^\/+/, '')+'?ref=main&_='+new Date().getTime();
    var txt=fetch(url,{timeout:12000,headers:{Accept:'application/vnd.github+json','Cache-Control':'no-cache'}}),obj=JSON.parse(String(txt||''));
    if(!obj||!obj.content)throw new Error('GitHub Contents返回为空: '+path);
    var b=java.util.Base64.getMimeDecoder().decode(String(obj.content));
    return String(new java.lang.String(b,'UTF-8'));
};
ac.__ghJson=function(path){return JSON.parse(ac.__ghText(path));};
ac.__apiCheck=function(){
    var latest=ac.__ghJson('apps/video/acfun/latest.json'),rel=ac.__ghJson(latest.release);
    var cur={};try{cur=JSON.parse(getItem('hc_remote_state_acfun','{}')).current||{};}catch(e){}
    return {ok:true,current:cur,latest:rel,hasUpdate:Number(rel.build||0)>Number(cur.build||0),notes:latest.notes||''};
};
ac.__apiUpdate=function(){
    try{
        var ck=ac.__apiCheck(),rel=ck.latest,cur=ck.current||{};
        if(!ck.hasUpdate)return {ok:true,changed:false,current:cur,latest:rel};
        var m=(typeof ACFunBoot==='object'&&ACFunBoot.requireManager)?ACFunBoot.requireManager():null;if(!m)throw new Error('remote manager missing');
        m.loadRelease(ACFUN_HC_CONFIG,rel,false);
        var state={schema:2,current:rel,previous:cur&&cur.build?cur:null,updatedAt:new Date().getTime(),lastFallbackError:''};
        setItem('hc_remote_state_acfun',JSON.stringify(state));clearItem('hc_acfun_last_check');
        if(typeof ACFunBoot==='object'&&ACFunBoot.installCompatibility)ACFunBoot.installCompatibility();
        return {ok:true,changed:true,current:rel,previous:cur};
    }catch(e){return {ok:false,changed:false,error:String(e.message||e)};}
};
ac.__directUpgrade030=function(){
    try{
        var rel=ac.__ghJson('apps/video/acfun/releases/0.3.0/release.json');
        if(String(rel.version)!=='0.3.0'||Number(rel.build)!==130)throw new Error('0.3.0 release 校验失败');
        var cur={};try{cur=JSON.parse(getItem('hc_remote_state_acfun','{}')).current||{};}catch(e0){}
        var m=(typeof ACFunBoot==='object'&&ACFunBoot.requireManager)?ACFunBoot.requireManager():null;if(!m)throw new Error('remote manager missing');
        m.loadRelease(ACFUN_HC_CONFIG,rel,false);
        if(typeof ac!=='object'||String(ac.build)!=='2026.08.20-v0.3.0')throw new Error('0.3.0 运行校验失败: '+(typeof ac==='object'?ac.build:'ac missing'));
        setItem('hc_remote_state_acfun',JSON.stringify({schema:2,current:rel,previous:cur&&cur.build?cur:null,updatedAt:new Date().getTime(),lastFallbackError:''}));
        clearItem('hc_acfun_last_check');
        if(typeof ACFunBoot==='object'&&ACFunBoot.installCompatibility)ACFunBoot.installCompatibility();
        return {ok:true,current:rel};
    }catch(e){return {ok:false,error:String(e.message||e)};}
};
if(typeof ACFunBoot==='object'){
    ACFunBoot.check=function(){var r=ac.__apiCheck();setItem('hc_acfun_last_check',JSON.stringify(r));return r;};
    ACFunBoot.update=function(){var r=ac.__apiUpdate();setItem('hc_acfun_last_result',JSON.stringify(r));return r;};
}

var __v029BridgeNav=ac.nav;
if(typeof __v029BridgeNav==='function'){
    ac.nav=function(d){
        __v029BridgeNav.call(ac,d);
        d.push({title:'直升0.3.0',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('直升 0.3.0…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__directUpgrade030();hideLoading();if(r&&r.ok){refreshPage(false);return 'toast://已直升 0.3.0';}return 'toast://直升失败：'+((r&&r.error)||'unknown');}catch(e){hideLoading();return 'toast://直升异常：'+(e.message||e);}})});
    };
}

ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片解密诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain_v029','')||ac.__v029Plain(raw),magic=getItem('acfun_v029_dec_magic',''),pref=getItem('acfun_v029_dec_prefix',''),err=getItem('acfun_v029_dec_err','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n图片算法：'+ac.imageCipher+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('封面解密','Plain='+plain+'\n解密后Magic='+(magic||'未验证')+'\nDecryptPrefix='+(pref||'未验证')+'\nError='+(err||'无')));
    if(plain){
        d.push({title:'解密流图片测试',desc:'使用 XOR 2020-zq3-888 对 CDN InputStream 实时解密。',pic_url:ac.image(plain),img:ac.image(plain),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'验证解密文件头',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('验证解密头…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__v029DecryptPrefix(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?('解密后 '+r.magic+' / '+r.bytes+' bytes'):('失败：'+r.error));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}},plain)});
    }
    d.push({title:'直升 0.3.0（FileUtil桥接）',desc:'绕过旧更新页，直接加载并校验 Build 130。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('直升 0.3.0…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__directUpgrade030();hideLoading();if(r&&r.ok){refreshPage(false);return 'toast://已直升 0.3.0';}return 'toast://直升失败：'+((r&&r.error)||'unknown');}catch(e){hideLoading();return 'toast://直升异常：'+(e.message||e);}})});
    d.push({title:'复制 0.2.9 解密诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nDecryptMagic='+getItem('acfun_v029_dec_magic','')+'\nDecryptPrefix='+getItem('acfun_v029_dec_prefix','')+'\nDecryptErr='+getItem('acfun_v029_dec_err','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();