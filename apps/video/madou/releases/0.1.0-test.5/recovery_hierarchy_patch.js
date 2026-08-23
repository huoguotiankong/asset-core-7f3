/* 麻豆传媒 Test5 - recover from Test4 parse failure; hierarchy + safe detail */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') {
    throw new Error('Madou runtime unavailable');
  }

  var C = MadouCore;
  var R = MadouRemoteRuntime;
  var ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var MAJORS = ['精选推荐','欧美P站','原创AV','网黄','乱伦','日韩','男同百合','Onlyfans','三级','猛料-SM','成人综艺','短视频','性爱教学','影视剧'];

  C.version = '0.1.0-test.5';
  C.build = 10105;
  R.version = '0.1.0-test.5';
  R.build = 10105;
  C.bootstrap = ROOT + 'bootstrap_test_v5_b10105.js?v=10105';

  function str(v){ return v === undefined || v === null ? '' : String(v); }
  function add(list,item){ list.push(item); }
  function clean(v){ return C.cleanLabel(str(v)).replace(/^\s+|\s+$/g,''); }
  function same(a,b){
    a = clean(a).toLowerCase();
    b = clean(b).toLowerCase();
    return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
  }
  function section(list,title,desc){
    add(list,{title:title,desc:desc || '',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
  }
  function cardUrl(c){ return C.page('madouDetail',{u:c.url}); }
  function renderCards(list,cards,limit){
    var max = limit || cards.length;
    var i,c;
    for(i=0;i<cards.length && i<max;i++){
      c = cards[i] || {};
      add(list,{title:c.title || '影片',desc:c.desc || '',pic_url:c.img || '',img:c.img || '',url:cardUrl(c),col_type:'movie_2',extra:{lineVisible:false,id:'madou_t5_card_'+i}});
    }
  }

  C._t5Html = {};
  C._t5Ts = {};
  C.fetchPlainHtml = function(url){
    var target = str(url || C.base + '/');
    var html = '';
    try {
      html = str(fetch(target,{timeout:12000,headers:C.headers(target)}));
    } catch(e1) {
      html = '';
    }
    if (C.isBadHtml(html)) {
      try {
        if (typeof request === 'function') {
          html = str(request(target,{timeout:12000,headers:C.headers(target)}));
        }
      } catch(e2) {}
    }
    return html;
  };
  C.fetchHtml = function(url,force){
    var target = str(url || C.base + '/');
    var now = new Date().getTime();
    var old = C._t5Html[target] || '';
    var oldTs = Number(C._t5Ts[target] || 0);
    var html;
    if (!force && old && now - oldTs < 180000) return old;
    html = C.fetchPlainHtml(target);
    if (!C.isBadHtml(html)) {
      C._t5Html[target] = html;
      C._t5Ts[target] = now;
      try { setItem('madou_diag_last_html_len',String(html.length)); } catch(e3) {}
      try { setItem('madou_diag_last_fetch_ts',String(now)); } catch(e4) {}
      return html;
    }
    return old || html;
  };

  C.slimItem = function(item){
    var x = item || {};
    var image = str(x.img || '');
    var raw = str(x.rawImg || '');
    if (image.length > 4000 || /^data:/i.test(image)) image = '';
    if (raw.length > 4000 || /^data:/i.test(raw)) raw = '';
    return {
      url:str(x.url || '').substring(0,2500),
      title:str(x.title || '影片').substring(0,240),
      img:image,
      rawImg:raw,
      desc:str(x.desc || '').substring(0,400),
      time:Number(x.time || new Date().getTime())
    };
  };
  C.writeList = function(key,items){
    var src = items || [];
    var out = [];
    var max = key === C.historyKey ? 100 : 160;
    var i,text;
    for(i=0;i<src.length && i<max;i++) out.push(C.slimItem(src[i]));
    text = JSON.stringify(out);
    while(text.length > 600000 && out.length > 20){
      out = out.slice(0,Math.floor(out.length/2));
      text = JSON.stringify(out);
    }
    setItem(key,text);
  };
  C.addHistory = function(item){
    var old = C.readList(C.historyKey);
    var cur = C.slimItem(item);
    var out = [cur];
    var i;
    for(i=0;i<old.length && out.length<100;i++){
      if (old[i] && old[i].url !== cur.url) out.push(C.slimItem(old[i]));
    }
    C.writeList(C.historyKey,out);
  };
  C.toggleFav = function(item){
    var old = C.readList(C.favoriteKey);
    var cur = C.slimItem(item);
    var out = [];
    var hit = false;
    var i;
    for(i=0;i<old.length;i++){
      if (old[i] && old[i].url === cur.url) hit = true;
      else out.push(C.slimItem(old[i]));
    }
    if (!hit) out.unshift(cur);
    C.writeList(C.favoriteKey,out);
    return !hit;
  };

  C.categoryGroups = function(html){
    var region = C.menuRegion(html) || str(html);
    var anchors = C.allAnchors(region,C.base);
    var marks = [];
    var i,j,pos,label,href;

    for(i=0;i<MAJORS.length;i++){
      pos = region.indexOf(MAJORS[i]);
      href = '';
      for(j=0;j<anchors.length;j++){
        label = clean(anchors[j].text || anchors[j].title);
        if (same(label,MAJORS[i])) {
          if (pos < 0) pos = anchors[j].index;
          href = anchors[j].href;
          break;
        }
      }
      if (pos >= 0) marks.push({name:MAJORS[i],pos:pos,url:href});
    }

    marks.sort(function(a,b){ return a.pos - b.pos; });

    var groups = [];
    var start,end,item,name,isMajor,k,seen,children,m;
    for(i=0;i<marks.length;i++){
      start = marks[i].pos;
      end = i + 1 < marks.length ? marks[i+1].pos : region.length;
      seen = {};
      children = [];
      for(j=0;j<anchors.length;j++){
        item = anchors[j];
        if (item.index <= start || item.index >= end) continue;
        name = clean(item.text || item.title);
        if (!name || name.length > 24 || !C.internal(item.href) || C.isUtilityLabel(name)) continue;
        if (/^(首页|最新|上一页|下一页|上页|下页|更多|展开|收起|arrow|next|prev|menu)$/i.test(name)) continue;
        isMajor = false;
        for(m=0;m<MAJORS.length;m++){
          if (same(name,MAJORS[m])) { isMajor = true; break; }
        }
        if (isMajor) continue;
        k = name + '|' + item.href;
        if (seen[k]) continue;
        seen[k] = 1;
        children.push({name:name,url:item.href});
      }
      groups.push({name:marks[i].name,url:marks[i].url,children:children});
    }

    if (!groups.length) {
      for(i=0;i<MAJORS.length;i++) groups.push({name:MAJORS[i],url:'',children:[]});
    }
    return groups;
  };

  C.groupByName = function(groups,name){
    var i;
    for(i=0;i<groups.length;i++) if (same(groups[i].name,name)) return groups[i];
    return null;
  };
  C.groupByUrl = function(groups,url){
    var i,j;
    for(i=0;i<groups.length;i++){
      if (groups[i].url === url) return groups[i];
      for(j=0;j<groups[i].children.length;j++) if (groups[i].children[j].url === url) return groups[i];
    }
    return null;
  };

  R.home = function(){
    var list = [];
    var html = C.fetchHtml(C.base + '/',false);
    var groups,cards,i;
    try { setPageTitle('麻豆传媒'); } catch(e) {}
    if (C.isBadHtml(html)) {
      section(list,'麻豆传媒','原站直连暂时未返回有效页面。');
      add(list,{title:'打开原站',desc:C.base,col_type:'text_1',url:'web://'+C.base+'/'});
      setResult(list);
      return;
    }
    add(list,{title:'搜索',col_type:'icon_small_4',img:ROOT+'assets/quick_search.svg',pic_url:ROOT+'assets/quick_search.svg',url:C.page('madouSearch')});
    add(list,{title:'全部分类',col_type:'icon_small_4',img:ROOT+'assets/quick_categories.svg',pic_url:ROOT+'assets/quick_categories.svg',url:C.page('madouCategories')});
    add(list,{title:'本地收藏',col_type:'icon_small_4',img:ROOT+'assets/quick_favorite.svg',pic_url:ROOT+'assets/quick_favorite.svg',url:C.page('madouFavorites')});
    add(list,{title:'浏览历史',col_type:'icon_small_4',img:ROOT+'assets/quick_history.svg',pic_url:ROOT+'assets/quick_history.svg',url:C.page('madouHistory')});
    groups = C.categoryGroups(html);
    add(list,{title:'首页',col_type:'scroll_button',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
    for(i=0;i<groups.length && i<8;i++) add(list,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});
    if (groups.length > 8) add(list,{title:'更多',col_type:'scroll_button',url:C.page('madouCategories')});
    cards = C.parseCards(html,C.base);
    section(list,'首页精选',cards.length ? '已解析 '+cards.length+' 项' : '暂未识别到内容卡片');
    renderCards(list,cards,18);
    setResult(list);
  };

  R.categories = function(){
    var list = [];
    var html = C.fetchHtml(C.base + '/',false);
    var groups = C.categoryGroups(html);
    var focus = C.param('g','');
    var key = 'madou_cat_open_t5';
    var current = '';
    var i,j,g,on,total = 0;
    try { setPageTitle('全部分类'); } catch(e) {}
    try { current = getMyVar(key,''); } catch(e2) { current = ''; }
    if (focus) current = focus;
    for(i=0;i<groups.length;i++) total += groups[i].children.length;
    section(list,'分类中心',groups.length+' 个大分类 · '+total+' 个小分类');
    for(i=0;i<groups.length;i++){
      g = groups[i];
      on = current && same(current,g.name);
      add(list,{title:(on ? '▼ ' : '▶ ') + g.name,desc:g.children.length ? g.children.length+' 个小分类' : '暂无已识别小分类',col_type:'text_1',url:$('#noLoading#').lazyRule(function(k,n){var old=getMyVar(k,'');if(old===n)clearMyVar(k);else putMyVar(k,n);refreshPage(false);return 'hiker://empty';},key,g.name),extra:{lineVisible:false}});
      if (!on) continue;
      if (g.url) add(list,{title:'全部'+g.name,col_type:'text_3',url:C.page('madouList',{u:g.url,page:'fypage',n:'全部'+g.name,g:g.name})});
      for(j=0;j<g.children.length;j++) add(list,{title:g.children[j].name,col_type:'text_3',url:C.page('madouList',{u:g.children[j].url,page:'fypage',n:g.children[j].name,g:g.name})});
    }
    setResult(list);
  };

  R.list = function(){
    var name = C.param('n','分类');
    var base = C.param('u',C.base+'/');
    var groupName = C.param('g','');
    var page = parseInt(C.param('page','1'),10) || 1;
    var list = [];
    var home,groups,g,i,first,u,html,cards;
    try { setPageTitle(name); } catch(e) {}
    if (page === 1) {
      home = C.fetchHtml(C.base+'/',false);
      groups = C.categoryGroups(home);
      g = groupName ? C.groupByName(groups,groupName) : C.groupByUrl(groups,base);
      if (g) {
        for(i=0;i<g.children.length;i++) add(list,{title:g.children[i].name,col_type:'scroll_button',url:C.page('madouList',{u:g.children[i].url,page:'fypage',n:g.children[i].name,g:g.name})});
      }
    }
    first = page > 1 ? C.fetchHtml(base,false) : '';
    u = C.pageUrl(base,page,first);
    html = C.fetchHtml(u,page>1);
    cards = C.parseCards(html,u);
    renderCards(list,cards,0);
    if (!cards.length && page === 1) {
      section(list,'暂无内容','页面已请求，但当前解析器没有识别到有效影片卡片。');
      add(list,{title:'原站打开',desc:u,col_type:'text_1',url:'web://'+u});
    }
    setResult(list);
  };

  R.detail = function(){
    var u = C.param('u','');
    var list = [];
    var html,x,cover,playDesc,fav,i;
    try { setPageTitle('影片详情'); } catch(e) {}
    html = C.fetchPlainHtml(u);
    if (C.isBadHtml(html)) {
      section(list,'详情直连失败','当前不使用大型 WebView HTML 回传，避免再次触发 1MB 私有存储错误。');
      add(list,{title:'网页媒体嗅探',col_type:'text_1',url:'video://'+u});
      add(list,{title:'原站详情',col_type:'text_1',url:'web://'+u});
      setResult(list);
      return;
    }
    x = C.detail(html,u);
    try { setPageTitle(x.title || '影片详情'); } catch(e2) {}
    cover = C.image(x.cover,u);
    C.addHistory({url:u,title:x.title || '影片',img:cover,rawImg:x.cover,desc:x.date || x.duration || ''});
    add(list,{title:x.title || '影片',desc:(x.date || '') + (x.date && x.duration ? ' · ' : '') + (x.duration || ''),pic_url:cover,img:cover,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    playDesc = x.sources && x.sources.length ? '检测到 '+x.sources.length+' 个媒体候选' : '未发现直链，使用网页嗅探';
    add(list,{title:'立即播放',desc:playDesc,col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);MadouBoot.loadOnly();return MadouCore.resolvePlay(target);},C.bootstrap,u),extra:{lineVisible:false}});
    fav = C.isFav(u);
    add(list,{title:fav?'取消本地收藏':'加入本地收藏',col_type:'text_1',url:$(u).lazyRule(function(boot,target,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);MadouBoot.loadOnly();var on=MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return 'toast://'+(on?'已收藏':'已取消收藏');},C.bootstrap,u,x.title || '影片',x.cover || '',x.date || x.duration || ''),extra:{lineVisible:false}});
    if (x.desc) {
      section(list,'简介','');
      add(list,{title:str(x.desc).substring(0,2500),col_type:'rich_text',url:'hiker://empty'});
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

  C.resolvePlay = function(url){
    var html = C.fetchPlainHtml(url);
    var src = C.mediaSources(html,url);
    src.sort(function(a,b){ return C.mediaScore(b) - C.mediaScore(a); });
    if (src.length) return src[0] + ';{User-Agent@' + C.ua + '&&Referer@' + url + '}#isVideo=true#';
    return 'video://' + url;
  };
})();
