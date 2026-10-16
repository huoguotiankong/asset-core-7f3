/* PikPak Test27 Build10129 - playback preference and consolidated Settings */
(function(C,UI,Pages){
    function title(v){try{setPageTitle(v);}catch(e){}}
    function playLabel(v){return v==='raw'?'原文件优先（兼容）':'官方流媒体优先（推荐）';}
    Pages.settings=function(){var d=[],sort=C.item('sort','name_asc'),filter=C.item('drive_filter','all'),auto=C.item('handoff_auto_trash','on')!=='off',play=C.item('playback_route','media'),startup=C.item('playback_startup_mode','official'),fresh=C.item('playback_force_fresh','off');title('PikPak 设置');
        d.push({title:'账号与会话',desc:C.loggedIn()?(C.sessionRecoveryRequired&&C.sessionRecoveryRequired()?'需要重新同步官方网页':'单账号 Web Session 已连接'):'未连接',url:UI.route('pikpakAccount'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'播放线路策略',desc:playLabel(play)+'\n会员账号建议保持推荐模式，优先使用 medias 专用播放 CDN，原文件直链仅作备用',url:$(['官方流媒体优先（推荐）','原文件优先（兼容）']).select(function(){return $.require('pikpak').setPlaybackRouteAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'▶ 起播画质偏好',desc:startup==='balanced'?'均衡画质优先（实验选项，仅重排已返回线路）':'官方原始顺序（推荐，不改变已验证线路）',url:$(['官方原始顺序（推荐）','均衡画质优先（实验）']).select(function(){return $.require('pikpak').setPlaybackStartupAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'播放时重新取链',desc:fresh==='on'?'开启：每次重新请求播放详情，避免短期签名链接过期，但会增加 API 请求':'关闭：沿用已验证的播放详情缓存（推荐）',url:$(['关闭（推荐）','开启（排查过期链接）']).select(function(){return $.require('pikpak').setFreshLinkAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'最近播放',desc:'本机最多 30 条成功取链的视频历史',url:UI.route('pikpakPlayHistory'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'播放诊断',desc:'检查取链耗时、返回线路数、首选线路和输出类型（不记录实际媒体 URL）',url:UI.route('pikpakPlayDiagnostics'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'跨小程序 Magnet 退出自动回收',desc:auto?'已开启：退出调用页后移入回收站':'已关闭：文件保留在 My Pack',url:$(['开启','关闭']).select(function(){return $.require('pikpak').setHandoffCleanupAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'目录筛选',desc:filter==='video'?'仅视频':filter==='folder'?'仅文件夹':'全部',url:$(['全部','仅视频','仅文件夹']).select(function(){return $.require('pikpak').setDriveFilterAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':sort==='name_desc'?'名称倒序':'名称正序',url:$(['名称正序','名称倒序','最近修改','文件大小']).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'🩺 检测当前登录授权',desc:'只读验证个人云盘接口，不显示任何凭据',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifySessionAction();}),col_type:'text_1',extra:{lineVisible:false}});d.push({title:'云盘搜索',url:UI.route('pikpakSearch'),col_type:'flex_button'});d.push({title:'星标',url:UI.route('pikpakStarred'),col_type:'flex_button'});d.push({title:'回收站',url:UI.route('pikpakRecycle'),col_type:'flex_button'});
        d.push({title:'清理临时播放文件',desc:'只把本程序登记的临时对象移入回收站',url:'confirm://确定清理当前单账号登记的临时播放文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'运行信息',desc:'Test27 · Build 10129\n播放：保留 Test23 JSON 合同；官方线路顺序默认不变\n可选均衡画质、每次重新取链、播放诊断和最近播放\n账号：单账号 Web Session，官方登录凭据接管前须验证 Drive API\nStable 尚未建立，当前需要实机验证',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);
