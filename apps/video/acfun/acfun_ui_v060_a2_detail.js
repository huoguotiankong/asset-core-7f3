/** ACFun 0.6.0-alpha2 / Build 153 - productized video detail */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha2';
var M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function card(d,x){var info=ac.itemInfo(x),m=[];if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.duration)m.push(info.duration);if(info.author)m.push(info.author);d.push({title:info.title,desc:m.join('  ·  '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:'movie_2',extra:{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,lineVisible:false}})}

ac.detail=function(){
 var d=[],id=S(MY_PARAMS.video_id||getParam('video_id','')||getParam('id','')),fb=ac.safeJson(MY_PARAMS.video_data)||{};
 if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
 if(MY_PARAMS.video_img&&!fb.coverImg)fb.coverImg=[MY_PARAMS.video_img];
 if(MY_PARAMS.video_uri&&!fb.videoUrl)fb.videoUrl=MY_PARAMS.video_uri;
 var key='detail|'+id,dc=ac.__v042Read?ac.__v042Read(key,1800,86400):{hit:false,data:null},force=getMyVar('acfun_force_detail_id','')===id,instant=getItem('acfun_fast_detail','1')==='1',obj=(dc.hit&&dc.data)?dc.data:fb;
 if(force||!instant){clearMyVar('acfun_force_detail_id');try{var full=ac.getDetail(id,fb);if(full&&typeof full==='object'){obj=full;if(ac.__v042Write)ac.__v042Write(key,full)}}catch(e){try{setItem('acfun_v060_detail_error',String(e.message||e))}catch(e0){}}}
 var info=ac.itemInfo(obj);if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';var pic=ac.image(info.img);setPageTitle(info.title);try{setPagePicUrl(pic)}catch(e1){}
 var meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('播放 '+ac.fmtNum(info.watch));if(info.like)meta.push('点赞 '+ac.fmtNum(info.like));if(info.duration)meta.push(info.duration);
 d.push({title:info.title,desc:meta.join(' · '),pic_url:pic,img:pic,url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);ac.addHistory({id:vid,title:title,img:img,uri:uri,data:raw});return ac.play(vid,raw,uri)},info.id,JSON.stringify(obj),info.title,info.img,info.uri),col_type:'pic_1_full',extra:{lineVisible:false}});
 d.push({title:rich(info.title,meta.join(' · ')),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});
 d.push({title:'播放',pic_url:I('play'),img:I('play'),col_type:'icon_small_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);ac.addHistory({id:vid,title:title,img:img,uri:uri,data:raw});return ac.play(vid,raw,uri)},info.id,JSON.stringify(obj),info.title,info.img,info.uri),extra:{lineVisible:false}});
 d.push({title:ac.isFavorite(info.id)?'已收藏':'收藏',pic_url:I('favorite'),img:I('favorite'),col_type:'icon_small_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return'toast://已取消收藏'}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return'toast://已收藏'},info.id,info.title,info.img,info.uri,JSON.stringify(obj)),extra:{lineVisible:false}});
 d.push({title:'评论',pic_url:I('comment'),img:I('comment'),col_type:'icon_small_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title,lineVisible:false}});
 d.push({col_type:'line'});
 if(!dc.hit)d.push({title:'加载完整资料',desc:'简介、标签等按需加载，不阻塞首次打开。',pic_url:I('category'),img:I('category'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_detail_id',String(vid));refreshPage(false);return'hiker://empty'},id),extra:{lineVisible:false}});
 var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');if(intro&&typeof intro!=='object'){d.push({title:rich('简介'),col_type:'rich_text',extra:{textSize:15,lineVisible:false}});d.push({title:E(intro).replace(/\n/g,'<br>'),col_type:'rich_text',extra:{textSize:13,lineVisible:false}})}
 var tags=ac.pick(obj,['videoTags','tags','tagList'],[]);if(!Array.isArray(tags)&&obj.video)tags=ac.pick(obj.video,['videoTags','tags','tagList'],[]);var names=[];if(Array.isArray(tags))for(var i=0;i<tags.length;i++){var n=ac.__v042TagName?ac.__v042TagName(tags[i]):S(tags[i]&&tags[i].name||tags[i]);if(n&&names.indexOf(n)<0)names.push(n)}if(names.length){d.push({title:rich('标签'),col_type:'rich_text',extra:{textSize:15,lineVisible:false}});names.slice(0,12).forEach(function(n){d.push({title:n,col_type:'scroll_button',url:'hiker://search?s='+encodeURIComponent(n)+'&rule=ACFun',extra:{lineVisible:false}})})}
 var count=Number(getItem('acfun_related_count','6'))||6,rk='related|'+id+'|'+count,rc=ac.__v042Read?ac.__v042Read(rk,900,86400):{hit:false,data:null},rel=(rc.hit&&Array.isArray(rc.data))?rc.data:[],rf=getMyVar('acfun_force_related_id','')===id;if(rf){clearMyVar('acfun_force_related_id');try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:id,pageNum:1,pageSize:count},{timeout:750,maxAttempts:4}));if(rel.length&&ac.__v042Write)ac.__v042Write(rk,rel)}catch(e2){}}
 d.push({col_type:'line'});d.push({title:rich('相关推荐',rel.length?rel.length+' 条':''),col_type:'rich_text',extra:{textSize:16,lineVisible:false}});if(rel.length)rel.forEach(function(x){card(d,x)});else if(count>0)d.push({title:'加载相关推荐',desc:'按需加载，保持详情页首开速度。',pic_url:I('featured'),img:I('featured'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(vid){putMyVar('acfun_force_related_id',String(vid));refreshPage(false);return'hiker://empty'},id),extra:{lineVisible:false}});
 setResult(d)
};
try{setItem('acfun_test_runtime','0.6.0-alpha2 detail')}catch(e){}
})();
