/* MyAv 0.1.0-test.2 - real cover/lazy image parser patch */
(function(C){
  if(!C)throw new Error('MyAvCore missing for image patch');
  C.version='0.1.0-test.2';
  C.build=10102;
  C.appIcon='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/assets/icon.svg';

  C.isPlaceholderImage=function(u){
    var x=C.decode(C.s(u)).toLowerCase();
    if(!x)return true;
    if(/^data:image\/(?:gif|svg\+xml)/i.test(x))return true;
    x=x.replace(/[?#].*$/,'');
    return /(?:^|[\/_\-.])(loading|loader|lazy|placeholder|blank|spacer|transparent|noimage|no-image|no_image|nopic|no-pic|no_pic|default|favicon|logo|avatar)(?:[\/_\-.]|$)/i.test(x);
  };

  C.attrValue=function(raw,name){
    var re=new RegExp('(?:^|\\s)'+name.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i');
    var m=C.s(raw).match(re);return m?C.decode(m[1]):'';
  };

  C.imageCandidates=function(raw,base){
    raw=C.s(raw);base=base||C.base;var out=[],seen={},attrs=['data-original','data-src','data-lazy-src','data-lazy','data-url','data-echo','data-cover','data-ks-lazyload','data-thumb','src'],i,v;
    function add(x){x=C.abs(C.trim(x),base);if(!x||seen[x])return;seen[x]=1;out.push(x);}
    for(i=0;i<attrs.length;i++){v=C.attrValue(raw,attrs[i]);if(v)add(v);}
    v=C.attrValue(raw,'srcset');
    if(v){var ss=v.split(','),j,part;for(j=ss.length-1;j>=0;j--){part=C.trim(ss[j]).split(/\s+/)[0];if(part)add(part);}}
    var sm=raw.match(/(?:background-image\s*:\s*url|url)\(\s*["']?([^"')]+)["']?\s*\)/i);if(sm)add(sm[1]);
    return out;
  };

  C.attrImage=function(raw,base){
    var a=C.imageCandidates(raw,base),i;for(i=0;i<a.length;i++)if(!C.isPlaceholderImage(a[i]))return a[i];return a.length?a[0]:'';
  };

  C.imagesIn=function(html,base){
    var out=[],seen={},re=/<img\b[^>]*>/ig,m,a,i,u;
    while((m=re.exec(C.s(html)))){
      a=C.imageCandidates(m[0],base);
      for(i=0;i<a.length;i++){u=a[i];if(!u||seen[u]||C.isPlaceholderImage(u))continue;seen[u]=1;out.push({url:u,tag:m[0],index:m.index});}
    }
    return out;
  };

  C.bestImageFromHtml=function(html,base,code){
    var a=C.imagesIn(html,base),best='',score=-9999,i,x,t,u,norm=C.s(code).toLowerCase().replace(/[^a-z0-9]/g,'');
    for(i=0;i<a.length;i++){
      x=a[i];t=C.s(x.tag).toLowerCase();u=C.s(x.url).toLowerCase();score=0;
      if(/data-original|data-src|data-lazy-src|data-cover/.test(t))score+=60;
      if(/cover|poster|thumb|movie|detail|pic|image/.test(t))score+=30;
      if(/cover|poster|thumb|movie|detail|pic/.test(u))score+=20;
      if(norm&&u.replace(/[^a-z0-9]/g,'').indexOf(norm)>=0)score+=80;
      if(/sample|preview/.test(t+u))score-=25;
      if(score>best.score||best===''){best={url:x.url,score:score};}
    }
    return best&&best.url?best.url:'';
  };

  C.codeFromVisible=function(html){return C.codeFromText(C.strip(html));};

  C.parseMovies=function(html,section){
    var s=C.s(html),groups={},order=[],re=/<a\b([^>]*)href=["']([^"']*\/c\/[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,g,href,inner,txt,at,im,ims,i,j;
    while((m=re.exec(s))){
      href=C.abs(m[2],C.base);if(!href)continue;
      g=groups[href];if(!g){g=groups[href]={href:href,start:m.index,end:re.lastIndex,titles:[],images:[]};order.push(g);}else{if(m.index<g.start)g.start=m.index;if(re.lastIndex>g.end)g.end=re.lastIndex;}
      inner=m[4];txt=C.strip(inner);if(txt)g.titles.push(txt);
      at=(m[1]+' '+m[3]).match(/title=["']([^"']+)["']/i);if(at&&C.trim(C.decode(at[1])))g.titles.push(C.trim(C.decode(at[1])));
      im=inner.match(/<img\b[^>]*>/ig)||[];
      for(i=0;i<im.length;i++){
        at=im[i].match(/(?:alt|title)=["']([^"']+)["']/i);if(at&&C.trim(C.decode(at[1])))g.titles.push(C.trim(C.decode(at[1])));
        ims=C.imageCandidates(im[i],href);for(j=0;j<ims.length;j++)if(!C.isPlaceholderImage(ims[j]))g.images.push(ims[j]);
      }
    }
    var out=[],seenImg,before,after,plain,code,date,dm,flags,title,cand,k,bestScore,score,img,ctx;
    for(i=0;i<order.length;i++){
      g=order[i];before=s.substring(i>0?order[i-1].end:Math.max(0,g.start-420),g.start);after=s.substring(g.end,i+1<order.length?order[i+1].start:Math.min(s.length,g.end+900));
      plain=C.strip(after);code=C.codeFromText(plain);dm=plain.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/);date=dm?dm[0].replace(/[\/.]/g,'-'):'';
      if(!code){plain=C.strip(before);code=C.codeFromText(plain);}if(!date){dm=C.strip(before).match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/);date=dm?dm[0].replace(/[\/.]/g,'-'):'';}
      ctx=s.substring(Math.max(0,g.start-260),Math.min(s.length,g.end+420));plain=C.strip(ctx+' '+after);
      flags=[];if(/磁力下载|磁力下載|磁力资源/.test(plain))flags.push('磁力');if(/无码破解|無碼流出/.test(plain))flags.push('无码');if(/高清资源|高清資源|\bHD\b/.test(plain))flags.push('高清');if(/中文字幕|字幕/.test(plain))flags.push('字幕');
      title='';bestScore=-9999;
      for(j=0;j<g.titles.length;j++){
        cand=C.trim(g.titles[j]);if(!cand||/^(有码|无码|歐美|欧美|国产|國產|详情|詳情)$/i.test(cand))continue;
        score=cand.length;if(code&&cand.toLowerCase()===code.toLowerCase())score-=100;if(/[\u3040-\u30ff\u3400-\u9fff]/.test(cand))score+=50;if(cand.length>12)score+=20;
        if(score>bestScore){bestScore=score;title=cand;}
      }
      if(!code){for(j=0;j<g.titles.length&&!code;j++)code=C.codeFromText(g.titles[j]);}
      if(!title||title.length<2)title=code||'影片';
      img='';seenImg={};
      for(j=0;j<g.images.length;j++){if(!seenImg[g.images[j]]){seenImg[g.images[j]]=1;img=g.images[j];break;}}
      if(!img)img=C.bestImageFromHtml(ctx,g.href,code);
      out.push({href:g.href,key:g.href,title:title,code:code,date:date,section:section||'',sectionName:C.sectionName(section||'normal'),flags:flags,img:C.image(img,g.href),rawImg:img});
    }
    return out;
  };

  C.metaImage=function(html,url){
    var s=C.s(html),re=/<meta\b[^>]*>/ig,m,t,p,cm,u;
    while((m=re.exec(s))){t=m[0];if(!/(?:og:image|twitter:image)/i.test(t))continue;cm=t.match(/content=["']([^"']+)["']/i);if(!cm)continue;u=C.abs(cm[1],url);if(u&&!C.isPlaceholderImage(u))return u;}
    re=/<link\b[^>]*>/ig;while((m=re.exec(s))){t=m[0];if(!/rel=["'][^"']*image_src/i.test(t))continue;cm=t.match(/href=["']([^"']+)["']/i);u=cm?C.abs(cm[1],url):'';if(u&&!C.isPlaceholderImage(u))return u;}
    cm=s.match(/["']image["']\s*:\s*(?:["']([^"']+)["']|\[\s*["']([^"']+)["'])/i);u=cm?C.abs(cm[1]||cm[2],url):'';return u&&!C.isPlaceholderImage(u)?u:'';
  };

  C.coverImage=function(html,url){
    var s=C.s(html),u=C.metaImage(s,url),cut,prefix,code;
    if(u)return u;
    code=C.codeFromVisible(s);
    cut=s.search(/预览视频|預覽視頻|预览图片|預覽圖片|sample/i);prefix=cut>0?s.substring(0,cut):s.substring(0,Math.min(s.length,30000));
    u=C.bestImageFromHtml(prefix,url,code);if(u&&!C.isPlaceholderImage(u))return u;
    u=C.bestImageFromHtml(s,url,code);return u&&!C.isPlaceholderImage(u)?u:'';
  };

  C._test2BaseDetail=C.detail;
  C.detail=function(url){
    var d=C._test2BaseDetail(url);
    if(d&&(!d.cover||C.isPlaceholderImage(d.cover))){var h=d.renderedHtml||d.html||'';d.cover=C.coverImage(h,url);d.img=C.image(d.cover,url);}
    return d;
  };
})(MyAvCore);
