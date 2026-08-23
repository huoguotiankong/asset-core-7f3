/* 麻豆传媒 Test6 - detail quota recovery + category/search UX rebuild */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') {
    throw new Error('Madou runtime unavailable');
  }

  var C = MadouCore;
  var R = MadouRemoteRuntime;
  var ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';

  C.version = '0.1.0-test.6';
  C.build = 10106;
  R.version = '0.1.0-test.6';
  R.build = 10106;
  C.bootstrap = ROOT + 'bootstrap_test_v6_b10106.js?v=10106';

  function str(v){ return v === undefined || v === null ? '' : String(v); }
  function add(list,item){ list.push(item); }
  function section(list,title,desc){
    add(list,{title:title,desc:desc || '',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
  }
  function same(a,b){
    a = C.cleanLabel(str(a)).replace(/^\s+|\s+$/g,'').toLowerCase();
    b = C.cleanLabel(str(b)).replace(/^\s+|\s+$/g,'').toLowerCase();
    return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
  }
  function hashKey(prefix,value){
    var x = str(value), h = 0, i;
    for(i=0;i<x.length;i++) h = ((h << 5) - h + x.charCodeAt(i)) | 0;
    return prefix + Math.abs(h);
  }
  function removeKv(key){
    var ok = false;
    try { if (typeof clearItem === 'function') { clearItem(key); ok = true; } } catch(e1) {}
    if (!ok) {
      try { if (typeof removeItem === 'function') { removeItem(key); ok = true; } } catch(e2) {}
    }
    return ok;
  }
  function purgeLegacyUrl(url){
    var target = str(url);
    var prefixes = ['madou_v1_','madou_v2_'];
    var i,k;
    if (!target) return;
    for(i=0;i<prefixes.length;i++){
      k = hashKey(prefixes[i],target);
      removeKv(k);
      removeKv(k + '_ts');
    }
  }

  // Test1/Test3 could leave full detail HTML in private KV. Before any detail-side
  // state write, delete the exact legacy cache slots for the current URL.
  purgeLegacyUrl(C.base);
  purgeLegacyUrl(C.base + '/');

  C.readList = function(key){
    var raw = '[]';
    try { raw = str(getItem(key,'[]')); } catch(e1) { raw = '[]'; }
    if (raw.length > 260000) {
      removeKv(key);
      return [];
    }
    try {
      var a = JSON.parse(raw);
      return Object.prototype.toString.call(a) === '[object Array]' ? a : [];
    } catch(e2) {
      return [];
    }
  };
  C.writeList = function(key,items){
    var src = items || [];
    var out = [];
    var max = key === C.historyKey ? 80 : 120;
    var i,text;
    for(i=0;i<src.length && i<max;i++) out.push(C.slimItem ? C.slimItem(src[i]) : src[i]);
    text = JSON.stringify(out);
    while(text.length > 180000 && out.length > 12){
      out = out.slice(0,Math.max(12,Math.floor(out.length/2)));
      text = JSON.stringify(out);
    }
    try {
      setItem(key,text);
      return true;
    } catch(e1) {
      // A legacy raw-HTML value can make the whole private store temporarily full.
      // Never let an auxiliary history/favorite write crash the detail page.
      return false;
    }
  };
  C.addHistory = function(item){
    var old = C.readList(C.historyKey);
    var cur = C.slimItem ? C.slimItem(item) : item;
    var out = [cur];
    var i;
    for(i=0;i<old.length && out.length<80;i++){
      if (old[i] && old[i].url !== cur.url) out.push(C.slimItem ? C.slimItem(old[i]) : old[i]);
    }
    return C.writeList(C.historyKey,out);
  };
  C.toggleFav = function(item){
    var old = C.readList(C.favoriteKey);
    var cur = C.slimItem ? C.slimItem(item) : item;
    var out = [];
    var hit = false;
    var i;
    for(i=0;i<old.length;i++){
      if (old[i] && old[i].url === cur.url) hit = true;
      else out.push(C.slimItem ? C.slimItem(old[i]) : old[i]);
    }
    if (!hit) out.unshift(cur);
    C.writeList(C.favoriteKey,out);
    return !hit;
  };

  function renderCards(list,cards,limit){
    var max = limit || cards.length;
    var i,c;
    for(i=0;i<cards.length && i<max;i++){
      c = cards[i] || {};
      add(list,{
        title:c.title || '影片',
        desc:c.desc || '',
        pic_url:c.img || '',
        img:c.img || '',
        url:C.page('madouDetail',{u:c.url}),
        col_type:'movie_2',
        extra:{lineVisible:false,id:'madou_t6_card_'+i}
      });
    }
  }

  R.categories = function(){
    var list = [];
    var html = C.fetchHtml(C.base + '/',false);
    var groups = C.categoryGroups(html);
    var focus = C.param('g','');
    var key = 'madou_cat_active_t6';
    var current = '';
    var active = null;
    var i,j,total = 0;
    try { setPageTitle('全部分类'); } catch(e) {}
    try { current = getMyVar(key,''); } catch(e2) { current = ''; }
    if (focus) current = focus;
    if (!current && groups.length) current = groups[0].name;
    for(i=0;i<groups.length;i++){
      total += groups[i].children.length;
      if (same(groups[i].name,current)) active = groups[i];
    }
    if (!active && groups.length) active = groups[0];

    section(list,'分类中心',groups.length+' 个大分类 · '+total+' 个小分类');
    for(i=0;i<groups.length;i++){
      (function(g){
        var selected = active && same(active.name,g.name);
        add(list,{
          title:(selected ? '● ' : '') + g.name,
          col_type:'scroll_button',
          url:$('#noLoading#').lazyRule(function(k,n){putMyVar(k,n);refreshPage(false);return 'hiker://empty';},key,g.name),
          extra:{lineVisible:false}
        });
      })(groups[i]);
    }

    if (!active) {
      section(list,'暂无分类','当前页面没有解析到有效分类。');
      setResult(list);
      return;
    }

    section(list,active.name,active.children.length ? active.children.length+' 个小分类 · 点击进入内容' : '当前未识别到独立小分类');
    if (active.url) add(list,{title:'全部',col_type:'text_3',url:C.page('madouList',{u:active.url,page:'fypage',n:'全部'+active.name,g:active.name}),extra:{lineVisible:false}});
    for(j=0;j<active.children.length;j++){
      add(list,{
        title:active.children[j].name,
        col_type:'text_3',
        url:C.page('madouList',{u:active.children[j].url,page:'fypage',n:active.children[j].name,g:active.name}),
        extra:{lineVisible:false}
      });
    }
    if (!active.url && !active.children.length) add(list,{title:'暂未识别到子分类',col_type:'text_center_1',url:'hiker://empty'});
    setResult(list);
  };

  R.search = function(){
    var kw = C.param('kw','');
    var page = 1;
    var list = [];
    var searchJs,groups,home,r,cards,i;
    try { if (!kw && typeof MY_KEYWORD !== 'undefined') kw = str(MY_KEYWORD); } catch(e0) {}
    try { page = Number(MY_PAGE || 1); } catch(e1) { page = 1; }
    kw = str(kw).replace(/^\s+|\s+$/g,'');
    try { setPageTitle(kw ? '搜索 · '+kw : '搜索'); } catch(e2) {}

    searchJs = "(function(){var q=String(input||'').replace(/^\\s+|\\s+$/g,'');return q?('hiker://page/madouSearch?rule=&simple=true&kw='+encodeURIComponent(q)):'toast://请输入关键词';})()";
    add(list,{
      title:kw ? '重新搜索：'+kw : '搜索全站内容',
      desc:'输入片名、演员或关键词',
      col_type:'text_1',
      url:'input://'+JSON.stringify({value:kw,hint:'输入片名、演员或关键词',js:searchJs}),
      extra:{lineVisible:false}
    });

    if (!kw) {
      home = C.fetchHtml(C.base+'/',false);
      groups = C.categoryGroups(home);
      section(list,'快速浏览','也可以先从热门大分类进入');
      for(i=0;i<groups.length && i<10;i++) add(list,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});
      setResult(list);
      return;
    }

    r = C.searchHtml(kw,page);
    cards = C.parseCards(r.html,r.url);
    section(list,'搜索结果',cards.length ? '找到 '+cards.length+' 项' : '没有找到匹配内容');
    renderCards(list,cards,0);
    if (!cards.length && page === 1) add(list,{title:'用原站搜索',desc:'尝试在原站继续查找',col_type:'text_1',url:'web://'+C.base+'/',extra:{lineVisible:false}});
    setResult(list);
  };

  R.detail = function(){
    var u = C.param('u','');
    var list = [];
    var html,x,cover,playDesc,fav,i,historyOk;
    try { setPageTitle('影片详情'); } catch(e) {}

    // Remove the exact Test1/Test3 raw-detail cache keys before any setItem call.
    purgeLegacyUrl(u);

    html = C.fetchPlainHtml(u);
    if (C.isBadHtml(html)) {
      section(list,'详情加载失败','当前直连没有拿到有效详情数据。');
      add(list,{title:'直接嗅探播放',desc:'交给海阔从原详情页识别媒体',col_type:'text_1',url:'video://'+u,extra:{lineVisible:false}});
      add(list,{title:'打开原站详情',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});
      setResult(list);
      return;
    }

    x = C.detail(html,u);
    try { setPageTitle(x.title || '影片详情'); } catch(e2) {}
    cover = C.image(x.cover,u);

    // History is auxiliary. Failure to persist must never abort the detail renderer.
    historyOk = false;
    try { historyOk = C.addHistory({url:u,title:x.title || '影片',img:cover,rawImg:x.cover,desc:x.date || x.duration || ''}); } catch(e3) { historyOk = false; }

    add(list,{title:x.title || '影片',desc:(x.date || '') + (x.date && x.duration ? ' · ' : '') + (x.duration || ''),pic_url:cover,img:cover,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    playDesc = x.sources && x.sources.length ? '检测到 '+x.sources.length+' 个媒体候选' : '未发现直链，点击后网页嗅探';
    add(list,{title:'▶ 立即播放',desc:playDesc,col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10106);MadouBoot.loadOnly();return MadouCore.resolvePlay(target);},C.bootstrap,u),extra:{lineVisible:false,id:'madou_t6_play'}});

    fav = C.isFav(u);
    add(list,{title:fav?'★ 取消本地收藏':'☆ 加入本地收藏',desc:historyOk?'浏览记录已保存':'详情已加载；浏览记录存储异常时自动跳过，不影响播放',col_type:'text_1',url:$(u).lazyRule(function(boot,target,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10106);MadouBoot.loadOnly();MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return 'toast://收藏状态已更新';},C.bootstrap,u,x.title || '影片',x.cover || '',x.date || x.duration || ''),extra:{lineVisible:false}});

    if (x.desc) {
      section(list,'简介','');
      add(list,{title:str(x.desc).substring(0,2200),col_type:'rich_text',url:'hiker://empty'});
    }
    if (x.tags && x.tags.length) {
      section(list,'标签 / 相关分类','');
      for(i=0;i<x.tags.length && i<16;i++) add(list,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name})});
    }
    if (x.related && x.related.length) {
      section(list,'相关推荐','');
      renderCards(list,x.related,16);
    }
    setResult(list);
  };
})();
