/* 麻豆传媒 Test11 - detail load preferences + HTTP-only no-sniff playback */
(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined') throw new Error('Madou runtime unavailable');
  var C=MadouCore,R=MadouRemoteRuntime;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var DETAIL_MODE_KEY='madou_t11_detail_extra_mode';
  var PLAY_FALLBACK_KEY='madou_t11_play_sniff_fallback';
  var PLAY_CACHE_KEY='madou_t11_direct_media_cache_v1';
  var PLAY_DIAG_KEY='madou_t11_last_play_diag';
  var PLAY_TTL=30*60*1000;

  C.version='0.1.0-test.11'; C.build=10111;
  R.version='0.1.0-test.11'; R.build=10111;
  C.bootstrap=ROOT+'bootstrap_test_v11_b10111.js?v=10111';

  function str(v){return v===undefined||v===null?'':String(v);}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function hash(v){var x=str(v),h=0,i;for(i=0;i<x.length;i++)h=((h<<5)-h+x.charCodeAt(i))|0;return Math.abs(h);}
  function setting(key,def){var v='';try{v=str(getItem(key,def));}catch(e){v=def;}return v||def;}
  function setSetting(key,val){try{setItem(key,str(val));return true;}catch(e){return false;}}
  function rawImage(c){var x=str((c&&c.rawImg)||'');if(x)return x;var y=str((c&&c.img)||''),p=y.indexOf('@headers=');return p>0?y.substring(0,p):y;}
  function routeCard(c){return C.page('madouDetail',{u:c.url,t:c.title||'影片',im:rawImage(c),ds:c.desc||''});}
  function renderCards(d,cards,limit,prefix){var max=limit||cards.length,i,c;for(i=0;i<cards.length&&i<max;i++){c=cards[i]||{};add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||'',img:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{lineVisible:false,id:(prefix||'madou_t11_card_')+i}});}}

  function normalizeText(s){
    s=str(s);
    try{s=C.decode(s);}catch(e0){}
    return s
      .replace(/\\u002[fF]/g,'/')
      .replace(/\\u003[aA]/g,':')
      .replace(/\\u0026/g,'&')
      .replace(/\\x2[fF]/g,'/')
      .replace(/\\x3[aA]/g,':')
      .replace(/\\\//g,'/');
  }
  function abs(raw,base){try{return C.abs(normalizeText(raw),base);}catch(e){return'';}}
  function isMedia(u){return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(str(u));}
  function badMedia(u){return /(advert|ads|promo|banner|trailer|sample|preview-ad|preload-ad)/i.test(str(u));}
  function mediaScore(u){var n=0;try{n=C.mediaScore(u);}catch(e){}if(/master|index/i.test(str(u)))n+=1;if(badMedia(u))n-=20;return n;}

  function b64decode(input){
    var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',s=str(input).replace(/[-_]/g,function(m){return m==='-'?'+':'/';}).replace(/[^A-Za-z0-9+\/=]/g,''),out='',i=0,c1,c2,c3,e1,e2,e3,e4;
    while(i<s.length){
      e1=chars.indexOf(s.charAt(i++));e2=chars.indexOf(s.charAt(i++));e3=chars.indexOf(s.charAt(i++));e4=chars.indexOf(s.charAt(i++));
      if(e1<0||e2<0)break;
      c1=(e1<<2)|(e2>>4);out+=String.fromCharCode(c1);
      if(e3>=0){c2=((e2&15)<<4)|(e3>>2);out+=String.fromCharCode(c2);}
      if(e4>=0){c3=((e3&3)<<6)|e4;out+=String.fromCharCode(c3);}
    }
    return out;
  }
  function unescapeJs(s){
    return str(s)
      .replace(/\\x([0-9a-fA-F]{2})/g,function(_,h){return String.fromCharCode(parseInt(h,16));})
      .replace(/\\u([0-9a-fA-F]{4})/g,function(_,h){return String.fromCharCode(parseInt(h,16));})
      .replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t')
      .replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\\\/g,'\\');
  }
  function encodeRadix(num,radix){
    var alpha='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',n=Number(num),out='';
    if(n===0)return'0';
    while(n>0){out=alpha.charAt(n%radix)+out;n=Math.floor(n/radix);}return out;
  }
  function unpackPacker(src){
    var s=str(src),m=s.match(/}\(\s*'((?:\\.|[^'])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'])*)'\.split\(\s*'\|'\s*\)/);
    if(!m)m=s.match(/}\(\s*"((?:\\.|[^"])*)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*"((?:\\.|[^"])*)"\.split\(\s*"\|"\s*\)/);
    if(!m)return'';
    var payload=unescapeJs(m[1]),radix=parseInt(m[2],10)||36,count=parseInt(m[3],10)||0,words=unescapeJs(m[4]).split('|'),i,k,re;
    if(radix<2||radix>62)return'';
    for(i=count-1;i>=0;i--){if(!words[i])continue;k=encodeRadix(i,radix);try{re=new RegExp('\\b'+k+'\\b','g');payload=payload.replace(re,words[i]);}catch(e){}}
    return payload;
  }

  function expandedTexts(src){
    var base=normalizeText(src),q=[base],out=[],seen={},depth=0,i,s,m,re,dec,packed;
    while(q.length&&depth<24){
      s=str(q.shift());depth++;if(!s||seen[s])continue;seen[s]=1;out.push(s);
      if(/%2[fF]|%3[aA]|%68%74%74%70/i.test(s)){
        try{dec=decodeURIComponent(s);if(dec&&dec!==s&&dec.length<500000)q.push(normalizeText(dec));}catch(e0){}
      }
      packed=unpackPacker(s);if(packed&&packed!==s&&packed.length<500000)q.push(normalizeText(packed));
      re=/(?:atob|base64_decode)\s*\(\s*["']([A-Za-z0-9+\/_=-]{24,})["']\s*\)/ig;
      while((m=re.exec(s))){dec=b64decode(m[1]);if(dec&&dec.length<300000)q.push(normalizeText(dec));}
      re=/["']([A-Za-z0-9+\/_=-]{80,})["']/g;i=0;
      while((m=re.exec(s))&&i<8){i++;dec=b64decode(m[1]);if(/https?:|m3u8|mp4|source|file|player|video/i.test(dec))q.push(normalizeText(dec));}
    }
    return out;
  }

  function scanMedia(src,base){
    var texts=expandedTexts(src),best=null,seen={},i,s,re,m;
    function push(raw,ref){
      var x=abs(raw,ref||base);if(!x||!isMedia(x)||badMedia(x)||seen[x])return;seen[x]=1;
      var item={url:x,ref:ref||base,score:mediaScore(x)};if(!best||item.score>best.score)best=item;
    }
    for(i=0;i<texts.length;i++){
      s=texts[i];
      re=/(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;while((m=re.exec(s)))push(m[1],base);
      re=/(\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/ig;while((m=re.exec(s)))push(m[1],base);
      re=/(?:file|src|source|videoUrl|video_url|playUrl|play_url|m3u8|url)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig;while((m=re.exec(s)))push(m[1],base);
      re=/<(?:video|source)\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],base);
    }
    return best;
  }

  function collectTargets(src,base){
    var texts=expandedTexts(src),arr=[],seen={},i,s,re,m,u;
    function push(raw,score,type){
      var x=abs(raw,base);if(!x||!/^https?:\/\//i.test(x)||isMedia(x)||seen[x])return;
      if(/\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|woff2?)(?:[?#]|$)/i.test(x))return;
      seen[x]=1;arr.push({url:x,score:score||0,type:type||'player'});
    }
    for(i=0;i<texts.length;i++){
      s=texts[i];
      re=/<iframe\b[^>]*(?:src|data-src|data-url)\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],120,'iframe');
      re=/(?:playerUrl|player_url|embedUrl|embed_url|iframe|player|embed|playUrl|play_url)\s*[:=]\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1],100,'player');
      re=/(?:fetch|axios\.get|\$\.get)\s*\(\s*["']([^"']+)["']/ig;while((m=re.exec(s)))push(m[1],/(api|source|play|video|url)/i.test(m[1])?95:35,'api');
      re=/<script\b[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re.exec(s)))push(m[1],/(player|video|hls|play|source|app)/i.test(m[1])?80:20,'script');
      re=/(https?:\/\/[^\s"'<>]+)/ig;while((m=re.exec(s))){u=m[1];if(/(player|embed|play|video|source|api)/i.test(u))push(u,50,'player');}
    }
    arr.sort(function(a,b){return b.score-a.score;});return arr;
  }

  function httpGet(url,ref,timeout){
    var h='';try{h=str(fetch(url,{timeout:Number(timeout||3800),headers:C.headers(ref||url)}));}catch(e){}return h;
  }
  function readPlayCache(url){
    var raw='[]',a=[],now=Date.now(),i,x;try{raw=str(getItem(PLAY_CACHE_KEY,'[]'));}catch(e0){}if(raw.length>120000)return null;try{a=JSON.parse(raw);}catch(e1){return null;}
    for(i=0;i<a.length;i++){x=a[i];if(x&&x.page===url&&x.media&&now-Number(x.ts||0)<PLAY_TTL)return x;}return null;
  }
  function savePlayCache(page,media,ref,stage){
    var raw='[]',a=[],out=[{page:str(page).substring(0,1600),media:str(media).substring(0,3500),ref:str(ref).substring(0,1600),stage:str(stage).substring(0,80),ts:Date.now()}],i,txt;
    try{raw=str(getItem(PLAY_CACHE_KEY,'[]'));a=JSON.parse(raw);}catch(e0){a=[];}
    for(i=0;i<a.length&&out.length<20;i++)if(a[i]&&a[i].page!==page&&Date.now()-Number(a[i].ts||0)<PLAY_TTL)out.push(a[i]);
    txt=JSON.stringify(out);while(txt.length>100000&&out.length>2){out.pop();txt=JSON.stringify(out);}try{setItem(PLAY_CACHE_KEY,txt);}catch(e1){}
  }
  function playerOut(media,ref){
    var r=ref||C.base+'/',o='';try{o=C.origin(r);}catch(e){}
    return media+';{User-Agent@'+C.ua+'&&Referer@'+r+(o?'&&Origin@'+o:'')+'}#isVideo=true#';
  }
  function saveDiag(text){try{setItem(PLAY_DIAG_KEY,str(text).substring(0,1800));}catch(e){}}

  C.resolveNoSniff=function(detailUrl){
    var cached=readPlayCache(detailUrl),diag=[],html='',hit=null,targets=[],i,j,t,p,more=[],seen={},scriptBudget=0,apiBudget=0,hint='';
    if(cached){saveDiag('CACHE '+cached.stage+' · '+cached.media.substring(0,160));return playerOut(cached.media,cached.ref||detailUrl);}
    try{hint=str(getMyVar('madou_t11_player_hint_'+hash(detailUrl),''));}catch(e0){}
    if(hint)targets.push({url:hint,score:200,type:'hint'});
    html=httpGet(detailUrl,detailUrl,4200);diag.push('detail='+(html?html.length:0));
    if(html){
      hit=scanMedia(html,detailUrl);if(hit){savePlayCache(detailUrl,hit.url,hit.ref||detailUrl,'detail');saveDiag(diag.join(' · ')+' · HIT detail');return playerOut(hit.url,hit.ref||detailUrl);}
      more=collectTargets(html,detailUrl);for(i=0;i<more.length;i++)targets.push(more[i]);
    }
    for(i=0;i<targets.length&&i<6;i++){
      t=targets[i];if(!t||!t.url||seen[t.url])continue;seen[t.url]=1;
      if(t.type==='script'&&scriptBudget>=2)continue;if(t.type==='api'&&apiBudget>=2)continue;
      if(t.type==='script')scriptBudget++;if(t.type==='api')apiBudget++;
      p=httpGet(t.url,detailUrl,t.type==='script'?2600:3400);diag.push(t.type+'#'+i+'='+(p?p.length:0));if(!p)continue;
      hit=scanMedia(p,t.url);if(hit){savePlayCache(detailUrl,hit.url,hit.ref||t.url,t.type);saveDiag(diag.join(' · ')+' · HIT '+t.type);return playerOut(hit.url,hit.ref||t.url);}
      more=collectTargets(p,t.url);
      for(j=0;j<more.length&&targets.length<14;j++){
        if(more[j]&&!seen[more[j].url]&&(more[j].type==='api'||more[j].type==='script'||more[j].score>=80))targets.push(more[j]);
      }
    }
    saveDiag(diag.join(' · ')+' · MISS HTTP_ONLY');
    return '';
  };

  function compactDetail(x){
    var o={title:str(x&&x.title||'').substring(0,220),cover:str(x&&x.cover||'').substring(0,1800),date:str(x&&x.date||'').substring(0,80),duration:str(x&&x.duration||'').substring(0,80),tags:[],related:[]},i,c,raw;
    for(i=0;i<((x&&x.tags)||[]).length&&i<14;i++){c=x.tags[i]||{};if(c.name&&c.url)o.tags.push({name:str(c.name).substring(0,80),url:str(c.url).substring(0,1600)});}
    for(i=0;i<((x&&x.related)||[]).length&&i<18;i++){c=x.related[i]||{};raw=rawImage(c);if(c.url)o.related.push({url:str(c.url).substring(0,1600),title:str(c.title||'影片').substring(0,180),desc:str(c.desc||'').substring(0,220),rawImg:str(raw).substring(0,1600)});}
    return o;
  }
  function storeDetailVar(key,x){var txt='';try{txt=JSON.stringify(compactDetail(x));if(txt.length<65000)putMyVar(key,txt);}catch(e){}}
  function readDetailVar(key,u){var raw='',o=null,i;try{raw=str(getMyVar(key,''));if(raw)o=JSON.parse(raw);}catch(e0){o=null;}if(!o)return null;for(i=0;i<(o.related||[]).length;i++){var c=o.related[i];c.img=c.rawImg?C.image(c.rawImg,c.url):'';}return o;}

  R.detail=function(){
    var u=C.param('u',''),seedTitle=C.param('t',''),seedImg=C.param('im',''),seedDesc=C.param('ds','');
    var fullKey='madou_t11_detail_full_'+hash(u),dataKey=fullKey+'_data',mode=setting(DETAIL_MODE_KEY,'manual'),manual=false,needFetch=false;
    try{manual=getMyVar(fullKey,'0')==='1';}catch(e0){}
    try{setPageTitle(seedTitle||'影片详情');}catch(e1){}
    var d=[],x=readDetailVar(dataKey,u),html='',title=seedTitle||'影片',rawCover=seedImg||'',cover='',meta=seedDesc||'',direct=null,target='',i,historyOk=false,showTags=false,showRelated=false;
    needFetch=!x&&(!seedTitle||manual||mode!=='manual');
    if(needFetch){
      html=C.fetchPlainHtml(u,6500);
      if(!C.isBadHtml(html)){
        x=C.detail(html,u);storeDetailVar(dataKey,x);
        direct=scanMedia(html,u);if(direct)savePlayCache(u,direct.url,direct.ref||u,'detail-prefetch');
        var tt=collectTargets(html,u);if(tt.length){target=tt[0].url;try{putMyVar('madou_t11_player_hint_'+hash(u),target);}catch(e2){}}
      }
    }
    if(x){title=x.title||title;rawCover=x.cover||rawCover;meta=(x.date||'')+(x.date&&x.duration?' · ':'')+(x.duration||'')||meta;}
    try{setPageTitle(title||'影片详情');}catch(e3){}
    cover=rawCover?C.image(rawCover,u):'';
    try{historyOk=C.addHistory({url:u,title:title||'影片',img:cover,rawImg:rawCover,desc:meta||''});}catch(e4){}
    if(cover)add(d,{title:'',pic_url:cover,img:cover,url:'hiker://empty',col_type:'pic_1_full',extra:{lineVisible:false}});
    add(d,{title:title||'影片',desc:meta||'',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});

    var pc=readPlayCache(u),playDesc=pc?'免嗅直连 · 已缓存真实媒体':'纯免嗅 · HTTP/JS协议解析，不启动WebView';
    add(d,{title:'▶ 立即播放',desc:playDesc,col_type:'text_center_1',url:$(u).lazyRule(function(boot,target,fallbackKey){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10111);MadouBoot.loadOnly();
      var out=MadouCore.resolveNoSniff(target);if(out)return out;
      var fb='0';try{fb=String(getItem(fallbackKey,'0'));}catch(e){}
      if(fb==='1')return 'video://'+target;
      return 'toast://纯免嗅未解析到媒体，请在设置查看诊断；也可手动开启兼容嗅探兜底';
    },C.bootstrap,u,PLAY_FALLBACK_KEY),extra:{id:'madou_t11_play_'+hash(u),lineVisible:false}});
    divider(d);

    showTags=!!x&&(manual||mode==='tags'||mode==='all');
    showRelated=!!x&&(manual||mode==='all');
    if(showTags&&x.tags&&x.tags.length){section(d,'相关标签','');for(i=0;i<x.tags.length&&i<14;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name}),extra:{lineVisible:false}});}
    if(showRelated&&x.related&&x.related.length){section(d,'相关推荐','');renderCards(d,x.related,18,'madou_t11_related_');}

    if(mode==='manual'&&!manual){
      add(d,{title:'加载标签与相关推荐',desc:'当前设置：手动加载（最快）',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){putMyVar(k,'1');refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    }else if(mode==='tags'&&!manual){
      add(d,{title:'加载相关推荐',desc:'当前设置：标签自动加载，相关推荐手动加载',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){putMyVar(k,'1');refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    }else if(manual&&mode!=='all'){
      add(d,{title:'收起手动扩展信息',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){clearMyVar(k);refreshPage(false);return'hiker://empty';},fullKey),extra:{lineVisible:false}});
    }

    var fav=C.isFav(u);add(d,{title:fav?'★ 取消本地收藏':'☆ 加入本地收藏',desc:historyOk?'已记录本次浏览':'浏览记录写入失败时已自动跳过',col_type:'text_center_1',url:$(u).lazyRule(function(boot,targetUrl,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10111);MadouBoot.loadOnly();MadouCore.toggleFav({url:targetUrl,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://收藏状态已更新';},C.bootstrap,u,title||'影片',rawCover||'',meta||''),extra:{lineVisible:false}});
    add(d,{title:'⚙ 详情与播放设置',desc:'选择标签/推荐加载方式与纯免嗅策略',col_type:'text_center_1',url:C.page('madouSettings'),extra:{lineVisible:false}});
    setResult(d);
  };

  R.settings=function(){
    try{setPageTitle('设置与诊断');}catch(e0){}
    var d=[],mode=setting(DETAIL_MODE_KEY,'manual'),fallback=setting(PLAY_FALLBACK_KEY,'0'),diag='';try{diag=str(getItem(PLAY_DIAG_KEY,''));}catch(e1){}
    section(d,'影片详情','控制所有影片详情页是否主动请求扩展信息');
    add(d,{title:(mode==='manual'?'● ':'')+'手动加载',desc:'最快：详情首屏不请求标签/推荐，按需再加载',col_type:'text_1',url:$('#noLoading#').lazyRule(function(k){setItem(k,'manual');refreshPage(false);return'hiker://empty';},DETAIL_MODE_KEY),extra:{lineVisible:false}});
    add(d,{title:(mode==='tags'?'● ':'')+'自动加载标签',desc:'进入详情时请求一次详情，只自动显示标签',col_type:'text_1',url:$('#noLoading#').lazyRule(function(k){setItem(k,'tags');refreshPage(false);return'hiker://empty';},DETAIL_MODE_KEY),extra:{lineVisible:false}});
    add(d,{title:(mode==='all'?'● ':'')+'自动加载标签 + 相关推荐',desc:'进入详情时自动请求并显示全部扩展信息',col_type:'text_1',url:$('#noLoading#').lazyRule(function(k){setItem(k,'all');refreshPage(false);return'hiker://empty';},DETAIL_MODE_KEY),extra:{lineVisible:false}});

    divider(d);section(d,'播放策略','默认严格使用纯 HTTP/JS 协议解析，不启动 WebView/video://');
    add(d,{title:'● 纯免嗅优先',desc:'详情页/播放器页/脚本/API 只使用 HTTP 请求与静态 JS 解码；命中真实 M3U8/MP4 后直接交播放器',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:(fallback==='1'?'● ':'')+'免嗅失败后允许兼容嗅探',desc:fallback==='1'?'已开启：只有纯免嗅失败才回退 video://':'已关闭：纯免嗅失败直接提示，不启动浏览器嗅探',col_type:'text_1',url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v==='1'?'0':'1');refreshPage(false);return'hiker://empty';},PLAY_FALLBACK_KEY,fallback),extra:{lineVisible:false}});
    add(d,{title:'清空免嗅媒体缓存',desc:'重新解析真实媒体地址',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k){try{clearItem(k);}catch(e){}refreshPage(false);return'toast://免嗅媒体缓存已清空';},PLAY_CACHE_KEY),extra:{lineVisible:false}});
    if(diag)add(d,{title:'最近一次免嗅诊断',desc:diag,col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    divider(d);section(d,'运行信息','Test11 · Build 10111 · 基于 Test10 性能运行时');
    add(d,{title:'原站网页',desc:C.base,col_type:'text_center_1',url:'web://'+C.base+'/',extra:{lineVisible:false}});
    setResult(d);
  };
})();
