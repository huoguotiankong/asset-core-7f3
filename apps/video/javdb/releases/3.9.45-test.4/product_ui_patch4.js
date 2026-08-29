/* JavDB v3 3.9.45-test.4 Clean NetflxCat-style UI reset overlay */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260829-v3.9.45-test.4';
  J.productUiVersion='3.9.45-test.4';
  J.productUiBuild=2026082901;

  var BRAND='#3CB371',IDLE='#08777785',RIGHT='hiker://images/icon_right5';
  var ASSET='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@52f6456329113bff98f5124a823009e023272fc2/apps/video/javdb/releases/3.9.45-test.4/assets/';

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function onTitle(name,on){return on?'““””<b><font color=#FFFFFF>'+esc(name)+'</font></b>':esc(name);}
  function tab(name,on,url){return{title:onTitle(name,on),url:url,col_type:'scroll_button',extra:{backgroundColor:on?BRAND:IDLE,lineVisible:false}};}
  function rowBreak(d){d.push({col_type:'blank_block'});}
  function line(d){d.push({col_type:'line_blank'});}
  function empty(d,title,desc,url){d.push({title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});}
  function section(d,title,url){d.push({title:title,pic_url:RIGHT,img:RIGHT,url:url||'hiker://empty',col_type:'text_icon',extra:{lineVisible:false}});}
  function filterString(type,main,extra,year,dur,month){return String(type||'0')+':t:'+String(main||'')+':'+String(extra||'')+':'+String(year||'')+':'+String(dur||'')+':'+String(month||'');}
  function actorCard(d,a,rank){
    a=a||{};
    var title=J.mask(a.name||a.name_zht||a.other_name||'未命名演员');
    var img=J.img(a.avatar_url||a.image_url||a.avatar||'');
    d.push({title:(rank?('TOP '+rank+' · '):'')+title,desc:a.videos_count!=null?('作品 '+a.videos_count):'',pic_url:img,img:img,url:'hiker://page/javdb3Entity?page=fypage&rule=&simple=true',col_type:'movie_3',extra:{lineVisible:false,jdb3_entity_type:'actor',jdb3_entity_id:String(a.id||''),pageTitle:title}});
  }
  function movieRankCard(x,rank){
    var c=J.movieCard(x,'movie_1_vertical_pic');
    c.col_type='movie_1_vertical_pic';
    if(rank)c.title='TOP '+rank+' · '+c.title;
    c.extra=c.extra||{};c.extra.lineVisible=false;
    return c;
  }
  function localMovie(x){
    x=x||{};
    return J.movieCard({id:x.id||x.movie_id,title:x.title||x.name,number:x.number||x.code,cover_url:x.img||x.cover||x.cover_url,release_date:x.date||x.release_date},J.coverLayout('library','movie_3'));
  }

  J.home=function(){
    setPageTitle('JavDB v3');
    var d=[],page=MY_PAGE||1,mode=getMyVar('jdb3_home46_mode','recommend'),i,x;
    if(page===1){
      var qs=[
        ['筛选','filter.svg','hiker://page/javdb3Filters?page=fypage&rule=&simple=true'],
        ['排行','rank.svg','hiker://page/javdb3RankHub?page=fypage&rule=&simple=true'],
        ['演员','actor.svg','hiker://page/javdb3ActorHub?page=fypage&rule=&simple=true'],
        ['收藏','favorite.svg','hiker://page/javdb3LibraryHub?page=fypage&rule=&simple=true'],
        ['更多','more.svg','hiker://page/javdb3MoreHub?rule=&simple=true']
      ];
      for(i=0;i<qs.length;i++){x=qs[i];d.push({title:x[0],pic_url:ASSET+x[1],img:ASSET+x[1],url:x[2],col_type:'icon_5',extra:{lineVisible:false}});}
      d.push({title:'搜索',desc:'请输入番号 / 片名 / 演员 / 系列',url:$.toString(function(){var kw=String(input||'').trim();if(!kw)return'toast://请输入搜索内容';return'hiker://page/javdb3Search?page=fypage&rule=&simple=true&word='+encodeURIComponent(kw);}),col_type:'input',extra:{backgroundColor:'#FFFFFF',lineVisible:false}});
      var modes=[['推荐','recommend'],['最新','latest'],['有码','0'],['无码','1'],['欧美','2'],['FC2','3'],['动漫','4']];
      for(i=0;i<modes.length;i++){x=modes[i];d.push(tab(x[0],mode===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_home46_mode',v);refreshPage(false);return'hiker://empty';},x[1])));}
      rowBreak(d);
    }
    mode=getMyVar('jdb3_home46_mode','recommend');
    var r,label,params={page:page,limit:48};
    if(mode==='recommend'){r=this.apiSafe('/api/v1/movies/recommend',params);label='实时推荐';}
    else if(mode==='latest'){params.type='all';params.filter_by='all';params.sort_by='release';r=this.apiSafe('/api/v1/movies/latest',params);label='最新发布';}
    else{r=this.apiSafe('/api/v1/movies/tags',{filter_by:filterString(mode,'','','','',''),sort_by:'release',order_by:'desc',page:page,limit:48});label=mode==='0'?'有码新作':mode==='1'?'无码新作':mode==='2'?'欧美新作':mode==='3'?'FC2新作':'动漫新作';}
    if(!r.ok){if(page===1)empty(d,'内容加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');setResult(d);return;}
    var list=r.data.movies||[];
    if(page===1)section(d,label,'hiker://page/javdb3Filters?page=fypage&rule=&simple=true');
    var layout=this.coverLayout('home','movie_3');
    for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));
    if(!list.length&&page===1)empty(d,'暂无内容','稍后再试');
    setResult(d);
  };

  J.filters=function(){
    var p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{};
    if(String(p.jdb3_mode||'')==='advanced'){this.filterAdvanced4();return;}
    setPageTitle('筛选');
    var d=[],page=MY_PAGE||1,type=getMyVar('jdb3_cat46_type','0'),main=getMyVar('jdb3_cat46_main',''),year=getMyVar('jdb3_cat46_year',''),sort=getMyVar('jdb3_cat46_sort','release desc'),extra=getMyVar('jdb3_cat46_extra',''),month=getMyVar('jdb3_cat46_month',''),dur=getMyVar('jdb3_cat46_duration',''),i,x;
    if(page===1){
      var types=[['有码','0'],['无码','1'],['欧美','2'],['FC2','3'],['动漫','4']];
      for(i=0;i<types.length;i++){x=types[i];d.push(tab(x[0],type===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat46_type',v);clearMyVar('jdb3_cat46_extra');clearMyVar('jdb3_cat46_month');clearMyVar('jdb3_cat46_duration');clearMyVar('jdb3_cat46_year');refreshPage(false);return'hiker://empty';},x[1])));}
      rowBreak(d);
      var mains=[['资源',''],['可播放','p'],['可下载','m'],['字幕','c'],['单体','s'],['预览图','i'],['预览视频','v']];
      for(i=0;i<mains.length;i++){x=mains[i];d.push(tab(x[0],main===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat46_main',v);refreshPage(false);return'hiker://empty';},x[1])));}
      rowBreak(d);
      var tr=this.apiSafe('/api/v2/tags',{type:type}),groups=tr.ok?(tr.data.tags||[]):[],years=[],gs=[],g,cid,tags,j,t;
      for(i=0;i<groups.length;i++){g=groups[i]||{};cid=String(g.category_id||'');tags=g.tags||[];if(cid==='year')years=tags.slice(0,80);else if(cid!=='main')gs.push(g);}
      d.push(tab('年份',!year,$('#noLoading#').lazyRule(function(){clearMyVar('jdb3_cat46_year');refreshPage(false);return'hiker://empty';})));
      for(i=0;i<years.length;i++){t=years[i]||{};if(!t.id)continue;d.push(tab(J.mask(t.name||t.id),year===String(t.id),$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat46_year',v);refreshPage(false);return'hiker://empty';},String(t.id))));}
      rowBreak(d);
      var sorts=[['综合','release desc'],['最新','update desc'],['评分','score desc'],['热度','hit desc'],['想看','want_watch_count desc'],['看过','watched_count desc']];
      for(i=0;i<sorts.length;i++){x=sorts[i];d.push(tab(x[0],sort===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat46_sort',v);refreshPage(false);return'hiker://empty';},x[1])));}
      rowBreak(d);
      var n=extra?extra.split(',').filter(Boolean).length:0;
      d.push(tab(n?('标签·'+n):'标签',!n,$('#noLoading#').lazyRule(function(){clearMyVar('jdb3_cat46_extra');refreshPage(false);return'hiker://empty';})));
      for(i=0;i<gs.length;i++){g=gs[i]||{};cid=String(g.category_id||'');if(!cid||cid==='year')continue;d.push(tab(J.mask(g.category||cid),false,$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_adv46_group',v);return'hiker://page/javdb3Filters?rule=&simple=true&jdb3_mode=advanced';},cid)));}
      rowBreak(d);
    }
    type=getMyVar('jdb3_cat46_type','0');main=getMyVar('jdb3_cat46_main','');year=getMyVar('jdb3_cat46_year','');sort=getMyVar('jdb3_cat46_sort','release desc');extra=getMyVar('jdb3_cat46_extra','');month=getMyVar('jdb3_cat46_month','');dur=getMyVar('jdb3_cat46_duration','');
    var sp=sort.split(' '),r=this.apiSafe('/api/v1/movies/tags',{filter_by:filterString(type,main,extra,year,dur,month),sort_by:sp[0],order_by:sp[1]||'desc',page:page,limit:48});
    if(!r.ok){if(page===1)empty(d,'筛选加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');setResult(d);return;}
    var list=r.data.movies||[],layout=this.coverLayout('category','movie_3');
    for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));
    if(!list.length&&page===1)empty(d,'没有找到影片','换一组条件试试');
    setResult(d);
  };

  J.filterAdvanced4=function(){
    setPageTitle('更多筛选');
    var d=[],type=getMyVar('jdb3_cat46_type','0'),extra=getMyVar('jdb3_cat46_extra',''),month=getMyVar('jdb3_cat46_month',''),dur=getMyVar('jdb3_cat46_duration',''),tr=this.apiSafe('/api/v2/tags',{type:type});
    if(!tr.ok){empty(d,'筛选项加载失败',tr.error);setResult(d);return;}
    var groups=tr.data.tags||[],valid=[],i,g,cid,tags,cur=getMyVar('jdb3_adv46_group',''),selected=extra.split(',').filter(Boolean),t,id,on;
    for(i=0;i<groups.length;i++){g=groups[i]||{};cid=String(g.category_id||'');if(cid&&cid!=='main'&&cid!=='year'&&(g.tags||[]).length)valid.push(g);}
    if(!cur&&valid.length)cur=String(valid[0].category_id||'');
    for(i=0;i<valid.length;i++){g=valid[i];cid=String(g.category_id||'');d.push(tab(J.mask(g.category||cid),cur===cid,$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_adv46_group',v);refreshPage(false);return'hiker://empty';},cid)));}
    rowBreak(d);
    var current=null;for(i=0;i<valid.length;i++)if(String(valid[i].category_id||'')===cur){current=valid[i];break;}
    if(current){
      cid=String(current.category_id||'');tags=(current.tags||[]).slice(0,120);
      if(cid==='month'||cid==='duration')d.push(tab('全部',cid==='month'?!month:!dur,$('#noLoading#').lazyRule(function(c){if(c==='month')clearMyVar('jdb3_cat46_month');else clearMyVar('jdb3_cat46_duration');refreshPage(false);return'hiker://empty';},cid)));
      for(i=0;i<tags.length;i++){
        t=tags[i]||{};id=String(t.id||'');if(!id)continue;
        on=cid==='month'?month===id:cid==='duration'?dur===id:selected.indexOf(id)>=0;
        d.push(tab(J.mask(t.name||id),on,$('#noLoading#').lazyRule(function(c,v){
          if(c==='month')putMyVar('jdb3_cat46_month',getMyVar('jdb3_cat46_month','')===v?'':v);
          else if(c==='duration')putMyVar('jdb3_cat46_duration',getMyVar('jdb3_cat46_duration','')===v?'':v);
          else{var a=getMyVar('jdb3_cat46_extra','').split(',').filter(Boolean),k=a.indexOf(v);if(k>=0)a.splice(k,1);else a.push(v);putMyVar('jdb3_cat46_extra',a.join(','));}
          refreshPage(false);return'hiker://empty';
        },cid,id)));
      }
    }
    rowBreak(d);
    d.push({title:'清空本组',url:$('#noLoading#').lazyRule(function(c){if(c==='month')clearMyVar('jdb3_cat46_month');else if(c==='duration')clearMyVar('jdb3_cat46_duration');else{var tr=getMyVar('jdb3_adv46_group','');var a=getMyVar('jdb3_cat46_extra','').split(',').filter(Boolean);if(!a.length)return'toast://本组没有已选项';clearMyVar('jdb3_cat46_extra');}refreshPage(false);return'toast://已清空';},cur),col_type:'text_2',extra:{lineVisible:false}});
    d.push({title:'完成筛选',url:$('#noLoading#').lazyRule(function(){back(true);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
    setResult(d);
  };

  J.rankHub4=function(){
    setPageTitle('排行');
    var d=[],page=MY_PAGE||1,type=getMyVar('jdb3_rank46_type','0'),period=getMyVar('jdb3_rank46_period','daily'),i,x;
    if(page===1){
      var types=[['TOP250','top'],['热播','playback'],['有码','0'],['无码','1'],['欧美','2'],['FC2','3']];
      for(i=0;i<types.length;i++){x=types[i];d.push(tab(x[0],type===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank46_type',v);refreshPage(false);return'hiker://empty';},x[1])));}
      rowBreak(d);
      if(type!=='top'){var ps=[['日榜','daily'],['周榜','weekly'],['月榜','monthly']];for(i=0;i<ps.length;i++){x=ps[i];d.push(tab(x[0],period===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank46_period',v);refreshPage(false);return'hiker://empty';},x[1])));}rowBreak(d);}
    }
    type=getMyVar('jdb3_rank46_type','0');period=getMyVar('jdb3_rank46_period','daily');
    var r,list=[];
    if(type==='top'){
      if(!getItem('jdb3_token','')){if(page===1)empty(d,'TOP250 需要登录','登录 JavDB 后查看','hiker://page/javdb3Account?rule=&simple=true');setResult(d);return;}
      if(page>5){setResult(d);return;}
      var start=String((page-1)*50+1);r=this.apiAuthSafe('/api/v1/movies/top',{start_rank:start,type:'all',type_value:'',ignore_watched:'false',page:1,limit:50});list=r.ok?(r.data.movies||[]):[];
      if(r.ok)for(i=0;i<list.length;i++)d.push(movieRankCard(list[i],list[i].ranking!=null?list[i].ranking:(Number(start)+i)));
    }else if(type==='playback'){
      if(page>1){setResult(d);return;}r=this.apiSafe('/api/v1/rankings/playback',{filter_by:'all',period:period});list=r.ok?(r.data.movies||[]):[];if(r.ok)for(i=0;i<list.length;i++)d.push(movieRankCard(list[i],i+1));
    }else{
      r=this.apiSafe('/api/v1/rankings',{type:type,period:period,page:page});list=r.ok?(r.data.movies||[]):[];if(r.ok)for(i=0;i<list.length;i++)d.push(movieRankCard(list[i],page===1?i+1:0));
    }
    if(r&&!r.ok&&page===1)empty(d,'榜单加载失败',r.error);
    setResult(d);
  };

  J.actorHub4=function(){
    setPageTitle('演员');
    var d=[],page=MY_PAGE||1,kind=getMyVar('jdb3_actor46_type','recommend'),tabs=[['推荐','recommend'],['有码女','0'],['有码男','1'],['无码','2'],['欧美女','3'],['欧美男','4']],i,x;
    if(page===1){for(i=0;i<tabs.length;i++){x=tabs[i];d.push(tab(x[0],kind===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_actor46_type',v);refreshPage(false);return'hiker://empty';},x[1])));}rowBreak(d);}
    kind=getMyVar('jdb3_actor46_type','recommend');
    if(kind==='recommend'){
      if(page>1){setResult(d);return;}var rr=this.apiSafe('/api/v1/actors/recommend',{});if(!rr.ok){empty(d,'演员加载失败',rr.error);setResult(d);return;}var data=rr.data||[],list=(data.new_actors||[]).concat(data.monthly_actors||[]).concat(data.recommend_actors||[]),seen={},out=[];for(i=0;i<list.length;i++){x=list[i]||{};var k=String(x.id||x.name||i);if(!seen[k]){seen[k]=1;out.push(x);}}for(i=0;i<out.length;i++)actorCard(d,out[i],0);setResult(d);return;
    }
    var mapped=kind==='2'?'3':kind==='3'?'2':kind,r=this.apiSafe('/api/v1/actors',{type:mapped,page:page}),al=r.ok?((r.data&&r.data.actors)||[]):[];
    if(!r.ok&&page===1)empty(d,'演员加载失败',r.error);for(i=0;i<al.length;i++)actorCard(d,al[i],0);setResult(d);
  };

  J.libraryHub4=function(){
    setPageTitle('收藏');
    var d=[],mode=getMyVar('jdb3_lib46_mode','movies'),tabs=[['影片','movies'],['演员','actors'],['历史','history'],['JavDB','account']],i,x;
    for(i=0;i<tabs.length;i++){x=tabs[i];d.push(tab(x[0],mode===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_lib46_mode',v);refreshPage(false);return'hiker://empty';},x[1])));}rowBreak(d);
    mode=getMyVar('jdb3_lib46_mode','movies');
    if(mode==='account'){
      var token=String(getItem('jdb3_token','')||'').trim();
      if(!token)d.push({title:'登录 JavDB',desc:'同步想看、看过、收藏与清单',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Account?rule=&simple=true',col_type:'avatar',extra:{lineVisible:false}});
      else{
        d.push({title:'想看',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3ReviewMovies?page=fypage&rule=&simple=true&jdb3_review_status=want_watch',col_type:'text_icon',extra:{lineVisible:false}});
        d.push({title:'看过',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3ReviewMovies?page=fypage&rule=&simple=true&jdb3_review_status=watched',col_type:'text_icon',extra:{lineVisible:false}});
        d.push({title:'账号收藏',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3Collected?page=fypage&rule=&simple=true',col_type:'text_icon',extra:{lineVisible:false}});
        d.push({title:'我的清单',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3Lists?rule=&simple=true',col_type:'text_icon',extra:{lineVisible:false}});
      }
      setResult(d);return;
    }
    var arr=this.localArray(mode==='movies'?'jdb3_favs':mode==='actors'?'jdb3_actor_favs':'jdb3_history');
    if(mode==='actors'){for(i=0;i<arr.length;i++){x=arr[i]||{};actorCard(d,{id:x.id||x.actor_id,name:x.name||x.title,avatar_url:x.img||x.avatar||x.avatar_url,videos_count:x.count},0);}}
    else for(i=0;i<arr.length;i++)d.push(localMovie(arr[i]));
    if(!arr.length)empty(d,mode==='movies'?'暂无影片收藏':mode==='actors'?'暂无演员收藏':'暂无浏览历史','');
    setResult(d);
  };

  J.moreHub4=function(){
    setPageTitle('更多');
    var d=[],items=[
      ['磁力搜索','搜索更多磁力资源','hiker://page/javdb3MagnetSearch?rule=&simple=true'],
      ['字幕搜索','按番号查找字幕','hiker://page/javdb3SubtitleSearch?rule=&simple=true'],
      ['网盘播放','网盘与离线播放入口','hiker://page/javdb3CloudPlay?rule=&simple=true'],
      ['封面布局','调整列表封面样式','hiker://page/javdb3CoverSettings?rule=&simple=true'],
      ['体验增强','搜索与体验选项','hiker://page/javdb3ExperienceSettings?rule=&simple=true'],
      ['JavDB账号','登录与账号状态','hiker://page/javdb3Account?rule=&simple=true'],
      ['API状态','接口与线路状态','hiker://page/javdb3Status?rule=&simple=true'],
      ['本地化诊断','Local-First 运行状态','hiker://page/javdb3LocalFirst?rule=&simple=true'],
      ['隐私与本地数据','清理和本地数据管理','hiker://page/javdb3Privacy?rule=&simple=true']
    ],i,x;
    for(i=0;i<items.length;i++){x=items[i];d.push({title:x[0],desc:x[1],pic_url:RIGHT,img:RIGHT,url:x[2],col_type:'text_icon',extra:{lineVisible:false}});}
    setResult(d);
  };

  J.externalPlayPage=function(){
    setPageTitle('更多播放');
    var d=[],p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},code=String(p.jdb3_number||'').trim().toUpperCase(),movieId=String(p.jdb3_id||'').trim(),preview=String(p.jdb3_preview||'').trim(),token=String(getItem('jdb3_token','')||'').trim(),vip=false,i,pr;
    try{var u=JSON.parse(getItem('jdb3_user','{}')||'{}');vip=!!u.is_vip;}catch(e){}
    if(!code){empty(d,'暂无番号','无法建立播放中心');setResult(d);return;}
    if(movieId&&token&&vip)d.push({title:'JavDB VIP',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Play?rule=&simple=true',col_type:'icon_2',extra:{lineVisible:false,jdb3_id:movieId,pageTitle:'VIP播放 · '+code}});
    if(preview)d.push({title:'官方预览',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:preview+'#isVideo=true#',col_type:'icon_2',extra:{lineVisible:false}});
    try{if(typeof JDBCLOUD!=='object'||typeof JDBCLOUD.playback!=='function')throw new Error('Playback Runtime 未就绪');var sdk=JDBCLOUD.playback(),ps=sdk.providers?sdk.providers():[];for(i=0;i<ps.length;i++){pr=ps[i]||{};d.push({title:String(pr.name||pr.id||'播放'),pic_url:String(pr.icon||''),img:String(pr.icon||''),url:sdk.providerUrl(String(pr.id||''),code),col_type:'icon_small_3',extra:{lineVisible:false}});}}catch(e2){empty(d,'第三方播放模块加载失败',String(e2.message||e2));}
    line(d);d.push({title:'JavDB 官方磁链',desc:'字幕 / HD / PikPak / 网盘',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3Magnets?rule=&simple=true',col_type:'text_icon',extra:{lineVisible:false,jdb3_id:movieId,jdb3_number:code,pageTitle:'磁链 · '+code}});
    setResult(d);
  };
})(JDB);
