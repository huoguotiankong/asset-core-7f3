/* MyAv 0.1.0-test.4 - category center + magnet UI refinement */
(function(R,C){
  if(!R||!C)throw new Error('MyAv runtime/core missing for Test4 UI patch');
  R.version='0.1.0-test.4';
  R.build=10104;
  R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v4_b10104.js';
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/assets/';
  function S(v){return v===undefined||v===null?'':String(v);}
  function dec(v){try{return decodeURIComponent(S(v));}catch(e){return S(v);}}
  function P(name,def){var v='';try{v=getParam(name,'');}catch(e){}return v?v:(def||'');}
  function curPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(title,desc){return{title:title,desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function chip(title,url){return{title:title,url:url,col_type:'scroll_button',extra:{lineVisible:false}};}
  function block(title,url){return{title:title,url:url,col_type:'text_3',extra:{lineVisible:false}};}
  function routeList(label,href,sec){return C.page('myavList',{u:href,name:label,sec:sec||'normal'});}
  function menuSec(label,href){return C.sectionForIndex(href,label);}

  R.indices=function(){
    var d=[],g=C.menuGroups(),i,x,ext=C.externalSites();setPageTitle('分类中心');
    d.push(section('资源频道','主库与外围站点'));
    d.push(block('有码',routeList('有码',C.sectionUrl('normal'),'normal')));
    d.push(block('欧美',routeList('欧美',C.sectionUrl('western'),'western')));
    d.push(block('国产',routeList('国产',C.sectionUrl('domestic'),'domestic')));
    d.push(block('无码',routeList('无码',C.sectionUrl('uncensored'),'uncensored')));
    for(i=0;i<ext.length;i++){
      if(ext[i].name==='MyAv原站'||ext[i].name==='欧美独立站')continue;
      d.push(block(ext[i].name,'web://'+ext[i].url));
    }
    d.push(block('视频在线','toast://原站当前未暴露稳定直链，暂不伪造入口'));
    d.push(block('韩漫','toast://原站当前未暴露稳定直链，暂不伪造入口'));

    d.push(section('标签分类','完整读取原站片商 / 女优 / 男优 / TAG 索引'));
    if(!g.tags.length)d.push(empty('标签分类暂未发现','可在设置中“重新发现站点导航”后再试'));
    for(i=0;i<g.tags.length;i++){x=g.tags[i];d.push(block(x.text,C.page('myavIndexList',{u:x.href,name:x.text,sec:menuSec(x.text,x.href)})));}

    d.push(section('有码热门','原站热门专题'));
    for(i=0;i<g.hot.length;i++){x=g.hot[i];d.push(block(x.text,routeList(x.text,x.href,'normal')));}

    d.push(section('片商新番','原站当前重点片商'));
    for(i=0;i<g.studios.length;i++){x=g.studios[i];d.push(block(x.text,routeList(x.text,x.href,'normal')));}

    d.push(section('发现工具','排行与三类搜索'));
    d.push(block('排行榜',C.page('myavRankings',{})));
    var searchPage=C.page('myavSearch',{});
    d.push(block('有码查询',$('#noLoading#').lazyRule(function(kind,u){putMyVar('myav_search_kind',kind);return u;},'normal',searchPage)));
    d.push(block('欧美查询',$('#noLoading#').lazyRule(function(kind,u){putMyVar('myav_search_kind',kind);return u;},'western',searchPage)));
    d.push(block('国产查询',$('#noLoading#').lazyRule(function(kind,u){putMyVar('myav_search_kind',kind);return u;},'domestic',searchPage)));
    setResult(d);
  };

  R.indexList=function(){
    var d=[],p=curPage(),url=dec(P('u','')),name=dec(P('name','分类索引')),sec=P('sec','');if(!url){setResult([empty('缺少索引地址','')]);return;}
    if(!sec)sec=C.sectionForIndex(url,name);var first=C.fetchHtml(url),target=C.paginatedUrl(url,p,first),html=p===1?first:C.fetchHtml(target),items=C.parseIndexEntries(html,target,name),i,x;
    if(p===1){setPageTitle(name);d.push(section(name,'原站完整分页索引 · 点击条目进入对应影片列表'));}
    if(!items.length)d.push(empty('当前页未识别到索引条目','地址：'+target+'\n若原站页面正常，请继续反馈该分类名称。'));
    for(i=0;i<items.length;i++){
      x=items[i];
      if(x.img)d.push({title:x.text,desc:'查看相关影片',img:x.img,pic_url:x.img,url:routeList(x.text,x.href,x.section||sec),col_type:'movie_2',extra:{lineVisible:false,pageTitle:x.text}});
      else d.push({title:x.text,url:routeList(x.text,x.href,x.section||sec),col_type:'flex_button',extra:{lineVisible:false}});
    }
    setResult(d);
  };

  function magFilterUrl(k,v){return $('#noLoading#').lazyRule(function(key,val){putMyVar(key,val);refreshPage(false);return'hiker://empty';},k,v);}
  function magTitle(m,x,i){var tags=[];if(m.sub)tags.push('字幕');if(m.hd)tags.push('高清');return(tags.length?'['+tags.join(' · ')+'] ':'')+(m.title||((x.code||'资源')+' · 资源 '+('0'+(i+1)).slice(-2)));}
  R.magnets=function(){
    var d=[],url=dec(P('u',''));if(!url){setResult([empty('缺少影片地址','')]);return;}var x=C.detail(url),filter=getMyVar('myav_mag_filter','all'),sort=getMyVar('myav_mag_sort','default'),a=(x.magnets||[]).slice(),i,m,show=[];
    setPageTitle('磁力 · '+(x.code||'资源'));
    d.push({title:x.code?S(x.code).toUpperCase():'磁力资源',desc:a.length+' 条资源 · 点击复制 · 长按发送到云盘',img:x.img||A+'magnet.svg',pic_url:x.img||A+'magnet.svg',url:'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false}});
    d.push(chip((filter==='all'?'● ':'')+'全部',magFilterUrl('myav_mag_filter','all')));
    d.push(chip((filter==='sub'?'● ':'')+'字幕',magFilterUrl('myav_mag_filter','sub')));
    d.push(chip((filter==='hd'?'● ':'')+'高清',magFilterUrl('myav_mag_filter','hd')));
    d.push(chip((sort==='default'?'● ':'')+'默认',magFilterUrl('myav_mag_sort','default')));
    d.push(chip((sort==='size'?'● ':'')+'按大小',magFilterUrl('myav_mag_sort','size')));
    d.push(chip((sort==='date'?'● ':'')+'按日期',magFilterUrl('myav_mag_sort','date')));
    for(i=0;i<a.length;i++){m=a[i];if(filter==='sub'&&!m.sub)continue;if(filter==='hd'&&!m.hd)continue;show.push(m);}
    if(sort==='size')show.sort(function(p,q){return C.magnetBytes(q.size)-C.magnetBytes(p.size);});
    if(sort==='date')show.sort(function(p,q){return S(q.date).localeCompare(S(p.date));});
    d.push(section('资源列表',show.length+' / '+a.length+' 条'));
    if(!show.length)d.push(empty('当前筛选没有资源','切换“全部”查看完整磁链'));
    for(i=0;i<show.length;i++){
      m=show[i];var meta=[];if(m.size)meta.push(m.size);if(m.date)meta.push(m.date);if(!meta.length)meta.push('资源 '+('0'+(i+1)).slice(-2));
      d.push({title:magTitle(m,x,i),desc:meta.join(' · ')+'\n点击复制磁链 · 长按：迅雷 / PikPak / 123云盘 / 光鸭',url:'copy://'+m.link,col_type:'text_1',extra:{lineVisible:false,longClick:C.magnetLongClicks(m.link)}});
    }
    setResult(d);
  };

  R.settings=function(){var d=[],boot=R.bootstrapUrl;setPageTitle('MyAv 设置');d.push(section('运行状态','Test 通道 · 自用远程版'));d.push({title:'版本',desc:R.version+' · Build '+R.build,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'分类协议',desc:'完整菜单树 + /t/ 索引条目 + /c /c3 /c4 影片族',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'磁链解析',desc:'资源块解析 / 标题清洗 / 大小日期 / 字幕高清筛选',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'重新发现站点导航',desc:'清除首页导航缓存，重新读取原站菜单与动态 hash',url:$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'检查 Test 更新',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10104',{headers:{'Cache-Control':'no-cache'}},10104);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'回退上一 Test',url:$('#noLoading#').lazyRule(function(b){try{require(b+'?v=10104',{headers:{'Cache-Control':'no-cache'}},10104);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},boot),col_type:'text_1',extra:{lineVisible:false}});setResult(d);};
})(MyAvRemoteRuntime,MyAvCore);
