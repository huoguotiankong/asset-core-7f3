/* PikPak Test18 Build10120 - cleanup preference in Settings */
(function(C,UI,Pages){
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sortMode=C.item('sort','name_asc'),filter=C.item('drive_filter','all'),auto=C.item('handoff_auto_trash','on')!=='off';
        d.push({title:'API 会话',desc:C.isWebSession&&C.isWebSession()?'官方 Web Session · 已连接':'当前未接入 Web Session',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'跨小程序 Magnet 退出自动回收',desc:auto?'已开启：关闭调用页后，本次临时播放文件移入回收站':'已关闭：退出后保留 My Pack 中的播放文件',url:$(['开启','关闭']).select(function(){return $.require('pikpak').setHandoffCleanupAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'目录筛选',desc:filter==='video'?'仅视频':filter==='folder'?'仅文件夹':'全部',url:$(['全部','仅视频','仅文件夹']).select(function(){return $.require('pikpak').setDriveFilterAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sortMode==='time_desc'?'最近修改':sortMode==='size_desc'?'文件大小':sortMode==='name_desc'?'名称倒序':'名称正序',url:$(['名称正序','名称倒序','最近修改','文件大小']).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'星标文件',desc:'跨文件夹收藏',url:UI.route('pikpakStarred'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'回收站',desc:'还原、永久删除或清空',url:UI.route('pikpakRecycle'),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'手动把本程序已登记的临时对象移入回收站',url:'confirm://确定清理临时播放文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test18 · Build 10120\n图片：海阔图片预览\n跨应用退出自动回收：'+(auto?'开启':'关闭')+'\n回收站：全盘 parent_id=*\nMagnet：视频列表 + My Pack',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);

