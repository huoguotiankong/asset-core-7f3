/* 色花堂 0.1.0-test.27 / Build 10127 - Guide native mobile-DOM parity with board cards */
var SeHuaTangPatchTest27=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var CACHE_TTL=180000;
function s(v){return v==null?'':String(v)}
function trim(v){return C.trim(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v27_'+mode}
function cacheKey(mode,p){return'sht_guide_render_v27_'+mode+'_'+Math.max(1,Number(p||1))}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function goodTitle(t){t=trim(t);return !!t&&t.length>=4&&t.length<=180&&!/本帖最后由.+编辑|^(查看帖子|查看|回复|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)&&!/^\d+$/.test(t)}
function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,t,u;while((m=re.exec(s(html)))!==null){u=C.abs(m[2]||m[3]||'',base);t=trim(C.strip(m[5]||''));out.push({href:u,text:t,index:m.index});if(out.length>20000)break}return out}
function fallbackItems(html,base){var a=anchors(html,base),map={},order=[],i,o,id,t,k,sc;for(i=0;i<a.length;i++){o=a[i];id=C.threadId(o.href);if(!id)continue;t=o.text;if(!goodTitle(t))continue;sc=Math.min(t.length,140)+(t.length>=10?30:0);k=String(id);if(!map[k]){map[k]={id:k,title:t,url:C.toMobile(o.href),titleIndex:o.index,score:sc,imgs:[],meta:{},summary:''};order.push(k)}else if(sc>map[k].score){map[k].title=t;map[k].url=C.toMobile(o.href);map[k].titleIndex=o.index;map[k].score=sc}}order.sort(function(a,b){return map[a].titleIndex-map[b].titleIndex});return order.map(function(k){return map[k]})}
function parseItems(m,html,base){var a=[],fn=m._debug&&m._debug.parseCardsV15;try{if(fn)a=fn(html,base,0)||[]}catch(e){a=[]}if(!a.length)a=fallbackItems(html,base);return a}
function stats(ctx,it){var t=C.strip(ctx),m,r='',l='',v='',all=[],re;if(it.title)t=t.replace(it.title,' ');if(it.meta&&it.meta.author)t=t.replace(it.meta.author,' ');m=t.match(/(?:回复|评论)[:：]?\s*(\d{1,7})/i);if(m)r=m[1];m=t.match(/(?:查看|浏览|观看)[:：]?\s*(\d{1,10})/i);if(m)v=m[1];m=t.match(/(?:点赞|赞)[:：]?\s*(\d{1,7})/i);if(m)l=m[1];if(!r||!v){re=/(?:^|\s)(\d{1,5})\s+(\d{1,5})\s+(\d{2,10})(?=\s|$)/g;while((m=re.exec(t))!==null)if(Number(m[3])>=Number(m[1]))all.push(m);if(all.length){m=all[all.length-1];if(!r)r=m[1];if(!l)l=m[2];if(!v)v=m[3]}}return{replies:r,likes:l,views:v}}
function attach(items,html){var i,it,st,en,ctx;for(i=0;i<(items||[]).length;i++){it=items[i];st=Number(it.titleIndex||0);en=i+1<items.length?Number(items[i+1].titleIndex||0):s(html).length;if(en<=st||en-st>90000)en=Math.min(s(html).length,st+65000);ctx=s(html).slice(st,en);it.stats=stats(ctx,it);it.summary=trim(s(it.summary||'').replace(/本帖最后由[^。\n]{0,120}编辑/gi,' ').replace(/^(?:\d+\s+){2,4}/,'').replace(/(?:回复|评论|查看|浏览|观看|点赞|赞)[:：]?\s*\d+/g,' ').replace(/\s+/g,' '));if(it.summary===it.title)it.summary='';if(it.summary.length>170)it.summary=it.summary.slice(0,170)+'…'}return items}
function previewCount(items){var n=0,i;for(i=0;i<(items||[]).length;i++)n+=(items[i].imgs||[]).length;return n}
function cacheRead(mode,p){var x='';try{x=getItem(cacheKey(mode,p),'')||''}catch(e){}if(!x)return null;try{var o=JSON.parse(x);if(!o||!o.ts||!o.items||new Date().getTime()-Number(o.ts)>CACHE_TTL)return null;return o}catch(e2){return null}}
function cacheWrite(mode,p,items){try{setItem(cacheKey(mode,p),JSON.stringify({ts:new Date().getTime(),items:items}))}catch(e){}}
function load(m,url,mode,p){var c=cacheRead(mode,p),html='',items=[],raw='',source='mobile-render';if(c&&c.items&&c.items.length)return{items:c.items,source:'cache'};
  html=C.renderList(url);items=attach(parseItems(m,html,url),html);
  if(!items.length){raw=C.fetchPage(url,false);items=attach(parseItems(m,raw,url),raw);source='mobile-fetch-fallback'}
  if(!items.length){var pc=C.toPc(url);raw=C.fetchPage(pc,true);items=attach(parseItems(m,raw,pc),raw);source='pc-fallback'}
  if(items.length)cacheWrite(mode,p,items);
  return{items:items,source:source}
}
function statText(x){x=x||{};var a=[];if(x.replies)a.push('💬 '+x.replies);if(x.likes)a.push('👍 '+x.likes);if(x.views)a.push('👁 '+x.views);return a.join('　')}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',title=(m.author||'发布者')+(m.role?' · '+m.role:''),desc=m.time||'';if(m.author||av||desc)d.push({title:title,desc:desc,img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v27_guide_author'}})}
function safeImgs(it,ref){var out=[],seen={},a=it.imgs||[],i,u,k;for(i=0;i<a.length&&out.length<3;i++){u=C.abs(a[i],ref);if(!u)continue;k=C.canonical(u);if(seen[k])continue;if(/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer/i.test(u))continue;seen[k]=1;out.push(u)}return out}
function previewRows(d,it,ref,u){var imgs=safeImgs(it,ref),j,p,ct;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(j=0;j<imgs.length;j++){p=C.imageUrl(imgs[j],ref);if(p)d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v27_guide_preview'}})}}
function statRow(d,it){var t=statText(it.stats);if(t)d.push({title:'',desc:t,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:'sht_v27_guide_stat'}})}
function guideNative(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),r=load(m,url,mode,p),items=r.items||[],i,it,u,pc=previewCount(items);
  setPageTitle(name);
  C.saveDiag('guide.native.v27',mode+' p='+p+' items='+items.length+' previews='+pc+' source='+r.source);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'第 '+p+' 页 · '+items.length+' 条主题'+(pc?' · '+pc+' 张预览图':'')));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){
    it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});
    authorRow(d,it,url);
    d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v27_guide_card'}});
    previewRows(d,it,url,u);
    statRow(d,it);
    d.push(C.line('sht_v27_guide_sep'));
  }
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));
  setResult(d)
}
function module(){
  var m=BASE.module(),oldForum=m.forum;
  m.version='0.1.0-test.27';m.build=10127;
  m.forum=function(){if(C.pageParam('sht_auto',''))return guideNative(m);return oldForum()};
  m._debug=m._debug||{};m._debug.guideNativeV27=guideNative;
  return m
}
var P={version:'0.1.0-test.27',build:10127,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
