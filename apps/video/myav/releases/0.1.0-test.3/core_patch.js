/* MyAv 0.1.0-test.3 - section route/detail-family parser patch */
(function(C){
  if(!C)throw new Error('MyAvCore missing for Test3 core patch');
  C.version='0.1.0-test.3';
  C.build=10103;

  C.detailPathRe=/\/c(?:3|4)?\//i;
  C.sectionLabel=function(id){return id==='western'?'欧美':id==='domestic'?'国产':id==='uncensored'?'无码':'有码';};
  C.sectionFallback=function(id){if(id==='western')return C.base+'/western.java';if(id==='domestic')return C.base+'/domestic_index.js';return C.base+'/default.cpp';};
  C.sectionUrl=function(id){
    id=id||'normal';var h=C.homeHtml(false),u='';
    if(id==='uncensored'){
      u=C.findLink(C.segment(h,'其它:','首页'),'無碼流出',C.base)||C.findLink(C.segment(h,'其它:','首页'),'无码流出',C.base)||C.findLink(h,'无码破解',C.base);
      return u||C.sectionFallback(id);
    }
    u=C.findLink(C.segment(h,'分类:','年份:'),C.sectionLabel(id),C.base)||C.findLink(h,C.sectionLabel(id),C.base);
    return u||C.sectionFallback(id);
  };

  C.detailFamily=function(href){href=C.s(href);if(/\/c4\//i.test(href))return'western';if(/\/c3\//i.test(href))return'domestic';return'normal';};
  C.sectionCode=function(text,section){
    var s=C.strip(text),m;
    if(section==='western'){
      m=s.match(/\b\d{2}\.\d{2}\.\d{2}\.[A-Za-z0-9][A-Za-z0-9._-]{1,100}\b/);if(m)return m[0];
    }
    if(section==='domestic'){
      m=s.match(/\b(?:EP\d{1,4}|(?:MD|MDSR|MFK|MGL|MCY|MAD|TZ|MDS|MDC|MDX|SWAG)[-_][A-Za-z0-9-]{2,30})\b/i);if(m)return m[0];
    }
    return C.codeFromText(s);
  };

  C.parseMovies=function(html,section){
    var s=C.s(html),groups={},order=[],re=/<a\b([^>]*)href=["']([^"']*\/c(?:3|4)?\/[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,g,href,inner,txt,at,im,ims,i,j;
    section=section||'normal';
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
    var out=[],seenImg,ctxStart,ctxEnd,ctx,plain,code,date,dm,flags,title,cand,bestScore,score,img,family;
    for(i=0;i<order.length;i++){
      g=order[i];family=C.detailFamily(g.href);if(section==='normal'&&family!=='normal')section=family;
      ctxStart=Math.max(0,i>0?order[i-1].end:g.start-650);ctxEnd=Math.min(s.length,i+1<order.length?order[i+1].start:g.end+850);if(ctxStart>=g.start)ctxStart=Math.max(0,g.start-260);if(ctxEnd<=g.end)ctxEnd=Math.min(s.length,g.end+420);
      ctx=s.substring(ctxStart,ctxEnd);plain=C.strip(ctx);code=C.sectionCode(plain,section);
      dm=plain.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/);date=dm?dm[0].replace(/[\/.]/g,'-'):'';
      flags=[];if(/磁力下载|磁力下載|磁力资源/.test(plain))flags.push('磁力');if(/无码破解|無碼流出/.test(plain))flags.push('无码');if(/高清资源|高清資源|\bHD\b/.test(plain))flags.push('高清');if(/中文字幕|字幕/.test(plain))flags.push('字幕');
      title='';bestScore=-9999;
      for(j=0;j<g.titles.length;j++){
        cand=C.trim(g.titles[j]);if(!cand||/^(有码|无码|歐美|欧美|国产|國產|详情|詳情)$/i.test(cand))continue;
        score=cand.length;if(code&&cand.toLowerCase()===code.toLowerCase())score-=100;if(/[\u3040-\u30ff\u3400-\u9fff]/.test(cand))score+=35;if(cand.length>12)score+=20;
        if(score>bestScore){bestScore=score;title=cand;}
      }
      if(!code){for(j=0;j<g.titles.length&&!code;j++)code=C.sectionCode(g.titles[j],section);}
      if(!title||title.length<2)title=code||'影片';
      img='';seenImg={};for(j=0;j<g.images.length;j++){if(!seenImg[g.images[j]]){seenImg[g.images[j]]=1;img=g.images[j];break;}}
      if(!img)img=C.bestImageFromHtml(ctx,g.href,code);
      out.push({href:g.href,key:g.href,title:title,code:code,date:date,section:section,sectionName:C.sectionName(section),flags:flags,img:C.image(img,g.href),rawImg:img});
    }
    return out;
  };

  C._test3BaseDetail=C.detail;
  C.detail=function(url){var d=C._test3BaseDetail(url);if(d){d.section=C.detailFamily(url);if(!d.code)d.code=C.sectionCode((d.title||'')+' '+C.strip(d.html||''),d.section);}return d;};
})(MyAvCore);
