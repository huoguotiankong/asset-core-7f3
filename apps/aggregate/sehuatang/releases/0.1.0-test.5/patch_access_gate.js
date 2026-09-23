/* 色花堂 0.1.0-test.5 / Build 10105 - automatic age-gate access flow */
var SeHuaTangPatchTest5 = (function () {
    var BASE = SeHuaTangRemoteRuntime;
    var VERSION = '0.1.0-test.5', BUILD = 10105, RULE_NAME = '色花堂';
    var DEFAULT_ORIGIN = 'https://sehuatang.org';
    var KEY_ORIGIN = 'sht_origin_v1';
    var KEY_WEB_COOKIE = 'sht_web_cookie_v5';
    var KEY_ACCESS_STATE = 'sht_access_state_v5';
    var KEY_ACCESS_TIME = 'sht_access_time_v5';

    function s(v){ return v == null ? '' : String(v); }
    function trim(v){ return s(v).replace(/^\s+|\s+$/g,''); }
    function dec(v){ v=s(v); try{return decodeURIComponent(v)}catch(e){return v} }
    function origin(){ var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN)); return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN; }
    function pageParam(n,d){ var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)')); return m?dec(m[1]):(d==null?'':d); }
    function route(path,p){ var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k; for(k in(p||{})) if(p.hasOwnProperty(k)&&p[k]!=null) u+='&'+k+'='+encodeURIComponent(s(p[k])); return u; }
    function section(t,d){ return {title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}; }
    function line(){ return {col_type:'line'}; }

    function accessTarget(mode){
        var o=origin();
        if(mode==='signin') return o+'/plugin.php?id=dd_sign:index&mobile=2';
        if(mode==='forum') return o+'/forum.php?mobile=2';
        return o+'/member.php?mod=logging&action=login&mobile=2';
    }

    function access(){
        var d=[],o=origin(),mode=pageParam('sht_mode','login'),target=pageParam('sht_target','')||accessTarget(mode);
        var title=mode==='signin'?'色花堂签到':(mode==='forum'?'色花堂访问确认':'色花堂网页登录');
        setPageTitle(title);
        d.push({
            title:title,
            url:o+'/',
            desc:'list&&screen-90',
            col_type:'x5_webview_single',
            extra:{
                ua:typeof MOBILE_UA==='undefined'?'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/150 Mobile Safari/537.36':MOBILE_UA,
                showProgress:false,
                canBack:true,
                jsLoadingInject:true,
                js:$.toString(function(host,target,ckKey,stateKey,timeKey){
                    if(window.__shtAutoGateTimer) clearTimeout(window.__shtAutoGateTimer);
                    function textOf(el){
                        if(!el) return '';
                        return String(el.innerText||el.textContent||el.value||el.getAttribute&&el.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim();
                    }
                    function findAgeButton(){
                        var all=document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[role="button"],div');
                        var i,t;
                        for(i=0;i<all.length;i++){
                            t=textOf(all[i]);
                            if(!t) continue;
                            if(/满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)) return all[i];
                        }
                        return null;
                    }
                    function saveCookie(){
                        var co='';
                        try{ co=fba.getCookie(location.origin)||''; }catch(e){}
                        if(!co){ try{ co=fba.getCookie(host)||''; }catch(e2){} }
                        if(co){
                            try{ fba.putVar(ckKey,co); }catch(e3){}
                        }
                        return co;
                    }
                    function tick(){
                        var body=(document.body&&document.body.innerText)||'';
                        var btn=findAgeButton();
                        if(btn){
                            if(!window.__shtAgeClicked){
                                window.__shtAgeClicked=true;
                                try{ btn.click(); }catch(e){ try{ location.href=btn.href; }catch(e2){} }
                            }
                            window.__shtAutoGateTimer=setTimeout(tick,700);
                            return;
                        }
                        if(body.length<40){
                            window.__shtAutoGateTimer=setTimeout(tick,400);
                            return;
                        }
                        saveCookie();
                        try{ fba.putVar(stateKey,'passed'); fba.putVar(timeKey,String(Date.now())); }catch(e4){}
                        var rel=String(target||'').replace(/^https?:\/\/[^/]+/i,'');
                        if(target && rel && location.href.indexOf(rel)<0){
                            location.href=target;
                            return;
                        }
                        window.__shtAutoGateTimer=setTimeout(tick,1200);
                    }
                    tick();
                },o,target,KEY_WEB_COOKIE,KEY_ACCESS_STATE,KEY_ACCESS_TIME)
            }
        });
        d.push({title:'自动处理说明',desc:'检测到“满18岁 / over 18”页面时会自动点击；进入真实站点后保存 WebView Cookie，再自动跳转到目标页面。登录验证码、人机验证仍由官网页面完成。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
        setResult(d);
    }

    function settings(){
        var m=BASE.module(),d=[],o=origin(),ck='',st='',tm='';
        try{ck=getVar(KEY_WEB_COOKIE,'')||''}catch(e){}
        try{st=getVar(KEY_ACCESS_STATE,'')||''}catch(e2){}
        try{tm=getVar(KEY_ACCESS_TIME,'')||''}catch(e3){}
        setPageTitle('色花堂设置');
        d.push(section('账号访问','年龄确认已改为自动处理；登录验证码/人机验证仍保留官网处理'));
        d.push({title:'自动年龄确认 + 网页登录',desc:'打开后自动点击 18+ 确认，再进入登录页',url:route('shtAccess',{sht_mode:'login'}),col_type:'text_1'});
        d.push({title:'自动年龄确认 + 每日签到',desc:'自动通过年龄页后进入官方签到页',url:route('shtAccess',{sht_mode:'signin'}),col_type:'text_1'});
        d.push({title:'重新执行年龄确认',desc:'年龄 Cookie 失效或站点重新弹出确认页时使用',url:route('shtAccess',{sht_mode:'forum'}),col_type:'text_1'});
        d.push({title:'自动访问状态',desc:(st==='passed'?'已完成自动年龄确认流程':'尚未完成自动确认')+(ck?' · 已捕获 WebView Cookie':' · 暂无 WebView Cookie')+(tm?' · '+tm:''),url:'hiker://empty',col_type:'text_1'});
        d.push(line());
        d.push(section('原 Test4 设置','线路、缓存和诊断仍保留在下面'));
        d.push({title:'打开原设置页',desc:'查看线路切换、论坛缓存、最近诊断',url:route('shtSettingsLegacy'),col_type:'text_1'});
        setResult(d);
    }

    function settingsLegacy(){ BASE.module().settings(); }

    function module(){
        var m=BASE.module();
        var oldSettings=m.settings;
        m.version=VERSION;
        m.build=BUILD;
        m.access=access;
        m.settings=settings;
        m.settingsLegacy=oldSettings||settingsLegacy;
        return m;
    }

    var PATCHED={version:VERSION,build:BUILD,module:module};
    SeHuaTangRemoteRuntime=PATCHED;
    return PATCHED;
})();
