/* PikPak Test23 Build10125 - official media first playback and fast seek */
(function(C,P,Play){
    var cache={};
    function error(o,fallback){var t=C.errorText(o);return 'toast://'+(t&&t!=='请求失败'?t:(fallback||'获取播放地址失败'));}
    function linkOf(x){if(!x)return '';if(typeof x==='string')return x;return String(x.url||x.web_content_link||(x.link&&x.link.url)||'');}
    function videoFlag(u){u=String(u||'');return u&&u.indexOf('#isVideo=true#')<0?u+'#isVideo=true#':u;}
    function imageFlag(u){u=String(u||'');return u&&u.indexOf('#.jpg')<0&&u.indexOf('#.png')<0?u+'#.jpg':u;}
    function mediaName(m,i){var n=String(m.resolution_name||m.media_name||'');if(!n)n=m.is_origin?'原画':'官方线路 '+(i+1);if(m.is_origin&&n.indexOf('原画')<0&&n.toLowerCase().indexOf('origin')<0)n='原画 · '+n;return n;}
    function add(lines,seen,name,url,kind){url=String(url||'');if(!url||seen[url])return;seen[url]=1;lines.push({name:String(name||('线路 '+(lines.length+1))),url:url,kind:kind||'media'});}
    function orderedLines(d){
        var lines=[],seen={},medias=d&&d.medias instanceof Array?d.medias:[],raw=String(d&&d.web_content_link||((d&&d.links&&d.links['application/octet-stream'])?d.links['application/octet-stream'].url:'')||''),mode=C.item('playback_route','media');
        for(var i=0;i<medias.length;i++){var m=medias[i]||{},u=linkOf(m.link);if(u)add(lines,seen,mediaName(m,i),u,'media');}
        if(mode==='raw'&&raw){if(seen[raw]){for(var j=0;j<lines.length;j++)if(lines[j].url===raw){var same=lines.splice(j,1)[0];same.name='原文件 · 兼容线路';same.kind='raw';lines.unshift(same);break;}}else{lines.unshift({name:'原文件 · 兼容线路',url:raw,kind:'raw'});seen[raw]=1;}}
        else add(lines,seen,'原文件 · 备用线路',raw,'raw');
        return lines;
    }
    function subtitleOf(d){var a=d&&d.subtitle_files instanceof Array?d.subtitle_files:[];for(var i=0;i<a.length;i++){var s=a[i]||{},u=linkOf(s)||linkOf(s.link),n=String(s.name||s.file_name||u||'').toLowerCase();if(u&&(/\.(srt|vtt|ass)(\?|$)/i.test(n)||String(s.mime_type||'').toLowerCase().indexOf('subtitle')>=0))return u;}return '';}
    function fromDetail(d,mimeHint){
        if(!d||d.error||d.error_code)return error(d);
        var mime=String(d.mime_type||mimeHint||'').toLowerCase(),lines=orderedLines(d),isVideo=mime.indexOf('video')>=0||(d.medias instanceof Array&&d.medias.length>0),raw=String(d.web_content_link||((d.links&&d.links['application/octet-stream'])?d.links['application/octet-stream'].url:'')||'');
        if(isVideo){if(!lines.length)return 'toast://PikPak 暂未返回可播放地址';var names=[],urls=[],headers=[];for(var i=0;i<lines.length;i++){names.push(lines[i].name);urls.push(videoFlag(lines[i].url));headers.push({});}var model={names:names,urls:urls,headers:headers},sub=subtitleOf(d);if(sub)model.subtitle=sub;return JSON.stringify(model);}
        if(mime.indexOf('audio')>=0)return raw?raw+'#isMusic=true#':'toast://PikPak 暂未返回音频地址';
        if(mime.indexOf('image')>=0)return raw?imageFlag(raw):'toast://PikPak 暂未返回图片地址';
        return raw?'download://'+raw:'toast://PikPak 暂未返回下载地址';
    }
    function playable(d,mime,needMedia){if(!d||d.error||d.error_code)return false;if(String(d.mime_type||mime||'').toLowerCase().indexOf('video')<0)return true;if(d.medias instanceof Array&&d.medias.length)return true;return !needMedia&&!!(d.web_content_link||(d.links&&JSON.stringify(d.links)!=='{}'));}
    function detail(id,mime,isTemp){
        var now=new Date().getTime(),old=cache[id];if(old&&now-old.ts<180000&&playable(old.data,mime,false))return old.data;
        var waits=isTemp?[0,80,160,280,450]:[0],d=null;
        for(var i=0;i<waits.length;i++){if(waits[i])java.lang.Thread.sleep(waits[i]);d=P.getFile(id,'PLAY');if(playable(d,mime,isTemp))break;if(d&&C.isAuthError(d))break;}
        if(d&&!d.error&&!d.error_code)cache[id]={ts:now,data:d};return d;
    }
    Play.playFromDetail=fromDetail;
    Play.personal=function(id,mime,isTemp){if(!C.loggedIn())return 'toast://请先登录 PikPak';id=String(id||'');var d=detail(id,mime,!!isTemp);if(isTemp&&d&&!d.error&&!d.error_code)P.queueTemp(id);return fromDetail(d,mime);};
    Play.share=function(sid,id,token,mime){var r=P.shareFileInfo(String(sid||''),String(id||''),String(token||''));if(!r||r.error||r.error_code)return error(r,'分享文件解析失败');return fromDetail(r.file_info||r,mime);};
    Play.taskFile=function(task){task=task||{};var id=String(task.file_id||(task.reference_resource&&task.reference_resource.id)||'');if(!id)return 'toast://任务文件尚未就绪';var mime=String((task.reference_resource&&task.reference_resource.mime_type)||(task.params&&task.params.mime_type)||'video');return Play.personal(id,mime,false);};
})(PikPakCore,PikPakProvider,PikPakPlayback);
