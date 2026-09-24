/* xChina Remote Runtime 0.1.0-test.7
 * Direct one-pass transform over immutable Test4.
 * Keeps Test6 exact content/session contracts and fixes list cover binding, duplicate cards,
 * detail hierarchy, and player handoff for 0 kb/s / 00:00 failures.
 */
var XChinaTest7Builder=(function(){
  var VERSION='0.1.0-test.7', BUILD=10107;
  var REPO='huoguotiankong/asset-core-7f3';
  var PATH='apps/video/xchina/releases/0.1.0-test.4/runtime.js';
  var SEED='xc_test7_seed_test4.js';
  function s(v){return v===undefined||v===null?'':String(v);}
  function valid(z){z=s(z);return z.length>30000&&z.indexOf('XChinaRemoteRuntime')>=0&&z.indexOf("R.version='0.1.0-test.4'")>=0&&z.indexOf('R.build=10104;')>=0;}
  function seedRead(){try{var z=s(readFile(SEED));return valid(z)?z:'';}catch(e){return'';}}
  function seedWrite(z){try{if(valid(z))saveFile(SEED,z);}catch(e){}}
  function fetchSeed(){
    var urls=[
      'https://raw.githubusercontent.com/'+REPO+'/main/'+PATH,
      'https://github.com/'+REPO+'/raw/refs/heads/main/'+PATH,
      'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+PATH
    ],i,u,z='',errs=[];
    for(i=0;i<urls.length;i++){
      u=urls[i]+(urls[i].indexOf('?')>=0?'&':'?')+'xc_t7='+BUILD+'&_t='+Date.now();
      try{z=s(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}));if(valid(z)){seedWrite(z);return z;}errs.push((i+1)+':invalid len='+z.length);}catch(e){errs.push((i+1)+':'+s(e.message||e));}
    }
    throw new Error('Test7 读取冻结 Test4 Runtime 失败：'+errs.join(' | '));
  }
  function block(lines){return lines.join('\n');}
  function swap(src,start,end,repl,label){
    var a=src.indexOf(start),b=a<0?-1:src.indexOf(end,a+start.length);
    if(a<0||b<0)throw new Error('Test7 变换锚点缺失：'+label);
    return src.substring(0,a)+repl+'\n\n'+src.substring(b);
  }
  var src=seedRead()||fetchSeed();

  src=swap(src,'  function headers(ref){','  function badHtml(h){',block([
"  function cookieFor(url){",
"    var u=s(url||C.primary),c='';",
"    try{if(typeof getCookie==='function')c=s(getCookie(u)||'');}catch(e){}",
"    if(!c){try{if(typeof getCookie==='function')c=s(getCookie(origin(u)+'/')||'');}catch(e2){}}",
"    return c;",
"  }",
"  function headers(ref){",
"    var r=ref||C.primary+'/',h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':r},c=cookieFor(r);",
"    if(c)h.Cookie=c;return h;",
"  }",
"  function image(u,ref){",
"    u=abs(u,ref||C.primary);if(!u)return'';",
"    var r=ref||origin(u)+'/',h={'User-Agent':C.ua,'Referer':r},c=cookieFor(u);",
"    if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h);",
"  }"
  ]),'live Cookie / image headers');

  src=swap(src,'  function firstImg(ctx,base){','  function classText(ctx,cls){',block([
"  function firstImg(ctx,base){",
"    var x=decode(s(ctx)).replace(/\\\\\\//g,'/'),m,u='';",
"    m=x.match(/(?:data-original|data-src|data-lazy-src|data-url|data-bg|data-background|poster|src)\\s*=\\s*[\"']([^\"']+)[\"']/i);",
"    if(!m)m=x.match(/(?:background(?:-image)?\\s*:\\s*)?url\\(\\s*[\"']?([^\"'\\)]+)[\"']?\\s*\\)/i);",
"    if(!m)m=x.match(/srcset\\s*=\\s*[\"']([^\"',\\s]+)[^\"']*[\"']/i);",
"    u=m?trim(m[1]):'';if(/^data:image\\//i.test(u)||/^(?:about:blank|javascript:)/i.test(u))u='';",
"    return u?abs(u,base):'';",
"  }"
  ]),'cover parser');

  src=swap(src,'  function parseCards(html,listUrl,type){','  function detailPage(type){',block([
"  function parseCards(html,listUrl,type){",
"    var body=s(html),a=allAnchors(body,listUrl),out=[],seen={},seenSig={},i,x,u,t,from,to,ctx,img,brief,author,pat,sig;",
"    pat=type==='fiction'?/\\/fiction\\//:type==='comic'?/\\/comic\\//:type==='photo'?/\\/photo\\//:type==='amateur'?/\\/amateur\\//:type==='model'?/\\/model\\//:/\\/video\\//;",
"    for(i=0;i<a.length;i++){",
"      x=a[i];u=x.href;if(!pat.test(u)||seen[u])continue;",
"      from=Math.max(0,x.index-260);to=Math.min(body.length,x.index+s(x.raw).length+900);ctx=body.substring(from,to);",
"      t=classText(x.raw,'title')||matchAttr(x.attrs,'title')||classText(ctx,'title')||x.text;t=trim(t);",
"      if(!t||t.length<2||t.length>120)continue;",
"      img=firstImg(x.raw,listUrl)||firstImg(ctx,listUrl);",
"      if(!img&&/^(?:最新|热门|更多|全部|套图|写真|视频|小说|漫画)(?:热门|最新|推荐|分类|套图|视频)?$/i.test(t))continue;",
"      brief=classText(x.raw,'brief')||classText(ctx,'brief');",
"      author=classText(x.raw,'model-container')||classText(x.raw,'author')||classText(ctx,'model-container')||classText(ctx,'author')||'';",
"      sig=t.replace(/\\s+/g,'').toLowerCase()+'|'+img;if(seenSig[sig])continue;",
"      seen[u]=1;seenSig[sig]=1;out.push({href:u,type:type,title:t,img:image(img,listUrl),rawImg:img,brief:brief,author:author});",
"    }",
"    return out;",
"  }"
  ]),'card binding / dedupe');

  src=swap(src,'  function extractImages(html,url,type){','  function chapterLinks(html,url,type){',block([
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
"  function cleanMedia(u,url,domain){",
"    u=decode(s(u)).replace(/\\\\\\//g,'/').replace(/\\\\u002[fF]/g,'/');",
"    if(u&&!/^https?:\\/\\//i.test(u))u=(domain||origin(url)).replace(/\\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;",
"    u=abs(u,url);return /^https?:\\/\\//i.test(u)&&!/(?:doubleclick|googlesyndication|\\.js(?:$|\\?)|\\.css(?:$|\\?))/i.test(u)?u:'';",
"  }",
"  function mediaFromHtml(html,url){",
"    var x=decode(contentScope(html,'media')).replace(/\\\\\\//g,'/'),out=[],seen={},m,re,domain='',u,vs=[],i,v;",
"    m=x.match(/var\\s+domain\\s*=\\s*[\"']([^\"']+)[\"']/i);if(m)domain=m[1];",
"    var arr=x.match(/var\\s+videos\\s*=\\s*(\\[[\\s\\S]*?\\]);/i);",
"    if(arr){try{vs=JSON.parse(arr[1]);}catch(e){var mm,rx=/[\"']url[\"']\\s*:\\s*[\"']([^\"']+)[\"']/ig;while((mm=rx.exec(arr[1])))vs.push({url:mm[1]});}",
"      for(i=0;i<vs.length;i++){v=vs[i]||{};u=cleanMedia(v.url||'',url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"    }",
"    re=/[\"']([^\"']*?\\.m3u8(?:\\?[^\"']*)?)[\"']/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"    re=/(https?:\\/\\/[^\\s\"'<>]+?\\.mp4(?:\\?[^\\s\"'<>]*)?)/ig;while((m=re.exec(x))){u=cleanMedia(m[1],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}",
"    return out;",
"  }",
"  function mediaHeaders(media,pageUrl){",
"    var h={'User-Agent':C.ua,'Referer':pageUrl,'Origin':origin(pageUrl)},ck=cookieFor(media)||cookieFor(pageUrl);if(ck)h.Cookie=ck;return h;",
"  }",
"  function mediaKind(u){return /m3u8/i.test(s(u))?'HLS':/\\.mp4(?:$|[?#])/i.test(s(u))?'MP4':'媒体直链';}",
"  function playerUrl(u,pageUrl){",
"    var h=mediaHeaders(u,pageUrl),hs='Referer@'+h.Referer+'&&Origin@'+h.Origin+'&&User-Agent@'+h['User-Agent'];if(h.Cookie)hs+='&&Cookie@'+h.Cookie;",
"    return u+'#isVideo=true#;{'+hs+'}';",
"  }"
  ]),'content/media parser');

  src=src.split('[\"古典玄幻\",\"/fictions/tag-8/{page}.html\"],[\"绿帽主题\"').join('[\"古典玄幻\",\"/fictions/tag-8/{page}.html\"],[\"学生校园\",\"/fictions/tag-2/{page}.html\"],[\"绿帽主题\"');
  return {VERSION:VERSION,BUILD:BUILD,src:src,swap:swap,block:block};
})();
