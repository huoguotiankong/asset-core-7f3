/* xChina Test13 post-pages UX/playback fixes */
(function(K,R){
  if(!K||!R)throw new Error('Test13 postpatch: Runtime 未加载');
  var C=K.C,CATEGORY_GROUPS=K.CATEGORY_GROUPS||{},s=K.s,safeDecode=K.safeDecode,param=K.param,page=K.page,section=K.section,empty=K.empty,btn=K.btn,typeName=K.typeName,typeIcon=K.typeIcon;

  function knownCategoryRoute(name){
    var groups=CATEGORY_GROUPS.video||{},g,arr,i,x;
    for(g in groups){if(!groups.hasOwnProperty(g))continue;arr=groups[g]||[];for(i=0;i<arr.length;i++){x=arr[i];if(s(x[0])===s(name))return page('xchinaCatalog',{t:x[2]||'video',name:x[0],xc_path:x[1]});}}
    return'hiker://empty';
  }
  function tagRoute(tag){
    var h=s(tag.href),n=s(tag.name),p=h.replace(/^https?:\/\/[^\/]+/i,'');
    if(tag.kind==='model'&&h)return page('xchinaModel',{xc_url:h,t:'model'});
    if(/\/models?\//i.test(p))return page('xchinaModel',{xc_url:h,t:'model'});
    if(tag.kind==='content')return knownCategoryRoute(n);
    return'hiker://empty';
  }
  function renderVideoTags(d,tags){
    if(!tags||!tags.length)return;
    var models=[],others=[],i;for(i=0;i<tags.length;i++)(tags[i].kind==='model'?models:others).push(tags[i]);
    if(models.length){d.push(section('👩 女优 / 模特',''));for(i=0;i<models.length;i++)d.push({title:'👩 '+models[i].name,url:tagRoute(models[i]),col_type:'scroll_button',extra:{lineVisible:false}});}
    if(others.length){d.push(section('🏷️ 分类',''));for(i=0;i<others.length;i++)d.push({title:'🏷 '+others[i].name,url:tagRoute(others[i]),col_type:'scroll_button',extra:{lineVisible:false}});}
  }
  function cleanVideoTitle(t){return s(t).replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');}

  R.list=function(){
    var d=[],p=K.currentPage(),type=param('t','photo'),name=safeDecode(param('name',typeName(type))),tpl=safeDecode(param('xc_path','')),res,path;
    if(param('model_all','')==='1'&&tpl){
      res=K.modelAllResult(tpl,p);type='video';
      if(p===1){setPageTitle(name);d.push(section('💽 '+name,(res.max?'共 '+res.max+' 页 · ':'')+'向下滚动继续加载全部作品'));}
      if(!res.items.length){if(p===1)d.push(empty('当前列表为空或解析失败',res.r.url));}
      else for(var mi=0;mi<res.items.length;mi++)d.push(K.card(res.items[mi]));
      setResult(d);return;
    }
    path=tpl||K.listPath(type,p);if(path.indexOf('{page}')>=0)path=path.replace('{page}',String(p));res=K.listResult(type,path);
    if(p===1){setPageTitle(name);d.push(section(typeIcon(type)+' '+name,'原站分页'));}
    if(!res.items.length)d.push(empty('当前列表为空或解析失败',res.r.url));else for(var i=0;i<res.items.length;i++)d.push(K.card(res.items[i]));setResult(d);
  };
  R.catalog=R.list;

  function detail(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','');
    if(!url){d.push(empty('缺少详情地址',''));setResult(d);return;}
    if(!type){type=/\/fiction\//.test(url)?'fiction':/\/comic\//.test(url)?'comic':/\/photo\//.test(url)?'photo':/\/amateur\//.test(url)?'amateur':/\/models?\//.test(url)?'model':'video';}
    var res=K.fetchPage(url,type),info=K.detailInfo(res.html,url,type),media=K.mediaFromHtml(res.html,url,type),chapters=(type==='fiction'||type==='comic')?K.chapterLinks(res.html,url,type):[],max=K.pagerMax(res.html),tags=K.detailTags?K.detailTags(res.html,url,type):[],meta=[typeIcon(type)+' '+typeName(type)],i;

    if(type==='model'){
      var mm=K.modelMeta?K.modelMeta(res.html,url):null,works=K.parseCards(res.html,url,'video'),photos=K.parseCards(res.html,url,'photo'),count=K.modelCount?K.modelCount(res.html):0,all=K.modelAllUrl?K.modelAllUrl(res.html,url):'',limit=Math.min(6,works.length),title=(mm&&mm.name)||info.title,cover=(mm&&mm.cover)||info.img,desc=(mm&&mm.desc)||'';
      setPageTitle(title);d.push({title:title,desc:'👩 模特'+(count?' · 收录 '+count+' 部视频':''),img:cover,pic_url:cover,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
      if(desc)d.push({title:desc,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
      if(works.length){
        d.push(section('💽 视频作品',(count||works.length)+' 部 · 预览前 '+limit+' 部'));
        for(i=0;i<limit;i++)d.push(K.card(works[i]));
        if(all)d.push({title:'查看全部视频'+(count?' · '+count:'')+'  ›',url:page('xchinaCatalog',{t:'video',name:title+' · 全部视频',xc_path:all,model_all:'1'}),col_type:'text_center_1',extra:{lineVisible:false}});
      }
      if(!works.length&&photos.length){d.push(section('🖼️ 写真作品',Math.min(6,photos.length)+' 部'));for(i=0;i<Math.min(6,photos.length);i++)d.push(K.card(photos[i]));}
      if(!works.length&&!photos.length)d.push(empty('当前页没有解析到关联作品','可打开原站核对页面'));
      d.push(btn('🌐 原站','web://'+url));setResult(d);return;
    }

    setPageTitle(cleanVideoTitle(info.title));if(media.length)meta.push(media.length+' 个视频');if(chapters.length)meta.push(chapters.length+' 章');if((type==='photo'||type==='amateur')&&max>1)meta.push(max+' 页');
    d.push({title:cleanVideoTitle(info.title),desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});

    if(type==='fiction'||type==='comic'){
      if(chapters.length)d.push({title:type==='fiction'?'📖 开始阅读 · '+chapters.length+' 章':'🎨 查看章节 · '+chapters.length,url:page('xchinaChapters',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
      else d.push({title:type==='fiction'?'📖 阅读正文':'🎨 阅读本章',url:page('xchinaReader',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});
    }else if(type==='video'){
      renderVideoTags(d,tags);
      if(media.length){
        d.push({title:'▶️ 播放',desc:/m3u8/i.test(media[0])?'HLS · 按阅读源固定 Referer 交付':'MP4 · 按阅读源固定 Referer 交付',url:K.playMedia(media[0],url),col_type:'text_center_1',extra:{lineVisible:false,id:url}});
        d.push(btn('🎞️ 播放诊断',page('xchinaMedia',{xc_url:url,t:type})));
      }else d.push({title:'⚠️ 暂未解析到正片',desc:'已按阅读源 main-container + 主站精确请求 + WebView 渲染三层提取；未使用广告嗅探。',url:page('xchinaMedia',{xc_url:url,t:type}),col_type:'text_center_1',extra:{lineVisible:false}});
      d.push(btn('🌐 原站','web://'+url));setResult(d);return;
    }else{
      d.push(btn('🖼️ 看图',page('xchinaReader',{xc_url:url,t:type})));
      if(media.length)d.push(btn('▶️ 视频 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));
      if(max>1)d.push(btn('📄 分页 '+max,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));
    }
    d.push(btn('🌐 原站','web://'+url));
    if(info.intro){d.push(section('📝 简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    if(!res.ok)d.push(empty('当前页面可能被验证页拦截','进入设置页完成 X5 验证后返回刷新'));
    setResult(d);
  }
  R.detail=detail;R.videoDetail=detail;R.photoDetail=detail;R.fictionDetail=detail;R.comicDetail=detail;R.modelDetail=detail;

  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','video'),res=K.fetchPage(url,type),xs=K.mediaFromHtml(res.html,url,type),i,u;
    setPageTitle('🎬 播放诊断');
    if(!xs.length){
      d.push(empty('没有解析到正片媒体地址','已按阅读源固定主站 Header 重新请求，并额外尝试 WebView 渲染后的 main-container；仍未命中时不再用广告嗅探冒充正片。'));
      d.push(btn('🌐 原站核对','web://'+url));
    }else{
      d.push(section('✅ 正片候选','播放 Header 现在严格跟随上传阅读源：UA + Referer=https://xchina.co/；不再默认强塞详情页 Referer/Origin。'));
      for(i=0;i<xs.length;i++){
        u=xs[i];
        d.push({title:'▶️ 推荐播放 '+(i+1),desc:/m3u8/i.test(u)?'HLS：source Referer + cacheM3u8':'MP4：source Referer',url:K.playMedia(u,url),col_type:'text_1',extra:{lineVisible:false,id:url+'#t13'+i}});
        d.push({title:'🧩 直接 Header '+(i+1),desc:'不缓存 m3u8，用于对照播放器直连结果',url:K.playPlainHeader(u,url),col_type:'text_1',extra:{lineVisible:false,id:url+'#plain'+i}});
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
    d.push(section('ℹ️ 状态','Test 0.1.0-test.13 · Build 10113'));
    d.push(section('📝 本轮','女优页“全部视频”改为按原站 pager 自动翻页；视频详情去掉重复简介和推广文本；视频提取增加主站精确请求与渲染 main-container；播放 Header 改为上传阅读源真实的固定 xchina.co Referer。'));
    setResult(d);
  };

  K.version='0.1.0-test.13';K.build=10113;R.version='0.1.0-test.13';R.build=10113;
})(XChinaTest9Core,XChinaRemoteRuntime);
