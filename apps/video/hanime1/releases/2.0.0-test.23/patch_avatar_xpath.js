/* Hanime1 Test23: built-in XPath avatar parser + visible runtime/diagnostic settings */
(function(C,P,E,H,L){
var BUILD='2.0.0-test.23';
var BUILDNO=20023;
var KEY_LAST_VIDEO='hanime_avatar_last_video23';
var KEY_LAST_REPLY='hanime_avatar_last_reply23';
var KEY_DIAG='hanime_avatar_diag23_result';
var oldVideo=P.video;
var oldComments=P.comments;
var oldReplies=P.replies;
var oldSearch=P.search;
function clean(v){return C.clean(String(v==null?'':v));}
function xa(html,path){
  try{
    if(typeof xpathArray==='function')return xpathArray(String(html||''),path)||[];
    if(typeof xpa==='function')return xpa(String(html||''),path)||[];
  }catch(e){}
  return [];
}
function first(a){return a&&a.length?String(a[0]||'').replace(/&amp;/g,'&').trim():'';}
function abs(base,u){u=String(u||'').replace(/&amp;/g,'&').trim();return u?C.abs(base,u):'';}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function mainAvatarUrls(body,base){
  var a=xa(body,'//*[@id="comment-start"]/*[position() mod 4 = 1]//img[1]/@src'),out=[];
  for(var i=0;i<a.length;i++){var u=abs(base,a[i]);if(u)out.push(u);}
  return out;
}
function replyAvatarUrls(body,base){
  var a=xa(body,'//div[starts-with(@id,"reply-start")]/*[position() mod 2 = 1]//img[1]/@src'),out=[];
  for(var i=0;i<a.length;i++){var u=abs(base,a[i]);if(u)out.push(u);}
  return out;
}
function artistXPath(raw,base){
  var paths=[
    '//*[@id="video-user-avatar"]/following-sibling::img[1]/@src',
    '//*[@id="video-user-avatar"]/@src',
    '//div[contains(@class,"video-description-panel")]//a[contains(@href,"/user/")]//img[1]/@src'
  ];
  for(var i=0;i<paths.length;i++){var u=abs(base,first(xa(raw,paths[i])));if(u)return u;}
  return '';
}
function artistSearch(name,base){
  name=clean(name);if(!name)return '';
  try{
    var r=oldSearch({query:name,type:'artist',page:1}),a=(r&&r.artists)||[];
    for(var i=0;i<a.length;i++)if(clean(a[i].title)===name&&a[i].img)return abs(base,a[i].img);
  }catch(e){}
  return '';
}
var DIAG={build:BUILD,videoId:'',artist:'',artistMethod:'none',artistUrl:'',commentItems:0,commentXPath:0,commentApplied:0,replyId:'',replyItems:0,replyXPath:0,replyApplied:0,xpathAvailable:false};
P.video=function(id){
  if(id){setItem(KEY_LAST_VIDEO,String(id));DIAG.videoId=String(id);}
  var v=oldVideo(id),base=(v&&v.base)||C.resolveHost(false),u='';
  DIAG.xpathAvailable=(typeof xpathArray==='function'||typeof xpa==='function');
  DIAG.artist=v&&v.artist||'';DIAG.artistMethod='none';DIAG.artistUrl='';
  if(v){
    u=artistXPath(String(v.raw||''),base);
    if(u)DIAG.artistMethod='xpath-detail';
    if(!u){u=artistSearch(v.artist,base);if(u)DIAG.artistMethod='artist-search';}
    if(u){v.artistAvatar=u;DIAG.artistUrl=u;}else v.artistAvatar='';
  }
  return v;
};
P.comments=function(videoId){
  var r=oldComments(videoId),items=(r&&r.items)||[];
  DIAG.videoId=String(videoId||DIAG.videoId||'');DIAG.commentItems=items.length;DIAG.commentXPath=0;DIAG.commentApplied=0;
  if(!items.length)return r;
  var base=C.resolveHost(false);
  try{
    var x=C.get(C.query(base+'/loadComment',{type:'video',id:videoId}),{base:base,referer:base+'/watch?v='+videoId,timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      var body=jsonPart(x.body,'comments'),pics=mainAvatarUrls(body,base);
      DIAG.commentXPath=pics.length;
      if(pics.length===items.length){for(var i=0;i<items.length;i++){items[i].avatar=pics[i];DIAG.commentApplied++;}}
    }
  }catch(e){DIAG.commentError=String(e.message||e);}
  return r;
};
P.replies=function(commentId){
  if(commentId){setItem(KEY_LAST_REPLY,String(commentId));DIAG.replyId=String(commentId);}
  var a=oldReplies(commentId)||[];
  DIAG.replyItems=a.length;DIAG.replyXPath=0;DIAG.replyApplied=0;
  if(!a.length)return a;
  var base=C.resolveHost(false);
  try{
    var x=C.get(C.query(base+'/loadReplies',{id:commentId}),{base:base,referer:base+'/',timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      var body=jsonPart(x.body,'replies'),pics=replyAvatarUrls(body,base);
      DIAG.replyXPath=pics.length;
      if(pics.length===a.length){for(var i=0;i<a.length;i++){a[i].avatar=pics[i];DIAG.replyApplied++;}}
    }
  }catch(e){DIAG.replyError=String(e.message||e);}
  return a;
};
function diag(videoId){
  videoId=String(videoId||getItem(KEY_LAST_VIDEO,''));
  if(videoId){try{P.video(videoId);}catch(e){DIAG.videoError=String(e.message||e);}try{P.comments(videoId);}catch(e2){DIAG.commentError=String(e2.message||e2);}}
  var rid=getItem(KEY_LAST_REPLY,'');if(rid){try{P.replies(rid);}catch(e3){DIAG.replyError=String(e3.message||e3);}}
  var out=JSON.parse(JSON.stringify(DIAG));setItem(KEY_DIAG,JSON.stringify(out));return out;
}
function summary(x){
  var a=[];a.push('运行 '+String(x.build||BUILD));a.push('XPath '+(x.xpathAvailable?'可用':'不可用'));a.push('视频 '+String(x.videoId||'-'));
  a.push('作者 '+String(x.artist||'-')+' / '+String(x.artistMethod||'none')+' / '+(x.artistUrl?'已取URL':'无URL'));
  a.push('主评论 items '+Number(x.commentItems||0)+' / XPath头像 '+Number(x.commentXPath||0)+' / 已应用 '+Number(x.commentApplied||0));
  a.push('回复 items '+Number(x.replyItems||0)+' / XPath头像 '+Number(x.replyXPath||0)+' / 已应用 '+Number(x.replyApplied||0));
  if(x.commentError)a.push('评论错误 '+x.commentError);if(x.replyError)a.push('回复错误 '+x.replyError);if(x.videoError)a.push('作者错误 '+x.videoError);return a.join('\n');
}
P.avatarDiagnostic23=diag;P.avatarDiagnostic23Summary=summary;
E.renderSettings=function(d){
  var st=C.state(),acc=C.activeAccount();
  d.push(H.sec('运行版本',BUILD+' · Build '+BUILDNO));
  d.push(H.btn('重新加载当前测试版',$('#noLoading#').lazyRule(function(){try{var r=HanimeBoot.reinstall();refreshPage(false);return 'toast://'+(r.ok?'当前测试版已重新加载':(r.error||'重新加载失败'));}catch(e){return 'toast://'+String(e.message||e);}}),'text_center_1'));
  d.push(H.sec('账号',acc?(acc.name+(acc.email?' · '+acc.email:'')):'未登录'));
  d.push(H.btn(acc?'账号中心':'登录 Hanime1',acc?H.route('hanimeAccount',{}):H.route('hanimeLogin',{})));
  d.push(H.sec('界面','每个主要页面可独立设置封面列数和图文排版。'));
  d.push(H.btn('页面封面布局',H.route('hanimeLayoutSettings',{}),'text_center_1'));
  d.push(H.sec('网络','当前线路 · '+st.base));
  d.push(H.btn('重新检测线路',$('#noLoading#').lazyRule(function(){clearItem('hanime2_active_host');clearItem('hanime2_host_ts');try{var h=$.require('hanime').core().resolveHost(true);refreshPage(false);return 'toast://当前线路 '+h;}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.btn('浏览器验证',H.route('hanimeVerify',{url:st.base})));
  d.push(H.sec('测试版本',BUILD+' · Build '+BUILDNO));
  d.push(H.btn('检查远程更新',$('#noLoading#').lazyRule(function(){try{var r=HanimeBoot.check();return 'toast://'+(r.hasUpdate?'发现新测试版 '+r.latest.version:'当前已是最新测试版');}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.btn('更新测试版',$('#noLoading#').lazyRule(function(){try{var r=HanimeBoot.update();if(r.ok&&r.changed){refreshPage(false);return 'toast://已更新到 '+r.current.version;}return 'toast://'+(r.error||'暂无更新');}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.btn('回退上一测试版',$('#noLoading#').lazyRule(function(){try{var r=HanimeBoot.rollback();if(r.ok){refreshPage(false);return 'toast://已回退 '+r.current.version;}return 'toast://'+r.error;}catch(e){return 'toast://'+String(e.message||e);}})));
  d.push(H.sec('头像诊断','使用海阔内置 XPath 直接读取真实 DOM。先打开目标视频和一条回复，再回这里运行。'));
  d.push(H.btn('运行头像诊断',$('#noLoading#').lazyRule(function(){try{var p=$.require('hanime').provider(),r=p.avatarDiagnostic23();setItem('hanime_avatar_diag23_result',JSON.stringify(r));refreshPage(false);return 'toast://头像诊断完成';}catch(e){return 'toast://诊断失败：'+String(e.message||e);}}),'text_center_1'));
  var cached=getItem(KEY_DIAG,'');if(cached){try{var o=JSON.parse(cached),s=summary(o);d.push({title:s,url:$('#noLoading#').lazyRule(function(t){return 'copy://'+t;},s),col_type:'long_text',extra:{lineVisible:false,textSize:14}});}catch(e){}}
};
HanimePages.build=BUILD;HanimeCore.build=BUILD;HanimeProvider.build=BUILD;
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9,HanimeLayout12);
