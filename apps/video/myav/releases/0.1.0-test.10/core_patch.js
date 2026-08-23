/* MyAv 0.1.0-test.10 - scoped detail metadata + complete filter groups */
(function(C){
if(!C)throw new Error('MyAvCore missing for Test10');
C.version='0.1.0-test.10';C.build=10110;
C.fullFilterRoot='https://javlist.me/default.cpp?Ttype=2';

C._test10LayoutReset=C.layoutReset;
C.layoutReset=function(){
  try{if(C._test10LayoutReset)C._test10LayoutReset();}catch(e){}
  var xs=['rankings','favorites_movies','favorites_actors'],i;
  for(i=0;i<xs.length;i++){try{clearItem(C.layoutKey(xs[i]));}catch(e2){}}
};

C.detailInfoScope=function(html){
  var s=C.s(html),starts=['番号:','番號:','番号：','番號：','发布时间:','發布時間:'],i,p=-1,q=-1,ends=['故事简介','故事簡介','预览视频','預覽視頻','磁力地址','磁力資源','预览图片','預覽圖片'];
  for(i=0;i<starts.length;i++){p=s.indexOf(starts[i]);if(p>=0)break;}
  if(p<0)return'';
  for(i=0;i<ends.length;i++){var x=s.indexOf(ends[i],p+1);if(x>=0&&(q<0||x<q))q=x;}
  if(q<0)q=Math.min(s.length,p+18000);
  return s.substring(p,q);
};
C.detailFieldLinks=function(scope,labels,nextLabels,url){
  var s=C.s(scope),p=-1,i,startLabel='',q=-1;
  labels=labels instanceof Array?labels:[labels];nextLabels=nextLabels||[];
  for(i=0;i<labels.length;i++){p=s.indexOf(labels[i]);if(p>=0){startLabel=labels[i];break;}}
  if(p<0)return[];
  for(i=0;i<nextLabels.length;i++){var x=s.indexOf(nextLabels[i],p+startLabel.length);if(x>=0&&(q<0||x<q))q=x;}
  if(q<0)q=Math.min(s.length,p+2200);
  var seg=s.substring(p+startLabel.length,q),a=C.allAnchors(seg,url||C.base),out=[],seen={},j,h;
  for(j=0;j<a.length;j++){
    h=C.s(a[j].href);
    if(!/^https?:\/\/javlist\.me\/t(?:\d+)?\//i.test(h))continue;
    if(seen[h]||!C.trim(a[j].text))continue;
    seen[h]=1;out.push({name:C.trim(a[j].text),href:h});
  }
  return out;
};
C._test10ParseDetail=C.parseDetail;
C.parseDetail=function(html,url){
  var d=C._test10ParseDetail(html,url),scope=C.detailInfoScope(html);
  if(!scope)return d;
  d.director=C.detailFieldLinks(scope,['导演:','導演:','导演：','導演：'],['片商:','片商：'],url);
  d.maker=C.detailFieldLinks(scope,['片商:','片商：'],['系列:','系列：','類別:','类别:'],url);
  d.series=C.detailFieldLinks(scope,['系列:','系列：'],['類別:','类别:','類別：','类别：','演員:','演员:'],url);
  d.category=C.detailFieldLinks(scope,['類別:','类别:','類別：','类别：'],['演員:','演员:','演員：','演员：','男优:','男優:'],url);
  d.actors=C.detailFieldLinks(scope,['演員:','演员:','演員：','演员：'],['男优:','男優:','男优：','男優：','TAG:','TAG：'],url);
  d.maleActors=C.detailFieldLinks(scope,['男优:','男優:','男优：','男優：'],['TAG:','TAG：','故事简介','故事簡介'],url);
  d.tags=C.detailFieldLinks(scope,['TAG:','TAG：'],['故事简介','故事簡介','预览视频','預覽視頻'],url);
  return d;
};

C.filterAnchorsBetween=function(html,base,starts,ends){
  var s=C.s(html),p=-1,sl='',i,q=-1;
  for(i=0;i<starts.length;i++){p=s.indexOf(starts[i]);if(p>=0){sl=starts[i];break;}}
  if(p<0)return[];
  for(i=0;i<ends.length;i++){var x=s.indexOf(ends[i],p+sl.length);if(x>=0&&(q<0||x<q))q=x;}
  if(q<0)q=Math.min(s.length,p+30000);
  var a=C.allAnchors(s.substring(p,q),base),out=[],seen={},j,k,t;
  for(j=0;j<a.length;j++){
    t=C.trim(a[j].text);if(!t||/^(更多选项|更多選項|收起选项|收起選項|更多)$/.test(t))continue;
    k=t+'|'+a[j].href;if(seen[k])continue;seen[k]=1;out.push(a[j]);
  }
  return out;
};
C.fullFilterGroups=function(html,base){
  return{
    category:C.filterAnchorsBetween(html,base,['分类:','分類:','分类：','分類：'],['年份:','年份：']),
    years:C.filterAnchorsBetween(html,base,['年份:','年份：'],['标签:','標籤:','标签：','標籤：']),
    tags:C.filterAnchorsBetween(html,base,['标签:','標籤:','标签：','標籤：'],['玩法:','玩法：','其它:','其他:','其它：','其他：']),
    play:C.filterAnchorsBetween(html,base,['玩法:','玩法：'],['其它:','其他:','其它：','其他：','首页','首頁']),
    other:C.filterAnchorsBetween(html,base,['其它:','其他:','其它：','其他：'],['首页','首頁','上一页','上一頁'])
  };
};
})(MyAvCore);
