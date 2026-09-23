/* 色花堂 0.1.0-test.13 / Build 10113 - mobile card previews + full-width ordered thread images + in-place pagination */
var SeHuaTangPatchTest13=(function(){
  var BASE=SeHuaTangRemoteRuntime;
  var VERSION='0.1.0-test.13',BUILD=10113,RULE_NAME='色花堂';
  var DEFAULT_ORIGIN='https://sehuatang.org';
  var KEY_ORIGIN='sht_origin_v1',KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7',KEY_DIAG='sht_diag_v1';
  var UA_M='Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
  var UA_PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';
  var RAW='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/aggregate/sehuatang/assets/icons/v1/';

  function s(v){return v==null?'':String(v)}
  function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
  function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
  function hdec(v){var x=s(v),i;for(i=0;i<2;i++)x=x.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ');return x}
  function strip(v){return trim(hdec(v).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/[\t\r]+/g,' ').replace(/\s+/g,' '))}
  function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
  function abs(h,b){h=hdec(trim(h));if(!h)return'';if(/^https?:\/\//i.test(h))return h;if(/^\/\//.test(h))return'https:'+h;if(/^(javascript:|mailto:|tel:|#)/i.test(h))return'';var m=s(b).match(/^(https?:\/\/[^\/]+)/i),o=m?m[1]:origin();if(h.charAt(0)==='/')return o+h;var c=s(b).split('#')[0].split('?')[0];if(c.charAt(c.length-1)!=='/')c=c.replace(/\/[^\/]*$/,'/');return c+h.replace(/^\.\//,'')}
  function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
  function route(path,p){var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k;for(k in(p||{}))if(p.hasOwnProperty(k)&&p[k]!=null)u+='&'+k+'='+encodeURIComponent(s(p[k]));return u}
  function line(cls){return{col_type:'line',extra:{cls:cls||''}}}
  function section(t,d,cls){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:cls||''}}}
  function empty(t,d,cls){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false,cls:cls||''}}}
  function quick(t,u,ico){var p=RAW+ico;return{title:t,img:p,pic_url:p,url:u,col_type:'icon_small_4',extra:{lineVisible:false}}}
  function saveDiag(stage,msg){try{setItem(KEY_DIAG,JSON.stringify({stage:stage,origin:origin(),error:s(msg||'').slice(0,3000),time:new Date().getTime()}))}catch(e){}}
  function cookie(){var c='';try{c=getVar(KEY_COOKIE,'')||''}catch(e){}if(c)return c;try{c=getCookie(origin())||''}catch(e2){}return c}
  function headers(pc,ref){var c=cookie(),h={'User-Agent':pc?UA_PC:UA_M,'Referer':ref||origin()+'/'};if(c){h.Cookie=c;h.cookie=c}return h}
  function imageUrl(u,ref){u=abs(u,ref);if(!u)return'';return u+'@headers='+JSON.stringify(headers(false,ref||origin()+'/'))+'#originalSize#'}
  function threadId(u){var x=hdec(s(u)),m=x.match(/[?&]tid=(\d+)/i)||x.match(/[?&]ptid=(\d+)/i)||x.match(/\/thread-(\d+)-\d+-\d+\.html/i);return m?m[1]:''}
  function forumId(u){var m=s(u).match(/forum-(\d+)-\d+/i)||s(u).match(/[?&]fid=(\d+)/i);return m?m[1]:''}
  function toMobile(u){u=s(u);if(!u)return u;if(/[?&]mobile=(?:2|no)(?=&|$)/i.test(u))return u.replace(/([?&])mobile=(?:2|no)(?=&|$)/i,'$1mobile=2');return u+(u.indexOf('?')>=0?'&':'?')+'mobile=2'}
  function toPc(u){u=s(u);if(!u)return u;if(/[?&]mobile=(?:2|no)(?=&|$)/i.test(u))return u.replace(/([?&])mobile=(?:2|no)(?=&|$)/i,'$1mobile=no');return u+(u.indexOf('?')>=0?'&':'?')+'mobile=no'}
  function withPage(u,p){p=Math.max(1,Number(p||1));u=s(u);if(/\/forum-\d+-\d+\.html(?:\?|$)/i.test(u))return u.replace(/\/forum-(\d+)-\d+\.html/i,'/forum-$1-'+p+'.html');if(/([?&])page=\d+/i.test(u))return u.replace(/([?&])page=\d+/i,'$1page='+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p}
  function canonical(u){return s(u).replace(/@headers=.*$/,'').replace(/#originalSize#.*$/,'').replace(/[?#].*$/,'')}
  function validImage(u,base,attrs){u=abs(u,base);if(!u||/^data:/i.test(u))return'';if(/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer/i.test(u))return'';var a=s(attrs),wm=a.match(/\bwidth\s*=\s*["']?(\d+)/i),hm=a.match(/\bheight\s*=\s*["']?(\d+)/i);if(wm&&hm&&Number(wm[1])<=96&&Number(hm[1])<=96)return'';return u}
  function attrVal(a,n){var r=new RegExp('\\b'+n+'\\s*=\\s*(["\\\'])(.*?)\\1','i'),m=s(a).match(r);return m?m[2]:''}
  function imgFromTag(tag,base){var a=s(tag),names=['src','data-original','data-src','data-lazy-src','data-echo','data-url','data-actual','data-cfsrc','file','zoomfile'],i,u,ss,st;for(i=0;i<names.length;i++){u=validImage(attrVal(a,names[i]),base,a);if(u)return u}ss=attrVal(a,'srcset');if(ss){u=validImage(trim(ss.split(',')[0].split(/\s+/)[0]),base,a);if(u)return u}st=a.match(/background(?:-image)?\s*:\s*url\((?:["']?)([^)"']+)/i);if(st){u=validImage(st[1],base,a);if(u)return u}return''}
  function allImages(x,base,max){var out=[],seen={},re=/<img\b[^>]*>/gi,m,u,gre,gm,a;while((m=re.exec(s(x)))!==null){u=imgFromTag(m[0],base);if(u&&!seen[canonical(u)]){seen[canonical(u)]=1;out.push(u)}if(out.length>=(max||24))return out}gre=/<(?:a|div|span|li)\b([^>]*(?:data-original|data-src|data-bg|style\s*=)[^>]*)>/gi;while((gm=gre.exec(s(x)))!==null){a=gm[1]||'';u=validImage(attrVal(a,'data-original')||attrVal(a,'data-src')||attrVal(a,'data-bg'),base,a);if(!u){var mm=a.match(/background(?:-image)?\s*:\s*url\((?:["']?)([^)"']+)/i);if(mm)u=validImage(mm[1],base,a)}if(u&&!seen[canonical(u)]){seen[canonical(u)]=1;out.push(u)}if(out.length>=(max||24))break}return out}
  function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,a,t,tm;while((m=re.exec(s(html)))!==null){a=(m[1]||'')+' '+(m[4]||'');t=strip(m[5]||'');if(!t){tm=a.match(/\b(?:title|aria-label)\s*=\s*["']([^"']+)["']/i);if(tm)t=strip(tm[1])}out.push({href:abs(m[2]||m[3]||'',base),text:t,inner:m[5]||'',attrs:a,index:m.index});if(out.length>18000)break}return out}
  function badThreadText(t){t=trim(t);if(!t||t.length<2)return true;if(/本帖最后由.+编辑|^(作者|回复于|发表于|查看|查看帖子|回复|最后发表|最后回复|上一页|下一页|返回|详情|进入|播放)/i.test(t))return true;if(/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)||/^\d+$/.test(t))return true;return false}
  function threadScore(t){t=trim(t);if(badThreadText(t))return-999;var n=Math.min(t.length,150);if(/[\u4e00-\u9fffA-Za-z]{2,}/.test(t))n+=35;if(t.length>=8)n+=20;if(/影片名称|原创|中文字幕|无码|有码|写真|视频|FC2|IPX|SSIS|JUL|MIDE|ROE/i.test(t))n+=14;if(t.length>140)n-=12;return n}
  function rowSummary(ctx,title){var t=strip(ctx),q=trim(title);if(q)t=t.replace(q,' ');t=t.replace(/查看帖子|查看全部|最后发表|最后回复|主题|回复|浏览|隐藏置顶帖|上一页|下一页/g,' ').replace(/\s+/g,' ').trim();if(t.length>220)t=t.slice(0,220)+'…';return t}

  function parseMobileCards(html,base){
    var a=anchors(html,base),map={},order=[],out=[],freq={},i,x,id,t,sc,j,nextStart,ctx,imgs,c,first;
    for(i=0;i<a.length;i++){
      x=a[i];id=threadId(x.href);if(!id)continue;t=trim(x.text);sc=threadScore(t);
      if(!map[id]){map[id]={id:id,title:sc>-900?t:'',url:toMobile(x.href),score:sc,firstIndex:x.index,titleIndex:x.index};order.push(id)}
      else if(sc>map[id].score){map[id].title=t;map[id].score=sc;map[id].url=toMobile(x.href);map[id].titleIndex=x.index}
    }
    order.sort(function(a1,b1){return map[a1].firstIndex-map[b1].firstIndex});
    for(i=0;i<order.length;i++){
      id=order[i];x=map[id];if(!x||badThreadText(x.title))continue;
      nextStart=i+1<order.length?map[order[i+1]].firstIndex:s(html).length;
      if(nextStart<=x.firstIndex||nextStart-x.firstIndex>120000)nextStart=Math.min(s(html).length,x.firstIndex+90000);
      first=Math.max(0,x.firstIndex-600);
      ctx=s(html).slice(first,nextStart);
      imgs=allImages(ctx,base,8);
      x.imgs=imgs;x.summary=rowSummary(ctx,x.title);
      for(j=0;j<imgs.length;j++){c=canonical(imgs[j]);freq[c]=(freq[c]||0)+1}
      out.push(x);if(out.length>=100)break;
    }
    for(i=0;i<out.length;i++){
      imgs=[];
      for(j=0;j<(out[i].imgs||[]).length;j++){
        c=canonical(out[i].imgs[j]);if((freq[c]||0)>=3)continue;
        imgs.push(out[i].imgs[j]);if(imgs.length>=2)break;
      }
      out[i].imgs=imgs;
    }
    return out;
  }

  function fetchPage(u,pc){try{return s(fetchPC(u,{headers:headers(!!pc,u),timeout:15000}))}catch(e){return''}}
  function renderList(u){try{return s(fetchCodeByWebView(u,{headers:headers(false,u),timeout:25000,blockRules:['.woff','.woff2','.ttf'],checkJs:$.toString(function(ckKey,accessKey){
    function age(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
    function txt(el){return String((el&&(el.innerText||el.textContent||el.value||''))||'').replace(/\s+/g,' ').trim()}
    var body=String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ');
    if(age(body)){
      var ns=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick],[role="button"],div');
      for(var i=0;i<ns.length;i++){if(age(txt(ns[i]))){try{ns[i].click();return null}catch(e){}}}
      return null;
    }
    try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ckKey,c);fba.putVar(accessKey,'1')}catch(e2){}
    if(!document.querySelector('a[href*="tid="],a[href*="thread-"]'))return null;
    var imgs=document.querySelectorAll('img');
    for(var j=0;j<imgs.length;j++){
      var im=imgs[j],src=String(im.getAttribute('src')||'');
      if(!src||/none\.gif|loading|blank|placeholder|data:image/i.test(src)){
        var real=im.getAttribute('data-original')||im.getAttribute('data-src')||im.getAttribute('data-lazy-src')||im.getAttribute('file')||im.getAttribute('zoomfile')||'';
        if(real)try{im.setAttribute('src',real)}catch(e3){}
      }
    }
    window.__shtV13PreviewPass=(window.__shtV13PreviewPass||0)+1;
    if(window.__shtV13PreviewPass===1){try{window.scrollTo(0,Math.floor(document.body.scrollHeight*0.45))}catch(e4){}return null}
    if(window.__shtV13PreviewPass===2){try{window.scrollTo(0,document.body.scrollHeight)}catch(e5){}return null}
    try{window.scrollTo(0,0)}catch(e6){}
    return 'ready';
  },KEY_COOKIE,KEY_ACCESS)}))}catch(e){return''}}
  function previewCount(items){var n=0,i;for(i=0;i<(items||[]).length;i++)n+=(items[i].imgs||[]).length;return n}
  function mergeMissing(primary,extra){var map={},i,j,x,seen;for(i=0;i<(extra||[]).length;i++)map[extra[i].id]=extra[i];for(i=0;i<(primary||[]).length;i++){x=map[primary[i].id];if(!x)continue;if(!(primary[i].summary||'')&&x.summary)primary[i].summary=x.summary;if((primary[i].imgs||[]).length>=2)continue;seen={};for(j=0;j<(primary[i].imgs||[]).length;j++)seen[canonical(primary[i].imgs[j])]=1;for(j=0;j<(x.imgs||[]).length&&primary[i].imgs.length<2;j++)if(!seen[canonical(x.imgs[j])]){seen[canonical(x.imgs[j])]=1;primary[i].imgs.push(x.imgs[j])}}return primary}
  function loadBoard(seed,pg){var mu=withPage(toMobile(seed),pg),pu=withPage(toPc(seed),pg),h,items,extra=[],diag=[];h=renderList(mu);items=parseMobileCards(h,mu);diag.push('m-web:'+h.length+'/'+items.length+'/'+previewCount(items)+'img');if(!items.length){h=fetchPage(mu,false);items=parseMobileCards(h,mu);diag.push('m-fetch:'+h.length+'/'+items.length+'/'+previewCount(items)+'img')}
    if(items.length&&previewCount(items)<Math.max(2,Math.floor(items.length/4))){h=fetchPage(pu,true);extra=parseMobileCards(h,pu);diag.push('pc-enrich:'+h.length+'/'+extra.length+'/'+previewCount(extra)+'img');items=mergeMissing(items,extra)}
    if(!items.length){h=fetchPage(pu,true);items=parseMobileCards(h,pu);diag.push('pc-fallback:'+h.length+'/'+items.length+'/'+previewCount(items)+'img')}
    return{items:items,url:mu,diag:diag.join('；')}
  }
  function pageKey(seed){var f=forumId(seed);return'sht_forum_page_v13_'+(f||s(seed).replace(/[^a-z0-9]/ig,'').slice(-24)||'x')}
  function pageButton(title,key,p,enabled){return{title:title,url:enabled?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false,cls:'sht_v13_page'}}}
  function pageControls(key,pg,hasNext){return[
    pageButton(pg>1?'上一页':'第一页',key,Math.max(1,pg-1),pg>1),
    pageButton(pg>1?'回第1页':'第1页',key,1,pg>1),
    pageButton(hasNext?'下一页':'已到底',key,pg+1,hasNext)
  ]}
  function renderCards(d,items,ref){var i,j,it,u,p,ct;for(i=0;i<items.length;i++){it=items[i];u=route('shtThread',{sht_url:toMobile(it.url),sht_name:it.title});d.push({title:it.title,desc:it.summary||'查看帖子',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v13_card'}});ct=(it.imgs||[]).length===1?'pic_1_full':'pic_2';for(j=0;j<(it.imgs||[]).length&&j<2;j++){p=imageUrl(it.imgs[j],ref);d.push({title:'',desc:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v13_card'}})}d.push(line('sht_v13_card'))}}
  function forumBoard(){var d=[],seed=pageParam('sht_url',''),name=pageParam('sht_name','主题列表'),key=pageKey(seed),urlPg=Number(pageParam('sht_p','0')||0),pg,r,ctrl;if(urlPg>0){putMyVar(key,String(urlPg));pg=urlPg}else pg=Math.max(1,Number(getMyVar(key,'1')||1));setPageTitle(name);r=loadBoard(seed,pg);saveDiag('forum.mobile.v13','p='+pg+' · '+r.diag);if(pg===1){d.push(quick('手机版','x5://'+withPage(toMobile(seed),1),'web.svg'));d.push(quick('搜索',route('shtSearch'),'search.svg'));d.push(line());d.push(section(name,'手机端卡片优先 · 当前第 '+pg+' 页 · '+r.items.length+' 条主题 · '+previewCount(r.items)+' 张预览图'))}else d.push(section(name,'第 '+pg+' 页 · 原页内翻页，不增加返回栈'));ctrl=pageControls(key,pg,r.items.length>0);Array.prototype.push.apply(d,ctrl);d.push(line());renderCards(d,r.items,r.url);if(r.items.length){ctrl=pageControls(key,pg,true);Array.prototype.push.apply(d,ctrl)}else d.push(empty('本页没有解析到主题','可点上一页或回第1页'));setResult(d)}

  function extractFloors(html){var out=[],seen={},selectors=['body&&#postlist>div','body&&#postlist&&div[id^=post_]','body&&div.t_fsz','body&&div.t_f','body&&td.t_f','body&&[id^=postmessage_]','body&&.message'],i,j,nodes,body,author,key;for(i=0;i<selectors.length;i++){try{nodes=pdfa(html,selectors[i])||[]}catch(e){nodes=[]}for(j=0;j<nodes.length;j++){try{body=pdfh(nodes[j],'body&&div.t_fsz&&Html')||pdfh(nodes[j],'body&&div.t_f&&Html')||pdfh(nodes[j],'body&&td.t_f&&Html')||pdfh(nodes[j],'body&&.message&&Html')||pdfh(nodes[j],'body&&Html')||s(nodes[j])}catch(e2){body=s(nodes[j])}if(!trim(strip(body)))continue;try{author=trim(pdfh(nodes[j],'body&&.authi&&a&&Text')||pdfh(nodes[j],'body&&.xw1&&Text')||'')}catch(e3){author=''}key=strip(body).slice(0,220);if(key&&!seen[key]){seen[key]=1;out.push({body:body,author:author})}}if(out.length)break}return out}
  function textBlock(x){var y=s(x);y=y.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<iframe[\s\S]*?<\/iframe>/gi,'');y=y.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/li\s*>/gi,'\n').replace(/<[^>]+>/g,' ');y=hdec(y).replace(/magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s<>]*)?/ig,' ').replace(/[ \t]+/g,' ').replace(/\n\s*\n\s*\n+/g,'\n\n').trim();return y}
  function escHtml(x){return s(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function emitText(d,t){t=trim(t);if(!t)return;d.push({title:escHtml(t).replace(/\n/g,'<br>'),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false}})}
  function emitImage(d,u,ref,all){var p=imageUrl(u,ref),pics=[],i;if(!p)return;for(i=0;i<(all||[]).length;i++)pics.push(imageUrl(all[i],ref));d.push({title:'',desc:'',img:p,pic_url:p,url:'pics://'+(pics.length?pics.join('&&'):p),col_type:'pic_1_full',extra:{lineVisible:false,imgLongClick:true}})}
  function orderedBody(d,body,ref){var x=s(body),re=/<img\b[^>]*>/gi,m,last=0,u,t,parts=0,all=allImages(x,ref,60),seen={};while((m=re.exec(x))!==null){t=textBlock(x.slice(last,m.index));if(t){emitText(d,t);parts++}u=imgFromTag(m[0],ref);if(u&&!seen[canonical(u)]){seen[canonical(u)]=1;emitImage(d,u,ref,all);parts++}last=re.lastIndex}t=textBlock(x.slice(last));if(t){emitText(d,t);parts++}return parts}
  function magnetList(x){var t=hdec(s(x)),out=[],seen={},m,re=/magnet:\?xt=urn:btih:[a-z0-9]{32,40}(?:&[^\s"'<>]*)?/ig,v,hm,key;while((m=re.exec(t))!==null){v=m[0].replace(/[)\]}>，。；;]+$/g,'');hm=v.match(/btih:([a-z0-9]{32,40})/i);key=hm?hm[1].toUpperCase():v.toLowerCase();if(!seen[key]){seen[key]=1;out.push({url:v,key:key,hash:hm?hm[1]:''})}if(out.length>=20)break}return out}
  function videoUrls(x){var out=[],seen={},m,re=/(https?:\/\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>]*)?)/ig,u;while((m=re.exec(hdec(s(x))))!==null){u=m[1].replace(/[)\]}>，。；;]+$/g,'');if(!seen[u]){seen[u]=1;out.push(u)}if(out.length>=6)break}return out}
  function sniffSeed(x,base){var m=s(x).match(/<iframe\b[^>]*(?:src|data-src)\s*=\s*["']([^"']+)["']/i),u=m?abs(m[1],base):'';return u||base}
  function replyUrl(html,base){var m=s(html).match(/href=["']([^"']*(?:mod=post[^"']*action=reply|action=reply[^"']*mod=post)[^"']*)["']/i);return m?abs(m[1],base):base}
  function thread(){var m=BASE.module(),url=toMobile(pageParam('sht_url','')),title=pageParam('sht_name','帖子详情'),r,floors,i,j,body,author,ms,allMs,seenMag={},videos,videoHint,seed,ref,parts;if(!url){setResult([empty('帖子参数缺失')]);return}setPageTitle(title||'帖子详情');r=m._debug&&m._debug.threadFetchMobileV12?m._debug.threadFetchMobileV12(url):{html:'',url:url,diag:'missing threadFetchMobileV12'};ref=r.url||url;floors=extractFloors(r.html);saveDiag('thread.mobile.v13',(r.diag||'')+' · floors='+floors.length);d.push(section(title||'帖子详情','手机端正文优先 · 图片按手机网页版顺序逐张全宽显示'));d.push(quick('手机版','x5://'+toMobile(url),'web.svg'));d.push(quick('回复','x5://'+replyUrl(r.html,ref),'reply.svg'));d.push(quick('复制链接','copy://'+url,'copy.svg'));d.push(quick('设置',route('shtSettings'),'settings.svg'));d.push(line());if(!floors.length){d.push(empty('未识别到帖子正文','已先尝试手机端，再回退电脑端'));setResult(d);return}for(i=0;i<floors.length&&i<20;i++){body=floors[i].body;author=floors[i].author||'';d.push(section(i===0?'楼主'+(author?' · '+author:''):'回复 '+i+(author?' · '+author:''),'按手机网页版正文顺序显示'));parts=orderedBody(d,body,ref);allMs=magnetList(body);ms=[];for(j=0;j<allMs.length;j++)if(!seenMag[allMs[j].key]){seenMag[allMs[j].key]=1;ms.push(allMs[j])}videos=videoUrls(body);videoHint=videos.length>0||/<video\b|<iframe\b|视频加载中|在线播放|dplayer|ckplayer|jwplayer|m3u8|\.mp4/i.test(body);seed=sniffSeed(body,ref);if(videos.length)d.push({title:'▶ 直接播放',desc:'已识别视频直链',url:videos[0]+'#isVideo=true#',col_type:'text_center_1',extra:{lineVisible:false}});if(videoHint)d.push({title:'▶ 嗅探播放',desc:'使用海阔自动提取网页视频',url:'video://'+seed,col_type:'text_center_1',extra:{lineVisible:false,ua:UA_M,referer:toMobile(url),blockRules:['.jpg','.png','.gif','.woff','.woff2','.ttf'],cacheM3u8:true}});for(j=0;j<ms.length;j++){var magnet=ms[j].url,hash=ms[j].hash;d.push({title:'磁链 '+(j+1),desc:hash?hash.slice(0,14)+'…':'已识别',url:'copy://'+magnet,col_type:'text_1',extra:{lineVisible:false}});d.push(quick('115','hiker://page/115Offline?rule=115.简&page=fypage&add='+encodeURIComponent(magnet),'cloud115.svg'));d.push(quick('迅雷','hiker://page/diaoyong?rule=迅雷&page=fypage#'+magnet,'thunder.svg'));d.push(quick('PikPak','pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url='+magnet,'pikpak.svg'));d.push(quick('复制','copy://'+magnet,'copy.svg'))}if(!parts&&!ms.length&&!videoHint)d.push(empty('本层没有可显示正文'));d.push(line())}setResult(d)}
  function settings(){var d=[],dg={};setPageTitle('色花堂设置');d.push(section('Test13 手机卡片与原页内翻页','普通板块优先解析手机端帖子卡片并显示最多2张真实预览图；下一页改为当前页面内刷新，不再叠加返回栈；正文图片逐张全宽按原序显示。'));try{dg=JSON.parse(getItem(KEY_DIAG,'{}')||'{}')}catch(e){}d.push({title:'最近诊断',desc:(dg.stage||'暂无')+'\n'+(dg.error||''),url:'hiker://empty',col_type:'long_text'});d.push({title:'打开旧设置',desc:'分类缓存 / 访问状态 / Cookie',url:route('shtSettingsLegacy'),col_type:'text_1'});setResult(d)}
  function module(){var m=BASE.module(),prevForum=m.forum;m.version=VERSION;m.build=BUILD;m.forum=function(){var kind=pageParam('sht_auto','');if(kind)return prevForum();return forumBoard()};m.thread=thread;m.settings=settings;m._debug=m._debug||{};m._debug.parseMobileCardsV13=parseMobileCards;return m}
  var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();