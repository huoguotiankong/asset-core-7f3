/* 51吃瓜 Runtime Patch 0.1.0-test.5 */
(function(){
  if(typeof Cg51RemoteRuntime==='undefined') throw new Error('Cg51RemoteRuntime missing');
  var R=Cg51RemoteRuntime,C=Cg51Core;
  R.version='0.1.0-test.5';R.build=10105;
  var AS='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/assets/';
  var OFFICIAL_AVATAR='https://51cg1.com/favicon.ico';
  function add(d,x){d.push(x);}
  function esc(s){return String(s===undefined||s===null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function richSection(d,t,desc){add(d,{title:'‘‘’’<strong>'+esc(t)+'</strong>'+(desc?'<small><font color=#8A8A8A>　'+esc(desc)+'</font></small>':''),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}

  R.comments=function(){
    var u=C.param('post_url',''),n=C.param('post_title','评论'),d=[],r,i,c,total,replyLabel,meta;
    try{setPageTitle('评论 · '+n);}catch(e){}
    if(!u){richSection(d,'缺少文章地址','请重新进入');setResult(d);return;}
    r=C.comments(u);total=r.total||r.comments.length;
    add(d,{title:'评论',desc:r.comments.length?('已加载 '+r.comments.length+(total>r.comments.length?(' / '+total):'')+' 条 · 源站实时评论'):'暂无可显示评论',pic_url:OFFICIAL_AVATAR,url:u,col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(r.comments.length)richSection(d,'全部评论',total?('共 '+total+' 条'):'按源站顺序展示');
    for(i=0;i<r.comments.length;i++){
      c=r.comments[i];
      replyLabel=c.depth>0?'↳ 回复':'评论';
      meta=[replyLabel,c.time||'',c.likes?('♡ '+c.likes):''].filter(function(v){return!!v;}).join(' · ');
      add(d,{title:c.author||'瓜友',desc:meta,pic_url:OFFICIAL_AVATAR,col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:(c.depth>0?'　↳ ':'')+esc(c.content||''),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});
      if(i<r.comments.length-1)divider(d);
    }
    if(!r.comments.length){
      richSection(d,'暂未读取到评论','当前文章评论接口没有返回可识别内容');
      add(d,{title:'在原站查看评论',col_type:'text_center_1',url:u,extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.module=function(){return R;};
})();
