/* Hanime1 Test25: remove avatar diagnostics + fast single-request replies */
(function(C,P,E,H){
var BUILD='2.0.0-test.25';
var BUILDNO=20025;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/hanime1/bootstrap_test_v4.js?v=20024';
var BOOTVER=20024;
var REPLY_CACHE_PREFIX='hanime_reply_cache25_';
var REPLY_CACHE_TTL=45000;
var oldReplyComment=P.replyComment;

function clean(v){return C.clean(String(v==null?'':v));}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function nodes(html,sel){try{return pdfa(String(html||''),sel)||[];}catch(e){return [];}}
function text(node,sel){try{return clean(pdfh(node,sel)||'');}catch(e){return '';}}
function attr(node,sel){try{return String(pdfh(node,sel)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
function firstText(node,sels){for(var i=0;i<sels.length;i++){var v=text(node,sels[i]);if(v)return v;}return '';}
function firstAttr(node,sels){for(var i=0;i<sels.length;i++){var v=attr(node,sels[i]);if(v)return v;}return '';}
function xa(html,path){try{if(typeof xpathArray==='function')return xpathArray(String(html||''),path)||[];if(typeof xpa==='function')return xpa(String(html||''),path)||[];}catch(e){}return [];}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function cleanComment(c){
  c=c||{};var raw=String(c.time||'').replace(/\s+/g,' ').trim(),rm=raw.match(/(\d+)\s*回(?:复|覆)/i);
  if(rm&&!c.replyCount)c.replyCount=parseInt(rm[1],10)||0;
  var time=raw.replace(/\s*[·•|]?\s*\d+\s*回(?:复|覆)[\s\S]*$/i,'').trim();
  var user=String(c.user||'').replace(/\s+/g,' ').trim();
  if(time&&user.slice(-time.length)===time)user=user.slice(0,-time.length).trim();
  user=user.replace(/\s*(?:\d+\s*(?:秒|分鐘|分钟|小時|小时|天|週|周|個月|个月|月|年)前|剛剛|刚刚)\s*$/i,'').trim();
  c.user=user||'匿名用户';c.time=time;return c;
}
function replyAvatarUrls(body,base){
  var a=xa(body,'//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src'),out=[];
  for(var i=0;i<a.length;i++){var u=abs(base,a[i]);if(u)out.push(u);}
  return out;
}
function cacheKey(id){return REPLY_CACHE_PREFIX+String(id||'');}
function readReplyCache(id){
  try{var raw=getItem(cacheKey(id),'');if(!raw)return null;var x=JSON.parse(raw);if(!x||!Array.isArray(x.items)||new Date().getTime()-Number(x.ts||0)>REPLY_CACHE_TTL){clearItem(cacheKey(id));return null;}return x.items;}catch(e){return null;}
}
function writeReplyCache(id,items){try{setItem(cacheKey(id),JSON.stringify({ts:new Date().getTime(),items:items||[]}));}catch(e){}}
function clearReplyCache(id){try{clearItem(cacheKey(id));}catch(e){}}

P.replies=function(commentId){
  commentId=String(commentId||'');
  var cached=readReplyCache(commentId);if(cached)return cached;
  var base=C.resolveHost(false),url=C.query(base+'/loadReplies',{id:commentId});
  var r=C.get(url,{base:base,referer:base+'/',timeout:12000});
  if(!r||r.challenge||Number(r.statusCode||0)>=400||!String(r.body||''))throw new Error('回复加载失败：HTTP '+Number((r&&r.statusCode)||0));
  var body=jsonPart(r.body,'replies'),rows=nodes(body,'.comment-index-text'),out=[],pics=replyAvatarUrls(body,base),expected=Math.floor(rows.length/2);
  for(var i=0;i+1<rows.length;i+=2){
    var u=firstText(rows[i],['a&&Text','Text']),c=text(rows[i+1],'Text');
    if(!u||!c)continue;
    var idx=out.length,av='';
    if(pics.length===expected&&idx<pics.length)av=pics[idx];
    if(!av)av=abs(base,firstAttr(rows[i],['img&&src','img&&data-src','img&&data-original']));
    out.push(cleanComment({user:u,content:c,time:firstText(rows[i],['span&&Text']),avatar:av}));
  }
  writeReplyCache(commentId,out);
  return out;
};
P.replyComment=function(commentId,content){var r=oldReplyComment(commentId,content);clearReplyCache(commentId);return r;};
P.clearReplyCache25=clearReplyCache;

function loggedLocal(){try{return !!C.activeAccount();}catch(e){return false;}}
function composeComment(id,logged){return logged?('input://'+JSON.stringify({value:'',hint:'写下你的评论',js:"if(!input)return 'toast://评论不能为空';try{$.require('hanime').provider().postComment('"+id+"',input);refreshPage(false);return 'toast://评论已发布';}catch(e){return 'toast://'+String(e.message||e);}"})):H.route('hanimeLogin',{});}
function composeReply(id,logged){return logged?('input://'+JSON.stringify({value:'',hint:'输入回复内容',js:"if(!input)return 'toast://回复不能为空';try{var p=$.require('hanime').provider();p.replyComment('"+id+"',input);if(p.clearReplyCache25)p.clearReplyCache25('"+id+"');refreshPage(false);return 'toast://回复已发布';}catch(e){return 'toast://'+String(e.message||e);}"})):H.route('hanimeLogin',{});}
function card(d,c){var meta=[c.time,c.replyCount?c.replyCount+' 回复':''].filter(Boolean).join(' · ');d.push({title:c.user||'匿名用户',desc:meta,pic_url:c.avatar||'',url:c.id?H.route('hanimeReplies',{id:c.id,user:c.user}):'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:c.content||'',url:c.id?H.route('hanimeReplies',{id:c.id,user:c.user}):'hiker://empty',col_type:'long_text',extra:{lineVisible:false,textSize:16}});if(c.replyCount)d.push({title:'查看 '+c.replyCount+' 条回复 ›',url:H.route('hanimeReplies',{id:c.id,user:c.user}),col_type:'text_1',extra:{lineVisible:false}});d.push({col_type:'line'});}
E.commentsPage=function(){try{var id=H.pv('id',''),t=H.pv('title','视频'),r=P.comments(id),d=[],logged=loggedLocal(),page=Number(H.pv('page','1')||1),size=12;setPageTitle('评论');d.push(H.sec(t,'共 '+r.items.length+' 条评论 · 第 '+page+' 页'));d.push(H.btn(logged?'发表评论':'登录后发表评论',composeComment(id,logged),'text_center_1'));var start=(page-1)*size,end=Math.min(r.items.length,start+size);for(var i=start;i<end;i++)card(d,r.items[i]);if(page>1)d.push(H.btn('‹ 上一页',H.route('hanimeComments',{id:id,title:t,page:page-1})));if(end<r.items.length)d.push(H.btn('下一页 ›',H.route('hanimeComments',{id:id,title:t,page:page+1})));setResult(d);}catch(x){setResult([{title:'评论加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};
E.repliesPage=function(){try{var id=H.pv('id',''),u=H.pv('user','回复'),a=P.replies(id),d=[],logged=loggedLocal();setPageTitle(u+' · 回复');d.push(H.sec(u,'共 '+a.length+' 条回复'));d.push(H.btn(logged?'回复此评论':'登录后回复',composeReply(id,logged),'text_center_1'));for(var i=0;i<a.length;i++)card(d,a[i]);if(!a.length)d.push(H.sec('暂无回复'));setResult(d);}catch(x){setResult([{title:'回复加载失败',desc:String(x.message||x),url:'hiker://empty',col_type:'text_center_1'}]);}};

function bootAction(kind){return $('#noLoading#').lazyRule(function(boot,ver,action){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);var r;if(action==='check'){r=HanimeBoot.check();return 'toast://'+(r.hasUpdate?'发现新测试版 '+r.latest.version:'当前已是最新测试版');}if(action==='update'){r=HanimeBoot.update();if(r.ok&&r.changed){refreshPage(false);return 'toast://已更新到 '+r.current.version;}return 'toast://'+(r.error||'暂无更新');}if(action==='rollback'){r=HanimeBoot.rollback();if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}return 'toast://'+(r.error||'没有可回退版本');}if(action==='reinstall'){r=HanimeBoot.reinstall();if(r.ok){refreshPage(false);return 'toast://当前测试版已重新加载';}return 'toast://'+(r.error||'重新加载失败');}if(action==='reset'){r=HanimeBoot.reset();if(r.ok){refreshPage(false);return 'toast://已恢复 Test24 基线';}return 'toast://'+(r.error||'恢复失败');}return 'toast://未知操作';}catch(e){return 'toast://更新链异常：'+String(e.message||e);}},BOOT,BOOTVER,kind);}
E.renderSettings=function(d){
  var st=C.state(),acc=C.activeAccount();
  d.push(H.sec('运行版本',BUILD+' · Build '+BUILDNO+' · Shell v4'));
  d.push(H.btn('重新加载当前测试版',bootAction('reinstall'),'text_center_1'));
  d.push(H.btn('恢复 Test24 基线',bootAction('reset'),'text_center_1'));
  d.push(H.sec('账号',acc?(acc.name+(acc.email?' · '+acc.email:'')):'未登录'));
  d.push(H.btn(acc?'账号中心':'登录 Hanime1',acc?H.route('hanimeAccount',{}):H.route('hanimeLogin',{})));
  d.push(H.sec('界面','每个主要页面可独立设置封面列数和图文排版。'));
  d.push(H.btn('页面封面布局',H.route('hanimeLayoutSettings',{}),'text_center_1'));
  d.push(H.sec('网络','当前线路 · '+st.base));
  d.push(H.btn('重新检测线路',$('#noLoading#').lazyRule(function(){clearItem('hanime2_active_host');clearItem('hanime2_host_ts');try{var h=$.require('hanime').core().resolveHost(true);refreshPage(false);return 'toast://当前线路 '+h;}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.btn('浏览器验证',H.route('hanimeVerify',{url:st.base})));
  d.push(H.sec('测试版本',BUILD+' · Build '+BUILDNO));
  d.push(H.btn('检查远程更新',bootAction('check')));
  d.push(H.btn('更新测试版',bootAction('update')));
  d.push(H.btn('回退上一测试版',bootAction('rollback')));
};

HanimePages.build=BUILD;HanimeCore.build=BUILD;HanimeProvider.build=BUILD;
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
