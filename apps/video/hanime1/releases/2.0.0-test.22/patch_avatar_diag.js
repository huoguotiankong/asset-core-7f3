/* Hanime1 Test22: expose avatar diagnostics instead of guessing another parser */
(function(C,P,E,H){
var KEY_LAST='hanime_avatar_last_video22';
var KEY_DIAG='hanime_avatar_diag22_result';
var oldVideo=P.video;
var oldRenderSettings=E.renderSettings;
function count(s,needle){s=String(s||'');needle=String(needle||'');if(!needle)return 0;var n=0,p=0;while((p=s.indexOf(needle,p))>=0){n++;p+=needle.length;}return n;}
function jsonPart(body,key){try{var j=JSON.parse(String(body||''));if(j&&typeof j[key]==='string')return j[key];}catch(e){}return String(body||'');}
function urls(raw){raw=String(raw||'');var out=[],re=/<img\b[^>]*>/ig,m;while((m=re.exec(raw))&&out.length<8){var tag=m[0],a=['data-src','data-original','data-lazy-src','src','data-srcset','srcset'],u='';for(var i=0;i<a.length;i++){var q=new RegExp('\\s'+a[i]+'\\s*=\\s*["\\\']([^"\\\']+)["\\\']','i').exec(tag);if(q&&q[1]){u=String(q[1]).replace(/&amp;/g,'&');break;}}if(u)out.push(u);}return out;}
function summary(x){var a=[];a.push('Build '+String(x.build||''));a.push('视频 '+String(x.videoId||''));a.push('作者 '+String(x.artist||'-')+' / '+String(x.artistMethod||'none'));a.push('作者标记 '+String(x.artistMarker||0)+' / 邻近img '+String(x.artistNearImg||0));a.push('评论 items '+String(x.commentItems||0)+' / root '+String(x.commentRoot||0)+' / img '+String(x.commentImg||0)+' / replyWrap '+String(x.commentReplyWrap||0));a.push('Test21 groups '+String(x.commentGroups||0)+' / groupImg '+String(x.commentGroupAvatars||0)+' / matched '+String(x.commentMatchedAvatars||0));a.push('回复 groups '+String(x.replyGroups||0)+' / groupImg '+String(x.replyGroupAvatars||0));if(x.commentSamples&&x.commentSamples.length)a.push('评论img样本 '+x.commentSamples.join(' | '));if(x.artistSamples&&x.artistSamples.length)a.push('作者附近img '+x.artistSamples.join(' | '));if(x.error)a.push('错误 '+x.error);return a.join('\n');}
P.video=function(id){if(id)setItem(KEY_LAST,String(id));return oldVideo(id);};
P.avatarDiagnostic22=function(videoId){
  videoId=String(videoId||getItem(KEY_LAST,''));
  var out={build:'2.0.0-test.22',videoId:videoId,artist:'',artistMethod:'',artistMarker:0,artistNearImg:0,artistSamples:[],commentItems:0,commentRoot:0,commentImg:0,commentReplyWrap:0,commentGroups:0,commentGroupAvatars:0,commentMatchedAvatars:0,commentSamples:[],replyGroups:0,replyGroupAvatars:0};
  if(!videoId){out.error='没有最近视频ID，请先打开一个视频详情';return out;}
  try{
    var d21=P.avatarDiagnostic21?P.avatarDiagnostic21(videoId):{};
    out.artistMethod=d21.artistMethod||'';
    out.commentGroups=Number(d21.commentGroups||0);
    out.commentGroupAvatars=Number(d21.commentGroupAvatars||0);
    out.commentMatchedAvatars=Number(d21.commentMatchedAvatars||0);
    out.replyGroups=Number(d21.replyGroups||0);
    out.replyGroupAvatars=Number(d21.replyGroupAvatars||0);
  }catch(e0){out.diag21Error=String(e0.message||e0);}
  try{
    var v=oldVideo(videoId),base=(v&&v.base)||C.resolveHost(false),raw=String((v&&v.raw)||'');
    out.artist=v&&v.artist||'';
    out.artistMarker=raw.indexOf('video-user-avatar')>=0?1:0;
    var p=raw.indexOf('video-user-avatar');if(p>=0){var seg=raw.slice(Math.max(0,p-1800),Math.min(raw.length,p+5000));out.artistSamples=urls(seg);out.artistNearImg=out.artistSamples.length;}
    var x=C.get(C.query(base+'/loadComment',{type:'video',id:videoId}),{base:base,referer:base+'/watch?v='+videoId,timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){var body=jsonPart(x.body,'comments');out.commentRoot=body.indexOf('comment-start')>=0?1:0;out.commentImg=count(body,'<img');out.commentReplyWrap=count(body,'reply-section-wrapper-');out.commentSamples=urls(body);}
    var r=oldCommentsSafe(videoId);out.commentItems=r&&r.items?r.items.length:0;
  }catch(e1){out.error=String(e1.message||e1);}
  return out;
};
function oldCommentsSafe(id){try{var fn=P.comments;return fn(id);}catch(e){return null;}}
E.renderSettings=function(d){
  oldRenderSettings(d);
  d.push(H.sec('头像诊断','Test22 不再继续盲猜头像 DOM；先读取真实命中数据。先打开目标视频详情，再回到这里运行。'));
  var last=getItem(KEY_LAST,''),cached=getItem(KEY_DIAG,'');
  d.push(H.btn('运行最近视频头像诊断'+(last?(' · '+last):''),$('#noLoading#').lazyRule(function(){try{var p=$.require('hanime').provider(),r=p.avatarDiagnostic22();setItem('hanime_avatar_diag22_result',JSON.stringify(r));refreshPage(false);return 'toast://头像诊断完成';}catch(e){return 'toast://诊断失败：'+String(e.message||e);}}),'text_center_1'));
  if(cached){try{var obj=JSON.parse(cached);d.push({title:summary(obj),url:$('#noLoading#').lazyRule(function(s){return 'copy://'+s;},summary(obj)),col_type:'long_text',extra:{lineVisible:false,textSize:14}});}catch(e){d.push({title:cached,url:'hiker://empty',col_type:'long_text'});}}
};
P.avatarDiagnostic22Summary=summary;
HanimePages.build='2.0.0-test.22';HanimeCore.build='2.0.0-test.22';HanimeProvider.build='2.0.0-test.22';
})(HanimeCore,HanimeProvider,HanimePages,HanimeUI9);
