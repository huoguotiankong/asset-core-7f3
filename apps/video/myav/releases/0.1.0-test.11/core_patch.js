/* MyAv 0.1.0-test.11 - persistent full filter control source */
(function(C){
if(!C)throw new Error('MyAvCore missing for Test11');
C.version='0.1.0-test.11';C.build=10111;
C.asFullFilterUrl=function(u){
  u=C.s(u||C.fullFilterRoot||C.base+'/default.cpp?Ttype=2');
  if(u.indexOf('/default.cpp')<0)return C.fullFilterRoot;
  if(/[?&]Ttype=\d+/i.test(u))return u.replace(/([?&]Ttype=)\d+/i,'$12');
  return u+(u.indexOf('?')>=0?'&':'?')+'Ttype=2';
};
C.filterCompleteness=function(g){
  g=g||{};var y=(g.years||[]).length,t=(g.tags||[]).length,p=(g.play||[]).length,o=(g.other||[]).length,c=(g.category||[]).length;
  return y*4+t*5+p*6+o*2+c;
};
C.fullFilterControl=function(resultUrl){
  var u=C.asFullFilterUrl(resultUrl),raw=C.fetchHtml(u),g=C.fullFilterGroups(raw,u),best={url:u,html:raw,groups:g,rendered:false},score=C.filterCompleteness(g);
  if((g.years||[]).length<30||(g.tags||[]).length<40||(g.play||[]).length<8){
    var wh=C.fetchRendered(u);
    if(wh&&wh.length>500){var wg=C.fullFilterGroups(wh,u),ws=C.filterCompleteness(wg);if(ws>score)best={url:u,html:wh,groups:wg,rendered:true};}
  }
  return best;
};
})(MyAvCore);
