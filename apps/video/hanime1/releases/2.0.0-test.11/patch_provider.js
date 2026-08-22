/* Hanime1 2.0.0-test.11 - device feedback normalization + web login sync */
(function(C,P){
var BUILD='2.0.0-test.11';
function fmtDuration(v){
  v=String(v==null?'':v).trim();
  if(!/^\d+$/.test(v))return v;
  var s=parseInt(v,10)||0,h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
  function z(n){return n<10?'0'+n:String(n);}
  return h>0?(h+':'+z(m)+':'+z(ss)):(m+':'+z(ss));
}
function cleanComment(c){
  c=c||{};var raw=String(c.time||'').replace(/\s+/g,' ').trim(),rm=raw.match(/(\d+)\s*回(?:复|覆)/i);
  if(rm&&!c.replyCount)c.replyCount=parseInt(rm[1],10)||0;
  var time=raw.replace(/\s*[·•|]?\s*\d+\s*回(?:复|覆)[\s\S]*$/i,'').trim();
  var user=String(c.user||'').replace(/\s+/g,' ').trim();
  if(time&&user.slice(-time.length)===time)user=user.slice(0,-time.length).trim();
  user=user.replace(/\s*(?:\d+\s*(?:秒|分鐘|分钟|小時|小时|天|週|周|個月|个月|月|年)前|剛剛|刚刚)\s*$/i,'').trim();
  c.user=user||'匿名用户';c.time=time;return c;
}
var oldVideo=P.video,oldComments=P.comments,oldReplies=P.replies;
P.video=function(id){var v=oldVideo(id);v.duration=fmtDuration(v.duration);return v;};
P.comments=function(id){var r=oldComments(id),a=(r&&r.items)||[];for(var i=0;i<a.length;i++)cleanComment(a[i]);return r;};
P.replies=function(id){var a=oldReplies(id)||[];for(var i=0;i<a.length;i++)cleanComment(a[i]);return a;};
P.syncWebLogin11=function(){
  C.useBrowserSession();var base=C.resolveHost(false),raw=C.browserCookie(base);
  if(!raw)throw new Error('当前 WebView Cookie 为空，请先在上方官网登录');
  var p=P.profile();
  if(!p||!p.id)throw new Error('当前 Cookie 仍是未登录会话，请在上方完成官网登录后再同步');
  return C.saveAccount(p,raw);
};
P.webLoginDiagnostic11=function(){
  var base=C.resolveHost(false),raw=C.browserCookie(base),names=[];
  String(raw||'').split(';').forEach(function(x){var i=x.indexOf('=');if(i>0){var k=x.slice(0,i).trim();if(k&&names.indexOf(k)<0)names.push(k);}});
  var ok=false,name='';try{var p=P.profile();ok=!!(p&&p.id);name=p&&p.name||'';}catch(e){}
  return {cookieNames:names,logged:ok,name:name};
};
P.build=BUILD;C.build=BUILD;
})(HanimeCore,HanimeProvider);
