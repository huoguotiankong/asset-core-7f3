/* 色花堂 0.1.0-test.3 / Build 10103 - rendered topic list recovery patch */
var SeHuaTangPatchTest3 = (function () {
    var BASE = SeHuaTangRemoteRuntime;
    var VERSION = '0.1.0-test.3', BUILD = 10103, RULE_NAME = '色花堂';
    var DEFAULT_ORIGIN = 'https://sehuatang.org';
    var UA = 'Mozilla/5.0 (Linux; Android 13; zh-CN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
    var KEY_ORIGIN = 'sht_origin_v1', KEY_DIAG = 'sht_diag_v1';
    var LOGO = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/aggregate/sehuatang/assets/v1/logo.svg';

    function s(v){return v==null?'':String(v)}
    function trim(v){return s(v).replace(/^\s+|\s+$/g,'')}
    function dec(v){v=s(v);try{return decodeURIComponent(v)}catch(e){return v}}
    function hdec(v){
        var x=s(v),i=0;
        for(i=0;i<2;i++) x=x.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&nbsp;/gi,' ').replace(/&#(\d+);/g,function(_,n){try{return String.fromCharCode(Number(n))}catch(e){return _}});
        return x;
    }
    function strip(v){return trim(hdec(v).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/\s+/g,' '))}
    function origin(){var o=trim(getItem(KEY_ORIGIN,DEFAULT_ORIGIN));return /^https?:\/\//i.test(o)?o.replace(/\/+$/,''):DEFAULT_ORIGIN}
    function originOf(u){var m=s(u).match(/^(https?:\/\/[^\/]+)/i);return m?m[1]:origin()}
    function abs(h,b){h=hdec(trim(h));if(!h)return'';if(/^https?:\/\//i.test(h))return h;if(/^\/\//.test(h))return'https:'+h;if(/^(javascript:|mailto:|tel:|#)/i.test(h))return'';var o=(s(b).match(/^(https?:\/\/[^\/]+)/i)||[])[1]||origin();if(h.charAt(0)==='/')return o+h;var c=s(b).split('#')[0].split('?')[0];if(c.charAt(c.length-1)!=='/')c=c.replace(/\/[^\/]*$/,'/');return c+h.replace(/^\.\//,'')}
    function addMobile(u){u=s(u);if(!u)return u;if(/[?&]mobile=(?:\d+|yes|no)(?:&|$)/i.test(u))return u;return u+(u.indexOf('?')>=0?'&':'?')+'mobile=2'}
    function pageParam(n,d){var u=s(typeof MY_URL==='undefined'?'':MY_URL),m=u.match(new RegExp('[?&]'+n+'=([^&#]*)'));return m?dec(m[1]):(d==null?'':d)}
    function headers(u){var o=originOf(u),c='';try{c=getCookie(o)||''}catch(e){}var h={'User-Agent':UA,'Referer':o+'/'};if(c)h.Cookie=c;return h}
    function diag(stage,u,info){try{setItem(KEY_DIAG,JSON.stringify({stage:stage,origin:originOf(u),error:s(info||'').slice(0,260),time:new Date().getTime()}))}catch(e){}}
    function titleOf(html){var m=s(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);return m?strip(m[1]).slice(0,80):''}
    function req(u){try{return s(fetch(u,{headers:headers(u),timeout:10000}))}catch(e){return''}}
    function anchors(html,base){var out=[],re=/<a\b([^>]*?)href\s*=\s*(?:["']([^"']+)["']|([^\s>]+))([^>]*)>([\s\S]*?)<\/a>/gi,m,a,t,tm;while((m=re.exec(s(html)))!==null){a=(m[1]||'')+' '+(m[4]||'');t=strip(m[5]||'');if(!t){tm=a.match(/\b(?:title|aria-label)\s*=\s*["']([^"']+)["']/i);if(tm)t=strip(tm[1])}out.push({href:abs(m[2]||m[3]||'',base),text:t,attrs:a});if(out.length>9000)break}return out}
    function threadId(u){var x=hdec(s(u)),m=x.match(/[?&]tid=(\d+)/i)||x.match(/[?&]ptid=(\d+)/i)||x.match(/\/thread-(\d+)-\d+-\d+\.html/i);return m?m[1]:''}
    function normalizeThread(u){var id=threadId(u);if(!id)return addMobile(u);if(/[?&]ptid=\d+/i.test(u)&&!/([?&]tid=\d+)/i.test(u))return originOf(u)+'/forum.php?mod=viewthread&tid='+id+'&mobile=2';return addMobile(u)}
    function isThread(u){var x=hdec(s(u));return !!threadId(x) && (/forum\.php\?/i.test(x)||/\/thread-\d+-\d+-\d+\.html/i.test(x))}
    function parseThreads(html,base){
        var a=anchors(html,base),out=[],seen={},i,x,id,t;
        for(i=0;i<a.length;i++){
            x=a[i];if(!isThread(x.href))continue;id=threadId(x.href);if(!id||seen[id])continue;
            t=trim(x.text);
            if(!t||t.length<2||/^(回复|查看|查看全部|最后发表|最后回复|上一页|下一页|返回|详情|进入)$/i.test(t))continue;
            if(/^\d+$/.test(t))continue;
            seen[id]=1;out.push({id:id,title:t.slice(0,140),url:normalizeThread(x.href),desc:''});
            if(out.length>=120)break;
        }
        return {items:out,anchors:a.length};
    }
    function route(path,p){var u='hiker://page/'+path+'?rule='+RULE_NAME+'&simple=true',k;for(k in(p||{}))if(p.hasOwnProperty(k)&&p[k]!=null)u+='&'+k+'='+encodeURIComponent(s(p[k]));return u}
    function section(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}}}
    function line(){return{col_type:'line'}}
    function empty(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}}}
    function web(u){return'x5://'+addMobile(u)}
    function quick(t,u){return{title:t,img:LOGO,url:u,col_type:'icon_small_4',extra:{lineVisible:false}}}
    function withPage(u,p){p=Math.max(1,Number(p||1));u=s(u);if(/\/forum-\d+-\d+\.html(?:\?|$)/i.test(u))return u.replace(/\/forum-(\d+)-\d+\.html/i,'/forum-$1-'+p+'.html');if(/([?&])page=\d+/i.test(u))return u.replace(/([?&])page=\d+/i,'$1page='+p);return u+(u.indexOf('?')>=0?'&':'?')+'page='+p}
    function pcVariant(u){u=s(u);if(/[?&]mobile=2(?:&|$)/i.test(u))return u.replace(/([?&])mobile=2(?:&|$)/i,function(_,p){return p+'mobile=no&'}).replace(/&$/,'');return u+(u.indexOf('?')>=0?'&':'?')+'mobile=no'}
    function rendered(u){
        try{
            return s(fetchCodeByWebView(u,{headers:headers(u),timeout:16000,blockRules:['.mp4','.m3u8','.woff','.woff2','.ttf'],checkJs:$.toString(function(){
                var hasThread=document.querySelector('a[href*="tid="],a[href*="thread-"],#threadlist,.threadlist');
                var body=document.body&&document.body.innerText?document.body.innerText.length:0;
                return (hasThread||body>800)?'ready':null;
            })}));
        }catch(e){return''}
    }
    function loadThreadList(seed,pg){
        var u=withPage(seed,pg),html='',parsed={items:[],anchors:0},steps=[],alt='';
        html=req(u);parsed=parseThreads(html,u);steps.push('fetch:'+html.length+'字/'+parsed.anchors+'链接/'+parsed.items.length+'主题'+(titleOf(html)?'/'+titleOf(html):''));
        if(parsed.items.length)return{items:parsed.items,source:'fetch',url:u,diag:steps.join('；')};

        html=rendered(u);parsed=parseThreads(html,u);steps.push('webview:'+html.length+'字/'+parsed.anchors+'链接/'+parsed.items.length+'主题'+(titleOf(html)?'/'+titleOf(html):''));
        if(parsed.items.length)return{items:parsed.items,source:'webview',url:u,diag:steps.join('；')};

        alt=pcVariant(u);
        if(alt!==u){
            html=req(alt);parsed=parseThreads(html,alt);steps.push('pc-fetch:'+html.length+'字/'+parsed.anchors+'链接/'+parsed.items.length+'主题'+(titleOf(html)?'/'+titleOf(html):''));
            if(parsed.items.length)return{items:parsed.items,source:'pc-fetch',url:alt,diag:steps.join('；')};
            html=rendered(alt);parsed=parseThreads(html,alt);steps.push('pc-webview:'+html.length+'字/'+parsed.anchors+'链接/'+parsed.items.length+'主题'+(titleOf(html)?'/'+titleOf(html):''));
            if(parsed.items.length)return{items:parsed.items,source:'pc-webview',url:alt,diag:steps.join('；')};
        }
        return{items:[],source:'none',url:u,diag:steps.join('；')};
    }
    function forum(){
        var d=[],seed=pageParam('sht_url',''),name=pageParam('sht_name','主题列表'),pg=Math.max(1,Number(typeof MY_PAGE==='undefined'?1:MY_PAGE||1)),r,i;
        setPageTitle(name);
        if(!seed){setResult([empty('板块参数缺失')]);return}
        try{
            r=loadThreadList(seed,pg);diag('forum.list.test3',r.url,r.diag);
            if(pg===1){
                d.push(quick('网页版',web(seed)));d.push(quick('搜索',route('shtSearch')));d.push(line());
                d.push(section(name,r.items.length?'当前页 '+r.items.length+' 条主题 · '+r.source:'未取得可解析主题'));
            }
            for(i=0;i<r.items.length;i++)d.push({title:r.items[i].title,desc:'查看帖子',url:route('shtThread',{sht_url:r.items[i].url,sht_name:r.items[i].title}),col_type:'movie_1',extra:{lineVisible:false}});
            if(!r.items.length){
                d.push(empty('仍没有解析到主题','本版已自动尝试普通请求、WebView 渲染源码、PC 页面三条链路'));
                d.push({title:'诊断信息',desc:r.diag||'无诊断数据',url:'hiker://empty',col_type:'long_text',extra:{lineVisible:false}});
                d.push({title:'打开当前网页版',desc:'确认网页本身是否正常显示主题',url:web(seed),col_type:'text_1'});
            }
        }catch(e){
            var msg=s(e&&e.message||e).slice(0,220);diag('forum.list.test3.error',seed,msg);d.push(empty('主题列表加载失败',msg));
        }
        setResult(d)
    }
    function module(){var m=BASE.module();m.version=VERSION;m.build=BUILD;m.forum=forum;m._debug=m._debug||{};m._debug.parseThreadsTest3=function(html,base){return parseThreads(html,base).items};return m}
    var PATCHED={version:VERSION,build:BUILD,module:module};
    SeHuaTangRemoteRuntime=PATCHED;
    return PATCHED;
})();
