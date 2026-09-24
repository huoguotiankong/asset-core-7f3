/* Test24: route selection and safe, URL-free playback diagnostics. */
(function(C,P,Play){
    function link(x){return typeof x==='string'?x:String(x&&x.url||'');}
    function raw(d){return String(d.web_content_link||(d.links&&d.links['application/octet-stream']&&d.links['application/octet-stream'].url)||'');}
    function origin(m){return m.is_origin===true||m.is_origin===1||m.is_origin==='true'||/原画|原始|original|origin/i.test(String(m.media_name||'')+' '+String(m.resolution_name||''));}
    function label(m,i){return String(m.resolution_name||m.media_name||(origin(m)?'原画':'线路 '+(i+1)));}
    function smoothScore(x){var s=0,n=x.name,u=x.url;if(origin(x.media))s+=1000;if(/\.m3u8(?:\?|$)/i.test(u))s-=120;if(/1080|fhd/i.test(n))s-=80;else if(/720|hd/i.test(n))s-=60;else if(/480|sd/i.test(n))s-=25;else if(/2160|4k|8k/i.test(n))s+=70;return s;}
    function tracks(d){var out=[],seen={},a=d.medias instanceof Array?d.medias:[];for(var i=0;i<a.length;i++){var m=a[i]||{},u=link(m.link);if(u&&!seen[u]){seen[u]=1;out.push({name:label(m,i),url:u,media:m,order:i});}}var r=raw(d);if(r&&!seen[r])out.push({name:'原文件 · 兼容',url:r,raw:true,order:a.length});return out;}
    function order(a,mode){var media=[],r=[];for(var i=0;i<a.length;i++)(a[i].raw?r:media).push(a[i]);if(mode==='raw')return r.concat(media);if(mode==='smooth')media.sort(function(x,y){return smoothScore(x)-smoothScore(y)||x.order-y.order;});if(mode==='origin')media.sort(function(x,y){return Number(origin(y.media))-Number(origin(x.media))||x.order-y.order;});return media.concat(r);}
    function saveDiag(d){try{C.writeJsonItem('playback_diag',d);}catch(e){}}
    function diagnostic(d){return d&&typeof d==='object'?d:{};}
    function subtitles(d){var a=d.subtitle_files instanceof Array?d.subtitle_files:[];for(var i=0;i<a.length;i++){var x=a[i]||{},u=link(x.link),n=String(x.name||x.file_name||'');if(u&&(/\.(srt|vtt|ass)(\?|$)/i.test(n)||String(x.mime_type||'').indexOf('subtitle')>=0))return u;}return '';}
    function result(d,hint,elapsed,source){
        if(!d||d.error||d.error_code){saveDiag({stage:'取链失败',source:source,apiMs:elapsed,errorCode:String(d&&d.error||d&&d.error_code||'unknown').slice(0,70)});return 'toast://'+C.errorText(d);}
        var mime=String(d.mime_type||hint||'').toLowerCase(),video=mime.indexOf('video')>=0||(d.medias instanceof Array&&d.medias.length>0),url=raw(d);if(!video){if(mime.indexOf('image')>=0)return url?url+'#.jpg':'toast://暂无图片地址';if(mime.indexOf('audio')>=0)return url?url+'#isMusic=true#':'toast://暂无音频地址';return url?'download://'+url:'toast://暂无下载地址';}
        var mode=C.item('playback_route','smooth'),a=order(tracks(d),mode);if(!a.length){saveDiag({stage:'无播放地址',source:source,apiMs:elapsed});return 'toast://PikPak 暂未返回可播放地址';}
        var names=[],urls=[],headers=[];for(var i=0;i<a.length;i++){names.push(a[i].name);urls.push(a[i].url+'#isVideo=true#');headers.push({});}
        var picked=a[0],kind=picked.raw?'原文件':origin(picked.media)?'原画':'转码',format=/\.m3u8(?:\?|$)/i.test(picked.url)?'HLS':'直链';saveDiag({stage:'已交给海阔播放器',source:source,apiMs:elapsed,mode:mode,first:picked.name,kind:kind,format:format,mediaCount:a.length-(a[a.length-1].raw?1:0),lineCount:a.length});
        var model={names:names,urls:urls,headers:headers},sub=subtitles(d);if(sub)model.subtitle=sub;return JSON.stringify(model)+'#isVideo=true#';
    }
    Play.playFromDetail=function(d,mime){return result(d,mime,0,'详情');};
    Play.personal=function(id,mime,temp){if(!C.loggedIn())return 'toast://请先登录 PikPak';id=String(id||'');var start=new Date().getTime(),waits=temp?[0,100,180,300]:[0],d=null;for(var i=0;i<waits.length;i++){if(waits[i])java.lang.Thread.sleep(waits[i]);d=P.getFile(id,'PLAY');if(d&&(d.error||d.error_code||d.medias&&d.medias.length||!temp&&raw(d)))break;}if(temp&&d&&!d.error&&!d.error_code)P.queueTemp(id);return result(d,mime,new Date().getTime()-start,temp?'Magnet':'个人网盘');};
    Play.share=function(sid,id,token,mime){var start=new Date().getTime(),r=P.shareFileInfo(String(sid||''),String(id||''),String(token||''));return result(r&&r.file_info||r,mime,new Date().getTime()-start,'公开分享');};
    Play.taskFile=function(t){t=t||{};var id=String(t.file_id||(t.reference_resource&&t.reference_resource.id)||''),mime=String((t.reference_resource&&t.reference_resource.mime_type)||(t.params&&t.params.mime_type)||'video');return id?Play.personal(id,mime,false):'toast://任务文件尚未就绪';};
})(PikPakCore,PikPakProvider,PikPakPlayback);
