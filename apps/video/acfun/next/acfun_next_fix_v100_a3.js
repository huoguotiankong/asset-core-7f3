/** ACFun Next 1.0.0-alpha3 - playback literal referer + permissive comic chapter transport */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha2 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha3';
A.buildNumber=10003;
A.build='2026.08.23-v1.0.0-alpha3';
A.runtimeMode='clean-next+a3-player-comic-transport';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v082.js?v=8200';
A.bootVer=8200;

A.__a3Origin=function(u){var m=A.s(u).match(/^(https?:\/\/[^/]+)/i);return m?m[1]:'';};
A.__a3Headers=function(refMode){
    var host=getItem('acfun_next_good_host','')||A.staticApiHosts[0];
    var cred={};try{cred=A.__a2Credential(false)||{};}catch(e){}
    var literal=A.s(A.deep(cred,['referer','playerReferer','xReferer'],0)||'').trim();
    var h5=A.__a3Origin(A.h5Base)||A.__a3Origin(A.webBase)||host;
    var ref='';
    if(refMode==='literal'&&literal)ref=literal;
    else if(refMode==='h5')ref=h5+'/';
    else if(refMode==='host')ref=host.replace(/\/+$/,'')+'/';
    var h={'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36'};
    if(ref){h.Referer=ref;h['X-Referer']=ref;}
    h.Origin=h5;
    return h;
};
A.__a3AddCandidate=function(out,name,url,headers){
    url=A.s(url).trim();if(!url)return;
    var sig=name+'|'+url+'|'+JSON.stringify(headers||{});
    if(!out.__seen)out.__seen={};if(out.__seen[sig])return;out.__seen[sig]=1;
    out.urls.push(url);out.names.push(name);out.headers.push(headers||{});
};
A.__a3Hls=function(u){u=A.s(u);return u&&u.indexOf('#isM3u8#')<0?u+'#isM3u8#':u;};

// Device returned {referer:"jhg_player"}. It is an opaque player credential, not a URL.
// Alpha2 incorrectly discarded non-http referers. Keep it literally as Referer/X-Referer,
// while also keeping H5/host/no-referer fallbacks so the device can tell us the accepted contract.
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},path='';
    if(A.mediaLike(direct))path=A.s(direct);if(!path)path=A.mediaPath(obj);var used=path?'seed':'';
    if(!path&&id)try{var g=A.tryApi('video/can/watch',{videoId:A.n(id)},['GET'],{timeout:1800});path=A.mediaPath(g)||A.first(g&&g.path!==undefined?g.path:g);if(path)used='watch-get';}catch(e0){}
    if(!path&&id)try{var p=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1800});path=A.mediaPath(p)||A.first(p&&p.path!==undefined?p.path:p);if(path)used='watch-post';}catch(e1){}
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:''}));return'toast://未获取到播放地址';}
    var decode=A.decodePlayUrl(path),out={urls:[],names:[],headers:[]},cred={};
    try{cred=A.__a2Credential(false)||{};}catch(e2){}
    var literal=A.s(A.deep(cred,['referer','playerReferer','xReferer'],0)||'').trim();
    if(decode){
        if(literal)A.__a3AddCandidate(out,'APP标识',A.__a3Hls(decode),A.__a3Headers('literal'));
        A.__a3AddCandidate(out,'H5来源',A.__a3Hls(decode),A.__a3Headers('h5'));
        A.__a3AddCandidate(out,'接口来源',A.__a3Hls(decode),A.__a3Headers('host'));
        A.__a3AddCandidate(out,'无来源',A.__a3Hls(decode),A.__a3Headers('none'));
    }
    var cfg={};try{cfg=A.remoteConfig(false)||{};}catch(e3){}
    var domain=A.s(A.deep(cred,['playbackDomain','mediaDomain','domain'],0)||A.deep(cfg,['playbackDomain','mediaDomain'],0)||'').replace(/\/+$/,'');
    var auth=A.s(A.deep(cred,['playbackAuthKey','authKey','auth_key'],0)||A.deep(cfg,['playbackAuthKey','authKey','auth_key'],0)||'');
    if(domain){
        var directUrl=domain+'/'+A.s(path).replace(/^\/+/, '');if(auth)directUrl+=(directUrl.indexOf('?')>=0?'&':'?')+'auth_key='+encodeURIComponent(auth);
        A.__a3AddCandidate(out,'CDN直连',A.__a3Hls(directUrl),A.__a3Headers(literal?'literal':'h5'));
        var q=encodeURIComponent(path);
        A.__a3AddCandidate(out,'APP播放',A.__a3Hls(domain+'/api/m3u8/play?path='+q+(auth?'&authKey='+encodeURIComponent(auth):'')),A.__a3Headers(literal?'literal':'h5'));
        A.__a3AddCandidate(out,'APP兼容',A.__a3Hls(domain+'/m3u8/play?path='+q+(auth?'&auth_key='+encodeURIComponent(auth):'')),A.__a3Headers(literal?'literal':'h5'));
    }
    delete out.__seen;
    if(!out.urls.length)return'toast://未生成播放线路';
    A.setDiag('play',JSON.stringify({id:id,used:used,path:path,decode:decode,credentialReferer:literal,playbackDomain:domain,hasAuth:!!auth,names:out.names,candidates:out.urls,headers:out.headers}));
    return JSON.stringify(out);
};

A.__a3FrontendHeaders=function(host){
    var h=A.headers(false,host),front=A.__a3Origin(A.h5Base)||A.__a3Origin(A.webBase)||'https://acapp.sexbar.site';
    h.Origin=front;h.Referer=front+'/';return h;
};
A.__a3ComicRequest=function(path,params){
    params=params||{};var hosts=A.apiHosts(false),attempts=[],modes=['GET_API','GET_FRONT','POST_JSON','POST_FRONT'];
    for(var hi=0;hi<hosts.length;hi++){
        var host=hosts[hi].replace(/\/+$/,''),base=host+'/api/'+A.s(path).replace(/^\/+/, '');
        for(var mi=0;mi<modes.length;mi++){
            var mode=modes[mi],method=mode.indexOf('POST')===0?'POST':'GET',front=mode.indexOf('FRONT')>0;
            try{
                var target=base,opts={timeout:2200,method:method,withStatusCode:true,headers:front?A.__a3FrontendHeaders(host):A.headers(false,host)};
                if(method==='GET')target=buildUrl(base,params);else opts.body=JSON.stringify(params);
                var got=fetch(target,opts),wrap=A.safeJson(got),status=wrap?Number(wrap.statusCode||wrap.status||0):0,body=wrap&&wrap.body!==undefined?String(wrap.body||''):'';
                var jr=A.safeJson(body),code=jr&&jr.code!==undefined?jr.code:'';
                attempts.push(mode+' '+host+' HTTP_'+status+(code!==''?' code='+code:''));
                if(status>=200&&status<300&&body.trim()){
                    try{A.storeSession(jr);}catch(e0){}
                    var data=null;try{data=A.payload(body);}catch(e1){attempts.push('payload '+A.s(e1.message||e1));}
                    if(data!==null&&data!==undefined&&typeof data==='object'){
                        setItem('acfun_next_good_host',host);
                        A.setDiag('comic_probe',attempts.join('\n')+'\nSUCCESS '+mode+' '+target+'\nBODY '+body.slice(0,1800));
                        return data;
                    }
                    if(jr&&typeof jr==='object'){
                        setItem('acfun_next_good_host',host);
                        A.setDiag('comic_probe',attempts.join('\n')+'\nSUCCESS_RAW '+mode+' '+target+'\nBODY '+body.slice(0,1800));
                        return jr;
                    }
                }
            }catch(e){attempts.push(mode+' '+host+' '+A.s(e.message||e));}
        }
    }
    A.setDiag('comic_probe',attempts.slice(-24).join('\n'));
    return {};
};
A.comicChapter=function(comicsId,chapterId){
    var key='detail|comic-chapter-a3|'+A.s(comicsId)+'|'+A.s(chapterId),c=A.cacheRead(key,600e3,86400e3);if(c.fresh&&c.data&&typeof c.data==='object')return c.data;
    var variants=[{chapterId:A.n(chapterId)},{comicsId:A.n(comicsId),chapterId:A.n(chapterId)},{comicId:A.n(comicsId),chapterId:A.n(chapterId)}];
    for(var i=0;i<variants.length;i++){var o=A.__a3ComicRequest('comics/base/chapterInfo',variants[i]);if(o&&typeof o==='object'&&Object.keys(o).length){A.cacheWrite(key,o);return o;}}
    return c.hit&&c.data&&typeof c.data==='object'?c.data:{};
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n播放：\n'+A.getDiag('play')+'\n\n播放凭据：\n'+A.getDiag('player_credential')+'\n播放凭据错误：\n'+A.getDiag('player_credential_error')+
    '\n\n漫画章节探针：\n'+A.getDiag('comic_probe')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
})();
