/* Shise Remote Runtime 0.1.0-test.4
 * Device-feedback rebuild: exact item cards, safe URL contract, category templates and model pages.
 */
var ShiseRemoteRuntime=(function(){
  var R={version:'0.1.0-test.4',build:10104};
  var C={
    primary:'https://shise.me',
    ua:'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    cachePrefix:'shise_t4_',
    ruleTitle:'视色'
  };

  function s(v){return v===undefined||v===null?'':String(v);}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'');}
  function decode(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(parseInt(n,10));}catch(e){return _;}});}
  function strip(v){return trim(decode(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n'));}
  function safeDecode(v){var x=s(v),i;for(i=0;i<2;i++){try{var y=decodeURIComponent(x);if(y===x)break;x=y;}catch(e){break;}}return x;}
  function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.primary;}
  function abs(u,base){
    u=safeDecode(decode(trim(u))).replace(/\\\//g,'/');base=base||C.primary;
    if(!u)return'';
    if(/^https?:\/\//i.test(u))return u;
    if(/^\/\//.test(u))return'https:'+u;
    if(/^javascript:/i.test(u)||/^data:/i.test(u)||u==='#')return'';
    if(/^web:\/\//i.test(u))u=u.substring(6);
    var o=origin(base);
    if(u.charAt(0)==='/')return o+u;
    if(!/^https?:\/\//i.test(base))base=o+'/';
    return s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;
  }
  function validHttp(u){return /^https?:\/\/[^\s]+/i.test(s(u));}
  function normalizeTarget(v,base){var u=abs(v,base||C.primary+'/');return validHttp(u)?u:'';}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h);}
  function cookieFor(url){var c='';try{if(typeof getCookie==='function')c=s(getCookie(url)||'');}catch(e){}if(!c){try{if(typeof getCookie==='function')c=s(getCookie(origin(url)+'/')||'');}catch(e2){}}return c;}
  function headersFor(url,ref){var r=ref||origin(url)+'/',h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':r},c=cookieFor(url);if(c)h.Cookie=c;return h;}
  function image(u,ref){u=normalizeTarget(u,ref||C.primary+'/');if(!u)return'';var h={'User-Agent':C.ua,'Referer':ref||C.primary+'/'},c=cookieFor(u);if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h);}
  function badHtml(h){var x=s(h),l=x.toLowerCase();return x.length<160||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('cloudflare ray id')>=0||l.indexOf('access denied')>=0||l.indexOf('<title>403')>=0;}
  function cacheFile(url){return C.cachePrefix+hash(url)+'.html';}
  function readCache(url){try{return s(readFile(cacheFile(url))||'');}catch(e){return'';}}
  function writeCache(url,html){try{if(html&&html.length>160&&html.length<900000)saveFile(cacheFile(url),html);}catch(e){}}
  function webFetch(url){try{if(typeof fetchCodeByWebView==='function')return s(fetchCodeByWebView(url,{timeout:18000,headers:headersFor(url,origin(url)+'/'),blockRules:['.woff','.woff2','.ttf','.ico']})||'');}catch(e){}return'';}
  function fetchPage(input,opt){
    opt=opt||{};var url=normalizeTarget(input,C.primary+'/'),html='',old='';
    if(!url)return{ok:false,html:'',url:s(input),base:C.primary,invalid:true,via:'invalid'};
    try{html=s(fetch(url,{timeout:opt.timeout||11000,headers:headersFor(url,origin(url)+'/')}));}catch(e1){html='';}
    if(!badHtml(html)){writeCache(url,html);return{ok:true,html:html,url:url,base:origin(url),via:'fetch'};}
    old=readCache(url);if(old&&!badHtml(old))return{ok:true,html:old,url:url,base:origin(url),via:'stale'};
    if(!opt.noWeb){var w=webFetch(url);if(!badHtml(w)){writeCache(url,w);return{ok:true,html:w,url:url,base:origin(url),via:'webview'};}if(w.length>html.length)html=w;}
    return{ok:false,html:html,url:url,base:origin(url),blocked:true,via:'blocked'};
  }

  function domArray(html,sel){try{if(typeof pdfa==='function')return pdfa(s(html),sel)||[];if(typeof parseDomForArray==='function')return parseDomForArray(s(html),sel)||[];}catch(e){}return[];}
  function domHtml(html,sel){try{if(typeof pdfh==='function')return s(pdfh(s(html),sel)||'');if(typeof parseDomForHtml==='function')return s(parseDomForHtml(s(html),sel)||'');}catch(e){}return'';}
  function domUrl(html,sel,base){try{if(typeof pd==='function')return s(pd(s(html),sel,base)||'');if(typeof parseDom==='function')return s(parseDom(s(html),sel,base)||'');}catch(e){}return'';}
  function cssUrl(style,base){var m=decode(s(style)).match(/url\(\s*["']?([^"'\)]+)["']?\s*\)/i);return m?normalizeTarget(m[1],base):'';}
  function og(html,key){var k=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),m=s(html).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+k+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));if(!m)m=s(html).match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+k+'["\\\']','i'));return m?decode(m[1]):'';}
  function allAnchors(html,base){var out=[],re=/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,u,t;while((m=re.exec(s(html)))){u=normalizeTarget(m[2],base);t=strip(m[4]);if(u)out.push({href:u,text:t,raw:m[0],index:m.index,attrs:m[1]+' '+m[3]});}return out;}

  function param(name,def){var v='';try{v=s(getParam(name,'')||'');}catch(e){}if(!v){try{var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));if(m)v=m[1];}catch(e2){}}v=safeDecode(v);return v!==''?v:(def||'');}
  function currentPage(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
  function page(path,params){var a=['rule=','simple=true'],k;params=params||{};for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(s(params[k])));return'hiker://page/'+path+'?'+a.join('&');}
  function setTitle(t){try{setPageTitle(t);}catch(e){}}
  function section(t,d){return{title:'‘‘’’<b><font color="#7C3AED">'+t+'</font></b>',desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function btn(t,u,d){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_4',extra:{lineVisible:false}};}
  function small(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}

  function listPath(p){p=parseInt(p,10)||1;return p===1?'/videos.html':'/videos/'+p+'.html';}
  function modelPath(p){p=parseInt(p,10)||1;return p===1?'/models.html':'/models/'+p+'.html';}
  function searchPath(kw,p){p=parseInt(p,10)||1;return'/videos/keyword-'+encodeURIComponent(trim(kw))+'/'+p+'.html';}
  function pathOnly(url){var m=s(url).match(/^https?:\/\/[^\/]+(\/[^#]*)?/i);return m?(m[1]||'/'):s(url);}
  function templateFromPath(p){p=pathOnly(p);if(p==='/videos.html')return'/videos/{page}.html';if(/\/\d+\.html(?:[?#].*)?$/.test(p))return p.replace(/\/\d+\.html([?#].*)?$/,'/{page}.html$1');return p;}
  function resolveTemplate(tpl,p){p=parseInt(p,10)||1;tpl=safeDecode(tpl||'/videos/{page}.html');if(tpl.indexOf('{page}')>=0)return tpl.replace('{page}',String(p));if(p<=1)return tpl;if(/\/\d+\.html(?:[?#].*)?$/.test(tpl))return tpl.replace(/\/\d+\.html([?#].*)?$/,'/'+p+'.html$1');if(/\.html(?:[?#].*)?$/.test(tpl))return tpl.replace(/\.html([?#].*)?$/,'/'+p+'.html$1');return tpl.replace(/\/$/,'')+'/'+p+'.html';}

  function cardBlocks(html,type){
    var sels=type==='model'?['.models&&.item.model','body&&.item.model','.item.model','.models&&.item']:['.videos&&.item.video','body&&.item.video','.item.video','.videos&&.item'],i,a;
    for(i=0;i<sels.length;i++){a=domArray(html,sels[i]);if(a&&a.length)return a;}
    var out=[],cls=type==='model'?'model':'video',re=new RegExp('class=["\\\'][^"\\\']*\\bitem\\b[^"\\\']*\\b'+cls+'\\b[^"\\\']*["\\\']','ig'),m,pos=[];while((m=re.exec(s(html))))pos.push(m.index);
    for(i=0;i<pos.length;i++){var st=s(html).lastIndexOf('<',pos[i]);if(st<0)st=pos[i];var en=i+1<pos.length?s(html).lastIndexOf('<',pos[i+1]):Math.min(s(html).length,st+7000);out.push(s(html).substring(st,en));}
    return out;
  }
  function firstImage(block,base){var style=domHtml(block,'.img&&style'),u=cssUrl(style,base);if(!u)u=domUrl(block,'.img&&img&&src',base)||domUrl(block,'img&&data-original',base)||domUrl(block,'img&&data-src',base)||domUrl(block,'img&&data-lazy-src',base)||domUrl(block,'img&&src',base);if(!u){var m=s(block).match(/(?:data-original|data-src|data-lazy-src|poster|src)\s*=\s*["']([^"']+)["']/i);if(m)u=normalizeTarget(m[1],base);}return u;}
  function cardFromBlock(block,listUrl,type){
    var title=strip(domHtml(block,'.title&&Text')||domHtml(block,'.name&&Text')||domHtml(block,'a&&title')),href=domUrl(block,'a,0&&href',listUrl)||domUrl(block,'a&&href',listUrl),img=firstImage(block,listUrl),brief=strip(domHtml(block,'.brief&&Text')||domHtml(block,'.meta&&Text')||domHtml(block,'.model-container&&Text')||domHtml(block,'.author&&Text'));
    if(!title){var mt=s(block).match(/class=["'][^"']*\b(?:title|name)\b[^"']*["'][^>]*>([\s\S]*?)<\//i);title=mt?strip(mt[1]):'';}
    if(!href){var mh=s(block).match(/<a\b[^>]*href=["']([^"']+)["']/i);href=mh?normalizeTarget(mh[1],listUrl):'';}
    href=normalizeTarget(href,listUrl);
    if(!title||!href)return null;
    if(type==='video'&&!/\/video(?:\/|-)/i.test(pathOnly(href)))return null;
    if(type==='model'&&!/\/model(?:\/|-)/i.test(pathOnly(href)))return null;
    return{type:type,title:title,href:href,img:image(img,listUrl),rawImg:img,brief:brief};
  }
  function parseCards(html,listUrl,type){var bs=cardBlocks(html,type),out=[],seen={},i,c;for(i=0;i<bs.length;i++){c=cardFromBlock(bs[i],listUrl,type);if(!c||seen[c.href])continue;seen[c.href]=1;out.push(c);}return out;}
  function videoCard(x){return{title:x.title,desc:x.brief||'',img:x.img||'',pic_url:x.img||'',url:page('shiseVideo',{ss_url:x.href}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:x.title}};}
  function modelCard(x){return{title:x.title,desc:x.brief||'',img:x.img||'',pic_url:x.img||'',url:page('shiseModel',{ss_url:x.href,ss_title:x.title}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:x.title}};}
  function renderCards(d,xs,type){for(var i=0;i<xs.length;i++)d.push(type==='model'?modelCard(xs[i]):videoCard(xs[i]));}

  function parseCategories(html,base){
    var a=allAnchors(html,base),out=[],seen={},i,x,p,t,tpl;
    out.push({title:'全部内容',path:'/videos/{page}.html'});seen['/videos/{page}.html']=1;
    for(i=0;i<a.length;i++){
      x=a[i];p=pathOnly(x.href);t=trim(x.text);
      if(!t||t.length>24||/^\d+$/.test(t)||/上一页|下一页|next|prev|首页|登录|注册|搜索/i.test(t))continue;
      if(!/^\/videos\//.test(p))continue;
      if(/^\/video(?:\/|-)/.test(p)||/\/keyword-/.test(p))continue;
      if(!/(?:series|tag|category|sort|maker|label|genre)-/i.test(p)&&!/\/videos\/[^\/]+\/1\.html/.test(p))continue;
      tpl=templateFromPath(p);if(seen[tpl])continue;seen[tpl]=1;out.push({title:t,path:tpl});
    }
    return out;
  }

  function titleFromHtml(html){var t=strip(domHtml(html,'.item,0&&.text&&Text')||domHtml(html,'.text&&Text')||domHtml(html,'.title&&Text')||og(html,'og:title'));if(!t){var m=s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);t=m?strip(m[1]):'';}return t.replace(/\s*[-_|]\s*视色.*$/i,'');}
  function detailInfo(html,url){var title=titleFromHtml(html)||'内容详情',img=domUrl(html,'.cover&&img&&src',url)||og(html,'og:image')||firstImage(html,url),intro=strip(domHtml(html,'.brief&&Text')||domHtml(html,'.description&&Text')||og(html,'og:description'));return{title:title,img:image(img,url),intro:intro};}
  function mediaFromHtml(html,url){
    var body=s(html),out=[],seen={},domain='',videos=[],m,i,v,re;
    function add(x){x=s(x).replace(/\\\//g,'/').replace(/\\/g,'');if(!x)return;if(!/^https?:\/\//i.test(x)){if(domain)x=domain.replace(/\/$/,'')+(x.charAt(0)==='/'?'':'/')+x;else x=normalizeTarget(x,url);}x=normalizeTarget(x,url);if(x&&!seen[x]&&/\.(?:m3u8|mp4)(?:[?#]|$)/i.test(x)){seen[x]=1;out.push(x);}}
    m=body.match(/var\s+domain\s*=\s*["']([^"']+)["']/i);if(m)domain=m[1];
    m=body.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);if(m){try{videos=JSON.parse(m[1]);}catch(e){re=/["'](?:url|src|file)["']\s*:\s*["']([^"']+)["']/ig;while((v=re.exec(m[1])))videos.push({url:v[1]});}for(i=0;i<videos.length;i++)add(videos[i]&&(videos[i].url||videos[i].src||videos[i].file));}
    re=/(?:src|file|url)\s*[=:]\s*["']([^"']+\.(?:m3u8|mp4)(?:[^"']*)?)["']/ig;while((m=re.exec(body)))add(m[1]);
    re=/["'](https?:\\?\/\\?\/[^"']+\.(?:m3u8|mp4)(?:[^"']*)?)["']/ig;while((m=re.exec(body)))add(m[1]);
    return out.slice(0,16);
  }
  function playerUrl(u,pageUrl){var hs='Referer@'+origin(pageUrl)+'/&&Origin@'+origin(pageUrl)+'&&User-Agent@'+C.ua,c=cookieFor(pageUrl)||cookieFor(u);if(c)hs+='&&Cookie@'+c;return s(u)+';{'+hs+'}#isVideo=true#';}
  function modelLinks(html,url){var xs=parseCards(html,url,'model'),out=[],seen={},i;for(i=0;i<xs.length;i++)if(!seen[xs[i].href]){seen[xs[i].href]=1;out.push(xs[i]);}return out;}

  R.home=function(){
    var d=[],p=currentPage(),res=fetchPage(listPath(p)),items=parseCards(res.html,res.url,'video'),cats;
    if(p===1){setTitle('视色');d.push({title:'视色',desc:'内容浏览 · 分类 · 搜索 · 人物',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push(btn('🔎 搜索',page('shiseSearch',{})));d.push(btn('🗂 分类',page('shiseCategories',{})));d.push(btn('👤 人物',page('shiseModels',{})));d.push(btn('⚙ 设置',page('shiseSettings',{})));cats=parseCategories(res.html,res.url);if(cats.length>1){d.push(section('快速分类',''));for(var c=0;c<Math.min(cats.length,10);c++)d.push(small(cats[c].title,page('shiseCatalog',{ss_title:cats[c].title,ss_path:cats[c].path})));}d.push(section('最新内容',items.length?'当前页 '+items.length+' 条':''));}
    if(!items.length)d.push(empty('没有解析到内容',(res.invalid?'详情地址无效':res.ok?'页面已取得，但没有匹配到视频卡片':'站点验证/网络未通过')+'\n'+res.url));else renderCards(d,items,'video');setResult(d);
  };

  R.catalog=function(){
    var d=[],p=currentPage(),title=param('ss_title','内容列表'),tpl=param('ss_path','/videos/{page}.html'),path=resolveTemplate(tpl,p),res=fetchPage(path),items=parseCards(res.html,res.url,'video');if(p===1){setTitle(title);d.push(section(title,'原站分页 · 可继续向下翻页'));}if(!items.length)d.push(empty('当前分类没有解析到内容',(res.ok?'页面已取得但卡片为空':'站点验证/网络未通过')+'\n'+res.url));else renderCards(d,items,'video');setResult(d);
  };

  R.categories=function(){
    var d=[],res=fetchPage('/videos.html'),cats=parseCategories(res.html,res.url),i;setTitle('分类');d.push(section('内容分类',cats.length>1?'已识别 '+cats.length+' 个分类':'暂未识别到站点分类'));for(i=0;i<cats.length;i++)d.push({title:cats[i].title,url:page('shiseCatalog',{ss_title:cats[i].title,ss_path:cats[i].path}),col_type:'flex_button',extra:{lineVisible:false}});if(cats.length<=1)d.push(empty('未读取到更多分类','已保留“全部内容”；如原站分类结构再次变化，继续按实机页面修正。'));setResult(d);
  };

  R.search=function(){var d=[],p=currentPage(),kw='';try{kw=s(MY_KEYWORD||'');}catch(e){}if(!kw)kw=param('kw','');kw=trim(kw);if(!kw){setResult([]);return;}var res=fetchPage(searchPath(kw,p)),items=parseCards(res.html,res.url,'video');if(!items.length)d.push(empty('没有搜索到内容',res.url));else renderCards(d,items,'video');setResult(d);};
  R.searchPage=function(){var d=[],kw=param('kw','');setTitle('搜索');if(!kw){d.push({title:'⌕ 打开搜索',desc:'片名 / 编号 / 关键词',url:'hiker://search?s=&rule='+encodeURIComponent(C.ruleTitle),col_type:'text_center_1',extra:{lineVisible:false}});d.push(empty('等待搜索','输入关键词后展示结果'));setResult(d);return;}R.search();};

  R.models=function(){var d=[],p=currentPage(),res=fetchPage(modelPath(p)),items=parseCards(res.html,res.url,'model');if(p===1){setTitle('人物');d.push(section('人物',items.length?'当前页 '+items.length+' 位':'使用站点 .item.model 结构解析'));}if(!items.length)d.push(empty('没有解析到人物列表',(res.ok?'页面已取得，但 .item.model 为空':'站点验证/网络未通过')+'\n'+res.url));else renderCards(d,items,'model');setResult(d);};

  R.model=function(){var d=[],raw=param('ss_url',''),url=normalizeTarget(raw,C.primary+'/'),res,title,info,works;if(!url){setResult([empty('人物地址无效','收到：'+raw)]);return;}res=fetchPage(url);title=param('ss_title','')||titleFromHtml(res.html)||'人物详情';info=detailInfo(res.html,res.url);works=parseCards(res.html,res.url,'video');setTitle(title);d.push({title:title,desc:info.intro||'',img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});if(works.length){d.push(section('相关内容',works.length+' 条'));renderCards(d,works,'video');}else d.push(empty('没有解析到关联内容',(res.ok?'人物页已取得，但未匹配到 .item.video':'页面请求失败')+'\n'+res.url));d.push(btn('原站','web://'+url));setResult(d);};

  R.detail=function(){
    var d=[],raw=param('ss_url',''),url=normalizeTarget(raw,C.primary+'/');if(!url){setResult([empty('详情地址无效','收到：'+raw+'\nTest4 已改用独立 ss_url 参数，避免与海阔页面 URL 字段冲突。')]);return;}
    var res=fetchPage(url),info=detailInfo(res.html,res.url),media=mediaFromHtml(res.html,res.url),models=modelLinks(res.html,res.url),recs=parseCards(res.html,res.url,'video'),meta=[],i;setTitle(info.title);
    if(media.length)meta.push(media.length+' 条播放线路');d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
    if(media.length)d.push({title:'▶ 立即播放',desc:'已解析媒体直链',url:playerUrl(media[0],res.url),col_type:'text_center_1',extra:{lineVisible:false}});else d.push({title:'▶ 网页嗅探',desc:'未解析到直链时使用',url:'video://'+url,col_type:'text_center_1',extra:{lineVisible:false}});
    if(media.length>1)d.push(btn('播放线路 · '+media.length,page('shiseMedia',{ss_url:url})));
    if(models.length){d.push(section('相关人物',''));for(i=0;i<models.length;i++)d.push(small(models[i].title,page('shiseModel',{ss_url:models[i].href,ss_title:models[i].title})));}
    if(info.intro){d.push(section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});}
    if(recs.length){d.push(section('相关推荐',recs.length+' 条'));renderCards(d,recs,'video');}
    d.push(btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(btn('原站','web://'+url));if(!res.ok)d.push(empty('页面可能被验证页拦截','设置 → 打开当前线路完成 X5 验证后返回刷新'));setResult(d);
  };

  R.media=function(){var d=[],raw=param('ss_url',''),url=normalizeTarget(raw,C.primary+'/');if(!url){setResult([empty('播放地址无效','收到：'+raw)]);return;}var res=fetchPage(url),xs=mediaFromHtml(res.html,res.url),i;setTitle('播放线路');if(!xs.length){d.push(empty('未解析到媒体地址','可测试网页嗅探'));d.push({title:'网页嗅探',url:'video://'+url,col_type:'text_center_1',extra:{lineVisible:false}});}else{d.push(section('播放线路','共 '+xs.length+' 条'));for(i=0;i<xs.length;i++)d.push({title:'线路 '+(i+1),desc:/m3u8/i.test(xs[i])?'HLS':'MP4',url:playerUrl(xs[i],url),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'网页嗅探兜底',url:'video://'+url,col_type:'text_1',extra:{lineVisible:false}});}setResult(d);};

  R.settings=function(){var d=[],ck='';try{ck=cookieFor(C.primary);}catch(e){}setTitle('视色设置');d.push(section('站点与验证',''));d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / Just a moment / 空列表时使用',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'刷新当前页面',desc:'完成验证后返回刷新即可',url:$('#noLoading#').lazyRule(function(){refreshPage(true);return'hiker://empty';}),col_type:'text_1',extra:{lineVisible:false}});d.push(section('快捷入口',''));d.push(btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(btn('历史','hiker://history?rule='+encodeURIComponent(C.ruleTitle)));d.push(btn('原站','web://'+C.primary));d.push(section('版本状态','Test 0.1.0-test.4 · Build 10104'));d.push({title:'本版修复',desc:'详情页改用独立 ss_url 参数；列表按 .item.video / .item.model 精确解析；分类传递真实路径模板并支持后续分页。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});setResult(d);};

  R.module=function(){return{home:R.home,catalog:R.catalog,categories:R.categories,search:R.search,searchPage:R.searchPage,models:R.models,model:R.model,detail:R.detail,media:R.media,settings:R.settings};};
  return R;
})();
