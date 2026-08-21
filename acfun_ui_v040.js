// ACFun v0.4.0 - persistent local decrypted image cache
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.0';
ac.imageCipher='xor:2020-zq3-888 / prefix 100 / persistent local cache';
ac.imageCardMode='img-only-cache';

// Lower the first-load burst only when the user has never chosen a page size.
if(!getItem('acfun_page_size','')) setItem('acfun_page_size','12');

ac.__v040Plain=function(u){
    if(typeof ac.__cleanPlainImage==='function')return ac.__cleanPlainImage(u);
    u=String(u||'').trim();if(!u)return '';
    var marks=['@js=','@headers=','@Referer=','@Cookie='];
    for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(/^https?:\/\//i.test(u))return u;
    var d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    return d?d+'/'+u.replace(/^\/+/, ''):u;
};

ac.__v040Hash=function(s){
    s=String(s||'');var h1=0x811c9dc5,h2=5381;
    for(var i=0;i<s.length;i++){
        var c=s.charCodeAt(i);
        h1^=c;h1=(h1+(h1<<1)+(h1<<4)+(h1<<7)+(h1<<8)+(h1<<24))>>>0;
        h2=(((h2<<5)+h2)^c)>>>0;
    }
    return ('00000000'+h1.toString(16)).slice(-8)+('00000000'+h2.toString(16)).slice(-8);
};

ac.__v040CachePath=function(url){
    var m=String(url||'').match(/\.([a-zA-Z0-9]{3,4})(?:[?#]|$)/),ext=m?m[1].toLowerCase():'jpg';
    if(!/^(jpg|jpeg|png|webp|gif)$/.test(ext))ext='jpg';
    return 'hiker://files/cache/acfun_cover/'+ac.__v040Hash(url)+'.'+ext;
};

ac.__v040Headers=function(){
    return {'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};
};

ac.image=function(u){
    var plain=ac.__v040Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain))return plain;
    if(!/\.asigoo\.com\//i.test(plain))return plain;
    var cache=ac.__v040CachePath(plain);
    try{if(fileExist(cache))return getPath(cache);}catch(e0){}
    var abs='';try{abs=getPath(cache);}catch(e1){}
    return $(plain,ac.__v040Headers()).image(function(cacheAbs){
        return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);
    },abs);
};

ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(pic)setItem('acfun_last_cover_resolved',String(pic));
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:ac.detailUrl(info),col_type:col||getItem('acfun_card_style','movie_2'),extra:{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,longClick:[{title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);return ac.favoriteFromParams();})}]}});
};

ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||getParam('id',''));
    var fb=ac.safeJson(MY_PARAMS.video_data)||{};
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
    if(MY_PARAMS.video_img&&!fb.cover)fb.cover=MY_PARAMS.video_img;
    if(MY_PARAMS.video_uri&&!fb.videoUri)fb.videoUri=MY_PARAMS.video_uri;
    var obj=ac.getDetail(id,fb),info=ac.itemInfo(obj);
    if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);
    setPageTitle(info.title);try{setPagePicUrl(pic);}catch(e){}
    var desc=[];if(info.author)desc.push('UP：'+info.author);if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);var it={id:vid,title:title,img:img,uri:uri,data:raw};ac.addHistory(it);return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.deepFind(obj,['videoTags','tags','tagList'],0),names=[];
    if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__tagName?ac.__tagName(tags[ti]):ac.str(ac.pick(tags[ti],['tagName','name','title','label','text','value'],''),'');if(nm&&names.indexOf(nm)<0)names.push(nm);}
    if(names.length)d.push({title:'标签：'+names.join(' · '),col_type:'long_text',url:'hiker://empty'});
    var rel=[];try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e2){}
    if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片缓存诊断');
    var raw=getItem('acfun_last_cover_raw',''),plain=ac.__v040Plain(raw),cp=plain?ac.__v040CachePath(plain):'',hit=false;
    try{hit=!!(cp&&fileExist(cp));}catch(e){}
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n结构：single cache image adapter\n图片算法：'+ac.imageCipher+'\n默认每页：'+getItem('acfun_page_size','12')));
    d.push(ac.diagBlock('当前封面缓存','Plain='+plain+'\nCache='+cp+'\nCacheHit='+(hit?'YES':'NO')));
    if(plain)d.push({title:'当前封面缓存测试',desc:hit?'直接读取本地 file://':'首次加载后会自动落盘缓存',img:ac.image(plain),url:'hiker://empty',col_type:'movie_3'});
    d.push({title:'复制 0.4.0 缓存诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nCacheHit='+(getItem('acfun_last_cover_raw','')?'check page':'no cover');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};
})();
