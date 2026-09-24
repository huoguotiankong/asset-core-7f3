/* PikPak Test23 Build10125 - native dashboard UI without the overflow button wall */
(function(C,P,UI){
    function nav(title,desc,pic,url){return {title:title,desc:desc||'',pic_url:pic,col_type:'icon_4',url:url,extra:{lineVisible:false}};}
    function chip(title,url){return {title:title,col_type:'flex_button',url:url,extra:{lineVisible:false}};}
    function quota(){var q=C.getQuotaCache(),x=q&&q.quota?q.quota:q;if(!x||!Number(x.limit||0))return '点击刷新容量';var use=Number(x.usage||0),limit=Number(x.limit||0),pct=Math.max(0,Math.min(100,Math.round(use*100/limit)));return C.formatSize(use)+' / '+C.formatSize(limit)+' · '+pct+'%';}
    UI.homeHeader=function(){
        var d=[],logged=C.loggedIn(),status=logged?'单账号 Web Session 已连接':'尚未登录';
        d.push({title:logged?'PikPak 云盘':'PikPak 云盘 · 未登录',desc:logged?(status+'\n'+quota()+' · 官方流媒体优先播放'):'使用官方 PikPak 网页接入；公开分享仍可免登录浏览',pic_url:'hiker://images/icon_cloud6',col_type:'avatar',url:logged?$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshQuotaCard();}):UI.route('pikpakAccount'),extra:{id:'pikpak_status',lineVisible:false}});
        if(logged){
            d.push(nav('云盘搜索','全盘文件名','hiker://images/icon_search6',UI.route('pikpakSearch')));
            d.push(nav('My Pack','磁链默认目录','hiker://images/icon_folder3',$("#noLoading#").lazyRule(function(){return $.require('pikpak').openMyPack();})));
            d.push(nav('最近文件','跨目录查看','hiker://images/icon_history',UI.route('pikpakRecent')));
            d.push(nav('星标文件','快速收藏','hiker://images/icon_star',UI.route('pikpakStarred')));
        }
        d.push(chip('♻ 回收站',UI.route('pikpakRecycle')));d.push(chip('⏳ 离线任务',UI.route('pikpakTasks')));d.push(chip('＋ 新建文件夹',$('', '文件夹名称').input(function(){return $.require('pikpak').createFolderAction('',input);})));d.push(chip('👤 账号',UI.route('pikpakAccount')));d.push(chip('⚙ 设置',UI.route('pikpakSettings')));
        d.push({title:'',desc:'粘贴 PikPak 分享链接 / Magnet / HTTP 离线链接',url:$.toString(function(){return $.require('pikpak').openInput(input);}),col_type:'input',extra:{inheritTitle:false,lineVisible:false}});
        var recent=C.recent();if(recent.length)d.push(UI.section('最近输入','点击再次打开','hiker://empty'));for(var i=0;i<recent.length&&i<3;i++){(function(v){var label=v.indexOf('magnet:')===0?'🧲 Magnet':(v.indexOf('/s/')>=0?'🔗 分享链接':'⇩ 离线链接');d.push(chip(label,$("#noLoading#").lazyRule(function(x){return $.require('pikpak').openInput(x);},v)));})(recent[i]);}
        d.push(logged?UI.section('我的文件','点击打开 · 长按管理 · 视频进入纯视频播放列表','hiker://empty'):UI.section('开始使用','登录后浏览个人网盘',UI.route('pikpakAccount')));return d;
    };
})(PikPakCore,PikPakProvider,PikPakUI);
