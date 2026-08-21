/**
 * ACFun 0.6.0-alpha3 / Build 154 - resilient product detail.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha3';
var M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function card(d,x){var info=ac.itemInfo(x),m=[];if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.duration)m.push(info.duration);if(info.author)m.push(info.author);d.push({title:info.title,desc:m.join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:'movie_2',extra:{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,lineVisible:false}})}

ac.detail=function(){
    var d=[],id=S(MY_PARAMS.video_id||param('video_id')||param('id')),
        pTitle=S(MY_PARAMS.video_title||param('video_title')),
        pImg=S(MY_PARAMS.video_img||param('video_img')),
        fb=ac.safeJson(MY_PARAMS.video_data)||{};

    if(pTitle&&!fb.title)fb.title=pTitle;
    if(pImg&&!fb.coverImg)fb.coverImg=[pImg];
    if(MY_PARAMS.video_uri&&!fb.videoUrl)fb.videoUrl=MY_PARAMS.video_uri;
    if(id&&!fb.videoId&&!fb.id)fb.videoId=id;

    var key='detail|'+id,dc=ac.__v042Read?ac.__v042Read(key,1800,86400):{hit:false,data:null},
        force=getMyVar('acfun_force_detail_id','')===id,
        instant=getItem('acfun_fast_detail','1')==='1',
        obj=(dc.hit&&dc.data)?dc.data:fb;

    // 关键路由参数丢失时不再渲染“未命名”空页；有 ID 就主动恢复一次完整资料。
    var seedInfo=ac.itemInfo(obj),needRecover=!!id&&(!seedInfo.title||seedInfo.title==='未命名'||!seedInfo.img);
    if(force||!instant||needRecover){
        clearMyVar('acfun_force_detail_id');
        try{var full=ac.getDetail(id,fb);if(full&&typeof full==='object'){obj=full;if(ac.__v042Write)ac.__v042Write(key,full);dc={hit:true,data:full}}}
        catch(e){try{setItem('acfun_v060_detail_error',S(e.message||e))}catch(e0){}}
    }

    var info=ac.itemInfo(obj);
    if(!info.id)info.id=id;
    if((!info.title||info.title==='未命名')&&pTitle)info.title=pTitle;
    if((!info.img)&&pImg)info.img=pImg;

    if(!info.id){
        setPageTitle('视频详情');
        d.push({title:'没有拿到视频标识',desc:'当前详情入口缺少 videoId，已阻止继续显示“未命名”假详情。请返回列表重新进入；若重复出现，进入接口诊断。',col_type:'long_text',url:'hiker://empty'});
        d.push({title:'接口诊断',pic_url:I('settings_off'),img:I('settings_off'),col_type:'text_icon',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});
        setResult(d);return;
    }

    if(!info.title||info.title==='未命名')info.title='视频 '+info.id;
    var pic=ac.image(info.img);setPageTitle(info.title);try{if(pic)setPagePicUrl(pic)}catch(e1){}
    var meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('播放 '+ac.fmtNum(info.watch));if(info.like)meta.push('点赞 '+ac.fmtNum(info.like));if(info.duration)meta.push(info.duration);
    var playUrl=$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);ac.addHistory({id:vid,title:title,img:img,uri:uri,data:raw});return ac.play(vid,raw,uri)},info.id,JSON.stringify(obj),info.title,info.img,info.uri);

    if(pic)d.push({title:info.title,desc:meta.join(' · '),pic_url:pic,img:pic,url:playUrl,col_type:'pic_1_full',extra:{lineVisible:false}});
    d.push({title:rich(info.title,meta.join(' · ')),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});
    d.push({title:'播放',pic_url:I('play'),img:I('play'),col_type:'icon_small_3',url:playUrl,extra:{lineVisible:false}});
    d.push({title:ac.isFavorite(info.id)?'已收藏':'收藏',pic_url:I('favorite'),img:I('favorite'),col_type:'icon_small_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return'toast://已取消收藏'}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return'toast://已收藏'},info.id,info.title,info.img,info.uri,JSON.stringify(obj)),extra:{lineVisible:false}});
    d.push({title:'评论',pic_url:I('comment'),img:I('comment'),col_type:'icon_small_3',url:ac.__v060CommentsUrl?ac.__v060CommentsUrl(info.id,info.title):('hiker://page/acfun_comments?rule=ACFun&simple=true&video_id='+encodeURIComponent(info.id)+'&video_title='+encodeURIComponent(info.title)+'#noRecordHistory#'),extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title,lineVisible:false}});
    d.push({col_type:'line'});

    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');
    var tags=ac.pick(obj,['videoTags','tags','tagList'],[]);if(!Array.isArray(tags)&&obj.video)tags=ac.pick(obj.video,['videoTags','tags','tagList'],[]);
    var names=[];if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__v042TagName?ac.__v042TagName(tags[ti]):S(tags[ti]&&tags[ti].name||tags[ti]);if(nm&&names.indexOf(nm)<0)names.push(nm)}
    if((!intro||typeof intro==='object')&&!names.length)d.push({title:'加载完整资料',desc:'补全简介、标签和更完整的元数据。',pic_url:I('category'),img:I('category'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_detail_id',String(vid));refreshPage(false);return'hiker://empty'},info.id),extra:{lineVisible:false}});
    if(intro&&typeof intro!=='object'){d.push({title:rich('简介'),col_type:'rich_text',extra:{textSize:15,lineVisible:false}});d.push({title:E(intro).replace(/\n/g,'<br>'),col_type:'rich_text',extra:{textSize:13,lineVisible:false}})}
    if(names.length){d.push({title:rich('标签',names.length+' 个'),col_type:'rich_text',extra:{textSize:15,lineVisible:false}});names.slice(0,12).forEach(function(nm){d.push({title:nm,col_type:'scroll_button',url:'hiker://search?s='+encodeURIComponent(nm)+'&rule=ACFun',extra:{lineVisible:false}})})}

    var count=Number(getItem('acfun_related_count','6'))||6,rk='related|'+info.id+'|'+count,
        rc=ac.__v042Read?ac.__v042Read(rk,900,86400):{hit:false,data:null},rel=(rc.hit&&Array.isArray(rc.data))?rc.data:[],
        rf=getMyVar('acfun_force_related_id','')===info.id;
    if(rf){clearMyVar('acfun_force_related_id');try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:count},{timeout:750,maxAttempts:4}));if(rel.length&&ac.__v042Write)ac.__v042Write(rk,rel)}catch(e2){}}
    d.push({col_type:'line'});d.push({title:rich('相关推荐',rel.length?rel.length+' 条':''),col_type:'rich_text',extra:{textSize:16,lineVisible:false}});
    if(rel.length)rel.forEach(function(x){card(d,x)});
    else if(count>0)d.push({title:'加载相关推荐',desc:'需要时再请求，避免阻塞详情首开。',pic_url:I('featured'),img:I('featured'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_related_id',String(vid));refreshPage(false);return'hiker://empty'},info.id),extra:{lineVisible:false}});
    setResult(d)
};

try{setItem('acfun_test_runtime','0.6.0-alpha3 detail')}catch(e){}
})();
