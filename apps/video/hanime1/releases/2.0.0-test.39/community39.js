/* Hanime1 Test39 community: mirror upstream reply DOM grouping exactly */
(function(C,P,E,H){
var CACHE_PREFIX='hanime39_reply_cache_',CACHE_TTL=20000;
function clean(v){var s=String(v==null?'':v).trim();if(!s||s==='null'||s==='undefined')return '';try{s=C.clean(s);}catch(e){}s=String(s==null?'':s).trim();return (s==='null'||s==='undefined')?'':s;}
function nodes(h,s){try{return pdfa(String(h||''),s)||[];}catch(e){return [];}}
function text(n,s){try{return clean(pdfh(n,s)||'');}catch(e){return '';}}
function attr(n,s){try{var v=String(pdfh(n,s)||'').replace(/&amp;/g,'&').trim();return (v==='null'||v==='undefined')?'':v;}catch(e){return '';}}
function firstText(n,a){for(var i=0;i<a.length;i++){var v=text(n,a[i]);if(v)return v;}return '';}
function firstAttr(n,a){for(var i=0;i<a.length;i++){var v=attr(n,a[i]);if(v)return v;}return '';}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function ck(id){return CACHE_PREFIX+String(id||'');}
function readCache(id){try{var x=JSON.parse(getItem(ck(id),'')||'null');if(!x||!x.ts||!Array.isArray(x.items)||Date.now()-Number(x.ts)>CACHE_TTL){clearItem(ck(id));return null;}return x.items;}catch(e){return null;}}
function writeCache(id,a){if(a&&a.length)try{setItem(ck(id),JSON.stringify({ts:Date.now(),items:a}));}catch(e){}}
P.clearReplyCache39=function(id){try{clearItem(ck(id));}catch(e){}};
function parseReplyBody(body,base){var rootKids=nodes(body,'div[id^=reply-start] > *');if(!rootKids.length)rootKids=nodes(body,'div[id^=reply-start]&&div');var out=[];
  for(var i=0;i+1<rootKids.length;i+=2){var bodyNode=rootKids[i],postNode=rootKids[i+1],fields=nodes(bodyNode,'.comment-index-text');if(fields.length<2)continue;var user=firstText(fields[0],['a&&Text','Text']),content=text(fields[1],'Text');if(!user||!content)continue;out.push({user:user,content:content,time:firstText(fields[0],['span&&Text']),avatar:abs(base,firstAttr(bodyNode,['img&&src','img&&data-src'])),likeCount:firstText(postNode,['span[style]&&Text'])});}
  if(out.length)return out;
  var bodies=nodes(body,'div[id^=reply-start]&&.comment-index-text');for(var j=0;j+1<bodies.length;j+=2){var u=firstText(bodies[j],['a&&Text','Text']),c=text(bodies[j+1],'Text');if(u&&c)out.push({user:u,content:c,time:firstText(bodies[j],['span&&Text']),avatar:''});}
  return out;
}
P.replies=function(commentId){commentId=String(commentId||'');if(!commentId)return [];var cached=readCache(commentId);if(cached)return cached;var base=C.resolveHost(false),url=C.query(base+'/loadReplies',{id:commentId}),r=C.get(url,{base:base,referer:base+'/',timeout:14000});if(!r||r.challenge||Number(r.statusCode||0)>=400||!String(r.body||''))return [];var body=jsonPart(r.body,'replies'),out=parseReplyBody(body,base);writeCache(commentId,out);return out;};
function logged(){try{return !!P.profile();}catch(e){return false;}}
function replyAction(id,ok){return ok?('input://'+JSON.stringify({value:'',hint:'输入回复内容',js:"if(!input)return 'toast://回复不能为空';try{var p=$.require('hanime').provider();p.replyComment('"+id+"',input);if(p.clearReplyCache39)p.clearReplyCache39('"+id+"');refreshPage(false);return 'toast://回复已发布';}catch(e){return 'toast://'+String(e.message||e);}"})):H.route('hanimeLogin',{});}
function card(d,x){d.push({title:x.user||'匿名用户',desc:x.time||'',pic_url:x.avatar||'',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:x.content||'',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false,textSize:16}});d.push({col_type:'line'});}
E.repliesPage=function(){try{var id=H.pv('id',''),u=H.pv('user','回复'),expected=Number(H.pv('count','0')||0),a=P.replies(id)||[],d=[],ok=logged();setPageTitle(u+' · 回复');d.push(H.sec(u,'共 '+a.length+' 条回复'+(expected?(' · 原评论显示 '+expected+' 条'):'')));d.push(H.btn(ok?'回复此评论':'登录后回复',replyAction(id,ok),'text_center_1'));for(var i=0;i<a.length;i++)card(d,a[i]);if(!a.length)d.push(H.sec('暂未取得回复','已按官网当前 DOM：reply-start 直属子节点每 2 个一组解析。'));setResult(d);}catch(x){setResult([{title:'回复加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
