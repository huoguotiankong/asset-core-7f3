.collectMedia(v2,arr,names,depth+1,label);}
        }
    },

    danmuFile: function(id) {
        if (getItem('acfun_auto_danmu','1')!='1' || !id) return '';
        try {
            var data=ac.api('video/danmaku/list',{videoId:id,pageNum:1,pageSize:5000});
            var list=ac.arr(data), out=[];
            list.forEach(function(x){
                var text=ac.pick(x,['text','content','danmakuContent','comment_content'],'');
                var time=Number(ac.pick(x,['time','position','playTime','second','videoTime'],0));
                if(time>100000)time=time/1000;
                if(text)out.push({text:String(text),time:time||0});
            });
            if(!out.length)return '';
            var p='hiker://files/cache/acfun_danmu_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.json';
            writeFile(p,JSON.stringify(out));
            return p;
        } catch(e){return '';}
    },

    play: function(id, raw, direct) {
        var obj=ac.safeJson(raw)||{}; var urls=[],names=[];
        if(direct && ac.urlScore(direct)>=6){urls.push(direct);names.push('默认');}
        ac.collectMedia(obj,urls,names,0,'默认');
        if(!urls.length && id){
            var tries=[['video/can/watch',{videoId:id}],['video/cdn/refresh',{videoId:id}],['api/m3u8/play',{videoId:id}],['m3u8/play',{videoId:id}]];
            for(var i=0;i<tries.length && !urls.length;i++){
                try{var data=ac.api(tries[i][0],tries[i][1]);ac.collectMedia(data,urls,names,0,'线路');}catch(e){}
            }
        }
        var seen={},u2=[],n2=[];
        for(var j=0;j<urls.length;j++){var u=String(urls[j]);if(!seen[u]){seen[u]=1;u2.push(u);n2.push(names[j]||('线路'+(u2.length)));}}
        if(!u2.length)return 'toast://未解析到播放地址，请到设置→接口诊断查看详情/播放接口返回';
        var ret={urls:u2,names:n2,headers:u2.map(function(){return {'User-Agent':ac.ua,'Referer':''};})};
        var dm=ac.danmuFile(id); if(dm)ret.danmu=dm;
        return JSON.stringify(ret);
    },

    comments: function() {
        var d=[];var id=String(MY_PARAMS.video_id||'');setPageTitle('评论 · '+String(MY_PARAMS.video_title||''));
        if(MY_PAGE==1){
            var cur=getMyVar('acfun_comment_sort','hot');
            [['最热','hot'],['最新','new']].forEach(function(t){d.push({title:cur==t[1]?'““””<b><font color="#7B61FF">'+t[0]+'</font></b>':t[0],col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_comment_sort',v);refreshPage();return 'hiker://empty';},t[1])});});
        }
        var p={videoId:id,pageNum:MY_PAGE,pageSize:30,sortType:getMyVar('acfun_comment_sort','hot')}, list=[];
        try{list=ac.arr(ac.api('video/commentList',p));}catch(e){setItem('acfun_last_comment_error',e.message||String(e));}
        list.forEach(function(x){
            var u=x.user||x.userInfo||{};
            var name=ac.pick(u,['nickname','name','userName'],ac.pick(x,['userName','nickname'],'匿名'));
            var text=ac.pick(x,['content','commentContent','comment_content','text'],'');
            var tm=ac.pick(x,['createTime','time','createdAt'],'');
            var lk=ac.pick(x,['likeNum','likes','likeCount'],'');
            var title='<b>'+name+'</b>'+(lk?'　♥ '+ac.fmtNum(lk):'')+'<br>'+String(text||'').replace(/\n/g,'<br>')+(tm?'<br><small>'+tm+'</small>':'');
            d.push({title:title,col_type:'rich_text',url:'hiker://empty'});
        });
        if(!list.length&&MY_PAGE==1)d.push({title:'暂无评论或评论接口参数仍需校准',col_type:'text_center_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true'});
        setResult(d);
    },

    localPage: function(type) {
        var d=[], list=type=='fav'?ac.favoriteList():ac.historyList();
        setPageTitle(type=='fav'?'本地收藏':'播放历史');
        if(MY_PAGE==1)d.push({title:'共 '+list.length+' 条　｜　清空',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(k){setItem(k,'[]');refreshPage();return 'toast://已清空';},type=='fav'?'acfun_favs':'acfun_hist')});
        list.forEach(function(it){
            var raw=ac.safeJson(it.data)||{};
            ac.addVideoCard(d,{videoId:it.id,title:it.title,cover:it.img,videoUri:it.uri,video:raw},'movie_2');
        });
        if(!list.length)d.push({title:type=='fav'?'还没有本地收藏':'还没有播放历史',col_type:'text_center_1',url:'hiker://empty'});
        setResult(d);
    },

    settings: function() {
        var d=[]; setPageTitle('ACFun 设置');
        d.push({title:'接口与播放',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
        d.push({title:'接口诊断',desc:'查看 APK 动态配置、候选 API、分类/列表/详情接口响应',col_type:'text_1',url:'hiker://page/acfun_diag?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#'});
        d.push({title:'刷新动态域名',desc:'当前：'+(getItem('acfun_good_host','')||'尚未探测成功'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var c=$.require('acfun_core');c.fetchConfig(true);setItem('acfun_good_host','');refreshPage(false);return 'toast://已刷新配置';})});
        d.push({title:'手动 API 域名',desc:getItem('acfun_manual_host','未设置，默认自动识别'),col_type:'text_1',url:$(getItem('acfun_manual_host',''),'填写完整 API 域名，例如 https://example.com').input(function(){if(input.trim())setItem('acfun_manual_host',input.trim().replace(/\/+$/,''));else setItem('acfun_manual_host','');refreshPage(false);return 'toast://已保存';})});
        d.push({title:'自动弹幕：'+(getItem('acfun_auto_danmu','1')=='1'?'开':'关'),desc:'播放时自动请求 video/danmaku/list 并转换为海阔 JSON 弹幕',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_auto_danmu',getItem('acfun_auto_danmu','1')=='1'?'0':'1');refreshPage(false);return 'hiker://empty';})});
        d.push({title:'每页数量：'+getItem('acfun_page_size','20'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['12','20','30','40'];return 'select://'+JSON.stringify({title:'每页数量',options:a,selectedIndex:a.indexOf(getItem('acfun_page_size','20')),col:1,js:$.toString(function(){setItem('acfun_page_size',input);refreshPage(false);})});})});
        d.push({title:'卡片样式：'+getItem('acfun_card_style','movie_2'),col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var a=['movie_2','movie_3','movie_3_marquee'];return 'select://'+JSON.stringify({title:'首页卡片样式',options:a,selectedIndex:a.indexOf(getItem('acfun_card_style','movie_2')),col:1,js:$.toString(function(){setItem('acfun_card_style',input);refreshPage(false);})});})});
        d.push({title:'重置接口缓存/登录态',desc:'不会清除收藏和历史',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){['acfun_remote_config','acfun_remote_config_ts','acfun_good_host','acfun_token','acfun_last_api','acfun_last_status'].forEach(function(k){setItem(k,'');});return 'toast://已重置';})});
        d.push({title:'版本 '+ac.build,desc:'基于你提供的 acfun_1.9.7 APK 资源与接口字符串重构。二级页采用独立 simple 页面，不使用沉浸式标题栏。',col_type:'long_text',url:'hiker://empty'});
        setResult(d);
    },

    diagBlock: function(title, text) {
        return {title:'<b>'+title+'</b><br><small>'+String(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</small>',col_type:'rich_text',url:'hiker://empty'};
    },

    diag: function() {
        var d=[];setPageTitle('接口诊断');
        var cfg=ac.fetchConfig(false), hosts=ac.getHosts(false);
        d.push(ac.diagBlock('版本 / 配置源','小程序：'+ac.build+'\nAPK：'+ac.appVersion+'\n配置源：'+getItem('acfun_config_url','未成功')+'\n配置错误：'+getItem('acfun_last_config_error','')));
        d.push(ac.diagBlock('候选 API 域名',hosts.join('\n')));
        var tests=[['video/classifyList',{}],['video/list',{pageNum:1,pageSize:2,sortType:'recommend'}],['search/hot/list',{}],['sys/getDynamicDomain',{}]];
        tests.forEach(function(t){
            var r=ac.apiRaw(t[0],t[1],{timeout:4500});
            var txt=r.ok?('URL: '+r.url+'\nHTTP: '+r.status+'\n'+String(r.raw).slice(0,1800)):('失败：'+(r.error||'')+'\n尝试：'+(r.attempts||[]).join('\n'));
            d.push(ac.diagBlock(t[0],txt));
        });
        d.push({title:'复制诊断摘要',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var x='ACFun '+getItem('acfun_last_status','')+'\nHost='+getItem('acfun_good_host','')+'\nLast='+getItem('acfun_last_api','')+'\nConfigErr='+getItem('acfun_last_config_error','')+'\nListErr='+getItem('acfun_last_list_error','')+'\nSearchErr='+getItem('acfun_last_search_error','')+'\nDetailErr='+getItem('acfun_last_detail_error','')+'\nCommentErr='+getItem('acfun_last_comment_error','');return 'copy://'+x;})});
        setResult(d);
    }
};
$.exports = ac;