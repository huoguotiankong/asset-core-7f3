/* PikPak Test10 Android Pages Patch */
(function(C,P,UI,Pages){
    function pending(k,d){try{return String(getMyVar(k,d||'')||'');}catch(e){return String(d||'');}}
    Pages.account=function(){
        var d=[];try{setPageTitle('PikPak 账号');}catch(e){}
        if(C.loggedIn()){
            var q=P.about(false),desc=C.username()||'已登录';if(q&&q.quota)desc+='  ·  '+UI.quotaText(q);
            d.push({title:'✅ 已登录',desc:desc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'刷新登录状态',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshSessionAction();}),col_type:'text_center_1'});
            d.push({title:'退出登录',desc:'只清除本小程序保存的 PikPak 会话',url:'confirm://确认退出 PikPak？.js:'+$.toString(function(){return $.require('pikpak').logoutAction();}),col_type:'text_center_1'});
        }else{
            d.push({title:'Android 账号登录',desc:'Test10 已停用 Web 2.0 登录，改用 PikPak Android 认证档。密码只存在本次临时变量中；若官方返回安全验证页，会继续走官方验证码接回。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'',desc:'手机号 / 邮箱 / PikPak 账号',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,onChange:"putMyVar('pikpak_v2_login_user',input)",defaultValue:pending('pikpak_v2_login_user',C.username())}});
            d.push({title:'',desc:'密码（仅本次登录使用）',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,type:'password',onChange:"putMyVar('pikpak_v2_login_pass',input)",defaultValue:''}});
            d.push({title:'登录',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').loginAction(getMyVar('pikpak_v2_login_user',''),getMyVar('pikpak_v2_login_pass',''));}),col_type:'text_center_1',extra:{lineVisible:false}});
            if(pending('pikpak_v2_verify_url','')){
                d.push({title:'🛡️ 继续安全验证',desc:'当前 Android 登录正在等待 PikPak 官方安全验证',url:'hiker://page/pikpakVerify?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
                d.push({title:'取消本次验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1'});
            }
            d.push({title:'Refresh Token 登录',desc:'已有 Refresh Token 时仍可直接恢复会话；内容不会在页面回显',url:$("",'粘贴 Refresh Token').input(function(){return $.require('pikpak').importRefreshToken(input);}),col_type:'text_1',extra:{lineVisible:false}});
        }
        setResult(d);
    };
    Pages.verify=function(){
        var d=[],url=pending('pikpak_v2_verify_url',''),orig=pending('pikpak_v2_verify_token','');
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        if(!url){setResult([UI.error('验证地址已失效，请返回账号页重新登录')]);return;}
        try{putVar('pikpak_review_orig_token',orig);}catch(e2){}
        d.push({title:'请完成 PikPak 官方安全验证',desc:'这是 Android 登录链返回的官方验证页，不是 Web 2.0 账号登录。完成后会监听回调、地址栏 token 和页面成功状态并继续 Android signin。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var interceptor=$.toString(function(original){
            var u=String(input||''),m=u.match(/[?&#]captcha_token=([^&#]+)/i),tok='';
            if(m){try{tok=decodeURIComponent(m[1]);}catch(e){tok=m[1];}}
            var challenge=/\/captcha\/v2\/(?:spritePuzzle|reCaptcha|txCaptcha)\.html/i.test(u),loading=/mypikpak\.(com|net)\/loading/i.test(u),callback=/^xlaccsdk01:\/\/(?:xbase\.cloud|xunlei\.com)\/callback/i.test(u);
            if(!tok&&(loading||callback))tok=String(original||'');
            if(tok&&(!challenge||tok!==String(original||'')))return "fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token="+encodeURIComponent(tok)+"')";
            return false;
        },orig);
        var inject="(function(){try{if(window.__pikpakVerifyWatchAndroid10)return;window.__pikpakVerifyWatchAndroid10=1;var original="+JSON.stringify(orig)+";var sent='';function dec(v){try{return decodeURIComponent(v);}catch(e){return v;}}function tokenFrom(u){u=String(u||'');var m=u.match(/[?&#]captcha_token=([^&#]+)/i);return m?dec(m[1]):'';}function currentToken(){var t=tokenFrom(String(location.href||''));if(t&&t!==original)return t;try{var fs=document.getElementsByTagName('iframe');for(var i=0;i<fs.length;i++){var s=tokenFrom(fs[i].src||'');if(s&&s!==original)return s;try{s=tokenFrom(String(fs[i].contentWindow.location.href||''));if(s&&s!==original)return s;}catch(e2){}}}catch(e3){}return t||'';}function successState(){try{var x=String((document.body&&document.body.innerText)||'').replace(/\\s+/g,'').toLowerCase();return x.indexOf('验证成功')>=0||x.indexOf('验证完成')>=0||x.indexOf('验证通过')>=0||x.indexOf('verificationcomplete')>=0||x.indexOf('verificationsuccess')>=0||x.indexOf('verified')>=0||x.indexOf('passed')>=0;}catch(e){return false;}}function handoff(tok){tok=String(tok||original||'');if(!tok||sent===tok)return;sent=tok;try{fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token='+encodeURIComponent(tok));}catch(e){sent='';}}function probe(){try{var href=String(location.href||''),t=currentToken();if(/^xlaccsdk01:\/\/(?:xbase\\.cloud|xunlei\\.com)\/callback/i.test(href)){handoff(t||original);return;}if(t&&t!==original){handoff(t);return;}if(successState())handoff(t||original);}catch(e){}}probe();window.__pikpakVerifyTimerAndroid10=setInterval(probe,350);try{window.addEventListener('hashchange',probe);window.addEventListener('popstate',probe);document.addEventListener('readystatechange',probe);}catch(e4){}}catch(e){}})();";
        d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-210',extra:{canBack:true,showProgress:true,ua:C.userAgent,js:inject,jsLoadingInject:true,urlInterceptor:interceptor}});
        d.push({title:'验证完成，继续登录',desc:'自动接回未触发时点这里；会用本次验证 token 继续 Android signin。',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'重新加载验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyReloadAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'取消验证并清除临时密码',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.domain(),url:$(['mypikpak.com','mypikpak.net']).select(function(){return $.require('pikpak').setDomainAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序登记的临时文件，统一移入 PikPak 回收站，不永久删除',url:'confirm://确定把已登记的临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test10 Android · Build 10111\n账号密码：Android 1.53.2 / YNxT9w7GMdWvEOKa / com.pikcloud.pikpak\n登录验证：Android captcha/signin；不走 Web 2.0 账号登录\n跨小程序 Magnet：退出调用页只回收本次临时文件\n普通个人文件/手动离线：不会被退出清理\nAPI：'+C.domain()+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages);
