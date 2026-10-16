/* PikPak Test27 Build10129: preserve Test23 player contract; add opt-in route strategy, fresh-link mode and sanitized diagnostics. */
(function(C,P,Play){
    var originalPersonal=Play.personal,originalDetail=P.getFile,known={};
    function now(){return new Date().getTime();}
    function str(v){return String(v==null?'':v);}
    function safe(v){return str(v).slice(0,180);}
    function videoModel(s){if(typeof s!=='string'||s.charAt(0)!=='{')return null;try{var o=JSON.parse(s);return o&&o.urls instanceof Array&&o.names instanceof Array?o:null;}catch(e){return null;}}
    function mediaType(u){u=str(u).split('#')[0].split('?')[0].toLowerCase();return /\.m3u8$/.test(u)?'HLS':/\.(mp4|m4v|mov)$/.test(u)?'MP4':/\.mpd$/.test(u)?'DASH':'未知';}
    function quality(name){name=str(name).toLowerCase();if(/原文件|备用|兼容/.test(name))return 100;if(/720\s*p|1280\s*[x×]\s*720|高清/.test(name))return 0;if(/1080\s*p|1920\s*[x×]\s*1080|全高清/.test(name))return 1;if(/480\s*p|标清/.test(name))return 2;if(/2160\s*p|4k|超清|原画/.test(name))return 4;return 3;}
    function routeResult(raw){var o=videoModel(raw);if(!o||o.urls.length<2||C.item('playback_startup_mode','official')!=='balanced'||C.item('playback_route','media')==='raw')return raw;
        var arr=[],i,b=o.headers instanceof Array?o.headers:[],order=[];
        for(i=0;i<o.urls.length;i++)arr.push({i:i,rank:quality(o.names[i])});
        arr.sort(function(x,y){return x.rank-y.rank||x.i-y.i;});
        for(i=0;i<arr.length;i++)order.push(arr[i].i);
        var names=[],urls=[],headers=[];for(i=0;i<order.length;i++){names.push(o.names[order[i]]);urls.push(o.urls[order[i]]);headers.push(b[order[i]]||{});}
        o.names=names;o.urls=urls;o.headers=headers;
        return JSON.stringify(o);
    }
    function record(result,elapsed,origin,fresh){
        var m=videoModel(result),diag={ts:now(),source:origin,linkMs:Math.max(0,elapsed),fresh:!!fresh,mode:C.item('playback_startup_mode','official'),route:C.item('playback_route','media'),ok:!!m,lines:m?m.urls.length:0,first:m?safe(m.names[0]):'',format:m?mediaType(m.urls[0]):'未知',subtitle:!!(m&&m.subtitle),errorKind:''};
        if(!m){var t=str(result);diag.errorKind=t.indexOf('toast://')===0?'取链失败':t?'非多线路输出':'空地址';}
        C.writeJsonItem('playback_diag_v27',diag);return result;
    }
    function history(id,detail){if(!id)return;var old=C.readJsonItem('play_history_v27',[]),a=old instanceof Array?old:[],next=[],i,meta=detail||known[id]||{};
        var h={id:str(id),name:safe(meta.name||''),mime:safe(meta.mime_type||'video'),size:Number(meta.size||0),ts:now()};
        for(i=0;i<a.length;i++)if(a[i]&&str(a[i].id)!==h.id&&next.length<29)next.push(a[i]);
        next.unshift(h);C.writeJsonItem('play_history_v27',next);
    }
    P.getFile=function(id,usage){var r=originalDetail.apply(P,arguments);if(str(usage)==='PLAY'&&r&&!r.error&&!r.error_code){known[str(id)]={name:safe(r.name||''),mime_type:safe(r.mime_type||''),size:Number(r.size||0)};}return r;};
    Play.personal=function(id,mime,isTemp){
        id=str(id);var start=now(),fresh=C.item('playback_force_fresh','off')==='on',result;
        if(fresh&&!isTemp){var d=P.getFile(id,'PLAY');result=Play.playFromDetail(d,mime);}
        else result=originalPersonal(id,mime,isTemp);
        result=routeResult(result);record(result,now()-start,isTemp?'magnet-temp':'personal',fresh&&!isTemp);
        if(!isTemp&&videoModel(result))history(id,known[id]);
        return result;
    };
    var originalShare=Play.share,originalTask=Play.taskFile;
    Play.share=function(){var t=now(),r=originalShare.apply(Play,arguments);return record(routeResult(r),now()-t,'share',false);};
    Play.taskFile=function(){return originalTask.apply(Play,arguments);};
    Play.lastPlaybackDiagnostic=function(){return C.readJsonItem('playback_diag_v27',{});};
    Play.playHistory=function(){var a=C.readJsonItem('play_history_v27',[]);return a instanceof Array?a:[];};
    Play.clearPlayHistory=function(){C.writeJsonItem('play_history_v27',[]);return true;};
})(PikPakCore,PikPakProvider,PikPakPlayback);
