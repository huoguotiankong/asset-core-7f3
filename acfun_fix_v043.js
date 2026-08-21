// ACFun v0.4.3 - functional foundation fixes: category/play/search/perf
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.3';
ac.runtimeMode='functional-foundation-043';

// One-time performance migration: fewer cards on first load. User can raise it in settings later.
try{
    if(!getItem('acfun_perf_migrated_043','')){
        if(String(getItem('acfun_page_size','12'))==='12')setItem('acfun_page_size','8');
        setItem('acfun_perf_migrated_043','1');
    }
}catch(e){}

// -----------------------------------------------------------------------------
// Exact API fast path. Once a good host has been learned, known endpoints should
// not walk generic route candidates on every page switch.
// -----------------------------------------------------------------------------
ac.__v043GoodHost=function(){
    var h='';
    try{h=ac.normalizeBase(getItem('acfun_good_host',''));}catch(e){}
    if(!h)h=String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'');
    return h;
};
ac.__v043ExactApi=function(path,params,opt){
    params=params||{};opt=opt||{};
    var host=ac.__v043GoodHost(),p=String(path||'').replace(/^\/+/,''),url=host+'/api/'+p;
    if(!opt.noAuth&&!/^user\/traveler\/?$/i.test(p))ac.ensureTraveler();
    var method=String(opt.method||(opt.write?'POST':'GET')).toUpperCase();
    var target=url,options={timeout:Number(opt.timeout||1200),headers:ac.headers(!!opt.noAuth),method:method,withStatusCode:true};
    if(method==='GET')target=buildUrl(url,params);else options.body=JSON.stringify(params||{});
    var got=fetch(target,options),wrap=ac.safeJson(got);
    if(!wrap)throw new Error('EMPTY '+p);
    var status=Number(wrap.statusCode||wrap.status||0),body=wrap.body!==undefined?wrap.body:got;
    body=body===undefined||body===null?'':String(body);
    if(status<200||status>=300)throw new Error('HTTP '+status+' '+p);
    var jr=ac.safeJson(body);if(jr)ac.storeToken(jr);
    var data=ac.parseResp(body);if(data===null||data===undefined)throw new Error('EMPTY_DATA '+p);
    try{setItem('acfun_good_host',host);setItem('acfun_last_api',target);setItem('acfun_last_status',String(status));putMyVar('acfun_last_api_path',p);putMyVar('acfun_last_api_ms','direct');}catch(e){}
    return data;
};
ac.__v043Api=function(path,params,opt){
    var good='';try{good=getItem('acfun_good_host','');}catch(e){}
    if(good&&getItem('acfun_fast_api','1')==='1'){
        try{return ac.__v043ExactApi(path,params,opt);}catch(e0){try{setItem('acfun_last_direct_error',String(e0.message||e0));}catch(e1){}}
    }
    return ac.api(path,params,opt||{});
};

// -----------------------------------------------------------------------------
// Category model. Real response uses classifyTitle; old UI did not read it and
// therefore displayed 分类1/分类2... . Normalize it once and cache it.
// -----------------------------------------------------------------------------
ac.__v043FallbackCategories=[
    {classifyId:'4',classifyTitle:'精选'},
    {classifyId:'2',classifyTitle:'动漫'},
    {classifyId:'24',classifyTitle:'里番'},
    {classifyId:'53',classifyTitle:'热播'},
    {classifyId:'27',classifyTitle:'乱伦'},
    {classifyId:'28',classifyTitle:'国产'},
    {classifyId:'30',classifyTitle:'网黄'},
    {classifyId:'52',classifyTitle:'萝莉'},
    {classifyId:'57',classifyTitle:'AV'},
    {classifyId:'58',classifyTitle:'传媒'},
    {classifyId:'59',classifyTitle:'重口'}
];
ac.__v043CatFallbackName=function(id){
    id=String(id||'');for(var i=0;i<ac.__v043FallbackCategories.length;i++)if(String(ac.__v043FallbackCategories[i].classifyId)===id)return ac.__v043FallbackCategories[i].classifyTitle;return '';
};
ac.categoryList=function(){
    var key='category-list-v043',c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,43200,172800):{hit:false,stale:false,data:null});
    if(c.stale&&Array.isArray(c.data)&&c.data.length)return c.data;
    var raw=[],out=[];
    try{raw=ac.arr(ac.__v043Api('video/classifyList',{restricted:0},{timeout:1000,maxAttempts:2}));}catch(e){try{setItem('acfun_last_classify_error',String(e.message||e));}catch(e0){}}
    for(var i=0;i<raw.length;i++){
        var x=raw[i]||{},id=ac.pick(x,['classifyId','id','videoTypeId','typeId'],''),name=ac.pick(x,['classifyTitle','classifyName','videoTypeName','name','title'],'');
        if(!name)name=ac.__v043CatFallbackName(id);
        if(!id||!name)continue;
        out.push({classifyId:String(id),classifyTitle:String(name),classifyName:String(name),name:String(name),classifyType:ac.pick(x,['classifyType','type','videoType'],''),raw:x});
    }
    if(!out.length)out=ac.__v043FallbackCategories.map(function(x){return {classifyId:x.classifyId,classifyTitle:x.classifyTitle,classifyName:x.classifyTitle,name:x.classifyTitle};});
    if(typeof ac.__v042Write==='function')ac.__v042Write(key,out);
    return out;
};

// -----------------------------------------------------------------------------
// Stable classified list. Known route is /api/video/getByClassify. Keep current
// cache-first behavior but avoid obsolete /video/list fallback for normal tabs.
// -----------------------------------------------------------------------------
var __v043PreviousVideoList=ac.videoList;
ac.__v043ListKey=function(tab,page,cid){return 'list-v043|'+String(tab||'recommend')+'|'+String(cid||'')+'|'+String(page||1)+'|'+String(getItem('acfun_page_size','8'));};
ac.videoList=function(tab,page){
    tab=String(tab||'recommend');page=Number(page||1);if(tab==='short')return __v043PreviousVideoList.call(ac,tab,page);
    var cid=String(getMyVar('acfun_classify_id','')||'');
    if(tab!=='classify')cid='4';
    if(tab==='classify'&&!cid){var cs=ac.categoryList();if(cs.length){cid=String(cs[0].classifyId||'4');putMyVar('acfun_classify_id',cid);}else cid='4';}
    var key=ac.__v043ListKey(tab,page,cid),ttl=Number(getItem('acfun_page_cache_seconds','300'))||300,stale=Number(getItem('acfun_stale_cache_seconds','3600'))||3600,c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,ttl,stale):{hit:false,fresh:false,stale:false,data:null});
    var force=getMyVar('acfun_force_v043_key','')===key;if(force)clearMyVar('acfun_force_v043_key');
    if(!force&&(c.fresh||(getItem('acfun_instant_switch','1')==='1'&&c.stale))&&Array.isArray(c.data)){putMyVar('acfun_last_list_source',c.fresh?'cache043':'stale043');return c.data;}
    var size=Number(getItem('acfun_page_size','8'))||8,sort=tab==='new'?1:(tab==='hot'?2:0),params={page:page,pageNum:page,pageSize:size,limit:size,classifyId:Number(cid)||cid,sortType:sort,restricted:0},list=[];
    try{var data=ac.__v043Api('video/getByClassify',params,{timeout:1100,maxAttempts:2});list=ac.flattenVideos?ac.flattenVideos(data):ac.arr(data);if(!list.length)list=ac.arr(data);}catch(e){try{setItem('acfun_last_list_error',String(e.message||e));}catch(e0){}}
    if(list.length&&typeof ac.__v042Write==='function'){ac.__v042Write(key,list);putMyVar('acfun_last_list_source','network043');return list;}
    if(c.hit&&Array.isArray(c.data))return c.data;
    return list;
};

// -----------------------------------------------------------------------------
// Search: same API family has a direct title endpoint. Use it first, then keep
// the old keyword endpoints as fallbacks.
// -----------------------------------------------------------------------------
ac.search=function(){
    var d=[],kw=getParam('kw','')||getParam('s','')||getMyVar('acfun_search_kw','');if(!kw){try{kw=decodeURIComponent(getParam('q',''));}catch(e){}}
    putMyVar('acfun_search_kw',kw);var size=Number(getItem('acfun_page_size','8'))||8,key='search-v043|'+kw+'|'+MY_PAGE+'|'+size,c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,180,1800):{hit:false,stale:false,data:null}),list=[];
    if(c.stale&&Array.isArray(c.data))list=c.data;
    if(!list.length&&kw){
        try{var q=ac.__v043Api('video/queryVideoByTitle',{page:MY_PAGE,pageNum:MY_PAGE,pageSize:size,title:kw,videoType:1},{timeout:1100,maxAttempts:2});list=ac.flattenVideos?ac.flattenVideos(q):ac.arr(q);if(!list.length)list=ac.arr(q);}catch(e0){}
        if(!list.length){var p={searchWord:kw,keyword:kw,keyWord:kw,page:MY_PAGE,pageNum:MY_PAGE,pageSize:size,limit:size,searchType:1};try{var q2=ac.__v043Api('search/keyWordV2',p,{timeout:1100,maxAttempts:2});list=ac.flattenVideos?ac.flattenVideos(q2):ac.arr(q2);if(!list.length)list=ac.arr(q2);}catch(e1){}}
        if(list.length&&typeof ac.__v042Write==='function')ac.__v042Write(key,list);
    }
    list.forEach(function(x){ac.addVideoCard(d,x,'movie_2');});
    if(!list.length&&MY_PAGE===1)d.push({title:'没有搜索到结果',desc:'关键词：'+kw,col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

// -----------------------------------------------------------------------------
// Playback. Real flow from the same API family:
// POST /api/video/can/watch {videoId} -> data.path -> /api/m3u8/h5/decode?path=
// A relative jpc/jpd/...m3u8 path must never be passed straight to the player.
// -----------------------------------------------------------------------------
var __v043OldPlay=ac.play;
ac.__v043FirstString=function(v){
    if(v===undefined||v===null)return '';
    if(typeof v==='string'||typeof v==='number')return String(v);
    if(Array.isArray(v)){for(var i=0;i<v.length;i++){var s=ac.__v043FirstString(v[i]);if(s)return s;}return '';}
    if(typeof v==='object'){var ks=['path','videoUrl','playUrl','url','videoUri','m3u8'];for(var j=0;j<ks.length;j++)if(v[ks[j]]!==undefined){var s2=ac.__v043FirstString(v[ks[j]]);if(s2)return s2;}}
    return '';
};
ac.__v043DecodePlayUrl=function(path){
    path=String(path||'').trim();if(!path)return '';
    var host=ac.__v043GoodHost();
    if(/^https?:\/\//i.test(path)){
        if(path.indexOf('/api/m3u8/')>=0)return path;
        if(/\.m3u8(?:\?|$)/i.test(path))return path;
    }
    return host+'/api/m3u8/h5/decode?path='+encodeURIComponent(path);
};
ac.__v043PlayerHeaders=function(){var h=ac.__v043GoodHost();return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':h+'/','Origin':h};};
ac.play=function(id,raw,direct){
    var obj=ac.safeJson(raw)||{},path=String(direct||'').trim();
    if(!path)path=ac.__v043FirstString(obj.videoUrl)||ac.__v043FirstString(obj.playUrl)||ac.__v043FirstString(obj.videoUri)||ac.__v043FirstString(obj.path);
    // List objects commonly carry relative jpc/jpd/...m3u8. That is already enough to build the decode URL.
    if(!path&&id){
        try{
            var watch=ac.__v043Api('video/can/watch',{videoId:(/^\d+$/.test(String(id))?Number(id):id)},{method:'POST',write:true,allowGet:false,timeout:1400,maxAttempts:2});
            path=ac.__v043FirstString(watch&&watch.path!==undefined?watch.path:watch)||ac.__v043FirstString(watch);
        }catch(e){try{setItem('acfun_last_play_error',String(e.message||e));}catch(e0){}}
    }
    var url=ac.__v043DecodePlayUrl(path);
    if(!url&&typeof __v043OldPlay==='function')return __v043OldPlay.call(ac,id,raw,direct);
    if(!url)return 'toast://未获取到播放地址';
    var ret={urls:[url],names:['播放'],headers:[ac.__v043PlayerHeaders()]};
    try{var dm=ac.danmuFile(id);if(dm)ret.danmu=dm;}catch(e1){}
    return JSON.stringify(ret);
};

// -----------------------------------------------------------------------------
// Comments: cache short-term and avoid full loading animation when sorting.
// -----------------------------------------------------------------------------
ac.comments=function(){
    var d=[],id=String(MY_PARAMS.video_id||''),sort=getMyVar('acfun_comment_sort','hot');setPageTitle('评论 · '+String(MY_PARAMS.video_title||''));
    if(MY_PAGE===1){[['最热','hot'],['最新','new']].forEach(function(t){d.push({title:sort===t[1]?'““””<b><font color="#17A673">'+t[0]+'</font></b>':t[0],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_comment_sort',v);refreshPage(false);return 'hiker://empty';},t[1])});});}
    var key='comments-v043|'+id+'|'+sort+'|'+MY_PAGE,c=(typeof ac.__v042Read==='function'?ac.__v042Read(key,90,600):{hit:false,stale:false,data:null}),list=[];
    if(c.stale&&Array.isArray(c.data))list=c.data;
    if(!list.length){try{var r=ac.__v043Api('video/commentList',{videoId:(/^\d+$/.test(id)?Number(id):id),pageNum:MY_PAGE,page:MY_PAGE,pageSize:24,sortType:sort},{timeout:1100,maxAttempts:2});list=ac.arr(r);if(list.length&&typeof ac.__v042Write==='function')ac.__v042Write(key,list);}catch(e){try{setItem('acfun_last_comment_error',String(e.message||e));}catch(e0){}}}
    list.forEach(function(x){var u=x.user||x.userInfo||{},name=ac.pick(u,['nickname','name','userName'],ac.pick(x,['userName','nickname'],'匿名')),text=ac.pick(x,['content','commentContent','comment_content','text'],''),tm=ac.pick(x,['createTime','time','createdAt'],''),lk=ac.pick(x,['likeNum','likes','likeCount'],'');var title='<b>'+name+'</b>'+(lk?'　♥ '+ac.fmtNum(lk):'')+'<br>'+String(text||'').replace(/\n/g,'<br>')+(tm?'<br><small>'+tm+'</small>':'');d.push({title:title,col_type:'rich_text',url:'hiker://empty'});});
    if(!list.length&&MY_PAGE===1)d.push({title:'暂无评论或评论接口暂不可用',col_type:'text_center_1',url:'hiker://empty'});
    setResult(d);
};

// Diagnostics and settings hints for this functional foundation release.
var __v043OldSettings=ac.settings;
ac.settings=function(){
    if(typeof __v043OldSettings==='function'){
        try{return __v043OldSettings.apply(ac,arguments);}catch(e){}
    }
};
var __v043OldDiag=ac.diag;
ac.diag=function(){
    if(typeof __v043OldDiag==='function')return __v043OldDiag.apply(ac,arguments);
};
})();
