/* 溏心次元 0.1.0-test.5 Runtime patch: browser-source verification recovery */
(function(){
  if(typeof TxcyRemoteRuntime==='undefined'||typeof TxcyCore==='undefined')throw new Error('Txcy Test5 runtime preflight failed');
  var R=TxcyRemoteRuntime,C=TxcyCore,ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/assets/icon.svg?v=202608235';
  R.version='0.1.0-test.5';R.build=10105;
  function add(d,x){d.push(x);}function title(t){try{setPageTitle(t);}catch(e){}}
  function line(d){add(d,{col_type:'line'});}
  function syncAction(closeOnOk){
    return $(C.root()).lazyRule(function(boot,closeIt){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10105);TxcyBoot.loadOnly();
      var r=TxcyCore.syncWebSession();
      if(r.ok){if(closeIt){try{back(true);}catch(e){try{refreshPage(false);}catch(e2){}}}else{try{refreshPage(false);}catch(e3){}}}
      return'toast://'+r.message;
    },C.bootstrap,!!closeOnOk);
  }
  function resetAction(){
    return $(C.root()).lazyRule(function(boot){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10105);TxcyBoot.loadOnly();TxcyCore.clearCfState();refreshPage(false);return'toast://已重置验证与传输状态';
    },C.bootstrap);
  }
  function statusText(){
    var st=C.cfStatus(),live=st.live||{},state=st.state||{},web=st.web||{},a=[];
    a.push('当前传输：'+(st.transport==='webview'?'浏览器会话源码':st.transport==='native-cookie'?'原生 Cookie':'自动检测'));
    a.push('浏览器 Cookie：'+(live.hasCookie?(live.count+' 个 · '+live.fingerprint):'未读取到（不再作为唯一成功条件）'));
    a.push('clearance：'+(live.hasClearance?'已检测到':'未检测到'));
    if(state.ok)a.push('上次验证：已通过 · '+(state.transport||st.transport));else a.push('上次验证：未确认');
    if(web.time)a.push('浏览器取源码：'+(web.ok?'成功':'失败')+' · HTML '+(web.len||0)+' · '+(web.elapsed||0)+'ms');
    if(web.error)a.push('浏览器错误：'+web.error);
    return a.join('\n');
  }

  R.verify=function(){
    title('站点安全验证');var d=[];
    add(d,{title:'站点安全验证',desc:'Test5 不再把 getCookie 当作唯一通行条件。先由官网完成验证，再直接尝试从浏览器会话读取真实页面源码。',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'① 打开官网验证',desc:'进入 X5，等待 Cloudflare 自动验证；若有人机确认请正常完成，直到看到真正的网站首页',col_type:'text_center_1',url:'x5://'+C.root(),extra:{lineVisible:false,ua:C.ua,referer:C.root()}});
    add(d,{title:'② 已进入网站，读取真实页面',desc:'返回后点击这里。即使 getCookie 仍为空，也会改用浏览器源码通道尝试读取',col_type:'text_center_1',url:syncAction(true),extra:{lineVisible:false}});
    add(d,{title:'当前状态',desc:statusText(),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    line(d);
    add(d,{title:'重新检测',desc:'不关闭页面，重新检查当前浏览器会话',col_type:'text_2',url:syncAction(false),extra:{lineVisible:false}});
    add(d,{title:'重置验证状态',desc:'清除本程序记录的验证/传输状态，不删除官网浏览器数据',col_type:'text_2',url:resetAction(),extra:{lineVisible:false}});
    add(d,{title:'说明',desc:'当前实机已经证明：X5 网页能够通过验证，但 getCookie() 读不到该浏览器会话。因此 Test5 增加 WebView 源码传输兜底，成功后首页/分类/搜索/详情会优先通过浏览器环境取得真实 HTML。不会伪造 cf_clearance，也不会破解 Cloudflare。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    setResult(d);
  };

  R.settings=function(){
    title('设置与诊断');var d=[],st=C.cfStatus(),web=st.web||{};
    add(d,{title:'溏心次元 · Test5',desc:R.version+' · Build '+R.build+' · '+(st.transport==='webview'?'Browser Source':st.transport==='native-cookie'?'Cookie Native':'Auto Transport'),pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'验证与传输状态',desc:statusText(),col_type:'long_text',url:C.page('txcyVerify'),extra:{lineVisible:false}});
    add(d,{title:'打开验证向导',desc:'验证完成后可直接检查浏览器源码，不再要求必须读到 Cookie',col_type:'text_center_1',url:C.page('txcyVerify'),extra:{lineVisible:false}});
    if(web.url)add(d,{title:'最近浏览器请求',desc:web.url+'\nHTML '+(web.len||0)+' · '+(web.elapsed||0)+'ms'+(web.error?'\n'+web.error:''),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    line(d);
    add(d,{title:'兼容诊断',desc:'如果 Test5 仍然无法拿到真实 HTML，请截图本页“验证与传输状态”和“最近浏览器请求”。下一步将改为持续 X5 页面桥接，而不是再猜 Cookie。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    setResult(d);
  };

  R.module=function(){return R;};
})();
