/* JavBus 2.0.0-alpha4 - original preview images + compact playback row */
(function(){
  if(typeof JavBusCore!=='object'||typeof JavBusRemoteRuntime!=='object')throw new Error('JavBus alpha4 base runtime missing');
  var C=JavBusCore,R=JavBusRemoteRuntime;
  R.version='2.0.0-alpha4';R.build='2.0.0-alpha4';

  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function page(path,params){return C.page(path,params||{});}
  function actorUrl(a){return page('javbusActor',{id:a.id,type:a.type||'normal'});}
  function movieUrl(m){return page('javbusDetail',{id:m.id,type:m.type||'normal'});}
  function movieCard(m){var tags=(m.tags||[]).join(' · '),desc=[m.id,m.date,tags].filter(function(x){return!!x;}).join(' · ');return{title:m.title||m.id,desc:desc,img:m.img,pic_url:m.img,url:movieUrl(m),col_type:'movie_3',extra:{pageTitle:m.id||m.title,lineVisible:false}};}
  function clickableProp(d,icon,label,p,type){if(!p||!p.name)return;var pi=p.path||C.pathInfo(p.href);d.push({title:icon+' '+label+' · '+p.name,url:page('javbusFilter',{type:pi.type||type,kind:pi.kind,id:pi.id,name:p.name}),col_type:'flex_button',extra:{lineVisible:false}});}
  function siteImg(url,ref){return url+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||url});}
  function playbackCompact(d,code){
    var ps=[
      {id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico',ref:'https://missav.live/'},
      {id:'123av',name:'123AV',icon:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/assets/123av.svg',ref:'https://raw.githubusercontent.com/'},
      {id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico',ref:'https://jable.tv/'}
    ];
    for(var i=0;i<ps.length;i++){var p=ps[i],im=siteImg(p.icon,p.ref);d.push({title:p.name,img:im,pic_url:im,url:C.playbackUrl(p.id,code),col_type:'icon_small_3',extra:{lineVisible:false,pageTitle:p.name+' · '+code}});}
  }
  function detailMagnetPreview(d,x,id,type){
    var ms=C.magnets(x,'size_desc');
    if(!ms.length){d.push({title:'当前未取得磁力',desc:'可进入完整磁力页重试',url:page('javbusMagnets',{id:id,type:type}),col_type:'text_center_1',extra:{lineVisible:false}});return;}
    for(var i=0;i<Math.min(3,ms.length);i++){var m=ms[i],tag=(m.hd?'高清 ':'')+(m.sub?'字幕 ':'');d.push({title:'🧲 '+(tag?'【'+tag.replace(/\s+$/,'')+'】 ':'')+(m.title||id),desc:[m.size,m.date].filter(function(v){return!!v;}).join(' · ')+'\n点击复制 · 长按调用云盘',url:'copy://'+m.link,col_type:'text_1',extra:{lineVisible:false,longClick:C.magnetLongClicks(m.link,id)}});}
    if(ms.length>3)d.push({title:'查看全部 '+ms.length+' 条磁力 ›',url:page('javbusMagnets',{id:id,type:type}),col_type:'text_center_1',extra:{lineVisible:false}});
  }

  R.preview=function(){
    var d=[],id=decodeURIComponent(getParam('id','')||''),type=getParam('type','normal')||'normal';setPageTitle('预览 · '+id);
    if(!id){d.push({title:'缺少影片番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}
    var url=C.detailUrl(id),html=C.fetchHtml(url);if(!html){d.push({title:'预览图读取失败',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}
    var x=C.parseDetail(html,id);d.push(section('🖼 '+id,(x.samples||[]).length+' 张原图预览'));
    if(!x.samples||!x.samples.length){d.push({title:'暂无预览图',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}
    for(var i=0;i<x.samples.length;i++){var sm=x.samples[i],full=C.image(sm.src,C.detailUrl(id));d.push({title:sm.title||('预览 '+(i+1)),img:full,pic_url:full,url:'pics://'+sm.src,col_type:'pic_1_full',extra:{lineVisible:false}});}
    setResult(d);
  };

  R.detail=function(){
    var d=[],id=decodeURIComponent(getParam('id','')||''),type=getParam('type','normal')||'normal';
    if(!id){d.push({title:'缺少影片番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}
    var url=C.detailUrl(id),html=C.fetchHtml(url);if(!html){d.push({title:'影片详情读取失败',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}
    var x=C.parseDetail(html,id),saved=C.isFav('video',id),desc=[x.date,x.length?x.length+' 分钟':'',C.typeName(type)].filter(function(v){return!!v;}).join(' · '),i;
    setPageTitle(id);
    d.push({title:x.title||id,desc:desc,img:x.img,pic_url:x.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    d.push({title:'🧲 磁力',url:page('javbusMagnets',{id:id,type:type}),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:'🖼 预览'+((x.samples&&x.samples.length)?' '+x.samples.length:''),url:page('javbusPreview',{id:id,type:type}),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:saved?'★ 已收藏':'☆ 收藏',url:$('#noLoading#').lazyRule(function(x,type){var J=$.require('javbus'),ok=J.toggleVideoFavorite({id:x.id,title:x.title,img:x.img,url:'https://www.javbus.com/'+x.id,type:type});refreshPage(false);return'toast://'+(ok?'影片已收藏':'已取消收藏');},x,type),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:'🌐 原站',url:'web://'+url,col_type:'text_4',extra:{lineVisible:false}});

    d.push(section('第三方在线播放','选择线路'));playbackCompact(d,id);
    d.push({title:'⧉ '+id,url:'copy://'+id,col_type:'scroll_button',extra:{lineVisible:false}});if(x.date)d.push({title:'📅 '+x.date,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});if(x.length)d.push({title:'⏱ '+x.length+' 分钟',url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});

    d.push(section('核心资料','点击厂商、系列、演员或标签继续筛选'));clickableProp(d,'🎥','导演',x.director,type);clickableProp(d,'🎬','制作商',x.studio,type);clickableProp(d,'🏷','发行商',x.label,type);clickableProp(d,'📚','系列',x.series,type);
    if(x.stars&&x.stars.length){d.push(section('演员',''));for(i=0;i<x.stars.length;i++){var st=x.stars[i],pi=st.path||C.pathInfo(st.href);d.push({title:'👤 '+st.name,url:actorUrl({id:pi.id,name:st.name,type:pi.type||type}),col_type:'flex_button',extra:{lineVisible:false}});}}
    if(x.genres&&x.genres.length){d.push(section('标签',''));for(i=0;i<x.genres.length;i++){var g=x.genres[i],gp=g.path||C.pathInfo(g.href);d.push({title:'# '+g.name,url:page('javbusFilter',{type:gp.type||type,kind:'genre',id:gp.id,name:g.name}),col_type:'flex_button',extra:{lineVisible:false}});}}

    if(x.samples&&x.samples.length){d.push(section('预览图','顶部“🖼 预览”可查看全部原图'));for(i=0;i<Math.min(4,x.samples.length);i++){var sm=x.samples[i];d.push({title:sm.title,img:sm.thumb,pic_url:sm.thumb,url:'pics://'+sm.src,col_type:'pic_2',extra:{lineVisible:false}});}if(x.samples.length>4)d.push({title:'查看全部 '+x.samples.length+' 张预览 ›',url:page('javbusPreview',{id:id,type:type}),col_type:'text_center_1',extra:{lineVisible:false}});}
    d.push(section('磁力资源','顶部“🧲 磁力”进入完整列表'));detailMagnetPreview(d,x,id,type);
    if(x.related&&x.related.length){d.push(section('相似影片',''));for(i=0;i<x.related.length;i++)d.push(movieCard({id:x.related[i].id,title:x.related[i].title,img:x.related[i].img,date:'',tags:[],href:x.related[i].href,type:type}));}
    setResult(d);
  };

  function bootAction4(action){return $('#noLoading#').lazyRule(function(action){try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javbus/bootstrap_test_v4.js?v=20004',{headers:{'Cache-Control':'no-cache'}},20004);var r=JavBusBoot[action]();if(action==='check')return'toast://'+(r.hasUpdate?('发现新版本 '+r.latest.version):('当前已是最新 '+r.current.version));if(r&&r.ok){refreshPage(false);return'toast://操作完成';}return'toast://'+String(r&&r.error||'操作失败');}catch(e){return'toast://'+String(e.message||e);}},action);}
  R.settings=function(){var d=[],def=getItem('javbus_default_type','normal')||'normal',mag=C.magMode();setPageTitle('JavBus 设置');d.push(section('浏览偏好',''));d.push({title:'默认首页 · '+C.typeName(def),url:'select://'+JSON.stringify({title:'默认首页',options:['有码','无码','欧美'],col:3,js:$.toString(function(){var m={'有码':'normal','无码':'uncensored','欧美':'western'};setItem('javbus_default_type',m[input]);putMyVar('javbus_home_type',m[input]);return'toast://默认首页已设为 '+input;})}),col_type:'text_1'});d.push({title:'影片范围 · '+(mag==='exist'?'只看有磁力':'全部影片'),url:'select://'+JSON.stringify({title:'影片范围',options:['全部影片','只看有磁力'],col:2,js:$.toString(function(){setItem('javbus_mag_mode',input==='只看有磁力'?'exist':'all');return'toast://已保存';})}),col_type:'text_1'});d.push(section('测试版维护','当前 2.0.0-alpha4 / Build 20004'));d.push({title:'检查更新',url:bootAction4('check'),col_type:'text_1'});d.push({title:'更新到最新 Test',url:bootAction4('update'),col_type:'text_1'});d.push({title:'回退上一 Test',url:bootAction4('rollback'),col_type:'text_1'});d.push({title:'重新加载当前 Test',url:bootAction4('reinstall'),col_type:'text_1'});d.push(section('alpha4',''));d.push({title:'本轮重点',desc:'alpha3 实机已验证 JavBus 磁力恢复成功。本版不动磁力主链：独立预览页从缩略图改为直接加载 sample 原图；第三方在线播放由大块 icon_3 改为紧凑 icon_small_3，一行三列；123AV 使用共享 Playback SDK 已固定的仓库 SVG，避免 favicon 空白。',url:'hiker://empty',col_type:'long_text'});setResult(d);};

  var oldModule=R.module;
  R.module=function(){var m=oldModule();m.detail=R.detail;m.preview=R.preview;m.settings=R.settings;return m;};
})();
