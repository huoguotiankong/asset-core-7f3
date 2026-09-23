/* PikPak 0.1.0-test.8 Pages Patch - live captcha URL/DOM watcher */
(function(C,UI,Pages){
    function pending(k,d){try{return String(getMyVar(k,d||'')||'');}catch(e){return String(d||'');}}
    Pages.verify=function(){
        var d=[],url=pending('pikpak_v2_verify_url',''),orig=pending('pikpak_v2_verify_token','');
        try{setPageTitle('PikPak 安全验证');}catch(e){}
        if(!url){setResult([UI.error('验证地址已失效，请返回账号页重新登录')]);return;}
        try{putVar('pikpak_review_orig_token',orig);}catch(e2){}
        d.push({title:'请完成 PikPak 官方安全验证',desc:'完成验证后 Test8 会持续监听地址栏 captcha_token。即使官方页面不跳转，只要 token 更新或页面进入验证成功状态，也会自动继续登录。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var interceptor=$.toString(function(original){
            var u=String(input||''),m=u.match(/[?&#]captcha_token=([^&#]+)/i),tok='';
            if(m){try{tok=decodeURIComponent(m[1]);}catch(e){tok=m[1];}}
            var puzzle=u.indexOf('/captcha/v2/spritePuzzle.html')>=0||u.indexOf('/captcha/v2/reCaptcha.html')>=0;
            var loading=/mypikpak\.(com|net)\/loading/i.test(u);
            if(!tok&&loading)tok=String(original||'');
            if(tok&&(!puzzle||tok!==String(original||''))){
                return "fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token="+encodeURIComponent(tok)+"')";
            }
            return false;
        },orig);
        var inject="(function(){try{if(window.__pikpakVerifyWatchV8)return;window.__pikpakVerifyWatchV8=1;var original="+JSON.stringify(orig)+";var sent='';function dec(v){try{return decodeURIComponent(v);}catch(e){return v;}}function tokenFrom(u){u=String(u||'');var m=u.match(/[?&#]captcha_token=([^&#]+)/i);return m?dec(m[1]):'';}function currentToken(){var t=tokenFrom(String(location.href||''));if(t&&t!==original)return t;try{var fs=document.getElementsByTagName('iframe');for(var i=0;i<fs.length;i++){var s=tokenFrom(fs[i].src||'');if(s&&s!==original)return s;try{s=tokenFrom(String(fs[i].contentWindow.location.href||''));if(s&&s!==original)return s;}catch(e2){}}}catch(e3){}return t||'';}function successState(){try{var x=String((document.body&&document.body.innerText)||'').replace(/\\s+/g,'').toLowerCase();if(x.indexOf('验证成功')>=0||x.indexOf('验证完成')>=0||x.indexOf('验证通过')>=0||x.indexOf('verificationcomplete')>=0||x.indexOf('verificationsuccess')>=0||x.indexOf('verified')>=0||x.indexOf('passed')>=0)return true;}catch(e){}return false;}function handoff(tok){tok=String(tok||original||'');if(!tok||sent===tok)return;sent=tok;try{fy_bridge_app.open('hiker://page/pikpakVerifyDone?rule=PikPak&simple=true&captcha_token='+encodeURIComponent(tok));}catch(e){sent='';}}function probe(){try{var t=currentToken();if(t&&t!==original){handoff(t);return;}if(successState())handoff(t||original);}catch(e){}}probe();window.__pikpakVerifyTimerV8=setInterval(probe,350);try{window.addEventListener('hashchange',probe);window.addEventListener('popstate',probe);document.addEventListener('readystatechange',probe);}catch(e4){}}catch(e){}})();";
        d.push({title:'PikPak 验证',url:url,col_type:'x5_webview_single',desc:'list&&screen-210',extra:{canBack:true,showProgress:true,ua:C.userAgent,js:inject,jsLoadingInject:true,urlInterceptor:interceptor}});
        d.push({title:'验证完成，继续登录',desc:'如果自动接回仍未触发，可点击这里主动用当前验证会话再确认一次。',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyContinueAction();}),col_type:'text_center_1',extra:{lineVisible:false}});
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
        d.push({title:'运行信息',desc:'Test 0.1.0-test.8 · Build 10108\\n账号密码：Web 2.0.0 + 官方验证持续 token 监听\\n跨小程序 Magnet：退出调用页后只回收本次临时文件\\n普通个人文件/手动离线：不会被退出清理\\n其它程序临时文件：超过15分钟或手动清理时进回收站\\nAPI：'+C.domain()+'\\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakUI,PikPakPages);
