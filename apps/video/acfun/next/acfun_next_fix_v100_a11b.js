/** ACFun Next alpha11b - context-aware playback credential collector */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha11 missing');
var A=ACFunNext;
A.__a11CollectCred=function(root,bucket,label){
    bucket=bucket||{secrets:[],tokens:[],domains:[],referers:[],media:[],seen:{},sources:[]};label=A.s(label||'source');var count=0;
    function add(kind,v,keyName){v=A.s(v).trim();if(!v)return;var sig=kind+'|'+v;if(bucket.seen[sig])return;bucket.seen[sig]=1;
        if(kind==='domain'){var d=A.__a11Origin(v);if(!d)return;bucket.domains.push({value:d,source:label,key:keyName});}
        else if(kind==='referer')bucket.referers.push({value:v,source:label,key:keyName});
        else if(kind==='media')bucket.media.push({value:v,source:label,key:keyName});
        else if(A.__a11TokenLike(v))bucket.tokens.push({value:v,source:label,key:keyName});
        else if(A.__a11SecretLike(v))bucket.secrets.push({value:v,source:label,key:keyName});
    }
    function walk(v,d,ctx){if(v===undefined||v===null||d>10||count++>5000)return;
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1,ctx);return;}
        if(typeof v!=='object')return;
        for(var k in v){var val=v[k],lk=A.s(k).toLowerCase(),playCtx=ctx||/(?:playback|m3u8|media|cdn|player|stream)/i.test(lk);
            if(/^(playbackauthkey|playback_auth_key|mediaauthkey|media_auth_key|m3u8authkey|m3u8_auth_key|authkey|auth_key|signkey|sign_key)$/.test(lk)){
                if(typeof val==='string'||typeof val==='number')add('secret',val,k);else walk(val,d+1,true);
            }
            if(lk==='playback_credential'){
                if(typeof val==='string'){var pj=A.safeJson(val);if(pj&&typeof pj==='object')walk(pj,d+1,true);else add('secret',val,k);}else walk(val,d+1,true);
            }
            if(playCtx&&/^(key|token|secret|auth|credential|value)$/.test(lk)&&(typeof val==='string'||typeof val==='number'))add('secret',val,k);
            if(/^(playbackdomain|playback_domain|mediadomain|media_domain|mp4domain|mp4_domain|m3u8h|m3u8domain|m3u8_domain)$/.test(lk))add('domain',val,k);
            if(playCtx&&/^(domain|host|baseurl|base_url)$/.test(lk)&&typeof val==='string'&&/^https?:\/\//i.test(val))add('domain',val,k);
            if(/^(referer|playerreferer|xreferer|x_referer)$/.test(lk))add('referer',val,k);
            if(/^(videourl|playurl|playpath|previewurl|getmediaurl|presignedurl|signurl)$/.test(lk)&&typeof val==='string'&&/^https?:\/\//i.test(val))add('media',val,k);
        }
        for(var k2 in v)if(v[k2]&&typeof v[k2]==='object')walk(v[k2],d+1,ctx||/(?:playback|m3u8|media|cdn|player|stream)/i.test(A.s(k2)));
    }
    walk(root,0,false);bucket.sources.push(label);return bucket;
};
})();
