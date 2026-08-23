/** ACFun Next 1.0.0-alpha1 - provider/model adapters */
(function(){
if (typeof ACFunNext !== 'object' || typeof ACFunNext.api !== 'function') throw new Error('ACFunNext protocol missing');
var A = ACFunNext;

A.mediaLike = function(v) {
    var s = A.s(v).trim();
    return !!s && (/\.(?:m3u8|mp4|m4v|flv|ts)(?:[?#]|$)/i.test(s) || /^(?:jpc|jpd|hls|video|media)\//i.test(s) || /\/api\/m3u8\//i.test(s));
};
A.mediaPath = function(root) {
    root = root || {};
    var known = ['videoUrl','playUrl','videoUri','m3u8Url','m3u8','playPath','sourcePath'], generic = ['path','url'];
    var containers = [root], i, j, v;
    if (root.video && typeof root.video === 'object') containers.push(root.video);
    if (root.videoInfo && typeof root.videoInfo === 'object') containers.push(root.videoInfo);
    if (root.content && typeof root.content === 'object') containers.push(root.content);
    for (i = 0; i < containers.length; i++) {
        for (j = 0; j < known.length; j++) { v = A.first(containers[i][known[j]]); if (v) return v; }
        for (j = 0; j < generic.length; j++) { v = A.first(containers[i][generic[j]]); if (A.mediaLike(v)) return v; }
    }
    for (j = 0; j < known.length; j++) { v = A.first(A.deep(root, [known[j]], 0)); if (v) return v; }
    for (j = 0; j < generic.length; j++) { v = A.first(A.deep(root, [generic[j]], 0)); if (A.mediaLike(v)) return v; }
    return '';
};
A.videoInfo = function(x) {
    x = x || {};
    var v = x.video || x.videoInfo || x.content || x;
    if (v.video && typeof v.video === 'object') v = v.video;
    var u = x.user || x.userInfo || x.blogger || v.user || v.userInfo || {};
    var id = A.pick(v, ['videoId','id','vid','lsjVideoId'], A.pick(x, ['videoId','id','vid'], A.deep(x, ['videoId','lsjVideoId'], 0)));
    var title = A.pick(v, ['videoTitle','title','name','video_title'], A.pick(x, ['videoTitle','title','name'], '未命名视频'));
    var cover = A.first(A.pick(v, ['videoCover','coverImg','videoCoverImg','generatedCoverImg','templateCoverImg','defaultVideoPoster','cover','coverUrl','img','image','poster'], ''));
    if (!cover) cover = A.first(A.deep(x, ['videoCover','coverImg','generatedCoverImg','templateCoverImg','defaultVideoPoster','coverUrl'], 0));
    var author = A.pick(u, ['nickname','nickName','name','username','userName'], A.pick(v, ['authorName','author','userName','nickname'], ''));
    return {
        kind:'video', id:A.s(id), title:A.s(title || '未命名视频'), img:A.s(cover), author:A.s(author),
        duration:A.s(A.pick(v, ['duration','videoDuration','playTime','video_duration'], A.deep(x, ['duration','videoDuration'], 0))),
        watch:A.s(A.pick(v, ['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'], A.deep(x, ['watchNum','viewNum','statisticsTimes'], 0))),
        like:A.s(A.pick(v, ['likeNum','likes','favoriteNum','likeCount'], A.deep(x, ['likeNum','likeCount'], 0))),
        uri:A.mediaPath(x), desc:A.s(A.pick(v, ['description','desc','introduction','videoDesc'], '')), raw:x
    };
};
A.comicInfo = function(x) {
    x = x || {};
    var id = A.pick(x, ['comicsId','comicId','id','comic_id'], A.deep(x, ['comicsId','comicId'], 0));
    var title = A.pick(x, ['comicsTitle','comicTitle','title','name','comic_title'], A.deep(x, ['comicsTitle','comicTitle'], 0) || '未命名漫画');
    var cover = A.first(A.pick(x, ['coverImg','comicsCover','comicCover','verticalCover','cover','img','image','poster'], ''));
    if (!cover) cover = A.first(A.deep(x, ['coverImg','comicsCover','comicCover','verticalCover'], 0));
    return {kind:'comic', id:A.s(id), title:A.s(title), img:A.s(cover), author:A.s(A.pick(x, ['authorName','author','nickName','nickname'], '')), desc:A.s(A.pick(x, ['subTitle','subtitle','description','desc','info','introduction'], '')), raw:x};
};
A.fictionInfo = function(x, mode) {
    x = x || {};
    var id = A.pick(x, ['fictionId','bookId','novelId','id'], A.deep(x, ['fictionId','bookId'], 0));
    var title = A.pick(x, ['fictionTitle','bookTitle','bookName','novelTitle','title','name'], A.deep(x, ['fictionTitle','bookTitle'], 0) || '未命名');
    var cover = A.first(A.pick(x, ['fictionImg','fictionCover','fictionCoverImg','coverImg','verticalImg','cover','poster','img'], ''));
    if (!cover) cover = A.first(A.deep(x, ['fictionImg','fictionCover','fictionCoverImg','verticalImg'], 0));
    return {kind:mode === 'audio' ? 'audio' : 'fiction', id:A.s(id), title:A.s(title), img:A.s(cover), author:A.s(A.pick(x, ['authorName','author','nickName','nickname'], '')), desc:A.s(A.pick(x, ['description','desc','info','introduction'], '')), raw:x};
};
A.dynamicInfo = function(x) {
    x = x || {};
    var u = x.user || x.userInfo || x.blogger || {};
    var id = A.pick(x, ['dynamicId','postId','id'], A.deep(x, ['dynamicId','postId'], 0));
    var text = A.pick(x, ['dynamicContent','content','contentText','text','title'], A.deep(x, ['dynamicContent','contentText'], 0));
    var img = A.first(A.pick(x, ['dynamicImg','dynamicImage','cardImg','coverImg','imageUrl','imgUrl','backImg','images','pictures'], ''));
    return {kind:'community', id:A.s(id), title:A.clean(text) || '社区动态', img:A.s(img), author:A.s(A.pick(u, ['nickname','nickName','userName','name'], A.pick(x, ['userName','nickname','authorName'], ''))), like:A.s(A.pick(x, ['likeNum','likeCount','likes'], '')), comment:A.s(A.pick(x, ['commentNum','commentCount','comments'], '')), raw:x};
};

A.cachedList = function(key, freshMs, staleMs, loader) {
    var c = A.cacheRead(key, freshMs, staleMs);
    if (c.fresh && Array.isArray(c.data) && c.data.length) return c.data;
    try {
        var rows = loader() || [];
        rows = Array.isArray(rows) ? rows : A.arr(rows);
        if (rows.length) { A.cacheWrite(key, rows); return rows; }
    } catch (e) { A.setDiag('provider_error', key + '\n' + A.s(e.message || e)); }
    return c.hit && Array.isArray(c.data) ? c.data : [];
};
A.namedRows = function(rows, idKeys, nameKeys) {
    var out = [], i, x, id, name;
    for (i = 0; i < (rows || []).length; i++) {
        x = rows[i] || {}; id = A.pick(x, idKeys, ''); name = A.pick(x, nameKeys, '');
        if (!id || !name || /(?:测试|test|comicsclass|ces\d*|罗峰测试|竖版|竖横|横滑|六宫格|四宫格|两格|专题\d)/i.test(A.s(name))) continue;
        out.push({id:A.s(id), name:A.s(name), raw:x});
    }
    return A.uniq(out, function(z){ return z.id; });
};
A.stations = function(restricted) {
    restricted = restricted ? 1 : 0;
    return A.cachedList('station|' + restricted, 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('station/stations', {classifyId:4,page:1,pageSize:40,restricted:restricted}, ['GET','POST'], {timeout:1800});
        return A.namedRows(A.arr(raw), ['stationId','stationID','id'], ['stationName','stationTitle','title','name']);
    });
};
A.catalog = function(kind) {
    kind = kind === 'video' ? 'video' : 'anime';
    var type = kind === 'video' ? 4 : 2;
    return A.cachedList('catalog|' + kind, 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('video/classTypeList', {type:type,restricted:0}, ['GET','POST'], {timeout:1800});
        return A.namedRows(A.arr(raw), ['classifyId','classTypeId','videoTypeId','typeId','id'], ['classifyTitle','classTypeTitle','classifyName','classTypeName','videoTypeName','title','name']);
    });
};
A.zones = function(classId) {
    classId = A.s(classId);
    if (!classId) return [];
    return A.cachedList('zones|' + classId, 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('video/getZoneListByClassifyId', {classifyId:A.n(classId)}, ['GET','POST'], {timeout:1600});
        var out = A.namedRows(A.arr(raw), ['zoneId','id'], ['zoneTitle','zoneName','title','name']);
        for (var i = 0; i < out.length; i++) out[i].mode = 'zone';
        if (out.length) return out;
        var tags = A.tryApi('video/tags/getTagsZ', {videoTypeId:A.n(classId),classifyId:A.n(classId),restricted:0}, ['GET','POST'], {timeout:1600});
        var rows = A.arr(tags), t = [];
        for (var j = 0; j < rows.length; j++) {
            var n = A.pick(rows[j], ['videoTagName','videoTagValue','tagsTitle','tagTitle','tagName','name','title'], '');
            if (n) t.push({id:A.s(n),name:A.s(n),mode:'tag'});
        }
        return A.uniq(t, function(z){return z.id;});
    });
};
A.comicStations = function() {
    return A.cachedList('comic-stations', 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('comics/station/getComicsStations', {}, ['GET','POST'], {timeout:1800});
        return A.namedRows(A.arr(raw), ['stationId','comicsStationId','id'], ['stationName','stationTitle','name','title']);
    });
};
A.fictionTags = function(mode) {
    var type = mode === 'audio' ? 2 : 1;
    return A.cachedList('fiction-tags|' + mode, 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('fiction/other/tagList', {fictionType:type,type:type}, ['POST','GET'], {timeout:1800});
        return A.namedRows(A.arr(raw), ['fictionTagId','tagId','categoryId','id'], ['fictionTagName','tagName','categoryName','name','title']);
    });
};
A.communityCategories = function() {
    return A.cachedList('community-categories', 6*3600e3, 7*86400e3, function(){
        var raw = A.tryApi('dynamic/category/tree', {}, ['GET','POST'], {timeout:1800});
        return A.namedRows(A.arr(raw), ['categoryId','dynamicType','id'], ['categoryName','dynamicTypeName','name','title']);
    });
};

A.currentNamed = function(rows, stateKey, allowEmpty) {
    var id = A.s(getMyVar(stateKey, allowEmpty ? '' : (rows[0] ? rows[0].id : ''))), hit = null, i;
    for (i = 0; i < rows.length; i++) if (A.s(rows[i].id) === id) { hit = rows[i]; break; }
    if (!hit && !allowEmpty && rows.length) { hit = rows[0]; putMyVar(stateKey, A.s(hit.id)); }
    return hit;
};
A.sortValue = function() { return Number(getMyVar('acfun_next_sort', '1') || 1); };
A.pageSize = function() { return Math.max(6, Math.min(24, Number(getItem('acfun_next_page_size','10')) || 10)); };

A.listFor = function(section, page) {
    page = Number(page || 1); var size = A.pageSize(), sort = A.sortValue();
    if (section === 'featured' || section === 'lifan') {
        var restricted = section === 'lifan' ? 1 : 0, st = A.currentNamed(A.stations(restricted), 'acfun_next_station_' + section, false);
        if (!st) return [];
        if (page === 1 && st.raw && Array.isArray(st.raw.videoList) && st.raw.videoList.length) return st.raw.videoList.slice(0, size);
        return A.cachedList(section + '|station|' + st.id + '|' + sort + '|' + page, 180e3, 3600e3, function(){
            return A.arr(A.tryApi('station/getStationMore', {stationId:A.n(st.id),page:page,pageNum:page,pageSize:size,sortType:sort,restricted:restricted}, ['GET','POST'], {timeout:2000}));
        });
    }
    if (section === 'anime' || section === 'video') {
        var cls = A.currentNamed(A.catalog(section), 'acfun_next_class_' + section, false);
        if (!cls) return [];
        var zone = A.currentNamed(A.zones(cls.id), 'acfun_next_zone_' + section, true), p, route, key;
        if (zone && zone.mode === 'zone') {
            route = 'video/queryVideoByZone'; p = {page:page,pageNum:page,pageSize:size,zoneId:A.n(zone.id),classifyId:A.n(cls.id),sortType:sort};
            key = section + '|zone|' + cls.id + '|' + zone.id + '|' + sort + '|' + page;
        } else if (zone) {
            route = 'video/tagTitleList'; p = {page:page,pageNum:page,pageSize:size,tagsTitle:zone.name,classifyId:A.n(cls.id),sortType:sort,restricted:0};
            key = section + '|tag|' + cls.id + '|' + zone.name + '|' + sort + '|' + page;
        } else {
            route = 'video/getByClassify'; p = {classifyId:A.n(cls.id),page:page,pageNum:page,pageSize:size,sortType:sort,restricted:0};
            key = section + '|class|' + cls.id + '|' + sort + '|' + page;
        }
        return A.cachedList(key, 180e3, 3600e3, function(){ return A.arr(A.tryApi(route, p, ['GET','POST'], {timeout:2000})); });
    }
    if (section === 'comic') {
        var cs = A.currentNamed(A.comicStations(), 'acfun_next_comic_station', false);
        if (!cs) return [];
        if (page === 1 && cs.raw && Array.isArray(cs.raw.comicsBaseList) && cs.raw.comicsBaseList.length) return cs.raw.comicsBaseList.slice(0, size);
        return A.cachedList('comic|station|' + cs.id + '|' + sort + '|' + page, 180e3, 3600e3, function(){
            return A.arr(A.tryApi('comics/station/getStationComicsMore', {stationId:A.n(cs.id),page:page,pageNum:page,pageSize:size,sortType:sort}, ['GET','POST'], {timeout:2100}));
        });
    }
    if (section === 'short') {
        var lt = Number(getMyVar('acfun_next_short_type','2') || 2);
        return A.cachedList('short|' + lt + '|' + page, 90e3, 1200e3, function(){
            return A.arr(A.tryApi('video/list', {page:page,pageNum:page,pageSize:15,loadType:lt}, ['GET','POST'], {timeout:2000}));
        });
    }
    if (section === 'community') {
        var cat = A.s(getMyVar('acfun_next_community_cat','')), cp = {page:page,pageNum:page,pageSize:size,limit:size};
        if (cat) { cp.categoryId = A.n(cat); cp.dynamicType = A.n(cat); }
        return A.cachedList('community|' + cat + '|' + page, 90e3, 1200e3, function(){ return A.arr(A.tryApi('community/dynamic/list', cp, ['GET','POST'], {timeout:2100})); });
    }
    if (section === 'fiction' || section === 'audio') {
        var tag = A.s(getMyVar('acfun_next_fiction_tag_' + section, '')), fp = {page:page,pageNum:page,pageSize:size,limit:size,sortType:1,fictionType:section === 'audio' ? 2 : 1};
        if (tag) { fp.tagId = A.n(tag); fp.fictionTagId = A.n(tag); fp.categoryId = A.n(tag); }
        if (section === 'audio') fp.isAudio = 1;
        return A.cachedList(section + '|list|' + tag + '|' + page, 120e3, 3600e3, function(){ return A.arr(A.tryApi('fiction/base/findList', fp, ['POST','GET'], {timeout:2200})); });
    }
    return [];
};

A.videoSearch = function(q, page) {
    var size = A.pageSize(), tries = [
        ['video/queryVideoByTitle',{page:page,pageNum:page,pageSize:size,title:q,keyword:q,videoType:1},['GET','POST']],
        ['search/keyWordV2',{page:page,pageNum:page,pageSize:size,searchWord:q,keyword:q,keyWord:q,searchType:1},['GET','POST']],
        ['search/keyWord',{page:page,pageNum:page,pageSize:size,searchWord:q,keyword:q,keyWord:q,searchType:1},['GET','POST']]
    ];
    for (var i = 0; i < tries.length; i++) {
        var key = 'search|video|' + q + '|' + page + '|' + i, c = A.cacheRead(key, 120e3, 900e3);
        if (c.fresh && Array.isArray(c.data) && c.data.length) return c.data;
        try { var rows = A.arr(A.tryApi(tries[i][0], tries[i][1], tries[i][2], {timeout:2000})); if (rows.length) {A.cacheWrite(key,rows); return rows;} } catch (e) {}
        if (c.hit && Array.isArray(c.data) && c.data.length) return c.data;
    }
    return [];
};
A.searchFor = function(kind, q, page) {
    if (kind === 'video') return A.videoSearch(q, page);
    var p = {page:page,pageNum:page,pageSize:12,keyword:q,title:q};
    if (kind === 'comic') { p.comicsTitle = q; return A.cachedList('search|comic|'+q+'|'+page,120e3,900e3,function(){return A.arr(A.tryApi('comics/base/findList',p,['GET','POST'],{timeout:2200}));}); }
    if (kind === 'fiction' || kind === 'audio') { p.fictionTitle=q;p.fictionType=kind==='audio'?2:1;if(kind==='audio')p.isAudio=1;return A.cachedList('search|'+kind+'|'+q+'|'+page,120e3,900e3,function(){return A.arr(A.tryApi('fiction/base/findList',p,['POST','GET'],{timeout:2200}));}); }
    if (kind === 'community') { p.content=q;return A.cachedList('search|community|'+q+'|'+page,120e3,900e3,function(){return A.arr(A.tryApi('community/dynamic/list',p,['GET','POST'],{timeout:2200}));}); }
    return [];
};

A.objectFromApi = function(cacheKey, path, paramList, methods) {
    var c = A.cacheRead('detail|' + cacheKey, 600e3, 86400e3);
    if (c.fresh && c.data && typeof c.data === 'object') return c.data;
    for (var i = 0; i < paramList.length; i++) {
        try { var o = A.tryApi(path, paramList[i], methods, {timeout:2400}); if (o && typeof o === 'object') { A.cacheWrite('detail|' + cacheKey, o); return o; } } catch (e) {}
    }
    return c.hit && c.data && typeof c.data === 'object' ? c.data : {};
};
A.videoObject = function(id, seed) {
    seed = seed || {};
    var full = A.objectFromApi('video|' + id, 'video/getVideoById', [{videoId:A.n(id)},{id:A.n(id)}], ['GET','POST']);
    return A.merge(seed, full);
};
A.comicObject = function(id, seed) {
    seed = seed || {};
    return A.merge(seed, A.objectFromApi('comic|' + id, 'comics/base/info', [{comicsId:A.n(id)},{comicId:A.n(id)},{id:A.n(id)}], ['POST','GET']));
};
A.fictionObject = function(id, seed) {
    seed = seed || {};
    return A.merge(seed, A.objectFromApi('fiction|' + id, 'fiction/base/info', [{fictionId:A.n(id)},{bookId:A.n(id)},{id:A.n(id)}], ['POST','GET']));
};
})();
(function(){
var A=ACFunNext;
A.stationVideos=function(st,page,restricted){
    page=Number(page||1);restricted=restricted?1:0;if(!st||!st.id)return[];var size=A.pageSize();
    if(page===1&&st.raw&&Array.isArray(st.raw.videoList)&&st.raw.videoList.length)return st.raw.videoList.slice(0,Math.max(6,size));
    return A.cachedList('station-videos|'+restricted+'|'+st.id+'|'+page,180e3,3600e3,function(){return A.arr(A.tryApi('station/getStationMore',{stationId:A.n(st.id),page:page,pageNum:page,pageSize:size,sortType:A.sortValue(),restricted:restricted},['GET','POST'],{timeout:2100}));});
};
A.hotSearch=function(){
    return A.cachedList('search-hot',900e3,86400e3,function(){return A.arr(A.tryApi('search/hot/list',{page:1,pageSize:20},['GET','POST'],{timeout:1800}));});
};
A.videoComments=function(id,page,sort){
    var p={videoId:A.n(id),page:page,pageNum:page,pageSize:20,sortType:sort==='new'?'new':'hot'};
    return A.cachedList('comments|video|'+id+'|'+sort+'|'+page,90e3,900e3,function(){return A.arr(A.tryApi('video/commentList',p,['GET','POST'],{timeout:2100}));});
};
A.dynamicObject=function(id,seed){
    seed=seed||{};return A.merge(seed,A.objectFromApi('dynamic|'+id,'community/dynamic/dynamicInfo',[{dynamicId:A.n(id)},{id:A.n(id)},{postId:A.n(id)}],['GET','POST']));
};
A.dynamicComments=function(id,page){
    return A.cachedList('comments|dynamic|'+id+'|'+page,90e3,900e3,function(){return A.arr(A.tryApi('community/dynamic/commentList',{dynamicId:A.n(id),page:page,pageNum:page,pageSize:20},['GET','POST'],{timeout:2100}));});
};
})();
