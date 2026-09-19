/* ACFAN 0.1.0-test.3 provider - rebuilt from acfun 1.9.7 APK route/field evidence */
var ACFANProvider=(function(){
  var C=ACFANCore,P=ACFANProtocol;
  C.version='0.1.0-test.3';C.build=10103;
  C.diag=function(stage,msg,extra){var x={time:Date.now(),version:C.version,build:C.build,stage:C.s(stage),msg:C.s(msg).slice(0,1800),extra:extra||{}};try{setItem(C.K.diag,JSON.stringify(x));}catch(e){}return x;};
  function deepFirst(root,keys){
    var v=C.deep(root,keys,0);return C.first(v);
  }
  function cover(root){
    root=root||{};
    var keys=['videoCover','coverImg','imageUrl','imgUrl','thumbUrl','thumbURL','posterMainUrl','posterDownloadUrl','generatedCoverImg','templateCoverImg','verticalImg','backImg','cardImg','dynamicImg','image','images','cover','poster','img','picture','pictures','defaultVideoPoster'];
    return deepFirst(root,keys);
  }
  function mediaPath(root){
    root=root||{};var keys=['videoUrl','playUrl','videoUri','m3u8Url','m3u8','playPath','sourcePath','audioUrl','audioPath','url','path'];
    var v=deepFirst(root,keys);return C.s(v);
  }
  function userName(root){var u=C.deep(root,['user','userInfo','blogger','authorInfo'],0)||{};return C.s(C.pick(u,['nickname','nickName','userName','username','name'],C.deep(root,['nickname','nickName','userName','authorName'],0)));}
  function videoInfo(x){
    x=x||{};var v=x.video||x.videoInfo||x.content||x;if(v&&v.video&&typeof v.video==='object')v=v.video;
    var id=C.pick(v,['videoId','id','vid','lsjVideoId'],C.deep(x,['videoId','lsjVideoId','vid'],0));
    var title=C.pick(v,['videoTitle','title','name','video_title'],C.deep(x,['videoTitle','title','name'],0)||'未命名视频');
    var img=cover(v)||cover(x);
    return{kind:'video',id:C.s(id),title:C.clean(title),img:C.s(img),author:userName(x)||C.s(C.pick(v,['authorName','author'],'')||''),duration:C.s(C.deep(x,['duration','videoDuration','playTime','video_duration'],0)),watch:C.s(C.deep(x,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'],0)),like:C.s(C.deep(x,['likeNum','likes','favoriteNum','likeCount'],0)),uri:mediaPath(x),desc:C.clean(C.deep(x,['description','desc','introduction','videoDesc'],0)),raw:x};
  }
  function comicInfo(x){
    x=x||{};var id=C.pick(x,['comicsId','comicId','id','comic_id'],C.deep(x,['comicsId','comicId'],0));
    var title=C.pick(x,['comicsTitle','comicTitle','title','name','comic_title'],C.deep(x,['comicsTitle','comicTitle','title'],0)||'未命名漫画');
    return{kind:'comic',id:C.s(id),title:C.clean(title),img:C.s(cover(x)),author:C.clean(C.deep(x,['authorName','author','nickName','nickname'],0)),desc:C.clean(C.deep(x,['subTitle','subtitle','description','desc','info','introduction'],0)),raw:x};
  }
  function fictionInfo(x,mode){
    x=x||{};var id=C.pick(x,['fictionId','bookId','novelId','id'],C.deep(x,['fictionId','bookId'],0));
    var title=C.pick(x,['fictionTitle','bookTitle','bookName','novelTitle','title','name'],C.deep(x,['fictionTitle','bookTitle','title'],0)||'未命名');
    return{kind:mode==='audio'?'audio':'fiction',id:C.s(id),title:C.clean(title),img:C.s(cover(x)),author:C.clean(C.deep(x,['authorName','author','nickName','nickname'],0)),desc:C.clean(C.deep(x,['description','desc','info','introduction'],0)),raw:x};
  }
  function dynamicInfo(x){
    x=x||{};var id=C.pick(x,['dynamicId','postId','id'],C.deep(x,['dynamicId','postId'],0));
    var text=C.deep(x,['dynamicContent','content','contentText','text','title'],0)||'社区动态';
    return{kind:'community',id:C.s(id),title:C.clean(text),img:C.s(cover(x)),author:userName(x),like:C.s(C.deep(x,['likeNum','likeCount','likes'],0)),comment:C.s(C.deep(x,['commentNum','commentCount','comments'],0)),raw:x};
  }
  function namedRows(rows,idKeys,nameKeys){var out=[];for(var i=0;i<(rows||[]).length;i++){var x=rows[i]||{},id=C.pick(x,idKeys,''),name=C.pick(x,nameKeys,'');if(!id||!name||/(?:测试|test|ces\d*|竖版|横滑|宫格|专题\d)/i.test(C.s(name)))continue;out.push({id:C.s(id),name:C.clean(name),raw:x});}return C.uniq(out,function(z){return z.id;});}
  function tryRows(path,params,methods,timeout){try{return C.arr(P.tryApi(path,params,methods||['GET','POST'],{timeout:timeout||3200}));}catch(e){C.diag('PROVIDER_SKIP',path+' | '+String(e.message||e));return[];}}
  function stations(restricted){return namedRows(tryRows('station/stations',{classifyId:4,page:1,pageSize:40,restricted:restricted?1:0},['GET','POST'],3400),['stationId','stationID','id'],['stationName','stationTitle','title','name']);}
  function catalog(kind){
    var type=kind==='video'?4:2,rows=tryRows('video/classTypeList',{type:type,restricted:0},['GET','POST'],3200);
    if(!rows.length)rows=tryRows('video/classifyList',{type:type,restricted:0},['GET','POST'],3200);
    return namedRows(rows,['classifyId','videoTypeId','classTypeId','typeId','id'],['classifyTitle','classifyName','classTypeName','title','name']);
  }
  function tags(classId){
    var rows=tryRows('video/tags/getTags',{videoTypeId:C.n(classId),classifyId:C.n(classId),restricted:0},['GET','POST'],3000),out=[];
    for(var i=0;i<rows.length;i++){var n=C.pick(rows[i],['videoTagName','videoTagValue','tagsTitle','tagTitle','tagName','name','title'],'');if(n)out.push({id:C.s(n),name:C.clean(n),mode:'tag',raw:rows[i]});}
    return C.uniq(out,function(z){return z.id;});
  }
  function comicStations(){return namedRows(tryRows('comics/station/getComicsStations',{},['GET','POST'],3400),['stationId','comicsStationId','id'],['stationName','stationTitle','name','title']);}
  function fictionTags(mode){var type=mode==='audio'?2:1;return namedRows(tryRows('fiction/other/tagList',{fictionType:type,type:type},['POST','GET'],3400),['fictionTagId','tagId','categoryId','id'],['fictionTagName','tagName','categoryName','name','title']);}
  function communityCategories(){return namedRows(tryRows('community/dynamic/list',{page:1,pageNum:1,pageSize:1,limit:1},['GET','POST'],2200),['categoryId','dynamicType','id'],['categoryName','dynamicTypeName','name','title']);}
  function select(rows,id){id=C.s(id);for(var i=0;i<rows.length;i++)if(C.s(rows[i].id)===id)return rows[i];return rows[0]||null;}
  function list(section,page,state){
    page=Math.max(1,Number(page||1));state=state||{};var size=C.pageSize(),sort=Number(state.sort||1);
    if(section==='featured'||section==='lifan'){
      var restricted=section==='lifan'?1:0,ss=stations(restricted),st=select(ss,state.station);if(!st)return{filters:{stations:ss},items:[]};
      if(page===1&&st.raw&&Array.isArray(st.raw.videoList)&&st.raw.videoList.length)return{filters:{stations:ss,selectedStation:st},items:st.raw.videoList.slice(0,size)};
      return{filters:{stations:ss,selectedStation:st},items:tryRows('station/getStationMore',{stationId:C.n(st.id),page:page,pageNum:page,pageSize:size,sortType:sort,restricted:restricted},['GET','POST'],3600)};
    }
    if(section==='anime'||section==='video'){
      var cs=catalog(section),cl=select(cs,state.classId);if(!cl)return{filters:{classes:cs},items:[]};var ts=tags(cl.id),tg=null;
      for(var t=0;t<ts.length;t++)if(C.s(ts[t].id)===C.s(state.zoneId)){tg=ts[t];break;}
      var rows=[];if(tg)rows=tryRows('video/tagTitleList',{page:page,pageNum:page,pageSize:size,tagsTitle:tg.name,classifyId:C.n(cl.id),sortType:sort,restricted:0},['GET','POST'],3600);
      if(!rows.length)rows=tryRows('video/getByClassify',{classifyId:C.n(cl.id),page:page,pageNum:page,pageSize:size,sortType:sort,restricted:0},['GET','POST'],3600);
      return{filters:{classes:cs,selectedClass:cl,zones:ts,selectedZone:tg},items:rows};
    }
    if(section==='short')return{filters:{},items:tryRows('video/list',{page:page,pageNum:page,pageSize:15,loadType:Number(state.shortType||2)},['GET','POST'],3600)};
    if(section==='comic'){
      var cst=comicStations(),sel=select(cst,state.station);if(!sel)return{filters:{stations:cst},items:[]};
      if(page===1&&sel.raw&&Array.isArray(sel.raw.comicsBaseList)&&sel.raw.comicsBaseList.length)return{filters:{stations:cst,selectedStation:sel},items:sel.raw.comicsBaseList.slice(0,size)};
      return{filters:{stations:cst,selectedStation:sel},items:tryRows('comics/station/getStationComicsMore',{stationId:C.n(sel.id),page:page,pageNum:page,pageSize:size,sortType:sort},['GET','POST'],3800)};
    }
    if(section==='fiction'||section==='audio'){
      var ft=fictionTags(section),tag=select(ft,state.tagId),fp={page:page,pageNum:page,pageSize:size,limit:size,sortType:1,fictionType:section==='audio'?2:1};if(tag){fp.tagId=C.n(tag.id);fp.fictionTagId=C.n(tag.id);fp.categoryId=C.n(tag.id);}if(section==='audio')fp.isAudio=1;
      return{filters:{tags:ft,selectedTag:tag},items:tryRows('fiction/base/findList',fp,['POST','GET'],4000)};
    }
    if(section==='community'){
      var cp={page:page,pageNum:page,pageSize:size,limit:size};if(state.categoryId){cp.categoryId=C.n(state.categoryId);cp.dynamicType=C.n(state.categoryId);}return{filters:{categories:[],selectedCategory:null},items:tryRows('community/dynamic/list',cp,['GET','POST'],4000)};
    }
    return{filters:{},items:[]};
  }
  function search(kind,q,page){
    page=Math.max(1,Number(page||1));var size=C.pageSize(),p={page:page,pageNum:page,pageSize:size,keyword:q,pitle:q};
    if(kind==='video'){
      var tries=[['search/keyWordV2',{page:page,pageNum:page,pageSize:size,searchWord:q,keyword:q,keyWord:q,searchType:1}],['search/keyWord',{page:page,pageNum:page,pageSize:size,searchWord:q,keyword:q,keyWord:q,searchType:1}],['video/getByClassify',{page:page,pageNum:page,pageSize:size,title:q,keyword:q,sortType:1,restricted:0}]];
      for(var i=0;i<tries.length;i++){var r=tryRows(tries[i][0],tries[i][1],['GET','POST'],3600);if(r.length)return r;}return[];
    }
    if(kind==='comic'){p.comicsTitle=q;return tryRows('comics/base/findList',p,['GET','POST'],4000);}
    if(kind==='fiction'||kind==='audio'){p.fictionTitle=q;p.fictionType=kind==='audio'?2:1;if(kind==='audio')p.isAudio=1;return tryRows('fiction/base/findList',p,['POST','GET'],4000);}
    if(kind==='community'){p.content=q;return tryRows('community/dynamic/list',p,['GET','POST'],4000);}
    return[];
  }
  function detail(kind,id){
    var path='',params=[];id=C.n(id);
    if(kind==='video'){path='video/getVideoById';params=[{videoId:id},{id:id}];}
    else if(kind==='comic'){path='comics/base/info';params=[{comicsId:id},{comicId:id},{id:id}];}
    else if(kind==='fiction'||kind==='audio'){path='fiction/base/info';params=[{fictionId:id},{bookId:id},{id:id}];}
    else if(kind==='community'){path='community/dynamic/dynamicInfo';params=[{dynamicId:id},{id:id}];}
    for(var i=0;i<params.length;i++){try{return P.tryApi(path,params[i],['GET','POST'],{timeout:4000});}catch(e){}}
    return{};
  }
  function chapterRows(root,type){var out=[],seen={},count=0;function walk(v,d){if(v===undefined||v===null||d>10||count>15000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return;}if(typeof v!=='object')return;count++;var id=type==='comic'?C.pick(v,['chapterId','comicsChapterId','comicChapterId','id'],''):C.pick(v,['chapterId','fictionChapterId','id'],''),title=C.pick(v,['chapterTitle','chapterName','title','name'],'');if(id&&!seen[C.s(id)]){seen[C.s(id)]=1;out.push({id:C.s(id),title:C.clean(title||('第'+(out.length+1)+'章')),raw:v});}for(var k in v)if(v[k]&&typeof v[k]==='object')walk(v[k],d+1);}walk(root,0);return out;}
  function comicChapter(comicId,chapterId){var ps=[{chapterId:C.n(chapterId)},{comicsId:C.n(comicId),chapterId:C.n(chapterId)},{comicId:C.n(comicId),chapterId:C.n(chapterId)}];for(var i=0;i<ps.length;i++)try{return P.tryApi('comics/base/chapterInfo',ps[i],['GET','POST'],{timeout:4200});}catch(e){}return{};}
  function comicImages(root){var out=[],seen={},domain=C.s(C.deep(root||{},['domain','imgDomain','imageDomain'],0)||'');function add(v){var s=C.s(C.first(v)).trim();if(!s||seen[s])return;seen[s]=1;out.push({url:s,domain:domain});}var a=C.deep(root||{},['imgList','imageList','images'],0);if(Array.isArray(a))for(var i=0;i<a.length;i++)add(a[i]);if(!out.length){var count=0;function walk(v,k,d){if(v===undefined||v===null||d>10||count>12000)return;if(typeof v==='string'){if(/img|image|pic|url|path/i.test(C.s(k))&&(/^(https?:)?\/\//i.test(v)||/\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/i.test(v)||/^(?:jhimage|comic|comics|image|img)\//i.test(v)))add(v);return;}if(Array.isArray(v)){for(var j=0;j<v.length;j++)walk(v[j],k,d+1);return;}if(typeof v!=='object')return;count++;for(var key in v)walk(v[key],key,d+1);}walk(root,'',0);}return out;}
  function fictionChapter(fid,cid){var ps=[{fictionId:C.n(fid),chapterId:C.n(cid)},{chapterId:C.n(cid)},{fictionId:C.n(fid),fictionChapterId:C.n(cid)}];for(var i=0;i<ps.length;i++)try{return P.tryApi('fiction/base/chapterInfo',ps[i],['POST','GET'],{timeout:4200});}catch(e){}return{};}
  function fictionPayload(root){var texts=[],audios=[],images=[],seenT={},seenA={},seenI={},count=0,base=C.s(C.deep(root||{},['playbackDomain','audioDomain','mediaDomain'],0)||''),auth=C.s(C.deep(root||{},['playbackAuthKey','authKey','auth_key'],0)||'');function add(a,sn,s){s=C.s(s).trim();if(s&&!sn[s]){sn[s]=1;a.push(s);}}function join(b,p){p=C.s(p).trim();if(!p)return'';if(p.indexOf('//')===0)return'https:'+p;if(/^https?:\/\//i.test(p))return p;if(b&&/^https?:\/\//i.test(b))return b.replace(/\/+$/,'')+'/'+p.replace(/^\/+/, '');return p;}function walk(v,key,d){if(v===undefined||v===null||d>11||count>16000)return;if(typeof v==='string'){var s=v.trim(),low=C.s(key).toLowerCase();if(/content|text|body|paragraph/.test(low)&&s&&!/^https?:\/\//i.test(s)&&s.length>1)add(texts,seenT,s);if(/audio|sourcepath|playpath|audiourl|mediaurl|url|path/.test(low)&&(/\.(?:mp3|m4a|aac|wav|ogg|flac|m3u8)(?:[?#]|$)/i.test(s)||/audio|sourcepath|playpath/.test(low))){var u=join(base,s);if(auth&&u&&u.indexOf('auth_key=')<0&&u.indexOf('authKey=')<0)u+=(u.indexOf('?')>=0?'&':'?')+'auth_key='+encodeURIComponent(auth);add(audios,seenA,u);}if(/image|img|picture|pic/.test(low)&&(/^(https?:)?\/\//i.test(s)||/\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/i.test(s)))add(images,seenI,s);return;}if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],key,d+1);return;}if(typeof v!=='object')return;count++;for(var k in v)walk(v[k],k,d+1);}walk(root,'',0);return{texts:texts,audios:audios,images:images};}
  function comments(videoId,page,sort){return tryRows('video/commentList',{videoId:C.n(videoId),page:page,pageNum:page,pageSize:20,sortType:sort==='new'?'new':'hot'},['GET','POST'],3800);}
  return{cover:cover,mediaPath:mediaPath,videoInfo:videoInfo,comicInfo:comicInfo,fictionInfo:fictionInfo,dynamicInfo:dynamicInfo,stations:stations,catalog:catalog,tags:tags,comicStations:comicStations,fictionTags:fictionTags,list:list,search:search,detail:detail,chapterRows:chapterRows,comicChapter:comicChapter,comicImages:comicImages,fictionChapter:fictionChapter,fictionPayload:fictionPayload,comments:comments};
})();
