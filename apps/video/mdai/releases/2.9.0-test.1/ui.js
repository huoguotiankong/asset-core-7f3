/* 麻豆AI 2.9.0-test.1 - Native UI Design System */
var MDAIUIV290=(function(){
  var D={brand:'#7C3AED',brandSoft:'#F2ECFF',soft:'#F7F7F9',muted:'#7B7B86',line:'#EFEFF2',
    icon:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/mdai/assets/mdai_official.png',
    icons:{library:'hiker://files/rules/asset-core-local/mdai-test/assets/library.svg',fav:'hiker://files/rules/asset-core-local/mdai-test/assets/favorite.svg',history:'hiker://files/rules/asset-core-local/mdai-test/assets/history.svg',settings:'hiker://files/rules/asset-core-local/mdai-test/assets/settings.svg'}};
  function enc(v){return encodeURIComponent(String(v==null?'':v));}
  function qp(n,d){try{var v=getParam(n);return v==null||v===''?d:v;}catch(e){return d;}}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true';p=p||{};Object.keys(p).forEach(function(k){if(p[k]!=null&&String(p[k])!=='')u+='&'+enc(k)+'='+enc(p[k]);});return u;}
  function id(x){return x&&x.id!=null?x.id:(x&&x.videoId!=null?x.videoId:(x&&x.shortDramaId!=null?x.shortDramaId:''));}
  function title(c,x){return c.cleanText((x&&(x.title!=null?x.title:x.name))||'')||'未命名';}
  function cover(c,x){x=x||{};var imgs=Array.isArray(x.images)?x.images:[];return c.image(x.coverUrl||x.cover||x.image||x.picUrl||(imgs.length?imgs[0]:''));}
  function meta(c,x,type){x=x||{};var a=[];if(type==='drama'){var n=x.episodeCount!=null?x.episodeCount:(Array.isArray(x.episodes)?x.episodes.length:0);if(n)a.push(n+' 集');if(x.heatCount!=null)a.push('热度 '+c.compactNum(x.heatCount));if(x.rating!=null)a.push('评分 '+x.rating);}else if(type==='post'){if(x.categoryName)a.push(c.cleanText(x.categoryName));if(x.viewCount!=null)a.push('浏览 '+c.compactNum(x.viewCount));if(x.likeCount!=null)a.push('喜欢 '+c.compactNum(x.likeCount));}else{var du=c.fmtDuration(x.durationSec);if(du)a.push(du);if(x.viewCount!=null)a.push('播放 '+c.compactNum(x.viewCount));if(x.categoryName)a.push(c.cleanText(x.categoryName));}if(x.publishedAt)a.push(c.fmtDate(x.publishedAt).slice(5,10));return a.join(' · ');}
  function section(c,t,s,u){return{title:c.maskText(t)+(u?'  ›':''),desc:s?c.maskText(s):'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(){return{col_type:'line_blank'};}
  function blank(){return{col_type:'blank_block'};}
  function empty(t,d){return{title:t||'暂无内容',desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
  function detailUrl(c,x,type){return page('mdaiDetail',{id:id(x),type:type||'video',title:title(c,x),cover:cover(c,x)});}
  function card(c,x,type,col){var cv=cover(c,x);return{title:title(c,x),desc:meta(c,x,type),img:cv,pic_url:cv,url:detailUrl(c,x,type),col_type:col||(type==='drama'?'movie_3':(type==='post'?'movie_1_left_pic':'movie_2')),extra:{lineVisible:false}};}
  function localCard(c,x,col){x=x||{};var type=x.type||'video';return{title:x.title||'未命名',desc:x.desc||'',img:x.cover||'',pic_url:x.cover||'',url:page('mdaiDetail',{id:x.id||'',type:type,title:x.title||'',cover:x.cover||''}),col_type:col||(type==='drama'?'movie_3':'movie_2'),extra:{lineVisible:false}};}
  function seed(x){x=x||{};var o={},ks=['videoUrl','m3u8Url','hlsUrl','playUrl','sourceUrl','src','url'];for(var i=0;i<ks.length;i++)if(x[ks[i]]!=null&&String(x[ks[i]]).trim())o[ks[i]]=x[ks[i]];return JSON.stringify(o);}
  function chip(t,on,u,col){return{title:t,url:u,col_type:col||'flex_button',extra:{backgroundColor:on?D.brandSoft:'',lineVisible:false}};}
  function stateUrl(k,v){return $('#noLoading#').lazyRule(function(key,val){putMyVar(key,String(val));refreshPage(false);return'hiker://empty';},k,String(v));}
  function toggleUrl(k,v){return $('#noLoading#').lazyRule(function(key,val){if(getMyVar(key,'')===val)clearMyVar(key);else putMyVar(key,val);refreshPage(false);return'hiker://empty';},k,String(v));}
  function tab(d,k,label,value,def,col){var cur=getMyVar(k,def)||def;d.push(chip(label,cur===value,stateUrl(k,value),col||'text_4'));}
  function quick(d,t,img,u){d.push({title:t,img:img,url:u,col_type:'icon_small_4',extra:{lineVisible:false}});}
  function hero(c,x,type){var cv=cover(c,x);return{title:title(c,x),desc:meta(c,x,type),img:cv,pic_url:cv,url:detailUrl(c,x,type),col_type:type==='drama'?'movie_1_vertical_pic_blur':'movie_1_left_pic',extra:{gradient:type==='drama',lineVisible:false}};}
  return{version:'2.9.0-test.1',design:D,enc:enc,qp:qp,page:page,id:id,title:title,cover:cover,meta:meta,section:section,line:line,blank:blank,empty:empty,detailUrl:detailUrl,card:card,localCard:localCard,seed:seed,chip:chip,stateUrl:stateUrl,toggleUrl:toggleUrl,tab:tab,quick:quick,hero:hero};
})();
