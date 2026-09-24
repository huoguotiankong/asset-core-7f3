/* Shise Test11 anti-preroll smart webRule patch
 * Device evidence: Test10 reaches the real player chain but video:// returns a playable ~17s 69Lover preroll.
 * Strategy: use webRule polling, skip short playable ads, and only return media after the page transitions to a long-form/main stream.
 */
(function(K,R){
if(!K||!R||String(R.version)!=='0.1.0-test.10')throw new Error('Shise Test11 base mismatch');
var C=K.C;
function s(v){return v===undefined||v===null?'':String(v)}
function dh(h,q){try{return typeof pdfh==='function'?s(pdfh(s(h),q)||''):s(parseDomForHtml(s(h),q)||'')}catch(e){return''}}
function videoId11(url,html){var m,u=s(url),h=s(html);m=u.match(/[?&]id=([a-zA-Z0-9_-]+)/i);if(m)return m[1];m=u.match(/\/(?:video|player)\/id-([a-zA-Z0-9_-]+)\.html(?:[?#]|$)/i);if(m)return m[1];m=u.match(/\bid-([a-zA-Z0-9_-]+)\.html(?:[?#]|$)/i);if(m)return m[1];m=h.match(/(?:video|player)\.html\?id=([a-zA-Z0-9_-]+)/i);if(m)return m[1];m=h.match(/\/(?:video|player)\/id-([a-zA-Z0-9_-]+)\.html/i);return m?m[1]:''}
function playerPage11(detailUrl,html){var id=videoId11(detailUrl,html),m,u;if(id)return C.primary.replace(/\/$/,'')+'/player.html?id='+encodeURIComponent(id);m=s(html).match(/(?:href|src)=["']([^"']*player\.html\?id=[^"']+)["']/i);if(m){u=K.norm(m[1],detailUrl);if(u)return u}return''}
function playerBox11(html){var box=dh(html,'.player-container&&Html');if(box)return box;var m=s(html).match(/<[^>]+class=["'][^"']*\bplayer-container\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);return m?m[1]:s(html)}
function embedUrls11(html,base){var box=playerBox11(html),out=[],seen={},patterns=[/<iframe\b[^>]*(?:src|data-src)=["']([^"']+)["']/ig,/<(?:video|source)\b[^>]*(?:src|data-src)=["']([^"']+)["']/ig,/(?:src|data-src)\s*=\s*["']([^"']+)["']/ig],i,re,m,u,l;for(i=0;i<patterns.length;i++){re=patterns[i];while((m=re.exec(box))&&out.length<10){u=K.norm(m[1],base);if(!u)continue;l=u.toLowerCase();if(/\.(?:jpg|jpeg|png|gif|webp|svg|css|js|woff2?|ttf)(?:[?#]|$)/i.test(l))continue;if(/favicon|logo|banner\.(?:jpg|png|gif|webp)/i.test(l))continue;if(!seen[u]){seen[u]=1;out.push(u)}}}return out}
function resolveChain11(detailUrl){var detail=K.fetchPage(detailUrl),id=videoId11((detail&&detail.url)||detailUrl,(detail&&detail.html)||''),pp=playerPage11((detail&&detail.url)||detailUrl,(detail&&detail.html)||''),pr=pp?K.fetchPage(pp):{ok:false,html:'',url:''},embeds=pr&&pr.html?embedUrls11(pr.html,pr.url||pp):[];return{detail:detail,id:id,player:pp,playerRes:pr,embeds:embeds}}
function smartJs(){return $.toString(function(){
 try{
  var W=window,S=W.__SS_SMART||(W.__SS_SMART={start:Date.now(),base:{},adSeen:false,adSrc:{},mainSeen:false});
  function bad(u){u=String(u||'').toLowerCase();return !u||u.indexOf('blob:')===0||u.indexOf('data:')===0||/69lover|realsrv|doubleclick|googlesyndication|googleads|adservice|\/upload\/ad|\/ads\/|preroll|pre-roll|vast|banner/.test(u)}
  function media(u){u=String(u||'');return /\.m3u8(?:[?#]|$)|m3u8\.php\?|\.mp4(?:[?#]|$)/i.test(u)}
  function urls(){var a=[];try{if(typeof W._getUrls==='function')a=W._getUrls()||[]}catch(e){};if(!Array.isArray(a)){try{a=String(a||'').split(/\n|,/) }catch(e2){a=[]}}return a}
  var all=urls(),i,u;
  if(!S.init){S.init=true;for(i=0;i<all.length;i++){u=String(all[i]||'');if(media(u))S.base[u]=1}}
  var vs=document.querySelectorAll('video');
  for(i=0;i<vs.length;i++){
   var v=vs[i],d=Number(v.duration||0),src=String(v.currentSrc||v.src||'');
   try{v.muted=true;var pp=v.play();if(pp&&pp.catch)pp.catch(function(){})}catch(e3){}
   if(d>0&&isFinite(d)&&d<=45){S.adSeen=true;if(src)S.adSrc[src]=1;try{if(v.currentTime<d-0.25)v.currentTime=Math.max(0,d-0.12)}catch(e4){};continue}
   if((d>45||d===Infinity)&&v.readyState>=1){S.mainSeen=true;if(src&&!bad(src))return src}
  }
  var qs=['.skip-ad','.skip','.ad-skip','.skipAd','#skip','#skipAd','[class*=skip]','[id*=skip]','button'];
  for(i=0;i<qs.length;i++){var bs=document.querySelectorAll(qs[i]);for(var j=0;j<bs.length;j++){var tx=String(bs[j].innerText||bs[j].textContent||'');if(/跳过|关闭广告|skip\s*ad|skip/i.test(tx)){try{bs[j].click()}catch(e5){}}}}
  if(S.adSeen||S.mainSeen||Date.now()-S.start>2500){for(i=all.length-1;i>=0;i--){u=String(all[i]||'');if(!media(u)||bad(u)||S.base[u]||S.adSrc[u])continue;return u}}
  return'';
 }catch(e){return''}
})}
function smartCard(title,desc,target,referer,id,col){return{title:title,desc:desc,url:'webRule://'+target+'@'+smartJs(),col_type:col||'text_1',extra:{id:id,ua:C.ua,referer:referer||C.primary+'/'}}}
R.version='0.1.0-test.11';R.build=10111;
var oldDetail=R.detail;
R.detail=function(){
 var u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('详情地址无效','')]);return}
 var ch=resolveChain11(u),target=ch.embeds.length?ch.embeds[0]:ch.player;
 if(!target){oldDetail();return}
 var originalSet=setResult;
 try{
  setResult=function(arr){
   try{for(var i=0;i<arr.length;i++){var it=arr[i]||{},tt=s(it.title);if(/^▶\s*(?:立即播放|智能)/.test(tt)){arr[i]=smartCard('▶ 智能跳过广告播放','检测 ≤45 秒前置流并跳到结尾，等待正片媒体出现后再交付播放器',target,ch.player||((ch.detail&&ch.detail.url)||u),u+'#t11','text_center_1');break}}}catch(e){}
   return originalSet(arr)
  };
  oldDetail();
 }finally{setResult=originalSet}
};
R.media=function(){
 var d=[],u=K.norm(K.param('ss_url',''),C.primary+'/');if(!u){setResult([K.empty('播放地址无效','')]);return}
 var ch=resolveChain11(u),i,target;setPageTitle('播放诊断');d.push(K.section('Test11 前贴片过滤','Test10 已确认 video:// 会优先命中约 17 秒广告；本版改为 webRule 轮询后再返回正片'));
 d.push({title:'视频 ID',desc:ch.id||'未识别',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
 d.push({title:'player.html',desc:ch.player||'未解析',url:ch.player?('web://'+ch.player):'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
 if(ch.embeds.length){for(i=0;i<ch.embeds.length;i++){target=ch.embeds[i];d.push(smartCard('▶ 智能播放内层 '+(i+1),'跳过短广告后再返回正片\n'+target,target,ch.player,u+'#t11inner'+i,'text_1'))}}
 else if(ch.player)d.push(smartCard('▶ 智能播放 player.html','未提取内层 src 时直接在 player.html 等待正片',ch.player,(ch.detail&&ch.detail.url)||u,u+'#t11player','text_1'));
 if(ch.embeds.length)d.push({title:'🧪 原始自动嗅探（对照）',desc:'此项可能再次播放 17 秒广告，仅用于比较',url:'video://'+ch.embeds[0],col_type:'text_1',extra:{id:u+'#t11raw',videoRules:['s1.playhls.com/m3u8.php?','playhls.com/m3u8.php?','.m3u8','.mp4'],videoExcludeRules:['69lover','realsrv','doubleclick','googleads','preroll','vast','banner'],cacheM3u8:true}});
 d.push(K.btn('原站','web://'+u));setResult(d)
};
R.settings=function(){var d=[],ck=K.cookie(C.primary);setPageTitle('视色设置');d.push(K.section('版本状态','Test 0.1.0-test.11 · Build 10111'));d.push({title:'本版播放策略',desc:'Test10 已实机确认自动嗅探先命中约 17 秒 69Lover 广告。Test11 改用官方 webRule：每 250ms 检查页面，遇到 ≤45 秒视频主动推进到末尾；只有检测到长视频或广告之后新增的 HLS/MP4 请求才返回给播放器。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});d.push({title:'Cookie 状态',desc:ck?'已读取浏览器会话 Cookie':'当前未读取到 Cookie',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});setResult(d)};
})(ShiseTest5Core,ShiseRemoteRuntime);
