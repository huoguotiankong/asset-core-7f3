/* PikPak 0.1.0-test.4 Pages Patch - embedded official captcha verification */
(function(C,Pages){
    Pages.verify=function(){
        var d=[],url='';
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        try{url=String(getMyVar('pikpak_v2_verify_url','')||'');}catch(e2){}
        d.push({title:'请完成 PikPak 官方验证',desc:'在下面的验证区域按提示完成人机验证。完成后不要重新输入账号密码，直接点击“验证完成，继续登录”。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        if(url){
            d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-260',extra:{canBack:true,showProgress:true,ua:typeof MOBILE_UA==='undefined'?'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/127.0 Mobile Safari/537.36':MOBILE_UA}});
        }else{
            d.push({title:'验证页面地址尚未取得',desc:'点击下方“重新加载验证”重新向 PikPak 获取验证页面。',url:'hiker://empty',col_type:'text_center_1'});
        }
        d.push({title:'验证完成，继续登录',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'重新加载验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyReloadAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'取消验证并清除临时密码',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakPages);
