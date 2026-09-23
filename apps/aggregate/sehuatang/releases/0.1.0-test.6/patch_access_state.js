/* 色花堂 0.1.0-test.6 / Build 10106 - harden automatic age-gate navigation state */
var SeHuaTangPatchTest6 = (function(){
    var BASE=SeHuaTangRemoteRuntime;
    var VERSION='0.1.0-test.6',BUILD=10106,RULE_NAME='色花堂';
    var DEFAULT_ORIGIN='https://sehuatang.org';
    var KEY_ORIGIN='sht_origin_v1',KEY_WEB_COOKIE='sht_web_cookie_v5',KEY_ACCESS_STATE='sht_access_state_v5',KEY_ACCESS_TIME='sht_access_time_v5';
    function s(v){return v==null?'':String(v)}
    function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
    function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
    function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
    function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
    function accessTarget(mode){var o=origin();if(mode==='signin')return o+'/plugin.php?id=dd_sign:index&mobile=2';if(mode==='forum')return o+'/forum.php?mobile=2';return o+'/member.php?mod=logging&action=login&mobile=2'}
    function access(){
        var d=[],o=origin(),mode=pageParam('sht_mode','login'),target=pageParam('sht_target','')||accessTarget(mode),title=mode==='signin'?'色花堂签到':(mode==='forum'?'色花堂访问确认':'色花堂网页登录');
        setPageTitle(title);
        d.push({title:title,url:o+'/',desc:'list&&screen-90',col_type:'x5_webview_single',extra:{ua:typeof MOBILE_UA==='undefined'?'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/150 Mobile Safari/537.36':MOBILE_UA,showProgress:false,canBack:true,jsLoadingInject:true,js:$.toString(function(host,target,ckKey,stateKey,timeKey){
            if(window.__shtAutoGateTimer)clearTimeout(window.__shtAutoGateTimer);
            function txt(el){if(!el)return'';return String(el.innerText||el.textContent||el.value||(el.getAttribute&&el.getAttribute('aria-label'))||'').replace(/\s+/g,' ').trim()}
            function ageButton(){
                var groups=['a,button,input[type="button"],input[type="submit"],[role="button"]','[onclick]'],g,nodes,i,t;
                for(g=0;g<groups.length;g++){
                    nodes=document.querySelectorAll(groups[g]);
                    for(i=0;i<nodes.length;i++){
                        t=txt(nodes[i]);
                        if(/满\s*18\s*岁|年满\s*18|over\s*18|18\s*years|please\s*click\s*here/i.test(t))return nodes[i];
                    }
                }
                return null;
            }
            function saveCookie(){var co='';try{co=fba.getCookie(location.origin)||''}catch(e){}if(!co){try{co=fba.getCookie(host)||''}catch(e2){}}if(co){try{fba.putVar(ckKey,co)}catch(e3){}}return co}
            function tick(){
                var body=(document.body&&document.body.innerText)||'',btn=ageButton(),rel=String(target||'').replace(/^https?:\/\/[^/]+/i,''),seen='';
                if(btn){try{sessionStorage.removeItem('sht_target_seen')}catch(e0){};try{btn.click()}catch(e1){try{if(btn.href)location.href=btn.href}catch(e2){}}window.__shtAutoGateTimer=setTimeout(tick,700);return}
                if(body.length<40){window.__shtAutoGateTimer=setTimeout(tick,400);return}
                saveCookie();try{fba.putVar(stateKey,'passed');fba.putVar(timeKey,String(Date.now()))}catch(e3){}
                try{seen=sessionStorage.getItem('sht_target_seen')||''}catch(e4){}
                if(target&&rel&&location.href.indexOf(rel)>=0){try{sessionStorage.setItem('sht_target_seen','1')}catch(e5){};seen='1'}
                if(target&&rel&&location.href.indexOf(rel)<0&&seen!=='1'){try{sessionStorage.setItem('sht_target_seen','1')}catch(e6){};location.href=target;return}
                window.__shtAutoGateTimer=setTimeout(tick,1200)
            }
            tick();
        },o,target,KEY_WEB_COOKIE,KEY_ACCESS_STATE,KEY_ACCESS_TIME)}});
        d.push({title:'自动处理说明',desc:'首次出现 18+ 页面会自动点击确认；随后只自动跳转一次到登录/签到目标。登录成功后即使官网跳回论坛，也不会再次被脚本拉回登录页。验证码、人机验证仍由官网完成。',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
        setResult(d)
    }
    function module(){var m=BASE.module();m.version=VERSION;m.build=BUILD;m.access=access;return m}
    var PATCHED={version:VERSION,build:BUILD,module:module};SeHuaTangRemoteRuntime=PATCHED;return PATCHED;
})();
