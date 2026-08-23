/* JavBus 2.0.0 Stable - domain failover + stable identity */
(function(){
  if(typeof JavBusCore!=='object'||typeof JavBusRemoteRuntime!=='object')throw new Error('JavBus stable base runtime missing');
  var C=JavBusCore,R=JavBusRemoteRuntime;
  R.version='2.0.0';R.build='2.0.0';C.version='2.0.0';C.build=20005;

  var STATIC_DOMAINS=['https://www.javbus.com','https://www.busjav.cyou','https://www.fanbus.bond','https://www.buscdn.bond'];
  var CONFIG_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javbus/domains.json';
  var ACTIVE_KEY='javbus_active_domain',CFG_KEY='javbus_domain_config_cache',CFG_TS_KEY='javbus_domain_config_ts';
  var oldFetchHtml=C.fetchHtml,oldFetchText=C.fetchText;

  function s(v){return v===undefined||v===null?'':String(v);}
  function normBase(v){v=s(v).trim().replace(/\/+$/,'');return /^https?:\/\/[^/]+$/i.test(v)?v:'';}
  function uniq(a){var o=[],m={};for(var i=0;i<a.length;i++){var x=normBase(a[i]);if(!x||m[x])continue;m[x]=1;o.push(x);}return o;}
  function parseCfg(raw){try{var j=JSON.parse(s(raw)),a=[];if(j.canonical)a.push(j.canonical);if(j.mirrors&&j.mirrors.length)a=a.concat(j.mirrors);return uniq(a);}catch(e){return[];}}
  function loadCfg(){
    var cached=getItem(CFG_KEY,''),ts=Number(getItem(CFG_TS_KEY,'0')||0),now=new Date().getTime(),list=parseCfg(cached);
    if(!list.length||now-ts>21600000){
      try{var raw=s(fetch(CONFIG_URL+'?_='+now,{timeout:5000,headers:{'Cache-Control':'no-cache'}})),fresh=parseCfg(raw);if(fresh.length){list=fresh;setItem(CFG_KEY,raw);setItem(CFG_TS_KEY,String(now));}}catch(e){}
    }
    return uniq(list.concat(STATIC_DOMAINS));
  }
  function allDomains(preferred){var a=[],stored=normBase(getItem(ACTIVE_KEY,''));if(preferred)a.push(preferred);if(stored)a.push(stored);a=a.concat(loadCfg());return uniq(a);}
  function siteRest(url){var m=s(url).match(/^https?:\/\/[^/]+([\s\S]*)$/i);return m?m[1]||'/':'';}
  function siteOrigin(url){var m=s(url).match(/^(https?:\/\/[^/]+)/i);return m?normBase(m[1]):'';}
  function looksValid(h){var t=s(h),l=t.toLowerCase();if(C.isBadHtml(t))return false;return l.indexOf('movie-box')>=0||l.indexOf('waterfall')>=0||l.indexOf('photo-info')>=0||l.indexOf('sample-waterfall')>=0||l.indexOf('/genre/')>=0||l.indexOf('/star/')>=0||l.indexOf('var gid')>=0||(l.indexOf('navbar')>=0&&l.indexOf('javbus')>=0)||/magnet:\?xt=urn:btih:/i.test(t);}
  function setActive(base){base=normBase(base);if(!base)return;C.base=base;setItem(ACTIVE_KEY,base);setItem('javbus_active_domain_at',String(new Date().getTime()));}
  function headersFor(url){var o=siteOrigin(url);return {'User-Agent':C.ua,'Referer':o?o+'/':C.base+'/','Cookie':C.cookie(),'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};}
  function fetchOne(url,timeout){
    var h='';try{h=s(fetch(url,{timeout:timeout||7000,headers:headersFor(url)}));}catch(e){h='';}
    if(!looksValid(h)&&typeof fetchCodeByWebView==='function'){try{h=s(fetchCodeByWebView(url,{timeout:10000,headers:headersFor(url)}));}catch(e2){}}
    return h;
  }

  C.domainConfigUrl=CONFIG_URL;
  C.domainCandidates=function(){return allDomains(C.base);};
  C.currentDomain=function(){return C.base;};
  C.resetDomain=function(){clearItem(ACTIVE_KEY);clearItem(CFG_TS_KEY);C.base=STATIC_DOMAINS[0];return C.base;};
  C.resolveBase=function(force){
    if(force)C.resetDomain();
    var list=allDomains(C.base),last='';
    for(var i=0;i<list.length;i++){
      var u=list[i]+'/';last=fetchOne(u,5000);
      if(looksValid(last)){setActive(list[i]);return list[i];}
    }
    return C.base;
  };

  var stored=normBase(getItem(ACTIVE_KEY,''));if(stored)C.base=stored;
  C.fetchHtml=function(url,timeout){
    var rest=siteRest(url),origin=siteOrigin(url),configured=allDomains('');
    if(!rest||!origin||configured.indexOf(origin)<0)return oldFetchHtml(url,timeout);
    var known=allDomains(origin),h='';
    for(var i=0;i<known.length;i++){
      var target=known[i]+rest;h=fetchOne(target,timeout||7000);
      if(looksValid(h)){setActive(known[i]);return h;}
    }
    return'';
  };
  C.fetchText=function(url,ref,timeout){
    var rest=siteRest(url),origin=siteOrigin(url),configured=allDomains('');if(!rest||!origin||configured.indexOf(origin)<0)return oldFetchText(url,ref,timeout);
    var list=allDomains(origin),raw='';for(var i=0;i<list.length;i++){var target=list[i]+rest;try{raw=s(fetch(target,{timeout:timeout||7000,headers:C.headers(ref?list[i]+siteRest(ref):target)}));}catch(e){raw='';}if(raw){setActive(list[i]);return raw;}}return'';
  };

  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function stableBootAction(action){return $('#noLoading#').lazyRule(function(action){try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javbus/bootstrap_stable_v1_b20005.js?v=20005',{headers:{'Cache-Control':'no-cache'}},20005);var r=JavBusBoot[action]();if(action==='check')return'toast://'+(r.hasUpdate?('发现新版本 '+r.latest.version):('当前已是最新 '+r.current.version));if(r&&r.ok){refreshPage(false);return'toast://操作完成';}return'toast://'+String(r&&r.error||'操作失败');}catch(e){return'toast://'+String(e.message||e);}},action);}
  R.settings=function(){
    var d=[],def=getItem('javbus_default_type','normal')||'normal',mag=C.magMode(),domains=C.domainCandidates();setPageTitle('JavBus 设置');
    d.push(section('浏览偏好',''));
    d.push({title:'默认首页 · '+C.typeName(def),url:'select://'+JSON.stringify({title:'默认首页',options:['有码','无码','欧美'],col:3,js:$.toString(function(){var m={'有码':'normal','无码':'uncensored','欧美':'western'};setItem('javbus_default_type',m[input]);putMyVar('javbus_home_type',m[input]);return'toast://默认首页已设为 '+input;})}),col_type:'text_1'});
    d.push({title:'影片范围 · '+(mag==='exist'?'只看有磁力':'全部影片'),url:'select://'+JSON.stringify({title:'影片范围',options:['全部影片','只看有磁力'],col:2,js:$.toString(function(){setItem('javbus_mag_mode',input==='只看有磁力'?'exist':'all');return'toast://已保存';})}),col_type:'text_1'});
    d.push(section('域名自动切换','当前：'+C.currentDomain()));
    d.push({title:'重新检测可用域名',desc:'当前域名访问失败时程序会自动按候选域名切换，并记住最后一次成功域名。',url:$('#noLoading#').lazyRule(function(){clearItem('javbus_active_domain');clearItem('javbus_domain_config_ts');refreshPage(false);return'toast://已重置，下一次请求将重新自动选择域名';}),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'候选域名',desc:domains.join('\n'),url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    d.push(section('正式版维护','当前 2.0.0 / Build 20005'));
    d.push({title:'检查更新',url:stableBootAction('check'),col_type:'text_1'});d.push({title:'更新到最新 Stable',url:stableBootAction('update'),col_type:'text_1'});d.push({title:'回退上一 Stable',url:stableBootAction('rollback'),col_type:'text_1'});d.push({title:'重新加载当前 Stable',url:stableBootAction('reinstall'),col_type:'text_1'});
    d.push(section('说明',''));d.push({title:'JavBus 2.0.0',desc:'由重写 Test alpha4 晋级。保留已实机恢复的磁力链、演员/分类/搜索/预览/收藏和共享 JAV Playback；新增域名健康检查、自动故障切换、成功域名持久记忆与远程候选域名配置。旧 Apollo 本地规则不再属于正式运行链。',url:'hiker://empty',col_type:'long_text'});setResult(d);
  };

  var oldModule=R.module;
  R.module=function(){var m=oldModule();m.settings=R.settings;return m;};
})();
