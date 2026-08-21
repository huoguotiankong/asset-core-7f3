// ACFun v0.4.2 - cache-first instant navigation + fast detail
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.4.2';
ac.imageCipher='xor:2020-zq3-888 / prefix100 / _480 + persistent cache';
ac.runtimeMode='cache-first-instant-ui';

// ---------- fast common-schema parser ---------------------------------------
var __v042SlowItemInfo=ac.itemInfo;
ac.__v042FirstMedia=function(v){
    if(v===undefined||v===null)return '';
    if(typeof v==='string'||typeof v==='number')return String(v);
    if(Array.isArray(v)){for(var i=0;i<v.length&&i<4;i++){var s=ac.__v042FirstMedia(v[i]);if(s)return s;}return '';}
    if(typeof v==='object'){
        var ks=['url','src','path','image','img','cover','value'];
        for(var j=0;j<ks.length;j++)if(v[ks[j]]!==undefined){var s2=ac.__v042FirstMedia(v[ks[j]]);if(s2)return s2;}
    }
    return '';
};
ac.itemInfo=function(x){
    x=x||{};var v=x.video||x.videoInfo||x.content||x;if(v&&v.video&&typeof v.video==='object')v=v.video;
    if(!v||typeof v!=='object')return __v042SlowItemInfo.call(ac,x);
    var u=x.user||x.userInfo||x.blogger||v.user||v.userInfo||{};
    var id=ac.pick(v,['videoId','id','vid','lsjVideoId'],ac.pick(x,['videoId','id','vid'],''));
    var title=ac.pick(v,['videoTitle','title','name','video_title'],ac.pick(x,['title','name'],''));
    var img=ac.__v042FirstMedia(v.coverImg)||ac.__v042FirstMedia(v.videoCover)||ac.__v042FirstMedia(v.cover)||ac.__v042FirstMedia(v.coverUrl)||ac.__v042FirstMedia(v.img)||ac.__v042FirstMedia(v.image)||ac.__v042FirstMedia(v.poster)||ac.__v042FirstMedia(v.verticalImg)||ac.__v042FirstMedia(x.coverImg)||ac.__v042FirstMedia(x.cover)||ac.__v042FirstMedia(x.img);
    if(!img||(!id&&!title))return __v042SlowItemInfo.call(ac,x);
    var author=ac.pick(u,['nickname','nickName','name','username','userName'],ac.pick(v,['author','userName','nickname'],''));
    var duration=ac.pick(v,['duration','videoDuration','video_duration','playTime'],'');
    var watch=ac.pick(v,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'],'');
    var like=ac.pick(v,['likeNum','likes','favoriteNum'],'');
    var uri=ac.pick(v,['videoUri','videoUrl','playUrl','url','movieurl'],'');
    return {id:String(id||''),title:String(title||'未命名'),img:String(img||''),author:String(author||''),duration:String(duration||''),watch:String(watch||''),like:String(like||''),uri:String(uri||''),raw:v};
};

// ---------- network fast-fail ------------------------------------------------
var __v042ApiRaw=ac.apiRaw;
ac.apiRaw=function(path,params,opt){
    var o={},k;opt=opt||{};for(k in opt)o[k]=opt[k];
    if(getItem('acfun_good_host','')&&getItem('acfun_fast_api','1')==='1'){
        var cap=Number(getItem('acfun_fast_attempts','4'))||4;
        if(!o.maxAttempts||Number(o.maxAttempts)>cap)o.maxAttempts=cap;
        if(!o.timeout)o.timeout=750;
    }
    var ts=Date.now(),r=__v042ApiRaw.call(ac,path,params,o);
    try{putMyVar('acfun_last_api_ms',String(Date.now()-ts));putMyVar('acfun_last_api_path',String(path));}catch(e){}
    return r;
};

// ---------- generic file cache ----------------------------------------------
ac.__v042Hash=function(s){
    s=String(s||'');var h1=0x811c9dc5,h2=5381;
    for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1^=c;h1=(h1+(h1<<1)+(h1<<4)+(h1<<7)+(h1<<8)+(h1<<24))>>>0;h2=(((h2<<5)+h2)^c)>>>0;}
    return ('00000000'+h1.toString(16)).slice(-8)+('00000000'+h2.toString(16)).slice(-8);
};
ac.__v042DataPath=function(key){return 'hiker://files/cache/acfun_data/'+ac.__v042Hash(key)+'.json';};
ac.__v042Read=function(key,ttlSec,staleSec){
    var p=ac.__v042DataPath(key),ret={hit:false,fresh:false,stale:false,data:null,age:0,path:p};
    try{
        if(!fileExist(p))return ret;
        var o=JSON.parse(readFile(p)||'{}'),ts=Number(o.ts||0);ret.age=Math.max(0,Date.now()-ts);ret.data=o.data;ret.hit=o.data!==undefined;
        ret.fresh=ret.hit&&ret.age<=Number(ttlSec||0)*1000;
        ret.stale=ret.hit&&ret.age<=Number(staleSec||ttlSec||0)*1000;
    }catch(e){}
    return ret;
};
ac.__v042Write=function(key,data){
    try{writeFile(ac.__v042DataPath(key),JSON.stringify({ts:Date.now(),data:data}));return true;}catch(e){return false;}
};
ac.__v042Delete=function(key){try{deleteFile(ac.__v042DataPath(key));}catch(e){}}
ac.__v042ClearDataCache=function(){
    try{var p=String(getPath('hiker://files/cache/acfun_data')).replace(/^file:\/\/+/,'/'),f=new java.io.File(p);function del(x){if(!x||!x.exists())return;var a=x.listFiles();if(a)for(var i=0;i<a.length;i++)del(a[i]);x.delete();}del(f);return true;}catch(e){return false;}
};

// ---------- image thumbnail + persistent decrypted cache ---------------------
ac.__v042Plain=function(u){
    u=String(u||'').trim();if(!u)return '';u=u.replace(/\\\//g,'/');
    var marks=['@js=','@headers=','@Referer=','@Cookie='];for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}
    if(u.indexOf('//')===0)u='https:'+u;if(/^(data:|hiker:|file:)/i.test(u)||/^https?:\/\//i.test(u))return u;
    var d='';try{d=getMyVar('acfun_v042_img_domain','');}catch(e){}
    if(!d)d=String(getItem('acfun_img_domain','')||'').replace(/\/+$/,'');
    if(!d){try{var cfg=ac.fetchConfig(false)||{};d=String(ac.deepFind(cfg,['imgDomain','imageDomain','cdnDomain'],0)||'').replace(/\/+$/,'');if(d)putMyVar('acfun_v042_img_domain',d);}catch(e2){}}
    return d?d+'/'+u.replace(/^\/+/, ''):String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};
ac.__v042ImageCachePath=function(url){return 'hiker://files/cache/acfun_cover/'+ac.__v042Hash(url)+'.jpg';};
ac.__v042Thumb=function(url){
    if(getItem('acfun_image_quality','480')==='original')return url;
    if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;
    var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';
};
ac.__v042Headers=function(){return {'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};};
ac.image=function(u){
    var plain=ac.__v042Plain(u);if(!plain)return '';
    if(/^(data:|hiker:|file:)/i.test(plain)||!/\.asigoo\.com\//i.test(plain))return plain;
    var fullCache=ac.__v042ImageCachePath(plain);try{if(fileExist(fullCache))return getPath(fullCache);}catch(e0){}
    var target=ac.__v042Thumb(plain),cache=ac.__v042ImageCachePath(target);try{if(fileExist(cache))return getPath(cache);}catch(e1){}
    var abs='';try{abs=getPath(cache);}catch(e2){}
    return $(target,ac.__v042Headers()).image(function(cacheAbs){return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);},abs);
};

// ---------- cards ------------------------------------------------------------
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];if(info.author)desc.push(info.author);if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));if(info.like)desc.push('♥ '+ac.fmtNum(info.like));if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    try{if(!getMyVar('acfun_v042_diag_cover','')){putMyVar('acfun_v042_diag_cover',String(info.img||''));setItem('acfun_last_cover_raw',String(info.img||''));}}catch(e){}
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:ac.detailUrl(info),col_type:col||getItem('acfun_card_style','movie_2'),extra:{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,longClick:[{title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在';eval(__s);return ac.favoriteFromParams();})},{title:'复制标题',js:$.toString(function(){return 'copy://'+String(MY_PARAMS.video_title||'');})}]}});
};

// ---------- cache-first list/category/search ---------------------------------
var __v042NetworkVideoList=ac.videoList;
ac.__v042ListKey=function(tab,page){return 'list|'+String(tab||'recommend')+'|'+String(getMyVar('acfun_classify_id',''))+'|'+String(page||1)+'|'+String(getItem('acfun_page_size','12'));};
ac.videoList=function(tab,page){
    var key=ac.__v042ListKey(tab,page),ttl=Number(getItem('acfun_page_cache_seconds','240'))||240,stale=Number(getItem('acfun_stale_cache_seconds','1800'))||1800;
    var force=getMyVar('acfun_force_list_key','')===key;if(force)clearMyVar('acfun_force_list_key');
    var c=ac.__v042Read(key,ttl,stale),instant=getItem('acfun_instant_switch','1')==='1';
    if(!force&&(c.fresh||(instant&&c.stale))&&Array.isArray(c.data)){putMyVar('acfun_last_list_source',c.fresh?'cache':'stale-cache');return c.data;}
    var data=[];try{data=__v042NetworkVideoList.call(ac,tab,page)||[];}catch(e){}
    if(data.length){ac.__v042Write(key,data);putMyVar('acfun_last_list_source','network');return data;}
    if(c.hit&&Array.isArray(c.data)){putMyVar('acfun_last_list_source','fallback-cache');return c.data;}
    return [];
};
var __v042NetworkCategory=ac.categoryList;
ac.categoryList=function(){
    var key='category-list',c=ac.__v042Read(key,21600,86400);if(c.stale&&Array.isArray(c.data))return c.data;
    var a=[];try{a=__v042NetworkCategory.call(ac)||[];}catch(e){}if(a.length)ac.__v042Write(key,a);return a.length?a:(c.hit?c.data:[]);
};

// ---------- faster nav: no full loading animation ----------------------------
ac.nav=function(d){
    var tabs=[['推荐','recommend'],['最新','new'],['热门','hot'],['分类','classify'],['短视频','short']],cur=getMyVar('acfun_tab','recommend');
    tabs.forEach(function(t){d.push({title:cur===t[1]?'““””<b><font color="#17A673">'+t[0]+'</font></b>':t[0],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_tab',v);if(v!=='classify')clearMyVar('acfun_classify_id');refreshPage(false);return 'hiker://empty';},t[1])});});
    d.push({title:'↻ 刷新',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){var tab=getMyVar('acfun_tab','recommend'),key='list|'+tab+'|'+String(getMyVar('acfun_classify_id',''))+'|1|'+String(getItem('acfun_page_size','12'));putMyVar('acfun_force_list_key',key);refreshPage(false);return 'hiker://empty';})});
    [['收藏','acfun_favorites'],['历史','acfun_history'],['设置','acfun_settings']].forEach(function(t){d.push({title:t[0],col_type:'scroll_button',url:'hiker://page/'+t[1]+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:t[0]}});});
};

// ---------- search cache -----------------------------------------------------
ac.search=function(){
    var d=[],kw=getParam('kw','')||getParam('s','')||getMyVar('acfun_search_kw','');if(!kw){try{kw=decodeURIComponent(getParam('q',''));}catch(e){}}
    putMyVar('acfun_search_kw',kw);var size=Number(getItem('acfun_page_size','12'))||12,key='search|'+kw+'|'+MY_PAGE+'|'+size,c=ac.__v042Read(key,120,900),list=[];
    if(c.stale&&Array.isArray(c.data))list=c.data;
    if(!list.length){var p={keyword:kw,keyWord:kw,name:kw,pageNum:MY_PAGE,page:MY_PAGE,pageSize:size,limit:size,searchType:'video'};try{list=ac.arr(ac.api('search/keyWordV2',p,{timeout:750,maxAttempts:4}));}catch(e1){}if(!list.length)try{list=ac.arr(ac.api('search/keyWord',p,{timeout:750,maxAttempts:4}));}catch(e2){}if(list.length)ac.__v042Write(key,list);}
    list.forEach(function(x){ac.addVideoCard(d,x,'movie_2');});if(!list.length&&MY_PAGE===1)d.push({title:'没有搜索到结果',desc:'关键词：'+kw,col_type:'long_text',url:'hiker://empty'});setResult(d);
};

ac.__v042TagName=function(t){if(t===undefined||t===null)return '';if(typeof t==='string'||typeof t==='number')return String(t);if(typeof t==='object'){var a=['tagName','name','title','label','text','value'];for(var i=0;i<a.length;i++)if(t[a[i]]!==undefined&&typeof t[a[i]]!=='object')return String(t[a[i]]);}return '';};

// ---------- instant detail: fallback first, network on demand ----------------
ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||getParam('id','')),fb=ac.safeJson(MY_PARAMS.video_data)||{};
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;if(MY_PARAMS.video_img&&!fb.coverImg)fb.coverImg=[MY_PARAMS.video_img];if(MY_PARAMS.video_uri&&!fb.videoUrl)fb.videoUrl=MY_PARAMS.video_uri;
    var detailKey='detail|'+id,dc=ac.__v042Read(detailKey,1800,86400),force=getMyVar('acfun_force_detail_id','')===id,instant=getItem('acfun_fast_detail','1')==='1',obj=(dc.hit&&dc.data)?dc.data:fb;
    if(force||!instant){clearMyVar('acfun_force_detail_id');try{var full=ac.getDetail(id,fb);if(full&&typeof full==='object'){obj=full;ac.__v042Write(detailKey,full);}}catch(e){}}
    var info=ac.itemInfo(obj);if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);setPageTitle(info.title);try{setPagePicUrl(pic);}catch(e0){}
    var desc=[];if(info.author)desc.push('UP：'+info.author);if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));if(info.duration)desc.push(info.duration);
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在';eval(__s);ac.addHistory({id:vid,title:title,img:img,uri:uri,data:raw});return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    d.push({title:dc.hit?'✓ 完整资料已缓存':'加载完整资料',desc:dc.hit?'详情缓存可直接复用':'按需请求完整简介、标签等，不阻塞首次打开',col_type:'text_1',url:dc.hit?'hiker://empty':$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_detail_id',String(vid));refreshPage(false);return 'hiker://empty';},id)});
    d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+info.title});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.pick(obj,['videoTags','tags','tagList'],[]);if(!Array.isArray(tags)&&obj.video)tags=ac.pick(obj.video,['videoTags','tags','tagList'],[]);var names=[];
    if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__v042TagName(tags[ti]);if(nm&&names.indexOf(nm)<0)names.push(nm);}if(names.length){d.push({title:'标签',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});names.slice(0,10).forEach(function(nm){d.push({title:nm,col_type:'scroll_button',url:'hiker://search?s='+encodeURIComponent(nm)+'&rule=ACFun'});});}
    var relCount=Number(getItem('acfun_related_count','6'))||6,relKey='related|'+id+'|'+relCount,rc=ac.__v042Read(relKey,900,86400),rel=(rc.hit&&Array.isArray(rc.data))?rc.data:[],relForce=getMyVar('acfun_force_related_id','')===id;
    if(relForce){clearMyVar('acfun_force_related_id');try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:id,pageNum:1,pageSize:relCount},{timeout:750,maxAttempts:4}));if(rel.length)ac.__v042Write(relKey,rel);}catch(e3){}}
    if(rel.length){d.push({title:'相关推荐',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});rel.slice(0,relCount).forEach(function(x){ac.addVideoCard(d,x,'movie_3');});}
    else if(relCount>0)d.push({title:'加载相关推荐',desc:'按需加载，避免每次打开详情都等待第二个网络请求',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_related_id',String(vid));refreshPage(false);return 'hiker://empty';},id)});
    setResult(d);
};

// ---------- settings ---------------------------------------------------------
ac.settings=function(){
    var d=[];setPageTitle('ACFun 设置');d.push({title:'极速体验',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'极速切换：'+(getItem('acfun_instant_switch','1')==='1'?'开':'关'),desc:'优先显示标签页缓存；需要最新内容时点首页“↻刷新”。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_instant_switch',getItem('acfun_instant_switch','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'极速详情：'+(getItem('acfun_fast_detail','1')==='1'?'开':'关'),desc:'先使用列表已有数据秒开详情，完整资料和推荐按需加载。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_fast_detail',getItem('acfun_fast_detail','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'页面缓存：'+getItem('acfun_page_cache_seconds','240')+' 秒',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['60','120','240','600'];return 'select://'+JSON.stringify({title:'页面缓存秒数',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_cache_seconds','240'))),col:1,js:$.toString(function(){setItem('acfun_page_cache_seconds',input);refreshPage(false);})});})});
    d.push({title:'清理页面数据缓存',desc:'清除推荐/热门/分类/详情/搜索缓存，不影响收藏历史和封面。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{var p=String(getPath('hiker://files/cache/acfun_data')).replace(/^file:\/\/+/,'/'),f=new java.io.File(p);function del(x){if(!x||!x.exists())return;var a=x.listFiles();if(a)for(var i=0;i<a.length;i++)del(a[i]);x.delete();}del(f);return 'toast://页面缓存已清理';}catch(e){return 'toast://清理失败';}})});
    d.push({title:'性能与图片',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'图片质量：'+(getItem('acfun_image_quality','480')==='original'?'原图':'极速 480'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['极速 480','原图'];return 'select://'+JSON.stringify({title:'图片质量',options:a,selectedIndex:getItem('acfun_image_quality','480')==='original'?1:0,col:1,js:$.toString(function(){setItem('acfun_image_quality',input==='原图'?'original':'480');refreshPage(false);})});})});
    d.push({title:'快速接口：'+(getItem('acfun_fast_api','1')==='1'?'开':'关'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_fast_api',getItem('acfun_fast_api','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'每页数量：'+getItem('acfun_page_size','12'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['8','10','12','20'];return 'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_page_size','12'))),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false);})});})});
    d.push({title:'相关推荐数量：'+getItem('acfun_related_count','6'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['0','3','6','9'];return 'select://'+JSON.stringify({title:'相关推荐数量',options:a,selectedIndex:Math.max(0,a.indexOf(getItem('acfun_related_count','6'))),col:1,js:$.toString(function(){setItem('acfun_related_count',input);refreshPage(false);})});})});
    d.push({title:'清理封面缓存',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){try{var p=String(getPath('hiker://files/cache/acfun_cover')).replace(/^file:\/\/+/,'/'),f=new java.io.File(p);function del(x){if(!x||!x.exists())return;var a=x.listFiles();if(a)for(var i=0;i<a.length;i++)del(a[i]);x.delete();}del(f);return 'toast://封面缓存已清理';}catch(e){return 'toast://清理失败';}})});
    d.push({title:'播放与内容',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'自动弹幕：'+(getItem('acfun_auto_danmu','1')==='1'?'开':'关'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_auto_danmu',getItem('acfun_auto_danmu','1')==='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
    d.push({title:'接口诊断',desc:'最近 '+getMyVar('acfun_last_api_path','')+' / '+getMyVar('acfun_last_api_ms','-')+'ms',col_type:'text_1',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'远程更新',col_type:'text_1',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#'});
    d.push({title:'版本 '+ac.build,desc:'Cache-First Instant UI：标签页缓存、极速详情、按需相关推荐、480封面缓存。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};

ac.diag=function(){
    var d=[];setPageTitle('ACFun 性能诊断');d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n模式：'+ac.runtimeMode+'\n列表来源：'+getMyVar('acfun_last_list_source','-')+'\n最近API：'+getMyVar('acfun_last_api_path','')+' / '+getMyVar('acfun_last_api_ms','-')+'ms\n极速切换：'+getItem('acfun_instant_switch','1')+'\n极速详情：'+getItem('acfun_fast_detail','1')));setResult(d);
};

var __v042Home=ac.home;ac.home=function(){if(typeof MY_PAGE==='undefined'||MY_PAGE===1){try{clearMyVar('acfun_v042_diag_cover');}catch(e){}}return __v042Home.apply(ac,arguments);};
})();
