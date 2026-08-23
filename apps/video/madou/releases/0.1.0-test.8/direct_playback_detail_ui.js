/* 麻豆传媒 Test8 - detail visual rebuild + direct playback resolver */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') {
    throw new Error('Madou runtime unavailable');
  }

  var C = MadouCore;
  var R = MadouRemoteRuntime;
  var ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';

  C.version = '0.1.0-test.8';
  C.build = 10108;
  R.version = '0.1.0-test.8';
  R.build = 10108;
  C.bootstrap = ROOT + 'bootstrap_test_v8_b10108.js?v=10108';

  function str(v){ return v === undefined || v === null ? '' : String(v); }
  function add(list,item){ list.push(item); }
  function hash(value){
    var x = str(value), h = 0, i;
    for(i=0;i<x.length;i++) h = ((h << 5) - h + x.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function escHtml(s){
    return str(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function divider(list){ add(list,{col_type:'line'}); }
  function section(list,title,desc){
    add(list,{title:title,desc:desc || '',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
  }
  function playerUrl(source,ref){
    source = str(source);
    ref = str(ref || C.base + '/');
    if (!source) return '';
    return source + ';{User-Agent@' + C.ua + '&&Referer@' + ref + '}#isVideo=true#';
  }
  function safeAbs(raw,base){
    try { return C.abs(raw,base); } catch(e) { return ''; }
  }
  function isMedia(u){
    return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(str(u));
  }
  function cleanEncoded(text){
    var s = str(text);
    try { s = C.decode(s); } catch(e0) {}
    s = s.replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':')
      .replace(/\\\//g,'/').replace(/&amp;/ig,'&');
    try {
      if (/%(?:2F|3A|3F|3D)/i.test(s)) s += '\n' + decodeURIComponent(s);
    } catch(e1) {}
    return s;
  }
  function uniqPush(out,seen,url,ref,stage){
    var u = safeAbs(url,ref || C.base + '/');
    if (!u || !/^https?:\/\//i.test(u) || seen[u]) return;
    seen[u] = 1;
    out.push({url:u,ref:ref || C.base + '/',stage:stage || 'page'});
  }
  function scanMedia(text,base,stage){
    var s = cleanEncoded(text);
    var out = [], seen = {}, re, m, u, key;
    re = /(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;
    while((m=re.exec(s))) uniqPush(out,seen,m[1],base,stage || 'direct');

    re = /(?:file|src|source|videoUrl|video_url|playUrl|play_url|m3u8|url)\s*[:=]\s*["']([^"']+)["']/ig;
    while((m=re.exec(s))){
      u = safeAbs(m[1],base);
      if (isMedia(u)) uniqPush(out,seen,u,base,stage || 'config');
    }

    re = /<(?:video|source)\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;
    while((m=re.exec(s))){
      u = safeAbs(m[1],base);
      if (isMedia(u)) uniqPush(out,seen,u,base,stage || 'video-tag');
    }

    re = /(?:atob|base64_decode|decode64)\s*\(\s*["']([A-Za-z0-9+/_=-]{32,})["']\s*\)/ig;
    while((m=re.exec(s))){
      try {
        key = m[1].replace(/-/g,'+').replace(/_/g,'/');
        u = str(base64Decode(key));
        if (u && isMedia(u)) uniqPush(out,seen,u,base,stage || 'base64-config');
      } catch(e2) {}
    }
    return out;
  }
  function scanPlayerPages(text,base){
    var s = cleanEncoded(text), out = [], seen = {}, re, m, u;
    re = /<iframe\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;
    while((m=re.exec(s)) && out.length<4){
      u = safeAbs(m[1],base);
      if (u && /^https?:\/\//i.test(u) && !seen[u]){
        seen[u]=1; out.push(u);
      }
    }
    re = /(?:player|embed|iframe|playUrl|play_url|url)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/ig;
    while((m=re.exec(s)) && out.length<6){
      u = safeAbs(m[1],base);
      if (u && /^https?:\/\//i.test(u) && !isMedia(u) && !seen[u]){
        seen[u]=1; out.push(u);
      }
    }
    return out;
  }
  function fetchPlayerPage(url,ref){
    var h = '', headers;
    try {
      headers = C.headers(ref || url);
      headers.Referer = ref || url;
      h = str(fetch(url,{timeout:6500,headers:headers}));
    } catch(e1) { h=''; }
    if (C.isBadHtml(h)) {
      try {
        if (typeof request === 'function') h = str(request(url,{timeout:6500,headers:headers}));
      } catch(e2) {}
    }
    return h;
  }
  function cacheKey(url){ return 'madou_t8_media_' + hash(url); }
  function readMediaCache(url){
    var raw='', obj;
    try { raw = str(getItem(cacheKey(url),'')); } catch(e0) { raw=''; }
    if (!raw || raw.length > 6000) return null;
    try { obj = JSON.parse(raw); } catch(e1) { return null; }
    if (!obj || !obj.url || !obj.ts || new Date().getTime()-Number(obj.ts)>8*60*1000) return null;
    return obj;
  }
  function writeMediaCache(detailUrl,item){
    if (!item || !item.url) return;
    try {
      setItem(cacheKey(detailUrl),JSON.stringify({
        url:str(item.url).substring(0,3500),
        ref:str(item.ref || detailUrl).substring(0,1800),
        stage:str(item.stage || 'direct').substring(0,80),
        ts:new Date().getTime()
      }));
    } catch(e) {}
  }

  C.resolveDirectMedia = function(html,detailUrl){
    var cached = readMediaCache(detailUrl);
    if (cached) return cached;

    var direct = scanMedia(html,detailUrl,'detail-html');
    if (direct.length) {
      direct.sort(function(a,b){ return C.mediaScore(b.url)-C.mediaScore(a.url); });
      writeMediaCache(detailUrl,direct[0]);
      return direct[0];
    }

    var pages = scanPlayerPages(html,detailUrl);
    var i,j,h,media,nested;
    for(i=0;i<pages.length && i<3;i++){
      h = fetchPlayerPage(pages[i],detailUrl);
      if (!h) continue;
      media = scanMedia(h,pages[i],'player-page');
      if (media.length) {
        media.sort(function(a,b){ return C.mediaScore(b.url)-C.mediaScore(a.url); });
        writeMediaCache(detailUrl,media[0]);
        return media[0];
      }
      nested = scanPlayerPages(h,pages[i]);
      for(j=0;j<nested.length && j<2;j++){
        var h2 = fetchPlayerPage(nested[j],pages[i]);
        if (!h2) continue;
        media = scanMedia(h2,nested[j],'nested-player');
        if (media.length) {
          media.sort(function(a,b){ return C.mediaScore(b.url)-C.mediaScore(a.url); });
          writeMediaCache(detailUrl,media[0]);
          return media[0];
        }
      }
    }
    return null;
  };

  function sniffFallback(url,id){
    return {
      title:'▶ 立即播放',
      desc:'兼容解析 · 当前页未命中免嗅直链',
      col_type:'text_center_1',
      url:'video://' + url,
      extra:{
        id:id,
        lineVisible:false,
        blockRules:['.jpg','.jpeg','.png','.gif','.webp','.svg','banner','advert','doubleclick','googleads','analytics'],
        videoRules:['.m3u8','.mp4','m3u8','mp4'],
        videoExcludeRules:['advert','promo','banner','?ad='],
        cacheM3u8:true
      }
    };
  }

  R.detail = function(){
    var u = C.param('u','');
    var list = [];
    var html,x,cover,media,play,id,fav,i,historyOk,meta = [];
    try { setPageTitle('影片详情'); } catch(e0) {}

    html = C.fetchPlainHtml(u);
    if (C.isBadHtml(html)) {
      section(list,'详情暂时不可用','没有获取到有效详情数据。');
      add(list,sniffFallback(u,'madou_t8_play_'+hash(u)));
      setResult(list);
      return;
    }

    x = C.detail(html,u);
    try { setPageTitle(x.title || '影片详情'); } catch(e1) {}
    cover = C.image(x.cover,u);
    historyOk = false;
    try { historyOk = C.addHistory({url:u,title:x.title || '影片',img:cover,rawImg:x.cover,desc:x.date || x.duration || ''}); } catch(e2) {}

    if (cover) {
      add(list,{
        title:'',
        pic_url:cover,
        img:cover,
        url:'hiker://empty',
        col_type:'pic_1_full',
        extra:{lineVisible:false}
      });
    }
    add(list,{
      title:'<b>'+escHtml(x.title || '影片')+'</b>',
      col_type:'rich_text',
      url:'hiker://empty',
      extra:{lineVisible:false}
    });
    if (x.date) meta.push(x.date);
    if (x.duration) meta.push(x.duration);
    if (meta.length) add(list,{title:meta.join('  ·  '),col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});

    id = 'madou_t8_play_' + hash(u);
    media = C.resolveDirectMedia(html,u);
    if (media && media.url) {
      play = {
        title:'▶ 立即播放',
        desc:'免嗅直连 · 已解析真实媒体',
        col_type:'text_center_1',
        url:playerUrl(media.url,media.ref || u),
        extra:{id:id,lineVisible:false}
      };
    } else {
      play = sniffFallback(u,id);
    }
    add(list,play);
    divider(list);

    if (x.tags && x.tags.length) {
      section(list,'相关标签','');
      for(i=0;i<x.tags.length && i<14;i++){
        add(list,{
          title:x.tags[i].name,
          col_type:'scroll_button',
          url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),
          extra:{lineVisible:false}
        });
      }
      add(list,{col_type:'blank_block'});
    }

    if (x.related && x.related.length) {
      section(list,'相关推荐','');
      for(i=0;i<x.related.length && i<18;i++){
        add(list,{
          title:x.related[i].title || '影片',
          desc:x.related[i].desc || '',
          pic_url:x.related[i].img || '',
          img:x.related[i].img || '',
          url:C.page('madouDetail',{u:x.related[i].url}),
          col_type:'movie_2',
          extra:{lineVisible:false,id:'madou_t8_related_'+i}
        });
      }
    }

    divider(list);
    fav = C.isFav(u);
    add(list,{
      title:fav ? '★ 取消本地收藏' : '☆ 加入本地收藏',
      desc:historyOk ? '已记录本次浏览' : '浏览记录异常时已自动跳过',
      col_type:'text_center_1',
      url:$(u).lazyRule(function(boot,target,tt,im,ds){
        require(boot,{headers:{'Cache-Control':'no-cache'}},10108);
        MadouBoot.loadOnly();
        MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});
        refreshPage(false);
        return 'toast://收藏状态已更新';
      },C.bootstrap,u,x.title || '影片',x.cover || '',x.date || x.duration || ''),
      extra:{lineVisible:false}
    });
    setResult(list);
  };
})();
