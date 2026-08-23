/** ACFun Next 1.0.0-alpha1 - product/UI shell */
(function(){
if (typeof ACFunNext !== 'object' || typeof ACFunNext.play !== 'function') throw new Error('ACFunNext media missing');
var A=ACFunNext;
A.sections=[
    {key:'featured',name:'精选'}, {key:'comic',name:'漫画'}, {key:'anime',name:'动漫'},
    {key:'video',name:'视频'}, {key:'lifan',name:'里番'}, {key:'short',name:'短视频'},
    {key:'community',name:'社区'}, {key:'fiction',name:'小说'}, {key:'audio',name:'有声'}
];
A.section=function(){
    var s=A.s(getMyVar('acfun_next_section','')||getItem('acfun_next_section','featured')||'featured');
    for(var i=0;i<A.sections.length;i++)if(A.sections[i].key===s)return s;
    return'featured';
};
A.sectionName=function(s){for(var i=0;i<A.sections.length;i++)if(A.sections[i].key===s)return A.sections[i].name;return s;};
A.setSectionUrl=function(s){return $('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_next_section',v);setItem('acfun_next_section',v);refreshPage(false);return'hiker://empty';},s);};
A.selectUrl=function(title,rows,current,stateKey,allowEmpty,clearKey){
    var opts=[],vals=[];if(allowEmpty){opts.push('全部');vals.push('');}
    for(var i=0;i<(rows||[]).length;i++){opts.push(A.s(rows[i].name));vals.push(A.s(rows[i].id));}
    if(!opts.length)return'toast://暂无可选项';
    var idx=vals.indexOf(A.s(current));if(idx<0)idx=0;
    return 'select://'+JSON.stringify({title:title,options:opts,selectedIndex:idx,col:3,js:$.toString(function(os,vs,key,clearKey){var n=os.indexOf(input);if(n<0)return;if(vs[n])putMyVar(key,String(vs[n]));else clearMyVar(key);if(clearKey)clearMyVar(clearKey);refreshPage(false);},opts,vals,stateKey,clearKey||'')});
};
A.sortRows=function(){return[{id:'0',name:'综合'},{id:'1',name:'最新'},{id:'2',name:'最多观看'},{id:'3',name:'最多点赞'}];};
A.sortName=function(){var v=A.s(getMyVar('acfun_next_sort','1'));var r=A.sortRows();for(var i=0;i<r.length;i++)if(r[i].id===v)return r[i].name;return'最新';};

A.top=function(d){
    var s=A.section();
    d.push({title:'ACFun · 搜索全站内容',desc:'视频 / 漫画 / 小说 / 社区',pic_url:A.icon('search'),img:A.icon('search'),col_type:'text_icon',url:A.page('acfun_next_search'),extra:{inheritTitle:false,pageTitle:'ACFun 搜索',lineVisible:false}});
    var main=['featured','comic','anime','video','lifan','short'];
    for(var i=0;i<main.length;i++){
        var key=main[i], name=A.sectionName(key);
        d.push({title:(s===key?'● ':'')+name,col_type:'scroll_button',url:A.setSectionUrl(key),extra:{lineVisible:false}});
    }
    var quick=[['community','社区','community'],['fiction','小说','novel'],['audio','有声','audio']];
    for(var q=0;q<quick.length;q++){
        var x=quick[q];
        d.push({title:x[1],pic_url:A.icon(x[2]+(s===x[0]?'':'_off')),img:A.icon(x[2]+(s===x[0]?'':'_off')),col_type:'icon_small_4',url:A.setSectionUrl(x[0]),extra:{lineVisible:false}});
    }
    d.push({title:'我的',pic_url:A.icon('settings_off'),img:A.icon('settings_off'),col_type:'icon_small_4',url:A.page('acfun_next_mine'),extra:{inheritTitle:false,pageTitle:'ACFun · 我的',lineVisible:false}});
    d.push({col_type:'line'});
};
A.filters=function(d){
    var s=A.section(), rows, cur, key;
    if(s==='featured'||s==='lifan'){
        d.push({title:'首页按专题流展示',desc:'每个专题独立成块，进入“更多”后再排序/翻页。',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
        return;
    }
    if(s==='anime'||s==='video'){
        rows=A.catalog(s);key='acfun_next_class_'+s;cur=A.currentNamed(rows,key,false);
        d.push({title:'分类 · '+(cur?cur.name:'暂无')+' ▾',col_type:'scroll_button',url:A.selectUrl('选择分类',rows,cur?cur.id:'',key,false,'acfun_next_zone_'+s),extra:{lineVisible:false}});
        var zones=cur?A.zones(cur.id):[],zk='acfun_next_zone_'+s,zv=A.s(getMyVar(zk,'')),zn='全部';for(var z=0;z<zones.length;z++)if(A.s(zones[z].id)===zv)zn=zones[z].name;
        d.push({title:'标签 · '+zn+' ▾',col_type:'scroll_button',url:A.selectUrl('选择标签',zones,zv,zk,true,''),extra:{lineVisible:false}});
    }else if(s==='comic'){
        rows=A.comicStations();key='acfun_next_comic_station';cur=A.currentNamed(rows,key,false);
        d.push({title:'漫画 · '+(cur?cur.name:'暂无')+' ▾',col_type:'scroll_button',url:A.selectUrl('选择漫画频道',rows,cur?cur.id:'',key,false,''),extra:{lineVisible:false}});
    }else if(s==='short'){
        var st=[{id:'1',name:'同城'},{id:'2',name:'关注'},{id:'3',name:'最新'},{id:'4',name:'最热'}],sv=A.s(getMyVar('acfun_next_short_type','2'));
        for(var i=0;i<st.length;i++)d.push({title:(sv===st[i].id?'● ':'')+st[i].name,col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_next_short_type',v);refreshPage(false);return'hiker://empty';},st[i].id),extra:{lineVisible:false}});
        return;
    }else if(s==='community'){
        rows=A.communityCategories();key='acfun_next_community_cat';var cv=A.s(getMyVar(key,'')),cn='全部';for(var c=0;c<rows.length;c++)if(A.s(rows[c].id)===cv)cn=rows[c].name;
        d.push({title:'社区 · '+cn+' ▾',col_type:'scroll_button',url:A.selectUrl('选择社区分类',rows,cv,key,true,''),extra:{lineVisible:false}});
        return;
    }else if(s==='fiction'||s==='audio'){
        rows=A.fictionTags(s);key='acfun_next_fiction_tag_'+s;var fv=A.s(getMyVar(key,'')),fn='全部';for(var f=0;f<rows.length;f++)if(A.s(rows[f].id)===fv)fn=rows[f].name;
        d.push({title:(s==='audio'?'有声':'小说')+' · '+fn+' ▾',col_type:'scroll_button',url:A.selectUrl('选择分类',rows,fv,key,true,''),extra:{lineVisible:false}});
        return;
    }
    if(s==='anime'||s==='video'||s==='comic')d.push({title:'排序 · '+A.sortName()+' ▾',col_type:'scroll_button',url:A.selectUrl('选择排序',A.sortRows(),A.s(getMyVar('acfun_next_sort','1')),'acfun_next_sort',false,''),extra:{lineVisible:false}});
    d.push({col_type:'line'});
};

A.videoCard=function(d,x,short){
    var i=A.videoInfo(x);if(!i.id)return;var meta=[];
    if(i.watch)meta.push('播放 '+A.fmtNum(i.watch));if(i.duration)meta.push(i.duration);if(!meta.length&&i.author)meta.push(i.author);
    var pic=A.image(i.img), url=short?A.playLazy(i):A.page('acfun_next_detail',{acf_kind:'video',acf_id:i.id,acf_title:i.title,acf_img:i.img,acf_uri:i.uri});
    d.push({title:i.title,desc:meta.join(' · '),pic_url:pic,img:pic,col_type:short?'movie_3':'movie_2',url:url,extra:{inheritTitle:false,pageTitle:i.title,acf_kind:'video',acf_id:i.id,acf_title:i.title,acf_img:i.img,acf_uri:i.uri,acf_data:JSON.stringify(i.raw||{}),lineVisible:false}});
};
A.comicCard=function(d,x){
    var i=A.comicInfo(x);if(!i.id)return;var pic=A.image(i.img);d.push({title:i.title,desc:i.author||i.desc,pic_url:pic,img:pic,col_type:'movie_3',url:A.page('acfun_next_detail',{acf_kind:'comic',acf_id:i.id,acf_title:i.title,acf_img:i.img}),extra:{inheritTitle:false,pageTitle:i.title,acf_kind:'comic',acf_id:i.id,acf_title:i.title,acf_img:i.img,acf_data:JSON.stringify(i.raw||{}),lineVisible:false}});
};
A.fictionCard=function(d,x,mode){
    var i=A.fictionInfo(x,mode);if(!i.id)return;var pic=A.image(i.img);d.push({title:i.title,desc:[i.author,mode==='audio'?'有声':'小说'].join(' · ').replace(/^ · | · $/g,''),pic_url:pic,img:pic,col_type:'movie_3',url:A.page('acfun_next_detail',{acf_kind:mode,acf_id:i.id,acf_title:i.title,acf_img:i.img}),extra:{inheritTitle:false,pageTitle:i.title,acf_kind:mode,acf_id:i.id,acf_title:i.title,acf_img:i.img,acf_data:JSON.stringify(i.raw||{}),lineVisible:false}});
};
A.dynamicCard=function(d,x){
    var i=A.dynamicInfo(x);if(!i.id)return;var desc=[];if(i.author)desc.push(i.author);if(i.like)desc.push('赞 '+A.fmtNum(i.like));if(i.comment)desc.push('评论 '+A.fmtNum(i.comment));
    var pic=A.image(i.img);d.push({title:i.title,desc:desc.join(' · '),pic_url:pic,img:pic,col_type:i.img?'movie_1_left_pic':'movie_1',url:A.page('acfun_next_detail',{acf_kind:'community',acf_id:i.id,acf_title:i.title,acf_img:i.img}),extra:{inheritTitle:false,pageTitle:'社区动态',acf_kind:'community',acf_id:i.id,acf_title:i.title,acf_img:i.img,acf_data:JSON.stringify(i.raw||{}),lineVisible:false}});
};
A.renderList=function(d,s,list){
    var i;if(s==='comic')for(i=0;i<list.length;i++)A.comicCard(d,list[i]);
    else if(s==='short')for(i=0;i<list.length;i++)A.videoCard(d,list[i],true);
    else if(s==='community')for(i=0;i<list.length;i++)A.dynamicCard(d,list[i]);
    else if(s==='fiction'||s==='audio')for(i=0;i<list.length;i++)A.fictionCard(d,list[i],s);
    else for(i=0;i<list.length;i++)A.videoCard(d,list[i],false);
};
A.featuredHome=function(d,restricted,page){
    var rows=A.stations(restricted), per=3, start=(page-1)*per, end=Math.min(rows.length,start+per), any=false;
    for(var i=start;i<end;i++){
        var st=rows[i], list=A.stationVideos(st,1,restricted);if(!list.length)continue;any=true;
        d.push({title:st.name,desc:'查看更多',pic_url:A.icon('more'),img:A.icon('more'),col_type:'text_icon',url:A.page('acfun_next_station',{station_id:st.id,station_name:st.name,restricted:restricted}),extra:{inheritTitle:false,pageTitle:st.name,lineVisible:false}});
        for(var j=0;j<Math.min(list.length,6);j++)A.videoCard(d,list[j],false);
        d.push({col_type:'line_blank'});
    }
    return any;
};
A.home=function(){
    var d=[],page=A.pageNo(),s=A.section();if(page===1){A.top(d);A.filters(d);}
    var ok=false;
    try{
        if(s==='featured'||s==='lifan')ok=A.featuredHome(d,s==='lifan'?1:0,page);
        else {var list=A.listFor(s,page)||[];A.renderList(d,s,list);ok=list.length>0;}
    }catch(e){A.setDiag('home_error',A.s(e.message||e));}
    if(!ok&&page===1)d.push({title:'当前栏目暂未返回内容',desc:'栏目：'+A.sectionName(s)+'\n可到“我的 → 资源诊断”查看真实请求。',col_type:'long_text',url:A.page('acfun_next_diag')});
    setResult(d);
};
A.stationPage=function(){
    var d=[],id=A.param('station_id'),name=A.param('station_name')||'专题',restricted=Number(A.param('restricted')||0),st={id:id,name:name,raw:{}},page=A.pageNo();setPageTitle(name);
    var stations=A.stations(restricted);for(var i=0;i<stations.length;i++)if(A.s(stations[i].id)===A.s(id)){st=stations[i];break;}
    if(page===1){d.push({title:name,desc:'专题内容 · '+(restricted?'里番':'精选'),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});d.push({title:'排序 · '+A.sortName()+' ▾',col_type:'scroll_button',url:A.selectUrl('选择排序',A.sortRows(),A.s(getMyVar('acfun_next_sort','1')),'acfun_next_sort',false,''),extra:{lineVisible:false}});d.push({col_type:'line'});}
    var list=A.stationVideos(st,page,restricted);for(var j=0;j<list.length;j++)A.videoCard(d,list[j],false);if(!list.length&&page===1)d.push({title:'暂无内容',col_type:'text_center_1',url:'hiker://empty'});setResult(d);
};

A.seedFromParams=function(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},raw=p.acf_data||A.param('acf_data')||'{}',o={};try{o=JSON.parse(String(raw))||{};}catch(e){}
    return{kind:A.s(p.acf_kind||A.param('acf_kind')),id:A.s(p.acf_id||A.param('acf_id')),title:A.s(p.acf_title||A.param('acf_title')),img:A.s(p.acf_img||A.param('acf_img')),uri:A.s(p.acf_uri||A.param('acf_uri')),raw:o};
};
A.detail=function(){
    var s=A.seedFromParams();if(s.kind==='comic')return A.comicDetail(s);if(s.kind==='fiction'||s.kind==='audio')return A.fictionDetail(s);if(s.kind==='community')return A.communityDetail(s);return A.videoDetail(s);
};
A.videoDetail=function(seed){
    var obj=A.videoObject(seed.id,seed.raw),i=A.videoInfo(obj);if(!i.id)i.id=seed.id;if((!i.title||i.title==='未命名视频')&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;if(!i.uri&&seed.uri)i.uri=seed.uri;
    setPageTitle(i.title||'视频详情');try{if(i.img)setPagePicUrl(A.image(i.img));}catch(e){}
    var d=[],meta=[];if(i.author)meta.push(i.author);if(i.watch)meta.push('播放 '+A.fmtNum(i.watch));if(i.like)meta.push('点赞 '+A.fmtNum(i.like));if(i.duration)meta.push(i.duration);
    d.push({title:i.title,desc:meta.join(' · '),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'播放',desc:'直接使用已验证媒体 Seed，缺失时才补 can/watch',pic_url:A.icon('play'),img:A.icon('play'),col_type:'text_icon',url:A.playLazy(i),extra:{lineVisible:false}});
    var favItem={kind:'video',id:i.id,title:i.title,img:i.img,uri:i.uri,data:JSON.stringify(obj||{})};
    d.push({title:A.isFavorite(i.id)?'已收藏':'收藏',col_type:'text_3',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});
    d.push({title:'评论',col_type:'text_3',url:A.page('acfun_next_comments',{video_id:i.id,video_title:i.title}),extra:{lineVisible:false}});
    d.push({title:'复制标题',col_type:'text_3',url:'copy://'+i.title,extra:{lineVisible:false}});
    if(i.desc)d.push({title:A.html(i.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});
    setResult(d);
};
A.comicDetail=function(seed){
    var obj=A.comicObject(seed.id,seed.raw),i=A.comicInfo(obj);if(!i.id)i.id=seed.id;if(!i.title&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;setPageTitle(i.title||'漫画详情');
    var d=[];d.push({title:i.title,desc:[i.author,i.desc].join('\n').trim(),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_vertical_pic_blur',url:'hiker://empty',extra:{gradient:true,lineVisible:false}});
    var favItem={kind:'comic',id:i.id,title:i.title,img:i.img,data:JSON.stringify(obj||{})};d.push({title:A.isFavorite(i.id)?'已收藏':'收藏漫画',col_type:'scroll_button',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+i.title,extra:{lineVisible:false}});
    var ch=A.chapterRows(obj,'comic');d.push({title:'章节目录 · '+ch.length,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    for(var c=0;c<ch.length;c++)d.push({title:ch[c].title,col_type:'text_2',url:A.page('acfun_next_comic_reader',{comics_id:i.id,chapter_id:ch[c].id,chapter_title:ch[c].title}),extra:{inheritTitle:false,pageTitle:ch[c].title,lineVisible:false}});
    if(!ch.length)d.push({title:'暂未解析到章节目录',desc:'已按 APK 的 comics/base/info 读取；请把本页截图发回来继续适配字段。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),title=A.param('chapter_title')||'漫画章节',d=[];setPageTitle(title);var obj=A.comicChapter(fid,cid);
    if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return;}
    var imgs=A.comicImages(obj);for(var i=0;i<imgs.length;i++)d.push({title:'',pic_url:A.image(imgs[i]),img:A.image(imgs[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});if(!imgs.length)d.push({title:'章节没有返回图片',desc:'chapterId='+cid,col_type:'long_text',url:'hiker://empty'});setResult(d);
};
A.fictionDetail=function(seed){
    var mode=seed.kind,obj=A.fictionObject(seed.id,seed.raw),i=A.fictionInfo(obj,mode);if(!i.id)i.id=seed.id;if(!i.title&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;setPageTitle(i.title||A.sectionName(mode));
    var d=[],p=A.fictionPayload(obj);d.push({title:i.title,desc:[i.author,mode==='audio'?'有声':'小说'].join(' · ').replace(/^ · | · $/g,''),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_vertical_pic_blur',url:'hiker://empty',extra:{gradient:true,lineVisible:false}});
    var favItem={kind:mode,id:i.id,title:i.title,img:i.img,data:JSON.stringify(obj||{})};d.push({title:A.isFavorite(i.id)?'已收藏':'收藏',col_type:'scroll_button',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});if(mode==='audio'&&p.audios.length)d.push({title:'播放作品音频',col_type:'scroll_button',url:p.audios[0]+'#isMusic=true#',extra:{lineVisible:false}});if(i.desc)d.push({title:A.html(i.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});
    var ch=A.chapterRows(obj,'fiction');d.push({title:'章节目录 · '+ch.length,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});for(var c=0;c<ch.length;c++)d.push({title:ch[c].title,col_type:'text_2',url:A.page('acfun_next_fiction_reader',{fiction_id:i.id,chapter_id:ch[c].id,chapter_title:ch[c].title,mode:mode}),extra:{inheritTitle:false,pageTitle:ch[c].title,lineVisible:false}});if(!ch.length)d.push({title:'暂未解析到章节目录',col_type:'text_center_1',url:'hiker://empty'});setResult(d);
};
A.fictionReader=function(){
    var fid=A.param('fiction_id'),cid=A.param('chapter_id'),title=A.param('chapter_title')||'章节',mode=A.param('mode')||'fiction',obj=A.fictionChapter(fid,cid),p=A.fictionPayload(obj),d=[];setPageTitle(title);
    if(mode==='audio'&&p.audios.length)d.push({title:'播放本章音频',desc:p.audios.length>1?'检测到备用音频源':'',pic_url:A.icon('play'),img:A.icon('play'),col_type:'text_icon',url:p.audios[0]+'#isMusic=true#',extra:{lineVisible:false}});
    if(p.texts.length)d.push({title:A.html(p.texts.join('\n\n')),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineSpacing:8,lineVisible:false}});for(var i=0;i<p.images.length;i++)d.push({title:'',pic_url:A.image(p.images[i]),img:A.image(p.images[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});if(!p.texts.length&&!p.audios.length&&!p.images.length)d.push({title:'本章暂无可展示内容',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
A.communityDetail=function(seed){
    var obj=A.dynamicObject(seed.id,seed.raw),i=A.dynamicInfo(obj);if(!i.id)i.id=seed.id;if(!i.title&&seed.title)i.title=seed.title;setPageTitle(i.author||'社区动态');var d=[];
    d.push({title:i.author||'ACFun 用户',desc:i.title,pic_url:A.image(i.img),img:A.image(i.img),col_type:i.img?'movie_1_left_pic':'movie_1',url:'hiker://empty',extra:{lineVisible:false}});
    var pics=A.comicImages(obj);for(var p=0;p<pics.length;p++)d.push({title:'',pic_url:A.image(pics[p]),img:A.image(pics[p]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});
    var comments=A.dynamicComments(i.id,1);if(comments.length)d.push({title:'评论 · '+comments.length,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});A.renderComments(d,comments);setResult(d);
};
A.renderComments=function(d,list){
    for(var i=0;i<(list||[]).length;i++){var x=list[i]||{},u=x.user||x.userInfo||{},name=A.s(A.pick(u,['nickname','nickName','name','userName'],A.pick(x,['nickname','userName'],'匿名'))),text=A.s(A.pick(x,['content','commentContent','comment_content','text'],'')).trim(),lk=A.s(A.pick(x,['likeNum','likeCount','likes'],'')),tm=A.s(A.pick(x,['createTime','time','createdAt'],''));if(!text)continue;var title='<b>'+A.html(name)+'</b>'+(lk?'　赞 '+A.html(A.fmtNum(lk)):'')+'<br>'+A.html(text)+(tm?'<br><small>'+A.html(tm)+'</small>':'');d.push({title:title,col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});}
};
A.comments=function(){
    var id=A.param('video_id'),title=A.param('video_title'),sort=A.s(getMyVar('acfun_next_comment_sort','hot')),page=A.pageNo(),d=[];setPageTitle('评论 · '+title);
    if(page===1){d.push({title:(sort==='hot'?'● ':'')+'最热',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){putMyVar('acfun_next_comment_sort','hot');refreshPage(false);return'hiker://empty';}),extra:{lineVisible:false}});d.push({title:(sort==='new'?'● ':'')+'最新',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){putMyVar('acfun_next_comment_sort','new');refreshPage(false);return'hiker://empty';}),extra:{lineVisible:false}});d.push({col_type:'line'});}
    var list=A.videoComments(id,page,sort);A.renderComments(d,list);if(!list.length&&page===1)d.push({title:'暂无评论或评论接口暂不可用',col_type:'text_center_1',url:'hiker://empty'});setResult(d);
};

A.searchCenter=function(){
    var d=[],page=A.pageNo(),q=A.s(getMyVar('acfun_next_search_q','')||A.param('kw')),kind=A.s(getMyVar('acfun_next_search_kind','video')||'video');
    if(page===1){
        d.push({title:'输入关键词',desc:q||'搜索视频、漫画、小说、有声和社区',pic_url:A.icon('search'),img:A.icon('search'),col_type:'input',url:"(function(){var q=String(input||'').trim();if(!q)return 'hiker://empty';putMyVar('acfun_next_search_q',q);refreshPage(false);return 'hiker://empty';})()",extra:{defaultValue:q,lineVisible:false}});
        var kinds=[['video','视频'],['comic','漫画'],['fiction','小说'],['audio','有声'],['community','社区']];for(var k=0;k<kinds.length;k++)d.push({title:(kind===kinds[k][0]?'● ':'')+kinds[k][1],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_next_search_kind',v);refreshPage(false);return'hiker://empty';},kinds[k][0]),extra:{lineVisible:false}});d.push({col_type:'line'});
        if(!q){var hot=A.hotSearch();if(hot.length)d.push({title:'热门搜索',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});for(var h=0;h<Math.min(hot.length,12);h++){var word=A.s(A.pick(hot[h],['keyword','searchWord','word','title','name'],'')||hot[h]);if(word)d.push({title:word,col_type:'flex_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_next_search_q',v);refreshPage(false);return'hiker://empty';},word),extra:{lineVisible:false}});}if(!q){setResult(d);return;}}
    }
    var list=q?A.searchFor(kind,q,page):[];A.renderList(d,kind==='community'?'community':kind,list);if(!list.length&&page===1)d.push({title:'没有搜索到结果',desc:'类型：'+kind+' · 关键词：'+q,col_type:'long_text',url:'hiker://empty'});setResult(d);
};
A.search=function(){
    var d=[],q=A.param('kw')||A.param('s')||A.param('q'),page=A.pageNo(),list=q?A.videoSearch(q,page):[];for(var i=0;i<list.length;i++)A.videoCard(d,list[i],false);if(!list.length&&page===1)d.push({title:'没有搜索到视频',desc:'关键词：'+q,col_type:'long_text',url:'hiker://empty'});setResult(d);
};

A.renderStored=function(d,x){
    var raw={};try{raw=JSON.parse(A.s(x.data||'{}'))||{};}catch(e){}var kind=A.s(x.kind||'video');
    if(kind==='video'){var v=A.videoInfo(raw);if(!v.id)v.id=A.s(x.id);if(!v.title||v.title==='未命名视频')v.title=A.s(x.title);if(!v.img)v.img=A.s(x.img);if(!v.uri)v.uri=A.s(x.uri);A.videoCard(d,A.merge(v.raw||{},{videoId:v.id,videoTitle:v.title,videoCover:v.img,videoUrl:v.uri}),false);return;}
    if(kind==='comic')A.comicCard(d,A.merge(raw,{comicsId:x.id,comicsTitle:x.title,coverImg:x.img}));else if(kind==='fiction'||kind==='audio')A.fictionCard(d,A.merge(raw,{fictionId:x.id,fictionTitle:x.title,fictionImg:x.img}),kind);
};
A.localPage=function(which){var d=[],a=which==='fav'?A.favoriteList():A.historyList();setPageTitle(which==='fav'?'本地收藏':'播放历史');for(var i=0;i<a.length;i++)A.renderStored(d,a[i]);if(!a.length)d.push({title:which==='fav'?'还没有本地收藏':'还没有播放历史',col_type:'text_center_1',url:'hiker://empty'});setResult(d);};
A.mine=function(){
    var d=[];setPageTitle('ACFun · 我的');
    var actions=[['本地收藏','favorite_off','acfun_next_favorites'],['播放历史','history_off','acfun_next_history'],['设置','settings_off','acfun_next_settings'],['资源诊断','category','acfun_next_diag']];for(var i=0;i<actions.length;i++)d.push({title:actions[i][0],pic_url:A.icon(actions[i][1]),img:A.icon(actions[i][1]),col_type:'icon_4',url:A.page(actions[i][2]),extra:{inheritTitle:false,pageTitle:actions[i][0],lineVisible:false}});
    d.push({title:'APP 风格 H5',desc:A.h5Base,col_type:'text_1',url:'web://'+A.h5Base,extra:{lineVisible:false}});d.push({title:'ACFun 网页版',desc:A.webBase,col_type:'text_1',url:'web://'+A.webBase,extra:{lineVisible:false}});d.push({title:'版本与恢复',desc:'Test '+A.version+' · Build '+A.buildNumber,col_type:'text_1',url:A.page('acfun_next_update'),extra:{lineVisible:false}});setResult(d);
};
A.settings=function(){
    var d=[];setPageTitle('ACFun 设置');var good=getItem('acfun_next_good_host','未建立'),manual=getItem('acfun_next_manual_host',''),size=A.pageSize();
    d.push({title:'当前接口',desc:good,col_type:'long_text',url:'hiker://empty'});
    d.push({title:'手动接口',desc:manual||'未设置 · 默认自动发现',col_type:'text_1',url:'input://'+JSON.stringify({value:manual,hint:'https://api.example.com',js:$.toString(function(){var v=String(input||'').trim();if(v)setItem('acfun_next_manual_host',v);else clearItem('acfun_next_manual_host');refreshPage(false);return'toast://已保存';})}),extra:{lineVisible:false}});
    d.push({title:'每页数量 · '+size,col_type:'text_1',url:'select://'+JSON.stringify({title:'每页数量',options:['8','10','12','16'],selectedIndex:['8','10','12','16'].indexOf(String(size)),col:4,js:$.toString(function(){setItem('acfun_next_page_size',String(input));refreshPage(false);})}),extra:{lineVisible:false}});
    d.push({title:'重新获取游客令牌',desc:'清理当前令牌并按 APK 1.9.7 协议重新登录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunNextBoot.loadOnly();setItem('acfun_next_token','');setItem('acfun_next_traveler_ts','0');var ok=ACFunNext.ensureTraveler(true);refreshPage(false);return'toast://'+(ok?'令牌已刷新':'刷新失败，请看诊断');},A.bootUrl,A.bootVer),extra:{lineVisible:false}});
    d.push({title:'清理业务缓存',desc:'不清收藏、历史、设备ID和设置',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var keys=['protocol-config','station|0','station|1','catalog|anime','catalog|video','comic-stations','fiction-tags|fiction','fiction-tags|audio','community-categories','search-hot'];for(var i=0;i<keys.length;i++)clearItem('acfun_next_cache|acf-next-a1|'+keys[i]);refreshPage(false);return'toast://缓存已清理';}),extra:{lineVisible:false}});setResult(d);
};
A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[],text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+'\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n播放：\n'+A.getDiag('play')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error')+'\n\n图片：\n'+A.getDiag('image_error');
    d.push({title:'Clean Rewrite Alpha1',desc:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断摘要',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
A.build='2026.08.23-v1.0.0-alpha1';A.runtimeMode='clean-next-alpha1';
})();
