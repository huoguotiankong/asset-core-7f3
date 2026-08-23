/* 51吃瓜 Remote Core 0.1.0-test.1 */
var Cg51Core=(function(){
  var C={};
  C.version='0.1.0-test.1';
  C.build=10101;
  C.defaultBase='https://51cg1.com';
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/bootstrap_test_v1_b10101.js?v=10101';
  C.ua='Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/139.0 Mobile Safari/537.36';
  C.baseKey='cg51_base_v1';
  C.favoriteKey='cg51_favorites_v1';
  C.historyKey='cg51_history_v1';
  C.diagKey='cg51_diag_v1';
  C.schema='1';
  C.maxHistory=60;
  C.maxFavorites=100;
  C.brand='#20B486';

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.clean=function(v){var s=C.trim(v);return s==='null'||s==='undefined'?'':s;};
  C.decode=function(v){return C.s(v).replace(/\\u0026/ig,'&').replace(/\\\//g,'/').replace(/&amp;/ig,'&').replace(/&#38;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;|&#x27;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');};
  C.strip=function(v){return C.trim(C.decode(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ')).replace(/[\t\r ]+/g,' ').replace(/\n\s+/g,'\n'));};
  C.hash=function(s){s=C.s(s);var h=0,i;for(i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h);};
  C.q=function(v){return encodeURIComponent(C.s(v));};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';};
  C.pathOf=function(u){var m=C.s(u).match(/^https?:\/\/[^\/]+(\/[^?#]*)?(\?[^#]*)?/i);return m?(m[1]||'/')+(m[2]||''):C.s(u);};
  C.isSiteHost=function(host){host=C.s(host).replace(/^https?:\/\//i,'').replace(/\/.*$/,'').toLowerCase();return /(^|\.)51cg[a-z0-9-]*\.com$/.test(host)||/(^|\.)cg51\.com$/.test(host)||/(^|\.)chigua\.com$/.test(host);};
  C.abs=function(u,base){u=C.decode(C.trim(u));base=base||C.base();if(!u)return'';if(/^data:|^javascript:|^#/.test(u))return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;var o=C.origin(base)||C.base();if(u.charAt(0)==='/')return o+u;if(u.charAt(0)==='?')return C.s(base).replace(/[?#].*$/,'')+u;return C.s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;};
  C.canonical=function(u,ref){u=C.abs(u,ref||C.base());if(!u)return'';var o=C.origin(u);if(o&&C.isSiteHost(o))return C.base()+C.pathOf(u);return u;};
  C.ruleTitle=function(){try{return MY_RULE&&MY_RULE.title?MY_RULE.title:'51吃瓜';}catch(e){return'51吃瓜';}};
  C.param=function(name,def){var u='';try{u=C.s(MY_URL);}catch(e){}var re=new RegExp('[?&]'+name+'=([^&#]*)'),m=u.match(re);if(!m)return def===undefined?'':def;try{return decodeURIComponent(m[1]);}catch(e2){return m[1];}};
  C.pageNo=function(){var p=1;try{p=parseInt(MY_PAGE||1,10)||1;}catch(e){p=parseInt(C.param('page','1'),10)||1;}return p<1?1:p;};
  C.page=function(path,params){var a=['rule='+encodeURIComponent(C.ruleTitle()),'simple=true'],k;params=params||{};for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));return'hiker://page/'+path+'?'+a.join('&');};
  C.headers=function(ref,accept){return{'User-Agent':C.ua,'Referer':ref||C.base()+'/','Accept':accept||'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.image=function(u,ref){u=C.abs(u,ref||C.base());if(!u)return'';return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.base()+'/'});};
  C.video=function(u,ref){u=C.clean(u);if(!u)return'';return u+';{Referer@'+(ref||C.base()+'/')+'&&User-Agent@'+C.ua+'}#isVideo=true#';};
  C.attr=function(tag,name){var m=C.s(tag).match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));return m?C.decode(m[1]):'';};
  C.meta=function(html,key){var k=C.s(key).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),m=C.s(html).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+k+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));if(!m)m=C.s(html).match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+k+'["\\\']','i'));return m?C.decode(m[1]):'';};
  C.context=function(html,index,before,after){html=C.s(html);return html.substring(Math.max(0,index-(before||700)),Math.min(html.length,index+(after||1600)));};
  C.unique=function(arr,keyFn){var out=[],seen={},i,k;for(i=0;i<(arr||[]).length;i++){k=keyFn?keyFn(arr[i]):C.s(arr[i]);if(!k||seen[k])continue;seen[k]=1;out.push(arr[i]);}return out;};
  C.readList=function(key){var raw=getItem(key,'[]'),a=[];try{a=JSON.parse(raw);}catch(e){a=[];}return Object.prototype.toString.call(a)==='[object Array]'?a:[];};
  C.writeList=function(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}return a||[];};
  C.diag=function(stage,route,url,error){var x={time:new Date().getTime(),stage:C.clean(stage),route:C.clean(route),url:C.clean(url),error:C.clean(error),base:C.base(),version:C.version,build:C.build};try{setItem(C.diagKey,JSON.stringify(x));}catch(e){}return x;};
  C.lastDiag=function(){try{return JSON.parse(getItem(C.diagKey,'{}'))||{};}catch(e){return{};}};

  C.seedBases=function(){return[C.defaultBase,'https://cg51.com','https://chigua.com','https://51cgo9.com','https://51cgo10.com'];};
  C.base=function(){var b=C.trim(getItem(C.baseKey,C.defaultBase));if(!/^https?:\/\//i.test(b)||!C.isSiteHost(b))b=C.defaultBase;return b.replace(/\/+$/,'');};
  C.setBase=function(b){b=C.trim(b).replace(/\/+$/,'');if(/^https?:\/\//i.test(b)&&C.isSiteHost(b))setItem(C.baseKey,b);return b;};
  C.extractOfficialBases=function(html){var s=C.decode(html),re=/https?:\/\/[a-z0-9.-]+/ig,m,out=[];while((m=re.exec(s))){var o=m[0].replace(/\/+$/,'');if(C.isSiteHost(o))out.push(o);}return C.unique(out);};
  C.isValidSiteHtml=function(body){var s=C.s(body),l=s.toLowerCase();if(s.length<500)return false;if(l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('captcha')>=0&&s.length<6000)return false;return s.indexOf('51吃瓜')>=0||/\/archives\/\d+\//.test(s)||/\/category\/[a-z0-9-]+\//i.test(s);};
  C.rawFetch=function(url,opt){opt=opt||{};try{return C.s(fetch(url,{timeout:opt.timeout||9000,headers:C.headers(opt.ref||url,opt.accept)}));}catch(e){C.diag('request','fetch',url,C.s(e));return'';}};
  C.probe=function(b){var h=C.rawFetch(b+'/',{timeout:5000,ref:b+'/'});if(C.isValidSiteHtml(h)){C.setBase(b);return{ok:true,base:b,html:h};}return{ok:false,base:b,html:h};};
  C.discoverBase=function(force){var current=C.base(),seeds=C.seedBases(),list=[current],i,p,h,found=[];if(!force){p=C.probe(current);if(p.ok)return p;}for(i=0;i<seeds.length;i++)if(seeds[i]!==current)list.push(seeds[i]);for(i=0;i<list.length;i++){p=C.probe(list[i]);if(p.ok){found=C.extractOfficialBases(p.html);if(found.length){var j;for(j=0;j<found.length;j++)if(found[j]!==p.base){var q=C.probe(found[j]);if(q.ok)return q;}}return p;}}return{ok:false,base:current,html:''};};
  C.request=function(pathOrUrl,opt){opt=opt||{};var b=C.base(),u=/^https?:\/\//i.test(pathOrUrl)?C.canonical(pathOrUrl,b):b+(pathOrUrl.charAt(0)==='/'?pathOrUrl:'/'+pathOrUrl),h=C.rawFetch(u,{timeout:opt.timeout||10000,ref:opt.ref||u,accept:opt.accept});if(C.isValidSiteHtml(h)||opt.allowAny&&h.length>50){C.setBase(C.origin(u)||b);C.diag('ok',opt.route||'html',u,'');return{ok:true,url:u,html:h,base:C.base()};}if(opt.noRetry)return{ok:false,url:u,html:h,base:b};var d=C.discoverBase(true);if(d.ok){var p=C.pathOf(u),u2=d.base+p;h=C.rawFetch(u2,{timeout:opt.timeout||10000,ref:opt.ref||u2,accept:opt.accept});if(C.isValidSiteHtml(h)||opt.allowAny&&h.length>50){C.diag('ok',opt.route||'html-failover',u2,'');return{ok:true,url:u2,html:h,base:d.base};}}C.diag('request','domain-failover',u,'site html invalid');return{ok:false,url:u,html:h,base:C.base()};};

  C.firstImage=function(raw,base){var re=/<img\b([^>]*)>/ig,m,u='';while((m=re.exec(C.s(raw)))){u=C.attr(m[1],'data-original')||C.attr(m[1],'data-src')||C.attr(m[1],'data-lazy-src')||C.attr(m[1],'src');u=C.abs(u,base);if(u&&!/logo|avatar|favicon|icon[-_.]/i.test(u))return u;}return'';};
  C.dateFrom=function(raw){var s=C.strip(raw),m=s.match(/20\d{2}[年\-\/.]\d{1,2}[月\-\/.]\d{1,2}(?:日)?(?:\s+\d{1,2}:\d{2})?/);return m?m[0]:'';};
  C.categoryFrom=function(raw){var m=C.s(raw).match(/<a\b[^>]*href=["'][^"']*\/category\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/i);return m?C.strip(m[1]):'';};
  C.parsePosts=function(html,base){var s=C.s(html),re=/<a\b([^>]*)href\s*=\s*["']([^"']*\/archives\/\d+\/?[^"']*)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,out=[],seen={},ctx,title,img,date,cat,u,inner,tm;while((m=re.exec(s))){u=C.canonical(m[2],base);if(!u||seen[u])continue;inner=m[4];ctx=C.context(s,m.index,950,1900);title=C.clean(C.attr(m[1]+' '+m[3],'title')||C.strip(inner));if(!title||title.length<2||title.length>240){tm=ctx.match(/<(?:h1|h2|h3|h4)[^>]*>[\s\S]{0,300}?<a\b[^>]*href=["'][^"']*\/archives\/\d+\/?[^"']*["'][^>]*>([\s\S]*?)<\/a>[\s\S]{0,200}?<\/(?:h1|h2|h3|h4)>/i);if(tm)title=C.strip(tm[1]);}if(!title||title.length<2){tm=ctx.match(/(?:title|alt)\s*=\s*["']([^"']{2,220})["']/i);if(tm)title=C.clean(tm[1]);}if(!title||/上一篇|下一篇|阅读全文|评论|首页/.test(title))continue;img=C.firstImage(inner,u)||C.firstImage(ctx,u);date=C.dateFrom(ctx);cat=C.categoryFrom(ctx);seen[u]=1;out.push({url:u,title:title,img:C.image(img,u),rawImg:img,date:date,category:cat,desc:[cat,date].filter(function(x){return!!x;}).join(' · ')});}return out;};
  C.extractLinks=function(html,base,pattern){var s=C.s(html),re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,out=[],seen={},u,n;while((m=re.exec(s))){u=C.canonical(m[2],base);n=C.strip(m[4]);if(!u||!n||n.length>50||!pattern.test(u)||seen[u])continue;seen[u]=1;out.push({name:n,url:u});}return out;};
  C.staticCategories=function(){var b=C.base();return[
    {name:'今日吃瓜',url:b+'/category/wpcz/'},{name:'网红黑料',url:b+'/category/whhl/'},{name:'必看大瓜',url:b+'/category/bkdg/'},{name:'吃瓜榜单',url:b+'/category/mrdg/'},{name:'吃瓜剧场',url:b+'/category/ysyl/'},{name:'热门大瓜',url:b+'/category/rdsj/'},{name:'每日大赛',url:b+'/category/mrds/'},{name:'网黄合集',url:b+'/category/whhj/'},{name:'海外吃瓜',url:b+'/category/hwcg/'},{name:'明星爆料',url:b+'/category/whmx/'}
  ];};
  C.categories=function(){var r=C.request('/',{route:'categories'}),a=r.ok?C.extractLinks(r.html,r.url,/\/category\/[a-z0-9-]+\/?/i):[],s=C.staticCategories(),i;for(i=0;i<s.length;i++)a.push(s[i]);return C.unique(a,function(x){return C.pathOf(x.url).replace(/\?.*$/,'');});};
  C.homePath=function(page){page=parseInt(page,10)||1;return page<=1?'/':'/page/'+page+'/';};
  C.categoryPath=function(categoryUrl,page){var p=C.pathOf(categoryUrl).replace(/\?.*$/,'');if(p.charAt(p.length-1)!=='/')p+='/';page=parseInt(page,10)||1;return page<=1?p:p+'page/'+page+'/';};
  C.searchPath=function(q,page){page=parseInt(page,10)||1;return(page<=1?'/?s=':'/page/'+page+'/?s=')+C.q(q);};
  C.home=function(page){var r=C.request(C.homePath(page),{route:'home'});return{ok:r.ok,url:r.url,posts:r.ok?C.parsePosts(r.html,r.url):[],html:r.html};};
  C.category=function(categoryUrl,page){var r=C.request(C.categoryPath(categoryUrl,page),{route:'category'});return{ok:r.ok,url:r.url,posts:r.ok?C.parsePosts(r.html,r.url):[],html:r.html};};
  C.search=function(q,page){var r=C.request(C.searchPath(q,page),{route:'search'}),posts=r.ok?C.parsePosts(r.html,r.url):[];if(!posts.length&&page>1){r=C.request('/?s='+C.q(q)+'&paged='+page,{route:'search-paged'});posts=r.ok?C.parsePosts(r.html,r.url):[];}return{ok:r.ok,url:r.url,posts:posts,html:r.html};};

  C.articleBlock=function(html){var s=C.s(html),m=s.match(/<article\b[\s\S]*?<\/article>/i);if(m)return m[0];m=s.match(/<div\b[^>]*class=["'][^"']*(?:entry-content|post-content|article-content|single-content)[^"']*["'][^>]*>([\s\S]*?)(?:<div\b[^>]*class=["'][^"']*(?:post-navigation|comments|related)|<\/article>)/i);return m?m[1]:s;};
  C.extractImages=function(raw,base){var s=C.s(raw),re=/<img\b([^>]*)>/ig,m,out=[],seen={},u;while((m=re.exec(s))){u=C.attr(m[1],'data-original')||C.attr(m[1],'data-src')||C.attr(m[1],'data-lazy-src')||C.attr(m[1],'src');u=C.abs(u,base);if(!u||seen[u]||/logo|avatar|favicon|icon[-_.]|emoji|loading/i.test(u))continue;if(/^data:/i.test(u))continue;seen[u]=1;out.push(u);}return out;};
  C.extractParagraphs=function(raw){var s=C.s(raw),re=/<(?:p|h2|h3|h4|blockquote)\b[^>]*>([\s\S]*?)<\/(?:p|h2|h3|h4|blockquote)>/ig,m,out=[],seen={},t;while((m=re.exec(s))){t=C.strip(m[1]);if(!t||t.length<2||t.length>1600||/^https?:\/\//i.test(t)||/下载APP|备用网址|广告合作|商务合作|官方.*群/i.test(t))continue;if(seen[t])continue;seen[t]=1;out.push(t);}return out;};
  C.extractMedia=function(html,base){var s=C.decode(html),out=[],seen={},i,re,m,u;var patterns=[
    /<(?:source|video)\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/ig,
    /["'](?:file|src|url|video_url|play_url)["']\s*[:=]\s*["']([^"']*(?:\.m3u8|\.mp4)(?:\?[^"']*)?)["']/ig,
    /(https?:\\?\/\\?\/[^\s"'<>]+?(?:\.m3u8|\.mp4)(?:\?[^\s"'<>]*)?)/ig
  ];
  for(i=0;i<patterns.length;i++){re=patterns[i];while((m=re.exec(s))){u=C.decode(m[1]||m[0]).replace(/\\\//g,'/');u=C.abs(u,base);if(!u||seen[u]||/\.jpg|\.png|\.gif|\.webp/i.test(u))continue;seen[u]=1;out.push({url:u,ref:base,route:'direct'});}}
  return out;};
  C.extractIframes=function(html,base){var re=/<iframe\b([^>]*)>/ig,m,out=[],seen={},u;while((m=re.exec(C.s(html)))&&out.length<4){u=C.attr(m[1],'src')||C.attr(m[1],'data-src');u=C.abs(u,base);if(!u||seen[u])continue;seen[u]=1;out.push(u);}return out;};
  C.detail=function(url){var r=C.request(url,{route:'detail',timeout:12000}),h=r.html||'',block=C.articleBlock(h),title=C.meta(h,'og:title'),m,x;if(!title){m=h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);title=m?C.strip(m[1]):'';}title=C.clean(title)||'51吃瓜';var cover=C.meta(h,'og:image')||C.firstImage(block,r.url),date=C.dateFrom(h),cats=C.extractLinks(h,r.url,/\/category\/[a-z0-9-]+\/?/i),tags=C.extractLinks(h,r.url,/\/tag\/[^/?#]+\/?/i),imgs=C.extractImages(block,r.url),paras=C.extractParagraphs(block),media=C.extractMedia(h,r.url),ifr=C.extractIframes(h,r.url),related=C.parsePosts(h,r.url),i;related=related.filter(function(v){return C.pathOf(v.url)!==C.pathOf(r.url);});for(i=0;i<ifr.length&&media.length<8;i++){var ih=C.rawFetch(ifr[i],{timeout:7000,ref:r.url}),im=C.extractMedia(ih,ifr[i]),j;for(j=0;j<im.length;j++){im[j].route='iframe';media.push(im[j]);}}media=C.unique(media,function(v){return v.url;});x={ok:r.ok,url:r.url,title:title,cover:cover,date:date,categories:cats,tags:tags,images:imgs,paragraphs:paras,media:media,iframes:ifr,related:related.slice(0,16),commentCount:''};m=h.match(/(\d+)\s*(?:条)?评论/);if(m)x.commentCount=m[1];return x;};
  C.resolvePlay=function(url){var x=C.detail(url),m=x.media||[],names=[],urls=[],headers=[],i;if(m.length===1){C.diag('play','direct-'+m[0].route,m[0].url,'');return C.video(m[0].url,m[0].ref||x.url);}if(m.length>1){for(i=0;i<m.length&&i<8;i++){urls.push(m[i].url);names.push((m[i].route==='iframe'?'内嵌':'线路')+' '+(i+1));headers.push({'Referer':m[i].ref||x.url,'User-Agent':C.ua});}C.diag('play','multi-direct',x.url,'');return JSON.stringify({urls:urls,names:names,headers:headers});}C.diag('play','video-sniff',x.url,'no structured media');return'video://'+x.url;};

  C.parseComments=function(html,base){var s=C.s(html),re=/<li\b[^>]*id=["']comment-(\d+)["'][^>]*>([\s\S]*?)(?=<li\b[^>]*id=["']comment-|<\/ol>|<\/ul>)/ig,m,out=[],b,author,content,time,img,am,cm,tm;while((m=re.exec(s))&&out.length<80){b=m[2];am=b.match(/(?:comment-author|fn)[^>]*>([\s\S]*?)<\//i)||b.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i);author=am?C.strip(am[1]):'瓜友';cm=b.match(/class=["'][^"']*comment-content[^"']*["'][^>]*>([\s\S]*?)(?:<\/div>|<\/p>)/i);content=cm?C.strip(cm[1]):'';if(!content){cm=b.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);content=cm?C.strip(cm[1]):'';}tm=b.match(/20\d{2}[年\-\/.]\d{1,2}[月\-\/.]\d{1,2}(?:日)?(?:\s+\d{1,2}:\d{2})?/);time=tm?tm[0]:'';img=C.firstImage(b,base);if(content)out.push({id:m[1],author:author,content:content,time:time,img:C.image(img,base)});}return out;};
  C.comments=function(url){var r=C.request(url,{route:'comments',timeout:12000});return{ok:r.ok,url:r.url,comments:r.ok?C.parseComments(r.html,r.url):[]};};

  C.addHistory=function(p){var a=C.readList(C.historyKey),out=[p],i;for(i=0;i<a.length&&out.length<C.maxHistory;i++)if(C.pathOf(a[i].url)!==C.pathOf(p.url))out.push(a[i]);C.writeList(C.historyKey,out);};
  C.isFavorite=function(url){var a=C.readList(C.favoriteKey),i;for(i=0;i<a.length;i++)if(C.pathOf(a[i].url)===C.pathOf(url))return true;return false;};
  C.toggleFavorite=function(p){var a=C.readList(C.favoriteKey),out=[],found=false,i;for(i=0;i<a.length;i++){if(C.pathOf(a[i].url)===C.pathOf(p.url)){found=true;continue;}out.push(a[i]);}if(!found)out.unshift(p);if(out.length>C.maxFavorites)out=out.slice(0,C.maxFavorites);C.writeList(C.favoriteKey,out);return!found;};
  C.clearHistory=function(){C.writeList(C.historyKey,[]);};
  C.clearFavorites=function(){C.writeList(C.favoriteKey,[]);};
  return C;
})();
