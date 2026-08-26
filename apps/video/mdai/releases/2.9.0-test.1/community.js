/* 麻豆AI 2.9.0-test.1 - read-only CommunityProvider / CommentAdapter */
var MDAICommunityV290=(function(){
  function n(v){var x=parseInt(v||0);return isNaN(x)?0:x;}
  function first(o,ks){o=o||{};for(var i=0;i<ks.length;i++){var k=ks[i];if(o[k]!=null&&String(o[k]).trim()!=='')return o[k];}return'';}
  function model(c,x){x=x||{};var user=x.user||x.author||{};var avatar=first(x,['avatarUrl','avatar','authorAvatar','userAvatar','headImg','headUrl'])||first(user,['avatarUrl','avatar','headImg','image']);var replies=Array.isArray(x.replies)?x.replies:[];return{id:first(x,['id','commentId']),author:c.cleanText(first(x,['authorName','username','nickname','name'])||first(user,['nickname','username','name'])||'匿名用户'),avatar:c.image(avatar),time:c.fmtDate(first(x,['createdAt','createTime','publishedAt','time'])),content:c.cleanText(first(x,['content','text','body','message'])),likes:n(first(x,['likeCount','likes','upCount'])),replyCount:n(first(x,['replyCount','repliesCount','childCount'])),replies:replies};}
  function path(target,id,page,size){target=String(target||'video');var key=target==='post'?'postId':'videoId';return'/api/v1/comments?'+key+'='+encodeURIComponent(id)+'&page='+page+'&size='+size;}
  function list(c,target,id,page,size){if(!id)return[];var raw=c.items(c.request(path(target,id,page||1,size||20))),out=[];for(var i=0;i<raw.length;i++)out.push(model(c,raw[i]));return out;}
  function metaText(m){var a=[];if(m.time)a.push(m.time);if(m.likes>0)a.push('喜欢 '+m.likes);if(m.replyCount>0)a.push('回复 '+m.replyCount);return a.join(' · ');}
  function itemList(c,m){var d=[];d.push({title:m.author,desc:metaText(m),img:m.avatar||'',url:'hiker://empty',col_type:m.avatar?'avatar':'text_1',extra:{lineVisible:false}});if(m.content)d.push({title:m.content,url:'hiker://empty',col_type:'long_text',extra:{textSize:16,lineVisible:false}});for(var i=0;i<m.replies.length&&i<3;i++){var r=model(c,m.replies[i]);d.push({title:'↳ '+r.author+(r.time?' · '+r.time:''),desc:r.content,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});}d.push({col_type:'line_blank'});return d;}
  function render(c,list){var d=[];for(var i=0;i<list.length;i++){var a=itemList(c,list[i]);for(var j=0;j<a.length;j++)d.push(a[j]);}return d;}
  return{version:'2.9.0-test.1',model:model,list:list,render:render,path:path};
})();
