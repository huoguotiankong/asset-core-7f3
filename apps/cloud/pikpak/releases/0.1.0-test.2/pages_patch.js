/* PikPak 0.1.0-test.2 Pages Patch - native Hiker selectors */
(function(C,UI,Pages){
    Pages.settings=function(){
        var d=[];
        try{setPageTitle('PikPak 设置');}catch(e){}
        var sort=C.item('sort','name_asc');
        d.push({
            title:'API 线路',
            desc:C.domain(),
            url:$(['mypikpak.com','mypikpak.net']).select(function(){
                return $.require('pikpak').setDomainAction(input);
            }),
            col_type:'text_1',
            extra:{lineVisible:false}
        });
        d.push({
            title:'文件排序',
            desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',
            url:$( ['名称','最近修改','文件大小'] ).select(function(){
                return $.require('pikpak').setSortAction(input);
            }),
            col_type:'text_1',
            extra:{lineVisible:false}
        });
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只清理本程序为秒传/磁链播放创建的临时文件',url:'confirm://确定清理已到期的临时文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});
        d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});
        d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({
            title:'运行信息',
            desc:'Test 0.1.0-test.2 · Build 10102\n协议兼容档：Android 1.23.0（首轮重构保持旧版已用登录链）\nAPI：'+C.domain()+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),
            url:'hiker://empty',
            col_type:'text_1',
            extra:{lineVisible:false}
        });
        setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);