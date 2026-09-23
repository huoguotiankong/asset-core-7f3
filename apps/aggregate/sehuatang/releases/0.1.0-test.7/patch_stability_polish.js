/* 色花堂 0.1.0-test.7 / Build 10107 - access state + category mapping + guide + thread polish */
var SeHuaTangPatchTest7=(function(){
  var BASE=SeHuaTangRemoteRuntime;
  var VERSION='0.1.0-test.7',BUILD=10107,RULE_NAME='色花堂';
  var DEFAULT_ORIGIN='https://sehuatang.org';
  var KEY_ORIGIN='sht_origin_v1',KEY_COOKIE='sht_web_cookie_v5',KEY_AGE_OK='sht_age_ok_v5',KEY_AGE_TIME='sht_age_time_v5';
  var KEY_ACCESS='sht_access_ok_v7',KEY_CAT='sht_cat_group_v6',KEY_GROUP_CACHE='sht_forum_groups_v7',KEY_DIAG='sht_diag_v1';
  var UA_M='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var UA_PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';
  var GROUPS=[
    {name:'原创BT电影',fid:'2',seed:'forum-2-1.html'},
    {name:'在线视频区',fid:'41',seed:'forum-41-1.html'},
    {name:'原档收藏',fid:'145',seed:'forum-145-1.html'},
    {name:'色花图片',fid:'155',seed:'forum-155-1.html'},
    {name:'色花文学',fid:'154',seed:'forum-154-1.html'},
    {name:'综合讨论区',fid:'95',seed:'forum-95-1.html'}
  ];
  function s(v){return v==null?'':String(v)}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
  function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
  function hdec(v){var x=s(v),i;for(i=0;i<2;i++)x=x.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ');return x}
  function strip(v){return trim(hdec(v).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/[\t\r]+/g,' ').replace(/\s+/g,' '))}
  function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
  function wwwOrigin(){var o=origin();return o.replace('://sehuatang.','://www.sehuatang.')}
  function abs(h,b){h=hdec(trim(h));if(!h)return'';if(/^https?:\/\//i.test(h))return h;if(/^\/\//.test(h))return'https:'+h;if(/^(javascript:|mailto:|tel:|#)/i.test(h))return'';var m=s(b).match(/^(https?:\/\/[^\/]+)/i),o=m?m[1]:origin();if(h.charAt(0)==='/')return o+h;var c=s(b).split('#')[0].split('?')[0];if(c.charAt(c.length-1)!=='/')c=c.replace(/\/[^\/]*$/,'/');return c+h.replace(/^\.\//,'')}
  function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
  function route(path,p){var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k;for(k in(p||{}))if(p.hasOwnProperty(k)&&p[k]!=null)u+='&'+k+'='+encodeURIComponent(s(p[k]));return u}
  function line(cls){return{col_type:'line',extra:{cls:cls||''}}}
  function section(t,d,cls){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:cls||''}}}
  function empty(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}}}
  function quick(t,u,cls){return{title:t,url:u,col_type:'icon_small_4',extra:{lineVisible:false,cls:cls||''}}}
  function saveDiag(stage,msg){try{setItem(KEY_DIAG,JSON.stringify({stage:stage,origin:origin(),error:s(msg||'').slice(0,700),time:new Date().getTime()}))}catch(e){}}
  function cookie(){var c='';try{c=getVar(KEY_COOKIE,'')||''}catch(e){}if(c)return c;try{c=getCookie(origin())||''}catch(e2){}if(!c)try{c=getCookie(wwwOrigin())||''}catch(e3){}return c}
  function headers(pc,ref){var c=cookie(),h={'User-Agent':pc?UA_PC:UA_M,'Referer':ref||origin()+'/'};if(c){h.Cookie=c;h.cookie=c}return h}
  function isAgeText(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(s(t))}
  function isAgeHtml(h){return isAgeText(strip(h))}
  function looksForum(h){var x=s(h),t=strip(x);return !isAgeText(t)&&(/id=["']threadlisttableid|class=["'][^"']*bm_c|id=["']waterfall|href=["'][^"']*forum-\d+/i.test(x)||/原创BT电影|在线视频区|综合讨论区|亚洲无码原创|高清中文字幕/.test(t))}
  function markAccess(){try{putVar(KEY_ACCESS,'1');putVar(KEY_AGE_OK,'1');putVar(KEY_AGE_TIME,String(new Date().getTime()))}catch(e){}}
  function saveCookieFromContainer(){var c='';try{c=getCookie(origin())||''}catch(e){}if(!c)try{c=getCookie(wwwOrigin())||''}catch(e2){}if(c)try{putVar(KEY_COOKIE,c)}catch(e3){}return c}
  function autoClickJs(){return $.toString(function(){
    function norm(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
    function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
    function clickAge(){
      var ns=document.querySelectorAll('a,button,input,div,span,p,[onclick],[role="button"]'),i,t,n,c;
      for(i=0;i<ns.length;i++){
        t=norm(ns[i]);if(!/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t))continue;
        n=ns[i];try{c=n.closest&&n.closest('a,button,[onclick],[role="button"]');if(c)n=c}catch(e){}
        try{n.dispatchEvent(new MouseEvent('click',{view:window,bubbles:true,cancelable:true}));if(n.click)n.click();return true}catch(e2){}
      }
      return false
    }
    var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
    if(age(body)){clickAge();return null}
    if(document.querySelector('#threadlisttableid,.bm_c,#waterfall,.items,a[href*="forum-"],a[href*="forumdisplay"]')||/原创BT电影|在线视频区|综合讨论区|亚洲无码原创|高清中文字幕/.test(body))return'ready';
    return null
  })}
  function ensureAccess(force){
    var access='';try{access=getVar(KEY_ACCESS,'')||''}catch(e){}
    if(!force&&access==='1')return true;
    var hosts=[origin(),wwwOrigin()],i,h='';
    for(i=0;i<hosts.length;i++){
      try{h=s(fetchCodeByWebView(hosts[i]+'/',{headers:{'User-Agent':UA_M},timeout:18000,blockRules:['.mp4','.m3u8','.woff','.woff2','.ttf'],checkJs:autoClickJs()}))}catch(e2){h=''}
      if(looksForum(h)){markAccess();saveCookieFromContainer();saveDiag('access.v7','自动访问确认成功 · '+hosts[i]);return true}
    }
    return false
  }
  function verifyAge(){
    var d=[],o=origin(),mode=pageParam('sht_mode','login');
    var target=mode==='signin'?o+'/plugin.php?id=dd_sign:index&mobile=2':(mode==='forum'?o+'/forum.php?mobile=2':o+'/member.php?mod=logging&action=login&mobile=2');
    setPageTitle('自动访问确认');
    d.push({title:'自动访问确认',url:o+'/',desc:'list&&screen-90',col_type:'x5_webview_single',extra:{ua:UA_M,showProgress:false,canBack:true,jsLoadingInject:true,js:$.toString(function(host,target,ckKey,ageKey,timeKey,accessKey){
      if(window.__shtV7Timer)clearTimeout(window.__shtV7Timer);
      function norm(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
      function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
      function real(t){return !age(t)&&(document.querySelector('#threadlisttableid,.bm_c,#waterfall,.items,a[href*="forum-"],a[href*="forumdisplay"]')||/原创BT电影|在线视频区|综合讨论区|亚洲无码原创|高清中文字幕/.test(t))}
      function clickAge(){var ns=document.querySelectorAll('a,button,input,div,span,p,[onclick],[role="button"]'),i,t,n,c;for(i=0;i<ns.length;i++){t=norm(ns[i]);if(!/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t))continue;n=ns[i];try{c=n.closest&&n.closest('a,button,[onclick],[role="button"]');if(c)n=c}catch(e){}try{n.dispatchEvent(new MouseEvent('click',{view:window,bubbles:true,cancelable:true}));if(n.click)n.click();return true}catch(e2){}}return false}
      function save(){var c='';try{c=fba.getCookie(location.origin)||''}catch(e){}if(!c)try{c=fba.getCookie(host)||''}catch(e2){}if(c)try{fba.putVar(ckKey,c)}catch(e3){}try{fba.putVar(ageKey,'1');fba.putVar(accessKey,'1');fba.putVar(timeKey,String(Date.now()))}catch(e4){}}
      function tick(){var t=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');if(t.length<15){window.__shtV7Timer=setTimeout(tick,300);return}if(age(t)){clickAge();window.__shtV7Timer=setTimeout(tick,450);return}if(real(t)){save();var rel=String(target||'').replace(/^https?:\/\/[^/]+/i,'');if(target&&rel&&location.href.indexOf(rel)<0){location.href=target;return}}window.__shtV7Timer=setTimeout(tick,700)}
      tick();
    },o,target,KEY_COOKIE,KEY_AGE_OK,KEY_AGE_TIME,KEY_ACCESS)}});
    d.push({title:'说明',desc:'检测到 18+ 首访页会自动点击进入；通过后记录“站点可访问”和 Cookie 两个独立状态。验证码或真人验证仍由官网处理。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    setResult(d)
  }
  function fetchForumPc(){
    var o=origin(),u=o+'/forum.php',h='';
    try{h=s(fetchPC(u,{headers:headers(true,u),timeout:12000}))}catch(e){}
    if(isAgeHtml(h)||!looksForum(h)){
      ensureAccess(true);
      try{h=s(fetchPC(u,{headers:headers(true,u),timeout:12000}))}catch(e2){}
    }
    if(!looksForum(h))try{h=s(fetchCodeByWebView(u,{headers:headers(false,u),timeout:16000,checkJs:autoClickJs()}))}catch(e3){}
    if(looksForum(h)){markAccess();saveCookieFromContainer()}
    return h
  }
  function cacheRead(){try{var x=JSON.parse(getItem(KEY_GROUP_CACHE,'{}')||'{}');if(x.groups&&new Date().getTime()-Number(x.time||0)<21600000)return x.groups}catch(e){}return null}
  function forumId(u){var m=s(u).match(/forum-(\d+)-\d+/i)||s(u).match(/[?&]fid=(\d+)/i);return m?m[1]:''}
  function extractBlockForums(block,base){
    var out=[],seen={},nodes=[],i,t,u,id;
    try{nodes=pdfa(block,'body&&dt')||[]}catch(e){nodes=[]}
    for(i=0;i<nodes.length;i++){
      try{t=trim(pdfh(nodes[i],'a&&Text'));u=pdfh(nodes[i],'a&&href')}catch(e2){t='';u=''}
      u=abs(u,base);id=forumId(u);if(!t||!u||!id||seen[id])continue;seen[id]=1;out.push({title:t,url:u})
    }
    if(!out.length){
      try{nodes=pdfa(block,'body&&a')||[]}catch(e3){nodes=[]}
      for(i=0;i<nodes.length;i++){
        try{t=trim(pdfh(nodes[i],'a&&Text'));u=pdfh(nodes[i],'a&&href')}catch(e4){t='';u=''}
        u=abs(u,base);id=forumId(u);if(!t||!u||!id||seen[id])continue;seen[id]=1;out.push({title:t,url:u})
      }
    }
    return out
  }
  function resolveGroups(){
    var c=cacheRead();if(c)return c;
    var html=fetchForumPc(),blocks=[],groups=[[],[],[],[],[],[]],i,j,b,needle,arr;
    try{blocks=pdfa(html,'body&&.bm_c')||[]}catch(e){blocks=[]}
    for(i=0;i<GROUPS.length;i++){
      needle=new RegExp("forum-"+GROUPS[i].fid+"-\\d+|[?&]fid="+GROUPS[i].fid+"(?:&|[\"'])",'i');
      for(j=0;j<blocks.length;j++){
        b=s(blocks[j]);if(!needle.test(b))continue;arr=extractBlockForums(b,origin()+'/forum.php');if(arr.length){groups[i]=arr;break}
      }
      if(!groups[i].length)groups[i].push({title:GROUPS[i].name,url:origin()+'/'+GROUPS[i].seed})
    }
    try{setItem(KEY_GROUP_CACHE,JSON.stringify({time:new Date().getTime(),groups:groups}))}catch(e2){}
    saveDiag('groups.v7',groups.map(function(x){return x.length}).join(','));
    return groups
  }
  function topicInput(cls){return{title:'搜索主题',desc:'搜索',col_type:'input',url:"(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('sht_search_kw_v1',w);return 'hiker://page/shtSearch?rule=色花堂&simple=true&kw='+encodeURIComponent(w);})()",extra:{defaultValue:'',titleVisible:true,cls:cls||''}}}
  function home(){
    var d=[],idx=Number(getMyVar(KEY_CAT,'0')||0),groups,i,g,access='';
    if(idx<0||idx>5)idx=0;
    try{deleteItemByCls('sht_home_v7')}catch(e){}
    setPageTitle('色花堂');
    groups=resolveGroups();g=groups[idx]||[];
    try{access=getVar(KEY_ACCESS,'')||''}catch(e2){}
    if(access!=='1'&&groups&&groups.length)try{putVar(KEY_ACCESS,'1');access='1'}catch(e3){}
    d.push(topicInput('sht_home_v7'));
    d.push(quick('账号',route('shtVerify',{sht_mode:'login'}),'sht_home_v7'));
    d.push(quick('签到',route('shtVerify',{sht_mode:'signin'}),'sht_home_v7'));
    d.push(quick('搜索',route('shtSearch'),'sht_home_v7'));
    d.push(quick('设置',route('shtSettings'),'sht_home_v7'));
    d.push(line('sht_home_v7'));
    d.push(section('话题',access==='1'?'站点访问已通过'+(cookie()?' · Cookie 已同步':' · Cookie 待登录时同步'):'首次访问尚未建立，可点“账号”自动处理','sht_home_v7'));
    [['最新发表','latest'],['最新热门','hot'],['最新精华','digest']].forEach(function(x){d.push({title:x[0],desc:'原生主题列表',url:route('shtForum',{sht_auto:x[1],sht_name:x[0]}),col_type:'text_1',extra:{lineVisible:false,cls:'sht_home_v7'}})});
    d.push(line('sht_home_v7'));
    d.push(section('论坛分类','六大类两行展示，下面只显示当前大类子板块','sht_home_v7'));
    for(i=0;i<GROUPS.length;i++)d.push({title:(i===idx?'✓ ':'')+GROUPS[i].name,url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(true);return'hiker://empty';},KEY_CAT,i),col_type:'text_3',extra:{lineVisible:false,cls:'sht_home_v7'}});
    d.push(section(GROUPS[idx].name,g.length+' 个板块','sht_home_v7'));
    for(i=0;i<g.length;i++)d.push({title:g[i].title,desc:'进入板块',url:route('shtForum',{sht_url:g[i].url,sht_name:g[i].title}),col_type:'text_2',extra:{lineVisible:false,cls:'sht_home_v7'}});
    setResult(d)
  }
  function anchors(html,base){var out=[],re=/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,m;while((m=re.exec(s(html)))!==null){out.push({href:abs(m[1],base),text:strip(m[2])});if(out.length>9000)break}return out}
  function guideWords(kind){if(kind==='latest')return['最新发表','最新主题'];if(kind==='hot')return['最新热门','热门主题'];if(kind==='digest')return['最新精华','精华主题'];return[]}
  function discoverGuide(kind){
    var h=fetchForumPc(),a=anchors(h,origin()+'/forum.php'),words=guideWords(kind),i,j,t;
    for(i=0;i<a.length;i++){t=trim(a[i].text);for(j=0;j<words.length;j++)if(t===words[j]||t.indexOf(words[j])>=0)return a[i].href}
    var o=origin();if(kind==='latest')return o+'/forum.php?mod=guide&view=newthread';if(kind==='hot')return o+'/forum.php?mod=guide&view=hot';if(kind==='digest')return o+'/forum.php?mod=guide&view=digest';return o+'/forum.php'
  }
  function withPage(u,p){p=Math.max(1,Number(p||1));u=s(u);if(/\/forum-\d+-\d+\.html/i.test(u))return u.replace(/\/forum-(\d+)-\d+\.html/i,'/forum-$1-'+p+'.html');if(/([?&])page=\d+/i.test(u))return u.replace(/([?&])page=\d+/i,'$1page='+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p}
  function fetchTopicHtml(u){var h='';try{h=s(fetchPC(u,{headers:headers(true,u),timeout:12000}))}catch(e){}if(isAgeHtml(h)||h.length<500){ensureAccess(true);try{h=s(fetchPC(u,{headers:headers(true,u),timeout:12000}))}catch(e2){}}if(h.length<500)try{h=s(fetchCodeByWebView(u,{headers:headers(false,u),timeout:17000,checkJs:$.toString(function(){var t=String((document.body&&document.body.innerText)||'');return document.querySelector('a[href*="tid="],a[href*="thread-"]')||t.length>1000?'ready':null;})}))}catch(e3){}return h}
  function forum(){
    var kind=pageParam('sht_auto','');if(!kind)return BASE.module().forum();
    var d=[],name=pageParam('sht_name','主题列表'),pg=Math.max(1,Number(typeof MY_PAGE==='undefined'?1:MY_PAGE||1)),seed=discoverGuide(kind),u=withPage(seed,pg),html=fetchTopicHtml(u),list=[],i,item,img,dbg;
    setPageTitle(name);
    try{dbg=BASE.module()._debug||{};if(dbg.parseThreadsTest4)list=dbg.parseThreadsTest4(html,u)||[]}catch(e){list=[]}
    saveDiag('guide.v7',kind+' · '+u+' · '+html.length+'字 · '+list.length+'主题');
    if(pg===1){d.push(quick('网页版','x5://'+seed));d.push(quick('搜索',route('shtSearch')));d.push(line());d.push(section(name,list.length?'当前页 '+list.length+' 条主题':'未取得可解析主题'))}
    for(i=0;i<list.length;i++){item=list[i];img=item.img?item.img+'@headers='+JSON.stringify(headers(false,u)):'';d.push({title:item.title,desc:'查看帖子',img:img,url:route('shtThread',{sht_url:item.url,sht_name:item.title}),col_type:img?'movie_1':'text_1',extra:{lineVisible:false}})}
    if(!list.length){d.push(empty('仍没有解析到主题','已按官网当前“'+name+'”实际入口重新发现链接'));d.push({title:'诊断信息',desc:u+'\nHTML '+html.length+' 字',url:'hiker://empty',col_type:'long_text'});d.push({title:'打开当前网页版',desc:u,url:'x5://'+u,col_type:'text_1'})}
    setResult(d)
  }
  function pcThreadUrl(u){u=s(u);if(/[?&]mobile=2/i.test(u))u=u.replace(/([?&])mobile=2(&|$)/i,function(_,p,q){return q?p+'mobile=no'+q:''});else if(u.indexOf('?')>=0)u+='&mobile=no';else if(/\.html(?:#|$)/i.test(u))u+='?mobile=no';return u}
  function threadHtml(u){var p=pcThreadUrl(u),h='';try{h=s(fetchPC(p,{headers:headers(true,p),timeout:14000}))}catch(e){}if(isAgeHtml(h)){ensureAccess(true);try{h=s(fetchPC(p,{headers:headers(true,p),timeout:14000}))}catch(e2){}}if(!/#postlist|class=["'][^"']*t_fsz|class=["'][^"']*\bt_f\b/i.test(h))try{h=s(fetchCodeByWebView(p,{headers:headers(false,p),timeout:18000,checkJs:autoClickJs()}))}catch(e3){}return{html:h,url:p}}
  function magnets(x){var t=hdec(s(x)),out=[],seen={},m,re=/magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s"'<>]*)?/ig;while((m=re.exec(t))!==null){var v=m[0].replace(/[)\]}>，。；;]+$/g,'');if(!seen[v]){seen[v]=1;out.push(v)}if(out.length>=20)break}return out}
  function videoUrls(x,base){var out=[],seen={},m,re=/(https?:\/\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>]*)?)/ig;while((m=re.exec(hdec(s(x))))!==null){var u=m[1];if(!seen[u]){seen[u]=1;out.push(u)}if(out.length>=6)break}return out}
  function fixImages(x,base){
    var c=cookie().replace(/'/g,"\\'"),ref=base.replace(/'/g,"\\'");
    return s(x).replace(/<img\b([^>]*)>/gi,function(tag,attrs){
      var m=attrs.match(/\b(?:zoomfile|file|data-original|data-src|src)\s*=\s*(["'])(.*?)\1/i),u,a;
      if(!m)return tag;u=m[2];if(!u||/static\/image\/common\/none\.gif|smiley|avatar\.php|noavatar|loading/i.test(u)){var alt=attrs.match(/\b(?:zoomfile|file|data-original|data-src)\s*=\s*(["'])(.*?)\1/i);if(alt)u=alt[2]}
      if(!u||/smiley|avatar\.php|noavatar/i.test(u))return'';a=abs(u,base);if(!a)return'';
      attrs=attrs.replace(/\s+(?:src|zoomfile|file|data-original|data-src)\s*=\s*(["']).*?\1/gi,'');
      return '<img '+attrs+' src="'+a+"@headers={'Cookie':'"+c+"','Referer':'"+ref+"'}#originalSize#\">";
    })
  }
  function cleanRich(x,base,hasMagnet){
    x=s(x).replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<iframe[\s\S]*?<\/iframe>/gi,'');
    x=x.replace(/<div[^>]*class=["'][^"']*(?:sign|signature)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,'').replace(/<div class=["']xs0["'][\s\S]*?<\/div>/gi,'').replace(/<p class=["']mbn["'][\s\S]*?<\/p>/gi,'').replace(/<div class=["']tip tip_4["'][\s\S]*?<\/div>/gi,'');
    x=x.replace(/<[^>]*>[^<]*本帖最后由[\s\S]*?编辑[^<]*<\/[^>]+>/gi,'');
    x=fixImages(x,base);
    x=x.replace(/href=(["'])(\/[^"']*)\1/gi,function(_,q,u){return'href="'+abs(u,base)+'"'});
    if(hasMagnet)x=x.replace(/magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s"'<>]*)?/ig,'<b>【磁链已识别，见下方云播】</b>');
    x=x.replace(/(<br\s*\/?\s*>\s*){3,}/gi,'<br><br>');return x
  }
  function replyUrl(html,base){var m=s(html).match(/href=["']([^"']*(?:mod=post[^"']*action=reply|action=reply[^"']*mod=post)[^"']*)["']/i);return m?abs(m[1],base):base}
  function thread(){
    var d=[],url=pageParam('sht_url',''),title=pageParam('sht_name','帖子详情'),r,html,nodes=[],i,body,author,ms,j,reply,valid=0,videos=[];
    setPageTitle(title||'帖子详情');if(!url){setResult([empty('帖子参数缺失')]);return}
    r=threadHtml(url);html=r.html;saveDiag('thread.v7',(html?html.length:0)+'字 · '+(isAgeHtml(html)?'年龄页':'正文页'));
    d.push(section(title||'帖子详情','原帖 / 回复 / 磁链云播'));
    d.push(quick('原帖','x5://'+url));d.push(quick('回复','x5://'+replyUrl(html,r.url||url)));d.push({title:'复制链接',url:'copy://'+url,col_type:'icon_small_4'});d.push(quick('设置',route('shtSettings')));d.push(line());
    try{nodes=pdfa(html,'body&&#postlist>div')||[]}catch(e){nodes=[]}
    if(!nodes.length){d.push(empty('未识别到帖子正文','当前页面没有匹配 #postlist > div；可点“原帖”确认网页是否正常'));d.push({title:'诊断',desc:'HTML '+s(html.length)+' 字',url:'hiker://empty',col_type:'text_1'});setResult(d);return}
    for(i=0;i<nodes.length&&valid<20;i++){
      try{body=pdfh(nodes[i],'body&&div.t_fsz&&Html')||pdfh(nodes[i],'body&&div.t_f&&Html')||''}catch(e2){body=''}
      if(!trim(strip(body)))continue;
      try{author=trim(pdfh(nodes[i],'body&&.authi&&a&&Text')||pdfh(nodes[i],'body&&.xw1&&Text')||'')}catch(e3){author=''}
      ms=magnets(body);videos=videoUrls(body,r.url||url);valid++;
      d.push(section(valid===1?'楼主'+(author?' · '+author:''):'回复 '+(valid-1)+(author?' · '+author:''),[ms.length?ms.length+' 条磁链':'',videos.length?videos.length+' 个视频源':''].filter(Boolean).join(' · ')));
      if(videos.length)d.push({title:'▶ 播放视频',desc:'已识别直链视频源',url:'video://'+videos[0],col_type:'text_center_1',extra:{lineVisible:false}});
      else if(/视频加载中|视频简介|在线播放/i.test(strip(body)))d.push({title:'▶ 嗅探播放',desc:'调用海阔视频嗅探打开当前帖子',url:'video://'+url,col_type:'text_center_1',extra:{lineVisible:false}});
      d.push({title:cleanRich(body,r.url||url,ms.length>0),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}});
      for(j=0;j<ms.length;j++){
        var m=ms[j],hash=(m.match(/btih:([a-z0-9]{32,40})/i)||[])[1]||'';
        d.push({title:'磁链 '+(j+1),desc:hash?hash.slice(0,14)+'…':'已识别',url:'copy://'+m,col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'115',url:'hiker://page/115Offline?rule=115.简&page=fypage&add='+encodeURIComponent(m),col_type:'icon_small_4'});
        d.push({title:'迅雷',url:'hiker://page/diaoyong?rule=迅雷&page=fypage#'+m,col_type:'icon_small_4'});
        d.push({title:'PikPak',url:'pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url='+m,col_type:'icon_small_4'});
        d.push({title:'复制',url:'copy://'+m,col_type:'icon_small_4'});
      }
      d.push(line())
    }
    setResult(d)
  }
  function module(){var m=BASE.module();m.version=VERSION;m.build=BUILD;m.home=home;m.forum=forum;m.thread=thread;m.verifyAge=verifyAge;m._debug=m._debug||{};m._debug.resolveGroupsV7=resolveGroups;m._debug.discoverGuideV7=discoverGuide;return m}
  var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();
