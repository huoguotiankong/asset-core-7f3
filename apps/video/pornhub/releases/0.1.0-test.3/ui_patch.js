/* Pornhub Remote UI Patch 0.1.0-test.3 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test3 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.3';R.build=10103;
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function icon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function profileTypeText(t){return t==='channel'?'频道':t==='pornstar'?'Pornstar':t==='model'?'Model':t==='user'?'用户':t||'创作者';}
  function creatorCard(p){
    return{title:p.title||C.profileSlugName(p.url)||'创作者',desc:profileTypeText(p.type)+(p.desc&&p.desc!==p.type?' · '+String(p.desc).replace(/^\w+\s*·?\s*/,''):''),pic_url:p.img||'',url:C.page('pornhubProfile',{u:p.url,n:p.title||'',im:p.rawImg||''}),col_type:'movie_2',extra:{id:'ph_creator3_'+C.hash(p.url),lineVisible:false}};
  }
  function renderCreators(d,a){for(var i=0;i<a.length;i++)add(d,creatorCard(a[i]));}
  function videoCard(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在原站网页打开',desc:url,col_type:'text_1',url:'web://'+url,extra:{lineVisible:false}});}
  function accountNameInput(desc){return{title:'校正账号用户名',desc:desc||'只在自动识别失败时需要；不会读取密码',col_type:'text_1',url:'input://'+JSON.stringify({value:C.accountName()||'',hint:'你自己的 Pornhub 用户名',js:"(function(){var n=String(input||'').trim();require('"+C.bootstrap+"',{headers:{'Cache-Control':'no-cache'}},10103);PornhubBoot.loadOnly();var v=PornhubCore.setAccountName(n);if(!v)return 'toast://用户名格式无效';refreshPage(false);return 'toast://账号身份已绑定：'+v;})()"}),extra:{lineVisible:false}};}

  R.creators=function(){
    var kind=C.param('kind','pornstars'),q=C.param('q',''),page=C.pageNo();title('创作者');var d=[],tabs=[['pornstars','Pornstars'],['channels','频道'],['models','Models'],['users','用户']],i,t;
    for(i=0;i<tabs.length;i++){t=tabs[i];add(d,{title:(kind===t[0]?'● ':'')+t[1],col_type:'scroll_button',url:C.page('pornhubCreators',{kind:t[0]})});}
    add(d,{title:'搜索创作者',desc:q||'输入名字',col_type:'input',url:"(function(){var q=String(input||'').trim();return 'hiker://page/pornhubCreators?rule='+encodeURIComponent('"+C.ruleTitle()+"')+'&simple=true&kind='+encodeURIComponent('"+kind+"')+'&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    var r=C.creatorList(kind,page,q),label=kind==='pornstars'?'Pornstars':kind==='channels'?'频道':kind==='models'?'Models':'用户';
    section(d,q?'搜索 · '+q:'热门 '+label,r.profiles.length?r.profiles.length+' 位 · 双列资料卡':'当前页没有可靠的创作者卡片');
    renderCreators(d,r.profiles);
    if(!r.profiles.length&&page===1)empty(d,'暂未识别到创作者','Test3 已停止把排名数字和默认图标当作创作者；若原站页面正常，请继续截图当前分类。',r.url);
    setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}
    var x=C.profile(u),name=x.name;if(!name||/^(creator|profile)$/i.test(name))name=seed||C.profileSlugName(u)||'创作者';
    var pic=x.img||(seedImg?C.image(seedImg,u):'');title(name);
    add(d,{title:name,desc:profileTypeText(C.profileType(u))+(x.desc?' · '+x.desc:''),pic_url:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'查看原站主页',desc:'完整资料 / 动态 / 互动',col_type:'scroll_button',url:'web://'+u});
    section(d,'公开视频',x.videos.length?x.videos.length+' 项':'当前页未解析到视频');renderVideos(d,x.videos);
    if(!x.videos.length)empty(d,'暂无可展示视频','可以打开原站主页检查该账号的公开视频标签。',u);
    setResult(d);
  };

  R.login=function(){
    title('Pornhub 登录');var d=[],ready=C.accountReady(),name=C.accountName(),avatar=C.accountAvatar();
    section(d,'官方账号登录','账号密码只在 Pornhub 官方网页输入；小程序只同步 Cookie。Test3 不再从首页普通用户链接猜账号身份。');
    add(d,{title:'① 打开官方登录页',desc:'完成邮箱密码 / Google / X / 验证码 / 二次验证',pic_url:A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+C.base()+'/login',extra:{lineVisible:false}});
    add(d,{title:'② 登录成功后返回这里',desc:'建议在网页右上角先确认显示的是你自己的账号',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'③ 验证并同步账号',desc:ready?'重新读取 Cookie，并通过 /user/security 校验当前登录身份':'读取官方 Cookie → 校验安全页 → 绑定当前账号',col_type:'text_1',url:$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);PornhubBoot.loadOnly();var r=PornhubCore.syncWebCookie();refreshPage(false);return'toast://'+r.message;},C.bootstrap),extra:{lineVisible:false,id:'ph_login_sync3'}});
    if(ready){
      section(d,'当前同步状态',name?'已确认账号身份':'Cookie 有效，但用户名尚未可靠识别');
      add(d,{title:name||'已登录 · 待绑定用户名',desc:name?('身份来源：'+(C.accountIdentitySource()||'已验证')):'不会再随机显示其他用户；请手动绑定自己的用户名',pic_url:avatar?C.image(avatar,C.base()):A+'account.svg',col_type:'avatar',url:name?C.page('pornhubAccount'):'hiker://empty',extra:{lineVisible:false}});
      if(!name)add(d,accountNameInput('请输入你自己账号主页 /users/ 后面的用户名'));
      else add(d,accountNameInput('如果显示的不是你的账号，可在这里立即校正'));
      add(d,{title:'进入我的账号',desc:name?'账号身份已确认':'推荐 / Feed 可用；历史、收藏、订阅需先绑定用户名',col_type:'text_1',url:C.page('pornhubAccount'),extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.account=function(){
    title('我的账号');var d=[],ready=C.accountReady(),name=C.accountName(),avatar=C.accountAvatar();
    if(!ready){empty(d,'尚未同步登录','请先在 Pornhub 官方网页登录，再回到小程序同步 Cookie。');add(d,{title:'前往登录',col_type:'text_1',url:C.page('pornhubLogin'),extra:{lineVisible:false}});setResult(d);return;}
    add(d,{title:name||'登录会话已启用',desc:name?('身份已确认 · '+(C.accountIdentitySource()||'verified')):'用户名未确认 · 不会猜测其他用户',pic_url:avatar?C.image(avatar,C.base()):A+'account.svg',col_type:'movie_1_left_pic',url:name?'web://'+C.base()+'/users/'+C.q(name):'hiker://empty',extra:{lineVisible:false}});
    icon(d,'为你推荐','账号推荐','home',C.page('pornhubAccountList',{kind:'recommended',n:'为你推荐'}));
    icon(d,'Feed','订阅动态','feed',C.page('pornhubAccountList',{kind:'feed',n:'Feed'}));
    if(name){
      icon(d,'观看历史','站内账号历史','history',C.page('pornhubAccountList',{kind:'history',n:'观看历史'}));
      icon(d,'站内收藏','Pornhub 账号收藏','favorite',C.page('pornhubAccountList',{kind:'favorites',n:'站内收藏'}));
      section(d,'订阅与主页','与当前已确认用户名绑定');
      add(d,{title:'订阅的创作者',desc:'查看 '+name+' 的 subscriptions',col_type:'text_1',url:C.page('pornhubSubscriptions'),extra:{lineVisible:false}});
      add(d,{title:'我的公开主页',desc:C.base()+'/users/'+name,col_type:'text_1',url:'web://'+C.base()+'/users/'+C.q(name),extra:{lineVisible:false}});
    }else{
      section(d,'需要确认用户名','为避免再次串到别人的账号，观看历史 / 站内收藏 / 订阅暂时锁住。');
      add(d,accountNameInput('绑定你自己的 Pornhub 用户名后立即解锁账号专属页面'));
    }
    section(d,'账号管理','');
    add(d,{title:'重新验证网页登录',desc:'Cookie 或账号变化后使用',col_type:'text_1',url:C.page('pornhubLogin'),extra:{lineVisible:false}});
    if(name)add(d,accountNameInput('显示异常时可手动校正用户名'));
    add(d,{title:'退出本小程序账号会话',desc:'同时清除本小程序保存的用户名和头像，不删除官方网页 Cookie',col_type:'text_1',url:$(C.authEnabledKey).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);PornhubBoot.loadOnly();PornhubCore.logoutLocal();refreshPage(false);return'toast://已清除本小程序账号会话';},C.bootstrap),extra:{lineVisible:false}});
    setResult(d);
  };

  R.accountList=function(){
    var kind=C.param('kind','recommended'),n=C.param('n','账号内容'),page=C.pageNo();title(n);var d=[];
    if(!C.accountReady()){empty(d,'登录状态不可用','请先登录并同步 Cookie。');setResult(d);return;}
    if((kind==='history'||kind==='favorites')&&!C.accountIdentityReady()){empty(d,'账号用户名未确认','Test3 为避免串号，已阻止使用猜测用户名访问账号专属路径。');add(d,accountNameInput('绑定你自己的用户名后再进入'));setResult(d);return;}
    var r=C.accountVideos(kind,page);renderVideos(d,r.cards);if(!r.cards.length&&page===1)empty(d,r.error||'账号页没有可展示视频','若官方网页能正常查看，请继续截图该账号页面。',r.url);setResult(d);
  };
  R.subscriptions=function(){
    var page=C.pageNo();title('订阅的创作者');var d=[];
    if(!C.accountIdentityReady()){empty(d,'账号用户名未确认','订阅路径依赖当前账号用户名，为避免串号暂不请求。');add(d,accountNameInput('绑定你自己的用户名'));setResult(d);return;}
    var r=C.subscriptions(page);for(var i=0;i<r.profiles.length;i++)add(d,creatorCard(r.profiles[i]));if(!r.profiles.length&&page===1)empty(d,r.error||'暂无订阅列表','若网页端有订阅，请截图继续适配。',r.url);setResult(d);
  };
})();
