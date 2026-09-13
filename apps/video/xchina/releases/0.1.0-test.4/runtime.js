/* xChina Remote Runtime 0.1.0-test.4
 * Source contracts recovered from uploaded reader source (2025-11-13) and current publishing page.
 * Test-first: HTML parser + native Hiker UI + browser/WebView verification fallback.
 */
var XChinaRemoteRuntime=(function(){
  var R={};
  R.version='0.1.0-test.4';
  R.build=10104;

  var C={
    primary:'https://xchina.co',
    fallback:'https://xchina001.ink',
    comic:'https://litu100.xyz',
    publish:'https://xiaohuangshu.me',
    ua:'Mozilla/5.0 (Linux; U; Android 13; zh-Hans-CN; PFJM10 Build/TP1A.220905.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/135.0.4896.58 Quark/6.13.6.581 Mobile Safari/537.36',
    baseKey:'xc_base_v1',
    lastBaseKey:'xc_last_good_base_v1',
    cachePrefix:'xc_t4_'
  };

  function s(v){return v===undefined||v===null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function decode(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(parseInt(n,10));}catch(e){return _;}});}
  function strip(v){return trim(decode(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n'));}
  function safeDecode(v){try{return decodeURIComponent(s(v));}catch(e){return s(v);}}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return h;}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.primary;}
  function abs(u,base){u=decode(trim(u));base=base||C.primary;if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(/^javascript:/i.test(u)||u==='#')return'';var o=origin(base);if(u.charAt(0)==='/')return o+u;return s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;}
  function headers(ref){return {'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':ref||C.primary+'/'};}
  function image(u,ref){u=abs(u,ref||C.primary);return u?u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||origin(u)+'/' }):'';}
  function badHtml(h){var x=s(h),l=x.toLowerCase();return x.length<160||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('cloudflare ray id')>=0;}
  function getFixedBase(){var b='';try{b=getItem(C.baseKey,'');}catch(e){}return /^https?:\/\//i.test(b)?b.replace(/\/$/,''):'';}
  function getLastBase(){var b='';try{b=getItem(C.lastBaseKey,'');}catch(e){}return /^https?:\/\//i.test(b)?b.replace(/\/$/,''):'';}
  function setLastBase(b){try{setItem(C.lastBaseKey,s(b).replace(/\/$/,''));}catch(e){}}
  function cacheFile(key){return C.cachePrefix+key+'.html';}
  function readHtmlCache(key){try{return s(readFile(cacheFile(key))||'');}catch(e){return'';}}
  function writeHtmlCache(key,body,now){try{if(body&&body.length<900000){saveFile(cacheFile(key),body);setItem(C.cachePrefix+key+'_t',String(now));}}catch(e){}}
  function webFetch(url,timeout){
    try{
      if(typeof fetchCodeByWebView==='function')return s(fetchCodeByWebView(url,{timeout:timeout||18000,headers:headers(origin(url)+'/'),blockRules:['.woff','.woff2','.ttf','.ico']})||'');
    }catch(e){}
    return'';
  }
  function baseCandidates(){
    var a=[],seen={},xs=[getFixedBase(),getLastBase(),C.primary,C.fallback],i,x;
    for(i=0;i<xs.length;i++){x=s(xs[i]).replace(/\/$/,'');if(x&&!seen[x]){seen[x]=1;a.push(x);}}
    return a;
  }
  function pathOnly(url){
    var m=s(url).match(/^https?:\/\/[^\/]+(\/[^#]*)?/i);
    return m?(m[1]||'/'):s(url);
  }
  function isComicUrl(url){return /^https?:\/\/(?:[^\/]+\.)?litu100\.xyz(?:\/|$)/i.test(s(url));}
  function fetchPage(input,kind,opt){
    opt=opt||{};
    var raw=s(input||'/'),isComic=kind==='comic'||isComicUrl(raw),bases=isComic?[C.comic]:baseCandidates(),path=/^https?:\/\//i.test(raw)?pathOnly(raw):raw;
    if(path.charAt(0)!=='/')path='/'+path;
    var candidates=[],i,url,h='',best='',bestUrl='',stale='',staleUrl='',key,old,ts,now=Date.now(),ttl=opt.ttl===undefined?180000:opt.ttl;
    for(i=0;i<bases.length;i++)candidates.push(bases[i].replace(/\/$/,'')+path);
    for(i=0;i<candidates.length;i++){
      url=candidates[i];key=String(Math.abs(hash(url)));old=readHtmlCache(key);ts=parseInt(getItem(C.cachePrefix+key+'_t','0'),10)||0;
      if(!opt.force&&old&&now-ts<ttl)return{html:old,url:url,base:origin(url),ok:true,cache:true,via:'cache'};
      try{h=s(fetch(url,{timeout:opt.timeout||11000,headers:headers(origin(url)+'/')}));}catch(e1){h='';}
      if(h.length>best.length){best=h;bestUrl=url;}
      if(!badHtml(h)){if(!isComic)setLastBase(origin(url));writeHtmlCache(key,h,now);return{html:h,url:url,base:origin(url),ok:true,via:'fetch'};}
      if(old&&!stale){stale=old;staleUrl=url;}
    }
    if(!opt.noWebView){
      var max=isComic?1:Math.min(2,candidates.length);
      for(i=0;i<max;i++){
        url=candidates[i];h=webFetch(url,opt.webTimeout||18000);
        if(h.length>best.length){best=h;bestUrl=url;}
        if(!badHtml(h)){key=String(Math.abs(hash(url)));if(!isComic)setLastBase(origin(url));writeHtmlCache(key,h,now);return{html:h,url:url,base:origin(url),ok:true,via:'webview'};}
      }
    }
    if(stale)return{html:stale,url:staleUrl,base:origin(staleUrl),ok:true,cache:true,stale:true,via:'stale'};
    return{html:best,url:bestUrl||candidates[0],base:origin(bestUrl||candidates[0]),ok:false,blocked:true,via:'blocked'};
  }
  function fetchPath(path,kind,opt){return fetchPage(path,kind,opt||{});}
  function fetchUrl(url,opt){
    var kind=isComicUrl(url)?'comic':'main';
    return fetchPage(url,kind,opt||{});
  }
  function param(name,def){var v='';try{v=getParam(name,'');}catch(e){}return v?v:(def||'');}
  function currentPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function page(path,params){
    var title='小黄书';try{if(MY_RULE&&MY_RULE.title)title=MY_RULE.title;}catch(e){}
    var a=['rule=','simple=true'],k;params=params||{};
    for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(s(params[k])));
    return'hiker://page/'+path+'?'+a.join('&');
  }
  function section(title,desc){return{title:'▌ '+title,desc:desc||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(title,desc){return{title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function textButton(title,url){return{title:title,url:url,col_type:'text_4',extra:{lineVisible:false}};}
  function active(t,on){return on?'● '+t:t;}
  function refreshType(key,val){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,val);}
  function matchAttr(tag,name){var m=s(tag).match(new RegExp(name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'));return m?decode(m[1]):'';}
  function firstImg(ctx,base){
    var x=s(ctx),m=x.match(/(?:style\s*=\s*["'][^"']*url\(['"]?([^'"\)]+)|(?:data-original|data-src|src)\s*=\s*["']([^"']+))/i);
    return m?abs(m[1]||m[2],base):'';
  }
  function classText(ctx,cls){
    var re=new RegExp('<[^>]+class=["\\\'][^"\\\']*\\b'+cls.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\b[^"\\\']*["\\\'][^>]*>([\\s\\S]*?)<\\/[^>]+>','i'),m=s(ctx).match(re);
    return m?strip(m[1]):'';
  }
  function titleFromHtml(html){
    var m=s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i),t=m?strip(m[1]):'';
    return t.replace(/\s*[-_|]\s*小黄书.*$/i,'');
  }
  function typeFromUrl(u){
    u=s(u);
    if(/\/fiction\//.test(u))return'fiction';
    if(/\/comic\//.test(u))return'comic';
    if(/\/photo\//.test(u))return'photo';
    if(/\/amateur\//.test(u))return'amateur';
    if(/\/model\//.test(u))return'model';
    if(/\/video\//.test(u))return'video';
    return'';
  }
  function pluralType(type){return type==='fiction'?'fictions':type==='comic'?'comics':type==='photo'?'photos':type==='amateur'?'amateurs':type==='model'?'models':'videos';}
  function typeName(type){return type==='fiction'?'小说':type==='comic'?'漫画':type==='photo'?'套图':type==='amateur'?'自拍':type==='model'?'模特':'视频';}

  function allAnchors(html,base){
    var out=[],re=/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,href,text;
    while((m=re.exec(s(html)))){
      href=abs(m[2],base);text=strip(m[4]);
      if(href)out.push({href:href,text:text,raw:m[0],index:m.index,attrs:m[1]+' '+m[3]});
    }
    return out;
  }
  function parseCards(html,listUrl,type){
    var a=allAnchors(html,listUrl),out=[],seen={},i,x,u,t,from,to,ctx,img,brief,author,pat;
    pat=type==='fiction'?/\/fiction\//:type==='comic'?/\/comic\//:type==='photo'?/\/photo\//:type==='amateur'?/\/amateur\//:type==='model'?/\/model\//:/\/video\//;
    for(i=0;i<a.length;i++){
      x=a[i];u=x.href;if(!pat.test(u)||seen[u])continue;
      from=Math.max(0,x.index-1000);to=Math.min(s(html).length,x.index+2600);ctx=s(html).substring(from,to);
      t=classText(ctx,'title')||x.text||matchAttr(x.attrs,'title');
      if(!t||t.length<2)continue;
      img=firstImg(ctx,listUrl);brief=classText(ctx,'brief');
      author=classText(ctx,'model-container')||classText(ctx,'author')||'';
      seen[u]=1;out.push({href:u,type:type,title:t,img:image(img,listUrl),rawImg:img,brief:brief,author:author});
    }
    return out;
  }
  function detailPage(type){return type==='video'?'xchinaVideo':(type==='photo'||type==='amateur')?'xchinaPhoto':type==='fiction'?'xchinaFiction':type==='comic'?'xchinaComic':type==='model'?'xchinaModel':'xchinaVideo';}
  function card(x){
    var ds=[];if(x.author)ds.push(x.author);if(x.brief)ds.push(x.brief);
    return{title:x.title||typeName(x.type),desc:ds.join(' · '),img:x.img||'',pic_url:x.img||'',url:page(detailPage(x.type),{xc_url:x.href,t:x.type}),col_type:x.type==='fiction'?'text_2':'movie_3',extra:{lineVisible:false,pageTitle:x.title||typeName(x.type)}};
  }
  function listPath(type,p){
    p=parseInt(p,10)||1;
    if(type==='comic')return'/comics/'+p+'.html';
    if(type==='fiction'||type==='amateur')return'/'+pluralType(type)+'/'+p+'.html';
    if(type==='model')return p===1?'/models.html':'/models/'+p+'.html';
    return p===1?'/'+pluralType(type)+'.html':'/'+pluralType(type)+'/'+p+'.html';
  }
  function searchPath(type,kw,p){
    p=parseInt(p,10)||1;kw=encodeURIComponent(s(kw).trim());
    if(type==='comic')return'/comics/kk-'+kw+'/'+p+'.html';
    return'/'+pluralType(type)+'/keyword-'+kw+'/'+p+'.html';
  }
  function listResult(type,path){
    var r=fetchPath(path,type==='comic'?'comic':'main');
    return{r:r,items:parseCards(r.html,r.url,type)};
  }

  var categoryGroups={"fiction":[{"name":"小说分类","items":[["全部","/fictions/{page}.html"],["人妻女友","/fictions/tag-1/{page}.html"],["编辑推荐","/fictions/tag-101/{page}.html"],["长篇连载","/fictions/tag-102/{page}.html"],["都市生活","/fictions/tag-4/{page}.html"],["家庭乱伦","/fictions/tag-9/{page}.html"],["多人群交","/fictions/tag-10/{page}.html"],["强暴性虐","/fictions/tag-13/{page}.html"],["古典玄幻","/fictions/tag-8/{page}.html"],["绿帽主题","/fictions/tag-16/{page}.html"],["公司职场","/fictions/tag-11/{page}.html"],["经验故事","/fictions/tag-7/{page}.html"],["露出暴露","/fictions/tag-12/{page}.html"],["有声小说","/fictions/tag-999/{page}.html"],["西方主题","/fictions/tag-14/{page}.html"],["动漫游戏","/fictions/tag-5/{page}.html"],["伴侣交换","/fictions/tag-3/{page}.html"],["同性主题","/fictions/tag-15/{page}.html"],["名人明星","/fictions/tag-6/{page}.html"],["经典回忆","/fictions/tag-103/{page}.html"],["耽美小说","/fictions/tag-99/{page}.html"]]}],"comic":[{"name":"漫画分类","items":[["全部","/comics/{page}.html"],["连载中","/comics/kk-1/{page}.html"],["已完结","/comics/kk-2/{page}.html"],["单行本","/comics/kk-3/{page}.html"],["韩国","/comics/kk-韩国/{page}.html"],["日本","/comics/kk-日本/{page}.html"],["中国","/comics/kk-中国/{page}.html"]]}],"photo":[{"name":"专辑","items":[["秀人网特色主题","/photos/album-1/{page}.html"],["大尺主题","/photos/album-2/{page}.html"],["性爱主题","/photos/album-3/{page}.html"],["露出主题","/photos/album-4/{page}.html"],["Cosplay主题","/photos/album-5/{page}.html"],["道具主题","/photos/album-6/{page}.html"],["捆绑主题","/photos/album-7/{page}.html"],["白虎主题","/photos/album-8/{page}.html"],["女同主题","/photos/album-9/{page}.html"],["有原图","/photos/album-10/{page}.html"],["有视频","/photos/album-11/{page}.html"],["业余自拍","/photos/album-12/{page}.html"]]},{"name":"中国工作室","items":[["PANS","/photos/series-6310ce9b90056/{page}.html"],["黄甫","/photos/series-665f8bafab4bc/{page}.html"],["行色","/photos/series-64f44d99ce673/{page}.html"],["其他中国工作室","/photos/series-665f7d787d681/{page}.html"],["风吟鸟唱","/photos/series-6666a7ac3ba9c/{page}.html"],["相约中国","/photos/series-5f1dcdeaee582/{page}.html"],["希威社","/photos/series-665f8595408fa/{page}.html"],["丽图100","/photos/series-5f1d784995865/{page}.html"],["潘多拉","/photos/series-5f23c44cd66bd/{page}.html"],["轰趴猫","/photos/series-5f1ae6caae922/{page}.html"],["A4U","/photos/series-5f60b98248a81/{page}.html"],["深夜企划","/photos/series-638e5a60b1770/{page}.html"],["蜜丝","/photos/series-5f2089564c6c2/{page}.html"],["北京天使","/photos/series-622c7f95220a4/{page}.html"],["推女郎","/photos/series-5f14a5eb5b0d7/{page}.html"],["头条女神","/photos/series-5f14806585bef/{page}.html"],["爱丝","/photos/series-5f15f389e993e/{page}.html"],["无忌影社","/photos/series-619a92aa1fa7a/{page}.html"],["果团网","/photos/series-5f1817b42772b/{page}.html"],["尤美","/photos/series-61b997728043b/{page}.html"],["爱尤物","/photos/series-5f148046cb2c7/{page}.html"],["ISS系列","/photos/series-646c69b675f3d/{page}.html"],["U238","/photos/series-67028a27d02a6/{page}.html"],["妖精社","/photos/series-5f4b5f4eb8b71/{page}.html"],["DDY","/photos/series-5f15f727df393/{page}.html"],["蜜柚摄影","/photos/series-676c3e9b90749/{page}.html"],["东莞V女郎","/photos/series-5f22ea422221c/{page}.html"],["SK丝库","/photos/series-5f382ba894af4/{page}.html"]]},{"name":"各国其他套图","items":[["国模套图","/photos/series-64be21c972ca4/{page}.html"],["韩模套图","/photos/series-64be22b4a0fa0/{page}.html"],["日模套图","/photos/series-64be2283bf3af/{page}.html"],["书籍扫描","/photos/series-6860e3d718c78/{page}.html"],["台模套图","/photos/series-64be21ef4cc51/{page}.html"],["港模套图","/photos/series-64be224b662c0/{page}.html"],["其他地区套图","/photos/series-64be239ce73d4/{page}.html"]]},{"name":"秀人网旗下","items":[["全部秀人旗下","/photos/series-6660093348354/{page}.html"],["私购流出","/photos/series-66600a3a227ee/{page}.html"],["秀人网","/photos/series-5f1476781eab4/{page}.html"],["语画界","/photos/series-601ef80997845/{page}.html"],["星颜社","/photos/series-6141c88882a36/{page}.html"],["爱蜜社","/photos/series-5f71afc92d8ab/{page}.html"],["尤蜜荟","/photos/series-5f184ff551888/{page}.html"],["花漾","/photos/series-5fc4ce40386af/{page}.html"],["模范学院","/photos/series-5f181625966a6/{page}.html"],["美媛馆","/photos/series-5f1495dbda4de/{page}.html"],["蜜桃社","/photos/series-5f1dd5a7ebe9a/{page}.html"],["尤物馆","/photos/series-60673bec9dd11/{page}.html"],["FEILIN嗲囡囡","/photos/series-5f14a3105d3e8/{page}.html"],["影私荟","/photos/series-63d435352808c/{page}.html"],["瑞丝馆","/photos/series-61263de287e2f/{page}.html"]]},{"name":"韩国工作室","items":[["ArtGravia","/photos/series-60a4a953ca563/{page}.html"],["Makemodel","/photos/series-665f81885f103/{page}.html"],["Pure Media","/photos/series-6224e755e21f4/{page}.html"],["Loozy","/photos/series-62888afad416b/{page}.html"],["Espacia Korea","/photos/series-665a2385a2367/{page}.html"]]},{"name":"日本工作室","items":[["KUNI Scan","/photos/series-66f9665804471/{page}.html"],["FRIDAY","/photos/series-66659e2d94489/{page}.html"],["周刊ポストデジタル","/photos/series-66e68b9c96ab0/{page}.html"],["Escape","/photos/series-66603af933ec9/{page}.html"],["Prestige","/photos/series-670791f5f2f0f/{page}.html"],["Super Pose Book","/photos/series-62a0a15911f16/{page}.html"],["Graphis","/photos/series-6450b47c9db0b/{page}.html"],["X-City","/photos/series-66fb8cca706ae/{page}.html"],["Urabon","/photos/series-6692ea004cc75/{page}.html"],["アサ芸SEXY","/photos/series-670d7142b3d88/{page}.html"],["FLASHデジタル","/photos/series-672a2029d6a32/{page}.html"]]},{"name":"台湾工作室","items":[["JVID","/photos/series-637b2029d2347/{page}.html"],["Fantasy Factory","/photos/series-5f889afb37619/{page}.html"],["ED Mosaic","/photos/series-68610041d0aa8/{page}.html"],["TPimage","/photos/series-5f7a0a80d3d66/{page}.html"]]},{"name":"其他套图","items":[["街拍","/photos/series-6836cd1a2d51d/{page}.html"],["AI图区","/photos/series-6443d480eb757/{page}.html"]]},{"name":"业余自拍","items":[["全部自拍","/amateurs/{page}.html","amateur"]]}],"video":[{"name":"中文AV","items":[["麻豆传媒","/videos/series-5f904550b8fcc/{page}.html"],["独立创作者","/videos/series-61bf6e439fed6/{page}.html"],["蜜桃传媒","/videos/series-5fe8403919165/{page}.html"],["糖心Vlog","/videos/series-61014080dbfde/{page}.html"],["星空传媒","/videos/series-6054e93356ded/{page}.html"],["天美传媒","/videos/series-60153c49058ce/{page}.html"],["果冻传媒","/videos/series-5fe840718d665/{page}.html"],["精东影业","/videos/series-60126bcfb97fa/{page}.html"],["香蕉视频","/videos/series-65e5f74e4605c/{page}.html"],["爱豆传媒","/videos/series-63d134c7a0a15/{page}.html"],["杏吧原版","/videos/series-6072997559b46/{page}.html"],["IBiZa Media","/videos/series-64e9cce89da21/{page}.html"],["性视界","/videos/series-63490362dac45/{page}.html"],["大象传媒","/videos/series-65bcaa9688514/{page}.html"],["扣扣传媒","/videos/series-6230974ada989/{page}.html"],["ED Mosaic","/videos/series-63732f5c3d36b/{page}.html"],["SA国际传媒","/videos/series-633ef3ef07d33/{page}.html"],["其他中文AV","/videos/series-63986aec205d8/{page}.html"],["抖阴","/videos/series-6248705dab604/{page}.html"],["葫芦影业","/videos/series-6193d27975579/{page}.html"],["乌托邦","/videos/series-637750ae0ee71/{page}.html"],["爱神传媒","/videos/series-6405b6842705b/{page}.html"],["乐播传媒","/videos/series-60589daa8ff97/{page}.html"],["91茄子","/videos/series-639c8d983b7d5/{page}.html"],["草莓视频","/videos/series-671ddc0b358ca/{page}.html"],["YOYO","/videos/series-64eda52c1c3fb/{page}.html"],["51吃瓜","/videos/series-671dd88d06dd3/{page}.html"],["哔哩传媒","/videos/series-64458e7da05e6/{page}.html"],["映秀传媒","/videos/series-6560dc053c99f/{page}.html"],["西瓜影视","/videos/series-648e1071386ef/{page}.html"],["思春社","/videos/series-64be8551bd0f1/{page}.html"]]},{"name":"日本AV","items":[["有码AV","/videos/series-6395aba3deb74/{page}.html"],["无码AV","/videos/series-6395ab7fee104/{page}.html"],["解说AV","/videos/series-6608638e5fcf7/{page}.html"]]},{"name":"业余拍摄","items":[["探花现场","/videos/series-63965bf7b7f51/{page}.html"],["主播现场","/videos/series-63965bd5335fc/{page}.html"]]},{"name":"情色电影","items":[["华语电影","/videos/series-6396492fdb1a0/{page}.html"],["日韩电影","/videos/series-6396494584b57/{page}.html"],["欧美电影","/videos/series-63964959ddb1b/{page}.html"]]},{"name":"其他影片","items":[["其他亚洲影片","/videos/series-63963ea949a82/{page}.html"],["门事件","/videos/series-63963de3f2a0f/{page}.html"],["其他欧美影片","/videos/series-6396404e6bdb5/{page}.html"],["无关色情","/videos/series-66643478ceedd/{page}.html"]]}]};

  function renderTypeTabs(d,key,current){
    var xs=[['小说','fiction'],['套图','photo'],['漫画','comic'],['视频','video']],i;
    for(i=0;i<xs.length;i++)d.push({title:active(xs[i][0],current===xs[i][1]),url:refreshType(key,xs[i][1]),col_type:'scroll_button',extra:{lineVisible:false}});
  }
  function renderCards(d,items){var i;for(i=0;i<items.length;i++)d.push(card(items[i]));}

  R.home=function(){
    var d=[],p=currentPage(),type=getMyVar('xc_home_type','photo'),res=listResult(type,listPath(type,p));
    if(p===1){
      d.push({title:'小黄书',desc:'小说 · 套图 · 漫画 · 视频 · 模特',img:C.publish+'/favicon.ico',pic_url:C.publish+'/favicon.ico',url:'web://'+C.publish,col_type:'avatar',extra:{lineVisible:false}});
      renderTypeTabs(d,'xc_home_type',type);
      d.push(textButton('搜索',page('xchinaSearch',{})));
      d.push(textButton('分类',page('xchinaCategories',{t:type})));
      d.push(textButton('验证网站',page('xchinaSettings',{})));
      d.push(textButton('发布页','web://'+C.publish));
      d.push(textButton('模特',page('xchinaCatalog',{t:'model',name:'模特'})));
      d.push(section(typeName(type)+'最新','Test4 · 阅读源协议增强'));
    }
    if(!res.items.length)d.push(empty('没有解析到内容',(res.r.ok?'页面已取得，但卡片规则可能变化':'站点验证/网络未通过')+'\n'+res.r.url));
    else renderCards(d,res.items);
    setResult(d);
  };

  R.list=function(){
    var d=[],p=currentPage(),type=param('t','photo'),name=safeDecode(param('name',typeName(type))),tpl=safeDecode(param('xc_path','')),path=tpl||listPath(type,p);
    if(path.indexOf('{page}')>=0)path=path.replace('{page}',String(p));
    var res=listResult(type,path);
    if(p===1){setPageTitle(name);d.push(section(name,typeName(type)+' · 原站分页'));}
    if(!res.items.length)d.push(empty('当前列表为空或解析失败',res.r.url));else renderCards(d,res.items);
    setResult(d);
  };

  R.categories=function(){
    var d=[],type=getMyVar('xc_category_type',param('t','photo')),groups=categoryGroups[type]||[],i,j,g,x,itemType;setPageTitle(typeName(type)+'分类');
    renderTypeTabs(d,'xc_category_type',type);
    if(type==='model'){
      var rr=fetchPath('/models.html','main',{ttl:600000}),aa=allAnchors(rr.html,rr.url),seen={},n,count=0;
      d.push(section('模特分类','读取当前站点真实分类'));
      for(i=0;i<aa.length;i++){x=aa[i];if(!/\/models\/type-[^\/?#]+/i.test(x.href)||seen[x.href])continue;n=trim(x.text);if(!n||n.length>40)continue;seen[x.href]=1;count++;d.push({title:n,url:page('xchinaCatalog',{t:'model',name:n,xc_path:x.href}),col_type:'flex_button',extra:{lineVisible:false}});}
      if(count===0)d.push(empty('暂未识别到模特分类','仍可从首页“模特”进入全部列表'));
      setResult(d);return;
    }
    if(!groups.length){d.push(empty('暂无分类',''));setResult(d);return;}
    for(i=0;i<groups.length;i++){
      g=groups[i];d.push(section(g.name,''));
      for(j=0;j<g.items.length;j++){
        x=g.items[j];itemType=x[2]||type;
        d.push({title:x[0],url:page('xchinaCatalog',{t:itemType,name:x[0],xc_path:x[1]}),col_type:'flex_button',extra:{lineVisible:false}});
      }
    }
    setResult(d);
  };

  R.search=function(){
    var d=[],p=currentPage(),type=getMyVar('xc_search_type','photo'),kw=getMyVar('xc_search_kw','');
    try{if(MY_KEYWORD)kw=s(MY_KEYWORD);}catch(e){}
    kw=trim(kw);
    if(p===1){
      setPageTitle('搜索');
      renderTypeTabs(d,'xc_search_type',type);
      d.push({title:kw||'输入关键词',desc:'小说 / 套图 / 漫画 / 视频分别调用原站搜索',url:"(function(){var q=String(input||'').trim();putMyVar('xc_search_kw',q);refreshPage(false);return 'hiker://empty';})()",col_type:'input',extra:{defaultValue:kw,hint:'输入关键词',lineVisible:false}});
      if(kw)d.push(section(typeName(type)+'搜索结果',kw));
    }
    if(!kw){d.push(empty('请输入关键词','上方可切换搜索类型'));setResult(d);return;}
    var res=listResult(type,searchPath(type,kw,p));if(!res.items.length)d.push(empty('没有搜索到内容',res.r.url));else renderCards(d,res.items);setResult(d);
  };

  function extractOg(html,name){
    var re=new RegExp('<meta[^>]+(?:property|name)=["\\\']'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'),m=s(html).match(re);
    if(!m){re=new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\']','i');m=s(html).match(re);}
    return m?decode(m[1]):'';
  }
  function detailInfo(html,url,type){
    var title=classText(html,'title')||classText(html,'text')||extractOg(html,'og:title')||titleFromHtml(html),cover=extractOg(html,'og:image')||firstImg(html,url),intro='';
    if(type==='fiction')intro=classText(html,'fiction-overview-brief');
    else if(type==='comic')intro=classText(html,'comic-info');
    else if(type==='video')intro=classText(html,'video-detail');
    else intro=classText(html,'photo-detail');
    return{title:title||typeName(type),cover:cover,img:image(cover,url),intro:intro};
  }
  function extractImages(html,url,type){
    var x=s(html),start=0;
    if(type==='comic'){var i=x.indexOf('comic-img-box');if(i>=0)start=i;}
    else if(type==='photo'||type==='amateur'){var j=x.search(/(?:photo-image|amateur-image)/i);if(j>=0)start=j;}
    x=x.substring(start,Math.min(x.length,start+350000));
    var out=[],seen={},re=/<img\b[^>]*>/ig,m,tag,u,ar;
    while((m=re.exec(x))){
      tag=m[0];u=matchAttr(tag,'data-original')||matchAttr(tag,'data-src')||matchAttr(tag,'src');
      u=abs(u,url);if(u&&!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);}
    }
    re=/(https?:\/\/[^\s"'<>]+?\.(?:webp|jpe?g|png|gif)(?:\?[^\s"'<>]*)?)/ig;
    while((m=re.exec(x))){u=decode(m[1]).replace(/\\\//g,'/');if(!seen[u]&&!/(logo|favicon|avatar|loading|blank|icon)/i.test(u)){seen[u]=1;out.push(u);if(out.length>=220)break;}}
    return out;
  }
  function mediaFromHtml(html,url){
    var x=decode(s(html)).replace(/\\\//g,'/'),out=[],seen={},m,re,domain='';
    m=x.match(/var\s+domain\s*=\s*["']([^"']+)["']/i);if(m)domain=m[1];
    re=/(https?:\/\/[^\s"'<>]+?\.m3u8(?:\?[^\s"'<>]*)?)/ig;
    while((m=re.exec(x))){if(!seen[m[1]]){seen[m[1]]=1;out.push(m[1]);}}
    var arr=x.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);
    if(arr){
      try{
        var vs=JSON.parse(arr[1]),i,v,u;
        for(i=0;i<vs.length;i++){v=vs[i]||{};u=s(v.url||'').replace(/\\\//g,'/');if(u&&!/^https?:\/\//i.test(u))u=(domain||origin(url))+u;if(u&&!seen[u]){seen[u]=1;out.push(u);}}
      }catch(e){}
    }
    re=/(https?:\/\/[^\s"'<>]+?\.(?:mp4|m3u8)(?:\?[^\s"'<>]*)?)/ig;
    while((m=re.exec(x))){if(!seen[m[1]]){seen[m[1]]=1;out.push(m[1]);}}
    return out;
  }
  function chapterLinks(html,url,type){
    var z=s(html),pos=type==='comic'?z.search(/class=["'][^"']*\bchapters\b[^"']*["']/i):z.search(/class=["'][^"']*\bchapter-container\b[^"']*["']/i),scope=z;
    if(pos>=0)scope=z.substring(Math.max(0,pos-500),Math.min(z.length,pos+90000));
    var a=allAnchors(scope,url),out=[],seen={},i,x,pat=type==='comic'?/\/comic\//:/\/fiction\//;
    for(i=0;i<a.length;i++){x=a[i];if(!pat.test(x.href)||x.href===url||seen[x.href]||!x.text)continue;if(x.text.length>120)continue;seen[x.href]=1;out.push({name:x.text,href:x.href});}
    return out;
  }
  function pagerMax(html){
    var x=s(html),nums=[],re=/<[^>]+class=["'][^"']*pager-num[^"']*["'][^>]*>(\d+)<\/[^>]+>/ig,m;
    while((m=re.exec(x)))nums.push(parseInt(m[1],10)||1);
    if(!nums.length){re=/<a[^>]+href=["'][^"']+\/(\d+)\.html["'][^>]*>\s*\d+\s*<\/a>/ig;while((m=re.exec(x)))nums.push(parseInt(m[1],10)||1);}
    return nums.length?Math.max.apply(Math,nums):1;
  }

  R.detail=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','')||typeFromUrl(url);if(!url){d.push(empty('缺少详情地址',''));setResult(d);return;}
    var res=fetchUrl(url),info=detailInfo(res.html,url,type),media=mediaFromHtml(res.html,url),chapters=(type==='fiction'||type==='comic')?chapterLinks(res.html,url,type):[],max=pagerMax(res.html),i;
    setPageTitle(info.title);
    d.push({title:info.title,desc:info.intro||typeName(type),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(type==='model'){
      var works=parseCards(res.html,url,'video'),photos=parseCards(res.html,url,'photo');
      if(info.intro)d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
      if(works.length){d.push(section('影片作品',works.length+' 条'));renderCards(d,works);}
      if(photos.length){d.push(section('写真作品',photos.length+' 条'));renderCards(d,photos);}
      if(!works.length&&!photos.length)d.push(empty('当前页没有解析到关联作品','可打开原站核对页面'));
    }else if(type==='fiction'||type==='comic'){
      if(chapters.length)d.push(textButton('章节 '+chapters.length,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));
      else d.push(textButton(type==='fiction'?'阅读正文':'阅读本章',page('xchinaReader',{xc_url:url,t:type,title:info.title})));
    }else{
      d.push(textButton(type==='video'?'播放':'看图',type==='video'?page('xchinaMedia',{xc_url:url,t:type}):page('xchinaReader',{xc_url:url,t:type})));
      if(media.length)d.push(textButton('视频 '+media.length,page('xchinaMedia',{xc_url:url,t:type})));
      if((type==='photo'||type==='amateur')&&max>1)d.push(textButton('分页 '+max,page('xchinaChapters',{xc_url:url,t:type,title:info.title})));
    }
    d.push(textButton('原站','web://'+url));
    if(info.intro&&type!=='model')d.push(section('简介',info.intro));
    if(!res.ok)d.push(empty('当前页面可能仍被验证页拦截','请先进入设置页打开网站完成验证，再返回刷新'));
    setResult(d);
  };

  R.chapters=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','fiction'),title=safeDecode(param('title','目录')),res=fetchUrl(url),i,x;
    setPageTitle(title);
    if(type==='photo'||type==='amateur'){
      var max=pagerMax(res.html),base=url.replace(/\.html(?:[?#].*)?$/,''),target;
      d.push(section('分页','共 '+max+' 页'));
      for(i=1;i<=max;i++){target=i===1?url:base+'/'+i+'.html';d.push({title:'第 '+i+' 页',url:page('xchinaReader',{xc_url:target,t:type}),col_type:'flex_button',extra:{lineVisible:false}});}
    }else{
      var xs=chapterLinks(res.html,url,type);d.push(section('章节','共 '+xs.length+' 项'));
      for(i=0;i<xs.length;i++){x=xs[i];d.push({title:x.name,url:page('xchinaReader',{xc_url:x.href,t:type}),col_type:'text_1',extra:{lineVisible:false}});}
      if(!xs.length)d.push(empty('未解析到章节','页面结构可能已变化'));
    }
    setResult(d);
  };

  R.reader=function(){
    var d=[],url=safeDecode(param('xc_url','')),type=param('t','')||typeFromUrl(url),res=fetchUrl(url),i;
    setPageTitle(type==='fiction'?'正文':'图片');
    if(type==='fiction'){
      var body='',m=s(res.html).match(/<[^>]+class=["'][^"']*fiction-body[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article)>/i);
      if(m)body=m[1];if(!body){m=s(res.html).match(/<article[^>]*>([\s\S]*?)<\/article>/i);body=m?m[1]:'';}
      var ps=[],re=/<p[^>]*>([\s\S]*?)<\/p>/ig,x;while((x=re.exec(body)))if(strip(x[1]))ps.push(strip(x[1]));
      if(!ps.length&&body)ps=[strip(body)];
      if(!ps.length)d.push(empty('未解析到正文',url));else for(i=0;i<ps.length;i++)d.push({title:ps[i],url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}});
    }else{
      var imgs=extractImages(res.html,url,type);if(!imgs.length)d.push(empty('未解析到图片','请检查网站验证状态或页面结构'));else for(i=0;i<imgs.length;i++)d.push({title:'',img:image(imgs[i],url),pic_url:image(imgs[i],url),url:image(imgs[i],url),col_type:'pic_1_full',extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.media=function(){
    var d=[],url=safeDecode(param('xc_url','')),res=fetchUrl(url),xs=mediaFromHtml(res.html,url),i,u;setPageTitle('播放');
    if(!xs.length){d.push(empty('未直接解析到媒体地址','点击下方使用海阔嗅探播放'));d.push({title:'嗅探播放',url:'video://'+url,col_type:'text_1',extra:{lineVisible:false}});}
    else{d.push(section('可播放线路','检测到 '+xs.length+' 条'));for(i=0;i<xs.length;i++){u=xs[i];d.push({title:'播放 '+(i+1),desc:/\.m3u8/i.test(u)?'HLS':'MP4/直链',url:u+';{Referer@'+origin(url)+'/&&User-Agent@'+C.ua+'}#isVideo=true#',col_type:'text_1',extra:{lineVisible:false}});}}
    setResult(d);
  };

  R.settings=function(){
    var d=[],fixed=getFixedBase(),last=getLastBase(),b=fixed||last||C.primary;setPageTitle('小黄书设置 / 验证');
    d.push(section('线路','当前 '+b));
    d.push({title:'自动线路',desc:'最近成功线路 → xchina.co → xchina001.ink',url:$('#noLoading#').lazyRule(function(k){clearItem(k);refreshPage(false);return'toast://已恢复自动线路';},C.baseKey),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'固定 xchina.co',desc:C.primary,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定主域';},C.baseKey,C.primary),col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'固定备用线路',desc:C.fallback,url:$('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return'toast://已固定备用域';},C.baseKey,C.fallback),col_type:'text_1',extra:{lineVisible:false}});
    d.push(section('浏览器验证','阅读源明确要求遇到 Just a moment 时先完成网页验证'));
    d.push({title:'打开当前线路完成验证',desc:'如果列表提示 403 / Just a moment，先打开一次并完成验证，再返回刷新',url:'web://'+b+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'打开漫画线路',desc:C.comic,url:'web://'+C.comic+'/',col_type:'text_1',extra:{lineVisible:false}});
    d.push({title:'发布页',desc:C.publish,url:'web://'+C.publish,col_type:'text_1',extra:{lineVisible:false}});
    d.push(section('状态','Test 0.1.0-test.4 · Build 10104'));
    d.push(textButton('固定线路',fixed||'自动'));
    d.push(textButton('最近成功线路',last||'暂无'));
    d.push(section('说明','Test4 直接整合阅读源的分类、漫画、CSS封面、章节与媒体契约；保留 Test3 的私有文件缓存与限次 WebView 兜底。'));
    setResult(d);
  };

  R.module=function(){return{home:R.home,catalog:R.list,list:R.list,categories:R.categories,search:R.search,searchPage:R.search,detail:R.detail,videoDetail:R.detail,photoDetail:R.detail,fictionDetail:R.detail,comicDetail:R.detail,modelDetail:R.detail,chapters:R.chapters,reader:R.reader,media:R.media,settings:R.settings};};
  return R;
})();