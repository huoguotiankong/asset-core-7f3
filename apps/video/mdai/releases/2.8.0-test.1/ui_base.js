/* MDAI Native UI base 2.8.0-test.1 */
var MDAIUIBaseV280=(function(){
  var V='2.8.0-test.1';
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/mdai/';
  var ASSET=ROOT+'assets/v270/';
  var DESIGN={
    brand:'#9636FF',accent:'#3BB8FF',active:'#F1E8FF',soft:'#F7F7FA',muted:'#777E8C',
    icon:ROOT+'assets/mdai_official.svg',
    icons:{library:ASSET+'library.svg',fav:ASSET+'favorite.svg',history:ASSET+'history.svg',settings:ASSET+'settings.svg',user:ASSET+'user.svg'}
  };
  function enc(v){return encodeURIComponent(String(v==null?'':v));}
  function qp(n,d){try{var v=getParam(n);return v==null||v===''?d:v;}catch(e){return d;}}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true';p=p||{};Object.keys(p).forEach(function(k){if(p[k]!=null&&String(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);});return u;}
  function id(x){return x&&x.id!=null?x.id:(x&&x.videoId!=null?x.videoId:(x&&x.shortDramaId!=null?x.shortDramaId:''));}
  function title(c,x){return c.cleanText((x&&(x.title!=null?x.title:x.name))||'')||'未命名';}
  function cover(c,x){x=x||{};return c.image(x.coverUrl||x.cover||x.image||x.picUrl||'');}
  function meta(c,x,type){x=x||{};var a=[];if(type==='drama'){var n=x.episodeCount!=null?x.episodeCount:(Array.isArray(x.episodes)?x.episodes.length:0);if(n)a.push(n+' 集');if(x.heatCount!=null)a.push('热度 '+c.compactNum(x.heatCount));}else{var du=c.fmtDuration(x.durationSec);if(du)a.push(du);if(x.viewCount!=null)a.push('播放 '+c.compactNum(x.viewCount));if(x.categoryName)a.push(c.cleanText(x.categoryName));}if(x.publishedAt)a.push(c.fmtDate(x.publishedAt).slice(5,10));return a.join(' · ');}
  function section(c,t,s,u){return{title:c.maskText(t),desc:(s?c.maskText(s):'')+(u?'  ›':''),url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function detailUrl(c,x,type){return page('mdaiDetail',{id:id(x),type:type||'video',title:title(c,x),cover:cover(c,x)});}
  function card(c,x,type,col){var cv=cover(c,x);return{title:title(c,x),desc:meta(c,x,type),img:cv,pic_url:cv,url:detailUrl(c,x,type),col_type:col||(type==='drama'?'movie_3':'movie_2'),extra:{lineVisible:false}};}
  function localCard(c,x,col){x=x||{};var type=x.type||'video';return{title:x.title||'未命名',desc:x.desc||'',img:x.cover||'',pic_url:x.cover||'',url:page('mdaiDetail',{id:x.id||'',type:type,title:x.title||'',cover:x.cover||''}),col_type:col||(type==='drama'?'movie_3':'movie_2'),extra:{lineVisible:false}};}
  function seed(x){x=x||{};var o={},ks=['videoUrl','m3u8Url','hlsUrl','playUrl','sourceUrl','src','url'];for(var i=0;i<ks.length;i++)if(x[ks[i]]!=null&&String(x[ks[i]]).trim())o[ks[i]]=x[ks[i]];return JSON.stringify(o);}
  function chip(title,on,url,col){return{title:title,url:url,col_type:col||'flex_button',extra:{backgroundColor:on?DESIGN.active:'',lineVisible:false}};}
  function stateUrl(key,value){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,String(value));}
  function toggleVarUrl(key,onValue){return $('#noLoading#').lazyRule(function(k,v){if(getMyVar(k,'')===v)clearMyVar(k);else putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,String(onValue));}
  function homeTab(c,d,label,value){var key='mdai_home_tab_v280',cur=getMyVar(key,'recommend')||'recommend',on=cur===value;d.push(chip(label,on,stateUrl(key,value),'text_4'));}
  function quick(d,t,img,u){d.push({title:t,img:img,url:u,col_type:'icon_small_4',extra:{lineVisible:false}});}
  function hero(c,x,type){var cv=cover(c,x);return{title:title(c,x),desc:meta(c,x,type),img:cv,pic_url:cv,url:detailUrl(c,x,type),col_type:type==='drama'?'movie_1_vertical_pic_blur':'movie_1_left_pic',extra:{gradient:type==='drama',lineVisible:false}};}
  return{version:V,design:DESIGN,enc:enc,qp:qp,page:page,id:id,title:title,cover:cover,meta:meta,section:section,line:line,blank:blank,empty:empty,detailUrl:detailUrl,card:card,localCard:localCard,seed:seed,chip:chip,stateUrl:stateUrl,toggleVarUrl:toggleVarUrl,homeTab:homeTab,quick:quick,hero:hero};
})();
