/* 麻豆传媒 Test3 - Chinese rule routing + quick icon + card hygiene patch */
(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined') throw new Error('Madou runtime unavailable');
  var C=MadouCore,R=MadouRemoteRuntime;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var ICON={
    search:ROOT+'assets/quick_search.svg',
    categories:ROOT+'assets/quick_categories.svg',
    favorite:ROOT+'assets/quick_favorite.svg',
    history:ROOT+'assets/quick_history.svg'
  };

  C.version='0.1.0-test.3';C.build=10103;
  R.version='0.1.0-test.3';R.build=10103;
  C.bootstrap=ROOT+'bootstrap_test_v3_b10103.js?v=10103';

  // Hiker page router does not decode a percent-encoded Chinese rule title here.
  // Keep rule empty so the page inherits the current mini-app context, matching
  // the already verified Chinese-title routing used by MDAI.
  C.page=function(path,params){
    var u='hiker://page/'+path+'?rule=&simple=true';
    params=params||{};
    for(var k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!==''){
      u+='&'+encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k]));
    }
    return u;
  };

  // Remove obvious navigation assets accidentally scored as video cards.
  var oldParse=C.parseCards;
  C.parseCards=function(html,base){
    var a=oldParse(html,base),out=[],seen={};
    for(var i=0;i<a.length;i++){
      var x=a[i]||{},t=C.cleanLabel(x.title||'');
      if(!t||/^(arrow|next|prev|previous|more|menu|home|返回|更多|上一页|下一页|首页)$/i.test(t))continue;
      if(/^(logo|favicon|loading)$/i.test(t))continue;
      if(!x.url||seen[x.url])continue;
      seen[x.url]=1;out.push(x);
    }
    return out;
  };

  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function routeCard(c){return C.page('madouDetail',{u:c.url});}
  function renderCards(d,cards,limit){
    limit=limit||cards.length;
    for(var i=0;i<cards.length&&i<limit;i++){
      var c=cards[i];
      add(d,{title:c.title,desc:c.desc||'',pic_url:c.img||'',img:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{id:'madou_card_'+c.url,lineVisible:false}});
    }
  }
  function quick(d,title,img,url){add(d,{title:title,img:img,pic_url:img,url:url,col_type:'icon_small_4',extra:{lineVisible:false}});}

  R.home=function(){
    try{setPageTitle('麻豆传媒');}catch(e){}
    var d=[],h=C.fetchHtml(C.base+'/',false);
    if(C.isBadHtml(h)){
      section(d,'麻豆传媒','原站暂时无法直接解析，可先确认网络或域名状态。');
      add(d,{title:'打开原站',desc:C.base,col_type:'text_1',url:'web://'+C.base+'/'});
      add(d,{title:'强制重新加载',col_type:'text_1',url:$(C.base).lazyRule(function(boot,u){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);MadouBoot.loadOnly();MadouCore.fetchHtml(u,true);refreshPage(false);return'toast://已重新请求';},C.bootstrap,C.base)});
      setResult(d);return;
    }

    var searchJs="'hiker://page/madouSearch?rule=&simple=true&kw='+encodeURIComponent(input)";
    quick(d,'搜索',ICON.search,'input://'+JSON.stringify({value:'',hint:'输入关键词',js:searchJs}));
    quick(d,'全部分类',ICON.categories,C.page('madouCategories'));
    quick(d,'本地收藏',ICON.favorite,C.page('madouFavorites'));
    quick(d,'浏览历史',ICON.history,C.page('madouHistory'));

    var menu=C.menu(h),i;
    for(i=0;i<menu.length&&i<14;i++)add(d,{title:menu[i].name,col_type:'scroll_button',url:C.page('madouList',{u:menu[i].url,page:'fypage',n:menu[i].name})});
    var cards=C.parseCards(h,C.base);
    section(d,'🔥 首页精选',cards.length?'已解析 '+cards.length+' 项，广告位默认不进入内容流。':'未识别到内容卡片，可从分类页继续。');
    renderCards(d,cards,18);
    if(cards.length>18)add(d,{title:'查看更多首页内容 ›',col_type:'text_1',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
    section(d,'工具','');
    add(d,{title:'⚙️ 设置与诊断',desc:R.version+' · Build '+R.build,col_type:'text_1',url:C.page('madouSettings')});
    add(d,{title:'🌐 原站网页',desc:C.base,col_type:'text_1',url:'web://'+C.base+'/'});
    setResult(d);
  };

  R.search=function(){
    var kw='';
    try{kw=String(MY_KEYWORD||'');}catch(e){}
    if(!kw)kw=C.param('kw','');
    var page=1;try{page=MY_PAGE||1;}catch(e2){}
    try{setPageTitle('搜索 · '+kw);}catch(e3){}
    var d=[],r=C.searchHtml(kw,page),cards=C.parseCards(r.html,r.url);
    renderCards(d,cards);
    if(!cards.length&&page===1){section(d,'没有匹配结果','可尝试更短关键词，或进入原站搜索。');add(d,{title:'🌐 原站打开',col_type:'text_1',url:'web://'+C.base+'/'});}
    setResult(d);
  };
})();
