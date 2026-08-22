/* JavBus Remote Core 2.0.0-alpha1 - site-owned parser/provider layer */
var JavBusCore=(function(){
  var C={};
  C.version='2.0.0-alpha1';
  C.build=20001;
  C.base='https://www.javbus.com';
  C.ua='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  C.videoFavPath='hiker://files/rules/JavBus/favorites_videos.json';
  C.actorFavPath='hiker://files/rules/JavBus/favorites_actors.json';
  C.legacyVideoFavPath='hiker://files/rules/Apollo/javbus/javbus_video.txt';
  C.legacyActorFavPath='hiker://files/rules/Apollo/javbus/javbus_actor.txt';

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.strip=function(v){return C.trim(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' '));};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^/]+)/i);return m?m[1]:C.base;};
  C.abs=function(u,base){u=C.trim(u);base=base||C.base;if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;var o=C.origin(base);if(u.charAt(0)==='/')return o+u;if(String(base).replace(/\/$/,'')===o)return o+'/'+u;return String(base).replace(/[^/]*(?:[?#].*)?$/,'')+u;};
  C.image=function(u,ref){u=C.abs(u,ref||C.base);if(!u)return'';return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.base+'/'});};
  C.typeName=function(type){return type==='uncensored'?'无码':type==='western'?'欧美':'有码';};
  C.typePrefix=function(type){return type==='uncensored'?'/uncensored':type==='western'?'/western':'';};
  C.magMode=function(){return getItem('javbus_mag_mode','all')==='exist'?'exist':'all';};
  C.cookie=function(){return 'existmag='+(C.magMode()==='exist'?'mag':'all');};
  C.headers=function(ref){return {'User-Agent':C.ua,'Referer':ref||C.base+'/','Cookie':C.cookie(),'Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.isBadHtml=function(h){var s=C.s(h),l=s.toLowerCase();return s.length<250||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0;};
  C.fetchHtml=function(url,timeout){var h='';try{h=C.s(fetch(url,{timeout:timeout||9000,headers:C.headers(url)}));}catch(e){h='';}if(C.isBadHtml(h)){try{h=C.s(fetchCodeByWebView(url,{timeout:12000,headers:C.headers(url)}));}catch(e2){}}return h;};
  C.fetchText=function(url,ref,timeout){try{return C.s(fetch(url,{timeout:timeout||9000,headers:C.headers(ref||url)}));}catch(e){return'';}};
  C.page=function(path,params){var a=['rule='+encodeURIComponent(MY_RULE.title),'simple=true'];params=params||{};Object.keys(params).forEach(function(k){if(params[k]!==undefined&&params[k]!==null&&String(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(params[k])));});return'hiker://page/'+path+'?'+a.join('&');};
  C.external=function(path,params){var a=[];params=params||{};Object.keys(params).forEach(function(k){if(params[k]!==undefined&&params[k]!==null)a.push(encodeURIComponent(k)+'='+encodeURIComponent(String(params[k])));});return'hiker://page/'+path+'?'+a.join('&');};

  C.listUrl=function(type,page,filterType,filterValue){var p=C.typePrefix(type),url=C.base+p;page=Number(page||1);if(filterType&&filterValue){url+='/'+filterType+'/'+encodeURIComponent(filterValue);if(page>1)url+='/'+page;}else if(page>1){url+='/page/'+page;}return url;};
  C.searchUrl=function(type,kw,page){var p=C.typePrefix(type);return C.base+p+'/search/'+encodeURIComponent(C.trim(kw))+'/'+Number(page||1)+'&type=1';};
  C.genreUrl=function(type){return C.base+C.typePrefix(type)+'/genre';};
  C.actressUrl=function(type,page){var u=C.base+C.typePrefix(type)+'/actresses';if(Number(page||1)>1)u+='/'+Number(page);return u;};
  C.detailUrl=function(id){return C.base+'/'+encodeURIComponent(C.trim(id));};

  C.pathInfo=function(href){href=C.abs(href,C.base);var path=href.replace(/^https?:\/\/[^/]+/i,'').replace(/[?#].*$/,'').replace(/^\/+/,'');var seg=path.split('/'),type='normal',i=0;if(seg[0]==='uncensored'||seg[0]==='western'){type=seg[0];i=1;}var kind=seg[i]||'',id=seg[i+1]||'';return{href:href,type:type,kind:kind,id:id};};
  C.itemLink=function(item){var u='';try{u=pdfh(item,'a&&href')||'';}catch(e){}return C.abs(u,C.base);};
  C.parseTags=function(item){var out=[];try{var ns=pdfa(item,'.item-tag&&button')||[];for(var i=0;i<ns.length;i++){var t=C.strip(pdfh(ns[i],'Text'));if(t)out.push(t);}}catch(e){}return out;};
  C.parseMovieItem=function(item,type){var img='',title='',href='',id='',date='',dates=[];try{img=pdfh(item,'.photo-frame&&img&&src')||pdfh(item,'img&&src')||'';}catch(e){}try{title=C.strip(pdfh(item,'.photo-frame&&img&&title')||pdfh(item,'img&&title')||'');}catch(e2){}href=C.itemLink(item);try{dates=pdfa(item,'.photo-info&&date')||[];}catch(e3){dates=[];}if(dates.length){try{id=C.strip(pdfh(dates[0],'Text'));}catch(e4){}if(dates.length>1){try{date=C.strip(pdfh(dates[1],'Text'));}catch(e5){}}}if(!id&&href){var z=href.replace(/[?#].*$/,'').split('/');id=decodeURIComponent(z[z.length-1]||'');}if(!title)title=id;return{id:id,title:title,img:C.image(img,href||C.base),rawImg:C.abs(img,href||C.base),date:date,tags:C.parseTags(item),href:href,type:type||'normal'};};
  C.parseMovies=function(html,type){var nodes=[],out=[],seen={};try{nodes=pdfa(html,'#waterfall&&.item')||[];}catch(e){nodes=[];}if(!nodes.length){try{nodes=pdfa(html,'.movie-box')||[];}catch(e2){nodes=[];}}for(var i=0;i<nodes.length;i++){var m=C.parseMovieItem(nodes[i],type);if(!m.id||seen[m.href||m.id])continue;seen[m.href||m.id]=1;out.push(m);}return out;};
  C.hasNext=function(html){try{return (pdfa(html,'.pagination&&#next')||[]).length>0;}catch(e){}return /id=["']next["']/i.test(C.s(html));};

  C.linkProp=function(infoNodes,label){for(var i=0;i<infoNodes.length;i++){var txt=C.strip(pdfh(infoNodes[i],'Text'));if(txt.indexOf(label)<0)continue;var href='',name='';try{href=pdfh(infoNodes[i],'a&&href')||'';name=C.strip(pdfh(infoNodes[i],'a&&Text'));}catch(e){}if(href)return{name:name,href:C.abs(href,C.base),path:C.pathInfo(href)};}return null;};
  C.textProp=function(infoNodes,label){for(var i=0;i<infoNodes.length;i++){var txt=C.strip(pdfh(infoNodes[i],'Text'));if(txt.indexOf(label)>=0)return C.trim(txt.replace(label,'').replace(/^[:：]\s*/,''));}return'';};
  C.parseDetail=function(html,id){var d={id:id,title:id,img:'',rawImg:'',date:'',length:'',director:null,studio:null,label:null,series:null,genres:[],stars:[],samples:[],related:[],gid:'',uc:'',html:html};try{d.title=C.strip(pdfh(html,'.container&&h3&&Text')||pdfh(html,'h3&&Text'))||id;}catch(e){}try{d.rawImg=C.abs(pdfh(html,'.movie&&.bigImage&&img&&src')||pdfh(html,'.bigImage&&img&&src')||'',C.detailUrl(id));d.img=C.image(d.rawImg,C.detailUrl(id));}catch(e2){}var ps=[];try{ps=pdfa(html,'.movie&&.info&&p')||[];}catch(e3){ps=[];}d.date=C.textProp(ps,'發行日期');d.length=C.textProp(ps,'長度').replace(/分鐘/g,'').replace(/\s+/g,'');d.director=C.linkProp(ps,'導演');d.studio=C.linkProp(ps,'製作商');d.label=C.linkProp(ps,'發行商');d.series=C.linkProp(ps,'系列');
    var links=[];try{links=pdfa(html,'.movie&&.info&&a')||[];}catch(e4){links=[];}var sg={},ss={};for(var i=0;i<links.length;i++){var href='',name='';try{href=C.abs(pdfh(links[i],'href')||pdfh(links[i],'a&&href')||'',C.base);name=C.strip(pdfh(links[i],'Text'));}catch(e5){}if(!href||!name)continue;var pi=C.pathInfo(href);if(pi.kind==='genre'&&!sg[href]){sg[href]=1;d.genres.push({name:name,href:href,path:pi});}if(pi.kind==='star'&&!ss[href]){ss[href]=1;d.stars.push({name:name,href:href,path:pi});}}
    var mg=C.s(html).match(/var\s+gid\s*=\s*(\d+)\s*;/i),mu=C.s(html).match(/var\s+uc\s*=\s*(\d+)\s*;/i);d.gid=mg?mg[1]:'';d.uc=mu?mu[1]:'';
    var samples=[];try{samples=pdfa(html,'#sample-waterfall&&.sample-box')||[];}catch(e6){samples=[];}for(i=0;i<samples.length;i++){var su='',si='',st='';try{su=pdfh(samples[i],'href')||pdfh(samples[i],'a&&href')||'';si=pdfh(samples[i],'.photo-frame&&img&&src')||pdfh(samples[i],'img&&src')||'';st=C.strip(pdfh(samples[i],'.photo-frame&&img&&title')||pdfh(samples[i],'img&&title')||'');}catch(e7){}su=C.abs(su,C.detailUrl(id));si=C.abs(si,C.detailUrl(id));if(su||si)d.samples.push({src:su||si,thumb:C.image(si||su,C.detailUrl(id)),title:st||('样品 '+(i+1))});}
    var rel=[];try{rel=pdfa(html,'#related-waterfall&&a')||[];}catch(e8){rel=[];}var sr={};for(i=0;i<rel.length;i++){var rh='',rt='',ri='';try{rh=C.abs(pdfh(rel[i],'href')||'',C.base);rt=C.strip(pdfh(rel[i],'title')||pdfh(rel[i],'img&&title')||'');ri=pdfh(rel[i],'img&&src')||'';}catch(e9){}if(!rh||sr[rh])continue;sr[rh]=1;var rid=decodeURIComponent(rh.replace(/[?#].*$/,'').split('/').pop()||'');if(!rid)continue;d.related.push({id:rid,title:rt||rid,img:C.image(ri,rh),href:rh});}
    return d;
  };

  C.parseGenres=function(html,type){var out=[],seen={},re=/<a\b[^>]*href=["']([^"']*\/genre\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m;while((m=re.exec(C.s(html)))){var href=C.abs(m[1],C.base),name=C.strip(m[2]);if(!name||seen[href])continue;var p=C.pathInfo(href);if(p.kind!=='genre')continue;seen[href]=1;out.push({name:name,href:href,id:p.id,type:p.type||type||'normal'});}return out;};
  C.parseActors=function(html,type){var nodes=[],out=[],seen={};try{nodes=pdfa(html,'.avatar-box')||[];}catch(e){nodes=[];}for(var i=0;i<nodes.length;i++){var href='',img='',name='';try{href=C.abs(pdfh(nodes[i],'a&&href')||'',C.base);img=pdfh(nodes[i],'.photo-frame&&img&&src')||pdfh(nodes[i],'img&&src')||'';name=C.strip(pdfh(nodes[i],'.photo-info&&.pb10&&Text')||pdfh(nodes[i],'img&&title')||pdfh(nodes[i],'.photo-info&&Text')||'');}catch(e2){}var p=C.pathInfo(href);if(p.kind!=='star'||!p.id||seen[href])continue;seen[href]=1;out.push({id:p.id,name:name||p.id,img:C.image(img,href),href:href,type:p.type||type||'normal'});}if(!out.length){var re=/<a\b[^>]*href=["']([^"']*\/star\/[^"']+)["'][^>]*>[\s\S]*?<img\b[^>]*?(?:src=["']([^"']+)["'])?[^>]*?(?:title=["']([^"']+)["'])?[^>]*>/ig,m;while((m=re.exec(C.s(html)))){var h=C.abs(m[1],C.base),pi=C.pathInfo(h);if(!pi.id||seen[h])continue;seen[h]=1;out.push({id:pi.id,name:C.strip(m[3])||pi.id,img:C.image(m[2]||'',h),href:h,type:pi.type||type||'normal'});}}return out;};
  C.parseActorProfile=function(html,id,type){var a={id:id,type:type||'normal',name:id,img:'',fields:[]},box='';try{var ns=pdfa(html,'.avatar-box')||[];box=ns.length?ns[0]:html;}catch(e){box=html;}try{a.name=C.strip(pdfh(box,'.photo-info&&.pb10&&Text')||pdfh(box,'img&&title')||id);var raw=pdfh(box,'.photo-frame&&img&&src')||pdfh(box,'img&&src')||'';a.img=C.image(raw,C.base+C.typePrefix(type)+'/star/'+id);}catch(e2){}var ps=[];try{ps=pdfa(box,'.photo-info&&p')||[];}catch(e3){ps=[];}for(var i=0;i<ps.length;i++){var t=C.strip(pdfh(ps[i],'Text'));if(t&&t!==a.name)a.fields.push(t);}return a;};

  C.magnets=function(detail,sort){if(!detail||!detail.gid||detail.uc==='')return[];var url=C.base+'/ajax/uncledatoolsbyajax.php?gid='+encodeURIComponent(detail.gid)+'&lang=zh&uc='+encodeURIComponent(detail.uc);if(detail.rawImg)url+='&img='+encodeURIComponent(detail.rawImg);var raw='';try{raw=C.s(fetch(url,{timeout:9000,headers:{'User-Agent':C.ua,'Referer':C.detailUrl(detail.id),'Cookie':'existmag=all','X-Requested-With':'XMLHttpRequest'}}));}catch(e){raw='';}if(!raw)return[];var rows=[];try{rows=pdfa('<table>'+raw+'</table>','tr')||[];}catch(e2){rows=[];}var out=[];for(var i=0;i<rows.length;i++){var as=[],tds=[],link='',title='',size='',date='';try{as=pdfa(rows[i],'td&&a')||[];tds=pdfa(rows[i],'td')||[];}catch(e3){}if(as.length){try{link=pdfh(as[0],'href')||'';title=C.strip(pdfh(as[0],'Text'));}catch(e4){}}if(!/^magnet:\?/i.test(link))continue;if(tds.length>1){try{size=C.strip(pdfh(tds[1],'Text'));}catch(e5){}}if(tds.length>2){try{date=C.strip(pdfh(tds[2],'Text'));}catch(e6){}}var hd=/高清/.test(title),sub=/字幕/.test(title);title=C.trim(title.replace(/高清/g,'').replace(/字幕/g,''));var bytes=C.sizeBytes(size);out.push({link:link,title:title||detail.id,size:size,date:date,bytes:bytes,hd:hd,sub:sub});}sort=sort||'size_desc';out.sort(function(a,b){if(sort==='size_asc')return a.bytes-b.bytes;if(sort==='date_asc')return C.s(a.date).localeCompare(C.s(b.date));if(sort==='date_desc')return C.s(b.date).localeCompare(C.s(a.date));return b.bytes-a.bytes;});return out;};
  C.sizeBytes=function(s){var m=C.s(s).replace(/,/g,'').match(/([0-9.]+)\s*(TB|GB|MB|KB|B)/i);if(!m)return 0;var n=parseFloat(m[1]),u=m[2].toUpperCase(),p={B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776};return n*(p[u]||1);};

  C.readJson=function(path){try{var x=JSON.parse(fetchPC(path)||'[]');return Array.isArray(x)?x:[];}catch(e){return[];}};
  C.writeJson=function(path,a){writeFile(path,JSON.stringify(a||[]));};
  C.migrateFav=function(kind){var np=kind==='actor'?C.actorFavPath:C.videoFavPath,cur=C.readJson(np);if(cur.length)return cur;var old=C.readJson(kind==='actor'?C.legacyActorFavPath:C.legacyVideoFavPath),out=[];for(var i=0;i<old.length;i++){var row=old[i];if(typeof row==='string'){var a=row.split('@@');if(a[2])out.push({id:decodeURIComponent(C.s(a[2]).replace(/[?#].*$/,'').split('/').pop()||''),title:a[0]||'',img:a[1]||'',url:a[2]||'',type:'normal',savedAt:new Date().getTime()});}else if(row&&typeof row==='object')out.push(row);}if(out.length)C.writeJson(np,out);return out;};
  C.favs=function(kind){return C.migrateFav(kind);};
  C.isFav=function(kind,id){id=C.s(id).toLowerCase();var a=C.favs(kind);for(var i=0;i<a.length;i++)if(C.s(a[i].id).toLowerCase()===id)return true;return false;};
  C.toggleFav=function(kind,item){var path=kind==='actor'?C.actorFavPath:C.videoFavPath,a=C.favs(kind),id=C.s(item.id).toLowerCase(),idx=-1;for(var i=0;i<a.length;i++)if(C.s(a[i].id).toLowerCase()===id){idx=i;break;}if(idx>=0){a.splice(idx,1);C.writeJson(path,a);return false;}item.savedAt=new Date().getTime();a.unshift(item);C.writeJson(path,a);return true;};

  C.loadPlayback=function(channel){var m='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/manager.js';eval(fetch(m,{timeout:10000,headers:{'Cache-Control':'no-cache'}}));if(typeof JAVPlaybackManager!=='object')throw new Error('共享 JAV Playback Manager 未加载');return JAVPlaybackManager.load(channel||'stable');};
  C.playbackUrl=function(provider,code){var manager='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/shared/jav-playback/manager.js';return $('#noLoading#').lazyRule(function(manager,provider,code){try{eval(fetch(manager,{timeout:10000,headers:{'Cache-Control':'no-cache'}}));var sdk=JAVPlaybackManager.load('stable');return sdk.resolve(provider,code);}catch(e){return'toast://播放解析失败：'+String(e.message||e);}},manager,provider,code);};

  C.magnetLongClicks=function(magnet,code){return[
    {title:'123云盘 · 离线播放',js:$.toString(function(m){try{if(fetch('hiker://home@123云盘')==='null')return'toast://未安装 123云盘';var x=$.require('hiker://page/csdown?rule=123云盘');return x.share_down(m);}catch(e){return'toast://123云盘调用失败：'+String(e.message||e);}},magnet)},
    {title:'磁力君 · 选择云盘/播放器',js:$.toString(function(m){if(fetch('hiker://home@磁力君.简')==='null')return'toast://未安装 磁力君.简';return'hiker://page/SelectTorrent?rule=磁力君.简&curl='+encodeURIComponent(m);},magnet)},
    {title:'云盘君 · 搜索该番号',js:$.toString(function(code){if(fetch('hiker://home@云盘君.简')==='null')return'toast://未安装 云盘君.简';return'hiker://page/sou?rule=云盘君.简&p=fypage&hideSetting=true&searchTerms='+encodeURIComponent(code);},code)},
    {title:'复制磁力链接',js:$.toString(function(m){return'copy://'+m;},magnet)}
  ];};

  return C;
})();
