/* 色花堂 0.1.0-test.5 / Build 10105 - manual age confirmation + automatic cookie persistence */
var SeHuaTangPatchTest5 = (function(){
    var BASE=SeHuaTangRemoteRuntime;
    var VERSION='0.1.0-test.5',BUILD=10105,RULE_NAME='色花堂';
    var DEFAULT_ORIGIN='https://sehuatang.org';
    var KEY_ORIGIN='sht_origin_v1',KEY_WEB_COOKIE='sht_web_cookie_v5',KEY_AGE_OK='sht_age_ok_v5',KEY_AGE_TIME='sht_age_time_v5';
    function s(v){return v==null?'':String(v)}
    function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
    function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
    function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
    function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
    function route(path,p){var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k;for(k in(p||{}))if(p.hasOwnProperty(k)&&p[k]!=null)u+='&'+k+'='+encodeURIComponent(s(p[k]));return u}
    function section(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}}
    function line(){return{col_type:'line'}}
    function targetFor(mode){var o=origin();if(mode==='signin')return o+'/plugin.php?id=dd_sign:index&mobile=2';if(mode==='forum')return o+'/forum.php?mobile=2';return o+'/member.php?mod=logging&action=login&mobile=2'}
    function verify(){
        var d=[],o=origin(),mode=pageParam('sht_mode','login'),target=pageParam('sht_target','')||targetFor(mode),title=mode==='signin'?'年龄确认后签到':(mode==='forum'?'首次访问确认':'年龄确认后登录');
        setPageTitle(title);
        d.push({title:title,url:o+'/',desc:'list&&screen-90',col_type:'x5_webview_single',extra:{ua:typeof MOBILE_UA==='undefined'?'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/150 Mobile Safari/537.36':MOBILE_UA,showProgress:false,canBack:true,jsLoadingInject:true,js:$.toString(function(host,target,ckKey,okKey,timeKey){
            if(window.__shtVerifyTimer)clearTimeout(window.__shtVerifyTimer);
            function bodyText(){return String((document.body&&document.body.innerText)||'').replace(/\s+/g,' ')}
            function isAgeGate(t){return /满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t)}
            function isRealSite(t){return !isAgeGate(t)&&(document.querySelector('#threadlisttableid,.bm_c,#waterfall,.items,a[href*="forum-"],a[href*="forumdisplay"]')||/色花堂|98堂|原创BT|论坛|在线 视频|在线视频/i.test(t))}
            function saveCookie(){var co='';try{co=fba.getCookie(location.origin)||''}catch(e){}if(!co){try{co=fba.getCookie(host)||''}catch(e2){}}if(co){try{fba.putVar(ckKey,co)}catch(e3){}}return co}
            function tick(){
                var t=bodyText(),co='',rel='';
                if(t.length<30){window.__shtVerifyTimer=setTimeout(tick,500);return}
                if(isAgeGate(t)){
                    window.__shtVerifyTimer=setTimeout(tick,600);
                    return;
                }
                if(isRealSite(t)){
                    co=saveCookie();
                    try{fba.putVar(okKey,'1');fba.putVar(timeKey,String(Date.now()))}catch(e4){}
                    rel=String(target||'').replace(/^https?:\/\/[^/]+/i,'');
                    if(target&&rel&&location.href.indexOf(rel)<0){location.href=target;return}
                }
                window.__shtVerifyTimer=setTimeout(tick,900)
            }
            tick();
        },o,target,KEY_WEB_COOKIE,KEY_AGE_OK,KEY_AGE_TIME)}});
        d.push({title:'操作方式',desc:'如果出现“满18岁，请点此进入 / If you are over 18”页面，请你手动确认一次。小程序只负责检测确认是否完成、保存 Cookie，并自动进入登录/签到目标页；不会替你点击年龄确认。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
        setResult(d)
    }
    function settings(){
        var d=[],ok='',ck='',tm='';try{ok=getVar(KEY_AGE_OK,'')||''}catch(e){}try{ck=getVar(KEY_WEB_COOKIE,'')||''}catch(e2){}try{tm=getVar(KEY_AGE_TIME,'')||''}catch(e3){}
        setPageTitle('色花堂设置');
        d.push(section('账号访问',ok==='1'?'已完成一次年龄确认，后续优先复用 X5 Cookie':'首次使用需要手动确认一次 18+ 页面'));
        d.push({title:'① 年龄确认后登录',desc:ok==='1'?'已确认过；若仍弹年龄页，再手动确认一次':'首次进入请手动点击年龄确认，随后自动进入登录页',url:route('shtVerify',{sht_mode:'login'}),col_type:'text_1'});
        d.push({title:'② 网页登录',desc:'年龄确认 Cookie 有效时直接进入登录页',url:'x5://'+targetFor('login'),col_type:'text_1'});
        d.push({title:'③ 每日签到',desc:'登录成功后进入官方签到页',url:'x5://'+targetFor('signin'),col_type:'text_1'});
        d.push({title:'年龄/Cookie 状态',desc:(ok==='1'?'年龄确认状态：已记录':'年龄确认状态：未记录')+(ck?' · 已保存 WebView Cookie':' · 暂无已保存 Cookie')+(tm?' · '+tm:''),url:'hiker://empty',col_type:'text_1'});
        d.push({title:'重新确认并刷新 Cookie',desc:'站点重新弹出年龄页、登录异常或 Cookie 过期时使用',url:route('shtVerify',{sht_mode:'forum'}),col_type:'text_1'});
        d.push(line());
        d.push(section('Test4 设置','论坛线路、缓存、诊断继续沿用 Test4'));
        d.push({title:'线路 / 缓存 / 最近诊断',desc:'打开原设置页面',url:route('shtSettingsLegacy'),col_type:'text_1'});
        setResult(d)
    }
    function module(){var m=BASE.module(),old=m.settings;m.version=VERSION;m.build=BUILD;m.verifyAge=verify;m.settings=settings;m.settingsLegacy=old;return m}
    var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();
