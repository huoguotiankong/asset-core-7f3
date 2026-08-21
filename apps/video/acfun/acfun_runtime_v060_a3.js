/**
 * ACFun 0.6.0-alpha3 / Build 154
 * Runtime normalization: user-facing taxonomy, resilient short feed, robust detail routing.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');

function S(v){return String(v===undefined||v===null?'':v)}
function num(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}

// ---------- user-facing taxonomy cleanup ------------------------------------
ac.__v060VisibleCategoryName=function(name,kind){
    var n=S(name).replace(/\s+/g,' ').trim();
    if(!n)return false;
    if(/^[>›»→▶]+$/.test(n))return false;
    if(/(?:测试|test|comicsclass|ces\d*|罗峰测试|竖版|竖横|横滑|六宫格|四宫格|两格|专题\d|^2026\d+)/i.test(n))return false;
    // 当前漫画接口会返回布局/开发频道名，实机已确认不应暴露给用户。
    if(kind==='comic'&&(/^(?:竖|坚)[四两]$/.test(n)||/^0\d漫画(?:频道|分类)$/.test(n)||/^\d{2}漫画(?:频道|分类)$/.test(n)))return false;
    return true;
};

var __a3ComicStations=ac.__v050ComicStations;
if(typeof __a3ComicStations==='function'){
    ac.__v050ComicStations=function(){
        var src=[];try{src=__a3ComicStations.call(ac)||[]}catch(e){}
        var out=[],seen={};
        for(var i=0;i<src.length;i++){
            var x=src[i]||{},id=S(x.id),name=S(x.name).trim();
            if(!id||!ac.__v060VisibleCategoryName(name,'comic'))continue;
            var k=id+'|'+name;if(seen[k])continue;seen[k]=1;out.push(x);
        }
        return out;
    };
}

// ---------- resilient short feed -------------------------------------------
ac.__v060ShortMode=function(){
    var v=S(getMyVar('acfun_v050_short_load_type','')||getItem('acfun_v060_state_acfun_v050_short_load_type','')||'3');
    return v==='4'?'4':'3';
};

ac.__v060ShortRequest=function(page,loadType,withType,keySuffix){
    var p={page:Number(page||1),pageNum:Number(page||1),pageSize:15,limit:15,loadType:Number(loadType)};
    if(withType){p.videoContentType='shortVideo';p.videoType='shortVideo';p.videoTypeName='shortVideo';}
    try{return ac.__v047ReqList('video/list',p,'v060-short-a3|'+loadType+'|'+(withType?'typed':'plain')+'|'+page+'|'+S(keySuffix||''))||[]}catch(e){
        try{setItem('acfun_v060_short_error',S(e.message||e))}catch(e0){}
        return [];
    }
};

ac.__v050ShortList=function(page){
    page=Number(page||1);var lt=ac.__v060ShortMode(),list=[];
    // 先按 APP 短视频语义明确传 shortVideo 类型；旧接口有时只认 loadType，因此保留 plain fallback。
    list=ac.__v060ShortRequest(page,lt,true,'primary');
    if(!list.length)list=ac.__v060ShortRequest(page,lt,false,'plain');
    // 旧 Core 的 short 分支会补 videoContentType/videoType，可作为第三层兼容。
    if(!list.length&&typeof ac.videoList==='function')try{list=ac.videoList('short',page)||[]}catch(e1){}
    // 当前服务端个别节点对 3/4 语义存在差异：仅在本模式完全空时尝试另一公开模式，避免直接白屏。
    if(!list.length){var alt=lt==='3'?'4':'3';list=ac.__v060ShortRequest(page,alt,true,'alternate');if(list.length)try{setItem('acfun_v060_short_fallback_mode',alt)}catch(e2){}}
    if(list.length)try{setItem('acfun_v060_short_last_ok',lt+'|'+page+'|'+list.length)}catch(e3){}
    return list;
};

// ---------- robust page routing --------------------------------------------
// pic_1_full/icon 等组件在部分海阔版本上对 extra 透传并不一致；关键实体 ID/标题/封面写入 URL 参数。
ac.__v060DetailUrl=function(info){
    info=info||{};
    var rule='ACFun';try{rule=S(MY_RULE&&MY_RULE.title||'ACFun')}catch(e){}
    var q='rule='+encodeURIComponent(rule)+'&simple=true';
    if(info.id)q+='&video_id='+encodeURIComponent(S(info.id));
    if(info.title)q+='&video_title='+encodeURIComponent(S(info.title));
    if(info.img)q+='&video_img='+encodeURIComponent(S(info.img));
    return 'hiker://page/acfun_detail?'+q+'#noHistory#';
};
ac.detailUrl=function(info){return ac.__v060DetailUrl(info)};

ac.__v060CommentsUrl=function(id,title){
    return 'hiker://page/acfun_comments?rule=ACFun&simple=true&video_id='+encodeURIComponent(S(id||''))+'&video_title='+encodeURIComponent(S(title||''))+'#noRecordHistory#';
};

try{setItem('acfun_v060_runtime_a3','taxonomy+short+detail-routing')}catch(e){}
})();
