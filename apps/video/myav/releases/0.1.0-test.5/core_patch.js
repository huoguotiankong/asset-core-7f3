/* MyAv 0.1.0-test.5 - entity page metadata/filter parser */
(function(C){
  if(!C)throw new Error('MyAvCore missing for Test5 core patch');
  C.version='0.1.0-test.5';
  C.build=10105;

  C.simpleHash=function(v){
    var s=C.s(v),h=0,i;for(i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}if(h<0)h=-h;return h.toString(36);
  };
  C.entityType=function(name){
    name=C.s(name);
    if(/女优|女優/.test(name))return'actress';
    if(/男优|男優/.test(name))return'actor';
    if(/片商/.test(name))return'studio';
    if(/TAG|标签|標籤/i.test(name))return'tag';
    return'entity';
  };
  C.entityTypeLabel=function(type){return type==='actress'?'女优':type==='actor'?'男优':type==='studio'?'片商':type==='tag'?'TAG':'分类';};
  C.entityMeta=function(html,url,name,fallbackImg,typeOverride){
    var s=C.s(html),plain=C.strip(s),count=0,m,filters=[],seen={},seg,a,i,t,h,raw='',img='',cut,region,ims,j,cands,k,type=typeOverride||C.entityType(name);
    m=plain.match(/(?:\[|【)?\s*(\d{1,6})\s*(?:个|個)?\s*作品\s*(?:\]|】)?/i);if(m)count=parseInt(m[1],10)||0;
    cut=s.search(/筛选|篩選/);if(cut<0)cut=Math.min(s.length,30000);
    region=s.substring(Math.max(0,cut-8000),cut);
    if(fallbackImg)raw=C.abs(fallbackImg,url);
    ims=region.match(/<img\b[^>]*>/ig)||[];
    for(i=ims.length-1;i>=0&&!raw;i--){
      cands=C.imageCandidates?C.imageCandidates(ims[i],url):[];
      for(j=0;j<cands.length;j++){
        k=cands[j];if(!k)continue;if(C.isPlaceholderImage&&C.isPlaceholderImage(k))continue;if(/logo|favicon|icon|banner|qr/i.test(k))continue;raw=k;break;
      }
    }
    if(raw)img=C.image(raw,url);
    seg=C.segment(s,'筛选','首页');if(!seg)seg=C.segment(s,'篩選','首页');
    a=C.allAnchors(seg||s,url);
    for(i=0;i<a.length;i++){
      t=C.menuText?C.menuText(a[i].text):C.trim(a[i].text);
      if(!/^(全部|磁力|字幕|单体|單體|单体作品|單體作品|无码破解|無碼破解)$/.test(t))continue;
      h=C.abs(a[i].href,url);if(!h)continue;
      if(seg||h.indexOf(String(url).replace(/[?#].*$/,''))===0){if(!seen[t+'|'+h]){seen[t+'|'+h]=1;filters.push({text:t,href:h});}}
    }
    return{name:name||C.titleFromHtml(s)||'分类',type:type,typeLabel:C.entityTypeLabel(type),count:count,img:img,rawImg:raw,filters:filters};
  };
})(MyAvCore);
