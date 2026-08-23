/* 汤头条 0.1.0-test.4 Native UI - exact video cards */
var TangTouTiaoUIV013=(function(){
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/tangtoutiao/assets/v010/';
  var D={brand:'#F1263B',soft:'#FFF0F2',muted:'#858A96',dark:'#20232A',icons:{channel:ROOT+'nav_channel.svg',community:ROOT+'nav_community.svg',rank:ROOT+'nav_rank.svg',mine:ROOT+'nav_mine.svg',settings:ROOT+'nav_settings.svg'}};
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function section(t,d,u){return{title:String(t||''),desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function chip(t,on,u,col){return{title:(on?'● '+t:t),url:u||'hiker://empty',col_type:col||'scroll_button',extra:{lineVisible:false}};}
  function videoCard(c,x,col){var meta=[];if(x.author)meta.push(x.author);if(x.duration)meta.push(x.duration);if(x.plays)meta.push(x.plays);var p=c.routeParams?c.routeParams(x):{id:x.id,title:x.title,cover:x.cover,author:x.author};return{title:x.title||'未命名',desc:meta.join(' · '),img:x.cover||'',pic_url:x.cover||'',url:c.page('tttDetail',p),col_type:col||'movie_2',extra:{lineVisible:false,ttt_id:x.id}};}
  function icon(t,kind,u){return{title:t,img:D.icons[kind]||D.icons.channel,url:u,col_type:'icon_small_4',extra:{lineVisible:false}};}
  function state(k,v){return $('#noLoading#').lazyRule(function(a,b){putMyVar(a,b);refreshPage(false);return'hiker://empty';},k,String(v));}
  function error(t,e,u){return{title:'⚠ '+t,desc:String(e||'').substring(0,500),url:u||'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  return{design:D,empty:empty,section:section,line:line,blank:blank,chip:chip,videoCard:videoCard,icon:icon,state:state,error:error};
})();
