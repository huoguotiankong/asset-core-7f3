// ACFun v0.2.6 local binary image cache patch + v0.2.7 hotfix bridge
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.6';
ac.hotfix='stream-v027-bridge';

ac.__stripImageSuffix=function(u){
    u=String(u||'');
    var p=u.indexOf('@js=');if(p>=0)u=u.substring(0,p);
    p=u.indexOf('@headers=');if(p>=0)u=u.substring(0,p);
    p=u.indexOf('@Referer=');if(p>=0)u=u.substring(0,p);
    return u;
};

ac.__cacheImagePath=function(url){
    var plain=ac.__stripImageSuffix(url),ext='jpg',m=plain.match(/\.([a-zA-Z0-9]{2,5})(?:\?|#|$)/);
    if(m&&/^(?:jpe?g|png|webp|gif|avif|bmp)$/i.test(m[1]))ext=m[1].toLowerCase();
    return 'hiker://files/cache/acfun_img_'+md5(plain)+'.'+ext;
};

ac.__cachedImage=function(url){
    var plain=ac.__stripImageSuffix(url);if(!plain)return '';
    var p=ac.__cacheImagePath(plain);
    try{if(fileExist(p))return getPath(p);}catch(e){}
    return '';
};

ac.__prepareLocalImages=function(items,scope){
    items=Array.isArray(items)?items:[];var tasks=[],seen={};scope=String(scope||'page');
    for(var i=0;i<items.length;i++){
        var it=items[i]||{},pic=it.pic_url||it.img||'';
        var plain=ac.__stripImageSuffix(pic);
        if(!/^https?:\/\//i.test(plain)||!/\.asigoo\.com\//i.test(plain))continue;
        var p=ac.__cacheImagePath(plain),local='';
        try{if(fileExist(p))local=getPath(p);}catch(e0){}
        it.extra=it.extra||{};
        if(!it.extra.id)it.extra.id='acfun_local_img_'+scope+'_'+i+'_'+md5(plain).substring(0,10);
        if(local){it.pic_url=local;it.img=local;continue;}
        var key=plain+'|'+p;if(seen[key])continue;seen[key]=1;
        tasks.push({
            id:it.extra.id,
            func:function(param){
                var u=param.url,path=param.path,headers=param.headers||{};
                try{
                    if(fileExist(path))return getPath(path);
                    downloadFile(u,path,headers);
                    if(!fileExist(path))return '';
                    return getPath(path);
                }catch(e){return '';}
            },
            param:{url:plain,path:p,headers:(ac.__imageHeaders?ac.__imageHeaders():{})}
        });
    }
    return tasks;
};

ac.__startLocalImageTasks=function(tasks){
    if(!tasks||!tasks.length)return;
    try{
        batchExecute(tasks,{
            param:{},
            func:function(param,id,error,result){
                if(!error&&result){
                    try{updateItem(id,{pic_url:result,img:result});}catch(e){}
                }
            }
        });
    }catch(e){setItem('acfun_img_cache_error',String(e.message||e));}
};

ac.__wrapResultImages=function(name){
    var old=ac[name];if(typeof old!=='function'||old.__acfunLocalWrapped)return;
    var wrap=function(){
        var oldSet=setResult,captured=null,args=arguments,ret;
        try{
            setResult=function(x){captured=x;};
            ret=old.apply(ac,args);
        }finally{setResult=oldSet;}
        if(Array.isArray(captured)){
            var tasks=ac.__prepareLocalImages(captured,name+'_'+(typeof MY_PAGE!=='undefined'?MY_PAGE:1));
            oldSet(captured);
            ac.__startLocalImageTasks(tasks);
        }
        return ret;
    };
    wrap.__acfunLocalWrapped=true;ac[name]=wrap;
};

['home','search','detail'].forEach(ac.__wrapResultImages);

var __v026OldLocalPage=ac.localPage;
if(typeof __v026OldLocalPage==='function'){
    ac.localPage=function(mode){
        var oldSet=setResult,captured=null,ret;
        try{setResult=function(x){captured=x;};ret=__v026OldLocalPage.call(ac,mode);}finally{setResult=oldSet;}
        if(Array.isArray(captured)){
            var tasks=ac.__prepareLocalImages(captured,'local_'+mode);
            oldSet(captured);ac.__startLocalImageTasks(tasks);
        }
        return ret;
    };
}

// v0.2.7 bridge: octet-stream images are handed to Hiker as raw InputStream.
ac.__v027Plain=function(u){
    u=String(u||'').trim();if(!u)return '';
    u=ac.__stripImageSuffix(u);
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
ac.__v027Local=function(url){var p=ac.__v027CachePath(url);try{if(p&&fileExist(p))return getPath(p);}catch(e){}return '';};
ac.image=function(u){
    var plain=ac.__v027Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    var local=ac.__v027Local(plain);if(local)return local;
    if(/\.asigoo\.com\//i.test(plain))return plain+'@js=input';
    return plain;
};

var __v026BridgeCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var before=d.length;__v026BridgeCard.call(ac,d,x,col);
    if(d.length>before){
        var it=d[d.length-1],info=ac.itemInfo(x||{}),pic=ac.image(info.img);
        it.pic_url=pic;it.img=pic;
        if(info.img)setItem('acfun_last_cover_raw',String(info.img));
        setItem('acfun_last_cover_plain_v027',ac.__v027Plain(info.img));
        setItem('acfun_last_cover_final_v027',pic);
    }
};

ac.__v027SaveOne=function(url){
    var plain=ac.__v027Plain(url),p=ac.__v027CachePath(plain);
    setItem('acfun_v027_save_error','');setItem('acfun_v027_save_path','');
    if(!plain)return {ok:false,error:'empty url'};
    try{
        try{if(fileExist(p)){var old=getPath(p);setItem('acfun_v027_save_path',old);return {ok:true,path:old,cached:true};}}catch(e0){}
        saveImage(plain,p);
        if(fileExist(p)){var local=getPath(p);setItem('acfun_v027_save_path',local);return {ok:true,path:local,cached:false};}
        var msg='saveImage finished but file not found: '+p;setItem('acfun_v027_save_error',msg);return {ok:false,error:msg};
    }catch(e){var msg2=String(e.message||e);setItem('acfun_v027_save_error',msg2);return {ok:false,error:msg2};}
};

// Cache-busting updater bridge for devices stuck on an older cached remote manager/latest.json.
ac.__forceRemoteUpdate=function(){
    require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);
    var m=ACFunBoot.requireManager(),cfg=JSON.parse(JSON.stringify(ACFUN_HC_CONFIG));
    cfg.latestPath='apps/video/acfun/latest.json?acfun_cb='+new Date().getTime();
    return m.update(cfg);
};

var __v026BridgeNav=ac.nav;
if(typeof __v026BridgeNav==='function'){
    ac.nav=function(d){
        __v026BridgeNav.call(ac,d);
        d.push({title:'强制更新',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('强制读取云端最新版…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__forceRemoteUpdate();hideLoading();if(r&&r.ok){refreshPage(false);return 'toast://'+(r.changed?('已强制更新到 '+r.current.version):('当前版本 '+r.current.version));}return 'toast://强制更新失败：'+((r&&r.error)||'unknown');}catch(e){hideLoading();return 'toast://强制更新异常：'+(e.message||e);}})});
    };
}

ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片流诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain_v027','')||ac.__v027Plain(raw),final=getItem('acfun_last_cover_final_v027','')||ac.image(raw);
    var saved=getItem('acfun_v027_save_path',''),err=getItem('acfun_v027_save_error','');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n热修复：'+ac.hotfix+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('图片流','CoverRaw='+raw+'\n\nPlain='+plain+'\n\nFinal='+final+'\n\nContent-Type探测：application/octet-stream'));
    if(plain){
        d.push({title:'InputStream 模式测试',desc:'使用 @js=input 直接把响应流交给海阔图片组件。',pic_url:plain+'@js=input',img:plain+'@js=input',url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'保存当前封面为本地图片',desc:'使用海阔专用 saveImage()。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(url){showLoading('保存封面…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__v027SaveOne(url);hideLoading();refreshPage(false);return 'toast://'+(r.ok?'saveImage 成功':'saveImage 失败：'+r.error);}catch(e){hideLoading();return 'toast://saveImage异常：'+(e.message||e);}},plain)});
    }
    if(saved)d.push({title:'saveImage 本地测试',desc:saved,pic_url:saved,img:saved,url:'hiker://empty',col_type:'movie_3'});
    d.push(ac.diagBlock('saveImage 状态','Local='+(saved||'无')+'\nError='+(err||'无')));
    d.push({title:'强制检查并升级云端最新版',desc:'绕过旧 latest.json/更新管理器缓存；当前正常检测若仍显示 0.2.6，就使用这里。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('强制检查最新版…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v3.js?v=3',{headers:{'Cache-Control':'no-cache'}},300);ACFunBoot.loadOnly();var r=ac.__forceRemoteUpdate();hideLoading();refreshPage(false);return 'toast://'+(r&&r.ok?(r.changed?('已升级到 '+r.current.version):('当前 '+r.current.version)):('失败：'+((r&&r.error)||'unknown')));}catch(e){hideLoading();return 'toast://异常：'+(e.message||e);}})});
    d.push({title:'复制图片诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nHotfix=stream-v027-bridge\nPlain='+getItem('acfun_last_cover_plain_v027','')+'\nFinal='+getItem('acfun_last_cover_final_v027','')+'\nSavePath='+getItem('acfun_v027_save_path','')+'\nSaveErr='+getItem('acfun_v027_save_error','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();