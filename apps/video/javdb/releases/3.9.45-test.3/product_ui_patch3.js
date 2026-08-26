/* JavDB v3 3.9.45-test.3 NetflxCat-style category/search/playback refinement overlay */
(function(J){
  if(!J)throw new Error('JDB core unavailable');
  J.version='20260826-v3.9.45-test.3';
  J.productUiVersion='3.9.45-test.3';
  J.productUiBuild=2026082603;

  var BRAND='#3BB273',IDLE='#08777785',RIGHT='hiker://images/icon_right5';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function selected(name,on){return on?'““””<b><font color=#FFFFFF>'+esc(name)+'</font></b>':esc(name);}
  function tab(name,on,url){return{title:selected(name,on),url:url,col_type:'scroll_button',extra:{backgroundColor:on?BRAND:IDLE,lineVisible:false}};}
  function section(d,title,desc){var t='<b>'+esc(title)+'</b>';if(desc)t+=' <font color="#8A8A8A">'+esc(desc)+'</font>';d.push({title:t,url:'hiker://empty',col_type:'rich_text',extra:{textSize:16,lineVisible:false}});}
  function line(d){d.push({col_type:'line_blank'});}
  function empty(d,title,desc,url){d.push({title:title,desc:desc||'',url:url||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});}
  function hist(){var h=[];try{h=JSON.parse(getItem('jdb3_search_history','[]')||'[]');if(!(h instanceof Array))h=[];}catch(e){h=[];}return h;}
  function countAdvanced(extra,month,dur){return (extra?extra.split(',').filter(Boolean).length:0)+(month?1:0)+(dur?1:0);}

  function navBar3(d,current){
    var ns=[['发现','首页'],['排行','排行'],['分类','@category'],['演员','演员'],['我的','我的']],i,x;
    for(i=0;i<ns.length;i++){
      x=ns[i];
      if(x[1]==='@category')d.push(tab(x[0],false,'hiker://page/javdb3Filters?page=fypage&rule=&simple=true'));
      else d.push(tab(x[0],current===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_nav',v);refreshPage(false);return'hiker://empty';},x[1])));
    }
  }

  J.searchHub=function(){
    setPageTitle('搜索');
    var d=[],h=hist(),i,q;
    d.push({title:'搜索',desc:'输入番号、片名或演员',url:$.toString(function(){var kw=String(input||'').trim();if(!kw)return'toast://请输入搜索内容';try{var h=JSON.parse(getItem('jdb3_search_history','[]')||'[]');if(!(h instanceof Array))h=[];var n=[kw],i;for(i=0;i<h.length&&n.length<12;i++)if(String(h[i])!==kw)n.push(String(h[i]));setItem('jdb3_search_history',JSON.stringify(n));}catch(e){}return'hiker://page/javdb3Search?page=fypage&rule=&simple=true&word='+encodeURIComponent(kw);}),col_type:'input',extra:{backgroundColor:'#F5F7F6',lineVisible:false}});
    if(h.length){section(d,'最近搜索','点一下再次搜索');for(i=0;i<h.length&&i<12;i++){q=String(h[i]||'').trim();if(q)d.push({title:q,url:'hiker://page/javdb3Search?page=fypage&rule=&simple=true&word='+encodeURIComponent(q),col_type:'flex_button',extra:{lineVisible:false}});}d.push({title:'清空搜索记录',desc:'只清除本机搜索历史',url:$('#noLoading#').lazyRule(function(){setItem('jdb3_search_history','[]');refreshPage(false);return'toast://搜索记录已清空';}),col_type:'text_1',extra:{lineVisible:false}});line(d);}
    section(d,'按资料查找','演员 / 系列 / 片商 / 导演');
    d.push({title:'演员',desc:'推荐、榜单与分类',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_nav','演员');return'hiker://page/javdb3?rule=&simple=true';}),col_type:'text_2',extra:{lineVisible:false}});
    d.push({title:'系列',desc:'官方系列资料库',url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_2',extra:{jdb3_hub_kind:'series',pageTitle:'系列',lineVisible:false}});
    d.push({title:'片商',desc:'按制作片商浏览',url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_2',extra:{jdb3_hub_kind:'maker',pageTitle:'片商',lineVisible:false}});
    d.push({title:'导演',desc:'按导演浏览',url:'hiker://page/javdb3EntityHub?page=fypage&rule=&simple=true',col_type:'text_2',extra:{jdb3_hub_kind:'director',pageTitle:'导演',lineVisible:false}});
    setResult(d);
  };

  J.home=function(){
    setPageTitle('JavDB v3');
    var d=[],page=MY_PAGE||1,nav=getMyVar('jdb3_nav','首页');
    if(nav==='分类'||nav==='更多'){putMyVar('jdb3_nav','首页');nav='首页';}
    if(page===1){navBar3(d,nav);line(d);d.push({title:'搜索',desc:'番号 / 片名 / 演员 / 系列',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3SearchHub?rule=&simple=true',col_type:'text_icon',extra:{lineVisible:false}});line(d);}
    nav=getMyVar('jdb3_nav','首页');
    try{if(nav==='首页')this.homeFeed3(d,page);else if(nav==='排行')this.rank2(d,page);else if(nav==='演员')this.actorHub(d,page);else if(nav==='我的')this.myHub2(d,page);else{putMyVar('jdb3_nav','首页');this.homeFeed3(d,page);}}catch(e){empty(d,'页面加载失败',String(e.message||e),'hiker://page/javdb3Status?rule=&simple=true');}
    setResult(d);
  };

  J.homeFeed3=function(d,page){
    var mode=getMyVar('jdb3_home_mode','latest'),i,x;
    if(page===1){
      section(d,'发现','最新、推荐与资源更新');
      var modes=[['最新','latest'],['推荐','recommend'],['可播放','play_update'],['磁链更新','magnet_update']];for(i=0;i<modes.length;i++){x=modes[i];d.push(tab(x[0],mode===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_home_mode',v);refreshPage(false);return'hiker://empty';},x[1])));}
      line(d);section(d,'快速筛选','进入独立分类页');
      [['可播放','p'],['有字幕','c'],['可下载','m'],['全部分类','']].forEach(function(v){d.push(tab(v[0],false,$('#noLoading#').lazyRule(function(k){putMyVar('jdb3_cat42_main',k);return'hiker://page/javdb3Filters?page=fypage&rule=&simple=true';},v[1])));});
      var hs=this.localArray('jdb3_history');if(hs.length){line(d);section(d,'继续浏览','最近看过');for(i=0;i<hs.length&&i<6;i++){x=hs[i];d.push(this.movieCard({id:x.id,title:x.title,number:x.number,cover_url:x.img},this.coverLayout('home_history','movie_3')));}}
      line(d);
    }
    mode=getMyVar('jdb3_home_mode','latest');var ep=mode==='recommend'?'/api/v1/movies/recommend':'/api/v1/movies/latest',params={page:page,limit:48};
    if(mode==='latest'){params.type='all';params.filter_by='all';params.sort_by='release';}else if(mode==='magnet_update'){params.type='all';params.filter_by='magnets';params.sort_by='update';}else if(mode==='play_update'){params.type='all';params.filter_by='can_play';params.sort_by='update';}
    var r=this.apiSafe(ep,params);if(!r.ok){if(page===1)empty(d,'内容加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');return;}var list=r.data.movies||[];if(page===1)section(d,mode==='latest'?'最新发布':mode==='recommend'?'推荐影片':mode==='magnet_update'?'近期磁链更新':'新上线可播放',list.length+' 部');var layout=this.coverLayout('home','movie_3');for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));if(!list.length&&page===1)empty(d,'这里暂时没有内容','换个频道或稍后再试');
  };

  J.filters=function(){
    var p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},advanced=String(p.jdb3_mode||'')==='advanced',page=MY_PAGE||1;
    if(advanced){this.categoryAdvanced3();return;}
    setPageTitle('分类');
    var d=[],types=[['有码','0'],['无码','1'],['欧美','2'],['FC2','3'],['动漫','4']],mains=[['全部',''],['可播放','p'],['可下载','m'],['含字幕','c'],['单体','s'],['预览图','i'],['预览视频','v']],sorts=[['新发布','release desc'],['最近更新','update desc'],['评分','score desc'],['热度','hit desc'],['想看','want_watch_count desc'],['看过','watched_count desc']],type=getMyVar('jdb3_cat42_type','0'),main=getMyVar('jdb3_cat42_main',''),extra=getMyVar('jdb3_cat42_extra',''),year=getMyVar('jdb3_cat42_year',''),dur=getMyVar('jdb3_cat42_duration',''),month=getMyVar('jdb3_cat42_month',''),sort=getMyVar('jdb3_cat42_sort','release desc'),i,x;
    if(page===1){
      section(d,'类型','');for(i=0;i<types.length;i++){x=types[i];d.push(tab(x[0],type===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat42_type',v);clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'hiker://empty';},x[1])));}
      line(d);section(d,'资源','');for(i=0;i<mains.length;i++){x=mains[i];d.push(tab(x[0],main===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat42_main',v);refreshPage(false);return'hiker://empty';},x[1])));}
      var tr=this.apiSafe('/api/v2/tags',{type:type}),groups=tr.ok?(tr.data.tags||[]):[],g,cid,tags,t,id,name,on,gi,ti,yearTags=[];
      for(gi=0;gi<groups.length;gi++){g=groups[gi]||{};cid=String(g.category_id||'');if(cid==='year'){yearTags=(g.tags||[]).slice(0,80);break;}}
      if(yearTags.length){line(d);section(d,'年份','横向滑动查看更多');d.push(tab('全部',!year,$('#noLoading#').lazyRule(function(){clearMyVar('jdb3_cat42_year');refreshPage(false);return'hiker://empty';})));for(ti=0;ti<yearTags.length;ti++){t=yearTags[ti]||{};id=String(t.id||'');if(!id)continue;name=J.mask(t.name||id);d.push(tab(name,year===id,$('#noLoading#').lazyRule(function(id){putMyVar('jdb3_cat42_year',getMyVar('jdb3_cat42_year','')===id?'':id);refreshPage(false);return'hiker://empty';},id)));}}
      line(d);section(d,'排序','');for(i=0;i<sorts.length;i++){x=sorts[i];d.push(tab(x[0],sort===x[1],$('#noLoading#').lazyRule(function(v){putMyVar('jdb3_cat42_sort',v);refreshPage(false);return'hiker://empty';},x[1])));}
      var ac=countAdvanced(extra,month,dur);line(d);d.push({title:'更多筛选'+(ac?' · 已选'+ac+'项':''),desc:'月份 / 时长 / 主题 / 角色 / 服装 / 行为 / 玩法等',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3Filters?rule=&simple=true&jdb3_mode=advanced',col_type:'text_icon',extra:{lineVisible:false}});
      d.push({title:'重置',desc:'恢复 有码 / 全部 / 新发布',url:$('#noLoading#').lazyRule(function(){putMyVar('jdb3_cat42_type','0');putMyVar('jdb3_cat42_main','');putMyVar('jdb3_cat42_sort','release desc');clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_year');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'toast://筛选已重置';}),col_type:'text_1',extra:{lineVisible:false}});line(d);
    }
    type=getMyVar('jdb3_cat42_type','0');main=getMyVar('jdb3_cat42_main','');extra=getMyVar('jdb3_cat42_extra','');year=getMyVar('jdb3_cat42_year','');dur=getMyVar('jdb3_cat42_duration','');month=getMyVar('jdb3_cat42_month','');sort=getMyVar('jdb3_cat42_sort','release desc');var filter=type+':t:'+main+':'+extra+':'+year+':'+dur+':'+month,sp=sort.split(' '),r=this.apiSafe('/api/v1/movies/tags',{filter_by:filter,sort_by:sp[0],order_by:sp[1]||'desc',page:page,limit:48});if(!r.ok){if(page===1)empty(d,'分类加载失败',r.error,'hiker://page/javdb3Status?rule=&simple=true');setResult(d);return;}var list=r.data.movies||[];if(page===1)section(d,'影片',list.length+' 部');var layout=this.coverLayout('category','movie_3');for(i=0;i<list.length;i++)d.push(this.movieCard(list[i],layout));if(!list.length&&page===1)empty(d,'当前筛选暂无结果','换一个筛选条件');setResult(d);
  };

  J.categoryAdvanced3=function(){
    setPageTitle('更多筛选');
    var d=[],type=getMyVar('jdb3_cat42_type','0'),extra=getMyVar('jdb3_cat42_extra',''),month=getMyVar('jdb3_cat42_month',''),dur=getMyVar('jdb3_cat42_duration',''),tr=this.apiSafe('/api/v2/tags',{type:type}),groups=tr.ok?(tr.data.tags||[]):[],selected=extra.split(',').filter(Boolean),g,cid,tags,t,id,name,on,gi,ti;
    d.push({title:'完成筛选',desc:'返回分类结果并刷新',pic_url:RIGHT,img:RIGHT,url:$('#noLoading#').lazyRule(function(){back(true);return'hiker://empty';}),col_type:'text_icon',extra:{lineVisible:false}});line(d);
    if(!tr.ok){empty(d,'筛选项加载失败',tr.error);setResult(d);return;}
    for(gi=0;gi<groups.length;gi++){
      g=groups[gi]||{};cid=String(g.category_id||'');if(cid==='main'||cid==='year')continue;tags=(g.tags||[]).slice(0,80);if(!tags.length)continue;section(d,J.mask(g.category||cid),cid==='month'||cid==='duration'?'单选 · 横向滑动查看更多':'可多选 · 横向滑动查看更多');if(cid==='month'||cid==='duration')d.push(tab('全部',cid==='month'?!month:!dur,$('#noLoading#').lazyRule(function(cid){if(cid==='month')clearMyVar('jdb3_cat42_month');else clearMyVar('jdb3_cat42_duration');refreshPage(false);return'hiker://empty';},cid)));
      for(ti=0;ti<tags.length;ti++){
        t=tags[ti]||{};id=String(t.id||'');if(!id)continue;name=J.mask(t.name||id);on=cid==='month'?month===id:cid==='duration'?dur===id:selected.indexOf(id)>=0;
        d.push(tab(name,on,$('#noLoading#').lazyRule(function(cid,id){if(cid==='month')putMyVar('jdb3_cat42_month',getMyVar('jdb3_cat42_month','')===id?'':id);else if(cid==='duration')putMyVar('jdb3_cat42_duration',getMyVar('jdb3_cat42_duration','')===id?'':id);else{var a=getMyVar('jdb3_cat42_extra','').split(',').filter(Boolean),i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);putMyVar('jdb3_cat42_extra',a.join(','));}refreshPage(false);return'hiker://empty';},cid,id)));
      }
      line(d);
    }
    d.push({title:'清空更多筛选',desc:'保留类型 / 资源 / 年份 / 排序',url:$('#noLoading#').lazyRule(function(){clearMyVar('jdb3_cat42_extra');clearMyVar('jdb3_cat42_duration');clearMyVar('jdb3_cat42_month');refreshPage(false);return'toast://更多筛选已清空';}),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'完成并返回',url:$('#noLoading#').lazyRule(function(){back(true);return'hiker://empty';}),col_type:'text_center_1',extra:{backgroundColor:BRAND,lineVisible:false}});setResult(d);
  };

  J.externalPlayPage=function(){
    setPageTitle('更多播放');
    var d=[],p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},code=String(p.jdb3_number||'').trim().toUpperCase(),movieId=String(p.jdb3_id||'').trim(),preview=String(p.jdb3_preview||'').trim(),canPlay=!!p.jdb3_can_play;
    if(!code){empty(d,'暂无番号','无法建立播放中心');setResult(d);return;}
    section(d,'播放中心',code);var token=String(getItem('jdb3_token','')||'').trim(),vip=false;try{var u=JSON.parse(getItem('jdb3_user','{}')||'{}');vip=!!u.is_vip;}catch(e){}
    if(movieId&&token&&vip)d.push({title:'JavDB VIP',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:'hiker://page/javdb3Play?rule=&simple=true',col_type:'icon_2',extra:{lineVisible:false,jdb3_id:movieId,pageTitle:'VIP播放 · '+code}});
    if(preview)d.push({title:'官方预览',pic_url:'https://javdb.com/favicon.ico',img:'https://javdb.com/favicon.ico',url:preview+'#isVideo=true#',col_type:'icon_2',extra:{lineVisible:false}});
    line(d);section(d,'第三方播放','点击图标按番号解析');
    try{if(typeof JDBCLOUD!=='object'||typeof JDBCLOUD.playback!=='function')throw new Error('Local Playback Runtime 未就绪');var sdk=JDBCLOUD.playback(),ps=sdk.providers?sdk.providers():[],i,pr;if(ps.length){for(i=0;i<ps.length;i++){pr=ps[i]||{};d.push({title:String(pr.name||pr.id||'播放'),pic_url:String(pr.icon||''),img:String(pr.icon||''),url:sdk.providerUrl(String(pr.id||''),code),col_type:'icon_small_3',extra:{lineVisible:false}});}}else sdk.renderInto(d,{code:code});}catch(e2){empty(d,'第三方播放模块加载失败',String(e2.message||e2));}
    line(d);d.push({title:'JavDB 官方磁链',desc:'中文字幕 / HD / PikPak / 网盘',pic_url:RIGHT,img:RIGHT,url:'hiker://page/javdb3Magnets?rule=&simple=true',col_type:'text_icon',extra:{lineVisible:false,jdb3_id:movieId,jdb3_number:code,pageTitle:'磁链 · '+code}});setResult(d);
  };

  var settings0=J.settings;if(typeof settings0==='function')J.settings=function(d){var a=[],i,x;settings0.call(this,a);for(i=0;i<a.length;i++){x=a[i]||{};if(typeof x.title==='string')x.title=x.title.replace(/JavDB v3\.9\.45-test\.2/g,'JavDB v3.9.45-test.3');if(typeof x.desc==='string'&&x.desc.indexOf('Build2026082602')>=0)x.desc=x.desc.replace('Build2026082602','Build2026082603');d.push(x);}};
})(JDB);
