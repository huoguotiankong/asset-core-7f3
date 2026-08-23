/* MyAv 0.1.0-test.5 - search/home icons + native entity pages */
(function(R,C){
  if(!R||!C)throw new Error('MyAv runtime/core missing for Test5 UI patch');
  R.version='0.1.0-test.5';
  R.build=10105;
  R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v5_b10105.js';
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/assets/';
  function S(v){return v===undefined||v===null?'':String(v);}
  function dec(v){try{return decodeURIComponent(S(v));}catch(e){return S(v);}}
  function P(name,def){var v='';try{v=getParam(name,'');}catch(e){}return v?v:(def||'');}
  function curPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(title,desc){return{title:title,desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function chip(title,url){return{title:title,url:url,col_type:'scroll_button',extra:{lineVisible:false}};}
  function stateBtn(title,id,cur,key){return chip((id===cur?'● ':'')+title,$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,id));}
  function actionIcon(title,img,url){return{title:title,img:img,pic_url:img,url:url,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function card(m,sec){var meta=[];if(m.code)meta.push(S(m.code).toUpperCase());if(m.date)meta.push(m.date);if(m.flags&&m.flags.length)meta.push(m.flags.join(' · '));return{title:m.title||m.code||'影片',desc:meta.join(' · '),img:m.img||'',pic_url:m.img||'',url:C.page('myavDetail',{u:m.href,code:m.code||'',sec:sec||m.section||'normal'}),col_type:'movie_2',extra:{lineVisible:false,pageTitle:(m.code||m.title||'影片')}};}
  function list(url,sec,p){var first=C.fetchHtml(url),target=C.paginatedUrl(url,p,first),html=p===1?first:C.fetchHtml(target);return{url:target,html:html,items:C.parseMovies(html,sec)};}

  R.home=function(){
    var d=[],p=curPage(),sec=getMyVar('myav_home_section','normal'),url=C.sectionUrl(sec),res=list(url,sec,p),i;
    if(p===1){
      d.push({title:'MyAv',desc:C.sectionName(sec)+'资料库 · 磁力 · 预览 · 第三方播放',img:C.appIcon,pic_url:C.appIcon,url:'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false}});
      d.push(stateBtn('有码','normal',sec,'myav_home_section'));d.push(stateBtn('欧美','western',sec,'myav_home_section'));d.push(stateBtn('国产','domestic',sec,'myav_home_section'));d.push(stateBtn('无码','uncensored',sec,'myav_home_section'));
      d.push(actionIcon('搜索',A+'search.svg',C.page('myavSearch',{})));
      d.push(actionIcon('筛选',A+'filter.svg',C.page('myavFilters',{})));
      d.push(actionIcon('分类',A+'category.svg',C.page('myavIndices',{})));
      d.push(actionIcon('排行',A+'rank.svg',C.page('myavRankings',{})));
      d.push(actionIcon('收藏',A+'favorite.svg',C.page('myavFavorites',{})));
      d.push(actionIcon('历史',A+'history.svg',C.page('myavHistory',{})));
      d.push(actionIcon('更多',A+'more.svg',C.page('myavMore',{})));
      d.push(actionIcon('设置',A+'settings.svg',C.page('myavSettings',{})));
      d.push(section(C.sectionName(sec)+' · 最新更新','原站实时数据'));
    }
    if(!res.items.length)d.push(empty('当前频道暂无可显示内容','页面地址：'+res.url));
    for(i=0;i<res.items.length;i++)d.push(card(res.items[i],sec));
    setResult(d);
  };

  R.search=function(){
    var d=[],p=curPage(),kind=getMyVar('myav_search_kind','normal'),kw=getMyVar('myav_search_kw',''),xs=[['有码','normal'],['欧美','western'],['国产','domestic']],i,res;
    try{if(MY_KEYWORD)kw=S(MY_KEYWORD);}catch(e){}kw=S(kw).trim();
    if(p===1){
      setPageTitle('搜索');
      for(i=0;i<xs.length;i++)d.push(stateBtn(xs[i][0],xs[i][1],kind,'myav_search_kind'));
      d.push({title:kw||'',desc:'',url:"(function(){var q=String(input||'').trim();putMyVar('myav_search_kw',q);refreshPage(false);return 'hiker://empty';})()",col_type:'input',extra:{defaultValue:kw,hint:'输入关键词',lineVisible:false}});
      d.push({title:'番号 / 标题 / 演员 / 片商 / TAG',desc:kw?'正在搜索：'+kw:'输入后直接提交，结果在当前页刷新',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});
    }
    if(!kw){setResult(d);return;}
    res=C.search(kind,kw,p);
    if(!res.items.length)d.push(empty('没有搜索结果','若原站有结果请继续反馈关键词'));
    for(i=0;i<res.items.length;i++)d.push(card(res.items[i],kind));
    setResult(d);
  };

  R.indexList=function(){
    var d=[],p=curPage(),url=dec(P('u','')),name=dec(P('name','分类索引')),sec=P('sec','');if(!url){setResult([empty('缺少索引地址','')]);return;}
    if(!sec)sec=C.sectionForIndex(url,name);var first=C.fetchHtml(url),target=C.paginatedUrl(url,p,first),html=p===1?first:C.fetchHtml(target),items=C.parseIndexEntries(html,target,name),i,x,params;
    if(p===1){setPageTitle(name);d.push(section(name,'原站完整分页索引 · 点击进入实体页'));}
    if(!items.length)d.push(empty('当前页未识别到索引条目','地址：'+target));
    for(i=0;i<items.length;i++){
      x=items[i];params={u:x.href,name:x.text,sec:x.section||sec,etype:C.entityType(name)};if(x.rawImg)params.img=x.rawImg;
      if(x.img)d.push({title:x.text,desc:'查看资料与相关作品',img:x.img,pic_url:x.img,url:C.page('myavList',params),col_type:'movie_2',extra:{lineVisible:false,pageTitle:x.text}});
      else d.push({title:x.text,url:C.page('myavList',params),col_type:'flex_button',extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R._test5BaseList=R.list;
  R.list=function(){
    var url=dec(P('u',''));if(!/\/t(?:\d+)?\//i.test(url)){return R._test5BaseList();}
    var d=[],p=curPage(),name=dec(P('name','分类')),sec=P('sec','normal'),fallbackImg=dec(P('img','')),etype=P('etype',''),metaHtml=C.fetchHtml(url),meta=C.entityMeta(metaHtml,url,name,fallbackImg,etype),key='myav_entity_'+C.simpleHash(url),current=getMyVar(key,url),first=current===url?metaHtml:C.fetchHtml(current),target=C.paginatedUrl(current,p,first),html=p===1?first:C.fetchHtml(target),items=C.parseMovies(html,sec),i,f;
    if(p===1){
      setPageTitle(name);
      d.push({title:name,desc:(meta.count?meta.count+' 部作品 · ':'')+meta.typeLabel+' · MyAv 原站实体页',img:meta.img||C.appIcon,pic_url:meta.img||C.appIcon,url:'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false}});
      if(meta.filters&&meta.filters.length){
        d.push(section('资源筛选','原站实时筛选'));
        for(i=0;i<meta.filters.length;i++){f=meta.filters[i];d.push(chip(((current===f.href||(current===url&&f.text==='全部'))?'● ':'')+f.text,$('#noLoading#').lazyRule(function(k,u){putMyVar(k,u);refreshPage(false);return'hiker://empty';},key,f.href)));}
      }
      d.push(section('作品列表',meta.count?meta.count+' 部作品':'原站相关作品'));
    }
    if(!items.length)d.push(empty('当前筛选暂无作品','地址：'+target));
    for(i=0;i<items.length;i++)d.push(card(items[i],sec));
    setResult(d);
  };

  R.settings=function(){var d=[],boot=R.bootstrapUrl;setPageTitle('MyAv 设置');d.push(section('运行状态','Test 通道 · 自用远程版'));d.push({title:'版本',desc:R.version+' · Build '+R.build,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'实体页',desc:'/t/ 女优 / 男优 / 片商 / TAG：头像、作品数、原站筛选、分页作品流',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'搜索输入',desc:'短提示输入框，释放实际输入空间',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'重新发现站点导航',desc:'清除首页导航缓存并重新读取原站菜单',url:$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'检查 Test 更新',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10105',{headers:{'Cache-Control':'no-cache'}},10105);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'回退上一 Test',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10105',{headers:{'Cache-Control':'no-cache'}},10105);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});setResult(d);};
})(MyAvRemoteRuntime,MyAvCore);
