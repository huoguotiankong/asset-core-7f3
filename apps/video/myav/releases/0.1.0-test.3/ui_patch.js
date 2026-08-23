/* MyAv 0.1.0-test.3 - product UI redesign */
(function(R,C){
  if(!R||!C)throw new Error('MyAv runtime/core missing for Test3 UI patch');
  R.version='0.1.0-test.3';
  R.build=10103;
  R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v3_b10103.js';

  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/assets/';
  function S(v){return v===undefined||v===null?'':String(v);}
  function dec(v){try{return decodeURIComponent(S(v));}catch(e){return S(v);}}
  function P(name,def){var v='';try{v=getParam(name,'');}catch(e){}return v?v:(def||'');}
  function curPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function line(title,desc){return{title:title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function section(title,desc){return line('▌ '+title,desc||'');}
  function empty(title,desc){return{title:title,desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function stateBtn(title,id,cur,key){return{title:(id===cur?'● ':'')+title,url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,id),col_type:'scroll_button',extra:{lineVisible:false}};}
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
      d.push({title:'收藏',url:C.page('myavFavorites',{}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'历史',url:C.page('myavHistory',{}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'更多',url:C.page('myavMore',{}),col_type:'text_4',extra:{lineVisible:false}});
      d.push({title:'设置',url:C.page('myavSettings',{}),col_type:'text_4',extra:{lineVisible:false}});
      d.push(section(C.sectionName(sec)+' · 最新更新','原站实时数据 · '+(sec==='western'?'欧美库':sec==='domestic'?'国产库':sec==='uncensored'?'无码流出筛选':'有码主库')));
    }
    if(!res.items.length)d.push(empty('当前频道暂无可显示内容','页面地址：'+res.url+'\n若原站有内容则属于 Parser 差异，请继续反馈截图。'));
    for(i=0;i<res.items.length;i++)d.push(card(res.items[i],sec));
    setResult(d);
  };

  function providerArea(d,code,sec){
    d.push(section('在线播放',sec==='western'||sec==='domestic'?'当前频道优先保留原站资料与磁力':'MissAV / 123AV / Jable'));
    if(sec==='western'||sec==='domestic'){d.push(line('第三方 JAV 播放仅用于番号型条目','欧美/国产条目编号体系不同，避免提交无效番号造成假失败。'));return;}
    if(!code){d.push(empty('没有识别到番号','暂时不能调用共享 JAV Playback'));return;}
    try{var sdk=JAVPlaybackManager.load('stable'),ps=sdk.providers(),i,p;for(i=0;i<ps.length;i++){p=ps[i];d.push({title:p.name,img:p.icon,pic_url:p.icon,url:sdk.providerUrl(p.id,code),col_type:'icon_small_3',extra:{lineVisible:false,pageTitle:p.name+' · '+code}});}}catch(e){d.push(empty('播放 SDK 暂不可用',S(e.message||e)));}
  }
  function linkRow(d,label,list){var i,x;if(!list||!list.length)return;d.push(section(label,''));for(i=0;i<list.length;i++){x=list[i];d.push({title:x.name,url:C.page('myavList',{u:x.href,name:x.name}),col_type:'flex_button',extra:{lineVisible:false}});}}

  R.detail=function(){
    var d=[],url=dec(P('u','')),sec=P('sec','');if(!url){setResult([empty('缺少影片地址','')]);return;}
    var x=C.detail(url);if(!sec)sec=x.section||C.detailFamily(url);var saved=C.isFavorite(x.key),meta=[];if(x.code)meta.push(S(x.code).toUpperCase());if(x.date)meta.push(x.date);if(x.duration)meta.push(x.duration);
    setPageTitle(x.code||x.title||'影片详情');C.touchHistory({key:x.key,href:x.href,title:x.title,code:x.code,date:x.date,img:x.img,rawImg:x.cover,section:sec,flags:[]});
    d.push({title:x.title||x.code||'影片详情',desc:meta.join(' · '),img:x.img||C.appIcon,pic_url:x.img||C.appIcon,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(x.code)d.push({title:'番号  '+S(x.code).toUpperCase(),url:'copy://'+x.code,col_type:'scroll_button',extra:{lineVisible:false}});
    if(x.date)d.push({title:'日期  '+x.date,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});
    if(x.duration)d.push({title:'时长  '+x.duration,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});
    providerArea(d,x.code,sec);
    d.push(section('快捷操作','磁力、预览与收藏集中在这里'));
    d.push(actionIcon(x.magnets&&x.magnets.length?'磁力 '+x.magnets.length:'磁力',A+'magnet.svg',C.page('myavMagnets',{u:url})));
    d.push(actionIcon(x.samples&&x.samples.length?'预览 '+x.samples.length:'预览',A+'preview.svg',C.page('myavPreview',{u:url})));
    d.push(actionIcon(saved?'已收藏':'收藏',A+'favorite.svg',$('#noLoading#').lazyRule(function(item){var M=$.require('myav'),ok=M.toggleFavorite(item);refreshPage(false);return'toast://'+(ok?'已加入本地收藏':'已取消本地收藏');},{key:x.key,href:x.href,title:x.title,code:x.code,date:x.date,img:x.img,rawImg:x.cover,section:sec,flags:[]})));
    d.push(actionIcon('原站',C.appIcon,'web://'+url));
    if(x.story){d.push(section('简介',''));d.push(line(x.story,''));}
    if(x.videos&&x.videos.length){d.push(section('原站预览视频','识别到 '+x.videos.length+' 条媒体地址'));d.push({title:'▶ 播放原站预览',desc:'优先打开第一条；完整图片预览请使用上方“预览”',url:x.videos[0]+'#isVideo=true#',col_type:'text_1',extra:{lineVisible:false}});}
    d.push(section('影片资料',meta.join(' · ')||'原站资料'));
    if(x.code)d.push(line('番号',S(x.code).toUpperCase()));if(x.date)d.push(line('发行日期',x.date));if(x.duration)d.push(line('时长',x.duration));
    linkRow(d,'导演',x.director);linkRow(d,'片商',x.maker);linkRow(d,'系列',x.series);linkRow(d,'类别',x.category);linkRow(d,'演员',x.actors);linkRow(d,'男优',x.maleActors);linkRow(d,'标签',x.tags);
    setResult(d);
  };

  R.settings=function(){var d=[],boot=R.bootstrapUrl;setPageTitle('MyAv 设置');d.push(section('运行状态','Test 通道 · 自用远程版'));d.push(line('版本',R.version+' · Build '+R.build));d.push(line('数据源',C.base));d.push(line('频道协议','有码 /c · 欧美 /c4 · 国产 /c3 · 无码=有码动态筛选'));d.push({title:'重新发现站点导航',desc:'清除站点导航缓存并重新读取真实频道链接',url:$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'检查 Test 更新',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10103',{headers:{'Cache-Control':'no-cache'}},10103);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'回退上一 Test',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10103',{headers:{'Cache-Control':'no-cache'}},10103);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});setResult(d);};
})(MyAvRemoteRuntime,MyAvCore);
