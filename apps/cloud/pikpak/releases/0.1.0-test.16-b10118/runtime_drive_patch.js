/* PikPak Test16 Build10118 - file management and recycle actions */
(function(C,P,UI,Pages,R){
    var baseModule=R.module;
    function fail(r,msg){return 'toast://'+(C.errorText(r)||msg||'操作失败');}
    function refreshBack(message){toast(message);try{back(true);}catch(e){try{refreshPage(false);}catch(e2){refreshPage();}}return 'hiker://empty';}
    R.module=function(){
        var m=baseModule();
        m.recycle=Pages.recycle;m.folderPicker=Pages.folderPicker;
        m.openFolderPicker=function(mode,id,name,kind){return UI.route('pikpakFolderPicker',{mode:String(mode||'move'),source_id:String(id||''),source_name:String(name||''),source_kind:String(kind||''),parent_id:'',name:'根目录'});};
        m.moveToAction=function(id,parentId){showLoading('正在移动…');var r=P.move([id],parentId||'');hideLoading();if(!r||r.error||r.error_code)return fail(r,'移动失败');return refreshBack('移动完成');};
        m.copyToAction=function(id,parentId){showLoading('正在复制…');var r=P.copy([id],parentId||'');hideLoading();if(!r||r.error||r.error_code)return fail(r,'复制失败');return refreshBack('复制完成');};
        m.restorePrompt=function(id,name){return 'confirm://还原“'+String(name||'该项目')+'”？.js:'+$.toString(function(fid,n){return $.require('pikpak').restoreAction(fid,n);},String(id||''),String(name||''));};
        m.restoreAction=function(id,name){showLoading('正在还原…');var r=P.untrash([id]);hideLoading();if(!r||r.error||r.error_code)return fail(r,'还原失败');toast('已还原“'+String(name||'文件')+'”');refreshPage();return 'hiker://empty';};
        m.purgePrompt=function(id,name){return 'confirm://永久删除“'+String(name||'该项目')+'”？此操作无法恢复.js:'+$.toString(function(fid){return $.require('pikpak').purgeAction(fid);},String(id||''));};
        m.purgeAction=function(id){showLoading('正在永久删除…');var r=P.purge([id]);hideLoading();if(!r||r.error||r.error_code)return fail(r,'永久删除失败');toast('已永久删除');refreshPage();return 'hiker://empty';};
        m.emptyTrashAction=function(){showLoading('正在清空回收站…');var r=P.emptyTrash();hideLoading();if(!r||r.error||r.error_code)return fail(r,'清空回收站失败');toast('回收站已清空');refreshPage();return 'hiker://empty';};
        return m;
    };
})(PikPakCore,PikPakProvider,PikPakUI,PikPakPages,PikPakRemoteRuntime);

