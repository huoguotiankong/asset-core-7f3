/* XVideos Core Rescue/Product Patch 0.1.0-test.5 */
(function(){
  if(typeof XVideosCore==='undefined')throw new Error('XVideosCore missing before Test5 rescue patch');
  var C=XVideosCore;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/';
  var S={};
  C.version='0.1.0-test.5';C.build=10105;C.bootstrap=ROOT+'bootstrap_test_v5_b10105.js?v=10105';

  S.ACCOUNT_FILE='xvideos_t5_account.json';
  S.FAVORITES_FILE='xvideos_t5_favorites.json';
  S.HISTORY_FILE='xvideos_t5_history.json';
  S.SEARCH_FILE='xvideos_t5_search_history.json';
  S.BASE_FILE='xvideos_t5_base.txt';
  S.COMMENT_DIAG='xvideos_t5_comment_diag.txt';
  S.MEM={};S.MEM_TS={};S.PROFILE_MEM={};S.PROFILE_TS={};
  S.str=function(v){return v===undefined||v===null?'':String(v);};
  S.readText=function(name,def){var s='';try{s=S.str(readFile(name));}catch(e){}return s||def||'';};
  S.writeText=function(name,text){try{saveFile(name,S.str(text));return true;}catch(e){return false;}};
  S.readJson=function(name,def){var s=S.readText(name,'');if(!s)return def;try{return JSON.parse(s);}catch(e){return def;}};
  S.writeJson=function(name,obj,max){var s='';try{s=JSON.stringify(obj);}catch(e){return false;}if(max&&s.length>max)return false;return S.writeText(name,s);};
  S.safeRemove=function(key){
    if(!key)return false;
    try{if(typeof clearItem==='function'){clearItem(key);return true;}}catch(e){}
    try{if(typeof removeItem==='function'){removeItem(key);return true;}}catch(e2){}
    return false;
  };
  S.slim=function(x){x=x||{};var img=S.str(x.img||''),raw=S.str(x.rawImg||'');if(/^data:/i.test(img)||img.length>1400)img='';if(/^data:/i.test(raw)||raw.length>1400)raw='';return{url:S.str(x.url||'').slice(0,1600),title:C.clean(x.title||'Video').slice(0,180),img:img,rawImg:raw,desc:C.clean(x.desc||'').slice(0,220),time:Number(x.time||new Date().getTime())};};
  S.fileForList=function(key){return key===C.favoriteKey?S.FAVORITES_FILE:S.HISTORY_FILE;};

  var oldDecode=C.decode;
  C.decode=function(v){
    var s=oldDecode?oldDecode(v):S.str(v),map={lbrack:'[',rbrack:']',period:'.',comma:',',colon:':',semi:';',sol:'/',bsol:'\\',quest:'?',excl:'!',num:'#',equals:'=',plus:'+',minus:'-',ndash:'–',mdash:'—',hellip:'…',laquo:'«',raquo:'»',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”',middot:'·'};
    s=s.replace(/&#x([0-9a-f]+);/ig,function(_,h){var n=parseInt(h,16);return n?String.fromCharCode(n):_;});
    return s.replace(/&([a-z][a-z0-9]+);/ig,function(_,n){n=String(n).toLowerCase();return map.hasOwnProperty(n)?map[n]:_;});
  };

  C.base=function(){var b=C.trim(S.readText(S.BASE_FILE,''));if(!b){try{b=C.trim(getItem(C.baseKey,C.defaultBase));}catch(e){b=C.defaultBase;}}if(!/^https?:\/\//i.test(b))b=C.defaultBase;return b.replace(/\/+$/,'');};
  C.saveBase=function(v){v=C.trim(v).replace(/\/+$/,'');if(!/^https?:\/\//i.test(v))return false;return S.writeText(S.BASE_FILE,v);};
  C.loginUrl=function(){return C.base()+'/account';};
  C.liveCookie=function(){
    var urls=[C.loginUrl(),C.base()+'/',C.base()],best='',i,x;
    for(i=0;i<urls.length;i++){try{x=C.clean(getCookie(urls[i]));}catch(e){x='';}if(x.length>best.length)best=x;}
    return best;
  };
  C.authFingerprint=function(cookie){cookie=C.clean(cookie===undefined?C.liveCookie():cookie);if(!cookie)return'anon';return's'+C.hash(cookie+'|'+cookie.length)+'l'+cookie.length;};
  C.accountState=function(){var o=S.readJson(S.ACCOUNT_FILE,{});return o&&typeof o==='object'?o:{};};
  C.accountName=function(){return C.clean(C.accountState().name||'');};
  C.authEnabled=function(){var st=C.accountState();return st.enabled===true&&!!C.liveCookie();};
  C.activeCookie=function(){return C.authEnabled()?C.liveCookie():'';};
  C.savedCookie=function(){return C.activeCookie();};
  C.accountReady=function(){return C.authEnabled()&&!!C.activeCookie();};
  C.headers=function(ref,auth,accept){var h={'User-Agent':C.ua,'Referer':ref||C.base()+'/','Accept':accept||'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.7'};var ck=auth?C.liveCookie():'';if(ck)h.Cookie=ck;return h;};

  S.cleanupUrl=function(url){var fp=C.authFingerprint(C.liveCookie()),keys=[C.cacheKey('anon:'+url),C.cacheKey('auth:'+url),C.cacheKey('auth:'+fp+':'+url),C.cacheKey('profile-payload:'+url)],i;for(i=0;i<keys.length;i++){S.safeRemove(keys[i]);S.safeRemove(keys[i]+'_ts');}};
  S.cleanupKnown=function(){
    var b=C.base(),urls=[b+'/',b+'/tags',b+'/best',b+'/new',b+'/pornstars',b+'/channels',b+'/profiles',b+'/account',b+'/history/0',b+'/videos-i-like/0',b+'/watch-later/0'],i,a,k;
    for(i=0;i<urls.length;i++)S.cleanupUrl(urls[i]);
    try{a=JSON.parse(getItem(C.historyKey,'[]'));}catch(e){a=[];}if(Object.prototype.toString.call(a)==='[object Array]')for(i=0;i<a.length&&i<100;i++)if(a[i]&&a[i].url)S.cleanupUrl(a[i].url);
    try{a=JSON.parse(getItem(C.favoriteKey,'[]'));}catch(e2){a=[];}if(Object.prototype.toString.call(a)==='[object Array]')for(i=0;i<a.length&&i<100;i++)if(a[i]&&a[i].url)S.cleanupUrl(a[i].url);
    var legacy=[C.authCookieKey,C.authEnabledKey,C.accountNameKey,'xv_auth_session_v4','hc_remote_state_xvideos-test'];for(k=0;k<legacy.length;k++)S.safeRemove(legacy[k]);
  };

  C.fetchText=function(url,opt){
    opt=opt||{};url=C.clean(url);var auth=!!opt.auth,scope=auth?('auth:'+C.authFingerprint()+':'):'anon:',key=scope+url,now=new Date().getTime(),ttl=opt.ttl===undefined?180000:opt.ttl,old=S.MEM[key]||'',ts=Number(S.MEM_TS[key]||0),body='',h;
    if(!opt.force&&old&&now-ts<ttl)return old;
    S.cleanupUrl(url);
    try{h=C.headers(opt.ref||url,auth,opt.accept);if(opt.xhr)h['X-Requested-With']='XMLHttpRequest';body=S.str(fetch(url,{timeout:opt.timeout||12000,headers:h}));}catch(e){body='';}
    if(!C.isBad(body)){S.MEM[key]=body;S.MEM_TS[key]=now;return body;}return old||body;
  };
  C.fetchProfilePayload=function(url,ttl){var now=new Date().getTime(),old=S.PROFILE_MEM[url]||'',ts=Number(S.PROFILE_TS[url]||0),body='';if(old&&now-ts<(ttl||180000))return old;body=C.fetchText(url,{force:true,ttl:0,auth:C.authEnabled(),accept:'application/json, text/plain, */*',xhr:true,timeout:12000});if(body){S.PROFILE_MEM[url]=body;S.PROFILE_TS[url]=now;}return body||old;};

  C.readList=function(key){var fn=S.fileForList(key),a=S.readJson(fn,null),legacy,i,out=[];if(Object.prototype.toString.call(a)!=='[object Array]'){try{legacy=JSON.parse(getItem(key,'[]'));}catch(e){legacy=[];}a=Object.prototype.toString.call(legacy)==='[object Array]'?legacy:[];if(a.length)S.writeJson(fn,a,180000);}for(i=0;i<(a||[]).length;i++)if(a[i]&&a[i].url)out.push(S.slim(a[i]));return out;};
  C.writeList=function(key,items){var fn=S.fileForList(key),src=items||[],out=[],max=key===C.historyKey?70:100,i,s;for(i=0;i<src.length&&i<max;i++)out.push(S.slim(src[i]));s=JSON.stringify(out);while(s.length>160000&&out.length>10){out=out.slice(0,Math.max(10,Math.floor(out.length*0.7)));s=JSON.stringify(out);}return S.writeText(fn,s);};
  C.addHistory=function(item){var cur=S.slim(item),old=C.readList(C.historyKey),out=[cur],i;if(!cur.url)return false;for(i=0;i<old.length&&out.length<70;i++)if(old[i].url!==cur.url)out.push(S.slim(old[i]));return C.writeList(C.historyKey,out);};
  C.toggleFav=function(item){var cur=S.slim(item),old=C.readList(C.favoriteKey),out=[],hit=false,i;for(i=0;i<old.length;i++){if(old[i].url===cur.url)hit=true;else out.push(S.slim(old[i]));}if(!hit)out.unshift(cur);C.writeList(C.favoriteKey,out);return!hit;};
  C.isFav=function(url){var a=C.readList(C.favoriteKey),i;for(i=0;i<a.length;i++)if(a[i].url===url)return true;return false;};
  C.searchHistory=function(){var a=S.readJson(S.SEARCH_FILE,null),legacy;if(Object.prototype.toString.call(a)!=='[object Array]'){try{legacy=JSON.parse(getItem(C.searchHistoryKey,'[]'));}catch(e){legacy=[];}a=Object.prototype.toString.call(legacy)==='[object Array]'?legacy:[];if(a.length)S.writeJson(S.SEARCH_FILE,a,24000);}return a||[];};
  C.recordSearch=function(q){q=C.clean(q);if(!q)return;var a=C.searchHistory(),out=[q],i;for(i=0;i<a.length;i++)if(C.clean(a[i]).toLowerCase()!==q.toLowerCase())out.push(C.clean(a[i]));S.writeJson(S.SEARCH_FILE,out.slice(0,20),24000);};
  C.clearSearchHistory=function(){return S.writeJson(S.SEARCH_FILE,[],24000);};
  C.removeSearchHistory=function(q){q=C.clean(q).toLowerCase();var a=C.searchHistory(),out=[],i;for(i=0;i<a.length;i++)if(C.clean(a[i]).toLowerCase()!==q)out.push(a[i]);return S.writeJson(S.SEARCH_FILE,out,24000);};

  C.detectAccountName=function(html){
    var s=S.str(html),m,patterns=[/href=["']\/profiles\/([^"'\/?#]+)["'][^>]*class=["'][^"']*(?:account|profile|user)[^"']*["']/i,/class=["'][^"']*(?:account|user|profile)[^"']*["'][\s\S]{0,500}?href=["']\/profiles\/([^"'\/?#]+)["']/i,/data-(?:username|user-name)=["']([^"']+)["']/i];
    for(var i=0;i<patterns.length;i++){m=s.match(patterns[i]);if(m&&m[1]){try{return decodeURIComponent(m[1]);}catch(e){return m[1];}}}return'';
  };
  C.syncWebCookie=function(){
    var cookie=C.liveCookie();if(!cookie)return{ok:false,message:'未读取到 X5 登录 Cookie。请先打开官方账号页完成登录，再返回同步。'};
    var u=C.loginUrl(),h=C.fetchText(u,{force:true,ttl:0,auth:true,timeout:14000}),name=C.detectAccountName(h),logged=/session_token(?:_auth)?=/i.test(cookie)||/\b(?:logout|sign out|my account|my profile)\b/i.test(C.strip(h));
    if(!logged)return{ok:false,message:'已读取 Cookie，但官网账号页仍未确认登录。请在 X5 的 XVideos 账号页完成登录后再同步。'};
    var st={enabled:true,name:name||'',fingerprint:C.authFingerprint(cookie),syncedAt:new Date().getTime()};S.writeJson(S.ACCOUNT_FILE,st,12000);return{ok:true,name:st.name,fingerprint:st.fingerprint,message:st.name?('已连接当前 X5 账号：'+st.name):('已连接当前 X5 登录会话 · '+st.fingerprint)};
  };
  C.logoutLocal=function(){return S.writeJson(S.ACCOUNT_FILE,{enabled:false,name:'',fingerprint:'',syncedAt:new Date().getTime()},12000);};

  C._creatorCountries={china:1,japan:1,taiwan:1,kazakhstan:1,usa:1,'united states':1,france:1,germany:1,spain:1,italy:1,brazil:1,russia:1,uk:1,'united kingdom':1,canada:1,korea:1,'south korea':1,india:1,thai:1,thailand:1,mexico:1,colombia:1,argentina:1,australia:1,asia:1,europe:1,latina:1,philippines:1,vietnam:1,indonesia:1,malaysia:1,singapore:1};
  C.countryZh=function(n){var m={china:'中国',japan:'日本',taiwan:'台湾',kazakhstan:'哈萨克斯坦',usa:'美国','united states':'美国',france:'法国',germany:'德国',spain:'西班牙',italy:'意大利',brazil:'巴西',russia:'俄罗斯',uk:'英国','united kingdom':'英国',canada:'加拿大',korea:'韩国','south korea':'韩国',india:'印度',thai:'泰国',thailand:'泰国',mexico:'墨西哥',colombia:'哥伦比亚',argentina:'阿根廷',australia:'澳大利亚',philippines:'菲律宾',vietnam:'越南',indonesia:'印度尼西亚',malaysia:'马来西亚',singapore:'新加坡'};return m[C.clean(n).toLowerCase()]||n;};
  C.parseCreatorCards=function(html,base,expected){
    var s=S.str(html),a=C.allAnchors(s,base||C.base()),out=[],regions=[],seen={},seenRegion={},i,it,kind,ctx,name,img,desc,sm,path,slug,isCountry;
    for(i=0;i<a.length;i++){
      it=a[i];kind=C.creatorPathKind(it.href);if(!kind)continue;path=S.str(it.href).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0];name=C.clean(C.decode(it.title||it.text));ctx=C.context(s,it.index,450,1500);
      if(!name||name.length<2||name.length>100){var nm=ctx.match(/(?:title|alt)\s*=\s*["']([^"']{2,100})["']/i);name=nm?C.clean(C.decode(nm[1])):'';}if(!name)continue;
      slug=path.replace(/^\/+|\/+$/g,'').split('/').pop().toLowerCase();isCountry=!!(C._creatorCountries[name.toLowerCase()]||C._creatorCountries[slug]);
      if(isCountry){var rn=C.countryZh(name),rk=rn.toLowerCase();if(!seenRegion[rk]){seenRegion[rk]=1;regions.push({name:rn,url:it.href});}continue;}
      if(expected==='pornstars'&&kind!=='pornstar')continue;
      if(expected==='channels'&&kind!=='channel'&&kind!=='creator')continue;
      if(expected==='profiles'&&kind!=='profile'&&kind!=='creator')continue;
      if(kind==='creator'&&!/(videos?|subscribers?|profile|channel)/i.test(ctx))continue;
      img=C.imgFrom(it.raw,it.href)||C.imgFrom(ctx,it.href);if(!img||seen[it.href])continue;
      desc=expected==='channels'?'频道':expected==='profiles'?'创作者':'演员';sm=ctx.match(/([\d,.]+\s*[KMB]?)\s*(videos?|subscribers?|views?)/i);if(sm)desc+=' · '+C.strip(sm[1])+' '+(/video/i.test(sm[2])?'视频':/subscriber/i.test(sm[2])?'订阅':'观看');
      seen[it.href]=1;out.push({url:it.href,title:name,img:C.image(img,it.href),rawImg:img,type:kind,desc:desc});
    }
    return{profiles:out.slice(0,120),regions:regions.slice(0,40)};
  };
  C.modelLinks=function(html,url){
    var s=S.str(html),out=[],seen={},re=/<li\b[^>]*class=["'][^"']*\bmodel\b[^"']*["'][^>]*>/ig,m,chunk,a,i,n,k;
    while((m=re.exec(s))&&out.length<30){chunk=s.substring(m.index,Math.min(s.length,m.index+1500));a=C.allAnchors(chunk,url);for(i=0;i<a.length;i++){k=C.creatorPathKind(a[i].href);if(k!=='pornstar'&&k!=='profile')continue;n=C.clean(C.decode(a[i].text||a[i].title));if(!n||n.length>80||/^(?:channels?|pornstars?|transsexual porn|models?|users?)$/i.test(n)||seen[a[i].href])continue;seen[a[i].href]=1;out.push({name:n,url:a[i].href});break;}}return out;
  };

  S.TAG_ZH={arab:'阿拉伯',arabic:'阿拉伯',bisexual:'双性',mature:'成熟',cheating:'出轨背叛',cuckold:'出轨背叛',fetish:'调教',bdsm:'调教',anal:'肛交',brunette:'褐发',black:'黑人',redhead:'红发',family:'家庭乱搞',blonde:'金发','big-dick':'巨屌','big-cock':'巨屌','big-tits':'巨乳','big-boobs':'巨乳','big-ass':'巨臀',oral:'口交',blowjob:'口交',asian:'亚洲',amateur:'业余',milf:'熟女',lesbian:'女同',teen:'年轻',japanese:'日本',chinese:'中国',korean:'韩国',indian:'印度',latina:'拉丁',massage:'按摩',pov:'第一视角',threesome:'三人',creampie:'内射',cumshot:'射精',solo:'单人',interracial:'跨种族',hentai:'成人动画','animated-hentai':'成人动画','ai-generated':'AI生成',transsexual:'跨性别',trans:'跨性别'};
  S.tagKey=function(u,n){var p=S.str(u).replace(/^https?:\/\/[^\/]+/i,'').split(/[?#]/)[0].replace(/\/+$/,'').split('/').pop();if(!p){var m=S.str(u).match(/[?&]k=([^&#]+)/);p=m?m[1]:n||'';}try{p=decodeURIComponent(p);}catch(e){}return C.clean(p).toLowerCase();};
  C.localizedTagMap=function(force){if(S._zhMap&&!force)return S._zhMap;var b=C.base(),cands=[b.replace(/^https?:\/\/[^\/]+/i,'https://zh.xvideos.com')+'/tags',b.replace(/^https?:\/\/[^\/]+/i,'https://cn.xvideos.com')+'/tags'],map={},i,h,a,j,k,n,cnt;for(i=0;i<cands.length;i++){h=C.fetchText(cands[i],{force:!!force,ttl:3600000,accept:'text/html',timeout:8000});if(C.isBad(h))continue;a=C.allAnchors(h,cands[i]);for(j=0;j<a.length;j++){n=C.clean(C.decode(a[j].text||a[j].title));k=S.tagKey(a[j].href,n);if(k&&n&&n.length<60&&/[\u3400-\u9fff]/.test(n)&&!map[k])map[k]=n;}cnt=0;for(k in map)if(map.hasOwnProperty(k))cnt++;if(cnt>30)break;}S._zhMap=map;return map;};
  C.tagDisplayName=function(item){item=item||{};var key=S.tagKey(item.url,item.name),map=C.localizedTagMap(false),n=map[key]||S.TAG_ZH[key]||S.TAG_ZH[C.clean(item.name).toLowerCase()];if(n)return n;var raw=C.clean(C.decode(item.name)),parts=key.split(/[-_ ]+/),out=[],i,t,dict={big:'大',small:'小',young:'年轻',old:'年长',asian:'亚洲',japanese:'日本',chinese:'中国',black:'黑人',white:'白人',girl:'女孩',girls:'女孩',woman:'女性',women:'女性',man:'男性',men:'男性',sex:'性爱',porn:'成人视频',hairy:'多毛',tattoo:'纹身',uniform:'制服',school:'校园',teacher:'教师',nurse:'护士',wife:'妻子',husband:'丈夫',mom:'妈妈',mother:'妈妈',dad:'爸爸',father:'爸爸',step:'继亲',public:'公共场所',outdoor:'户外',group:'多人',double:'双重',penetration:'插入',rough:'激烈',hardcore:'重口',softcore:'轻度',homemade:'自拍',professional:'专业'};for(i=0;i<parts.length;i++){t=S.TAG_ZH[parts.slice(i).join('-')]||dict[parts[i]]||'';if(t)out.push(t);}return out.length?out.join(''):raw;};
  C.tagListZh=function(force){var a=C.tagList(!!force),out=[],i;for(i=0;i<a.length;i++){var x={};for(var k in a[i])if(a[i].hasOwnProperty(k))x[k]=a[i][k];x.sourceName=a[i].name;x.zhName=C.tagDisplayName(a[i]);x.name=x.zhName||x.sourceName;out.push(x);}return out;};

  var oldDetail=C.detail;
  C.detail=function(html,url){var x=oldDetail(html,url),i;x.title=C.clean(C.decode(x.title));x.desc=C.clean(C.decode(x.desc));if(x.author)x.author.name=C.clean(C.decode(x.author.name));for(i=0;i<(x.models||[]).length;i++)x.models[i].name=C.clean(C.decode(x.models[i].name));for(i=0;i<(x.tags||[]).length;i++){x.tags[i].sourceName=x.tags[i].name;x.tags[i].name=C.tagDisplayName(x.tags[i]);}return x;};

  C.parseComments=function(html,url){
    var s=S.str(html),out=[],seen={},starts=[],re=/<(?:div|li|article|section)\b[^>]*(?:class|id)=["'][^"']*comment[^"']*["'][^>]*>/ig,m,i,end,chunk,user,text,time,img,likes,key,a,nodes,tm,dm,lm,um;
    while((m=re.exec(s))&&starts.length<180)starts.push(m.index);
    function push(u,t,ti,im,href,lk){u=C.clean(C.decode(u));t=C.clean(C.decode(t));if(!u||!t||t.length<2||t.length>1800)return;key=u+'|'+t;if(seen[key])return;seen[key]=1;out.push({user:u,text:t,time:C.clean(C.decode(ti)),img:C.image(im||'',url),url:href||'',likes:C.clean(lk)});}
    for(i=0;i<starts.length&&out.length<120;i++){
      end=i+1<starts.length?Math.min(starts[i+1],starts[i]+5000):Math.min(s.length,starts[i]+5000);chunk=s.substring(starts[i],end);
      um=chunk.match(/<(?:span|strong|div|a)[^>]+class=["'][^"']*(?:comment-user|user-name|username|profile-name|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|strong|div|a)>/i);user=um?C.strip(um[1]):'';
      a=C.allAnchors(chunk,url);if(!user){for(var j=0;j<a.length;j++){if(C.creatorPathKind(a[j].href)){user=C.clean(a[j].text||a[j].title);if(user)break;}}}
      tm=chunk.match(/<(?:p|div|span)[^>]+class=["'][^"']*(?:comment-text|comment-body|comment-content|comment-message|message|text)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|div|span)>/i);text=tm?C.strip(tm[1]):'';
      if(!text){nodes=chunk.match(/<p\b[^>]*>[\s\S]*?<\/p>/ig)||[];for(var z=0;z<nodes.length;z++){var cand=C.strip(nodes[z]);if(cand.length>text.length&&cand.length>2&&cand.length<1800&&!/^(reply|like|report|more|less)$/i.test(cand))text=cand;}}
      dm=chunk.match(/<(?:span|small|time)[^>]+class=["'][^"']*(?:date|time|ago)[^"']*["'][^>]*>([^<]+)</i);time=dm?C.strip(dm[1]):'';
      lm=chunk.match(/(?:like|vote)[^>]*>[\s\S]{0,80}?([\d,.]+\s*[KMB]?)/i);likes=lm?C.strip(lm[1]):'';img=C.imgFrom(chunk,url);
      var href='';for(var q=0;q<a.length;q++)if(C.creatorPathKind(a[q].href)){href=a[q].href;break;}push(user,text,time,img,href,likes);
    }
    return out;
  };
  C.commentCandidates=function(html,url){var s=S.str(html),out=[],seen={},res=[/(?:data-url|data-href|href|action)=["']([^"']*comment[^"']*)["']/ig,/(["'])(\/[^"']*(?:comment|reply)[^"']*)\1/ig],r,m,u,i;for(i=0;i<res.length;i++){r=res[i];while((m=r.exec(s))&&out.length<12){u=C.abs(m[i===0?1:2],url);if(!u||seen[u]||C.origin(u)!==C.origin(url))continue;seen[u]=1;out.push(u);}}return out;};
  C.commentsForVideo=function(url,html){
    html=html||C.fetchText(url,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000});var out=C.parseComments(html,url),cands=C.commentCandidates(html,url),seen={},i,body,jv;
    for(i=0;i<out.length;i++)seen[out[i].user+'|'+out[i].text]=1;
    function merge(a){for(var k=0;k<(a||[]).length;k++){var kk=a[k].user+'|'+a[k].text;if(!seen[kk]){seen[kk]=1;out.push(a[k]);}}}
    function walk(v,depth,base){if(depth>5||v===null||v===undefined)return;if(typeof v==='string'){if(v.indexOf('<')>=0)merge(C.parseComments(v,base));return;}if(Object.prototype.toString.call(v)==='[object Array]'){for(var a=0;a<v.length;a++)walk(v[a],depth+1,base);return;}if(typeof v==='object'){var user=C.clean(v.username||v.user_name||v.author||v.name||(v.user&&v.user.name)||''),text=C.clean(v.comment||v.message||v.body||v.text||v.content||''),time=C.clean(v.time||v.date||v.created_at||''),avatar=C.clean(v.avatar||v.image||(v.user&&v.user.avatar)||'');if(user&&text&&text.indexOf('<')<0){var kk=user+'|'+text;if(!seen[kk]){seen[kk]=1;out.push({user:C.decode(user),text:C.decode(text),time:C.decode(time),img:C.image(avatar,base),url:'',likes:C.clean(v.likes||v.votes||'')});}}for(var k in v)if(v.hasOwnProperty(k))walk(v[k],depth+1,base);}}
    for(i=0;i<cands.length&&i<8&&out.length<120;i++){body=C.fetchText(cands[i],{force:true,ttl:0,auth:C.authEnabled(),xhr:true,accept:'application/json, text/html, */*',timeout:9000});if(!body)continue;merge(C.parseComments(body,cands[i]));try{jv=JSON.parse(body);}catch(e){jv=null;}if(jv)walk(jv,0,cands[i]);}
    if(!out.length)S.writeText(S.COMMENT_DIAG,JSON.stringify({time:new Date().getTime(),url:url,candidates:cands.slice(0,8),htmlLength:S.str(html).length}));
    return{comments:out.slice(0,120),candidates:cands};
  };

  C._t5Storage=S;
  try{S.cleanupKnown();}catch(e){}
})();
