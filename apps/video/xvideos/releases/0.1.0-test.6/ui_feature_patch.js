/* XVideos UI Feature Patch 0.1.0-test.6 */
(function(){
  if(typeof XVideosRemoteRuntime==='undefined'||typeof XVideosCore==='undefined')throw new Error('XVideos Test6 UI preflight failed');
  var R=XVideosRemoteRuntime,C=XVideosCore,A='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/assets/';
  R.version='0.1.0-test.6';R.build=10106;
  function add(d,x){d.push(x);}function title(t){try{setPageTitle(C.decode(t));}catch(e){}}function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}function divider(d){add(d,{col_type:'line'});}function btn(d,t,url,on){add(d,{title:(on?'● ':'')+t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在官网打开',desc:url,col_type:'text_center_1',url:'web://'+url,extra:{lineVisible:false}});}function videoCard(c){return{title:C.decode(c.title||'Video'),desc:C.decode(c.desc||''),pic_url:c.img||'',url:C.page('xvideosDetail',{u:c.url}),col_type:'movie_2',extra:{id:'xv6_video_'+C.hash(c.url),lineVisible:false}};}function videos(d,a){for(var i=0;i<(a||[]).length;i++)add(d,videoCard(a[i]));}
  function creatorCard(p,kind){var label=kind==='channels'?'频道':kind==='profiles'?'创作者':'演员',desc=p.videoCount?(p.videoCount+' 个视频'):(p.desc||label);return{title:C.decode(p.title||label),desc:C.decode(desc),pic_url:p.img||A+'account.svg',url:C.page('xvideosProfile',{u:p.url,k:kind}),col_type:'movie_2',extra:{id:'xv6_creator_'+C.hash(p.url),lineVisible:false}};}

  R.creators=function(){
    var kind=C.param('kind','pornstars'),q=C.clean(C.param('q','')),group=C.param('u',''),groupName=C.param('n',''),page=C.pageNo(),d=[],r,i;title(groupName||(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'));
    if(!group){
      btn(d,'演员',C.page('xvideosCreators',{kind:'pornstars'}),kind==='pornstars');btn(d,'频道',C.page('xvideosCreators',{kind:'channels'}),kind==='channels');btn(d,'创作者',C.page('xvideosCreators',{kind:'profiles'}),kind==='profiles');
      add(d,{title:'搜索'+(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),desc:q||'输入名字',pic_url:A+'creators.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCreators',{kind:kind})+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    }
    r=C.creatorList(kind,page,q,group||'');
    if(r.regions.length&&!group&&kind==='pornstars'){section(d,'地区筛选','只用于筛选演员，不再作为人物卡');for(i=0;i<r.regions.length;i++)add(d,{title:r.regions[i].name,col_type:'flex_button',url:C.page('xvideosCreators',{kind:'pornstars',u:r.regions[i].url,n:r.regions[i].name}),extra:{lineVisible:false}});}
    section(d,group?(groupName||'结果'):(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),r.profiles.length?('当前页 '+r.profiles.length+' 项 · 双列'+(kind==='channels'?' · 优先显示视频数':'')):'当前页未识别到实体');
    for(i=0;i<r.profiles.length;i++)add(d,creatorCard(r.profiles[i],kind));if(!r.profiles.length&&page===1)empty(d,'暂无可识别实体','Test6 已严格按演员/频道/账号路径分离，不再用地区或导航项补数量。',r.url);setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),kind=C.param('k',''),page=C.pageNo(),d=[],i;if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}var x=C.profile(u,page);title(x.name);
    add(d,{title:C.decode(x.name),desc:C.decode(x.desc||'XVideos 创作者'),pic_url:x.img||A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+u,extra:{lineVisible:false}});
    var stats=x.stats||[],m={};for(i=0;i<stats.length;i++)m[stats[i].name]=stats[i].value;
    add(d,{title:'视频：'+(m['视频']||String(x.totalVideos||x.videos.length||0)),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});add(d,{title:'浏览：'+(m['浏览']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});add(d,{title:'订阅：'+(m['订阅']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});add(d,{title:'播放：'+(m['播放']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});
    if(m['性别']||m['年龄'])section(d,'资料',[m['性别']?('性别 '+m['性别']):'',m['年龄']?('年龄 '+m['年龄']):''].filter(function(v){return!!v;}).join(' · '));
    if(x.desc){section(d,'简介','');add(d,{title:C.decode(x.desc),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}
    section(d,'视频',x.totalVideos?('共 '+x.totalVideos+' 个 · 当前页 '+x.videos.length+' 个'):('当前页 '+x.videos.length+' 个'));videos(d,x.videos);
    if(!x.videos.length)empty(d,'主页视频仍未恢复','已同时尝试 /videos/best/<page> JSON/HTML、转义载荷解包以及 POST fallback；若本轮仍为空，下一轮直接依据该账号返回载荷诊断继续定向适配。',x.videoUrl||u);divider(d);add(d,{title:'官网主页',pic_url:A+'globe.svg',col_type:'text_center_1',url:'web://'+u,extra:{lineVisible:false}});setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.decode(C.param('n','视频评论'));title('评论');var d=[],h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000}),r=C.commentsForVideo(u,h),a=r.comments||[],i,c;section(d,n,a.length?('已恢复 '+a.length+' 条真实评论'):'详情能识别评论数量，但正文仍未由当前返回恢复');
    for(i=0;i<a.length;i++){c=a[i];add(d,{title:C.decode(c.user)+(c.time?' · '+C.decode(c.time):''),desc:C.decode(c.text)+(c.likes?('\n赞 '+c.likes):''),pic_url:c.img||A+'account.svg',col_type:'avatar',url:c.url?C.page('xvideosProfile',{u:c.url}):'hiker://empty',extra:{lineVisible:false}});}
    if(!a.length){add(d,{title:'原生评论尚未恢复',desc:'Test6 已扩大到内联脚本评论 URL、真实 video_id、GET/POST AJAX 两种请求方式；当前仍不制造伪评论。'+(r.videoId?'\n视频ID：'+r.videoId:'')+(r.candidates&&r.candidates.length?'\n候选接口：'+r.candidates.length+' 个':''),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});add(d,{title:'官网评论',desc:'在当前 X5 登录态查看原站评论',pic_url:A+'comments.svg',col_type:'text_center_1',url:'x5://'+u+'#comments',extra:{lineVisible:false}});}setResult(d);
  };

  R.account=function(){
    title('我的 XVideos');var d=[],ready=C.accountReady(),st=C.accountState?C.accountState():{},identity;if(!ready){section(d,'账号会话未连接','请先在官方 /account 页完成登录并同步当前 X5 会话。');add(d,{title:'去登录',pic_url:A+'account.svg',col_type:'text_center_1',url:C.page('xvideosLogin'),extra:{lineVisible:false}});setResult(d);return;}
    identity=C.accountIdentity();section(d,'当前账号',(identity.name||C.accountName()||'已登录')+' · '+C.authFingerprint());
    if(identity.profileUrl)add(d,{title:identity.name||'我的主页',desc:'官方个人主页',pic_url:identity.avatar||A+'account.svg',col_type:'avatar',url:C.page('xvideosProfile',{u:identity.profileUrl,k:'profiles'}),extra:{lineVisible:false}});
    add(d,{title:'喜欢',desc:'Videos I Like',pic_url:A+'favorite.svg',col_type:'icon_small_4',url:C.page('xvideosAccountList',{kind:'liked',n:'喜欢的视频'}),extra:{lineVisible:false}});add(d,{title:'稍后看',desc:'Watch Later',pic_url:A+'watchlater.svg',col_type:'icon_small_4',url:C.page('xvideosAccountList',{kind:'watchlater',n:'稍后观看'}),extra:{lineVisible:false}});add(d,{title:'观看历史',desc:'History',pic_url:A+'history.svg',col_type:'icon_small_4',url:C.page('xvideosAccountList',{kind:'history',n:'观看历史'}),extra:{lineVisible:false}});add(d,{title:'推荐',desc:'账号推荐流',pic_url:A+'best.svg',col_type:'icon_small_4',url:C.page('xvideosAccountList',{kind:'recommended',n:'推荐视频'}),extra:{lineVisible:false}});divider(d);
    add(d,{title:'官网账号页',desc:'用 X5 核对当前登录身份',col_type:'text_1',url:'x5://'+C.loginUrl(),extra:{lineVisible:false}});add(d,{title:'重新同步会话',desc:'切换官网账号后使用',col_type:'text_1',url:$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10106);XVideosBoot.loadOnly();var r=XVideosCore.syncWebCookie();return'toast://'+r.message;},C.bootstrap),extra:{lineVisible:false}});add(d,{title:'退出小程序会话',desc:'只清本程序文件状态，不删除 X5 官网 Cookie',col_type:'text_1',url:$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10106);XVideosBoot.loadOnly();XVideosCore.logoutLocal();return XVideosCore.page('xvideosLogin');},C.bootstrap),extra:{lineVisible:false}});setResult(d);
  };

  R.accountList=function(){var kind=C.param('kind','history'),n=C.param('n','账号视频'),page=C.pageNo();title(n);var d=[];if(!C.accountReady()){empty(d,'需要登录','请先同步 XVideos 官方 X5 会话。',C.loginUrl());setResult(d);return;}if(page===1)section(d,n,(C.accountName()?C.accountName()+' · ':'')+'会话 '+C.authFingerprint());var r=C.accountVideos(kind,page);videos(d,r.cards);if(!r.cards.length&&page===1)empty(d,'该账号列表暂未解析到视频',r.error||'请在 X5 官网核对当前账号与列表内容。',r.url);setResult(d);};
})();
