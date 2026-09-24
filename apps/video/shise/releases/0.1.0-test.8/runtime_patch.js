/* Shise Test8 playback patch
 * Uses Hiker video:// videoRules to target Shise's playhls runtime endpoint.
 */
(function(K,R){
if(!K||!R||String(R.version)!=='0.1.0-test.7')throw new Error('Shise Test8 base mismatch');
var C=K.C;
function s(v){return v===undefined||v===null?'':String(v)}
function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
function strip(v){return trim(s(v).replace(/<script\b[\s\S]*?<\/script>/ig,' ').replace(/<style\b[\s\S]*?<\/style>/ig,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/ig,' ').replace(/&amp;/ig,'&').replace(/&#39;|&apos;/ig,"'").replace(/&quot;/ig,'"').replace(/\s+/g,' '))}
function allAnchors(html,base){var out=[],re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig,m,u,t;while((m=re.exec(s(html)))){u=K.norm(m[1],base);t=strip(m[2]);if(u&&t)out.push({href:u,title:t})}return out}
function uniq(out,seen,x,key){key=key||x;if(x&&!seen[key]){seen[key]=1;out.push(x)}}
function classifyMeta(html,base){
 var a=allAnchors(html,base),people=[],cats=[],series=[],tags=[],seenP={},seenC={},seenS={},seenT={},i,x,p,t,txt=strip(html),m,code='',date='';
 for(i=0;i<a.length;i++){
  x=a[i];p=K.pathOnly(x.href);t=trim(x.title).replace(/^[>›»]+|[>›»]+$/g,'').replace(/\s*\(\d+\)\s*$/,'');
  if(!t||t.length>32||/^(?:>|›|»|更多|展开|首页|播放|下载|推广)$/i.test(t))continue;
  if(/(?:\/models?\/|\/model-|\/stars?\/|\/actors?\/|\/actress|\/performers?\/)/i.test(p)){uniq(people,seenP,{title:t,href:x.href},t+'|'+x.href);continue}
  if(/^\/videos\/series-/i.test(p)){if(/日本|有码|无码|中文|欧美|韩国|主播|探花|电影|动漫|解说|亚洲|专题/i.test(t))uniq(cats,seenC,{title:t,href:x.href},t);else uniq(series,seenS,{title:t,href:x.href},t);continue}
  if(/\/videos\/(?:category|genre)-|\/genres?\//i.test(p)){uniq(cats,seenC,{title:t,href:x.href},t);continue}
  if(/\/videos\/(?:tag|label)-|\/tags?\//i.test(p)){uniq(tags,seenT,{title:t,href:x.href},t);continue}
 }
 m=txt.match(/\b([A-Z]{2,12}[-_ ]?\d{2,6})\b/i);if(m)code=m[1].replace(/[_ ]/g,'-').toUpperCase();
 m=txt.match(/\b(20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2})\b/);if(m)date=m[1].replace(/[\/-]/g,'.');
 return{people:people.slice(0,12),categories:cats.slice(0,12),series:series.slice(0,12),tags:tags.slice(0,18),code:code,date:date}
}
function metaButton(x){var p=K.pathOnly(x.href||''),u='hiker://empty';if(x.href&&/^\/videos\//.test(p))u=K.pageP('shiseCatalog',{ss_title:x.title,ss_path:K.tpl(p)});return K.small(x.title,u)}
function personUrl(x){return x.href?K.pageP('shiseModel',{ss_url:x.href,ss_title:x.title}):('hiker://search?s='+encodeURIComponent(x.title)+'&rule='+encodeURIComponent(C.ruleTitle))}
function extractPlayerPage(html,detailUrl){
 var h=s(html),m,u,id;
 m=h.match(/(?:src|href)=["']([^"']*player\.html\?id=[^"']+)["']/i);if(m){u=K.norm(m[1],detailUrl);if(u)return u}
 m=s(detailUrl).match(/[?&]id=([a-zA-Z0-9_-]+)/i)||s(detailUrl).match(/id-([a-zA-Z0-9_-]+)/i);if(m){id=m[1];return C.primary.replace(/\/$/,'')+'/player.html?id='+encodeURIComponent(id)}
 return detailUrl
}
function sniffExtra(id,exact){
 var excludes=['69lover','realsrv','doubleclick','googlesyndication','googleads','adservice','/upload/ad','/ads/','preroll','pre-roll','vast','banner'];
 var blocks=['69lover','realsrv','doubleclick','googlesyndication','googleads','adservice','/upload/ad','.jpg','.jpeg','.png','.gif','.webp','.woff','.woff2','.ttf'];
 var js="setTimeout(function(){try{var v=document.querySelector('video');if(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}var b=document.querySelector('.dplayer-play-icon,.plyr__control--overlaid,.vjs-big-play-button,.jw-icon-playback');if(b)b.click()}catch(e){}},300);";
 return{videoRules:exact?['s1.playhls.com/m3u8.php?']:['s1.playhls.com/m3u8.php?','.m3u8'],videoExcludeRules:excludes,blockRules:blocks,js:js,cacheM3u8:true,id:id}
}
function sniffItem(title,desc,target,id,exact){return{title:title,desc:desc,url:'video://'+target,col_type:'text_1',extra:sniffExtra(id,exact)}}
R.version='0.1.0-test.8';R.build=10108;
R.detail=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('详情地址无效','')]);return}
 var r=K.fetchPage(u),info=K.detail(r.html,r.url),meta=classifyMeta(r.html,r.url),mods=meta.people,recs=K.cards(r.html,r.url),playerPage=extractPlayerPage(r.html,r.url),i,x,hero=[];
 setPageTitle(info.title);if(meta.code)hero.push(meta.code);if(meta.date)hero.push(meta.date);
 d.push({title:info.title,desc:hero.join(' · '),img:info.img,pic_url:info.img,url:'hiker://empty',col_type:'movie_1_vertical_pic_blur',extra:{lineVisible:false}});
 d.push({title:'▶ 立即播放',desc:'精准嗅探 playhls 正片请求',url:'video://'+playerPage,col_type:'text_center_1',extra:sniffExtra(u+'#playhls',true)});
 if(meta.code||meta.date){d.push(K.section('影片信息',''));if(meta.code)d.push({title:'编号　'+meta.code,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});if(meta.date)d.push({title:'日期　'+meta.date,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}})}
 if(mods.length){d.push(K.section('人物',''));for(i=0;i<mods.length;i++){x=mods[i];d.push(K.small(x.title,personUrl(x)))}}
 if(meta.categories.length){d.push(K.section('分类',''));for(i=0;i<meta.categories.length;i++)d.push(metaButton(meta.categories[i]))}
 if(meta.series.length){d.push(K.section('系列 / 厂牌',''));for(i=0;i<meta.series.length;i++)d.push(metaButton(meta.series[i]))}
 if(meta.tags.length){d.push(K.section('标签',''));for(i=0;i<meta.tags.length;i++)d.push(metaButton(meta.tags[i]))}
 if(info.intro){d.push(K.section('简介',''));d.push({title:info.intro,url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}})}
 if(recs.length){d.push(K.section('相关推荐',recs.length+' 条'));for(i=0;i<recs.length;i++)d.push(K.videoCard(recs[i]))}
 d.push(K.btn('播放诊断',K.page('shiseMedia',{ss_url:u}),'精准 playhls / 详情页 / 宽松 HLS 三档'));d.push(K.btn('收藏','hiker://collection?rule='+encodeURIComponent(C.ruleTitle)));d.push(K.btn('原站','web://'+u));setResult(d)
};
R.media=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('播放地址无效','')]);return}
 var r=K.fetchPage(u),playerPage=extractPlayerPage(r.html,r.url),xs=K.media(r.html,r.url)||[],i;
 setPageTitle('播放诊断');d.push(K.section('精准嗅探','只接受公开视色规则长期使用的 playhls 媒体端点'));
 d.push(sniffItem('▶ 精准嗅探播放器页','videoRules: s1.playhls.com/m3u8.php?',playerPage,u+'#player',true));
 if(playerPage!==u)d.push(sniffItem('▶ 精准嗅探详情页','播放器页失败时测试详情页加载链',u,u+'#detail',true));
 d.push(K.section('兼容模式','精准端点仍失败时再测试'));
 d.push(sniffItem('🧩 宽松 HLS 嗅探','playhls + .m3u8，继续排除广告域名',playerPage,u+'#loose',false));
 if(xs.length){d.push(K.section('Test6 静态候选','仅诊断，不再作为默认播放'));for(i=0;i<xs.length;i++)d.push({title:'候选 '+(i+1),desc:xs[i],url:xs[i]+'#isVideo=true#',col_type:'text_1',extra:{lineVisible:false,id:u+'#static'+i}})}
 d.push(K.btn('原站','web://'+u));setResult(d)
};
R.settings=function(){var d=[],ck=K.cookie(C.primary);setPageTitle('视色设置');d.push(K.section('站点与验证',''));d.push({title:'打开当前线路完成 X5 验证',desc:'遇到 403 / 空列表时使用',url:'x5://'+C.primary+'/',col_type:'text_1',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});d.push(K.section('版本状态','Test 0.1.0-test.8 · Build 10108'));d.push({title:'本版修复',desc:'保留 Test7 人物分页与结构化元数据；播放改为海阔官方 video:// 自定义 videoRules 精准嗅探 s1.playhls.com/m3u8.php?，并通过 videoExcludeRules / blockRules 排除广告请求。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});setResult(d)};
})(ShiseTest5Core,ShiseRemoteRuntime);
