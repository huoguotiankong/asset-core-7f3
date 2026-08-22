/* Hanime1 Test9 UI helpers */
var HanimeUI9=(function(){
function dec(v){v=String(v==null?'':v);for(var i=0;i<2;i++){try{var n=decodeURIComponent(v);if(n===v)break;v=n;}catch(e){break;}}return v;}
function pv(k,d){try{var x=getParam(k);if(x!==undefined&&x!==null&&String(x)!=='')return dec(x);}catch(e){}try{if(MY_PARAMS&&MY_PARAMS[k]!==undefined)return dec(MY_PARAMS[k]);}catch(y){}return d||'';}
function route(p,o){var q=[];Object.keys(o||{}).forEach(function(k){if(o[k]!==undefined&&o[k]!==null&&String(o[k])!=='')q.push(encodeURIComponent(k)+'='+encodeURIComponent(String(o[k])));});return 'hiker://page/'+p+'?rule=&simple=true'+(q.length?'&'+q.join('&'):'');}
function sec(t,d){return {title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function btn(t,u,c){return {title:t,url:u,col_type:c||'text_3',extra:{lineVisible:false}};}
function chip(t,u,on){return {title:(on?'✓ ':'')+t,url:u||'hiker://empty',col_type:'flex_button',extra:{lineVisible:false}};}
function video(x,c){return {title:x.title||'未命名',desc:[x.duration,x.views,x.rating,x.artist,x.upload].filter(Boolean).join(' · '),pic_url:x.img||x.cover||'',url:route('hanimeDetail',{id:x.id,title:x.title}),col_type:c||'movie_3_marquee',extra:{lineVisible:false}};}
function comic(x){return {title:x.title||'漫画',pic_url:x.img||x.cover||'',url:route('hanimeComicDetail',{id:x.id,title:x.title}),col_type:'movie_3_marquee',extra:{lineVisible:false}};}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function label(a,v){for(var i=0;i<(a||[]).length;i++)if(String(a[i][1])===String(v))return a[i][0];return v||'全部';}
return {dec:dec,pv:pv,route:route,sec:sec,btn:btn,chip:chip,video:video,comic:comic,esc:esc,label:label};
})();
