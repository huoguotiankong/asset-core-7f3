/* 51吃瓜 · Verified Cover 0.1.1-test.4 / Build10204.
 * Fix Test3 false-positive generic OG images; use per-article identity and
 * cross-post duplicate rejection. Never read the Test3 cache.
 */
(function(){
if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')throw Error('51CG Test4 requires Core/Runtime');
var C=Cg51Core,R=Cg51RemoteRuntime,V='0.1.1-test.4',BUILD=10204;
var baseHome=C.home,baseCategory=C.category,baseSearch=C.search;
var KEY='cg51_verified_cover_cache_v4',DAY=86400000,MAX=8,NEG=21600000;
C.version=V;C.build=BUILD;R.version=V;R.build=BUILD;C.coverVersion=V;
function S(x){return String(x==null?'':x);}
function array(x){return Object.prototype.toString.call(x)==='[object Array]';}
function cleanURL(x,base){
  x=S(x).trim().replace(/\\\//g,'/').replace(/&amp;/ig,'&');
  if(!x||/^data:|^blob:|^javascript:|^#/i.test(x))return'';
  if(/^\S+\s+\d+(?:\.\d+)?[wx](?:\s*,|$)/i.test(x))x=x.split(/\s+/)[0];
  try{x=C.abs(x,base);}catch(e){return'';}
  return /^https?:\/\/[^/?#]+/i.test(x)?x:'';
}
function identity(u){
  // Ignore query-driven CDN image sizes, user tracking and cache busters.
  return S(u).replace(/[?#].*$/,'').replace(/\/+/g,'/').replace(/^https:\//,'https://').toLowerCase();
}
function generic(u){
  var x=identity(u);
  return !x||/\/(?:usr\/themes|wp-content\/themes|assets\/images\/(?:logo|icon|default)|static\/(?:logos?|icons?))\//i.test(x)||
  /(?:^|\/)(?:chigua|51chigua|site[-_]?logo|logo|banner[-_]?default|default[-_]?cover|share[-_]?image|placeholder|no[-_]?image|favicon|app[-_]?logo|og[-_]?default)(?:[-_.\/]|$)/i.test(x)||
  /\.svg$/i.test(x);
}
function readCache(){try{return JSON.parse(getItem(KEY,'{}'))||{};}catch(e){return{};}}
function writeCache(a){
  var now=Date.now(),arr=[],k,o;
  for(k in a)if(Object.prototype.hasOwnProperty.call(a,k)){o=a[k];
    if(o&&o.time&&now-o.time<7*DAY)arr.push([k,o]);
  }
  arr.sort(function(a,b){return b[1].time-a[1].time;});
  var out={};for(var i=0;i<arr.length&&i<120;i++)out[arr[i][0]]=arr[i][1];
  try{setItem(KEY,JSON.stringify(out));}catch(e){}
}
function attr(tag,key){try{return C.attr(tag,key);}catch(e){return'';}}
function inArticleImage(html,url){
  // Image must be inside article/entry-content, not site navbar or footer.
  var block='',m,original=S(html);
  m=/<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(original);
  if(m)block=m[1];
  if(!block){m=/<(?:div|section)\b[^>]*class\s*=\s*['"][^'"]*(?:entry-content|post-content|article-content|single-content)[^'"]*['"][^>]*>([\s\S]{0,15000})/i.exec(original);if(m)block=m[1];}
  if(!block)return'';
  var re=/<(?:img|source)\b([^>]*)>/ig,tag,keys=['data-xkrkllgl','data-original','data-src','data-echo','data-lazy-src','data-image','data-cover','srcset','src'];
  while((m=re.exec(block))){
    tag=m[1];for(var i=0;i<keys.length;i++){
      var x=cleanURL(attr(tag,keys[i]),url);
      if(x&&!generic(x))return x;
    }
  }
  return'';
}
function metaImage(html,url){
  var names=['og:image','og:image:url','twitter:image','twitter:image:src'],u='';
  for(var i=0;i<names.length;i++){
    try{u=cleanURL(C.meta(html,names[i]),url);if(u&&!generic(u))return u;}catch(e){}
  }
  // Only explicit image properties; no general page/logo/link preload.
  var re=/<meta\b[^>]*>/ig,m,part,v,n;
  while((m=re.exec(S(html)))){
    part=m[0];n=attr(part,'property')||attr(part,'name');
    if(!/^(?:og:image(?::url)?|twitter:image(?::src)?)$/i.test(n))continue;
    v=cleanURL(attr(part,'content'),url);if(v&&!generic(v))return v;
  }
  return'';
}
function inspect(html,url){
  var body=inArticleImage(html,url);
  if(body)return{url:body,origin:'article'};
  var m=metaImage(html,url);
  return m?{url:m,origin:'meta'}:null;
}
function responseBody(v){
  if(typeof v==='string')return v;
  if(v&&typeof v==='object'){
    if(typeof v.body==='string')return v.body;
    if(typeof v.content==='string')return v.content;
  }
  return'';
}
function patch(result,where){
  if(!result||!array(result.posts))return result;
  var posts=result.posts,now=Date.now(),cache=readCache(),counts={},candidates=[],i,p,k,u,ban={};
  var trace={scope:where,version:V,htmlLength:S(result.html).length,
    posts:posts.length,raw:0,duplicate:0,generic:0,detail:0,detailOK:0,
    unique:0,meta:0,body:0,cached:0,negative:0,final:0,missing:0,commonExamples:[],hosts:{},siteMeta:''};
  var rootMeta=metaImage(S(result.html),result.url||C.base());
  if(rootMeta){ban[identity(rootMeta)]=1;trace.siteMeta=identity(rootMeta).replace(/^https?:\/\/[^/]+/,'').slice(0,90);}
  // Stage 1: read only list cards. Block repeated images across unrelated posts.
  for(i=0;i<posts.length;i++){
    p=posts[i];u=cleanURL(p.rawImg,p.url);
    if(u&&!generic(u)){k=identity(u);counts[k]=(counts[k]||0)+1;candidates.push(u);}
  }
  for(i=0;i<posts.length;i++){
    p=posts[i];u=cleanURL(p.rawImg,p.url);if(u)trace.raw++;
    if(u&&generic(u)){trace.generic++;if(trace.commonExamples.length<2)trace.commonExamples.push('网站通用:'+identity(u).replace(/^https?:\/\/[^/]+/,'').slice(0,70));}
    if(u&&counts[identity(u)]>1){trace.duplicate++;if(trace.commonExamples.length<2)trace.commonExamples.push('跨文章重复:'+identity(u).replace(/^https?:\/\/[^/]+/,'').slice(0,70));}
    if(!u||generic(u)||counts[identity(u)]>1||ban[identity(u)]){
      p.rawImg='';p.img='';
    }else{p.rawImg=u;p.img=C.image(u,p.url);p._coverValid=true;}
  }
  // Stage 2: no Test3 cache and no reusing an image from another article.
  var pending=[];
  for(i=0;i<posts.length;i++){
    p=posts[i];if(p._coverValid)continue;
    k=C.pathOf(p.url);var x=cache[k];
    if(x&&x.status==='good'&&now-x.time<3*DAY&&x.url&&!generic(x.url)&&!ban[identity(x.url)]){
      p.rawImg=x.url;p.img=C.image(x.url,p.url);p._coverValid=true;trace.cached++;continue;
    }
    if(x&&x.status==='none'&&now-x.time<NEG){trace.negative++;continue;}
    if(result.ok&&pending.length<MAX&&/^https?:\/\/[^/]+/.test(S(p.url)))
      pending.push({post:p,id:k,url:p.url});
  }
  var tentative=[],req=[];
  for(i=0;i<pending.length;i++)req.push({url:pending[i].url,options:{timeout:5500,headers:C.headers(pending[i].url)}});
  var responses=null;try{if(req.length&&typeof batchFetch==='function')responses=batchFetch(req);}catch(e){}
  var cap=responses&&responses.length===pending.length?pending.length:Math.min(3,pending.length);
  for(i=0;i<cap;i++){
    var h=responses?responseBody(responses[i]):C.rawFetch(pending[i].url,{timeout:5500,ref:pending[i].url});
    trace.detail++;
    if(!h||h.length<180)continue;
    trace.detailOK++;
    var cand=inspect(h,pending[i].url);
    if(cand&&cand.url&&!ban[identity(cand.url)])tentative.push({post:pending[i].post,id:pending[i].id,url:cand.url,origin:cand.origin});
  }
  // Stage 3: global de-duplication includes initial list and cached covers.
  counts={};
  for(i=0;i<posts.length;i++)if(posts[i]._coverValid&&posts[i].rawImg){
    k=identity(posts[i].rawImg);counts[k]=(counts[k]||0)+1;
  }
  for(i=0;i<tentative.length;i++){k=identity(tentative[i].url);counts[k]=(counts[k]||0)+1;}
  var cacheDirty=false;
  for(i=0;i<tentative.length;i++){
    var x=tentative[i],key=identity(x.url);
    if(counts[key]>1||generic(x.url)||ban[key]){
      trace.duplicate++;if(trace.commonExamples.length<2)trace.commonExamples.push('详情公共图:'+key.replace(/^https?:\/\/[^/]+/,'').slice(0,70));
      continue;
    }
    x.post.rawImg=x.url;x.post.img=C.image(x.url,x.post.url);x.post._coverValid=true;
    cache[x.id]={status:'good',url:x.url,time:now};cacheDirty=true;
    if(x.origin==='meta')trace.meta++;else trace.body++;
    trace.unique++;
  }
  for(i=0;i<posts.length;i++){
    p=posts[i];
    if(p._coverValid&&counts[identity(p.rawImg)]>1){
      p.rawImg='';p.img='';p._coverValid=false;trace.duplicate++;
    }
    if(p._coverValid&&p.rawImg){
      trace.final++;var host=(p.rawImg.match(/^https?:\/\/([^/?#]+)/)||[])[1];
      if(host)trace.hosts[host]=(trace.hosts[host]||0)+1;
    }else{trace.missing++;p.rawImg='';p.img='';}
    delete p._coverValid;
  }
  // Negative cache short-lived only for posts really checked (not unrequested ones).
  for(i=0;i<cap;i++){
    p=pending[i].post;if(!p.rawImg){cache[pending[i].id]={status:'none',time:now};cacheDirty=true;}
  }
  if(cacheDirty)writeCache(cache);
  C._verifiedCoverTrace=trace;return result;
}
C.home=function(page){return patch(baseHome.call(C,page),'home');};
C.category=function(u,p){return patch(baseCategory.call(C,u,p),'category');};
C.search=function(q,p){return patch(baseSearch.call(C,q,p),'search');};
R.imageDiag=function(){
  try{setPageTitle('51吃瓜 · 封面核验 Test4');}catch(e){}
  var d=[],r,t={};function line(v){d.push({title:S(v),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  line('封面核验 Test4 · Build10204 · 已隔离 Test3 错误缓存');
  try{r=C.home(1);t=C._verifiedCoverTrace||{};}catch(e){line('诊断失败：'+S(e.message||e).slice(0,110));setResult(d);return;}
  line('首页文章 '+t.posts+' · HTML '+t.htmlLength+' 字符');
  line('原始URL '+t.raw+' · 网站通用图 '+t.generic+' · 重复图 '+t.duplicate);
  line('详情请求 '+t.detail+' · 正常网页 '+t.detailOK);
  line('独立封面 '+t.unique+' · 文章正文 '+t.body+' · 元数据 '+t.meta);
  line('缓存命中 '+t.cached+' · 无图缓存 '+t.negative+' · 最终有效 '+t.final+' · 缺失 '+t.missing);
  var keys=Object.keys(t.hosts||{});for(var i=0;i<keys.length&&i<4;i++)line('图片域名：'+keys[i]+' · '+t.hosts[keys[i]]);
  for(i=0;i<(t.commonExamples||[]).length;i++)line('排除原因：'+t.commonExamples[i]);
  var sample=null;for(i=0;i<(r.posts||[]).length;i++){if(r.posts[i].rawImg){sample=r.posts[i];break;}}
  if(sample){
    line('抽样文章封面路径：'+C.pathOf(sample.rawImg).replace(/[?#].*$/,'').slice(0,95));
    d.push({title:'已核验',pic_url:sample.img,url:'hiker://empty',col_type:'movie_2'});
  }else line('未找到文章专属图片：不再使用网站统一宣传图冒充封面。');
  line('只在当前设备诊断；不输出 Cookie、图片内容或完整 HTML。');
  setResult(d);
};
})();