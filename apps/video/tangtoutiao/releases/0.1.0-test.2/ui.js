/* 汤头条 0.1.0-test.2 Native UI - plain-text compatible */
var TangTouTiaoUIV011=(function(){
  var D={brand:'#F1263B',soft:'#FFF0F2',muted:'#858A96',dark:'#20232A'};
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function section(t,d,u){return{title:String(t||''),desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function chip(t,on,u,col){return{title:(on?'● '+t:t),url:u||'hiker://empty',col_type:col||'scroll_button',extra:{lineVisible:false}};}
  function videoCard(c,x,col){var meta=[];if(x.author)meta.push(x.author);if(x.duration)meta.push(x.duration);return{title:x.title||'未命名',desc:meta.join(' · '),img:x.cover||'',pic_url:x.cover||'',url:c.page('tttDetail',{id:x.id,title:x.title,cover:x.cover,author:x.author}),col_type:col||'movie_2',extra:{lineVisible:false,ttt_id:x.id}};}
  function svg(kind){var body='';if(kind==='channel')body='<rect x="31" y="31" width="22" height="22" rx="5"/><rect x="75" y="31" width="22" height="22" rx="5"/><rect x="31" y="75" width="22" height="22" rx="5"/><rect x="75" y="75" width="22" height="22" rx="5"/>';else if(kind==='community')body='<path d="M27 35h74v46H62L43 98v-17H27z"/><circle cx="48" cy="58" r="5"/><circle cx="64" cy="58" r="5"/><circle cx="80" cy="58" r="5"/>';else if(kind==='rank')body='<rect x="27" y="68" width="18" height="29" rx="4"/><rect x="55" y="48" width="18" height="49" rx="4"/><rect x="83" y="31" width="18" height="66" rx="4"/>';else if(kind==='mine')body='<circle cx="64" cy="48" r="20"/><path d="M29 100c5-23 20-34 35-34s30 11 35 34z"/>';else body='<circle cx="64" cy="64" r="28"/><circle cx="64" cy="64" r="10"/>';return'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="32" fill="#FFF0F2"/><g fill="#F1263B">'+body+'</g></svg>');}
  function icon(t,kind,u){return{title:t,img:svg(kind),url:u,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function state(k,v){return $('#noLoading#').lazyRule(function(a,b){putMyVar(a,b);refreshPage(false);return'hiker://empty';},k,String(v));}
  function error(t,e,u){return{title:'⚠ '+t,desc:String(e||'').substring(0,500),url:u||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  return{design:D,empty:empty,section:section,line:line,blank:blank,chip:chip,videoCard:videoCard,icon:icon,state:state,error:error};
})();
