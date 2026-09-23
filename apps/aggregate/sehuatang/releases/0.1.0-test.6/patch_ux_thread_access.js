/* 色花堂 0.1.0-test.6 / Build 10106 - auto age gate + grouped forums + thread detail */
var SeHuaTangPatchTest6=(function(){
  var BASE=SeHuaTangRemoteRuntime;
  var VERSION='0.1.0-test.6',BUILD=10106,RULE_NAME='色花堂';
  var DEFAULT_ORIGIN='https://sehuatang.org';
  var KEY_ORIGIN='sht_origin_v1',KEY_COOKIE='sht_web_cookie_v5',KEY_AGE_OK='sht_age_ok_v5',KEY_AGE_TIME='sht_age_time_v5';
  var KEY_CAT='sht_cat_group_v6',KEY_GROUP_CACHE='sht_forum_groups_v6',KEY_DIAG='sht_diag_v1';
  var UA_M='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var UA_PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';
  var GROUPS=[
    {name:'原创BT电影',seed:'forum-2-1.html'},
    {name:'在线视频区',seed:'forum-41-1.html'},
    {name:'原档收藏',seed:'forum-145-1.html'},
    {name:'色花图片',seed:'forum-155-1.html'},
    {name:'色花文学',seed:'forum-154-1.html'},
    {name:'综合讨论区',seed:'forum-95-1.html'}
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
  function line(){return{col_type:'line'}}
  function section(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}}
  function empty(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}}}
  function quick(t,u){return{title:t,url:u,col_type:'icon_small_4',extra:{lineVisible:false}}}
  function saveDiag(stage,msg){try{setItem(KEY_DIAG,JSON.stringify({stage:stage,origin:origin(),error:s(msg||'').slice(0,600),time:new Date().getTime()}))}catch(e){}}
  function cookie(){var c='';try{c=getVar(KEY_COOKIE,'')||''}catch(e){}if(c)return c;try{c=getCookie(origin())||''}catch(e2){}if(!c)try{c=getCookie(wwwOrigin())||''}catch(e3){}return c}
  function headers(pc){var c=cookie(),h={'User-Agent':pc?UA_PC:UA_M,'Referer':origin()+'/'};if(c){h.Cookie=c;h.cookie=c}return h}
  function isAgeText(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(s(t))}
  function isAgeHtml(h){return isAgeText(strip(h))}
  function looksReal(h){var x=s(h),t=strip(x);return !isAgeText(t)&&(/#threadlisttableid|class=["'][^"']*bm_c|id=["']waterfall|href=["'][^"']*forum-\d+/i.test(x)||/色花堂|98堂|原创BT|在线视频|综合讨论区/.test(t))}
  function saveWebCookie(){var c='';try{c=getCookie(origin())||''}catch(e){}if(!c)try{c=getCookie(wwwOrigin())||''}catch(e2){}if(c)try{putVar(KEY_COOKIE,c)}catch(e3){}try{putVar(KEY_AGE_OK,'1');putVar(KEY_AGE_TIME,String(new Date().getTime()))}catch(e4){}return c}
  function ensureAccess(force){
    var ok='';try{ok=getVar(KEY_AGE_OK,'')||''}catch(e){}
    if(!force&&ok==='1')return true;
    var o=origin(),html='';
    try{
      html=s(fetchCodeByWebView(o+'/',{headers:{'User-Agent':UA_M},timeout:18000,blockRules:['.mp4','.m3u8','.woff','.woff2','.ttf'],checkJs:$.toString(function(){
        function tx(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
        function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
        var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
        if(age(body)){
          var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');
          for(var i=0;i<ns.length;i++){var t=tx(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){try{ns[i].click();return null}catch(e){}}}
          return null;
        }
        if(document.querySelector('#threadlisttableid,.bm_c,#waterfall,.items,a[href*="forum-"],a[href*="forumdisplay"]')||/色花堂|98堂|原创BT|在线视频|综合讨论区/.test(body))return'ready';
        return null;
      })}));
      if(looksReal(html)){saveWebCookie();saveDiag('access.auto','自动年龄确认成功');return true}
    }catch(e2){saveDiag('access.auto.error',e2&&e2.message||e2)}
    return false;
  }
  function verifyAge(){
    var d=[],o=origin(),mode=pageParam('sht_mode','login');
    var target=mode==='signin'?o+'/plugin.php?id=dd_sign:index&mobile=2':(mode==='forum'?o+'/forum.php?mobile=2':o+'/member.php?mod=logging&action=login&mobile=2');
    setPageTitle('自动年龄确认');
    d.push({title:'自动年龄确认',url:o+'/',desc:'list&&screen-90',col_type:'x5_webview_single',extra:{ua:UA_M,showProgress:false,canBack:true,jsLoadingInject:true,js:$.toString(function(host,target,ckKey,okKey,timeKey){
      if(window.__shtV6Timer)clearTimeout(window.__shtV6Timer);
      function txt(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
      function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
      function real(t){return !age(t)&&(document.querySelector('#threadlisttableid,.bm_c,#waterfall,.items,a[href*="forum-"],a[href*="forumdisplay"]')||/色花堂|98堂|原创BT|在线视频|综合讨论区/.test(t))}
      function save(){var c='';try{c=fba.getCookie(location.origin)||''}catch(e){}if(!c)try{c=fba.getCookie(host)||''}catch(e2){}if(c)try{fba.putVar(ckKey,c)}catch(e3){}try{fba.putVar(okKey,'1');fba.putVar(timeKey,String(Date.now()))}catch(e4){}return c}
      function clickAge(){var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');for(var i=0;i<ns.length;i++){var t=txt(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){try{ns[i].click();return true}catch(e){}}}return false}
      function tick(){var t=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');if(t.length<20){window.__shtV6Timer=setTimeout(tick,350);return}if(age(t)){clickAge();window.__shtV6Timer=setTimeout(tick,550);return}if(real(t)){save();var rel=String(target||'').replace(/^https?:\/\/[^/]+/i,'');if(target&&rel&&location.href.indexOf(rel)<0){location.href=target;return}}window.__shtV6Timer=setTimeout(tick,800)}
      tick();
    },o,target,KEY_COOKIE,KEY_AGE_OK,KEY_AGE_TIME)}});
    d.push({title:'说明',desc:'检测到站点 18+ 首访页后会自动点击“满18岁 / over 18”，随后保存 Cookie 并继续进入登录/签到目标页。若站点以后加入验证码或真人验证，不会尝试绕过。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
    setResult(d)
  }
  function fetchForumPc(){var o=origin(),u=o+'/forum.php',h='';try{h=s(fetchPC(u,{headers:headers(true),timeout:12000}))}catch(e){}if(isAgeHtml(h)||!looksReal(h)){ensureAccess(true);try{h=s(fetchPC(u,{headers:headers(true),timeout:12000}))}catch(e2){}}if(!looksReal(h))try{h=s(fetchCodeByWebView(u,{headers:headers(false),timeout:16000,checkJs:$.toString(function(){var t=String((document.body&&document.body.innerText)||'');return document.querySelector('.bm_c,a[href*="forum-"]')||t.length>1200?'ready':null;})}))}catch(e3){}return h}
  function groupCache(){try{var x=JSON.parse(getItem(KEY_GROUP_CACHE,'{}')||'{}');if(x.groups&&new Date().getTime()-Number(x.time||0)<21600000)return x.groups}catch(e){}return null}
  function resolveGroups(){
    var c=groupCache();if(c)return c;
    var html=fetchForumPc(),groups=[[],[],[],[],[],[]],i,j,blocks=[],dts=[],t,u;
    try{blocks=pdfa(html,'body&&.bm_c')||[]}catch(e){}
    for(i=0;i<Math.min(6,blocks.length);i++){
      try{dts=pdfa(blocks[i],'body&&dt')||[]}catch(e2){dts=[]}
      for(j=0;j<dts.length;j++){
        try{t=trim(pdfh(dts[j],'a&&Text'));u=pdfh(dts[j],'a&&href')}catch(e3){t='';u=''}
        if(!t||!u)continue;u=abs(u,origin()+'/forum.php');groups[i].push({title:t,url:u})
      }
    }
    for(i=0;i<6;i++)if(!groups[i].length)groups[i].push({title:GROUPS[i].name,url:origin()+'/'+GROUPS[i].seed});
    try{setItem(KEY_GROUP_CACHE,JSON.stringify({time:new Date().getTime(),groups:groups}))}catch(e4){}
    return groups
  }
  function topicInput(){return{title:'搜索主题',desc:'搜索',col_type:'input',url:"(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('sht_search_kw_v1',w);return 'hiker://page/shtSearch?rule=色花堂&simple=true&kw='+encodeURIComponent(w);})()",extra:{defaultValue:'',titleVisible:true}}}
  function home(){
    var d=[],idx=Number(getMyVar(KEY_CAT,'0')||0),groups,i,g;
    if(idx<0||idx>5)idx=0;
    setPageTitle('色花堂');
    var access=ensureAccess(false);
    d.push(topicInput());
    d.push(quick('账号',route('shtVerify',{sht_mode:'login'})));
    d.push(quick('签到',route('shtVerify',{sht_mode:'signin'})));
    d.push(quick('搜索',route('shtSearch')));
    d.push(quick('设置',route('shtSettings')));
    d.push(line());
    d.push(section('话题',access?'年龄确认已自动处理':'自动年龄确认尚未成功，可点“账号”重试'));
    [['最新发表','latest'],['最新热门','hot'],['最新精华','digest']].forEach(function(x){d.push({title:x[0],desc:'原生主题列表',url:route('shtForum',{sht_auto:x[1],sht_name:x[0]}),col_type:'text_1',extra:{lineVisible:false}})});
    d.push(line());
    d.push(section('论坛分类','先选大类，再只显示该类下的板块'));
    for(i=0;i<GROUPS.length;i++)d.push({title:(i===idx?'✓ ':'')+GROUPS[i].name,url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},KEY_CAT,i),col_type:'scroll_button',extra:{lineVisible:false}});
    groups=resolveGroups();g=groups[idx]||[];
    d.push(section(GROUPS[idx].name,g.length+' 个板块'));
    for(i=0;i<g.length;i++)d.push({title:g[i].title,desc:'进入板块',url:route('shtForum',{sht_url:g[i].url,sht_name:g[i].title}),col_type:'text_2',extra:{lineVisible:false}});
    setResult(d)
  }
  function pcThreadUrl(u){u=s(u);if(/[?&]mobile=2/i.test(u))u=u.replace(/([?&])mobile=2(&|$)/i,function(_,p,q){return q?p+'mobile=no'+q:''});else if(u.indexOf('?')>=0)u+='&mobile=no';else if(/\.html(?:#|$)/i.test(u))u+='?mobile=no';return u}
  function threadHtml(u){var p=pcThreadUrl(u),h='';try{h=s(fetchPC(p,{headers:headers(true),timeout:14000}))}catch(e){}if(isAgeHtml(h)){ensureAccess(true);try{h=s(fetchPC(p,{headers:headers(true),timeout:14000}))}catch(e2){}}if(!/#postlist|class=["'][^"']*t_fsz|class=["'][^"']*\bt_f\b/i.test(h))try{h=s(fetchCodeByWebView(p,{headers:headers(false),timeout:18000,checkJs:$.toString(function(){var t=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){var ns=document.querySelectorAll('a,button,input,[onclick],[role="button"]');for(var i=0;i<ns.length;i++){var x=String(ns[i].innerText||ns[i].textContent||ns[i].value||'');if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(x)){try{ns[i].click()}catch(e){}}}return null}return document.querySelector('#postlist .t_fsz,#postlist .t_f')?'ready':null;})}))}catch(e3){}return{html:h,url:p}}
  function cleanRich(x,base){
    var c=cookie().replace(/'/g,"\\'");x=s(x);
    x=x.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<iframe[\s\S]*?<\/iframe>/gi,'');
    x=x.replace(/<div[^>]*class=["'][^"']*(?:sign|signature)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,'');
    x=x.replace(/<div class=["']xs0["'][\s\S]*?<\/div>/gi,'').replace(/<p class=["']mbn["'][\s\S]*?<\/p>/gi,'').replace(/<div class=["']tip tip_4["'][\s\S]*?<\/div>/gi,'');
    x=x.replace(/<[^>]*>[^<]*本帖最后由[\s\S]*?编辑[^<]*<\/[^>]+>/gi,'');
    x=x.replace(/src=["']static\/image\/common\/none\.gif["']/gi,'');
    x=x.replace(/\sfile=(["'])(.*?)\1/gi,function(_,q,u){var a=abs(u,base);return a?' src="'+a+"@headers={'Cookie':'"+c+"'}#originalSize#\"":''});
    x=x.replace(/src=(["'])(?!https?:|data:|\/\/)(.*?)\1/gi,function(_,q,u){var a=abs(u,base);return 'src="'+a+'#originalSize#"'});
    x=x.replace(/href=(["'])(\/[^"']*)\1/gi,function(_,q,u){return'href="'+abs(u,base)+'"'});
    x=x.replace(/(<br\s*\/?\s*>\s*){3,}/gi,'<br><br>');
    return x
  }
  function magnets(x){var t=hdec(s(x)),out=[],seen={},m,re=/magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s"'<>]*)?/ig;while((m=re.exec(t))!==null){var v=m[0].replace(/[)\]}>，。；;]+$/g,'');if(!seen[v]){seen[v]=1;out.push(v)}if(out.length>=20)break}return out}
  function replyUrl(html,base){var m=s(html).match(/href=["']([^"']*(?:mod=post[^"']*action=reply|action=reply[^"']*mod=post)[^"']*)["']/i);return m?abs(m[1],base):base}
  function thread(){
    var d=[],url=pageParam('sht_url',''),title=pageParam('sht_name','帖子详情'),r,html,nodes=[],i,body,author,ms,j,reply;
    setPageTitle(title||'帖子详情');if(!url){setResult([empty('帖子参数缺失')]);return}
    r=threadHtml(url);html=r.html;saveDiag('thread.test6',(html?html.length:0)+'字 · '+(isAgeHtml(html)?'仍为年龄页':'正文页'));
    d.push(section(title||'帖子详情','原帖 / 回复 / 磁链云播'));
    d.push(quick('原帖','x5://'+url));d.push(quick('回复','x5://'+replyUrl(html,r.url||url)));d.push({title:'复制链接',url:'copy://'+url,col_type:'icon_small_4'});d.push(quick('设置',route('shtSettings')));d.push(line());
    try{nodes=pdfa(html,'body&&#postlist>div')||[]}catch(e){nodes=[]}
    if(!nodes.length){d.push(empty('未识别到帖子正文','当前页面没有匹配 #postlist > div；可点“原帖”确认网页是否正常'));d.push({title:'诊断',desc:'HTML '+s(html.length)+' 字',url:'hiker://empty',col_type:'text_1'});setResult(d);return}
    for(i=0;i<nodes.length&&i<20;i++){
      try{body=pdfh(nodes[i],'body&&div.t_fsz&&Html')||pdfh(nodes[i],'body&&div.t_f&&Html')||''}catch(e2){body=''}
      if(!trim(strip(body)))continue;
      try{author=trim(pdfh(nodes[i],'body&&.authi&&a&&Text')||pdfh(nodes[i],'body&&.xw1&&Text')||'')}catch(e3){author=''}
      ms=magnets(body);
      d.push(section(i===0?'楼主'+(author?' · '+author:''):'回复 '+(i+1)+(author?' · '+author:''),ms.length?ms.length+' 条磁链':''));
      d.push({title:cleanRich(body,r.url||url),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}});
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
  function settings(){
    var d=[],ok='',ck='';try{ok=getVar(KEY_AGE_OK,'')||''}catch(e){}try{ck=cookie()}catch(e2){}
    setPageTitle('色花堂设置');
    d.push(section('访问验证',ok==='1'?'自动年龄确认已记录':'尚未完成自动年龄确认'));
    d.push({title:'自动年龄确认并进入登录',desc:'自动点击 18+ 首访按钮，保存 Cookie 后继续登录',url:route('shtVerify',{sht_mode:'login'}),col_type:'text_1'});
    d.push({title:'自动年龄确认并进入签到',desc:'登录后使用',url:route('shtVerify',{sht_mode:'signin'}),col_type:'text_1'});
    d.push({title:'Cookie 状态',desc:ck?'已检测到 Cookie':'暂未检测到 Cookie',url:'hiker://empty',col_type:'text_1'});
    d.push({title:'重新自动验证',desc:'站点重新弹年龄页或 Cookie 过期时使用',url:$('#noLoading#').lazyRule(function(okKey,ckKey,cacheKey){try{clearVar(okKey);clearVar(ckKey)}catch(e){}setItem(cacheKey,'{}');refreshPage(false);return'toast://状态已清空，返回首页会重新自动验证';},KEY_AGE_OK,KEY_COOKIE,KEY_GROUP_CACHE),col_type:'text_1'});
    d.push(line());d.push(section('分类','首页已改为 6 个大类横向切换，只展示当前大类下的子板块'));
    d.push({title:'清空分类缓存',desc:'论坛板块结构更新时使用',url:$('#noLoading#').lazyRule(function(k){setItem(k,'{}');refreshPage(false);return'toast://分类缓存已清空';},KEY_GROUP_CACHE),col_type:'text_1'});
    d.push(line());d.push(section('Test5/Test4 兼容','线路与旧诊断仍保留'));
    d.push({title:'打开旧设置',desc:'线路 / 旧缓存 / 最近诊断',url:route('shtSettingsLegacy'),col_type:'text_1'});
    setResult(d)
  }
  function module(){var m=BASE.module();m.version=VERSION;m.build=BUILD;m.home=home;m.thread=thread;m.verifyAge=verifyAge;m.settings=settings;return m}
  var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();
