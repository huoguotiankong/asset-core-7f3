// ACFun v0.2.3 final image URL patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.3';

// v0.2.2 已正确识别 coverImg[0]，但 release 未继承 v0.2.1 的 image()，
// 因而回落到旧核心并追加 @Referer=。这里把图片 URL 解析独立成最终层。
ac.image=function(u){
    u=String(u||'').trim();
    if(!u)return '';
    u=u.replace(/\\\//g,'/');
    // 清理旧版本可能遗留的海阔图片伪参数。
    u=u.replace(/@Referer=.*$/i,'').replace(/@Headers=.*$/i,'').trim();
    if(u.indexOf('//')===0)u='https:'+u;
    if(/^(data:|hiker:|file:)/i.test(u))return u;
    if(/^https?:\/\//i.test(u))return u;

    var domains=[];
    var saved=String(getItem('acfun_img_domain','')||'').trim();
    if(saved)domains.push(saved);
    try{
        var cfg=ac.fetchConfig(false)||{};
        ['imgDomain','imageDomain','cdnDomain','fileDomain','staticDomain','picDomain','coverDomain'].forEach(function(k){
            var v=ac.deepFind(cfg,[k],0);if(typeof v==='string'&&v)domains.push(v);
        });
    }catch(e){}
    domains=ac.uniq(domains);
    for(var i=0;i<domains.length;i++){
        var d=String(domains[i]||'').trim();if(!d)continue;
        d=d.replace(/@Referer=.*$/i,'').replace(/@Headers=.*$/i,'');
        if(d.indexOf('//')===0)d='https:'+d;
        if(!/^https?:\/\//i.test(d))d='https://'+d.replace(/^\/+/, '');
        d=d.replace(/\/+$/,'');
        if(d)return d+'/'+u.replace(/^\/+/, '');
    }
    return String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};

// 重新记录解析后的最终地址，便于确认手机实际运行的 image()。
var __v023Card=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x||{}),pic=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(pic)setItem('acfun_last_cover_resolved',String(pic));
    return __v023Card.call(ac,d,x,col);
};

// 详情页原函数内部会动态调用 ac.image，因此这里只更新诊断版本标记。
setItem('acfun_runtime_version',ac.build);
})();