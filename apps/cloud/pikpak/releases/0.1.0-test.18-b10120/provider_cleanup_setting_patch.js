/* PikPak Test18 Build10120 - handoff auto-trash preference */
(function(C,P){
    var baseQueue=P.queueTemp;
    P.handoffAutoTrashEnabled=function(){return C.item('handoff_auto_trash','on')!=='off';};
    P.queueTemp=function(id){
        var origin='';try{origin=String(getMyVar('pikpak_v3_temp_origin','')||'');}catch(e){}
        if(origin==='handoff'&&!P.handoffAutoTrashEnabled())return;
        return baseQueue(id);
    };
})(PikPakCore,PikPakProvider);

