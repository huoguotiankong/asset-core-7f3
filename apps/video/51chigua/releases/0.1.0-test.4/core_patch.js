/* 51吃瓜 Core Patch 0.1.0-test.4 */
(function(){
  if(typeof Cg51Core==='undefined') throw new Error('Cg51Core missing');
  var C=Cg51Core;
  C.version='0.1.0-test.4';
  C.build=10104;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/bootstrap_test_v4_b10104.js?v=10104';
  C.schema='4';

  C.commentMeta=function(raw){
    var o;
    try{o=JSON.parse(raw);}catch(e){return{total:0};}
    function pick(n,ks){var i,v;if(!n||typeof n!=='object')return'';for(i=0;i<ks.length;i++){v=n[ks[i]];if(v!==undefined&&v!==null&&typeof v!=='object'&&C.s(v)!=='')return v;}return'';}
    var total=pick(o,['total','count','totalCount','total_count','commentsCount','comments_count']);
    total=parseInt(total,10)||0;
    return{total:total};
  };

  C.parseCommentJson=function(raw){
    var root,out=[],seen={},limit=160;
    try{root=JSON.parse(raw);}catch(e){return[];}
    function scalar(o,keys){
      var i,v;
      if(!o||typeof o!=='object')return'';
      for(i=0;i<keys.length;i++){
        v=o[keys[i]];
        if(v!==undefined&&v!==null&&typeof v!=='object'&&C.clean(v)!=='')return v;
      }
      return'';
    }
    function nested(node){
      var a=[node&&node.user,node&&node.author,node&&node.member,node&&node.profile,node&&node.account],i;
      for(i=0;i<a.length;i++)if(a[i]&&typeof a[i]==='object')return a[i];
      return{};
    }
    function bodyOf(node){
      var v=scalar(node,['content','text','comment','body','message','comment_text','commentText','html','contentText']);
      return v?C.strip(C.s(v)):'';
    }
    function visit(node,depth){
      var i,k,body,who,id,time,img,parent,key,user,replyTo,likes,childKeys;
      if(out.length>=limit||node===undefined||node===null)return;
      if(Object.prototype.toString.call(node)==='[object Array]'){
        for(i=0;i<node.length&&out.length<limit;i++)visit(node[i],depth);
        return;
      }
      if(typeof node!=='object')return;
      user=nested(node);
      body=bodyOf(node);
      who=scalar(node,['authorName','author_name','nickname','nick','user_name','username','screenName','screen_name','name']);
      if(!who&&typeof node.author!=='object')who=scalar(node,['author']);
      if(!who)who=scalar(user,['nickname','nick','user_name','username','screenName','screen_name','name','displayName','display_name']);
      id=scalar(node,['cid','coid','comment_id','commentId','id']);
      time=C.commentTime(scalar(node,['created','created_at','createTime','create_time','time','date','datetime','timestamp']));
      img=scalar(node,['avatar','avatar_url','avatarUrl','head','headimg','headImg','face','photo','image']);
      if(!img)img=scalar(user,['avatar','avatar_url','avatarUrl','head','headimg','headImg','face','photo','image']);
      parent=scalar(node,['parent','parent_id','parentId','pid']);
      replyTo=scalar(node,['reply_to','replyTo','reply_name','replyName','toUser','to_user']);
      likes=parseInt(scalar(node,['likes','likeCount','like_count','agree','support','up']),10)||0;
      if(body&&(who||id||time)){
        key=id||((who||'瓜友')+'|'+time+'|'+body.slice(0,100));
        if(!seen[key]){
          seen[key]=1;
          out.push({id:id,author:C.clean(who)||'瓜友',content:body,time:time,img:C.clean(img),parent:C.clean(parent),replyTo:C.clean(replyTo),likes:likes,depth:depth||0});
        }
      }
      childKeys=['children','child','replies','reply','sons','subComments','sub_comments','replyList','reply_list'];
      for(i=0;i<childKeys.length;i++){k=childKeys[i];if(node[k]&&typeof node[k]==='object')visit(node[k],(depth||0)+1);}
      if(!body){
        childKeys=['data','items','list','comments','rows','result','records'];
        for(i=0;i<childKeys.length;i++){k=childKeys[i];if(node[k]&&typeof node[k]==='object')visit(node[k],depth||0);}
      }
    }
    visit(root,0);
    return out;
  };

  var oldComments4=C.comments;
  C.comments=function(url){
    var api=C.commentApi(url),raw='',a=[],meta={total:0},r;
    if(api){
      raw=C.rawFetch(api,{timeout:12000,ref:url,accept:'application/json,text/plain,*/*'});
      if(raw){a=C.parseCommentJson(raw);meta=C.commentMeta(raw);}
      if(a.length)return{ok:true,url:api,comments:a,source:'json',rawLength:raw.length,total:meta.total||a.length};
    }
    r=oldComments4(url);
    if(r&&r.comments)return{ok:r.ok,url:r.url,comments:r.comments,source:r.source,rawLength:r.rawLength||0,total:r.total||r.comments.length};
    return{ok:false,url:url,comments:[],source:'none',rawLength:raw.length,total:0};
  };
})();
