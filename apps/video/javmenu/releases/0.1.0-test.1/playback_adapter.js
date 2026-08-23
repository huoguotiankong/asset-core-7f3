/* JavMenu Playback Adapter 0.1.0-test.1 */
var JavMenuPlayback=(function(){
  var P={version:'0.1.0-test.1',build:10101};
  function C(){if(typeof JavMenuCore!=='object')throw new Error('JavMenuCore 未加载');return JavMenuCore;}
  P.media=function(url,ref){url=C().abs(url,ref);if(!url)return'';var hs=['Referer@'+C().s(ref||C().base+'/').replace(/;/g,'；；'),'User-Agent@'+C().ua.replace(/;/g,'；；')];return url+'#isVideo=true#;{'+hs.join('&&')+'}';};
  P.model=function(players,ref){var urls=[],names=[],headers=[],seen={},i,p,u;for(i=0;i<(players||[]).length;i++){p=players[i]||{};u=C().abs(p.url,ref);if(!u||seen[u])continue;seen[u]=1;urls.push(u+'#isVideo=true#');names.push(p.name||('线路 '+urls.length));headers.push({'Referer':ref,'User-Agent':C().ua});}if(!urls.length)return'';if(urls.length===1)return P.media(urls[0].replace('#isVideo=true#',''),ref);return JSON.stringify({urls:urls,names:names,headers:headers});};
  P.site=function(code,detailUrl,selected){var c=C(),url=detailUrl||c.detailUrl(code),u=c.abs(selected,url);if(u)return P.media(u,url);var h=c.fetchNetwork(url,9000),list=c.parsePlayer(h,url);if(!list.length){var wh=c.fetchWeb(url);list=c.parsePlayer(wh,url);}var out=P.model(list,url);if(out){c.diag('play-direct',url,true,'sources='+list.length);return out;}c.diag('play-fallback',url,false,'no structured source');return'video://'+url;};
  P.shared=function(provider,code){try{var manager='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/shared/jav-playback/manager.js?v=10004';require(manager,{headers:{'Cache-Control':'no-cache'}},10004);if(typeof JAVPlaybackManager==='undefined')return'toast://备用播放管理器未加载';var sdk=JAVPlaybackManager.load('stable');return sdk.resolve(provider,code);}catch(e){return'toast://'+provider+' 解析失败：'+String(e.message||e);}};
  return P;
})();
if(typeof $!=='undefined')$.exports=JavMenuPlayback;
