/* Shise Test9 two-stage player patch
 * Current-site contract: video.html?id -> player.html?id -> .player-container src -> runtime media.
 */
(function(K,R){
if(!K||!R||String(R.version)!=='0.1.0-test.8')throw new Error('Shise Test9 base mismatch');
var C=K.C;
var oldModel=R.model;
function s(v){return v===undefined||v===null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function strip(v){return trim(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;|&apos;/ig,"'").replace(/&quot;/ig,'"').replace(/\s+/g,' '))}
function dh(h,q){try{return typeof pdfh==='function'?s(pdfh(s(h),q)||''):s(parseDomForHtml(s(h),q)||'')}catch(e){return''}}
function allAnchors(html,base){var out=[],re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m,u,t;while((m=re.exec(s(html)))){u=K.norm(m[1],base);t=strip(m[2]);if(u&&t)out.push({href:u,title:t})}return out}
function uniq(out,seen,x,key){key=key||x;if(x&&!seen[key]){seen[key]=1;out.push(x)}}
function videoId(url,html){var m=s(url).match(/[?&]id=([a-zA-Z0-9_-]+)/i);if(m)return m[1];m=s(html).match(/(?:video|player)\.html\?id=([a-zA-Z0-9_-]+)/i);return m?m[1]:''}
function playerPage(detailUrl,html){var id=videoId(detailUrl,html),m,u;if(id)return C.primary.replace(/\/$/,'')+'/player.html?id='+encodeURIComponent(id);m=s(html).match(/(?:href|src)=["']([^"']*player\.html\?id=[^"']+)["']/i);if(m){u=K.norm(m[1],detailUrl);if(u)return u}return''}
function playerBox(html){var box=dh(html,'.player-container&&Html');if(box)return box;var m=s(html).match(/<[^>]+class=["'][^"']*\bplayer-container\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);return m?m[1]:s(html)}
function embedUrls(html,base){
 var box=playerBox(html),out=[],seen={},patterns=[/<iframe\b[^>]*(?:src|data-src)=["']([^"']+)["']/ig,/<(?:video|source)\b[^>]*(?:src|data-src)=["']([^"']+)["']/ig,/(?:src|data-src)\s*=\s*["']([^"']+)["']/ig],i,re,m,u,l;
 for(i=0;i<patterns.length;i++){re=patterns[i];while((m=re.exec(box))&&out.length<10){u=K.norm(m[1],base);if(!u)continue;l=u.toLowerCase();if(/\.(?:jpg|jpeg|png|gif|webp|svg|css|js|woff2?|ttf)(?:[?#]|$)/i.test(l))continue;if(/favicon|logo|banner\.(?:jpg|png|gif|webp)/i.test(l))continue;uniq(out,seen,u,u)}}
 return out
}
function resolveChain(detailUrl){var detail=K.fetchPage(detailUrl),pp=playerPage(detail.url||detailUrl,detail.html),pr=pp?K.fetchPage(pp):{ok:false,html:'',url:''},embeds=pr&&pr.html?embedUrls(pr.html,pr.url||pp):[];return{detail:detail,player:pp,playerRes:pr,embeds:embeds}}
function sniffExtra(id){
 var excludes=['69lover','realsrv','doubleclick','googlesyndication','googleads','adservice','/upload/ad','/ads/','preroll','pre-roll','vast','banner','.jpg','.jpeg','.png','.gif','.webp','.svg','.css','.js','.woff','.woff2','.ttf','favicon'];
 var blocks=['.jpg','.jpeg','.png','.gif','.webp','.svg','.woff','.woff2','.ttf'];
 var js="(function(){function go(){try{var v=document.querySelector('video');if(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}var q=['.dplayer-play-icon','.plyr__control--overlaid','.vjs-big-play-button','.jw-icon-playback','.play-button','button[aria-label*=Play]'];for(var i=0;i<q.length;i++){var b=document.querySelector(q[i]);if(b){b.click();break}}}catch(e){}}setTimeout(go,350);setTimeout(go,1200);setTimeout(go,2500)})();";
 return{timeout:15000,videoRules:['s1.playhls.com/m3u8.php?','playhls.com/m3u8.php?','vodcdn.shise.me','play.shise.me','player.shise.me','xxw-oss.shise.me','.m3u8','.mp4'],videoExcludeRules:excludes,blockRules:blocks,js:js,cacheM3u8:true,id:id,onTimeout:'toast://播放器媒体请求解析超时'}
}
function sniffCard(title,desc,target,id,col){return{title:title,desc:desc,url:'video://'+target,col_type:col||'text_1',extra:sniffExtra(id)}}
function classifyMeta(html,base){
 var a=allAnchors(html,base),people=[],cats=[],series=[],tags=[],seenP={},seenC={},seenS={},seenT={},i,x,p,t,txt=strip(html),m,code='',date='';
 for(i=0;i<a.length;i++){
  x=a[i];p=K.pathOnly(x.href);t=trim(x.title).replace(/^[>›»]+|[>›»]+$/g,'').replace(/\s*\(\d+\)\s*$/,'');
  if(!t||t.length>32||/^(?:>|›|»|更多|展开|首页|播放|下载|推广)$/i.test(t))continue;
  if(/(?:\/models?\/|\/model-|\/stars?\/|\/actors?\/|\/actress|\/performers?\/|\/model\.html(?:\?|$)|\/actor\.html(?:\?|$))/i.test(p)){uniq(people,seenP,{title:t,href:x.href},t+'|'+x.href);continue}
  if(/\/series\.html\?id=/i.test(p)||/^\/videos\/series-/i.test(p)){
   if(/日本|有码|无码|中文|欧美|韩国|主播|探花|电影|动漫|情色|模特|业余|影片/i.test(t))uniq(cats,seenC,{title:t,href:x.href},t);else uniq(series,seenS,{title:t,href:x.href},t);continue
  }
  if(/\/videos\/(?:category|genre)-|\/genres?\//i.test(p)){uniq(cats,seenC,{title:t,href:x.href},t);continue}
  if(/\/videos\/(?:tag|label)-|\/tags?\//i.test(p)){uniq(tags,seenT,{title:t,href:x.href},t);continue}
 }
 m=txt.match(/\b([A-Z]{2,12}[-_ ]?\d{2,6})\b/i);if(m)code=m[1].replace(/[_ ]/g,'-').toUpperCase();
 m=txt.match(/\b(20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2})\b/);if(m)date=m[1].replace(/[\/-]/g,'.');
 var raw=K.tags?K.tags(html,base):[],r,junk=/^(?:>|›|»|更多|展开|标签|分类|系列|番号|日期|人物)$/i;
 for(i=0;i<raw.length;i++){r=raw[i];t=trim(r.title||'').replace(/^[>›»]+|[>›»]+$/g,'').replace(/\s*\(\d+\)\s*$/,'');if(!t||junk.test(t)||t.length>32||seenC[t]||seenS[t]||seenP[t]||/^\(?\d+\)?$/.test(t))continue;uniq(tags,seenT,{title:t,href:r.href||''},t)}
 return{people:people.slice(0,12),categories:cats.slice(0,12),series:series.slice(0,12),tags:tags.slice(0,18),code:code,date:date}
}
function metaButton(x){var p=K.pathOnly(x.href||''),u='hiker://empty',m;if(x.href&&/^\/videos\//.test(p))u=K.pageP('shiseCatalog',{ss_title:x.title,ss_path:K.tpl(p)});else if(x.href&&/\/series\.html\?id=/i.test(p)){m=p.match(/[?&]id=([^&#]+)/i);if(m)u=K.pageP('shiseCatalog',{ss_title:x.title,ss_path:'/series.html?id='+m[1]+'&page={page}'})}return K.small(x.title,u)}
function personUrl(x){return x.href?K.pageP('shiseModel',{ss_url:x.href,ss_title:x.title}):('hiker://search?s='+encodeURIComponent(x.title)+'&rule='+encodeURIComponent(C.ruleTitle))}
function directPersonPage(base,p){if(p<=1)return'';var u=s(base);if(!/[?&]id=[^&#]+/i.test(u))return'';if(/[?&]page=\d+/i.test(u))return u.replace(/([?&]page=)\d+/i,'$1'+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p}
var CURRENT_CATEGORIES=[['情色电影','61c4d9b653b6d'],['中文AV','63824a975d8ae'],['日本AV','6206216719462'],['模特私拍','6030196781d85'],['业余拍摄','617d3e7acdcc8'],['糖心Vlog','61014080dbfde'],['其他影片','60192e83c9e05']];
R.version='0.1.0-test.9';R.build=10109;
R.categories=function(){var d=[],i,x;setPageTitle('分类');d.push(K.section('内容分类','按当前视色 series.html?id=…&page=… 路由'));d.push({title:'全部内容',url:K.pageP('shiseCatalog',{ss_title:'全部内容',ss_path:'/videos/{page}.html'}),col_type:'flex_button',extra:{lineVisible:false}});for(i=0;i<CURRENT_CATEGORIES.length;i++){x=CURRENT_CATEGORIES[i];d.push({title:x[0],url:K.pageP('shiseCatalog',{ss_title:x[0],ss_path:'/series.html?id='+x[1]+'&page={page}'}),col_type:'flex_button',extra:{lineVisible:false}})}setResult(d)};
R.model=function(){var base=K.norm(K.param('ss_url',''),C.primary+'/'),p=K.pg(),target,r,name,xs,d=[],i;if(!base){setResult([K.empty('人物地址无效','')]);return}target=directPersonPage(base,p);if(!target){oldModel();return}r=K.fetchPage(target);name=K.param('ss_title','')||'人物详情';xs=(r&&r.html)?K.cards(r.html,r.url||target):[];if(p===1){setPageTitle(name);d.push(K.section('👤 '+name,'向下继续加载'))}if(xs.length){for(i=0;i<xs.length;i++)d.push(K.videoCard(xs[i]))}else d.push(K.empty('没有更多作品',(r&&r.url)||target));setResult(d)};
R.detail=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('详情地址无效','')]);return}
 var chain=resolveChain(u),r=chain.detail,info=K.detail(r.html,r.url),meta=classifyMeta(r.html,r.url),mods=meta.people,recs=K.cards(r.html,r.url),target=chain.embeds.length?chain.embeds[0]:chain.player,i,x,hero=[];
 setPageTitle(info.title);if(meta.code)hero.push(meta.code);if(meta.date)hero.push(meta.date);
 d.push({title:info.title,desc:hero.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
 if(target)d.push(sniffCard('▶ 立即播放',chain.embeds.length?'两级播放器链：player-container → 实际播放器':'未提取到内层 src，暂从 player.html 嗅探',target,u+'#embed','text_center_1'));else d.push({title:'▶ 播放链未解析',desc:'未取得 player.html / player-container src，请打开播放诊断',url:K.page('shiseMedia',{ss_url:u}),col_type:'text_center_1',extra:{lineVisible:false}});
 if(meta.code||meta.date){d.push(K.section('影片信息',''));if(meta.code)d.push({title:'编号　'+meta.code,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});if(meta.date)d.push({title:'日期　'+meta.date,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}})}
 if(mods.length){d.push(K.section('人物',''));for(i=0;i<mods.length;i++){x=mods[i];d.push(K.small(x.title,personUrl(x)))}}
 if(meta.categories.length){d.push(K.section('分类',''));for(i=0;i<meta.categories.length;i++)d.push(metaButton(meta.categories[i]))}
 if(meta.series.length){d.push(K.section('系列 / 厂牌',''));for(i=0;i<meta.series.length;i++)d.push(metaButton(meta.series[i]))}
 if(meta.tags.length){d.push(K.section('标签',''));for(i=0;i<meta.tags.length;i++)d.push(metaButton(meta.tags[i]))}
 if(info.intro){d.push(K.section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}})}
 if(recs.length){d.push(K.section('相关推荐',recs.length+' 条'));for(i=0;i<recs.length;i++)d.push(K.videoCard(recs[i]))}
 d.push(K.btn('播放诊断',K.page('shiseMedia',{ss_url:u}),'详情 → player.html → player-container src → 媒体请求'));d.push(K.btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(K.btn('原站','web://'+u));setResult(d)
};
R.media=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('播放地址无效','')]);return}
 var chain=resolveChain(u),i,target;setPageTitle('播放诊断');d.push(K.section('两级播放器链','当前公开规则：video.html?id → player.html?id → player-container src'));
 d.push({title:'① 详情页',desc:(chain.detail&&chain.detail.url)||u,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
 d.push({title:'② player.html',desc:chain.player||'未解析',url:chain.player?('web://'+chain.player):'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
 if(chain.embeds.length){d.push(K.section('③ 实际播放器 src','已提取 '+chain.embeds.length+' 个'));for(i=0;i<chain.embeds.length;i++){target=chain.embeds[i];d.push(sniffCard('▶ 嗅探内层播放器 '+(i+1),target,target,u+'#inner'+i,'text_1'))}}
 else d.push(K.empty('未提取到 player-container src','Test9 不再假定 player.html 本身就是最终播放器'));
 if(chain.player)d.push(sniffCard('🧩 回退：嗅探 player.html','仅用于对比；主路径优先内层 src',chain.player,u+'#player','text_1'));
 d.push(K.btn('原站','web://'+u));setResult(d)
};
R.settings=function(){var d=[],ck=K.cookie(C.primary);setPageTitle('视色设置');d.push(K.section('站点与验证',''));d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / 空列表时使用',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push(K.section('版本状态','Test 0.1.0-test.9 · Build 10109'));d.push({title:'本版修复',desc:'播放按当前站点两级合同重建：详情 video.html?id → player.html?id → player-container 内 src → 再嗅探真正 m3u8/mp4；不再在 player.html 提前结束。实际播放器阶段不再拦截广告脚本域，避免播放器初始化被 blockRules 自己破坏；只排除广告媒体候选。分类同步采用 series.html?id=&page= 路由。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});setResult(d)};
})(ShiseTest5Core,ShiseRemoteRuntime);
