/* PikPak Test27 Build10129 - video history and sanitized playback diagnosis. */
(function(C,Play,UI,Pages){
    function title(s){try{setPageTitle(s);}catch(e){}}
    function action(s,url,desc){return {title:s,desc:desc||'',url:url,col_type:'text_1',extra:{lineVisible:false}};}
    Pages.playHistory=function(){
        title('最近播放');var a=Play.playHistory(),d=[];
        d.push(action('▶ 最近播放','hiker://empty','只记录本机成功取链的个人云盘视频，最多 30 条；不会储存有签名的播放 URL'));
        if(a.length)d.push({title:'清空播放记录',url:'confirm://只清除本机播放记录，不删除云盘文件，继续？.js:'+$.toString(function(){return $.require('pikpak').clearPlayHistoryAction();}),col_type:'scroll_button'});
        for(var i=0;i<a.length;i++){var v=a[i]||{},id=String(v.id||'');if(!id)continue;var name=String(v.name||'').trim()||('视频 · '+id.slice(-8)),desc=(v.ts?C.formatDate(v.ts):'')+(Number(v.size||0)>0?'  ·  '+C.formatSize(v.size):'');
            d.push({title:name,desc:desc,url:$("#noLoading#").lazyRule(function(x){return $.require('pikpak').playPersonal(x.id,x.mime,false);},{id:id,mime:String(v.mime||'video')}),img:'hiker://images/icon_video',col_type:'icon_1_left_pic',extra:{lineVisible:false,inheritTitle:false,cls:'playlist video'}});
        }
        if(a.length===0)d.push(UI.empty('暂无播放记录，打开个人云盘的视频后会自动出现'));
        setResult(d);
    };
    Pages.playDiagnostics=function(){
        title('播放诊断');var x=Play.lastPlaybackDiagnostic(),d=[];
        d.push(action('播放链路检查','hiker://empty','仅记录取链耗时、线路标签与输出格式；海阔播放器首帧和 seek 实际耗时需要实机观察'));
        if(!x||!x.ts){d.push(UI.empty('暂未记录播放数据，请先播放一个视频'));setResult(d);return;}
        var desc='最近请求：'+C.formatDate(x.ts)+'\n'
          +'入口：'+(x.source==='magnet-temp'?'Magnet 临时文件':x.source==='share'?'分享文件':'个人云盘')+'\n'
          +'取链耗时：'+Number(x.linkMs||0)+' ms（不含播放器缓冲）\n'
          +'线路数：'+Number(x.lines||0)+'\n'
          +'首选线路：'+String(x.first||'无')+'\n'
          +'识别类型：'+String(x.format||'未知')+'\n'
          +'播放链接策略：'+(x.fresh?'强制重新取链':'默认缓存策略')+'\n'
          +'线路输出：'+(x.ok?'已生成播放列表':'失败或非视频输出'+(x.errorKind?' · '+x.errorKind:''))+'\n'
          +'字幕：'+(x.subtitle?'有':'未返回');
        d.push(action(x.ok?'✅ 已生成播放地址':'⚠ 播放链接未成功生成','hiker://empty',desc));
        d.push(action('检查现象的方法','hiker://empty','① 若取链耗时高，优先排查 Drive API / Session\n② 若取链很快但首帧慢，重点检查线路 CDN / 播放内核\n③ 若拖动后长期缓冲，尝试原文件兼容线路或均衡画质策略；记录实机结果'));
        d.push({title:'打开播放设置',url:UI.route('pikpakSettings'),col_type:'text_center_1'});
        setResult(d);
    };
})(PikPakCore,PikPakPlayback,PikPakUI,PikPakPages);
