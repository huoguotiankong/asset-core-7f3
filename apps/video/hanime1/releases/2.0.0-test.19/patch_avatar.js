/* Hanime1 Test19: restore Test17 comments + safe avatar enrichment */
(function(C,P,E){
var oldVideo=P.video;
var oldComments=P.comments;
var oldReplies=P.replies;
var FALLBACK='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/hanime1/assets/avatar_default.png';
function clean(v){return C.clean(String(v==null?'':v));}
function nodes(h,s){try{return pdfa(String(h||''),s)||[];}catch(e){return [];}}
function text(h,s){try{return clean(pdfh(h,s)||'');}catch(e){return '';}}
function attr(h,s){try{return String(pdfh(h,s)||'').trim();}catch(e){return '';}}
function good(u){
  var s=String(u||'').toLowerCase();
  if(!s)return false;
  if(s.indexOf('data:image')===0)return false;
  if(s.indexOf('placeholder')>=0)return false;
  if(s.indexOf('loading')>=0)return false;
  if(s.indexOf('spinner')>=0)return false;
  if(s.indexOf('transparent')>=0)return false;
  if(s.indexOf('blank.')>=0)return false;
  return true;
}
function srcset(u){
  u=String(u||'').trim();
  if(!u)return '';
  var first=u.split(',')[0].trim();
  var space=first.indexOf(' ');
  return space>0?first.slice(0,space):first;
}
function image(n,base){
  var a=['img[style*=object-fit]&&data-src','img[style*=object-fit]&&src','img&&data-src','img&&data-original','img&&data-lazy-src','img&&src','img&&data-srcset','img&&srcset'];
  for(var i=0;i<a.length;i++){
    var u=attr(n,a[i]);
    if(a[i].indexOf('srcset')>=0)u=srcset(u);
    if(good(u))return C.abs(base,u);
  }
  return '';
}
function collect(h,sel,base){
  var a=nodes(h,sel),out=[];
  for(var i=0;i<a.length;i++){
    var u=image(a[i],base);
    if(u)out.push(u);
  }
  return out;
}
function jsonPart(body,key){
  try{
    var j=JSON.parse(String(body||''));
    if(j&&typeof j[key]==='string')return j[key];
  }catch(e){}
  return String(body||'');
}
function artistAvatar(name){
  name=clean(name);
  if(!name)return '';
  var base=C.resolveHost(false);
  try{
    var url=C.query(base+'/search',{type:'artist',query:name,page:1});
    var r=C.get(url,{base:base,referer:base+'/',timeout:16000});
    if(!r||r.challenge||Number(r.statusCode||0)>=400)return '';
    var a=nodes(r.body,'.search-artist-card'),fallback='';
    for(var i=0;i<a.length;i++){
      var n=text(a[i],'.search-artist-title&&Text')||text(a[i],'.title&&Text');
      var u=image(a[i],base);
      if(!u)continue;
      if(!fallback)fallback=u;
      if(clean(n)===name)return u;
    }
    return fallback;
  }catch(e){return '';}
}
P.video=function(id){
  var v=oldVideo(id);
  if(!good(v.artistAvatar)){
    var u=artistAvatar(v.artist);
    v.artistAvatar=u||FALLBACK;
  }
  if(v.uploader&&v.uploader.name&&!good(v.uploader.avatar))v.uploader.avatar=FALLBACK;
  return v;
};
P.comments=function(videoId){
  var r=oldComments(videoId);
  if(!r||!r.items||!r.items.length)return r;
  var base=C.resolveHost(false);
  try{
    var url=C.query(base+'/loadComment',{type:'video',id:videoId});
    var x=C.get(url,{base:base,referer:base+'/watch?v='+videoId,timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      var body=jsonPart(x.body,'comments');
      var pics=collect(body,'#comment-start img',base);
      for(var i=0;i<r.items.length;i++){
        if(i<pics.length&&good(pics[i]))r.items[i].avatar=pics[i];
        else if(!good(r.items[i].avatar))r.items[i].avatar=FALLBACK;
      }
    }
  }catch(e){}
  for(var j=0;j<r.items.length;j++)if(!good(r.items[j].avatar))r.items[j].avatar=FALLBACK;
  return r;
};
P.replies=function(commentId){
  var a=oldReplies(commentId)||[];
  if(!a.length)return a;
  var base=C.resolveHost(false);
  try{
    var x=C.get(C.query(base+'/loadReplies',{id:commentId}),{base:base,referer:base+'/',timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      var body=jsonPart(x.body,'replies');
      var pics=collect(body,'div[id^=reply-start] img',base);
      if(!pics.length)pics=collect(body,'img',base);
      for(var i=0;i<a.length;i++){
        if(i<pics.length&&good(pics[i]))a[i].avatar=pics[i];
        else if(!good(a[i].avatar))a[i].avatar=FALLBACK;
      }
    }
  }catch(e){}
  for(var j=0;j<a.length;j++)if(!good(a[j].avatar))a[j].avatar=FALLBACK;
  return a;
};
HanimePages.build='2.0.0-test.19';
HanimeCore.build='2.0.0-test.19';
HanimeProvider.build='2.0.0-test.19';
})(HanimeCore,HanimeProvider,HanimePages);
