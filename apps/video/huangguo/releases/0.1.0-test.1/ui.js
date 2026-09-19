/* 黄果短剧 0.1.0-test.1 Native UI Design System */
var HuangGuoUIV1=(function(){
  var C=HuangGuoCoreV1,I=HuangGuoImageV1;
  var AS='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/huangguo/assets/v1/';
  var D={brand:'#F6B73C',active:'#FFF2CC',muted:'#7A7F87',icons:{library:AS+'library.svg',rank:AS+'rank.svg',topic:AS+'topic.svg',mine:AS+'mine.svg',settings:AS+'settings.svg'}};
  function enc(v){return encodeURIComponent(String(v==null?'':v));}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true',k;p=p||{};for(k in p)if(Object.prototype.hasOwnProperty.call(p,k)&&p[k]!=null&&String(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);return u;}
  function line(){return{col_type:'line_blank'};}
  function section(t,s,u){return{title:C.mask(t),desc:s?C.mask(s):(u?'更多 ›':''),url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function state(key,val){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,String(val));}
  function chip(t,on,u,col){return{title:C.mask(t),url:u,col_type:col||'scroll_button',extra:{backgroundColor:on?D.active:'',lineVisible:false}};}
  function quick(t,img,u){return{title:t,img:img,url:u,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function card(x,col){x=x||{};var meta=[];if(x.ep)meta.push(x.ep);if(x.score)meta.push(x.score);if(x.badge)meta.push(x.badge);if(x.tags&&x.tags.length)meta.push(x.tags[0]);if(!meta.length&&x.desc)meta.push(x.desc);var cover=I.url(x.img||x.cover||'',C.origin(x.url||'' )+'/');return{title:C.mask(x.title||'未命名'),desc:C.mask(meta.join(' · ')),img:cover,pic_url:cover,url:page('hgdramaDetail',{hg_url:x.url||'',hg_title:x.title||'',hg_cover:x.img||x.cover||''}),col_type:col||getItem('huangguo_card_layout_v1','movie_3'),extra:{lineVisible:false,hg_url:x.url||'',hg_title:x.title||'',hg_cover:x.img||x.cover||''}};}
  function rankCard(x){x=x||{};var meta=[];if(x.score)meta.push('评分 '+x.score);if(x.tags&&x.tags.length)meta.push(x.tags.join(' / '));if(x.desc)meta.push(x.desc);var cover=I.url(x.img||'',C.origin(x.url||'')+'/');return{title:C.mask(x.title||'未命名'),desc:C.mask(meta.join('\n')),img:cover,pic_url:cover,url:page('hgdramaDetail',{hg_url:x.url||'',hg_title:x.title||'',hg_cover:x.img||''}),col_type:'movie_1_vertical_pic',extra:{lineVisible:false}};}
  return{version:'0.1.0-test.1',design:D,enc:enc,page:page,line:line,section:section,empty:empty,state:state,chip:chip,quick:quick,card:card,rankCard:rankCard};
})();
