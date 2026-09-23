/* 色花堂 0.1.0-test.24 / Build 10124 - guide preview captured directly from rendered mobile DOM */
var SeHuaTangPatchTest24=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var KEY_COOKIE='sht_web_cookie_v5',KEY_ACCESS='sht_access_ok_v7';
function s(v){return v==null?'':String(v)}
function trim(v){return C.trim(v)}
function guideUrl(mode,p){var view=mode==='latest'?'newthread':(mode==='digest'?'digest':'hot');return C.origin()+'/forum.php?mod=guide&view='+view+'&mobile=2&page='+Math.max(1,Number(p||1))}
function pageKey(mode){return'sht_guide_page_v24_'+mode}
function mapKey(mode,p){return'sht_guide_preview_map_v24_'+mode+'_'+Math.max(1,Number(p||1))}
function pbtn(t,key,p,on){return{title:t,url:on?$('#noLoading#').lazyRule(function(k,v){putMyVar(k,String(v));refreshPage(false);return'hiker://empty';},key,p):'hiker://empty',col_type:'text_3',extra:{lineVisible:false}}}
function goodTitle(t){t=trim(t);return !!t&&t.length>=4&&t.length<=180&&!/本帖最后由.+编辑|^(查看帖子|查看|回复|最后发表|最后回复|上一页|下一页|返回|首页|论坛|社区版块|搜索|发帖|更多)$/i.test(t)&&!/^\d+$/.test(t)}
function renderGuide(u,mk){
  try{putMyVar(mk,'')}catch(e0){}
  try{return s(fetchCodeByWebView(u,{headers:C.headers(false,u),timeout:32000,blockRules:['.woff','.woff2','.ttf'],checkJs:$.toString(function(ck,ak,mapVar){
    var body=String((document.body&&document.body.innerText)||'');
    function age(x){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(x)}
    if(age(body)){
      var ns=document.querySelectorAll('a,button,input,[onclick],[role="button"],div');
      for(var i=0;i<ns.length;i++){var z=String(ns[i].innerText||ns[i].textContent||ns[i].value||'');if(age(z)){try{ns[i].click();return null}catch(e){}}}
      return null;
    }
    try{var c=fba.getCookie(location.origin)||'';if(c)fba.putVar(ck,c);fba.putVar(ak,'1')}catch(e1){}
    window.__shtGuideV24=(window.__shtGuideV24||0)+1;
    if(window.__shtGuideV24===1){window.scrollTo(0,Math.floor(document.body.scrollHeight*0.28));return null}
    if(window.__shtGuideV24===2){window.scrollTo(0,Math.floor(document.body.scrollHeight*0.58));return null}
    if(window.__shtGuideV24===3){window.scrollTo(0,document.body.scrollHeight);return null}
    function tid(h){h=String(h||'');var m=h.match(/[?&]tid=(\d+)/i)||h.match(/[?&]ptid=(\d+)/i)||h.match(/\/thread-(\d+)-\d+-\d+\.html/i);return m?m[1]:''}
    function abs(v){v=String(v||'').trim();if(!v||/^data:|^blob:/i.test(v))return'';try{return new URL(v,location.href).href}catch(e){return v}}
    function bad(v){v=String(v||'');return !v||/avatar|uc_server|ucenter|noavatar|smiley|static\/image|logo\.|none\.gif|loading|blank\.gif|emotion|face\/|emoji|icon\/|placeholder|transparent|spacer/i.test(v)}
    function candImg(q){var attrs=['data-original','data-src','data-lazy-src','data-echo','data-url','data-actual','data-cfsrc','file','zoomfile'],v='';for(var k=0;k<attrs.length;k++){v=q.getAttribute&&q.getAttribute(attrs[k])||'';if(v&&!bad(v))return abs(v)}v=String(q.currentSrc||q.src||q.getAttribute&&q.getAttribute('src')||'');var nw=Number(q.naturalWidth||0),nh=Number(q.naturalHeight||0),rw=0,rh=0;try{var r=q.getBoundingClientRect();rw=Number(r.width||0);rh=Number(r.height||0)}catch(e){}if(v&&!bad(v)&&(nw>=120||nh>=90||rw>=120||rh>=90))return abs(v);return''}
    function collect(root){var out=[],seen={},ims=root.querySelectorAll?root.querySelectorAll('img'):[],j,v;function add(x){x=abs(x);if(!x||bad(x)||seen[x])return;seen[x]=1;out.push(x)}for(j=0;j<ims.length&&out.length<3;j++){v=candImg(ims[j]);if(v)add(v)}if(out.length<3&&root.querySelectorAll){var all=root.querySelectorAll('[style],[data-bg],[data-background]');for(j=0;j<all.length&&out.length<3;j++){v=all[j].getAttribute('data-bg')||all[j].getAttribute('data-background')||'';if(!v)try{var bg=getComputedStyle(all[j]).backgroundImage||'',mm=bg.match(/url\(["']?(.*?)["']?\)/i);if(mm)v=mm[1]}catch(e2){}if(v)add(v)}}return out}
    var links=document.querySelectorAll('a[href*="tid="],a[href*="thread-"]'),map={},li,id,p,arr,depth;
    for(li=0;li<links.length;li++){
      id=tid(links[li].href||links[li].getAttribute('href'));if(!id||map[id])continue;
      p=links[li];arr=[];
      for(depth=0;depth<8&&p;depth++,p=p.parentElement){arr=collect(p);if(arr.length){var tx=String(p.innerText||p.textContent||'');if(tx.length<5000)break}}
      if(arr.length)map[id]=arr.slice(0,3);
    }
    try{fba.putVar(mapVar,JSON.stringify(map))}catch(e3){}
    if(!links.length)return null;
    return'ready';
  },KEY_COOKIE,KEY_ACCESS,mk)}))}catch(e){return''}
}
function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,t,u;while((m=re.exec(s(html)))!==null){u=C.abs(m[2]||m[3]||'',base);t=trim(C.strip(m[5]||''));out.push({href:u,text:t,index:m.index});if(out.length>20000)break}return out}
function fallbackItems(html,base){var x=s(html),a=anchors(x,base),map={},order=[],i,o,id,t,sc,k;for(i=0;i<a.length;i++){o=a[i];id=C.threadId(o.href);if(!id)continue;t=o.text;if(!goodTitle(t))continue;sc=Math.min(t.length,140)+(t.length>=10?30:0);k=String(id);if(!map[k]){map[k]={id:k,title:t,url:C.toMobile(o.href),titleIndex:o.index,score:sc,imgs:[],meta:{},summary:''};order.push(k)}else if(sc>map[k].score){map[k].title=t;map[k].url=C.toMobile(o.href);map[k].titleIndex=o.index;map[k].score=sc}}order.sort(function(a,b){return map[a].titleIndex-map[b].titleIndex});return order.map(function(q){return map[q]})}
function parseItems(m,html,base){var a=[],fn=m._debug&&m._debug.parseCardsV15;try{if(fn)a=fn(html,base,0)||[]}catch(e){a=[]}if(!a.length)a=fallbackItems(html,base);return a}
function readMap(mk){try{return JSON.parse(getVar(mk,'{}')||'{}')}catch(e){return{}}}
function safeFallbackImgs(it){var out=[],i,u,k,seen={};for(i=0;i<(it.imgs||[]).length&&out.length<3;i++){u=C.abs(it.imgs[i],'');if(!u)continue;k=C.canonical(u);if(seen[k])continue;if(!/\.(?:jpe?g|png|webp)(?:[?#]|$)|\/data\/attachment\//i.test(u))continue;if(/avatar|smiley|static\/image|loading|blank|placeholder/i.test(u))continue;seen[k]=1;out.push(u)}return out}
function attachMap(items,mp){var i,it,id,a,mapped=0,total=0;for(i=0;i<items.length;i++){it=items[i];id=String(it.id||C.threadId(it.url)||'');a=id&&mp[id]?mp[id]:[];if(a&&a.length){it.imgs=a.slice(0,3);mapped++;total+=it.imgs.length}else{it.imgs=safeFallbackImgs(it);total+=it.imgs.length}if(it.summary){it.summary=trim(s(it.summary).replace(/本帖最后由[^。\n]{0,100}编辑/gi,' ').replace(/\s+/g,' '));if(it.summary===it.title)it.summary='';if(it.summary.length>180)it.summary=it.summary.slice(0,180)+'…'}}return{items:items,mapped:mapped,total:total}}
function statText(x){x=x||{};var a=[];if(x.replies)a.push('💬 '+x.replies);if(x.likes)a.push('👍 '+x.likes);if(x.views)a.push('👁 '+x.views);return a.join('　')}
function authorRow(d,it,ref){var m=it.meta||{},av=m.avatar?C.imageUrl(m.avatar,ref):'',desc=[];if(m.time)desc.push(m.time);if(it.tag)desc.push(it.tag);if(m.author||av||desc.length)d.push({title:m.author||'发布者',desc:desc.join('　'),img:av,pic_url:av,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false,cls:'sht_v24_guide_author'}})}
function previewRows(d,it,ref,u){var imgs=it.imgs||[],j,p,ct;if(!imgs.length)return;ct=imgs.length>=3?'pic_3':'pic_2';for(j=0;j<imgs.length&&j<3;j++){p=C.imageUrl(imgs[j],ref);if(!p)continue;d.push({title:'',img:p,pic_url:p,url:u,col_type:ct,extra:{lineVisible:false,cls:'sht_v24_guide_preview'}})}}
function segment(html,items,i){var x=s(html),st=Number(items[i].titleIndex||items[i].index||0),en=i+1<items.length?Number(items[i+1].titleIndex||items[i+1].index||0):x.length;if(!st||en<=st||en-st>120000)en=Math.min(x.length,st+90000);return x.slice(st,en)}
function guide(m){
  var d=[],mode=C.pageParam('sht_auto','hot'),name=C.pageParam('sht_name',mode==='latest'?'最新发表':(mode==='digest'?'最新精华':'最新热门')),key=pageKey(mode),p=Math.max(1,Number(getMyVar(key,'1')||1)),mk=mapKey(mode,p),url=guideUrl(mode,p),html='',items=[],mp={},ar,i,it,u,st='';
  setPageTitle(name);
  html=renderGuide(url,mk);items=parseItems(m,html,url);mp=readMap(mk);ar=attachMap(items,mp);items=ar.items;
  if(!items.length){html=C.fetchPage(url,false);items=parseItems(m,html,url);ar=attachMap(items,mp);items=ar.items}
  if(!items.length){var pc=C.toPc(url);html=C.fetchPage(pc,true);items=parseItems(m,html,pc);ar=attachMap(items,mp);items=ar.items}
  C.saveDiag('guide.preview.v24',mode+' p='+p+' items='+items.length+' mapped='+ar.mapped+' imgs='+ar.total+' url='+url);
  d.push(C.quick('手机版','x5://'+url,'web.svg'));d.push(C.quick('搜索',C.route('shtSearch'),'search.svg'));d.push(C.line());
  d.push(C.section(name,'手机端卡片 · 第 '+p+' 页 · '+items.length+' 条主题 · DOM直取 '+ar.mapped+' 帖/'+ar.total+' 图'));
  d.push(pbtn(p>1?'上一页':'第一页',key,Math.max(1,p-1),p>1));d.push(pbtn(p>1?'回第1页':'第1页',key,1,p>1));d.push(pbtn(items.length?'下一页':'已到底',key,p+1,items.length>0));d.push(C.line());
  if(!items.length){d.push(C.empty('本页没有解析到主题','可点“手机版”确认官网页面状态'));setResult(d);return}
  for(i=0;i<items.length;i++){
    it=items[i];u=C.route('shtThread',{sht_url:C.toMobile(it.url),sht_name:it.title});
    authorRow(d,it,url);d.push({title:it.title,desc:it.summary||'',url:u,col_type:'text_1',extra:{lineVisible:false,cls:'sht_v24_guide_card'}});previewRows(d,it,url,u);
    try{if(typeof SeHuaTangV19Forum!=='undefined'&&SeHuaTangV19Forum.stats)st=statText(SeHuaTangV19Forum.stats(segment(html,items,i),it));else st=''}catch(e){st=''}
    if(st)d.push({title:'',desc:st,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false,cls:'sht_v24_guide_stat'}});d.push(C.line('sht_v24_guide_sep'));
  }
  d.push(pbtn('上一页',key,Math.max(1,p-1),p>1));d.push(pbtn('回第1页',key,1,p>1));d.push(pbtn('下一页',key,p+1,true));setResult(d)
}
function module(){var m=BASE.module(),oldForum=m.forum;m.version='0.1.0-test.24';m.build=10124;m.forum=function(){if(C.pageParam('sht_auto',''))return guide(m);return oldForum()};return m}
var P={version:'0.1.0-test.24',build:10124,module:module};SeHuaTangRemoteRuntime=P;return P;
})();