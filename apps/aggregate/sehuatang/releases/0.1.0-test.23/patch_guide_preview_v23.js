/* 色花堂 0.1.0-test.23 / Build 10123 - guide preview candidates aligned with working forum cards */
var SeHuaTangPatchTest23=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7';
function s(v){return v==null?'':String(v)}
function trim(v){return C.trim(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v23_'+mode}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function goodTitle(t){t=trim(t);return !!t&&t.length>=4&&t.length<=180&&!/本帖最后由.+编辑|^(查看帖子|查看|回复|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)&&!/^\d+$/.test(t)}
function renderGuide(u){
  try{return s(fetchCodeByWebView(u,{headers:C.headers(false,u),timeout:30000,blockRules:['.woff','.woff2','.ttf'],checkJs:$.toString(function(ck,ak){
    var body=String((document.body&&document.body.innerText)||'');
    function age(x){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(x)}
    if(age(body)){
      var ns=document.querySelectorAll('a,button,input,[onclick],[role="button"],div');
      for(var i=0;i<ns.length;i++){var z=String(ns[i].innerText||ns[i].textContent||ns[i].value||'');if(age(z)){try{ns[i].click();return null}catch(e){}}}
      return null;
    }
    try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ck,c);fba.putVar(ak,'1')}catch(e0){}
    window.__shtGuideV23=(window.__shtGuideV23||0)+1;
    if(window.__shtGuideV23===1){window.scrollTo(0,Math.floor(document.body.scrollHeight*0.30));return null}
    if(window.__shtGuideV23===2){window.scrollTo(0,Math.floor(document.body.scrollHeight*0.62));return null}
    if(window.__shtGuideV23===3){window.scrollTo(0,document.body.scrollHeight);return null}
    var im=document.querySelectorAll('img');
    function bad(v){v=String(v||'');return !v||/^data:/i.test(v)||/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer/i.test(v)}
    for(var j=0;j<im.length;j++){
      var q=im[j],cand='',attrs=['data-original','data-src','data-lazy-src','data-echo','data-url','data-actual','data-cfsrc','file','zoomfile'];
      for(var k=0;k<attrs.length;k++){var v=q.getAttribute(attrs[k])||'';if(!bad(v)){cand=v;break}}
      if(!cand){
        var cur=String(q.currentSrc||q.getAttribute('src')||'');
        var nw=Number(q.naturalWidth||0),nh=Number(q.naturalHeight||0);
        if(!bad(cur)&&(nw>=140||nh>=100))cand=cur;
      }
      if(cand)try{q.setAttribute('data-sht-preview-src',cand)}catch(e1){}
    }
    var bg=document.querySelectorAll('[style*="background"],[data-bg],[data-background],[data-original]');
    for(var n=0;n<bg.length;n++){
      var el=bg[n],v=el.getAttribute('data-original')||el.getAttribute('data-bg')||el.getAttribute('data-background')||'';
      if(!v)try{var cs=getComputedStyle(el).backgroundImage||'',mm=cs.match(/url\(["']?(.*?)["']?\)/i);if(mm)v=mm[1]}catch(e2){}
      if(v&&!bad(v))try{el.setAttribute('data-sht-preview-bg',v)}catch(e3){}
    }
    if(!document.querySelector('a[href*="tid="],a[href*="thread-"]'))return null;
    return'ready';
  },KEY_COOKIE,KEY_ACCESS)}))}catch(e){return''}
}
function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,t,u;while((m=re.exec(s(html)))!==null){u=C.abs(m[2]||m[3]||'',base);t=trim(C.strip(m[5]||''));out.push({href:u,text:t,index:m.index});if(out.length>20000)break}return out}
function fallbackItems(html,base){
  var x=s(html),a=anchors(x,base),map={},order=[],i,o,id,t,sc,k;
  for(i=0;i<a.length;i++){o=a[i];id=C.threadId(o.href);if(!id)continue;t=o.text;if(!goodTitle(t))continue;sc=Math.min(t.length,140)+(t.length>=10?30:0);k=String(id);if(!map[k]){map[k]={id:k,title:t,url:C.toMobile(o.href),titleIndex:o.index,score:sc,imgs:[],meta:{},summary:''};order.push(k)}else if(sc>map[k].score){map[k].title=t;map[k].url=C.toMobile(o.href);map[k].titleIndex=o.index;map[k].score=sc}}
  order.sort(function(a,b){return map[a].titleIndex-map[b].titleIndex});
  return order.map(function(q){return map[q]})
}
function attr(tag,n){return C.attrVal(tag,n)||''}
function imageCandidates(ctx,base,max){
  var x=s(ctx),out=[],seen={},re=/<[^>]+>/gi,m,tag,v,mm;
  function add(u,a){u=C.validImage(u,base,a||'');if(!u)return;var k=C.canonical(u);if(!seen[k]){seen[k]=1;out.push(u)}}
  while((m=re.exec(x))!==null){
    tag=m[0];
    v=attr(tag,'data-sht-preview-src');if(v)add(v,tag);
    v=attr(tag,'data-sht-preview-bg');if(v)add(v,tag);
    if(out.length>=max)break;
  }
  if(out.length<max){
    re=/<img\b[^>]*>/gi;
    while((m=re.exec(x))!==null){
      tag=m[0];
      var names=['data-original','data-src','data-lazy-src','data-echo','data-url','data-actual','data-cfsrc','file','zoomfile','src'],i;
      for(i=0;i<names.length;i++){v=attr(tag,names[i]);if(v){add(v,tag);if(out.length>=max)break}}
      if(out.length>=max)break;
    }
  }
  if(out.length<max){
    re=/<[^>]+>/gi;
    while((m=re.exec(x))!==null){
      tag=m[0];mm=tag.match(/background(?:-image)?\s*:\s*url\((?:["']?)([^)"']+)/i);if(mm)add(mm[1],tag);
      if(out.length>=max)break;
    }
  }
  return out.slice(0,max)
}
function segment(html,items,i){
  var x=s(html),st=Number(items[i].titleIndex||items[i].index||0),en=i+1<items.length?Number(items[i+1].titleIndex||items[i+1].index||0):x.length;
  if(!st||en<=st||en-st>120000)en=Math.min(x.length,st+90000);
  return x.slice(st,en)
}
function enrich(items,html,base){
  var i,it,ctx,imgs,mt,tm,tag;
  for(i=0;i<items.length;i++){
    it=items[i];ctx=segment(html,items,i);imgs=imageCandidates(ctx,base,3);it.imgs=imgs;
    if(!it.meta)it.meta={};
    mt=C.strip(ctx);
    if(!it.meta.time){tm=mt.match(/(\d+\s*(?:分钟|小时|天)前(?:发布)?|前天\s*\d{1,2}:\d{2}|昨天\s*\d{1,2}:\d{2}|\d{4}-\d{1,2}-\d{1,2}(?:\s+\d{1,2}:\d{2})?)/);if(tm)it.meta.time=tm[1]}
    if(!it.tag){tag=(mt.match(/#([^#]{2,20})#/i)||[])[1]||'';if(tag)it.tag='#'+tag+'#'}
    if(it.summary){it.summary=trim(s(it.summary).replace(/本帖最后由[^。\n]{0,100}编辑/gi,' ').replace(/\s+/g,' '));if(it.summary===it.title)it.summary='';if(it.summary.length>180)it.summary=it.summary.slice(0,180)+'…'}
  }
  return items
}
function parseItems(m,html,base){
  var a=[],fn=m._debug&&m._debug.parseCardsV15;
  try{if(fn)a=fn(html,base,0)||[]}catch(e){a=[]}
  if(!a.length)a=fallbackItems(html,base);
  return enrich(a,html,base)
}
function statText(x){x=x||{};var a=[];if(x.replies)a.push('💬 '+x.replies);if(x.likes)a.push('👍 '+x.likes);if(x.views)a.push('👁 '+x.views);return a.join('　')}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',desc=[];if(m.time)desc.push(m.time);if(it.tag)desc.push(it.tag);if(m.author||av||desc.length)d.push({title:m.author||'发布者',desc:desc.join('　'),img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v23_guide_author'}})}
function previewRows(d,it,ref,u){var imgs=it.imgs||[],j,p,ct;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':(imgs.length===2?'pic_2':'pic_1_full');for(j=0;j<imgs.length&&j<3;j++){p=C.imageUrl(imgs[j],ref);if(!p)continue;d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v23_guide_preview'}})}}
function guide(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),url=guideUrl(mode,p),html='',items=[],i,it,u,st,imgCount=0;
  setPageTitle(name);
  html=renderGuide(url);items=parseItems(m,html,url);
  if(!items.length){html=C.fetchPage(url,false);items=parseItems(m,html,url)}
  if(!items.length){var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseItems(m,html,pc)}
  for(i=0;i<items.length;i++)imgCount+=(items[i].imgs||[]).length;
  C.saveDiag('guide.preview.v23',mode+' p='+p+' items='+items.length+' imgs='+imgCount+' url='+url);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'手机端卡片 · 第 '+p+' 页 · '+items.length+' 条主题 · '+imgCount+' 张真实预览候选'));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){
    it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});
    authorRow(d,it,url);d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v23_guide_card'}});
    previewRows(d,it,url,u);
    st='';try{if(typeof SeHuaTangV19Forum!=='undefined'&&SeHuaTangV19Forum.stats)st=statText(SeHuaTangV19Forum.stats(segment(html,items,i),it))}catch(e){}
    if(st)d.push({title:'',desc:st,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:'sht_v23_guide_stat'}});
    d.push(C.line('sht_v23_guide_sep'));
  }
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));setResult(d)
}
function module(){
  var m=BASE.module(),oldForum=m.forum;
  m.version='0.1.0-test.23';m.build=10123;
  m.forum=function(){if(C.pageParam('sht_auto',''))return guide(m);return oldForum()};
  return m
}
var P={version:'0.1.0-test.23',build:10123,module:module};SeHuaTangRemoteRuntime=P;return P;
})();