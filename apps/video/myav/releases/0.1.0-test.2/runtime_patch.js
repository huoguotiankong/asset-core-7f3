/* MyAv 0.1.0-test.2 - runtime/image UI patch */
(function(R,C){
  if(!R||!C)throw new Error('MyAv runtime/core missing for Test2 patch');
  R.version='0.1.0-test.2';
  R.build=10102;
  R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v2_b10102.js';
  R.appIcon=C.appIcon;

  R.home=function(){
    var d=[],p=1;try{p=parseInt(MY_PAGE,10)||1;}catch(e){p=1;}
    var sec=getMyVar('myav_home_section','normal'),url=C.sectionUrl(sec),baseHtml=C.fetchHtml(url),target=C.paginatedUrl(url,p,baseHtml),html=p===1?baseHtml:C.fetchHtml(target),items=C.parseMovies(html,sec),i,m,ds,flags;
    function stateButton(title,id){return{title:(sec===id?'● ':'')+title,url:$('#noLoading#').lazyRule(function(v){putMyVar('myav_home_section',v);refreshPage(false);return'hiker://empty';},id),col_type:'scroll_button',extra:{lineVisible:false}};}
    function tool(title,path){return{title:title,url:C.page(path,{}),col_type:'text_4',extra:{lineVisible:false}};}
    if(p===1){
      d.push({title:'MyAv',desc:'JAV 资料 · 磁力 · 第三方播放',img:C.appIcon,pic_url:C.appIcon,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});
      d.push(stateButton('有码','normal'));d.push(stateButton('欧美','western'));d.push(stateButton('国产','domestic'));d.push(stateButton('无码','uncensored'));
      d.push(tool('搜索','myavSearch'));d.push(tool('高级筛选','myavFilters'));d.push(tool('分类索引','myavIndices'));d.push(tool('排行榜','myavRankings'));
      d.push(tool('本地收藏','myavFavorites'));d.push(tool('浏览历史','myavHistory'));d.push(tool('更多站点','myavMore'));d.push(tool('设置','myavSettings'));
      d.push({title:'▌ 最新片源',desc:C.sectionName(sec)+' · 原站实时列表',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    }
    if(!items.length)d.push({title:'暂时没有解析到内容',desc:'HOME_PARSE · 页面已取得但未识别影片卡片\n'+target,url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}});
    for(i=0;i<items.length;i++){
      m=items[i];ds=[];flags=m.flags||[];if(m.code)ds.push(String(m.code).toUpperCase());if(m.date)ds.push(m.date);if(flags.length)ds.push(flags.join(' · '));
      d.push({title:m.title||m.code||'影片',desc:ds.join(' · '),img:m.img||'',pic_url:m.img||'',url:C.page('myavDetail',{u:m.href,code:m.code||''}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:(m.code||m.title||'影片')}});
    }
    setResult(d);
  };

  R.settings=function(){
    var d=[],boot=R.bootstrapUrl;setPageTitle('MyAv 设置');
    d.push({title:'▌ 运行信息',desc:'Test 通道 · 自用远程版',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'版本',desc:R.version+' · Build '+R.build,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'数据源',desc:C.base,url:'web://'+C.base+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'图片链',desc:'Test2 · lazy-load 真图优先 / href 聚合 / og:image 详情封面',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'重新获取首页导航',desc:'同时清除站点导航缓存',url:$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已重置';},C.homeCacheKey,C.homeCacheTsKey),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'检查 Test 更新',desc:'只检查当前 MyAv Test Remote Release',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10102',{headers:{'Cache-Control':'no-cache'}},10102);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'回退 Remote Release',desc:'可回退到上一 Test Release',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10102',{headers:{'Cache-Control':'no-cache'}},10102);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };
})(MyAvRemoteRuntime,MyAvCore);
