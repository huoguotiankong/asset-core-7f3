/* PikPak Test11 Build10113 - official web login pages */
(function(C,P,UI,Pages){
    Pages.account=function(){
        var d=[];try{setPageTitle('PikPak 账号');}catch(e){}
        if(C.loggedIn()){
            var q=P.about(false),desc=C.username()||'官方网页登录会话';
            if(q&&q.quota)desc+='  ·  '+UI.quotaText(q);
            d.push({title:'✅ 已登录',desc:desc,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'刷新登录状态',desc:'使用已保存的 Web Refresh Token 更新 Access Token',url:$("#noLoading#").lazyRule(function(){return $.require('pikpak').refreshSessionAction();}),col_type:'text_center_1'});
            d.push({title:'退出登录',desc:'只清除本小程序保存的 PikPak API 会话；官方网页 Cookie 不强制清除',url:'confirm://确认退出 PikPak？.js:'+$.toString(function(){return $.require('pikpak').logoutAction();}),col_type:'text_center_1'});
        }else{
            d.push({title:'PikPak 官方网页登录',desc:'推荐方式。直接在 PikPak 官方网页完成邮箱、手机号、Google 等登录及安全验证；登录成功后自动读取网页 credentials 并接回小程序，不保存网页密码。',url:'hiker://page/pikpakWebLogin?rule=PikPak&simple=true',col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'已有 Web Refresh Token',desc:'备用方式：已有网页端 Refresh Token 时可直接恢复会话；Token 不会在页面回显',url:$("",'粘贴 Web Refresh Token').input(function(){return $.require('pikpak').importRefreshToken(input);}),col_type:'text_1',extra:{lineVisible:false}});
            d.push({title:'说明',desc:'Test11 不再提供账号密码 API 直登，避免继续触发 PikPak captcha/init 的 operation too frequent 风控。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        }
        setResult(d);
    };
    Pages.webLogin=function(){
        var d=[];try{setPageTitle('PikPak 官方网页登录');}catch(e){}
        d.push({title:'在下方完成 PikPak 官方登录',desc:'登录成功进入 PikPak 文件页后，本页会自动扫描官方网页 localStorage / sessionStorage 中 credentials_<client_id>，取得当前网页已经生成的 Access Token 与 Refresh Token，再自动返回小程序。',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        var inject="(function(){try{if(window.__pikpakOfficialLoginV11)return;window.__pikpakOfficialLoginV11=1;var sent='';function dec(v){try{return decodeURIComponent(v);}catch(e){return v;}}function parse(v){if(!v)return null;if(typeof v==='object')return v;try{return JSON.parse(String(v));}catch(e){return null;}}function find(o,depth){if(!o||depth>6)return null;if(typeof o==='string'){var p=parse(o);return p?find(p,depth+1):null;}if(typeof o!=='object')return null;if(o.access_token||o.refresh_token)return {access_token:String(o.access_token||''),refresh_token:String(o.refresh_token||''),sub:String(o.sub||o.user_id||''),token_type:String(o.token_type||'Bearer'),expires_in:String(o.expires_in||'')};for(var k in o){try{var r=find(o[k],depth+1);if(r&&(r.access_token||r.refresh_token))return r;}catch(e){}}return null;}function scanStore(s){try{for(var i=0;i<s.length;i++){var k=s.key(i),v=s.getItem(k);if(!k&&!v)continue;var hit=(k&&String(k).indexOf('credentials_')===0)||(v&&(String(v).indexOf('access_token')>=0||String(v).indexOf('refresh_token')>=0));if(!hit)continue;var r=find(v,0);if(r&&(r.access_token||r.refresh_token))return r;}}catch(e){}return null;}function handoff(r){if(!r)return;var mark=(r.access_token||'').slice(-24)+'|'+(r.refresh_token||'').slice(-24);if(!mark||mark===sent)return;sent=mark;var u='hiker://page/pikpakWebLoginDone?rule=PikPak&simple=true&access_token='+encodeURIComponent(r.access_token||'')+'&refresh_token='+encodeURIComponent(r.refresh_token||'')+'&sub='+encodeURIComponent(r.sub||'')+'&token_type='+encodeURIComponent(r.token_type||'Bearer')+'&expires_in='+encodeURIComponent(r.expires_in||'');try{fy_bridge_app.open(u);}catch(e){sent='';}}function scan(){try{if(!/mypikpak\\.(com|net)$/i.test(String(location.hostname||'')))return;handoff(scanStore(localStorage)||scanStore(sessionStorage));}catch(e){}}scan();window.__pikpakOfficialTimerV11=setInterval(scan,700);try{window.addEventListener('hashchange',scan);window.addEventListener('popstate',scan);document.addEventListener('readystatechange',scan);}catch(e2){}}catch(e){}})();";
        d.push({title:'PikPak 官方网页',url:'https://mypikpak.com/',col_type:'x5_webview_single',desc:'list&&screen-160',extra:{canBack:true,showProgress:true,ua:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0 Mobile Safari/537.36',js:inject,jsLoadingInject:true}});
        d.push({title:'网页已登录但没有自动返回？',desc:'先确认网页已经进入 PikPak 文件页，再重新加载上方网页；Test11 会再次扫描 credentials。',url:'toast://请确认上方网页已进入 PikPak 文件页，然后重新加载网页',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
    Pages.settings=function(){
        var d=[];try{setPageTitle('PikPak 设置');}catch(e){}var sort=C.item('sort','name_asc');
        d.push({title:'API 线路',desc:C.domain(),url:$(['mypikpak.com','mypikpak.net']).select(function(){return $.require('pikpak').setDomainAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'文件排序',desc:sort==='time_desc'?'最近修改':sort==='size_desc'?'文件大小':'名称',url:$( ['名称','最近修改','文件大小'] ).select(function(){return $.require('pikpak').setSortAction(input);}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理最近输入',desc:'清除首页最近分享 / Magnet / 离线链接',url:'confirm://确定清理最近输入？.js:'+$.toString(function(){return $.require('pikpak').clearRecentAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'清理临时播放文件',desc:'只处理本程序登记的临时文件，统一移入 PikPak 回收站，不永久删除',url:'confirm://确定把已登记的临时播放文件移入回收站？.js:'+$.toString(function(){return $.require('pikpak').cleanupTempAction();}),col_type:'text_1',extra:{lineVisible:false}});
        d.push({title:'收藏',url:'hiker://collection?rule=PikPak',col_type:'scroll_button'});d.push({title:'历史',url:'hiker://history?rule=PikPak',col_type:'scroll_button'});d.push({title:'下载',url:'hiker://download',col_type:'scroll_button'});
        d.push({title:'运行信息',desc:'Test11 · Build 10113\n登录：PikPak 官方网页 credentials → Web API Session\n账号密码 API 直登：已停用\n跨小程序 Magnet：保留 session 级临时文件回收\n普通个人文件/手动离线：不会被退出清理\nAPI：'+C.domain()+'\n状态：'+(C.loggedIn()?'已登录':'未登录'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
        setResult(d);
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages);
