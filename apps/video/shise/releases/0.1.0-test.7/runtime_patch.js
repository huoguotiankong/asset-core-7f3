/* Shise Test7 focused patch
 * Fixes: paginated person detail and structured detail metadata.
 * Playback candidate selection remains delegated to Test6 K.media/R.media.
 */
(function(K,R){
if(!K||!R||String(R.version)!=='0.1.0-test.6')throw new Error('Shise Test7 base mismatch');
var C=K.C;
function s(v){return v===undefined||v===null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function strip(v){return trim(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;|&apos;/ig,"'").replace(/&quot;/ig,'"').replace(/\s+/g,' '))}
function allAnchors(html,base){var out=[],re=/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/ig,m,u,t;while((m=re.exec(s(html)))){u=K.norm(m[2],base);t=strip(m[4]);if(u&&t)out.push({href:u,title:t,attrs:(m[1]+' '+m[3]),raw:m[0]})}return out}
function uniq(out,seen,x,key){key=key||x;if(x&&!seen[key]){seen[key]=1;out.push(x)}}
function samePath(a,b){return K.pathOnly(a).replace(/[?#].*$/,'')===K.pathOnly(b).replace(/[?#].*$/,'')}
function nextHref(html,base){var a=allAnchors(html,base),i,x;for(i=0;i<a.length;i++){x=a[i];if(/(?:^|\s)next(?:\s|$)/i.test(x.attrs)||/下一页|下页|next|›|»/i.test(x.title))return x.href}for(i=0;i<a.length;i++){x=a[i];if(/^2$/.test(x.title))return x.href}return''}
function derivePageUrl(base,next,p){if(p<=1)return base;if(!next)return'';var u=next,n=String(p);if(/([?&](?:page|p)=)2(?:&|$)/i.test(u))return u.replace(/([?&](?:page|p)=)2(?=(&|$))/i,'$1'+n);if(/\/2\.html(?:[?#].*)?$/i.test(u))return u.replace(/\/2\.html([?#].*)?$/i,'/'+n+'.html$1');if(/\/page\/2(?:[\/?#]|$)/i.test(u))return u.replace(/\/page\/2(?=([\/?#]|$))/i,'/page/'+n);if(/-2\.html(?:[?#].*)?$/i.test(u))return u.replace(/-2\.html([?#].*)?$/i,'-'+n+'.html$1');return p===2?u:''}
function fetchPersonPage(base,p){
 var first=K.fetchPage(base),next,target,cur,i,r;
 if(p<=1)return first;
 next=nextHref(first.html,first.url||base);target=derivePageUrl(base,next,p);
 if(target)return K.fetchPage(target);
 cur=first;
 for(i=2;i<=p;i++){
  next=nextHref(cur.html,cur.url||base);if(!next)return{ok:false,html:'',url:(cur.url||base),noMore:true};
  r=K.fetchPage(next);if(!r||!r.html||samePath(r.url||next,cur.url||''))return{ok:false,html:'',url:next,noMore:true};cur=r;
 }
 return cur;
}
function classifyMeta(html,base){
 var a=allAnchors(html,base),people=[],cats=[],series=[],tags=[],seenP={},seenC={},seenS={},seenT={},i,x,p,t,txt=strip(html),m,code='',date='';
 for(i=0;i<a.length;i++){
  x=a[i];p=K.pathOnly(x.href);t=trim(x.title).replace(/^[>›»]+|[>›»]+$/g,'');
  if(!t||t.length>32||/^(?:>|›|»|更多|展开|首页|播放|下载|推广)$/i.test(t))continue;
  if(/(?:\/models?\/|\/model-|\/stars?\/|\/actors?\/|\/actress|\/performers?\/)/i.test(p)){uniq(people,seenP,{title:t,href:x.href},t+'|'+x.href);continue}
  if(/^\/videos\/series-/i.test(p)){
   if(/日本|有码|无码|中文|欧美|韩国|主播|探花|电影|动漫|解说|亚洲|专题/i.test(t))uniq(cats,seenC,{title:t,href:x.href},t);
   else uniq(series,seenS,{title:t,href:x.href},t);
   continue;
  }
  if(/\/videos\/(?:category|genre)-|\/genres?\//i.test(p)){uniq(cats,seenC,{title:t,href:x.href},t);continue}
  if(/\/videos\/(?:tag|label)-|\/tags?\//i.test(p)){uniq(tags,seenT,{title:t,href:x.href},t);continue}
 }
 m=txt.match(/\b([A-Z]{2,12}[-_ ]?\d{2,6})\b/i);if(m)code=m[1].replace(/[_ ]/g,'-').toUpperCase();
 m=txt.match(/\b(20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2})\b/);if(m)date=m[1].replace(/[\/-]/g,'.');
 var raw=K.tags?K.tags(html,base):[],r,junk=/^(?:>|›|»|更多|展开|标签|分类|系列|番号|日期|人物)$/i;
 for(i=0;i<raw.length;i++){r=raw[i];t=trim(r.title||'').replace(/^[>›»]+|[>›»]+$/g,'');if(!t||junk.test(t)||t.length>32)continue;if(seenC[t]||seenS[t]||seenP[t])continue;if(/^\(?\d+\)?$/.test(t))continue;uniq(tags,seenT,{title:t,href:r.href||''},t)}
 return{people:people.slice(0,12),categories:cats.slice(0,12),series:series.slice(0,12),tags:tags.slice(0,18),code:code,date:date};
}
function metaButton(x){var p=K.pathOnly(x.href||'');var u='hiker://empty';if(x.href&&/^\/videos\//.test(p))u=K.pageP('shiseCatalog',{ss_title:x.title,ss_path:K.tpl(p)});return K.small(x.title,u)}
function playDirect7(url,ref){return $('#noLoading#').lazyRule(function(u,r,ua){try{if(typeof clearM3u8Ad==='function'){var h={'User-Agent':ua,'Referer':r};var x=clearM3u8Ad(u,{headers:h});if(x)return x}}catch(e){}return u+'#isVideo=true#';},url,K.origin(ref)+'/',C.ua)}
function personUrl(x){return x.href?K.pageP('shiseModel',{ss_url:x.href,ss_title:x.title}):('hiker://search?s='+encodeURIComponent(x.title)+'&rule='+encodeURIComponent(C.ruleTitle))}
R.version='0.1.0-test.7';R.build=10107;
R.models=function(){var d=[],p=K.pg(),r=K.fetchPage(K.listPath(p)),xs=K.models(r.html,r.url),i,x;if(p===1){setPageTitle('人物');d.push(K.section('人物','从当前视频页提取 · 人物详情支持继续下滑分页'))}if(!xs.length)d.push(K.empty('当前页没有识别到人物',r.url));else for(i=0;i<xs.length;i++){x=xs[i];d.push({title:'👤 '+x.title,desc:x.searchOnly?'按人物名搜索相关作品':'查看人物全部作品',url:personUrl(x),col_type:'text_2',extra:{lineVisible:false,pageTitle:x.title}})}setResult(d)};
R.model=function(){
 var d=[],base=K.norm(K.param('ss_url',''),C.primary+'/'),p=K.pg();if(!base){setResult([K.empty('人物地址无效','')]);return}
 var r=fetchPersonPage(base,p),name=K.param('ss_title','')||'人物详情',xs=(r&&r.html)?K.cards(r.html,r.url||base):[],i;
 if(p===1){setPageTitle(name);d.push(K.section('👤 '+name,xs.length?'第 1 页 · '+xs.length+' 条 · 向下继续加载':'人物详情'))}
 if(xs.length){for(i=0;i<xs.length;i++)d.push(K.videoCard(xs[i]))}
 else d.push(K.empty(r&&r.noMore?'没有更多作品':'当前页没有解析到作品',(r&&r.url)||base));
 setResult(d)
};
R.detail=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('详情地址无效','')]);return}
 var r=K.fetchPage(u),info=K.detail(r.html,r.url),ms=K.media(r.html,r.url),meta=classifyMeta(r.html,r.url),mods=meta.people,recs=K.cards(r.html,r.url),i,x,hero=[];
 setPageTitle(info.title);if(meta.code)hero.push(meta.code);if(meta.date)hero.push(meta.date);if(ms.length)hero.push(ms.length+' 条候选正片');
 d.push({title:info.title,desc:hero.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
 if(ms.length)d.push({title:'▶ 立即播放',desc:'沿用 Test6 广告候选过滤；播放链本轮不改',url:playDirect7(ms[0],r.url),col_type:'text_center_1',extra:{lineVisible:false}});else d.push({title:'▶ 未找到可信正片',desc:'播放问题将在下一轮单独处理',url:K.page('shiseMedia',{ss_url:u}),col_type:'text_center_1',extra:{lineVisible:false}});
 if(meta.code||meta.date){d.push(K.section('影片信息',''));if(meta.code)d.push({title:'编号　'+meta.code,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});if(meta.date)d.push({title:'日期　'+meta.date,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}})}
 if(mods.length){d.push(K.section('人物',''));for(i=0;i<mods.length;i++){x=mods[i];d.push(K.small(x.title,personUrl(x)))}}
 if(meta.categories.length){d.push(K.section('分类',''));for(i=0;i<meta.categories.length;i++)d.push(metaButton(meta.categories[i]))}
 if(meta.series.length){d.push(K.section('系列 / 厂牌',''));for(i=0;i<meta.series.length;i++)d.push(metaButton(meta.series[i]))}
 if(meta.tags.length){d.push(K.section('标签',''));for(i=0;i<meta.tags.length;i++)d.push(metaButton(meta.tags[i]))}
 if(info.intro){d.push(K.section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}})}
 if(recs.length){d.push(K.section('相关推荐',recs.length+' 条'));for(i=0;i<recs.length;i++)d.push(K.videoCard(recs[i]))}
 d.push(K.btn('播放诊断',K.page('shiseMedia',{ss_url:u}),'沿用 Test6 候选诊断'));d.push(K.btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(K.btn('原站','web://'+u));setResult(d)
};
R.settings=function(){var d=[],ck=K.cookie(C.primary);setPageTitle('视色设置');d.push(K.section('站点与验证',''));d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / 空列表时使用',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push(K.section('版本状态','Test 0.1.0-test.7 · Build 10107'));d.push({title:'本版修复',desc:'人物详情改为 page=fypage 并根据原站 next/数字分页自动继续加载；详情信息拆为人物、分类、系列/厂牌、编号、日期和普通标签。播放链保持 Test6，下一轮单独处理。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});setResult(d)};
})(ShiseTest5Core,ShiseRemoteRuntime);
