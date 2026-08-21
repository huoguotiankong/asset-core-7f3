/**
 * ACFun 0.6.0-alpha4 / Build 155
 * APK 1.9.7 route recovery: full taxonomy, typed search, short/community/fiction data.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha4';
ac.runtimeMode='test-ui-v060-alpha4';

function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function first(v){return Array.isArray(v)?(v.length?v[0]:''):v}
function has(o,k){return !!o&&typeof o==='object'&&o[k]!==undefined&&o[k]!==null&&o[k]!==''}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function pushUnique(out,seen,x,kind){
    if(!x||typeof x!=='object')return;
    var id='',name='';
    if(kind==='video'){id=S(ac.pick(x,['videoId','lsjVideoId','videoID'],'')||'');name=S(ac.pick(x,['videoTitle','title','name'],'')||'');}
    else if(kind==='comic'){id=S(ac.pick(x,['comicsId','comicId'],'')||'');name=S(ac.pick(x,['comicsTitle','comicTitle','title','name'],'')||'');}
    else if(kind==='fiction'){id=S(ac.pick(x,['fictionId'],'')||'');name=S(ac.pick(x,['fictionTitle','title','name'],'')||'');}
    else if(kind==='dynamic'){id=S(ac.pick(x,['dynamicId'],'')||'');name=S(ac.pick(x,['dynamicTitle','title','content','dynamicContent'],'')||'');}
    else if(kind==='chapter'){id=S(ac.pick(x,['chapterId'],'')||'');name=S(ac.pick(x,['chapterTitle','title','name'],'')||'');}
    else if(kind==='station'){id=S(ac.pick(x,['stationId','comicsStationId'],'')||'');name=S(ac.pick(x,['stationName','stationTitle'],'')||'');if(!id&&(has(x,'videoList')||has(x,'comicsBaseList'))){id=S(ac.pick(x,['id'],'')||'');name=name||S(ac.pick(x,['name','title'],'')||'');}}
    else if(kind==='category'){id=S(ac.pick(x,['categoryId','tagId','fictionTagId','classifyId'],'')||'');name=S(ac.pick(x,['categoryName','tagName','fictionTagName','tagTitle','classifyName','name','title'],'')||'');if(!id&&name)id=S(ac.pick(x,['id','value'],'')||'');}
    else if(kind==='blogger'){id=S(ac.pick(x,['bloggerId','userId','userID','uid'],'')||'');name=S(ac.pick(x,['bloggerName','nickName','nickname','userName','name'],'')||'');if(!id&&name&&(has(x,'avatar')||has(x,'avatarUrl')||has(x,'headImg')))id=S(ac.pick(x,['id'],'')||'');}
    else if(kind==='coterie'){id=S(ac.pick(x,['coterieId'],'')||'');name=S(ac.pick(x,['coterieName','name','title'],'')||'');}
    if(!id||(!name&&kind!=='chapter'))return;
    var key=kind+'|'+id;if(seen[key])return;seen[key]=1;out.push(x);
}

ac.__v060a4Collect=function(root,kind){
    var out=[],seen={},visited=0;
    function walk(v,depth){
        if(v===undefined||v===null||depth>10||visited>12000)return;
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],depth+1);return;}
        if(typeof v!=='object')return;visited++;pushUnique(out,seen,v,kind);
        for(var k in v)if(v[k]&&typeof v[k]==='object')walk(v[k],depth+1);
    }
    walk(root,0);return out;
};

ac.__v060a4Read=function(key,ttl,stale){return ac.__v042Read?ac.__v042Read('v060a4|'+key,ttl||300,stale||3600):{hit:false,fresh:false,stale:false,data:null}}
ac.__v060a4Write=function(key,data){if(!data||(Array.isArray(data)&&!data.length))return false;try{return ac.__v042Write?ac.__v042Write('v060a4|'+key,data):false}catch(e){return false}}
ac.__v060a4Try=function(tries,kind,key,ttl,stale){
    var c=ac.__v060a4Read(key,ttl,stale),old=(c.hit&&Array.isArray(c.data))?c.data:[];
    if(c.fresh&&old.length)return old;
    var errors=[];
    for(var i=0;i<(tries||[]).length;i++){
        var t=tries[i]||{},rows=[];
        try{rows=ac.__v060a4Collect(ac.__v043Api(t.path,t.params||{},{timeout:t.timeout||1200,maxAttempts:t.maxAttempts||2}),kind)}catch(e){errors.push(t.path+': '+S(e.message||e))}
        if(rows.length){ac.__v060a4Write(key,rows);try{setItem('acfun_v060_a4_last_route',key+' -> '+t.path+' #'+i+' ('+rows.length+')');setItem('acfun_v060_a4_last_error','')}catch(e0){}return rows}
    }
    if(errors.length)try{setItem('acfun_v060_a4_last_error',errors.slice(0,4).join('\n'))}catch(e1){}
    return old;
};
ac.__v060a4Aggregate=function(tries,kind,key,ttl,stale){
    var c=ac.__v060a4Read(key,ttl,stale),old=(c.hit&&Array.isArray(c.data))?c.data:[];
    if(c.fresh&&old.length)return old;
    var out=[],seen={},errors=[];
    for(var i=0;i<(tries||[]).length;i++){
        var t=tries[i]||{},rows=[];
        try{rows=ac.__v060a4Collect(ac.__v043Api(t.path,t.params||{},{timeout:t.timeout||1200,maxAttempts:t.maxAttempts||2}),kind)}catch(e){errors.push(t.path+': '+S(e.message||e))}
        for(var j=0;j<rows.length;j++)pushUnique(out,seen,rows[j],kind);
    }
    if(out.length){ac.__v060a4Write(key,out);try{setItem('acfun_v060_a4_last_route',key+' aggregate ('+out.length+')');setItem('acfun_v060_a4_last_error','')}catch(e0){}return out}
    if(errors.length)try{setItem('acfun_v060_a4_last_error',errors.slice(0,4).join('\n'))}catch(e1){}
    return old;
};

function visible(name,kind){return !ac.__v060VisibleCategoryName||ac.__v060VisibleCategoryName(name,kind)}
function stationRows(restricted){
    var r=restricted?1:0,rows=ac.__v060a4Aggregate([
        {path:'station/stations',params:{classifyId:4,restricted:r,page:1,pageNum:1,pageSize:100}},
        {path:'station/stations',params:{restricted:r,page:1,pageNum:1,pageSize:100}}
    ],'station','stations-full|'+r,21600,604800),out=[],seen={};
    for(var i=0;i<rows.length;i++){var x=rows[i],id=S(ac.pick(x,['stationId','stationID','id'],'')||''),name=S(ac.pick(x,['stationName','stationTitle','title','name'],'')||'').replace(/\s+/g,' ').trim();if(!id||!name||!visible(name,'station')||seen[id])continue;seen[id]=1;out.push({id:id,name:name,raw:x})}
    return out;
}
ac.__v050Stations=stationRows;
ac.__v050StationList=function(page,restricted){
    page=Number(page||1);var st=ac.__v050Station(restricted);if(!st)return [];
    var size=Number(getItem('acfun_page_size','12'))||12,sort=Number(ac.__v050Sort()),embedded=ac.__v060a4Collect(st.raw,'video');
    if(page===1&&embedded.length)return embedded.slice(0,size);
    return ac.__v060a4Try([{path:'station/getStationMore',params:{stationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort}}],'video','station-more|'+(restricted?1:0)+'|'+st.id+'|'+sort+'|'+page,300,86400);
};

ac.__v050ComicStations=function(){
    var rows=ac.__v060a4Aggregate([
        {path:'comics/station/getComicsStations',params:{}},
        {path:'comics/station/getComicsStations',params:{page:1,pageNum:1,pageSize:100}}
    ],'station','comic-stations-full',21600,604800),out=[],seen={};
    for(var i=0;i<rows.length;i++){var x=rows[i],id=S(ac.pick(x,['comicsStationId','stationId','id'],'')||''),name=S(ac.pick(x,['stationName','stationTitle','name','title'],'')||'').replace(/\s+/g,' ').trim();if(!id||!name||!visible(name,'comic')||seen[id])continue;seen[id]=1;out.push({id:id,name:name,raw:x})}
    var order=['国漫','日漫','3D','单行本','CG/AI','COS写真'],rank={};for(var j=0;j<order.length;j++)rank[order[j]]=j;
    out.sort(function(a,b){var ar=rank[a.name]===undefined?99:rank[a.name],br=rank[b.name]===undefined?99:rank[b.name];return ar===br?0:ar-br});
    return out;
};
ac.__v050ComicList=function(page){
    page=Number(page||1);var st=ac.__v050ComicStation();if(!st)return [];
    var size=Number(getItem('acfun_page_size','12'))||12,sort=Number(ac.__v050Sort()),embedded=ac.__v060a4Collect(st.raw,'comic');
    if(page===1&&embedded.length)return embedded.slice(0,size);
    return ac.__v060a4Try([
        {path:'comics/station/getStationComicsMore',params:{stationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort}},
        {path:'comics/base/findList',params:{stationId:N(st.id),page:page,pageNum:page,pageSize:size,limit:size,sortType:sort}}
    ],'comic','comic-list|'+st.id+'|'+sort+'|'+page,300,86400);
};

ac.__v050ShortList=function(page){
    page=Number(page||1);var mode=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','3')||'3'),alt=mode==='3'?'4':'3',base={page:page,pageNum:page,pageSize:18,limit:18},p1=copy(base),p2=copy(base),p3=copy(base),p4=copy(base);
    p1.loadType=N(mode);p2.loadType=N(mode);p2.videoContentType='shortVideo';p2.contentType='shortVideo';p3.loadType=N(mode);p3.videoType='shortVideo';p4.loadType=N(alt);
    var rows=ac.__v060a4Try([{path:'video/list',params:p1},{path:'video/list',params:p2},{path:'video/list',params:p3},{path:'video/list',params:p4}],'video','short|'+mode+'|'+page,120,1800);
    if(rows.length)try{setItem('acfun_v060_short_last_ok',mode+'|'+page+'|'+rows.length)}catch(e){}
    return rows;
};

ac.__v060a4Search=function(kind,keyword,page,size){
    kind=S(kind||'video');var requestedKind=kind;keyword=S(keyword).trim();page=Number(page||1);size=Number(size||12);if(!keyword)return [];
    var b={page:page,pageNum:page,pageSize:size,limit:size,keyword:keyword,keyWord:keyword},tries=[];
    if(kind==='comic'){
        var cp=copy(b);cp.comicsTitle=keyword;cp.title=keyword;tries=[{path:'comics/base/findList',params:cp},{path:'comics/base/findList',params:{page:page,pageNum:page,pageSize:size,title:keyword}}];
    }else if(kind==='fiction'||kind==='audio'){
        var fp=copy(b);fp.fictionTitle=keyword;fp.title=keyword;if(kind==='audio'){fp.fictionType=2;fp.isAudio=1}tries=[{path:'fiction/base/findList',params:fp},{path:'fiction/base/findList',params:{page:page,pageNum:page,pageSize:size,keyword:keyword}}];kind='fiction';
    }else if(kind==='dynamic'){
        var dp=copy(b);dp.content=keyword;tries=[{path:'community/dynamic/list',params:dp}];
    }else{
        var vp={page:page,pageNum:page,pageSize:size,title:keyword,keyword:keyword,videoType:1};
        var sp={page:page,pageNum:page,pageSize:size,limit:size,searchWord:keyword,keyword:keyword,keyWord:keyword,searchType:1};
        tries=[{path:'video/queryVideoByTitle',params:vp},{path:'search/keyWordV2',params:sp},{path:'search/keyWord',params:sp}];kind='video';
    }
    return ac.__v060a4Try(tries,kind,'search|'+requestedKind+'|'+keyword+'|'+page+'|'+size,120,3600);
};

ac.__v060a4FictionTags=function(){
    var rows=ac.__v060a4Try([{path:'fiction/other/tagList',params:{}},{path:'fiction/other/tagList',params:{fictionType:1}}],'category','fiction-tags',21600,604800),out=[],seen={};
    for(var i=0;i<rows.length;i++){var x=rows[i],id=S(ac.pick(x,['fictionTagId','tagId','categoryId','classifyId'],'')||''),name=S(ac.pick(x,['fictionTagName','tagName','categoryName','classifyName','name','title'],'')||'').trim();if(id&&name&&!seen[id]){seen[id]=1;out.push({id:id,name:name,raw:x})}}
    return out;
};
ac.__v060a4FictionList=function(page,mode){
    page=Number(page||1);mode=mode==='audio'?'audio':'fiction';var size=Number(getItem('acfun_page_size','12'))||12,tag=S(getMyVar('acfun_v060_fiction_tag_'+mode,'')||''),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:Number(getMyVar('acfun_v060_fiction_sort_'+mode,'1')||1)},tries=[],p;
    if(tag){base.tagId=N(tag);base.categoryId=N(tag);base.fictionTagId=N(tag)}
    if(mode==='audio'){
        p=copy(base);p.fictionType=2;p.isAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.fictionType='audio';p.longFormAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.type=2;p.audio=1;tries.push({path:'fiction/base/findList',params:p});
    }else{
        p=copy(base);p.fictionType=1;tries.push({path:'fiction/base/findList',params:p});tries.push({path:'fiction/base/findList',params:base});
    }
    return ac.__v060a4Try(tries,'fiction','fiction-list|'+mode+'|'+tag+'|'+base.sortType+'|'+page,300,86400);
};

ac.__v060a4CommunityCategories=function(){
    var rows=ac.__v060a4Try([{path:'dynamic/category/tree',params:{}},{path:'dynamic/category/tree',params:{page:1,pageSize:100}}],'category','dynamic-categories',21600,604800),out=[],seen={};
    for(var i=0;i<rows.length;i++){var x=rows[i],id=S(ac.pick(x,['categoryId','dynamicType','id'],'')||''),name=S(ac.pick(x,['categoryName','dynamicTypeName','name','title'],'')||'').trim();if(id&&name&&!seen[id]){seen[id]=1;out.push({id:id,name:name,raw:x})}}
    return out;
};
ac.__v060a4DynamicList=function(page){
    page=Number(page||1);var size=20,cat=S(getMyVar('acfun_v060_dynamic_category','')||''),sort=S(getMyVar('acfun_v060_dynamic_sort','hot')||'hot'),p={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort};if(cat){p.categoryId=N(cat);p.dynamicType=N(cat)}
    return ac.__v060a4Try([{path:'community/dynamic/list',params:p}],'dynamic','dynamic-list|'+cat+'|'+sort+'|'+page,180,7200);
};
ac.__v060a4HotBloggers=function(){return ac.__v060a4Try([{path:'blogger/hotUpBloggers',params:{}},{path:'blogger/hotUpBloggers/page',params:{page:1,pageNum:1,pageSize:12}}],'blogger','hot-bloggers',1800,86400)};
ac.__v060a4Coteries=function(){return ac.__v060a4Try([{path:'coterie/list',params:{page:1,pageNum:1,pageSize:20}},{path:'coterie/coterieListByCoterId',params:{page:1,pageNum:1,pageSize:20}}],'coterie','coteries',1800,86400)};

ac.__v060a4Detail=function(path,params,kind,key){
    var c=ac.__v060a4Read('detail|'+key,1800,86400);if(c.fresh&&c.data&&typeof c.data==='object')return c.data;
    var data=null;try{data=ac.__v043Api(path,params||{},{timeout:1500,maxAttempts:2})}catch(e){try{setItem('acfun_v060_a4_detail_error',path+': '+S(e.message||e))}catch(e0){}}
    var rows=ac.__v060a4Collect(data,kind),obj=rows.length?rows[0]:data;if(obj&&typeof obj==='object'){ac.__v060a4Write('detail|'+key,obj);return obj}
    return c.hit&&c.data?c.data:{};
};

function imageOf(x,keys){var v=ac.pick(x,keys,''),u='';try{if(ac.__v042FirstMedia)u=ac.__v042FirstMedia(v)}catch(e){}if(!u){v=first(v);if(v&&typeof v==='object')v=ac.pick(v,['url','imgUrl','imageUrl','src','path'],'');u=S(v||'')}return u}
ac.__v060a4ComicInfo=function(x){x=x||{};return{id:S(ac.pick(x,['comicsId','comicId','id'],'')||''),title:S(ac.pick(x,['comicsTitle','comicTitle','title','name'],'未命名漫画')||''),img:imageOf(x,['coverImg','comicsCover','cover','img','image']),author:S(ac.pick(x,['authorName','nickName','author'],'')||''),desc:S(ac.pick(x,['info','description','desc'],'')||''),raw:x,kind:'comic'}};
ac.__v060a4FictionInfo=function(x){x=x||{};return{id:S(ac.pick(x,['fictionId','id'],'')||''),title:S(ac.pick(x,['fictionTitle','title','name'],'未命名小说')||''),img:imageOf(x,['fictionImg','fictionCover','coverImg','cover','img','image']),author:S(ac.pick(x,['authorName','nickName','author'],'')||''),desc:S(ac.pick(x,['fictionDesc','description','desc','info'],'')||''),status:S(ac.pick(x,['fictionStatus','status','serialStatus'],'')||''),raw:x,kind:'fiction'}};
ac.__v060a4DynamicInfo=function(x){x=x||{};var imgs=ac.__v060a4Media(x,'image');return{id:S(ac.pick(x,['dynamicId','id'],'')||''),title:S(ac.pick(x,['dynamicTitle','title'],'')||ac.pick(x,['content','dynamicContent'],'动态')),content:S(ac.pick(x,['content','dynamicContent','description','desc'],'')||''),img:imgs.length?imgs[0]:'',author:S(ac.pick(x,['nickName','nickname','userName','bloggerName'],'')||''),raw:x,kind:'dynamic'}};
ac.__v060a4BloggerInfo=function(x){x=x||{};return{id:S(ac.pick(x,['bloggerId','userId','userID','uid','id'],'')||''),name:S(ac.pick(x,['bloggerName','nickName','nickname','userName','name'],'热门 UP')||''),img:imageOf(x,['avatar','avatarUrl','headImg','userImg','img']),desc:S(ac.pick(x,['signature','description','desc'],'')||''),raw:x}};
ac.__v060a4Media=function(root,type){
    var out=[],seen={},count=0;
    function add(u,key){u=S(u).trim();if(!/^https?:\/\//i.test(u)||seen[u])return;var audio=/audio|voice|sound|longform/i.test(key||'')||/\.(?:mp3|m4a|aac|wav|ogg)(?:\?|$)/i.test(u),image=/image|img|cover|avatar|picture|pic/i.test(key||'')||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(u);if((type==='audio'&&audio)||(type==='image'&&image)){seen[u]=1;out.push(u)}}
    function walk(v,key,depth){if(v===undefined||v===null||depth>10||count>10000)return;if(typeof v==='string'){add(v,key);return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],key,depth+1);return}if(typeof v!=='object')return;count++;for(var k in v)walk(v[k],k,depth+1)}walk(root,'',0);return out;
};

ac.__v060a4Route=function(info){
    info=info||{};var kind=S(info.kind||info.content_kind||'video'),q='rule=ACFun&simple=true&content_kind='+encodeURIComponent(kind);
    function add(k,v){if(v!==undefined&&v!==null&&S(v)!=='')q+='&'+k+'='+encodeURIComponent(S(v))}
    if(kind==='comic'){add('comics_id',info.id);add('comics_title',info.title);add('comics_img',info.img)}
    else if(kind==='comic_chapter'){add('comics_id',info.comicsId||info.id);add('comic_chapter_id',info.chapterId);add('comic_chapter_title',info.title)}
    else if(kind==='fiction'){add('fiction_id',info.id);add('fiction_title',info.title);add('fiction_img',info.img)}
    else if(kind==='fiction_chapter'){add('fiction_id',info.fictionId||info.id);add('fiction_chapter_id',info.chapterId);add('fiction_chapter_title',info.title)}
    else if(kind==='dynamic'){add('dynamic_id',info.id);add('dynamic_title',info.title)}
    else{add('video_id',info.id);add('video_title',info.title);add('video_img',info.img)}
    return'hiker://page/acfun_detail?'+q+'#noRecordHistory#';
};
ac.__v060DetailUrl=ac.__v060a4Route;
ac.detailUrl=function(info){return ac.__v060a4Route(info)};
ac.__v060a4CommentsUrl=function(kind,id,title){return'hiker://page/acfun_comments?rule=ACFun&simple=true&content_kind='+encodeURIComponent(S(kind||'video'))+'&content_id='+encodeURIComponent(S(id||''))+'&content_title='+encodeURIComponent(S(title||''))+'#noRecordHistory#'};
ac.__v060CommentsUrl=function(id,title){return ac.__v060a4CommentsUrl('video',id,title)};

try{setItem('acfun_v060_runtime_a4','apk197 routes + recursive taxonomy + typed resources')}catch(e){}
})();
