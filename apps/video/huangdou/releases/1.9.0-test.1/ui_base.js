/* 黄豆短剧 Native UI Base 1.9.0-test.1 */
var HuangDouUIV190=(function(){
  var V='1.9.0-test.1';
  var ASSET='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/huangdou/assets/v190/';
  var DESIGN={brand:'#F2BC3B',active:'#FFF3D4',muted:'#7C8494',icons:{library:ASSET+'library.svg',topic:ASSET+'topic.svg',mine:ASSET+'mine.svg',settings:ASSET+'settings.svg'}};
  function enc(v){return encodeURIComponent(String(v==null?'':v));}
  function qp(n,d){try{var v=getParam(n);return v==null||v===''?d:v;}catch(e){return d;}}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true';p=p||{};Object.keys(p).forEach(function(k){if(p[k]!=null&&String(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);});return u;}
  function section(c,t,s,u){return{title:c.maskText(t),desc:s?c.maskText(s):(u?'更多 ›':''),url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function card(c,x,col){x=x||{};var poster=c.imgUrl(x.img||''),meta=[];if(x.ep)meta.push(x.ep);if(x.heat)meta.push('热度 '+c.compactHeat(x.heat));if(x.tags&&x.tags.length)meta.push(c.maskText(x.tags[0]));return{title:c.maskText(x.title||'未命名'),desc:meta.join(' · '),img:poster,pic_url:poster,url:page('hddjDetail',{url:x.url||'',title:x.title||'',cover:poster}),col_type:col||getItem('hddj_col_v190','movie_3'),extra:{lineVisible:false}};}
  function topicCard(c,x){x=x||{};var poster=c.imgUrl(x.img||'');return{title:c.maskText(x.title||'专题'),desc:[x.count,c.maskText(x.desc||'')].filter(Boolean).join(' · '),img:poster,pic_url:poster,url:page('hddjTopic',{url:x.url||'',title:x.title||''}),col_type:'movie_2',extra:{lineVisible:false}};}
  function quick(d,t,img,u){d.push({title:t,img:img,url:u,col_type:'icon_small_4',extra:{lineVisible:false}});}
  function stateUrl(key,value,clearKeys){return $('#noLoading#').lazyRule(function(k,v,cks){putMyVar(k,String(v));try{var a=JSON.parse(cks||'[]');for(var i=0;i<a.length;i++)clearMyVar(a[i]);}catch(e){}refreshPage(false);return'hiker://empty';},key,String(value),JSON.stringify(clearKeys||[]));}
  function chip(title,on,url,col){return{title:title,url:url,col_type:col||'flex_button',extra:{backgroundColor:on?DESIGN.active:'',lineVisible:false}};}
  return{version:V,design:DESIGN,enc:enc,qp:qp,page:page,section:section,line:line,blank:blank,empty:empty,card:card,topicCard:topicCard,quick:quick,stateUrl:stateUrl,chip:chip};
})();
