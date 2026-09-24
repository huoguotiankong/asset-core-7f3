/* Shise Test6 device-fix patch
 * Fixes: ad m3u8 selection, detail tags, people aggregation, live categories.
 */
(function(K,R){
if(!K||!R||String(R.version)!=='0.1.0-test.5')throw new Error('Shise Test6 base mismatch');
var C=K.C;
function s(v){return v===undefined||v===null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function strip(v){return trim(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/\s+/g,' '))}
function dh(h,q){try{return typeof pdfh==='function'?s(pdfh(s(h),q)||''):s(parseDomForHtml(s(h),q)||'')}catch(e){return''}}
function uniqPush(out,seen,x,key){key=key||x;if(x&&!seen[key]){seen[key]=1;out.push(x)}}
function allAnchors(html,base){var out=[],re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m,u,t;while((m=re.exec(s(html)))){u=K.norm(m[1],base);t=strip(m[2]);if(u&&t)out.push({href:u,title:t})}return out}
function liveTags(html,base){
 var out=[],seen={},boxes=[],sels=['.contentTag&&Html','.content-tag&&Html','.tags&&Html','.tag-list&&Html','.labels&&Html','.keywords&&Html'],i,j,a,x,m,kw;
 for(i=0;i<sels.length;i++){x=dh(html,sels[i]);if(x)boxes.push(x)}
 boxes.push(s(html));
 for(i=0;i<boxes.length;i++){
  a=allAnchors(boxes[i],base);
  for(j=0;j<a.length;j++){x=a[j];if(!/(?:\/videos\/(?:tag|series|category|genre|label)-|\/tags?\/|\/genres?\/)/i.test(K.pathOnly(x.href)))continue;if(x.title.length<1||x.title.length>28)continue;uniqPush(out,seen,{title:x.title,href:x.href},x.title)}
 }
 m=s(html).match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i)||s(html).match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords["']/i);
 if(m){kw=m[1].split(/[,，、|/]+/);for(i=0;i<kw.length;i++){x=trim(kw[i]);if(x&&x.length<28)uniqPush(out,seen,{title:x,href:''},x)}}
 return out.slice(0,30)
}
function peopleFromHtml(html,base,allowText){
 var out=[],seen={},a=allAnchors(html,base),i,x,p,box,re,m,t,parts,j;
 for(i=0;i<a.length;i++){x=a[i];p=K.pathOnly(x.href);if(!/(?:\/models?\/|\/model-|\/stars?\/|\/actors?\/|\/actress|\/performers?\/)/i.test(p))continue;if(x.title.length<1||x.title.length>30)continue;uniqPush(out,seen,{title:x.title,href:x.href,searchOnly:false},x.title+'|'+x.href)}
 if(!out.length||allowText){
  re=/<[^>]+class=["'][^"']*(?:model-container|model-item|models|actor|actress|performer|star|author|subs)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/ig;
  while((m=re.exec(s(html)))){box=m[1];a=allAnchors(box,base);for(i=0;i<a.length;i++){x=a[i];if(x.title.length<1||x.title.length>30)continue;uniqPush(out,seen,{title:x.title,href:x.href,searchOnly:false},x.title+'|'+x.href)}if(allowText){t=strip(box);parts=t.split(/[，,、|/·\s]+/);for(j=0;j<parts.length;j++){t=trim(parts[j]);if(t&&t.length>=2&&t.length<=20&&!/^\d+$/.test(t))uniqPush(out,seen,{title:t,href:'',searchOnly:true},'S|'+t)}}}
 }
 return out.slice(0,80)
}
function liveCategories(html,base){
 var out=[],seen={},a=allAnchors(html,base),i,x,p,tpl;
 uniqPush(out,seen,{title:'全部内容',path:'/videos/{page}.html'},'/videos/{page}.html');
 for(i=0;i<a.length;i++){x=a[i];p=K.pathOnly(x.href);if(!/^\/videos\//.test(p)||/^\/video(?:\/|-)/.test(p)||/keyword-/i.test(p))continue;if(!/(?:series|tag|category|genre|label)-/i.test(p))continue;tpl=K.tpl(p);if(tpl.indexOf('{page}')<0&&/\.html$/.test(tpl))tpl=tpl.replace(/\.html$/,'/{page}.html');if(x.title.length<1||x.title.length>28)continue;uniqPush(out,seen,{title:x.title,path:tpl},tpl)}
 return out.slice(0,120)
}
function getHeaders(url,ref){var h={'User-Agent':C.ua,'Referer':ref||K.origin(url)+'/'};try{var c=K.cookie(url)||K.cookie(ref||'');if(c)h.Cookie=c}catch(e){}return h}
function fetchText(url,ref){try{return s(fetch(url,{timeout:6500,headers:getHeaders(url,ref)}))}catch(e){return''}}
function sumExtinf(txt){var re=/#EXTINF:([0-9.]+)/ig,m,n=0;while((m=re.exec(s(txt))))n+=parseFloat(m[1])||0;return n}
function manifestDuration(url,ref){
 var txt=fetchText(url,ref),d=sumExtinf(txt),lines,i,u;if(d>0)return d;
 if(/#EXT-X-STREAM-INF/i.test(txt)){lines=txt.split(/\r?\n/);for(i=lines.length-1;i>=0;i--){u=trim(lines[i]);if(!u||u.charAt(0)==='#'||u.indexOf('.m3u8')<0)continue;u=K.norm(u,url);if(u){d=sumExtinf(fetchText(u,ref));if(d>0)return d}}}
 return 0
}
function collectM3u8(html,base,source,out,seen){
 var text=s(html),re=/["']([^"']*?\.m3u8(?:\?[^"']*)?)["']/ig,m,u,ctx,score,key;
 while((m=re.exec(text))){u=K.norm(m[1].replace(/\\\//g,'/').replace(/\\/g,''),base);if(!u)continue;key=u;if(seen[key])continue;ctx=text.substring(Math.max(0,m.index-260),Math.min(text.length,m.index+420)).toLowerCase();score=source==='iframe'?55:source==='main'?35:10;if(/player|source|file|video|hls|stream|playurl|play_url/.test(ctx))score+=25;if(/69lover|广告|advert|preroll|pre-roll|banner|promo|vast|doubleclick|googleads|ad[_-]?(?:url|src|video)|\bads?\b/.test(ctx+' '+u.toLowerCase()))score-=220;seen[key]=1;out.push({url:u,score:score,source:source,ctx:ctx})}
}
function mediaCandidates(html,pageUrl){
 var out=[],seen={},main=dh(html,'.main-container&&Html')||'',i,re,m,ifr=[],u,r,d;
 collectM3u8(main,pageUrl,'main',out,seen);collectM3u8(html,pageUrl,'page',out,seen);
 re=/<iframe\b[^>]*(?:src|data-src)=["']([^"']+)["']/ig;while((m=re.exec(s(html)))&&ifr.length<4){u=K.norm(m[1],pageUrl);if(u)ifr.push(u)}
 for(i=0;i<ifr.length;i++){r=K.fetchPage(ifr[i]);if(r&&r.html)collectM3u8(r.html,r.url||ifr[i],'iframe',out,seen)}
 out.sort(function(a,b){return b.score-a.score});
 for(i=0;i<Math.min(out.length,5);i++){d=manifestDuration(out[i].url,pageUrl);out[i].duration=d;if(d>300)out[i].score+=220;else if(d>120)out[i].score+=150;else if(d>60)out[i].score+=70;else if(d>0&&d<=45)out[i].score-=260}
 out.sort(function(a,b){if(b.score!==a.score)return b.score-a.score;return (b.duration||0)-(a.duration||0)});
 var good=[];for(i=0;i<out.length;i++){if(out[i].score>-80)good.push(out[i])}
 return good.slice(0,8)
}
function playDirect(url,ref){
 return $('#noLoading#').lazyRule(function(u,r,ua){try{if(typeof clearM3u8Ad==='function'){var h={'User-Agent':ua,'Referer':r};var x=clearM3u8Ad(u,{headers:h});if(x)return x}}catch(e){}return u+'#isVideo=true#';},url,K.origin(ref)+'/',C.ua)
}
function searchPerson(name){return'hiker://search?s='+encodeURIComponent(name)+'&rule='+encodeURIComponent(C.ruleTitle)}
K.tags=liveTags;
K.models=function(h,b){return peopleFromHtml(h,b,true)};
K.modelsFromBlock=function(h,b){return peopleFromHtml(h,b,false)};
K.media=function(h,u){var xs=mediaCandidates(h,u),o=[],i;for(i=0;i<xs.length;i++)o.push(xs[i].url);return o};
R.version='0.1.0-test.6';R.build=10106;
R.categories=function(){var d=[],r=K.fetchPage('/videos.html'),xs=liveCategories(r.html,r.url),i;setPageTitle('分类');d.push(K.section('内容分类',xs.length>1?'读取当前站点真实分类链接':'当前仅识别到全部内容'));for(i=0;i<xs.length;i++)d.push({title:xs[i].title,url:K.pageP('shiseCatalog',{ss_title:xs[i].title,ss_path:xs[i].path}),col_type:'flex_button',extra:{lineVisible:false}});setResult(d)};
R.models=function(){var d=[],p=K.pg(),r=K.fetchPage(K.listPath(p)),xs=peopleFromHtml(r.html,r.url,true),i,x;if(p===1){setPageTitle('人物');d.push(K.section('人物','读取当前视频页人物链接；无独立链接时自动转为人物关键词搜索'))}if(!xs.length)d.push(K.empty('当前页仍未识别到人物','继续保留分页，可下滑检查后续页'));for(i=0;i<xs.length;i++){x=xs[i];d.push({title:'👤 '+x.title,desc:x.searchOnly?'点击按人物名搜索作品':'查看人物相关作品',url:x.href?K.page('shiseModel',{ss_url:x.href,ss_title:x.title}):searchPerson(x.title),col_type:'text_2',extra:{lineVisible:false,pageTitle:x.title}})}setResult(d)};
R.detail=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('详情地址无效','')]);return}var r=K.fetchPage(u),info=K.detail(r.html,r.url),media=mediaCandidates(r.html,r.url),mods=peopleFromHtml(r.html,r.url,false),ts=liveTags(r.html,r.url),recs=K.cards(r.html,r.url),i,x,meta=[];setPageTitle(info.title);if(media.length)meta.push(media.length+' 条候选正片');if(ts.length)meta.push(ts.length+' 个标签');d.push({title:info.title,desc:meta.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
 if(media.length)d.push({title:'▶ 立即播放',desc:(media[0].duration?('探测时长约 '+Math.round(media[0].duration)+' 秒 · '):'')+'已过滤短广告候选',url:playDirect(media[0].url,r.url),col_type:'text_center_1',extra:{lineVisible:false}});else d.push({title:'▶ 未找到正片直链',desc:'不再自动嗅探，避免再次命中 16 秒广告；可在播放诊断页查看候选',url:K.page('shiseMedia',{ss_url:u}),col_type:'text_center_1',extra:{lineVisible:false}});
 if(mods.length){d.push(K.section('相关人物',''));for(i=0;i<mods.length;i++){x=mods[i];d.push(K.small(x.title,x.href?K.page('shiseModel',{ss_url:x.href,ss_title:x.title}):searchPerson(x.title)))}}
 if(ts.length){d.push(K.section('标签',''));for(i=0;i<ts.length;i++){x=ts[i];d.push(K.small(x.title,x.href&&/\/videos\//.test(K.pathOnly(x.href))?K.pageP('shiseCatalog',{ss_title:x.title,ss_path:K.tpl(K.pathOnly(x.href))}):'hiker://empty'))}}
 if(info.intro){d.push(K.section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}})}if(recs.length){d.push(K.section('相关推荐',recs.length+' 条'));for(i=0;i<recs.length;i++)d.push(K.videoCard(recs[i]))}d.push(K.btn('播放诊断',K.page('shiseMedia',{ss_url:u}),'候选地址 / 时长 / 来源'));d.push(K.btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(K.btn('原站','web://'+u));setResult(d)
};
R.media=function(){var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('播放地址无效','')]);return}var r=K.fetchPage(u),xs=mediaCandidates(r.html,r.url),i,x;setPageTitle('播放诊断');if(!xs.length){d.push(K.empty('没有找到可信正片 m3u8','Test6 已主动丢弃疑似短广告流；保留原站入口用于继续核对'));d.push(K.btn('原站','web://'+u));setResult(d);return}d.push(K.section('候选正片','按上下文 + m3u8 实际时长排序，45 秒以内候选降权'));for(i=0;i<xs.length;i++){x=xs[i];d.push({title:'▶ 候选 '+(i+1),desc:(x.duration?('约 '+Math.round(x.duration)+' 秒 · '):'时长未知 · ')+x.source+' · score '+x.score,url:playDirect(x.url,u),col_type:'text_1',extra:{lineVisible:false}})}d.push(K.btn('原站','web://'+u));setResult(d)};
R.settings=function(){var d=[],ck=K.cookie(C.primary);setPageTitle('视色设置');d.push(K.section('站点与验证',''));d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / 空列表时使用',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push(K.section('版本状态','Test 0.1.0-test.6 · Build 10106'));d.push({title:'本版修复',desc:'不再取第一个 m3u8：扫描主容器与 iframe，探测清单实际时长，短广告降权；标签增加 keywords/链接回退；人物增加多结构链接与关键词搜索回退；分类改为运行时读取当前站点真实分类。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});setResult(d)};
})(ShiseTest5Core,ShiseRemoteRuntime);
