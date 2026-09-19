/* ACFAN 0.1.0-test.1 native UI */
var ACFANUI=(function(){
  var C=ACFANCore,I=ACFANImage;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfan/assets/v1/';
  var D={brand:'#FF5B57',active:'#FFE8E6',muted:'#7D818A',icons:{logo:ROOT+'logo.svg',search:ROOT+'search.svg',fav:ROOT+'fav.svg',history:ROOT+'history.svg',settings:ROOT+'settings.svg',play:ROOT+'play.svg'}};
  function line(){return{col_type:'line_blank'};}
  function section(title,desc,url){return{title:C.clean(title),desc:desc?C.clean(desc):'',url:url||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function chip(title,on,url,col){return{title:on?'““””<b><font color="'+D.brand+'">'+C.clean(title)+'</font></b>':C.clean(title),url:url,col_type:col||'scroll_button',extra:{backgroundColor:on?D.active:'',lineVisible:false}};}
  function state(key,val){return $('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,String(val));}
  function empty(title,desc){return{title:title||'暂无内容',desc:desc||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function quick(title,img,url){return{title:title,img:img,url:url,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function card(info,forceKind){info=info||{};var kind=forceKind||info.kind||'video',img=I.url(info.img||''),desc='';if(kind==='video'||kind==='short'){var m=[];if(info.watch)m.push('播放 '+C.fmtNum(info.watch));if(info.duration)m.push(C.s(info.duration));if(!m.length&&info.author)m.push(info.author);desc=m.join(' · ');}else if(kind==='community'){var m2=[];if(info.author)m2.push(info.author);if(info.like)m2.push('赞 '+C.fmtNum(info.like));if(info.comment)m2.push('评 '+C.fmtNum(info.comment));desc=m2.join(' · ');}else desc=[info.author,info.desc].filter(Boolean).join(' · ');var col=kind==='community'?'movie_1_vertical_pic':(kind==='video'?'movie_2':'movie_3');var data={kind:kind,id:info.id,title:info.title,img:info.img||'',author:info.author||'',desc:info.desc||'',uri:info.uri||''};return{title:C.clean(info.title||'未命名'),desc:C.clean(desc),img:img,pic_url:img,url:C.page('acfanDetail',{acf_kind:kind,acf_id:info.id||'',acf_title:info.title||'',acf_img:info.img||''}),col_type:col,extra:{lineVisible:false,acf_data:JSON.stringify(data)}};}
  return{design:D,line:line,section:section,chip:chip,state:state,empty:empty,quick:quick,card:card};
})();
