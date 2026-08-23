/* JavBus 2.0.0-alpha3 - magnet recovery + preview entry + official playback icon grid */
(function(){
  if(typeof JavBusCore!=='object'||typeof JavBusRemoteRuntime!=='object')throw new Error('JavBus alpha3 base runtime missing');
  var C=JavBusCore,R=JavBusRemoteRuntime;
  R.version='2.0.0-alpha3';R.build='2.0.0-alpha3';

  function s(v){return v===undefined||v===null?'':String(v);}
  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function page(path,params){return C.page(path,params||{});}
  function htmlText(v){return C.strip(s(v).replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;/ig,"'").replace(/&quot;/ig,'"'));}
  function decodeHtml(v){return s(v).replace(/&amp;/ig,'&').replace(/&#38;/ig,'&').replace(/&#x26;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;/ig,"'");}
  function jsVar(html,name){var re=new RegExp('var\\s+'+name+'\\s*=\\s*[\\"\\\']?([^;\\n\\r\\"\\\']+)[\\"\\\']?\\s*;','i'),m=s(html).match(re);return m&&m[1]?String(m[1]).replace(/\\\//g,'/').trim():'';}
  function sizeBytes(v){var m=s(v).replace(/,/g,'').match(/([0-9]+(?:\.[0-9]+)?)\s*(TB|GB|MB|KB|B)/i);if(!m)return 0;var n=parseFloat(m[1]),u=m[2].toUpperCase(),p={B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776};return n*(p[u]||1);}
  function officialImage(url,referer){return url+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':referer||url});}

  var oldParseDetail=C.parseDetail;
  C.parseDetail=function(html,id){
    var x=oldParseDetail(html,id)||{id:id};
    var gid=jsVar(html,'gid'),uc=jsVar(html,'uc'),img=jsVar(html,'img');
    if(gid)x.gid=gid;
    if(uc!=='')x.uc=uc;
    x.magnetImg=img||x.rawImg||'';
    x.magnetSource='detail-vars';
    return x;
  };

  function parseMagnetRows(raw){
    raw=s(raw);var out=[],seen={},rows=raw.match(/<tr\b[\s\S]*?<\/tr>/ig)||[];
    for(var i=0;i<rows.length;i++){
      var row=rows[i],lm=row.match(/href=["'](magnet:\?[^"']+)["']/i);if(!lm)continue;
      var link=decodeHtml(lm[1]);if(!link||seen[link])continue;seen[link]=1;
      var tds=row.match(/<td\b[\s\S]*?<\/td>/ig)||[],title='',size='',date='';
      if(tds.length>0)title=htmlText(tds[0]).replace(/高清|字幕/g,'').replace(/\s+/g,' ').trim();
      if(tds.length>1)size=htmlText(tds[1]).replace(/\s+/g,' ').trim();
      if(tds.length>2)date=htmlText(tds[2]).replace(/\s+/g,' ').trim();
      if(!title){var dm=link.match(/[?&]dn=([^&]+)/i);if(dm){try{title=decodeURIComponent(dm[1].replace(/\+/g,' '));}catch(e){title=dm[1];}}}
      out.push({link:link,title:title||'磁力资源',size:size,date:date,bytes:sizeBytes(size),hd:/高清|FHD|(?:^|[_.-])HD(?:[_.-]|$)/i.test(row+' '+title),sub:/字幕|(?:^|[_.-])CH(?:[_.-]|$)|中文字幕/i.test(row+' '+title)});
    }
    if(!out.length){
      var re=/href=["'](magnet:\?[^"']+)["']/ig,m;while((m=re.exec(raw))){var l=decodeHtml(m[1]);if(!l||seen[l])continue;seen[l]=1;var dn='',dm=l.match(/[?&]dn=([^&]+)/i);if(dm){try{dn=decodeURIComponent(dm[1].replace(/\+/g,' '));}catch(e2){dn=dm[1];}}out.push({link:l,title:dn||'磁力资源',size:'',date:'',bytes:0,hd:/FHD|(?:^|[_.-])HD(?:[_.-]|$)/i.test(dn),sub:/(?:^|[_.-])CH(?:[_.-]|$)|字幕/i.test(dn)});}
    }
    return out;
  }
  function sortMagnets(list,sort){
    var a=(list||[]).slice();sort=sort||'size_desc';a.sort(function(x,y){if(sort.indexOf('date_')===0){var c=s(x.date).localeCompare(s(y.date));return sort==='date_asc'?c:-c;}var d=(x.bytes||0)-(y.bytes||0);return sort==='size_asc'?d:-d;});return a;
  }

  C.magnets=function(detail,sort){
    if(!detail)return[];
    var html=s(detail.html),gid=s(detail.gid||jsVar(html,'gid')),uc=s(detail.uc!==undefined?detail.uc:jsVar(html,'uc')),img=s(detail.magnetImg||jsVar(html,'img')||detail.rawImg||'');
    if(!gid||uc==='')return[];
    var api=C.base+'/ajax/uncledatoolsbyajax.php?gid='+encodeURIComponent(gid)+'&lang=zh&img='+encodeURIComponent(img)+'&uc='+encodeURIComponent(uc);
    var ref=C.detailUrl(detail.id),ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    var headers={'User-Agent':ua,'Accept':'text/html, */*; q=0.01','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.7','Referer':ref,'Cookie':'existmag=all','X-Requested-With':'XMLHttpRequest'};
    var raw='';try{raw=s(fetch(api,{timeout:12000,headers:headers}));}catch(e){raw='';}
    var list=parseMagnetRows(raw);
    if(!list.length){try{var w=s(fetchCodeByWebView(api,{timeout:12000,headers:headers}));list=parseMagnetRows(w);}catch(e2){}}
    if(!list.length){try{var rendered=s(fetchCodeByWebView(ref,{timeout:15000,headers:{'User-Agent':ua,'Referer':C.base+'/','Cookie':'existmag=all'}}));list=parseMagnetRows(rendered);}catch(e3){}}
    detail.magnetDebug={gid:gid,uc:uc,img:img,api:api,rawLength:raw.length,count:list.length};
    return sortMagnets(list,sort);
  };

  C.magnetLongClicks=function(link,code){
    return [
      {title:'迅雷',js:$.toString(function(m){if(fetch('hiker://home@迅雷')==='null')return'toast://未安装 迅雷';return'hiker://page/diaoyong?rule=迅雷&page=fypage#'+m;},link)},
      {title:'PikPak',js:$.toString(function(m){if(fetch('hiker://home@PikPak')==='null')return'toast://未安装 PikPak';return'hiker://page/fxlj?rule=PikPak&realurl='+encodeURIComponent(m);},link)},
      {title:'123云盘',js:$.toString(function(m){if(fetch('hiker://home@123云盘')==='null')return'toast://未安装 123云盘';return'hiker://page/diaoyong?rule=123云盘&page=fypage&realurl='+encodeURIComponent(m);},link)},
      {title:'光鸭云盘',js:$.toString(function(m){if(fetch('hiker://home@光鸭云盘')==='null')return'toast://未安装 光鸭云盘';return'hiker://page/magnet?rule=光鸭云盘&realurl='+encodeURIComponent(m);},link)},
      {title:'复制磁力',js:$.toString(function(m){return'copy://'+m;},link)}
    ];
  };

  function playbackGrid(d,code){
    var ps=[
      {id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico',ref:'https://missav.live/'},
      {id:'123av',name:'123AV',icon:'https://123av.com/favicon.ico',ref:'https://123av.com/'},
      {id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico',ref:'https://jable.tv/'}
    ];
    for(var i=0;i<ps.length;i++){var p=ps[i];d.push({title:p.name,img:officialImage(p.icon,p.ref),pic_url:officialImage(p.icon,p.ref),url:C.playbackUrl(p.id,code),col_type:'icon_3',extra:{lineVisible:false,pageTitle:p.name+' · '+code}});}
  }
  function clickableProp(d,icon,label,p,type){if(!p||!p.name)return;var pi=p.path||C.pathInfo(p.href);d.push({title:icon+' '+label+' · '+p.name,url:page('javbusFilter',{type:pi.type||type,kind:pi.kind,id:pi.id,name:p.name}),col_type:'flex_button',extra:{lineVisible:false}});}
  function actorUrl(a){return page('javbusActor',{id:a.id,type:a.type||'normal'});}
  function movieUrl(m){return page('javbusDetail',{id:m.id,type:m.type||'normal'});}
  function movieCard(m){var tags=(m.tags||[]).join(' · '),desc=[m.id,m.date,tags].filter(function(x){return!!x;}).join(' · ');return{title:m.title||m.id,desc:desc,img:m.img,pic_url:m.img,url:movieUrl(m),col_type:'movie_3',extra:{pageTitle:m.id||m.title,lineVisible:false}};}
  function sortTabs(d,sort){var xs=[['大小↓','size_desc'],['大小↑','size_asc'],['日期↓','date_desc'],['日期↑','date_asc']];for(var i=0;i<xs.length;i++)(function(x){d.push({title:(sort===x[1]?'““””<b><font color=#E75480>'+x[0]+'</font></b>':x[0]),url:$('#noLoading#').lazyRule(function(v){putMyVar('javbus_mag_sort',v);refreshPage(false);return'hiker://empty';},x[1]),col_type:'scroll_button',extra:{lineVisible:false}});})(xs[i]);}
  function magnetRows(d,detail,limit){var sort=getMyVar('javbus_mag_sort','size_desc');sortTabs(d,sort);var ms=C.magnets(detail,sort),max=limit?Math.min(limit,ms.length):ms.length;if(!ms.length){var dbg=detail.magnetDebug||{};d.push({title:'暂无磁力资源',desc:'JavBus 原站有磁力时这里也应返回。当前参数：gid='+s(dbg.gid||detail.gid)+' · uc='+s(dbg.uc||detail.uc)+' · img='+(dbg.img?'已取得':'缺失')+' · AJAX '+s(dbg.rawLength||0)+'B',url:'web://'+C.detailUrl(detail.id),col_type:'text_center_1',extra:{lineVisible:false}});return 0;}for(var i=0;i<max;i++){var m=ms[i],tag=(m.hd?'高清 ':'')+(m.sub?'字幕 ':'');d.push({title:'🧲 '+(tag?'【'+tag.replace(/\s+$/,'')+'】 ':'')+(m.title||detail.id),desc:[m.size,m.date].filter(function(x){return!!x;}).join(' · ')+'\n点击复制 · 长按：迅雷 / PikPak / 123云盘 / 光鸭云盘',url:'copy://'+m.link,col_type:'text_1',extra:{lineVisible:false,longClick:C.magnetLongClicks(m.link,detail.id)}});}return ms.length;}

  R.preview=function(){var d=[],id=decodeURIComponent(getParam('id','')||''),type=getParam('type','normal')||'normal';setPageTitle('预览 · '+id);if(!id){d.push({title:'缺少影片番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}var url=C.detailUrl(id),html=C.fetchHtml(url);if(!html){d.push({title:'预览图读取失败',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}var x=C.parseDetail(html,id);d.push(section('🖼 '+id,(x.samples||[]).length+' 张预览图'));if(!x.samples||!x.samples.length){d.push({title:'暂无预览图',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}for(var i=0;i<x.samples.length;i++){var sm=x.samples[i];d.push({title:sm.title||('预览 '+(i+1)),img:sm.thumb,pic_url:sm.thumb,url:'pics://'+sm.src,col_type:'pic_1_full',extra:{lineVisible:false}});}setResult(d);};

  R.detail=function(){
    var d=[],id=decodeURIComponent(getParam('id','')||''),type=getParam('type','normal')||'normal';if(!id){d.push({title:'缺少影片番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}
    var url=C.detailUrl(id),html=C.fetchHtml(url);if(!html){d.push({title:'影片详情读取失败',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}
    var x=C.parseDetail(html,id),saved=C.isFav('video',id),desc=[x.date,x.length?x.length+' 分钟':'',C.typeName(type)].filter(function(v){return!!v;}).join(' · '),i;
    setPageTitle(id);
    d.push({title:x.title||id,desc:desc,img:x.img,pic_url:x.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    d.push({title:'🧲 磁力',url:page('javbusMagnets',{id:id,type:type}),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:'🖼 预览'+((x.samples&&x.samples.length)?' '+x.samples.length:'') ,url:page('javbusPreview',{id:id,type:type}),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:saved?'★ 已收藏':'☆ 收藏',url:$('#noLoading#').lazyRule(function(x,type){var J=$.require('javbus'),ok=J.toggleVideoFavorite({id:x.id,title:x.title,img:x.img,url:'https://www.javbus.com/'+x.id,type:type});refreshPage(false);return'toast://'+(ok?'影片已收藏':'已取消收藏');},x,type),col_type:'text_4',extra:{lineVisible:false}});
    d.push({title:'🌐 原站',url:'web://'+url,col_type:'text_4',extra:{lineVisible:false}});

    d.push(section('第三方在线播放','使用原站图标 · MissAV / 123AV / Jable'));playbackGrid(d,id);
    d.push({title:'⧉ '+id,url:'copy://'+id,col_type:'scroll_button',extra:{lineVisible:false}});if(x.date)d.push({title:'📅 '+x.date,url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});if(x.length)d.push({title:'⏱ '+x.length+' 分钟',url:'hiker://empty',col_type:'scroll_button',extra:{lineVisible:false}});

    d.push(section('核心资料','点击厂商、系列、演员或标签继续筛选'));clickableProp(d,'🎥','导演',x.director,type);clickableProp(d,'🎬','制作商',x.studio,type);clickableProp(d,'🏷','发行商',x.label,type);clickableProp(d,'📚','系列',x.series,type);
    if(x.stars&&x.stars.length){d.push(section('演员',''));for(i=0;i<x.stars.length;i++){var st=x.stars[i],pi=st.path||C.pathInfo(st.href);d.push({title:'👤 '+st.name,url:actorUrl({id:pi.id,name:st.name,type:pi.type||type}),col_type:'flex_button',extra:{lineVisible:false}});}}
    if(x.genres&&x.genres.length){d.push(section('标签',''));for(i=0;i<x.genres.length;i++){var g=x.genres[i],gp=g.path||C.pathInfo(g.href);d.push({title:'# '+g.name,url:page('javbusFilter',{type:gp.type||type,kind:'genre',id:gp.id,name:g.name}),col_type:'flex_button',extra:{lineVisible:false}});}}

    if(x.samples&&x.samples.length){d.push(section('预览图','顶部“🖼 预览”可打开完整预览页'));for(i=0;i<Math.min(4,x.samples.length);i++){var sm=x.samples[i];d.push({title:sm.title,img:sm.thumb,pic_url:sm.thumb,url:'pics://'+sm.src,col_type:'pic_2',extra:{lineVisible:false}});}if(x.samples.length>4)d.push({title:'查看全部 '+x.samples.length+' 张预览 ›',url:page('javbusPreview',{id:id,type:type}),col_type:'text_center_1',extra:{lineVisible:false}});}
    d.push(section('磁力资源','顶部“🧲 磁力”进入完整列表；这里预览前 3 条'));var total=magnetRows(d,x,3);if(total>3)d.push({title:'查看全部 '+total+' 条磁力 ›',url:page('javbusMagnets',{id:id,type:type}),col_type:'text_center_1',extra:{lineVisible:false}});
    if(x.related&&x.related.length){d.push(section('相似影片',''));for(i=0;i<x.related.length;i++)d.push(movieCard({id:x.related[i].id,title:x.related[i].title,img:x.related[i].img,date:'',tags:[],href:x.related[i].href,type:type}));}
    setResult(d);
  };

  R.magnets=function(){var d=[],id=decodeURIComponent(getParam('id','')||''),type=getParam('type','normal')||'normal';setPageTitle('磁力 · '+id);if(!id){d.push({title:'缺少影片番号',url:'hiker://empty',col_type:'text_center_1'});setResult(d);return;}var url=C.detailUrl(id),html=C.fetchHtml(url);if(!html){d.push({title:'影片详情读取失败，无法取得磁力参数',url:'web://'+url,col_type:'text_center_1'});setResult(d);return;}var x=C.parseDetail(html,id);d.push(section('🧲 '+id,'点击复制；长按调用 迅雷 / PikPak / 123云盘 / 光鸭云盘'));magnetRows(d,x,0);setResult(d);};

  function bootAction3(action){return $('#noLoading#').lazyRule(function(action){try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javbus/bootstrap_test_v3.js?v=20003',{headers:{'Cache-Control':'no-cache'}},20003);var r=JavBusBoot[action]();if(action==='check')return'toast://'+(r.hasUpdate?('发现新版本 '+r.latest.version):('当前已是最新 '+r.current.version));if(r&&r.ok){refreshPage(false);return'toast://操作完成';}return'toast://'+String(r&&r.error||'操作失败');}catch(e){return'toast://'+String(e.message||e);}},action);}
  R.settings=function(){var d=[],def=getItem('javbus_default_type','normal')||'normal',mag=C.magMode();setPageTitle('JavBus 设置');d.push(section('浏览偏好',''));d.push({title:'默认首页 · '+C.typeName(def),url:'select://'+JSON.stringify({title:'默认首页',options:['有码','无码','欧美'],col:3,js:$.toString(function(){var m={'有码':'normal','无码':'uncensored','欧美':'western'};setItem('javbus_default_type',m[input]);putMyVar('javbus_home_type',m[input]);return'toast://默认首页已设为 '+input;})}),col_type:'text_1'});d.push({title:'影片范围 · '+(mag==='exist'?'只看有磁力':'全部影片'),url:'select://'+JSON.stringify({title:'影片范围',options:['全部影片','只看有磁力'],col:2,js:$.toString(function(){setItem('javbus_mag_mode',input==='只看有磁力'?'exist':'all');return'toast://已保存';})}),col_type:'text_1'});d.push(section('测试版维护','当前 2.0.0-alpha3 / Build 20003'));d.push({title:'检查更新',url:bootAction3('check'),col_type:'text_1'});d.push({title:'更新到最新 Test',url:bootAction3('update'),col_type:'text_1'});d.push({title:'回退上一 Test',url:bootAction3('rollback'),col_type:'text_1'});d.push({title:'重新加载当前 Test',url:bootAction3('reinstall'),col_type:'text_1'});d.push(section('alpha3',''));d.push({title:'本轮重点',desc:'磁力改用详情源码 gid / uc / img 原始变量请求 JavBus AJAX，并加入 HTML 正则解析与 WebView 后级兜底；磁力长按固定为 迅雷 / PikPak / 123云盘 / 光鸭云盘；详情顶部增加完整预览入口；第三方在线播放改为 MissAV / 123AV / Jable 原站图标宫格。',url:'hiker://empty',col_type:'long_text'});setResult(d);};
  var oldModule=R.module;
  R.module=function(){var m=oldModule();m.detail=R.detail;m.magnets=R.magnets;m.preview=R.preview;m.settings=R.settings;return m;};
})();
