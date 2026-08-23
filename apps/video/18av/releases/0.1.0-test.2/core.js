/* 18AV Remote Core 0.1.0-test.2 */
var AV18Core=(function(){
  var C={};
  C.version='0.1.0-test.2';
  C.build=10102;
  C.videoBase='https://18av.mm-cg.com';
  C.comicBase='https://18h.mm-cg.com';
  C.lang='/zh';
  C.ua='Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/139.0 Mobile Safari/537.36';
  C.favoriteKey='av18_favorites_v1';
  C.historyKey='av18_history_v1';
  C.diagKey='av18_diag_v1';
  C.fontKey='av18_novel_font_v1';
  C.maxFavorites=100;
  C.maxHistory=100;
  C.bootstrap='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/18av/bootstrap_test_v2_b10102.js?v=10102';

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.clean=function(v){var s=C.trim(v);return s==='null'||s==='undefined'?'':s;};
  C.decode=function(v){return C.s(v).replace(/\\u0026/ig,'&').replace(/\\\//g,'/').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;|&#x27;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');};
  C.strip=function(v){return C.trim(C.decode(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ')).replace(/[\t\r ]+/g,' ').replace(/\n\s+/g,'\n'));};
  C.hash=function(s){s=C.s(s);var h=0,i;for(i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h);};
  C.q=function(v){return encodeURIComponent(C.s(v));};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';};
  C.abs=function(u,base){u=C.decode(C.trim(u));base=base||C.videoBase+C.lang+'/';if(!u||/^data:|^javascript:|^#/.test(u))return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;var o=C.origin(base)||C.videoBase;if(u.charAt(0)==='/')return o+u;if(u.charAt(0)==='?')return C.s(base).replace(/[?#].*$/,'')+u;return C.s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;};
  C.attr=function(tag,name){var m=C.s(tag).match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']*)["\\\']','i'));return m?C.decode(m[1]):'';};
  C.meta=function(html,key){var k=C.s(key).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),m=C.s(html).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+k+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));if(!m)m=C.s(html).match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+k+'["\\\']','i'));return m?C.decode(m[1]):'';};
  C.unique=function(a,keyFn){var o=[],s={},i,k;for(i=0;i<(a||[]).length;i++){k=keyFn?keyFn(a[i]):C.s(a[i]);if(!k||s[k])continue;s[k]=1;o.push(a[i]);}return o;};
  C.ruleTitle=function(){try{return MY_RULE&&MY_RULE.title?MY_RULE.title:'18AV';}catch(e){return'18AV';}};
  C.param=function(name,def){var u='';try{u=C.s(MY_URL);}catch(e){}var m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));if(!m)return def===undefined?'':def;try{return decodeURIComponent(m[1]);}catch(e2){return m[1];}};
  C.pageNo=function(){var p=1;try{p=parseInt(MY_PAGE||1,10)||1;}catch(e){p=parseInt(C.param('page','1'),10)||1;}return p<1?1:p;};
  C.page=function(path,params){var a=['rule='+encodeURIComponent(C.ruleTitle()),'simple=true'],k;params=params||{};for(k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));return'hiker://page/'+path+'?'+a.join('&');};
  C.headers=function(ref,accept){return{'User-Agent':C.ua,'Referer':ref||C.videoBase+C.lang+'/','Accept':accept||'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.image=function(u,ref){u=C.abs(u,ref||C.videoBase+C.lang+'/');if(!u)return'';return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.origin(u)+'/'});};
  C.video=function(u,ref){u=C.clean(u);if(!u)return'';return u+';{Referer@'+(ref||C.videoBase+C.lang+'/')+'&&User-Agent@'+C.ua+'}#isVideo=true#';};
  C.diag=function(stage,route,url,error,extra){var x={time:new Date().getTime(),stage:C.clean(stage),route:C.clean(route),url:C.clean(url),error:C.clean(error),version:C.version,build:C.build,extra:extra||{}};try{setItem(C.diagKey,JSON.stringify(x));}catch(e){}return x;};
  C.lastDiag=function(){try{return JSON.parse(getItem(C.diagKey,'{}'))||{};}catch(e){return{};}};

  /* Do not surface sexual content involving minors, non-consensual acts, or leaked/private material. */
  C.restrictedText=function(v){var s=C.strip(v).toLowerCase();if(!s)return false;var p=[/未成年|未滿18|未满18|幼女|幼童|小学生|小學生|國中生|国中生|初中生|高中生|蘿莉|萝莉|loli|lolicon|兒童色情|儿童色情|童顏|童颜/,/強姦|强奸|輪姦|轮奸|迷姦|迷奸|性侵|強暴|强暴|非自願|非自愿|偷拍|盜攝|盗摄|私密(?:照|視頻|视频|影片|影像).*?(?:泄露|外流|流出)|(?:泄露|外流|流出).*?私密|報復性色情|报复性色情|裸照(?:泄露|外流)/];for(var i=0;i<p.length;i++)if(p[i].test(s))return true;return false;};
  C.safeItem=function(x){return x&&!C.restrictedText([x.title||'',x.name||'',x.desc||''].join(' '));};
  C.safeList=function(a){var o=[],i;for(i=0;i<(a||[]).length;i++)if(C.safeItem(a[i]))o.push(a[i]);return o;};

  C.rawFetch=function(url,opt){opt=opt||{};try{return C.s(fetch(url,{timeout:opt.timeout||10000,headers:C.headers(opt.ref||url,opt.accept),redirect:true}));}catch(e){C.diag('request',opt.route||'fetch',url,C.s(e));return'';}};
  C.isHtml=function(h){var s=C.s(h),l=s.toLowerCase();if(s.length<300)return false;if(l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0)return false;return /18av|18h|mm-cg\.com|<html|<!doctype/i.test(s);};
  C.request=function(url,opt){opt=opt||{};url=C.abs(url,opt.ref||C.videoBase+C.lang+'/');var h=C.rawFetch(url,opt),ok=C.isHtml(h);C.diag(ok?'ok':'invalid-html',opt.route||'html',url,ok?'':'invalid html',{len:h.length});return{ok:ok,url:url,html:h};};

  C.typeOfUrl=function(u){u=C.s(u).toLowerCase();if(/\/chinese_categorylist\//.test(u))return'genre';if(/18h\.mm-cg\.com|\/18h_|\/doujin_/.test(u))return'comic';if(/\/novel_/.test(u))return'novel';if(/\/(?:cg|cwp)_/.test(u))return'photo';return'video';};
  C.contentLink=function(u){return /\/(?:chinese|censored|uncensored|amateurjav|reducing-mosaic|animation|censoredanimation|uncensoredanimation|tdanimation|dt)_content\//i.test(u)||/\/(?:cg|cwp|novel|18h|doujin)_content\//i.test(u);};
  C.categoryLink=function(u){return /\/(?:chinese|censored|uncensored|amateurjav|reducing-mosaic|animation|censoredanimation|uncensoredanimation|tdanimation|dt|cg|cwp|novel|18h|doujin)_(?:random|list|search|makersr|category|categorylist)\//i.test(u)||/\/content_news\//i.test(u);};
  C.context=function(h,idx,b,a){h=C.s(h);return h.substring(Math.max(0,idx-(b||700)),Math.min(h.length,idx+(a||1700)));};
  C.firstImage=function(raw,base){var re=/<img\b([^>]*)>/ig,m,u='';while((m=re.exec(C.s(raw)))){u=C.attr(m[1],'data-original')||C.attr(m[1],'data-src')||C.attr(m[1],'data-lazy-src')||C.attr(m[1],'data-echo')||C.attr(m[1],'src');u=C.abs(u,base);if(u&&!/logo|favicon|icon[-_.]|emoji|loading|placeholder|banner|ads?\b/i.test(u))return u;}return'';};
  C.dateFrom=function(raw){var s=C.strip(raw),m=s.match(/20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/);return m?m[0]:'';};
  C.pageCountFrom=function(title,raw){var m=(C.s(title)+' '+C.strip(raw)).match(/[\[(（]\s*(\d{1,4})\s*p\s*[\])）]/i);return m?parseInt(m[1],10)||0:0;};

  C.parseItems=function(html,base,forceType){var s=C.s(html),re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,o=[],seen={},u,t,ctx,img,date,type,pages,attrText;while((m=re.exec(s))&&o.length<90){u=C.abs(m[2],base);if(!u||seen[u]||!C.contentLink(u))continue;attrText=m[1]+' '+m[3];t=C.clean(C.attr(attrText,'title')||C.attr(attrText,'aria-label')||C.strip(m[4]));ctx=C.context(s,m.index,900,1800);if(!t||t.length<2){var hm=ctx.match(/<h[1-4][^>]*>[\s\S]{0,500}?<a\b[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/i);if(hm)t=C.strip(hm[1]);}if(!t||t.length<2||t.length>260)continue;type=forceType||C.typeOfUrl(u);img=C.firstImage(m[4],base)||C.firstImage(ctx,base);date=C.dateFrom(ctx);pages=C.pageCountFrom(t,ctx);seen[u]=1;o.push({url:u,title:t,img:img,date:date,type:type,pages:pages,desc:(pages?pages+'页':'')+(date?(pages?' · ':'')+date:'')});}return C.safeList(o);};

  C.parseNav=function(html,base){var s=C.s(html),re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,o=[],seen={},u,n,t;while((m=re.exec(s))&&o.length<120){u=C.abs(m[2],base);n=C.clean(C.strip(m[4]));if(!u||!n||seen[u]||!C.categoryLink(u))continue;if(C.restrictedText(n))continue;t=C.typeOfUrl(u);seen[u]=1;o.push({name:n,url:u,type:t});}return o;};

  C.staticNav=function(){return [
    {group:'视频',name:'全部影片',icon:'🎞️',type:'video',url:C.videoBase+C.lang+'/'},
    {group:'视频',name:'中文字幕',icon:'🈶',type:'video',url:C.videoBase+C.lang+'/chinese_random/all/index.html'},
    {group:'视频',name:'影片类别库',icon:'🧭',type:'genre',url:C.videoBase+C.lang+'/chinese_categorylist/list/index.html'},
    {group:'视频',name:'有码 AV',icon:'🎬',type:'video',url:C.videoBase+C.lang+'/censored_random/all/index.html'},
    {group:'视频',name:'无码 AV',icon:'✨',type:'video',url:C.videoBase+C.lang+'/uncensored_random/all/index.html'},
    {group:'视频',name:'素人 AV',icon:'📹',type:'video',url:C.videoBase+C.lang+'/amateurjav_random/all/index.html'},
    {group:'视频',name:'无码破解',icon:'🧩',type:'video',url:C.videoBase+C.lang+'/reducing-mosaic_random/all/index.html'},
    {group:'视频',name:'H 动画',icon:'🎨',type:'video',url:C.videoBase+C.lang+'/animation_random/all/index.html'},
    {group:'视频',name:'有码动画',icon:'🧿',type:'video',url:C.videoBase+C.lang+'/CensoredAnimation_random/all/index.html'},
    {group:'视频',name:'无码动画',icon:'🌌',type:'video',url:C.videoBase+C.lang+'/UncensoredAnimation_random/all/index.html'},
    {group:'视频',name:'3D 动画',icon:'🧊',type:'video',url:C.videoBase+C.lang+'/tdAnimation_random/all/index.html'},
    {group:'视频',name:'国产自拍',icon:'📱',type:'video',url:C.videoBase+C.lang+'/dt_random/all/index.html'},
    {group:'漫画',name:'18H 长篇',icon:'📚',type:'comic',url:C.comicBase+C.lang+'/18H_random/all/index.html'},
    {group:'漫画',name:'18H 短篇·同人',icon:'📖',type:'comic',url:C.comicBase+C.lang+'/doujin_random/all/index.html'},
    {group:'写真',name:'写真图片',icon:'🖼️',type:'photo',url:C.videoBase+C.lang+'/cg_random/all/index.html'},
    {group:'写真',name:'国产写真',icon:'📸',type:'photo',url:C.videoBase+C.lang+'/cwp_random/all/index.html'},
    {group:'小说',name:'小说',icon:'📝',type:'novel',url:C.videoBase+C.lang+'/novel_random/all/index.html'}
  ];};

  C.nav=function(){var base=C.staticNav(),r=C.request(C.videoBase+C.lang+'/',{route:'nav'}),dyn=r.ok?C.parseNav(r.html,r.url):[],r2=C.request(C.comicBase+C.lang+'/',{route:'comic-nav'}),dyn2=r2.ok?C.parseNav(r2.html,r2.url):[],all=base.concat(dyn).concat(dyn2),seen={},o=[],i,x,k;for(i=0;i<all.length;i++){x=all[i];if(!C.safeItem(x))continue;k=x.url;if(seen[k])continue;seen[k]=1;if(!x.group)x.group=x.type==='comic'?'漫画':x.type==='photo'?'写真':x.type==='novel'?'小说':'视频';o.push(x);}return o;};

  C.genres=function(){var u=C.videoBase+C.lang+'/chinese_categorylist/list/index.html',r=C.request(u,{route:'genres'}),a=[],re,m,n,href,seen={};if(!r.ok)return{ok:false,url:u,items:[]};re=/<a\b([^>]*)href\s*=\s*["']([^"']*\/chinese_category\/[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig;while((m=re.exec(r.html))&&a.length<800){href=C.abs(m[2],r.url);n=C.clean(C.strip(m[4]));if(!href||!n||seen[href]||C.restrictedText(n))continue;seen[href]=1;a.push({name:n,title:n,url:href,type:'video'});}return{ok:true,url:r.url,items:a};};

  C.pageUrl=function(url,page){page=parseInt(page,10)||1;if(page<=1)return url;var u=C.s(url);if(/\/index\.html(?:[?#].*)?$/i.test(u)&&/_random\//i.test(u))return u.replace(/_random\/([^/]+)\/index\.html/i,'_list/$1/'+page+'.html');if(/\/\d+\.html(?:[?#].*)?$/i.test(u))return u.replace(/\/\d+\.html(?:[?#].*)?$/i,'/'+page+'.html');return u;};
  C.feed=function(url,type,page){var u=C.pageUrl(url,page),r=C.request(u,{route:'feed-'+type});return{ok:r.ok,url:r.url,html:r.html,items:r.ok?C.parseItems(r.html,r.url,type):[]};};

  C.extractAllImages=function(html,base){var s=C.s(html),re=/<img\b([^>]*)>/ig,m,a=[],u,w,h;while((m=re.exec(s))){u=C.attr(m[1],'data-original')||C.attr(m[1],'data-src')||C.attr(m[1],'data-lazy-src')||C.attr(m[1],'data-echo')||C.attr(m[1],'src');u=C.abs(u,base);if(!u||/logo|favicon|emoji|loading|placeholder|avatar|banner|ads?\b|qrcode|qr-code/i.test(u))continue;w=parseInt(C.attr(m[1],'width')||'0',10)||0;h=parseInt(C.attr(m[1],'height')||'0',10)||0;if(w&&h&&w<180&&h<180)continue;a.push(u);}var jsRe=/(https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+?\.(?:jpe?g|png|webp|gif)(?:\?[^"'\\\s<]*)?)/ig,jm;while((jm=jsRe.exec(s))&&a.length<400)a.push(C.decode(jm[1]));return C.unique(a);};
  C.extractMedia=function(html,base){var s=C.decode(C.s(html)),a=[],re=/(https?:\/\/[^"'\s<>\\]+\.(?:m3u8|mp4)(?:\?[^"'\s<>\\]*)?)/ig,m;while((m=re.exec(s))&&a.length<20)a.push({url:m[1],label:/m3u8/i.test(m[1])?'HLS':'MP4'});var src=/<(?:video|source)\b[^>]*src=["']([^"']+)["']/ig;while((m=src.exec(s))&&a.length<20)a.push({url:C.abs(m[1],base),label:'媒体'});return C.unique(a,function(x){return x.url;});};
  C.extractIframes=function(html,base){var re=/<iframe\b[^>]*src=["']([^"']+)["']/ig,m,a=[];while((m=re.exec(C.s(html)))&&a.length<12){var u=C.abs(m[1],base);if(u)a.push(u);}return C.unique(a);};
  C.extractMetaRows=function(html){var s=C.s(html),o=[],seen={},re=/<(?:li|p|div|tr)[^>]*>([\s\S]{0,500}?)<\/(?:li|p|div|tr)>/ig,m,t,mm,k,v;while((m=re.exec(s))&&o.length<24){t=C.strip(m[1]);if(t.length<3||t.length>180)continue;mm=t.match(/^([^：:]{1,18})[：:]\s*(.{1,140})$/);if(!mm)continue;k=C.clean(mm[1]);v=C.clean(mm[2]);if(!k||!v||seen[k]||/home|search|page/i.test(k))continue;seen[k]=1;o.push({key:k,value:v});}return o;};
  C.titleFrom=function(html){return C.clean(C.meta(html,'og:title')||C.meta(html,'twitter:title')||(function(){var m=C.s(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);return m?C.strip(m[1]):'';})()||(function(){var m=C.s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);return m?C.strip(m[1]).replace(/\s*-\s*18AV[\s\S]*$/i,''):'';})());};
  C.coverFrom=function(html,base){var u=C.meta(html,'og:image')||C.meta(html,'twitter:image');return C.abs(u,base)||C.firstImage(html,base);};

  C.novelText=function(html){var s=C.s(html),start=-1,end=-1,m,body='';var markers=['小說名稱','小说名称','字體大小','字体大小'];for(var i=0;i<markers.length;i++){start=s.indexOf(markers[i]);if(start>=0)break;}if(start<0){m=s.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);start=m?m.index:0;}end=s.search(/(?:發佈頁網址|发布页网址|18 USC 2257|All clips are collected)/i);if(end<0)end=s.length;body=s.substring(start,end).replace(/<script\b[\s\S]*?<\/script>/ig,'').replace(/<style\b[\s\S]*?<\/style>/ig,'').replace(/<(?:nav|header|footer)\b[\s\S]*?<\/(?:nav|header|footer)>/ig,'').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<\/p\s*>/ig,'\n\n').replace(/<\/div\s*>/ig,'\n').replace(/<[^>]+>/g,' ');body=C.decode(body).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n');var lines=body.split('\n'),out=[],line;for(i=0;i<lines.length;i++){line=C.trim(lines[i]);if(!line)continue;if(/^(搜尋|搜索|18av首頁|全部影片|中文字幕|有碼AV|無碼|素人AV|H動畫|國產自拍|寫真圖片|國產寫真|小說|Home)$/i.test(line))continue;if(C.restrictedText(line))continue;out.push(line);}return out.join('\n\n');};

  C.detail=function(url,type){type=type||C.typeOfUrl(url);var r=C.request(url,{route:'detail-'+type});if(!r.ok)return{ok:false,url:r.url,type:type,title:'',cover:'',images:[],media:[],iframes:[],meta:[],text:''};var title=C.titleFrom(r.html),blocked=C.restrictedText(title);return{ok:true,blocked:blocked,url:r.url,type:type,title:title,cover:C.coverFrom(r.html,r.url),images:(type==='comic'||type==='photo')?C.extractAllImages(r.html,r.url):[],media:type==='video'?C.extractMedia(r.html,r.url):[],iframes:type==='video'?C.extractIframes(r.html,r.url):[],meta:type==='video'?C.extractMetaRows(r.html):[],text:type==='novel'?C.novelText(r.html):'',html:r.html};};

  C.searchCandidates=function(q,type,page){var b=type==='comic'?C.comicBase:C.videoBase,p=parseInt(page,10)||1,e=C.q(q),a=[];if(type==='novel')a=[b+C.lang+'/novel_search/all/'+e+'/'+p+'.html'];else if(type==='photo')a=[b+C.lang+'/cg_search/all/'+e+'/'+p+'.html',b+C.lang+'/cwp_search/all/'+e+'/'+p+'.html'];else if(type==='comic')a=[b+C.lang+'/18H_search/all/'+e+'/'+p+'.html',b+C.lang+'/doujin_search/all/'+e+'/'+p+'.html'];else a=[b+C.lang+'/search/all/'+e+'/'+p+'.html',b+C.lang+'/chinese_search/all/'+e+'/'+p+'.html',b+C.lang+'/censored_search/all/'+e+'/'+p+'.html',b+C.lang+'/uncensored_search/all/'+e+'/'+p+'.html'];return a;};
  C.search=function(q,type,page){q=C.trim(q);if(!q||C.restrictedText(q))return{ok:false,items:[],url:'',blocked:!!q};var urls=C.searchCandidates(q,type,page),all=[],i,r,items,used='';for(i=0;i<urls.length;i++){r=C.request(urls[i],{route:'search-'+type});if(!r.ok)continue;items=C.parseItems(r.html,r.url,type);if(items.length){used=r.url;all=all.concat(items);if(type!=='photo'&&type!=='comic'&&type!=='video')break;}}all=C.unique(all,function(x){return x.url;});return{ok:all.length>0,items:all,url:used,blocked:false};};

  C.readList=function(key){var a=[];try{a=JSON.parse(getItem(key,'[]'));}catch(e){}return Object.prototype.toString.call(a)==='[object Array]'?a:[];};
  C.writeList=function(key,a){try{setItem(key,JSON.stringify(a||[]));}catch(e){}return a||[];};
  C.addHistory=function(x){if(!C.safeItem(x))return;var a=C.readList(C.historyKey),o=[x],i;for(i=0;i<a.length&&o.length<C.maxHistory;i++)if(a[i]&&a[i].url!==x.url)o.push(a[i]);C.writeList(C.historyKey,o);};
  C.isFavorite=function(u){var a=C.readList(C.favoriteKey),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url===u)return true;return false;};
  C.toggleFavorite=function(x){var a=C.readList(C.favoriteKey),o=[],found=false,i;for(i=0;i<a.length;i++){if(a[i]&&a[i].url===x.url){found=true;continue;}if(o.length<C.maxFavorites-1)o.push(a[i]);}if(!found&&C.safeItem(x))o.unshift(x);C.writeList(C.favoriteKey,o);return!found;};
  C.clearFavorites=function(){C.writeList(C.favoriteKey,[]);};
  C.clearHistory=function(){C.writeList(C.historyKey,[]);};
  C.fontSize=function(){var n=parseInt(getItem(C.fontKey,'18'),10)||18;return n<14?14:n>26?26:n;};
  C.setFontSize=function(n){n=parseInt(n,10)||18;if(n<14)n=14;if(n>26)n=26;setItem(C.fontKey,String(n));return n;};

  C.resolvePlay=function(detailUrl){var x=C.detail(detailUrl,'video'),i;if(!x.ok||x.blocked)return'toast://播放信息读取失败';if(x.media.length)return C.video(x.media[0].url,x.url);for(i=0;i<x.iframes.length;i++)if(x.iframes[i])return'video://'+x.iframes[i];return'video://'+x.url;};
  return C;
})();
