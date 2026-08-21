// ACFun v0.1.9 protocol patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.1.9';
ac.userMark='acfun';
ac.nativeMark='acfun@1.9.7';
ac.md5=function(text) {
        try {
            var md=java.security.MessageDigest.getInstance('MD5');
            var bytes=md.digest(new java.lang.String(String(text||'')).getBytes('UTF-8'));
            var sb=new java.lang.StringBuilder();
            for(var i=0;i<bytes.length;i++){
                var v=bytes[i]&255;
                if(v<16)sb.append('0');
                sb.append(java.lang.Integer.toHexString(v));
            }
            return String(sb.toString());
        } catch(e) { return ''; }
    };
ac.randomDevice=function() {
        var d = getItem('acfun_device_id','');
        if (d) return d;
        d = ac.md5(String(Date.now())+'-'+String(Math.random())+'-acfun-hiker');
        if(!d)d='hk'+String(Date.now())+String(Math.floor(Math.random()*1000000));
        setItem('acfun_device_id', d);
        return d;
    };
ac.headers=function(noAuth) {
        var ts=String(Date.now()), sub=ts.length>=8?ts.substring(3,8):ts;
        var h={
            'User-Agent': ac.ua,
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'deviceId': ac.randomDevice(),
            't': ts,
            's': ac.md5(sub),
            'User-Mark': ac.userMark,
            'Origin': ac.frontendBase,
            'Referer': ac.frontendBase+'/'
        };
        var token=getItem('acfun_token','');
        if(!noAuth && token)h['aut']=token;
        return h;
    };
ac.aesDecrypt=function(src) {
        src=String(src||'').trim(); if(!src)return '';
        var token=String(getItem('acfun_token','')||'');
        if(token.length<18)throw new Error('ACFun响应需要登录令牌才能解密');
        var secret=token.substring(2,18);
        try{
            var keyBytes=new java.lang.String(secret).getBytes('UTF-8');
            var key=new javax.crypto.spec.SecretKeySpec(keyBytes,'AES');
            var iv=new javax.crypto.spec.IvParameterSpec(keyBytes);
            var cipher=javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding');
            cipher.init(javax.crypto.Cipher.DECRYPT_MODE,key,iv);
            var enc=java.util.Base64.getDecoder().decode(src.replace(/\s+/g,''));
            var out=cipher.doFinal(enc);
            return String(new java.lang.String(out,'UTF-8'));
        }catch(e){throw new Error('ACFun encData AES解密失败: '+String(e.message||e));}
    };
ac.decodeEnvelope=function(jr) {
        if(!jr || typeof jr!='object')return jr;
        if(jr.encData!==undefined && jr.encData!==null && String(jr.encData).trim()){
            var plain=ac.aesDecrypt(String(jr.encData));
            var val=ac.safeJson(plain);
            jr.data=(val===null?plain:val);
        }
        return jr;
    };
ac.storeToken=function(obj) {
        var t = ac.deepFind(obj, ['token','userToken','accessToken'], 0);
        if (t && typeof t == 'string' && t.length > 16) {
            setItem('acfun_token', t);
            var img=ac.deepFind(obj,['imgDomain','imageDomain'],0);if(typeof img=='string')setItem('acfun_img_domain',img);
            return true;
        }
        return false;
    };
ac.candidateTargets=function(path) {
        path=String(path||'').replace(/^\/+/, '');
        var fd=ac.getDiscovered(), bases=ac.getApiBases(false), out=[];
        var route=fd&&fd.routes?String(fd.routes[path]||''):'';
        if(route){
            if(/^https?:\/\//i.test(route))out.push(route);
            else bases.forEach(function(b){
                b=ac.normalizeBase(b);if(!b)return;
                if(/^api\//i.test(route))out.push(b+'/'+route.replace(/^\/+/,''));
                else out.push(b+'/api/'+route.replace(/^\/+/,''));
            });
        }
        // APK/Web 当前协议的 BaseOptions 固定以 /api/ 为 REST 前缀。
        bases.forEach(function(b){b=ac.normalizeBase(b);if(b)out.push(b+'/api/'+path);});
        // 仅保留前端自动发现的非根路径前缀作为最后兜底，不再无意义探测 /video/*。
        var prefs=fd&&Array.isArray(fd.prefixes)?fd.prefixes:[];
        bases.forEach(function(b){
            b=ac.normalizeBase(b);if(!b)return;
            prefs.forEach(function(p){
                p=String(p||''); if(!p||p==='/'||p==='/api/')return;
                if(p.charAt(0)!=='/')p='/'+p;if(p.charAt(p.length-1)!=='/')p+='/';
                out.push(b+p+path);
            });
        });
        return ac.uniq(out).slice(0,24);
    };
ac.apiRaw=function(path, params, opt) {
        params=params||{};opt=opt||{};
        var urls=ac.candidateTargets(path),errs=[],attempts=[],maxAttempts=Number(opt.maxAttempts||8),count=0;
        var methods=opt.method?[String(opt.method).toUpperCase()]:(opt.write===true||opt.allowGet===false?['POST']:['GET']);
        outer:for(var mi=0;mi<methods.length;mi++){
            var method=methods[mi];
            for(var ui=0;ui<urls.length;ui++){
                if(count++>=maxAttempts)break outer;
                var u=urls[ui];
                try{
                    var target=u,options={timeout:Number(opt.timeout||2200),headers:ac.headers(!!opt.noAuth),method:method,withStatusCode:true};
                    if(method==='GET')target=buildUrl(u,params);else options.body=JSON.stringify(params||{});
                    var got=fetch(target,options),wrap=ac.safeJson(got);
                    if(!wrap){var e0=method+' '+target+' -> EMPTY WRAPPER';attempts.push(e0);errs.push(e0);continue;}
                    var status=Number(wrap.statusCode||wrap.status||0),body=wrap.body!==undefined?wrap.body:got;
                    body=body===undefined||body===null?'':String(body);
                    if(status>=200&&status<300&&!body.trim()){
                        var e1=method+' '+target+' -> HTTP '+status+' EMPTY_BODY';attempts.push(e1);errs.push(e1);continue;
                    }
                    var jr=ac.safeJson(body),code=jr&&jr.code!==undefined?jr.code:'',msg=jr?String(jr.message||jr.msg||jr.error||''):String(body||'');
                    var line=method+' '+target+' -> HTTP '+status+(code!==''?' code='+code:'')+(msg?' '+msg.replace(/\s+/g,' ').slice(0,110):'');attempts.push(line);
                    if(ac.isRouteMiss(jr,status,body)||status===405){errs.push(line);continue;}
                    if(status>=200&&status<300&&jr){
                        // 登录返回必须先保存 token；普通返回可能带 encData，后续 parseResp 解密。
                        ac.storeToken(jr);
                        var business=jr.code!==undefined?Number(jr.code):200;
                        if(business===200 || business===0 || isNaN(business)){
                            var origin=(target.match(/^https?:\/\/[^/]+/i)||[''])[0];if(origin)setItem('acfun_good_host',origin);
                            setItem('acfun_last_api',target);setItem('acfun_last_status',String(status));setItem('acfun_last_business_code',String(code));setItem('acfun_last_attempts',attempts.join('\n'));setItem('acfun_last_success_body',body.slice(0,1800));
                            return {ok:true,raw:body,json:jr,url:target,status:status,attempts:attempts};
                        }
                        // 301/302/1001/1003 等表示登录态失效。
                        if((business===301||business===302||business===1001||business===1003)&&!opt.noAuth){
                            setItem('acfun_token','');
                        }
                    }
                    errs.push(line+' BODY='+body.replace(/\s+/g,' ').slice(0,220));
                }catch(e){var ee=method+' '+u+' -> '+String(e.message||e);attempts.push(ee);errs.push(ee);}
            }
        }
        setItem('acfun_last_attempts',attempts.join('\n'));setItem('acfun_last_probe_error',errs.slice(-20).join('\n'));
        return {ok:false,error:errs.slice(-20).join(' | '),attempts:attempts};
    };
ac.api=function(path, params, opt) {
        opt=opt||{};
        if(!opt.noAuth && !/^user\/traveler\/?$/i.test(String(path||'')))ac.ensureTraveler();
        var r=ac.apiRaw(path,params,opt);
        if(!r.ok && !opt.noAuth && !/^user\/traveler\/?$/i.test(String(path||''))){
            // 空响应/令牌失效时强制重登录一次再重试。
            setItem('acfun_token','');setItem('acfun_traveler_try_ts','0');
            if(ac.ensureTraveler(true))r=ac.apiRaw(path,params,opt);
        }
        if(!r.ok)throw new Error(r.error||('接口失败: '+path));
        var data=ac.parseResp(r.raw);
        if(data==null)data=r.json;
        return data;
    };
ac.ensureTraveler=function(force) {
        if(!force && getItem('acfun_token',''))return true;
        var now=Date.now(),last=Number(getItem('acfun_traveler_try_ts','0'));
        if(!force && last && now-last<90*1000)return false;
        setItem('acfun_traveler_try_ts',String(now));
        var did=ac.randomDevice();
        // 当前 APK 编译标识已从 libapp.so 确认：appName=acfun，渠道=acfan。
        var bodies=[
            {deviceId:did,chCode:ac.channel},
            {deviceId:did,chCode:ac.channel,code:'',bza:'bza'},
            {deviceId:did,chCode:ac.channel,ttb:'A'}
        ];
        var paths=['user/traveler/','user/traveler'];
        var errs=[];
        for(var pi=0;pi<paths.length;pi++){
            for(var bi=0;bi<bodies.length;bi++){
                var r=ac.apiRaw(paths[pi],bodies[bi],{timeout:2600,maxAttempts:4,write:true,noAuth:true});
                if(r.ok){
                    var jr=r.json||ac.safeJson(r.raw);
                    if(ac.storeToken(jr)){
                        setItem('acfun_traveler_error','');
                        return true;
                    }
                    errs.push('登录成功响应但未找到token: '+String(r.raw||'').slice(0,240));
                }else errs.push(r.error||'traveler fail');
            }
        }
        setItem('acfun_traveler_error',errs.slice(-8).join('\n'));
        return false;
    };
ac.flattenVideos=function(data) {
        var out=[],seen={};
        function push(v){
            if(!v||typeof v!='object')return;
            var info=ac.itemInfo(v),id=String(info.id||'');
            if(id||info.title!='未命名'||info.img){var key=id||info.title+'|'+info.img;if(!seen[key]){seen[key]=1;out.push(v);}}
        }
        function walk(v,depth){
            if(v==null||depth>7)return;
            if(Array.isArray(v)){v.forEach(function(x){walk(x,depth+1);});return;}
            if(typeof v!='object')return;
            var looksVideo=(v.videoId!==undefined||v.videoTitle!==undefined||v.videoCover!==undefined||v.videoUri!==undefined||v.videoInfo!==undefined);
            if(looksVideo)push(v);
            ['videoList','videos','list','items','records','content','dataList'].forEach(function(k){if(v[k])walk(v[k],depth+1);});
        }
        walk(data,0);
        return out;
    };
ac.videoList=function(tab, page) {
        var size=Number(getItem('acfun_page_size','20'))||20;
        var cid=getMyVar('acfun_classify_id','');
        var cs=[];
        if(!cid){
            try{cs=ac.categoryList();}catch(e){}
            if(cs.length){
                if(tab==='short'){
                    for(var ci=0;ci<cs.length;ci++){
                        var typ=Number(ac.pick(cs[ci],['classifyType','type','videoType'],0));
                        var nm=String(ac.pick(cs[ci],['classifyName','name','title'],'')).toLowerCase();
                        if(typ===3||/短|short/.test(nm)){cid=String(ac.pick(cs[ci],['classifyId','id','videoTypeId','typeId'],''));break;}
                    }
                }
                if(!cid)cid=String(ac.pick(cs[0],['classifyId','id','videoTypeId','typeId'],'1'));
            }
        }
        var sort=tab==='new'?1:(tab==='hot'?2:0);
        var tries=[];
        if(cid){
            // 当前 Flutter API：getByClassify 才是分类视频列表；video/list 是频道/站点列表。
            tries.push(['video/getByClassify',{classifyId:Number(cid)||cid,page:page,pageSize:size,sortType:sort}]);
            tries.push(['video/list',{classifyId:Number(cid)||cid,page:page,pageSize:size}]);
        }else{
            tries.push(['video/list',{page:page,pageSize:size}]);
        }
        for(var i=0;i<tries.length;i++){
            try{
                var data=ac.api(tries[i][0],tries[i][1],{timeout:2400,maxAttempts:6});
                var a=ac.flattenVideos(data);if(a.length)return a;
                a=ac.arr(data);if(a.length && tries[i][0]==='video/getByClassify')return a;
            }catch(e){setItem('acfun_last_list_error',e.message||String(e));}
        }
        return [];
    };
ac.search=function() {
        var d=[];
        var kw=getParam('kw','')||getParam('s','')||getMyVar('acfun_search_kw','');
        if(!kw){try{kw=decodeURIComponent(getParam('q',''));}catch(e){}}
        putMyVar('acfun_search_kw',kw);
        var size=Number(getItem('acfun_page_size','20'))||20,list=[];
        var p={searchWord:kw,page:MY_PAGE,pageSize:size,searchType:1};
        try{list=ac.flattenVideos(ac.api('search/keyWordV2',p,{timeout:2400,maxAttempts:6}));}catch(e){setItem('acfun_last_search_error',e.message||String(e));}
        if(!list.length)try{list=ac.flattenVideos(ac.api('search/keyWord',p,{timeout:2400,maxAttempts:6}));}catch(e2){}
        list.forEach(function(x){ac.addVideoCard(d,x,'movie_2');});
        if(!list.length&&MY_PAGE==1)d.push({title:'没有搜索到结果',desc:'关键词：'+kw+'\n接口已按 APK 原生签名协议请求；如仍为空，请打开接口诊断复制“协议诊断摘要”。',col_type:'long_text',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        setResult(d);
    };
ac.parseResp=function(raw) {
        if(raw==null)return null;
        var res=ac.safeJson(raw);if(res==null)return null;
        res=ac.decodeEnvelope(res);
        if(res&&res.data!==undefined)return res.data;
        if(res&&res.result!==undefined)return res.result;
        if(res&&res.rows!==undefined)return res.rows;
        return res;
    };
ac.categoryList=function(){try{return ac.arr(ac.api('video/classifyList',{}, {timeout:2400,maxAttempts:6}));}catch(e){setItem('acfun_last_classify_error',e.message||String(e));return[];}};
var __oldImage=ac.image;ac.image=function(u){var d=getItem('acfun_img_domain','');if(d&&u&&!/^https?:\/\//.test(String(u)))return String(d).replace(/\/+$/,'')+'/'+String(u).replace(/^\/+/, '')+'@Referer=';return __oldImage.call(ac,u);};
})();
