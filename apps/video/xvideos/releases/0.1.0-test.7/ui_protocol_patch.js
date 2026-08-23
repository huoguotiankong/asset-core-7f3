/* XVideos UI Protocol Patch 0.1.0-test.7 */
(function(){
  if(typeof XVideosRemoteRuntime==='undefined'||typeof XVideosCore==='undefined')throw new Error('XVideos Test7 UI preflight failed');
  var R=XVideosRemoteRuntime,C=XVideosCore,A='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/assets/';
  R.version='0.1.0-test.7';R.build=10107;

  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(C.decode(t));}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function btn(d,t,url,on){add(d,{title:(on?'● ':'')+t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在官网打开',desc:url,col_type:'text_center_1',url:'web://'+url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:C.decode(c.title||'Video'),desc:C.decode(c.desc||''),pic_url:c.img||'',url:C.page('xvideosDetail',{u:c.url}),col_type:'movie_2',extra:{id:'xv7_video_'+C.hash(c.url),lineVisible:false}};}
  function videos(d,a){for(var i=0;i<(a||[]).length;i++)add(d,videoCard(a[i]));}
  function creatorCard(p,kind){
    var label=kind==='channels'?'频道':kind==='profiles'?'创作者':'演员',meta=[];
    if(p.videoCount)meta.push(p.videoCount+' 个视频');
    if(p.subscribers)meta.push(p.subscribers+' 订阅');
    if(!meta.length&&p.desc)meta.push(p.desc);
    if(!meta.length)meta.push(label);
    return{title:C.decode(p.title||label),desc:C.decode(meta.join(' · ')),pic_url:p.img||A+'account.svg',url:C.page('xvideosProfile',{u:p.url,k:kind,seed:p.rawImg||''}),col_type:'movie_2',extra:{id:'xv7_creator_'+C.hash(p.url),lineVisible:false}};
  }
  function cleanStat(v,label){
    v=C.clean(C.decode(v||''));
    if(!v)return'';
    if(label==='年龄')v=v.replace(/^(?:年龄|age)\s*[:：]?\s*/i,'');
    if(label==='性别')v=v.replace(/^(?:性别|sex|gender)\s*[:：]?\s*/i,'');
    return v;
  }

  R.creators=function(){
    var kind=C.param('kind','pornstars'),q=C.clean(C.param('q','')),group=C.param('u',''),groupName=C.param('n',''),page=C.pageNo(),d=[],r,i;
    title(groupName||(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'));
    if(!group){
      btn(d,'演员',C.page('xvideosCreators',{kind:'pornstars'}),kind==='pornstars');
      btn(d,'频道',C.page('xvideosCreators',{kind:'channels'}),kind==='channels');
      btn(d,'创作者',C.page('xvideosCreators',{kind:'profiles'}),kind==='profiles');
      add(d,{title:'搜索'+(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),desc:q||'输入名字',pic_url:A+'creators.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCreators',{kind:kind})+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    }
    r=C.creatorList(kind,page,q,group||'');
    if(r.regions&&r.regions.length&&!group&&kind==='pornstars'){
      section(d,'地区筛选','只用于筛选演员 · 已合并官网同义地区标签');
      for(i=0;i<r.regions.length;i++)add(d,{title:r.regions[i].name,col_type:'flex_button',url:C.page('xvideosCreators',{kind:'pornstars',u:r.regions[i].url,n:r.regions[i].name}),extra:{lineVisible:false}});
    }
    section(d,group?(groupName||'结果'):(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),r.profiles.length?('当前页 '+r.profiles.length+' 项 · 双列'+(kind==='channels'?' · 显示视频数':'')):'当前页未识别到实体');
    for(i=0;i<r.profiles.length;i++)add(d,creatorCard(r.profiles[i],kind));
    if(!r.profiles.length&&page===1)empty(d,'暂无可识别实体','当前只接受与页面类型匹配的真实账号路径。',r.url);
    setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),kind=C.param('k',''),seed=C.param('seed',''),page=C.pageNo(),d=[],i;
    if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}
    var x=C.profile(u,page,seed);title(x.name);
    add(d,{title:C.decode(x.name),desc:C.decode(x.desc||'XVideos 创作者'),pic_url:x.img||A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+u,extra:{lineVisible:false}});
    var stats=x.stats||[],m={};for(i=0;i<stats.length;i++)m[stats[i].name]=stats[i].value;
    add(d,{title:'视频：'+(m['视频']||String(x.totalVideos||x.videos.length||0)),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'浏览：'+(m['浏览']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'订阅：'+(m['订阅']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'播放：'+(m['播放']||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});
    var sex=cleanStat(m['性别'],'性别'),age=cleanStat(m['年龄'],'年龄'),info=[];
    if(sex)info.push('性别 '+sex);if(age)info.push('年龄 '+age);
    if(info.length)section(d,'资料',info.join(' · '));
    if(x.desc){section(d,'简介','');add(d,{title:C.decode(x.desc),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}
    section(d,'视频',x.totalVideos?('共 '+x.totalVideos+' 个 · 当前页 '+x.videos.length+' 个'):('当前页 '+x.videos.length+' 个'));
    videos(d,x.videos);
    if(!x.videos.length)empty(d,'主页视频暂未恢复','Test7 已按官网 JSON 短字段 eid/u/t/tf/i/d 直接解析，并尝试当前 /videos/new 与 /videos/best 协议。',x.videoUrl||u);
    divider(d);add(d,{title:'官网主页',pic_url:A+'globe.svg',col_type:'text_center_1',url:'web://'+u,extra:{lineVisible:false}});
    setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.decode(C.param('n','视频评论'));title('评论');var d=[],h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000}),r=C.commentsForVideo(u,h),a=r.comments||[],i,c;
    section(d,n,a.length?('已恢复 '+a.length+' 条原站评论'):'原站评论正文仍未恢复');
    for(i=0;i<a.length;i++){
      c=a[i];add(d,{title:C.decode(c.user)+(c.time?' · '+C.decode(c.time):''),desc:C.decode(c.text)+(c.likes?('\n赞 '+c.likes):''),pic_url:c.img||A+'account.svg',col_type:'avatar',url:c.url?C.page('xvideosProfile',{u:c.url}):'hiker://empty',extra:{lineVisible:false}});
    }
    if(!a.length){
      add(d,{title:'动态评论仍未命中',desc:'Test7 已从“猜 AJAX 地址”改为优先加载当前视频的 WebView 动态 DOM，再解析真实评论节点；如果这里仍为空，说明当前设备返回的评论结构还需要下一轮针对实机 DOM 继续适配。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:'官网评论',desc:'在当前 X5 会话中查看原站评论',pic_url:A+'comments.svg',col_type:'text_center_1',url:'x5://'+u+'#comments',extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.accountList=function(){
    var kind=C.param('kind','history'),n=C.param('n','账号视频'),page=C.pageNo();title(n);var d=[];
    if(!C.accountReady()){empty(d,'需要登录','请先在 XVideos 官方账号页登录，再同步当前 X5 会话。',C.loginUrl());setResult(d);return;}
    if(page===1)section(d,n,(C.accountName()?C.accountName()+' · ':'')+'会话 '+C.authFingerprint());
    var r=C.accountVideos(kind,page);videos(d,r.cards);
    if(!r.cards.length&&page===1){
      section(d,'当前列表未恢复',r.error||'官网返回中没有可解析视频。');
      add(d,{title:'重新同步 X5 会话',desc:'官网已登录但原生列表为空时先重新同步一次',col_type:'text_1',url:$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10107);XVideosBoot.loadOnly();var x=XVideosCore.syncWebCookie();return'toast://'+x.message;},C.bootstrap),extra:{lineVisible:false}});
      add(d,{title:'在官网打开',desc:r.url,col_type:'text_center_1',url:'x5://'+r.url,extra:{lineVisible:false}});
    }
    setResult(d);
  };
})();
