/* ACFun Remote Bootstrap v2.0.0
 * 正式远程代码版：本地规则仅保留轻量启动壳，业务代码与版本切换全部在 GitHub。
 */
var ACFUN_BOOTSTRAP_VERSION='2.0.0';
var ACFUN_BOOTSTRAP_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2';
var ACFUN_MANAGER_URL='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=2';
var ACFUN_HC_CONFIG={
    id:'acfun',
    branch:'main',
    repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',
    latestPath:'apps/video/acfun/latest.json',
    moduleHeaders:{'Cache-Control':'no-cache'},
    defaultRelease:{
        schema:1,id:'acfun',name:'ACFun',version:'0.2.0',build:120,ref:'main',
        modules:[
            {name:'core',path:'acfun_core_v018.js'},
            {name:'protocol',path:'acfun_patch_v019.js'},
            {name:'diagnostics',path:'acfun_diag_v019.js'},
            {name:'ui',path:'acfun_ui_v020.js'}
        ],
        verify:{global:'ac',property:'build',equals:'2026.08.20-v0.2.0'}
    }
};

var ACFunBoot={
    requireManager:function(){
        require(ACFUN_MANAGER_URL,{headers:{'Cache-Control':'no-cache'}},200);
        if(typeof HikerCloudRemote!=='object')throw new Error('远程模块管理器加载失败');
        return HikerCloudRemote;
    },
    legacyLoaderCode:function(){
        return "require('"+ACFUN_BOOTSTRAP_URL+"',{headers:{'Cache-Control':'no-cache'}},200);ACFunBoot.loadOnly();";
    },
    installCompatibility:function(){
        var loader=this.legacyLoaderCode();
        setItem('acfun_core_src_v018',loader);
        setItem('acfun_core_src_v019',loader);
    },
    ensureBaseline:function(manager){
        var info=manager.info(ACFUN_HC_CONFIG),cur=info.current||{};
        if(Number(cur.build||0)<Number(ACFUN_HC_CONFIG.defaultRelease.build)){
            var r=manager.resetToDefault(ACFUN_HC_CONFIG);
            if(!r||!r.ok)throw new Error('升级到正式远程基线失败：'+((r&&r.error)||'unknown'));
        }
    },
    patchNav:function(){
        if(typeof ac!=='object'||ac.__hcRemoteNavPatched)return;
        var oldNav=ac.nav;
        if(typeof oldNav!=='function')return;
        ac.nav=function(d){
            oldNav.call(ac,d);
            d.push({title:'更新',col_type:'scroll_button',url:'hiker://page/acfun_update?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 远程更新'}});
        };
        ac.__hcRemoteNavPatched=true;
    },
    loadOnly:function(){
        var manager=this.requireManager();
        this.ensureBaseline(manager);
        var result=manager.load(ACFUN_HC_CONFIG);
        if(!result||!result.ok||typeof ac!=='object')throw new Error('ACFun远程核心加载失败');
        this.installCompatibility();
        this.patchNav();
        return result;
    },
    run:function(action){
        this.loadOnly();
        switch(String(action||'home')){
            case 'home':return ac.home();
            case 'search':return ac.search();
            case 'detail':return ac.detail();
            case 'comments':return ac.comments();
            case 'favorites':return ac.localPage('fav');
            case 'history':return ac.localPage('hist');
            case 'settings':return ac.settings();
            case 'diag':return ac.diag();
            default:throw new Error('未知ACFun页面动作: '+action);
        }
    },
    info:function(){return this.requireManager().info(ACFUN_HC_CONFIG);},
    check:function(){var r=this.requireManager().check(ACFUN_HC_CONFIG);setItem('hc_acfun_last_check',JSON.stringify(r));return r;},
    update:function(){var r=this.requireManager().update(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
    rollback:function(){var r=this.requireManager().rollback(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
    reinstall:function(){var r=this.requireManager().reinstall(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
    resetDefault:function(){var r=this.requireManager().resetToDefault(ACFUN_HC_CONFIG);setItem('hc_acfun_last_result',JSON.stringify(r));if(r.ok)this.installCompatibility();return r;},
    updatePage:function(){
        var d=[];setPageTitle('ACFun 远程更新');
        var info;
        try{info=this.info();}catch(e){setResult([{title:'更新管理器加载失败',desc:String(e.message||e),col_type:'long_text',url:'hiker://empty'}]);return;}
        var current=info.current||ACFUN_HC_CONFIG.defaultRelease,previous=info.previous||null,lastCheck={};
        try{lastCheck=JSON.parse(getItem('hc_acfun_last_check','{}'))||{};}catch(e0){}
        var latest=lastCheck.latest||null;
        d.push({title:'当前业务版本  '+current.version,desc:'Build：'+current.build+'\n启动壳：'+ACFUN_BOOTSTRAP_VERSION+'\n模块管理器：'+info.managerVersion+'\n模式：正式远程代码版'+(previous?'\n上一版本：'+previous.version+' / '+previous.build:''),col_type:'long_text',url:'hiker://empty'});
        d.push({title:latest?('云端版本  '+latest.version+(lastCheck.hasUpdate?'  ↑ 可更新':'  ✓ 已是最新')):'检查云端版本',desc:latest?('Build：'+latest.build+(lastCheck.notes?'\n'+lastCheck.notes:'')):'点击后读取 latest.json；正常打开不会额外检查版本。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('检查 ACFun 更新…');try{require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2',{headers:{'Cache-Control':'no-cache'}},200);var r=ACFunBoot.check();hideLoading();refreshPage(false);return 'toast://'+(r.hasUpdate?('发现新版本 '+r.latest.version):'已是最新版');}catch(e){hideLoading();return 'toast://检查失败：'+(e.message||e);}})});
        d.push({title:'立即更新',desc:'先下载并执行新模块，校验通过后才切换版本；失败继续使用当前版本。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('更新 ACFun…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2',{headers:{'Cache-Control':'no-cache'}},200);var r=ACFunBoot.update();hideLoading();if(r.ok){clearItem('hc_acfun_last_check');refreshPage(false);return 'toast://'+(r.changed?('已更新到 '+r.current.version):'当前已经是最新版');}return 'toast://更新失败：'+r.error;})});
        d.push({title:'回退上一版本',desc:previous?('可回退到 '+previous.version+' / '+previous.build):'当前没有上一版本记录',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2',{headers:{'Cache-Control':'no-cache'}},200);var r=ACFunBoot.rollback();if(r.ok){clearItem('hc_acfun_last_check');refreshPage(false);return 'toast://已回退到 '+r.current.version;}return 'toast://'+r.error;})});
        d.push({title:'重新加载当前版本',desc:'清除当前版本模块缓存并从 GitHub 重新获取，不改变收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){showLoading('重新加载当前版本…');require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2',{headers:{'Cache-Control':'no-cache'}},200);var r=ACFunBoot.reinstall();hideLoading();return 'toast://'+(r.ok?'当前版本已重新缓存':('重新加载失败：'+r.error));})});
        d.push({title:'恢复正式基线版本',desc:'恢复到启动壳内置稳定版 '+ACFUN_HC_CONFIG.defaultRelease.version+'，不会清除收藏、历史和接口设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_v2.js?v=2',{headers:{'Cache-Control':'no-cache'}},200);var r=ACFunBoot.resetDefault();if(r.ok){clearItem('hc_acfun_last_check');refreshPage(false);return 'toast://已恢复 '+r.current.version;}return 'toast://恢复失败：'+r.error;})});
        d.push({title:'远程架构说明',desc:'以后 ACFun 只维护这一套远程代码版。本地规则仅负责调用 bootstrap_v2.js；协议、解析、UI、播放和后续功能全部以远程模块发布，可在线更新/回退。',col_type:'long_text',url:'hiker://empty'});
        setResult(d);
    }
};
