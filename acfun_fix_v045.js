// ACFun v0.4.5 - native APP category model + fast cached playback
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.5';
ac.runtimeMode='native-category-fast-play-045';

try{
    if(!getItem('acfun_migrated_045','')){
        ['acfun_tab','acfun_classify_id','acfun_classify_parent','acfun_classify_tag','acfun_classify_child_id'].forEach(function(k){try{clearMyVar(k);}catch(e){}});
        putMyVar('acfun_native_section','featured');
        putMyVar('acfun_native_video_group','rebao');
        putMyVar('acfun_native_anime_tag','同人');
        putMyVar('acfun_native_sort','0');
        setItem('acfun_fast_play','1');
        setItem('acfun_migrated_045','1');
    }
}catch(e){}

ac.__v045Sections=[
    {key:'featured',name:'精选'},
    {key:'comic',name:'漫画'},
    {key:'anime',name:'动漫'},
    {key:'video',name:'视频'},
    {key:'lifan',name:'里番'}
];
ac.__v045AnimeTags=['同人','国漫','3D','MMD','原神','崩坏3','番剧'];
ac.__v045VideoGroups=[
    {key:'rebao',name:'热播',id:'53'},
    {key:'luanlun',name:'乱伦',id:'27'},
    {key:'guochan',name:'国产',id:'28'},
    {key:'wanghuang',name:'网黄',id:'30'},
    {key:'luoli',name:'萝莉',id:'52'},
    {key:'av',name:'AV',id:'57'},
    {key:'chuanmei',name:'传媒',id:'58'},
    {key:'zhongkou',name:'重口',id:'59'}
];
ac.__v045Tags={
    dm:['同人','国漫','3D','MMD','原神','崩坏3','番剧'],
    rebao:['熟女肥逼','人妖伪娘','美胸巨乳','探花偷拍','少女萝莉','强奸迷奸','多人群p','调教SM','泄露流出','媚黑骚逼','孕妇做爱','校园霸凌'],
    luanlun:['父女','母子','兄妹','姐弟','岳母','嫂子','侄女','师生','小姨子','小马拉大车'],
    guochan:['情侣自拍','三级片','户外露出','颜值女神','反差婊','明星换脸','推油按摩','网红博主','偷情出轨','主播大秀','真实换妻','合集盘点'],
    wanghuang:['白桃少女','台北娜娜','柚子猫','桥本香菜','饼干姐姐','小欣奈','御梦子','捅主任','黑椒盖饭','冉冉学姐','鸡教练','唐伯虎','咪妮','玩偶姐姐','情深叉喔','水冰月','米胡桃','白菜妹妹','二代cc'],
    luoli:['护士','白虎嫩妹','女仆','cosplay','洛丽塔','JK学生','丝袜美腿','激情自慰','空姐','泳装','职场OL','骚萝破处'],
    av:['最新AV','人妻偷情','暗黑迷奸','日本JK','无码破解','中文AV','FC2','重口AV'],
    chuanmei:['麻豆传媒','jvid','蜜桃传媒','天美传媒','糖心vlog','性视界'],
    zhongkou:['屎尿','四爱','血腥暴力','肛交菊花','道具','捆绑','男同真爱','虐待','人兽','踩踏虐鸡','恋物足交']
};
ac.__v045Sorts=[
    {name:'最新上传',value:'0'},
    {name:'最多观看',value:'1'},
    {name:'最多点赞',value:'2'}
];
ac.__v045ComicFallback=['最新','热门推荐','韩漫','同人','独家','国漫','日漫'];

ac.__v045SelColor='#E6B800';
ac.__v045Sel=function(name,on){return on?'““””<b><font color="'+ac.__v045SelColor+'">'+name+'</font></b>':name;};
ac.__v045Section=function(){var s=String(getMyVar('acfun_native_section','featured')||'featured');return s;};
ac.__v045Sort=function(){return String(getMyVar('acfun_native_sort','0')||'0');};
ac.__v045Group=function(){
    var k=String(getMyVar('acfun_native_video_group','rebao')||'rebao');
    for(var i=0;i<ac.__v045VideoGroups.length;i++)if(ac.__v045VideoGroups[i].key===k)return ac.__v045VideoGroups[i];
    return ac.__v045VideoGroups[0];
};

ac.__v045CacheRead=function(key,ttl,stale){return typeof ac.__v042Read==='function'?ac.__v042Read(key,ttl,stale):{hit:false,fresh:false,stale:false,data:null};};
ac.__v045CacheWrite=function(key,data){try{if(typeof ac.__v042Write==='function')return ac.__v042Write(key,data);}catch(e){}return false;};
ac.__v045Array=function(v){
    if(Array.isArray(v))return v;
    if(!v||typeof v!=='object')return [];
    var ks=['videoList','videos','comicsList','comicList','list','records','rows','items','data','content'];
    for(var i=0;i<ks.length;i++)if(Array.isArray(v[ks[i]]))return v[ks[i]];
    for(var j=0;j<ks.length;j++)if(v[ks[j]]&&typeof v[ks[j]]==='object'){var a=ac.__v045Array(v[ks[j]]);if(a.length)return a;}
    return [];
};
ac.__v045RequestList=function(path,params,key){
    var ttl=Number(getItem('acfun_page_cache_seconds','300'))||300,stale=Number(getItem('acfun_stale_cache_seconds','3600'))||3600,c=ac.__v045CacheRead(key,ttl,stale);
    if((c.fresh||(getItem('acfun_instant_switch','1')==='1'&&c.stale))&&Array.isArray(c.data))return c.data;
    var data=null,list=[];
    try{data=ac.__v043Api(path,params,{timeout:1100,maxAttempts:2});list=ac.flattenVideos?ac.flattenVideos(data):ac.__v045Array(data);if(!list.length)list=ac.__v045Array(data);}catch(e){try{setItem('acfun_last_list_error',String(e.message||e));}catch(e0){}}
    if(list.length){ac.__v045CacheWrite(key,list);return list;}
    if(c.hit&&Array.isArray(c.data))return c.data;
    return [];
};

ac.__v045ListVideos=function(page){
    page=Number(page||1);var s=ac.__v045Section(),size=Number(getItem('acfun_page_size','8'))||8,sort=ac.__v045Sort(),path='video/getByClassify',params={},key='';
    if(s==='featured'){
        params={classifyId:4,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};
        key='native045|featured|'+sort+'|'+page+'|'+size;
    }else if(s==='anime'){
        var at=String(getMyVar('acfun_native_anime_tag','同人')||'同人');
        if(at){path='video/tagTitleList';params={tagsTitle:at,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};}
        else params={classifyId:2,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};
        key='native045|anime|'+at+'|'+sort+'|'+page+'|'+size;
    }else if(s==='video'){
        var g=ac.__v045Group(),tag=String(getMyVar('acfun_native_video_tag','')||'');
        if(tag){path='video/tagTitleList';params={tagsTitle:tag,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};}
        else params={classifyId:Number(g.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};
        key='native045|video|'+g.key+'|'+tag+'|'+sort+'|'+page+'|'+size;
    }else if(s==='lifan'){
        var lt=String(getMyVar('acfun_native_lifan_tag','')||'');
        if(lt){path='video/tagTitleList';params={tagsTitle:lt,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};}
        else params={classifyId:24,page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(sort),restricted:0};
        key='native045|lifan|'+lt+'|'+sort+'|'+page+'|'+size;
    }else return [];
    return ac.__v045RequestList(path,params,key);
};

ac.__v045CollectNamed=function(v,out,depth){
    out=out||[];depth=depth||0;if(!v||depth>5)return out;
    if(Array.isArray(v)){for(var i=0;i<v.length;i++)ac.__v045CollectNamed(v[i],out,depth+1);return out;}
    if(typeof v!=='object')return out;
    var id=ac.pick(v,['stationId','comicsStationId','classId','comicTypeId','id','typeId'],'');
    var name=ac.pick(v,['stationName','stationTitle','className','comicTypeName','title','name'],'');
    if(name&&String(name).length<30)out.push({id:String(id||''),name:String(name),raw:v});
    var ks=['stations','stationList','classList','list','data','records','rows','items'];
    for(var j=0;j<ks.length;j++)if(v[ks[j]]&&typeof v[ks[j]]==='object')ac.__v045CollectNamed(v[ks[j]],out,depth+1);
    return out;
};
ac.__v045ComicStations=function(){
    var key='comic-stations-v045',c=ac.__v045CacheRead(key,21600,172800),got=[];
    if(c.stale&&Array.isArray(c.data)&&c.data.length)return c.data;
    try{var d=ac.__v043Api('comics/station/getComicsStations',{page:1,pageNum:1,pageSize:30},{timeout:1200,maxAttempts:2});got=ac.__v045CollectNamed(d,[],0);}catch(e){}
    if(!got.length){
        try{var d2=ac.__v043Api('comics/other/classList',{}, {timeout:1200,maxAttempts:2});got=ac.__v045CollectNamed(d2,[],0);}catch(e2){}
    }
    var uniq=[],seen={};for(var i=0;i<got.length;i++){var n=got[i];if(!n.name||seen[n.name])continue;seen[n.name]=1;uniq.push(n);}
    if(!uniq.length)for(var j=0;j<ac.__v045ComicFallback.length;j++)uniq.push({id:'',name:ac.__v045ComicFallback[j]});
    ac.__v045CacheWrite(key,uniq);return uniq;
};
ac.__v045ComicList=function(page){
    page=Number(page||1);var size=Number(getItem('acfun_page_size','8'))||8,stations=ac.__v045ComicStations(),sel=String(getMyVar('acfun_native_comic_station','')||''),st=null;
    if(!sel&&stations.length){sel=stations[0].name;putMyVar('acfun_native_comic_station',sel);}
    for(var i=0;i<stations.length;i++)if(stations[i].name===sel){st=stations[i];break;}
    var key='comic-list-v045|'+sel+'|'+(st?st.id:'')+'|'+page+'|'+size,c=ac.__v045CacheRead(key,300,3600),list=[];if(c.stale&&Array.isArray(c.data))return c.data;
    var data=null;
    if(st&&st.id){
        var candidates=[
            {path:'comics/station/getStationComicsMore',params:{stationId:st.id,comicsStationId:st.id,page:page,pageNum:page,pageSize:size}},
            {path:'comics/base/findList',params:{classId:st.id,comicTypeId:st.id,page:page,pageNum:page,pageSize:size}}
        ];
        for(var k=0;k<candidates.length&&!list.length;k++)try{data=ac.__v043Api(candidates[k].path,candidates[k].params,{timeout:1300,maxAttempts:2});list=ac.__v045Array(data);}catch(e){}
    }else{
        var sort=sel==='热门推荐'?1:0;
        try{data=ac.__v043Api('comics/base/findList',{page:page,pageNum:page,pageSize:size,sortType:sort,className:sel,comicTypeName:sel},{timeout:1300,maxAttempts:2});list=ac.__v045Array(data);}catch(e2){}
    }
    if(list.length){ac.__v045CacheWrite(key,list);return list;}return c.hit&&Array.isArray(c.data)?c.data:[];
};
ac.__v045ComicInfo=function(x){
    x=x||{};var id=ac.pick(x,['comicsId','comicId','id','comic_id'],'');var title=ac.pick(x,['comicsTitle','comicTitle','title','name','comic_title'],'未命名漫画');
    var img=ac.__v042FirstMedia? (ac.__v042FirstMedia(x.coverImg)||ac.__v042FirstMedia(x.cover)||ac.__v042FirstMedia(x.comicCover)||ac.__v042FirstMedia(x.img)||ac.__v042FirstMedia(x.image)) : ac.pick(x,['cover','img','image'],'');
    var desc=ac.pick(x,['subTitle','subtitle','description','desc','authorName','author'],'');return {id:String(id||''),title:String(title||''),img:String(img||''),desc:String(desc||'')};
};
ac.__v045AddComicCard=function(d,x){
    var i=ac.__v045ComicInfo(x),pic=ac.image(i.img);d.push({title:i.title,desc:i.desc,img:pic,col_type:'movie_2',url:'hiker://empty',extra:{comics_id:i.id,comics_title:i.title,comics_data:JSON.stringify(x||{})}});
};

ac.__v045LifanTags=function(){
    var key='lifan-tags-v045',c=ac.__v045CacheRead(key,21600,172800);if(c.stale&&Array.isArray(c.data))return c.data;
    var out=[];try{var d=ac.__v043Api('video/tags/getTagsZ',{videoTypeId:24,classifyId:24},{timeout:1000,maxAttempts:1}),a=ac.__v045Array(d);for(var i=0;i<a.length;i++){var n=ac.pick(a[i],['videoTagName','videoTagValue','tagName','tagsTitle','name','title'],'');if(n&&out.indexOf(String(n))<0)out.push(String(n));}}catch(e){}
    if(out.length)ac.__v045CacheWrite(key,out);return out;
};

ac.__v045TopBar=function(d){
    var cur=ac.__v045Section();
    for(var i=0;i<ac.__v045Sections.length;i++)(function(x){d.push({title:ac.__v045Sel(x.name,cur===x.key),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_native_section',k);putMyVar('acfun_native_sort','0');refreshPage(false);return 'hiker://empty';},x.key)});})(ac.__v045Sections[i]);
};
ac.__v045SortBar=function(d){var cur=ac.__v045Sort();for(var i=0;i<ac.__v045Sorts.length;i++)(function(x){d.push({title:ac.__v045Sel(x.name,cur===x.value),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_native_sort',v);refreshPage(false);return 'hiker://empty';},x.value)});})(ac.__v045Sorts[i]);};
ac.__v045SectionBars=function(d){
    var s=ac.__v045Section();
    if(s==='anime'){
        var cur=String(getMyVar('acfun_native_anime_tag','同人')||'同人');
        for(var i=0;i<ac.__v045AnimeTags.length;i++)(function(t){d.push({title:ac.__v045Sel(t,cur===t),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_native_anime_tag',v);refreshPage(false);return 'hiker://empty';},t)});})(ac.__v045AnimeTags[i]);
        ac.__v045SortBar(d);
    }else if(s==='video'){
        var g=ac.__v045Group();
        for(var j=0;j<ac.__v045VideoGroups.length;j++)(function(x){d.push({title:ac.__v045Sel(x.name,g.key===x.key),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_native_video_group',k);clearMyVar('acfun_native_video_tag');putMyVar('acfun_native_sort','0');refreshPage(false);return 'hiker://empty';},x.key)});})(ac.__v045VideoGroups[j]);
        var tags=ac.__v045Tags[g.key]||[],ct=String(getMyVar('acfun_native_video_tag','')||'');
        if(tags.length){
            d.push({title:ac.__v045Sel('全部',!ct),col_type:'text_4',url:$('hiker://empty#noLoading#').lazyRule(function(){clearMyVar('acfun_native_video_tag');refreshPage(false);return 'hiker://empty';})});
            for(var k=0;k<tags.length;k++)(function(t){d.push({title:ac.__v045Sel(t,ct===t),col_type:'text_4',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_native_video_tag',v);refreshPage(false);return 'hiker://empty';},t)});})(tags[k]);
        }
        ac.__v045SortBar(d);
    }else if(s==='lifan'){
        var lt=ac.__v045LifanTags(),curL=String(getMyVar('acfun_native_lifan_tag','')||'');
        if(lt.length){d.push({title:ac.__v045Sel('全部',!curL),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){clearMyVar('acfun_native_lifan_tag');refreshPage(false);return 'hiker://empty';})});for(var m=0;m<lt.length;m++)(function(t){d.push({title:ac.__v045Sel(t,curL===t),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_native_lifan_tag',v);refreshPage(false);return 'hiker://empty';},t)});})(lt[m]);}
        ac.__v045SortBar(d);
    }else if(s==='comic'){
        var ss=ac.__v045ComicStations(),cs=String(getMyVar('acfun_native_comic_station','')||'');if(!cs&&ss.length)cs=ss[0].name;
        for(var n=0;n<ss.length;n++)(function(x){d.push({title:ac.__v045Sel(x.name,cs===x.name),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_native_comic_station',v);refreshPage(false);return 'hiker://empty';},x.name)});})(ss[n]);
    }else{
        ac.__v045SortBar(d);
    }
};
ac.__v045UtilityBar=function(d){
    [['收藏','acfun_favorites'],['历史','acfun_history'],['设置','acfun_settings']].forEach(function(t){d.push({title:t[0],col_type:'scroll_button',url:'hiker://page/'+t[1]+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:t[0]}});});
    d.push({title:'↻ 刷新',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){try{var dir=String(getPath('hiker://files/cache/acfun_data')).replace(/^file:\/\/+/,'/'),f=new java.io.File(dir),a=f.listFiles();if(a&&a.length>240){for(var i=0;i<Math.min(40,a.length);i++)a[i].delete();}}catch(e){}putMyVar('acfun_native_refresh',String(Date.now()));refreshPage(false);return 'hiker://empty';})});
};

ac.home=function(){
    var d=[],page=typeof MY_PAGE==='undefined'?1:Number(MY_PAGE||1),s=ac.__v045Section();
    if(page===1){
        d.push({title:'搜索',desc:'搜索视频 / UP / 标签',col_type:'input',url:$.toString(function(){if(!input)return 'hiker://empty';return 'hiker://search?s='+encodeURIComponent(input)+'&rule=ACFun';}),extra:{defaultValue:''}});
        ac.__v045TopBar(d);ac.__v045SectionBars(d);ac.__v045UtilityBar(d);
    }
    var list=[];
    try{list=s==='comic'?ac.__v045ComicList(page):ac.__v045ListVideos(page);}catch(e){try{setItem('acfun_last_home_error',String(e.message||e));}catch(e0){}}
    if(s==='comic'){for(var i=0;i<list.length;i++)ac.__v045AddComicCard(d,list[i]);}
    else for(var j=0;j<list.length;j++)ac.addVideoCard(d,list[j],'movie_2');
    if(!list.length&&page===1)d.push({title:s==='comic'?'漫画分类已按 APP 导航恢复，当前漫画列表接口暂未返回数据':'暂未获取到内容',desc:s==='comic'?'后续继续补漫画详情/阅读；视频、动漫、里番分类已使用原 APP 映射。':'可切换上方分类或刷新后重试',col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

ac.__v045PlayerHeaders=function(){var h=ac.__v043GoodHost();return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':h+'/','Origin':h};};
ac.__v045PlayCacheKey=function(id,decode){return 'acfun_hls_'+(typeof ac.__v042Hash==='function'?ac.__v042Hash(String(id)+'|'+String(decode)):String(id).replace(/[^A-Za-z0-9_-]/g,'_'));};
ac.__v045ReadPlayCache=function(key){try{var o=JSON.parse(getItem(key,'{}'))||{};if(o.url&&Date.now()-Number(o.ts||0)<1800000)return String(o.url);}catch(e){}return '';};
ac.__v045WritePlayCache=function(key,url){try{setItem(key,JSON.stringify({ts:Date.now(),url:String(url||'')}));}catch(e){}};
ac.__v045CachedDanmu=function(id){
    if(getItem('acfun_auto_danmu','1')!=='1'||!id)return '';
    var p='hiker://files/cache/acfun_danmu_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.json';
    try{if(fileExist(p))return p;}catch(e){}return '';
};
ac.play=function(id,raw,direct){
    id=String(id||'');var obj=ac.safeJson(raw)||{},path='',watchErr='',cacheErr='';
    if(direct)path=ac.__v043FirstString(direct);
    if(!path)path=ac.__v043FirstString(obj.videoUrl)||ac.__v043FirstString(obj.playUrl)||ac.__v043FirstString(obj.videoUri)||ac.__v043FirstString(obj.path);
    if(!path&&id){
        try{var w=ac.__v043Api('video/can/watch',{videoId:(/^\d+$/.test(id)?Number(id):id)},{method:'POST',write:true,allowGet:false,timeout:1100,maxAttempts:1});path=ac.__v043FirstString(w&&w.path!==undefined?w.path:w)||ac.__v043FirstString(w);}catch(e){watchErr=String(e.message||e);}
    }
    var decode=ac.__v043DecodePlayUrl(path);if(!decode){try{setItem('acfun_last_play_error',watchErr||'no path');}catch(e0){}return 'toast://未获取到可播放地址';}
    var headers=ac.__v045PlayerHeaders(),key=ac.__v045PlayCacheKey(id,decode),url=ac.__v045ReadPlayCache(key),cacheHit=!!url;
    if(!url){
        try{
            var fname='acfun_'+(id||'video')+'_'+(typeof ac.__v042Hash==='function'?ac.__v042Hash(decode).substring(0,8):'hls')+'.m3u8';
            url=cacheM3u8(decode+'#isM3u8#',{headers:headers,timeout:3500},fname);
            if(url)ac.__v045WritePlayCache(key,url);
        }catch(e1){cacheErr=String(e1.message||e1);url=decode;}
    }
    if(!url)url=decode;
    var ret={urls:[String(url)],names:[cacheHit?'极速缓存':'播放'],headers:[headers]};
    var dm='';if(getItem('acfun_fast_play','1')==='1')dm=ac.__v045CachedDanmu(id);else try{dm=ac.danmuFile(id);}catch(e2){}
    if(dm)ret.danmu=dm;
    try{setItem('acfun_last_play_path',path);setItem('acfun_last_play_decode',decode);setItem('acfun_last_play_cached',String(url));setItem('acfun_last_play_cache_hit',cacheHit?'1':'0');setItem('acfun_last_play_error',[watchErr,cacheErr].filter(function(x){return !!x;}).join(' | '));}catch(e3){}
    return JSON.stringify(ret);
};

})();
