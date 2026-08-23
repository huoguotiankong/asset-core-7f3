/* MyAv 0.1.0-test.4 - complete menu/index + magnet parser patch */
(function(C){
  if(!C)throw new Error('MyAvCore missing for Test4 core patch');
  C.version='0.1.0-test.4';
  C.build=10104;

  C.menuText=function(t){return C.trim(C.s(t).replace(/[▼▾▽]/g,'').replace(/[:：]+$/,''));};
  C.navGroup=function(start,end){
    var a=C.allAnchors(C.homeHtml(false),C.base),out=[],seen={},on=false,i,n,k;
    for(i=0;i<a.length;i++){
      n=C.menuText(a[i].text);
      if(!on){if(n===start){on=true;}continue;}
      if(end&&n===end)break;
      if(/^(分类|标签分类|有码热门|片商新番|排行榜|搜索)$/.test(n))break;
      if(!n||n==='点击获取')continue;
      k=n+'|'+a[i].href;if(seen[k])continue;seen[k]=1;
      out.push({text:n,href:a[i].href});
    }
    return out;
  };
  C.menuGroups=function(){
    return{
      categories:C.navGroup('分类','标签分类'),
      tags:C.navGroup('标签分类','有码热门'),
      hot:C.navGroup('有码热门','片商新番'),
      studios:C.navGroup('片商新番','排行榜'),
      search:C.navGroup('搜索','')
    };
  };

  C.sectionForIndex=function(url,name){
    url=C.s(url);name=C.s(name);
    if(/western_cat|western/i.test(url)||/^欧美/.test(name))return'western';
    if(/domestic_cat|domestic/i.test(url)||/^国产/.test(name))return'domestic';
    return'normal';
  };

  C.parseIndexEntries=function(html,url,name){
    var s=C.s(html),a=C.allAnchors(s,url),out=[],seen={},start=-1,end=1e15,homeCount=0,i,x,t,h,img,ctxFrom,ctxTo,ctx,sec=C.sectionForIndex(url,name);
    for(i=0;i<a.length;i++){
      if(C.menuText(a[i].text)==='首页'){
        homeCount++;
        if(homeCount===1)start=a[i].index;
        else if(homeCount===2){end=a[i].index;break;}
      }
    }
    if(start<0)start=0;
    for(i=0;i<a.length;i++){
      x=a[i];if(x.index<=start||x.index>=end)continue;
      t=C.menuText(x.text);
      if(!t||/^(首页|上一页|下一页|最大页\d*|\d+)$/.test(t))continue;
      h=C.abs(x.href,url);if(!h||seen[h])continue;
      if(C.detailPathRe&&C.detailPathRe.test(h))continue;
      if(!/\/t(?:\d+)?\//i.test(h)&&!/\/(?:default\.cpp|western\.java|domestic_index\.js)(?:\?|$)/i.test(h))continue;
      seen[h]=1;img='';
      if(/<img\b/i.test(x.raw||''))img=C.attrImage(x.raw,h);
      out.push({text:t,href:h,img:img?C.image(img,h):'',rawImg:img||'',section:sec});
    }
    return out;
  };

  C.magnetBlock=function(s,start,end){
    var specs=[['<tr','</tr>'],['<li','</li>'],['<p','</p>'],['<div','</div>']],i,b,e;
    for(i=0;i<specs.length;i++){
      b=s.lastIndexOf(specs[i][0],start);e=s.indexOf(specs[i][1],end);
      if(b>=0&&e>0&&e-b<5000)return s.substring(b,e+specs[i][1].length);
    }
    return s.substring(Math.max(0,start-900),Math.min(s.length,end+900));
  };
  C.cleanMagnetTitle=function(v){
    var t=C.strip(v).replace(/^\s*[\[【]?javlist\.me[\]】]?\s*/i,'').replace(/^\s*[\[【]?javlist[\]】]?\s*/i,'');
    t=t.replace(/^(?:磁力(?:资源|下載|下载)?|下載|下载|复制)\s*[:：-]?\s*/i,'');
    t=C.trim(t);
    if(/^(?:(?:中文字幕|中字|字幕|高清|FHD|HD|2160p|1080p)(?:\s+|·|\/|\|)*)+$/i.test(t))return'';
    return t;
  };
  C.parseMagnets=function(html){
    var s=C.decode(C.s(html)),out=[],seen={},re=/<a\b([^>]*)href=["'](magnet:\?xt=urn:btih:[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,link,block,plain,size,date,title,dm,anchorText,tm;
    function push(link,start,end,inner){
      link=C.decode(link).replace(/&amp;/ig,'&');if(seen[link])return;seen[link]=1;
      block=C.magnetBlock(s,start,end);plain=C.strip(block);
      size=(plain.match(/\b\d+(?:\.\d+)?\s*(?:TB|GB|MB|KB)\b/i)||[''])[0];
      date=(plain.match(/20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}/)||[''])[0].replace(/[\/.]/g,'-');
      title='';dm=link.match(/[?&]dn=([^&]+)/i);
      if(dm){try{title=decodeURIComponent(dm[1].replace(/\+/g,' '));}catch(e){title=dm[1];}}
      anchorText=C.cleanMagnetTitle(inner||'');if(!title&&anchorText&&!/^\[?javlist\.me\]?$/i.test(anchorText))title=anchorText;
      if(!title){
        tm=plain.replace(/\[?javlist\.me\]?/ig,' ').replace(/magnet:\?xt=urn:btih:[^\s]+/ig,' ').replace(size,' ').replace(date,' ').replace(/点击复制|長按|长按|发送到云盘小程序|磁力资源|复制/ig,' ');
        tm=C.trim(tm.replace(/\s+/g,' '));if(tm.length>=3&&tm.length<=160)title=tm;
      }
      out.push({link:link,title:C.cleanMagnetTitle(title),size:size,date:date,hd:/高清|FHD|(?:^|\s)HD(?:\s|$)|2160p|1080p/i.test(plain),sub:/中文字幕|中字|字幕|CHS|CHT|SUB/i.test(plain)});
    }
    while((m=re.exec(s)))push(m[2],m.index,re.lastIndex,m[4]);
    re=/(magnet:\?xt=urn:btih:[^\s"'<>]+)/ig;
    while((m=re.exec(s)))push(m[1],m.index,re.lastIndex,'');
    return out;
  };
  C.magnetBytes=function(size){var m=C.s(size).match(/([\d.]+)\s*(TB|GB|MB|KB)/i);if(!m)return 0;var n=parseFloat(m[1])||0,u=m[2].toUpperCase();return n*(u==='TB'?1099511627776:u==='GB'?1073741824:u==='MB'?1048576:1024);};

  C._test4BaseDetail=C.detail;
  C.detail=function(url){
    var d=C._test4BaseDetail(url),i,m,code;
    if(!d)return d;code=C.s(d.code).toUpperCase();
    for(i=0;i<(d.magnets||[]).length;i++){
      m=d.magnets[i];
      if(!m.title||/^\[?javlist(?:\.me)?\]?$/i.test(C.trim(m.title))||m.title==='磁力资源')m.title=(code||'资源')+' · 资源 '+('0'+(i+1)).slice(-2);
    }
    return d;
  };
})(MyAvCore);
