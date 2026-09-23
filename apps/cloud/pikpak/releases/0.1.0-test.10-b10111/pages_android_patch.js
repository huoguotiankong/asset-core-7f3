/* PikPak Test10 Pages Patch - Android auth UI + generic official captcha handoff */
(function(C,UI,Pages){
    function pending(k,d){try{return String(getMyVar(k,d||'')||'');}catch(e){return String(d||'');}}
    Pages.verify=function(){
        var d=[],url=pending('pikpak_v2_verify_url',''),orig=pending('pikpak_v2_verify_token','');
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        if(!url){setResult([UI.error('Android 登录验证地址已失效，请返回账号页重新登录')]);return;}
        try{putVar('pikpak_review_orig_token',orig);}catch(e2){}
        d.push({title:'完成 PikPak 官方安全验证',desc:'Test10 使用 Android 1.53.2 认证链。只有当 PikPak Android captcha/init 明确返回验证页面时才进入这里；完成后会用本次 Android captcha token 继续登录。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var interceptor=$.toString(function(original){
            var u=String(input||''),m=u.match(/[?&#]captcha_token=([^&#]+)/i),tok='';
            if(m){try{tok=decodeURIComponent(m[1]);}catch(e){tok=m[1];}}
            var challenge=/\/captcha\/v2\//i.test(u),loading=/mypikpak\.(com|net)\/loading/i.test(u),callback=/^xlaccsdk01:\/\/(?:xbase\.cloud|xunlei\.com)\/callback/i.test(u);
            if(!tok&&(loading||callback))tok=String(original||'');
            if(tok&&(!challenge||tok!==String(original||'')))return "fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token="+encodeURIComponent(tok)+"')";
            return false;
        },orig);
        var inject="(function(){try{if(window.__pikpakAndroidVerifyWatch)return;window.__pikpakAndroidVerifyWatch=1;var original="+JSON.stringify(orig)+";var sent='';function dec(v){try{return decodeURIComponent(v);}catch(e){return v;}}function tok(u){u=String(u||'');var m=u.match(/[?&#]captcha_token=([^&#]+)/i);return m?dec(m[1]):'';}function handoff(t){t=String(t||original||'');if(!t||sent===t)return;sent=t;try{fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token='+encodeURIComponent(t));}catch(e){sent='';}}function probe(){try{var href=String(location.href||''),t=tok(href),txt='';try{txt=String((document.body&&document.body.innerText)||'').replace(/\\s+/g,'').toLowerCase();}catch(e2){}if(/^xlaccsdk01:\/\/(?:xbase\.cloud|xunlei\.com)\/callback/i.test(href)){handoff(t||original);return;}if(t&&t!==original){handoff(t);return;}if(txt.indexOf('验证成功')>=0||txt.indexOf('验证通过')>=0||txt.indexOf('verificationcomplete')>=0||txt.indexOf('verificationsuccess')>=0||txt.indexOf('verified')>=0)handoff(t||original);}catch(e){}}probe();window.__pikpakAndroidVerifyTimer=setInterval(probe,400);try{window.addEventListener('hashchange',probe);window.addEventListener('popstate',probe);}catch(e3){}}catch(e){}})();";
        d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-210',extra:{canBack:true,showProgress:true,ua:C.userAgent,js:inject,jsLoadingInject:true,urlInterceptor:interceptor}});
        d.push({title:'验证完成，继续登录',desc:'如果自动接回没有触发，完成官方验证后点这里。',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'重新获取 Android 验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyReloadAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        d.push({title:'取消验证并清除临时密码',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.domain(),url:$(['mypikpak.net','mypikpak.com']).select(function(){return $.require('pikpak').setDomainAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序登记的临时文件，统一移入 PikPak 回收站，不永久删除',url:'confirm://确定把已登记的临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test 0.1.0-test.10 · Build 10111\n登录：Android 1.53.2 / YNxT9w7GMdWvEOKa / com.pikcloud.pikpak\n登录前 captcha/init：Android identity meta\n登录后 Drive captcha：Android captcha_sign + 8-salt 链\nWeb 2.0 登录：已移除\n跨小程序 Magnet：退出调用页只回收本次临时文件\n普通个人文件/手动离线：不会被退出清理\nAPI：'+C.domain()+'\n状态：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);
