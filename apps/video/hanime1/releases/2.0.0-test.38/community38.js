/* Hanime1 Test38 community: restore direct working reply contract + single-request avatar parsing */
(function(C,P,E,H){
var CACHE_PREFIX='hanime38_reply_cache_',CACHE_TTL=30000;
function clean(v){return C.clean(String(v==null?'':v));}
function nodes(h,s){try{return pdfa(String(h||''),s)||[];}catch(e){return [];}}
function text(n,s){try{return clean(pdfh(n,s)||'');}catch(e){return '';}}
function firstText(n,a){for(var i=0;i<a.length;i++){var v=text(n,a[i]);if(v)return v;}return '';}
function xa(h,path){try{if(typeof xpathArray==='function')return xpathArray(String(h||''),path)||[];if(typeof xpa==='function')return xpa(String(h||''),path)||[];}catch(e){}return [];}
function first(a){return a&&a.length?String(a[0]||'').replace(/&amp;/g,'&').trim():'';}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function cacheKey(id){return CACHE_PREFIX+String(id||'');}
function readCache(id){try{var raw=getItem(cacheKey(id),'');if(!raw)return null;var x=JSON.parse(raw);if(!x||!x.ts||!Array.isArray(x.items)||Date.now()-Number(x.ts)>CACHE_TTL){clearItem(cacheKey(id));return null;}return x.items;}catch(e){return null;}}
function writeCache(id,a){if(!a||!a.length)return;try{setItem(cacheKey(id),JSON.stringify({ts:Date.now(),items:a}));}catch(e){}}
P.clearReplyCache38=function(id){try{clearItem(cacheKey(id));}catch(e){}};
P.replies=function(commentId){
  commentId=String(commentId||'');if(!commentId)return [];
  var cached=readCache(commentId);if(cached)return cached;
  var base=C.resolveHost(false),url=C.query(base+'/loadReplies',{id:commentId}),r=C.get(url,{base:base,referer:base+'/',timeout:14000});
  if(!r||r.challenge||Number(r.statusCode||0)>=400||!String(r.body||''))return [];
  var body=jsonPart(r.body,'replies'),rows=nodes(body,'.comment-index-text'),avatars=xa(body,'//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src'),out=[];
  for(var i=0;i+1<rows.length;i+=2){var u=firstText(rows[i],['a&&Text','Text']),c=text(rows[i+1],'Text'),idx=Math.floor(i/2);if(u&&c)out.push({user:u,content:c,time:firstText(rows[i],['span&&Text']),avatar:abs(base,idx<avatars.length?avatars[idx]:'')});}
  if(!out.length){
    var blocks=xa(body,'//div[starts-with(@id,"reply-start")]/*');
    for(var b=0;b+1<blocks.length;b+=2){var g='<div>'+blocks[b]+'</div>',gg='<div>'+blocks[b+1]+'</div>',uu=clean(first(xa(g,'//a[1]//text()'))||first(xa(g,'//text()'))),cc=clean(first(xa(gg,'//text()'))),av=abs(base,first(xa(g,'//img[1]/@src')));if(uu&&cc)out.push({user:uu,content:cc,time:'',avatar:av});}
  }
  writeCache(commentId,out);return out;
};
function logged(){try{return !!P.profile();}catch(e){return false;}}
function compose(id,ok){return ok?('input://'+JSON.stringify({value:'',hint:'输入回复内容',js:"if(!input)return 'toast://回复不能为空';try{var p=$.require('hanime').provider();p.replyComment('"+id+"',input);if(p.clearReplyCache38)p.clearReplyCache38('"+id+"');refreshPage(false);return 'toast://回复已发布';}catch(e){return 'toast://'+String(e.message||e);}"})):H.route('hanimeLogin',{});}
function card(d,x){d.push({title:x.user||'匿名用户',desc:x.time||'',pic_url:x.avatar||'',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:x.content||'',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false,textSize:16}});d.push({col_type:'line'});}
E.repliesPage=function(){try{var id=H.pv('id',''),u=H.pv('user','回复'),expected=Number(H.pv('count','0')||0),a=P.replies(id)||[],d=[],ok=logged();setPageTitle(u+' · 回复');d.push(H.sec(u,'共 '+a.length+' 条回复'+(expected?(' · 原评论显示 '+expected+' 条'):'')));d.push(H.btn(ok?'回复此评论':'登录后回复',compose(id,ok),'text_center_1'));for(var i=0;i<a.length;i++)card(d,a[i]);if(!a.length)d.push(H.sec('暂未取得回复','已恢复 Test24 实机曾经可用的直接 commentId → /loadReplies 链；不再做评论顺序/指纹二次重定位。'));setResult(d);}catch(x){setResult([{title:'回复加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
