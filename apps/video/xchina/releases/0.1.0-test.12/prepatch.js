/* xChina Test12 pre-pages contracts
 * Runs after Test9 core and before Test9 pages. No dependency on Test10 patches.
 */
(function(K){
  if(!K||String(K.version)!=='0.1.0-test.9'||Number(K.build)!==10109)throw new Error('Test12 prepatch: Test9 Core 未加载');
  var C=K.C,s=K.s,trim=K.trim,decode=K.decode,strip=K.strip,abs=K.abs,origin=K.origin;
  C.baseKey='xc_t12_base';C.lastBaseKey='xc_t12_last_base';C.cachePrefix='xc_t12_html_';

  function attrQuoted(tag,name){
    var x=s(tag),i=x.toLowerCase().indexOf(String(name).toLowerCase()),p,q,quote,j;
    if(i<0)return'';p=x.indexOf('=',i+name.length);if(p<0)return'';p++;
    while(/\s/.test(x.charAt(p)))p++;
    quote=x.charAt(p);
    if(quote==='"'||quote==="'"){
      /* HTML style commonly uses outer double quote and url('...') inside. Find the closing quote
         only when it is followed by whitespace, > or /> so inner CSS quotes are preserved. */
      j=p+1;
      while(j<x.length){
        j=x.indexOf(quote,j);if(j<0)break;
        q=x.substring(j+1,j+8);
        if(/^\s*(?:\/?>|[a-zA-Z_:][-\w:.]*\s*=)/.test(q)||j===x.length-1)return decode(x.substring(p+1,j));
        j++;
      }
      return decode(x.substring(p+1));
    }
    j=p;while(j<x.length&&!/[\s>]/.test(x.charAt(j)))j++;return decode(x.substring(p,j));
  }
  function classHas(tag,name){
    var c=attrQuoted(tag,'class');
    return new RegExp('(?:^|\\s)'+name+'(?:\\s|$)','i').test(c);
  }
  function cleanImageUrl(u,base){
    u=decode(s(u)).replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/&amp;/ig,'&').replace(/^\s+|\s+$/g,'');
    u=u.replace(/(?:&#0*39;|&apos;|&quot;).*$/ig,'').replace(/["']+$/,'');
    return abs(u,base);
  }
  function imageFromCard(block,listUrl,type){
    var x=s(block),style='',u='',m,tags,i,tag;
    /* First mirror the reading source exactly: .img@style -> url('...'). */
    try{style=s(K.domHtml(x,'.img&&style')||'');}catch(e){}
    if(style){m=decode(style).match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);if(m&&m[1])return cleanImageUrl(m[1],listUrl);}
    /* Exact fallbacks from older working xChina reading rules. */
    try{
      if(type==='video')u=K.domUrl(x,'a&&div&&data-poster',listUrl)||K.domUrl(x,'div&&data-poster',listUrl);
      else if(type==='photo')u=K.domUrl(x,'a&&div&&img&&src',listUrl)||K.domUrl(x,'a&&img&&src',listUrl);
      else if(type==='comic')u=K.domUrl(x,'a&&img&&src',listUrl)||K.domUrl(x,'img&&src',listUrl);
      if(u)return cleanImageUrl(u,listUrl);
    }catch(e2){}
    tags=x.match(/<[^>]+>/g)||[];
    for(i=0;i<tags.length;i++){
      tag=tags[i];
      if(classHas(tag,'img')){
        style=attrQuoted(tag,'style');
        if(style){m=style.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);if(m&&m[1]){u=cleanImageUrl(m[1],listUrl);if(u)return u;}}
        u=attrQuoted(tag,'data-original')||attrQuoted(tag,'data-src')||attrQuoted(tag,'data-lazy-src')||attrQuoted(tag,'src');
        if(u){u=cleanImageUrl(u,listUrl);if(u)return u;}
      }
    }
    /* Last fallback: any explicit image in the current card only, never neighbouring cards. */
    for(i=0;i<tags.length;i++)if(/^<img\b/i.test(tags[i])){
      u=attrQuoted(tags[i],'data-original')||attrQuoted(tags[i],'data-src')||attrQuoted(tags[i],'data-lazy-src')||attrQuoted(tags[i],'src');
      if(u){u=cleanImageUrl(u,listUrl);if(u)return u;}
    }
    return'';
  }
  function coverFor(u,listUrl,type){
    u=cleanImageUrl(u,listUrl);if(!u)return'';
    /* Uploaded NightSky source explicitly uses source.key (xchina.co) as Referer for list/detail covers,
       including comic list covers; litu100 Referer is reserved for comic正文 images only. */
    var h={'User-Agent':C.ua,'Referer':C.primary+'/','Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'};
    return u+'@headers='+JSON.stringify(h);
  }
  function cardFromBlock(block,listUrl,type){
    var title=strip(K.domHtml(block,'.title&&Text')||K.domHtml(block,'a&&title')),
        href=K.domUrl(block,'a,0&&href',listUrl)||K.domUrl(block,'a&&href',listUrl),
        img=imageFromCard(block,listUrl,type),author='',brief=strip(K.domHtml(block,'.brief&&Text'));
    if(type==='fiction')author=strip(K.domHtml(block,'.author&&Text')||K.domHtml(block,'.tag&&Text')).replace(/^作者[:：]\s*/,'');
    else if(type==='comic')author=strip(K.domHtml(block,'.author&&Text')).replace(/^作者[:：]\s*/,'');
    else author=strip(K.domHtml(block,'.model-container&&Text')||K.domHtml(block,'.model-item&&Text')||K.domHtml(block,'.author&&Text'));
    if(!title){var mt=s(block).match(/class\s*=\s*(["'])[^"']*\btitle\b[^"']*\1[^>]*>([\s\S]*?)<\//i);title=mt?strip(mt[2]):'';}
    if(!href){var mh=s(block).match(/<a\b[^>]*href\s*=\s*(["'])([\s\S]*?)\1/i);href=mh?abs(decode(mh[2]),listUrl):'';}
    if(!title||!href)return null;
    return{type:type,title:title,href:href,img:coverFor(img,listUrl,type),rawImg:img,author:author,brief:brief};
  }
  function parseCards(html,listUrl,type){
    var bs=K.cardBlocks(html,type),out=[],seen={},i,c;
    for(i=0;i<bs.length;i++){c=cardFromBlock(bs[i],listUrl,type);if(!c||seen[c.href])continue;seen[c.href]=1;out.push(c);}return out;
  }
  function listResult(type,path){var r=K.fetchPage(path,type);return{r:r,items:parseCards(r.html,r.url,type)};}

  function balancedMain(html){
    var x=s(html),m=/<(div|main|section)\b[^>]*class\s*=\s*(["'])[^"']*\bmain-container\b[^"']*\2[^>]*>/i.exec(x),tag,start,pos,depth,re,t;
    if(!m)return'';tag=m[1].toLowerCase();start=m.index;pos=m.index+m[0].length;depth=1;
    re=new RegExp('<\\/?'+tag+'\\b[^>]*>','ig');re.lastIndex=pos;
    while((t=re.exec(x))){if(/^<\//.test(t[0]))depth--;else depth++;if(depth===0)return x.substring(start,re.lastIndex);}
    return x.substring(start,Math.min(x.length,start+180000));
  }
  function cleanMedia(v,pageUrl,domain){
    var u=decode(s(v));u=u.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/\\\\/g,'').replace(/&amp;/ig,'&').replace(/^\s+|\s+$/g,'');
    if(/^\/\//.test(u))u='https:'+u;
    if(u&&!/^https?:\/\//i.test(u)){if(domain)u=s(domain).replace(/\/$/,'')+(u.charAt(0)==='/'?'':'/')+u;else u=abs(u,pageUrl);}u=abs(u,pageUrl);
    if(!/^https?:\/\//i.test(u))return'';
    if(/(?:doubleclick|googlesyndication|google-analytics|\/ads?(?:\/|\?|$)|advert|banner|tracking|analytics)/i.test(u))return'';
    if(!/\.m3u8(?:$|[?#])/i.test(u)&&!/\.mp4(?:$|[?#])/i.test(u))return'';
    return u;
  }
  function mediaFromHtml(html,url,type){
    var x=balancedMain(html),out=[],seen={},m,u,domain='',videos=[],i,v,script='';
    if(!x)return out;
    /* Reading source 2025-11-04 pure video contract: first quoted m3u8 inside main-container. */
    m=x.match(/(["'])([^"']*?\.m3u8[^"']*?)\1/i);
    if(m){u=cleanMedia(m[2],url,'');if(u){seen[u]=1;out.push(u);}}
    if(type==='photo'&&!out.length){
      var sm=x.match(/<script\b[^>]*>([\s\S]*?var\s+videos\s*=[\s\S]*?)<\/script>/i);script=sm?sm[1]:x;
      var md=script.match(/var\s+domain\s*=\s*(["'])([\s\S]*?)\1/i);if(md)domain=decode(md[2]);
      var mv=script.match(/var\s+videos\s*=\s*(\[[\s\S]*?\]);/i);
      if(mv&&mv[1]){
        try{videos=JSON.parse(mv[1]);}catch(e){var rx=/["']url["']\s*:\s*(["'])([^"']+)\1/ig,mm;while((mm=rx.exec(mv[1])))videos.push({url:mm[2]});}
        for(i=0;i<videos.length;i++){v=videos[i]||{};u=cleanMedia(v.url||'',url,domain);if(u&&!seen[u]){seen[u]=1;out.push(u);}}
      }
    }
    return out;
  }

  function cleanTagText(t){return strip(t).replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');}
  function badTag(t){return !t||t.length>22||/推广|广告|VPN|下载|APP|论坛|加速|分享|一键|注册|导航|脱衣|换脸|小姐楼|成人视频?APP/i.test(t);}
  function detailTags(html,url,type){
    if(type!=='video')return[];
    var out=[],seen={},models=K.domArray(html,'.model-container&&a'),i,n,h,divs,idx=[4,1,3],t;
    /* Author/model contract from uploaded source: .model-container@a@text. */
    for(i=0;i<models.length;i++){
      n=cleanTagText(K.domHtml(models[i],'a&&Text')||K.domHtml(models[i],'Text')||models[i]);
      h=K.domUrl(models[i],'a&&href',url);
      if(!badTag(n)&&h&&/\/models?\//i.test(h)&&!seen[n]){seen[n]=1;out.push({name:n,href:h,kind:'model'});}
    }
    /* Content-kind contract from uploaded source: only .tags div 4 / 1 / 3. Never scan arbitrary anchors. */
    divs=K.domArray(html,'.tags&&div');
    for(i=0;i<idx.length;i++)if(divs&&divs.length>idx[i]){
      t=cleanTagText(K.domHtml(divs[idx[i]],'div&&Text')||K.domHtml(divs[idx[i]],'Text')||divs[idx[i]]);
      if(!badTag(t)&&!seen[t]){seen[t]=1;out.push({name:t,href:'',kind:'content'});}
    }
    return out.slice(0,4);
  }

  function modelAllUrl(html,url){
    var as=K.domArray(html,'body&&a'),i,n,h,m,x=s(html);for(i=0;i<as.length;i++){n=strip(K.domHtml(as[i],'a&&Text')||K.domHtml(as[i],'Text')||as[i]);if(/全部视频|全部作品/.test(n)){h=K.domUrl(as[i],'a&&href',url);if(h)return h;}}
    m=x.match(/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>[\s\S]{0,120}?(?:全部视频|全部作品)[\s\S]{0,80}?<\/a>/i);return m?abs(decode(m[2]),url):'';
  }
  function modelCount(html){var m=strip(html).match(/收录视频数\s*[:：]?\s*(\d+)/);return m?parseInt(m[1],10):0;}

  function playMedia(u,pageUrl){
    return $(u).lazyRule(function(media,ref,ua){
      function org(x){var m=String(x||'').match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
      function cookie(x){var c='';try{c=String(getCookie(x)||'');}catch(e){}if(!c){try{c=String(getCookie(org(x)+'/')||'');}catch(e2){}}return c;}
      function hs(h){var a=[],k;for(k in h)if(h.hasOwnProperty(k)&&h[k])a.push(k+'@'+h[k]);return a.join('&&');}
      var isHls=/\.m3u8(?:$|[?#])/i.test(String(media)),ck=cookie(ref)||cookie(media),base={'User-Agent':ua,'Referer':ref,'Origin':org(ref)},hHost={},hPlain={},k,cached='';
      for(k in base){hHost[k]=base[k];hPlain[k]=base[k];}if(ck){hHost.Cookie=ck;hPlain.Cookie=ck;}
      /* Historical working xChina reading rule sets this exact Host on every HLS request. */
      hHost.Host='s2.playhls.com';
      if(isHls){
        try{cached=cacheM3u8(media,{headers:hHost});if(cached&&String(cached)!==String(media))return cached+'#isVideo=true#';}catch(e3){}
        try{cached=cacheM3u8(media,{headers:hPlain});if(cached&&String(cached)!==String(media))return cached+'#isVideo=true#';}catch(e4){}
        return media+';{'+hs(hHost)+'}#isVideo=true#';
      }
      return media+';{'+hs(hPlain)+'}#isVideo=true#';
    },u,pageUrl,C.ua);
  }
  function playPlainHeader(u,pageUrl){
    return $(u).lazyRule(function(media,ref,ua){
      function org(x){var m=String(x||'').match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:'';}
      var h={'User-Agent':ua,'Referer':ref,'Origin':org(ref)},ck='';try{ck=String(getCookie(ref)||getCookie(media)||'');}catch(e){}if(ck)h.Cookie=ck;var a=[],k;for(k in h)if(h[k])a.push(k+'@'+h[k]);return media+';{'+a.join('&&')+'}#isVideo=true#';
    },u,pageUrl,C.ua);
  }

  K.coverFor=coverFor;K.imageFromCard=imageFromCard;K.cardFromBlock=cardFromBlock;K.parseCards=parseCards;K.listResult=listResult;
  K.mediaFromHtml=mediaFromHtml;K.detailTags=detailTags;K.modelAllUrl=modelAllUrl;K.modelCount=modelCount;K.playMedia=playMedia;K.playPlainHeader=playPlainHeader;K._t12Main=balancedMain;
})(XChinaTest9Core);
