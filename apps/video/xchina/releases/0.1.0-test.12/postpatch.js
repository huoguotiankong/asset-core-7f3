/* xChina Test12 post-pages UX/playback fixes */
(function(K,R){
  if(!K||!R)throw new Error('Test12 postpatch: Runtime 未加载');
  var C=K.C,CATEGORY_GROUPS=K.CATEGORY_GROUPS||{},s=K.s,safeDecode=K.safeDecode,param=K.param,page=K.page,section=K.section,empty=K.empty,btn=K.btn,typeName=K.typeName,typeIcon=K.typeIcon;
  function knownCategoryRoute(name){
    var groups=CATEGORY_GROUPS.video||{},g,arr,i,x;
    for(g in groups){if(!groups.hasOwnProperty(g))continue;arr=groups[g]||[];for(i=0;i<arr.length;i++){x=arr[i];if(s(x[0])===s(name))return page('xchinaCatalog',{t:x[2]||'video',name:x[0],xc_path:x[1]});}}
    if(groups[name])return page('xchinaCategories',{t:'video'});
    return'hiker://empty';
  }
  function tagRoute(tag){
    var h=s(tag.href),n=s(tag.name),p=h.replace(/^https?:\/\/[^\/]+/i,'');
    if(tag.kind==='model'&&h)return page('xchinaModel',{xc_url:h,t:'model'});
    if(/\/models?\//i.test(p))return page('xchinaModel',{xc_url:h,t:'model'});
    if(/\/videos\/(?:series|tag|keyword)-/i.test(p))return page('xchinaCatalog',{t:'video',name:n,xc_path:h});
    if(tag.kind==='content')return knownCategoryRoute(n);
    return'hiker://empty';
  }
  function renderVideoTags(d,tags){
    if(!tags||!tags.length)return;
    var models=[],others=[],i;for(i=0;i<tags.length;i++)(tags[i].kind==='model'?models:others).push(tags[i]);
    if(models.length){d.push(section('👩 女优 / 模特',''));for(i=0;i<models.length;i++)d.push({title:'👩 '+models[i].name,url:tagRoute(models[i]),col_type:'scroll_button',extra:{lineVisible:false}});}
    if(others.length){d.push(section('🏷️ 内容标签','只读取阅读源指定 tags 位，不扫描广告区'));for(i=0;i<others.length;i++)d.push({title:'🏷 '+others[i].name,url:tagRoute(others[i]),col_type:'scroll_button',extra:{lineVisible:false}});}
  }
  function modelProfileText(html){
    var txt=K.strip(K.domHtml(html,'.model-info&&Text')||K.domHtml(html,'.profile&&Text')||K.domHtml(html,'.desc&&Text')||'');
    if(!txt){var m=K.strip(html).match(/这个人[^\n]{0,80}|收录视频数\s*[:：]?\s*\d+/);txt=m?m[0]:'';}return txt;
  }
  function detail(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','');
    if(!url){d.push(empty('缺少详情地址',''));setResult(d);return;}
    if(!type){type=/\/fiction\//.test(url)?'fiction':/\/comic\//.test(url)?'comic':/\/photo\//.test(url)?'photo':/\/amateur\//.test(url)?'amateur':/\/models?\//.test(url)?'model':'video';}
    var res=K.fetchPage(url,type),info=K.detailInfo(res.html,url,type),media=K.mediaFromHtml(res.html,url,type),chapters=(type==='fiction'||type==='comic')?K.chapterLinks(res.html,url,type):[],max=K.pagerMax(res.html),tags=K.detailTags?K.detailTags(res.html,url,type):[],meta=[typeIcon(type)+' '+typeName(type)],i;
    setPageTitle(info.title);if(media.length)meta.push(media.length+' 个视频');if(chapters.length)meta.push(chapters.length+' 章');if((type==='photo'||type==='amateur')&&max>1)meta.push(max+' 页');
    d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(type==='model'){
      var works=K.parseCards(res.html,url,'video'),photos=K.parseCards(res.html,url,'photo'),count=K.modelCount?K.modelCount(res.html):0,all=K.modelAllUrl?K.modelAllUrl(res.html,url):'',profile=modelProfileText(res.html),limit=Math.min(6,works.length);
      if(profile)d.push({title:profile,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
      if(works.length){
        d.push(section('💽 视频作品',(count||works.length)+' 部 · 直接展示前 '+limit+' 部'));
        for(i=0;i<limit;i++)d.push(K.card(works[i]));
        if(all)d.push({title:'查看全部视频'+(count?' · '+count:'')+'  ›',url:page('xchinaCatalog',{t:'video',name:info.title+' · 全部视频',xc_path:all}),col_type:'text_center_1',extra:{lineVisible:false}});
        else if(works.length>limit)d.push({title:'查看本页全部作品  ›',url:page('xchinaModel',{xc_url:url,t:'model',show_all:'1'}),col_type:'text_center_1',extra:{lineVisible:false}});
      }
      if(param('show_all','')==='1'&&works.length>limit){d.push(section('全部作品','当前页面共 '+works.length+' 部'));for(i=limit;i<works.length;i++)d.push(K.card(works[i]));}
      if(!works.length&&photos.length){d.push(section('🖼️ 写真作品',Math.min(6,photos.length)+' 部'));for(i=0;i<Math.min(6,photos.length);i++)d.push(K.card(photos[i]));}
      if(!works.length&&!photos.length)d.push(empty('当前页没有解析到关联作品','可打开原站核对页面'));
    }else if(type==='fiction'||type==='comic'){
      if(chapters.length)d.push({title:type==='fiction'?'📖 开始阅读 · '+chapters.length+' 章':'🎨 查看章节 · '+chapters.length,url:page('xchinaChapters',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
      else d.push({title:type==='fiction'?'📖 阅读正文':'🎨 阅读本章',url:page('xchinaReader',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
    }else if(type==='video'){
      renderVideoTags(d,tags);
      if(media.length){
        d.push({title:'▶️ 播放',desc:/m3u8/i.test(media[0])?'HLS · 自动尝试 s2.playhls Host + cacheM3u8':'MP4 · 带页面 Header',url:K.playMedia(media[0],url),col_type:'text_center_1',extra:{lineVisible:false,id:url}});
        d.push(btn('🎞️ 播放诊断',page('xchinaMedia',{xc_url:url,t:type})));
      }else d.push({title:'⚠️ 未解析到正片视频',desc:'已禁用网页广告嗅探；当前 main-container 没有命中阅读源同款 m3u8。',url:page('xchinaMedia',{xc_url:url,t:type}),col_type:'text_center_1',extra:{lineVisible:false}});
    }else{
      d.push(btn('🖼️ 看图',page('xchinaReader',{xc_url:url,t:type})));
      if(media.length)d.push(btn('▶️ 视频 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));
      if(max>1)d.push(btn('📄 分页 '+max,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));
    }
    d.push(btn('🌐 原站','web://'+url));
    if(info.intro&&type!=='model'){d.push(section('📝 简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    if(!res.ok)d.push(empty('当前页面可能被验证页拦截','进入设置页完成 X5 验证后返回刷新'));
    setResult(d);
  }
  R.detail=detail;R.videoDetail=detail;R.photoDetail=detail;R.fictionDetail=detail;R.comicDetail=detail;R.modelDetail=detail;
  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','video'),res=K.fetchPage(url,type),xs=K.mediaFromHtml(res.html,url,type),i,u;
    setPageTitle('🎬 播放诊断');
    if(!xs.length){d.push(empty('没有解析到正片媒体地址','严格按上传阅读源的 main-container 规则取视频；网页嗅探已关闭，避免再次命中广告。'));d.push(btn('🌐 原站核对','web://'+url));}
    else{
      d.push(section('✅ 正片候选','纯视频只取 main-container 内第一个 quoted m3u8；套图视频按阅读源回退 domain + videos'));
      for(i=0;i<xs.length;i++){
        u=xs[i];
        d.push({title:'▶️ 推荐播放 '+(i+1),desc:/m3u8/i.test(u)?'HLS：Host=s2.playhls.com + cacheM3u8；失败再普通 Header':'MP4：Referer / Origin / UA',url:K.playMedia(u,url),col_type:'text_1',extra:{lineVisible:false,id:url+'#t12'+i}});
        d.push({title:'🧩 普通 Header '+(i+1),desc:'用于判断 Host 兼容是否反而影响当前 CDN',url:K.playPlainHeader(u,url),col_type:'text_1',extra:{lineVisible:false,id:url+'#plain'+i}});
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
    d.push(section('ℹ️ 状态','Test 0.1.0-test.12 · Build 10112'));
    d.push(section('📝 本轮','模特页保留 6 部预览并提供全部视频入口；标签只保留 model-container + 阅读源固定 tags 位置；封面按上传阅读源和历史可用规则双契约取图；HLS 使用 xChina 历史可用 Host=s2.playhls.com + cacheM3u8 交付。'));
    setResult(d);
  };
  K.version='0.1.0-test.12';K.build=10112;R.version='0.1.0-test.12';R.build=10112;
})(XChinaTest9Core,XChinaRemoteRuntime);
