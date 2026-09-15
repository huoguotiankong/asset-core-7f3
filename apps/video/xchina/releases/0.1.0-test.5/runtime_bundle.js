/* xChina Remote Runtime 0.1.0-test.5
 * Test5: single transform over immutable Test4.
 * Scope: X5 shared-cookie verification + live Cookie forwarding only.
 */
(function(){
  var VERSION='0.1.0-test.5', BUILD=10105;
  var REPO='huoguotiankong/asset-core-7f3';
  var PATH='apps/video/xchina/releases/0.1.0-test.4/runtime.js';
  var SEED='xc_test5_seed_test4.js';

  function s(v){return v===undefined||v===null?'':String(v);}
  function valid(src){src=s(src);return src.length>30000&&src.indexOf('XChinaRemoteRuntime')>=0&&src.indexOf("R.version='0.1.0-test.4'")>=0&&src.indexOf('R.build=10104;')>=0;}
  function seedRead(){try{var z=s(readFile(SEED));return valid(z)?z:'';}catch(e){return'';}}
  function seedWrite(z){try{if(valid(z))saveFile(SEED,z);}catch(e){}}
  function fetchSeed(){
    var urls=[
      'https://raw.githubusercontent.com/'+REPO+'/main/'+PATH,
      'https://github.com/'+REPO+'/raw/refs/heads/main/'+PATH,
      'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+PATH
    ],i,u,z='',errs=[];
    for(i=0;i<urls.length;i++){
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'xc_t5='+BUILD+'&_t='+Date.now();
      try{
        z=s(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}));
        if(valid(z)){seedWrite(z);return z;}
        errs.push((i+1)+':invalid len='+z.length);
      }catch(e){errs.push((i+1)+':'+s(e.message||e));}
    }
    throw new Error('Test5 读取冻结 Test4 Runtime 失败：'+errs.join(' | '));
  }
  function need(src,from,to,label){
    if(src.indexOf(from)<0)throw new Error('Test5 变换锚点缺失：'+label);
    return src.split(from).join(to);
  }

  var src=seedRead()||fetchSeed();

  src=need(
    src,
    "  function headers(ref){return {'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':ref||C.primary+'/'};}",
    [
      "  function cookieFor(url){",
      "    var u=s(url||C.primary),c='';",
      "    try{if(typeof getCookie==='function')c=s(getCookie(u)||'');}catch(e){}",
      "    if(!c){try{if(typeof getCookie==='function')c=s(getCookie(origin(u)+'/')||'');}catch(e2){}}",
      "    return c;",
      "  }",
      "  function headers(ref){",
      "    var r=ref||C.primary+'/',h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':r},c=cookieFor(r);",
      "    if(c)h.Cookie=c;",
      "    return h;",
      "  }"
    ].join('\n'),
    'live Cookie 请求头'
  );

  src=need(
    src,
    "  function image(u,ref){u=abs(u,ref||C.primary);return u?u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||origin(u)+'/' }):'';}",
    [
      "  function image(u,ref){",
      "    u=abs(u,ref||C.primary);if(!u)return'';",
      "    var r=ref||origin(u)+'/',h={'User-Agent':C.ua,'Referer':r},c=cookieFor(u);",
      "    if(c)h.Cookie=c;",
      "    return u+'@headers='+JSON.stringify(h);",
      "  }"
    ].join('\n'),
    '图片 live Cookie'
  );

  src=need(src,"url:'web://'+b+'/'","url:'x5://'+b+'/'",'主站 X5 验证');
  src=need(src,"url:'web://'+C.comic+'/'","url:'x5://'+C.comic+'/'",'漫画 X5 验证');

  src=need(
    src,
    "    d.push(section('状态','Test 0.1.0-test.4 · Build 10104'));",
    [
      "    d.push({title:'Cookie 状态',desc:(cookieFor(b)?'主站：已读取':'主站：未读取')+' · '+(cookieFor(C.comic)?'漫画：已读取':'漫画：未读取'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});",
      "    d.push(section('状态','Test 0.1.0-test.4 · Build 10104'));"
    ].join('\n'),
    'Cookie 状态'
  );

  src=need(
    src,
    "d.push(section('浏览器验证','阅读源明确要求遇到 Just a moment 时先完成网页验证'));",
    "d.push(section('X5 浏览器验证','遇到 Just a moment 时用与 getCookie() 同会话的 X5 完成验证；返回后原生请求实时读取 Cookie'));",
    '验证说明'
  );

  src=need(
    src,
    "d.push(section('说明','Test4 直接整合阅读源的分类、漫画、CSS封面、章节与媒体契约；保留 Test3 的私有文件缓存与限次 WebView 兜底。'));",
    "d.push(section('说明','Test5 保留 Test4 全部业务 Parser，只加固 X5 验证与 live Cookie 转发；不保存账号密码、不持久化 Cookie 明文。'));",
    '设置说明'
  );

  src=src.split('0.1.0-test.4').join(VERSION);
  src=need(src,'R.build=10104;','R.build='+BUILD+';','Build');
  src=src.split('Build 10104').join('Build '+BUILD);
  src=src.split("cachePrefix:'xc_t4_'").join("cachePrefix:'xc_t5_'");
  src=src.replace(/^var\s+XChinaRemoteRuntime\s*=/m,'XChinaRemoteRuntime=');

  eval(src);
  if(typeof XChinaRemoteRuntime!=='object'||String(XChinaRemoteRuntime.version||'')!==VERSION||Number(XChinaRemoteRuntime.build||0)!==BUILD){
    throw new Error('Test5 Runtime 导出校验失败');
  }
})();