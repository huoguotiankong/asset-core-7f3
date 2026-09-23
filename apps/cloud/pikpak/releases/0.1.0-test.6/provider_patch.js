/* PikPak 0.1.0-test.6 Provider Patch - handoff-scoped temp lifecycle */
(function(C,P){
    var TEMP_KEY='temp_files';
    var ORIGIN_VAR='pikpak_v3_temp_origin';
    var SESSION_VAR='pikpak_v3_handoff_session';
    function readTemps(){var a=C.readJsonItem(TEMP_KEY,[]);return a instanceof Array?a:[];}
    function writeTemps(a){C.writeJsonItem(TEMP_KEY,a instanceof Array?a:[]);}
    function my(k){try{return String(getMyVar(k,'')||'');}catch(e){return '';}}
    function normalizeEntry(x){x=x||{};return {id:String(x.id||''),ts:Number(x.ts||0),origin:String(x.origin||'legacy'),session:String(x.session||'')};}
    function uniquePush(a,e){for(var i=a.length-1;i>=0;i--)if(String(a[i]&&a[i].id||'')===e.id)a.splice(i,1);a.push(e);}
    function queueTemp(id){
        id=String(id||'');if(!id)return;
        var a=readTemps(),e={id:id,ts:new Date().getTime(),origin:my(ORIGIN_VAR)||'internal',session:my(SESSION_VAR)};
        uniquePush(a,e);if(a.length>50)a=a.slice(a.length-50);writeTemps(a);
    }
    function trashIds(ids){
        ids=ids instanceof Array?ids:[ids];var out=[];
        for(var i=0;i<ids.length;i++)if(String(ids[i]||''))out.push(String(ids[i]));
        if(!out.length)return {ok:true,count:0};
        var r=P.trash(out);
        if(r&&(r.error||r.error_code))return r;
        return {ok:true,count:out.length,raw:r};
    }
    function cleanupTemps(force){
        if(!C.loggedIn())return {ok:false,error:'NOT_LOGGED_IN',error_description:'请先登录 PikPak'};
        var a=readTemps();if(!a.length)return {ok:true,count:0,moved:0};
        var now=new Date().getTime(),ids=[],keep=[];
        for(var i=0;i<a.length;i++){
            var e=normalizeEntry(a[i]),eligible=!!force||(e.ts>0&&now-e.ts>900000);
            if(e.id&&eligible&&ids.length<20)ids.push(e.id);else keep.push(a[i]);
        }
        if(!ids.length)return {ok:true,count:0,moved:0,kept:keep.length};
        var r=trashIds(ids);
        if(!r||r.error||r.error_code)return r||{error:'TRASH_FAILED',error_description:'临时文件移入回收站失败'};
        writeTemps(keep);return {ok:true,count:ids.length,moved:ids.length,kept:keep.length};
    }
    function cleanupHandoffSession(session){
        session=String(session||'');if(!session)return {ok:true,count:0,moved:0};
        if(!C.loggedIn())return {ok:false,error:'NOT_LOGGED_IN',error_description:'登录状态已失效'};
        var a=readTemps(),ids=[],keep=[];
        for(var i=0;i<a.length;i++){
            var e=normalizeEntry(a[i]);
            if(e.id&&e.origin==='handoff'&&e.session===session&&ids.length<20)ids.push(e.id);else keep.push(a[i]);
        }
        if(!ids.length)return {ok:true,count:0,moved:0};
        var r=trashIds(ids);
        if(!r||r.error||r.error_code)return r||{error:'TRASH_FAILED',error_description:'调用临时文件移入回收站失败'};
        writeTemps(keep);return {ok:true,count:ids.length,moved:ids.length,kept:keep.length};
    }
    /* Safety rail: temporary playback must never use permanent batchDelete. */
    P.deletePermanent=function(ids){return trashIds(ids);};
    P.queueTemp=queueTemp;
    P.cleanupTemps=cleanupTemps;
    P.cleanupHandoffSession=cleanupHandoffSession;
})(PikPakCore,PikPakProvider);
