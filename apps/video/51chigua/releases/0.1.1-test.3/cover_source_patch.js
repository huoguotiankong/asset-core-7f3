/* 51吃瓜 Cover Source Recovery 0.1.1-test.3 / Build10203.
 * Diagnose absent raw cover URL and use limited, cached article-meta fallback.
 * Existing ImageAdapter/AES, playback, comments, favourites and native UI stay intact.
 */
(function(){
if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')throw Error('51CG Test3 needs prior Core Runtime');
var C=Cg51Core,R=Cg51RemoteRuntime,V='0.1.1-test.3',B=10203;
var oldHome=C.home,oldCategory=C.category,oldSearch=C.search,oldParse=C.parsePosts;
var KEY='cg51_cover_meta_cache_v3',MAX=12,DAY=86400000;
C.version=V;C.build=B;R.version=V;R.build=B;C.coverSourceVersion=V;
function S(x){return String(x==null?'':x);}
function has(u){return /^https?:\/\/[^/?#]+/i.test(S(u))&&!/(?:logo|avatar|placeholder|loading|favicon|blank)\.(?:png|svg|gif|webp)/i.test(S(u));}
function norm(u,base){
  u=S(u).trim().replace(/\\\//g,'/').replace(/&amp;/gi,'&');
  if(!u||/^data:|^blob:|^javascript:|^#/i.test(u))return'';
  if(/\s+\d+(?:\.\d+)?[wx](?:,|$)/.test(u))u=u.split(/\s+/)[0];
  try{u=C.abs(u,base);}catch(e){return'';}
  return has(u)?u:'';
}
function detailCover(html,base){
  var h=S(html),u='',m=null;
  // Explicit page-level cover metadata is safer than grabbing an arbitrary ad image.
  var metas=['og:image','og:image:url','twitter:image','twitter:image:src','image'];
  for(var i=0;i<metas.length;i++){
    try{u=norm(C.meta(h,metas[i]),base);if(u)return u;}catch(e){}
  }
  var re=/<meta\b[^>]*(?:property|name|itemprop)\s*=\s*['"](?:og:image(?::url)?|twitter:image(?::src)?|image)['"][^>]*>/ig;
  while((m=re.exec(h))){u=norm(C.attr(m[0],'content'),base);if(u)return u;}
  re=/<link\b[^>]*\brel\s*=\s*['"](?:image_src|preload)['"][^>]*>/ig;
  while((m=re.exec(h))){u=norm(C.attr(m[0],'href'),base);if(u)return u;}
  re=/<(?:video|source)\b[^>]*\bposter\s*=\s*['"]([^'"]+)['"]/ig;
  while((m=re.exec(h))){u=norm(m[1],base);if(u)return u;}
  // JSON-LD schema.org image may be a URL or {"url":"..."}.
  re=/<script\b[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/ig;
  while((m=re.exec(h))){
    var t=m[1],im=/"image"\s*:\s*(?:"([^"]+)"|\{\s*"url"\s*:\s*"([^"]+)")/i.exec(t);
    if(im){u=norm(im[1]||im[2],base);if(u)return u;}
  }
  // Article body image only, never global header/footer advertisements.
  var block='';
  try{block=C.articleBlock(h);}catch(e){block=h;}
  try{u=norm(C.firstImage(block,base),base);if(u)return u;}catch(e){}
  return'';
}
function readCache(){
  try{var v=JSON.parse(getItem(KEY,'{}'));return v&&typeof v==='object'?v:{};}catch(e){return{};}
}
function saveCache(map){
  var now=Date.now(),arr=[];
  for(var k in map)if(Object.prototype.hasOwnProperty.call(map,k)&&map[k]&&map[k].url&&now-map[k].time<14*DAY)arr.push([k,map[k]]);
  arr.sort(function(a,b){return b[1].time-a[1].time;});
  var x={};for(var i=0;i<arr.length&&i<120;i++)x[arr[i][0]]=arr[i][1];
  try{setItem(KEY,JSON.stringify(x));}catch(e){}
}
function body(v){return typeof v==='string'?v:v&&v.body!==undefined?S(v.body):v&&v.content!==undefined?S(v.content):S(v);}
function fill(res,scope){
  if(!res||!(res.posts instanceof Array))return res;
  var posts=res.posts,trace={scope:scope,ok:!!res.ok,htmlLength:S(res.html).length,posts:posts.length,raw:0,after:0,missing:0,requested:0,detailHtml:0,detailCover:0,cacheHit:0,failed:0,cdn:{},observed:[]};
  for(var k=0;k<posts.length;k++)if(has(posts[k].rawImg))trace.raw++;
  var pending=[],cache=readCache(),now=Date.now();
  for(var i=0;i<posts.length;i++){
    var post=posts[i],id=C.pathOf(post.url);
    if(has(post.rawImg))continue;
    var cached=cache[id];
    if(cached&&now-cached.time<3*DAY&&has(cached.url)){
      post.rawImg=cached.url;post.img=C.image(cached.url,post.url);trace.cacheHit++;continue;
    }
    if(res.ok&&pending.length<MAX&&/^https?:\/\//.test(S(post.url)))pending.push({post:post,key:id,url:post.url});
  }
  if(pending.length){
    var batch=null,requests=[];
    for(i=0;i<pending.length;i++)requests.push({url:pending[i].url,options:{timeout:6500,headers:C.headers(pending[i].url)}});
    try{if(typeof batchFetch==='function')batch=batchFetch(requests);}catch(e){batch=null;}
    // If batchFetch is unsupported, cap sequential fetches to prevent blocking the page.
    var cap=batch&&batch.length===pending.length?pending.length:Math.min(4,pending.length);
    for(i=0;i<cap;i++){
      var html=batch?body(batch[i]):C.rawFetch(pending[i].url,{timeout:6500,ref:pending[i].url});
      trace.requested++;
      if(html&&html.length>200)trace.detailHtml++;else{trace.failed++;continue;}
      var cover=detailCover(html,pending[i].url);
      if(!cover){trace.failed++;continue;}
      var pp=pending[i].post;
      pp.rawImg=cover;pp.img=C.image(cover,pp.url);
      cache[pending[i].key]={url:cover,time:now};trace.detailCover++;
    }
    if(trace.detailCover)saveCache(cache);
  }
  for(i=0;i<posts.length;i++){
    var r=posts[i];
    if(has(r.rawImg)){trace.after++;var host=(S(r.rawImg).match(/^https?:\/\/([^/?#]+)/)||[])[1];if(host)trace.cdn[host]=(trace.cdn[host]||0)+1;}
    else trace.missing++;
  }
  // Count hints, do not save or upload full HTML, HTML images or private data.
  var source=S(res.html);
  trace.htmlHints={img:(source.match(/<img\b/gi)||[]).length,source:(source.match(/<source\b/gi)||[]).length,
    ogImage:(source.match(/og:image/gi)||[]).length,lazy:(source.match(/data-(?:src|echo|original|cover|background|image)/gi)||[]).length,
    cssUrl:(source.match(/background-image|url\(/gi)||[]).length,
    articleLinks:(source.match(/\/archives\/\d+/gi)||[]).length};
  C._coverTrace3=trace;
  return res;
}
C.home=function(page){return fill(oldHome.call(C,page),'home');};
C.category=function(url,page){return fill(oldCategory.call(C,url,page),'category');};
C.search=function(q,page){return fill(oldSearch.call(C,q,page),'search');};
R.imageDiag=function(){
  try{setPageTitle('51吃瓜 · 封面诊断 Test3');}catch(e){}
  var d=[],r,t,a=[];
  function row(v){d.push({title:S(v),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});}
  row('封面诊断 0.1.1-test.3 · Build10203');
  try{r=C.home(1);t=C._coverTrace3||{};}catch(e){row('诊断发生错误：'+S(e.message||e).slice(0,120));setResult(d);return;}
  row('首页请求：'+(t.ok?'正常':'失败')+' · HTML '+t.htmlLength+' 字符');
  row('文章：'+t.posts+' 篇 · 原始封面：'+t.raw+' 张');
  row('回退详情：请求 '+t.requested+' · 网页有效 '+t.detailHtml+' · 找到图片 '+t.detailCover);
  row('缓存命中：'+t.cacheHit+' · 最终封面：'+t.after+' · 无封面：'+t.missing);
  var h=t.htmlHints||{};
  row('HTML线索：img '+(h.img||0)+' / source '+(h.source||0)+' / lazy '+(h.lazy||0)+' / og:image '+(h.ogImage||0));
  row('文章链接：'+(h.articleLinks||0)+' · CSS图片：'+(h.cssUrl||0));
  var keys=Object.keys(t.cdn||{});
  for(var i=0;i<keys.length&&i<3;i++)row('图片域名 '+(i+1)+'：'+keys[i]+'（'+t.cdn[keys[i]]+'）');
  for(i=0;i<r.posts.length;i++)if(has(r.posts[i].rawImg)){
    var p=r.posts[i],head='@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':p.url,'Cookie':'user-choose=true'});
    row('样本封面：'+C.pathOf(p.rawImg).replace(/[?#].*$/,'').slice(0,100));
    d.push({title:'自动兼容',pic_url:p.img,col_type:'movie_2',url:'hiker://empty'});
    d.push({title:'原始直连',pic_url:p.rawImg+head,col_type:'movie_2',url:'hiker://empty'});
    break;
  }
  if(!t.after)row('未找到封面URL：请截图上述计数。若详情网页有效但图片0，需继续查最新页面结构。');
  row('仅当前设备诊断，不上传页面、图片、Cookie 或历史记录。');
  setResult(d);
};
})();