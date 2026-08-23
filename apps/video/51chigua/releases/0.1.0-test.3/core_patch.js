/* 51吃瓜 Core Patch 0.1.0-test.3 */
(function(){
  if(typeof Cg51Core==='undefined') throw new Error('Cg51Core missing');
  var C=Cg51Core;
  C.version='0.1.0-test.3';
  C.build=10103;
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/bootstrap_test_v3_b10103.js?v=10103';
  C.schema='3';

  C.categoryGroups=function(){
    return [
      {name:'吃瓜热门',desc:'全网热瓜 · 校园 · 网红',items:[
        {name:'今日吃瓜',slug:'wpcz'},{name:'学生校园',slug:'xsxy'},{name:'网红黑料',slug:'whhl'},
        {name:'热门大瓜',slug:'rdsj'},{name:'吃瓜榜单',slug:'mrdg'},{name:'必看大瓜',slug:'bkdg'}
      ]},
      {name:'娱乐天地',desc:'剧情 · 短剧 · 合集',items:[
        {name:'看片娱乐',slug:'ysyl'},{name:'每日大赛',slug:'mrds'},{name:'伦理道德',slug:'lldd'},
        {name:'国产剧情',slug:'gcjq'},{name:'探花精选',slug:'thjx'},{name:'网黄合集',slug:'whhj'},
        {name:'免费短剧',slug:'cbdj'}
      ]},
      {name:'黑料事件',desc:'人物 · 海外 · 事件',items:[
        {name:'骚男骚女',slug:'snsn'},{name:'明星黑料',slug:'whmx'},{name:'海外吃瓜',slug:'hwcg'},
        {name:'人人吃瓜',slug:'rrcg'},{name:'领导干部',slug:'ldcg'}
      ]},
      {name:'吃瓜百科',desc:'资讯 · 涨知识 · 看戏',items:[
        {name:'吃瓜看戏',slug:'qubk'},{name:'擦边聊骚',slug:'dcbq'},{name:'51涨知识',slug:'zzs'},{name:'吃瓜新闻',slug:'cgxw'}
      ]},
      {name:'51原创',desc:'原创内容专区',items:[
        {name:'51品茶',slug:'51by'},{name:'原创博主',slug:'yczq'},{name:'51剧场',slug:'51djc'}
      ]}
    ];
  };
  C.categoryUrl=function(slug){return C.base()+'/category/'+slug+'/';};
  C.categoryPath=function(categoryUrl,page){
    var p=C.pathOf(categoryUrl).replace(/\?.*$/,'');
    if(p.charAt(p.length-1)!=='/')p+='/';
    page=parseInt(page,10)||1;
    return page<=1?p:p+page+'/';
  };
  C.searchPath=function(q,page){
    page=parseInt(page,10)||1;
    var p='/search/'+C.q(q)+'/';
    return page<=1?p:p+page+'/';
  };

  var oldExtractMedia3=C.extractMedia;
  C.extractMedia=function(html,base){
    var out=oldExtractMedia3(html,base)||[],s=C.s(html),re=/<div\b([^>]*\bclass\s*=\s*["'][^"']*\bdplayer\b[^"']*["'][^>]*)>/ig,m,a,cfg,vm,u,n,i,found;
    while((m=re.exec(s))){
      a=m[1];
      cfg=C.attr(a,'data-config');
      if(!cfg)continue;
      cfg=C.decode(cfg);
      vm=cfg.match(/["']url["']\s*:\s*["']([^"']+)["']/i);
      if(!vm)continue;
      u=C.abs(C.decode(vm[1]).replace(/\\\//g,'/'),base);
      if(!u)continue;
      n=C.clean(C.attr(a,'data-video_title')||C.attr(a,'data-video_id'));
      found=false;
      for(i=0;i<out.length;i++){
        if(out[i].url===u){
          if(n)out[i].name=n;
          out[i].route='dplayer';
          found=true;break;
        }
      }
      if(!found)out.push({url:u,ref:base,route:'dplayer',name:n});
    }
    for(i=0;i<out.length;i++)if(!out[i].name)out[i].name='视频 '+(i+1);
    return C.unique(out,function(v){return v.url;});
  };

  C.playerContract=function(media,articleUrl){
    media=media||[];
    var i,urls=[],names=[],headers=[],h,u;
    if(!media.length)return'video://'+articleUrl;
    if(media.length===1){
      C.diag('play','detail-contract-'+(media[0].route||'direct'),media[0].url,'');
      return C.video(media[0].url,media[0].ref||articleUrl);
    }
    for(i=0;i<media.length&&i<20;i++){
      u=media[i];
      urls.push(u.url);
      names.push(C.clean(u.name)||('视频 '+(i+1)));
      h={'Referer':u.ref||articleUrl,'User-Agent':C.ua,'Cookie':'user-choose=true'};
      if(C.origin(articleUrl))h.Origin=C.origin(articleUrl);
      headers.push(h);
    }
    C.diag('play','detail-playlist',articleUrl,'');
    return JSON.stringify({urls:urls,names:names,headers:headers});
  };

  C.postId=function(url){
    var m=C.s(url).match(/\/archives\/(\d+)/i);
    return m?m[1]:'';
  };
  C.commentApi=function(url){
    var id=C.postId(url);
    return id?C.base()+'/comments/'+id+'.json':'';
  };
  C.commentTime=function(v){
    if(v===undefined||v===null||v==='')return'';
    if(typeof v==='number'||/^\d{10,13}$/.test(C.s(v))){
      var n=parseInt(v,10);if(n<100000000000)n*=1000;
      try{var d=new Date(n),z=function(x){return x<10?'0'+x:x;};return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+' '+z(d.getHours())+':'+z(d.getMinutes());}catch(e){}
    }
    return C.clean(v);
  };
  C.parseCommentJson=function(raw){
    var root,out=[],seen={},limit=120;
    try{root=JSON.parse(raw);}catch(e){return[];}
    function pick(o,keys){
      var i,v;
      if(!o||typeof o!=='object')return'';
      for(i=0;i<keys.length;i++){v=o[keys[i]];if(v!==undefined&&v!==null&&typeof v!=='object'&&C.clean(v)!=='')return v;}
      return'';
    }
    function cleanBody(v){
      v=C.s(v);
      if(!v)return'';
      return C.strip(v);
    }
    function visit(node,depth){
      var i,k,body,author,id,time,img,parent,key,childKeys;
      if(out.length>=limit||node===undefined||node===null)return;
      if(Object.prototype.toString.call(node)==='[object Array]'){
        for(i=0;i<node.length&&out.length<limit;i++)visit(node[i],depth);
        return;
      }
      if(typeof node!=='object')return;
      body=cleanBody(pick(node,['content','text','comment','body','message','comment_text','commentText','html','contentText']));
      author=C.clean(pick(node,['author','name','nickname','nick','user_name','username','screenName','screen_name']));
      id=C.clean(pick(node,['cid','coid','comment_id','commentId','id']));
      time=C.commentTime(pick(node,['created','created_at','createTime','time','date','datetime']));
      img=C.clean(pick(node,['avatar','avatar_url','avatarUrl','head','headimg','face','photo']));
      parent=C.clean(pick(node,['parent','parent_id','parentId','pid']));
      if(body&&(author||id||time)){
        key=(id||author+'|'+time+'|'+body.slice(0,80));
        if(!seen[key]){
          seen[key]=1;
          out.push({id:id,author:author||'瓜友',content:body,time:time,img:img,parent:parent,depth:depth||0});
        }
      }
      childKeys=['children','child','replies','reply','sons','subComments','sub_comments'];
      for(i=0;i<childKeys.length;i++){k=childKeys[i];if(node[k]&&typeof node[k]==='object')visit(node[k],(depth||0)+1);}
      if(!body){
        childKeys=['data','items','list','comments','rows','result'];
        for(i=0;i<childKeys.length;i++){k=childKeys[i];if(node[k]&&typeof node[k]==='object')visit(node[k],depth||0);}
      }
    }
    visit(root,0);
    return out;
  };
  var oldParseComments3=C.parseComments;
  C.comments=function(url){
    var api=C.commentApi(url),raw='',a=[],r;
    if(api){
      raw=C.rawFetch(api,{timeout:12000,ref:url,accept:'application/json,text/plain,*/*'});
      if(raw)a=C.parseCommentJson(raw);
      if(a.length)return{ok:true,url:api,comments:a,source:'json',rawLength:raw.length};
    }
    r=C.request(url,{route:'comments-fallback',timeout:12000});
    a=r.ok?oldParseComments3(r.html,r.url):[];
    return{ok:r.ok,url:r.url,comments:a,source:a.length?'html':'none',rawLength:raw.length};
  };
})();