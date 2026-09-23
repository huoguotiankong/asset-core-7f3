/* PikPak 0.1.0-test.5 Pages Patch - auto captcha handoff + safe cleanup UI */
(function(C,P,UI,Pages){
    function pending(k,d){try{return String(getMyVar(k,d||'')||'');}catch(e){return String(d||'');}}
    Pages.account=function(){
        var d=[];
        try{setPageTitle('PikPak 账号');}catch(e){}
        if(C.loggedIn()){
            var q=P.about(false),desc=C.username()||'已登录';if(q&&q.quota)desc+='  ·  '+UI.quotaText(q);
            d.push({title:'✅ 已登录',desc:desc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'刷新登录状态',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshSessionAction();}),col_type:'text_center_1'});
            d.push({title:'退出登录',desc:'只清除本小程序保存的 PikPak 会话',url:'confirm://确认退出 PikPak？.js:'+$.toString(function(){return $.require('pikpak').logoutAction();}),col_type:'text_center_1'});
        }else{
            d.push({title:'账号登录',desc:'密码只保存在本次临时变量中。若 PikPak 要求人机验证，会进入官方安全验证页并尝试自动接回登录。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'',desc:'手机号 / 邮箱 / PikPak 账号',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,onChange:"putMyVar('pikpak_v2_login_user',input)",defaultValue:pending('pikpak_v2_login_user',C.username())}});
            d.push({title:'',desc:'密码（仅本次登录使用）',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,type:'password',onChange:"putMyVar('pikpak_v2_login_pass',input)",defaultValue:''}});
            d.push({title:'登录',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').loginAction(getMyVar('pikpak_v2_login_user',''),getMyVar('pikpak_v2_login_pass',''));}),col_type:'text_center_1',extra:{lineVisible:false}});
            if(pending('pikpak_v2_verify_url','')){
                d.push({title:'🛡️ 继续安全验证',desc:'上一次登录正在等待 PikPak 官方人机验证',url:'hiker://page/pikpakVerify?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
                d.push({title:'取消本次验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1'});
            }
            d.push({title:'Refresh Token 登录',desc:'已有 Refresh Token 时可直接恢复会话；内容不会在页面回显',url:$("",'粘贴 Refresh Token').input(function(){return $.require('pikpak').importRefreshToken(input);}),col_type:'text_1',extra:{lineVisible:false}});
        }
        setResult(d);
    };
    Pages.verify=function(){
        var d=[],url=pending('pikpak_v2_verify_url',''),orig=pending('pikpak_v2_verify_token','');
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        if(!url){setResult([UI.error('验证地址已失效，请返回账号页重新登录')]);return;}
        try{putVar('pikpak_review_orig_token',orig);}catch(e2){}
        d.push({title:'请完成 PikPak 官方安全验证',desc:'在下面完成人机验证。成功跳转时 Test5 会自动回收 captcha token 并继续登录；如果没有自动跳转，可点击底部“验证完成，继续登录”。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var interceptor=$.toString(function(original){
            var u=String(input||''),m=u.match(/[?&]captcha_token=([^&]+)/i),tok='';
            if(m){try{tok=decodeURIComponent(m[1]);}catch(e){tok=m[1];}}
            var puzzle=u.indexOf('/captcha/v2/spritePuzzle.html')>=0||u.indexOf('/captcha/v2/reCaptcha.html')>=0;
            if(!tok&&/mypikpak\.com\/loading/i.test(u))tok=String(original||'');
            if(tok&&(!puzzle||tok!==String(original||''))){
                if(getMyVar('pikpak_v2_verify_handoff_done','')!==tok){
                    putMyVar('pikpak_v2_verify_handoff_done',tok);
                    putMyVar('pikpak_v2_verified_captcha',tok);
                    return "fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token="+encodeURIComponent(tok)+"')";
                }
            }
            return false;
        },orig);
        var inject="(function(){try{var u=String(location.href||'');var m=u.match(/[?&]captcha_token=([^&]+)/i);var o=String(fy_bridge_app.getVar('pikpak_review_orig_token')||'');var t=m?decodeURIComponent(m[1]):'';var p=u.indexOf('/captcha/v2/spritePuzzle.html')>=0||u.indexOf('/captcha/v2/reCaptcha.html')>=0;if(!t&&/mypikpak\\.com\\/loading/i.test(u))t=o;if(t&&(!p||t!==o)){fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token='+encodeURIComponent(t));}}catch(e){}})();";
        d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-210',extra:{canBack:true,showProgress:true,ua:C.userAgent,js:inject,jsLoadingInject:true,urlInterceptor:interceptor}});
        d.push({title:'验证完成，继续登录',desc:'自动跳转未触发时使用；会优先采用验证页捕获的新 token。',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'重新加载验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyReloadAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'取消验证并清除临时密码',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.domain(),url:$(['mypikpak.com','mypikpak.net']).select(function(){return $.require('pikpak').setDomainAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序为 Magnet 秒传/播放创建的临时文件；移入回收站，不永久删除',url:'confirm://确定把到期临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test 0.1.0-test.5 · Build 10105\n账号密码：Web 2.0.0 + 官方交互验证自动接回\n临时播放：超过15分钟/手动清理时移入回收站\nAPI：'+C.domain()+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages);
