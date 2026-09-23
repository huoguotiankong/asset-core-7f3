/* PikPak 0.1.0-test.4 Pages Patch - embedded official captcha verification */
(function(C,Pages){
    Pages.verify=function(){
        var d=[],url='';
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        try{url=String(getMyVar('pikpak_v2_verify_url','')||'');}catch(e2){}
        d.push({title:'请完成 PikPak 官方验证',desc:'在下面的验证区域按提示完成人机验证。完成后不要重新输入账号密码，直接点击“验证完成，继续登录”。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        if(url){
            var interceptor=$.toString(function(){
                try{
                    var u=String(input||''),m=u.match(/[?&]captcha_token=([^&#]+)/i);
                    if(m&&m[1]){
                        var t=decodeURIComponent(m[1]);
                        if(t){putMyVar('pikpak_v2_verify_token',t);toast('已捕获 PikPak 验证结果，请点击“验证完成，继续登录”');}
                    }
                    if(/^xlaccsdk/i.test(u))return true;
                }catch(e){}
                return false;
            });
            d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-260',extra:{canBack:true,showProgress:true,urlInterceptor:interceptor,ua:typeof MOBILE_UA==='undefined'?'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/127.0 Mobile Safari/537.36':MOBILE_UA}});
        }else{
            d.push({title:'验证页面地址尚未取得',desc:'点击下方“重新加载验证”重新向 PikPak 获取验证页面。',url:'hiker://empty',col_type:'text_center_1'});
        }
        d.push({title:'验证完成，继续登录',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'重新加载验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyReloadAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'取消验证并清除临时密码',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.settings=function(){
        var d=[];
        try{setPageTitle('PikPak 设置');}catch(e){}
        var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.domain(),url:$(['mypikpak.com','mypikpak.net']).select(function(){return $.require('pikpak').setDomainAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只清理本程序为秒传/磁链播放创建的临时文件',url:'confirm://确定清理已到期的临时文件？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});
        d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});
        d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test 0.1.0-test.4 · Build 10104\n账号密码：Web 2.0.0 + 官方安全验证闭环\n旧会话：兼容 Android 1.23.0 legacy\nAPI：'+C.domain()+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakPages);
