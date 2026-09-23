/* 色花堂 0.1.0-test.29 / Build 10129 - Guide preview fallback from real thread pages, concurrent + cached */
var SeHuaTangPatchTest29=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var PAGE_CACHE_TTL=180000,PREVIEW_CACHE_TTL=43200000;
function s(v){return v==null?'':String(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v29_'+mode}
function pageCacheKey(mode,p){return'sht_guide_cards_v29_'+mode+'_'+Math.max(1,Number(p||1))}
function tidCacheKey(id){return'sht_guide_tid_preview_v29_'+String(id||'')}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function pageCacheRead(mode,p){var x='';try{x=getItem(pageCacheKey(mode,p),'')||''}catch(e){}if(!x)return null;try{var o=JSON.parse(x);if(!o||!o.ts||!o.items||new Date().getTime()-Number(o.ts)>PAGE_CACHE_TTL)return null;return o.items}catch(e2){return null}}
function pageCacheWrite(mode,p,items){try{setItem(pageCacheKey(mode,p),JSON.stringify({ts:new Date().getTime(),items:items}))}catch(e){}}
function tidCacheRead(id){var x='';try{x=getItem(tidCacheKey(id),'')||''}catch(e){}if(!x)return null;try{var o=JSON.parse(x);if(!o||!o.ts||!o.imgs||new Date().getTime()-Number(o.ts)>PREVIEW_CACHE_TTL)return null;return o}catch(e2){return null}}
function tidCacheWrite(id,o){try{setItem(tidCacheKey(id),JSON.stringify({ts:new Date().getTime(),imgs:o.imgs||[],ref:o.ref||''}))}catch(e){}}
function parseBase(m,html,base){var fn=m._debug&&m._debug.parseGuideV28,a=[];try{if(fn)a=fn(m,html,base)||[]}catch(e){a=[]}if(!a.length){var f2=m._debug&&m._debug.parseCardsV15;try{if(f2)a=f2(html,base,0)||[]}catch(e2){a=[]}}return a}
function baseLoad(m,url){var html=C.renderList(url),items=parseBase(m,html,url),source='guide-render';if(!items.length){html=C.fetchPage(url,false);items=parseBase(m,html,url);source='guide-fetch'}if(!items.length){var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseBase(m,html,pc);source='pc-fallback'}return{items:items,source:source}}
function taskFetchPreview(p){
  function sv(v){return v==null?'':String(v)}
  function hd(v){return sv(v).replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')}
  function av(tag,n){var m=sv(tag).match(new RegExp('\\b'+n+'\\s*=\\s*(["\\\'])(.*?)\\1','i'));return m?hd(m[2]):''}
  function abs(u,b,o){u=hd(sv(u)).replace(/^\s+|\s+$/g,'');if(!u||/^data:|^blob:/i.test(u))return'';if(/^https?:\/\//i.test(u))return u;if(/^\/\//.test(u))return'https:'+u;if(u.charAt(0)==='/')return o+u;var z=sv(b).split('#')[0].split('?')[0];if(z.charAt(z.length-1)!=='/')z=z.replace(/\/[^\/]*$/,'/');return z+u.replace(/^\.\//,'')}
  function bad(u){return !u||/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer|banner|\/ad[sx]?\//i.test(u)}
  function canon(u){return sv(u).replace(/[?#].*$/,'')}
  function bodySlice(h){var x=sv(h),lo=x.toLowerCase(),marks=['id="postmessage_','id=\'postmessage_','class="t_f','class=\'t_f','class="message','class=\'message','class="pcb','class=\'pcb'],st=-1,i,q,en=-1,next=['id="post_','id=\'post_','class="plc','class=\'plc','class="reply','class=\'reply'];for(i=0;i<marks.length;i++){q=lo.indexOf(marks[i]);if(q>=0&&(st<0||q<st))st=q}if(st<0)st=0;for(i=0;i<next.length;i++){q=lo.indexOf(next[i],st+2000);if(q>st&&(en<0||q<en))en=q}if(en<0||en-st>220000)en=Math.min(x.length,st+220000);return x.slice(st,en)}
  function collect(h,b,o){var x=bodySlice(h),out=[],seen={},re=/<img\b[^>]*>/gi,m,tag,u,ns=['zoomfile','file','data-original','data-src','data-lazy-src','data-echo','data-url','data-actual','data-cfsrc','src'],i,ss,aRe,aM;function add(v,tag0){v=abs(v,b,o);if(!v||bad(v))return;var k=canon(v);if(!k||seen[k])return;var wm=sv(tag0).match(/\bwidth\s*=\s*["']?(\d+)/i),hm=sv(tag0).match(/\bheight\s*=\s*["']?(\d+)/i);if(wm&&hm&&Number(wm[1])<=100&&Number(hm[1])<=100)return;seen[k]=1;out.push(v)}while((m=re.exec(x))!==null&&out.length<3){tag=m[0];u='';for(i=0;i<ns.length;i++){u=av(tag,ns[i]);if(u&&!bad(u)){add(u,tag);if(out.length)break}}if(out.length>=3)break;ss=av(tag,'srcset');if(ss)add(ss.split(',')[0].split(/\s+/)[0],tag)}if(out.length<3){aRe=/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>/gi;while((aM=aRe.exec(x))!==null&&out.length<3){u=hd(aM[2]||'');if(/\.(?:jpe?g|png|webp)(?:[?#]|$)|\/data\/attachment\//i.test(u))add(u,aM[0])}}return out}
  var h='',imgs=[];try{h=sv(fetch(p.url,{headers:p.headers,timeout:12000}));imgs=collect(h,p.url,p.origin)}catch(e){}
  return{id:p.id,imgs:imgs,ref:p.url,len:h.length}
}
function enrichFromThreads(items){var tasks=[],results=[],i,it,cached,need=0,hit=0;for(i=0;i<(items||[]).length;i++){it=items[i];if((it.imgs||[]).length){it.previewRef=it.url||'';continue}cached=tidCacheRead(it.id);if(cached&&cached.imgs&&cached.imgs.length){it.imgs=cached.imgs.slice(0,3);it.previewRef=cached.ref||it.url||'';hit++;continue}tasks.push({func:taskFetchPreview,param:{id:String(it.id||''),url:C.toMobile(it.url),origin:C.origin(),headers:C.headers(false,C.toMobile(it.url))},id:String(it.id||i)});need++}
  if(tasks.length){try{be(tasks,{func:function(o,id,error,taskResult){if(taskResult)o.results.push(taskResult)},param:{results:results}})}catch(e){try{batchExecute(tasks,{func:function(o,id,error,taskResult){if(taskResult)o.results.push(taskResult)},param:{results:results}})}catch(e2){results=[]}}}
  var map={},r;for(i=0;i<results.length;i++){r=results[i]||{};if(!r.id)continue;map[String(r.id)]=r;if(r.imgs&&r.imgs.length)tidCacheWrite(r.id,r)}for(i=0;i<(items||[]).length;i++){it=items[i];r=map[String(it.id||'')];if(r&&r.imgs&&r.imgs.length){it.imgs=r.imgs.slice(0,3);it.previewRef=r.ref||it.url||''}}
  return{items:items,requested:need,cached:hit,resolved:results.length}
}
function previewCount(a){var n=0,i;for(i=0;i<(a||[]).length;i++)n+=(a[i].imgs||[]).length;return n}
function statText(x){x=x||{};var a=[];if(x.replies)a.push('💬 '+x.replies);if(x.likes)a.push('👍 '+x.likes);if(x.views)a.push('👁 '+x.views);return a.join('　')}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',title=(m.author||'发布者')+(m.role?' · '+m.role:''),desc=m.time||'';if(m.author||av||desc)d.push({title:title,desc:desc,img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v29_guide_author'}})}
function previewRows(d,it,guideRef,u){var imgs=it.imgs||[],j,p,ct,ref=it.previewRef||it.url||guideRef;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(j=0;j<imgs.length&&j<3;j++){p=C.imageUrl(imgs[j],ref);if(p)d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v29_guide_preview'}})}}
function statRow(d,it){var t=statText(it.stats);if(t)d.push({title:'',desc:t,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:'sht_v29_guide_stat'}})}
function guideNative(m){var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),items=pageCacheRead(mode,p),src='page-cache',e,i,it,u,pc;if(!items){var b=baseLoad(m,url);items=b.items||[];src=b.source;e=enrichFromThreads(items);items=e.items||[];src+=' + thread-preview '+e.requested+'req/'+e.cached+'cache';if(items.length)pageCacheWrite(mode,p,items)}pc=previewCount(items);setPageTitle(name);C.saveDiag('guide.native.v29',mode+' p='+p+' items='+items.length+' previews='+pc+' source='+src);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());d.push(C.section(name,'第 '+p+' 页 · '+items.length+' 条主题'+(pc?' · '+pc+' 张预览图':'')));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});authorRow(d,it,url);d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v29_guide_card'}});previewRows(d,it,url,u);statRow(d,it);d.push(C.line('sht_v29_guide_sep'))}
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));setResult(d)}
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.29';m.build=10129;m.forum=function(){if(C.pageParam('sht_auto',''))return guideNative(m);return oldForum()};m._debug=m._debug||{};m._debug.guideNativeV29=guideNative;return m}
var P={version:'0.1.0-test.29',build:10129,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
