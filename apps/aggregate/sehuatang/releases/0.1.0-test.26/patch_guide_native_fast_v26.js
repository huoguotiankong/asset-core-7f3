/* 色花堂 0.1.0-test.26 / Build 10126 - restore native Guide cards, fast mobile fetch first */
var SeHuaTangPatchTest26=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
function s(v){return v==null?'':String(v)}
function trim(v){return C.trim(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v26_'+mode}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function goodTitle(t){t=trim(t);return !!t&&t.length>=4&&t.length<=180&&!/本帖最后由.+编辑|^(查看帖子|查看|回复|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)&&!/^\d+$/.test(t)}
function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,t,u;while((m=re.exec(s(html)))!==null){u=C.abs(m[2]||m[3]||'',base);t=trim(C.strip(m[5]||''));out.push({href:u,text:t,index:m.index});if(out.length>20000)break}return out}
function fallbackItems(html,base){var a=anchors(html,base),map={},order=[],i,o,id,t,k,sc;for(i=0;i<a.length;i++){o=a[i];id=C.threadId(o.href);if(!id)continue;t=o.text;if(!goodTitle(t))continue;sc=Math.min(t.length,140)+(t.length>=10?30:0);k=String(id);if(!map[k]){map[k]={id:k,title:t,url:C.toMobile(o.href),titleIndex:o.index,score:sc,imgs:[],meta:{},summary:''};order.push(k)}else if(sc>map[k].score){map[k].title=t;map[k].url=C.toMobile(o.href);map[k].titleIndex=o.index;map[k].score=sc}}order.sort(function(a,b){return map[a].titleIndex-map[b].titleIndex});return order.map(function(k){return map[k]})}
function parseItems(m,html,base){var a=[],fn=m._debug&&m._debug.parseCardsV15;try{if(fn)a=fn(html,base,0)||[]}catch(e){a=[]}if(!a.length)a=fallbackItems(html,base);return a}
function cleanSummary(it){var x=trim(s(it.summary||'').replace(/本帖最后由[^。\n]{0,120}编辑/gi,' ').replace(/\s+/g,' '));if(x===it.title)x='';if(x.length>180)x=x.slice(0,180)+'…';return x}
function safeImgs(it,ref){var out=[],seen={},a=it.imgs||[],i,u,k;for(i=0;i<a.length&&out.length<3;i++){u=C.abs(a[i],ref);if(!u)continue;k=C.canonical(u);if(seen[k])continue;if(/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer/i.test(u))continue;seen[k]=1;out.push(u)}return out}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',desc=[];if(m.role)desc.push(m.role);if(m.time)desc.push(m.time);if(m.author||av||desc.length)d.push({title:m.author||'发布者',desc:desc.join(' · '),img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v26_guide_author'}})}
function previewRows(d,it,ref,u){var imgs=safeImgs(it,ref),j,p,ct;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(j=0;j<imgs.length;j++){p=C.imageUrl(imgs[j],ref);if(!p)continue;d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v26_guide_preview'}})}}
function guideNative(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),html='',items=[],source='mobile-fetch',i,it,u;
  setPageTitle(name);
  html=C.fetchPage(url,false);items=parseItems(m,html,url);
  if(items.length<3){
    var h2=C.renderList(url),a2=parseItems(m,h2,url);
    if(a2.length>items.length){html=h2;items=a2;source='mobile-webview-fallback'}
  }
  if(!items.length){
    var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseItems(m,html,pc);source='pc-fallback'
  }
  C.saveDiag('guide.native.v26',mode+' p='+p+' items='+items.length+' source='+source);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'原生卡片 · 第 '+p+' 页 · '+items.length+' 条主题 · '+(source==='mobile-fetch'?'快速手机请求':'兜底解析')));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){
    it=items[i];it.summary=cleanSummary(it);u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});
    authorRow(d,it,url);
    d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v26_guide_card'}});
    previewRows(d,it,url,u);
    d.push(C.line('sht_v26_guide_sep'));
  }
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));
  setResult(d)
}
function module(){
  var m=BASE.module(),oldForum=m.forum;
  m.version='0.1.0-test.26';m.build=10126;
  m.forum=function(){if(C.pageParam('sht_auto',''))return guideNative(m);return oldForum()};
  m._debug=m._debug||{};m._debug.guideNativeV26=guideNative;
  return m
}
var P={version:'0.1.0-test.26',build:10126,module:module};SeHuaTangRemoteRuntime=P;return P;
})();