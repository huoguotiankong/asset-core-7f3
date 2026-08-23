/* MyAv Remote Core 0.1.0-test.1 - javlist.me provider/parser layer */
var MyAvCore=(function(){
  var C={};
  C.version='0.1.0-test.1';
  C.build=10101;
  C.base='https://javlist.me';
  C.ua='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  C.favoritePath='hiker://files/rules/MyAv/favorites.json';
  C.historyPath='hiker://files/rules/MyAv/history.json';
  C.homeCacheKey='myav_home_html_v1';
  C.homeCacheTsKey='myav_home_html_ts_v1';

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.decode=function(v){return C.s(v).replace(/&amp;/ig,'&').replace(/&#38;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/');};
  C.strip=function(v){return C.trim(C.decode(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' '));};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.base;};
  C.abs=function(u,base){u=C.decode(C.trim(u));base=base||C.base;if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(u.charAt(0)==='?')return String(base).replace(/[?#].*$/,'')+u;var o=C.origin(base);if(u.charAt(0)==='/')return o+u;if(/^javascript:/i.test(u)||u==='#'||u.charAt(0)==='#')return'';return String(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;};
  C.image=function(u,ref){u=C.abs(u,ref||C.base);if(!u)return'';return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.base+'/'});};
  C.headers=function(ref){return{'User-Agent':C.ua,'Referer':ref||C.base+'/','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.isBadHtml=function(h){var s=C.s(h),l=s.toLowerCase();return s.length<200||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0;};
  C.fetchHtml=function(url,timeout){var h='';try{h=C.s(fetch(url,{timeout:timeout||9000,headers:C.headers(url)}));}catch(e){h='';}if(C.isBadHtml(h)){try{h=C.s(fetchCodeByWebView(url,{timeout:14000,headers:C.headers(url)}));}catch(e2){}}return h;};
  C.fetchRendered=function(url){try{return C.s(fetchCodeByWebView(url,{timeout:15000,headers:C.headers(url)}));}catch(e){return'';}};
  C.page=function(path,params){var title='MyAv';try{if(MY_RULE&&MY_RULE.title)title=MY_RULE.title;}catch(e){}var a=['rule='+encodeURIComponent(title),'simple=true'];params=params||{};for(var k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));return'hiker://page/'+path+'?'+a.join('&');};

  C.allAnchors=function(html,base){var s=C.s(html),out=[],re=/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m;while((m=re.exec(s))){var text=C.strip(m[4]),href=C.abs(m[2],base||C.base);if(!href||!text)continue;out.push({text:text,href:href,raw:m[0],index:m.index});}return out;};
  C.findLink=function(html,label,base){var a=C.allAnchors(html,base),i,exact='',fuzzy='';for(i=0;i<a.length;i++){if(a[i].text===label){exact=a[i].href;break;}if(!fuzzy&&a[i].text.indexOf(label)>=0)fuzzy=a[i].href;}return exact||fuzzy||'';};
  C.segment=function(html,start,end){var s=C.s(html),i=s.indexOf(start);if(i<0)return'';var j=end?s.indexOf(end,i+start.length):-1;if(j<0)j=Math.min(s.length,i+16000);return s.substring(i,j);};
  C.homeHtml=function(force){var now=new Date().getTime(),old=getItem(C.homeCacheKey,''),ts=parseInt(getItem(C.homeCacheTsKey,'0'),10)||0;if(!force&&old&&now-ts<20*60*1000)return old;var h=C.fetchHtml(C.base+'/');if(h&&h.length>500){setItem(C.homeCacheKey,h);setItem(C.homeCacheTsKey,String(now));return h;}return old||h;};

  C.sectionName=function(id){return id==='western'?'欧美':id==='domestic'?'国产':id==='uncensored'?'无码':'有码';};
  C.sectionUrl=function(id){if(id==='western')return C.base+'/western.java';if(id==='domestic')return C.base+'/domestic_index.js';if(id==='uncensored'){var h=C.homeHtml(false),u=C.findLink(C.segment(h,'其它:','首页'),'無碼流出',C.base)||C.findLink(h,'无码破解',C.base);return u||C.base+'/default.cpp';}return C.base+'/default.cpp';};

  C.page2Template=function(html,base){var a=C.allAnchors(html,base),i,u;for(i=0;i<a.length;i++){u=a[i].href;if(a[i].text==='2'&&/[?&]page=2(?:&|$)/.test(u))return u;}for(i=0;i<a.length;i++){u=a[i].href;if(/[?&]page=2(?:&|$)/.test(u))return u;}return'';};
  C.paginatedUrl=function(base,page,baseHtml){page=parseInt(page,10)||1;if(page<=1)return base;var u=C.page2Template(baseHtml||'',base);if(!u&&/[?&]page=\d+/.test(base))u=base;if(u)return u.replace(/([?&]page=)\d+/,'$1'+page);return base+(base.indexOf('?')>=0?'&':'?')+'page='+page;};
  C.hasNext=function(html){var a=C.allAnchors(html,C.base),i;for(i=0;i<a.length;i++)if(a[i].text==='下一页'||a[i].text==='下一頁')return true;return false;};

  C.attrImage=function(raw,base){var m=C.s(raw).match(/(?:data-original|data-src|data-lazy-src|src)=["']([^"']+)["']/i);return m?C.abs(m[1],base):'';};
  C.codeFromText=function(text){var s=C.s(text),m=s.match(/\b(?:fc2[-_ ]?(?:ppv[-_ ]?)?\d{4,}|[a-z]{2,12}[-_. ]?\d{2,6}(?:[-_.][a-z0-9]+)*)\b/i);return m?C.trim(m[0]).replace(/[ _]+/g,'-'):'';};
  C.parseMovies=function(html,section){var s=C.s(html),out=[],seen={},re=/<a\b([^>]*)href=["']([^"']*\/c\/[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m;while((m=re.exec(s))){var href=C.abs(m[2],C.base);if(!href||seen[href])continue;var inner=m[4],title=C.strip(inner),attrTitle=(m[1]+' '+m[3]).match(/title=["']([^"']+)["']/i);if(!title&&attrTitle)title=C.decode(attrTitle[1]);var from=Math.max(0,m.index-1300),to=Math.min(s.length,re.lastIndex+1800),ctx=s.substring(from,to),img='',ims=ctx.match(/<img\b[^>]*(?:data-original|data-src|data-lazy-src|src)=["'][^"']+["'][^>]*>/ig)||[],ii;for(ii=ims.length-1;ii>=0;ii--){img=C.attrImage(ims[ii],href);if(img&&!/(logo|favicon|avatar|loading|blank)/i.test(img))break;}var dm=ctx.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/),date=dm?dm[0].replace(/[\/.]/g,'-'):'',code=C.codeFromText(ctx),flags=[];if(/磁力下载|磁力下載|磁力资源/.test(ctx))flags.push('磁力');if(/无码破解|無碼流出/.test(ctx))flags.push('无码');if(/高清资源|高清資源|\bHD\b/.test(ctx))flags.push('高清');if(/中文字幕|字幕/.test(ctx))flags.push('字幕');if(!title||title.length<2)title=code||'影片';seen[href]=1;out.push({href:href,key:href,title:title,code:code,date:date,section:section||'',sectionName:C.sectionName(section||'normal'),flags:flags,img:C.image(img,href),rawImg:img});}return out;};

  C.filterGroups=function(html,base){var groups={category:[],years:[],tags:[],other:[]},segs=[['category','分类:','年份:'],['years','年份:','标签:'],['tags','标签:','其它:'],['other','其它:','首页']],i,a,j,seen,k;for(i=0;i<segs.length;i++){a=C.allAnchors(C.segment(html,segs[i][1],segs[i][2]),base);seen={};for(j=0;j<a.length;j++){k=a[j].text+'|'+a[j].href;if(seen[k])continue;seen[k]=1;if(a[j].text==='更多选项'||a[j].text==='更多'||a[j].text==='更多選項')continue;groups[segs[i][0]].push(a[j]);}}return groups;};

  C.titleFromHtml=function(html){var m=C.s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i),t=m?C.strip(m[1]):'';return t.replace(/^MyAv番号查询--/i,'').replace(/^MyAv番号查詢--/i,'');};
  C.fieldText=function(html,label,nextLabel){var seg=C.segment(html,label,nextLabel),t=C.strip(seg);if(!t)return'';t=t.replace(new RegExp('^.*?'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),'');return C.trim(t.replace(/^[:：|\s]+/,''));};
  C.linksBetween=function(html,start,end){var seg=C.segment(html,start,end),a=C.allAnchors(seg,C.base),out=[],seen={},i;for(i=0;i<a.length;i++){if(seen[a[i].href])continue;seen[a[i].href]=1;out.push({name:a[i].text,href:a[i].href});}return out;};
  C.previewImages=function(html,url){var s=C.s(html),p=s.search(/预览图片|預覽圖片|sample/i);if(p>=0)s=s.substring(p);var out=[],seen={},re=/(?:https?:)?\/\/[^"'<>\s]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\s]*)?|(?:data-original|data-src|src)=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/ig,m,u;while((m=re.exec(s))){u=m[1]||m[0];u=u.replace(/^(?:data-original|data-src|src)=["']/i,'').replace(/["']$/,'');u=C.abs(u,url);if(!u||seen[u]||/(logo|favicon|avatar|loading|blank|icon)/i.test(u))continue;seen[u]=1;out.push(u);if(out.length>=80)break;}return out;};
  C.previewVideos=function(html,url){var s=C.decode(C.s(html)).replace(/\\\//g,'/'),out=[],seen={},re=/(https?:\/\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>]*)?)/ig,m,u;while((m=re.exec(s))){u=C.abs(m[1],url);if(!seen[u]){seen[u]=1;out.push(u);}}return out;};
  C.parseMagnets=function(html){var s=C.decode(C.s(html)),out=[],seen={},re=/(magnet:\?xt=urn:btih:[^\s"'<>]+)/ig,m,link,from,to,ctx,size,date,title,dm;while((m=re.exec(s))){link=C.decode(m[1]).replace(/&amp;/ig,'&');if(seen[link])continue;seen[link]=1;from=Math.max(0,m.index-800);to=Math.min(s.length,re.lastIndex+800);ctx=s.substring(from,to);size=(ctx.match(/\b\d+(?:\.\d+)?\s*(?:TB|GB|MB|KB)\b/i)||[''])[0];date=(ctx.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/)||[''])[0].replace(/[\/.]/g,'-');dm=link.match(/[?&]dn=([^&]+)/i);title='';if(dm){try{title=decodeURIComponent(dm[1].replace(/\+/g,' '));}catch(e){title=dm[1];}}if(!title){var tm=ctx.match(/\[([^\]\n]{2,100})\]\s*\[?\d+(?:\.\d+)?\s*(?:TB|GB|MB|KB)/i);if(tm)title=C.strip(tm[1]);}out.push({link:link,title:title||'磁力资源',size:size,date:date,hd:/高清|FHD|\bHD\b/i.test(ctx),sub:/中文字幕|字幕|\bCH\b/i.test(ctx)});}return out;};
  C.coverImage=function(html,url){var s=C.s(html),matches=[],re=/<img\b[^>]*(?:data-original|data-src|src)=["'][^"']+["'][^>]*>/ig,m,u;while((m=re.exec(s))){u=C.attrImage(m[0],url);if(!u||/(logo|favicon|avatar|loading|blank|icon)/i.test(u))continue;matches.push(u);}var i;for(i=0;i<matches.length;i++)if(/cover|poster|movie|jav|pics/i.test(matches[i]))return matches[i];return matches.length?matches[0]:'';};
  C.parseDetail=function(html,url){var title=C.titleFromHtml(html),d={href:url,key:url,title:title,code:'',date:'',duration:'',director:[],maker:[],series:[],category:[],actors:[],maleActors:[],tags:[],story:'',cover:'',img:'',samples:[],videos:[],magnets:[],html:html};var cm=title.match(/^\[([^\]]+)\]/);d.code=cm?C.trim(cm[1]):'';if(!d.code){var fs=C.fieldText(html,'番號:','发布时间:');d.code=C.codeFromText(fs)||C.codeFromText(title);}var dm=C.s(html).match(/发布时间:\s*(20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2})/i);d.date=dm?dm[1].replace(/[\/.]/g,'-'):'';var tm=C.s(html).match(/時長:\s*([^<|\n]{1,40})/i);d.duration=tm?C.strip(tm[1]):'';d.director=C.linksBetween(html,'导演:','片商:');d.maker=C.linksBetween(html,'片商:','系列:');d.series=C.linksBetween(html,'系列:','類別:');d.category=C.linksBetween(html,'類別:','演員:');d.actors=C.linksBetween(html,'演員:','男优:');d.maleActors=C.linksBetween(html,'男优:','TAG:');d.tags=C.linksBetween(html,'TAG:','故事簡介');var storySeg=C.segment(html,'故事簡介','预览视频');d.story=C.strip(storySeg.replace(/^.*?故事簡介[:：]?/i,''));d.cover=C.coverImage(html,url);d.img=C.image(d.cover,url);d.samples=C.previewImages(html,url);d.videos=C.previewVideos(html,url);d.magnets=C.parseMagnets(html);return d;};
  C.detail=function(url){var h=C.fetchHtml(url),d=C.parseDetail(h,url);if((!d.samples.length||!d.magnets.length)&&h){var wh=C.fetchRendered(url);if(wh&&wh.length>h.length/2){var w=C.parseDetail(wh,url);if(!d.samples.length&&w.samples.length)d.samples=w.samples;if(!d.magnets.length&&w.magnets.length)d.magnets=w.magnets;if(!d.videos.length&&w.videos.length)d.videos=w.videos;if(!d.cover&&w.cover){d.cover=w.cover;d.img=w.img;}d.renderedHtml=wh;}}return d;};

  C.indexDefs=function(){return[
    {name:'有码片商',label:'有码片商'},{name:'有码女优',label:'有码女优'},{name:'男优',label:'男优'},{name:'有码TAG',label:'有码TAG'},
    {name:'欧美片商',label:'欧美片商'},{name:'欧美女优',label:'欧美女优'},{name:'欧美TAG',label:'欧美TAG'},
    {name:'国产女优',label:'国产女优'},{name:'国产TAG',label:'国产TAG'}
  ];};
  C.indexUrl=function(label){return C.findLink(C.homeHtml(false),label,C.base);};
  C.parseIndex=function(html,url){var a=C.allAnchors(html,url),out=[],seen={},i,x,skip=/^(首页|上一页|下一页|最大页\d*|\d+|MyAv番号查询|分类▼|标签分类▼|有码热门▼|片商新番▼|搜索▼)$/;for(i=0;i<a.length;i++){x=a[i];if(skip.test(x.text)||x.text.length>80||seen[x.href])continue;if(x.href.indexOf('/c/')>=0)continue;if(x.href.indexOf('/cat.py')<0&&x.href.indexOf('default.cpp')<0&&x.href.indexOf('western')<0&&x.href.indexOf('domestic')<0)continue;seen[x.href]=1;out.push(x);}return out;};

  C.rankRoot=function(){return C.base+'/top100.php';};
  C.rankModes=function(html){var a=C.allAnchors(C.segment(html,'筛选:','首页'),C.rankRoot()),out=[],seen={},i;for(i=0;i<a.length;i++){if(!/(TOP20|周作品排名|月作品排名)/.test(a[i].text))continue;if(seen[a[i].href])continue;seen[a[i].href]=1;out.push(a[i]);}if(!out.length)out=[{text:'热门TOP20',href:C.rankRoot()}];return out;};
  C.rankNumber=function(ctx){var m=C.s(ctx).match(/top:\s*(\d+)/i);return m?parseInt(m[1],10):0;};

  C.searchRoot=function(kind){if(kind==='western')return C.base+'/western_search.java';if(kind==='domestic')return C.base+'/domestic_search.php';return C.base+'/search.php';};
  C.formEncode=function(obj){var a=[],k;for(k in obj)if(obj.hasOwnProperty(k))a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(obj[k])));return a.join('&');};
  C.parseSearchForm=function(html,base){var s=C.s(html),fm=s.match(/<form\b([^>]*)>([\s\S]*?)<\/form>/i);if(!fm)return null;var attrs=fm[1],body=fm[2],am=attrs.match(/action=["']([^"']*)["']/i),mm=attrs.match(/method=["']([^"']*)["']/i),action=C.abs(am?am[1]:'',base)||base,method=(mm?mm[1]:'GET').toUpperCase(),inputs={},qName='',re=/<input\b([^>]*)>/ig,m,nm,vm,tm,name,val,type;while((m=re.exec(body))){nm=m[1].match(/name=["']([^"']+)["']/i);if(!nm)continue;name=nm[1];vm=m[1].match(/value=["']([^"']*)["']/i);tm=m[1].match(/type=["']([^"']*)["']/i);val=vm?C.decode(vm[1]):'';type=(tm?tm[1]:'text').toLowerCase();inputs[name]=val;if(!qName&&(type==='text'||type==='search'||/key|word|search|query|q/i.test(name)))qName=name;}if(!qName){for(name in inputs)if(inputs.hasOwnProperty(name)&&!/token|csrf|submit|type/i.test(name)){qName=name;break;}}return{action:action,method:method,inputs:inputs,qName:qName};};
  C.search=function(kind,keyword,page){var root=C.searchRoot(kind),landing=C.fetchHtml(root),form=C.parseSearchForm(landing,root),html='',target=root,kw=C.trim(keyword);if(!kw)return{html:'',url:root,items:[],error:'EMPTY_KEYWORD'};if(form&&form.qName){form.inputs[form.qName]=kw;var body=C.formEncode(form.inputs);target=form.action;if(form.method==='POST'){try{html=C.s(fetch(target,{method:'POST',body:body,headers:{'User-Agent':C.ua,'Referer':root,'Content-Type':'application/x-www-form-urlencoded'},timeout:10000}));}catch(e){html='';}}else{target+=(target.indexOf('?')>=0?'&':'?')+body;html=C.fetchHtml(target);} }else{var guesses=['keyword','key','search','q'],gi;for(gi=0;gi<guesses.length&&!html;gi++){target=root+'?'+guesses[gi]+'='+encodeURIComponent(kw);html=C.fetchHtml(target,6500);if(C.parseMovies(html,kind).length)break;}}
    if(page&&parseInt(page,10)>1&&html){var pu=C.paginatedUrl(target,page,html);if(pu!==target){target=pu;html=C.fetchHtml(target);}}
    var items=C.parseMovies(html,kind);return{html:html,url:target,items:items,error:items.length?'':'NO_RESULTS_OR_FORM_MISMATCH',form:form};};

  C.readJson=function(path,def){try{var s=fetchPC(path);if(!s)return def;var j=JSON.parse(s);return j===undefined||j===null?def:j;}catch(e){return def;}};
  C.writeJson=function(path,obj){try{writeFile(path,JSON.stringify(obj));return true;}catch(e){return false;}};
  C.favoriteList=function(){var a=C.readJson(C.favoritePath,[]);return Object.prototype.toString.call(a)==='[object Array]'?a:[];};
  C.historyList=function(){var a=C.readJson(C.historyPath,[]);return Object.prototype.toString.call(a)==='[object Array]'?a:[];};
  C.isFavorite=function(key){var a=C.favoriteList(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].key===key)return true;return false;};
  C.toggleFavorite=function(item){var a=C.favoriteList(),out=[],found=false,i;for(i=0;i<a.length;i++){if(a[i]&&a[i].key===item.key){found=true;continue;}out.push(a[i]);}if(!found){item.savedAt=new Date().getTime();out.unshift(item);}if(out.length>500)out=out.slice(0,500);C.writeJson(C.favoritePath,out);return!found;};
  C.touchHistory=function(item){var a=C.historyList(),out=[],i;for(i=0;i<a.length;i++)if(!a[i]||a[i].key!==item.key)out.push(a[i]);item.visitedAt=new Date().getTime();out.unshift(item);if(out.length>300)out=out.slice(0,300);C.writeJson(C.historyPath,out);};

  C.magnetLongClicks=function(link){return[
    {title:'迅雷',js:$.toString(function(m){if(fetch('hiker://home@迅雷')==='null')return'toast://未安装 迅雷';return'hiker://page/diaoyong?rule=迅雷&page=fypage#'+m;},link)},
    {title:'PikPak',js:$.toString(function(m){if(fetch('hiker://home@PikPak')==='null')return'toast://未安装 PikPak';return'hiker://page/fxlj?rule=PikPak&realurl='+encodeURIComponent(m);},link)},
    {title:'123云盘',js:$.toString(function(m){if(fetch('hiker://home@123云盘')==='null')return'toast://未安装 123云盘';return'hiker://page/diaoyong?rule=123云盘&page=fypage&realurl='+encodeURIComponent(m);},link)},
    {title:'光鸭云盘',js:$.toString(function(m){if(fetch('hiker://home@光鸭云盘')==='null')return'toast://未安装 光鸭云盘';return'hiker://page/magnet?rule=光鸭云盘&realurl='+encodeURIComponent(m);},link)},
    {title:'复制磁力',js:$.toString(function(m){return'copy://'+m;},link)}
  ];};

  C.externalSites=function(){return[
    {name:'FC2磁力查询',url:'https://fc2-bt.top/'},
    {name:'18H次元漫画',url:'https://18manga.top/'},
    {name:'欧美独立站',url:'https://au8.top/'},
    {name:'小说区',url:'https://y7y.top/'},
    {name:'MyAv原站',url:C.base+'/'}
  ];};

  return C;
})();
