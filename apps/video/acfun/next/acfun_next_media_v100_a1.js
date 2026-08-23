/** ACFun Next 1.0.0-alpha1 - image/playback/readers */
(function(){
if (typeof ACFunNext !== 'object' || typeof ACFunNext.videoInfo !== 'function') throw new Error('ACFunNext provider missing');
var A = ACFunNext;
A.bootUrl = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v080.js?v=8000';
A.bootVer = 8000;

A.absImage = function(raw, domain) {
    var s = A.s(raw).trim().replace(/\\\//g, '/');
    if (!s) return '';
    if (s.indexOf('//') === 0) return 'https:' + s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/?jhimage\//i.test(s)) return A.imageCdn + s.replace(/^\/+/, '');
    var d = A.s(domain || getItem('acfun_next_img_domain','')).replace(/\/+$/, '');
    if (!d) d = A.imageCdn.replace(/\/+$/, '');
    return d + '/' + s.replace(/^\/+/, '');
};
A.image = function(raw, domain) {
    var url = A.absImage(raw, domain);
    if (!url) return '';
    var cacheUri = 'hiker://files/cache/acfun_next_img/' + A.md5(url) + '.img', abs = '';
    try {
        if (fileExist(cacheUri)) return getPath(cacheUri);
        abs = getPath(cacheUri);
    } catch (e) {}
    var good = getItem('acfun_next_good_host','') || A.staticApiHosts[0];
    var h = {'User-Agent':A.ua,'Referer':good.replace(/\/+$/,'')+'/','Origin':good};
    try {
        return $(url, h).image(function(cacheAbs){ return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs); }, abs);
    } catch (e2) {
        A.setDiag('image_error', url + '\n' + A.s(e2.message || e2));
        return url;
    }
};
A.playerHeaders = function() {
    var h = getItem('acfun_next_good_host','') || A.staticApiHosts[0];
    return {
        'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36',
        'Referer':h.replace(/\/+$/,'')+'/',
        'Origin':h
    };
};
A.decodePlayUrl = function(path) {
    path = A.s(path).trim();
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) {
        if (/\/api\/m3u8\//i.test(path) || /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(path)) return path;
    }
    var h = getItem('acfun_next_good_host','') || A.staticApiHosts[0];
    return h.replace(/\/+$/,'') + '/api/m3u8/h5/decode?path=' + encodeURIComponent(path);
};
A.play = function(id, raw, direct) {
    id = A.s(id); var obj = A.safeJson(raw) || raw || {}, path = '';
    if (A.mediaLike(direct)) path = A.s(direct);
    if (!path) path = A.mediaPath(obj);
    var used = path ? 'seed' : '';
    if (!path && id) {
        try { var g = A.tryApi('video/can/watch', {videoId:A.n(id)}, ['GET'], {timeout:1900}); path = A.mediaPath(g) || A.first(g && g.path !== undefined ? g.path : g); if (path) used='watch-get'; } catch (e) {}
    }
    if (!path && id) {
        try { var p = A.tryApi('video/can/watch', {videoId:A.n(id)}, ['POST'], {timeout:1900}); path = A.mediaPath(p) || A.first(p && p.path !== undefined ? p.path : p); if (path) used='watch-post'; } catch (e2) {}
    }
    var url = A.decodePlayUrl(path);
    A.setDiag('play', JSON.stringify({id:id,used:used,path:path,url:url}));
    if (!url) return 'toast://未获取到播放地址';
    return JSON.stringify({urls:[url], names:['播放'], headers:[A.playerHeaders()]});
};
A.playLazy = function(info) {
    var raw = JSON.stringify(info.raw || {});
    return $('hiker://empty#noLoading#').lazyRule(function(id,title,img,uri,raw,boot,ver){
        try {
            require(boot,{headers:{'Cache-Control':'no-cache'}},ver); ACFunNextBoot.loadOnly();
            ACFunNext.addHistory({kind:'video',id:String(id),title:String(title),img:String(img),uri:String(uri||''),data:String(raw),ts:Date.now()});
            return ACFunNext.play(String(id),String(raw),String(uri||''));
        } catch(e) { return 'toast://播放失败：'+String(e.message||e); }
    }, A.s(info.id), A.s(info.title), A.s(info.img), A.s(info.uri), raw, A.bootUrl, A.bootVer);
};
A.favoriteLazy = function(item) {
    return $('hiker://empty#noLoading#').lazyRule(function(data,boot,ver){
        try {
            require(boot,{headers:{'Cache-Control':'no-cache'}},ver); ACFunNextBoot.loadOnly();
            var x=JSON.parse(String(data)); var on=ACFunNext.toggleFavorite(x); refreshPage(false); return 'toast://'+(on?'已收藏':'已取消收藏');
        } catch(e) { return 'toast://操作失败：'+String(e.message||e); }
    }, JSON.stringify(item || {}), A.bootUrl, A.bootVer);
};

A.chapterRows = function(root, type) {
    var out=[], seen={}, count=0;
    function walk(v,d){
        if (v===undefined || v===null || d>10 || count>12000) return;
        if (Array.isArray(v)) { for(var i=0;i<v.length;i++) walk(v[i],d+1); return; }
        if (typeof v!=='object') return; count++;
        var id = type==='comic' ? A.pick(v,['chapterId','comicsChapterId','comicChapterId','id'],'') : A.pick(v,['chapterId','fictionChapterId','id'],'');
        var title = A.pick(v,['chapterTitle','chapterName','title','name'],'');
        if (id && !seen[A.s(id)]) { seen[A.s(id)]=1; out.push({id:A.s(id),title:A.s(title||('第'+(out.length+1)+'章')),raw:v}); }
        for(var k in v) if(v[k]&&typeof v[k]==='object') walk(v[k],d+1);
    }
    walk(root,0); return out;
};
A.comicChapter = function(comicsId, chapterId) {
    return A.objectFromApi('comic-chapter|'+comicsId+'|'+chapterId, 'comics/base/chapterInfo', [
        {chapterId:A.n(chapterId)},
        {comicsId:A.n(comicsId),chapterId:A.n(chapterId)},
        {comicId:A.n(comicsId),chapterId:A.n(chapterId)}
    ], ['POST','GET']);
};
A.comicImages = function(root) {
    var out=[], seen={}, domain=A.s(A.pick(root||{},['domain','imgDomain','imageDomain'],'')||''), count=0;
    function add(s){ s=A.s(s).trim(); if(!s||seen[s])return; if(!(/^(https?:)?\/\//i.test(s)||/\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/i.test(s)||/^(?:jhimage|comic|comics|image|img)\//i.test(s)))return; seen[s]=1;out.push(A.absImage(s,domain)); }
    function walk(v,k,d){
        if(v===undefined||v===null||d>11||count>16000)return;
        if(typeof v==='string'){if(/img|image|pic|picture|url|path/i.test(A.s(k)))add(v);return;}
        if(Array.isArray(v)){for(var i=0;i<v.length;i++){if(typeof v[i]==='string')add(v[i]);else walk(v[i],k,d+1);}return;}
        if(typeof v!=='object')return;count++;
        for(var key in v)walk(v[key],key,d+1);
    }
    if(root&&Array.isArray(root.imgList))for(var i=0;i<root.imgList.length;i++)add(root.imgList[i]);
    walk(root,'',0);return out;
};
A.fictionChapter = function(fid,cid) {
    return A.objectFromApi('fiction-chapter|'+fid+'|'+cid,'fiction/base/chapterInfo',[
        {fictionId:A.n(fid),chapterId:A.n(cid)},
        {chapterId:A.n(cid)},
        {fictionId:A.n(fid),fictionChapterId:A.n(cid)}
    ],['POST','GET']);
};
A.fictionPayload = function(root) {
    var texts=[], audios=[], images=[], seenT={},seenA={},seenI={},count=0;
    var base=A.s(A.pick(root||{},['playbackDomain','audioDomain','mediaDomain'],'')||''), auth=A.s(A.pick(root||{},['playbackAuthKey','authKey','auth_key'],'')||'');
    function add(a,seen,s){s=A.s(s).trim();if(s&&!seen[s]){seen[s]=1;a.push(s);}}
    function join(b,p){p=A.s(p).trim();if(!p)return'';if(p.indexOf('//')===0)return'https:'+p;if(/^https?:\/\//i.test(p))return p;if(b&&/^https?:\/\//i.test(b))return b.replace(/\/+$/,'')+'/'+p.replace(/^\/+/, '');return p;}
    function walk(v,key,d){
        if(v===undefined||v===null||d>11||count>16000)return;
        if(typeof v==='string'){
            var s=v.trim(), low=A.s(key).toLowerCase();
            if(/content|text|body|paragraph/.test(low)&&s&&!/^https?:\/\//i.test(s)&&s.length>1)add(texts,seenT,s);
            if(/audio|sourcepath|playpath|audiourl|mediaurl|url|path/.test(low)&&(/\.(?:mp3|m4a|aac|wav|ogg|flac|m3u8)(?:[?#]|$)/i.test(s)||/audio|sourcepath|playpath/.test(low))){var u=join(base,s);if(auth&&u&&u.indexOf('auth_key=')<0&&u.indexOf('authKey=')<0)u+=(u.indexOf('?')>=0?'&':'?')+'auth_key='+encodeURIComponent(auth);add(audios,seenA,u);}
            if(/image|img|picture|pic/.test(low)&&(/^(https?:)?\/\//i.test(s)||/\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/i.test(s)))add(images,seenI,A.absImage(s));
            return;
        }
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],key,d+1);return;}
        if(typeof v!=='object')return;count++;for(var k in v)walk(v[k],k,d+1);
    }
    walk(root,'',0);return{texts:texts,audios:audios,images:images};
};
})();
