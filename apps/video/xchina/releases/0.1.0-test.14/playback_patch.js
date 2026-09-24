/* xChina Test14 playback-only hotfix
 * Loaded after Test13. Do not alter list/model/photo/comic contracts.
 * Goal: stop doing slow static media guessing on detail render and capture ONLY the live page's real m3u8.
 */
(function(K,R){
  if(!K||!R||String(R.version)!=='0.1.0-test.13'||Number(R.build)!==10113)throw new Error('Test14 playback patch: Test13 未加载');
  var C=K.C,s=K.s,safeDecode=K.safeDecode,param=K.param,page=K.page,section=K.section,empty=K.empty,btn=K.btn;
  var oldDetail=R.detail;

  function primaryPage(u){
    var p=s(u).replace(/^https?:\/\/[^\/]+/i,'');
    return C.primary+(p.charAt(0)==='/'?p:'/'+p);
  }
  function autoplayJs(){
    return "(function(){try{var v=document.querySelector('.main-container video,video');if(v){v.muted=true;var p=v.play();}var b=document.querySelector('.main-container .vjs-big-play-button,.main-container .jw-display-icon-container,.main-container .plyr__control--overlaid,.main-container [class*=play-button]');if(b&&!window.__xc14clicked){window.__xc14clicked=1;b.click();}}catch(e){}})();";
  }
  function sniffExtra(){
    return {
      lineVisible:false,
      ua:C.ua,
      referer:C.primary+'/',
      cacheM3u8:true,
      videoRules:['.m3u8'],
      videoExcludeRules:['.mp4','/ads/','/ad/','advert','banner','promo','doubleclick','googlesyndication','google-analytics','analytics','tracking','vast','ima'],
      blockRules:['doubleclick','googlesyndication','google-analytics','googletagmanager','.woff','.woff2','.ttf','.ico'],
      js:autoplayJs()
    };
  }
  function captureScript(){
    return $.toString(function(){
      function clean(u){
        u=String(u||'').replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/&amp;/ig,'&').trim();
        if(/^\/\//.test(u))u='https:'+u;
        return u;
      }
      function bad(u){return /(?:doubleclick|googlesyndication|google-analytics|analytics|tracking|\/ads?(?:\/|\?|$)|advert|banner|promo|vast|ima)/i.test(String(u||''));}
      function good(u){u=clean(u);return /^https?:\/\//i.test(u)&&/\.m3u8(?:$|[?#])/i.test(u)&&!bad(u);}
      function kick(){
        try{
          var v=document.querySelector('.main-container video,video');
          if(v){v.muted=true;try{v.play();}catch(e){}}
          var b=document.querySelector('.main-container .vjs-big-play-button,.main-container .jw-display-icon-container,.main-container .plyr__control--overlaid,.main-container [class*=play-button]');
          if(b&&!window.__xc14clicked){window.__xc14clicked=1;try{b.click();}catch(e2){}}
        }catch(e3){}
      }
      kick();
      try{
        var box=document.querySelector('.main-container');
        if(box){
          var v=box.querySelector('video,source'),src=v&&(v.currentSrc||v.src||v.getAttribute('src'));
          if(good(src))return clean(src);
          var h=String(box.innerHTML||''),m=h.match(/[\"']((?:https?:)?\\?\/\\?\/[^\"']*?\.m3u8[^\"']*)[\"']/i);
          if(m&&good(m[1]))return clean(m[1]);
        }
      }catch(e4){}
      var a=[],seen={},i,u,best='';
      try{if(window._getUrls){var z=window._getUrls()||[];for(i=0;i<z.length;i++)a.push(z[i]);}}catch(e5){}
      try{if(typeof fy_bridge_app!=='undefined'&&fy_bridge_app.getUrls){var gs=String(fy_bridge_app.getUrls()||'').split(/\n|\r|\|\|/);for(i=0;i<gs.length;i++)a.push(gs[i]);}}catch(e6){}
      try{var ps=(window.performance&&performance.getEntriesByType)?performance.getEntriesByType('resource'):[];for(i=0;i<ps.length;i++)a.push(ps[i].name);}catch(e7){}
      for(i=0;i<a.length;i++){
        u=clean(a[i]);if(!good(u)||seen[u])continue;seen[u]=1;
        if(/(?:playhls|\/hls\/|master\.m3u8|index\.m3u8)/i.test(u))return u;
        if(!best)best=u;
      }
      return best||'';
    });
  }
  function webCaptureUrl(pageUrl,engine){
    var p=primaryPage(pageUrl),prefix=engine==='x5'?'x5Rule://':'webRule://';
    return prefix+p+'@'+captureScript();
  }
  function modelButtons(d,tags){
    if(!tags||!tags.length)return;
    var i,t,shown=0;
    d.push(section('👩 女优 / 模特',''));
    for(i=0;i<tags.length;i++){
      t=tags[i];if(t.kind!=='model'||!t.href)continue;
      d.push({title:'👩 '+t.name,url:page('xchinaModel',{xc_url:t.href,t:'model'}),col_type:'scroll_button',extra:{lineVisible:false}});shown++;
    }
    if(!shown)d.pop();
  }
  function videoDetail(){
    var d=[],url=safeDecode(param('xc_url',''));
    if(!url){d.push(empty('缺少视频地址',''));setResult(d);return;}
    var res=K.fetchPage(url,'video'),info=K.detailInfo(res.html,url,'video'),tags=K.detailTags?K.detailTags(res.html,url,'video'):[],p=primaryPage(url);
    setPageTitle(info.title);
    d.push({title:info.title,desc:'💽 视频',img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    modelButtons(d,tags);
    d.push({title:'▶️ 播放',desc:'精准捕获当前页面真实 M3U8 · 不识别 MP4 广告',url:webCaptureUrl(p,'web'),col_type:'text_center_1',extra:{lineVisible:false,ua:C.ua,referer:C.primary+'/',blockRules:['doubleclick','googlesyndication','google-analytics','googletagmanager','.woff','.woff2','.ttf','.ico']}});
    d.push(btn('🎯 播放诊断 / 备用引擎',page('xchinaMedia',{xc_url:p,t:'video'})));
    d.push(btn('🌐 原站','web://'+p));
    if(!res.ok)d.push(empty('页面可能被验证拦截','先到设置用 X5 完成主站验证，再返回播放'));
    setResult(d);
  }
  R.detail=function(){
    var url=safeDecode(param('xc_url','')),type=param('t','');
    if(!type&&/\/video\//.test(url))type='video';
    if(type==='video')return videoDetail();
    return oldDetail();
  };
  R.videoDetail=videoDetail;

  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),p=primaryPage(url),e=sniffExtra();
    setPageTitle('🎬 播放专项');
    d.push(section('主线路','这版只处理播放，不再做列表/UI扩展。优先从 main-container / 页面实际网络请求中捕获 m3u8。'));
    d.push({title:'▶️ WebKit 精准捕获',desc:'首选：只返回 M3U8；过滤 MP4 和常见广告/统计请求',url:webCaptureUrl(p,'web'),col_type:'text_1',extra:{lineVisible:false,ua:C.ua,referer:C.primary+'/',blockRules:e.blockRules}});
    d.push({title:'▶️ X5 精准捕获',desc:'WebKit 无结果时测试同一套 M3U8 过滤逻辑',url:webCaptureUrl(p,'x5'),col_type:'text_1',extra:{lineVisible:false,ua:C.ua,referer:C.primary+'/',blockRules:e.blockRules}});
    d.push({title:'▶️ M3U8-only 自动提取',desc:'最后兜底：海阔原生 video://，只允许 .m3u8，明确排除 MP4 广告',url:'video://'+p,col_type:'text_1',extra:e});
    d.push(btn('🌐 原站核对','web://'+p));
    setResult(d);
  };

  R.settings=function(){
    var d=[],fixed=K.getFixedBase(),last=K.getLastBase(),b=fixed||last||C.primary;setPageTitle('⚙️ 小黄书设置');
    d.push(section('ℹ️ 状态','Test 0.1.0-test.14 · Build 10114'));
    d.push(section('🎬 本轮只修播放','详情页不再等待静态 main-container 猜链接；主播放改为 WebKit 精准捕获真实 .m3u8，并严格排除 MP4/广告请求。失败时可在播放专项页切 X5 或 M3U8-only 引擎。'));
    d.push(section('🌐 线路','当前 '+b));
    d.push({title:'✅ 主站验证',desc:'播放前如遇验证页，先在同一会话完成验证',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'🍪 Cookie 状态',desc:K.cookieFor(C.primary)?'主站：已读取':'主站：未读取',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };
  K.version='0.1.0-test.14';K.build=10114;R.version='0.1.0-test.14';R.build=10114;
})(XChinaTest9Core,XChinaRemoteRuntime);
