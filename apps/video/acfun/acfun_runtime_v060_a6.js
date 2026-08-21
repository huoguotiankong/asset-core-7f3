/**
 * ACFun 0.6.0-alpha6 / Build 157
 * Data repair overlay: category parameter compatibility, short-feed recovery,
 * human-facing taxonomy cleanup, community/fiction resilience.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');

function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function firstMedia(v){try{return ac.__v042FirstMedia?S(ac.__v042FirstMedia(v)||''):''}catch(e){return ''}}
function pageSize(){return Number(getItem('acfun_page_size','12'))||12}
function machineLabel(n){
    n=S(n).replace(/\s+/g,' ').trim();if(!n)return true;
    if(/^(?:dyncat|fictiontag|comictag|videotag|category|classify|tag)[-_][a-z0-9_-]{5,}$/i.test(n))return true;
    if(/^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(n))return true;
    if(!/[\u3400-\u9fff]/.test(n)&&n.length>16&&/[-_]/.test(n)&&/^[a-z0-9_-]+$/i.test(n))return true;
    return false;
}
ac.__v060a6HumanLabel=function(n){n=S(n).replace(/\s+/g,' ').trim();return machineLabel(n)?'':n};

var oldVisible=ac.__v060VisibleCategoryName;
ac.__v060VisibleCategoryName=function(name,kind){
    var n=ac.__v060a6HumanLabel(name);if(!n)return false;
    try{if(typeof oldVisible==='function'&&!oldVisible.call(ac,n,kind))return false}catch(e){}
    return true;
};

function sanitizeRows(rows,kind){
    var out=[],seen={};for(var i=0;i<(rows||[]).length;i++){
        var x=rows[i]||{},id=S(x.id||pick(x.raw,['id','categoryId','tagId','fictionTagId','classifyId','stationId','comicsStationId'],'')),name=ac.__v060a6HumanLabel(x.name||pick(x.raw,['name','title','categoryName','tagName','fictionTagName','classifyName','stationName'],'')||'');
        if(!id||!name||seen[id])continue;if(!ac.__v060VisibleCategoryName(name,kind||''))continue;seen[id]=1;out.push({id:id,name:name,value:x.value,raw:x.raw||x});
    }return out;
}
ac.__v060a6SanitizeRows=sanitizeRows;

// One-time migration away from the old 3/4-only short-video guess. The APK 1.9.7
// binary contains an explicit "pageSize=30 loadType=2" request trace, so Alpha6
// makes loadType=2 the first candidate while retaining 3/4 compatibility fallbacks.
try{
    if(!getItem('acfun_v060_a6_migrated','')){
        putMyVar('acfun_v050_short_load_type','2');
        setItem('acfun_v060_state_acfun_v050_short_load_type','2');
        setItem('acfun_v060_a6_migrated','1');
    }
}catch(e){}

// Keep the user-facing short modes simple. Runtime still tries 2/3/4 when needed.
ac.__v050ShortTabs=[{name:'推荐',id:'2'},{name:'发现',id:'3'}];
var oldHydrate=ac.__v060Hydrate;
ac.__v060Hydrate=function(s){
    if(s==='short'){
        var v=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','2')||'2');
        if(v!=='2'&&v!=='3'&&v!=='4')v='2';putMyVar('acfun_v050_short_load_type',v);return;
    }
    if(typeof oldHydrate==='function')return oldHydrate.call(ac,s);
};
var oldSummary=ac.__v060Summary;
ac.__v060Summary=function(s){
    s=s||ac.__v050Section();if(s==='short'){var v=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','2')||'2');return v==='3'?'发现':'推荐'}
    return typeof oldSummary==='function'?oldSummary.call(ac,s):S(s);
};

function requestRows(tries,kind,key,ttl,stale){
    if(typeof ac.__v060a4Try==='function')return ac.__v060a4Try(tries,kind,key,ttl||180,stale||3600)||[];
    var out=[];for(var i=0;i<(tries||[]).length;i++)try{var d=ac.__v043Api(tries[i].path,tries[i].params||{},{timeout:tries[i].timeout||1200,maxAttempts:2});out=kind==='video'&&ac.flattenVideos?ac.flattenVideos(d):(ac.__v047Arr?ac.__v047Arr(d):ac.arr(d));if(out.length)return out}catch(e){}return out;
}

// Anime/video category list: classTypeList may expose classifyId, videoTypeId or
// classTypeId depending on server node. Try the exact identity carried by the row
// instead of forcing every row into classifyId. Selected tag falls back to the
// parent class instead of presenting a dead blank page.
ac.__v050CatalogList=function(page,kind){
    page=Number(page||1);kind=kind==='video'?'video':'anime';var cls=ac.__v050Class(kind);if(!cls||!cls.id)return [];
    var size=pageSize(),sort=Number(ac.__v050Sort(kind)||1),raw=cls.raw||{},id=S(cls.id),nid=N(id),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0},tag=ac.__v050Tag(kind,cls),tries=[],p,name,value;
    function ids(x){
        if(raw.classifyId!==undefined||raw.classifyID!==undefined)x.classifyId=nid;
        if(raw.videoTypeId!==undefined||raw.videoTypeID!==undefined)x.videoTypeId=nid;
        if(raw.classTypeId!==undefined||raw.classTypeID!==undefined)x.classTypeId=nid;
        if(x.classifyId===undefined&&x.videoTypeId===undefined&&x.classTypeId===undefined){x.classifyId=nid;x.videoTypeId=nid;}
        return x;
    }
    if(tag){
        name=S(tag.name||'');value=S(tag.value||tag.id||name);
        p=ids(copy(base));p.tagsTitle=value;p.tagTitle=value;p.videoTagValue=value;p.videoTagName=name;tries.push({path:'video/tagTitleList',params:p});
        p=ids(copy(base));p.tagsTitle=name;p.tagTitle=name;p.videoTagValue=value;p.videoTagName=name;tries.push({path:'video/tagTitleList',params:p});
        p=ids(copy(base));p.tagsTitle=name;p.tagTitle=name;p.videoTagValue=value;p.videoTagName=name;tries.push({path:'video/queryVideoByTag',params:p});
        var tagged=requestRows(tries,'video','a6-tag|'+kind+'|'+id+'|'+value+'|'+sort+'|'+page,120,3600);
        if(tagged.length)return tagged;
        try{setItem('acfun_v060_a6_filter_fallback',kind+' tag '+name+' -> parent '+S(cls.name))}catch(e0){}
    }
    tries=[];
    p=copy(base);p.classifyId=nid;tries.push({path:'video/getByClassify',params:p});
    p=copy(base);p.videoTypeId=nid;tries.push({path:'video/getByClassify',params:p});
    p=ids(copy(base));tries.push({path:'video/getByClassify',params:p});
    return requestRows(tries,'video','a6-class|'+kind+'|'+id+'|'+sort+'|'+page,180,7200);
};

// Comics: some nodes name the station key comicsStationId. Preserve embedded
// comics from station payloads, then try both stationId/comicsStationId contracts.
ac.__v050ComicList=function(page){
    page=Number(page||1);var st=ac.__v050ComicStation();if(!st||!st.id)return [];
    var size=pageSize(),sort=Number(ac.__v050Sort('comic')||1),id=S(st.id),nid=N(id),embedded=[];
    try{embedded=ac.__v060a4Collect?ac.__v060a4Collect(st.raw||{},'comic'):[]}catch(e){}
    if(page===1&&embedded.length)return embedded.slice(0,size);
    var base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},p,tries=[];
    p=copy(base);p.stationId=nid;tries.push({path:'comics/station/getStationComicsMore',params:p});
    p=copy(base);p.comicsStationId=nid;tries.push({path:'comics/station/getStationComicsMore',params:p});
    p=copy(base);p.stationId=nid;p.comicsStationId=nid;tries.push({path:'comics/station/getStationComicsMore',params:p});
    p=copy(base);p.stationId=nid;p.comicsStationId=nid;tries.push({path:'comics/base/findList',params:p});
    return requestRows(tries,'comic','a6-comic|'+id+'|'+sort+'|'+page,180,7200);
};

// Short feed: loadType=2 + pageSize=30 first, then the old 3/4 guesses. Do not
// cache empty responses as success; __v060a4Try already preserves stale data.
ac.__v050ShortList=function(page){
    page=Number(page||1);var current=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','2')||'2');
    var modes=[current,'2','3','4'],seen={},tries=[],base={page:page,pageNum:page,pageSize:30,limit:30};
    for(var i=0;i<modes.length;i++){
        var m=modes[i];if(seen[m])continue;seen[m]=1;
        var p=copy(base);p.loadType=N(m);tries.push({path:'video/list',params:p});
        p=copy(base);p.loadType=N(m);p.videoContentType='shortVideo';p.contentType='shortVideo';p.videoType='shortVideo';tries.push({path:'video/list',params:p});
    }
    var rows=requestRows(tries,'video','a6-short|'+current+'|'+page,90,1800);
    if(rows.length)try{setItem('acfun_v060_short_last_ok','alpha6|'+current+'|'+page+'|'+rows.length)}catch(e){}
    return rows;
};

var oldFictionTags=ac.__v060a4FictionTags;
ac.__v060a4FictionTags=function(){var rows=[];try{rows=typeof oldFictionTags==='function'?oldFictionTags.call(ac):[]}catch(e){}return sanitizeRows(rows,'fiction')};
var oldCommunityCats=ac.__v060a4CommunityCategories;
ac.__v060a4CommunityCategories=function(){var rows=[];try{rows=typeof oldCommunityCats==='function'?oldCommunityCats.call(ac):[]}catch(e){}return sanitizeRows(rows,'community')};

function stateVal(k,def){return S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||def||'')}
function validSelected(rows,id){if(!id)return '';for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return S(id);return ''}

ac.__v060a4FictionList=function(page,mode){
    page=Number(page||1);mode=mode==='audio'?'audio':'fiction';var size=pageSize(),tags=ac.__v060a4FictionTags(),tag=validSelected(tags,stateVal('acfun_v060_fiction_tag_'+mode,'')),sort=Number(stateVal('acfun_v060_fiction_sort_'+mode,'1')||1),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},tries=[],p;
    if(tag){base.tagId=N(tag);base.fictionTagId=N(tag);base.categoryId=N(tag)}
    if(mode==='audio'){
        p=copy(base);p.fictionType=2;p.isAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.fictionType='audio';p.longFormAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.type=2;p.audio=1;tries.push({path:'fiction/base/findList',params:p});
    }else{
        p=copy(base);p.fictionType=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.type=1;tries.push({path:'fiction/base/findList',params:p});
        tries.push({path:'fiction/base/findList',params:copy(base)});
    }
    return requestRows(tries,'fiction','a6-fiction|'+mode+'|'+tag+'|'+sort+'|'+page,180,7200);
};

ac.__v060a4DynamicList=function(page){
    page=Number(page||1);var cats=ac.__v060a4CommunityCategories(),cat=validSelected(cats,stateVal('acfun_v060_dynamic_category','')),sort=stateVal('acfun_v060_dynamic_sort','hot'),size=20,base={page:page,pageNum:page,pageSize:size,limit:size},tries=[],p;
    function addSort(x){x.sortType=sort;return x}
    p=addSort(copy(base));if(cat){p.categoryId=N(cat);p.dynamicType=N(cat)}tries.push({path:'community/dynamic/list',params:p});
    p=copy(base);p.sortType=sort==='hot'?1:0;if(cat){p.categoryId=N(cat);p.dynamicType=N(cat);p.dynamicTypeId=N(cat)}tries.push({path:'community/dynamic/list',params:p});
    if(cat){p=addSort(copy(base));tries.push({path:'community/dynamic/list',params:p});}
    return requestRows(tries,'dynamic','a6-dynamic|'+cat+'|'+sort+'|'+page,120,3600);
};

// Prefer actual content pictures over avatar/badge/frame images in community feed.
var oldDynamicInfo=ac.__v060a4DynamicInfo;
ac.__v060a4DynamicInfo=function(x){
    x=x||{};var info=typeof oldDynamicInfo==='function'?oldDynamicInfo.call(ac,x):{id:'',title:'',content:'',img:'',author:'',raw:x,kind:'dynamic'},img='';
    var keys=['dynamicImage','dynamicImg','contentImage','contentImg','coverImg','cover','pictures','pictureList','imageList','images'];
    for(var i=0;i<keys.length&&!img;i++)if(x[keys[i]]!==undefined)img=firstMedia(x[keys[i]]);
    if(img)info.img=img;else if(info.img&&/avatar|head|badge|frame|vip/i.test(info.img))info.img='';
    info.avatar=firstMedia(pick(x,['avatar','avatarUrl','headImg','userImg'],''));
    info.like=S(pick(x,['likeNum','likes','likeCount','praiseNum'],'')||'');
    info.comment=S(pick(x,['commentNum','comments','commentCount'],'')||'');
    info.time=S(pick(x,['createTime','createdAt','publishTime','time'],'')||'');
    return info;
};

try{
    setItem('acfun_v060_runtime_a6','category-contracts + short-loadType2 + human-taxonomy + resource-fallbacks');
    setItem('acfun_test_runtime','0.6.0-alpha6 runtime');
}catch(e){}
})();
