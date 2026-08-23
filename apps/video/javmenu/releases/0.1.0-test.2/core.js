/* JavMenu Core 0.1.0-test.2 - current DOM contracts + semantic adapters */
var JavMenuCore=(function(){
  var C={version:'0.1.0-test.2',build:10102};
  C.base='https://javmenu.com';
  C.fallbackBase='https://javmenu.org';
  C.homePath='/zh';
  C.ua='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  C.videoFavPath='hiker://files/rules/JavMenu/favorites_videos.json';
  C.peopleFavPath='hiker://files/rules/JavMenu/favorites_people.json';
  C.diagKey='javmenu_diag_last';

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.decodeHtml=function(v){return C.s(v).replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&lt;/ig,'<').replace(/&gt;/ig,'>').replace(/&#x2F;|&#47;/ig,'/');};
  C.strip=function(v){return C.trim(C.decodeHtml(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' '));};
  C.safeDecode=function(v){try{return decodeURIComponent(C.s(v));}catch(e){return C.s(v);}};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^/]+)/i);return m?m[1]:C.base;};
  C.isSiteOrigin=function(o){return o===C.base||o===C.fallbackBase;};
  C.abs=function(u,base){u=C.decodeHtml(C.trim(u)).replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/');base=base||C.base;if(!u||/^(javascript:|data:|#)/i.test(u))return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;var o=C.origin(base);if(u.charAt(0)==='/')return o+u;return String(base).replace(/[?#].*$/,'').replace(/[^/]*$/,'')+u;};
  C.attr=function(tag,name){var re=new RegExp('\\b'+name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'),m=C.s(tag).match(re);if(m)return C.decodeHtml(m[1]);re=new RegExp('\\b'+name+'\\s*=\\s*([^\\s>]+)','i');m=C.s(tag).match(re);return m?C.decodeHtml(m[1]):'';};
  C.meta=function(html,key,val){var re=/<meta\b[^>]*>/ig,m,t,a,b;while((m=re.exec(C.s(html)))){t=m[0];a=C.attr(t,key);if(C.s(a).toLowerCase()===C.s(val).toLowerCase()){b=C.attr(t,'content');if(b)return C.trim(b);}}return'';};
  C.canonical=function(html){var re=/<link\b[^>]*>/ig,m,t;while((m=re.exec(C.s(html)))){t=m[0];if(/\brel\s*=\s*["']canonical["']/i.test(t)){var h=C.attr(t,'href');if(h)return C.abs(h,C.base);}}return'';};
  C.badImage=function(u){var x=C.s(u).toLowerCase();return !x||/(button_logo|no_preview|loading\.gif|loading\.png|watermark|placeholder|favicon|logo(?:\.|_|\/)|spinner|blank\.|transparent\.|avatar-default|default-avatar)/i.test(x);};
  C.image=function(u,ref){u=C.abs(u,ref||C.base);if(!u||C.badImage(u))return'';if(u.indexOf('@headers=')>=0)return u;return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.base+'/'});};
  C.page=function(view,params){var a=['rule='+encodeURIComponent(MY_RULE.title),'simple=true','jm_view='+encodeURIComponent(view||'home')],k;params=params||{};for(k in params){if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&String(params[k])!=='')a.push('jm_'+encodeURIComponent(k)+'='+encodeURIComponent(String(params[k])));}return'hiker://page/javmenuPage?'+a.join('&');};
  C.get=function(name,def){var v='';try{v=getParam('jm_'+name,'');}catch(e){v='';}if(!v&&typeof MY_PARAMS==='object'&&MY_PARAMS)v=MY_PARAMS['jm_'+name]||'';return v===undefined||v===null||String(v)===''?(def||''):C.safeDecode(v);};

  C.normalizeCode=function(v){var s=C.s(v).toUpperCase().replace(/[＿_\s]+/g,'-'),m=s.match(/FC2[^0-9]*(?:PPV[^0-9]*)?(\d{4,})/i);if(m)return'FC2-PPV-'+m[1];m=s.match(/([A-Z0-9]{2,14})[-](\d{2,8})/);if(m)return m[1]+'-'+m[2];m=s.match(/([A-Z]{2,10})(\d{3,7})/);if(m)return m[1]+'-'+m[2];return'';};
  C.codeFromHref=function(href){var u=C.safeDecode(C.s(href).replace(/[?#].*$/,'')),seg=u.split('/'),last='';while(seg.length&&!last)last=seg.pop();return C.normalizeCode(last);};
  C.extractCode=function(v){return C.normalizeCode(v)||C.codeFromHref(v);};
  C.isDetailHref=function(href){var u=C.abs(href,C.base),code=C.codeFromHref(u);if(!u||!C.isSiteOrigin(C.origin(u))||!code)return false;return !/(\/search|\/assets|\/static|\/login|\/register|\/rank|\/actor|\/genre|\/series|\/studio|\/maker|\/label|\/tag)/i.test(u);};

  C.diag=function(stage,url,ok,extra){var x={time:new Date().getTime(),version:C.version,build:C.build,stage:stage||'',url:C.s(url).replace(/([?&](?:token|auth|key|cookie)=)[^&]+/ig,'$1***'),ok:!!ok,extra:C.s(extra||'').slice(0,700)};try{setItem(C.diagKey,JSON.stringify(x));}catch(e){}return x;};
  C.isBadHtml=function(h){var s=C.s(h),l=s.toLowerCase();if(s.length<180)return true;return l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('cloudflare ray id')>=0;};
  C.headers=function(ref){return{'User-Agent':C.ua,'Referer':ref||C.base+'/','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.fetchOne=function(url,timeout){try{return C.s(fetch(url,{timeout:timeout||9000,headers:C.headers(C.origin(url)+'/')}));}catch(e){C.diag('network',url,false,e.message||e);return'';}};
  C.altUrl=function(url){var u=C.s(url);if(u.indexOf(C.base)===0)return C.fallbackBase+u.slice(C.base.length);if(u.indexOf(C.fallbackBase)===0)return C.base+u.slice(C.fallbackBase.length);return'';};
  C.fetchNetwork=function(url,timeout){var h=C.fetchOne(url,timeout);if(!C.isBadHtml(h)){C.diag('network',url,true,'primary len='+h.length);return h;}var alt=C.altUrl(url);if(alt){var h2=C.fetchOne(alt,timeout);if(!C.isBadHtml(h2)){C.diag('network-fallback',alt,true,'fallback len='+h2.length);return h2;}}return h;};
  C.fetchWeb=function(url){try{return C.s(fetchCodeByWebView(url,{timeout:13000,headers:C.headers(C.origin(url)+'/')}));}catch(e){C.diag('webview',url,false,e.message||e);return'';}};
  C.fetchHtml=function(url,opt){opt=opt||{};var mode=getItem('javmenu_request_mode','auto'),h='';if(mode!=='webview'&&!opt.webOnly){h=C.fetchNetwork(url,opt.timeout||9000);if(!C.isBadHtml(h))return h;if(mode==='network')return h;}h=C.fetchWeb(url);if(!C.isBadHtml(h)){C.diag('webview',url,true,'len='+h.length);return h;}var alt=C.altUrl(url);if(alt){h=C.fetchWeb(alt);if(!C.isBadHtml(h)){C.diag('webview-fallback',alt,true,'len='+h.length);return h;}}C.diag('fetch',url,false,'bad html len='+C.s(h).length);return h;};

  C.homeUrl=function(page){var u=C.base+C.homePath,p=Number(page||1);if(p>1)u+=(u.indexOf('?')>=0?'&':'?')+'page='+p;return u;};
  C.searchUrl=function(kw,page){var u=C.base+'/search?wd='+encodeURIComponent(C.trim(kw)),p=Number(page||1);if(p>1)u+='&page='+p;return u;};
  C.detailUrl=function(code){return C.base+'/'+encodeURIComponent(C.normalizeCode(code)||C.trim(code));};
  C.listUrl=function(raw,page){var u=C.abs(raw,C.base),p=Number(page||1);if(p<=1)return u;if(/[?&]page=\d+/i.test(u))return u.replace(/([?&]page=)\d+/i,'$1'+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p;};
  C.categories=function(){return[
    {group:'在线分类',name:'有码在线',path:'/zh/censored/online?order=publish',kind:'movies'},
    {group:'在线分类',name:'无码在线',path:'/zh/uncensored/online',kind:'movies'},
    {group:'在线分类',name:'FC2在线',path:'/zh/fc2/online',kind:'movies'},
    {group:'在线分类',name:'国产在线',path:'/zh/chinese/online',kind:'movies'},
    {group:'在线分类',name:'欧美在线',path:'/zh/western/online',kind:'movies'},
    {group:'在线分类',name:'成人动画',path:'/zh/hanime/online',kind:'movies'},
    {group:'排行榜',name:'日榜',path:'/zh/rank/censored/day',kind:'movies'},
    {group:'排行榜',name:'周榜',path:'/zh/rank/censored/week',kind:'movies'},
    {group:'排行榜',name:'月榜',path:'/zh/rank/censored/month',kind:'movies'},
    {group:'排行榜',name:'女优榜',path:'/zh/rank/censored/actress',kind:'people-index'},
    {group:'资源分类',name:'有码磁力',path:'/zh/censored?order=publish',kind:'movies'},
    {group:'资源分类',name:'无码磁力',path:'/zh/uncensored?order=publish',kind:'movies'}
  ];};

  C.pdfh=function(html,sel){try{return C.s(pdfh(html,sel));}catch(e){return'';}};
  C.pdfa=function(html,sel){try{var a=pdfa(html,sel);return Object.prototype.toString.call(a)==='[object Array]'?a:[];}catch(e){return[];}};
  C.firstAttr=function(html,selector,attrs){for(var i=0;i<attrs.length;i++){var v=C.pdfh(html,selector+'&&'+attrs[i]);if(v)return v;}return'';};
  C.itemHref=function(item,ref){var h=C.pdfh(item,'a&&href');if(!h){var m=C.s(item).match(/<a\b[^>]*href=["']([^"']+)["']/i);h=m?m[1]:'';}return C.abs(h,ref||C.base);};
  C.itemImage=function(item,ref){var img=C.firstAttr(item,'img',['data-src','data-lazy-src','data-original','src']);if(!img){var t=(C.s(item).match(/<img\b[^>]*>/i)||[])[0]||'';img=C.attr(t,'data-src')||C.attr(t,'data-lazy-src')||C.attr(t,'data-original')||C.attr(t,'src');}img=C.abs(img,ref||C.base);return C.badImage(img)?'':img;};
  C.itemTitle=function(item){var t=C.pdfh(item,'.card-title&&Text')||C.pdfh(item,'img&&alt')||C.pdfh(item,'a&&title');if(!t){var im=(C.s(item).match(/<img\b[^>]*>/i)||[])[0]||'',a=(C.s(item).match(/<a\b[^>]*>/i)||[])[0]||'';t=C.attr(im,'alt')||C.attr(a,'title');}t=C.strip(t);if(t.indexOf(' - ')>0)t=t.split(' - ')[0];return t;};
  C.itemRemark=function(item){var t=C.pdfh(item,'.label&&Text')||C.pdfh(item,'.text-muted&&Text')||C.pdfh(item,'.badge&&Text');return C.strip(t);};
  C.fallbackVideoItems=function(html){var out=[],s=C.s(html),re=/<[^>]+class=["'][^"']*video-list-item[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/ig,m;while((m=re.exec(s)))out.push(m[0]);return out;};
  C.parseMovies=function(html,ref){var items=C.pdfa(html,'.video-list-item'),out=[],seen={},i,item,href,title,code,img,remark;if(!items.length)items=C.fallbackVideoItems(html);for(i=0;i<items.length;i++){item=items[i];href=C.itemHref(item,ref);if(!href||seen[href]||!C.isDetailHref(href))continue;code=C.codeFromHref(href)||C.extractCode(C.itemTitle(item));if(!code)continue;title=C.itemTitle(item)||code;img=C.itemImage(item,href);remark=C.itemRemark(item);seen[href]=1;out.push({id:code,code:code,title:title,href:href,rawImg:img,img:C.image(img,href),remark:remark,date:'',badge:'',source:'javmenu'});if(out.length>=90)break;}return out;};

  C.parseAnchors=function(html,matcher,kind){var out=[],seen={},re=/<a\b([^>]*)>([\s\S]*?)<\/a>/ig,m,href,name,imgTag,img;while((m=re.exec(C.s(html)))){href=C.abs(C.attr(m[1],'href'),C.base);if(!href||seen[href]||!C.isSiteOrigin(C.origin(href))||!matcher(href,m[2]))continue;name=C.strip(m[2]);if(!name||name.length>60)continue;imgTag=(m[2].match(/<img\b[^>]*>/i)||[])[0]||'';img=C.attr(imgTag,'data-src')||C.attr(imgTag,'data-original')||C.attr(imgTag,'src')||'';seen[href]=1;out.push({name:name,href:href,img:C.image(img,href),rawImg:C.abs(img,href),kind:kind});}return out;};
  C.parseActors=function(html){return C.parseAnchors(html,function(h){return /\/actor\//i.test(h);},'people').filter(function(x){return !/(女优榜|女優榜|演员榜|演員榜)/i.test(x.name);}).slice(0,30);};
  C.parseMetaLinks=function(html){return C.parseAnchors(html,function(h){return /\/(?:genre|series|studio|maker|label|director|tag)\//i.test(h);},'tag').slice(0,50);};
  C.parseActressIndex=function(html,ref){var sels=['.actor-item','.actress-item','.actor-card','.col-6.col-md-3','.col-4.col-md-2'],items=[],seen={},out=[],i,j,it,href,name,img;for(i=0;i<sels.length&&!items.length;i++)items=C.pdfa(html,sels[i]);if(items.length){for(j=0;j<items.length;j++){it=items[j];href=C.pdfh(it,'a[href*="/actor/"]&&href')||C.pdfh(it,'a&&href');href=C.abs(href,ref||C.base);if(!href||!/\/actor\//i.test(href)||seen[href])continue;name=C.pdfh(it,'.actor-name&&Text')||C.pdfh(it,'.card-title&&Text')||C.pdfh(it,'h5&&Text')||C.pdfh(it,'a&&Text')||C.pdfh(it,'a&&alt');name=C.strip(name);if(!name||/(女优榜|女優榜)/i.test(name))continue;img=C.itemImage(it,href);seen[href]=1;out.push({name:name,href:href,img:C.image(img,href),rawImg:img,kind:'people'});}}
    if(!out.length)out=C.parseActors(html);return out.slice(0,100);};
  C.personName=function(html,fallback){var h=C.pdfh(html,'h1&&Text');if(!h){var m=C.s(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);h=m?C.strip(m[1]):'';}return C.strip(h)||fallback||'女优';};

  C.parseJsonLd=function(html){var out=[],re=/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig,m,j;while((m=re.exec(C.s(html)))){try{j=JSON.parse(C.decodeHtml(C.trim(m[1])));if(j)out.push(j);}catch(e){}}return out;};
  C.findVideoLd=function(list){var a=[];function walk(v){if(!v)return;if(Object.prototype.toString.call(v)==='[object Array]'){for(var z=0;z<v.length;z++)walk(v[z]);return;}if(typeof v==='object'){if(C.s(v['@type']).toLowerCase()==='videoobject')a.push(v);if(v['@graph'])walk(v['@graph']);}}for(var i=0;i<list.length;i++)walk(list[i]);return a.length?a[0]:null;};
  C.isPreviewMedia=function(u,n,attrs){var x=(C.s(u)+' '+C.s(n)+' '+C.s(attrs)).toLowerCase();return /(freepv|cc3001\.dmm\.co\.jp|litevideo|preview|pills-preview|player-preview)/i.test(x);};
  C.parsePlayer=function(html,ref){var out=[],seen={},s=C.s(html),re,m,tag,url,name,attrs;function add(u,n,a){u=C.abs(C.decodeHtml(C.s(u).replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/')),ref);if(!u||!/\.(?:m3u8|mp4|flv|mpd)(?:[?#]|$)/i.test(u)||seen[u]||C.isPreviewMedia(u,n,a))return;seen[u]=1;out.push({url:u,name:C.strip(n)||('线路 '+(out.length+1))});}
    re=/<(?:a|button)\b([^>]*)data-m3u8=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/(?:a|button)>/ig;while((m=re.exec(s))){attrs=m[1]+' '+m[3];if(/data-(?:source|key)=["']preview["']|data-target=["'][^"']*preview/i.test(attrs))continue;add(m[2],C.strip(m[4])||C.attr(attrs,'title'),attrs);}
    re=/<(?:video|source)\b([^>]*)>/ig;while((m=re.exec(s))){tag=m[1];url=C.attr(tag,'src')||C.attr(tag,'data-src');name=C.attr(tag,'label')||C.attr(tag,'title')||C.attr(tag,'data-quality');add(url,name,tag);}
    var lds=C.findVideoLd(C.parseJsonLd(s));if(lds&&lds.contentUrl)add(lds.contentUrl,'线路 '+(out.length+1),'jsonld');
    re=/https?:\\?\/\\?\/[^\s"'<>]+?\.(?:m3u8|mp4|flv|mpd)(?:\?[^\s"'<>]*)?/ig;while((m=re.exec(s)))add(m[0],'','raw');return out.slice(0,12);};
  C.parseImages=function(html,ref,poster){var out=[],seen={},re=/<a\b([^>]*)>([\s\S]*?)<\/a>/ig,m,href,imgTag,thumb,title;poster=C.abs(poster,ref);function add(src,th,t){src=C.abs(src,ref);th=C.abs(th||src,ref);if(!src||seen[src]||src===poster||!/(?:\.jpe?g|\.png|\.webp)(?:[?#]|$)/i.test(src)||C.badImage(src))return;seen[src]=1;out.push({src:src,thumb:C.image(th,ref),title:t||('预览 '+(out.length+1))});}while((m=re.exec(C.s(html)))){href=C.attr(m[1],'href');imgTag=(m[2].match(/<img\b[^>]*>/i)||[])[0]||'';thumb=C.attr(imgTag,'data-src')||C.attr(imgTag,'data-original')||C.attr(imgTag,'src');title=C.attr(imgTag,'alt')||C.attr(m[1],'title');if(href&&imgTag)add(href,thumb,title);if(out.length>=18)break;}return out;};
  C.parseMagnets=function(html){var out=[],seen={},re=/<a\b([^>]*)>([\s\S]*?)<\/a>/ig,m,href,title;while((m=re.exec(C.s(html)))){href=C.decodeHtml(C.attr(m[1],'href'));if(!/^magnet:\?xt=urn:btih:/i.test(href)||seen[href])continue;seen[href]=1;title=C.strip(m[2])||('磁力 '+(out.length+1));out.push({url:href,title:title});}return out;};
  C.formatDate=function(v){var s=C.s(v),m=s.match(/(20\d{2})-(\d{2})-(\d{2})/);return m?m[1]+'-'+m[2]+'-'+m[3]:s;};
  C.parseDetail=function(html,code,url){var ld=C.findVideoLd(C.parseJsonLd(html)),d={code:C.normalizeCode(code),url:url,title:'',desc:'',rawImg:'',img:'',date:'',duration:'',people:[],tags:[],samples:[],players:[],magnets:[],related:[]},og=C.meta(html,'property','og:title');var h1=C.pdfh(html,'h1&&Text');d.code=C.normalizeCode(C.pdfh(html,'.code&&Text')||C.pdfh(html,'.display-5&&strong&&Text')||h1)||d.code||C.codeFromHref(C.canonical(html))||C.normalizeCode(og);d.title=(ld&&ld.name)?C.trim(ld.name):C.strip(h1)||og||C.strip((C.s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'')||d.code;if(d.title.indexOf(' - ')>0)d.title=d.title.split(' - ')[0];d.desc=C.pdfh(html,'.card-text&&Text')||((ld&&ld.description)?C.strip(ld.description):C.meta(html,'name','description')||C.meta(html,'property','og:description'));var raw=(ld&&ld.thumbnailUrl)?(Object.prototype.toString.call(ld.thumbnailUrl)==='[object Array]'?ld.thumbnailUrl[0]:ld.thumbnailUrl):C.meta(html,'property','og:image');d.rawImg=C.abs(raw,url);d.img=C.image(d.rawImg,url);d.date=C.formatDate(C.s(ld&&ld.uploadDate||''));if(!d.date){var tm=C.pdfh(html,'.text-muted&&Text').match(/20\d{2}-\d{2}-\d{2}/);d.date=tm?tm[0]:'';}d.duration=C.s(ld&&ld.duration||'');d.people=C.parseActors(html);d.tags=C.parseMetaLinks(html);d.samples=C.parseImages(html,url,d.rawImg);d.players=C.parsePlayer(html,url);d.magnets=C.parseMagnets(html);d.related=C.parseMovies(html,url).filter(function(x){return x.code!==d.code;}).slice(0,18);return d;};

  C.readJson=function(path){try{var raw=readFile(path);if(!raw)raw=fetch(path);var x=JSON.parse(raw||'[]');return Object.prototype.toString.call(x)==='[object Array]'?x:[];}catch(e){return[];}};
  C.saveJson=function(path,list){try{saveFile(path,JSON.stringify(list||[]));return true;}catch(e){try{writeFile(path,JSON.stringify(list||[]));return true;}catch(e2){return false;}}};
  C.favPath=function(kind){return kind==='people'?C.peopleFavPath:C.videoFavPath;};
  C.loadFav=function(kind){return C.readJson(C.favPath(kind));};
  C.isFav=function(kind,key){var a=C.loadFav(kind),k=C.s(key).toLowerCase(),i;for(i=0;i<a.length;i++)if(C.s(a[i].key||a[i].code||a[i].href).toLowerCase()===k)return true;return false;};
  C.toggleFav=function(kind,item){item=item||{};var a=C.loadFav(kind),key=C.s(kind==='people'?(item.key||item.href||item.name):(item.code||item.key)).toLowerCase(),i,found=-1;if(!key)return false;for(i=0;i<a.length;i++)if(C.s(a[i].key||a[i].code||a[i].href).toLowerCase()===key){found=i;break;}if(found>=0){a.splice(found,1);C.saveJson(C.favPath(kind),a);return false;}item.key=key;item.savedAt=new Date().getTime();a.unshift(item);if(a.length>500)a=a.slice(0,500);C.saveJson(C.favPath(kind),a);return true;};
  C.clearFav=function(kind){return C.saveJson(C.favPath(kind),[]);};
  C.lastDiag=function(){try{return JSON.parse(getItem(C.diagKey,'{}')||'{}');}catch(e){return{};}};
  return C;
})();
if(typeof $!=='undefined')$.exports=JavMenuCore;
