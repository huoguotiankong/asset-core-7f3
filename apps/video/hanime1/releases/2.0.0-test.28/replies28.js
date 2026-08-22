/* Hanime1 Test28 replies recovery: one request, non-empty cache only */
(function(C,P,E,H){
var PREFIX='hanime_reply_cache28_';
var TTL=90000;
function clean(v){return C.clean(String(v==null?'':v));}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function nodes(html,sel){try{return pdfa(String(html||''),sel)||[];}catch(e){return [];}}
function text(node,sel){try{return clean(pdfh(node,sel)||'');}catch(e){return '';}}
function attr(node,sel){try{return String(pdfh(node,sel)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
function firstText(node,sels){for(var i=0;i<sels.length;i++){var v=text(node,sels[i]);if(v)return v;}return '';}
function firstAttr(node,sels){for(var i=0;i<sels.length;i++){var v=attr(node,sels[i]);if(v)return v;}return '';}
function xa(html,path){try{if(typeof xpathArray==='function')return xpathArray(String(html||''),path)||[];if(typeof xpa==='function')return xpa(String(html||''),path)||[];}catch(e){}return [];}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function key(id){return PREFIX+String(id||'');}
function clear(id){try{clearItem(key(id));}catch(e){}}
function read(id){try{var raw=getItem(key(id),'');if(!raw)return null;var x=JSON.parse(raw),age=new Date().getTime()-Number(x&&x.ts||0);if(!x||!Array.isArray(x.items)||!x.items.length||age>TTL){clear(id);return null;}return x.items;}catch(e){return null;}}
function write(id,items){if(!items||!items.length)return;try{setItem(key(id),JSON.stringify({ts:new Date().getTime(),items:items}));}catch(e){}}
function norm(x){x=x||{};x.user=String(x.user||'').replace(/\s+/g,' ').trim()||'匿名用户';x.time=String(x.time||'').replace(/\s+/g,' ').replace(/\s*[·•|]?\s*\d+\s*回(?:复|覆)[\s\S]*$/i,'').trim();return x;}
function byBodies(body,base){var out=[],bodies=xa(body,'//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]');for(var i=0;i<bodies.length;i++){var bh=String(bodies[i]||''),f=nodes(bh,'.comment-index-text');if(f.length<2)continue;var u=firstText(f[0],['a&&Text','Text']),c=text(f[1],'Text');if(!u||!c)continue;out.push(norm({user:u,content:c,time:firstText(f[0],['span&&Text']),avatar:abs(base,firstAttr(bh,['img&&src','img&&data-src','img&&data-original']))}));}return out;}
function byRows(body,base){var rows=nodes(body,'.comment-index-text'),pics=xa(body,'//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src'),out=[];for(var i=0;i+1<rows.length;i+=2){var u=firstText(rows[i],['a&&Text','Text']),c=text(rows[i+1],'Text');if(!u||!c)continue;var av=out.length<pics.length?abs(base,pics[out.length]):abs(base,firstAttr(rows[i],['img&&src','img&&data-src','img&&data-original']));out.push(norm({user:u,content:c,time:firstText(rows[i],['span&&Text']),avatar:av}));}return out;}
P.replies=function(commentId){commentId=String(commentId||'');if(!commentId)throw new Error('缺少评论 ID');var cached=read(commentId);if(cached)return cached;var base=C.resolveHost(false),url=C.query(base+'/loadReplies',{id:commentId}),r=C.get(url,{base:base,referer:base+'/',timeout:12000});if(!r||r.challenge||Number(r.statusCode||0)>=400||!String(r.body||''))throw new Error('回复加载失败：HTTP '+Number((r&&r.statusCode)||0));var body=jsonPart(r.body,'replies'),out=byBodies(body,base);if(!out.length)out=byRows(body,base);write(commentId,out);return out;};
var baseReply=P.replyComment;P.replyComment=function(id,content){var r=baseReply(id,content);clear(id);return r;};P.clearReplyCache28=clear;
function logged(){try{return !!C.activeAccount();}catch(e){return false;}}
function compose(id,ok){return ok?('input://'+JSON.stringify({value:'',hint:'输入回复内容',js:"if(!input)return 'toast://回复不能为空';try{var p=$.require('hanime').provider();p.replyComment('"+id+"',input);if(p.clearReplyCache28)p.clearReplyCache28('"+id+"');refreshPage(false);return 'toast://回复已发布';}catch(e){return 'toast://'+String(e.message||e);}"})):H.route('hanimeLogin',{});}
E.repliesPage=function(){try{var id=H.pv('id',''),u=H.pv('user','回复'),a=P.replies(id),d=[],ok=logged();setPageTitle(u+' · 回复');d.push(H.sec(u,'共 '+a.length+' 条回复'));d.push(H.btn(ok?'回复此评论':'登录后回复',compose(id,ok),'text_center_1'));for(var i=0;i<a.length;i++){var x=a[i];d.push({title:x.user||'匿名用户',desc:x.time||'',pic_url:x.avatar||'',url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:x.content||'',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false,textSize:16}});d.push({col_type:'line'});}if(!a.length)d.push(H.sec('回复暂未解析出来','本次空结果不会缓存，返回后可再次尝试。'));setResult(d);}catch(x){setResult([{title:'回复加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
