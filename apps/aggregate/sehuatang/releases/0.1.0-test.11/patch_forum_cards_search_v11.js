/* 色花堂 0.1.0-test.11 / Build 10111 - website-like topic cards + explicit pagination + native search rebuild */
var SeHuaTangPatchTest11=(function(){
  var BASE=SeHuaTangRemoteRuntime;
  var VERSION='0.1.0-test.11',BUILD=10111,RULE_NAME='色花堂';
  var DEFAULT_ORIGIN='https://sehuatang.org';
  var KEY_ORIGIN='sht_origin_v1',KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7',KEY_DIAG='sht_diag_v1';
  var KEY_SEARCH_STATE='sht_search_state_v11';
  var UA_M='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var UA_PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';
  var RAW='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/aggregate/sehuatang/assets/icons/v1/';
  function s(v){return v==null?'':String(v)}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
  function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
  function hdec(v){var x=s(v),i;for(i=0;i<2;i++)x=x.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ');return x}
  function strip(v){return trim(hdec(v).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,' ').replace(/[\t\r\n]+/g,' ').replace(/\s+/g,' '))}
  function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
  function abs(h,b){h=hdec(trim(h));if(!h)return'';if(/^https?:\/\//i.test(h))return h;if(/^\/\//.test(h))return'https:'+h;if(/^(javascript:|mailto:|tel:|#)/i.test(h))return'';var m=s(b).match(/^(https?:\/\/[^\/]+)/i),o=m?m[1]:origin();if(h.charAt(0)==='/')return o+h;var c=s(b).split('#')[0].split('?')[0];if(c.charAt(c.length-1)!=='/')c=c.replace(/\/[^\/]*$/,'/');return c+h.replace(/^\.\//,'')}
  function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
  function route(path,p){var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k;for(k in(p||{}))if(p.hasOwnProperty(k)&&p[k]!=null)u+='&'+k+'='+encodeURIComponent(s(p[k]));return u}
  function line(){return{col_type:'line'}}
  function section(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}}
  function empty(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}}}
  function quick(t,u,ico){var p=RAW+ico;return{title:t,img:p,pic_url:p,url:u,col_type:'icon_small_4',extra:{lineVisible:false}}}
  function saveDiag(stage,msg){try{setItem(KEY_DIAG,JSON.stringify({stage:stage,origin:origin(),error:s(msg||'').slice(0,2200),time:new Date().getTime()}))}catch(e){}}
  function cookie(){var c='';try{c=getVar(KEY_COOKIE,'')||''}catch(e){}if(c)return c;try{c=getCookie(origin())||''}catch(e2){}return c}
  function headers(pc,ref){var c=cookie(),h={'User-Agent':pc?UA_PC:UA_M,'Referer':ref||origin()+'/'};if(c){h.Cookie=c;h.cookie=c}return h}
  function imageUrl(u,ref){u=abs(u,ref);if(!u)return'';return u+'@headers='+JSON.stringify(headers(false,ref||origin()+'/'))+'#originalSize#'}
  function threadId(u){var x=hdec(s(u)),m=x.match(/[?&]tid=(\d+)/i)||x.match(/[?&]ptid=(\d+)/i)||x.match(/\/thread-(\d+)-\d+-\d+\.html/i);return m?m[1]:''}
  function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,a,t,tm;while((m=re.exec(s(html)))!==null){a=(m[1]||'')+' '+(m[4]||'');t=strip(m[5]||'');if(!t){tm=a.match(/\b(?:title|aria-label)\s*=\s*["']([^"']+)["']/i);if(tm)t=strip(tm[1])}out.push({href:abs(m[2]||m[3]||'',base),text:t,inner:m[5]||'',attrs:a,index:m.index});if(out.length>18000)break}return out}
  function badThreadText(t){t=trim(t);if(!t||t.length<2)return true;if(/本帖最后由.+编辑|^(作者|回复于|发表于|查看|查看帖子|回复|最后发表|最后回复|上一页|下一页|返回|详情|进入|播放)/i.test(t))return true;if(/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)||/^\d+$/.test(t))return true;return false}
  function threadScore(t){t=trim(t);if(badThreadText(t))return-999;var n=Math.min(t.length,150);if(/[\u4e00-\u9fffA-Za-z]{2,}/.test(t))n+=35;if(t.length>=8)n+=20;if(/影片名称|原创|中文字幕|无码|有码|写真|视频|FC2|IPX|SSIS|JUL|MIDE/i.test(t))n+=14;if(t.length>140)n-=12;return n}
  function validImage(u,base,attrs){u=abs(u,base);if(!u||/^data:/i.test(u))return'';if(/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\//i.test(u))return'';var a=s(attrs),wm=a.match(/\bwidth\s*=\s*["']?(\d+)/i),hm=a.match(/\bheight\s*=\s*["']?(\d+)/i);if(wm&&hm&&Number(wm[1])<=110&&Number(hm[1])<=110)return'';return u}
  function canonicalImg(u){return s(u).replace(/@headers=.*$/,'').replace(/#originalSize#.*$/,'').replace(/[?#].*$/,'')}
  function imageCandidates(x,base){var out=[],seen={},re=/<img\b([^>]*)>/gi,m,a,names=['data-original','data-src','data-echo','data-lazy-src','zoomfile','file','src'],i,n,rr,mm,u,style;while((m=re.exec(s(x)))!==null){a=m[1]||'';u='';for(i=0;i<names.length;i++){n=names[i];rr=new RegExp('\\b'+n+'\\s*=\\s*(["\\\'])(.*?)\\1','i');mm=a.match(rr);if(mm){u=validImage(mm[2],base,a);if(u)break}}if(!u){style=a.match(/background(?:-image)?\s*:\s*url\((?:["']?)([^)"']+)/i);if(style)u=validImage(style[1],base,a)}if(u&&!seen[canonicalImg(u)]){seen[canonicalImg(u)]=1;out.push(u)}if(out.length>=18)break}return out}
  function contextAround(html,index){var x=s(html),start=x.lastIndexOf('<tbody',index),end=start>=0?x.indexOf('</tbody>',index):-1;if(start>=0&&end>=0&&end-start<65000)return x.slice(start,end+8);start=x.lastIndexOf('<li',index);end=start>=0?x.indexOf('</li>',index):-1;if(start>=0&&end>=0&&end-start<40000)return x.slice(start,end+5);start=x.lastIndexOf('<div',index);end=start>=0?x.indexOf('</div>',index):-1;if(start>=0&&end>=0&&end-start<26000)return x.slice(start,end+6);return x.slice(Math.max(0,index-2600),Math.min(x.length,index+6000))}
  function rowSummary(ctx,title){var t=strip(ctx),q=trim(title);if(q)t=t.replace(q,' ');t=t.replace(/查看帖子|查看全部|最后发表|最后回复|主题|回复|浏览/g,' ').replace(/\s+/g,' ').trim();if(t.length>260)t=t.slice(0,260)+'…';return t}
  function parseCards(html,base){var a=anchors(html,base),map={},order=[],i,x,id,t,sc,ctx,imgs,out=[],freq={},k,c;for(i=0;i<a.length;i++){x=a[i];id=threadId(x.href);if(!id)continue;t=trim(x.text);sc=threadScore(t);if(!map[id]){map[id]={id:id,title:sc>-900?t:'',url:x.href,score:sc,index:x.index};order.push(id)}else if(sc>map[id].score){map[id].title=t;map[id].score=sc;map[id].url=x.href;map[id].index=x.index}}
    for(i=0;i<order.length;i++){id=order[i];x=map[id];if(!x||badThreadText(x.title))continue;ctx=contextAround(html,x.index);imgs=imageCandidates(ctx,base);x.imgs=imgs;x.summary=rowSummary(ctx,x.title);for(k=0;k<imgs.length;k++){c=canonicalImg(imgs[k]);freq[c]=(freq[c]||0)+1}out.push(x);if(out.length>=100)break}
    for(i=0;i<out.length;i++){imgs=[];for(k=0;k<(out[i].imgs||[]).length;k++){c=canonicalImg(out[i].imgs[k]);if((freq[c]||0)>=3)continue;imgs.push(out[i].imgs[k]);if(imgs.length>=6)break}out[i].imgs=imgs}
    return out}
  function fetchPc(u){try{return s(fetchPC(u,{headers:headers(true,u),timeout:15000}))}catch(e){return''}}
  function ageClickJs(targetType){return $.toString(function(targetType,ckKey,accessKey){
    function txt(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
    function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
    var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
    if(age(body)){
      var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');
      for(var i=0;i<ns.length;i++){var t=txt(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){try{var h=ns[i].href||ns[i].getAttribute&&ns[i].getAttribute('href');if(h){location.href=h;return null}ns[i].click();return null}catch(e){}}}
      return null;
    }
    try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ckKey,c);fba.putVar(accessKey,'1')}catch(e2){}
    if(targetType==='list'&&document.querySelector('a[href*="tid="],a[href*="thread-"]'))return'ready';
    if(targetType==='forum'&&document.querySelector('a[href*="forum-"],a[href*="fid="]'))return'ready';
    return null;
  },targetType,KEY_COOKIE,KEY_ACCESS)}
  function renderList(u){try{return s(fetchCodeByWebView(u,{headers:headers(false,u),timeout:21000,blockRules:['.woff','.woff2','.ttf'],checkJs:ageClickJs('list')}))}catch(e){return''}}
  function withPage(u,p){p=Math.max(1,Number(p||1));u=s(u);if(/\/forum-\d+-\d+\.html(?:\?|$)/i.test(u))return u.replace(/\/forum-(\d+)-\d+\.html/i,'/forum-$1-'+p+'.html');if(/([?&])page=\d+/i.test(u))return u.replace(/([?&])page=\d+/i,'$1page='+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p}
  function mobileVariant(u,mob){u=s(u);if(/[?&]mobile=(?:2|no)(?:&|$)/i.test(u))return u.replace(/([?&])mobile=(?:2|no)(?=&|$)/i,'$1mobile='+mob);return u+(u.indexOf('?')>=0?'&':'?')+'mobile='+mob}
  function addUnique(a,u){var i;if(!u)return;for(i=0;i<a.length;i++)if(a[i]===u)return;a.push(u)}
  function loadBoard(seed,pg){var bases=[seed],urls=[],i,u,h,items,diag=[];for(i=0;i<bases.length;i++){addUnique(urls,withPage(mobileVariant(bases[i],'no'),pg));addUnique(urls,withPage(mobileVariant(bases[i],'2'),pg));addUnique(urls,withPage(bases[i],pg))}for(i=0;i<urls.length;i++){u=urls[i];h=fetchPc(u);items=parseCards(h,u);diag.push('fetch'+(i+1)+':'+h.length+'/'+items.length);if(items.length)return{items:items,url:u,html:h,source:'fetch',diag:diag.join('；')};h=renderList(u);items=parseCards(h,u);diag.push('web'+(i+1)+':'+h.length+'/'+items.length);if(items.length)return{items:items,url:u,html:h,source:'webview',diag:diag.join('；')}}return{items:[],url:urls[0]||seed,html:'',source:'none',diag:diag.join('；')}}
  function guideView(kind){return kind==='latest'?'newthread':kind==='hot'?'hot':kind==='digest'?'digest':''}
  function guideWords(kind){return kind==='latest'?['最新发表','最新主题','最新帖子']:kind==='hot'?['最新热门','热门主题','热门帖子']:['最新精华','精华主题','精华帖子']}
  function guideHtml(kind,pg){var target=origin()+'/forum.php?mod=guide&view='+guideView(kind)+'&page='+pg+'&mobile=no',start=origin()+'/forum.php?mobile=no',words=guideWords(kind),html='';try{html=s(fetchCodeByWebView(start,{headers:headers(false,start),timeout:24000,blockRules:['.woff','.woff2','.ttf'],checkJs:$.toString(function(target,view,words,ckKey,accessKey){
      function txt(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
      function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
      var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
      if(age(body)){var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');for(var i=0;i<ns.length;i++){var tt=txt(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(tt)){try{var hh=ns[i].href||ns[i].getAttribute&&ns[i].getAttribute('href');if(hh){location.href=hh;return null}ns[i].click();return null}catch(e){}}}return null}
      try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ckKey,c);fba.putVar(accessKey,'1')}catch(e2){}
      var onTarget=location.href.indexOf('mod=guide')>=0&&location.href.indexOf('view='+view)>=0;
      if(!onTarget){var as=document.querySelectorAll('a[href]'),pick=null;for(var j=0;j<as.length;j++){var h=String(as[j].href||''),t=txt(as[j]);if(h.indexOf('mod=guide')>=0&&h.indexOf('view='+view)>=0){pick=as[j];break}for(var k=0;k<words.length;k++)if(t.indexOf(words[k])>=0){pick=as[j];break}if(pick)break}location.href=pick&&pick.href?pick.href:target;return null}
      if(document.querySelector('a[href*="tid="],a[href*="thread-"]'))return'ready';
      return null;
    },target,guideView(kind),words,KEY_COOKIE,KEY_ACCESS)}))}catch(e){}return{html:html,url:target}}
  function loadGuide(kind,pg){var r=guideHtml(kind,pg),items=parseCards(r.html,r.url);return{items:items,url:r.url,html:r.html,source:'guide-webview',diag:'guide html='+r.html.length+' topics='+items.length}}
  function pageControls(path,params,pg,hasNext){var d=[],p1={},p2={},p3={},k;for(k in params){p1[k]=params[k];p2[k]=params[k];p3[k]=params[k]}p1.sht_p=Math.max(1,pg-1);p3.sht_p=pg+1;d.push({title:pg>1?'上一页':'第一页',url:pg>1?route(path,p1):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}});d.push({title:'第 '+pg+' 页',url:'hiker://empty',col_type:'text_3',extra:{lineVisible:false}});d.push({title:hasNext?'下一页':'已到底',url:hasNext?route(path,p3):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}});return d}
  function renderTopicCards(d,items,ref){var i,j,it,p,u;for(i=0;i<items.length;i++){it=items[i];u=route('shtThread',{sht_url:it.url,sht_name:it.title});d.push({title:it.title,desc:it.summary||'查看帖子',url:u,col_type:'text_1',extra:{lineVisible:false}});for(j=0;j<(it.imgs||[]).length;j++){p=imageUrl(it.imgs[j],ref);d.push({title:'',desc:'',img:p,pic_url:p,url:u,col_type:'pic_3',extra:{lineVisible:false}})}d.push(line())}}
  function forum(){var d=[],seed=pageParam('sht_url',''),kind=pageParam('sht_auto',''),name=pageParam('sht_name','主题列表'),pg=Math.max(1,Number(pageParam('sht_p',typeof MY_PAGE==='undefined'?1:MY_PAGE||1))),r,ctrl,params={};setPageTitle(name);r=kind?loadGuide(kind,pg):loadBoard(seed,pg);saveDiag('forum.v11',(kind||'board')+' · '+r.url+' · '+r.diag);if(pg===1){d.push(quick('网页版','x5://'+(r.url||seed),'web.svg'));d.push(quick('搜索',route('shtSearch'),'search.svg'));d.push(line());d.push(section(name,r.items.length?'当前页 '+r.items.length+' 条主题 · 原网站式多图预览':'未取得主题'))}params.sht_name=name;if(kind)params.sht_auto=kind;else params.sht_url=seed;ctrl=pageControls('shtForum',params,pg,r.items.length>0);Array.prototype.push.apply(d,ctrl);d.push(line());renderTopicCards(d,r.items,r.url);if(r.items.length){ctrl=pageControls('shtForum',params,pg,true);Array.prototype.push.apply(d,ctrl)}else{d.push(empty('本页没有解析到主题','可返回上一页或打开网页版确认'))}setResult(d)}

  function searchInput(kw){return{title:'搜索主题',desc:'搜索',col_type:'input',url:"(function(){var w=String(input||'').trim();if(!w)return 'toast://请输入关键词';putMyVar('sht_search_kw_v1',w);return 'hiker://page/shtSearch?rule=色花堂&simple=true&kw='+encodeURIComponent(w)+'&sht_p=1';})()",extra:{defaultValue:kw||'',titleVisible:true}}}
  function searchId(html){var m=s(html).match(/[?&]searchid=(\d+)/i);return m?m[1]:''}
  function readSearchState(kw){try{var x=JSON.parse(getItem(KEY_SEARCH_STATE,'{}')||'{}');if(x.kw===kw&&x.id)return x}catch(e){}return null}
  function writeSearchState(kw,id){if(!id)return;try{setItem(KEY_SEARCH_STATE,JSON.stringify({kw:kw,id:id,time:new Date().getTime()}))}catch(e){}}
  function directSearchPage(kw,id,pg){var u=origin()+'/search.php?mod=forum&searchid='+encodeURIComponent(id)+'&orderby=lastpost&ascdesc=desc&searchsubmit=yes&page='+pg,h=fetchPc(u),items=parseCards(h,u);if(!items.length){h=renderList(u);items=parseCards(h,u)}return{html:h,url:u,items:items,source:'searchid'}}
  function initialSearchHtml(kw){var start=origin()+'/search.php?mod=forum&mobile=no',html='';try{html=s(fetchCodeByWebView(start,{headers:headers(false,start),timeout:26000,blockRules:['.woff','.woff2','.ttf'],checkJs:$.toString(function(kw,ckKey,accessKey){
      function txt(el){return String((el&&(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')))||'').replace(/\s+/g,' ').trim()}
      function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
      var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
      if(age(body)){var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');for(var i=0;i<ns.length;i++){var t=txt(ns[i]);if(/满\s*18\s*岁|over\s*18|please\s*click\s*here/i.test(t)){try{var h=ns[i].href||ns[i].getAttribute&&ns[i].getAttribute('href');if(h){location.href=h;return null}ns[i].click();return null}catch(e){}}}return null}
      try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ckKey,c);fba.putVar(accessKey,'1')}catch(e2){}
      if(/验证码|安全提问|人机验证|captcha/i.test(body))return'ready';
      if(document.querySelector('a[href*="tid="],a[href*="thread-"]')&&location.href.indexOf('search')>=0)return'ready';
      if(!window.__shtV11SearchSent){var inp=document.querySelector('input[name="srchtxt"],#scform_srchtxt,input[name="searchkey"],input[type="search"]');if(inp){window.__shtV11SearchSent=1;inp.value=kw;try{inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))}catch(e3){}var form=inp.form||inp.closest&&inp.closest('form');if(form){var hs=form.querySelector('input[name="searchsubmit"]');if(hs)hs.value='yes';form.submit();return null}var btn=document.querySelector('button[type="submit"],input[type="submit"]');if(btn){btn.click();return null}}}
      return null;
    },kw,KEY_COOKIE,KEY_ACCESS)}))}catch(e){}return{html:html,url:start}}
  function loadSearch(kw,pg){var st,id,r,items;if(pg>1){st=readSearchState(kw);if(st&&st.id)return directSearchPage(kw,st.id,pg)}r=initialSearchHtml(kw);id=searchId(r.html);if(id)writeSearchState(kw,id);items=parseCards(r.html,r.url);return{html:r.html,url:r.url,items:items,source:'webview',id:id}}
  function search(){var d=[],kw=trim(pageParam('kw',getMyVar('sht_search_kw_v1',''))),pg=Math.max(1,Number(pageParam('sht_p','1'))),r,ctrl,params;if(!kw){setPageTitle('搜索');setResult([searchInput(''),empty('请输入关键词')]);return}setPageTitle('搜索');r=loadSearch(kw,pg);saveDiag('search.v11','kw='+kw+' · p='+pg+' · '+r.source+' · html='+(r.html||'').length+' · topics='+(r.items||[]).length+' · searchid='+(r.id||''));d.push(searchInput(kw));d.push(section('搜索结果',(r.items||[]).length?'“'+kw+'” · 第 '+pg+' 页 · '+r.items.length+' 条':'“'+kw+'” · 暂未取得原生结果'));params={kw:kw};ctrl=pageControls('shtSearch',params,pg,(r.items||[]).length>0);Array.prototype.push.apply(d,ctrl);d.push(line());renderTopicCards(d,r.items||[],r.url);if(!(r.items||[]).length){d.push(empty('暂无原生搜索结果','若官网弹出验证码/安全验证，本版不会绕过，可点下面网页版完成验证'));d.push(quick('网页搜索','x5://'+origin()+'/search.php?mod=forum','web.svg'))}else{ctrl=pageControls('shtSearch',params,pg,true);Array.prototype.push.apply(d,ctrl)}setResult(d)}
  function module(){var m=BASE.module();m.version=VERSION;m.build=BUILD;m.forum=forum;m.search=search;m._debug=m._debug||{};m._debug.parseCardsV11=parseCards;return m}
  var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();