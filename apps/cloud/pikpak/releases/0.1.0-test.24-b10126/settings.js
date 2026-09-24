/* Test24: quality choice and an intentionally token-free stage diagnostic. */
(function(C,UI,Pages){
    function option(mode){return mode==='origin'?'原画优先':mode==='raw'?'原文件兼容':mode==='media'?'官方原顺序':'流畅转码优先';}
    Pages.settings=function(){var d=[],play=C.item('playback_route','smooth'),auto=C.item('handoff_auto_trash','on')!=='off',diag=C.readJsonItem('playback_diag',{});try{setPageTitle('PikPak 设置');}catch(e){}
        d.push({title:'播放默认线路',desc:option(play)+' · 播放器内仍可手动切换其他画质',url:$(['流畅转码优先','原画优先','官方原顺序','原文件兼容']).select(function(){return $.require('pikpak').setPlaybackRouteAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'最近一次取链诊断',desc:diag.stage?(diag.stage+' · '+(diag.apiMs||0)+' ms\n'+(diag.source||'')+' · '+(diag.first||'无线路')+' · '+(diag.format||'')+' · '+(diag.lineCount||0)+' 条线路'):'播放一个视频后显示；不保存链接或令牌',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'单账号 Web Session',desc:C.loggedIn()?'已连接':'未连接',url:UI.route('pikpakAccount'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'Magnet 退出自动回收',desc:auto?'开启 · 本次临时文件移入回收站':'关闭 · 保留在 My Pack',url:$(['开启','关闭']).select(function(){return $.require('pikpak').setHandoffCleanupAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        var f=C.item('drive_filter','all'),s=C.item('sort','name_asc');d.push({title:'目录筛选',desc:f==='video'?'仅视频':f==='folder'?'仅文件夹':'全部',url:$(['全部','仅视频','仅文件夹']).select(function(){return $.require('pikpak').setDriveFilterAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:s==='time_desc'?'最近修改':s==='size_desc'?'文件大小':s==='name_desc'?'名称倒序':'名称正序',url:$(['名称正序','名称倒序','最近修改','文件大小']).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只把已登记的文件移入回收站',url:'confirm://确定清理本程序登记的临时文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'Test24 · Build10126',desc:'先区分取链耗时和播放器缓冲；原生 APP 的网络调度与缓存不能仅靠换 URL 等价复制。Stable 未改。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);
