/** ACFun Next 1.0.0-alpha9 - native play route matrix + signed-segment diagnostics + first-page whitespace trim */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha8 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha9';
A.buildNumber=10009;
A.build='2026.08.23-v1.0.0-alpha9';
A.runtimeMode='clean-next+a9-native-play-matrix-segment-auth-comic-trim';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v088.js?v=8800';
A.bootVer=8800;

A.__a9Host=function(){return A.s(getItem('acfun_next_good_host','')||A.staticApiHosts[0]).replace(/\/+$/,'');};
A.__a9Origin=function(u){var m=A.s(u).match(/^(https?:\/\/[^/?#]+)/i);return m?m[1]:'';};
A.__a9H5Origin=function(){return A.__a9Origin(A.h5Base)||'https://ac001dhzh5.d24m42dh.work';};
A.__a9SimpleHeaders=function(){var host=A.__a9Host();return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':host+'/','Origin':host};};
A.__a9H5Headers=function(){var h5=A.__a9H5Origin();return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':h5+'/','Origin':h5};};
A.__a9Literal=function(){try{var c=A.__a2Credential(false)||{};return A.s(A.deep(c,['referer','playerReferer','xReferer'],0)||'').trim();}catch(e){return'';}};
A.__a9AppHeaders=function(){var host=A.__a9Host(),h=A.headers(false,host),lit=A.__a9Literal()||'jhg_player';h.Referer=lit;h['X-Referer']=lit;h.Origin=A.__a9H5Origin();return h;};
A.__a9Redact=function(h){var o={},k;for(k in(h||{})){if(/^(?:aut|authorization|cookie)$/i.test(k))o[k]='***';else o[k]=h[k];}return o;};
A.__a9RespHeader=function(h,n){h=h||{};return A.s(h[n]!==undefined?h[n]:(h[n.toLowerCase()]!==undefined?h[n.toLowerCase()]:''));};
A.__a9Fetch=function(url,headers,timeout){
    var o={url:A.s(url),status:0,ct:'',body:'',cookie:'',location:'',error:''};
    try{
        var got=fetch(url,{timeout:Number(timeout||2600),method:'GET',withStatusCode:true,headers:headers||{}}),w=A.safeJson(got);
        if(!w){o.error='EMPTY_WRAPPER';return o;}
        o.status=Number(w.statusCode||w.status||0);o.body=w.body!==undefined?A.s(w.body):'';
        o.ct=A.__a9RespHeader(w.headers,'Content-Type');o.cookie=A.__a9RespHeader(w.headers,'Set-Cookie');o.location=A.__a9RespHeader(w.headers,'Location');
        return o;
    }catch(e){o.error=A.s(e.message||e);return o;}
};
A.__a9Watch=function(id){
    var host=A.__a9Host(),url=buildUrl(host+'/api/video/can/watch',{videoId:A.n(id)}),r=A.__a9Fetch(url,A.headers(false,host),2300),data=null,j=A.safeJson(r.body),cookie=r.cookie;
    try{if(j){A.storeSession(j);data=A.payload(r.body);}}catch(e0){data=j;}
    data=data&&typeof data==='object'?data:{};
    var out={ok:r.status>=200&&r.status<300,method:'GET',status:r.status,canWatch:A.s(A.pick(data,['canWatch','watch','allowWatch','status'],'')||''),reason:A.s(A.pick(data,['reason','reasonType','message','msg','info'],'')||'').slice(0,300),videoUrl:A.s(A.first(data.videoUrl)),previewUrl:A.s(A.first(data.previewUrl)),playPath:A.s(A.first(data.playPath)),cookie:cookie?'present':'',error:r.error||''};
    A.setDiag('play_watch',JSON.stringify(out));
    return{meta:out,data:data,cookie:cookie};
};
A.__a9Refresh=function(id,path){
    var out={ok:false,count:0,error:''};
    try{var r=A.tryApi('video/cdn/refresh',{videoId:A.n(id),path:A.s(path)},['POST'],{timeout:1900});out.ok=true;out.count=A.arr(r).length;}catch(e){out.error=A.s(e.message||e).slice(0,600);}
    A.setDiag('play_refresh',JSON.stringify(out));return out;
};
A.__a9UniquePaths=function(watch,seed){
    var out=[],seen={};function add(name,v){v=A.s(v).trim();if(!v||seen[v])return;seen[v]=1;out.push({name:name,path:v});}
    add('videoUrl',watch&&watch.videoUrl);add('playPath',watch&&watch.playPath);add('previewUrl',watch&&watch.previewUrl);add('seed',seed);return out;
};
A.__a9ResolveManifest=function(url,headers,depth){
    depth=Number(depth||0);if(depth>2)return{ok:false,url:url,status:0,ct:'',body:'',cookie:'',error:'redirect-depth'};
    var r=A.__a9Fetch(url,headers,2800);if(r.status>=200&&r.status<300&&/^#EXTM3U/m.test(r.body))return{ok:true,url:url,status:r.status,ct:r.ct,body:r.body,cookie:r.cookie,headers:headers};
    if(r.status>=300&&r.status<400&&r.location)return A.__a9ResolveManifest(r.location,headers,depth+1);
    var j=A.safeJson(r.body),p=null,u='';
    if(j){try{p=A.payload(r.body);}catch(e0){p=j;}try{u=A.mediaPath(p)||A.first(p);}catch(e1){u='';}}
    if(u&&/^https?:\/\//i.test(u)&&u!==url)return A.__a9ResolveManifest(u,headers,depth+1);
    return{ok:false,url:url,status:r.status,ct:r.ct,body:r.body,cookie:r.cookie,headers:headers,error:r.error||('not-m3u8 '+A.s(r.body).slice(0,160))};
};
A.__a9BodySnippet=function(s){return A.s(s).replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').slice(0,180);};
A.__a9Probe=function(url,label,headers){
    var o={label:label,status:0,ct:'',hexLen:0,first:'',body:'',error:''};if(!url){o.error='none';return o;}
    var r=A.__a9Fetch(url,headers,1900);o.status=r.status;o.ct=r.ct;o.body=(r.status>=200&&r.status<300)?'':A.__a9BodySnippet(r.body);o.error=r.error||'';
    if(o.status>=200&&o.status<300){try{var hx=A.s(fetch(url,{timeout:1900,toHex:true,headers:headers||{}})).replace(/\s+/g,'');o.hexLen=hx.length;o.first=hx.substring(0,32);}catch(e){o.error=A.s(e.message||e);}}
    return o;
};
A.__a9ProbeHeaders=function(cookie){
    var none={},ua={'User-Agent':A.__a9SimpleHeaders()['User-Agent']},api=A.__a9SimpleHeaders(),h5=A.__a9H5Headers(),app=A.__a9AppHeaders(),lit=A.__a9Literal()||'jhg_player',jhg={'User-Agent':ua['User-Agent'],'Referer':lit,'X-Referer':lit,'Origin':A.__a9H5Origin()},range={'User-Agent':ua['User-Agent'],'Range':'bytes=0-65535','Accept':'*/*','Accept-Encoding':'identity'};
    var out=[{name:'none',h:none},{name:'ua',h:ua},{name:'h5',h:h5},{name:'jhg',h:jhg},{name:'api',h:api},{name:'app',h:app},{name:'range',h:range}];
    if(cookie){var ch={'User-Agent':ua['User-Agent'],'Cookie':cookie};out.push({name:'cookie',h:ch});var cj={'User-Agent':ua['User-Agent'],'Cookie':cookie,'Referer':lit,'X-Referer':lit,'Origin':A.__a9H5Origin()};out.push({name:'cookie+jhg',h:cj});}
    return out;
};
A.__a9RouteCandidates=function(paths){
    var host=A.__a9Host(),out=[],seen={};function add(name,url,headers){url=A.s(url).trim();if(!url||seen[url+'|'+name])return;seen[url+'|'+name]=1;out.push({name:name,url:url,headers:headers});}
    for(var i=0;i<paths.length;i++){
        var p=paths[i],v=A.s(p.path).trim(),enc=encodeURIComponent(v);
        if(/^https?:\/\//i.test(v))add(p.name+'·direct',v,A.__a9AppHeaders());
        else{
            add(p.name+'·native',host+'/api/m3u8/play?path='+enc,A.__a9AppHeaders());
            add(p.name+'·root',host+'/m3u8/play?path='+enc,A.__a9AppHeaders());
            add(p.name+'·h5',host+'/api/m3u8/h5/decode?path='+enc,A.__a9SimpleHeaders());
        }
    }
    return out.slice(0,12);
};
A.__a9EvaluateRoutes=function(paths,watchCookie){
    var routes=A.__a9RouteCandidates(paths),logs=[],chosen=null;
    for(var i=0;i<routes.length;i++){
        var r=routes[i],m=A.__a9ResolveManifest(r.url,r.headers,0),entry={name:r.name,url:r.url,status:m.status,ct:m.ct,ok:!!m.ok,error:m.error||'',segment:'',key:'',probes:[]};
        if(m.ok){
            var res=A.__a8Resources(m.body||'');entry.segment=res.segment;entry.key=res.key;
            var hs=A.__a9ProbeHeaders(m.cookie||watchCookie||''),good=null;
            for(var j=0;j<hs.length;j++){
                var p=A.__a9Probe(res.segment,hs[j].name,hs[j].h);entry.probes.push(p);if(!good&&p.status>=200&&p.status<300&&p.hexLen>0)good={name:hs[j].name,headers:hs[j].h,probe:p};
            }
            var kp=A.__a9Probe(res.key,'key-none',{});entry.keyProbe=kp;
            if(good&&!chosen)chosen={route:r.name,manifestUrl:m.url,manifestHeaders:r.headers,segmentHeaders:good.headers,segmentMode:good.name,manifest:m,segment:res.segment,key:res.key};
        }
        logs.push(entry);if(chosen)break;
    }
    var compact=[];for(var k=0;k<logs.length;k++){
        var x=logs[k],ps=[];for(var q=0;q<x.probes.length;q++){var z=x.probes[q];ps.push(z.label+':'+z.status+'/'+z.ct+'/hex'+z.hexLen+(z.body?('/'+z.body):''));}
        compact.push(x.name+' manifest='+x.status+' '+x.ct+' ok='+x.ok+(x.error?' err='+A.__a9BodySnippet(x.error):'')+'\n  seg '+ps.join(' | ')+(x.keyProbe?'\n  key '+x.keyProbe.status+'/'+x.keyProbe.ct+'/hex'+x.keyProbe.hexLen:''));
    }
    A.setDiag('play_route_matrix',compact.join('\n\n').slice(0,6000));return{chosen:chosen,logs:logs};
};
A.__a9Cache=function(id,url,headers){
    try{var fname='acfun_a9_'+A.s(id||'video').replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+A.md5(url).substring(0,8)+'.m3u8';return A.s(cacheM3u8(A.s(url).replace(/#(?:isM3u8|noPre)#/g,'')+'#isM3u8#',{headers:headers||{},timeout:3800},fname));}catch(e){A.setDiag('play_cache_a9','ERR '+A.s(e.message||e));return'';}
};

A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},seed='';if(A.mediaLike(direct))seed=A.s(direct);if(!seed)seed=A.mediaPath(obj);
    var wr=A.__a9Watch(id),wm=wr.meta||{},paths=A.__a9UniquePaths(wm,seed),refreshPath=wm.playPath||wm.videoUrl||seed;A.__a9Refresh(id,refreshPath);
    var ev=A.__a9EvaluateRoutes(paths,wr.cookie||''),ch=ev.chosen,out={urls:[],names:[],headers:[]};
    if(ch){
        var cached=A.__a9Cache(id,ch.manifestUrl,ch.manifestHeaders);if(cached){out.urls.push(cached);out.names.push('已验证·'+ch.route);out.headers.push(ch.segmentHeaders||{});}
        out.urls.push(ch.manifestUrl+'#isM3u8#');out.names.push('实时·'+ch.route);out.headers.push(ch.manifestHeaders||{});
        A.setDiag('play',JSON.stringify({id:id,seed:seed,watch:wm,paths:paths,selected:{route:ch.route,manifest:ch.manifestUrl,segmentMode:ch.segmentMode},names:out.names,candidates:out.urls,segmentHeaders:A.__a9Redact(ch.segmentHeaders||{})}));
    }else{
        var p=paths.length?paths[0].path:seed,decode=A.decodePlayUrl(p),h=A.__a9SimpleHeaders(),cached2=decode?A.__a9Cache(id,decode,h):'';
        if(cached2){out.urls.push(cached2);out.names.push('诊断回退缓存');out.headers.push({});}
        if(decode){out.urls.push(decode+'#isM3u8#');out.names.push('诊断回退实时');out.headers.push(h);}
        A.setDiag('play',JSON.stringify({id:id,seed:seed,watch:wm,paths:paths,selected:null,names:out.names,candidates:out.urls}));
    }
    if(!out.urls.length)return'toast://未找到可播放线路';return JSON.stringify(out);
};

// Alpha8 already removed Hiker chrome. The remaining white block in the user's screenshot is inside
// the first source image itself, not a page inset. Alpha9 therefore trims only the leading near-white
// rows of the first comic image. All following pages keep their original pixels/aspect ratio.
A.__a9ComicRender=function(url,first){
    if(!first)return A.__a5ComicRender(url);
    var plain=A.s(url).trim();if(!plain)return'';plain=plain.replace(/_480(?=([?#]|$))/,'');
    var cache='hiker://files/cache/acfun_next_comic_first_trim/'+A.md5(plain)+'.png',abs='';try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}
    var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};
    try{return $(plain,headers).image(function(cacheAbs){return $.require('acfunComicTrim?rule=ACFun').trimTop(cacheAbs);},abs);}catch(e){A.setDiag('comic_trim_error',plain+'\n'+A.s(e.message||e));return A.__a5ComicRender(plain);}
};
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),d=[];try{setPageTitle('');}catch(e0){}
    var obj=A.comicChapter(fid,cid,cnum);if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return;}
    var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);A.setDiag('comic_payload_shape',shape);
    for(var i=0;i<imgs.length;i++){var pic=A.__a9ComicRender(imgs[i],i===0);if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});}
    if(!d.length)d.push({title:'章节没有可显示图片',col_type:'long_text',url:'hiker://empty'});setResult(d);
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n播放：\n'+A.getDiag('play')+'\n\ncan/watch：\n'+A.getDiag('play_watch')+'\n\nCDN刷新：\n'+A.getDiag('play_refresh')+'\n\n播放路由矩阵：\n'+A.getDiag('play_route_matrix')+
    '\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画首图裁白错误：\n'+A.getDiag('comic_trim_error')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
})();
