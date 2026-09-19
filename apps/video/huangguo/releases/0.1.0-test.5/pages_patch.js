/* 黄果短剧 0.1.0-test.5 Pages patch - compact search + Test5 diagnostics */
var HuangGuoPagesV5=(function(){
  var B=HuangGuoPagesV1,C=HuangGuoCoreV1,U=HuangGuoUIV1,D=U.design;
  var HOME='huangguo_home_tab_v1';
  var HOME_TABS=[['recommend','推荐'],['newest','最新'],['ai','AI短剧'],['manju','AI漫剧'],['face','AI换脸'],['magic','AI魔改']];
  function searchInput(home){
    return{title:'搜索',col_type:'input',url:home?"(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('huangguo_search_kw_v1',w);return 'hiker://page/hgdramaSearch?rule=&simple=true&kw='+encodeURIComponent(w);})()":"(function(){var w=String(input||'').trim();putMyVar('huangguo_search_kw_v1',w);if(w)$.require('hgdrama').saveSearch(w);refreshPage(false);return 'hiker://empty';})()",extra:{defaultValue:home?'':C.pageParam('kw',getMyVar('huangguo_search_kw_v1','')),titleVisible:true,onChange:$.toString(function(){})}};
  }
  function homeHeader(d){
    d.push(searchInput(true));
    var cur=getMyVar(HOME,'recommend')||'recommend';
    for(var i=0;i<HOME_TABS.length;i++)d.push(U.chip(HOME_TABS[i][1],cur===HOME_TABS[i][0],U.state(HOME,HOME_TABS[i][0]),'scroll_button'));
    d.push(U.line());
    d.push(U.quick('片库',D.icons.library,U.page('hgdramaLibrary')));
    d.push(U.quick('榜单',D.icons.rank,U.page('hgdramaRank')));
    d.push(U.quick('专题',D.icons.topic,U.page('hgdramaTopics')));
    d.push(U.quick('我的',D.icons.mine,U.page('hgdramaMine')));
    d.push(U.line());
  }
  function home(){
    var d=[],pg=Number(MY_PAGE||1),tab=getMyVar(HOME,'recommend')||'recommend';
    setPageTitle('黄果短剧');
    try{
      if(pg===1){
        homeHeader(d);
        var h=C.getHistory().slice(0,6);
        if(h.length){d.push(U.section('继续观看',h.length+' 部最近记录'));for(var k=0;k<h.length;k++)d.push(U.card({url:h[k].url,title:h[k].title,img:h[k].cover,ep:h[k].episode},'movie_3'));d.push(U.line());}
        var name='推荐';for(var n=0;n<HOME_TABS.length;n++)if(HOME_TABS[n][0]===tab)name=HOME_TABS[n][1];
        d.push(U.section(name,'第 '+pg+' 页'));
      }
      var list=HuangGuoProviderV1.home(tab,pg);
      for(var i=0;i<list.length;i++)d.push(U.card(list[i]));
      if(!list.length)d.push(U.empty('当前暂无内容','可切换其它频道或稍后重试'));
    }catch(e){d.push(U.empty('首页加载失败',String(e.message||e)));}
    setResult(d);
  }
  function search(){
    var d=[],pg=Number(MY_PAGE||1),q=C.clean(C.pageParam('kw',getMyVar('huangguo_search_kw_v1','')));
    if(q)putMyVar('huangguo_search_kw_v1',q);
    setPageTitle('搜索');d.push(searchInput(false));
    if(pg>1){setResult(d);return;}
    try{
      if(!q){
        var h=C.searchHistory();
        if(h.length){d.push(U.section('最近搜索','点击直接搜索'));for(var i=0;i<h.length;i++)d.push(U.chip(h[i],false,$('#noLoading#').lazyRule(function(x){putMyVar('huangguo_search_kw_v1',x);refreshPage(false);return'hiker://empty';},h[i]),'flex_button'));}
        else d.push(U.empty('输入关键词开始搜索','支持剧名和关键词'));
        setResult(d);return;
      }
      C.saveSearch(q);
      var list=HuangGuoProviderV1.search(q,1);
      d.push(U.section('搜索结果',list.length+' 条'));
      for(i=0;i<list.length;i++)d.push(U.card(list[i]));
      if(!list.length)d.push(U.empty('没有找到相关短剧','尝试缩短关键词'));
    }catch(e){d.push(U.empty('搜索失败',String(e.message||e)));}
    setResult(d);
  }
  function settings(){
    var d=[],ep='';try{ep=C.getEndpoint(false)||'未获取';}catch(e){ep='未获取';}
    setPageTitle('黄果短剧设置');
    d.push(U.section('显示',''));
    d.push({title:'海报布局',desc:getItem('huangguo_card_layout_v1','movie_3')==='movie_2'?'双列横卡':'三列竖海报',url:'select://'+JSON.stringify({title:'海报布局',options:['三列竖海报','双列横卡'],col:2,js:"var v=input==='双列横卡'?'movie_2':'movie_3';setItem('huangguo_card_layout_v1',v);refreshPage(false);'hiker://empty'"}),col_type:'text_1'});
    d.push(U.line());d.push(U.section('线路','当前：'+ep));
    d.push({title:'重新检测并切换线路',desc:'仅在当前线路失效时使用',url:$('#noLoading#').lazyRule(function(){var m=$.require('hgdrama');m.invalidateEndpoint();var e=m.discoverEndpoint();refreshPage(false);return e?'toast://已切换：'+e:'toast://未找到可用线路';}),col_type:'text_1'});
    d.push(U.line());d.push(U.section('本地数据',''));
    d.push({title:'清空搜索记录',url:$('#noLoading#').lazyRule(function(){$.require('hgdrama').clearLocal('search');return'toast://已清空';}),col_type:'text_1'});
    d.push({title:'清空观看历史',url:$('#noLoading#').lazyRule(function(){$.require('hgdrama').clearLocal('history');return'toast://已清空';}),col_type:'text_1'});
    d.push(U.line());var dg=C.getDiag();
    d.push(U.section('诊断','Test 0.1.0-test.5 · Build 10105'));
    d.push({title:'最近阶段：'+C.mask(dg.stage||'暂无'),desc:[dg.origin||'',dg.error||'',dg.extra&&dg.extra.route?'路由 '+dg.extra.route:''].filter(Boolean).join(' · '),url:'hiker://empty',col_type:'long_text'});
    setResult(d);
  }
  return{version:'0.1.0-test.5',home:home,library:B.library,rank:B.rank,topics:B.topics,listing:B.listing,search:search,detail:B.detail,mine:B.mine,settings:settings};
})();
