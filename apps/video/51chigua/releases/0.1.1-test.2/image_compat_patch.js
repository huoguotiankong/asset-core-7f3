/* 51吃瓜 Image Compatibility Patch 0.1.1-test.2 / Build10202 */
(function(){
if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')throw Error('51CG image core missing');
var C=Cg51Core,R=Cg51RemoteRuntime,VERSION='0.1.1-test.2',BUILD=10202;
var originalFirst=C.firstImage,originalParse=C.parsePosts,originalModule=R.module,originalSettings=R.settings;
C.version=VERSION;C.build=BUILD;C.imageCompatVersion=VERSION;
R.version=VERSION;R.build=BUILD;
function S(x){return String(x==null?'':x);}
function valid(u){return /^https?:\/\//i.test(S(u))&&!/(?:^|\/)(?:logo|favicon|avatar|loading|placeholder|blank|icon|emoji)(?:[_.\/-]|$)/i.test(u)&&!/\.svg(?:[?#]|$)/i.test(u);}
function url(x,base){x=S(x).trim().replace(/\\\//g,'/').replace(/&amp;/gi,'&');if(!x)return'';
if(/^[^\s,]+\s+(?:\d+(?:\.\d+)?[wx])(?:\s*,|$)/.test(x))x=x.split(/\s/)[0];
try{x=C.abs(x,base);}catch(e){return'';}return valid(x)?x:'';}
function extract(raw,base){
var s=S(raw),m,re=/<(?:img|source)\b([^>]*?)>/ig,keys=['data-xkrkllgl','data-original','data-src','data-lazy-src','data-lazy','data-echo','data-image','data-cover','data-url','data-poster','data-srcset','srcset','src'];
while((m=re.exec(s))){for(var i=0;i<keys.length;i++){var x=url(C.attr(m[1],keys[i]),base);if(x)return x;}}
re=/background(?:-image)?\s*:\s*url\s*\(\s*['"]?([^)'"]+)/ig;
while((m=re.exec(s))){var b=url(m[1],base);if(b)return b;}
re=/(?:loadBannerDirect|loadImage)\s*\(\s*['"]([^'"]+)['"]/ig;
while((m=re.exec(s))){var j=url(m[1],base);if(j)return j;}
return'';
}
C.firstImage=function(raw,base){var a=extract(raw,base);if(a)return a;try{return url(originalFirst.call(C,raw,base),base);}catch(e){return'';}};
C.parsePosts=function(html,base){
var posts=originalParse.call(C,html,base),src=S(html);
for(var i=0;i<posts.length;i++){var p=posts[i];if(!p||!p.url)continue;
var existing=url(p.rawImg,p.url),chosen=existing;
if(!chosen){var id=/\/archives\/(\d+)/.exec(p.url);if(id){
var needle='/archives/'+id[1],at=src.indexOf(needle);
if(at>=0){var excerpt=src.slice(Math.max(0,at-350),Math.min(src.length,at+1900));chosen=extract(excerpt,p.url);}
}}
if(chosen&&chosen!==existing){p.rawImg=chosen;p.img=C.image(chosen,p.url);}
if(chosen&&!p.img){p.rawImg=chosen;p.img=C.image(chosen,p.url);}
}
return posts;
};
// Existing key/IV and old encrypted URL routing are preserved. A source
// that now serves ordinary image bytes under /xiao/ must not be AES-decrypted.
C.imageSuffix=function(){return $('').image(function(){
var s=input;
try{
s=new java.io.BufferedInputStream(input);s.mark(48);
var h=[],i,n;for(i=0;i<24;i++){n=s.read();if(n<0)break;h.push(n&255);}s.reset();
function is(i,a){for(var j=0;j<a.length;j++)if(h[i+j]!==a[j])return false;return true;}
var plain=is(0,[255,216,255])||is(0,[137,80,78,71,13,10,26,10])||is(0,[71,73,70,56])||
is(0,[66,77])||(is(0,[82,73,70,70])&&is(8,[87,69,66,80]))||
(is(4,[102,116,121,112])&&(is(8,[97,118,105,102])||is(8,[104,101,105,99])||is(8,[104,101,105,102])||is(8,[109,105,102,49])))||
(h[0]===0&&h[1]===0&&(h[2]===1||h[2]===2)&&h[3]===0)||
is(0,[60,115,118,103])||is(0,[60,63,120,109,108]);
if(plain)return s;
var CryptoUtil=$.require('hiker://assets/crypto-java.js');
var key=CryptoUtil.Data.parseUTF8('f5d965df75336270');
var iv=CryptoUtil.Data.parseUTF8('97b60394abc2fbe1');
var crypt=CryptoUtil.Data.parseInputStream(s);
return CryptoUtil.AES.decrypt(crypt,key,{mode:'AES/CBC/PKCS7Padding',iv:iv}).toInputStream();
}catch(e){return s||input;}
});};
C.imageAudit=function(){
var r=C.home(1),a=r.posts||[],n=0,crypt=0,hosts={},first='';
for(var i=0;i<a.length;i++){var x=S(a[i].rawImg);if(!valid(x))continue;n++;if(!first)first=x;if(C.isEncryptedImage(x))crypt++;
var host=(x.match(/^https?:\/\/([^/?#]+)/)||[])[1]||'unknown';hosts[host]=(hosts[host]||0)+1;}
return{ok:r.ok,posts:a.length,covers:n,encrypted:crypt,hosts:hosts,first:first,base:C.base()};
};
R.imageDiag=function(){try{setPageTitle('51吃瓜 · 封面诊断');}catch(e){}
var d=[],a;function row(t,x){d.push({title:t,desc:S(x),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});}
row('封面修复 Test2','Build10202 · 明文图片直通 + 旧 AES 回退');
try{a=C.imageAudit();}catch(e){row('诊断失败',S(e.message||e));setResult(d);return;}
row('首页与文章',a.ok?'可访问，识别 '+a.posts+' 篇':'当前首页请求失败');
row('封面解析',a.covers+' 张有效 URL；历史加密路径 '+a.encrypted+' 张');
var hosts=Object.keys(a.hosts);for(var i=0;i<hosts.length&&i<5;i++)row('图片域名 '+(i+1),hosts[i]+'（'+a.hosts[hosts[i]]+' 张）');
if(a.first){
var head='@headers='+JSON.stringify({'User-Agent':C.ua,'Referer':a.base+'/','Cookie':'user-choose=true'});
d.push({title:'自动兼容',pic_url:C.image(a.first,a.base+'/'),col_type:'movie_2',url:'hiker://empty'});
d.push({title:'原始直连',pic_url:a.first+head,col_type:'movie_2',url:'hiker://empty'});
row('封面路径',a.first.replace(/^https?:\/\/[^/]+/,'').replace(/[?#].*$/,'').slice(0,120));
}else row('无封面 URL','如果文章存在但封面数为零，说明源站字段再次发生变化');
setResult(d);};
R.settings=function(){
var original=setResult,got=null,handled=false,ret,err;
try{setResult=function(v){got=v;handled=true;};ret=originalSettings.call(R);}catch(e){err=e;}finally{setResult=original;}
if(err)throw err;
if(handled&&got instanceof Array){got.push({title:'封面与图片诊断',desc:'对照自动解密与原始直连的图片显示',url:C.page('cg51ImageDiag'),col_type:'text_2',extra:{lineVisible:false}});return original(got);}
return ret;
};
R.module=function(){var m=originalModule.call(R);m.imageDiag=R.imageDiag;m.settings=R.settings;return m;};
})();
