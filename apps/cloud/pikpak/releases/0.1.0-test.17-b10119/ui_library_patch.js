/* PikPak Test17 Build10119 - dashboard, favorites and details actions */
(function(C,P,UI){
    var baseFileCard=UI.fileCard;
    function quotaLine(){
        var q=C.getQuotaCache(),x=q&&q.quota?q.quota:q,usage=Number(x&&x.usage||0),limit=Number(x&&x.limit||0);
        if(!limit)return '点击刷新容量';
        var pct=Math.max(0,Math.min(100,Math.round(usage*100/limit))),bars=Math.round(pct/10),bar='[';
        for(var i=0;i<10;i++)bar+=i<bars?'■':'□';
        return C.formatSize(usage)+' / '+C.formatSize(limit)+'  '+pct+'%  '+bar+']';
    }
    UI.homeHeader=function(){
        var d=[],logged=C.loggedIn();
        d.push({title:logged?'PikPak · Web Session 已连接':'PikPak · 未登录',desc:logged?((C.username()||'官方网页登录')+'\n'+quotaLine()):'请使用官方 PikPak 网页登录；公开分享可免登录浏览',url:logged?$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshQuotaCard();}):UI.route('pikpakAccount'),col_type:'text_1',extra:{id:'pikpak_status',lineVisible:false}});
        if(logged){
            d.push({title:'📁 My Pack',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').openMyPack();}),col_type:'scroll_button'});
            d.push({title:'★ 星标',url:UI.route('pikpakStarred'),col_type:'scroll_button'});
            d.push({title:'🕘 最近',url:UI.route('pikpakRecent'),col_type:'scroll_button'});
            d.push({title:'♻ 回收站',url:UI.route('pikpakRecycle'),col_type:'scroll_button'});
            d.push({title:'⏳ 离线任务',url:UI.route('pikpakTasks'),col_type:'scroll_button'});
        }
        d.push({title:'＋ 新建文件夹',url:$("",'文件夹名称').input(function(){return $.require('pikpak').createFolderAction('',input);}),col_type:'scroll_button'});
        d.push({title:'👤 账号',url:UI.route('pikpakAccount'),col_type:'scroll_button'});
        d.push({title:'⚙ 设置',url:UI.route('pikpakSettings'),col_type:'scroll_button'});
        d.push({title:'',desc:'粘贴分享链接 / Magnet / HTTP 离线链接',url:$.toString(function(){return $.require('pikpak').openInput(input);}),col_type:'input',extra:{inheritTitle:false}});
        if(logged)d.push(UI.section('我的文件','点击打开；长按管理、星标或查看详情','hiker://empty'));else d.push(UI.section('开始使用','登录后浏览自己的 PikPak 网盘',UI.route('pikpakAccount')));
        return d;
    };
    UI.fileCard=function(f,url){
        var card=baseFileCard(f,url),star=P.isStarred(f),id=String(f&&f.id||''),name=String(f&&f.name||'');
        if(star)card.title='★ '+String(card.title||name);
        var a=card.extra&&card.extra.longClick instanceof Array?card.extra.longClick:[];
        a.unshift({title:star?'取消星标':'加入星标',js:$.toString(function(x){return x.star?$.require('pikpak').unstarAction(x.id):$.require('pikpak').starAction(x.id);},{id:id,star:star})});
        a.push({title:'文件详情',js:$.toString(function(x){return $.require('pikpak').openFileDetail(x.id,x.name);},{id:id,name:name})});
        card.extra.longClick=a;return card;
    };
})(PikPakCore,PikPakProvider,PikPakUI);
