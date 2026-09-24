/* xChina Test10 pre-pages contract fixes
 * Runs after Test9 core and before Test9 pages so pages captures corrected functions.
 */
(function(K){
  if(!K||String(K.version)!=='0.1.0-test.9'||Number(K.build)!==10109)throw new Error('Test10 prepatch: Test9 Core 未加载');
  var s=K.s,trim=K.trim,decode=K.decode,strip=K.strip,abs=K.abs,origin=K.origin;
  function attrQuoted(tag,name){
    var re=new RegExp(name+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'),m=re.exec(s(tag));
    return m?decode(m[2]):'';
  }
  function classHas(tag,name){
    var c=attrQuoted(tag,'class');
    return new RegExp('(?:^|\\s)'+name+'(?:\\s|$)','i').test(c);
  }
  function imageFromCard(block,listUrl){
    var x=s(block),re=/<[^>]+>/g,m,tag,style,u='',fallback='';
    while((m=re.exec(x))){
      tag=m[0];
      if(classHas(tag,'img')){
        style=attrQuoted(tag,'style');
        if(style){u=K.cssUrl(style,listUrl);if(u)return u;}
        u=attrQuoted(tag,'data-original')||attrQuoted(tag,'data-src')||attrQuoted(tag,'src');
        if(u)return abs(u,listUrl);
      }
      if(/^<img\b/i.test(tag)){
        u=attrQuoted(tag,'data-original')||attrQuoted(tag,'data-src')||attrQuoted(tag,'data-lazy-src')||attrQuoted(tag,'src');
        if(u&&!fallback)fallback=abs(u,listUrl);
      }
    }
    var mr=x.match(/(?:background(?:-image)?\s*:\s*)?url\(\s*(?:&quot;|["'])?([^"'\)&]+)(?:&quot;|["'])?\s*\)/i);
    if(mr&&mr[1])return abs(decode(mr[1]),listUrl);
    return fallback;
  }
  function cardFromBlock(block,listUrl,type){
    var title=strip(K.domHtml(block,'.title&&Text')||K.domHtml(block,'a&&title')),
        href=K.domUrl(block,'a,0&&href',listUrl)||K.domUrl(block,'a&&href',listUrl),
        img=imageFromCard(block,listUrl),author='',brief=strip(K.domHtml(block,'.brief&&Text'));
    if(type==='fiction')author=strip(K.domHtml(block,'.author&&Text')||K.domHtml(block,'.tag&&Text')).replace(/^作者[:：]\s*/,'');
    else if(type==='comic')author=strip(K.domHtml(block,'.author&&Text')).replace(/^作者[:：]\s*/,'');
    else author=strip(K.domHtml(block,'.model-container&&Text')||K.domHtml(block,'.model-item&&Text')||K.domHtml(block,'.author&&Text'));
    if(!title){var mt=s(block).match(/class\s*=\s*(["'])[^"']*\btitle\b[^"']*\1[^>]*>([\s\S]*?)<\//i);title=mt?strip(mt[2]):'';}
    if(!href){var mh=s(block).match(/<a\b[^>]*href\s*=\s*(["'])([\s\S]*?)\1/i);href=mh?abs(decode(mh[2]),listUrl):'';}
    if(!img)img=imageFromCard(block,listUrl);
    if(!title||!href)return null;
    return{type:type,title:title,href:href,img:K.coverImage(img),rawImg:img,author:author,brief:brief};
  }
  function parseCards(html,listUrl,type){
    var bs=K.cardBlocks(html,type),out=[],seen={},i,c,key;
    for(i=0;i<bs.length;i++){
      c=cardFromBlock(bs[i],listUrl,type);if(!c)continue;
      key=c.href;if(seen[key])continue;seen[key]=1;out.push(c);
    }
    return out;
  }
  function listResult(type,path){var r=K.fetchPage(path,type);return{r:r,items:parseCards(r.html,r.url,type)};}
  function scopeMain(html){
    var x=s(html),p=x.search(/class\s*=\s*(["'])[^"']*\bmain-container\b[^"']*\1/i),st,en;
    if(p<0)return x;
    st=x.lastIndexOf('<',p);if(st<0)st=p;
    en=x.search(/<footer\b|class\s*=\s*(["'])[^"']*\b(?:related|recommend|footer)\b[^"']*\1/i);
    if(en<0||en<=st)en=Math.min(x.length,st+220000);
    return x.substring(st,en);
  }
  function cleanMedia(v,pageUrl,domain){
    var u=decode(s(v));
    u=u.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/\\\\/g,'');
    u=u.replace(/&amp;/ig,'&').replace(/^\s+|\s+$/g,'');
    if(/^\/\//.test(u))u='https:'+u;
    if(u&&!/^https?:\/\//i.test(u)){
      if(domain)u=s(domain).replace(/\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;
      else u=abs(u,pageUrl);
    }
    u=abs(u,pageUrl);
    if(!/^https?:\/\//i.test(u))return'';
    if(/(?:doubleclick|googlesyndication|\/ads?\/|advert|banner|tracking|analytics)/i.test(u))return'';
    if(!/\.(?:m3u8|mp4)(?:$|[?#])/i.test(u))return'';
    return u;
  }
  function mediaFromHtml(html,url,type){
    var x=scopeMain(html),out=[],seen={},m,re,u,domain='',videos=[],i,v;
    var md=x.match(/var\s+domain\s*=\s*(["'])([\s\S]*?)\1/i);if(md)domain=decode(md[2]);
    re=/(["'])([^"']*?\.m3u8(?:\?[^"']*)?)\1/ig;
    while((m=re.exec(x))){u=cleanMedia(m[2],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    if(!out.length){
      re=/(?:src|file|url|play_url|video_url|m3u8_url)\s*[:=]\s*(["'])([^"']+?)\1/ig;
      while((m=re.exec(x))){u=cleanMedia(m[2],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    }
    if(type==='photo'||!out.length){
      var mv=x.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);
      if(mv&&mv[1]){
        try{videos=JSON.parse(mv[1]);}catch(e){
          var rx=/["']url["']\s*:\s*(["'])([^"']+)\1/ig,mm;
          while((mm=rx.exec(mv[1])))videos.push({url:mm[2]});
        }
        for(i=0;i<videos.length;i++){
          v=videos[i]||{};u=cleanMedia(v.url||'',url,domain);
          if(u&&!seen[u]){seen[u]=1;out.push(u);}
        }
      }
    }
    if(!out.length){
      re=/<(?:video|source)\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*>/ig;
      while((m=re.exec(x))){u=cleanMedia(m[2],url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
    }
    return out;
  }
  function scopeByClass(html,cls){
    var x=s(html),re=new RegExp('class\\s*=\\s*(["\\\'])[^"\\\']*\\b'+cls+'\\b[^"\\\']*\\1','i'),m=re.exec(x),st,en;
    if(!m)return'';st=x.lastIndexOf('<',m.index);if(st<0)st=m.index;en=Math.min(x.length,st+32000);return x.substring(st,en);
  }
  function detailTags(html,url,type){
    if(type!=='video'&&type!=='photo'&&type!=='amateur')return[];
    var areas=[scopeByClass(html,type==='video'?'video-detail':'photo-detail'),scopeByClass(html,'tags'),scopeByClass(html,'model-container')],out=[],seen={},i,x,re,m,t,h;
    for(i=0;i<areas.length;i++){
      x=areas[i];if(!x)continue;
      re=/<a\b[^>]*href\s*=\s*(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/a>/ig;
      while((m=re.exec(x))){
        t=strip(m[3]);h=abs(decode(m[2]),url);
        if(!t||t.length>28||/^(?:更多|首页|上一页|下一页|登录|注册)$/i.test(t)||/推广|广告/i.test(t))continue;
        if(!seen[t]){seen[t]=1;out.push({name:t,href:h});}
      }
    }
    return out.slice(0,16);
  }
  K.cardFromBlock=cardFromBlock;
  K.parseCards=parseCards;
  K.listResult=listResult;
  K.mediaFromHtml=mediaFromHtml;
  K.detailTags=detailTags;
  K._test10ScopeMain=scopeMain;
})(XChinaTest9Core);
