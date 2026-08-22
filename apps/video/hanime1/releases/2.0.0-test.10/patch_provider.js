/* Hanime1 2.0.0-test.10 - playlist + login cookie bridge */
(function(C,P,A){
var BUILD='2.0.0-test.10';
function clean(v){return C.clean(String(v==null?'':v));}
function idFrom(u){var m=String(u||'').match(/[?&]v=(\d+)/i);return m?m[1]:'';}
function oneCard(n,base){
  var href='',img='',title='',duration='',artist='';
  try{href=String(pdfh(n,'a[href*=watch]&&href')||pdfh(n,'a&&href')||'');}catch(e){}
  try{img=String(pdfh(n,'img.main-thumb&&src')||pdfh(n,'img&&data-src')||pdfh(n,'img&&src')||'');}catch(e){}
  try{title=clean(pdfh(n,'.home-rows-videos-title&&Text')||pdfh(n,'.title&&Text')||pdfh(n,'img&&alt')||'');}catch(e){}
  try{duration=clean(pdfh(n,'.duration&&Text')||pdfh(n,'.card-mobile-duration&&Text')||'');}catch(e){}
  try{artist=clean(pdfh(n,'.subtitle&&Text')||'');}catch(e){}
  var id=idFrom(href);if(!id)return null;
  return {id:id,title:title||('第 '+id+' 集'),url:C.abs(base,href),img:C.abs(base,img),duration:duration,artist:artist};
}
function rawPlaylist(h,base){
  h=String(h||'');var out=[],seen={},start=h.search(/id\s*=\s*(["'])playlist-scroll\1/i);if(start<0)return out;
  var tail=h.slice(start),end=tail.search(/id\s*=\s*(["'])(?:related-tabcontent|tab-comments|video-description)/i);if(end>0)tail=tail.slice(0,end);
  var re=/<a\b[^>]*href\s*=\s*(["'])([^"']*watch\?[^"']*\bv=(\d+)[^"']*)\1[^>]*>([\s\S]*?)<\/a>/gi,m;
  while((m=re.exec(tail))!==null){var id=m[3];if(seen[id])continue;seen[id]=1;var f=m[4],tm=f.match(/class\s*=\s*(["'])[^"']*(?:home-rows-videos-title|title)[^"']*\1[^>]*>([\s\S]*?)<\/[^>]+>/i),im=f.match(/<img\b[^>]*(?:src|data-src)\s*=\s*(["'])([^"']+)\1/i);out.push({id:id,title:tm?clean(tm[2]):('第 '+(out.length+1)+' 集'),url:C.abs(base,m[2]),img:C.abs(base,im?im[2]:''),duration:'',artist:''});if(m.index===re.lastIndex)re.lastIndex++;}
  return out;
}
function playlist(h,base,current){
  var out=[],seen={};
  try{var ns=pdfa(String(h||''),'#playlist-scroll .playlist-hover-wrap')||[];for(var i=0;i<ns.length;i++){var c=oneCard(ns[i],base);if(c&&!seen[c.id]){seen[c.id]=1;out.push(c);}}}catch(e){}
  if(!out.length)out=rawPlaylist(h,base);
  if(out.length&&current&&!out.some(function(x){return String(x.id)===String(current.id);})){out.unshift({id:String(current.id),title:current.title||'当前集',url:base+'/watch?v='+current.id,img:current.cover||'',duration:current.duration||'',artist:current.artist||''});}
  return out;
}
var oldVideo=P.video;
P.video=function(id){var v=oldVideo(id);v.playlist=playlist(v.raw,v.base||C.resolveHost(false),v);return v;};
function cookieNames(raw){var a=[];String(raw||'').split(';').forEach(function(p){var i=p.indexOf('=');if(i>0){var k=p.slice(0,i).trim();if(k&&a.indexOf(k)<0)a.push(k);}});return a;}
P.nativeLogin10=function(email,password){
  email=String(email||'').trim();password=String(password||'');if(!email||!password)throw new Error('请输入邮箱和密码');
  C.useBrowserSession();var base=C.resolveHost(false),g=C.get(base+'/login',{base:base,referer:base+'/',timeout:18000});
  if(g.challenge)throw new Error('NEED_VERIFY|'+base+'/login|登录');if(!g||Number(g.statusCode||0)>=400)throw new Error('登录页请求失败：HTTP '+Number((g&&g.statusCode)||0));
  var token=A.token(g.body);if(!token)throw new Error('官网登录页未解析到 CSRF Token');
  var before=C.browserCookie(base),arr=[],raw='';
  try{raw=fetchCookie(base+'/login',{method:'POST',headers:{'User-Agent':C.ua,'Referer':base+'/login','Origin':base,'Accept':'text/html,application/xhtml+xml','Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','Cookie':before},body:C.form({_token:token,email:email,password:password,remember:'on'}),timeout:20000});arr=JSON.parse(String(raw||'[]'));if(!Array.isArray(arr))arr=[];}catch(e){arr=[];}
  var merged=C.mergeCookies(before,arr.join('; '),C.browserCookie(base));
  if(!arr.length){try{C.post(base+'/login',{_token:token,email:email,password:password,remember:'on'},{base:base,referer:base+'/login',timeout:20000,headers:{Origin:base}});merged=C.mergeCookies(merged,C.browserCookie(base));}catch(e2){}}
  try{return P.importCookie(merged);}catch(e3){var names=cookieNames(merged).join(', ');throw new Error('登录未建立账号会话'+(names?'；已拿到 Cookie: '+names:'；未拿到登录 Cookie')+'。可改用“Cookie 登录”并把此提示反馈回来。');}
};
P.loginDiagnostic10=function(){var base=C.resolveHost(false),r=C.get(base+'/login',{base:base,referer:base+'/',timeout:15000}),token='';try{token=A.token(r.body);}catch(e){}return {status:Number((r&&r.statusCode)||0),token:!!token,cookies:cookieNames(C.browserCookie(base))};};
P.build=BUILD;C.build=BUILD;
})(HanimeCore,HanimeProvider,HanimeAccount9);
