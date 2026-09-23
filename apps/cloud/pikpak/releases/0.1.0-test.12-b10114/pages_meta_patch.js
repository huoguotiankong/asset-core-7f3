/* PikPak Test12 Build10114 - settings/runtime identity */
(function(C,Pages){
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.isWebSession&&C.isWebSession()?'Web 会话自动使用 mypikpak.com':'Android 会话：'+C.domain(),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序登记的临时文件，统一移入 PikPak 回收站，不永久删除',url:'confirm://确定把已登记的临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test12 · Build 10114\n主登录：PikPak 官方网页 credentials → Access Token 直连优先\nRefresh Token：仅在 Access Token 缺失/过期时使用\n账号密码 API 直登：不作为主入口\n会话：'+(C.isWebSession&&C.isWebSession()?'Web':'Android')+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakPages);
