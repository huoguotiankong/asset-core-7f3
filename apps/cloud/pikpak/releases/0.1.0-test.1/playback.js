/* PikPak 0.1.0-test.1 Playback - personal/share/magnet unified playback */
var PikPakPlayback=(function(C,P){
    function err(o,fallback){var t=C.errorText(o);return 'toast://'+(t&&t!=='请求失败'?t:(fallback||'获取播放地址失败'));}
    function linkOf(x){if(!x)return '';if(typeof x==='string')return x;return String(x.url||x.web_content_link||(x.link&&x.link.url)||'');}
    function addLine(names,urls,seen,name,url){url=String(url||'');if(!url||seen[url])return;seen[url]=1;names.push(String(name||('线路'+(names.length+1))));urls.push(url);}
    function subtitleOf(d){var a=d&&d.subtitle_files instanceof Array?d.subtitle_files:[];for(var i=0;i<a.length;i++){var s=a[i]||{},u=linkOf(s)||linkOf(s.link),n=String(s.name||s.file_name||u||'').toLowerCase();if(u&&(/\.(srt|vtt|ass)(\?|$)/i.test(n)||String(s.mime_type||'').toLowerCase().indexOf('subtitle')>=0))return u;}return '';}
    function playFromDetail(d,mimeHint){
        if(!d||d.error||d.error_code)return err(d);
        var mime=String(d.mime_type||mimeHint||'').toLowerCase(),raw=String(d.web_content_link||((d.links&&d.links['application/octet-stream'])?d.links['application/octet-stream'].url:'')||''),medias=d.medias instanceof Array?d.medias:[],isVideo=mime.indexOf('video')>=0||medias.length>0;
        if(isVideo){var names=[],urls=[],seen={};addLine(names,urls,seen,'原画',raw);for(var i=0;i<medias.length;i++){var m=medias[i]||{},u=linkOf(m.link);if(!u)continue;var n=m.resolution_name||m.media_name||(m.is_origin?'原画':'转码线路'+(i+1));addLine(names,urls,seen,n,u);}if(!urls.length)return 'toast://PikPak 暂未返回可播放地址';var headers=[];for(var j=0;j<urls.length;j++)headers.push({});var model={names:names,urls:urls,headers:headers},sub=subtitleOf(d);if(sub)model.subtitle=sub;return JSON.stringify(model)+'#isVideo=true#';}
        if(mime.indexOf('audio')>=0)return raw?raw+'#isMusic=true#':'toast://PikPak 暂未返回音频地址';
        if(mime.indexOf('image')>=0)return raw||'toast://PikPak 暂未返回图片地址';
        return raw?'download://'+raw:'toast://PikPak 暂未返回下载地址';
    }
    function personal(id,mimeHint,isTemp){
        if(!C.loggedIn())return 'toast://请先登录 PikPak';var waits=isTemp?[0,120,240,420,700]:[0],d=null;
        for(var i=0;i<waits.length;i++){if(waits[i]>0)java.lang.Thread.sleep(waits[i]);d=P.getFile(id,'PLAY');if(d&&!d.error&&!d.error_code){var has=!!(d.web_content_link||(d.medias&&d.medias.length)||(d.links&&JSON.stringify(d.links)!=='{}'));if(has||String(d.mime_type||mimeHint||'').toLowerCase().indexOf('video')<0)break;}else if(d&&C.isAuthError(d))break;}
        if(isTemp&&d&&!d.error&&!d.error_code)P.queueTemp(id);return playFromDetail(d,mimeHint);
    }
    function share(shareId,fileId,passToken,mimeHint){var r=P.shareFileInfo(shareId,fileId,passToken||'');if(!r||r.error||r.error_code)return err(r,'分享文件解析失败');return playFromDetail(r.file_info||r,mimeHint);}
    function createdFileId(r){if(!r||r.error||r.error_code)return '';var f=r.file||{};if(f.id&&(!f.phase||f.phase==='PHASE_TYPE_COMPLETE'))return String(f.id);if(r.file_id)return String(r.file_id);return '';}
    function materializeMagnet(file,magnet){
        if(!C.loggedIn())return 'toast://播放 Magnet 前请先登录 PikPak';file=file||{};magnet=String(magnet||'');P.cleanupTemps();var id='',r=null;
        if(file.hash){r=P.instantCreate(file,'');id=createdFileId(r);if(id){var first=personal(id,file.mime_type||'video',true);if(first.indexOf('toast://PikPak 暂未返回可播放地址')!==0)return first;try{P.deletePermanent([id]);}catch(e){}r=P.instantCreate(file,'');id=createdFileId(r);if(id)return personal(id,file.mime_type||'video',true);}}
        r=P.createOffline(magnet,'',file.name||'',file.file_index);if(!r||r.error||r.error_code)return err(r,'创建离线任务失败');id=createdFileId(r);if(!id&&r.task&&r.task.file_id)id=String(r.task.file_id);if(!id&&r.task&&r.task.id)id=P.waitTaskFile(String(r.task.id));if(!id)return 'toast://离线任务已创建，文件仍在处理中，请稍后到「离线任务」查看';return personal(id,file.mime_type||'video',true);
    }
    function taskFile(task){task=task||{};var id=String(task.file_id||(task.reference_resource&&task.reference_resource.id)||'');if(!id)return 'toast://任务文件尚未就绪';var mime=String((task.reference_resource&&task.reference_resource.mime_type)||(task.params&&task.params.mime_type)||'video');return personal(id,mime,false);}
    return {playFromDetail:playFromDetail,personal:personal,share:share,materializeMagnet:materializeMagnet,taskFile:taskFile};
})(PikPakCore,PikPakProvider);