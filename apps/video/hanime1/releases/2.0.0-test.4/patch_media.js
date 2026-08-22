/* Hanime1 2.0.0-test.4 media/image/playback provider patch */
(function(C,P,H){
  var BUILD=H.build, decodeHtml=H.decodeHtml, attr=H.attr, imageFrom=H.imageFrom, imageUrl=H.imageUrl, uniq=H.uniq, cardsRaw=H.cardsRaw, rowMarks=H.rowMarks, featuredRaw=H.featuredRaw, assertResp=H.assertResp, metaContent=H.metaContent;
  var oldSearch=P.search, oldPreviews=P.previews, oldComicHome=P.comicHome, oldComicBrowse=P.comicBrowse, oldComicDetail=P.comicDetail;
  P.home=function(){var r=assertResp(C.video('/'),'首页'),base=r.base||C.resolveHost(false),html=String(r.body||''),marks=rowMarks(html),sections=[],featured=featuredRaw(html,base);for(var i=0;i<marks.length;i++){var a=marks[i],end=i+1<marks.length?marks[i+1].start:html.length,list=cardsRaw(html.slice(a.end,end),base);if(list.length)sections.push({title:a.title,more:C.abs(base,a.href),items:list});}if(!sections.length){var all=cardsRaw(html,base);if(all.length)sections.push({title:'全部视频',more:'',items:all});}if(!sections.length)throw new Error('首页已获取，但未解析到视频列表');return {base:base,featured:featured,sections:sections};};
  function sourceTags(html){var list=[],tags=String(html||'').match(/<source\b[^>]*>/gi)||[];for(var i=0;i<tags.length;i++){var u=attr(tags[i],'src')||attr(tags[i],'data-src'),q=attr(tags[i],'size')||attr(tags[i],'label')||attr(tags[i],'res')||attr(tags[i],'data-quality')||'默认',type=attr(tags[i],'type');if(u)list.push({quality:q,url:decodeHtml(u),type:type});}if(!list.length){var v=String(html||'').match(/<video\b[^>]*id\s*=\s*(["'])player\1[^>]*>/i)||String(html||'').match(/<video\b[^>]*>/i);if(v){var vu=attr(v[0],'src')||attr(v[0],'data-src');if(vu)list.push({quality:'默认',url:vu,type:attr(v[0],'type')});}}
    if(!list.length){var re=/(?:src|file)\s*[:=]\s*(["'])(https?:\\?\/\\?\/[^"']+?\.(?:m3u8|mp4)(?:\?[^"']*)?)\1/gi,m;while((m=re.exec(String(html||'')))!==null){list.push({quality:'默认',url:m[2].replace(/\\\//g,'/'),type:''});if(m.index===re.lastIndex)re.lastIndex++;}}
    return uniq(list,function(x){return x.url;});
  }
  var oldVideo=P.video;
  P.video=function(id){var v=oldVideo(id),h=String(v.raw||''),base=v.base||C.resolveHost(false),sources=sourceTags(h);if(sources.length){for(var i=0;i<sources.length;i++)sources[i].url=C.abs(base,sources[i].url);v.sources=sources;}if(v.cover)v.cover=imageUrl(v.cover,base+'/watch?v='+id);else{var vt=h.match(/<video\b[^>]*id\s*=\s*(["'])player\1[^>]*>/i)||h.match(/<video\b[^>]*>/i),poster=vt?attr(vt[0],'poster'):'';if(!poster)poster=metaContent(h,'og:image');if(poster)v.cover=imageUrl(C.abs(base,poster),base+'/watch?v='+id);}return v;};
  P.playModel=function(v){var urls=[],names=[],headers=[];for(var i=0;i<(v.sources||[]).length;i++){var s=v.sources[i];if(!s.url)continue;urls.push(s.url);names.push(String(s.quality||'默认')+(s.type?' · '+String(s.type).replace('video/',''):''));headers.push({'User-Agent':C.ua,'Referer':v.base+'/watch?v='+v.id});}if(!urls.length)throw new Error('未解析到可播放地址');return JSON.stringify({urls:urls,names:names,headers:headers});};

  function decorateResult(r,base){base=base||C.resolveHost(false);if(r&&r.items)for(var i=0;i<r.items.length;i++)if(r.items[i].img)r.items[i].img=imageUrl(r.items[i].img,base+'/');if(r&&r.artists)for(var j=0;j<r.artists.length;j++)if(r.artists[j].img)r.artists[j].img=imageUrl(r.artists[j].img,base+'/');return r;}
  P.search=function(o){return decorateResult(oldSearch(o),C.resolveHost(false));};
  P.previews=function(m){var a=oldPreviews(m),b=C.resolveHost(false);for(var i=0;i<a.length;i++)if(a[i].img)a[i].img=imageUrl(a[i].img,b+'/');return a;};
  P.comicHome=function(){var r=oldComicHome();for(var k in r){if(!Object.prototype.hasOwnProperty.call(r,k)||!Array.isArray(r[k]))continue;for(var i=0;i<r[k].length;i++)if(r[k][i].img)r[k][i].img=imageUrl(r[k][i].img,C.comicHost+'/');}return r;};
  P.comicBrowse=function(path,page){var r=oldComicBrowse(path,page);for(var i=0;i<r.items.length;i++)if(r.items[i].img)r.items[i].img=imageUrl(r.items[i].img,C.comicHost+'/');return r;};
  P.comicDetail=function(id){var r=oldComicDetail(id);if(r.cover)r.cover=imageUrl(r.cover,C.comicHost+'/comic/'+id);return r;};
  P.filters.genres=[['全部',''],['裏番','裏番'],['泡面番','泡麵番'],['Motion Anime','Motion Anime'],['3DCG','3DCG'],['2.5D','2.5D'],['2D动画','2D動畫'],['AI生成','AI生成'],['MMD','MMD'],['Cosplay','Cosplay']];
  P.build=BUILD;
})(HanimeCore,HanimeProvider,HanimePatch4Common);
