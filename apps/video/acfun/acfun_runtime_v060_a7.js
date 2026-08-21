/**
 * ACFun 0.6.0-alpha7 / Build 158
 * Resource resilience overlay: stricter user-facing taxonomy, automatic
 * fiction/audio fallback, cleaner community metadata.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function pageSize(){return Number(getItem('acfun_page_size','12'))||12}
function stateVal(k,def){return S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||def||'')}
function validSelected(rows,id){if(!id)return'';for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return S(id);return''}
function requestRows(tries,kind,key,ttl,stale){
    try{return ac.__v060a4Try?ac.__v060a4Try(tries,kind,key,ttl||120,stale||3600)||[]:[]}catch(e){try{setItem('acfun_v060_a7_last_error',S(e.message||e))}catch(e0){}return[]}
}
function humanTime(v){
    var s=S(v).trim();if(!s)return'';var t=Date.parse(s);if(!isNaN(t)){var d=new Date(t),now=Date.now(),gap=Math.max(0,now-t);if(gap<60000)return'刚刚';if(gap<3600000)return Math.floor(gap/60000)+'分钟前';if(gap<86400000)return Math.floor(gap/3600000)+'小时前';if(gap<604800000)return Math.floor(gap/86400000)+'天前';return(d.getMonth()+1)+'-'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}return s.replace('T',' ').replace(/\.\d+(?:Z|[+-].*)?$/,'').replace(/\+00:00$/,'')
}
ac.__v060a7HumanTime=humanTime;

var oldSanitize=ac.__v060a6SanitizeRows;
ac.__v060a7SanitizeRows=function(rows,kind){
    var base=[];try{base=typeof oldSanitize==='function'?oldSanitize.call(ac,rows,kind):(rows||[])}catch(e){base=rows||[]}
    var out=[],seen={};for(var i=0;i<base.length;i++){
        var x=base[i]||{},name=S(x.name).replace(/\s+/g,' ').trim(),id=S(x.id);if(!id||!name)continue;
        if(kind==='community'){
            if(/^\d+$/.test(name))continue;
            if(/^(?:ceas|test|ces\d*|debug|demo|null|undefined)$/i.test(name))continue;
            if(/(?:测试|调试|帖子数据|接口数据|样例|占位)/i.test(name))continue;
            if(!/[\u3400-\u9fff]/.test(name)&&/^[a-z0-9_-]{3,12}$/i.test(name))continue;
        }
        var key=id+'|'+name;if(seen[key])continue;seen[key]=1;out.push(x)
    }return out
};
var oldCommunityCats=ac.__v060a4CommunityCategories;
ac.__v060a4CommunityCategories=function(){var rows=[];try{rows=typeof oldCommunityCats==='function'?oldCommunityCats.call(ac):[]}catch(e){}return ac.__v060a7SanitizeRows(rows,'community')};
var oldFictionTags=ac.__v060a4FictionTags;
ac.__v060a4FictionTags=function(){var rows=[];try{rows=typeof oldFictionTags==='function'?oldFictionTags.call(ac):[]}catch(e){}return ac.__v060a7SanitizeRows(rows,'fiction')};

function fictionTries(page,mode,tag,sort){
    var size=pageSize(),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},tries=[],p;
    if(tag){base.tagId=N(tag);base.fictionTagId=N(tag);base.categoryId=N(tag)}
    if(mode==='audio'){
        p=copy(base);p.fictionType=2;p.isAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.fictionType=2;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.fictionType=1;p.isAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.longFormAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.isAudio=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.type=2;p.audio=1;tries.push({path:'fiction/base/findList',params:p});
    }else{
        p=copy(base);p.fictionType=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.type=1;tries.push({path:'fiction/base/findList',params:p});
        p=copy(base);p.fictionType=0;tries.push({path:'fiction/base/findList',params:p});
        tries.push({path:'fiction/base/findList',params:copy(base)});
    }
    return tries
}
ac.__v060a4FictionList=function(page,mode){
    page=Number(page||1);mode=mode==='audio'?'audio':'fiction';var tags=ac.__v060a4FictionTags(),tag=validSelected(tags,stateVal('acfun_v060_fiction_tag_'+mode,'')),sort=Number(stateVal('acfun_v060_fiction_sort_'+mode,'1')||1),rows=[];
    rows=requestRows(fictionTries(page,mode,tag,sort),'fiction','a7-fiction|'+mode+'|'+tag+'|'+sort+'|'+page,120,3600);
    if(!rows.length&&tag){
        rows=requestRows(fictionTries(page,mode,'',sort),'fiction','a7-fiction-all|'+mode+'|'+sort+'|'+page,120,3600);
        if(rows.length)try{setItem('acfun_v060_a7_fiction_fallback',mode+'|'+tag+' -> all')}catch(e){}
    }
    return rows
};

var oldShortList=ac.__v050ShortList;
ac.__v050ShortList=function(page){
    page=Number(page||1);var current=stateVal('acfun_v050_short_load_type','2')||'2',modes=[current,'2','3','4'],seen={},tries=[],base={page:page,pageNum:page,pageSize:30,limit:30};
    for(var i=0;i<modes.length;i++){
        var m=S(modes[i]);if(seen[m])continue;seen[m]=1;
        var p=copy(base);p.loadType=N(m);tries.push({path:'video/list',params:p});
        p=copy(base);p.loadType=N(m);p.videoContentType='shortVideo';p.contentType='shortVideo';p.videoType='shortVideo';p.video_content_type='shortVideo';tries.push({path:'video/list',params:p});
    }
    var rows=requestRows(tries,'video','a7-short|'+current+'|'+page,90,1800);if(rows.length)return rows;
    try{return typeof oldShortList==='function'?oldShortList.call(ac,page):[]}catch(e){return[]}
};

var oldDynamicInfo=ac.__v060a4DynamicInfo;
ac.__v060a4DynamicInfo=function(x){
    var info=typeof oldDynamicInfo==='function'?oldDynamicInfo.call(ac,x):{raw:x||{},kind:'dynamic'};info.time=humanTime(info.time||pick(x,['createTime','createdAt','publishTime','time'],''));return info
};

try{setItem('acfun_v060_runtime_a7','strict-taxonomy + fiction-auto-fallback + community-time');setItem('acfun_test_runtime','0.6.0-alpha7 runtime')}catch(e){}
})();
