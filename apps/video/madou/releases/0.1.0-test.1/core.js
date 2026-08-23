/* 麻豆传媒 Remote Core 0.1.0-test.1 - madoup2.cc adaptive provider */
var MadouCore=(function(){
  var C={};
  C.version='0.1.0-test.1';
  C.build=10101;
  C.base='https://madoup2.cc';
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/bootstrap_test_v1_b10101.js?v=10101';
  C.ua='Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
  C.cachePrefix='madou_v1_';
  C.favoriteKey='madou_favorites_v1';
  C.historyKey='madou_history_v1';
  C.menuFallback=['首页','🔥精选推荐','欧美P站','原创AV','网黄','乱伦','日韩','男同百合','Onlyfans','三级','猛料-SM','成人综艺🔥','短视频','性爱教学','影视剧'];

  C.s=function(v){return v===undefined||v===null?'':String(v);};
  C.trim=function(v){return C.s(v).replace(/^\s+|\s+$/g,'');};
  C.decode=function(v){return C.s(v).replace(/&amp;/ig,'&').replace(/&#38;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&lt;/ig,'<').replace(/&gt;/ig,'>');};
  C.strip=function(v){return C.trim(C.decode(C.s(v).replace(/<br\s*\/?\s*>/ig,'\n').replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' '));};
  C.origin=function(u){var m=C.s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.base;};
  C.abs=function(u,base){u=C.decode(C.trim(u));base=base||C.base;if(!u)return'';u=u.replace(/\\\//g,'/');if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(/^data:/i.test(u)||/^javascript:/i.test(u)||u.charAt(0)==='#')return'';var o=C.origin(base);if(u.charAt(0)==='/')return o+u;if(u.charAt(0)==='?')return C.s(base).replace(/[?#].*$/,'')+u;return C.s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u;};
  C.headers=function(ref){return{'User-Agent':C.ua,'Referer':ref||C.base+'/','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'};};
  C.image=function(u,ref){u=C.abs(u,ref||C.base);if(!u)return'';return u+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':ref||C.base+'/'});};
  C.cacheKey=function(s){var x=C.s(s),h=0,i;for(i=0;i<x.length;i++)h=((h<<5)-h+x.charCodeAt(i))|0;return C.cachePrefix+Math.abs(h);};
  C.isBadHtml=function(h){var s=C.s(h),l=s.toLowerCase();return s.length<250||l.indexOf('just a moment')>=0||l.indexOf('cf-chl-')>=0||l.indexOf('attention required')>=0||l.indexOf('captcha')>=0&&s.length<2500;};
  C.fetchHtml=function(url,force){var key=C.cacheKey(url),tsKey=key+'_ts',now=new Date().getTime(),old=getItem(key,''),ts=parseInt(getItem(tsKey,'0'),10)||0,h='';if(!force&&old&&now-ts<10*60*1000)return old;try{h=C.s(fetch(url,{timeout:9000,headers:C.headers(url)}));}catch(e){h='';}if(C.isBadHtml(h)){try{h=C.s(fetchCodeByWebView(url,{timeout:15000,headers:C.headers(url)}));}catch(e2){}}
    if(!C.isBadHtml(h)){setItem(key,h);setItem(tsKey,String(now));return h;}return old||h;
  };
  C.page=function(path,params){var title='麻豆传媒';try{if(MY_RULE&&MY_RULE.title)title=MY_RULE.title;}catch(e){}var a=['rule='+encodeURIComponent(title),'simple=true'];params=params||{};for(var k in params)if(params.hasOwnProperty(k)&&params[k]!==undefined&&params[k]!==null&&C.s(params[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(C.s(params[k])));return'hiker://page/'+path+'?'+a.join('&');};
  C.param=function(name,def){var u='';try{u=C.s(MY_URL);}catch(e){}var m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));if(!m)return def||'';try{return decodeURIComponent(m[1]);}catch(e2){return m[1];}};
  C.ruleTitle=function(){try{return MY_RULE&&MY_RULE.title?MY_RULE.title:'麻豆传媒';}catch(e){return'麻豆传媒';}};

  C.attr=function(tag,name){var m=C.s(tag).match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i'));return m?C.decode(m[1]):'';};
  C.imgFrom=function(raw,base){var m=C.s(raw).match(/<img\b[^>]*(?:data-original|data-src|data-lazy-src|data-url|src)\s*=\s*["']([^"']+)["'][^>]*>/i);return m?C.abs(m[1],base):'';};
  C.meta=function(html,key){var s=C.s(html),re=new RegExp('<meta[^>]+(?:property|name)=["\\\']'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'),m=s.match(re);if(!m){re=new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\\\']','i');m=s.match(re);}return m?C.decode(m[1]):'';};
  C.titleFromHtml=function(html){var t=C.meta(html,'og:title');if(!t){var m=C.s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);t=m?C.strip(m[1]):'';}return C.trim(t.replace(/\s*[-|｜_]\s*麻豆.*$/i,''));};

  C.allAnchors=function(html,base){var s=C.s(html),out=[],re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m;while((m=re.exec(s))){var href=C.abs(m[2],base||C.base),text=C.strip(m[4]),raw=m[0];if(!href||!/^https?:\/\//i.test(href))continue;out.push({text:text,href:href,raw:raw,index:m.index,img:C.imgFrom(raw,href),title:C.attr(m[1]+' '+m[3],'title')});}return out;};
  C.internal=function(u){return C.origin(u)===C.origin(C.base);};
  C.cleanLabel=function(t){return C.trim(C.s(t).replace(/[▾▴▼▲⌄⌃]+/g,'').replace(/\s+/g,' '));};
  C.isUtilityLabel=function(t){return /^(登录|注册|APP|下载|广告|备用网址|发布页|收藏本站|客服|商务|加入群|电报|Telegram|Twitter|X|Facebook|Instagram|联系我们)$/i.test(C.cleanLabel(t));};
  C.menuRegion=function(html){var s=C.s(html),parts=[],re=/<nav\b[^>]*>[\s\S]*?<\/nav>/ig,m;while((m=re.exec(s)))parts.push(m[0]);re=/<(?:div|aside|section|ul)\b[^>]*(?:class|id)=["'][^"']*(?:menu|nav|sidebar|drawer|category|cate)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|aside|section|ul)>/ig;while((m=re.exec(s)))parts.push(m[0]);return parts.join('\n');};
  C.menu=function(html){var region=C.menuRegion(html),a=C.allAnchors(region||html,C.base),out=[],seen={},i,t,h;for(i=0;i<a.length;i++){t=C.cleanLabel(a[i].text||a[i].title);h=a[i].href;if(!t||t.length>18||!C.internal(h)||C.isUtilityLabel(t))continue;if(/^(上一页|下一页|上页|下页|\d+)$/.test(t))continue;if(/(category|cate|type|sort|tag|channel|class|index|home|recommend|featured|onlyfans)/i.test(h+' '+t)||/(P站|AV|日韩|欧美|原创|网黄|乱伦|男同|百合|三级|SM|综艺|短视频|教学|影视)/i.test(t)||C.menuFallback.indexOf(t)>=0){var k=t+'|'+h;if(seen[k])continue;seen[k]=1;out.push({name:t,url:h});}}
    if(out.length<6){for(i=0;i<C.menuFallback.length;i++){t=C.cleanLabel(C.menuFallback[i]);var found='';for(var j=0;j<a.length;j++)if(C.cleanLabel(a[j].text).replace(/^🔥|🔥$/g,'')===t.replace(/^🔥|🔥$/g,'')){found=a[j].href;break;}out.push({name:t,url:found||C.base+'/'});}}
    var uniq=[],u={};for(i=0;i<out.length;i++){var kk=out[i].name+'|'+out[i].url;if(!u[kk]){u[kk]=1;uniq.push(out[i]);}}return uniq.slice(0,80);
  };

  C.cardScore=function(a,ctx){var score=0,t=C.cleanLabel(a.text||a.title),h=a.href,img=a.img;if(img)score+=5;if(t&&t.length>=2)score+=3;if(/(video|vod|movie|play|detail|watch|view|post|archives|film)/i.test(h))score+=4;if(/(banner|advert|ads|promo|tg|telegram|download|app)/i.test(h+' '+ctx))score-=7;if(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(h))score-=6;if(h===C.base+'/'||/category|tag|class|channel|sort/i.test(h))score-=4;return score;};
  C.cards=function(html,base){var s=C.s(html),a=C.allAnchors(s,base||C.base),out=[],seen={},i,it,ctx,title,img,desc,score;for(i=0;i<a.length;i++){it=a[i];if(!C.internal(it.href)||seen[it.href])continue;ctx=s.substring(Math.max(0,it.index-700),Math.min(s.length,it.index+it.raw.length+900));title=C.cleanLabel(it.text||it.title);img=it.img||C.imgFrom(ctx,it.href);if(!title){var am=ctx.match(/(?:title|alt)\s*=\s*["']([^"']{2,160})["']/i);if(am)title=C.cleanLabel(am[1]);}
      score=C.cardScore({text:title,title:title,href:it.href,img:img},ctx);if(score<7||!img||!title||title.length<2||title.length>180)continue;
      desc='';var dm=ctx.match(/(?:时长|duration|更新|日期|views?|播放|热度)[^<]{0,30}<[^>]*>([^<]{1,40})</i);if(dm)desc=C.strip(dm[0]);else{var tm=ctx.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);if(tm)desc=tm[0];}
      seen[it.href]=1;out.push({url:it.href,title:title,img:C.image(img,it.href),rawImg:img,desc:desc});}
    return out;
  };
  C.cardsJsonLd=function(html,base){var s=C.s(html),out=[],seen={},re=/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/ig,m,obj;while((m=re.exec(s))){try{obj=JSON.parse(C.decode(m[1]));}catch(e){continue;}C.walkJsonCards(obj,out,seen,base||C.base);}return out;};
  C.walkJsonCards=function(o,out,seen,base){if(!o||out.length>100)return;if(Object.prototype.toString.call(o)==='[object Array]'){for(var i=0;i<o.length;i++)C.walkJsonCards(o[i],out,seen,base);return;}if(typeof o!=='object')return;var u=C.abs(o.url||o.contentUrl||o.embedUrl||'',base),t=C.s(o.name||o.headline||''),im=o.thumbnailUrl||o.image||'';if(typeof im==='object'&&im)im=im.url||im.contentUrl||'';if(Object.prototype.toString.call(im)==='[object Array]')im=im[0]||'';im=C.abs(im,u||base);if(u&&t&&im&&!seen[u]){seen[u]=1;out.push({url:u,title:C.cleanLabel(t),img:C.image(im,u),rawImg:im,desc:C.s(o.duration||o.uploadDate||'')});}for(var k in o)if(o.hasOwnProperty(k)&&k!=='image')C.walkJsonCards(o[k],out,seen,base);};
  C.parseCards=function(html,base){var a=C.cards(html,base),b=C.cardsJsonLd(html,base),seen={},out=[],i;for(i=0;i<a.length;i++){seen[a[i].url]=1;out.push(a[i]);}for(i=0;i<b.length;i++)if(!seen[b[i].url]){seen[b[i].url]=1;out.push(b[i]);}return out;};

  C.discoverPage2=function(html,base){var a=C.allAnchors(html,base),i,t,u;for(i=0;i<a.length;i++){t=C.cleanLabel(a[i].text);u=a[i].href;if(t==='2'&&(/page[=\/-]?2/i.test(u)||/\/2\/?(?:\?|$)/.test(u)))return u;}for(i=0;i<a.length;i++){u=a[i].href;if(/[?&](page|paged|p)=2(?:&|$)/i.test(u)||/\/page\/2\/?/i.test(u))return u;}return'';};
  C.pageUrl=function(base,page,html1){page=parseInt(page,10)||1;if(page<=1)return base;var key=C.cacheKey('page2:'+base),tpl=getItem(key,'');if(!tpl&&html1){tpl=C.discoverPage2(html1,base);if(tpl)setItem(key,tpl);}if(tpl){if(/[?&](page|paged|p)=\d+/i.test(tpl))return tpl.replace(/([?&](?:page|paged|p)=)\d+/i,'$1'+page);if(/\/page\/\d+\/?/i.test(tpl))return tpl.replace(/\/page\/\d+\/?/i,'/page/'+page+'/');if(/\/\d+\/?(?:\?|$)/.test(tpl))return tpl.replace(/\/\d+\/?(?=\?|$)/,'/'+page+'/');}
    if(/[?&](page|paged|p)=\d+/i.test(base))return base.replace(/([?&](?:page|paged|p)=)\d+/i,'$1'+page);if(/\/page\/\d+\/?/i.test(base))return base.replace(/\/page\/\d+\/?/i,'/page/'+page+'/');return base.replace(/\/$/,'')+'/page/'+page+'/';
  };

  C.detail=function(html,url){var d={url:url,title:C.titleFromHtml(html),cover:'',desc:'',date:'',duration:'',tags:[],actors:[],related:[],sources:[],html:html};d.cover=C.abs(C.meta(html,'og:image')||C.meta(html,'twitter:image')||'',url);if(!d.cover)d.cover=(C.parseCards(html,url)[0]||{}).rawImg||'';d.desc=C.meta(html,'og:description')||C.meta(html,'description');var dm=C.s(html).match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/);if(dm)d.date=dm[0].replace(/[\/.]/g,'-');var tm=C.s(html).match(/\b(?:\d{1,2}:)?\d{1,2}:\d{2}\b/);if(tm)d.duration=tm[0];
    var a=C.allAnchors(html,url),seen={},i,t;for(i=0;i<a.length;i++){t=C.cleanLabel(a[i].text);if(!t||t.length>30)continue;if(/tag|标签|演员|女优|男优|明星|star|actor/i.test(a[i].href+' '+t)){if(!seen[t]){seen[t]=1;d.tags.push({name:t,url:a[i].href});}}}
    d.sources=C.mediaSources(html,url);d.related=C.parseCards(html,url);var filtered=[];for(i=0;i<d.related.length;i++)if(d.related[i].url!==url)filtered.push(d.related[i]);d.related=filtered.slice(0,24);return d;
  };
  C.mediaSources=function(html,url){var s=C.decode(C.s(html)).replace(/\\\//g,'/'),out=[],seen={},re=/(https?:\/\/[^\s"'<>\\]+?(?:\.m3u8|\.mp4)(?:\?[^\s"'<>\\]*)?)/ig,m,u;while((m=re.exec(s))){u=C.abs(m[1],url);if(!u||seen[u]||/(advert|ads|promo|preview-ad)/i.test(u))continue;seen[u]=1;out.push(u);}var re2=/<(?:video|source)\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/ig;while((m=re2.exec(s))){u=C.abs(m[1],url);if(!u||seen[u])continue;if(/\.(m3u8|mp4)(?:\?|$)/i.test(u)){seen[u]=1;out.push(u);}}return out;};
  C.mediaScore=function(u){var s=C.s(u),x=0;if(/\.m3u8/i.test(s))x+=6;if(/\.mp4/i.test(s))x+=4;if(/1080|hd|fhd/i.test(s))x+=2;if(/720/i.test(s))x+=1;if(/preview|trailer|sample|ads|advert|promo/i.test(s))x-=8;return x;};
  C.resolvePlay=function(url){var h=C.fetchHtml(url,true),src=C.mediaSources(h,url);src.sort(function(a,b){return C.mediaScore(b)-C.mediaScore(a);});if(src.length){return src[0]+';{User-Agent@'+C.ua+'&&Referer@'+url+'}#isVideo=true#';}return'video://'+url;};

  C.searchForm=function(html){var s=C.s(html),re=/<form\b([^>]*)>([\s\S]*?)<\/form>/ig,m,b,action,method,im,name;while((m=re.exec(s))){b=m[2];if(!/(search|搜索|keyword|关键词|请输入)/i.test(m[0]))continue;action=C.abs(C.attr(m[1],'action')||'/',C.base);method=(C.attr(m[1],'method')||'GET').toUpperCase();im=b.match(/<input\b[^>]*(?:name)\s*=\s*["']([^"']+)["'][^>]*(?:type\s*=\s*["'](?:search|text)["']|placeholder\s*=\s*["'][^"']*(?:搜|search)[^"']*["'])[^>]*>/i)||b.match(/<input\b[^>]*name\s*=\s*["']([^"']+)["'][^>]*>/i);name=im?im[1]:'s';return{action:action,method:method,name:name};}return{action:C.base+'/',method:'GET',name:'s'};};
  C.searchHtml=function(keyword,page){var home=C.fetchHtml(C.base+'/',false),f=C.searchForm(home),kw=C.s(keyword),p=parseInt(page,10)||1,url,body,h='';if(f.method==='POST'){body=encodeURIComponent(f.name)+'='+encodeURIComponent(kw);try{h=C.s(fetch(f.action,{method:'POST',body:body,timeout:10000,headers:(function(){var x=C.headers(f.action);x['Content-Type']='application/x-www-form-urlencoded';return x;})()}));}catch(e){h='';}}else{url=f.action+(f.action.indexOf('?')>=0?'&':'?')+encodeURIComponent(f.name)+'='+encodeURIComponent(kw);if(p>1)url=C.pageUrl(url,p,p===2?C.fetchHtml(url,false):'');h=C.fetchHtml(url,true);}if(C.parseCards(h,f.action).length)return{html:h,url:f.action};var cand=[C.base+'/?s='+encodeURIComponent(kw),C.base+'/search?q='+encodeURIComponent(kw),C.base+'/search?keyword='+encodeURIComponent(kw),C.base+'/search/'+encodeURIComponent(kw)];for(var i=0;i<cand.length;i++){h=C.fetchHtml(cand[i],true);if(C.parseCards(h,cand[i]).length)return{html:h,url:cand[i]};}return{html:h,url:f.action};};

  C.readList=function(key){var s=getItem(key,'[]');try{var a=JSON.parse(s);return Object.prototype.toString.call(a)==='[object Array]'?a:[];}catch(e){return[];}};
  C.writeList=function(key,a){setItem(key,JSON.stringify(a||[]));};
  C.isFav=function(url){var a=C.readList(C.favoriteKey);for(var i=0;i<a.length;i++)if(a[i].url===url)return true;return false;};
  C.toggleFav=function(item){var a=C.readList(C.favoriteKey),out=[],hit=false,i;for(i=0;i<a.length;i++){if(a[i].url===item.url){hit=true;continue;}out.push(a[i]);}if(!hit){item.time=new Date().getTime();out.unshift(item);}if(out.length>500)out=out.slice(0,500);C.writeList(C.favoriteKey,out);return!hit;};
  C.addHistory=function(item){var a=C.readList(C.historyKey),out=[item],i;item.time=new Date().getTime();for(i=0;i<a.length;i++)if(a[i].url!==item.url)out.push(a[i]);if(out.length>300)out=out.slice(0,300);C.writeList(C.historyKey,out);};
  C.clearCaches=function(){var keys=[];try{keys=Object.keys(getItem('','')||{});}catch(e){}return true;};

  C.sniffUrl=function(url){return'video://'+url;};
  return C;
})();
