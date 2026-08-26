/* JavDB v3 3.9.45-test.1 Product / UI overhaul overlay */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260826-v3.9.45-test.1';
  J.productUiVersion='3.9.45-test.1';
  J.productUiBuild=2026082601;

  var BRAND='#3BB273',SOFT='#EEF7F2',IDLE='#08777785';
  var RIGHT='hiker://images/icon_right5';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function selectedTitle(name,on){return on?'““””<b><font color=#FFFFFF>'+esc(name)+'</font></b>':esc(name);}
  function tab(name,on,url){return{title:selectedTitle(name,on),url:url,col_type:'scroll_button',extra:{backgroundColor:on?BRAND:IDLE,lineVisible:false}};}
  function flex(name,on,url){return{title:selectedTitle(name,on),url:url,col_type:'flex_button',extra:{backgroundColor:on?BRAND:IDLE,lineVisible:false}};}
  function section(d,title,desc){
    var t='<b>'+esc(title)+'</b>';
    if(desc)t+=' <font color="#888888">'+esc(desc)+'</font>';
    d.push({title:t,url:'hiker://empty',col_type:'rich_text',extra:{textSize:16,lineVisible:false}});
  }
  function sectionLink(d,title,url){
    d.push({title:title,pic_url:RIGHT,img:RIGHT,url:url,col_type:'text_icon',extra:{lineVisible:false}});
  }
  function divider(d){d.push({col_type:'line_blank'});}
  function empty(d,title,desc,url){
    d.push({title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});
  }
  function movieRankCard(x,rank){
    var c=J.movieCard(x,'movie_1_vertical_pic');
    c.col_type='movie_1_vertical_pic';
    if(rank)c.title='TOP '+rank+' · '+c.title;
    c.extra=c.extra||{};c.extra.lineVisible=false;
    return c;
  }
  function actorCard(d,a,rank,layout){
    a=a||{};
    var title=J.mask(a.name||a.name_zht||a.other_name||'未命名演员');
    var img=J.img(a.avatar_url||'');
    var desc=[];
    if(a.videos_count!==undefined&&a.videos_count!==null)desc.push('作品 '+a.videos_count);
    if(a.other_name)desc.push(J.mask(a.other_name));
    d.push({
      title:(rank?('TOP '+rank+' · '):'')+title,
      desc:desc.join(' · '),
      pic_url:img,img:img,
      url:'hiker://page/javdb3Entity?page=fypage&rule=&simple=true',
      col_type:layout||'movie_3',
      extra:{lineVisible:false,jdb3_entity_type:'actor',jdb3_entity_id:String(a.id||''),pageTitle:title}
    });
  }
  function todayLabel(){
    try{var d=new Date();return (d.getMonth()+1)+'月'+d.getDate()+'日更新';}catch(e){return '近期更新';}
  }
  function navBar(d,current){
    var ns=[['发现','首页'],['排行','排行'],['分类','分类'],['演员','演员'],['我的','我的'],['更多','更多']];
    for(var i=0;i<ns.length;i++){
      (function(x){d.push(tab(x[0],current===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_nav',v);refreshPage(false);return'hiker://empty';},x[1])));})(ns[i]);
    }
  }
  function searchHistory(d){
    var h=[];
    try{h=JSON.parse(getItem('jdb3_search_history','[]')||'[]');if(!(h instanceof Array))h=[];}catch(e){h=[];}
    if(!h.length)return;
    section(d,'最近搜索','快速再次查找');
    for(var i=0;i<h.length&&i<8;i++){
      var q=String(h[i]||'').trim();if(!q)continue;
      d.push({title:q,url:'hiker://page/javdb3Search?page=fypage&rule=&simple=true&word='+encodeURIComponent(q),col_type:'flex_button',extra:{lineVisible:false}});
    }
    divider(d);
  }

  J.home=function(){
    setPageTitle('JavDB v3');
    var d=[],page=MY_PAGE||1,nav=getMyVar('jdb3_nav','首页');
    if(page===1){
      d.push({
        title:'搜索影片 / 番号 / 演员 / 系列',
        desc:'输入关键词立即搜索',
        url:$.toString(function(){
          var kw=String(input||'').trim();if(!kw)return'toast://请输入搜索内容';
          try{var h=JSON.parse(getItem('jdb3_search_history','[]'));if(!(h instanceof Array))h=[];var n=[kw],i;for(i=0;i<h.length&&n.length<12;i++)if(String(h[i])!==kw)n.push(String(h[i]));setItem('jdb3_search_history',JSON.stringify(n));}catch(_e){}
          return'hiker://page/javdb3Search?page=fypage&rule=&simple=true&word='+encodeURIComponent(kw);
        }),
        col_type:'input',extra:{backgroundColor:SOFT,lineVisible:false}
      });
      navBar(d,nav);
      divider(d);
      if(nav==='首页')searchHistory(d);
    }
    nav=getMyVar('jdb3_nav','首页');
    try{
      if(nav==='首页')this.homeFeed(d,page);
      else if(nav==='排行')this.rank(d,page);
      else if(nav==='分类')this.category(d,page);
      else if(nav==='演员')this.actorHub(d,page);
      else if(nav==='我的')this.myHub(d,page);
      else if(nav==='更多')this.moreHub(d,page);
      else{putMyVar('jdb3_nav','首页');this.homeFeed(d,page);}
    }catch(e){empty(d,'页面加载失败',String(e.message||e),'hiker://page/javdb3Status?rule=&simple=true');}
    setResult(d);
  };

  J.homeFeed=function(d,page){
    var mode=getMyVar('jdb3_home_mode','latest'),i,x,on;
    if(page===1){
      section(d,'发现','今天想看什么');
      var modes=[['最新','latest'],['推荐','recommend'],['可播放更新','play_update'],['磁链更新','magnet_update']];
      for(i=0;i<modes.length;i++){
        x=modes[i];on=mode===x[1];
        d.push(tab(x[0],on,$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_home_mode',v);refreshPage(false);return'hiker://empty';},x[1])));
      }
      divider(d);
      section(d,'按任务浏览','快速进入常用筛选');
      d.push({title:'可播放',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','分类');putMyVar('jdb3_cat42_main','p');refreshPage(false);return'hiker://empty';}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'有字幕',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','分类');putMyVar('jdb3_cat42_main','c');refreshPage(false);return'hiker://empty';}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'可下载',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','分类');putMyVar('jdb3_cat42_main','m');refreshPage(false);return'hiker://empty';}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'高级筛选',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','分类');putMyVar('jdb3_cat42_adv','1');refreshPage(false);return'hiker://empty';}),col_type:'text_4',extra:{lineVisible:false}});
      var hist=this.localArray('jdb3_history');
      if(hist.length){
        divider(d);section(d,'继续浏览','最近看过');
        for(i=0;i<hist.length&&i<6;i++){
          x=hist[i];d.push(this.movieCard({id:x.id,title:x.title,number:x.number,cover_url:x.img,release_date:x.date},this.coverLayout('home_history','movie_3')));
        }
      }
      divider(d);
    }
    mode=getMyVar('jdb3_home_mode','latest');
    var ep=mode==='recommend'?'/api/v1/movies/recommend':'/api/v1/movies/latest',params={page:page,limit:48};
    if(mode==='latest'){params.type='all';params.filter_by='all';params.sort_by='release';}
    else if(mode==='magnet_update'){params.type='all';params.filter_by='magnets';params.sort_by='update';}
    else if(mode==='play_update'){params.type='all';params.filter_by='can_play';params.sort_by='update';}
    var r=this.apiSafe(ep,params);
    if(!r.ok){if(page===1)empty(d,'内容加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');return;}
    var list=r.data.movies||[];
    if(page===1){
      var nm=mode==='latest'?'最新发布':mode==='recommend'?'为你推荐':mode==='magnet_update'?'近期磁链更新':'新上线可播放';
      section(d,nm,list.length+' 部');
    }
    var layout=this.coverLayout('home','movie_3');
    for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));
    if(!list.length&&page===1)empty(d,'这里暂时没有内容','换个频道或稍后再试');
  };

  J.category=function(d,page){
    var types=[['有​码','0'],['无​码','1'],['欧美','2'],['FC2','3'],['动漫','4']];
    var type=getMyVar('jdb3_cat42_type','0'),main=getMyVar('jdb3_cat42_main',''),extra=getMyVar('jdb3_cat42_extra',''),year=getMyVar('jdb3_cat42_year',''),dur=getMyVar('jdb3_cat42_duration',''),month=getMyVar('jdb3_cat42_month',''),sort=getMyVar('jdb3_cat42_sort','release desc');
    var i,x,on;
    if(page===1){
      section(d,'分类','先选内容类型，再按资源条件缩小范围');
      for(i=0;i<types.length;i++){
        x=types[i];
        d.push(tab(x[0],type===x[1],$('#noLoading#').lazyRule(function(v){
          putMyVar('jdb3_cat42_type',v);clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'hiker://empty';
        },x[1])));
      }
      divider(d);
      section(d,'资源条件','常用条件一屏直达');
      var mains=[['全部',''],['可播放','p'],['可下载','m'],['含字幕','c'],['单体影片','s'],['有预览图','i'],['有预览视频','v']];
      for(i=0;i<mains.length;i++){
        x=mains[i];d.push(tab(x[0],main===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat42_main',v);refreshPage(false);return'hiker://empty';},x[1])));
      }
      var active=(extra?extra.split(',').filter(Boolean).length:0)+(year?1:0)+(dur?1:0)+(month?1:0),adv=getMyVar('jdb3_cat42_adv','0')==='1';
      divider(d);
      d.push({
        title:adv?'收起高级筛选':'展开高级筛选',
        desc:active?('已选择 '+active+' 项'):'年份 / 月份 / 时长 / 动态标签',
        pic_url:RIGHT,img:RIGHT,
        url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_cat42_adv',getMyVar('jdb3_cat42_adv','0')==='1'?'0':'1');refreshPage(false);return'hiker://empty';}),
        col_type:'text_icon',extra:{lineVisible:false}
      });
      if(adv){
        var tr=this.apiSafe('/api/v2/tags',{type:type});
        if(!tr.ok)empty(d,'高级筛选加载失败',tr.error);
        else{
          var groups=tr.data.tags||[],selected=extra.split(',').filter(Boolean),g,t,cid,tags,id,name,special;
          for(var gi=0;gi<groups.length;gi++){
            g=groups[gi]||{};cid=String(g.category_id||'');if(cid==='main')continue;
            tags=(g.tags||[]).slice(0,80);if(!tags.length)continue;
            special=cid==='year'||cid==='duration'||cid==='month';
            section(d,J.mask(g.category||cid),special?'单选 · 横向滑动查看更多':'可多选 · 横向滑动查看更多');
            for(var ti=0;ti<tags.length;ti++){
              t=tags[ti]||{};id=String(t.id||'');if(!id)continue;name=J.mask(t.name||id);
              on=cid==='year'?year===id:cid==='duration'?dur===id:cid==='month'?month===id:selected.indexOf(id)>=0;
              d.push(tab(name,on,$('#noLoading#').lazyRule(function(cid,id){
                if(cid==='year')putMyVar('jdb3_cat42_year',getMyVar('jdb3_cat42_year','')===id?'':id);
                else if(cid==='duration')putMyVar('jdb3_cat42_duration',getMyVar('jdb3_cat42_duration','')===id?'':id);
                else if(cid==='month')putMyVar('jdb3_cat42_month',getMyVar('jdb3_cat42_month','')===id?'':id);
                else{var a=getMyVar('jdb3_cat42_extra','').split(',').filter(Boolean),i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);putMyVar('jdb3_cat42_extra',a.join(','));}
                refreshPage(false);return'hiker://empty';
              },cid,id)));
            }
          }
        }
        d.push({title:'清空高级筛选',url:$('#noLoading#').lazyRule(function(){clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'toast://高级筛选已清空';}),col_type:'text_center_1',extra:{lineVisible:false}});
      }
      divider(d);section(d,'排序','直接切换，不再弹旧式选择器');
      var sorts=[['新发布','release desc'],['旧发布','release asc'],['最近更新','update desc'],['评分','score desc'],['热度','hit desc'],['想看','want_watch_count desc'],['看过','watched_count desc']];
      for(i=0;i<sorts.length;i++){
        x=sorts[i];d.push(tab(x[0],sort===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat42_sort',v);refreshPage(false);return'hiker://empty';},x[1])));
      }
      d.push({title:'重置全部筛选',desc:'恢复 有码 / 全部 / 新发布',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_cat42_type','0');putMyVar('jdb3_cat42_main','');putMyVar('jdb3_cat42_sort','release desc');clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'toast://筛选已重置';}),col_type:'text_1',extra:{lineVisible:false}});
      divider(d);
    }
    type=getMyVar('jdb3_cat42_type','0');main=getMyVar('jdb3_cat42_main','');extra=getMyVar('jdb3_cat42_extra','');year=getMyVar('jdb3_cat42_year','');dur=getMyVar('jdb3_cat42_duration','');month=getMyVar('jdb3_cat42_month','');sort=getMyVar('jdb3_cat42_sort','release desc');
    var filter=type+':t:'+main+':'+extra+':'+year+':'+dur+':'+month,sp=sort.split(' ');
    var r=this.apiSafe('/api/v1/movies/tags',{filter_by:filter,sort_by:sp[0],order_by:sp[1]||'desc',page:page,limit:48});
    if(!r.ok){if(page===1)empty(d,'分类加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');return;}
    var list=r.data.movies||[];
    if(page===1)section(d,'影片',list.length+' 部');
    var layout=this.coverLayout('category','movie_3');for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));
    if(!list.length&&page===1)empty(d,'当前筛选暂无结果','换一个条件组合试试');
    if(page===1){divider(d);section(d,'官方资料库','从影片之外继续探索');[['系列','series'],['片商','maker'],['导演','director']].forEach(function(v){d.push({title:v[0],url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_3',extra:{jdb3_hub_kind:v[1],pageTitle:v[0],lineVisible:false}});});}
  };

  J.rank=function(d,page){
    var tabv=getMyVar('jdb3_rank42_tab','0'),period=getMyVar('jdb3_rank42_period','daily'),i,x;
    var tabs=[['TOP250','top250'],['看热播','playback'],['有​码','0'],['无​码','1'],['欧美','2'],['FC2','3']];
    if(page===1){
      section(d,'排行榜','评分 / 热度 / 排名更易比较');
      for(i=0;i<tabs.length;i++){x=tabs[i];d.push(tab(x[0],tabv===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_rank42_tab',v);putMyVar('jdb3_rank42_actor_month','0');refreshPage(false);return'hiker://empty';},x[1])));}
      divider(d);
    }
    tabv=getMyVar('jdb3_rank42_tab','0');period=getMyVar('jdb3_rank42_period','daily');
    if(tabv==='top250'){
      if(!getItem('jdb3_token','')){if(page===1)empty(d,'TOP250 需要登录','登录 JavDB 后查看完整榜单','hiker://page/javdb3Account?rule=&simple=true');return;}
      if(page>5)return;
      var start=String((page-1)*50+1),tr=this.apiAuthSafe('/api/v1/movies/top',{start_rank:start,type:'all',type_value:'',ignore_watched:'false',page:1,limit:50});
      if(!tr.ok){if(page===1)empty(d,'TOP250 加载失败',tr.error,'hiker://page/javdb3Account?rule=&simple=true');return;}
      var tl=tr.data.movies||[];if(page===1)section(d,'TOP250','综合榜单 · '+tl.length+' 部');
      for(i=0;i<tl.length;i++){var rn=tl[i].ranking!==undefined&&tl[i].ranking!==null?tl[i].ranking:(Number(start)+i);d.push(movieRankCard(tl[i],rn));}
      return;
    }
    if(tabv==='playback'){
      if(page>1)return;
      var pf=getMyVar('jdb3_rank42_playback_filter','all');
      if(page===1){
        section(d,'热播条件','');
        [['全部','all'],['高评分','high_score']].forEach(function(v){d.push(tab(v[0],pf===v[1],$('#noLoading#').lazyRule(function(z){putMyVar('jdb3_rank42_playback_filter',z);refreshPage(false);return'hiker://empty';},v[1])));});
        divider(d);
        [['日榜','daily'],['周榜','weekly'],['月榜','monthly']].forEach(function(v){d.push(tab(v[0],period===v[1],$('#noLoading#').lazyRule(function(z){putMyVar('jdb3_rank42_period',z);refreshPage(false);return'hiker://empty';},v[1])));});
      }
      var pr=this.apiSafe('/api/v1/rankings/playback',{filter_by:pf,period:period});
      if(!pr.ok){empty(d,'热播榜加载失败',pr.error);return;}
      var pl=pr.data.movies||[];divider(d);section(d,'看热播',pl.length+' 部');for(i=0;i<pl.length;i++)d.push(movieRankCard(pl[i],i+1));return;
    }
    var actorMonth=getMyVar('jdb3_rank42_actor_month','0')==='1';
    if(page===1){
      section(d,'周期','');
      [['日榜','daily'],['周榜','weekly'],['月榜','monthly']].forEach(function(v){d.push(tab(v[0],!actorMonth&&period===v[1],$('#noLoading#').lazyRule(function(z){putMyVar('jdb3_rank42_actor_month','0');putMyVar('jdb3_rank42_period',z);refreshPage(false);return'hiker://empty';},v[1])));});
      d.push(tab('演员月榜',actorMonth,$('#noLoading#').lazyRule(function(){putMyVar('jdb3_rank42_actor_month','1');refreshPage(false);return'hiker://empty';})));
      divider(d);
    }
    if(actorMonth){
      if(page>1)return;var ar=this.apiSafe('/api/v1/rankings/actors',{type:tabv,filter_by:'monthly'});
      if(!ar.ok){empty(d,'演员月榜加载失败',ar.error);return;}
      var al=(ar.data&&ar.data.actors)||[];section(d,'演员月榜',al.length+' 位');for(i=0;i<al.length;i++)actorCard(d,al[i],i<10?i+1:0,'movie_1_vertical_pic');return;
    }
    var rr=this.apiSafe('/api/v1/rankings',{type:tabv,period:period,page:page});
    if(!rr.ok){if(page===1)empty(d,'排行榜加载失败',rr.error);return;}
    var rl=rr.data.movies||[];if(page===1)section(d,period==='daily'?'日榜':period==='weekly'?'周榜':'月榜',rl.length+' 部');
    for(i=0;i<rl.length;i++)d.push(movieRankCard(rl[i],page===1&&i<10?i+1:0));
  };

  J.actorHub=function(d,page){
    var tabv=getMyVar('jdb3_actor42_tab','recommend'),tabs=[['推荐','recommend'],['有​码女','0'],['有​码男','1'],['无​码','2'],['欧美女','3'],['欧美男','4']],i,x;
    if(page===1){
      section(d,'演员','推荐、榜单与分类浏览');
      for(i=0;i<tabs.length;i++){x=tabs[i];d.push(tab(x[0],tabv===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_actor42_tab',v);refreshPage(false);return'hiker://empty';},x[1])));}
      divider(d);
    }
    tabv=getMyVar('jdb3_actor42_tab','recommend');
    if(tabv==='recommend'){
      if(page>1)return;
      var r=this.apiSafe('/api/v1/actors/recommend',{});if(!r.ok){empty(d,'演员推荐加载失败',r.error);return;}
      var data=r.data||{},newer=data.new_actors||[],monthly=data.monthly_actors||[],rec=data.recommend_actors||[],label=todayLabel();
      if(newer.length){section(d,'新人',label);for(i=0;i<newer.length;i++)actorCard(d,newer[i],0,'movie_3');divider(d);}
      if(monthly.length){sectionLink(d,'月排名 · 查看完整榜单',$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','排行');putMyVar('jdb3_rank42_tab','0');putMyVar('jdb3_rank42_actor_month','1');refreshPage(false);return'hiker://empty';}));for(i=0;i<monthly.length;i++)actorCard(d,monthly[i],0,'movie_3');divider(d);}
      if(rec.length){section(d,'Fanza / DMM 推荐',label);for(i=0;i<rec.length;i++)actorCard(d,rec[i],0,'movie_3');}
      if(!newer.length&&!monthly.length&&!rec.length)empty(d,'暂无推荐演员','稍后再来看看');return;
    }
    var api=this.apiSafe,lr;
    try{
      var mapped=tabv==='2'?'3':tabv==='3'?'2':tabv;
      lr=api.call(this,'/api/v1/actors',{type:mapped,page:page});
    }catch(e){lr={ok:false,error:String(e.message||e)};}
    if(!lr.ok){if(page===1)empty(d,'演员列表加载失败',lr.error);return;}
    var list=(lr.data&&lr.data.actors)||[],nm='';for(i=0;i<tabs.length;i++)if(tabs[i][1]===tabv)nm=tabs[i][0];
    if(page===1)section(d,nm,'本页 '+list.length+' 位');for(i=0;i<list.length;i++)actorCard(d,list[i],0,'movie_3');
    if(!list.length&&page===1)empty(d,'当前分类暂无演员','换一个分类试试');
  };

  J.myHub=function(d,page){
    if(page>1)return;
    var mode=getMyVar('jdb3_my_mode','overview'),modes=[['总览','overview'],['本地片库','local'],['JavDB账号','account']],i,x;
    section(d,'我的','收藏、历史与账号内容');
    for(i=0;i<modes.length;i++){x=modes[i];d.push(tab(x[0],mode===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_my_mode',v);refreshPage(false);return'hiker://empty';},x[1])));}
    divider(d);
    if(mode==='local'){this.localHub(d);return;}
    if(mode==='account'){this.accountPanel(d);return;}
    var favs=this.localArray('jdb3_favs'),actors=this.localArray('jdb3_actor_favs'),hist=this.localArray('jdb3_history'),u=this.cachedUser(),token=String(getItem('jdb3_token','')||'').trim();
    section(d,'本地片库','数据保存在本机');
    d.push({title:'影片收藏 · '+favs.length,url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_my_mode','local');putMyVar('jdb3_local_tab','影片收藏');refreshPage(false);return'hiker://empty';}),col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'演员收藏 · '+actors.length,url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_my_mode','local');putMyVar('jdb3_local_tab','演员收藏');refreshPage(false);return'hiker://empty';}),col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'浏览历史 · '+hist.length,url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_my_mode','local');putMyVar('jdb3_local_tab','历史');refreshPage(false);return'hiker://empty';}),col_type:'text_3',extra:{lineVisible:false}});
    divider(d);section(d,'JavDB 账号','同步网站账号内容');
    if(!token){d.push({title:'登录 JavDB',desc:'同步想看、看过、收藏、清单与 VIP 播放',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Account?rule=&simple=true',col_type:'icon_1_left_pic',extra:{lineVisible:false}});return;}
    var name=this.mask((u&&u.username)||getItem('jdb3_last_username','')||'JavDB 用户'),vip=!!(u&&u.is_vip);
    d.push({title:(vip?'★ ':'')+name,desc:vip?'VIP 会员':'普通会员',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Account?rule=&simple=true',col_type:'avatar',extra:{lineVisible:false}});
    d.push({title:'想看 · '+(u&&u.want_watch_count!=null?u.want_watch_count:'同步'),url:'hiker://page/javdb3ReviewMovies?page=fypage&rule=&simple=true&jdb3_review_status=want_watch',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'看过 · '+(u&&u.watched_count!=null?u.watched_count:'同步'),url:'hiker://page/javdb3ReviewMovies?page=fypage&rule=&simple=true&jdb3_review_status=watched',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'账号收藏',url:'hiker://page/javdb3Collected?page=fypage&rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    divider(d);section(d,'账号内容','');
    d.push({title:'我的清单',url:'hiker://page/javdb3Lists?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'近期浏览',url:'hiker://page/javdb3Recent?page=fypage&rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'TOP250',url:'hiker://page/javdb3Top250?page=fypage&rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
  };

  J.moreHub=function(d,page){
    var mode=getMyVar('jdb3_more_mode','menu');
    if(mode==='articles'){
      if(page===1)d.push({title:'‹ 返回更多',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_more_mode','menu');refreshPage(false);return'hiker://empty';}),col_type:'text_1',extra:{lineVisible:false}});
      this.articles(d,page);return;
    }
    if(page>1)return;
    if(mode==='settings'){
      d.push({title:'‹ 返回更多',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_more_mode','menu');refreshPage(false);return'hiker://empty';}),col_type:'text_1',extra:{lineVisible:false}});
      this.settings(d);return;
    }
    section(d,'更多','内容 / 工具 / 体验 / 维护');
    section(d,'内容与资料库','');
    d.push({title:'资讯',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_more_mode','articles');refreshPage(false);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
    [['系列','series'],['片商','maker'],['导演','director']].forEach(function(v){d.push({title:v[0],url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_3',extra:{jdb3_hub_kind:v[1],pageTitle:v[0],lineVisible:false}});});
    divider(d);section(d,'资源工具','搜索、字幕与网盘能力');
    d.push({title:'磁力搜索',url:'hiker://page/javdb3MagnetSearch?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'字幕搜索',url:'hiker://page/javdb3SubtitleSearch?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'网盘播放中心',url:'hiker://page/javdb3CloudPlay?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'内置磁力引擎',url:'hiker://page/javdb3MagnetEngine?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'0cili 磁力',url:'hiker://page/javdb3OciliMagnet?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    divider(d);section(d,'体验','显示与搜索');
    d.push({title:'自定义搜索',url:'hiker://page/javdb3CustomSearchSettings?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'封面布局',url:'hiker://page/javdb3CoverSettings?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'体验增强',url:'hiker://page/javdb3ExperienceSettings?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    divider(d);section(d,'维护','低频功能集中在这里');
    d.push({title:'设置',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_more_mode','settings');refreshPage(false);return'hiker://empty';}),col_type:'text_2',extra:{lineVisible:false}});
    d.push({title:'API 状态',url:'hiker://page/javdb3Status?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'本地化诊断',url:'hiker://page/javdb3LocalFirst?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
    d.push({title:'隐私与本地数据',url:'hiker://page/javdb3Privacy?rule=&simple=true',col_type:'text_3',extra:{lineVisible:false}});
  };

  var settings0=J.settings;
  J.settings=function(d){
    var a=[];settings0.call(this,a);
    for(var i=0;i<a.length;i++){
      var x=a[i]||{};
      if(x.col_type==='blank_block')x.col_type='line_blank';
      if(typeof x.title==='string'&&x.title.indexOf('JavDB v3')>=0){x.title='JavDB v3.9.45-test.1';x.desc='Native Local-First · Product/UI Overhaul · Build2026082601';}
      d.push(x);
    }
  };
})(JDB);
