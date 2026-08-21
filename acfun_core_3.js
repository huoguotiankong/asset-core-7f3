',col_type:'input',url:$.toString(function(){return 'hiker://search?s='+encodeURIComponent(input)+'&rule='+encodeURIComponent(MY_RULE.title);}),extra:{defaultValue:'',onChange:$.toString(function(){})}});
            ac.nav(d);
            var tab=getMyVar('acfun_tab','recommend');
            if (tab=='classify') {
                var cs=ac.categoryList();
                if (!cs.length) d.push({title:'分类接口暂未返回数据',desc:'可到“设置 → 接口诊断”查看真实响应',col_type:'text_center_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
                cs.forEach(function(c,i){
                    var id=ac.pick(c,['classifyId','id','videoTypeId','typeId'], String(i));
                    var name=ac.pick(c,['classifyName','name','title','videoTypeName'],'分类'+(i+1));
                    var cur=getMyVar('acfun_classify_id','');
                    d.push({title:cur==String(id)?'““””<b><font color="#7B61FF">'+name+'</font></b>':String(name),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_classify_id',String(v));refreshPage();return 'hiker://empty';},String(id))});
                });
            }
        }
        var tab2=getMyVar('acfun_tab','recommend');
        if (tab2=='classify' && !getMyVar('acfun_classify_id','')) {
            var cs2=ac.categoryList();
            if (cs2.length) putMyVar('acfun_classify_id', String(ac.pick(cs2[0],['classifyId','id','videoTypeId','typeId'],'0')));
        }
        var list=ac.videoList(tab2, MY_PAGE);
        list.forEach(function(x){ac.addVideoCard(d,x);});
        if (!list.length && MY_PAGE==1) {
            d.push({title:'暂未获取到内容',desc:'第一版已把 APK 内的动态域名、分类、列表、搜索、详情、播放接口接入。若这里为空，请点“接口诊断”，把诊断页截图发我即可继续校准。',col_type:'long_text',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        }
        setResult(d);
    },

    search: function() {
        var d=[]; ac.ensureTraveler();
        var kw=getParam('kw','') || getParam('s','') || getMyVar('acfun_search_kw','');
        if (!kw) {
            try { kw=decodeURIComponent(getParam('q','')); } catch(e) {}
        }
        putMyVar('acfun_search_kw',kw);
        var size=Number(getItem('acfun_page_size','20'))||20;
        var p={keyword:kw,keyWord:kw,name:kw,pageNum:MY_PAGE,page:MY_PAGE,pageSize:size,limit:size,searchType:'video'};
        var list=[];
        try { list=ac.arr(ac.api('search/keyWordV2',p)); } catch(e) { setItem('acfun_last_search_error',e.message||String(e)); }
        if (!list.length) try { list=ac.arr(ac.api('search/keyWord',p)); } catch(e2) {}
        list.forEach(function(x){ac.addVideoCard(d,x,'movie_2');});
        if (!list.length && MY_PAGE==1) d.push({title:'没有搜索到结果',desc:'关键词：'+kw+'\n如 APP 内能搜到而这里为空，请从设置页打开接口诊断。',col_type:'long_text',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        setResult(d);
    },

    getDetail: function(id, fallback) {
        var obj = fallback || {};
        if (id) {
            try {
                var data=ac.api('video/getVideoById',{videoId:id,id:id});
                if (data && typeof data=='object') obj=data.video || data.videoInfo || data;
            } catch(e) { setItem('acfun_last_detail_error',e.message||String(e)); }
        }
        return obj || {};
    },

    favoriteList: function() { try{return JSON.parse(getItem('acfun_favs','[]'))||[];}catch(e){return[];} },
    historyList: function() { try{return JSON.parse(getItem('acfun_hist','[]'))||[];}catch(e){return[];} },
    saveList: function(key,list,max) { setItem(key,JSON.stringify((list||[]).slice(0,max||300))); },
    upsert: function(list,item) { var id=String(item.id||''); list=(list||[]).filter(function(x){return String(x.id||'')!=id || !id;}); item.time=Date.now(); list.unshift(item); return list; },
    paramItem: function() { return {id:String(MY_PARAMS.video_id||''),title:String(MY_PARAMS.video_title||''),img:String(MY_PARAMS.video_img||''),uri:String(MY_PARAMS.video_uri||''),data:String(MY_PARAMS.video_data||'{}')}; },
    favoriteFromParams: function() { var it=ac.paramItem(); var l=ac.upsert(ac.favoriteList(),it); ac.saveList('acfun_favs',l,500); return 'toast://已加入本地收藏'; },
    removeFavorite: function(id) { var l=ac.favoriteList().filter(function(x){return String(x.id)!=String(id);}); ac.saveList('acfun_favs',l,500); return true; },
    addHistory: function(item) { var l=ac.upsert(ac.historyList(),item); ac.saveList('acfun_hist',l,300); },

    isFavorite: function(id) { return ac.favoriteList().some(function(x){return String(x.id)==String(id);}); },

    detail: function() {
        var d=[];
        var id=String(MY_PARAMS.video_id||'');
        var fb=ac.safeJson(MY_PARAMS.video_data||'{}')||{};
        if (MY_PARAMS.video_title && !fb.title) fb.title=MY_PARAMS.video_title;
        if (MY_PARAMS.video_img && !fb.cover) fb.cover=MY_PARAMS.video_img;
        if (MY_PARAMS.video_uri && !fb.videoUri) fb.videoUri=MY_PARAMS.video_uri;
        var obj=ac.getDetail(id,fb); var info=ac.itemInfo(obj);
        if (!info.id) info.id=id; if (!info.title) info.title=MY_PARAMS.video_title||'视频详情';
        setPageTitle(info.title);
        setPagePicUrl(ac.image(info.img));
        var desc=[]; if(info.author)desc.push('UP：'+info.author); if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch)); if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
        d.push({title:info.title,desc:desc.join('  '),img:ac.image(info.img),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
        d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var c=$.require('acfun_core');var it={id:vid,title:title,img:img,uri:uri,data:raw};c.addHistory(it);return c.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
        d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var c=$.require('acfun_core');if(c.isFavorite(vid)){c.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=c.favoriteList();l=c.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});c.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
        d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
        var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');
        if (intro) d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
        var tags=ac.pick(obj,['videoTags','tags','tagList'],[]); if(Array.isArray(tags)&&tags.length){d.push({title:'标签：'+tags.map(function(t){return ac.pick(t,['name','title','tagName'],String(t));}).join(' · '),col_type:'long_text',url:'hiker://empty'});}
        var rel=[]; try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e){}
        if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
        rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
        setResult(d);
    },

    urlScore: function(u) {
        var s=0; u=String(u||'');
        if (/^https?:\/\//.test(u)) s+=3;
        if (/\.m3u8(\?|$)/i.test(u)) s+=8;
        if (/\.mp4(\?|$)/i.test(u)) s+=7;
        if (/play|video|m3u8|mp4/i.test(u)) s+=2;
        return s;
    },

    collectMedia: function(obj, arr, names, depth, keyName) {
        arr=arr||[];names=names||[];depth=depth||0;if(depth>9||obj==null)return;
        if(typeof obj=='string'){
            if(ac.urlScore(obj)>=6){arr.push(obj);names.push(String(keyName||'线路'));} return;
        }
        if(Array.isArray(obj)){obj.forEach(function(v,i){ac.collectMedia(v,arr,names,depth+1,keyName?keyName+(i+1):('线路'+(i+1)));});return;}
        if(typeof obj=='object'){
            var label=ac.pick(obj,['qualityName','clarityName','quality','clarity','resolution','name','title','bitrate'],keyName||'线路');
            for(var k in obj){
                var v=obj[k];
                if(typeof v=='string' && ac.urlScore(v)>=6){arr.push(v);names.push(String(label||k));}
            }
            for(var k2 in obj){var v2=obj[k2]; if(v2&&typeof v2=='object')ac