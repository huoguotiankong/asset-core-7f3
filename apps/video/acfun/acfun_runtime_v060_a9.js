/** ACFun 0.6.0-alpha9 / Build 160 - strict taxonomy + fiction chapter/media recovery + dynamic seed merge. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function pageSize(){return Number(getItem('acfun_page_size','12'))||12}
function saveState(k,v){if(v){putMyVar(k,S(v));setItem('acfun_v060_state_'+k,S(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}}
function stateVal(k,def){return S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||def||'')}
function visibleName(n,kind){n=S(n).replace(/\s+/g,' ').trim();if(!n)return false;try{if(ac.__v060VisibleCategoryName&&!ac.__v060VisibleCategoryName(n,kind||''))return false}catch(e){}return true}
function cacheRead(key,ttl,stale){try{return ac.__v042Read?ac.__v042Read('a9|'+key,ttl||300,stale||3600):{hit:false,fresh:false,stale:false,data:null}}catch(e){return{hit:false,fresh:false,stale:false,data:null}}}
function cacheWrite(key,data){if(!data)return;try{if(ac.__v042Write)ac.__v042Write('a9|'+key,data)}catch(e){}}
function apiRaw(path,params,method){
    try{
        var opt={timeout:1600,maxAttempts:2};
        if(method==='POST'){opt.method='POST';opt.write=true;opt.allowGet=false}
        return ac.__v043Api(path,params||{},opt)
    }catch(e){
        try{setItem('acfun_v060_a9_last_error',path+' '+(method||'GET')+': '+S(e.message||e))}catch(e0){}
        return null
    }
}
function firstRaw(specs,key,ttl,stale){
    var c=cacheRead('raw|'+key,ttl,stale),old=c.hit?c.data:null;if(c.fresh&&old)return old;
    for(var i=0;i<(specs||[]).length;i++){
        var s=specs[i]||{},r=apiRaw(s.path,s.params||{},s.method||'GET');
        if(r&&typeof r==='object'){cacheWrite('raw|'+key,r);try{setItem('acfun_v060_a9_last_route',key+' -> '+s.path+' '+(s.method||'GET')+' #'+i)}catch(e){}return r}
    }
    return old||null
}
function walk(root,fn,depth,guard){
    depth=depth||0;guard=guard||{n:0};if(root===undefined||root===null||depth>10||guard.n>16000)return;
    if(Array.isArray(root)){for(var i=0;i<root.length;i++)walk(root[i],fn,depth+1,guard);return}
    if(typeof root!=='object')return;guard.n++;fn(root);
    for(var k in root)if(root[k]&&typeof root[k]==='object')walk(root[k],fn,depth+1,guard)
}
function uniqueRows(rows){
    var out=[],seen={};for(var i=0;i<(rows||[]).length;i++){var x=rows[i]||{},id=S(x.id),name=S(x.name).replace(/\s+/g,' ').trim();if(!id||!name)continue;var k=id+'|'+name;if(seen[k])continue;seen[k]=1;out.push(x)}return out
}
function extractTaxonomy(root,kind,expectedType){
    var out=[];walk(root,function(x){
        var id='',name='',rawType='';
        if(kind==='station'){
            id=S(pick(x,['stationId','stationID','comicsStationId'],'')||'');
            name=S(pick(x,['stationName','stationTitle'],'')||'');
            if(!id&&name)id=S(pick(x,['id'],'')||'')
        }else if(kind==='comic'){
            id=S(pick(x,['comicsStationId','stationId'],'')||'');
            name=S(pick(x,['stationName','stationTitle','comicsStationName'],'')||'');
            if(!id&&name)id=S(pick(x,['id'],'')||'')
        }else if(kind==='class'){
            id=S(pick(x,['classifyId','classTypeId','videoTypeId','typeId'],'')||'');
            name=S(pick(x,['classifyTitle','classTypeTitle','classifyName','classTypeName','videoTypeName'],'')||'');
            rawType=S(pick(x,['type','videoType','contentType'],'')||'');
            if(!id&&name)id=S(pick(x,['id'],'')||'')
        }else if(kind==='tag'){
            id=S(pick(x,['videoTagValue','tagValue','videoTagKey','tagKey','tagId'],'')||'');
            name=S(pick(x,['videoTagName','tagName','tagsTitle','tagTitle'],'')||'');
            if(!id&&name)id=S(pick(x,['value','id'],name)||name)
        }else if(kind==='fiction'){
            id=S(pick(x,['fictionTagId','tagId','categoryId','classifyId'],'')||'');
            name=S(pick(x,['fictionTagName','tagName','categoryName','classifyName'],'')||'');
            if(!id&&name)id=S(pick(x,['id'],'')||'')
        }else if(kind==='community'){
            id=S(pick(x,['categoryId','dynamicTypeId','dynamicType'],'')||'');
            name=S(pick(x,['categoryName','dynamicTypeName'],'')||'');
            if(!id&&name)id=S(pick(x,['id'],'')||'')
        }
        name=name.replace(/\s+/g,' ').trim();
        if(!id||!name||!visibleName(name,kind))return;
        if(kind==='class'&&expectedType&&rawType&&/^\d+$/.test(rawType)&&Number(rawType)!==Number(expectedType))return;
        out.push({id:id,name:name,raw:x})
    });
    return uniqueRows(out)
}
function rowsCache(key,ttl,stale,loader){
    var c=cacheRead('rows|'+key,ttl,stale),old=c.hit&&Array.isArray(c.data)?c.data:[];if(c.fresh&&old.length)return old;
    var rows=[];try{rows=loader()||[]}catch(e){}if(rows.length){cacheWrite('rows|'+key,rows);return rows}return old
}
function methodSpecs(path,params){return[{path:path,params:params,method:'GET'},{path:path,params:params,method:'POST'}]}

function firstTaxonomy(specs,kind,expectedType,key){
    for(var i=0;i<(specs||[]).length;i++){
        var sp=specs[i]||{},raw=apiRaw(sp.path,sp.params||{},sp.method||'GET'),rows=extractTaxonomy(raw,kind,expectedType);
        if(rows.length){try{setItem('acfun_v060_a9_last_route',key+' -> '+sp.path+' '+(sp.method||'GET')+' #'+i+' ('+rows.length+')')}catch(e){}return rows}
    }
    return[]
}

ac.__v050Stations=function(restricted){
    var r=restricted?1:0,key='station-taxonomy|'+r;
    return rowsCache(key,21600,604800,function(){
        var specs=r?[
            {path:'station/stations',params:{classifyId:24,restricted:1,page:1,pageNum:1,pageSize:100},method:'GET'},
            {path:'station/stations',params:{classifyId:24,restricted:1,page:1,pageNum:1,pageSize:100},method:'POST'},
            {path:'station/stations',params:{classifyId:24,page:1,pageNum:1,pageSize:100},method:'GET'}
        ]:[
            {path:'station/stations',params:{classifyId:4,restricted:0,page:1,pageNum:1,pageSize:100},method:'GET'},
            {path:'station/stations',params:{classifyId:4,restricted:0,page:1,pageNum:1,pageSize:100},method:'POST'},
            {path:'station/stations',params:{classifyId:4,page:1,pageNum:1,pageSize:100},method:'GET'}
        ];
        return firstTaxonomy(specs,'station',0,'station-taxonomy|'+r)
    })
};
ac.__v050Station=function(restricted){
    var rows=ac.__v050Stations(restricted),key=restricted?'acfun_v050_station_lifan':'acfun_v050_station_featured',id=stateVal(key,''),hit=null;
    for(var i=0;i<rows.length;i++)if(S(rows[i].id)===id){hit=rows[i];break}
    if(!hit&&rows.length){hit=rows[0];saveState(key,hit.id)}
    return hit
};
ac.__v050Catalog=function(kind){
    kind=kind==='video'?'video':'anime';var type=kind==='video'?4:2;
    return rowsCache('catalog|'+kind,21600,604800,function(){
        return firstTaxonomy(methodSpecs('video/classTypeList',{type:type,restricted:0}),'class',type,'catalog|'+kind)
    })
};
ac.__v050Class=function(kind){
    kind=kind==='video'?'video':'anime';var rows=ac.__v050Catalog(kind),key=kind==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',id=stateVal(key,''),hit=null;
    for(var i=0;i<rows.length;i++)if(S(rows[i].id)===id){hit=rows[i];break}
    if(!hit&&rows.length){hit=rows[0];saveState(key,hit.id);saveState(kind==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime','')}
    return hit
};
ac.__v050Tags=function(kind,cls){
    kind=kind==='video'?'video':'anime';if(!cls||!cls.id)return[];var cid=S(cls.id);
    return rowsCache('tags|'+kind+'|'+cid,21600,604800,function(){
        var p={videoTypeId:N(cid),classifyId:N(cid),restricted:0},rows=firstTaxonomy(methodSpecs('video/tags/getTagsZ',p),'tag',0,'tags|'+kind+'|'+cid),out=[];
        for(var i=0;i<rows.length;i++){var x=rows[i],parent=S(pick(x.raw,['classifyId','videoTypeId','classTypeId','parentId'],'')||'');if(parent&&parent!==cid)continue;out.push(x)}return out
    })
};
ac.__v050Tag=function(kind,cls){
    var rows=ac.__v050Tags(kind,cls),key=kind==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',id=stateVal(key,'');
    for(var i=0;i<rows.length;i++)if(S(rows[i].id)===id)return rows[i];
    if(id)saveState(key,'');return null
};
ac.__v050ComicStations=function(){
    return rowsCache('comic-taxonomy',21600,604800,function(){
        return firstTaxonomy([
            {path:'comics/station/getComicsStations',params:{},method:'GET'},
            {path:'comics/station/getComicsStations',params:{},method:'POST'},
            {path:'comics/station/getComicsStations',params:{page:1,pageNum:1,pageSize:100},method:'GET'}
        ],'comic',0,'comic-taxonomy')
    })
};
ac.__v050ComicStation=function(){
    var rows=ac.__v050ComicStations(),key='acfun_v050_comic_station',id=stateVal(key,''),hit=null;
    for(var i=0;i<rows.length;i++)if(S(rows[i].id)===id){hit=rows[i];break}
    if(!hit&&rows.length){hit=rows[0];saveState(key,hit.id)}
    return hit
};
ac.__v060a4FictionTags=function(){
    return rowsCache('fiction-tags',21600,604800,function(){
        return firstTaxonomy([
            {path:'fiction/other/tagList',params:{},method:'GET'},
            {path:'fiction/other/tagList',params:{fictionType:1},method:'GET'},
            {path:'fiction/other/tagList',params:{},method:'POST'}
        ],'fiction',0,'fiction-tags')
    })
};
ac.__v060a4CommunityCategories=function(){
    return rowsCache('community-categories',21600,604800,function(){
        var rows=firstTaxonomy([
            {path:'dynamic/category/tree',params:{},method:'GET'},
            {path:'dynamic/category/tree',params:{},method:'POST'},
            {path:'dynamic/category/tree',params:{page:1,pageSize:100},method:'GET'}
        ],'community',0,'community-categories'),out=[];
        for(var i=0;i<rows.length;i++){var n=S(rows[i].name);if(/^(?:全部|动态|社区|帖子)$/i.test(n))continue;out.push(rows[i])}return out
    })
};

function collectRows(data,kind){
    try{
        if(kind==='fiction'&&ac.__v060a9CollectFiction)return ac.__v060a9CollectFiction(data);
        return ac.__v060a4Collect?ac.__v060a4Collect(data,kind):[]
    }catch(e){return[]}
}
function requestRows(specs,kind,key,ttl,stale){
    var c=cacheRead('feed|'+key,ttl,stale),old=c.hit&&Array.isArray(c.data)?c.data:[];if(c.fresh&&old.length)return old;
    for(var i=0;i<(specs||[]).length;i++){var s=specs[i],raw=apiRaw(s.path,s.params||{},s.method||'GET'),rows=collectRows(raw,kind);if(rows.length){cacheWrite('feed|'+key,rows);try{setItem('acfun_v060_a9_last_route',key+' -> '+s.path+' '+(s.method||'GET')+' #'+i+' ('+rows.length+')')}catch(e){}return rows}}
    return old
}
ac.__v050StationList=function(page,restricted){
    page=Number(page||1);var st=ac.__v050Station(restricted);if(!st)return[];var size=pageSize(),sort=Number(ac.__v050Sort(restricted?'lifan':'featured')||1),embedded=collectRows(st.raw,'video');
    if(page===1&&embedded.length)return embedded.slice(0,size);
    return requestRows([{path:'station/getStationMore',params:{stationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},method:'GET'}],'video','station|'+(restricted?1:0)+'|'+st.id+'|'+sort+'|'+page,180,7200)
};
ac.__v050CatalogList=function(page,kind){
    page=Number(page||1);kind=kind==='video'?'video':'anime';var cls=ac.__v050Class(kind);if(!cls)return[];var size=pageSize(),sort=Number(ac.__v050Sort(kind)||1),cid=S(cls.id),tag=ac.__v050Tag(kind,cls),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort,restricted:0},specs=[],p;
    function addIds(x){var r=cls.raw||{};if(r.classifyId!==undefined)x.classifyId=N(cid);if(r.videoTypeId!==undefined)x.videoTypeId=N(cid);if(r.classTypeId!==undefined)x.classTypeId=N(cid);if(x.classifyId===undefined&&x.videoTypeId===undefined&&x.classTypeId===undefined){x.classifyId=N(cid);x.videoTypeId=N(cid)}return x}
    if(tag){
        var name=S(tag.name),value=S(tag.id||name);p=addIds(copy(base));p.tagsTitle=value;p.tagTitle=value;p.videoTagValue=value;p.videoTagName=name;specs.push({path:'video/tagTitleList',params:p,method:'GET'});
        p=addIds(copy(base));p.tagsTitle=name;p.tagTitle=name;p.videoTagValue=value;p.videoTagName=name;specs.push({path:'video/tagTitleList',params:p,method:'POST'})
    }else{
        p=copy(base);p.classifyId=N(cid);specs.push({path:'video/getByClassify',params:p,method:'GET'});
        p=copy(base);p.videoTypeId=N(cid);specs.push({path:'video/getByClassify',params:p,method:'GET'});
        p=addIds(copy(base));specs.push({path:'video/getByClassify',params:p,method:'POST'})
    }
    var rows=requestRows(specs,'video','catalog|'+kind+'|'+cid+'|'+(tag?S(tag.id):'all')+'|'+sort+'|'+page,120,3600);
    if(!rows.length&&tag){saveState(kind==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime','');return ac.__v050CatalogList(page,kind)}
    return rows
};
ac.__v050ComicList=function(page){
    page=Number(page||1);var st=ac.__v050ComicStation();if(!st)return[];var size=pageSize(),sort=Number(ac.__v050Sort('comic')||1),embedded=collectRows(st.raw,'comic');
    if(page===1&&embedded.length)return embedded.slice(0,size);
    var base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},specs=[
        {path:'comics/station/getStationComicsMore',params:{stationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},method:'GET'},
        {path:'comics/station/getStationComicsMore',params:{comicsStationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},method:'GET'},
        {path:'comics/base/findList',params:{stationId:N(st.id),comicsStationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},method:'POST'}
    ];return requestRows(specs,'comic','comic|'+st.id+'|'+sort+'|'+page,180,7200)
};

ac.__v060a9CollectFiction=function(root){
    var out=[],seen={};walk(root,function(x){
        var id=S(pick(x,['fictionId','fictionID','bookId','novelId'],'')||''),title=S(pick(x,['fictionTitle','bookTitle','bookName','novelTitle','novelName'],'')||'');
        if(!id&&x&&x.id!==undefined){var hint=x.fictionType!==undefined||x.fictionUrl!==undefined||x.chapterNum!==undefined||x.chapterCount!==undefined||x.fictionImg!==undefined||x.longFormAudio!==undefined||x.authorName!==undefined;if(hint)id=S(x.id)}
        if(!title)title=S(pick(x,['title','name'],'')||'');
        if(!id||!title)return;var k=id+'|'+title;if(seen[k])return;seen[k]=1;out.push(x)
    });return out
};
function imageField(x){
    var keys=['fictionImg','fictionCover','fictionCoverImg','coverImg','coverUrl','cover','verticalCover','poster','picUrl','imageUrl','img','image','thumb'];
    for(var i=0;i<keys.length;i++){var v=x?x[keys[i]]:null,u='';try{if(ac.__v042FirstMedia)u=S(ac.__v042FirstMedia(v)||'')}catch(e){}if(!u&&typeof v==='string')u=S(v);if(u)return u}
    return''
}
function nestedAuthor(x){
    var a=S(pick(x,['authorName','nickName','nickname','author','userName','bloggerName'],'')||'');if(a)return a;var u=pick(x,['authorInfo','user','userInfo','blogger'],null);if(u&&typeof u==='object')return S(pick(u,['authorName','nickName','nickname','name','userName'],'')||'');return''
}
ac.__v060a4FictionInfo=function(x){
    x=x||{};return{id:S(pick(x,['fictionId','fictionID','bookId','novelId','id'],'')||''),title:S(pick(x,['fictionTitle','bookTitle','bookName','novelTitle','novelName','title','name'],'未命名小说')||''),img:imageField(x),author:nestedAuthor(x),desc:S(pick(x,['fictionDesc','description','desc','info','summary','intro'],'')||''),status:S(pick(x,['fictionStatus','status','serialStatus','finishStatus'],'')||''),fictionType:S(pick(x,['fictionType','type'],'')||''),longFormAudio:pick(x,['longFormAudio','isAudio'],''),raw:x,kind:'fiction'}
};

function resolveUrl(u){
    u=S(u).trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.indexOf('//')===0)return'https:'+u;
    var bases=[];try{bases=ac.getApiBases?ac.getApiBases(false):[]}catch(e){}if(bases&&bases.length)try{return ac.absoluteUrl(bases[0]+'/',u)}catch(e2){}
    try{return ac.absoluteUrl((ac.frontendBase||'')+'/',u)}catch(e3){}return u
}
function addUnique(arr,seen,v){v=S(v).trim();if(!v||seen[v])return;seen[v]=1;arr.push(v)}
function htmlText(raw){
    var s=S(raw);if(!s)return'';s=s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<(?:br|p|div|li|h\d)[^>]*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/\r/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();return s
}
ac.__v060a9ChapterPayload=function(root,mode){
    var texts=[],audios=[],images=[],sources=[],st={},sa={},si={},ss={},count=0;
    var textKeys={chapterContent:1,fictionContent:1,content:1,text:1,contentText:1,body:1,paragraph:1,paragraphs:1,paragraphList:1,contentList:1,html:1,chapterText:1};
    function addText(v){var s=S(v).trim();if(!s||s.length<2||/^https?:\/\//i.test(s))return;if(/<[^>]+>/.test(s))s=htmlText(s);if(s.length>1)addUnique(texts,st,s)}
    function addMedia(v,key){
        if(typeof v!=='string')return;var u=S(v).trim();if(!u)return;
        var kl=S(key).toLowerCase(),abs=resolveUrl(u);
        if((/audio|voice|sound|longform|mediaurl|getmedia/.test(kl)||/\.(?:mp3|m4a|aac|wav|ogg|m3u8)(?:\?|$)/i.test(u))&&abs)addUnique(audios,sa,abs);
        if((/image|img|picture|pic|cover/.test(kl)||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(u))&&abs)addUnique(images,si,abs);
        if(/fictionurl|contenturl|readurl|chapterurl|sourceurl/.test(kl)&&abs){addUnique(sources,ss,abs);if(mode==='audio')addUnique(audios,sa,abs)}
    }
    function rec(v,key,d){
        if(v===undefined||v===null||d>12||count>20000)return;
        if(typeof v==='string'){var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{rec(JSON.parse(s),key,d+1)}catch(e){}if(textKeys[key])addText(s);addMedia(s,key);return}
        if(typeof v==='number'||typeof v==='boolean'){return}
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)rec(v[i],key,d+1);return}
        if(typeof v!=='object')return;count++;for(var k in v)rec(v[k],k,d+1)
    }
    rec(root,'',0);return{texts:texts,audios:audios,images:images,sources:sources}
};
function mergePayload(a,b){
    var out={texts:[],audios:[],images:[],sources:[]},keys=['texts','audios','images','sources'];for(var z=0;z<keys.length;z++){var k=keys[z],seen={};var all=(a&&a[k]||[]).concat(b&&b[k]||[]);for(var i=0;i<all.length;i++)addUnique(out[k],seen,all[i])}return out
}
ac.__v060a9ExpandChapter=function(obj,mode){
    var p=ac.__v060a9ChapterPayload(obj,mode),sources=p.sources.slice(0,4);
    for(var i=0;i<sources.length;i++){
        var u=sources[i];if(!/^https?:\/\//i.test(u))continue;if(mode==='audio'&&/\.(?:mp3|m4a|aac|wav|ogg|m3u8)(?:\?|$)/i.test(u))continue;
        try{
            var raw=fetch(u,{timeout:2200,headers:{'User-Agent':ac.ua||'Mozilla/5.0','Referer':ac.frontendBase||''}});
            if(!raw)continue;var parsed=null;try{parsed=ac.safeJson?ac.safeJson(raw):JSON.parse(raw)}catch(e0){}if(parsed&&ac.parseResp)try{parsed=ac.parseResp(raw)||parsed}catch(e1){}
            var q=parsed&&typeof parsed==='object'?ac.__v060a9ChapterPayload(parsed,mode):{texts:[htmlText(raw)],audios:[],images:[],sources:[]};p=mergePayload(p,q)
        }catch(e){try{setItem('acfun_v060_a9_fiction_source_error',S(e.message||e))}catch(e2){}}
    }
    return p
};
function detailMatrix(path,paramList,kind,key){
    var c=cacheRead('detail|'+key,900,86400),old=c.hit&&c.data&&typeof c.data==='object'?c.data:null;if(c.fresh&&old)return old;
    var specs=[];for(var i=0;i<paramList.length;i++){specs.push({path:path,params:paramList[i],method:'GET'});specs.push({path:path,params:paramList[i],method:'POST'})}
    for(var j=0;j<specs.length;j++){var raw=apiRaw(path,specs[j].params,specs[j].method),obj=null;if(raw&&typeof raw==='object'){if(kind==='fiction'){var rows=ac.__v060a9CollectFiction(raw);obj=rows.length?rows[0]:raw}else if(kind==='chapter'){var rows2=[];try{rows2=ac.__v060a4Collect(raw,'chapter')}catch(e0){}obj=rows2.length?rows2[0]:raw}else obj=raw;if(obj&&typeof obj==='object'){cacheWrite('detail|'+key,obj);try{setItem('acfun_v060_a9_last_route',key+' -> '+path+' '+specs[j].method+' #'+j)}catch(e1){}return obj}}}
    return old||{}
}
ac.__v060a9FictionDetail=function(id){
    var n=N(id),seed={};try{seed=JSON.parse(getItem('acfun_v060_fiction_seed_'+S(id),'{}'))||{}}catch(e){}
    var obj=detailMatrix('fiction/base/info',[{fictionId:n},{id:n},{bookId:n},{novelId:n}],'fiction','fiction-info|'+id);
    if((!obj||!Object.keys(obj).length)&&seed)obj=seed;return obj||seed||{}
};
ac.__v060a9FictionChapter=function(fid,cid){
    var f=N(fid),c=N(cid);return detailMatrix('fiction/base/chapterInfo',[
        {fictionId:f,chapterId:c},{fictionId:f,fictionChapterId:c},{bookId:f,chapterId:c},{novelId:f,chapterId:c},{fictionId:f,id:c}
    ],'chapter','fiction-chapter|'+fid+'|'+cid)
};
ac.__v060a9ChapterRows=function(root){
    var out=[],seen={};walk(root,function(x){var id=S(pick(x,['chapterId','fictionChapterId'],'')||''),title=S(pick(x,['chapterTitle','chapterName'],'')||'');if(!id)return;if(!title)title='第 '+(out.length+1)+' 章';if(seen[id])return;seen[id]=1;out.push({id:id,title:title,raw:x})});return out
};

var oldDynamicInfo=ac.__v060a4DynamicInfo;
ac.__v060a4DynamicInfo=function(x){
    x=x||{};var info=typeof oldDynamicInfo==='function'?oldDynamicInfo.call(ac,x):{id:'',title:'',content:'',img:'',author:'',raw:x,kind:'dynamic'},u=pick(x,['user','userInfo','blogger','authorInfo'],null);
    if(u&&typeof u==='object'){var a=S(pick(u,['nickName','nickname','userName','name','bloggerName'],'')||'');if(a)info.author=a;var av=S(pick(u,['avatar','avatarUrl','headImg','userImg'],'')||'');if(av)info.avatar=av}
    if(!info.author)info.author=S(pick(x,['nickName','nickname','userName','bloggerName','authorName'],'')||'');
    return info
};
ac.__v060a9DynamicPayload=function(root){
    var texts=[],images=[],videos=[],links=[],st={},si={},sv={},sl={},count=0;
    var textKeys={content:1,dynamicContent:1,contentText:1,text:1,body:1,markdown:1,description:1,desc:1,summary:1,remark:1,title:1};
    function text(v){var s=S(v).trim();if(!s||s.length<2||/^https?:\/\//i.test(s))return;if(/^[\d\s.:/_-]+$/.test(s)&&s.length<32)return;s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,function(_,t,u){return t===u?u:t+'\n'+u});addUnique(texts,st,s)}
    function url(v,key){v=S(v).trim();if(!/^https?:\/\//i.test(v))return;var k=S(key).toLowerCase();if(/avatar|head|badge|frame|icon|logo/.test(k))return;if(/video|media|play/.test(k)||/\.(?:m3u8|mp4|m4v|webm)(?:\?|$)/i.test(v)){addUnique(videos,sv,v);return}if(/image|img|picture|pic|cover|gif/.test(k)||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(v)){addUnique(images,si,v);return}addUnique(links,sl,v)}
    function rec(v,key,d){if(v===undefined||v===null||d>10||count>18000)return;if(typeof v==='string'){var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{rec(JSON.parse(s),key,d+1)}catch(e){}if(textKeys[key])text(s);url(s,key);return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)rec(v[i],key,d+1);return}if(typeof v!=='object')return;count++;for(var k in v)rec(v[k],k,d+1)}
    rec(root,'',0);
    var compact=[];for(var i=0;i<texts.length;i++){var keep=true;for(var j=0;j<texts.length;j++)if(i!==j&&texts[j].length>texts[i].length*1.25&&texts[j].indexOf(texts[i])>=0){keep=false;break}if(keep)compact.push(texts[i])}
    return{texts:compact.slice(0,10),images:images.slice(0,12),videos:videos.slice(0,6),links:links.slice(0,8)}
};

try{
    if(!getItem('acfun_v060_a9_migrated','')){
        var ks=['acfun_v050_station_featured','acfun_v050_station_lifan','acfun_v050_comic_station','acfun_v050_class_anime','acfun_v050_tag_anime','acfun_v050_class_video','acfun_v050_tag_video','acfun_v060_dynamic_category','acfun_v060_fiction_tag_fiction','acfun_v060_fiction_tag_audio'];
        for(var i=0;i<ks.length;i++)saveState(ks[i],'');
        setItem('acfun_v060_hero','0');
        setItem('acfun_v060_a9_migrated','1')
    }
    setItem('acfun_test_runtime','0.6.0-alpha9 runtime');
    setItem('acfun_v060_runtime_a9','strict taxonomy + fiction chapter/media recovery + dynamic seed merge')
}catch(e){}
ac.build='2026.08.22-v0.6.0-alpha9';ac.runtimeMode='test-runtime-v060-alpha9';
})();