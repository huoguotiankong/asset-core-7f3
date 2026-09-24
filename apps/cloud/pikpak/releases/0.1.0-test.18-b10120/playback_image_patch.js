/* PikPak Test18 Build10120 - open image files in Hiker image preview */
(function(P,Play){
    var basePersonal=Play.personal,baseShare=Play.share,baseTask=Play.taskFile;
    function imageResult(result,mime,name){
        if(!P.isVideo({mime_type:mime,name:name})&&String(mime||'').toLowerCase().indexOf('image')>=0){
            result=String(result||'');
            if(result&&result.indexOf('toast://')!==0&&result.indexOf('download://')!==0&&result.indexOf('#.jpg')<0&&result.indexOf('#.png')<0)return result+'#.jpg';
        }
        return result;
    }
    Play.personal=function(id,mime,isTemp){return imageResult(basePersonal(id,mime,isTemp),mime,'');};
    Play.share=function(sid,id,token,mime){return imageResult(baseShare(sid,id,token,mime),mime,'');};
    Play.taskFile=function(task){var mime=String(task&&((task.reference_resource&&task.reference_resource.mime_type)||(task.params&&task.params.mime_type))||'');return imageResult(baseTask(task),mime,String(task&&task.name||''));};
})(PikPakProvider,PikPakPlayback);

