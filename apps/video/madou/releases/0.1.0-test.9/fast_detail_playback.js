/* 麻豆传媒 Test9 - fast detail + targeted WebRule playback bridge */
(function(){
  if (typeof MadouCore === 'undefined' || typeof MadouRemoteRuntime === 'undefined') {
    throw new Error('Madou runtime unavailable');
  }

  var C = MadouCore;
  var R = MadouRemoteRuntime;
  var ROOT = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';

  C.version = '0.1.0-test.9';
  C.build = 10109;
  R.version = '0.1.0-test.9';
  R.build = 10109;
  C.bootstrap = ROOT + 'bootstrap_test_v9_b10109.js?v=10109';

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
  function safeAbs(raw,base){
    try { return C.abs(str(raw),base || C.base + '/'); } catch(e) { return ''; }
  }
  function isMedia(u){ return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(str(u)); }
  function playerUrl(source,ref){
    source = str(source);
    ref = str(ref || C.base + '/');
    if (!source) return '';
    return source + ';{User-Agent@' + C.ua + '&&Referer@' + ref + '}#isVideo=true#';
  }

  // Detail render is forbidden from chasing player pages. Test8 did multiple
  // synchronous player/nested-player requests and made opening detail slow.
  // Test9 only scans the HTML already fetched for the detail page.
  function directFromCurrentHtml(html,base){
    var s = str(html).replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\\//g,'/');
    var out = [], seen = {}, re, m;
    function push(raw,ref){
      var x = safeAbs(raw,ref || base);
      if (!x || !isMedia(x) || seen[x]) return;
      seen[x] = 1;
      out.push({url:x,ref:ref || base});
    }
    re = /(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;
    while((m=re.exec(s))) push(m[1],base);
    re = /(?:file|src|source|videoUrl|video_url|playUrl|play_url|m3u8|url)\s*[:=]\s*["']([^"']+)["']/ig;
    while((m=re.exec(s))) push(m[1],base);
    re = /<(?:video|source)\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;
    while((m=re.exec(s))) push(m[1],base);
    if (!out.length) return null;
    out.sort(function(a,b){
      try { return C.mediaScore(b.url) - C.mediaScore(a.url); } catch(e) { return 0; }
    });
    return out[0];
  }

  function playerTargetFromHtml(html,detailUrl){
    var s = str(html).replace(/\\u002[fF]/g,'/').replace(/\\u003[aA]/g,':').replace(/\\\//g,'/');
    var re, m, u, candidates = [], seen = {};
    function push(raw,score){
      var x = safeAbs(raw,detailUrl);
      if (!x || !/^https?:\/\//i.test(x) || isMedia(x) || seen[x]) return;
      seen[x] = 1;
      candidates.push({url:x,score:score || 0});
    }
    re = /<iframe\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;
    while((m=re.exec(s))) push(m[1],100);
    re = /(?:player|embed|iframe|playUrl|play_url|playerUrl|player_url)\s*[:=]\s*["']([^"']+)["']/ig;
    while((m=re.exec(s))) push(m[1],80);
    re = /(?:src|url)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/ig;
    while((m=re.exec(s))) {
      u = m[1];
      if (/(player|embed|play|video)/i.test(u)) push(u,50);
    }
    if (!candidates.length) return detailUrl;
    candidates.sort(function(a,b){ return b.score-a.score; });
    return candidates[0].url;
  }

  function fastWebRule(target,detailUrl,id){
    var js = $.toString(function(){
      function good(u){
        u = String(u || '');
        if (!u || /^blob:/i.test(u)) return false;
        return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(u);
      }
      function choose(arr){
        if (!arr || !arr.length) return '';
        var i,u,best='';
        for(i=arr.length-1;i>=0;i--){
          u=String(arr[i]||'');
          if(!good(u)) continue;
          if(/\.m3u8(?:[?#]|$)/i.test(u)) return u;
          if(!best) best=u;
        }
        return best;
      }
      try{
        var v=document.querySelector('video');
        var vu=v&&(v.currentSrc||v.src||v.getAttribute('src'));
        if(good(vu)) return vu;
        var src=document.querySelector('video source[src],source[type*="video"][src]');
        var su=src&&src.getAttribute('src');
        if(good(su)) return su;
      }catch(e0){}
      try{
        if(typeof window._getUrls==='function'){
          var hit=choose(window._getUrls());
          if(hit) return hit;
        }
      }catch(e1){}
      try{
        if(typeof fy_bridge_app!=='undefined'&&fy_bridge_app&&typeof fy_bridge_app.getUrls==='function'){
          var raw=String(fy_bridge_app.getUrls()||'');
          var ms=raw.match(/https?:\/\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:[^\s"'<>]*)?/ig);
          var hit2=choose(ms||[]);
          if(hit2) return hit2;
        }
      }catch(e2){}
      return '';
    });
    return {
      title:'▶ 立即播放',
      desc:'快速解析 · 直接加载播放器页，不加载完整详情页',
      col_type:'text_center_1',
      url:'webRule://' + target + '@' + js,
      extra:{
        id:id,
        lineVisible:false,
        ua:C.ua,
        referer:detailUrl,
        blockRules:['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','banner','advert','ads','doubleclick','googleads','analytics','googletag','facebook','telegram']
      }
    };
  }

  R.detail = function(){
    var u = C.param('u','');
    var list = [];
    var html,x,cover,direct,target,play,id,fav,i,historyOk,meta=[];
    try { setPageTitle('影片详情'); } catch(e0) {}

    // Exactly one network request during detail render.
    html = C.fetchPlainHtml(u);
    if (C.isBadHtml(html)) {
      section(list,'详情暂时不可用','当前直连没有获取到有效详情数据。');
      add(list,fastWebRule(u,u,'madou_t9_play_'+hash(u)));
      setResult(list);
      return;
    }

    x = C.detail(html,u);
    try { setPageTitle(x.title || '影片详情'); } catch(e1) {}
    cover = C.image(x.cover,u);
    historyOk = false;
    try { historyOk = C.addHistory({url:u,title:x.title || '影片',img:cover,rawImg:x.cover,desc:x.date || x.duration || ''}); } catch(e2) {}

    if (cover) add(list,{title:'',pic_url:cover,img:cover,url:'hiker://empty',col_type:'pic_1_full',extra:{lineVisible:false}});
    add(list,{title:'<b>'+escHtml(x.title || '影片')+'</b>',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});
    if (x.date) meta.push(x.date);
    if (x.duration) meta.push(x.duration);
    if (meta.length) add(list,{title:meta.join('  ·  '),col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});

    id = 'madou_t9_play_' + hash(u);
    direct = directFromCurrentHtml(html,u);
    if (!direct && x.sources && x.sources.length) direct = {url:x.sources[0],ref:u};
    if (direct && direct.url) {
      play = {title:'▶ 立即播放',desc:'直连播放 · 当前详情已包含媒体地址',col_type:'text_center_1',url:playerUrl(direct.url,direct.ref || u),extra:{id:id,lineVisible:false}};
    } else {
      target = playerTargetFromHtml(html,u);
      play = fastWebRule(target,u,id);
    }
    add(list,play);
    divider(list);

    if (x.tags && x.tags.length) {
      section(list,'相关标签','');
      for(i=0;i<x.tags.length && i<14;i++) add(list,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});
      add(list,{col_type:'blank_block'});
    }

    if (x.related && x.related.length) {
      section(list,'相关推荐','');
      for(i=0;i<x.related.length && i<18;i++) add(list,{title:x.related[i].title || '影片',desc:x.related[i].desc || '',pic_url:x.related[i].img || '',img:x.related[i].img || '',url:C.page('madouDetail',{u:x.related[i].url}),col_type:'movie_2',extra:{lineVisible:false,id:'madou_t9_related_'+i}});
    }

    divider(list);
    fav = C.isFav(u);
    add(list,{
      title:fav ? '★ 取消本地收藏' : '☆ 加入本地收藏',
      desc:historyOk ? '已记录本次浏览' : '浏览记录异常时已自动跳过',
      col_type:'text_center_1',
      url:$(u).lazyRule(function(boot,targetUrl,tt,im,ds){
        require(boot,{headers:{'Cache-Control':'no-cache'}},10109);
        MadouBoot.loadOnly();
        MadouCore.toggleFav({url:targetUrl,title:tt,img:im,rawImg:im,desc:ds});
        refreshPage(false);
        return 'toast://收藏状态已更新';
      },C.bootstrap,u,x.title || '影片',x.cover || '',x.date || x.duration || ''),
      extra:{lineVisible:false}
    });
    setResult(list);
  };
})();
