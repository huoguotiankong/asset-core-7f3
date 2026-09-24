/* PikPak Test16 Build10118 - polished native UI and video-only playlist tags */
(function(C,P,UI){
    function folder(f){return P.isFolder(f);}
    function video(f){return P.isVideo(f);}
    function desc(f){var a=[];if(folder(f))a.push('文件夹');else{if(f.size!=null)a.push(C.formatSize(f.size));a.push(C.mimeKind(f.mime_type||''));}if(f.modified_time)a.push(C.formatDate(f.modified_time));return a.join('  ·  ');}
    function img(f){if(folder(f))return 'hiker://images/icon_folder3';return String(f.thumbnail_link||f.icon_link||(video(f)?'hiker://images/icon_video':'hiker://images/icon_file'));}
    function manage(f){
        var id=String(f.id||''),name=String(f.name||''),mime=String(f.mime_type||''),a=[];
        if(!folder(f))a.push({title:'下载',js:$.toString(function(x){return $.require('pikpak').downloadPersonal(x.id,x.mime);},{id:id,mime:mime})});
        a.push({title:'创建分享链接',js:$.toString(function(x){return $.require('pikpak').createShareAction(x.id,x.name);},{id:id,name:name})});
        a.push({title:'移动',js:$.toString(function(x){return $.require('pikpak').openFolderPicker('move',x.id,x.name,x.kind);},{id:id,name:name,kind:String(f.kind||'')})});
        a.push({title:'复制',js:$.toString(function(x){return $.require('pikpak').openFolderPicker('copy',x.id,x.name,x.kind);},{id:id,name:name,kind:String(f.kind||'')})});
        a.push({title:'重命名',js:$.toString(function(x){return $.require('pikpak').renamePrompt(x.id,x.name);},{id:id,name:name})});
        a.push({title:'移到回收站',js:$.toString(function(x){return $.require('pikpak').trashPrompt(x.id,x.name);},{id:id,name:name})});return a;
    }
    UI.homeHeader=function(){
        var d=[],logged=C.loggedIn(),qt=UI.quotaText(C.getQuotaCache());
        d.push({title:logged?'PikPak 云盘 · 已连接':'PikPak 云盘 · 未登录',desc:logged?((C.username()||'Web Session')+(qt?'  ·  '+qt:'  ·  点击刷新容量')):'公开分享可直接浏览；个人网盘和离线功能需要登录',url:logged?$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshQuotaCard();}):UI.route('pikpakAccount'),col_type:'text_1',extra:{id:'pikpak_status',lineVisible:false}});
        d.push({title:'⏳ 离线',url:UI.route('pikpakTasks'),col_type:'scroll_button'});
        d.push({title:'♻ 回收站',url:UI.route('pikpakRecycle'),col_type:'scroll_button'});
        d.push({title:'＋ 文件夹',url:$("",'文件夹名称').input(function(){return $.require('pikpak').createFolderAction('',input);}),col_type:'scroll_button'});
        d.push({title:'👤 账号',url:UI.route('pikpakAccount'),col_type:'scroll_button'});
        d.push({title:'⚙ 设置',url:UI.route('pikpakSettings'),col_type:'scroll_button'});
        d.push({title:'',desc:'粘贴 PikPak 分享链接 / Magnet / HTTP 离线链接',url:$.toString(function(){return $.require('pikpak').openInput(input);}),col_type:'input',extra:{inheritTitle:false}});
        var recent=C.recent();for(var i=0;i<recent.length;i++){(function(v){var label=v.indexOf('magnet:')===0?'🧲 最近 Magnet':(v.indexOf('/s/')>=0?'🔗 最近分享':'⇩ 最近离线');d.push({title:label,url:$("#noLoading#").lazyRule(function(x){return $.require('pikpak').openInput(x);},v),col_type:'scroll_button'});})(recent[i]);}
        if(logged)d.push(UI.section('我的文件','长按可下载 / 分享 / 移动 / 复制 / 重命名 / 删除','hiker://empty'));else d.push(UI.section('开始使用','登录后浏览自己的 PikPak 网盘',UI.route('pikpakAccount')));return d;
    };
    UI.fileCard=function(f,url){return {title:String(f.name||'未命名'),desc:desc(f),img:img(f),url:url,col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false,id:String(f.id||''),cls:video(f)?'playlist video':(folder(f)?'folder':'file'),longClick:manage(f)}};};
    UI.magnetCard=function(f,url){return {title:String(f.path||f.name||'未命名'),desc:C.formatSize(f.size||0)+(f.hash?'  ·  秒传优先':'  ·  离线备用'),img:String(f.icon||'hiker://images/icon_video'),url:url,col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false,id:String(f.id||''),cls:'playlist video'}};};
    UI.recycleCard=function(f){var id=String(f.id||''),name=String(f.name||''),actions=[{title:'还原',js:$.toString(function(x){return $.require('pikpak').restoreAction(x.id,x.name);},{id:id,name:name})},{title:'永久删除',js:$.toString(function(x){return $.require('pikpak').purgePrompt(x.id,x.name);},{id:id,name:name})}];return {title:String(f.name||'未命名'),desc:'回收站  ·  '+desc(f),img:img(f),url:$("#noLoading#").lazyRule(function(x){return $.require('pikpak').restorePrompt(x.id,x.name);},{id:id,name:name}),col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false,id:'trash-'+id,cls:'trash',longClick:actions}};};
})(PikPakCore,PikPakProvider,PikPakUI);
