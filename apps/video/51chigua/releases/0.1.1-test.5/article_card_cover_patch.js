/* 51吃瓜 · Article Card Cover Source 0.1.1-test.5 / Build10205
 * Protocol derived from user's uploaded "51吃瓜网.hk小程序.zip" rule.json.
 * Source anchors: <article itemtype="http://schema.org/BlogPosting">,
 * [a-z]-bg-loader-url, loadBannerDirect('URL'), and AES-CBC @js callback.
 * No Test3/Test4 OG-image fallback or cache. Keep established UI and network layers.
 */
(function(){
if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')
  throw Error('51吃瓜 Test5 需要原 Core 与 Runtime');
var C=Cg51Core,R=Cg51RemoteRuntime,V='0.1.1-test.5',BUILD=10205,
  oldHome=C.home,oldCategory=C.category,oldSearch=C.search;
C.version=V;C.build=BUILD;C.articleCoverVersion=V;R.version=V;R.build=BUILD;
function S(x){return String(x==null?'':x);}
function articleId(x){var m=/\/archives\/(\d+)(?:\/|[?#]|$)/i.exec(S(x));return m?m[1]:'';}
function normal(raw,base){
  var x=S(raw).trim().replace(/\\\//g,'/').replace(/&amp;/gi,'&');
  if(!x||/^(?:data:|javascript:|blob:|#)/i.test(x))return'';
  if(/^\S+\s+\d+(?:\.\d+)?[wx](?:\s*,|$)/i.test(x))x=x.split(/\s+/)[0];
  try{x=C.abs(x,base);}catch(e){return'';}
  return /^https?:\/\/[^/?#]+/i.test(x)?x:'';
}
function generic(u){
  var x=S(u).replace(/[?#].*$/,'').toLowerCase();
  return /\/usr\/themes\/|\/(?:logos?|favicon|avatars?|placeholder|icons?)\//i.test(x)||
    /(?:^|\/)(?:51chigua|chigua|logo|default-cover|share-image|placeholder|favicon)(?:[._/-]|$)/i.test(x)||
    /\.svg$/i.test(x);
}
function sourceCards(html,base){
  var s=S(html),marks=[],out={},stats={article:0,bg:0,banner:0,inline:0},m,i,chunk,id,ref,u,kind;
  var re=/<article\b([^>]*)>/ig;
  while((m=re.exec(s))){
    if(!/\bitemtype\s*=\s*['"]https?:\/\/schema\.org\/BlogPosting['"]/i.test(m[1]))continue;
    marks.push({at:m.index,after:re.lastIndex});
  }
  for(i=0;i<marks.length;i++){
    chunk=s.substring(marks[i].at,marks[i+1]?marks[i+1].at:s.length);
    var close=chunk.indexOf('</article>');
    if(close>=0)chunk=chunk.slice(0,close+10);
    id=articleId(chunk);if(!id)continue;
    stats.article++;
    // Exact per-article source field from the attached functioning Hiker rule.
    m=/(?:^|[\s<])(?:[a-z]|data)-bg-loader-url\s*=\s*(["'])(.*?)\1/i.exec(chunk);
    u=m?m[2]:'';kind=u?'bg':'';
    if(!u){
      m=/(?:loadBannerDirect|loadImage)\s*\(\s*(["'])(.*?)\1/i.exec(chunk);
      u=m?m[2]:'';if(u)kind='banner';
    }
    if(!u){
      // Old style site variants sometimes emit an img within the same card.
      // Do not search the whole homepage: a global promotional image is not a cover.
      var img=/<img\b[^>]*>/ig,tag;
      while((tag=img.exec(chunk))){
        var a=tag[0],raw=C.attr(a,'data-original')||C.attr(a,'data-src')||
          C.attr(a,'data-echo')||C.attr(a,'data-lazy-src')||C.attr(a,'src');
        if(raw){u=raw;kind='inline';break;}
      }
    }
    ref=base||C.base();
    u=normal(u,ref);
    if(!u||generic(u))continue;
    // If a card includes several links, restrict the thumbnail to its own
    // matched article block only; matching article IDs remain the join key.
    out[id]={url:u,kind:kind};
    stats[kind]=(stats[kind]||0)+1;
  }
  return {byId:out,stats:stats};
}
var aesSuffix='';
function exactAES(){
  if(aesSuffix)return aesSuffix;
  try{
    aesSuffix='@js='+$.toString(function(){
      var CryptoUtil=$.require('hiker://assets/crypto-java.js');
      var k=CryptoUtil.Data.parseUTF8('f5d965df75336270');
      var v=CryptoUtil.Data.parseUTF8('97b60394abc2fbe1');
      return CryptoUtil.AES.decrypt(
        CryptoUtil.Data.parseInputStream(input),k,
        {mode:'AES/CBC/PKCS7Padding',iv:v}).toInputStream();
    });
  }catch(e){aesSuffix=C.imageSuffix();}
  return aesSuffix;
}
function coverUrl(entry,article){
  var u=entry.url,enc=entry.kind==='bg'||
    (entry.kind==='banner'&&/\/xiao\/|\/upload\/upload\/|\/upload_01\/|\/uploads\//i.test(u));
  if(!enc)return C.image(u,article);
  // Source rule uses URL?v=2 + @js; it deliberately does not require an
  // extra @headers transformation. Preserve raw URL (including its host).
  var mark=/(?:[?&])v=\d+(?:&|$)/i.test(u)?'':(u.indexOf('?')<0?'?v=2':'&v=2');
  return u+mark+exactAES();
}
function applyCover(result){
  if(!result||!(result.posts instanceof Array))return result;
  var posts=result.posts,html=result.html,base=result.url,r=sourceCards(html,base);
  var counts={},i,p,id,entry,key,trace={protocol:'BlogPosting + bg-loader-url',
    posts:posts.length,articles:r.stats.article,bg:r.stats.bg,banner:r.stats.banner,
    inline:r.stats.inline,matched:0,duplicates:0,final:0,missing:0,hosts:{},sample:[]};
  for(i=0;i<posts.length;i++){
    p=posts[i];id=articleId(p.url);entry=id&&r.byId[id];
    if(entry){key=entry.url.replace(/[?#].*$/,'').toLowerCase();counts[key]=(counts[key]||0)+1;}
  }
  for(i=0;i<posts.length;i++){
    p=posts[i];id=articleId(p.url);entry=id&&r.byId[id];
    // Explicitly discard previous context-based image guesses and generic OG images.
    if(!entry){p.rawImg='';p.img='';trace.missing++;continue;}
    trace.matched++;
    key=entry.url.replace(/[?#].*$/,'').toLowerCase();
    if(counts[key]>1){p.rawImg='';p.img='';trace.duplicates++;trace.missing++;continue;}
    p.rawImg=entry.url;
    p.img=coverUrl(entry,p.url);
    trace.final++;
    var host=(entry.url.match(/^https?:\/\/([^/?#]+)/)||[])[1]||'';
    if(host)trace.hosts[host]=(trace.hosts[host]||0)+1;
    if(trace.sample.length<2)trace.sample.push({id:id,kind:entry.kind,path:C.pathOf(entry.url).replace(/[?#].*$/,'').slice(0,110)});
  }
  C._cardCoverTrace5=trace;
  return result;
}
// Only list feeds are transformed. Detail's related cards and Settings' internal
// parsePosts calls remain on the unchanged historical business implementation.
C.home=function(page){return applyCover(oldHome.call(C,page));};
C.category=function(u,page){return applyCover(oldCategory.call(C,u,page));};
C.search=function(q,page){return applyCover(oldSearch.call(C,q,page));};
R.imageDiag=function(){
  try{setPageTitle('51吃瓜 · 封面协议 Test5');}catch(e){}
  var d=[],trace={},r=null;
  function row(v){d.push({title:S(v),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  row('Test5 · Build10205 · 附件 BlogPosting 封面协议');
  try{r=C.home(1);trace=C._cardCoverTrace5||{};}catch(e){
    row('首页封面解析异常：'+S(e.message||e).slice(0,120));setResult(d);return;
  }
  row('首页状态：'+(r&&r.ok?'正常':'失败')+' · HTML '+S(r&&r.html).length+' 字符');
  row('文章 '+trace.posts+' / BlogPosting '+trace.articles+' / 精确匹配 '+trace.matched);
  row('bg-loader '+trace.bg+' / JS Banner '+trace.banner+' / img '+trace.inline);
  row('专属封面 '+trace.final+' / 重复排除 '+trace.duplicates+' / 缺图 '+trace.missing);
  var hosts=Object.keys(trace.hosts||{}),i;
  for(i=0;i<hosts.length&&i<4;i++)row('图片域名：'+hosts[i]+'（'+trace.hosts[hosts[i]]+'）');
  var s=trace.sample||[];
  for(i=0;i<s.length;i++)row('样本 '+s[i].id+' ['+s[i].kind+'] '+s[i].path);
  if(r&&r.posts)for(i=0;i<r.posts.length;i++){
    var p=r.posts[i];if(!p.rawImg)continue;
    d.push({title:'文章 '+articleId(p.url)+' · 原封面协议',pic_url:p.img,
      url:'hiker://empty',col_type:'movie_2'});
    break;
  }
  if(!trace.final)row('未找到精确封面字段；请截图本页，不再使用网站宣传图冒充封面。');
  row('只展示解析计数与路径，未上传网页、图片或本地账号数据。');
  setResult(d);
};
})();