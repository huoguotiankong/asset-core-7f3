/* 汤头条 0.1.0-test.4 Core / exact APK model adapters */
var TangTouTiaoCoreV013=(function(){
  var V='0.1.0-test.4';
  function text(v){return String(v==null?'':v).replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();}
  function maybeJson(v){if(typeof v!=='string')return v;var s=v.trim();if(!s)return v;if((s.charAt(0)==='{'&&s.charAt(s.length-1)==='}')||(s.charAt(0)==='['&&s.charAt(s.length-1)===']'))try{return JSON.parse(s);}catch(e){}return v;}
  function pick(o,keys,d){o=maybeJson(o);if(!o||typeof o!=='object')return d;for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!==undefined&&v!==null&&String(v)!=='')return v;}return d;}
  function dataOf(res){res=maybeJson(res);if(res==null)return null;return maybeJson(res.data!==undefined?res.data:res.result!==undefined?res.result:res);}
  function abs(u){u=String(u||'').trim();if(/^\/\//.test(u))return'https:'+u;return u;}
  function memberOf(x){var m=x&&x.member;return m&&typeof m==='object'?m:{};}
  function item(x){x=maybeJson(x)||{};var m=memberOf(x);return{
    id:String(pick(x,['id','mv_id','mvId','video_id','videoId','aid'],'')||''),
    title:text(pick(x,['title','mv_title','mvTitle','name'],'未命名')),
    cover:abs(pick(x,['thumb_cover','thumb_cover_str','thumb','cover','cover_url','coverUrl','img_url','imgUrl'],'')||''),
    author:text(pick(m,['nickname','username'],pick(x,['nickname','author','creator_name'],'')||'')),
    avatar:abs(pick(m,['thumb'],pick(x,['member_thumb','avatar'],'')||'')||''),
    desc:text(pick(x,['desc','description','intro'],'')||''),
    duration:text(pick(x,['duration_str','durationStr','duration'],'')||''),
    plays:text(pick(x,['count_play_str','views_count_str','count_play'],'')||''),
    comments:text(pick(x,['count_comment_str','count_comment'],'')||''),
    source240:abs(pick(x,['source_240','source240'],'')||''),
    source480:abs(pick(x,['source_480','source480'],'')||''),
    source720:abs(pick(x,['source_720','source720'],'')||''),
    source1080:abs(pick(x,['source_1080','source1080'],'')||''),
    preview:abs(pick(x,['preview_video','previewVideo'],'')||''),
    isPay:!!pick(x,['is_pay','isPay'],false),
    isFree:Number(pick(x,['isfree','is_free','isFree'],0)||0),
    raw:x
  };}
  function exactFeatured(res){var d=dataOf(res)||{},groups=Array.isArray(d.list)?d.list:[],out=[];for(var i=0;i<groups.length;i++){var g=maybeJson(groups[i])||{};var list=Array.isArray(g.list)?g.list:[];if(!list.length&&looksVideo(g))list=[g];for(var j=0;j<list.length;j++){var it=item(list[j]);if(it.id&&it.title&&it.title!=='未命名')out.push(it);}}try{var first=out[0]||{};setItem('ttt_last_featured_exact',JSON.stringify({groups:groups.length,videos:out.length,firstId:first.id||'',firstCover:!!first.cover,sources:[!!first.source240,!!first.source480,!!first.source720,!!first.source1080]}));}catch(e){}return out;}
  function looksVideo(x){return !!(x&&typeof x==='object'&&(x.id!=null||x.mv_id!=null)&&(x.title||x.thumb_cover||x.source_240));}
  function directList(res){var d=dataOf(res)||{};var list=Array.isArray(d.list)?d.list:Array.isArray(d.items)?d.items:Array.isArray(d)?d:[];var out=[];for(var i=0;i<list.length;i++){var x=list[i];if(x&&Array.isArray(x.list)){for(var j=0;j<x.list.length;j++){var a=item(x.list[j]);if(a.id||a.title!=='未命名')out.push(a);}}else{var it=item(x);if(it.id||it.title!=='未命名')out.push(it);}}return out;}
  function recursiveList(res){var root=dataOf(res),best=[];function walk(v,depth){v=maybeJson(v);if(depth>7||v==null)return;if(Array.isArray(v)){var score=0;for(var i=0;i<Math.min(v.length,5);i++)if(looksVideo(v[i]))score++;if(score&&v.length>best.length)best=v;for(var j=0;j<Math.min(v.length,3);j++)walk(v[j],depth+1);return;}if(typeof v==='object'){var ks=Object.keys(v);for(var k=0;k<ks.length;k++){var key=ks[k];if(/banner|ads|advert|widget/i.test(key))continue;walk(v[key],depth+1);}}}walk(root,0);var out=[];for(var i=0;i<best.length;i++){var it=item(best[i]);if(it.id||it.title!=='未命名')out.push(it);}return out;}
  function normalize(res,kind){if(kind==='featured'||kind==='video')return exactFeatured(res);if(kind==='search')return directList(res);var d=directList(res);return d.length?d:recursiveList(res);}
  function detailItem(res,fallback){var d=dataOf(res)||{};var raw=d&&d.detail&&typeof d.detail==='object'?d.detail:d&&d.mv&&typeof d.mv==='object'?d.mv:d;var it=item(raw);fallback=fallback||{};if(!it.id)it.id=String(fallback.id||'');if(!it.title||it.title==='未命名')it.title=text(fallback.title||'视频详情');if(!it.cover)it.cover=abs(fallback.cover||'');if(!it.author)it.author=text(fallback.author||'');['source240','source480','source720','source1080','preview'].forEach(function(k){if(!it[k]&&fallback[k])it[k]=String(fallback[k]);});return it;}
  function sources(it){var a=[];function add(name,u){u=String(u||'').trim();if(u)a.push({name:name,url:u});}add('1080P',it.source1080);add('720P',it.source720);add('480P',it.source480);add('240P',it.source240);if(!a.length)add('预览',it.preview);return a;}
  function enc(v){return encodeURIComponent(String(v==null?'':v));}
  function dec(v){v=String(v==null?'':v);try{if(/%[0-9A-Fa-f]{2}/.test(v))return decodeURIComponent(v);}catch(e){}return v;}
  function page(path,p){var u='hiker://page/'+path+'?rule=&simple=true',o=p||{};for(var k in o)if(o.hasOwnProperty(k)&&o[k]!=null&&String(o[k])!=='')u+='&'+enc(k)+'='+enc(o[k]);return u;}
  function param(n,d){try{var v=getParam(n);return v==null||v===''?d:dec(v);}catch(e){return d;}}
  function routeParams(it){return{id:it.id,title:it.title,cover:it.cover,author:it.author,s240:it.source240,s480:it.source480,s720:it.source720,s1080:it.source1080,preview:it.preview};}
  function addHistory(it){if(!it)return;var a=[];try{a=JSON.parse(getItem('ttt_history','[]')||'[]');}catch(e){}if(!Array.isArray(a))a=[];a=a.filter(function(x){return String(x.id)!==String(it.id);});a.unshift({id:it.id,title:it.title,cover:it.cover,author:it.author,source240:it.source240,source480:it.source480,source720:it.source720,source1080:it.source1080,time:Date.now()});if(a.length>80)a=a.slice(0,80);setItem('ttt_history',JSON.stringify(a));}
  function histories(){try{var a=JSON.parse(getItem('ttt_history','[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function toggleFav(it){var a=[];try{a=JSON.parse(getItem('ttt_favs','[]')||'[]');}catch(e){}if(!Array.isArray(a))a=[];var id=String(it.id||''),idx=-1;for(var i=0;i<a.length;i++)if(String(a[i].id)===id){idx=i;break;}if(idx>=0){a.splice(idx,1);setItem('ttt_favs',JSON.stringify(a));return false;}a.unshift({id:id,title:it.title,cover:it.cover,author:it.author,source240:it.source240,source480:it.source480,source720:it.source720,source1080:it.source1080,time:Date.now()});setItem('ttt_favs',JSON.stringify(a));return true;}
  function favs(){try{var a=JSON.parse(getItem('ttt_favs','[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function isFav(id){var a=favs();for(var i=0;i<a.length;i++)if(String(a[i].id)===String(id))return true;return false;}
  return{version:V,text:text,pick:pick,dataOf:dataOf,item:item,normalize:normalize,exactFeatured:exactFeatured,directList:directList,detailItem:detailItem,sources:sources,page:page,param:param,routeParams:routeParams,addHistory:addHistory,histories:histories,toggleFav:toggleFav,favs:favs,isFav:isFav};
})();
