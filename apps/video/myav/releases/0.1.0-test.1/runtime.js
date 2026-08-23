/* MyAv Remote Runtime 0.1.0-test.1 - native Hiker product/UI layer */
var MyAvRemoteRuntime=(function(){
  if(typeof MyAvCore!=='object')throw new Error('MyAvCore missing');
  var C=MyAvCore,R={};
  R.version='0.1.0-test.1';
  R.build=10101;
  R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v1_b10101.js';

  function s(v){return v===undefined||v===null?'':String(v);}
  function page(path,params){return C.page(path,params||{});}
  function empty(title,desc){return{title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function textButton(title,url){return{title:title,url:url,col_type:'text_4',extra:{lineVisible:false}};}
  function movieUrl(m){return page('myavDetail',{u:m.href,code:m.code||''});}
  function movieCard(m){var ds=[],flags=m.flags||[];if(m.code)ds.push(m.code.toUpperCase());if(m.date)ds.push(m.date);if(flags.length)ds.push(flags.join(' · '));return{title:m.title||m.code||'影片',desc:ds.join(' · '),img:m.img||'',pic_url:m.img||'',url:movieUrl(m),col_type:'movie_3',extra:{lineVisible:false,pageTitle:(m.code||m.title||'影片')}};}
  function renderMovies(d,items){var i;for(i=0;i<items.length;i++)d.push(movieCard(items[i]));}
  function safeDecode(v){try{return decodeURIComponent(s(v));}catch(e){return s(v);}}
  function param(name,def){var v='';try{v=getParam(name,'');}catch(e){v='';}return v?v:(def||'');}
  function currentPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function activeLabel(title,active){return active?'● '+title:title;}
  function setStateRefresh(key,value){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value);}
  function listForUrl(url,sec,p){var baseHtml=C.fetchHtml(url),target=C.paginatedUrl(url,p,baseHtml),html=p===1?baseHtml:C.fetchHtml(target),items=C.parseMovies(html,sec);return{html:html,url:target,items:items,hasNext:C.hasNext(html)};}
  function errorCard(stage,url,extra){return empty('暂时没有解析到内容',stage+' · '+(extra||'')+(url?'\n'+url:''));}

  function renderSectionTabs(d,key,current){var xs=[['有码','normal'],['欧美','western'],['国产','domestic'],['无码','uncensored']],i;for(i=0;i<xs.length;i++)d.push({title:activeLabel(xs[i][0],current===xs[i][1]),url:setStateRefresh(key,xs[i][1]),col_type:'scroll_button',extra:{lineVisible:false}});}

  function renderHomeTools(d){
    d.push(textButton('搜索',page('myavSearch',{})));
    d.push(textButton('高级筛选',page('myavFilters',{})));
    d.push(textButton('分类索引',page('myavIndices',{})));
    d.push(textButton('排行榜',page('myavRankings',{})));
    d.push(textButton('本地收藏',page('myavFavorites',{})));
    d.push(textButton('浏览历史',page('myavHistory',{})));
    d.push(textButton('更多站点',page('myavMore',{})));
    d.push(textButton('设置',page('myavSettings',{})));
  }

  R.home=function(){
    var d=[],p=currentPage(),sec=getMyVar('myav_home_section','normal'),url=C.sectionUrl(sec),res=listForUrl(url,sec,p);
    if(p===1){
      d.push({title:'MyAv',desc:'JAV 资料 · 磁力 · 第三方播放',img:'https://javlist.me/favicon.ico',pic_url:'https://javlist.me/favicon.ico',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});
      renderSectionTabs(d,'myav_home_section',sec);
      renderHomeTools(d);
      d.push(section('最新片源',C.sectionName(sec)+' · 原站实时列表'));
    }
    if(!res.items.length)d.push(errorCard('HOME_PARSE',res.url,'页面已取得但未识别影片卡片'));
    else renderMovies(d,res.items);
    setResult(d);
  };

  R.list=function(){
    var d=[],p=currentPage(),raw=param('u',''),url=safeDecode(raw),name=safeDecode(param('name','')),sec=param('sec','normal');
    if(!url){d.push(empty('缺少列表地址','请从分类、筛选、索引或详情进入'));setResult(d);return;}
    var res=listForUrl(url,sec,p);
    if(p===1){setPageTitle(name||'影片列表');d.push(section(name||'影片列表','MyAv 原站筛选结果'));}
    if(!res.items.length)d.push(errorCard('LIST_PARSE',res.url,'可能是索引页或站点结构发生变化'));else renderMovies(d,res.items);
    setResult(d);
  };

  function renderFilterGroup(d,title,list,currentUrl,stateKey){var i,x;if(!list||!list.length)return;d.push(section(title,'点击后在当前筛选页刷新，不叠加返回栈'));for(i=0;i<list.length;i++){x=list[i];d.push({title:activeLabel(x.text,x.href===currentUrl),url:$('#noLoading#').lazyRule(function(k,u){putMyVar(k,u);refreshPage(false);return'hiker://empty';},stateKey,x.href),col_type:(list.length>10?'flex_button':'scroll_button'),extra:{lineVisible:false}});}}

  R.filters=function(){
    var d=[],p=currentPage(),sec=getMyVar('myav_filter_section','normal'),stateKey='myav_filter_url_'+sec,root=C.sectionUrl(sec),url=getMyVar(stateKey,root),baseHtml=C.fetchHtml(url),target=C.paginatedUrl(url,p,baseHtml),html=p===1?baseHtml:C.fetchHtml(target),groups,items;
    if(p===1){setPageTitle('高级筛选');renderSectionTabs(d,'myav_filter_section',sec);groups=C.filterGroups(baseHtml,url);renderFilterGroup(d,'年份',groups.years,url,stateKey);renderFilterGroup(d,'标签',groups.tags,url,stateKey);renderFilterGroup(d,'资源状态',groups.other,url,stateKey);d.push(section('筛选结果',C.sectionName(sec)));}
    items=C.parseMovies(html,sec);if(!items.length)d.push(errorCard('FILTER_PARSE',target,'当前筛选暂无结果或解析失败'));else renderMovies(d,items);setResult(d);
  };

  R.indices=function(){
    var d=[],defs=C.indexDefs(),i,u;setPageTitle('分类索引');d.push(section('标签分类','片商 / 女优 / 男优 / TAG'));for(i=0;i<defs.length;i++){u=C.indexUrl(defs[i].label);d.push({title:defs[i].name,desc:u?'读取原站完整索引':'入口待站点返回',url:u?page('myavIndexList',{u:u,name:defs[i].name}):'toast://未找到 '+defs[i].name+' 入口',col_type:'text_3',extra:{lineVisible:false}});}setResult(d);
  };

  R.indexList=function(){
    var d=[],p=currentPage(),url=safeDecode(param('u','')),name=safeDecode(param('name','分类索引'));if(!url){d.push(empty('缺少索引地址',''));setResult(d);return;}var first=C.fetchHtml(url),target=C.paginatedUrl(url,p,first),html=p===1?first:C.fetchHtml(target),items=C.parseIndex(html,target),i,x;if(p===1){setPageTitle(name);d.push(section(name,'原站完整分页索引'));}if(!items.length)d.push(errorCard('INDEX_PARSE',target,'未识别索引项'));for(i=0;i<items.length;i++){x=items[i];d.push({title:x.text,url:page('myavList',{u:x.href,name:x.text}),col_type:'flex_button',extra:{lineVisible:false}});}setResult(d);
  };

  R.rankings=function(){
    var d=[],p=currentPage(),root=C.rankRoot(),rootHtml=C.fetchHtml(root),modes=C.rankModes(rootHtml),current=getMyVar('myav_rank_url',modes.length?modes[0].href:root),i,target,html,items;
    if(p===1){setPageTitle('排行榜');d.push(section('热门排名','TOP20 / 周榜 / 月榜'));for(i=0;i<modes.length;i++)d.push({title:activeLabel(modes[i].text,current===modes[i].href),url:setStateRefresh('myav_rank_url',modes[i].href),col_type:'scroll_button',extra:{lineVisible:false}});}
    var first=current===root?rootHtml:C.fetchHtml(current);target=C.paginatedUrl(current,p,first);html=p===1?first:C.fetchHtml(target);items=C.parseMovies(html,'normal');for(i=0;i<items.length;i++){items[i].title='#'+(((p-1)*20)+i+1)+'  '+items[i].title;}if(!items.length)d.push(errorCard('RANK_PARSE',target,''));else renderMovies(d,items);setResult(d);
  };

  function searchKindTabs(d,kind){var xs=[['有码','normal'],['欧美','western'],['国产','domestic']],i;for(i=0;i<xs.length;i++)d.push({title:activeLabel(xs[i][0],kind===xs[i][1]),url:setStateRefresh('myav_search_kind',xs[i][1]),col_type:'scroll_button',extra:{lineVisible:false}});}
  R.search=function(){
    var d=[],p=currentPage(),kind=getMyVar('myav_search_kind','normal'),kw=getMyVar('myav_search_kw','');try{if(MY_KEYWORD)kw=s(MY_KEYWORD);}catch(e){}kw=s(kw).trim();if(p===1){setPageTitle('搜索');searchKindTabs(d,kind);d.push({title:kw||'输入番号 / 标题 / 演员 / 片商 / TAG',desc:'提交后在当前页面刷新',url:"(function(){var q=String(input||'').trim();putMyVar('myav_search_kw',q);refreshPage(false);return 'hiker://empty';})()",col_type:'input',extra:{defaultValue:kw,hint:'番号 / 标题 / 演员 / 片商 / TAG',lineVisible:false}});if(kw)d.push(section('搜索结果',kw+' · '+C.sectionName(kind)));}
    if(!kw){d.push(empty('支持原站三类搜索','有码 / 欧美 / 国产，可搜索番号、标题以及站点支持的演员/片商/TAG'));setResult(d);return;}
    var res=C.search(kind,kw,p);if(!res.items.length)d.push(errorCard('SEARCH_'+res.error,res.url,'若原站搜索表单更新，会保留诊断而不伪造结果'));else renderMovies(d,res.items);setResult(d);
  };

  function linkButtons(d,title,list){var i,x;if(!list||!list.length)return;d.push(section(title,''));for(i=0;i<list.length;i++){x=list[i];d.push({title:x.name,url:page('myavList',{u:x.href,name:x.name}),col_type:'flex_button',extra:{lineVisible:false}});}}
  function renderPlayback(d,code){
    d.push(section('第三方在线播放','MissAV / 123AV / Jable · 共享播放 SDK'));
    if(!code){d.push(empty('缺少可用于匹配的番号','该条目无法调用第三方番号播放'));return;}
    try{if(typeof JAVPlaybackManager!=='object')throw new Error('manager missing');var sdk=JAVPlaybackManager.load('stable'),ps=sdk.providers(),i,p;for(i=0;i<ps.length;i++){p=ps[i];d.push({title:p.name,img:p.icon,pic_url:p.icon,url:sdk.providerUrl(p.id,code),col_type:'icon_small_3',extra:{lineVisible:false,pageTitle:p.name+' · '+code}});}}catch(e){d.push(empty('第三方播放 SDK 暂不可用',s(e.message||e)));}
  }
  function renderMagnetItems(d,mags,limit){var max=limit?Math.min(limit,mags.length):mags.length,i,m,tags;for(i=0;i<max;i++){m=mags[i];tags=[];if(m.hd)tags.push('高清');if(m.sub)tags.push('字幕');d.push({title:(tags.length?'['+tags.join(' · ')+'] ':'')+(m.title||'磁力资源'),desc:[m.size,m.date].filter(function(x){return!!x;}).join(' · ')+'\n点击复制 · 长按发送到云盘小程序',url:'copy://'+m.link,col_type:'text_1',extra:{lineVisible:false,longClick:C.magnetLongClicks(m.link)}});}return max;}

  R.detail=function(){
    var d=[],url=safeDecode(param('u',''));if(!url){d.push(empty('缺少影片地址',''));setResult(d);return;}var x=C.detail(url),saved=C.isFavorite(x.key),desc=[x.code?x.code.toUpperCase():'',x.date,x.duration].filter(function(v){return!!v;}).join(' · ');setPageTitle(x.code||'影片详情');C.touchHistory({key:x.key,href:x.href,title:x.title,code:x.code,date:x.date,img:x.img,rawImg:x.cover,section:'normal',flags:[]});
    d.push({title:x.title||x.code||'影片详情',desc:desc,img:x.img,pic_url:x.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    renderPlayback(d,x.code);
    d.push(textButton(x.magnets.length?'磁力 '+x.magnets.length:'磁力',page('myavMagnets',{u:url})));
    d.push(textButton(x.samples.length?'预览 '+x.samples.length:'预览',page('myavPreview',{u:url})));
    d.push(textButton(saved?'已收藏':'收藏',$('#noLoading#').lazyRule(function(item){var M=$.require('myav'),ok=M.toggleFavorite(item);refreshPage(false);return'toast://'+(ok?'已加入本地收藏':'已取消本地收藏');},{key:x.key,href:x.href,title:x.title,code:x.code,date:x.date,img:x.img,rawImg:x.cover,section:'normal',flags:[]})));
    d.push(textButton('原站','web://'+url));
    if(x.videos&&x.videos.length){d.push(section('原站预览视频','检测到 '+x.videos.length+' 条媒体地址'));for(var vi=0;vi<Math.min(3,x.videos.length);vi++)d.push({title:'播放预览 '+(vi+1),url:x.videos[vi]+'#isVideo=true#',col_type:'text_1',extra:{lineVisible:false}});}
    d.push(section('档案',desc||'原站资料'));if(x.code)d.push({title:'番号 · '+x.code.toUpperCase(),url:'copy://'+x.code,col_type:'scroll_button',extra:{lineVisible:false}});if(x.date)d.push({title:'日期 · '+x.date,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});if(x.duration)d.push({title:'时长 · '+x.duration,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});
    linkButtons(d,'导演',x.director);linkButtons(d,'片商',x.maker);linkButtons(d,'系列',x.series);linkButtons(d,'类别',x.category);linkButtons(d,'演员',x.actors);linkButtons(d,'男优',x.maleActors);linkButtons(d,'TAG',x.tags);
    if(x.story)d.push({title:x.story,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    d.push(section('磁力快速预览',x.magnets.length?x.magnets.length+' 条资源':'当前详情未解析到磁力'));if(x.magnets.length){renderMagnetItems(d,x.magnets,3);if(x.magnets.length>3)d.push({title:'查看全部 '+x.magnets.length+' 条磁力',url:page('myavMagnets',{u:url}),col_type:'text_center_1',extra:{lineVisible:false}});}else d.push(empty('暂无磁力','新片可能尚未发布资源；不会把“无资源”伪装成解析成功'));
    if(x.samples&&x.samples.length){d.push(section('预览图片',x.samples.length+' 张'));for(var i=0;i<Math.min(6,x.samples.length);i++)d.push({title:'预览 '+(i+1),img:C.image(x.samples[i],url),pic_url:C.image(x.samples[i],url),url:'pics://'+x.samples[i],col_type:'pic_3',extra:{lineVisible:false}});if(x.samples.length>6)d.push({title:'查看全部 '+x.samples.length+' 张',url:page('myavPreview',{u:url}),col_type:'text_center_1',extra:{lineVisible:false}});}
    setResult(d);
  };

  R.magnets=function(){var d=[],url=safeDecode(param('u',''));if(!url){d.push(empty('缺少影片地址',''));setResult(d);return;}var x=C.detail(url);setPageTitle('磁力 · '+(x.code||''));d.push(section('磁力资源',x.magnets.length+' 条 · 点击复制，长按调用云盘'));if(!x.magnets.length)d.push(empty('暂无磁力资源','可打开原站确认是否尚未发布'));else renderMagnetItems(d,x.magnets,0);setResult(d);};

  R.preview=function(){var d=[],url=safeDecode(param('u',''));if(!url){d.push(empty('缺少影片地址',''));setResult(d);return;}var x=C.detail(url);setPageTitle('预览 · '+(x.code||''));d.push(section('预览图片',x.samples.length+' 张'));if(!x.samples.length)d.push(empty('暂无预览图片','原站可能需要脚本展开，当前已尝试渲染后页面'));for(var i=0;i<x.samples.length;i++){var iu=C.image(x.samples[i],url);d.push({title:(x.code||'预览')+' · '+(i+1)+'/'+x.samples.length,img:iu,pic_url:iu,url:'pics://'+x.samples[i],col_type:'pic_1_full',extra:{lineVisible:false}});}setResult(d);};

  R.favorites=function(){var d=[],a=C.favoriteList(),i;setPageTitle('本地收藏');d.push(section('本地收藏',a.length+' 条 · 保存在手机本地'));if(!a.length)d.push(empty('还没有收藏','在影片详情页点击“收藏”即可'));for(i=0;i<a.length;i++)d.push(movieCard(a[i]));setResult(d);};
  R.history=function(){var d=[],a=C.historyList(),i;setPageTitle('浏览历史');d.push(section('最近浏览',a.length+' 条 · 本地记录'));if(!a.length)d.push(empty('暂无浏览历史','打开影片详情后会自动记录'));for(i=0;i<a.length;i++)d.push(movieCard(a[i]));setResult(d);};

  R.more=function(){var d=[],xs=C.externalSites(),i;setPageTitle('更多站点');d.push(section('MyAv 相关入口','首版保留原站外围独立站入口；主站资料库已原生化'));for(i=0;i<xs.length;i++)d.push({title:xs[i].name,desc:xs[i].url,url:'web://'+xs[i].url,col_type:'text_1',extra:{lineVisible:false}});d.push(empty('视频在线 / 韩漫','原站导航目前没有稳定直链可由普通 HTML 解析，Test1 不伪造入口；后续按实机与站点链继续原生化'));setResult(d);};

  R.settings=function(){var d=[],boot=R.bootstrapUrl;setPageTitle('MyAv 设置');d.push(section('运行信息','Test 通道 · 自用远程版'));d.push({title:'版本',desc:R.version+' · Build '+R.build,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'数据源',desc:C.base,url:'web://'+C.base+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'重新获取首页导航',desc:'清除 20 分钟导航缓存，下次请求重新发现站点入口',url:$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已重置';},C.homeCacheKey,C.homeCacheTsKey),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'检查 Test 更新',desc:'只检查当前 MyAv Test Remote Release',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10101',{headers:{'Cache-Control':'no-cache'}},10101);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'回退 Remote Release',desc:'仅在后续存在 previous release 时生效',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10101',{headers:{'Cache-Control':'no-cache'}},10101);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});setResult(d);};

  R.toggleFavorite=function(item){return C.toggleFavorite(item);};
  R.core=function(){return C;};
  R.module=function(){return{home:R.home,list:R.list,detail:R.detail,magnets:R.magnets,preview:R.preview,filters:R.filters,indices:R.indices,indexList:R.indexList,rankings:R.rankings,search:R.search,favorites:R.favorites,history:R.history,more:R.more,settings:R.settings,toggleFavorite:R.toggleFavorite,core:R.core};};
  return R;
})();
