/* xChina Test15 playback-only hotfix
 * Baseline: Test13. Test14 is frozen because device test captured a 1-second media candidate.
 * Source of truth: uploaded reading source /video rule -> class.main-container@all -> FIRST QUOTED m3u8.
 */
(function(K,R){
  if(!K||!R||String(R.version)!=='0.1.0-test.13'||Number(R.build)!==10113)throw new Error('Test15 playback patch: Test13 未加载');
  var C=K.C,s=K.s,safeDecode=K.safeDecode,param=K.param,page=K.page,section=K.section,empty=K.empty,btn=K.btn;
  var oldDetail=R.detail;

  function primaryPage(u){
    var p=s(u).replace(/^https?:\/\/[^\/]+/i,'');
    return C.primary+(p.charAt(0)==='/'?p:'/'+p);
  }
  function webRuleUrl(pageUrl,mode){
    var p=primaryPage(pageUrl),prefix=mode==='x5'?'x5Rule://':'webRule://';
    return prefix+p+'@'+captureScript(mode||'dom');
  }
  function captureScript(mode){
    return $.toString(function(mode,ua,ref){
      function clean(u){
        u=String(u||'').replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/&amp;/ig,'&').replace(/^\s+|\s+$/g,'');
        if(!u)return'';
        try{u=new URL(u,location.href).href;}catch(e){if(/^\/\//.test(u))u='https:'+u;}
        return u;
      }
      function bad(u){return /(?:doubleclick|googlesyndication|google-analytics|googletagmanager|analytics|tracking|\/ads?(?:\/|\?|$)|advert|banner|promo|vast|ima|pre[-_]?roll)/i.test(String(u||''));}
      function good(u){u=clean(u);return /^https?:\/\//i.test(u)&&/\.m3u8(?:$|[?#])/i.test(u)&&!bad(u);}
      function quotedM3u8(text){
        var x=String(text||''),re=/(["'])([^"']*?\.m3u8[^"']*?)\1/ig,m,u;
        while((m=re.exec(x))){u=clean(m[2]);if(good(u))return u;}
        return'';
      }
      function kick(){
        try{
          var box=document.querySelector('.main-container')||document;
          var v=box.querySelector('video');
          if(v){v.muted=true;try{var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}catch(e){}}
          var sels=['.vjs-big-play-button','.jw-display-icon-container','.plyr__control--overlaid','[class*=play-button]','[class*=playButton]'];
          for(var i=0;i<sels.length;i++){var b=box.querySelector(sels[i]);if(b&&!window.__xc15clicked){window.__xc15clicked=1;try{b.click();}catch(e2){}break;}}
        }catch(e3){}
      }
      kick();
      var box=null,u='',scripts,i,h='';
      try{box=document.querySelector('.main-container');}catch(e4){}
      if(box){
        // EXACT uploaded-source contract: first quoted m3u8 inside main-container.
        try{u=quotedM3u8(box.innerHTML||'');if(u)return u;}catch(e5){}
        try{scripts=box.querySelectorAll('script');for(i=0;i<scripts.length;i++){h=String(scripts[i].text||scripts[i].textContent||scripts[i].innerHTML||'');u=quotedM3u8(h);if(u)return u;}}catch(e6){}
      }
      // Primary mode intentionally never returns video.currentSrc/source: Test14 device test proved that path can be a 1-second pre-roll.
      if(mode==='dom')return'';

      // Fallback only after the page video itself looks like a real long-form item.
      var v=null,d=0;
      try{v=(box||document).querySelector('video');d=v?Number(v.duration||0):0;}catch(e7){}
      if(!(d>10||d===Infinity))return'';
      var a=[],seen={},best='',z;
      try{if(window._getUrls){z=window._getUrls()||[];for(i=0;i<z.length;i++)a.push(z[i]);}}catch(e8){}
      try{if(typeof fy_bridge_app!=='undefined'&&fy_bridge_app.getUrls){z=String(fy_bridge_app.getUrls()||'').split(/\n|\r|\|\|/);for(i=0;i<z.length;i++)a.push(z[i]);}}catch(e9){}
      try{z=(window.performance&&performance.getEntriesByType)?performance.getEntriesByType('resource'):[];for(i=0;i<z.length;i++)a.push(z[i].name);}catch(e10){}
      for(i=a.length-1;i>=0;i--){u=clean(a[i]);if(!good(u)||seen[u])continue;seen[u]=1;if(/(?:playhls|\/hls\/|master\.m3u8|index\.m3u8)/i.test(u))return u;if(!best)best=u;}
      return best||'';
    },mode,C.ua,C.primary+'/');
  }
  function extra(){return{lineVisible:false,ua:C.ua,referer:C.primary+'/',blockRules:['doubleclick','googlesyndication','google-analytics','googletagmanager','.woff','.woff2','.ttf','.ico']};}
  function modelButtons(d,tags){
    if(!tags||!tags.length)return;var i,t,n=0;d.push(section('👩 女优 / 模特',''));
    for(i=0;i<tags.length;i++){t=tags[i];if(t.kind!=='model'||!t.href)continue;d.push({title:'👩 '+t.name,url:page('xchinaModel',{xc_url:t.href,t:'model'}),col_type:'scroll_button',extra:{lineVisible:false}});n++;}
    if(!n)d.pop();
  }
  function videoDetail(){
    var d=[],url=safeDecode(param('xc_url',''));if(!url){d.push(empty('缺少视频地址',''));setResult(d);return;}
    var res=K.fetchPage(url,'video'),info=K.detailInfo(res.html,url,'video'),tags=K.detailTags?K.detailTags(res.html,url,'video'):[],p=primaryPage(url),ex=extra();
    setPageTitle(info.title);d.push({title:info.title,desc:'💽 视频',img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});modelButtons(d,tags);
    d.push({title:'▶️ 播放',desc:'按阅读源原规则：main-container 内第一个 quoted m3u8',url:webRuleUrl(p,'dom'),col_type:'text_center_1',extra:ex});
    d.push(btn('🎯 播放专项 / 备用链',page('xchinaMedia',{xc_url:p,t:'video'})));d.push(btn('🌐 原站','web://'+p));setResult(d);
  }
  R.detail=function(){var url=safeDecode(param('xc_url','')),type=param('t','');if(!type&&/\/video\//.test(url))type='video';if(type==='video')return videoDetail();return oldDetail();};
  R.videoDetail=videoDetail;

  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),p=primaryPage(url),ex=extra();setPageTitle('🎬 播放专项');
    d.push(section('① 阅读源同款提取','只认 main-container 内第一个 quoted m3u8；不读 video.currentSrc，不碰 1 秒预播。'));
    d.push({title:'▶️ WebKit · DOM M3U8',desc:'主线路',url:webRuleUrl(p,'dom'),col_type:'text_1',extra:ex});
    d.push({title:'▶️ X5 · DOM M3U8',desc:'同一规则，切换浏览器内核',url:webRuleUrl(p,'dom').replace(/^webRule:\/\//,'x5Rule://'),col_type:'text_1',extra:ex});
    d.push(section('② 长视频网络兜底','只有网页 video.duration > 10 秒后，才允许从真实网络请求里选择 m3u8。'));
    d.push({title:'▶️ WebKit · 时长门禁',desc:'过滤 Test14 的 1 秒预播候选',url:webRuleUrl(p,'network'),col_type:'text_1',extra:ex});
    d.push({title:'▶️ X5 · 时长门禁',desc:'WebKit 无结果再测',url:webRuleUrl(p,'network').replace(/^webRule:\/\//,'x5Rule://'),col_type:'text_1',extra:ex});
    d.push(btn('🌐 原站核对','web://'+p));setResult(d);
  };

  R.settings=function(){
    var d=[];setPageTitle('⚙️ 小黄书设置');d.push(section('ℹ️ 状态','Test 0.1.0-test.15 · Build 10115'));
    d.push(section('🎬 本轮只修播放','Test14 实机抓到了 00:01/00:01 的 1 秒候选。Test15 删除 currentSrc 优先策略，主链严格复刻上传阅读源：main-container 内第一个 quoted m3u8。网络兜底增加 >10 秒时长门禁。'));
    d.push({title:'✅ 主站验证',desc:C.primary+'/',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});setResult(d);
  };
  K.version='0.1.0-test.15';K.build=10115;R.version='0.1.0-test.15';R.build=10115;
})(XChinaTest9Core,XChinaRemoteRuntime);
