// ACFun v0.4.8 - align current APK 1.9.7 tag chain; retain APP-source stations/comics/short
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.8';
ac.runtimeMode='apk197-tags-048';
try{if(!getItem('acfun_migrated_048','')){['acfun_native_zone_anime','acfun_native_zone_video'].forEach(function(k){try{clearMyVar(k);}catch(e){}});try{if(typeof ac.__v042ClearDataCache==='function')ac.__v042ClearDataCache();}catch(e0){}setItem('acfun_migrated_048','1');}}catch(e){}

// Current 1.9.7 APK exposes video/tags/getTagsZ + video/tagTitleList.
// Older getZoneListByClassifyId/queryVideoByZone is kept only as compatibility fallback.
ac.__v048TagRows=function(cls){
    if(!cls||!cls.id)return [];
    var id=String(cls.id),key='apk197-tags|'+id,c=ac.__v047Read(key,21600,172800);
    if(c.stale&&Array.isArray(c.data))return c.data;
    var out=[],seen={};
    try{
        var cid=/^\d+$/.test(id)?Number(id):id;
        var d=ac.__v043Api('video/tags/getTagsZ',{videoTypeId:cid,classifyId:cid,restricted:0},{timeout:1100,maxAttempts:2}),a=ac.__v047Arr(d);
        for(var i=0;i<a.length;i++){
            var x=a[i]||{};
            var name=String(ac.pick(x,['videoTagName','tagName','tagsTitle','tagTitle','name','title'],'')||'');
            var value=String(ac.pick(x,['videoTagValue','tagValue','videoTagKey','tagKey','value','id'],name)||name);
            if(!name)name=value;
            if(!name||ac.__v047Internal(name))continue;
            var k=value+'|'+name;if(seen[k])continue;seen[k]=1;
            out.push({id:value,name:name,value:value,raw:x,mode:'apkTag'});
        }
    }catch(e){try{setItem('acfun_last_tag_error',String(e.message||e));}catch(e0){}}
    if(out.length){ac.__v047Write(key,out);return out;}
    // Compatibility only: older clients exposed Zone rows.
    try{
        var cid2=/^\d+$/.test(id)?Number(id):id,d2=ac.__v043Api('video/getZoneListByClassifyId',{classifyId:cid2},{timeout:900,maxAttempts:1}),b=ac.__v047Arr(d2);
        for(var j=0;j<b.length;j++){
            var z=b[j]||{},zid=String(ac.pick(z,['zoneId','id'],'')||''),zn=String(ac.pick(z,['zoneTitle','zoneName','title','name'],'')||'');
            if(zid&&zn&&!ac.__v047Internal(zn))out.push({id:zid,name:zn,value:zid,raw:z,mode:'zone'});
        }
    }catch(e2){}
    if(out.length)ac.__v047Write(key,out);return out;
};
ac.__v047Zones=ac.__v048TagRows;

ac.__v048SelectedTag=function(kind,cls){
    var a=ac.__v048TagRows(cls),k=kind==='video'?'acfun_native_zone_video':'acfun_native_zone_anime',sel=String(getMyVar(k,'')||'');
    for(var i=0;i<a.length;i++)if(String(a[i].id)===sel)return a[i];
    return null;
};
ac.__v047Zone=ac.__v048SelectedTag;

ac.__v048ListByTag=function(page,kind,cls,tag){
    var size=Number(getItem('acfun_page_size','8'))||8,sort=Number(ac.__v047Sort()),id=String(cls.id),cid=/^\d+$/.test(id)?Number(id):id;
    if(tag.mode==='zone'){
        var zl=ac.__v047ReqList('video/queryVideoByZone',{page:page,pageNum:page,pageSize:size,zoneId:/^\d+$/.test(String(tag.id))?Number(tag.id):tag.id,classifyId:cid,sortType:sort},'compat-zone|'+kind+'|'+id+'|'+tag.id+'|'+sort+'|'+page);
        if(zl.length)return zl;
    }
    var name=String(tag.name||''),value=String(tag.value||tag.id||name),tries=[
        {tagsTitle:value,tagTitle:value,videoTagValue:value,classifyId:cid,videoTypeId:cid,page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0},
        {tagsTitle:name,tagTitle:name,videoTagName:name,videoTagValue:value,classifyId:cid,videoTypeId:cid,page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0},
        {tagsTitle:name,classifyId:cid,page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0}
    ];
    for(var i=0;i<tries.length;i++){
        var l=ac.__v047ReqList('video/tagTitleList',tries[i],'apk197-tag|'+kind+'|'+id+'|'+value+'|'+name+'|'+i+'|'+sort+'|'+page);
        if(l.length)return l;
    }
    // Older API family fallback only.
    var q=ac.__v047ReqList('video/queryVideoByTag',{page:page,pageNum:page,pageSize:size,tagTitle:name,tagsTitle:name,classifyId:cid,videoTypeId:cid,sortType:sort},'compat-tag|'+kind+'|'+id+'|'+name+'|'+sort+'|'+page);
    return q;
};

ac.__v047CatalogList=function(page,kind){
    page=Number(page||1);var cls=ac.__v047Class(kind);if(!cls)return [];
    var tag=ac.__v048SelectedTag(kind,cls),size=Number(getItem('acfun_page_size','8'))||8,sort=Number(ac.__v047Sort()),id=String(cls.id),cid=/^\d+$/.test(id)?Number(id):id;
    if(tag)return ac.__v048ListByTag(page,kind,cls,tag);
    return ac.__v047ReqList('video/getByClassify',{classifyId:cid,page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0},'class048|'+kind+'|'+id+'|'+sort+'|'+page);
};

// Current APP screenshot presents the short-video surface as 发现 / 推荐.
// Keep both visible while retaining video/list as the APK-confirmed feed endpoint.
ac.__v047ShortTabs=[{name:'发现',value:'4'},{name:'推荐',value:'3'}];
if(!getMyVar('acfun_short_load_type',''))putMyVar('acfun_short_load_type','3');

// Diagnostic breadcrumbs for real-device feedback without exposing internal tests in UI.
try{setItem('acfun_taxonomy_runtime','0.4.8 apk197: station/stations + classTypeList + getTagsZ/tagTitleList + comics + video/list short');}catch(e){}
})();
