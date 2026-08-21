/** ACFun 0.6.0-alpha8 / Build 159 - runtime recovery overlay. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function stateVal(k,def){return S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||def||'')}
function pageSize(){return Number(getItem('acfun_page_size','12'))||12}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}

var SECTIONS=['featured','comic','anime','video','lifan','short','community','fiction','audio'];
ac.__v050Section=function(){var v=S(getMyVar('acfun_v050_section','')||'');if(!v&&getItem('acfun_v060_remember_section','1')==='1')v=S(getItem('acfun_v060_section','featured')||'featured');if(SECTIONS.indexOf(v)<0)v='featured';putMyVar('acfun_v050_section',v);return v};

function collectFiction(root){
    var out=[],seen={},visited=0;
    function add(x){if(!x||typeof x!=='object')return;var id=S(pick(x,['fictionId','fictionID','bookId','novelId','id'],'')||''),title=S(pick(x,['fictionTitle','bookTitle','bookName','novelTitle','novelName','title','name'],'')||'');var hint=x.fictionType!==undefined||x.fictionUrl!==undefined||x.chapterNum!==undefined||x.chapterCount!==undefined||x.fictionImg!==undefined||x.longFormAudio!==undefined||x.authorName!==undefined;if(!id||!title||(!hint&&x.fictionId===undefined&&x.bookId===undefined&&x.novelId===undefined))return;var k=id+'|'+title;if(seen[k])return;seen[k]=1;out.push(x)}
    function walk(v,d){if(v===undefined||v===null||d>10||visited>14000)return;if(typeof v==='string'){var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{walk(JSON.parse(s),d+1)}catch(e){}return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return}if(typeof v!=='object')return;visited++;add(v);for(var k in v)if(v[k]&&typeof v[k]==='object'||typeof v[k]==='string')walk(v[k],d+1)}
    walk(root,0);return out
}
function collect(root,kind){if(kind==='fiction')return collectFiction(root);try{return ac.__v060a4Collect?ac.__v060a4Collect(root,kind):[]}catch(e){return[]}}
function requestOne(path,params,kind,method){try{return collect(ac.__v043Api(path,params||{},method==='POST'?{method:'POST',write:true,allowGet:false,timeout:1600,maxAttempts:2}:{timeout:1400,maxAttempts:2}),kind)}catch(e){try{setItem('acfun_v060_a8_last_error',path+' '+method+': '+S(e.message||e))}catch(e0){}return[]}}
function requestMatrix(specs,kind,key,ttl,stale){var c=ac.__v060a4Read?ac.__v060a4Read('a8|'+key,ttl||120,stale||3600):{hit:false,fresh:false,data:null},old=c.hit&&Array.isArray(c.data)?c.data:[];if(c.fresh&&old.length)return old;for(var i=0;i<(specs||[]).length;i++){var s=specs[i]||{},rows=requestOne(s.path,s.params||{},kind,s.method||'GET');if(rows.length){try{if(ac.__v060a4Write)ac.__v060a4Write('a8|'+key,rows);setItem('acfun_v060_a8_last_route',key+' -> '+s.path+' '+(s.method||'GET')+' #'+i+' ('+rows.length+')')}catch(e){}return rows}}return old}

function userStationRows(restricted){
    var r=restricted?1:0,size=100,specs=r?[
        {path:'station/stations',params:{classifyId:24,restricted:1,page:1,pageNum:1,pageSize:size}},
        {path:'station/stations',params:{classifyId:24,page:1,pageNum:1,pageSize:size}},
        {path:'station/stations',params:{restricted:1,page:1,pageNum:1,pageSize:size}}
    ]:[
        {path:'station/stations',params:{classifyId:4,restricted:0,page:1,pageNum:1,pageSize:size}},
        {path:'station/stations',params:{classifyId:4,page:1,pageNum:1,pageSize:size}}
    ];
    var rows=requestMatrix(specs,'station','stations-strict|'+r,21600,604800),out=[],seen={};for(var i=0;i<rows.length;i++){var x=rows[i]||{},id=S(pick(x,['stationId','stationID','id'],'')||''),name=S(pick(x,['stationName','stationTitle','title','name'],'')||'').replace(/\s+/g,' ').trim();if(!id||!name||seen[id])continue;if(ac.__v060VisibleCategoryName&&!ac.__v060VisibleCategoryName(name,'station'))continue;seen[id]=1;out.push({id:id,name:name,raw:x})}return out
}
ac.__v050Stations=userStationRows;

function fictionSpecs(page,mode,tag,sort){
    var size=pageSize(),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},params=[],p;
    function tagged(x){if(!tag)return x;x.tagId=N(tag);x.fictionTagId=N(tag);x.categoryId=N(tag);x.tagIds=[N(tag)];return x}
    if(mode==='audio'){
        p=tagged(copy(base));p.fictionType=2;p.isAudio=1;params.push(p);
        p=tagged(copy(base));p.fictionType=2;params.push(p);
        p=tagged(copy(base));p.longFormAudio=1;params.push(p);
        p=tagged(copy(base));p.isAudio=1;params.push(p);
        p=tagged(copy(base));p.type=2;p.audio=1;params.push(p);
        p=tagged(copy(base));p.type='audio';params.push(p)
    }else{
        p=tagged(copy(base));p.fictionType=1;params.push(p);
        p=tagged(copy(base));p.fictionType=0;params.push(p);
        p=tagged(copy(base));p.type=1;params.push(p);
        p=tagged(copy(base));p.type='fiction';params.push(p);
        params.push(tagged(copy(base)))
    }
    var specs=[];for(var i=0;i<params.length;i++){specs.push({path:'fiction/base/findList',params:params[i],method:'GET'});specs.push({path:'fiction/base/findList',params:params[i],method:'POST'})}return specs
}
ac.__v060a4FictionTags=function(){var specs=[{path:'fiction/other/tagList',params:{},method:'GET'},{path:'fiction/other/tagList',params:{fictionType:1},method:'GET'},{path:'fiction/other/tagList',params:{},method:'POST'},{path:'fiction/other/tagList',params:{fictionType:1},method:'POST'}],rows=requestMatrix(specs,'category','fiction-tags',21600,604800),out=[],seen={};for(var i=0;i<rows.length;i++){var x=rows[i]||{},id=S(pick(x,['fictionTagId','tagId','categoryId','classifyId','id'],'')||''),name=S(pick(x,['fictionTagName','tagName','categoryName','classifyName','name','title'],'')||'').trim();if(id&&name&&!seen[id]){seen[id]=1;out.push({id:id,name:name,raw:x})}}try{return ac.__v060a7SanitizeRows?ac.__v060a7SanitizeRows(out,'fiction'):out}catch(e){return out}};
ac.__v060a4FictionList=function(page,mode){page=Number(page||1);mode=mode==='audio'?'audio':'fiction';var tags=ac.__v060a4FictionTags(),tag=stateVal('acfun_v060_fiction_tag_'+mode,''),valid='';for(var i=0;i<tags.length;i++)if(S(tags[i].id)===tag)valid=tag;var sort=Number(stateVal('acfun_v060_fiction_sort_'+mode,'1')||1),rows=requestMatrix(fictionSpecs(page,mode,valid,sort),'fiction','fiction|'+mode+'|'+valid+'|'+sort+'|'+page,90,3600);if(!rows.length&&valid){rows=requestMatrix(fictionSpecs(page,mode,'',sort),'fiction','fiction-all|'+mode+'|'+sort+'|'+page,90,3600);if(rows.length)try{setItem('acfun_v060_a8_fiction_fallback',mode+'|'+valid+' -> all')}catch(e){}}return rows};

ac.__v060a8DynamicPayload=function(root){
    var texts=[],images=[],videos=[],links=[],st={},si={},sv={},sl={},count=0;
    var textKeys={content:1,dynamicContent:1,contentText:1,text:1,body:1,markdown:1,description:1,desc:1,summary:1,remark:1};
    var imageKey=/image|img|picture|pic|cover/i,videoKey=/video|media|play/i;
    function addText(s){s=S(s).trim();if(!s||s.length<2||st[s])return;st[s]=1;texts.push(s);var m=s.match(/https?:\/\/[^\s)\]]+/g)||[];for(var i=0;i<m.length;i++)if(!sl[m[i]]){sl[m[i]]=1;links.push(m[i])}}
    function addUrl(u,key){u=S(u).trim();if(!/^https?:\/\//i.test(u))return;if(videoKey.test(key||'')||/\.(?:m3u8|mp4|m4v|webm)(?:\?|$)/i.test(u)){if(!sv[u]){sv[u]=1;videos.push(u)};return}if(imageKey.test(key||'')||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(u)){if(!si[u]){si[u]=1;images.push(u)}}}
    function walk(v,key,d){if(v===undefined||v===null||d>10||count>16000)return;if(typeof v==='string'){var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{walk(JSON.parse(s),key,d+1)}catch(e){}if(textKeys[key])addText(s);addUrl(s,key);return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],key,d+1);return}if(typeof v!=='object')return;count++;for(var k in v)walk(v[k],k,d+1)}
    walk(root,'',0);if(!images.length)try{images=ac.__v060a4Media(root,'image')||[]}catch(e){}return{texts:texts,images:images,videos:videos,links:links}
};

ac.build='2026.08.22-v0.6.0-alpha8';ac.runtimeMode='test-runtime-v060-alpha8';
try{setItem('acfun_test_runtime','0.6.0-alpha8 runtime');setItem('acfun_v060_runtime_a8','same-page sections + strict stations + fiction GET/POST + dynamic payload')}catch(e){}
})();
