// ACFun v0.2.2 object-cover/tag patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.2';

ac.__coverCandidates=function(root){
    var out=[];
    function add(path,val){
        if(val===undefined||val===null)return;
        if(typeof val!=='string'&&typeof val!=='number')return;
        var s=String(val).trim();
        if(!s||s==='[object Object]'||s==='null'||s==='undefined')return;
        var p=String(path||'').toLowerCase(),score=0;
        if(/cover|poster|thumb|thumbnail|preview|image|img|picture|pic/.test(p))score+=90;
        if(/video/.test(p))score+=12;
        if(/^https?:\/\//i.test(s)||s.indexOf('//')===0)score+=35;
        if(/\.(?:jpe?g|png|webp|gif|avif|bmp)(?:\?|#|$)/i.test(s))score+=70;
        if(/\/(?:cover|poster|thumb|image|images|img|upload|uploads|file|files)\//i.test(s))score+=25;
        if(/gradient|placeholder|defaultposter|default_cover|blur|color|avatar|icon|logo/i.test(p+' '+s))score-=130;
        if(/^#?[0-9a-f]{3,8}$/i.test(s)||/^rgba?\(/i.test(s)||/^linear-gradient/i.test(s))score-=180;
        if(s.length<6)score-=60;
        if(score>0)out.push({path:path,value:s,score:score});
    }
    function walk(v,path,depth){
        if(v===undefined||v===null||depth>9)return;
        if(typeof v==='string'||typeof v==='number'){add(path,v);return;}
        if(Array.isArray(v)){for(var i=0;i<v.length&&i<30;i++)walk(v[i],path+'['+i+']',depth+1);return;}
        if(typeof v==='object'){
            for(var k in v){
                if(!Object.prototype.hasOwnProperty.call(v,k))continue;
                walk(v[k],path?(path+'.'+k):k,depth+1);
            }
        }
    }
    walk(root,'',0);
    out.sort(function(a,b){return b.score-a.score;});
    var seen={},r=[];
    for(var i=0;i<out.length;i++){
        var key=out[i].value;if(seen[key])continue;seen[key]=1;r.push(out[i]);if(r.length>=20)break;
    }
    return r;
};

var __v022OldInfo=ac.itemInfo;
ac.itemInfo=function(x){
    var info=__v022OldInfo.call(ac,x||{}),bad=!info.img||String(info.img)==='[object Object]'||/^\[object\s+Object\]$/i.test(String(info.img));
    var cand=ac.__coverCandidates(x||{});
    if(bad&&cand.length)info.img=cand[0].value;
    else if(cand.length){
        var cur=String(info.img||'');
        var curScore=-999;
        for(var i=0;i<cand.length;i++)if(cand[i].value===cur){curScore=cand[i].score;break;}
        if(curScore<50&&cand[0].score>curScore+25)info.img=cand[0].value;
    }
    try{
        if(cand.length){
            setItem('acfun_last_cover_candidates',cand.slice(0,8).map(function(c){return c.score+' | '+c.path+' = '+c.value;}).join('\n'));
        }
    }catch(e){}
    return info;
};

// 首页/搜索卡片沿用 0.2.1 的 pic_url 逻辑，但确保先经过对象封面修复。
var __v022OldCard=ac.addVideoCard;
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x||{}),pic=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(pic)setItem('acfun_last_cover_resolved',String(pic));
    return __v022OldCard.call(ac,d,x,col);
};

ac.__tagName=function(t){
    if(t===undefined||t===null)return '';
    if(typeof t==='string'||typeof t==='number')return String(t);
    if(typeof t==='object'){
        var v=ac.deepFind(t,['tagName','name','title','label','text','value'],0);
        if(v!==undefined&&v!==null&&typeof v!=='object')return String(v);
    }
    return '';
};

// 重写详情页，避免对象标签被 String() 成 [object Object]，并强制使用修复后的封面。
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
    d.push({title:info.title,desc:desc.join('  '),pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);var it={id:vid,title:title,img:img,uri:uri,data:raw};ac.addHistory(it);return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.deepFind(obj,['videoTags','tags','tagList'],0),names=[];
    if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__tagName(tags[ti]);if(nm&&names.indexOf(nm)<0)names.push(nm);}
    if(names.length)d.push({title:'标签：'+names.join(' · '),col_type:'long_text',url:'hiker://empty'});
    var rel=[];try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e2){}
    if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

// 精简诊断增加候选字段，下一次无需整段接口日志。
var __v022OldDiag=ac.diag;
ac.diag=function(){
    var d=[];setPageTitle('ACFun 图片诊断');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\nToken：'+(getItem('acfun_token','')?'YES':'NO')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')+'\nLast：'+(getItem('acfun_last_api','')||'无')));
    d.push(ac.diagBlock('最终封面','CoverRaw='+getItem('acfun_last_cover_raw','')+'\n\nCoverResolved='+getItem('acfun_last_cover_resolved','')+'\n\nImgDomain='+getItem('acfun_img_domain','')));
    d.push(ac.diagBlock('候选图片字段',getItem('acfun_last_cover_candidates','')||'尚未采集'));
    d.push({title:'复制图片诊断',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){return 'copy://ACFun '+getItem('acfun_runtime_version','remote')+'\nCoverRaw='+getItem('acfun_last_cover_raw','')+'\nCoverResolved='+getItem('acfun_last_cover_resolved','')+'\nImgDomain='+getItem('acfun_img_domain','')+'\nCandidates=\n'+getItem('acfun_last_cover_candidates','');})});
    setItem('acfun_runtime_version',ac.build);setResult(d);
};

})();