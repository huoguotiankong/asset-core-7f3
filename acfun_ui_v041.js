// ACFun v0.4.1 - performance + feature enhancement
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.1';
ac.imageCipher='xor:2020-zq3-888 / prefix100 / _480 thumbnail + persistent cache';
ac.imageCardMode='fast-thumb-cache';

// ---------- fast common-schema parser ---------------------------------------
var __v041SlowItemInfo=ac.itemInfo;
ac.__v041FirstMedia=function(v){
    if(v===undefined||v===null)return '';
    if(typeof v==='string'||typeof v==='number')return String(v);
    if(Array.isArray(v)){
        for(var i=0;i<v.length&&i<4;i++){var s=ac.__v041FirstMedia(v[i]);if(s)return s;}
        return '';
    }
    if(typeof v==='object'){
        var ks=['url','src','path','image','img','cover','value'];
        for(var j=0;j<ks.length;j++)if(v[ks[j]]!==undefined){var s2=ac.__v041FirstMedia(v[ks[j]]);if(s2)return s2;}
    }
    return '';
};
ac.itemInfo=function(x){
    x=x||{};
    var v=x.video||x.videoInfo||x.content||x;if(v&&v.video&&typeof v.video==='object')v=v.video;
    if(!v||typeof v!=='object')return __v041SlowItemInfo.call(ac,x);
    var u=x.user||x.userInfo||x.blogger||v.user||v.userInfo||{};
    var id=ac.pick(v,['videoId','id','vid','lsjVideoId'],ac.pick(x,['videoId','id','vid'],''));
    var title=ac.pick(v,['videoTitle','title','name','video_title'],ac.pick(x,['title','name'],''));
    var img=ac.__v041FirstMedia(v.coverImg)||ac.__v041FirstMedia(v.videoCover)||ac.__v041FirstMedia(v.cover)||ac.__v041FirstMedia(v.coverUrl)||ac.__v041FirstMedia(v.img)||ac.__v041FirstMedia(v.image)||ac.__v041FirstMedia(v.poster)||ac.__v041FirstMedia(v.verticalImg)||ac.__v041FirstMedia(x.coverImg)||ac.__v041FirstMedia(x.cover)||ac.__v041FirstMedia(x.img);
    if(!img||(!id&&!title))return __v041SlowItemInfo.call(ac,x);
    var author=ac.pick(u,['nickname','nickName','name','username','userName'],ac.pick(v,['author','userName','nickname'],''));
    var duration=ac.pick(v,['duration','videoDuration','video_duration','playTime'],'');
    var watch=ac.pick(v,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'],'');
    var like=ac.pick(v,['likeNum','likes','favoriteNum'],'');
    var uri=ac.pick(v,['videoUri','videoUrl','playUrl','url','movieurl'],'');
    return {id:String(id||''),title:String(title||'未命名'),img:String(img||''),author:String(author||''),duration:String(duration||''),watch:String(watch||''),like:String(like||''),uri:String(uri||''),raw:v};
};

// ---------- API fast-fail once a good host is known --------------------------
var __v041ApiRaw=ac.apiRaw;
ac.apiRaw=function(path,params,opt){
    var o={},k;opt=opt||{};for(k in opt)o[k]=opt[k];
    if(getItem('acfun_good_host','')&&getItem('acfun_fast_api','1')==='1'){
        var cap=Number(getItem('acfun_fast_attempts','5'))||5;
        if(!o.maxAttempts||Number(o.maxAttempts)>cap)o.maxAttempts=cap;
        if(!o.timeout)o.timeout=850;
    }
    var ts=Date.now(),r=__v041ApiRaw.call(ac,path,params,o);
    try{putMyVar('acfun_last_api_ms',String(Date.now()-ts));putMyVar('acfun_last_api_path',String(path));}catch(e){}
    return r;
};

// ---------- thumbnail + persistent cache ------------------------------------
ac.__v041Plain=function(u){
    u=String(u||'').trim();if(!u)return '';
    u=u.replace(/\\\//g,'/');
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(u.indexOf('//')===0)u='https:'+u;
    if(/^(data:|hiker:|file:)/i.test(u)||/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    if(!d){try{var cfg=ac.fetchConfig(false)||{};d=String(ac.deepFind(cfg,['imgDomain','imageDomain','cdnDomain'],0)||'').replace(/\/+$/,'');}catch(e){}}
    return d?d+'/'+u.replace(/^\/+/, ''):String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};
ac.__v041Hash=function(s){
    s=String(s||'');var h1=0x811c9dc5,h2=5381;
    for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1^=c;h1=(h1+(h1<<1)+(h1<<4)+(h1<<7)+(h1<<8)+(h1<<24))>>>0;h2=(((h2<<5)+h2)^c)>>>0;}
    return ('00000000'+h1.toString(16)).slice(-8)+('00000000'+h2.toString(16)).slice(-8);
};
ac.__v041CachePath=function(url){return 'hiker://files/cache/acfun_cover/'+ac.__v041Hash(url)+'.jpg';};
ac.__v041Thumb=function(url){
    if(getItem('acfun_image_quality','480')==='original')return url;
    if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;
    var q=url.indexOf('?');if(q>=0)return url.substring(0,q)+'_480'+url.substring(q);
    return url+'_480';
};
ac.__v041Headers=function(){return {'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};};
ac.image=function(u){
    var plain=ac.__v041Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain)||!/\.asigoo\.com\//i.test(plain))return plain;
    // Reuse full-size 0.4.0 cache first if it already exists.
    var old=ac.__v041CachePath(plain);try{if(fileExist(old))return getPath(old);}catch(e0){}
    var target=ac.__v041Thumb(plain),cache=ac.__v041CachePath(target);
    try{if(fileExist(cache))return getPath(cache);}catch(e1){}
    var abs='';try{abs=getPath(cache);}catch(e2){}
    return $(target,ac.__v041Headers()).image(function(cacheAbs){return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);},abs);
};

// ---------- cards: no per-card storage writes --------------------------------
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    // Only keep one sample for diagnostics; avoid synchronous setItem on every card.
    try{if(!getMyVar('acfun_v041_diag_cover','')){putMyVar('acfun_v041_diag_cover',String(info.img||''));setItem('acfun_last_cover_raw',String(info.img||''));}}catch(e){}
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:ac.detailUrl(info),col_type:col||getItem('acfun_card_style','movie_2'),extra:{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,longClick:[{title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);return ac.favoriteFromParams();})}]}});
};

ac.__v041TagName=function(t){
    if(t===undefined||t===null)return '';
    if(typeof t==='string'||typeof t==='number')return String(t);
    if(typeof t==='object'){var a=['tagName','name','title','label','text','value'];for(var i=0;i<a.length;i++)if(t[a[i]]!==undefined&&typeof t[a[i]]!=='object')return String(t[a[i]]);}
    return '';
};

// ---------- detail: fewer recommendations + richer actions -------------------
ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||getParam('id',''));
    var fb=ac.safeJson(MY_PARAMS.video_data)||{};
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
    if(MY_PARAMS.video_img&&!fb.coverImg)fb.coverImg=[MY_PARAMS.video_img];
    if(MY_PARAMS.video_uri&&!fb.videoUrl)fb.videoUrl=MY_PARAMS.video_uri;
    var obj=ac.getDetail(id,fb),info=ac.itemInfo(obj);if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);setPageTitle(info.title);try{setPagePicUrl(pic);}catch(e){}
    var desc=[];if(info.author)desc.push('UP：'+info.author);if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));if(info.duration)desc.push(info.duration);
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);ac.addHistory({id:vid,title:title,img:img,uri:uri,data:raw});return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+info.title});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.pick(obj,['videoTags','tags','tagList'],[]);if(!Array.isArray(tags)&&obj.video)tags=ac.pick(obj.video,['videoTags','tags','tagList'],[]);
    var names=[];if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__v041TagName(tags[ti]);if(nm&&names.indexOf(nm)<0)names.push(nm);}
    if(names.length){d.push({title:'标签',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});names.slice(0,10).forEach(function(nm){d.push({title:nm,col_type:'scroll_button',url:'hiker://search?s='+encodeURIComponent(nm)+'&rule=ACFun'});});}
    var relCount=Number(getItem('acfun_related_count','6'))||6,rel=[];
    if(relCount>0){try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:relCount},{timeout:850,maxAttempts:5}));}catch(e2){}}
    if(rel.length)d.push({title:'相关推荐',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.slice(0,relCount).forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

// ---------- richer settings --------------------------------------------------
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');
    d.push({title:'性能与图片',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'图片质量：'+(getItem('acfun_image_quality','480')==='original'?'原图':'极速 480'),desc:'列表优先使用接口家族支持的 _480 缩略图；原图更清晰但首次加载明显更慢。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['极速 480','原图'];return 'select://'+JSON.stringify({title:'图片质量',options:a,selectedIndex:getItem('acfun_image_quality','480')==='original'?1:0,col:1,js:$.toString(function(){setItem('acfun_image_quality',input==='原图'?'original':'480');refreshPage(false);})});})});
    d.push({title:'快速接口模式：'+(getItem('acfun_fast_api','1')==='1'?'开':'关'),desc:'已找到可用 API Host 后减少失败线路重试；接口变动时可临时关闭。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_fast_api',getItem('acfun_fast_api','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'每页数量：'+getItem('acfun_page_size','12'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['8','10','12','20'];return 'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_size','12'))),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false);})});})});
    d.push({title:'相关推荐数量：'+getItem('acfun_related_count','6'),desc:'设为 0 可让详情页更快；推荐 6。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['0','3','6','9','12'];return 'select://'+JSON.stringify({title:'相关推荐数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_related_count','6'))),col:1,js:$.toString(function(){setItem('acfun_related_count',input);refreshPage(false);})});})});
    d.push({title:'清理封面缓存',desc:'删除 ACFun 已解密封面缓存；之后图片会重新下载。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{var p=getPath('hiker://files/cache/acfun_cover');p=String(p).replace(/^file:\/\/+/,'/');var root=new java.io.File(p);function del(f){if(!f||!f.exists())return;var a=f.listFiles();if(a)for(var i=0;i<a.length;i++)del(a[i]);f.delete();}del(root);return 'toast://封面缓存已清理';}catch(e){return 'toast://清理失败：'+(e.message||e);}})});
    d.push({title:'播放与内容',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'自动弹幕：'+(getItem('acfun_auto_danmu','1')==='1'?'开':'关'),desc:'播放时自动加载海阔 JSON 弹幕。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_auto_danmu',getItem('acfun_auto_danmu','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'卡片样式：'+getItem('acfun_card_style','movie_2'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['movie_2','movie_3','movie_3_marquee'];return 'select://'+JSON.stringify({title:'首页卡片样式',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_card_style','movie_2'))),col:1,js:$.toString(function(){setItem('acfun_card_style',input);refreshPage(false);})});})});
    d.push({title:'接口与维护',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'接口诊断',desc:'最近接口耗时：'+getMyVar('acfun_last_api_ms','-')+'ms / '+getMyVar('acfun_last_api_path',''),col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'刷新动态域名',desc:'当前 API：'+(getItem('acfun_good_host','')||'尚未探测成功'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){['acfun_remote_config','acfun_remote_config_ts','acfun_good_host','acfun_traveler_try_ts'].forEach(function(k){setItem(k,'');});refreshPage(false);return 'toast://接口缓存已清空';})});
    d.push({title:'远程更新',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'版本 '+ac.build,desc:'Performance Runtime：3 个业务模块；480 缩略图 + 解密缓存 + 快速字段解析 + API 快速失败。',col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

// ---------- lightweight diagnostics -----------------------------------------
ac.diag=function(){
    var d=[];setPageTitle('ACFun 性能诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v041Plain(raw),target=plain?ac.__v041Thumb(plain):'',cp=target?ac.__v041CachePath(target):'',hit=false;
    try{hit=!!(cp&&fileExist(cp));}catch(e){}
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n图片：'+ac.imageCipher+'\n图片质量：'+getItem('acfun_image_quality','480')+'\n快速接口：'+getItem('acfun_fast_api','1')+'\n最近 API：'+getMyVar('acfun_last_api_path','')+' / '+getMyVar('acfun_last_api_ms','-')+'ms'));
    d.push(ac.diagBlock('封面缓存','Raw='+raw+'\nTarget='+target+'\nCache='+cp+'\nCacheHit='+(hit?'YES':'NO')));
    if(raw)d.push({title:'当前缩略图/缓存测试',img:ac.image(raw),url:'hiker://empty',col_type:'movie_3'});
    setResult(d);
};

var __v041Home=ac.home;
ac.home=function(){if(typeof MY_PAGE==='undefined'||MY_PAGE==1){try{clearMyVar('acfun_v041_diag_cover');}catch(e){}}return __v041Home.apply(ac,arguments);};
})();
