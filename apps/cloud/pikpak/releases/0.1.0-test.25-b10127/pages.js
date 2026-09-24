/* PikPak Test25 Build10127 - playback preference and consolidated Settings */
(function(C,UI,Pages){
    function title(v){try{setPageTitle(v);}catch(e){}}
    function playLabel(v){return v==='raw'?'原文件优先（兼容）':'官方流媒体优先（推荐）';}
    Pages.settings=function(){var d=[],sort=C.item('sort','name_asc'),filter=C.item('drive_filter','all'),auto=C.item('handoff_auto_trash','on')!=='off',play=C.item('playback_route','media');title('PikPak 设置');
        d.push({title:'账号与会话',desc:C.loggedIn()?(C.sessionRecoveryRequired&&C.sessionRecoveryRequired()?'需要重新同步官方网页':'单账号 Web Session 已连接'):'未连接',url:UI.route('pikpakAccount'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'播放线路策略',desc:playLabel(play)+'\n会员账号建议保持推荐模式，优先使用 medias 专用播放 CDN，原文件直链仅作备用',url:$(['官方流媒体优先（推荐）','原文件优先（兼容）']).select(function(){return $.require('pikpak').setPlaybackRouteAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'跨小程序 Magnet 退出自动回收',desc:auto?'已开启：退出调用页后移入回收站':'已关闭：文件保留在 My Pack',url:$(['开启','关闭']).select(function(){return $.require('pikpak').setHandoffCleanupAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'目录筛选',desc:filter==='video'?'仅视频':filter==='folder'?'仅文件夹':'全部',url:$(['全部','仅视频','仅文件夹']).select(function(){return $.require('pikpak').setDriveFilterAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':sort==='name_desc'?'名称倒序':'名称正序',url:$(['名称正序','名称倒序','最近修改','文件大小']).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'云盘搜索',url:UI.route('pikpakSearch'),col_type:'flex_button'});d.push({title:'星标',url:UI.route('pikpakStarred'),col_type:'flex_button'});d.push({title:'回收站',url:UI.route('pikpakRecycle'),col_type:'flex_button'});
        d.push({title:'清理临时播放文件',desc:'只把本程序登记的临时对象移入回收站',url:'confirm://确定清理当前单账号登记的临时播放文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'运行信息',desc:'Test25 · Build 10127\n播放：回退到 Test23 的已知格式，medias 原顺序，原文件仅备用\n账号：单账号官方 Web Session\nStable 未改动',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);
