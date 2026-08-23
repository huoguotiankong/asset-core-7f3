/* 911爆料 0.1.0-test.4 - feed/poster/media adapter hardening */
(function(C,R){
  C.version='0.1.0-test.4';
  C.build=10104;
  R.version='0.1.0-test.4';
  R.build=10104;
  R.contentAdapterContract='feed-poster-media-v2';

  C.promoText=function(v){
    var s=C.strip(v).replace(/\s+/g,' ').toLowerCase();
    if(!s)return false;
    if(/^(?:911爆料网|911爆料app|章鱼导航|看图找番|ai换脸脱衣|app|telegram|twitter|官方app|app下载|备用地址|备用网址|永久地址|回家地址)$/i.test(s))return true;
    if(s.length<56&&/(?:优先投放区|每日大赛|广告投放|广告合作|商务合作|导航站|导航页|官方app下载|app下载|备用网址|备用网址|永久网址|永久网站|回家地址)/i.test(s))return true;
    return false;
  };

  var _restricted=C.restrictedText;
  C.restrictedText=function(v){return _restricted.call(C,v)||C.promoText(v);};

  C.badImage=function(u){
    var s=C.clean(u).toLowerCase();
    if(!s)return true;
    if(/^data:|^blob:|^javascript:/i.test(s))return true;
    return /(?:^|\/)(?:logo|brand|favicon|icon|loading|loader|placeholder|default|error|404|qrcode|qr-code)(?:[._\/-]|$)/i.test(s)||/(?:telegram|twitter|app[-_]?download|download[-_]?app|navigation|nav[-_]?banner)/i.test(s);
  };

  C.imageFromAttrs=function(attrs,base){
    var keys=['data-original','data-original-src','data-src','data-lazy-src','data-lazy','data-url','data-image','data-img','data-echo','src'],i,u='';
    for(i=0;i<keys.length;i++){
      u=C.attr(attrs,keys[i]);
      if(u){u=C.abs(u,base);if(u&&!C.badImage(u))return u;}
    }
    var ss=C.attr(attrs,'data-srcset')||C.attr(attrs,'srcset');
    if(ss){
      var parts=ss.split(','),j,cand;
      for(j=parts.length-1;j>=0;j--){cand=C.trim(parts[j]).split(/\s+/)[0];cand=C.abs(cand,base);if(cand&&!C.badImage(cand))return cand;}
    }
    var style=C.attr(attrs,'style'),m=style.match(/background(?:-image)?\s*:\s*url\((?:["']?)([^)"']+)(?:["']?)\)/i);
    if(m){u=C.abs(m[1],base);if(u&&!C.badImage(u))return u;}
    return'';
  };

  C.cardImage=function(raw,base){
    var s=C.s(raw),re=/<img\b([^>]*)>/ig,m,u='';
    while((m=re.exec(s))){u=C.imageFromAttrs(m[1],base);if(u)return u;}
    re=/<source\b([^>]*)>/ig;
    while((m=re.exec(s))){u=C.imageFromAttrs(m[1],base);if(u)return u;}
    return'';
  };
  C.firstImage=function(raw,base){return C.cardImage(raw,base);};

  C.cardBlock=function(html,index){
    var s=C.s(html),from=Math.max(0,index-3200),before=s.substring(from,index),re=/<(?:article|li|div)\b[^>]*class=["'][^"']*(?:post|item|card|video|news|entry|content|list)[^"']*["'][^>]*>/ig,m,last=-1;
    while((m=re.exec(before)))last=m.index;
    if(last<0)return C.context(s,index,700,1900);
    var start=from+last,tail=s.substring(start,Math.min(s.length,index+4200)),close=tail.search(/<\/(?:article|li|div)>/i);
    return close>0?tail.substring(0,close+12):tail;
  };

  C.parsePosts=function(html,base){
    var s=C.s(html),re=/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,out=[],seen={},ctx,block,title,img,date,cat,u,inner,tm,x;
    while((m=re.exec(s))&&out.length<80){
      u=C.abs(m[2],base);
      if(!u||seen[u]||!C.urlLooksContent(u))continue;
      inner=m[4];
      ctx=C.context(s,m.index,1000,2200);
      block=C.cardBlock(s,m.index);
      title=C.clean(C.attr(m[1]+' '+m[3],'title')||C.attr(m[1]+' '+m[3],'aria-label')||C.strip(inner));
      if(!title||title.length<3||title.length>220){tm=block.match(/<(?:h1|h2|h3|h4)[^>]*>([\s\S]*?)<\/(?:h1|h2|h3|h4)>/i);if(tm)title=C.strip(tm[1]);}
      if(!title||title.length<3){tm=block.match(/(?:title|alt)\s*=\s*["']([^"']{3,220})["']/i);if(tm)title=C.clean(tm[1]);}
      if(!title||/^(?:首页|返回|更多|阅读全文|详情|播放|上一页|下一页)$/i.test(title)||C.promoText(title))continue;
      img=C.cardImage(inner,u)||C.cardImage(block,u);
      date=C.dateFrom(block||ctx);
      cat=C.categoryFrom(block||ctx);
      x={url:u,title:title,img:img?C.image(img,u):'',rawImg:img,date:date,category:cat,desc:[cat,date].filter(function(v){return!!v;}).join(' · ')};
      if(!C.safeItem(x))continue;
      seen[u]=1;out.push(x);
    }
    return C.unique(out,function(v){return C.pathOf(v.url).replace(/[?#].*$/,'');});
  };

  var _extractNav=C.extractNavLinks;
  C.extractNavLinks=function(html,base){
    var a=_extractNav.call(C,html,base),out=[],i;
    for(i=0;i<a.length;i++)if(!C.promoText(a[i].name))out.push(a[i]);
    return out;
  };

  C.extractParagraphs=function(raw){
    var s=C.s(raw),re=/<(?:p|h2|h3|h4|blockquote|figcaption)\b[^>]*>([\s\S]*?)<\/(?:p|h2|h3|h4|blockquote|figcaption)>/ig,m,out=[],seen={},t;
    while((m=re.exec(s))&&out.length<80){
      t=C.strip(m[1]);
      if(!t||t.length<2||t.length>1800||/^https?:\/\//i.test(t))continue;
      if(/911(?:bg|bla|bl)[a-z0-9.-]*\.com|回家邮箱|永久.*地址|最新.*地址|官方\s*app|app\s*点击下载|谷歌\/edge\/safari|广告合作|商务合作|投稿|上传/i.test(t))continue;
      if(C.restrictedText(t)||seen[t])continue;
      seen[t]=1;out.push(t);
    }
    return out;
  };

  C.normalizeMediaUrl=function(u,ref){
    u=C.clean(C.decode(u)).replace(/^\s*["']|["']\s*$/g,'').replace(/\\\//g,'/').replace(/&amp;/ig,'&');
    if(!u)return'';
    if(/%3a%2f%2f/i.test(u)){try{u=decodeURIComponent(u);}catch(e){}}
    u=u.replace(/^(https?)\/\//i,'$1://');
    if(/^\/\//.test(u))u='https:'+u;
    if(/^blob:|^data:|^javascript:/i.test(u))return'';
    if(!/^https?:\/\//i.test(u))u=C.abs(u,ref||C.base());
    u=C.clean(u).replace(/\\\//g,'/');
    if(!/^https?:\/\/[^\s/]+/i.test(u))return'';
    if(/[\s<>"']/g.test(u))return'';
    return u;
  };

  C.mediaLike=function(u){
    var s=C.clean(u).toLowerCase();
    return /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(s)||/[?&](?:format|type|ext)=(?:m3u8|mp4)(?:&|$)/i.test(s)||/(?:\/stream\/|\/playlist\/)/i.test(s);
  };

  C.extractMedia=function(html,base){
    var s=C.decode(html),out=[],seen={},i,re,m,u,raw,patterns=[
      /<(?:source|video)\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/ig,
      /["'](?:file|src|url|video_url|videoUrl|play_url|playUrl|hls|m3u8)["']\s*[:=]\s*["']([^"']+)["']/ig,
      /data-(?:url|video|src|play)\s*=\s*["']([^"']+)["']/ig,
      /((?:https?:)?\\?\/\\?\/[^\s"'<>]+?(?:\.m3u8|\.mp4)(?:\?[^\s"'<>]*)?)/ig
    ];
    for(i=0;i<patterns.length;i++){
      re=patterns[i];
      while((m=re.exec(s))&&out.length<12){
        raw=m[1]||m[0];u=C.normalizeMediaUrl(raw,base);
        if(!u||seen[u]||!C.mediaLike(u))continue;
        seen[u]=1;out.push({url:u,ref:base,route:'direct'});
      }
    }
    var cfg=/data-config\s*=\s*["']([^"']+)["']/ig;
    while((m=cfg.exec(s))&&out.length<12){
      var decoded=C.decode(m[1]);try{decoded=decodeURIComponent(decoded);}catch(e2){}
      var mm=decoded.match(/(?:https?:)?\\?\/\\?\/[^\s"']+?(?:\.m3u8|\.mp4)(?:\?[^\s"']*)?/ig)||[];
      for(i=0;i<mm.length&&out.length<12;i++){
        u=C.normalizeMediaUrl(mm[i],base);if(!u||seen[u]||!C.mediaLike(u))continue;
        seen[u]=1;out.push({url:u,ref:base,route:'config'});
      }
    }
    return out;
  };

  C.normalizeMediaList=function(media,ref){
    var a=media||[],out=[],seen={},i,x,u,r;
    for(i=0;i<a.length&&out.length<8;i++){
      x=a[i]||{};u=C.normalizeMediaUrl(x.url,ref);if(!u||seen[u]||!C.mediaLike(u))continue;
      r=C.normalizeMediaUrl(x.ref,ref)||C.normalizeMediaUrl(ref,C.base())||C.base()+'/';
      seen[u]=1;out.push({url:u,ref:r,route:x.route||'direct'});
    }
    return out;
  };

  C.video=function(u,ref){
    u=C.normalizeMediaUrl(u,ref);if(!u)return'';
    ref=C.normalizeMediaUrl(ref,C.base())||C.base()+'/';
    return u+';{Referer@'+ref+'&&User-Agent@'+C.ua+'}#isVideo=true#';
  };

  C.playMedia=function(media,ref){
    var m=C.normalizeMediaList(media,ref),names=[],urls=[],headers=[],i;
    if(m.length===1){C.diag('play','seed-'+(m[0].route||'direct'),m[0].url,'');return C.video(m[0].url,m[0].ref||ref);}
    if(m.length>1){
      for(i=0;i<m.length;i++){urls.push(m[i].url);names.push((m[i].route==='iframe'?'内嵌':'线路')+' '+(i+1));headers.push({'Referer':m[i].ref||ref||C.base()+'/','User-Agent':C.ua});}
      C.diag('play','seed-multi',ref||C.base(),'',{count:urls.length});return JSON.stringify({urls:urls,names:names,headers:headers});
    }
    C.diag('play','seed-invalid',ref||C.base(),'no valid http media');return'';
  };

  C.resolvePlay=function(url){
    var x=C.detail(url),m=C.normalizeMediaList(x.media||[],x.url),names=[],urls=[],headers=[],i;
    if(x.blocked){C.diag('blocked','content-filter',url,'restricted item');return'toast://该条目未在本程序中开放';}
    if(m.length===1){C.diag('play','direct-'+m[0].route,m[0].url,'');return C.video(m[0].url,m[0].ref||x.url);}
    if(m.length>1){
      for(i=0;i<m.length;i++){urls.push(m[i].url);names.push((m[i].route==='iframe'?'内嵌':'线路')+' '+(i+1));headers.push({'Referer':m[i].ref||x.url,'User-Agent':C.ua});}
      C.diag('play','multi-direct',x.url,'',{count:urls.length});return JSON.stringify({urls:urls,names:names,headers:headers});
    }
    C.diag('play','video-sniff',x.url,'no valid structured media');return'video://'+x.url;
  };
})(Bl911Core,Bl911RemoteRuntime.module());
