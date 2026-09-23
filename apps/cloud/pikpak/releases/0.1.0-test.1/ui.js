/* PikPak 0.1.0-test.1 UI - compact native Hiker design system */
var PikPakUI=(function(C){
    var RULE='PikPak';
    function route(path,params){var u='hiker://page/'+path+'?rule='+encodeURIComponent(RULE)+'&simple=true&page=fypage';params=params||{};for(var k in params)u+='&'+encodeURIComponent(k)+'='+encodeURIComponent(String(params[k]));return u;}
    function empty(text){return {title:text||'暂无内容',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
    function error(text){return {title:'加载失败',desc:String(text||'请稍后重试'),url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
    function section(title,action,url){return {title:String(title||''),desc:action||'',url:url||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
    function quotaText(q){q=q&&q.quota?q.quota:q;if(!q)return '';var usage=Number(q.usage||0),limit=Number(q.limit||0);if(!limit)return '';return C.formatSize(usage)+' / '+C.formatSize(limit);}
    function homeHeader(){
        var d=[],logged=C.loggedIn(),q=C.getQuotaCache(),qt=quotaText(q);
        d.push({title:logged?'PikPak · 已连接':'PikPak · 未登录',desc:logged?(C.username()+(qt?'  ·  '+qt:'  ·  点击刷新容量')):'公开分享可直接浏览；个人网盘、Magnet 与离线任务需登录',url:logged?$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshQuotaCard();}):route('pikpakAccount'),col_type:'text_1',extra:{id:'pikpak_status',lineVisible:false}});
        d.push({title:'⏳ 离线任务',url:route('pikpakTasks'),col_type:'scroll_button'});
        d.push({title:'＋ 新建文件夹',url:$("",'文件夹名称').input(function(){return $.require('pikpak').createFolderAction('',input);}),col_type:'scroll_button'});
        d.push({title:'👤 账号',url:route('pikpakAccount'),col_type:'scroll_button'});
        d.push({title:'⚙ 设置',url:route('pikpakSettings'),col_type:'scroll_button'});
        d.push({title:'',desc:'粘贴 PikPak 分享链接 / Magnet / HTTP 离线链接',url:$.toString(function(){return $.require('pikpak').openInput(input);}),col_type:'input',extra:{inheritTitle:false}});
        var recent=C.recent();for(var i=0;i<recent.length;i++){(function(v){var label=v.indexOf('magnet:')===0?'🧲 最近 Magnet':(v.indexOf('/s/')>=0?'🔗 最近分享':'⇩ 最近离线');d.push({title:label,url:$("#noLoading#").lazyRule(function(x){return $.require('pikpak').openInput(x);},v),col_type:'scroll_button'});})(recent[i]);}
        if(logged)d.push(section('我的文件','长按可分享 / 重命名 / 删除','hiker://empty'));else d.push(section('开始使用','登录后浏览自己的 PikPak 网盘',route('pikpakAccount')));return d;
    }
    function fileImage(f){f=f||{};if(String(f.kind||'').indexOf('folder')>=0)return 'hiker://images/icon_folder3';return String(f.thumbnail_link||f.icon_link||'hiker://images/icon_file');}
    function fileDesc(f){f=f||{};if(String(f.kind||'').indexOf('folder')>=0)return '文件夹'+(f.modified_time?'  ·  '+C.formatDate(f.modified_time):'');var a=[];if(f.size!=null)a.push(C.formatSize(f.size));if(f.mime_type)a.push(C.mimeKind(f.mime_type));if(f.modified_time)a.push(C.formatDate(f.modified_time));return a.join('  ·  ');}
    function fileLongClick(f){f=f||{};var id=String(f.id||''),name=String(f.name||''),mime=String(f.mime_type||''),a=[];if(String(f.kind||'').indexOf('folder')<0)a.push({title:'下载',js:$.toString(function(x){return $.require('pikpak').downloadPersonal(x.id,x.mime);},{id:id,mime:mime})});a.push({title:'创建分享链接',js:$.toString(function(x){return $.require('pikpak').createShareAction(x.id,x.name);},{id:id,name:name})});a.push({title:'重命名',js:$.toString(function(x){return $.require('pikpak').renamePrompt(x.id,x.name);},{id:id,name:name})});a.push({title:'移到回收站',js:$.toString(function(x){return $.require('pikpak').trashPrompt(x.id,x.name);},{id:id,name:name})});return a;}
    function fileCard(f,url){return {title:String(f.name||'未命名'),desc:fileDesc(f),img:fileImage(f),url:url,col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false,id:String(f.id||''),longClick:fileLongClick(f)}};}
    function shareCard(f,url){return {title:String(f.name||'未命名'),desc:fileDesc(f),img:fileImage(f),url:url,col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false}};}
    function magnetCard(f,url){var fast=f.hash?' · 秒传可用':' · 离线备用';return {title:String(f.path||f.name||'未命名'),desc:C.formatSize(f.size||0)+fast,img:String(f.icon||'hiker://images/icon_file'),url:url,col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false}};}
    function taskCard(t,url,deleteUrl){t=t||{};var phase=String(t.phase||''),state=phase==='PHASE_TYPE_COMPLETE'?'已完成':phase==='PHASE_TYPE_RUNNING'?'下载中':phase==='PHASE_TYPE_PENDING'?'等待中':phase==='PHASE_TYPE_ERROR'?'失败':phase,size=t.file_size||t.status_size||0,desc=state+(size?'  ·  '+C.formatSize(size):'');if(t.message)desc+='  ·  '+t.message;return {title:String(t.name||t.file_name||(t.reference_resource&&t.reference_resource.name)||'离线任务'),desc:desc,img:String(t.icon_link||(t.reference_resource&&t.reference_resource.icon_link)||'hiker://images/icon_download'),url:url||'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false,longClick:deleteUrl?[{title:'删除任务',js:deleteUrl}]:[]}};}
    return {route:route,empty:empty,error:error,section:section,quotaText:quotaText,homeHeader:homeHeader,fileCard:fileCard,shareCard:shareCard,magnetCard:magnetCard,taskCard:taskCard};
})(PikPakCore);