/* xChina Test10 post-pages UI/playback fixes */
(function(K,R){
  if(!K||!R)throw new Error('Test10 postpatch: Runtime 未加载');
  var C=K.C,s=K.s,safeDecode=K.safeDecode,param=K.param,page=K.page,section=K.section,empty=K.empty,btn=K.btn,typeName=K.typeName,typeIcon=K.typeIcon;
  function tagRoute(tag){
    var h=s(tag.href),n=s(tag.name),p=h.replace(/^https?:\/\/[^\/]+/i,'');
    if(/\/models?\//i.test(p))return page('xchinaModel',{xc_url:h,t:'model'});
    if(/\/videos\/(?:series|tag|keyword)-/i.test(p))return page('xchinaCatalog',{t:'video',name:n,xc_path:h});
    if(/\/photos\/(?:series|album|tag|keyword)-/i.test(p))return page('xchinaCatalog',{t:'photo',name:n,xc_path:h});
    if(/\/comics\//i.test(p))return page('xchinaCatalog',{t:'comic',name:n,xc_path:h});
    if(/\/fictions\//i.test(p))return page('xchinaCatalog',{t:'fiction',name:n,xc_path:h});
    return h?'web://'+h:'hiker://empty';
  }
  function renderTags(d,tags){
    if(!tags||!tags.length)return;
    d.push(section('🏷️ 标签','点击标签可进入关联内容'));
    for(var i=0;i<tags.length;i++)d.push({title:'🏷 '+tags[i].name,url:tagRoute(tags[i]),col_type:'scroll_button',extra:{lineVisible:false}});
  }
  R.detail=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','');
    if(!url){d.push(empty('缺少详情地址',''));setResult(d);return;}
    if(!type){type=/\/fiction\//.test(url)?'fiction':/\/comic\//.test(url)?'comic':/\/photo\//.test(url)?'photo':/\/amateur\//.test(url)?'amateur':/\/model\//.test(url)?'model':'video';}
    var res=K.fetchPage(url,type),info=K.detailInfo(res.html,url,type),media=K.mediaFromHtml(res.html,url,type),chapters=(type==='fiction'||type==='comic')?K.chapterLinks(res.html,url,type):[],max=K.pagerMax(res.html),tags=K.detailTags?K.detailTags(res.html,url,type):[],meta=[typeIcon(type)+' '+typeName(type)],i;
    setPageTitle(info.title);if(media.length)meta.push(media.length+' 个视频');if(chapters.length)meta.push(chapters.length+' 章');if((type==='photo'||type==='amateur')&&max>1)meta.push(max+' 页');
    d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(type==='video')renderTags(d,tags);
    if(type==='model'){
      var works=K.parseCards(res.html,url,'video'),photos=K.parseCards(res.html,url,'photo');
      if(info.intro)d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
      if(works.length){d.push(section('💽 影片作品',works.length+' 条'));for(i=0;i<works.length;i++)d.push(K.card(works[i]));}
      if(photos.length){d.push(section('🖼️ 写真作品',photos.length+' 条'));for(i=0;i<photos.length;i++)d.push(K.card(photos[i]));}
      if(!works.length&&!photos.length)d.push(empty('当前页没有解析到关联作品','可打开原站核对页面'));
    }else if(type==='fiction'||type==='comic'){
      if(chapters.length)d.push({title:type==='fiction'?'📖 开始阅读 · '+chapters.length+' 章':'🎨 查看章节 · '+chapters.length,url:page('xchinaChapters',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
      else d.push({title:type==='fiction'?'📖 阅读正文':'🎨 阅读本章',url:page('xchinaReader',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
    }else if(type==='video'){
      if(media.length){
        d.push({title:'▶️ 免嗅播放',desc:(/m3u8/i.test(media[0])?'HLS':'MP4')+' · main-container 真实媒体候选',url:K.directPlayer(media[0]),col_type:'text_center_1',extra:{lineVisible:false,id:url}});
        d.push(btn('🎞️ 播放线路 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));
      }else{
        d.push({title:'⚠️ 未解析到真实视频',desc:'已关闭网页嗅探，避免把广告识别成正片；进入播放诊断查看。',url:page('xchinaMedia',{xc_url:url,t:type}),col_type:'text_center_1',extra:{lineVisible:false}});
      }
    }else{
      renderTags(d,tags);
      d.push(btn('🖼️ 看图',page('xchinaReader',{xc_url:url,t:type})));
      if(media.length)d.push(btn('▶️ 视频 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));
      if(max>1)d.push(btn('📄 分页 '+max,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));
    }
    d.push(btn('🌐 原站','web://'+url));
    if(info.intro&&type!=='model'){d.push(section('📝 简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    if(!res.ok)d.push(empty('当前页面可能被验证页拦截','进入设置页完成 X5 验证后返回刷新'));
    setResult(d);
  };
  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','video'),res=K.fetchPage(url,type),xs=K.mediaFromHtml(res.html,url,type),i,u;
    setPageTitle('🎬 播放诊断');
    if(!xs.length){
      d.push(empty('没有解析到正片媒体地址','已禁用 video:// 网页嗅探，因为当前实机确认会命中广告。\nTest10 只接受 main-container 内明确的 m3u8 / mp4 候选。'));
      d.push(btn('🌐 原站核对','web://'+url));
    }else{
      d.push(section('▶️ 真实媒体候选','仅来自 main-container；广告/统计 URL 已过滤'));
      for(i=0;i<xs.length;i++){
        u=xs[i];
        d.push({title:'▶️ 免嗅 '+(i+1),desc:/m3u8/i.test(u)?'HLS':'MP4',url:K.directPlayer(u),col_type:'text_1',extra:{lineVisible:false,id:url+'#d'+i}});
        d.push({title:'🧩 Header兼容 '+(i+1),desc:'直连失败时再测试 Referer / UA / Cookie',url:K.headerPlayer(u,url),col_type:'text_1',extra:{lineVisible:false,id:url+'#h'+i}});
      }
    }
    setResult(d);
  };
  R.settings=function(){
    var d=[],fixed=K.getFixedBase(),last=K.getLastBase(),b=fixed||last||C.primary;setPageTitle('⚙️ 小黄书设置');
    d.push(section('🌐 线路','当前 '+b));
    d.push({title:'🔄 自动线路',desc:'最近成功线路 → xchina.co → xchina001.ink',url:$('#noLoading#').lazyRule(function(k){clearItem(k);refreshPage(false);return'toast://已恢复自动线路';},C.baseKey),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'📌 固定 xchina.co',desc:C.primary,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定主域';},C.baseKey,C.primary),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'📌 固定备用线路',desc:C.fallback,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定备用域';},C.baseKey,C.fallback),col_type:'text_1',extra:{lineVisible:false}});
    d.push(section('🧩 网站验证','遇到 Just a moment 时先用 X5 完成主站/漫画站验证，再返回刷新。'));
    d.push({title:'✅ 打开当前线路验证',desc:b,url:'x5://'+b+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'🎨 打开漫画线路',desc:C.comic,url:'x5://'+C.comic+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'🍪 Cookie 状态',desc:(K.cookieFor(b)?'主站：已读取':'主站：未读取')+' · '+(K.cookieFor(C.comic)?'漫画：已读取':'漫画：未读取'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    d.push(section('ℹ️ 状态','Test 0.1.0-test.10 · Build 10110'));
    d.push(section('📝 本轮修复','封面改为直接解析 `.img` 标签完整 style 属性；视频扩大 main-container 内 m3u8/mp4 提取并关闭广告嗅探；视频详情新增可点击标签。'));
    d.push({title:'📢 发布页',desc:C.publish,url:'web://'+C.publish,col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };
  K.version='0.1.0-test.10';K.build=10110;R.version='0.1.0-test.10';R.build=10110;
})(XChinaTest9Core,XChinaRemoteRuntime);
