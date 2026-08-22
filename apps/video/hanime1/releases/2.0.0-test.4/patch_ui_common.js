/* Hanime1 2.0.0-test.4 UI helpers */
var HanimePatch4UI=(function(C,P,E,H){
  var BUILD=H.build, dec=H.dec, imageUrl=H.imageUrl;
  function pval(k,d){var v='';try{v=getParam(k)||'';}catch(e){}if(!v)try{if(MY_PARAMS&&MY_PARAMS[k]!=null)v=MY_PARAMS[k];}catch(x){}v=dec(v);return v||d||'';}
  function route(p,o){var q=[];Object.keys(o||{}).forEach(function(k){if(o[k]!==undefined&&o[k]!==null&&String(o[k])!=='')q.push(encodeURIComponent(k)+'='+encodeURIComponent(String(o[k])));});return 'hiker://page/'+p+'?rule=&simple=true'+(q.length?'&'+q.join('&'):'');}
  function section(t,s){return {title:t,desc:s||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function btn(t,u,c){return {title:t,url:u,col_type:c||'text_3',extra:{lineVisible:false}};}
  function vin(v,c){return {title:v.title||'未命名',desc:[v.duration,v.views,v.rating,v.artist,v.upload].filter(Boolean).join(' · '),pic_url:v.img||v.cover||'',url:route('hanimeDetail',{id:v.id,title:v.title}),col_type:c||'movie_3',extra:{lineVisible:false}};}
  function inputUrl(v,h,js){return 'input://'+JSON.stringify({value:v||'',hint:h||'',js:js});}
  function filterRow(d,label,opts,key,cur){d.push(section(label));for(var i=0;i<opts.length;i++){var o=opts[i];d.push({title:(String(o[1])===String(cur)?'● ':'')+o[0],url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return 'hiker://empty';},key,o[1]),col_type:'scroll_button'});}}
  return {build:BUILD,pval:pval,route:route,section:section,btn:btn,vin:vin,inputUrl:inputUrl,filterRow:filterRow,imageUrl:imageUrl,dec:dec};
})(HanimeCore,HanimeProvider,HanimePages,HanimePatch4Common);
