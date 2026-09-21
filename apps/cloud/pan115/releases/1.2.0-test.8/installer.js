(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请先保留当前115.简";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
if(Number(rule.version||0)!==2026092207) return "toast://请先恢复到115 Test6（2026092207）后再导入本版";
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115页面失败："+e2.message;}
var idx=-1;
for(var i=0;i<pages.length;i++) if(pages[i]&&pages[i].path==="115Offline"){idx=i;break;}
if(idx<0) return "toast://当前115.简缺少115Offline页面";
var off=String(pages[idx].rule||"");
if(off.indexOf("_115ResolveTargetCid")<0||off.indexOf("appendFastResultItems")<0) return "toast://当前115.简不是Test6安全基线，停止覆盖";

var start='// 外部磁链调用模式：先给出页面，再处理任务。\\nif (focusMode && myPage === 1) {';
var end='\\n\\nif (myPage === 1) {';
var s=off.indexOf(start),e=off.indexOf(end,s);
if(s<0||e<0) return "toast://Test8补丁定位失败：focus";

var dynamic=`// 外部磁链调用模式：安全单线程低频确认。
if (focusMode) {
    currentHash=callHash;
    autoMessage=cachedResult?"已有网盘播放结果":"正在提交/确认115离线任务";
}

if (focusMode && myPage === 1) {
    let _focusId="pan115_safe_"+String(callHash||"magnet").slice(0,16);
    let _dirId=_focusId+"_dir";
    let _ready=null;
    try{let _rt=getItem("115FocusReady_"+String(callHash||"").toLowerCase(),"");_ready=_rt?JSON.parse(_rt):null;}catch(_re){}
    let _mode=_115TargetMode(),_dest=_115SavedTargetCid();
    let _folder=_mode.indexOf("hiker")===0?"海阔视界":(_mode.indexOf("cloud")===0?"云下载":"海阔视界优先");
    let _base=[
        {title:'<b>🎬 115 磁链播放</b>'.fontcolor("#2B6CB0"),desc:"安全低频确认 · 不影响我的文件/普通网盘",col_type:"rich_text",extra:{textSize:19}},
        {title:"⏳ 正在提交到 115",desc:"后台只使用1个任务，最多低频确认2次",col_type:"text_1",url:"hiker://empty",extra:{id:_focusId,lineVisible:false}},
        {title:"📁 保存目录："+_folder,desc:_dest!=="0"?("CID: "+_dest):"优先根目录/海阔视界，不存在则云下载",col_type:"text_1",url:_dest!=="0"?("hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(_dest)):"hiker://empty",extra:{id:_dirId,lineVisible:false}},
        {title:"🔄 手动确认状态",col_type:"text_2",url:$("刷新").lazyRule(()=>{refreshPage(false);return "hiker://empty";})},
        {title:"📋 全部离线任务",col_type:"text_2",url:"hiker://page/115Offline?rule="+MY_RULE.title+"&page=fypage"}
    ];
    if(_ready&&(_ready.fileId||_ready.status===2)){
        _base[1]={title:"✅ 离线完成",desc:String(_ready.name||"离线任务")+" · "+api.tool.formatSize(_ready.size||0)+" · 点击播放/进入文件",col_type:"text_1",url:taskPlayUrl(_ready),extra:{id:_focusId,lineVisible:false}};
        let _more=[];appendFastResultItems(_ready,_more);
        setResult(_base.concat(_more));
    }else if(cachedResult){
        let _u=cachedResultUrl(cachedResult,callHash,String(MY_RULE.title||"115.简"));
        _base[1]={title:cachedResult.mode==="multi"?"🎞 已有结果 · 选择视频":"▶ 已有结果 · 直接播放",desc:cachedResult.mode==="single"?(String(cachedResult.name||"")+" · "+api.tool.formatSize(cachedResult.size||0)):("已缓存 "+((cachedResult.videos&&cachedResult.videos.length)||0)+" 个视频"),col_type:"text_1",url:_u||"toast://缓存结果不可用",extra:{id:_focusId,lineVisible:false}};
        setResult(_base);
    }else{
        setResult(_base);
        batchExecute([{id:"safe",param:{link:String(autoAdd||""),hash:String(callHash||""),hcid:String(_115SavedHikerCid()||"0"),ccid:String(_115SavedCloudCid()||"0")},func:(p)=>{
            let a=$.require("115Api"),c=a.newClient();
            function findTask(){
                try{
                    let r=c.listOfflineTask(1),ar=(r&&r.tasks)||[];
                    for(let i=0;i<ar.length;i++){
                        let t=ar[i]||{};
                        if(p.hash&&String(t.infoHash||"").toLowerCase()===String(p.hash).toLowerCase())return t;
                        if(String(t.url||"").trim()===String(p.link||"").trim())return t;
                    }
                }catch(ex){}
                return null;
            }
            let t=findTask(),dest=(p.hcid&&p.hcid!=="0")?p.hcid:((p.ccid&&p.ccid!=="0")?p.ccid:"0"),mode=(p.hcid&&p.hcid!=="0")?"hiker-cache":((p.ccid&&p.ccid!=="0")?"cloud-cache-fallback":"root-fallback"),submitErr="";
            if(!t){
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
                try{c.addOfflineTaskURIs([p.link],dest);}catch(er1){submitErr=String(er1&&er1.message||er1||"");}
                Packages.java.lang.Thread.sleep(1400);
                t=findTask();
                if(!t){Packages.java.lang.Thread.sleep(3200);t=findTask();}
            }
            return JSON.stringify({task:t||null,dest:dest,mode:mode,submitError:submitErr});
        }}],{param:{focusId:_focusId,dirId:_dirId,hash:String(callHash||""),ruleTitle:String(MY_RULE.title||"115.简")},func:(p,id,error,ret)=>{
            if(error){updateItem(p.focusId,{title:"⏳ 115响应较慢",desc:"自动确认已停止，避免影响其它115页面；可稍后手动确认",extra:{id:p.focusId,lineVisible:false}});return;}
            let r=null;try{r=JSON.parse(String(ret||"{}"));}catch(ex){updateItem(p.focusId,{title:"⏳ 状态确认结束",desc:"返回数据异常；请稍后手动确认，不会继续请求115",extra:{id:p.focusId,lineVisible:false}});return;}
            if(r.dest&&String(r.dest)!=="0"){
                if(String(r.mode||"").indexOf("hiker")===0)setItem("115HikerVisionCid",String(r.dest));else if(String(r.mode||"").indexOf("cloud")===0)setItem("115CloudDownloadCid",String(r.dest));
                setItem("115OfflineTargetMode",String(r.mode||"root-fallback"));
                let nm=String(r.mode||"").indexOf("hiker")===0?"海阔视界":(String(r.mode||"").indexOf("cloud")===0?"云下载":"根目录");
                updateItem(p.dirId,{title:"📁 保存目录："+nm,desc:"CID: "+String(r.dest),url:"hiker://page/115List?rule="+encodeURIComponent(p.ruleTitle)+"&page=fypage&cid="+encodeURIComponent(String(r.dest)),extra:{id:p.dirId,lineVisible:false}});
            }
            let t=r.task||null;
            if(t&&(t.status===2||t.fileId)){
                setItem("115FocusReady_"+String(p.hash||"").toLowerCase(),JSON.stringify(t));
                updateItem(p.focusId,{title:"✅ 离线完成",desc:String(t.name||"离线任务")+" · 正在载入文件",extra:{id:p.focusId,lineVisible:false}});
                refreshPage(false);
                return;
            }
            if(t){
                let pct=Number(t.percent||0),title=t.status===1?("⬇ 115正在离线"+(pct>0?(" · "+(Math.round(pct*100)/100)+"%"):"")):"✅ 115已建立任务";
                let desc=t.status===1?"自动确认已停止，避免触发115风控；稍后点手动确认即可":"任务已建立；稍后点手动确认即可";
                updateItem(p.focusId,{title:title,desc:desc,extra:{id:p.focusId,lineVisible:false}});
            }else{
                let d=r.submitError?("提交响应异常："+String(r.submitError).slice(0,80)+"；可能已受理") : "暂未查询到任务；自动确认已停止";
                updateItem(p.focusId,{title:"⏳ 等待115任务出现",desc:d+"，稍后点手动确认即可",extra:{id:p.focusId,lineVisible:false}});
            }
        }});
    }
}`;

off=off.slice(0,s)+dynamic+off.slice(e);
off=off.replace('if (myPage === 1) {','if (!focusMode && myPage === 1) {');
off=off.replace('if (focusMode) {\\n    if (myPage === 1) setResult(d);\\n} else {','if (!focusMode) {');
if(off.indexOf("pan115_safe_")<0) return "toast://Test8补丁生成失败";

pages[idx].rule=off;
rule.title="115.简";
rule.author="AI&三鲜汤 · 安全低频磁链页 1.2.0-test.8";
rule.version=2026092209;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_12008_safe_focus.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
