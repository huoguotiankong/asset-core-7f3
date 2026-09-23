/* PikPak 0.1.0-test.6 Runtime Patch - external handoff session cleanup */
(function(C,P,R){
    var baseModule=R.module;
    var ORIGIN_VAR='pikpak_v3_temp_origin';
    var SESSION_VAR='pikpak_v3_handoff_session';
    function put(k,v){try{putMyVar(k,String(v==null?'':v));}catch(e){}}
    function get(k){try{return String(getMyVar(k,'')||'');}catch(e){return '';}}
    function clearOne(k){try{clearMyVar(k);}catch(e){}}
    function clearHandoffVars(){clearOne(ORIGIN_VAR);clearOne(SESSION_VAR);}
    function newSession(){return 'handoff-'+new Date().getTime()+'-'+String(Math.floor(Math.random()*1000000));}
    function rawParam(){var raw='';try{raw=decodeURIComponent(getParam('realurl',''));}catch(e){try{raw=getParam('realurl','');}catch(e2){raw='';}}return String(raw||'').trim();}
    function isMagnet(s){return /magnet:\?xt=urn:btih:/i.test(String(s||''));}
    function bindClose(session){
        try{
            addListener('onClose',$.toString(function(s){try{$.require('pikpak').cleanupHandoffSessionAction(s);}catch(e){}},session));
            return true;
        }catch(e){return false;}
    }
    R.module=function(){
        var m=baseModule(),baseHandoff=m.handoff,baseOpenInput=m.openInput;
        function cleanupHandoffSessionAction(session){
            session=String(session||'');var r=P.cleanupHandoffSession(session);
            if(get(SESSION_VAR)===session)clearHandoffVars();
            return r;
        }
        function handoff(){
            var raw=rawParam();
            if(isMagnet(raw)){
                var session=newSession();put(ORIGIN_VAR,'handoff');put(SESSION_VAR,session);bindClose(session);
            }else clearHandoffVars();
            return baseHandoff();
        }
        function openInput(text){clearHandoffVars();return baseOpenInput(text);}
        function cleanupTempAction(){
            showLoading('正在把临时播放文件移入回收站…');var r=P.cleanupTemps(true)||{};hideLoading();
            if(r.error||r.error_code)return 'toast://临时文件清理失败：'+C.errorText(r);
            toast((r.moved||r.count)?'已将 '+String(r.moved||r.count)+' 个临时播放文件移入回收站':'没有需要清理的临时播放文件');
            return 'hiker://empty';
        }
        m.version='0.1.0-test.6';m.build=10106;
        m.handoff=handoff;m.openInput=openInput;m.cleanupTempAction=cleanupTempAction;m.cleanupHandoffSessionAction=cleanupHandoffSessionAction;
        return m;
    };
    R.version='0.1.0-test.6';R.build=10106;
})(PikPakCore,PikPakProvider,PikPakRemoteRuntime);
