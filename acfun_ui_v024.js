// ACFun v0.2.4 CDN image headers patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.4';

ac.__imageBase=function(u){
    u=String(u||'').trim();
    if(!u)return '';
    u=u.replace(/\\\//g,'/');
    if(u.indexOf('//')===0)u='https:'+u;
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').trim();
    if(d){
        if(d.indexOf('//')===0)d='https:'+d;
        if(!/^https?:\/\//i.test(d))d='https://'+d.replace(/^\/+/, '');
        return d.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
    }
    return String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};

ac.__imageHeaders=function(){
    var ua='Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';
    try{if(typeof MOBILE_UA!=='undefined'&&MOBILE_UA)ua=String(MOBILE_UA);}catch(e){}
    return {Referer:'https://acapp.sexbar.site/', 'User-Agent':ua};
};

ac.image=function(u){
    var base=ac.__imageBase(u);
    if(!base)return '';
    if(/^(data:|hiker:|file:)/i.test(base))return base;
    var mode=String(getItem('acfun_image_mode','headers')||'headers');
    if(mode==='direct')return base;
    if(mode==='referer')return base+'@Referer=https://acapp.sexbar.site/';
    return base+'@headers='+JSON.stringify(ac.__imageHeaders());
};

// 记录纯 CDN URL 与海阔最终图片 URL，方便后续只看图片层诊断。
var __v024OldCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x||{}),plain=ac.__imageBase(info.img),final=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(plain)setItem('acfun_last_cover_plain',plain);
    if(final)setItem('acfun_last_cover_resolved',final);
    return __v024OldCard.call(ac,d,x,col);
};

// 设置页增加图片模式，默认使用官方推荐的 @headers。
var __v024OldSettings=ac.settings;
ac.settings=function(){
    var oldSetResult=setResult, captured=null;
    try{
        setResult=function(x){captured=x;};
        __v024OldSettings.apply(ac,arguments);
    }finally{setResult=oldSetResult;}
    var d=Array.isArray(captured)?captured:[];
    var mode=String(getItem('acfun_image_mode','headers')||'headers');
    d.unshift({title:'图片请求模式：'+mode,desc:'默认 headers：显式发送 ACFun Web Referer + 移动端 UA。若 CDN 策略变化可切换 referer / direct 诊断。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['headers','referer','direct'];return 'select://'+JSON.stringify({title:'图片请求模式',options:a,selectedIndex:a.indexOf(getItem('acfun_image_mode','headers')),col:1,js:$.toString(function(){setItem('acfun_image_mode',input);refreshPage(false);})});})});
    oldSetResult(d);
};

// 图片诊断：同时显示三种 URL 语义，便于快速切模式。
ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=getItem('acfun_last_cover_plain','')||ac.__imageBase(raw),final=getItem('acfun_last_cover_resolved','')||ac.image(raw);
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n图片模式：'+getItem('acfun_image_mode','headers')+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('封面地址','CoverRaw='+raw+'\n\nPlain='+plain+'\n\nFinal='+final+'\n\nImgDomain='+getItem('acfun_img_domain','')));
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    if(raw){
        d.push({title:'Headers 模式测试',desc:'Referer + Mobile UA',pic_url:plain+'@headers='+JSON.stringify(ac.__imageHeaders()),img:plain+'@headers='+JSON.stringify(ac.__imageHeaders()),url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'Referer 模式测试',desc:'只带 Referer',pic_url:plain+'@Referer=https://acapp.sexbar.site/',img:plain+'@Referer=https://acapp.sexbar.site/',url:'hiker://empty',col_type:'movie_3'});
        d.push({title:'Direct 模式测试',desc:'纯 CDN URL',pic_url:plain,img:plain,url:'hiker://empty',col_type:'movie_3'});
    }
    d.push({title:'复制图片诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nMode='+getItem('acfun_image_mode','headers')+'\nCoverRaw='+getItem('acfun_last_cover_raw','')+'\nPlain='+getItem('acfun_last_cover_plain','')+'\nFinal='+getItem('acfun_last_cover_resolved','')+'\nImgDomain='+getItem('acfun_img_domain','')+'\nCandidates=\n'+getItem('acfun_last_cover_candidates','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();