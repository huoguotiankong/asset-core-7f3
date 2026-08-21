/* MDAI PlaybackAdapter 2.7.0-test.1 */
var MDAIPlaybackV270=(function(){
    var KEY_STRATEGY='mdai_play_strategy_v2';
    var KEY_DIAG='mdai_play_diag_v2';
    function parseSeed(seed){
        if(seed&&typeof seed==='object')return seed;
        var s=String(seed||'').trim();
        if(!s)return {};
        if(s.charAt(0)==='{'){
            try{return JSON.parse(s);}catch(ignore){}
        }
        return {url:s};
    }
    function cleanUrl(core,u){
        u=String(u||'').trim();
        if(!u)return '';
        try{u=core.normalizeMediaUrl(u);}catch(ignore){}
        if(!/^https?:\/\//i.test(u)&&u.charAt(0)==='/')u=core.host()+u;
        return u;
    }
    function collect(core,seed){
        var x=parseSeed(seed), keys=['videoUrl','m3u8Url','hlsUrl','playUrl','sourceUrl','src','url'];
        var out=[], seen={};
        for(var i=0;i<keys.length;i++){
            var u=cleanUrl(core,x[keys[i]]);
            if(!u||seen[u])continue;
            seen[u]=1;
            out.push(u);
        }
        out.sort(function(a,b){
            var ah=/\.m3u8(?:$|\?)/i.test(a)||/%2em3u8/i.test(a)?0:1;
            var bh=/\.m3u8(?:$|\?)/i.test(b)||/%2em3u8/i.test(b)?0:1;
            return ah-bh;
        });
        return out;
    }
    function headers(core){
        return {'User-Agent':core.ua,'Referer':core.host()+'/media/'};
    }
    function proxy(core,u){
        try{return core.playProxyUrl(u);}catch(e){
            if(String(u).indexOf('/api/v1/m3u8/proxy?path=')>=0)return u;
            return core.host()+'/api/v1/m3u8/proxy?path='+encodeURIComponent(u);
        }
    }
    function markVideo(u){
        u=String(u||'');
        return u.indexOf('#isVideo=true#')>=0?u:(u+'#isVideo=true#');
    }
    function saveDiag(data){
        try{setItem(KEY_DIAG,JSON.stringify(data));}catch(ignore){}
    }
    function compat(core,raw,head){
        var p=proxy(core,raw);
        try{
            var name='mdai_v270_'+new Date().getTime()+'.m3u8';
            var cached=cacheM3u8(p,head,name);
            if(cached){
                saveDiag({version:'2.7.0-test.1',route:'compat-cache',time:new Date().getTime(),source:'proxy',ok:true});
                return markVideo(String(cached).split('##')[0].replace(/;\{[\s\S]*$/,'').trim());
            }
        }catch(e){
            saveDiag({version:'2.7.0-test.1',route:'compat-cache',time:new Date().getTime(),source:'proxy',ok:false,error:String(e.message||e).slice(0,180)});
        }
        return markVideo(p)+';{Referer@'+core.host()+'/media/&&User-Agent@'+core.ua+'}';
    }
    function play(core,seed){
        var list=collect(core,seed);
        if(!list.length){
            saveDiag({version:'2.7.0-test.1',route:'NO_SOURCE',time:new Date().getTime(),ok:false});
            return 'toast://未获取到可播放地址';
        }
        var raw=list[0], head=headers(core), p=proxy(core,raw);
        var strategy=getItem(KEY_STRATEGY,'smart');
        if(strategy==='compat')return compat(core,raw,head);

        var urls=[],names=[],heads=[];
        function push(name,u){
            if(!u)return;
            for(var i=0;i<urls.length;i++)if(String(urls[i]).split('#')[0]===String(u).split('#')[0])return;
            names.push(name);urls.push(markVideo(u));heads.push(head);
        }
        if(strategy==='direct'){
            push('原始直连',raw);
            push('稳定代理',p);
        }else if(strategy==='proxy'){
            push('稳定代理',p);
        }else{
            push('智能线路',p);
            push('原始直连',raw);
        }
        for(var j=1;j<list.length&&urls.length<3;j++)push('备用 '+(j+1),list[j]);
        saveDiag({
            version:'2.7.0-test.1',route:'play-model',strategy:strategy,time:new Date().getTime(),ok:true,
            sourceCount:list.length,lineCount:urls.length,primary:(strategy==='direct'?'direct':'proxy')
        });
        if(urls.length===1){
            return urls[0]+';{Referer@'+core.host()+'/media/&&User-Agent@'+core.ua+'}';
        }
        return JSON.stringify({urls:urls,names:names,headers:heads});
    }
    function strategy(){return getItem(KEY_STRATEGY,'smart');}
    function setStrategy(v){setItem(KEY_STRATEGY,String(v||'smart'));}
    function diag(){return getItem(KEY_DIAG,'');}
    return {version:'2.7.0-test.1',play:play,collect:collect,strategy:strategy,setStrategy:setStrategy,diag:diag};
})();
