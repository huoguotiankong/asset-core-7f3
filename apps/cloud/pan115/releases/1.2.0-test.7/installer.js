(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请先保留当前115.简";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
if(Number(rule.version||0)<2026092207) return "toast://当前115.简版本过旧，请先导入1.2.0-test.6";
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115页面失败："+e2.message;}
var idx=-1;
for(var i=0;i<pages.length;i++) if(pages[i]&&pages[i].path==="115Offline"){idx=i;break;}
if(idx<0) return "toast://当前115.简缺少115Offline页面";
var off=String(pages[idx].rule||"");
if(off.indexOf("_115ResolveTargetCid")<0||off.indexOf("appendFastResultItems")<0) return "toast://当前115.简不是Test6基线，停止覆盖";

var start='// 外部磁链调用模式：先给出页面，再处理任务。\nif (focusMode && myPage === 1) {';
var end='\n\nif (myPage === 1) {';
var s=off.indexOf(start),e=off.indexOf(end,s);
if(s<0||e<0) return "toast://Test7补丁定位失败：focus";

var dynamic=`// 外部磁链调用模式：迅雷式动态任务页，不再用静态等待壳。
if (focusMode) {
    currentHash=callHash;
    autoMessage=cachedResult?"已有网盘播放结果":"正在提交/确认115离线任务";
}

if (focusMode && myPage === 1) {
    let _focusId="pan115_focus_"+String(callHash||"magnet").slice(0,16);
    let _dirId=_focusId+"_dir";
    let _ready=null;
    try{let _rt=getItem("115FocusReady_"+String(callHash||"").toLowerCase(),"");_ready=_rt?JSON.parse(_rt):null;}catch(_re){}
    let _mode=_115TargetMode(),_dest=_115SavedTargetCid();
    let _folder=_mode.indexOf("hiker")===0?"海阔视界":(_mode.indexOf("cloud")===0?"云下载":"海阔视界优先");
    let _base=[
        {title:'<b>🎬 115 磁链播放</b>'.fontcolor("#2B6CB0"),desc:"任务状态会自动更新，完成后直接显示文件",col_type:"rich_text",extra:{textSize:19}},
        {title:"⏳ 正在提交到 115",desc:"无需手动刷新，正在确认离线任务",col_type:"text_1",url:"hiker://empty",extra:{id:_focusId,lineVisible:false}},
        {title:"📁 保存目录："+_folder,desc:_dest!=="0"?("CID: "+_dest):"优先根目录/海阔视界，不存在则云下载",col_type:"text_1",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(_dest),extra:{id:_dirId,lineVisible:false}},
        {title:"🔄 手动刷新",col_type:"text_2",url:$("刷新").lazyRule(()=>{refreshPage(false);return false;})},
        {title:"📋 全部离线任务",col_type:"text_2",url:"hiker://page/115Offline?rule="+MY_RULE.title+"&page=fypage"}
    ];
    if(_ready&&(_ready.fileId||_ready.status===2)){
        _base[1]={title:"✅ 离线完成",desc:String(_ready.name||"离线任务")+" · "+api.tool.formatSize(_ready.size||0)+" · 点击播放/进入文件",col_type:"text_1",url:taskPlayUrl(_ready),extra:{id:_focusId,lineVisible:false}};
        setResult(_base);
        let _more=[];appendFastResultItems(_ready,_more);if(_more.length)addItemAfter(_focusId,_more);
    }else if(cachedResult){
        let _u=cachedResultUrl(cachedResult,callHash,String(MY_RULE.title||"115.简"));
        _base[1]={title:cachedResult.mode==="multi"?"🎞 已有结果 · 选择视频":"▶ 已有结果 · 直接播放",desc:cachedResult.mode==="single"?(String(cachedResult.name||"")+" · "+api.tool.formatSize(cachedResult.size||0)):("已缓存 "+((cachedResult.videos&&cachedResult.videos.length)||0)+" 个视频"),col_type:"text_1",url:_u||"toast://缓存结果不可用",extra:{id:_focusId,lineVisible:false}};
        setResult(_base);
    }else{
        setResult(_base);
        let _h=_115SavedHikerCid(),_c=_115SavedCloudCid();
        let _ds=[0,700,1500,2600,4000,6000,9000,13000],_jobs=[];
        for(let _j=0;_j<_ds.length;_j++){
            _jobs.push({id:"p"+_j,param:{delay:_ds[_j],submit:_j===0,link:String(autoAdd||""),hash:String(callHash||""),hcid:String(_h||"0"),ccid:String(_c||"0")},func:(p)=>{
                if(p.delay>0) Packages.java.lang.Thread.sleep(p.delay);
                let a=$.require("115Api"),c=a.newClient();
                function findTask(){
                    let all=[];
                    for(let pg=1;pg<=2;pg++){
                        try{let r=c.listOfflineTask(pg),ar=(r&&r.tasks)||[];if(!ar.length)break;for(let i=0;i<ar.length;i++)all.push(ar[i]);if(r.pageCount&&pg>=r.pageCount)break;}catch(ex){break;}
                    }
                    for(let i=0;i<all.length;i++){
                        let t=all[i]||{};
                        if(p.hash&&String(t.infoHash||"").toLowerCase()===String(p.hash).toLowerCase())return t;
                        if(String(t.url||"").trim()===String(p.link||"").trim())return t;
                    }
                    return null;
                }
                let t=findTask();
                if(t)return JSON.stringify({kind:"task",task:t});
                if(!p.submit)return JSON.stringify({kind:"poll",found:false});
                let dest=(p.hcid&&p.hcid!=="0")?p.hcid:((p.ccid&&p.ccid!=="0")?p.ccid:"0"),mode=(p.hcid&&p.hcid!=="0")?"hiker-cache":((p.ccid&&p.ccid!=="0")?"cloud-cache-fallback":"root-fallback");
                if(dest==="0"){
                    let cloud="";
                    try{
                        let rr=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"}),ar=(rr&&rr.files)||[];
                        for(let i=0;i<ar.length;i++){
                            let f=ar[i]||{};if(!f.isDirectory)continue;let n=String(f.name||"").trim(),cid=String(f.fileId||"");if(!cid)continue;
                            if(n==="海阔视界"){dest=cid;mode="hiker-root";break;}
                            if(!cloud&&/^(云下载|离线下载)$/i.test(n))cloud=cid;
                        }
                        if(dest==="0"&&cloud){dest=cloud;mode="cloud-root-fallback";}
                    }catch(er0){}
                }
                try{let added=c.addOfflineTaskURIs([p.link],dest);return JSON.stringify({kind:"submit",ok:true,hash:(added&&added[0])?String(added[0]):String(p.hash||""),dest:dest,mode:mode});}
                catch(er1){return JSON.stringify({kind:"submit",ok:false,error:String(er1&&er1.message||er1||""),dest:dest,mode:mode});}
            }});
        }
        batchExecute(_jobs,{param:{focusId:_focusId,dirId:_dirId,hash:String(callHash||""),ruleTitle:String(MY_RULE.title||"115.简")},func:(p,id,error,ret)=>{
            function sz(n){n=Number(n||0);if(n<=0)return "";let u=["B","KB","MB","GB","TB"],i=0;while(n>=1024&&i<u.length-1){n/=1024;i++;}return (i>=3?n.toFixed(2):n.toFixed(i?1:0))+" "+u[i];}
            if(error){if(id==="p0")updateItem(p.focusId,{title:"⏳ 115响应较慢",desc:"提交请求异常，但后台仍会继续确认是否已接单",extra:{id:p.focusId,lineVisible:false}});return;}
            let r=null;try{r=JSON.parse(String(ret||"{}"));}catch(ex){return;}
            if(r.dest&&String(r.dest)!=="0"){
                if(String(r.mode||"").indexOf("hiker")===0)setItem("115HikerVisionCid",String(r.dest));else if(String(r.mode||"").indexOf("cloud")===0)setItem("115CloudDownloadCid",String(r.dest));
                setItem("115OfflineTargetMode",String(r.mode||"root-fallback"));
                let nm=String(r.mode||"").indexOf("hiker")===0?"海阔视界":(String(r.mode||"").indexOf("cloud")===0?"云下载":"根目录");
                updateItem(p.dirId,{title:"📁 保存目录："+nm,desc:"CID: "+String(r.dest),url:"hiker://page/115List?rule="+encodeURIComponent(p.ruleTitle)+"&page=fypage&cid="+encodeURIComponent(String(r.dest)),extra:{id:p.dirId,lineVisible:false}});
            }
            if(r.kind==="submit"){
                updateItem(p.focusId,r.ok?{title:"✅ 已提交到 115",desc:"正在等待115建立/完成离线任务…",extra:{id:p.focusId,lineVisible:false}}:{title:"⏳ 115提交响应异常",desc:"任务可能已受理，后台继续确认，请勿重复提交",extra:{id:p.focusId,lineVisible:false}});return;
            }
            if(r.kind==="task"&&r.task){
                let t=r.task||{},tt="⏳ 115已建立任务",dd="等待离线完成";
                if(t.status===1){let pct=Number(t.percent||0);tt="⬇ 正在离线 "+(pct>0?(Math.round(pct*100)/100+"%"):"");dd=(t.rateDownload>0?("速度 "+sz(t.rateDownload)+"/s · "):"")+sz(t.size||0);}
                else if(t.status===-1){tt="❌ 115离线失败";dd=String(t.name||"任务失败")+" · 可在全部离线任务中重试";}
                else if(t.status===2||t.fileId){tt="✅ 离线完成";dd=String(t.name||"离线任务")+" · "+sz(t.size||0)+" · 正在载入文件";}
                updateItem(p.focusId,{title:tt,desc:dd,extra:{id:p.focusId,lineVisible:false}});
                if(t.status===2||t.fileId){setItem("115FocusReady_"+String(p.hash||"").toLowerCase(),JSON.stringify(t));refreshPage(false);return "break";}
            }else if(id==="p7")updateItem(p.focusId,{title:"⏳ 115仍在后台处理中",desc:"页面不会被锁住；可稍后手动刷新或查看全部离线任务",extra:{id:p.focusId,lineVisible:false}});
        }});
    }
}`;

off=off.slice(0,s)+dynamic+off.slice(e);
off=off.replace('if (myPage === 1) {','if (!focusMode && myPage === 1) {');
off=off.replace('if (focusMode) {\n    if (myPage === 1) setResult(d);\n} else {','if (!focusMode) {');
if(off.indexOf("pan115_focus_")<0) return "toast://Test7补丁生成失败";

pages[idx].rule=off;
rule.title="115.简";
rule.author="AI&三鲜汤 · 动态磁链任务页 1.2.0-test.7";
rule.version=2026092208;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_12007_dynamic_focus.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
