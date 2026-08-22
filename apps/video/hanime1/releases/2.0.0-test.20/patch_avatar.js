/* Hanime1 Test20: context-bound real avatar extraction without replacing verified comment data */
(function(C,P,E){
var oldVideo=P.video;
var oldComments=P.comments;
var oldReplies=P.replies;
function clean(v){return C.clean(String(v==null?'':v));}
function nodes(h,s){try{return pdfa(String(h||''),s)||[];}catch(e){return [];}}
function text(h,s){try{return clean(pdfh(h,s)||'');}catch(e){return '';}}
function attr(h,s){try{return String(pdfh(h,s)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
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
  var s=String(u||'').trim();
  if(!s)return '';
  var p=s.split(',')[0].trim();
  var i=p.indexOf(' ');
  return i>0?p.slice(0,i):p;
}
function imageFromNode(n,base){
  var a=[
    'img[style*=object-fit]&&data-src','img[style*=object-fit]&&src',
    'img&&data-src','img&&data-original','img&&data-lazy-src','img&&src',
    'img&&data-srcset','img&&srcset'
  ];
  for(var i=0;i<a.length;i++){
    var u=attr(n,a[i]);
    if(a[i].indexOf('srcset')>=0)u=srcset(u);
    if(good(u))return C.abs(base,u);
  }
  return '';
}
function headerPic(u,base){
  u=String(u||'').trim();
  if(!good(u))return '';
  if(u.indexOf('@headers=')>=0)return u;
  if(u.indexOf('http://')!==0&&u.indexOf('https://')!==0)return u;
  return u+'@headers='+JSON.stringify({'Referer':String(base||'').replace(/\/+$/,'')+'/','User-Agent':C.ua});
}
function htmlAttr(tag,name){
  tag=String(tag||'');
  var keys=[' '+name+'="',' '+name+"='"];
  for(var i=0;i<keys.length;i++){
    var k=keys[i],p=tag.indexOf(k);
    if(p<0)continue;
    p+=k.length;
    var q=tag.indexOf(i===0?'"':"'",p);
    if(q>p)return tag.slice(p,q).replace(/&amp;/g,'&');
  }
  return '';
}
function imageFromTag(tag,base){
  var keys=['data-src','data-original','data-lazy-src','src','data-srcset','srcset'];
  for(var i=0;i<keys.length;i++){
    var u=htmlAttr(tag,keys[i]);
    if(keys[i].indexOf('srcset')>=0)u=srcset(u);
    if(good(u))return C.abs(base,u);
  }
  return '';
}
function lastImgBefore(h,pos,limit,base){
  h=String(h||'');
  pos=Math.max(0,Math.min(Number(pos||0),h.length));
  var start=Math.max(0,pos-Number(limit||7000));
  var part=h.slice(start,pos),p=part.lastIndexOf('<img');
  while(p>=0){
    var q=part.indexOf('>',p);
    if(q>p){
      var u=imageFromTag(part.slice(p,q+1),base);
      if(good(u))return u;
    }
    part=part.slice(0,p);
    p=part.lastIndexOf('<img');
  }
  return '';
}
function nearAuthorImage(h,base){
  h=String(h||'');
  var direct=['#video-user-avatar + img&&src','#video-user-avatar&&src','#video-user-avatar&&data-src','#video-user-avatar&&parent&&img&&src','#video-artist-name&&parent&&img&&src','#video-artist-name&&parent&&parent&&img&&src'];
  for(var i=0;i<direct.length;i++){
    var u=attr(h,direct[i]);
    if(good(u))return C.abs(base,u);
  }
  var markers=['id="video-user-avatar"',"id='video-user-avatar'"];
  for(var m=0;m<markers.length;m++){
    var p=h.indexOf(markers[m]);
    if(p<0)continue;
    var left=h.lastIndexOf('<',p),right=h.indexOf('>',p);
    if(left>=0&&right>left){
      var own=imageFromTag(h.slice(left,right+1),base);
      if(good(own))return own;
      var next=h.indexOf('<img',right+1);
      if(next>=0&&next-right<1600){
        var end=h.indexOf('>',next);
        if(end>next){
          var adj=imageFromTag(h.slice(next,end+1),base);
          if(good(adj))return adj;
        }
      }
    }
  }
  return '';
}
function artistSearchAvatar(name,base){
  name=clean(name);
  if(!name)return '';
  try{
    var url=C.query(base+'/search',{type:'artist',query:name,page:1});
    var r=C.get(url,{base:base,referer:base+'/',timeout:16000});
    if(!r||r.challenge||Number(r.statusCode||0)>=400)return '';
    var a=nodes(r.body,'.search-artist-card');
    for(var i=0;i<a.length;i++){
      var n=text(a[i],'.search-artist-title&&Text')||text(a[i],'.title&&Text');
      if(clean(n)!==name)continue;
      var u=imageFromNode(a[i],base);
      if(good(u))return u;
    }
  }catch(e){}
  return '';
}
function commentMarkerAvatar(body,item,base){
  if(!item||!item.id)return '';
  var marker='reply-section-wrapper-'+String(item.id),p=String(body||'').indexOf(marker);
  if(p<0)return '';
  return lastImgBefore(body,p,9000,base);
}
function userTokenPos(body,user,from){
  body=String(body||'');user=String(user||'');from=Number(from||0);
  if(!user)return -1;
  var esc=user.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  var a=['>'+user+'<','>'+esc+'<'];
  for(var i=0;i<a.length;i++){
    var p=body.indexOf(a[i],from);
    if(p>=0)return p+1;
  }
  return body.indexOf(user,from);
}
function sequentialUserAvatars(body,items,base){
  body=String(body||'');items=items||[];
  var out=[],cursor=0;
  for(var i=0;i<items.length;i++){
    var p=userTokenPos(body,items[i]&&items[i].user,cursor),u='';
    if(p>=0){u=lastImgBefore(body,p,5000,base);cursor=p+String((items[i]&&items[i].user)||'').length;}
    out.push(u||'');
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
P.video=function(id){
  var v=oldVideo(id),base=(v&&v.base)||C.resolveHost(false),raw=String((v&&v.raw)||''),u='';
  if(v){
    u=nearAuthorImage(raw,base);
    if(!good(u))u=artistSearchAvatar(v.artist,base);
    if(good(u))v.artistAvatar=headerPic(u,base);
    else v.artistAvatar='';
    if(v.uploader&&good(v.uploader.avatar))v.uploader.avatar=headerPic(v.uploader.avatar,base);
  }
  return v;
};
P.comments=function(videoId){
  var r=oldComments(videoId);
  if(!r||!r.items||!r.items.length)return r;
  var base=C.resolveHost(false),body='',seq=[];
  try{
    var url=C.query(base+'/loadComment',{type:'video',id:videoId});
    var x=C.get(url,{base:base,referer:base+'/watch?v='+videoId,timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      body=jsonPart(x.body,'comments');
      seq=sequentialUserAvatars(body,r.items,base);
      for(var i=0;i<r.items.length;i++){
        var u=commentMarkerAvatar(body,r.items[i],base);
        if(!good(u)&&i<seq.length)u=seq[i];
        if(good(u))r.items[i].avatar=headerPic(u,base);
        else r.items[i].avatar='';
      }
    }
  }catch(e){}
  return r;
};
P.replies=function(commentId){
  var a=oldReplies(commentId)||[];
  if(!a.length)return a;
  var base=C.resolveHost(false);
  try{
    var x=C.get(C.query(base+'/loadReplies',{id:commentId}),{base:base,referer:base+'/',timeout:16000});
    if(x&&!x.challenge&&Number(x.statusCode||0)<400){
      var body=jsonPart(x.body,'replies'),seq=sequentialUserAvatars(body,a,base);
      for(var i=0;i<a.length;i++){
        if(i<seq.length&&good(seq[i]))a[i].avatar=headerPic(seq[i],base);
        else a[i].avatar='';
      }
    }
  }catch(e){}
  return a;
};
P.avatarDiagnostic20=function(videoId){
  var out={build:'2.0.0-test.20',videoId:String(videoId||''),artist:'',artistAvatar:'',commentCount:0,commentAvatarCount:0};
  try{var v=P.video(videoId);out.artist=v&&v.artist||'';out.artistAvatar=v&&v.artistAvatar||'';}catch(e){out.videoError=String(e.message||e);}
  try{var r=P.comments(videoId),a=(r&&r.items)||[];out.commentCount=a.length;for(var i=0;i<a.length;i++)if(good(a[i].avatar))out.commentAvatarCount++;}catch(e){out.commentError=String(e.message||e);}
  return out;
};
HanimePages.build='2.0.0-test.20';
HanimeCore.build='2.0.0-test.20';
HanimeProvider.build='2.0.0-test.20';
})(HanimeCore,HanimeProvider,HanimePages);