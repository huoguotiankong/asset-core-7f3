/* PikPak Test11 Build10113 - official Web login and localStorage credential bridge */
(function(C,P,UI,Pages){
    function param(k){try{return String(getParam(k,'')||'');}catch(e){return '';}}
    Pages.account=function(){
        var d=[];try{setPageTitle('PikPak 账号');}catch(e){}
        if(C.loggedIn()){
            var q=P.about(false),desc=(C.isWebSession&&C.isWebSession()?'官方网页会话':'Android 会话');if(C.username())desc+=' · '+C.username();if(q&&q.quota)desc+=' · '+UI.quotaText(q);
            d.push({title:'✅ 已登录',desc:desc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'刷新登录状态',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshSessionAction();}),col_type:'text_center_1'});
            d.push({title:'退出登录',desc:'只清除本小程序保存的 PikPak 会话',url:'confirm://确认退出 PikPak？.js:'+$.toString(function(){return $.require('pikpak').logoutAction();}),col_type:'text_center_1'});
        }else{
            d.push({title:'官方网页登录（推荐）',desc:'当前账号/IP 已触发 PikPak 密码登录频控。这里直接打开 PikPak 官方网页；你正常登录（包括 Google 等第三方授权）后，小程序会从官方网页本机存储中读取 Web Refresh Token、Device ID 和当前 Captcha，再恢复 API 会话。账号密码不会交给本小程序。',url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'已有 Web Refresh Token',desc:'也可以直接粘贴从 mypikpak.com 获取的 Refresh Token',url:$("",'粘贴 Web Refresh Token').input(function(){return $.require('pikpak').importWebRefreshToken(input);}),col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'为什么改用这个方式？',desc:'PikPak 当前会对 captcha/init → 账号密码登录链返回 operation too frequent；继续重复点登录只会加重频控。Test11 不再把账号密码登录作为主入口。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        }
        setResult(d);
    };
    Pages.webLogin=function(){
        var d=[];try{setPageTitle('PikPak 官方登录');}catch(e){}
        d.push({title:'在下面完成 PikPak 官方登录',desc:'登录成功后保持在 mypikpak.com 页面几秒。检测到 credentials / deviceid / captcha 后会自动返回小程序。若你已经登录网页版，通常打开后几秒即可自动接管。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var inject="(function(){try{if(window.__pikpakWebTokenBridge11)return;window.__pikpakWebTokenBridge11=1;var sent='';function txt(v){return String(v==null?'':v);}function parse(v){try{return JSON.parse(v);}catch(e){return null;}}function pick(obj,names){if(!obj||typeof obj!=='object')return '';for(var i=0;i<names.length;i++){var k=names[i];if(obj[k]!=null&&obj[k]!=='')return txt(obj[k]);}for(var x in obj){if(obj[x]&&typeof obj[x]==='object'){var r=pick(obj[x],names);if(r)return r;}}return '';}function scan(){try{if(!/mypikpak\\.com$/i.test(location.hostname||''))return;var cred=null,rt='',at='',sub='',did='',cap='';for(var i=0;i<localStorage.length;i++){var k=txt(localStorage.key(i)),v=txt(localStorage.getItem(k));var o=parse(v);if(!cred&&(k==='credentials'||/refresh_token/i.test(v))){var rr=pick(o,['refresh_token','refreshToken']);if(rr){cred=o;rt=rr;at=pick(o,['access_token','accessToken']);sub=pick(o,['sub','user_id','userId']);}}if(!did&&/deviceid/i.test(k+v)){var dm=v.match(/[0-9a-f]{32}/i);if(dm)did=dm[0];}if(!cap&&/^captcha_/i.test(k)){cap=pick(o,['captcha_token','captchaToken','token']);if(!cap){var cm=v.match(/ck[0-9A-Za-z._-]{20,}/);if(cm)cap=cm[0];}}}if(!rt){var c=parse(txt(localStorage.getItem('credentials')));rt=pick(c,['refresh_token','refreshToken']);at=pick(c,['access_token','accessToken']);sub=pick(c,['sub','user_id','userId']);}if(!did){var dv=txt(localStorage.getItem('deviceid')),dm2=dv.match(/[0-9a-f]{32}/i);if(dm2)did=dm2[0];}if(rt&&sent!==rt){sent=rt;var u='hiker://page/pikpakWebDone?rule=PikPak&simple=true&refresh_token='+encodeURIComponent(rt)+'&device_id='+encodeURIComponent(did)+'&captcha_token='+encodeURIComponent(cap)+'&sub='+encodeURIComponent(sub);fy_bridge_app.open(u);}}catch(e){}}scan();window.__pikpakWebTokenTimer11=setInterval(scan,600);try{window.addEventListener('storage',scan);window.addEventListener('focus',scan);document.addEventListener('visibilitychange',scan);}catch(e2){}}catch(e){}})();";
        d.push({title:'PikPak 官方网页',url:'https://mypikpak.com/',col_type:'x5_webview_single',desc:'list&&screen-170',extra:{canBack:true,showProgress:true,ua:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/127.0 Mobile Safari/537.36',js:inject,jsLoadingInject:true}});
        d.push({title:'没有自动返回？',desc:'确认网页版已经真正进入网盘首页后，停留几秒。仍不行可返回账号页使用“已有 Web Refresh Token”手动粘贴。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.webDone=function(){
        var rt=param('refresh_token'),did=param('device_id'),cap=param('captcha_token'),sub=param('sub');try{setPageTitle('PikPak 登录接管');}catch(e){}
        if(!rt){setResult([UI.error('没有从官方网页读取到 Refresh Token，请返回重新登录')]);return;}
        showLoading('正在恢复 PikPak Web 会话…');var r=C.importWebCredential({refresh_token:rt,device_id:did,captcha_token:cap,sub:sub});hideLoading();
        if(r&&!r.error&&!r.error_code&&r.access_token){setResult([{title:'✅ PikPak 登录成功',desc:'已使用官方网页 Refresh Token 恢复会话。后续不会再走当前被频控的账号密码登录链。',url:'hiker://home@PikPak',col_type:'text_center_1',extra:{lineVisible:false}},{title:'返回 PikPak 首页',url:'hiker://home@PikPak',col_type:'text_center_1'}]);return;}
        setResult([{title:'Web 会话恢复失败',desc:C.errorText(r),url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}}]);
    };
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.isWebSession&&C.isWebSession()?'Web 会话自动使用 mypikpak.com':'Android 会话：'+C.domain(),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序登记的临时文件，统一移入 PikPak 回收站，不永久删除',url:'confirm://确定把已登记的临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test11 · Build 10113\n主登录：PikPak 官方网页 → 自动读取 Web Refresh Token / Device ID / Captcha\n账号密码：不再作为主入口，避免 operation too frequent 频控\n会话：'+(C.isWebSession&&C.isWebSession()?'Web':'Android')+'\n登录：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages);
