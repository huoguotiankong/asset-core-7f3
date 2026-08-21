es(hosts[hi], path);
            for (var ui=0;ui<urls.length;ui++) {
                var u = urls[ui];
                var methods = opt.method ? [opt.method] : ['POST','GET'];
                for (var mi=0;mi<methods.length;mi++) {
                    var method = methods[mi];
                    try {
                        var target = u, options = {timeout: opt.timeout || 6000, headers: ac.headers(), method: method, withStatusCode:true};
                        if (method == 'GET') target = buildUrl(u, params);
                        else options.body = params;
                        var wrap = JSON.parse(fetch(target, options));
                        attempts.push(method + ' ' + target + ' -> ' + wrap.statusCode);
                        if (wrap.statusCode >= 200 && wrap.statusCode < 300 && wrap.body) {
                            var jr = ac.safeJson(wrap.body);
                            if (jr) {
                                ac.storeToken(jr);
                                setItem('acfun_good_host', hosts[hi]);
                                setItem('acfun_last_api', target);
                                setItem('acfun_last_status', String(wrap.statusCode));
                                return {ok:true, raw:wrap.body, json:jr, url:target, status:wrap.statusCode, attempts:attempts};
                            }
                        }
                    } catch(e) { errs.push(method + ' ' + u + ': ' + (e.message || String(e))); }
                }
            }
        }
        return {ok:false, error:errs.slice(-5).join(' | '), attempts:attempts};
    },

    api: function(path, params, opt) {
        var r = ac.apiRaw(path, params, opt);
        if (!r.ok) throw new Error(r.error || ('接口失败: '+path));
        var data = ac.parseResp(r.raw);
        if (data == null) data = r.json;
        return data;
    },

    ensureTraveler: function() {
        if (getItem('acfun_token','')) return true;
        var p = {deviceId:ac.randomDevice(), appCode:ac.channel, channel:ac.channel, version:ac.appVersion, platform:'android'};
        try {
            var r = ac.apiRaw('user/traveler/', p, {timeout:4500});
            if (r.ok && ac.storeToken(r.json)) return true;
        } catch(e) {}
        return false;
    },

    arr: function(data) {
        if (Array.isArray(data)) return data;
        if (!data || typeof data != 'object') return [];
        var keys = ['list','records','rows','items','dataList','videoList','videos','content','resultList'];
        for (var i=0;i<keys.length;i++) if (Array.isArray(data[keys[i]])) return data[keys[i]];
        for (var k in data) {
            if (Array.isArray(data[k]) && data[k].length) return data[k];
        }
        for (var k2 in data) {
            if (data[k2] && typeof data[k2]=='object') {
                var a = ac.arr(data[k2]); if (a.length) return a;
            }
        }
        return [];
    },

    pick: function(o, keys, def) {
        if (!o) return def || '';
        for (var i=0;i<keys.length;i++) {
            var k=keys[i]; if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
        }
        return def || '';
    },

    itemInfo: function(x) {
        x = x || {};
        var v = x.video || x.videoInfo || x.content || x;
        if (v && v.video && typeof v.video=='object') v=v.video;
        var u = x.user || x.userInfo || x.blogger || v.user || v.userInfo || {};
        var id = ac.pick(v,['videoId','id','vid','lsjVideoId'], ac.pick(x,['videoId','id','vid'],''));
        var title = ac.pick(v,['videoTitle','title','name','video_title'], ac.pick(x,['title','name'], '未命名'));
        var img = ac.pick(v,['videoCover','cover','coverUrl','img','image','imgurl','poster','defaultVideoPoster'], ac.pick(x,['cover','img','image'],''));
        var author = ac.pick(u,['nickname','nickName','name','username','userName'], ac.pick(v,['author','userName','nickname'],''));
        var duration = ac.pick(v,['duration','videoDuration','video_duration'], '');
        var watch = ac.pick(v,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'], '');
        var like = ac.pick(v,['likeNum','likes','favoriteNum'], '');
        var uri = ac.pick(v,['videoUri','videoUrl','playUrl','url','movieurl'], '');
        return {id:String(id||''),title:String(title||'未命名'),img:String(img||''),author:String(author||''),duration:String(duration||''),watch:String(watch||''),like:String(like||''),uri:String(uri||''),raw:v};
    },

    image: function(u) {
        u = String(u || ''); if (!u) return '';
        if (/^https?:\/\//.test(u)) return u + '@Referer=';
        var cfg=ac.fetchConfig(false);
        var d=ac.deepFind(cfg,['imgDomain','imageDomain','cdnDomain'],0);
        if (typeof d=='string' && /^https?:\/\//.test(d)) return ac.normalizeHost(d)+'/'+u.replace(/^\/+/, '')+'@Referer=';
        return u;
    },

    fmtNum: function(v) {
        var n=Number(v); if (!isFinite(n)) return String(v||'');
        if (n>=10000) return (n/10000).toFixed(n>=100000?0:1)+'万';
        return String(n);
    },

    detailUrl: function(info) {
        return 'hiker://page/acfun_detail?rule=' + encodeURIComponent(MY_RULE.title) + '&simple=true#noHistory#';
    },

    addVideoCard: function(d, x, col) {
        var info=ac.itemInfo(x);
        var desc=[];
        if (info.author) desc.push(info.author);
        if (info.watch) desc.push('▶ '+ac.fmtNum(info.watch));
        if (info.like) desc.push('♥ '+ac.fmtNum(info.like));
        if (info.duration) desc.push(info.duration);
        d.push({
            title: info.title,
            desc: desc.join('  '),
            img: ac.image(info.img),
            url: ac.detailUrl(info),
            col_type: col || getItem('acfun_card_style','movie_2'),
            extra: {
                video_id: info.id,
                video_title: info.title,
                video_img: info.img,
                video_uri: info.uri,
                video_data: JSON.stringify(info.raw || {}),
                pageTitle: info.title,
                longClick: [
                    {title:'加入本地收藏', js: $.toString(function(){ var c=$.require('acfun_core'); return c.favoriteFromParams(); })},
                    {title:'复制标题', js: $.toString(function(){ return 'copy://'+(MY_PARAMS.video_title||''); })}
                ]
            }
        });
    },

    categoryList: function() {
        try { return ac.arr(ac.api('video/classifyList', {})); } catch(e) {}
        try { return ac.arr(ac.api('video/classTypeList', {})); } catch(e2) {}
        return [];
    },

    videoList: function(tab, page) {
        var size=Number(getItem('acfun_page_size','20')) || 20;
        var cid=getMyVar('acfun_classify_id','');
        var p={pageNum:page,page:page,pageSize:size,limit:size,sortType:tab,orderBy:tab,classifyId:cid};
        var tries=[];
        if (cid) tries.push(['video/getByClassify',p]);
        if (tab=='short') {
            p.videoContentType='shortVideo'; p.videoType='shortVideo'; p.videoTypeName='shortVideo';
        }
        tries.push(['video/list',p]);
        if (tab=='recommend') tries.push(['video/guessLike',p]);
        for (var i=0;i<tries.length;i++) {
            try {
                var data=ac.api(tries[i][0], tries[i][1]);
                var a=ac.arr(data); if (a.length) return a;
            } catch(e) { setItem('acfun_last_list_error', e.message || String(e)); }
        }
        return [];
    },

    nav: function(d) {
        var tabs=[['推荐','recommend'],['最新','new'],['热门','hot'],['分类','classify'],['短视频','short']];
        var cur=getMyVar('acfun_tab','recommend');
        tabs.forEach(function(t){
            d.push({
                title: cur==t[1] ? '““””<b><font color="#7B61FF">'+t[0]+'</font></b>' : t[0],
                col_type:'scroll_button',
                url: $('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_tab',v); if(v!='classify') clearMyVar('acfun_classify_id'); refreshPage(); return 'hiker://empty';}, t[1])
            });
        });
        [['收藏','acfun_favorites'],['历史','acfun_history'],['设置','acfun_settings']].forEach(function(t){
            d.push({title:t[0],col_type:'scroll_button',url:'hiker://page/'+t[1]+'?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:t[0]}});
        });
    },

    home: function() {
        var d=[];
        ac.ensureTraveler();
        if (MY_PAGE==1) {
            d.push({title:'搜索',desc:'搜索视频 / UP / 标签