/* 色花堂 0.1.0-test.25 / Build 10125 - Guide web-first rendering for reliable previews + speed */
var SeHuaTangPatchTest25=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var RULE_NAME='色花堂',KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7';
function s(v){return v==null?'':String(v)}
function guideUrl(mode){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2'}
function guideName(mode){return mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')}
function injectJs(){return $.toString(function(cookieKey,accessKey){
  try{
    var text=String((document.body&&document.body.innerText)||'');
    var age=/满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i;
    if(age.test(text)){
      var ns=document.querySelectorAll('a,button,input,[onclick],[role="button"],div,span,p'),i,t,n,c;
      for(i=0;i<ns.length;i++){
        t=String(ns[i].innerText||ns[i].textContent||ns[i].value||'').replace(/\s+/g,' ').trim();
        if(!age.test(t))continue;
        n=ns[i];
        try{c=n.closest&&n.closest('a,button,[onclick],[role="button"]');if(c)n=c}catch(e0){}
        try{n.dispatchEvent(new MouseEvent('click',{view:window,bubbles:true,cancelable:true}));if(n.click)n.click();break}catch(e1){}
      }
      return;
    }
    try{
      var ck=fba.getCookie(location.origin)||'';
      if(ck)fba.putVar(cookieKey,ck);
      fba.putVar(accessKey,'1');
    }catch(e2){}
  }catch(e3){}
},KEY_COOKIE,KEY_ACCESS)}
function threadInterceptor(){return $.toString(function(ruleName){
  var u=String(input||'');
  if(!(/[?&](?:tid|ptid)=\d+/i.test(u)||/\/thread-\d+-\d+-\d+\.html/i.test(u)))return false;
  return $.toString(function(url,rule){
    var title='帖子详情';
    try{
      var as=document.querySelectorAll('a[href]'),i,a,href,txt;
      for(i=0;i<as.length;i++){
        a=as[i];
        try{href=new URL(a.getAttribute('href')||a.href||'',location.href).href}catch(e0){href=String(a.href||'')}
        if(href!==url)continue;
        txt=String(a.innerText||a.textContent||a.getAttribute('title')||'').replace(/\s+/g,' ').trim();
        if(txt)title=txt;
        break;
      }
    }catch(e1){}
    try{
      fy_bridge_app.open(JSON.stringify({
        title:title,
        url:'hiker://page/shtThread?rule='+encodeURIComponent(rule)+'&simple=true&sht_url='+encodeURIComponent(url)+'&sht_name='+encodeURIComponent(title)
      }));
    }catch(e2){location.href=url}
  },u,ruleName);
},RULE_NAME)}
function guideWeb(){
  var mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',guideName(mode)),url=guideUrl(mode),d=[];
  try{if(Math.max(1,Number(typeof MY_PAGE==='undefined'?1:MY_PAGE||1))>1){setResult([]);return}}catch(e0){}
  setPageTitle(name);
  C.saveDiag('guide.web.v25','web-first '+mode+' '+url);
  d.push({
    title:name,
    url:url,
    desc:'list&&screen-56',
    col_type:'x5_webview_single',
    extra:{
      ua:C.UA_M,
      canBack:true,
      showProgress:true,
      imgLongClick:false,
      jsLoadingInject:true,
      js:injectJs(),
      urlInterceptor:threadInterceptor(),
      blockRules:['.woff','.woff2','.ttf']
    }
  });
  setResult(d)
}
function module(){
  var m=BASE.module(),oldForum=m.forum;
  m.version='0.1.0-test.25';m.build=10125;
  m.forum=function(){if(C.pageParam('sht_auto',''))return guideWeb();return oldForum()};
  m._debug=m._debug||{};m._debug.guideWebV25=guideWeb;
  return m
}
var P={version:'0.1.0-test.25',build:10125,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
