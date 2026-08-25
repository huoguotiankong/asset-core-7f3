/* JavBus 2.0.1-test.1 Native Local-First delivery overlay */
(function(){
  if(typeof JavBusCore!=='object'||typeof JavBusRemoteRuntime!=='object')throw new Error('JavBus Stable runtime missing');
  var C=JavBusCore,R=JavBusRemoteRuntime;
  var VERSION='2.0.1-test.1',BUILD=20101;
  var LOCAL_ROOT='hiker://files/rules/asset-core-local/javbus-test/b20101/';
  var LOCAL_DOMAINS=LOCAL_ROOT+'domains.json';
  var REMOTE_DOMAINS='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javbus/domains.json';
  var STATIC_DOMAINS=['https://www.javbus.com','https://www.busjav.cyou','https://www.fanbus.bond','https://www.buscdn.bond'];
  var ACTIVE_KEY='javbus_active_domain';

  R.version=VERSION;R.build=VERSION;C.version=VERSION;C.build=BUILD;
  C.localFirstVersion=VERSION;C.localFirstBuild=BUILD;

  function s(v){return v===undefined||v===null?'':String(v);}
  function norm(v){v=s(v).trim().replace(/\/+$/,'');return /^https?:\/\/[^/]+$/i.test(v)?v:'';}
  function uniq(a){var o=[],m={};for(var i=0;i<a.length;i++){var x=norm(a[i]);if(!x||m[x])continue;m[x]=1;o.push(x);}return o;}
  function parseDomains(raw){try{var j=JSON.parse(s(raw)),a=[];if(j.canonical)a.push(j.canonical);if(j.mirrors&&j.mirrors.length)a=a.concat(j.mirrors);return uniq(a);}catch(e){return[];}}
  function localDomains(){var a=[];try{if(fileExist(LOCAL_DOMAINS))a=parseDomains(readFile(LOCAL_DOMAINS));}catch(e){}return uniq(a.concat(STATIC_DOMAINS));}
  function candidates(preferred){var a=[],stored=norm(getItem(ACTIVE_KEY,''));if(preferred)a.push(preferred);if(stored)a.push(stored);return uniq(a.concat(localDomains()));}
  function origin(url){var m=s(url).match(/^(https?:\/\/[^/]+)/i);return m?norm(m[1]):'';}
  function rest(url){var m=s(url).match(/^https?:\/\/[^/]+([\s\S]*)$/i);return m?(m[1]||'/'):'';}
  function looksValid(h){var t=s(h),l=t.toLowerCase();if(C.isBadHtml(t))return false;return l.indexOf('movie-box')>=0||l.indexOf('waterfall')>=0||l.indexOf('photo-info')>=0||l.indexOf('sample-waterfall')>=0||l.indexOf('/genre/')>=0||l.indexOf('/star/')>=0||l.indexOf('var gid')>=0||(l.indexOf('navbar')>=0&&l.indexOf('javbus')>=0)||/magnet:\?xt=urn:btih:/i.test(t);}
  function remember(base){base=norm(base);if(!base)return;C.base=base;setItem(ACTIVE_KEY,base);setItem('javbus_active_domain_at',String(new Date().getTime()));}
  function headersFor(url){var o=origin(url);return {'User-Agent':C.ua,'Referer':o?o+'/':C.base+'/','Cookie':C.cookie(),'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};}
  function fetchOne(url,timeout){var h='';try{h=s(fetch(url,{timeout:timeout||7000,headers:headersFor(url)}));}catch(e){h='';}if(!looksValid(h)&&typeof fetchCodeByWebView==='function'){try{h=s(fetchCodeByWebView(url,{timeout:10000,headers:headersFor(url)}));}catch(e2){}}return h;}

  C.domainConfigUrl=LOCAL_DOMAINS;
  C.domainCandidates=function(){return candidates(C.base);};
  C.currentDomain=function(){return C.base;};
  C.resetDomain=function(){clearItem(ACTIVE_KEY);C.base=STATIC_DOMAINS[0];return C.base;};
  C.resolveBase=function(force){if(force)C.resetDomain();var list=candidates(C.base);for(var i=0;i<list.length;i++){var h=fetchOne(list[i]+'/',5000);if(looksValid(h)){remember(list[i]);return list[i];}}return C.base;};
  var stored=norm(getItem(ACTIVE_KEY,''));if(stored)C.base=stored;
  C.fetchHtml=function(url,timeout){var r=rest(url),o=origin(url),known=candidates(o),all=localDomains();if(!r||!o||all.indexOf(o)<0){var h='';try{h=s(fetch(url,{timeout:timeout||9000,headers:C.headers(url)}));}catch(e){h='';}if(C.isBadHtml(h)&&typeof fetchCodeByWebView==='function'){try{h=s(fetchCodeByWebView(url,{timeout:12000,headers:C.headers(url)}));}catch(e2){}}return h;}for(var i=0;i<known.length;i++){var t=known[i]+r,h2=fetchOne(t,timeout||7000);if(looksValid(h2)){remember(known[i]);return h2;}}return'';};
  C.fetchText=function(url,ref,timeout){var r=rest(url),o=origin(url),all=localDomains();if(!r||!o||all.indexOf(o)<0){try{return s(fetch(url,{timeout:timeout||9000,headers:C.headers(ref||url)}));}catch(e){return'';}}var list=candidates(o);for(var i=0;i<list.length;i++){var target=list[i]+r,raw='';try{raw=s(fetch(target,{timeout:timeout||7000,headers:C.headers(ref?list[i]+rest(ref):target)}));}catch(e2){raw='';}if(raw){remember(list[i]);return raw;}}return'';};

  C.loadPlayback=function(){if(typeof JavBusLocalPlayback!=='object'||String(JavBusLocalPlayback.version||'')!=='1.0.0-test.4')throw new Error('Local JAV Playback SDK 未就绪');return JavBusLocalPlayback;};
  C.playbackUrl=function(provider,code){return $('#noLoading#').lazyRule(function(provider,code){try{var J=$.require('javbus');return J.play(provider,code);}catch(e){return'toast://播放解析失败：'+String(e.message||e);}},provider,code);};

  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  R.settings=function(){
    var d=[],def=getItem('javbus_default_type','normal')||'normal',mag=C.magMode(),domains=C.domainCandidates();setPageTitle('JavBus 设置');
    d.push(section('浏览偏好',''));
    d.push({title:'默认首页 · '+C.typeName(def),url:'select://'+JSON.stringify({title:'默认首页',options:['有码','无码','欧美'],col:3,js:$.toString(function(){var m={'有码':'normal','无码':'uncensored','欧美':'western'};setItem('javbus_default_type',m[input]);putMyVar('javbus_home_type',m[input]);return'toast://默认首页已设为 '+input;})}),col_type:'text_1'});
    d.push({title:'影片范围 · '+(mag==='exist'?'只看有磁力':'全部影片'),url:'select://'+JSON.stringify({title:'影片范围',options:['全部影片','只看有磁力'],col:2,js:$.toString(function(){setItem('javbus_mag_mode',input==='只看有磁力'?'exist':'all');return'toast://已保存';})}),col_type:'text_1'});
    d.push(section('域名自动切换','当前：'+C.currentDomain()));
    d.push({title:'重新检测可用域名',desc:'只使用本地 domains.json + 静态兜底列表；不会在普通启动时访问 GitHub。',url:$('#noLoading#').lazyRule(function(){clearItem('javbus_active_domain');refreshPage(false);return'toast://已重置，下一次业务请求将重新选择域名';}),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'同步域名列表',desc:'手动从仓库刷新 domains.json；仅点击此项时联网更新控制面。',url:$('#noLoading#').lazyRule(function(localPath,remote){try{var raw=String(fetch(remote+'?_='+new Date().getTime(),{timeout:6000,headers:{'Cache-Control':'no-cache'}})||''),j=JSON.parse(raw);if(!j||(!j.canonical&&!j.mirrors))throw new Error('域名配置无效');writeFile(localPath,raw);clearItem('javbus_active_domain');refreshPage(false);return'toast://域名列表已同步';}catch(e){return'toast://同步失败：'+String(e.message||e);}},LOCAL_DOMAINS,REMOTE_DOMAINS),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'候选域名',desc:domains.join('\n'),url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    d.push(section('Local-First','2.0.1-test.1 / Build20101'));
    d.push({title:'本地化诊断',desc:'Runtime Bundle / Shared Playback / 本地域名配置',url:'hiker://page/javbusLocalFirst?rule=&simple=true',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'说明',desc:'业务/API/UI/磁力/收藏基线继承 Stable 2.0.0。程序代码、补丁、Shared JAV Playback 与 123AV 图标已经进入本地 Runtime；正常二次启动不再加载 Bootstrap / Remote Manager / 远程 Runtime。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    setResult(d);
  };

  var oldModule=R.module;
  R.module=function(){var m=oldModule();m.settings=R.settings;m.localInfo=function(){return{version:VERSION,build:BUILD,domain:C.currentDomain(),domains:C.domainCandidates(),playback:String(C.loadPlayback().version||'')};};return m;};
})();
