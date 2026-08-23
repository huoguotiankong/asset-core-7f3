/* ACFun Web Fallback 1.0.0-web1 - X5 web app shell */
var ACFunWeb = (function () {
    var W = {};
    W.version = '1.0.0-web1';
    W.buildNumber = 11001;
    W.build = '2026.08.23-v1.0.0-web1';
    W.runtimeMode = 'x5-web-fallback';
    W.ua = 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Mobile Safari/537.36';
    W.appUrl = 'https://ac001dhzh5.d24m42dh.work/home';
    W.webUrl = 'https://ac6688.a10hkxu0.work/';

    W.cleanUrl = function (u) {
        u = String(u || '').trim();
        if (!u) return '';
        if (!/^https?:\/\//i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
        return u;
    };
    W.mode = function () { return String(getItem('acfun_web_mode', 'app') || 'app'); };
    W.customUrl = function () { return W.cleanUrl(getItem('acfun_web_custom_url', '')); };
    W.currentUrl = function () {
        var m = W.mode();
        if (m === 'pure') return W.webUrl;
        if (m === 'custom' && W.customUrl()) return W.customUrl();
        return W.appUrl;
    };
    W.sel = function (name, on) {
        return on ? '““””<b><font color="#FF5B57">' + name + '</font></b>' : name;
    };
    W.switchUrl = function (mode) {
        setItem('acfun_web_mode', mode);
        refreshPage(false);
        return 'hiker://empty';
    };
    W.inject = function () {
        try {
            document.documentElement.style.background = '#fff';
            document.body && (document.body.style.background = '#fff');
        } catch (e) {}
        try {
            var title = document.title || 'ACFun · 网页版';
            if (typeof fy_bridge_app !== 'undefined' && fy_bridge_app.parseLazyRule) {
                var r = $$$().lazyRule(function (t) { try { setPageTitle(t); } catch (e) {} return 'hiker://empty'; }, title);
                fy_bridge_app.parseLazyRule(r);
            }
        } catch (e2) {}
    };
    W.home = function () {
        var d = [], mode = W.mode(), url = W.currentUrl();
        try { setPageTitle('ACFun · 网页版'); } catch (e0) {}
        d.push({
            title: W.sel('APP版H5', mode === 'app'),
            col_type: 'flex_button',
            url: $('hiker://empty#noLoading#').lazyRule(function () { setItem('acfun_web_mode','app'); refreshPage(false); return 'hiker://empty'; }),
            extra: {lineVisible:false}
        });
        d.push({
            title: W.sel('纯网页', mode === 'pure'),
            col_type: 'flex_button',
            url: $('hiker://empty#noLoading#').lazyRule(function () { setItem('acfun_web_mode','pure'); refreshPage(false); return 'hiker://empty'; }),
            extra: {lineVisible:false}
        });
        d.push({
            title: W.sel('自定义', mode === 'custom'),
            col_type: 'flex_button',
            url: 'hiker://page/acfun_web_settings?rule=ACFun·网页版&simple=true#noHistory##noRecordHistory#',
            extra: {lineVisible:false}
        });
        d.push({
            title: '刷新',
            col_type: 'flex_button',
            url: $('hiker://empty#noLoading#').lazyRule(function () { refreshPage(false); return 'hiker://empty'; }),
            extra: {lineVisible:false}
        });
        d.push({
            url: url,
            col_type: 'x5_webview_single',
            desc: 'list&&screen-95',
            extra: {
                canBack: true,
                showProgress: true,
                ua: W.ua,
                js: $.toString(W.inject),
                jsLoadingInject: true,
                floatVideo: true
            }
        });
        setResult(d);
    };
    W.settings = function () {
        var d = [], custom = W.customUrl(), current = W.currentUrl();
        try { setPageTitle('ACFun 网页线路'); } catch (e0) {}
        d.push({title:'当前线路',desc:current,col_type:'long_text',url:'copy://'+current,extra:{lineVisible:false}});
        d.push({title:'APP版 H5',desc:W.appUrl,col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_web_mode','app');back(true);return'toast://已切换 APP版 H5';}),extra:{lineVisible:false}});
        d.push({title:'纯网页',desc:W.webUrl,col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_web_mode','pure');back(true);return'toast://已切换纯网页';}),extra:{lineVisible:false}});
        d.push({
            title:'自定义网址',
            desc: custom || '网站换域名时可直接粘贴新地址',
            col_type:'input',
            url: $(custom || W.appUrl, '输入 ACFun H5 / 网页完整地址').input(function(){
                var u=String(input||'').trim();
                if(!u)return'toast://地址不能为空';
                if(!/^https?:\/\//i.test(u))u='https://'+u.replace(/^\/+/, '');
                setItem('acfun_web_custom_url',u);setItem('acfun_web_mode','custom');back(true);return'toast://已保存并切换自定义线路';
            }),
            extra:{type:'textarea',height:2,titleVisible:true,lineVisible:false}
        });
        d.push({title:'清除自定义线路',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_web_custom_url','');setItem('acfun_web_mode','app');refreshPage(false);return'toast://已恢复 APP版 H5';}),extra:{lineVisible:false}});
        d.push({title:'诊断',desc:'复制当前 Web 运行信息',col_type:'text_1',url:'hiker://page/acfun_web_diag?rule=ACFun·网页版&simple=true#noHistory##noRecordHistory#',extra:{lineVisible:false}});
        setResult(d);
    };
    W.diag = function () {
        try { setPageTitle('ACFun Web 诊断'); } catch (e0) {}
        var text = '版本：'+W.version+' / Build '+W.buildNumber+'\n运行：'+W.build+'\n模式：'+W.mode()+'\n当前：'+W.currentUrl()+'\nAPP版H5：'+W.appUrl+'\n纯网页：'+W.webUrl+'\n自定义：'+W.customUrl();
        setResult([
            {title:text,col_type:'long_text',url:'hiker://empty'},
            {title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}}
        ]);
    };
    return W;
})();
