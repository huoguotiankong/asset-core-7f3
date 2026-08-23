/** ACFun Next 1.0.0-alpha11 - playback credential recovery + signed-host repair + full comic border crop */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha10 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha11';
A.buildNumber=10011;
A.build='2026.08.23-v1.0.0-alpha11';
A.runtimeMode='clean-next+a11-credential-recovery-host-repair-comic-border-crop';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v090.js?v=9000';
A.bootVer=9000;

A.__a11Origin=function(u){var m=A.s(u).match(/^(https?:\/\/[^/?#]+)/i);return m?m[1].replace(/\/+$/,''):'';};
A.__a11ReplaceOrigin=function(u,domain){u=A.s(u).trim();domain=A.__a11Origin(domain)||A.s(domain).replace(/\/+$/,'');var old=A.__a11Origin(u);return old&&domain?domain+u.substring(old.length):u;};
A.__a11TokenLike=function(v){return /^\d{8,}-[^-]+-[^-]+-[0-9a-f]{24,64}$/i.test(A.s(v).trim());};
A.__a11SecretLike=function(v){v=A.s(v).trim();return v.length>=6&&v.length<=256&&!/^https?:\/\//i.test(v)&&!A.__a11TokenLike(v);};
A.__a11RedactValue=function(v){v=A.s(v).trim();if(!v)return'';return{len:v.length,kind:A.__a11TokenLike(v)?'token':'secret',md5:A.md5(v).substring(0,10)};};

A.__a11Exact=function(host,route,params,method){
    host=A.__a11Origin(host);route=A.s(route).replace(/^\/+/, '');method=A.s(method||'GET').toUpperCase();
    var o={ok:false,status:0,code:'',url:'',data:null,keys:[],error:''};if(!host||!route){o.error='bad target';return o;}
    var base=host+'/'+route,target=base,opt={timeout:1400,method:method,withStatusCode:true,headers:A.headers(false,host)};
    if(method==='GET')target=buildUrl(base,params||{});else opt.body=JSON.stringify(params||{});
    o.url=target;
    try{
        var got=fetch(target,opt),w=A.safeJson(got);if(!w){o.error='EMPTY_WRAPPER';return o;}
        o.status=Number(w.statusCode||w.status||0);var body=w.body!==undefined?A.s(w.body):'';
        if(o.status<200||o.status>=300){o.error='HTTP_'+o.status+' '+A.__a9BodySnippet(body);return o;}
        var jr=A.safeJson(body);if(!jr){o.error='NON_JSON';return o;}try{A.storeSession(jr);}catch(e0){}
        o.code=jr.code!==undefined?jr.code:(jr.statusCode!==undefined?jr.statusCode:'');
        var data=jr;try{data=A.payload(body);}catch(e1){}
        o.data=(data===undefined||data===null)?jr:data;try{o.keys=Object.keys(o.data&&typeof o.data==='object'?o.data:jr).slice(0,50);}catch(e2){}
        o.ok=(o.code===''||Number(o.code)===0||Number(o.code)===200||isNaN(Number(o.code)));
        if(!o.ok)o.error='CODE_'+o.code+' '+A.s(jr.message||jr.msg||'').slice(0,160);
        return o;
    }catch(e){o.error=A.s(e.message||e);return o;}
};

A.__a11CollectCred=function(root,bucket,label){
    bucket=bucket||{secrets:[],tokens:[],domains:[],referers:[],media:[],seen:{},sources:[]};label=A.s(label||'source');var count=0;
    function add(kind,v,keyName){v=A.s(v).trim();if(!v)return;var sig=kind+'|'+v;if(bucket.seen[sig])return;bucket.seen[sig]=1;
        if(kind==='domain'){var d=A.__a11Origin(v);if(!d)return;bucket.domains.push({value:d,source:label,key:keyName});}
        else if(kind==='referer')bucket.referers.push({value:v,source:label,key:keyName});
        else if(kind==='media')bucket.media.push({value:v,source:label,key:keyName});
        else if(A.__a11TokenLike(v))bucket.tokens.push({value:v,source:label,key:keyName});
        else if(A.__a11SecretLike(v))bucket.secrets.push({value:v,source:label,key:keyName});
    }
    function walk(v,d){if(v===undefined||v===null||d>10||count++>5000)return;
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return;}
        if(typeof v!=='object')return;
        for(var k in v){var val=v[k],lk=A.s(k).toLowerCase();
            if(/^(playbackauthkey|playback_auth_key|mediaauthkey|media_auth_key|m3u8authkey|m3u8_auth_key|authkey|auth_key|signkey|sign_key|playback_credential)$/.test(lk)){
                if(typeof val==='string'||typeof val==='number')add('secret',val,k);else walk(val,d+1);
            }
            if(/^(playbackdomain|playback_domain|mediadomain|media_domain|mp4domain|mp4_domain|m3u8h|m3u8domain|m3u8_domain)$/.test(lk))add('domain',val,k);
            if(/^(referer|playerreferer|xreferer|x_referer)$/.test(lk))add('referer',val,k);
            if(/^(videourl|playurl|playpath|previewurl|getmediaurl|presignedurl|signurl)$/.test(lk)&&typeof val==='string'&&/^https?:\/\//i.test(val))add('media',val,k);
        }
        for(var k2 in v)if(v[k2]&&typeof v[k2]==='object')walk(v[k2],d+1);
    }
    walk(root,0);bucket.sources.push(label);return bucket;
};

A.__a11CredentialSources=function(id,path,watch,refresh){
    var b={secrets:[],tokens:[],domains:[],referers:[],media:[],seen:{},sources:[]},log=[];
    function take(label,obj){A.__a11CollectCred(obj,b,label);}
    take('can-watch',watch||{});take('cdn-refresh',refresh||{});
    try{take('remote-config',A.remoteConfig(true)||{});}catch(e0){log.push('remote-config ERR '+A.s(e0.message||e0));}
    try{var c=A.__a2Credential(true)||{};take('player-referer-empty',c);log.push('player-referer-empty keys='+Object.keys(c).slice(0,30).join(','));}catch(e1){log.push('player-referer-empty ERR '+A.s(e1.message||e1));}
    var hostList=A.apiHosts(false),host=A.__a9Host(),params=[
        {name:'video',p:{videoId:A.n(id)}},
        {name:'path',p:{path:A.s(path)}},
        {name:'video+path',p:{videoId:A.n(id),path:A.s(path)}}
    ];
    for(var pi=0;pi<params.length;pi++){
        var rr=A.__a11Exact(host,'api/m3u8/player/referer',params[pi].p,'GET');log.push('referer '+params[pi].name+' '+rr.status+' '+rr.error+' keys='+rr.keys.join(','));if(rr.ok)take('player-referer-'+params[pi].name,rr.data);
    }
    var routes=['sys/getDynamicDomain','api/sys/getDynamicDomain','sys/sdk-config','api/sys/sdk-config'],probeHosts=[],phSeen={};
    function addPH(v){var h0=A.__a11Origin(v);if(h0&&!phSeen[h0]){phSeen[h0]=1;probeHosts.push(h0);}}
    addPH(host);addPH('https://api2.uszim.com');for(var ah=0;ah<hostList.length&&probeHosts.length<2;ah++)addPH(hostList[ah]);
    for(var hi=0;hi<probeHosts.length;hi++){
        var hh=probeHosts[hi];for(var ri=0;ri<routes.length;ri++){
            var ex=A.__a11Exact(hh,routes[ri],{videoId:A.n(id),path:A.s(path),app:'acfan',chCode:A.channel},'GET');
            log.push(A.__a11Origin(hh)+' /'+routes[ri]+' '+ex.status+' '+ex.error+' keys='+ex.keys.join(','));if(ex.ok)take('route:'+A.__a11Origin(hh)+'/'+routes[ri],ex.data);
            if(b.secrets.length||b.tokens.length)break;
        }
        if(b.secrets.length||b.tokens.length)break;
    }
    try{var vi=A.tryApi('video/getVideoById',{videoId:A.n(id)},['GET'],{timeout:2200});take('video-detail',vi);log.push('video-detail OK keys='+Object.keys(vi||{}).slice(0,40).join(','));}catch(e2){log.push('video-detail ERR '+A.s(e2.message||e2));}
    // De-duplicate recovered credentials. APK channel constants were tested offline against the observed
    // Type-A signatures and are deliberately NOT auto-used: no evidence currently ties them to HLS signing.
    var sk={},ss=[];for(var s=0;s<b.secrets.length;s++){var sv=b.secrets[s].value;if(sk[sv])continue;sk[sv]=1;ss.push(b.secrets[s]);}b.secrets=ss;
    var pub={secretCount:b.secrets.length,tokenCount:b.tokens.length,domainCount:b.domains.length,refererCount:b.referers.length,mediaCount:b.media.length,secrets:[],tokens:[],domains:[]};
    for(var a=0;a<b.secrets.length;a++)pub.secrets.push({source:b.secrets[a].source,key:b.secrets[a].key,meta:A.__a11RedactValue(b.secrets[a].value)});
    for(var t=0;t<b.tokens.length;t++)pub.tokens.push({source:b.tokens[t].source,key:b.tokens[t].key,meta:A.__a11RedactValue(b.tokens[t].value)});
    for(var d=0;d<b.domains.length;d++)pub.domains.push({source:b.domains[d].source,key:b.domains[d].key,value:b.domains[d].value});
    A.setDiag('play_credential_sources',JSON.stringify(pub).slice(0,6000));A.setDiag('play_credential_probe',log.join('\n').slice(0,6000));return b;
};

A.__a11ProbePair=function(seg,key,domain){
    var su=A.__a11ReplaceOrigin(seg,domain),ku=A.__a11ReplaceOrigin(key,domain),sp=A.__a10ProbeBinary(su,'segment'),kp=A.__a10ProbeBinary(ku,'key');
    return{domain:A.__a11Origin(domain),segment:sp,key:kp,ok:sp.status>=200&&sp.status<300&&sp.hexLen>0&&kp.status>=200&&kp.status<300&&kp.hexLen>=32};
};
A.__a11FindHostRepair=function(seg,key,domains){var seen={},logs=[],chosen=null;function add(v){var d=A.__a11Origin(v);if(!d||seen[d]||chosen)return;seen[d]=1;var su=A.__a11ReplaceOrigin(seg,d),sp=A.__a10ProbeBinary(su,'segment');logs.push(d+' seg='+sp.status+'/'+sp.ct+'/hex'+sp.hexLen+(sp.body?('/'+sp.body):''));if(sp.status>=200&&sp.status<300&&sp.hexLen>0){var ku=A.__a11ReplaceOrigin(key,d),kp=A.__a10ProbeBinary(ku,'key');logs.push('  key='+kp.status+'/'+kp.ct+'/hex'+kp.hexLen+(kp.body?('/'+kp.body):''));if(kp.status>=200&&kp.status<300&&kp.hexLen>=32)chosen={domain:d,segment:sp,key:kp,ok:true};}}add(seg);for(var i=0;i<(domains||[]).length;i++)add(domains[i]);A.setDiag('play_host_repair',logs.join('\n').slice(0,6000));return chosen;};
A.__a11RewriteOrigin=function(body,domain){return A.s(body).replace(/https?:\/\/[^\s"'<>]+/g,function(u){return A.__a11ReplaceOrigin(u,domain);});};

A.__a11TryEndpointAuth=function(path,cred){
    var host=A.__a9Host(),logs=[],chosen=null,vals=[];
    for(var i=0;i<cred.tokens.length;i++)vals.push(cred.tokens[i]);for(var j=0;j<cred.secrets.length;j++)vals.push(cred.secrets[j]);
    vals=vals.slice(0,8);for(var v=0;v<vals.length&&!chosen;v++){
        var auth=vals[v].value,enc=encodeURIComponent(A.s(path)),ae=encodeURIComponent(auth),routes=[
            host+'/api/m3u8/play?path='+enc+'&authKey='+ae,
            host+'/api/m3u8/play?path='+enc+'&auth_key='+ae,
            host+'/api/m3u8/h5/decode?path='+enc+'&authKey='+ae,
            host+'/api/m3u8/h5/decode?path='+enc+'&auth_key='+ae
        ];
        for(var r=0;r<routes.length;r++){
            var m=A.__a9ResolveManifest(routes[r],A.__a9AppHeaders(),0);logs.push('v'+v+' '+vals[v].source+' endpoint#'+r+' => '+m.status+' '+m.ct+' '+(m.error||''));
            if(m.ok){var rs=A.__a8Resources(m.body||''),p=A.__a11ProbePair(rs.segment,rs.key,A.__a11Origin(rs.segment));if(p.ok){chosen={manifest:m,route:routes[r],credential:vals[v],segment:rs.segment,key:rs.key,domain:p.domain};break;}}
        }
    }
    A.setDiag('play_endpoint_auth',logs.join('\n').slice(0,6000));return chosen;
};

A.__a11Write=function(id,body,label){try{var uri='hiker://files/cache/acfun_a11_'+A.s(label||'fixed')+'_'+A.s(id).replace(/[^A-Za-z0-9_-]/g,'_')+'_'+A.md5(body).substring(0,8)+'.m3u8';writeFile(uri,body);return getPath(uri);}catch(e){A.setDiag('play_write_a11','ERR '+A.s(e.message||e));return'';}};

A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},seed='';if(A.mediaLike(direct))seed=A.s(direct);if(!seed)seed=A.mediaPath(obj);
    var wr=A.__a9Watch(id),wm=wr.meta||{},watchData=wr.data||{},path=wm.videoUrl||seed||wm.playPath||'',refresh={};try{refresh=A.__a4CdnRefresh(id,path,true)||{};}catch(e0){}
    var host=A.__a9Host(),decode=path?( /^https?:\/\//i.test(path)?path:(host+'/api/m3u8/h5/decode?path='+encodeURIComponent(path)) ):'';
    var manifest=decode?A.__a9ResolveManifest(decode,A.__a9SimpleHeaders(),0):{ok:false},res=manifest.ok?A.__a8Resources(manifest.body||''):{key:'',segment:''};
    var cred=A.__a11CredentialSources(id,path,watchData,refresh),domains=[];if(wm.playPath)domains.push(wm.playPath);try{var ce=A.__a4CdnEntries(refresh);for(var ci=0;ci<ce.length;ci++)if(ce[ci].domain)domains.push(ce[ci].domain);}catch(e1){}for(var cd=0;cd<cred.domains.length;cd++)domains.push(cred.domains[cd].value);
    var out={urls:[],names:[],headers:[]},selected=null;

    if(res.segment&&res.key){var hr=A.__a11FindHostRepair(res.segment,res.key,domains);if(hr){var fixed=A.__a11RewriteOrigin(manifest.body,hr.domain),local=A.__a11Write(id,fixed,'host');if(local){out.urls.push(local+'#isM3u8#');out.names.push('签名线路修复');out.headers.push({});selected={mode:'host-repair',domain:hr.domain};}}}

    if(!selected&&path){var ea=A.__a11TryEndpointAuth(path,cred);if(ea&&ea.manifest&&ea.manifest.ok){var body=ea.manifest.body,local2=A.__a11Write(id,body,'auth');if(local2){out.urls.push(local2+'#isM3u8#');out.names.push('原生凭据HLS');out.headers.push({});}out.urls.push(ea.manifest.url+'#isM3u8#');out.names.push('原生凭据实时');out.headers.push(A.__a9AppHeaders());selected={mode:'endpoint-auth',source:ea.credential.source,key:ea.credential.key,domain:ea.domain};}}

    if(!selected&&manifest.ok&&res.segment&&res.key){var cfg={keys:[],domains:[]};for(var cs=0;cs<cred.secrets.length;cs++)cfg.keys.push(cred.secrets[cs].value);for(var cdom=0;cdom<domains.length;cdom++){var od=A.__a11Origin(domains[cdom]);if(od)cfg.domains.push(od);}var sg=A.__a10FindSigner(res.segment,res.key,cfg,domains);A.setDiag('play_resign_probe',sg.logs.join('\n').slice(0,6000));if(sg.chosen){var fb=A.__a10RewriteManifest(manifest.body,sg.chosen),local3=A.__a11Write(id,fb,'resign');if(local3){out.urls.push(local3+'#isM3u8#');out.names.push('客户端重签HLS');out.headers.push({});selected={mode:'client-resign',formula:sg.chosen.mode,domain:sg.chosen.domain,keyIndex:sg.chosen.keyIndex};}}}

    if(!out.urls.length){var paths=A.__a9UniquePaths(wm,seed),ev=A.__a9EvaluateRoutes(paths,wr.cookie||''),ch=ev.chosen;if(ch){var cached=A.__a9Cache(id,ch.manifestUrl,ch.manifestHeaders);if(cached){out.urls.push(cached);out.names.push('诊断回退缓存');out.headers.push(ch.segmentHeaders||{});}out.urls.push(ch.manifestUrl+'#isM3u8#');out.names.push('诊断回退实时');out.headers.push(ch.manifestHeaders||{});}else if(decode){var cached2=A.__a9Cache(id,decode,A.__a9SimpleHeaders());if(cached2){out.urls.push(cached2);out.names.push('诊断回退缓存');out.headers.push({});}out.urls.push(decode+'#isM3u8#');out.names.push('诊断回退实时');out.headers.push(A.__a9SimpleHeaders());}}
    A.setDiag('play',JSON.stringify({id:id,seed:seed,watch:wm,path:path,selected:selected,names:out.names,candidates:out.urls,credential:{secretCount:cred.secrets.length,tokenCount:cred.tokens.length,domainCount:cred.domains.length}}));
    if(!out.urls.length)return'toast://未找到可播放线路';return JSON.stringify(out);
};

A.__a11ComicRender=function(url){var plain=A.s(url).trim();if(!plain)return'';plain=plain.replace(/_480(?=([?#]|$))/,'');var cache='hiker://files/cache/acfun_next_comic_crop_a11/'+A.md5(plain)+'.jpg',abs='';try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};try{return $(plain,headers).image(function(cacheAbs){return $.require('acfunComicCrop?rule=ACFun').crop(cacheAbs);},abs);}catch(e){A.setDiag('comic_crop_error',plain+'\n'+A.s(e.message||e));return A.__a5ComicRender(plain);}};
A.comicReader=function(){var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),d=[];try{setPageTitle('');}catch(e0){}var obj=A.comicChapter(fid,cid,cnum);if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return;}var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);A.setDiag('comic_payload_shape',shape);for(var i=0;i<imgs.length;i++){var pic=A.__a11ComicRender(imgs[i]);if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});}if(!d.length)d.push({title:'章节没有可显示图片',col_type:'long_text',url:'hiker://empty'});setResult(d);};

A.diag=function(){setPageTitle('ACFun 资源诊断');var d=[];var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+'\n\n播放：\n'+A.getDiag('play')+'\n\ncan/watch：\n'+A.getDiag('play_watch')+'\nCDN刷新：\n'+A.getDiag('cdn_refresh')+'\n\n播放凭据来源：\n'+A.getDiag('play_credential_sources')+'\n\n播放凭据探针：\n'+A.getDiag('play_credential_probe')+'\n\n签名域名修复：\n'+A.getDiag('play_host_repair')+'\n\n原生凭据探针：\n'+A.getDiag('play_endpoint_auth')+'\n\n客户端重签探针：\n'+A.getDiag('play_resign_probe')+'\n\n播放路由矩阵：\n'+A.getDiag('play_route_matrix')+'\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画裁边错误：\n'+A.getDiag('comic_crop_error')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+'\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);};
})();
