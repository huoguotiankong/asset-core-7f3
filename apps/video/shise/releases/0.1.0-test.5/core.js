/* Shise Test5 Core */
var ShiseTest5Core=(function(){
var C={primary:'https://shise.me',ua:'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',cachePrefix:'shise_t5_',ruleTitle:'视色'};
var VIDEO_GROUPS={
'中文内容':[['麻豆传媒','/videos/series-5f904550b8fcc/{page}.html'],['独立创作者','/videos/series-61bf6e439fed6/{page}.html'],['蜜桃传媒','/videos/series-5fe8403919165/{page}.html'],['糖心Vlog','/videos/series-61014080dbfde/{page}.html'],['星空传媒','/videos/series-6054e93356ded/{page}.html'],['天美传媒','/videos/series-60153c49058ce/{page}.html'],['果冻传媒','/videos/series-5fe840718d665/{page}.html'],['精东影业','/videos/series-60126bcfb97fa/{page}.html'],['香蕉视频','/videos/series-65e5f74e4605c/{page}.html'],['爱豆传媒','/videos/series-63d134c7a0a15/{page}.html'],['杏吧原版','/videos/series-6072997559b46/{page}.html'],['IBiZa Media','/videos/series-64e9cce89da21/{page}.html'],['性视界','/videos/series-63490362dac45/{page}.html'],['大象传媒','/videos/series-65bcaa9688514/{page}.html'],['扣扣传媒','/videos/series-6230974ada989/{page}.html'],['ED Mosaic','/videos/series-63732f5c3d36b/{page}.html'],['SA国际传媒','/videos/series-633ef3ef07d33/{page}.html'],['其他中文内容','/videos/series-63986aec205d8/{page}.html'],['葫芦影业','/videos/series-6193d27975579/{page}.html'],['乌托邦','/videos/series-637750ae0ee71/{page}.html'],['爱神传媒','/videos/series-6405b6842705b/{page}.html'],['乐播传媒','/videos/series-60589daa8ff97/{page}.html'],['草莓视频','/videos/series-671ddc0b358ca/{page}.html'],['YOYO','/videos/series-64eda52c1c3fb/{page}.html'],['51吃瓜','/videos/series-671dd88d06dd3/{page}.html'],['哔哩传媒','/videos/series-64458e7da05e6/{page}.html'],['映秀传媒','/videos/series-6560dc053c99f/{page}.html'],['西瓜影视','/videos/series-648e1071386ef/{page}.html'],['思春社','/videos/series-64be8551bd0f1/{page}.html']],
'日本内容':[['有码','/videos/series-6395aba3deb74/{page}.html'],['无码','/videos/series-6395ab7fee104/{page}.html'],['解说','/videos/series-6608638e5fcf7/{page}.html']],
'现场内容':[['探花现场','/videos/series-63965bf7b7f51/{page}.html'],['主播现场','/videos/series-63965bd5335fc/{page}.html']],
'电影内容':[['华语电影','/videos/series-6396492fdb1a0/{page}.html'],['日韩电影','/videos/series-6396494584b57/{page}.html'],['欧美电影','/videos/series-63964959ddb1b/{page}.html']],
'其他内容':[['其他亚洲影片','/videos/series-63963ea949a82/{page}.html'],['其他欧美影片','/videos/series-6396404e6bdb5/{page}.html'],['事件专题','/videos/series-63963de3f2a0f/{page}.html'],['其他专题','/videos/series-66643478ceedd/{page}.html']]};
function s(v){return v===undefined||v===null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function decode(v){return s(v).replace(/&amp;/ig,'&').replace(/&quot;/ig,'"').replace(/&#39;|&apos;/ig,"'").replace(/&nbsp;/ig,' ').replace(/&#x2F;/ig,'/').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(parseInt(n,10))}catch(e){return _}})}
function strip(v){return trim(decode(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<br\s*\/?\s*>/ig,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n'))}
function safeDecode(v){var x=s(v),i;for(i=0;i<2;i++){try{var y=decodeURIComponent(x);if(y===x)break;x=y}catch(e){break}}return x}
function origin(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:C.primary}
function abs(u,base){u=safeDecode(decode(trim(u))).replace(/\\\//g,'/');base=base||C.primary;if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(/^javascript:/i.test(u)||/^data:/i.test(u)||u==='#')return'';var o=origin(base);if(u.charAt(0)==='/')return o+u;if(!/^https?:\/\//i.test(base))base=o+'/';return s(base).replace(/[?#].*$/,'').replace(/[^\/]*$/,'')+u}
function norm(v,base){var u=abs(v,base||C.primary+'/');return /^https?:\/\/[^\s]+/i.test(u)?u:''}
function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h)}
function cookie(url){var c='';try{if(typeof getCookie==='function')c=s(getCookie(url)||'')}catch(e){}if(!c)try{c=s(getCookie(origin(url)+'/')||'')}catch(e2){}return c}
function headers(url,ref){var h={'User-Agent':C.ua,'Accept-Language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','Referer':ref||origin(url)+'/'},c=cookie(url);if(c)h.Cookie=c;return h}
function image(u,ref){u=norm(u,ref||C.primary+'/');if(!u)return'';var h={'User-Agent':C.ua,'Referer':ref||C.primary+'/'},c=cookie(u);if(c)h.Cookie=c;return u+'@headers='+JSON.stringify(h)}
function bad(h){var x=s(h),l=x.toLowerCase();return x.length<160||/just a moment|cf-chl-|attention required|cloudflare ray id|access denied/.test(l)||/<title>403/i.test(x)}
function fetchPage(input){var url=norm(input,C.primary+'/'),html='',old='';if(!url)return{ok:false,html:'',url:s(input),invalid:true};try{html=s(fetch(url,{timeout:11000,headers:headers(url,origin(url)+'/')}))}catch(e){}if(!bad(html)){try{saveFile(C.cachePrefix+hash(url)+'.html',html)}catch(e2){}return{ok:true,html:html,url:url}}try{old=s(readFile(C.cachePrefix+hash(url)+'.html')||'')}catch(e3){}if(old&&!bad(old))return{ok:true,html:old,url:url,stale:true};try{if(typeof fetchCodeByWebView==='function')html=s(fetchCodeByWebView(url,{timeout:18000,headers:headers(url,origin(url)+'/'),blockRules:['.woff','.woff2','.ttf','.ico']})||'')}catch(e4){}return{ok:!bad(html),html:html,url:url,blocked:bad(html)}}
function da(h,q){try{return typeof pdfa==='function'?(pdfa(s(h),q)||[]):(parseDomForArray(s(h),q)||[])}catch(e){return[]}}
function dh(h,q){try{return typeof pdfh==='function'?s(pdfh(s(h),q)||''):s(parseDomForHtml(s(h),q)||'')}catch(e){return''}}
function du(h,q,b){try{return typeof pd==='function'?s(pd(s(h),q,b)||''):s(parseDom(s(h),q,b)||'')}catch(e){return''}}
function og(h,k){var m=s(h).match(new RegExp('<meta[^>]+(?:property|name)=["\\\']'+k+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'));return m?decode(m[1]):''}
function param(n,d){var v='';try{v=s(getParam(n,'')||'')}catch(e){}if(!v)try{var m=s(MY_URL).match(new RegExp('[?&]'+n+'=([^&#]*)'));if(m)v=m[1]}catch(e2){}v=safeDecode(v);return v!==''?v:(d||'')}
function pg(){try{return parseInt(MY_PAGE,10)||1}catch(e){return 1}}
function page(path,p){var a=['rule=','simple=true'],k;p=p||{};for(k in p)if(s(p[k])!=='')a.push(encodeURIComponent(k)+'='+encodeURIComponent(s(p[k])));return'hiker://page/'+path+'?'+a.join('&')}
function pageP(path,p){return page(path,p).replace('?rule=&simple=true','?rule=&page=fypage&simple=true')}
function section(t,d){return{title:'‘‘’’<b><font color="#7C3AED">'+t+'</font></b>',desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}}
function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}}}
function btn(t,u,d){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_4',extra:{lineVisible:false}}}
function small(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}}}
function listPath(p){p=parseInt(p,10)||1;return p===1?'/videos.html':'/videos/'+p+'.html'}
function searchPath(k,p){return'/videos/keyword-'+encodeURIComponent(trim(k))+'/'+(parseInt(p,10)||1)+'.html'}
function pathOnly(u){var m=s(u).match(/^https?:\/\/[^\/]+(\/[^#]*)?/i);return m?(m[1]||'/'):s(u)}
function tpl(p){p=pathOnly(p);if(p==='/videos.html')return'/videos/{page}.html';if(/\/\d+\.html$/.test(p))return p.replace(/\/\d+\.html$/,'/{page}.html');return p}
function resolve(t,p){p=parseInt(p,10)||1;t=safeDecode(t||'/videos/{page}.html');if(t.indexOf('{page}')>=0)return t.replace('{page}',String(p));return p<=1?t:t.replace(/\.html$/,'/'+p+'.html')}
function blocks(h){var a=da(h,'body&&.item.video');if(!a.length)a=da(h,'.item.video');return a}
function cssImg(b,base){var st=dh(b,'.img&&style'),m=st.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i),u=m?m[1]:'';if(!u)u=du(b,'img&&data-original',base)||du(b,'img&&data-src',base)||du(b,'img&&src',base);return norm(u,base)}
function cards(h,base){var bs=blocks(h),o=[],seen={},i,b,t,u,img,brief;for(i=0;i<bs.length;i++){b=bs[i];t=strip(dh(b,'.title&&Text')||dh(b,'a&&title'));u=norm(du(b,'a,0&&href',base)||du(b,'a&&href',base),base);if(!t||!u||seen[u])continue;seen[u]=1;img=cssImg(b,base);brief=strip(dh(b,'.brief&&Text')||dh(b,'.model-container&&Text'));o.push({title:t,href:u,img:image(img,base),brief:brief,block:b})}return o}
function videoCard(x){return{title:x.title,desc:x.brief||'',img:x.img||'',pic_url:x.img||'',url:page('shiseVideo',{ss_url:x.href}),col_type:'movie_3',extra:{lineVisible:false,pageTitle:x.title}}}
function modelsFromBlock(b,base){var m=s(b).match(/<[^>]+class=["'][^"']*\bmodel-container\b[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i),box=m?m[1]:'',o=[],re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,x,u,t;while((x=re.exec(box))){u=norm(x[1],base);t=strip(x[2]);if(u&&t)o.push({title:t,href:u})}return o}
function models(h,base){var cs=cards(h,base),o=[],seen={},i,j,xs,x;for(i=0;i<cs.length;i++){xs=modelsFromBlock(cs[i].block,base);for(j=0;j<xs.length;j++){x=xs[j];if(!seen[x.href]){seen[x.href]=1;o.push(x)}}}return o}
function title(h){return strip(dh(h,'.item,0&&.text&&Text')||dh(h,'.text&&Text')||dh(h,'.title&&Text')||og(h,'og:title'))||'内容详情'}
function detail(h,u){var im=du(h,'.cover&&img&&src',u)||og(h,'og:image'),intro=strip(dh(h,'.brief&&Text')||dh(h,'.description&&Text')||og(h,'og:description'));return{title:title(h),img:image(im,u),intro:intro}}
function tags(h,u){var box=dh(h,'.contentTag&&Html')||'',text=strip(dh(h,'.contentTag&&Text')||''),o=[],seen={},re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m,t,x,i,ps;while((m=re.exec(box))){t=strip(m[2]).replace(/^标签[:：]?\s*/,'');x=norm(m[1],u);if(t&&!seen[t]){seen[t]=1;o.push({title:t,href:x})}}if(text){text=text.replace(/^标签[:：]?\s*/,'');ps=text.split(/[\s,，、|/·]+/);for(i=0;i<ps.length;i++){t=trim(ps[i]);if(t&&t.length<25&&!seen[t]){seen[t]=1;o.push({title:t,href:''})}}}return o.slice(0,24)}
function media(h,u){var box=dh(h,'.main-container&&Html')||s(h),o=[],seen={},re=/['"]([^'"]*?\.m3u8\b[^'"]*)['"]/ig,m,x;while((m=re.exec(box))){x=norm(decode(m[1]).replace(/\\\//g,'/').replace(/\\/g,''),u);if(x&&!seen[x]){seen[x]=1;o.push(x)}}return o.slice(0,8)}
function direct(u){return s(u)+'#isVideo=true#'}
function header(u,p){var hs='Referer@'+origin(p)+'/&&User-Agent@'+C.ua,c=cookie(p)||cookie(u);if(c)hs+='&&Cookie@'+c;return s(u)+'#isVideo=true#;{'+hs+'}'}
return{C:C,G:VIDEO_GROUPS,s:s,trim:trim,origin:origin,norm:norm,cookie:cookie,fetchPage:fetchPage,param:param,pg:pg,page:page,pageP:pageP,section:section,empty:empty,btn:btn,small:small,listPath:listPath,searchPath:searchPath,pathOnly:pathOnly,tpl:tpl,resolve:resolve,cards:cards,videoCard:videoCard,modelsFromBlock:modelsFromBlock,models:models,detail:detail,tags:tags,media:media,direct:direct,header:header};
})();
