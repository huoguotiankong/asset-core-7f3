/* xChina Remote Runtime Test7 page/UI finalizer */
(function(){
  var B=XChinaTest7Builder,VERSION=B.VERSION,BUILD=B.BUILD,src=B.src,swap=B.swap,block=B.block;
  src=swap(src,'  R.home=function(){','  R.list=function(){',block([
"  R.home=function(){",
"    var d=[],p=currentPage(),type=getMyVar('xc_home_type','photo'),res=listResult(type,listPath(type,p));",
"    if(p===1){",
"      d.push({title:'小黄书',desc:'小说 · 套图 · 漫画 · 视频 · 模特',img:C.publish+'/favicon.ico',pic_url:C.publish+'/favicon.ico',url:'web://'+C.publish,col_type:'avatar',extra:{lineVisible:false}});",
"      renderTypeTabs(d,'xc_home_type',type);",
"      d.push(textButton('搜索',page('xchinaSearch',{})));",
"      d.push(textButton('分类',page('xchinaCategories',{t:type})));",
"      d.push(textButton('模特',page('xchinaCatalog',{t:'model',name:'模特'})));",
"      d.push(textButton('设置',page('xchinaSettings',{})));",
"      d.push(section(typeName(type)+'最新',''));",
"    }",
"    if(!res.items.length)d.push(empty('没有解析到内容',(res.r.ok?'页面已取得，但卡片规则可能变化':'站点验证/网络未通过')+'\\n'+res.r.url));",
"    else renderCards(d,res.items);setResult(d);",
"  };"
  ]),'home UI');

  src=swap(src,'  R.detail=function(){','  R.chapters=function(){',block([
"  R.detail=function(){",
"    var d=[],url=safeDecode(param('xc_url','')),type=param('t','')||typeFromUrl(url);if(!url){d.push(empty('缺少详情地址',''));setResult(d);return;}",
"    var res=fetchUrl(url),info=detailInfo(res.html,url,type),media=mediaFromHtml(res.html,url),chapters=(type==='fiction'||type==='comic')?chapterLinks(res.html,url,type):[],max=pagerMax(res.html),i,meta=[typeName(type)];",
"    if(media.length)meta.push(media.length+' 条媒体');if(chapters.length)meta.push(chapters.length+' 章');if((type==='photo'||type==='amateur')&&max>1)meta.push(max+' 页');",
"    setPageTitle(info.title);",
"    d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});",
"    if(type==='model'){",
"      var works=parseCards(res.html,url,'video'),photos=parseCards(res.html,url,'photo');",
"      if(info.intro)d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});",
"      if(works.length){d.push(section('影片作品',works.length+' 条'));renderCards(d,works);}if(photos.length){d.push(section('写真作品',photos.length+' 条'));renderCards(d,photos);}",
"      if(!works.length&&!photos.length)d.push(empty('当前页没有解析到关联作品','可打开原站核对页面'));",
"    }else if(type==='fiction'||type==='comic'){",
"      if(chapters.length)d.push({title:type==='fiction'?'开始阅读 · '+chapters.length+' 章':'查看章节 · '+chapters.length,url:page('xchinaChapters',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});",
"      else d.push({title:type==='fiction'?'开始阅读':'阅读本章',url:page('xchinaReader',{xc_url:url,t:type,title:info.title}),col_type:'text_center_1',extra:{lineVisible:false}});",
"    }else if(type==='video'){",
"      if(media.length)d.push({title:'▶ 立即播放',desc:mediaKind(media[0])+(media.length>1?' · 共 '+media.length+' 条线路':''),url:playerUrl(media[0],url),col_type:'text_center_1',extra:{lineVisible:false}});",
"      else d.push({title:'▶ 嗅探播放',desc:'当前页未解析到稳定直链',url:'video://'+url,col_type:'text_center_1',extra:{lineVisible:false}});",
"      if(media.length>1)d.push(textButton('线路 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));",
"    }else{",
"      d.push(textButton('看图',page('xchinaReader',{xc_url:url,t:type})));if(media.length)d.push(textButton('视频 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));",
"      if(max>1)d.push(textButton('分页 '+max,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));",
"    }",
"    d.push(textButton('原站','web://'+url));",
"    if(info.intro&&type!=='model'){d.push(section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}",
"    if(!res.ok)d.push(empty('当前页面可能仍被验证页拦截','请先进入设置页打开网站完成验证，再返回刷新'));setResult(d);",
"  };"
  ]),'detail UI / primary play');

  src=swap(src,'  R.reader=function(){','  R.media=function(){',block([
"  R.reader=function(){",
"    var d=[],url=safeDecode(param('xc_url','')),type=param('t','')||typeFromUrl(url),res=fetchUrl(url),i;setPageTitle(type==='fiction'?'正文':'图片');",
"    if(type==='fiction'){",
"      var body=contentScope(res.html,'fiction'),ps=[],re=/<p[^>]*>([\\s\\S]*?)<\\/p>/ig,x;while((x=re.exec(body)))if(strip(x[1]))ps.push(strip(x[1]));",
"      if(!ps.length&&body)ps=[strip(body)];if(!ps.length)d.push(empty('未解析到正文',url));else for(i=0;i<ps.length;i++)d.push({title:ps[i],url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}});",
"    }else{",
"      var imgs=extractImages(res.html,url,type);if(!imgs.length)d.push(empty('未解析到图片','请检查网站验证状态或页面结构'));else for(i=0;i<imgs.length;i++)d.push({title:'',img:image(imgs[i],url),pic_url:image(imgs[i],url),url:image(imgs[i],url),col_type:'pic_1_full',extra:{lineVisible:false}});",
"    }",
"    setResult(d);",
"  };"
  ]),'reader exact scope');

  src=swap(src,'  R.media=function(){','  R.settings=function(){',block([
"  R.media=function(){",
"    var d=[],url=safeDecode(param('xc_url','')),res=fetchUrl(url),xs=mediaFromHtml(res.html,url),i,u;setPageTitle('播放线路');",
"    if(!xs.length){d.push(empty('未直接解析到媒体地址','可尝试网页嗅探'));d.push({title:'▶ 嗅探播放',url:'video://'+url,col_type:'text_center_1',extra:{lineVisible:false}});}",
"    else{d.push(section('可播放线路','检测到 '+xs.length+' 条 · 已携带 Referer / Origin / UA / Cookie'));for(i=0;i<xs.length;i++){u=xs[i];d.push({title:'播放线路 '+(i+1),desc:mediaKind(u),url:playerUrl(u,url),col_type:'text_1',extra:{lineVisible:false}});}d.push({title:'网页嗅探兜底',desc:'直链仍 0 kb/s / 00:00 时测试此入口',url:'video://'+url,col_type:'text_1',extra:{lineVisible:false}});}",
"    setResult(d);",
"  };"
  ]),'media handoff');

  src=swap(src,'  R.settings=function(){','  R.module=function(){',block([
"  R.settings=function(){",
"    var d=[],fixed=getFixedBase(),last=getLastBase(),b=fixed||last||C.primary;setPageTitle('小黄书设置 / 验证');",
"    d.push(section('线路','当前 '+b));",
"    d.push({title:'自动线路',desc:'最近成功线路 → xchina.co → xchina001.ink',url:$('#noLoading#').lazyRule(function(k){clearItem(k);refreshPage(false);return'toast://已恢复自动线路';},C.baseKey),col_type:'text_1',extra:{lineVisible:false}});",
"    d.push({title:'固定 xchina.co',desc:C.primary,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定主域';},C.baseKey,C.primary),col_type:'text_1',extra:{lineVisible:false}});",
"    d.push({title:'固定备用线路',desc:C.fallback,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定备用域';},C.baseKey,C.fallback),col_type:'text_1',extra:{lineVisible:false}});",
"    d.push(section('X5 浏览器验证','遇到 Just a moment 时使用与 getCookie() 同会话的 X5；返回后 HTML / 图片 / 媒体请求实时读取对应域 Cookie'));",
"    d.push({title:'打开当前线路完成验证',desc:'列表若提示 403 / Just a moment，先完成验证再返回刷新',url:'x5://'+b+'/',col_type:'text_1',extra:{lineVisible:false}});",
"    d.push({title:'打开漫画线路',desc:C.comic,url:'x5://'+C.comic+'/',col_type:'text_1',extra:{lineVisible:false}});",
"    d.push({title:'发布页',desc:C.publish,url:'web://'+C.publish,col_type:'text_1',extra:{lineVisible:false}});",
"    d.push({title:'Cookie 状态',desc:(cookieFor(b)?'主站：已读取':'主站：未读取')+' · '+(cookieFor(C.comic)?'漫画：已读取':'漫画：未读取'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});",
"    d.push(section('状态','Test 0.1.0-test.7 · Build 10107'));d.push(textButton('固定线路',fixed||'自动'));d.push(textButton('最近成功线路',last||'暂无'));",
"    d.push(section('说明','Test7 保留精确正文/图片契约与 X5 live Cookie；重点修复列表封面错绑/空白、重复卡片、详情层级，以及视频直链播放器 Header 交付。'));setResult(d);",
"  };"
  ]),'settings');

  src=src.split('0.1.0-test.4').join(VERSION);
  src=src.split('R.build=10104;').join('R.build='+BUILD+';');
  src=src.split("cachePrefix:'xc_t4_'").join("cachePrefix:'xc_t7_'");
  src=src.replace(/^var\s+XChinaRemoteRuntime\s*=/m,'XChinaRemoteRuntime=');
  eval(src);
  if(typeof XChinaRemoteRuntime!=='object'||String(XChinaRemoteRuntime.version||'')!==VERSION||Number(XChinaRemoteRuntime.build||0)!==BUILD)throw new Error('Test7 Runtime 导出校验失败');
})();
