/* xChina Remote Test2 hotfix: fix Hiker internal-route contracts without mutating Test1 */
(function(){
  var VERSION='0.1.0-test.2', BUILD=10102;
  var PATH='apps/video/xchina/releases/0.1.0-test.1/runtime.js';
  var REPO='huoguotiankong/asset-core-7f3';
  function fetchAny(path,mark){
    var urls=[
      'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+path,
      'https://github.com/'+REPO+'/raw/refs/heads/main/'+path,
      'https://raw.githubusercontent.com/'+REPO+'/main/'+path
    ],errs=[],i,u,t;
    for(i=0;i<urls.length;i++){
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'xc_hotfix='+BUILD+'&_t='+Date.now();
      try{
        t=String(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}})||'');
        if(t.length<10000||t.indexOf(mark)<0)throw new Error('响应无效 len='+t.length);
        return t;
      }catch(e){errs.push((i+1)+':'+String(e.message||e));}
    }
    throw new Error('Test1 Runtime读取失败：'+errs.join(' | '));
  }
  function need(src,from,to,label){
    if(src.indexOf(from)<0)throw new Error('Test2 hotfix锚点缺失：'+label);
    return src.split(from).join(to);
  }
  var src=fetchAny(PATH,'XChinaRemoteRuntime');
  src=need(src,"var a=['rule='+encodeURIComponent(ruleTitle()),'simple=true'];","var a=['rule=','simple=true'];",'中文rule继承');
  src=need(src,"param('url','')","param('xc_url','')",'业务URL读取命名空间');
  var routes=['xchinaPhoto','xchinaFiction','xchinaModel','xchinaVideo'];
  for(var i=0;i<routes.length;i++){
    var a="page('"+routes[i]+"',{url:",b="page('"+routes[i]+"',{xc_url:";
    if(src.indexOf(a)>=0)src=src.split(a).join(b);
  }
  src=need(src,"page('xchinaCatalog',{kind:kind,url:next})","page('xchinaCatalog',{kind:kind,xc_url:next})",'列表下一页URL');
  src=need(src,"page('xchinaCatalog',{kind:kind,url:out[i].url})","page('xchinaCatalog',{kind:kind,xc_url:out[i].url})",'分类URL');
  src=src.split('0.1.0-test.1').join(VERSION);
  src=need(src,'X.build=10101;','X.build='+BUILD+';','Build');
  src=src.split('Build 10101').join('Build '+BUILD);
  src=src.replace(/^var\s+XChinaRemoteRuntime\s*=/m,'XChinaRemoteRuntime=');
  eval(src);
  if(typeof XChinaRemoteRuntime!=='object'||String(XChinaRemoteRuntime.version||'')!==VERSION||Number(XChinaRemoteRuntime.build||0)!==BUILD)throw new Error('Test2 Runtime校验失败');
})();
