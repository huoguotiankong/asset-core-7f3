/* Test24: a compact Hiker-native home, with no clipped avatar status or repeated Magnet chips. */
(function(C,UI){
    function action(name,icon,url){return {title:name,pic_url:icon,col_type:'icon_4',url:url,extra:{lineVisible:false}};}
    function button(name,url){return {title:name,col_type:'flex_button',url:url,extra:{lineVisible:false}};}
    function capacity(){var a=C.getQuotaCache(),q=a&&a.quota?a.quota:a;return q&&Number(q.limit||0)?C.formatSize(q.usage||0)+' / '+C.formatSize(q.limit||0):'点此刷新容量';}
    UI.homeHeader=function(){var d=[],logged=C.loggedIn(),status=logged?'已连接 · '+capacity():'未登录 · 请先同步官方网页';
        d.push({title:'PikPak  ·  '+(logged?'我的云盘':'欢迎使用'),desc:status,url:logged?$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshQuotaCard();}):UI.route('pikpakAccount'),col_type:'text_1',extra:{id:'pikpak_status',lineVisible:false}});
        if(logged){d.push(action('我的文件','hiker://images/icon_folder3',UI.route('pikpakDrive')));d.push(action('云盘搜索','hiker://images/icon_search6',UI.route('pikpakSearch')));d.push(action('My Pack','hiker://images/icon_folder3',$("#noLoading#").lazyRule(function(){return $.require('pikpak').openMyPack();})));d.push(action('离线任务','hiker://images/icon_download6',UI.route('pikpakTasks')));}
        d.push(button('最近',UI.route('pikpakRecent')));d.push(button('星标',UI.route('pikpakStarred')));d.push(button('回收站',UI.route('pikpakRecycle')));d.push(button('设置',UI.route('pikpakSettings')));
        d.push({title:'',desc:'分享链接 / Magnet / HTTP 链接',url:$.toString(function(){return $.require('pikpak').openInput(input);}),col_type:'input',extra:{inheritTitle:false,lineVisible:false}});
        d.push({title:'我的文件',desc:logged?'长按管理文件 · 仅视频进入播放列表':'登录后浏览个人网盘',url:logged?'hiker://empty':UI.route('pikpakAccount'),col_type:'text_1',extra:{lineVisible:false}});return d;
    };
})(PikPakCore,PikPakUI);
