/* PikPak Test16 Build10118 - materialize Magnet videos inside My Pack */
(function(C,P,Play){
    function err(o,fallback){var t=C.errorText(o);return 'toast://'+(t&&t!=='请求失败'?t:(fallback||'操作失败'));}
    function createdId(r){if(!r||r.error||r.error_code)return '';var f=r.file||{};if(f.id&&(!f.phase||f.phase==='PHASE_TYPE_COMPLETE'))return String(f.id);return String(r.file_id||'');}
    Play.materializeMagnet=function(file,magnet){
        if(!C.loggedIn())return 'toast://播放 Magnet 前请先登录 PikPak';file=file||{};if(!P.isVideo(file))return 'toast://播放列表仅支持视频文件';
        magnet=String(magnet||'');P.cleanupTemps();var pack=P.ensureMyPack();if(!pack||pack.error||pack.error_code)return err(pack,'无法定位 My Pack 文件夹');var parentId=String(pack.id||''),id='',r=null;
        if(file.hash){
            r=P.instantCreate(file,parentId);id=createdId(r);
            if(id){var first=Play.personal(id,file.mime_type||'video',true);if(first.indexOf('toast://PikPak 暂未返回可播放地址')!==0)return first;try{P.trash([id]);}catch(e){}r=P.instantCreate(file,parentId);id=createdId(r);if(id)return Play.personal(id,file.mime_type||'video',true);}
        }
        r=P.createOffline(magnet,parentId,file.name||'',file.file_index);if(!r||r.error||r.error_code)return err(r,'创建离线任务失败');id=createdId(r);if(!id&&r.task&&r.task.file_id)id=String(r.task.file_id);if(!id&&r.task&&r.task.id)id=P.waitTaskFile(String(r.task.id));if(!id)return 'toast://任务已保存到 My Pack，文件仍在处理中，请稍后到「离线任务」查看';return Play.personal(id,file.mime_type||'video',true);
    };
})(PikPakCore,PikPakProvider,PikPakPlayback);

