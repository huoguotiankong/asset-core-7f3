/* 麻豆传媒 Test7 - playback handoff + same-level navigation guard */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') {
    throw new Error('Madou runtime unavailable');
  }

  var C = MadouCore;
  var R = MadouRemoteRuntime;
  var ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';

  C.version = '0.1.0-test.7';
  C.build = 10107;
  R.version = '0.1.0-test.7';
  R.build = 10107;
  C.bootstrap = ROOT + 'bootstrap_test_v7_b10107.js?v=10107';

  function str(v){ return v === undefined || v === null ? '' : String(v); }
  function add(list,item){ list.push(item); }
  function hash(value){
    var x = str(value), h = 0, i;
    for(i=0;i<x.length;i++) h = ((h << 5) - h + x.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function removeKv(key){
    try { if (typeof clearItem === 'function') { clearItem(key); return; } } catch(e1) {}
    try { if (typeof removeItem === 'function') { removeItem(key); } } catch(e2) {}
  }
  function purgeLegacyUrl(url){
    var target = str(url);
    var prefixes = ['madou_v1_','madou_v2_'];
    var i,k;
    if (!target) return;
    for(i=0;i<prefixes.length;i++){
      k = prefixes[i] + hash(target);
      removeKv(k);
      removeKv(k + '_ts');
    }
  }
  function same(a,b){
    a = C.cleanLabel(str(a)).replace(/^\s+|\s+$/g,'').toLowerCase();
    b = C.cleanLabel(str(b)).replace(/^\s+|\s+$/g,'').toLowerCase();
    return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
  }
  function titleBlock(list,title,desc){
    add(list,{title:title,desc:desc || '',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});
  }
  function divider(list){ add(list,{col_type:'line'}); }
  function playerUrl(source,ref){
    source = str(source);
    if (!source) return '';
    return source + ';{User-Agent@' + C.ua + '&&Referer@' + ref + '}#isVideo=true#';
  }
  function sniffItem(url,id){
    return {
      title:'▶ 立即播放',
      desc:'网页媒体自动提取',
      col_type:'text_center_1',
      url:'video://' + url,
      extra:{
        id:id,
        lineVisible:false,
        blockRules:['.jpg','.jpeg','.png','.gif','.webp','banner','advert','doubleclick','googleads'],
        videoRules:['.m3u8','.mp4','m3u8','mp4'],
        videoExcludeRules:['advert','promo','banner','?ad='],
        cacheM3u8:true
      }
    };
  }

  R.list = function(){
    var initialName = C.param('n','分类');
    var initialBase = C.param('u',C.base + '/');
    var groupName = C.param('g','');
    var page = 1;
    try { page = Number(MY_PAGE || 1); } catch(e0) { page = 1; }
    if (!page || page < 1) page = 1;

    var token = initialBase + '|' + groupName;
    var stateKey = 'madou_list_active_t7_' + hash(token);
    var nameKey = stateKey + '_name';
    var activeBase = initialBase;
    var activeName = initialName;
    try {
      activeBase = str(getMyVar(stateKey,initialBase) || initialBase);
      activeName = str(getMyVar(nameKey,initialName) || initialName);
    } catch(e1) {}

    var list = [];
    var home = C.fetchHtml(C.base + '/',false);
    var groups = C.categoryGroups(home);
    var group = groupName ? C.groupByName(groups,groupName) : C.groupByUrl(groups,activeBase);
    var i, first, requestUrl, html, cards;

    if (!group && initialBase !== activeBase) group = C.groupByUrl(groups,initialBase);
    if (group && !groupName) groupName = group.name;

    try { setPageTitle(activeName || initialName); } catch(e2) {}

    if (page === 1 && group) {
      for(i=0;i<group.children.length;i++){
        (function(child){
          var selected = child.url === activeBase;
          add(list,{
            title:(selected ? '● ' : '') + child.name,
            col_type:'scroll_button',
            url:$('#noLoading#').lazyRule(function(k,nk,u,n){
              putMyVar(k,u);
              putMyVar(nk,n);
              refreshPage(false);
              return 'hiker://empty';
            },stateKey,nameKey,child.url,child.name),
            extra:{lineVisible:false}
          });
        })(group.children[i]);
      }
      if (group.children.length) add(list,{col_type:'blank_block'});
    }

    first = page > 1 ? C.fetchHtml(activeBase,false) : '';
    requestUrl = C.pageUrl(activeBase,page,first);
    html = C.fetchHtml(requestUrl,page>1);
    cards = C.parseCards(html,requestUrl);

    for(i=0;i<cards.length;i++){
      add(list,{
        title:cards[i].title || '影片',
        desc:cards[i].desc || '',
        pic_url:cards[i].img || '',
        img:cards[i].img || '',
        url:C.page('madouDetail',{u:cards[i].url}),
        col_type:'movie_2',
        extra:{lineVisible:false,id:'madou_t7_list_'+i}
      });
    }

    if (!cards.length && page === 1) {
      add(list,{title:'暂无内容',desc:'当前分类没有识别到有效影片。',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
      add(list,{title:'原站打开',desc:activeBase,col_type:'text_center_1',url:'web://'+activeBase,extra:{lineVisible:false}});
    }
    setResult(list);
  };

  R.detail = function(){
    var u = C.param('u','');
    var list = [];
    var html,x,cover,source,play,id,fav,i,historyOk;
    try { setPageTitle('影片详情'); } catch(e0) {}

    purgeLegacyUrl(u);
    html = C.fetchPlainHtml(u);
    if (C.isBadHtml(html)) {
      titleBlock(list,'详情加载失败','当前直连没有拿到有效详情数据。');
      add(list,sniffItem(u,'madou_t7_play_'+hash(u)));
      divider(list);
      add(list,{title:'打开原站详情',col_type:'text_center_1',url:'web://'+u,extra:{lineVisible:false}});
      setResult(list);
      return;
    }

    x = C.detail(html,u);
    try { setPageTitle(x.title || '影片详情'); } catch(e1) {}
    cover = C.image(x.cover,u);
    historyOk = false;
    try { historyOk = C.addHistory({url:u,title:x.title || '影片',img:cover,rawImg:x.cover,desc:x.date || x.duration || ''}); } catch(e2) {}

    add(list,{
      title:x.title || '影片',
      desc:(x.date || '') + (x.date && x.duration ? ' · ' : '') + (x.duration || ''),
      pic_url:cover,
      img:cover,
      url:'hiker://empty',
      col_type:'movie_1_left_pic',
      extra:{lineVisible:false}
    });

    id = 'madou_t7_play_' + hash(u);
    source = x.sources && x.sources.length ? x.sources[0] : '';
    if (source) {
      play = {
        title:'▶ 立即播放',
        desc:'已解析媒体直链',
        col_type:'text_center_1',
        url:playerUrl(source,u),
        extra:{id:id,lineVisible:false}
      };
    } else {
      play = sniffItem(u,id);
    }
    add(list,play);
    divider(list);

    if (x.desc) {
      titleBlock(list,'简介','');
      add(list,{title:str(x.desc).substring(0,2200),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    }
    if (x.tags && x.tags.length) {
      titleBlock(list,'标签 / 相关分类','');
      for(i=0;i<x.tags.length && i<16;i++){
        add(list,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});
      }
    }
    if (x.related && x.related.length) {
      titleBlock(list,'相关推荐','');
      for(i=0;i<x.related.length && i<16;i++){
        add(list,{
          title:x.related[i].title || '影片',
          desc:x.related[i].desc || '',
          pic_url:x.related[i].img || '',
          img:x.related[i].img || '',
          url:C.page('madouDetail',{u:x.related[i].url}),
          col_type:'movie_2',
          extra:{lineVisible:false,id:'madou_t7_related_'+i}
        });
      }
    }

    divider(list);
    fav = C.isFav(u);
    add(list,{
      title:fav ? '★ 取消本地收藏' : '☆ 加入本地收藏',
      desc:historyOk ? '浏览记录已保存 · 本地收藏仅保存在当前设备' : '浏览记录存储异常时已自动跳过',
      col_type:'text_center_1',
      url:$(u).lazyRule(function(boot,target,tt,im,ds){
        require(boot,{headers:{'Cache-Control':'no-cache'}},10107);
        MadouBoot.loadOnly();
        MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});
        refreshPage(false);
        return 'toast://收藏状态已更新';
      },C.bootstrap,u,x.title || '影片',x.cover || '',x.date || x.duration || ''),
      extra:{lineVisible:false}
    });
    add(list,{title:'🌐 原站详情',col_type:'text_center_1',url:'web://'+u,extra:{lineVisible:false}});
    setResult(list);
  };
})();
