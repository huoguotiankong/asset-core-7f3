/* Hanime1 Remote Test 2.0.0-test.3 - raw HTML parser hotfix */
var HanimePatch=(function(C,P){
  var BUILD='2.0.0-test.3';
  var oldChallenge=C.challenge;
  var oldVideo=P.video;

  function headerText(h){try{return JSON.stringify(h||{});}catch(e){return String(h||'');}}
  function isChallenge(resp){
    resp=resp||{};var body=String(resp.body||''),hs=headerText(resp.headers),code=Number(resp.statusCode||0),all=body+'\n'+hs;
    var marker=/cf-chl-|challenge-form|Just a moment|Attention Required|Checking your browser|Verify you are human|請稍等|请稍等|驗證您是人類|验证您是人类/i.test(all);
    var header=/cf-mitigated[\s\S]{0,200}challenge/i.test(hs);
    var weak=/challenges\.cloudflare\.com|cf-turnstile|turnstile/i.test(all);
    return header||marker||((code===403||code===429||code===503)&&weak)||(typeof oldChallenge==='function'&&oldChallenge(resp));
  }
  C.challenge=isChallenge;

  function decodeHtml(s){
    return String(s==null?'':s)
      .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
      .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ')
      .replace(/&#x([0-9a-f]+);/gi,function(_,x){try{return String.fromCharCode(parseInt(x,16));}catch(e){return _;}})
      .replace(/&#(\d+);/g,function(_,x){try{return String.fromCharCode(parseInt(x,10));}catch(e){return _;}});
  }
  function stripHtml(s){return decodeHtml(String(s||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
  function escRe(s){return String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function tagAttr(tag,name){
    var m=String(tag||'').match(new RegExp('\\b'+escRe(name)+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'));
    return m?decodeHtml(m[2]).trim():'';
  }
  function firstTag(fragment,tag){var m=String(fragment||'').match(new RegExp('<'+tag+'\\b[^>]*>','i'));return m?m[0]:'';}
  function classText(fragment,name){
    var re=new RegExp('<([a-z0-9]+)\\b[^>]*class\\s*=\\s*(["\\\'])[^"\\\']*'+escRe(name)+'[^"\\\']*\\2[^>]*>([\\s\\S]*?)<\\/\\1>','i');
    var m=String(fragment||'').match(re);return m?stripHtml(m[3]):'';
  }
  function classTexts(fragment,name){
    var out=[],re=new RegExp('<([a-z0-9]+)\\b[^>]*class\\s*=\\s*(["\\\'])[^"\\\']*'+escRe(name)+'[^"\\\']*\\2[^>]*>([\\s\\S]*?)<\\/\\1>','gi'),m;
    while((m=re.exec(String(fragment||'')))!==null){var t=stripHtml(m[3]);if(t)out.push(t);if(m.index===re.lastIndex)re.lastIndex++;}
    return out;
  }
  function watchHref(fragment){
    var m=String(fragment||'').match(/href\s*=\s*(["'])([^"']*watch\?[^"']*\bv=\d+[^"']*)\1/i);
    return m?decodeHtml(m[2]).trim():'';
  }
  function idFrom(s){var m=String(s||'').match(/[?&]v=(\d+)/i);if(m)return m[1];m=String(s||'').match(/thumbnail\/(\d+)/i);return m?m[1]:'';}
  function imageFrom(fragment){
    var im=firstTag(fragment,'img');if(!im)return '';
    var src=tagAttr(im,'data-src')||tagAttr(im,'src')||tagAttr(im,'data-original')||tagAttr(im,'data-srcset')||tagAttr(im,'srcset');
    if(src&&src.indexOf(',')>=0)src=src.split(',')[0];if(src&&/\s+\d+[wx]$/i.test(src))src=src.replace(/\s+\d+[wx]$/i,'');
    return src;
  }
  function titleFrom(fragment){
    var names=['home-rows-videos-title','owl-home-rows-title','video-title','title'];
    for(var i=0;i<names.length;i++){var t=classText(fragment,names[i]);if(t)return t;}
    var im=firstTag(fragment,'img'),alt=tagAttr(im,'alt');return alt||'';
  }
  function cardFrom(fragment,base){
    var href=watchHref(fragment),img=imageFrom(fragment),id=idFrom(href)||idFrom(img);if(!id)return null;
    var st=classTexts(fragment,'stat-item');
    return {id:id,title:titleFrom(fragment)||('影片 '+id),url:C.abs(base,href),img:C.abs(base,img),duration:classText(fragment,'duration')||classText(fragment,'card-mobile-duration'),rating:st.length?st[0]:'',views:st.length>1?st[1]:'',artist:classText(fragment,'subtitle')||classText(fragment,'meta-author'),upload:classText(fragment,'meta-stats')||classText(fragment,'card-mobile-meta')};
  }
  function unique(list){var out=[],seen={};for(var i=0;i<list.length;i++){var x=list[i],k=String(x&&x.id||'');if(!k||seen[k])continue;seen[k]=1;out.push(x);}return out;}
  function cardStarts(block){
    var out=[],re=/<div\b[^>]*class\s*=\s*(["'])[^"']*horizontal-card[^"']*\1[^>]*>/gi,m;
    while((m=re.exec(String(block||'')))!==null){out.push(m.index);if(m.index===re.lastIndex)re.lastIndex++;}
    return out;
  }
  function cardsFromBlock(block,base){
    block=String(block||'');var out=[],starts=cardStarts(block),i;
    if(starts.length){for(i=0;i<starts.length;i++){var frag=block.slice(starts[i],i+1<starts.length?starts[i+1]:block.length),c=cardFrom(frag,base);if(c)out.push(c);}out=unique(out);if(out.length)return out;}
    var anchors=[],re=/<a\b[^>]*href\s*=\s*(["'])[^"']*watch\?[^"']*\bv=\d+[^"']*\1[^>]*>/gi,m;
    while((m=re.exec(block))!==null){anchors.push(m.index);if(m.index===re.lastIndex)re.lastIndex++;}
    for(i=0;i<anchors.length;i++){var end=i+1<anchors.length?anchors[i+1]:Math.min(block.length,anchors[i]+12000),frag2=block.slice(Math.max(0,anchors[i]-2500),end),c2=cardFrom(frag2,base);if(c2)out.push(c2);}
    return unique(out);
  }
  function rowMarks(html){
    var out=[],re=/<a\b([^>]*horizontal-row-title[^>]*)>([\s\S]*?)<\/a>/gi,m;
    while((m=re.exec(String(html||'')))!==null){
      var h3=m[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i),t=stripHtml(h3?h3[1]:m[2]).replace(/更多[\s\S]*$/,'').replace(/arrow_forward_ios[\s\S]*$/i,'').trim();
      out.push({start:m.index,end:re.lastIndex,title:t||'推荐',href:tagAttr(m[0],'href')});if(m.index===re.lastIndex)re.lastIndex++;
    }
    return out;
  }
  function featuredFrom(html,base){
    var i=String(html||'').indexOf('home-banner-wrapper');if(i<0)return null;var frag=String(html||'').slice(Math.max(0,i-500),i+25000),img=imageFrom(frag),title='';
    var h=frag.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);if(h)title=stripHtml(h[1]);var meta='';var h4=frag.match(/<h4\b[^>]*>([\s\S]*?)<\/h4>/i);if(h4)meta=stripHtml(h4[1]);
    var id=idFrom(img)||idFrom(watchHref(frag));return title?{id:id,title:title,img:C.abs(base,img),meta:meta}:null;
  }
  function assertHome(r){if(r&&isChallenge(r)){var e=new Error('NEED_VERIFY|'+String(r.url||C.resolveHost(false))+'|首页');e.code='NEED_VERIFY';e.url=r.url;throw e;}if(!r||Number(r.statusCode||0)>=400||!String(r.body||''))throw new Error('首页请求失败：HTTP '+Number((r&&r.statusCode)||0));return r;}

  P.home=function(){
    var r=assertHome(C.video('/')),base=r.base||C.resolveHost(false),html=String(r.body||''),sections=[],marks=rowMarks(html),featured=featuredFrom(html,base);
    for(var i=0;i<marks.length;i++){
      var a=marks[i],end=i+1<marks.length?marks[i+1].start:html.length,block=html.slice(a.end,end),list=cardsFromBlock(block,base);
      if(list.length)sections.push({title:a.title+' · '+list.length,more:C.abs(base,a.href),items:list});
    }
    if(!sections.length){var all=cardsFromBlock(html,base);if(all.length)sections.push({title:'全部视频 · '+all.length,more:'',items:all});}
    var total=0;for(var j=0;j<sections.length;j++)total+=sections[j].items.length;
    if(total<4){var fallback=cardsFromBlock(html,base);if(fallback.length>total)sections=[{title:'全部视频 · '+fallback.length,more:'',items:fallback}];}
    if(!sections.length)throw new Error('首页 HTML 已获取，但原始解析仍未找到视频；请反馈 Test3 截图。');
    return {base:base,featured:featured,sections:sections};
  };

  P.video=function(id){
    var v=oldVideo(id),h=String(v.raw||''),base=v.base||C.resolveHost(false);if(!v.cover){
      var vt=h.match(/<video\b[^>]*id\s*=\s*(["'])player\1[^>]*>/i)||h.match(/<video\b[^>]*>/i),poster=vt?tagAttr(vt[0],'poster'):'';
      if(!poster){var metas=h.match(/<meta\b[^>]*>/gi)||[];for(var i=0;i<metas.length;i++){var p=tagAttr(metas[i],'property');if(String(p).toLowerCase()==='og:image'){poster=tagAttr(metas[i],'content');break;}}}
      if(poster)v.cover=C.abs(base,poster);
    }
    return v;
  };
  P.build=BUILD;C.build=BUILD;
  return {build:BUILD,challenge:isChallenge};
})(HanimeCore,HanimeProvider);
