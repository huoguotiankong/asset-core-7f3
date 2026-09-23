/* 色花堂 0.1.0-test.20 / Build 10120 - mobile account/signin + repaired guide */
var SeHuaTangPatchTest20=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7',KEY_AGE_OK='sht_age_ok_v5',KEY_AGE_TIME='sht_age_time_v5';
function s(v){return v==null?'':String(v)}
function cleanTitle(t){return C.trim(C.strip(t).replace(/^[-–—·•\s]+|[-–—·•\s]+$/g,''))}
function badTitle(t){return !t||t.length<4||t.length>180||/^(查看帖子|回复|查看|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)||/^\d+$/.test(t)||/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)}
function parseGuide(html,base){
  var x=s(html),re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,mp={},order=[],u,id,t,k,i,st,en,seg,imgs;
  while((m=re.exec(x))!==null){u=C.abs(m[2]||m[3]||'',base);id=C.threadId(u);if(!id)continue;t=cleanTitle(m[5]||'');if(badTitle(t))continue;k=String(id);if(!mp[k]){mp[k]={id:k,title:t,url:u,index:m.index,imgs:[]};order.push(k)}else if(t.length>mp[k].title.length)mp[k].title=t}
  for(i=0;i<order.length;i++){var it=mp[order[i]];st=it.index;en=i+1<order.length?mp[order[i+1]].index:Math.min(x.length,st+70000);if(en<=st||en-st>90000)en=Math.min(x.length,st+70000);seg=x.slice(st,en);imgs=C.allImages(seg,base,2);it.imgs=imgs||[]}
  return order.map(function(q){return mp[q]})
}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function guidePageKey(mode){return'sht_guide_page_v20_'+mode}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function guide(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=guidePageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),html='',items=[],i,it,pic='';
  setPageTitle(name);
  html=C.renderList(url);items=parseGuide(html,url);
  if(!items.length){html=C.fetchPage(url,false);items=parseGuide(html,url)}
  if(!items.length){var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseGuide(html,pc)}
  C.saveDiag('guide.mobile.v20',mode+' p='+p+' items='+items.length+' url='+url);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'手机端优先 · 第 '+p+' 页 · '+items.length+' 条主题'));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','已重新走手机端年龄确认/Cookie 会话；可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){it=items[i];pic=(it.imgs&&it.imgs.length)?C.imageUrl(it.imgs[0],url):'';d.push({title:it.title,desc:'查看帖子',img:pic,pic_url:pic,url:C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title}),col_type:pic?'movie_1':'text_1',extra:{lineVisible:false}})}
  setResult(d)
}
function verifyAge(){
  var d=[],o=C.origin(),mode=C.pageParam('sht_mode','login'),target=mode==='signin'?o+'/plugin.php?id=dd_sign:index&mobile=2':(mode==='forum'?o+'/forum.php?mobile=2':o+'/member.php?mod=logging&action=login&mobile=2');
  setPageTitle(mode==='signin'?'签到':'账号');
  d.push({title:mode==='signin'?'签到':'账号',url:target,desc:'list&&screen-90',col_type:'x5_webview_single',extra:{ua:C.UA_M,showProgress:false,canBack:true,jsLoadingInject:true,js:$.toString(function(host,target,ckKey,accessKey,ageKey,timeKey){
    if(window.__shtV20Timer)clearTimeout(window.__shtV20Timer);
    function txt(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
    function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
    function save(){var c='';try{c=fba.getCookie(location.origin)||''}catch(e){}if(!c)try{c=fba.getCookie(host)||''}catch(e2){}if(c)try{fba.putVar(ckKey,c)}catch(e3){}try{fba.putVar(accessKey,'1');fba.putVar(ageKey,'1');fba.putVar(timeKey,String(Date.now()))}catch(e4){}}
    function clickAge(){var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');for(var i=0;i<ns.length;i++){var t=txt(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){try{ns[i].click();return true}catch(e){}}}return false}
    function tick(){var t=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');if(t.length<10){window.__shtV20Timer=setTimeout(tick,350);return}if(age(t)){clickAge();window.__shtV20Timer=setTimeout(tick,650);return}save();if(target&&location.href.indexOf('mobile=2')<0&&location.href.indexOf('member.php')<0&&location.href.indexOf('plugin.php')<0){location.href=target;return}window.__shtV20Timer=setTimeout(tick,1200)}tick();
  },o,target,KEY_COOKIE,KEY_ACCESS,KEY_AGE_OK,KEY_AGE_TIME)}});
  d.push({title:'手机端网页',desc:'账号、签到默认直接进入 mobile=2 页面；检测到 18+ 首访页时仍只处理声明式年龄确认，不绕过验证码或真人验证。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
  setResult(d)
}
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.20';m.build=10120;m.forum=function(){if(C.pageParam('sht_auto',''))return guide(m);return oldForum()};m.verifyAge=verifyAge;m.settings=(function(old){return function(){var d=[];setPageTitle('色花堂设置');d.push(C.section('Test20 手机端账号/签到与话题修复','账号、签到直接打开 mobile=2；最新发表/热门/精华改为独立手机端 guide 请求链并重新同步年龄确认 Cookie。'));d.push({title:'打开旧设置',desc:'访问状态 / Cookie / 最近诊断',url:C.route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}})(m.settings);return m}
var P={version:'0.1.0-test.20',build:10120,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
