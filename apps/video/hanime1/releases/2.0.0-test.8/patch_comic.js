/* Hanime1 2.0.0-test.8 - comic taxonomy and detail metadata */
(function(C,P,W){
var BUILD='2.0.0-test.8';
function dh(s){return W.dh(s);}
function strip(s){return W.strip(s);}
function attr(t,n){return W.attr(t,n);}
function abs(u){return C.abs(C.comicHost,dh(u));}
function img(f){var ts=String(f||'').match(/<img\b[^>]*>/gi)||[];for(var i=0;i<ts.length;i++){var ns=['data-srcset','data-src','src','srcset'];for(var j=0;j<ns.length;j++){var u=attr(ts[i],ns[j]);if(u){u=dh(u).split(',')[0].replace(/\s+\d+[wx]$/i,'').trim();if(u&&!/placeholder|loading|data:/i.test(u))return u;}}}return '';}
function comicCards(h){var out=[],seen={},re=/<a\b[^>]*href\s*=\s*(["'])([^"']*\/comic\/(\d+)[^"']*)\1[^>]*>([\s\S]*?)<\/a>/gi,m;while((m=re.exec(String(h||'')))!==null){var f=m[4],t=W.textClass(f,'comic-rows-videos-title')||strip(f),im=img(f);if(t&&!seen[m[3]]){seen[m[3]]=1;out.push({id:m[3],title:t,img:abs(im)});}if(m.index===re.lastIndex)re.lastIndex++;}return out;}
function typeOf(path){var p=String(path||'').replace(/^https?:\/\/[^/]+/i,'').split('?')[0].split('/').filter(Boolean)[0]||'';var map={artists:'作者',tags:'标签',languages:'语言',categories:'分类',groups:'社团',characters:'角色',parodies:'同人'};return map[p]||'';}
P.comicTaxonomy=[['标签','/comics/tags'],['作者','/comics/artists'],['角色','/comics/characters'],['同人','/comics/parodies'],['社团','/comics/groups'],['语言','/comics/languages'],['分类','/comics/categories']];
P.comicDirectory=function(path){path=path||'/comics/tags';var r=C.get(C.comicHost+path,{base:C.comicHost,referer:C.comicHost+'/comics',timeout:18000});if(r.challenge)throw new Error('NEED_VERIFY|'+C.comicHost+path+'|漫画分类');if(!r||Number(r.statusCode||0)>=400)throw new Error('漫画分类失败：HTTP '+Number((r&&r.statusCode)||0));var h=String(r.body||''),out=[],seen={},re=/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi,m;while((m=re.exec(h))!==null){var href=dh(m[2]),tp=typeOf(href),name=strip(m[3]);if(!tp||!name||name.length>80)continue;var key=href.replace(/^https?:\/\/[^/]+/i,'');if(seen[key])continue;seen[key]=1;var cm=name.match(/\((\d+)\)\s*$/),count=cm?cm[1]:'',clean=name.replace(/\s*\(\d+\)\s*$/,'').trim();if(clean)out.push({type:tp,name:clean,path:key,count:count});if(m.index===re.lastIndex)re.lastIndex++;}return out;};
var oldDetail=P.comicDetail;
P.comicDetail=function(id){var c=oldDetail(id),r=C.comic('/comic/'+id),h=String((r&&r.body)||''),tags=[],seen={},re=/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi,m;while((m=re.exec(h))!==null){var href=dh(m[2]),tp=typeOf(href),name=strip(m[3]);if(tp&&name){var k=tp+'|'+name;if(!seen[k]){seen[k]=1;tags.push({type:tp,name:name,path:href.replace(/^https?:\/\/[^/]+/i,'')});}}if(m.index===re.lastIndex)re.lastIndex++;}var hs=h.match(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi)||[],upload='';for(var i=0;i<hs.length;i++){var t=strip(hs[i]);if(/^上傳|^上传/.test(t)){upload=t.replace(/^上傳\s*[:：]?|^上传\s*[:：]?/,'').trim();break;}}c.tags=tags;c.artist=(tags.filter(function(x){return x.type==='作者';})[0]||{}).name||((String(c.title||'').match(/^\[([^\]]+)\]/)||[])[1]||'');c.upload=upload;c.related=comicCards(h);c.desc=c.desc||W.meta(h,'description');return c;};
P._comic8={cards:comicCards,typeOf:typeOf};
P.build=BUILD;C.build=BUILD;
})(HanimeCore,HanimeProvider,HanimeWeb6);
