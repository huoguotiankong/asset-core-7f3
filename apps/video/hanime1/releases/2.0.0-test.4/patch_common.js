/* Hanime1 2.0.0-test.4 shared raw-html/image helpers */
var HanimePatch4Common=(function(C){
  var BUILD='2.0.0-test.4';
  function dec(s){
    s=String(s==null?'':s);
    for(var i=0;i<2;i++){try{var n=decodeURIComponent(s);if(n===s)break;s=n;}catch(e){break;}}
    return s;
  }
  function decodeHtml(s){return String(s==null?'':s).replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ').replace(/&#x([0-9a-f]+);/gi,function(_,x){try{return String.fromCharCode(parseInt(x,16));}catch(e){return _;}}).replace(/&#(\d+);/g,function(_,x){try{return String.fromCharCode(parseInt(x,10));}catch(e){return _;}});}
  function strip(s){return decodeHtml(String(s||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
  function esc(s){return String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function attr(tag,name){var m=String(tag||'').match(new RegExp('\\b'+esc(name)+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'));return m?decodeHtml(m[2]).trim():'';}
  function classBlock(fragment,name,all){var out=[],re=new RegExp('<([a-z0-9]+)\\b[^>]*class\\s*=\\s*(["\\\'])[^"\\\']*'+esc(name)+'[^"\\\']*\\2[^>]*>([\\s\\S]*?)<\\/\\1>','gi'),m;while((m=re.exec(String(fragment||'')))!==null){out.push({index:m.index,html:m[0],inner:m[3],text:strip(m[3])});if(m.index===re.lastIndex)re.lastIndex++;if(!all)break;}return all?out:(out[0]||null);}
  function normalizeSrc(v){v=decodeHtml(String(v||'')).trim();if(!v)return '';if(v.indexOf(',')>=0)v=v.split(',')[0];v=v.replace(/\s+\d+(?:\.\d+)?[wx]$/i,'').trim();return v;}
  function usefulImage(v){v=String(v||'');return !!v&&!/^data:/i.test(v)&&!/transparent|spinner|loading|placeholder|avatar-default|home_poster_background/i.test(v);}
  function imageTag(fragment){
    var s=String(fragment||''),m=s.match(/<img\b[^>]*class\s*=\s*(["'])[^"']*\bmain-thumb\b[^"']*\1[^>]*>/i);if(m)return m[0];
    var tags=s.match(/<img\b[^>]*>/gi)||[],best='';
    for(var i=0;i<tags.length;i++){var u=normalizeSrc(attr(tags[i],'src')||attr(tags[i],'data-src')||attr(tags[i],'data-original')||attr(tags[i],'data-srcset')||attr(tags[i],'srcset'));if(!u)continue;if(/thumbnail|vdownload\.hembed\.com/i.test(u))return tags[i];if(!best&&usefulImage(u))best=tags[i];}
    return best||tags[0]||'';
  }
  function imageFrom(fragment){var t=imageTag(fragment);if(!t)return '';var vals=[attr(t,'src'),attr(t,'data-src'),attr(t,'data-original'),attr(t,'data-srcset'),attr(t,'srcset')];for(var i=0;i<vals.length;i++){var u=normalizeSrc(vals[i]);if(usefulImage(u))return u;}for(var j=0;j<vals.length;j++){var v=normalizeSrc(vals[j]);if(v)return v;}return '';}
  function imageUrl(url,referer){url=String(url||'');if(!url)return '';if(url.indexOf('@headers=')>=0)return url;return url+'@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':referer||C.resolveHost(false)+'/'});}
  function idFrom(s){var m=String(s||'').match(/[?&]v=(\d+)/i);if(m)return m[1];m=String(s||'').match(/thumbnail\/(\d+)/i);return m?m[1]:'';}
  function watchHref(fragment){var m=String(fragment||'').match(/href\s*=\s*(["'])([^"']*watch\?[^"']*\bv=\d+[^"']*)\1/i);return m?decodeHtml(m[2]).trim():'';}
  function textClass(fragment,name){var b=classBlock(fragment,name,false);return b?b.text:'';}
  function allTextClass(fragment,name){var b=classBlock(fragment,name,true),a=[];for(var i=0;i<b.length;i++)if(b[i].text)a.push(b[i].text);return a;}
  function titleFrom(fragment){var names=['home-rows-videos-title','owl-home-rows-title','video-title','title'];for(var i=0;i<names.length;i++){var t=textClass(fragment,names[i]);if(t)return t;}var im=imageTag(fragment),alt=attr(im,'alt');return strip(alt);}
  function uniq(list,key){var out=[],seen={};for(var i=0;i<list.length;i++){var x=list[i],k=String(key?key(x):(x&&x.id)||'');if(!k||seen[k])continue;seen[k]=1;out.push(x);}return out;}
  function cardFrom(fragment,base){var href=watchHref(fragment),rawImg=imageFrom(fragment),id=idFrom(href)||idFrom(rawImg);if(!id)return null;var st=allTextClass(fragment,'stat-item');var img=C.abs(base,rawImg);return {id:id,title:titleFrom(fragment)||('影片 '+id),url:C.abs(base,href),img:imageUrl(img,base+'/'),duration:textClass(fragment,'duration')||textClass(fragment,'card-mobile-duration'),rating:st.length?st[0]:'',views:st.length>1?st[1]:'',artist:textClass(fragment,'subtitle')||textClass(fragment,'meta-author'),upload:textClass(fragment,'meta-stats')||textClass(fragment,'card-mobile-meta')};}
  function cardStarts(block){var out=[],re=/<div\b[^>]*class\s*=\s*(["'])[^"']*horizontal-card[^"']*\1[^>]*>/gi,m;while((m=re.exec(String(block||'')))!==null){out.push(m.index);if(m.index===re.lastIndex)re.lastIndex++;}return out;}
  function cardsRaw(block,base){block=String(block||'');var out=[],starts=cardStarts(block),i;if(starts.length){for(i=0;i<starts.length;i++){var c=cardFrom(block.slice(starts[i],i+1<starts.length?starts[i+1]:block.length),base);if(c)out.push(c);}if(out.length)return uniq(out);}
    var anchors=[],re=/<a\b[^>]*href\s*=\s*(["'])[^"']*watch\?[^"']*\bv=\d+[^"']*\1[^>]*>/gi,m;while((m=re.exec(block))!==null){anchors.push(m.index);if(m.index===re.lastIndex)re.lastIndex++;}for(i=0;i<anchors.length;i++){var a=Math.max(0,anchors[i]-3500),b=i+1<anchors.length?anchors[i+1]:Math.min(block.length,anchors[i]+14000),cc=cardFrom(block.slice(a,b),base);if(cc)out.push(cc);}return uniq(out);}
  function rowMarks(html){var out=[],re=/<a\b([^>]*horizontal-row-title[^>]*)>([\s\S]*?)<\/a>/gi,m;while((m=re.exec(String(html||'')))!==null){var h3=m[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i),t=strip(h3?h3[1]:m[2]).replace(/更多[\s\S]*$/,'').replace(/arrow_forward_ios[\s\S]*$/i,'').trim();out.push({start:m.index,end:re.lastIndex,title:t||'推荐',href:attr(m[0],'href')});if(m.index===re.lastIndex)re.lastIndex++;}return out;}
  function featuredRaw(html,base){var i=String(html||'').indexOf('home-banner-wrapper');if(i<0)return null;var f=String(html||'').slice(Math.max(0,i-1200),i+28000),h=f.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i),title=h?strip(h[1]):'',im=C.abs(base,imageFrom(f)),h4=f.match(/<h4\b[^>]*>([\s\S]*?)<\/h4>/i),meta=h4?strip(h4[1]):'',id=idFrom(im)||idFrom(watchHref(f));return title?{id:id,title:title,img:imageUrl(im,base+'/'),meta:meta}:null;}
  function assertResp(r,label){if(r&&r.challenge){var e=new Error('NEED_VERIFY|'+String(r.url||'')+'|'+(label||'站点'));e.code='NEED_VERIFY';throw e;}if(!r||Number(r.statusCode||0)>=400||!String(r.body||''))throw new Error((label||'请求')+'失败：HTTP '+Number((r&&r.statusCode)||0));return r;}
  function rawInput(html,name){var re=new RegExp('<input\\b[^>]*\\bname\\s*=\\s*(["\\\'])'+esc(name)+'\\1[^>]*>','i'),m=String(html||'').match(re);return m?attr(m[0],'value'):'';}
  function metaContent(html,name){var tags=String(html||'').match(/<meta\b[^>]*>/gi)||[];for(var i=0;i<tags.length;i++){if(String(attr(tags[i],'name')||attr(tags[i],'property')).toLowerCase()===String(name).toLowerCase())return attr(tags[i],'content');}return '';}
  return {build:BUILD,dec:dec,decodeHtml:decodeHtml,strip:strip,esc:esc,attr:attr,classBlock:classBlock,normalizeSrc:normalizeSrc,usefulImage:usefulImage,imageTag:imageTag,imageFrom:imageFrom,imageUrl:imageUrl,idFrom:idFrom,watchHref:watchHref,textClass:textClass,allTextClass:allTextClass,titleFrom:titleFrom,uniq:uniq,cardFrom:cardFrom,cardStarts:cardStarts,cardsRaw:cardsRaw,rowMarks:rowMarks,featuredRaw:featuredRaw,assertResp:assertResp,rawInput:rawInput,metaContent:metaContent};
})(HanimeCore);
