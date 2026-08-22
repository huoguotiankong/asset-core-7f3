/* Hanime1 2.0.0-test.13 - author/uploader/avatar/account provider */
(function(C,P){
var BUILD='2.0.0-test.13';
function clean(v){return C.clean(String(v==null?'':v));}
function nodes(h,s){try{return pdfa(String(h||''),s)||[];}catch(e){return [];}}
function text(h,s){try{return clean(pdfh(h,s)||'');}catch(e){return '';}}
function attr(h,s){try{return String(pdfh(h,s)||'').replace(/&amp;/g,'&').trim();}catch(e){return '';}}
function firstText(h,a){for(var i=0;i<a.length;i++){var v=text(h,a[i]);if(v)return v;}return '';}
function firstAttr(h,a){for(var i=0;i<a.length;i++){var v=attr(h,a[i]);if(v)return v;}return '';}
function srcset(v){v=String(v||'').trim();if(!v)return '';return v.split(',')[0].trim().replace(/\s+\d+(?:\.\d+)?[wx]$/i,'').trim();}
function goodImg(u){u=String(u||'').trim();return !!u&&!/^(?:data:|about:blank)/i.test(u)&&!/placeholder|loading|spinner|transparent|blank\.(?:gif|png)/i.test(u);}
function image(h,sel,base){var a=[sel+'&&data-src',sel+'&&src',sel+'&&data-srcset',sel+'&&srcset'];for(var i=0;i<a.length;i++){var u=attr(h,a[i]);if(a[i].indexOf('srcset')>=0)u=srcset(u);if(goodImg(u))return C.abs(base,u);}return '';}
function rawImage(s,base){s=String(s||'');var tags=s.match(/<img\b[^>]*>/gi)||[];for(var i=0;i<tags.length;i++){var t=tags[i],m=t.match(/\b(?:data-src|src|data-srcset|srcset)\s*=\s*(["'])([^"']+)\1/i);if(m){var u=m[2];if(/srcset/i.test(m[0]))u=srcset(u);if(goodImg(u))return C.abs(base,u);}}return '';}
function userId(u){var m=String(u||'').match(/\/user\/(\d+)/);return m?m[1]:'';}
function pageCount(h,def){var total=Number(def||1),a=nodes(h,'ul.pagination li.page-item a.page-link');for(var i=0;i<a.length;i++){var n=parseInt(text(a[i],'Text'),10);if(n>total)total=n;}return total;}
function addPage(u,p){u=String(u||'');if(!u)return u;return u+(u.indexOf('?')>=0?'&':'?')+'page='+encodeURIComponent(p);}
function safeProfile(){try{return P.profile();}catch(e){return null;}}

var oldVideo=P.video,oldComments=P.comments,oldReplies=P.replies,oldProfile=P.profile;
P.video=function(id){
  var v=oldVideo(id),h=String(v.raw||''),base=v.base||C.resolveHost(false),panel=(nodes(h,'.video-description-panel')[0]||h),rows=nodes(panel,'div[style*="display"]'),urow='',i;
  for(i=0;i<rows.length;i++){if(attr(rows[i],'a[href*="/user/"]&&href')){urow=rows[i];break;}}
  if(!urow){var up=h.search(/video-description-panel/i);if(up>=0){var tail=h.slice(up,Math.min(h.length,up+14000)),um=tail.match(/<[^>]+style\s*=\s*(["'])[^"']*display\s*:\s*flex[^"']*\1[^>]*>[\s\S]{0,6000}?<\/[^>]+>/i);if(um)urow=um[0];}}
  var uh=firstAttr(urow||panel,['a[href*="/user/"]&&href']),un=firstText(urow||panel,['a[href*="/user/"] span&&Text','a[href*="/user/"]&&Text']),ua=image(urow||panel,'a[href*="/user/"] img',base)||image(urow||panel,'img',base)||rawImage(urow,base);
  var artist=v.artist||firstText(h,['#video-artist-name&&Text']),aid=v.artistId||firstAttr(h,['#video-subscribe-form input[name=subscribe-artist-id]&&value']),aa=v.artistAvatar||'';
  if(!goodImg(aa))aa=image(h,'img#video-user-avatar',base)||image(h,'#video-user-avatar img',base)||image(h,'.video-artist-wrapper img',base)||image(h,'.video-artist-avatar img',base);
  if(!goodImg(aa)){var ap=h.indexOf('video-user-avatar');if(ap>=0)aa=rawImage(h.slice(Math.max(0,ap-900),Math.min(h.length,ap+3500)),base);}
  if(!goodImg(aa)&&aid){try{var pu=P.publicUser13(aid,'',1);aa=pu.avatar||'';}catch(e){}}
  v.artist=artist;v.artistId=aid;v.artistAvatar=aa||'';v.artistProfile=aid?('/user/'+aid):'';
  v.uploader=un||'';v.uploaderId=userId(uh);if(!goodImg(ua)&&v.uploaderId){try{var uu=P.publicUser13(v.uploaderId,'',1);ua=uu.avatar||'';}catch(e2){}}v.uploaderAvatar=ua||'';v.uploaderProfile=v.uploaderId?('/user/'+v.uploaderId):'';
  return v;
};

P.publicUser13=function(id,path,page){
  id=String(id||'').trim();if(!id)throw new Error('缺少用户 ID');var base=C.resolveHost(false),p=Number(page||1),rel=String(path||('/user/'+id));if(/^https?:/i.test(rel))rel=rel.replace(/^https?:\/\/[^/]+/i,'');if(p>1&&rel.indexOf('page=')<0)rel=addPage(rel,p);
  var r=C.get(base+(rel.charAt(0)==='/'?'':'/')+rel,{base:base,referer:base+'/',timeout:18000});if(r.challenge)throw new Error('NEED_VERIFY|'+base+rel+'|作者页');if(!r||Number(r.statusCode||0)>=400)throw new Error('作者页请求失败：HTTP '+Number((r&&r.statusCode)||0));var h=String(r.body||''),name=firstText(h,['.profile-display-name&&Text','#user-modal-name&&Text','h1&&Text']),avatar=image(h,'.profile-avatar-wrapper img',base)||image(h,'#user-modal-dp-wrapper img',base)||image(h,'img#playlist-avatar',base),handle=firstText(h,['.profile-sub-stats-id&&Text']),stats=firstText(h,['.profile-sub-stats-new-line&&Text']),nums=(stats.match(/[\d,]+/g)||[]).map(function(x){return parseInt(x.replace(/,/g,''),10)||0;}),bio=firstText(h,['.profile-description&&Text','.user-description&&Text','.profile-bio&&Text']),tabs={home:'/user/'+id,videos:'',playlists:''};
  var as=nodes(h,'a[href]');for(var i=0;i<as.length;i++){var tx=text(as[i],'Text').replace(/\s+/g,''),href=attr(as[i],'href');if(!href)continue;if(/首頁|首页|Home/i.test(tx)&&href.indexOf('/user/'+id)>=0)tabs.home=href;else if(/影片|视频|Videos/i.test(tx)&&href.indexOf('/user/'+id)>=0)tabs.videos=href;else if(/播放清單|播放清单|片單|片单|Playlists/i.test(tx)&&href.indexOf('/user/'+id)>=0)tabs.playlists=href;}
  if(!tabs.videos)tabs.videos='/user/'+id+'/videos';if(!tabs.playlists)tabs.playlists='/user/'+id+'/playlists';
  var videos=[];try{videos=P.cards(h,base)||[];}catch(e){}var pls=[],ps=nodes(h,'.playlist-item-wrapper,.playlist-card,.user-tab-item-wrapper');for(i=0;i<ps.length;i++){var ph=firstAttr(ps[i],['a[href*=playlist]&&href','a&&href']),pm=ph.match(/[?&]list=([^&]+)/),pt=firstText(ps[i],['.playlist-title&&Text','.title&&Text']);if(pm&&pt)pls.push({id:pm[1],title:pt,count:firstText(ps[i],['.playlist-count&&Text','.stat-item&&Text']),img:image(ps[i],'img',base)});}
  return {id:id,name:name||('用户 '+id),avatar:avatar||'',handle:handle||('@'+id),subscriberCount:nums.length?nums[0]:0,videoCount:nums.length>1?nums[1]:0,bio:bio,tabs:tabs,path:rel,page:p,totalPages:pageCount(h,p),videos:videos,playlists:pls,raw:h,base:base};
};

P.artistDirectory13=function(page,query){
  var base=C.resolveHost(false),p=Number(page||1),url=C.query(base+'/search',{type:'artist',page:p,query:query||''}),r=C.get(url,{base:base,referer:base+'/',timeout:18000});if(r.challenge)throw new Error('NEED_VERIFY|'+url+'|作者目录');if(!r||Number(r.statusCode||0)>=400)throw new Error('作者目录请求失败：HTTP '+Number((r&&r.statusCode)||0));var h=String(r.body||''),a=nodes(h,'.search-artist-card'),out=[];for(var i=0;i<a.length;i++){var name=firstText(a[i],['.search-artist-title&&Text','.title&&Text']),href=firstAttr(a[i],['a.overlay&&href','a&&href']),uid=userId(href),q='';try{q=decodeURIComponent((href.match(/[?&]query=([^&]+)/)||[])[1]||'');}catch(e){}var img=image(a[i],'img',base),meta=firstText(a[i],['.search-artist-count&&Text','.card-mobile-meta&&Text']);if(name)out.push({name:name,id:uid,query:q||name,img:img,meta:meta,href:href});}
  return {items:out,page:p,totalPages:pageCount(h,p),url:url};
};

P.profile=function(){var p=oldProfile();try{var base=p.base||C.resolveHost(false),r=C.get(base+'/',{base:base,referer:base+'/',timeout:12000}),h=String((r&&r.body)||''),stats=firstText(h,['.profile-sub-stats-new-line&&Text']),nums=(stats.match(/[\d,]+/g)||[]).map(function(x){return parseInt(x.replace(/,/g,''),10)||0;});if(!goodImg(p.avatar))p.avatar=image(h,'#user-modal-dp-wrapper img',base)||image(h,'.profile-avatar-wrapper img',base)||p.avatar||'';p.subscriberCount=nums.length?nums[0]:0;p.videoCount=nums.length>1?nums[1]:0;}catch(e){}return p;};

P.comments=function(videoId){
  var base=C.resolveHost(false),url=C.query(base+'/loadComment',{type:'video',id:videoId}),r=C.get(url,{base:base,referer:base+'/watch?v='+videoId,timeout:16000});if(r.challenge)throw new Error('NEED_VERIFY|'+base+'/watch?v='+videoId+'|评论');if(!r||Number(r.statusCode||0)>=400)throw new Error('评论失败：HTTP '+Number((r&&r.statusCode)||0));var body=String(r.body||'');try{var j=JSON.parse(body);if(j&&typeof j.comments==='string')body=j.comments;}catch(e){}var root=nodes(body,'#comment-start')[0]||body,children=nodes(body,'#comment-start > *');if(!children.length)children=nodes(root,'.row,.comment-row,.comment-wrapper');var wraps=nodes(body,'div[id^=reply-section-wrapper]'),out=[],ci=0;
  if(children.length>=2){for(var x=0;x+1<children.length;x+=2){var b=children[x],post=children[x+1],fs=nodes(b,'.comment-index-text');if(fs.length<2)continue;var user=firstText(fs[0],['a&&Text','Text']),content=text(fs[1],'Text');if(!user||!content)continue;var rid=ci<wraps.length?String(attr(wraps[ci],'id')).split('-').pop():'';if(!rid)rid=attr(b,'span.report-btn&&data-reportable-id')||attr(post,'input[name=comment-id]&&value');var meta=text(post,'Text')+' '+text(b,'Text'),rm=meta.match(/(\d+)\s*回(?:复|覆)/i),like=firstText(post,['span[style]&&Text']);out.push({id:rid,user:user,content:content,time:firstText(fs[0],['span&&Text']),avatar:image(b,'img',base),replyCount:rm?parseInt(rm[1],10)||0:0,likes:like||''});ci++;}}
  if(!out.length){var old=oldComments(videoId);out=(old&&old.items)||[];for(var y=0;y<out.length;y++){if(!out[y].avatar){var ims=nodes(body,'img');if(y<ims.length)out[y].avatar=image(ims[y],'img',base)||C.abs(base,attr(ims[y],'src'));}}return {items:out,csrf:old.csrf,userId:old.userId};}
  return {items:out,csrf:firstAttr(body,['input[name=_token]&&value']),userId:firstAttr(body,['input[name=comment-user-id]&&value'])};
};

P.replies=function(commentId){
  var base=C.resolveHost(false),r=C.get(C.query(base+'/loadReplies',{id:commentId}),{base:base,referer:base+'/',timeout:16000});if(r.challenge)throw new Error('NEED_VERIFY|'+base+'|回复');if(!r||Number(r.statusCode||0)>=400)throw new Error('回复失败：HTTP '+Number((r&&r.statusCode)||0));var body=String(r.body||'');try{var j=JSON.parse(body);if(j&&typeof j.replies==='string')body=j.replies;}catch(e){}var fs=nodes(body,'.comment-index-text'),imgs=nodes(body,'img'),out=[];for(var i=0,ri=0;i+1<fs.length;i+=2,ri++){var u=firstText(fs[i],['a&&Text','Text']),c=text(fs[i+1],'Text');if(u&&c)out.push({user:u,content:c,time:firstText(fs[i],['span&&Text']),avatar:ri<imgs.length?(image(imgs[ri],'img',base)||C.abs(base,attr(imgs[ri],'src'))):''});}if(!out.length)return oldReplies(commentId)||[];return out;
};

P.build=BUILD;C.build=BUILD;
})(HanimeCore,HanimeProvider);
