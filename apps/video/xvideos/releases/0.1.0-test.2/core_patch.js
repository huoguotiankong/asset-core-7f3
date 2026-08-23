/* XVideos Core Patch 0.1.0-test.2 - current video URL/frame-block parser */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test2 patch');
  var C=XVideosCore;
  C.version='0.1.0-test.2';
  C.build=10102;

  /* Current XVideos video paths are not numeric-only. Examples can use video.<opaque token>/slug. */
  C.isVideoLink=function(u){
    u=C.clean(u);
    if(!u)return false;
    var p=u.replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];
    if(/^\/videos(?:-|\/|$)/i.test(p))return false;
    return /^\/video(?:[.\-_]?[A-Za-z0-9]+)(?:\/|$)/i.test(p);
  };
  C.videoId=function(u){
    var p=C.s(u).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];
    var m=p.match(/^\/video(?:[.\-_]?)([A-Za-z0-9]+)/i);
    return m?m[1]:'';
  };

  function titleFromChunk(chunk,href){
    var a=C.allAnchors(chunk,href),i,n;
    for(i=0;i<a.length;i++){
      if(a[i].href===href){
        n=C.clean(a[i].title||a[i].text);
        if(n&&n.length>1&&n.length<240)return n;
      }
    }
    var m=chunk.match(/<div[^>]+class=["'][^"']*thumb-under[^"']*["'][^>]*>[\s\S]{0,1400}?<a[^>]*>([\s\S]*?)<\/a>/i)
      ||chunk.match(/(?:title|alt)\s*=\s*["']([^"']{2,240})["']/i);
    return m?C.strip(m[1]):'';
  }
  function viewsFromChunk(chunk){
    var m=chunk.match(/<p[^>]+class=["'][^"']*metadata[^"']*["'][^>]*>([\s\S]*?)<\/p>/i),x=m?C.strip(m[1]):'';
    if(!x)return'';
    var v=x.match(/([\d,.]+\s*[KMB]?)\s*(?:views?|vues|vistas|visualizaciones)?/i);
    return v?C.strip(v[1]):'';
  }
  function cardFromChunk(chunk,base){
    var a=C.allAnchors(chunk,base),href='',i;
    for(i=0;i<a.length;i++)if(C.isVideoLink(a[i].href)){href=a[i].href;break;}
    if(!href)return null;
    var title=titleFromChunk(chunk,href)||'Video',img=C.imgFrom(chunk,href),dur='',views=viewsFromChunk(chunk),pv='',id='';
    var dm=chunk.match(/<span[^>]+class=["'][^"']*duration[^"']*["'][^>]*>([^<]+)<\/span>/i)||chunk.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
    if(dm)dur=C.strip(dm[1]||dm[0]);
    var pvm=chunk.match(/data-pvv=["']([^"']+)["']/i);if(pvm)pv=C.abs(pvm[1],href);
    var im=chunk.match(/data-videoid=["']([^"']+)["']/i);id=im?C.clean(im[1]):C.videoId(href);
    return{url:href,title:title,img:C.image(img,href),rawImg:img,duration:dur,views:views,preview:pv,videoId:id,desc:[dur,views?views+' views':''].filter(function(x){return!!x;}).join(' · ')};
  }

  C.parseVideoCards=function(html,base){
    var s=C.s(html),out=[],seen={},starts=[],re=/<div\b[^>]*class=["'][^"']*\bframe-block\b[^"']*["'][^>]*>/ig,m,i,end,chunk,c;
    while((m=re.exec(s)))starts.push(m.index);
    for(i=0;i<starts.length;i++){
      end=i+1<starts.length?starts[i+1]:Math.min(s.length,starts[i]+9000);
      chunk=s.substring(starts[i],end);
      c=cardFromChunk(chunk,base||C.base());
      if(c&&c.url&&!seen[c.url]){seen[c.url]=1;out.push(c);}
    }
    if(out.length)return out;

    /* Fallback for layouts where frame-block is absent but video links are still present. */
    var a=C.allAnchors(s,base||C.base()),it,ctx;
    for(i=0;i<a.length;i++){
      it=a[i];if(!C.isVideoLink(it.href)||seen[it.href])continue;
      ctx=C.context(s,it.index,900,2600);c=cardFromChunk(ctx,it.href);
      if(!c)c={url:it.href,title:C.clean(it.title||it.text)||'Video',img:'',rawImg:'',duration:'',views:'',preview:'',videoId:C.videoId(it.href),desc:''};
      c.url=it.href;
      if(!c.title||c.title==='Video')c.title=C.clean(it.title||it.text)||c.title;
      if(!c.img){var raw=C.imgFrom(ctx,it.href);c.rawImg=raw;c.img=C.image(raw,it.href);}
      seen[it.href]=1;out.push(c);
    }
    return out;
  };
})();
