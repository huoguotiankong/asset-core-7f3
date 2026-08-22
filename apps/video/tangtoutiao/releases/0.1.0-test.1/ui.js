/* 汤头条 0.1.0-test.1 Native UI */
var TangTouTiaoUIV010=(function(){
  var D={brand:'#F1263B',soft:'#FFF0F2',muted:'#858A96',dark:'#20232A'};
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function section(t,d,u){return{title:'<b>'+String(t||'')+'</b>',desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function chip(t,on,u,col){return{title:(on?'<font color="'+D.brand+'"><b>'+t+'</b></font>':t),url:u||'hiker://empty',col_type:col||'scroll_button',extra:{lineVisible:false}};}
  function videoCard(c,x,col){var meta=[];if(x.author)meta.push(x.author);if(x.duration)meta.push(x.duration);return{title:x.title||'未命名',desc:meta.join(' · '),img:x.cover||'',pic_url:x.cover||'',url:c.page('tttDetail',{id:x.id,title:x.title,cover:x.cover,author:x.author}),col_type:col||'movie_2',extra:{lineVisible:false,ttt_id:x.id}};}
  function icon(t,emoji,u){return{title:t,img:'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="28" fill="#FFF3F4"/><text x="64" y="78" font-size="54" text-anchor="middle">'+emoji+'</text></svg>'),url:u,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function state(k,v){return $('#noLoading#').lazyRule(function(a,b){putMyVar(a,b);refreshPage(false);return'hiker://empty';},k,String(v));}
  function error(t,e,u){return{title:'⚠ '+t,desc:String(e||'').substring(0,500),url:u||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  return{design:D,empty:empty,section:section,line:line,blank:blank,chip:chip,videoCard:videoCard,icon:icon,state:state,error:error};
})();
