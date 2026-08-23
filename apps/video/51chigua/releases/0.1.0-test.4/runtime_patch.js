/* 51吃瓜 Runtime Patch 0.1.0-test.4 */
(function(){
  if(typeof Cg51RemoteRuntime==='undefined') throw new Error('Cg51RemoteRuntime missing');
  var R=Cg51RemoteRuntime,C=Cg51Core;
  R.version='0.1.0-test.4';R.build=10104;
  var AS='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/assets/';
  function add(d,x){d.push(x);}
  function pageTitle(t){try{setPageTitle(t);}catch(e){}}
  function esc(s){return String(s===undefined||s===null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function richSection(d,t,desc){add(d,{title:'‘‘’’<strong>'+esc(t)+'</strong>'+(desc?'<small><font color=#8A8A8A>　'+esc(desc)+'</font></small>':''),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function postCard(p){return{title:p.title||'51吃瓜',desc:p.desc||'',pic_url:p.img||'',url:C.page('cg51Detail',{post_url:p.url}),col_type:'movie_2',extra:{id:'cg51_post_'+C.hash(p.url),lineVisible:false}};}
  function renderPosts(d,a,limit){var i,n=limit||a.length;for(i=0;i<a.length&&i<n;i++)add(d,postCard(a[i]));}
  function icon(d,title,pic,url){add(d,{title:title,pic_url:AS+pic,col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function catFeed(c){return C.page('cg51Feed',{cat_url:c.url||C.categoryUrl(c.slug),cat_name:c.name});}
  function commentAvatar(c,ref){var u=C.s(c&&c.img);if(!u)return AS+'comment.svg';return /^https?:\/\//i.test(u)?u:C.abs(u,ref||C.base());}
  function searchUrlExpr(){return"(function(){var q=String(input||'').trim();if(!q)return 'toast://请输入关键词';return 'hiker://page/cg51Search?rule=51吃瓜&simple=true&q='+encodeURIComponent(q);})()";}

  R.home=function(){
    var page=C.pageNo(),d=[],r,cats,i;
    if(page===1){
      pageTitle('51吃瓜');
      add(d,{title:'51吃瓜',desc:'吃瓜爆料 · 图文视频 · 自动切换可用域名',pic_url:'https://51cg1.com/favicon.ico',url:C.page('cg51Settings'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      icon(d,'搜索','search.svg',C.page('cg51Search'));
      icon(d,'分类','categories.svg',C.page('cg51Hub'));
      icon(d,'收藏','favorite.svg',C.page('cg51Favorites'));
      icon(d,'历史','history.svg',C.page('cg51History'));
      cats=[
        {name:'今日吃瓜',slug:'wpcz'},{name:'学生校园',slug:'xsxy'},{name:'网红黑料',slug:'whhl'},
        {name:'热门大瓜',slug:'rdsj'},{name:'吃瓜榜单',slug:'mrdg'},{name:'必看大瓜',slug:'bkdg'},{name:'51剧场',slug:'51djc'}
      ];
      for(i=0;i<cats.length;i++)add(d,{title:cats[i].name,col_type:'scroll_button',url:catFeed(cats[i])});
      richSection(d,'最新内容','官网文章流 · 加密封面已解密');
    }
    r=C.home(page);renderPosts(d,r.posts);
    if(!r.posts.length&&page===1){richSection(d,'暂未解析到内容','可能是当前域名不可达或页面结构变化');add(d,{title:'打开当前官网',col_type:'text_center_1',url:C.base()+'/'});}
    setResult(d);
  };

  R.searchPage=function(){
    var q=C.param('q',''),p=C.pageNo(),d=[],r;
    pageTitle(q?('搜索 · '+q):'搜索');
    if(p===1){
      add(d,{title:'站内搜索',desc:q?('当前关键词：'+q):'搜索标题、人物、事件和标签',pic_url:AS+'search.svg',url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      add(d,{title:'输入关键词',desc:q||'例如：网红、校园、短剧',col_type:'input',url:searchUrlExpr(),extra:{defaultValue:q,lineVisible:false}});
      if(q){
        add(d,{title:'清空搜索',col_type:'scroll_button',url:C.page('cg51Search')});
        add(d,{title:'全部分类',col_type:'scroll_button',url:C.page('cg51Hub')});
        richSection(d,'搜索结果','“'+q+'”');
      }else{
        richSection(d,'搜索提示','输入关键词后直接在本页展示官网结果');
        add(d,{title:'今日吃瓜',col_type:'scroll_button',url:catFeed({name:'今日吃瓜',slug:'wpcz'})});
        add(d,{title:'网红黑料',col_type:'scroll_button',url:catFeed({name:'网红黑料',slug:'whhl'})});
        add(d,{title:'学生校园',col_type:'scroll_button',url:catFeed({name:'学生校园',slug:'xsxy'})});
        add(d,{title:'51剧场',col_type:'scroll_button',url:catFeed({name:'51剧场',slug:'51djc'})});
      }
    }
    if(!q){setResult(d);return;}
    r=C.search(q,p);renderPosts(d,r.posts);
    if(!r.posts.length&&p===1){richSection(d,'没有匹配结果','换一个关键词试试');add(d,{title:'打开原站搜索',col_type:'text_center_1',url:r.url,extra:{lineVisible:false}});}
    setResult(d);
  };

  R.comments=function(){
    var u=C.param('post_url',''),n=C.param('post_title','评论'),d=[],r,i,c,total,replyLabel,meta;
    pageTitle('评论 · '+n);
    if(!u){richSection(d,'缺少文章地址','请重新进入');setResult(d);return;}
    r=C.comments(u);total=r.total||r.comments.length;
    add(d,{title:'评论',desc:r.comments.length?('已加载 '+r.comments.length+(total>r.comments.length?(' / '+total):'')+' 条 · 源站实时评论'):'暂无可显示评论',pic_url:AS+'comment.svg',url:u,col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(r.comments.length)richSection(d,'全部评论',total?('共 '+total+' 条'):'按源站顺序展示');
    for(i=0;i<r.comments.length;i++){
      c=r.comments[i];
      replyLabel=c.depth>0?'↳ 回复':'评论';
      meta=[replyLabel,c.time||'',c.likes?('♡ '+c.likes):''].filter(function(v){return!!v;}).join(' · ');
      add(d,{title:c.author||'瓜友',desc:meta,pic_url:commentAvatar(c,u),col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
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
