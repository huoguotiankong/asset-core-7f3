// ACFun v0.2.7 InputStream/saveImage image fix
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.7';

ac.__v027Plain=function(u){
    u=String(u||'').trim();
    if(!u)return '';
    if(typeof ac.__stripImageSuffix==='function')u=ac.__stripImageSuffix(u);
    var p=u.indexOf('@js=');if(p>=0)u=u.substring(0,p);
    p=u.indexOf('@headers=');if(p>=0)u=u.substring(0,p);
    p=u.indexOf('@Referer=');if(p>=0)u=u.substring(0,p);
    if(/^https?:\/\//i.test(u))return u;
    if(typeof ac.__imageBase==='function')return ac.__imageBase(u);
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

ac.__v027CachePath=function(url){
    var plain=ac.__v027Plain(url),ext='jpg',m=plain.match(/\.([a-zA-Z0-9]{2,5})(?:\?|#|$)/);
    if(m&&/^(?:jpe?g|png|webp|gif|avif|bmp)$/i.test(m[1]))ext=m[1].toLowerCase();
    return 'hiker://files/cache/acfun_cover_v027_'+md5(plain)+'.'+ext;
};

ac.__v027Local=function(url){
    var p=ac.__v027CachePath(url);
    try{if(p&&fileExist(p))return getPath(p);}catch(e){}
    return '';
};

ac.image=function(u){
    var plain=ac.__v027Plain(u);
    if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    var local=ac.__v027Local(plain);
    if(local)return local;
    if(/\.asigoo\.com\//i.test(plain))return plain+'@js=input';
    return plain;
};

var __v027OldCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var before=d.length;
    __v027OldCard.call(ac,d,x,col);
    if(d.length>before){
        var it=d[d.length-1],info=ac.itemInfo(x||{}),pic=ac.image(info.img);
        it.pic_url=pic;it.img=pic;
        if(info.img)setItem('acfun_last_cover_raw',String(info.img));
        setItem('acfun_last_cover_plain_v027',ac.__v027Plain(info.img));
        setItem('acfun_last_cover_final_v027',pic);
    }
};

var __v027OldDetail=ac.detail;
ac.detail=function(){return __v027OldDetail.apply(ac,arguments);};

ac.__v027SaveOne=function(url){
    var plain=ac.__v027Plain(url),p=ac.__v027CachePath(plain);
    setItem('acfun_v027_save_error','');
    setItem('acfun_v027_save_path','');
    if(!plain)return {ok:false,error:'empty url'};
    try{
        try{if(fileExist(p)){var old=getPath(p);setItem('acfun_v027_save_path',old);return {ok:true,path:old,cached:true};}}catch(e0){}
        saveImage(plain,p);
        if(fileExist(p)){
            var local=getPath(p);setItem('acfun_v027_save_path',local);return {ok:true,path:local,cached:false};
        }
        setItem('acfun_v027_save_error','saveImage finished but file not found: '+p);
        return {ok:false,error:getItem('acfun_v027_save_error','')};
    }catch(e){
        var msg=String(e.message||e);setItem('acfun_v027_save_error',msg);return {ok:false,error:msg};
    }
};

// Direct, immutable target upgrade. This deliberately bypasses latest.json and Remote Manager update().
ac.__directUpgrade028=function(){
    var root='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/';
    var ts=new Date().getTime();
    var relUrl=root+'main/apps/video/acfun/releases/0.2.8/release.json?acfun_direct='+ts;
    var txt=fetch(relUrl,{timeout:12000,headers:{'Cache-Control':'no-cache'}});
    if(!txt||!String(txt).trim())throw new Error('0.2.8 release 返回为空');
    var rel=JSON.parse(String(txt));
    if(Number(rel.build||0)!==128||String(rel.version||'')!=='0.2.8')throw new Error('0.2.8 release 校验失败');
    var oldState={};
    try{oldState=JSON.parse(getItem('hc_remote_state_acfun','{}'))||{};}catch(e0){}
    var mods=rel.modules||[];
    if(!mods.length)throw new Error('0.2.8 modules 为空');
    for(var i=0;i<mods.length;i++){
        var m=mods[i];
        var u=root+(rel.ref||'main')+'/'+String(m.path||'').replace(/^\/+/, '')+'?hc_release=0.2.8&acfun_direct='+ts;
        require(u,{headers:{'Cache-Control':'no-cache'}},128);
    }
    if(typeof ac!=='object'||String(ac.build)!=='2026.08.20-v0.2.8')throw new Error('0.2.8 运行校验失败：'+(typeof ac==='object'?String(ac.build):'ac missing'));
    var state={schema:2,current:rel,previous:oldState.current||null,updatedAt:new Date().getTime(),lastFallbackError:''};
    setItem('hc_remote_state_acfun',JSON.stringify(state));
    setItem('acfun_active_runtime',String(ac.build));
    setItem('acfun_direct_upgrade','0.2.8');
    return {ok:true,current:rel};
};

var __v027OldNav=ac.nav;
if(typeof __v027OldNav==='function'){
    ac.nav=function(d){
        __v027OldNav.call(ac,d);
        d.push({title:'直升0.2.8',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){
            showLoading('直升 0.2.8…');
            try{
                require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);
                ACFunBoot.loadOnly();
                var r=ac.__directUpgrade028();
                hideLoading();refreshPage(false);
                return 'toast://已直升 '+r.current.version;
            }catch(e){hideLoading();return 'toast://直升失败：'+(e.message||e);}
        })});
    };
}

ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片流诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain_v027','')||ac.__v027Plain(raw),final=getItem('acfun_last_cover_final_v027','')||ac.image(raw);
    var saved=getItem('acfun_v027_save_path',''),err=getItem('acfun_v027_save_error','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')+'\n直升桥：READY'));
    d.push(ac.diagBlock('图片流','CoverRaw='+raw+'\n\nPlain='+plain+'\n\nFinal='+final+'\n\nContent-Type探测：application/octet-stream'));
    d.push({title:'直升 0.2.8（绕过最新版缓存）',desc:'直接读取固定 releases/0.2.8/release.json，加载 Build 128 并写入本地远程状态，不经过 latest.json/update()。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){
        showLoading('直升 0.2.8…');
        try{
            require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);
            ACFunBoot.loadOnly();
            var r=ac.__directUpgrade028();
            hideLoading();refreshPage(false);
            return 'toast://已直升 '+r.current.version;
        }catch(e){hideLoading();return 'toast://直升失败：'+(e.message||e);}
    })});
    if(plain){
        d.push({title:'InputStream 模式测试',desc:'官方图片 @js=input：绕过 MIME 类型识别，直接把响应流交给图片组件。',pic_url:plain+'@js=input',img:plain+'@js=input',url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'保存当前封面为本地图片',desc:'改用海阔专用 saveImage()，成功后自动刷新诊断页。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('保存封面…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__v027SaveOne(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?'saveImage 成功':'saveImage 失败：'+r.error);}catch(e){hideLoading();return 'toast://saveImage异常：'+(e.message||e);}},plain)});
    }
    if(saved)d.push({title:'saveImage 本地测试',desc:saved,pic_url:saved,img:saved,url:'hiker://empty',col_type:'movie_3'});
    d.push(ac.diagBlock('saveImage 状态','Local='+(saved||'无')+'\nError='+(err||'无')));
    d.push({title:'复制 0.2.7 图片诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nPlain='+getItem('acfun_last_cover_plain_v027','')+'\nFinal='+getItem('acfun_last_cover_final_v027','')+'\nSavePath='+getItem('acfun_v027_save_path','')+'\nSaveErr='+getItem('acfun_v027_save_error','')+'\nDirectBridge='+getItem('acfun_direct_upgrade','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();
