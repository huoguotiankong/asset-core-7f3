/* PikPak 0.1.0-test.10 Pages Patch - official web login + automatic refresh-token handoff */
(function(C,P,UI,Pages){
    function pending(k,d){try{return String(getMyVar(k,d||'')||'');}catch(e){return String(d||'');}}
    Pages.account=function(){
        var d=[];
        try{setPageTitle('PikPak 账号');}catch(e){}
        if(C.loggedIn()){
            var q=P.about(false),desc=C.username()||'已登录';if(q&&q.quota)desc+='  ·  '+UI.quotaText(q);
            d.push({title:'✅ 已登录',desc:desc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'刷新登录状态',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshSessionAction();}),col_type:'text_center_1'});
            d.push({title:'退出登录',desc:'清除本小程序保存的 PikPak API 会话；官方网页自己的登录 Cookie 不会被强制清除',url:'confirm://确认退出 PikPak？.js:'+$.toString(function(){return $.require('pikpak').logoutAction();}),col_type:'text_center_1'});
        }else{
            d.push({title:'官方网页登录（推荐）',desc:'在 PikPak 官方网页完成邮箱/手机号/第三方账号及安全验证；登录成功后自动读取官方网页 credentials 中的 Refresh Token 并接回小程序。不会把网页密码保存到小程序。',url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'Refresh Token 登录',desc:'已有 Web 端 Refresh Token 时可直接恢复会话；Token 不在页面回显',url:$("",'粘贴 Web Refresh Token').input(function(){return $.require('pikpak').importRefreshToken(input);}),col_type:'text_1',extra:{lineVisible:false}});
            d.push({col_type:'line'});
            d.push({title:'备用：账号密码 API 直登',desc:'PikPak 当前对 captcha/init / signin 风控较严，可能返回 operation too frequent。仅在官方网页登录无法使用时尝试，避免连续点击。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'',desc:'手机号 / 邮箱 / PikPak 账号',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,onChange:"putMyVar('pikpak_v2_login_user',input)",defaultValue:pending('pikpak_v2_login_user',C.username())}});
            d.push({title:'',desc:'密码（仅本次直登使用）',url:'hiker://empty',col_type:'input',extra:{titleVisible:false,type:'password',onChange:"putMyVar('pikpak_v2_login_pass',input)",defaultValue:''}});
            d.push({title:'尝试 API 直登',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').loginAction(getMyVar('pikpak_v2_login_user',''),getMyVar('pikpak_v2_login_pass',''));}),col_type:'text_center_1',extra:{lineVisible:false}});
            if(pending('pikpak_v2_verify_url','')){
                d.push({title:'🛡️ 继续安全验证',desc:'上一次 API 直登仍在等待 PikPak 官方人机验证',url:'hiker://page/pikpakVerify?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
                d.push({title:'取消本次验证',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').verifyCancelAction();}),col_type:'text_center_1'});
            }
        }
        setResult(d);
    };
    Pages.webLogin=function(){
        var d=[];
        try{setPageTitle('PikPak 官方网页登录');}catch(e){}
        d.push({title:'使用 PikPak 官方网页完成登录',desc:'请在下方官方页面正常登录并完成安全验证。Test10 会持续检测 mypikpak.com 的 localStorage credentials；发现 refresh_token 后自动接回小程序，不读取或保存你的网页密码。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var inject="(function(){try{if(window.__pikpakOfficialLoginV10)return;window.__pikpakOfficialLoginV10=1;var sent='';function pick(obj,depth){if(!obj||depth>5)return '';if(typeof obj==='string'){try{return pick(JSON.parse(obj),depth+1);}catch(e){var m=obj.match(/[\\\"']refresh_token[\\\"']\\s*[:=]\\s*[\\\"']([^\\\"']+)/i);return m?m[1]:'';}}if(typeof obj==='object'){if(obj.refresh_token)return String(obj.refresh_token);for(var k in obj){var r=pick(obj[k],depth+1);if(r)return r;}}return '';}function scanStore(s){try{for(var i=0;i<s.length;i++){var k=s.key(i),v=s.getItem(k);if(!k&&!v)continue;if((k&&String(k).indexOf('credentials')===0)||(v&&String(v).indexOf('refresh_token')>=0)){var t=pick(v,0);if(t)return t;}}}catch(e){}return '';}function scan(){try{if(!/mypikpak\\.(com|net)$/i.test(String(location.hostname||'')))return;var t=scanStore(localStorage)||scanStore(sessionStorage);if(t&&t!==sent){sent=t;fy_bridge_app.open('hiker://page/pikpakWebLoginDone?rule=PikPak&simple=true&refresh_token='+encodeURIComponent(t));}}catch(e){}}scan();window.__pikpakOfficialTimerV10=setInterval(scan,700);try{window.addEventListener('hashchange',scan);window.addEventListener('popstate',scan);document.addEventListener('readystatechange',scan);}catch(e2){}}catch(e){}})();";
        d.push({title:'PikPak 官方网页',url:'https://mypikpak.com/',col_type:'x5_webview_single',desc:'list&&screen-160',extra:{canBack:true,showProgress:true,ua:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Mobile Safari/537.36',js:inject,jsLoadingInject:true}});
        d.push({title:'已经登录但没有自动返回？',desc:'先确认网页已经进入 PikPak 文件页，再点“重新加载网页”；Test10 会重新扫描 credentials。',url:'toast://请先在上方官方网页确认已经成功进入 PikPak 文件页，然后重新加载该网页',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages);
