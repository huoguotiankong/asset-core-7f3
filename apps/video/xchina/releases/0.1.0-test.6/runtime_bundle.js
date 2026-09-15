/* xChina Remote Runtime 0.1.0-test.6
 * Test6: single transform over immutable Test4.
 * Scope: Test5 X5/live-cookie hardening + exact hidden reader-source content contracts.
 */
(function(){
  var VERSION='0.1.0-test.6', BUILD=10106;
  var REPO='huoguotiankong/asset-core-7f3';
  var PATH='apps/video/xchina/releases/0.1.0-test.4/runtime.js';
  var SEED='xc_test6_seed_test4.js';
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
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'xc_t6='+BUILD+'&_t='+Date.now();
      try{z=s(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}));if(valid(z)){seedWrite(z);return z;}errs.push((i+1)+':invalid len='+z.length);}catch(e){errs.push((i+1)+':'+s(e.message||e));}
    }
    throw new Error('Test6 读取冻结 Test4 Runtime 失败：'+errs.join(' | '));
  }
  function need(src,from,to,label){if(src.indexOf(from)<0)throw new Error('Test6 变换锚点缺失：'+label);return src.split(from).join(to);}
  var src=seedRead()||fetchSeed();

  src=need(src,
    "  function headers(ref){return {'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':ref||C.primary+'/'};}\n  function image(u,ref){u=abs(u,ref||C.primary);return u?u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||origin(u)+'/' }):'';}",
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
      "  }",
      "  function image(u,ref){",
      "    u=abs(u,ref||C.primary);if(!u)return'';",
      "    var r=ref||origin(u)+'/',h={'User-Agent':C.ua,'Referer':r},c=cookieFor(u);",
      "    if(c)h.Cookie=c;",
      "    return u+'@headers='+JSON.stringify(h);",
      "  }"
    ].join('\n'),'X5/live Cookie');

  var oldParser=""+[
"  function extractImages(html,url,type){",
"    var x=s(html),start=0;",
"    if(type==='comic'){var i=x.indexOf('comic-img-box');if(i>=0)start=i;}",
"    else if(type==='photo'||type==='amateur'){var j=x.search(/(?:photo-image|amateur-image)/i);if(j>=0)start=j;}",
"    x=x.substring(start,Math.min(x.length,start+350000));",
"    var out=[],seen={},re=/<img\\b[^>]*>/ig,m,tag,u,ar;",
"    while((m=re.exec(x))){",
"      tag=m[0];u=matchAttr(tag,'data-original')||matchAttr(tag,'data-src')||matchAttr(tag,'src');",
"      u=abs(u,url);if(u&&!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);}",
"    }",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.(?:webp|jpe?g|png|gif)(?:\\?[^\\s\"'<>]*)?)/ig;",
"    while((m=re.exec(x))){u=decode(m[1]).replace(/\\\\\\//g,'/');if(!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);if(out.length>=220)break;}}",
"    return out;",
"  }",
"  function mediaFromHtml(html,url){",
"    var x=decode(s(html)).replace(/\\\\\\//g,'/'),out=[],seen={},m,re,domain='';",
"    m=x.match(/var\\s+domain\\s*=\\s*[\"']([^\"']+)[\"']/i);if(m)domain=m[1];",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.m3u8(?:\\?[^\\s\"'<>]*)?)/ig;",
"    while((m=re.exec(x))){if(!seen[m[1]]){seen[m[1]]=1;out.push(m[1]);}}",
"    var arr=x.match(/var\\s+videos\\s*=\\s*(\\[[\\s\\S]*?\\]);/i);",
"    if(arr){",
"      try{",
"        var vs=JSON.parse(arr[1]),i,v,u;",
"        for(i=0;i<vs.length;i++){v=vs[i]||{};u=s(v.url||'').replace(/\\\\\\//g,'/');if(u&&!/^https?:\\/\\//i.test(u))u=(domain||origin(url))+u;if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"      }catch(e){}",
"    }",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.(?:mp4|m3u8)(?:\\?[^\\s\"'<>]*)?)/ig;",
"    while((m=re.exec(x))){if(!seen[m[1]]){seen[m[1]]=1;out.push(m[1]);}}",
"    return out;",
"  }"
].join('\n');
  var newParser=""+[
"  function contentScope(html,type){",
"    var z=s(html),mark=type==='comic'?'comic-img-box':type==='amateur'?'amateur-image':type==='photo'?'photo-image':type==='fiction'?'fiction-body':'main-container',p=z.indexOf(mark);",
"    if(p<0)return z;",
"    var q=Math.max(0,p-500),x=z.substring(q,Math.min(z.length,p+380000)),cut=x.search(/<(?:footer)\\b|class=[\"'][^\"']*(?:comments?|related)[^\"']*[\"']/i);",
"    return cut>0?x.substring(0,cut):x;",
"  }",
"  function extractImages(html,url,type){",
"    var x=contentScope(html,type),out=[],seen={},re=/<img\\b[^>]*>/ig,m,tag,u;",
"    while((m=re.exec(x))){tag=m[0];u=matchAttr(tag,'data-original')||matchAttr(tag,'data-src')||matchAttr(tag,'src');u=abs(u,url);if(u&&!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);}}",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.(?:webp|jpe?g|png|gif)(?:\\?[^\\s\"'<>]*)?)/ig;",
"    while((m=re.exec(x))){u=decode(m[1]).replace(/\\\\\\//g,'/');if(!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);if(out.length>=260)break;}}",
"    return out;",
"  }",
"  function mediaFromHtml(html,url){",
"    var x=decode(contentScope(html,'media')).replace(/\\\\\\//g,'/'),out=[],seen={},m,re,domain='',u,vs=[],i,v;",
"    m=x.match(/var\\s+domain\\s*=\\s*[\"']([^\"']+)[\"']/i);if(m)domain=m[1];",
"    re=/[\"']([^\"']*?\\.m3u8(?:\\?[^\"']*)?)[\"']/ig;while((m=re.exec(x))){u=abs(m[1],url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"    var arr=x.match(/var\\s+videos\\s*=\\s*(\\[[\\s\\S]*?\\]);/i);",
"    if(arr){try{vs=JSON.parse(arr[1]);}catch(e){var mm,rx=/[\"']url[\"']\\s*:\\s*[\"']([^\"']+)[\"']/ig;while((mm=rx.exec(arr[1])))vs.push({url:mm[1]});}",
"      for(i=0;i<vs.length;i++){v=vs[i]||{};u=s(v.url||'').replace(/\\\\\\//g,'/');if(u&&!/^https?:\\/\\//i.test(u))u=(domain||origin(url)).replace(/\\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;u=abs(u,url);if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"    }",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.mp4(?:\\?[^\\s\"'<>]*)?)/ig;while((m=re.exec(x))){u=decode(m[1]);if(!seen[u]){seen[u]=1;out.push(u);}}",
"    return out;",
"  }"
].join('\n');
  src=need(src,oldParser,newParser,'隐藏正文图片/媒体契约');

  src=need(src,
    "      var body='',m=s(res.html).match(/<[^>]+class=[\"'][^\"']*fiction-body[^\"']*[\"'][^>]*>([\\s\\S]*?)<\\/(?:div|article)>/i);\n      if(m)body=m[1];if(!body){m=s(res.html).match(/<article[^>]*>([\\s\\S]*?)<\\/article>/i);body=m?m[1]:'';}",
    "      var body=contentScope(res.html,'fiction'),m;if(!body){m=s(res.html).match(/<article[^>]*>([\\s\\S]*?)<\\/article>/i);body=m?m[1]:'';}",
    'fiction-body@p');

  src=need(src,
    "    else{d.push(section('可播放线路','检测到 '+xs.length+' 条'));for(i=0;i<xs.length;i++){u=xs[i];d.push({title:'播放 '+(i+1),desc:/\\.m3u8/i.test(u)?'HLS':'MP4/直链',url:u+';{Referer@'+origin(url)+'/&&User-Agent@'+C.ua+'}#isVideo=true#',col_type:'text_1',extra:{lineVisible:false}});}}",
    "    else{d.push(section('可播放线路','检测到 '+xs.length+' 条'));for(i=0;i<xs.length;i++){u=xs[i];var ck=cookieFor(u),hs='Referer@'+origin(url)+'/&&User-Agent@'+C.ua;if(ck)hs+='&&Cookie@'+ck;d.push({title:'播放 '+(i+1),desc:/\\.m3u8/i.test(u)?'HLS':'MP4/直链',url:u+';{'+hs+'}#isVideo=true#',col_type:'text_1',extra:{lineVisible:false}});}}",
    '媒体 live Cookie');

  src=need(src,'["古典玄幻","/fictions/tag-8/{page}.html"],["绿帽主题"','["古典玄幻","/fictions/tag-8/{page}.html"],["学生校园","/fictions/tag-2/{page}.html"],["绿帽主题"','补齐小说 tag-2');
  src=need(src,"url:'web://'+b+'/'","url:'x5://'+b+'/'",'主站 X5 验证');
  src=need(src,"url:'web://'+C.comic+'/'","url:'x5://'+C.comic+'/'",'漫画 X5 验证');
  src=need(src,"d.push(section('浏览器验证','阅读源明确要求遇到 Just a moment 时先完成网页验证'));","d.push(section('X5 浏览器验证','遇到 Just a moment 时使用与 getCookie() 同会话的 X5；返回后 HTML / 图片 / 媒体请求实时读取对应域 Cookie'));",'验证说明');
  src=need(src,
    "    d.push(section('状态','Test 0.1.0-test.4 · Build 10104'));",
    "    d.push({title:'Cookie 状态',desc:(cookieFor(b)?'主站：已读取':'主站：未读取')+' · '+(cookieFor(C.comic)?'漫画：已读取':'漫画：未读取'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});\n    d.push(section('状态','Test 0.1.0-test.4 · Build 10104'));",
    'Cookie 状态');
  src=need(src,
    "d.push(section('说明','Test4 直接整合阅读源的分类、漫画、CSS封面、章节与媒体契约；保留 Test3 的私有文件缓存与限次 WebView 兜底。'));",
    "d.push(section('说明','Test6 已解开阅读源隐藏正文规则：小说 fiction-body@p、自拍 amateur-image、漫画 comic-img-box、套图 photo-image、视频 main-container；媒体直链按目标域附带 live Cookie。'));",
    '设置说明');

  src=src.split('0.1.0-test.4').join(VERSION);
  src=need(src,'R.build=10104;','R.build='+BUILD+';','Build');
  src=src.split('Build 10104').join('Build '+BUILD);
  src=src.split("cachePrefix:'xc_t4_'").join("cachePrefix:'xc_t6_'");
  src=src.split('Test4 · 阅读源协议增强').join('Test6 · 正文/图片/媒体精确契约');
  src=src.replace(/^var\s+XChinaRemoteRuntime\s*=/m,'XChinaRemoteRuntime=');
  eval(src);
  if(typeof XChinaRemoteRuntime!=='object'||String(XChinaRemoteRuntime.version||'')!==VERSION||Number(XChinaRemoteRuntime.build||0)!==BUILD)throw new Error('Test6 Runtime 导出校验失败');
})();