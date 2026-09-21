(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到正式版115.简，请先保留/更新 Stable 1.1.0";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
if(Number(rule.version||0)<2026092111) return "toast://当前115.简基线过旧，请先更新 Stable 1.1.0";
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115页面失败："+e2.message;}
var idx=-1;
for(var i=0;i<pages.length;i++) if(pages[i]&&pages[i].path==="115Offline"){idx=i;break;}
if(idx<0) return "toast://当前115.简缺少115Offline页面";
var off=String(pages[idx].rule||"");
if(off.indexOf("let focusMode = !!autoAdd;")<0||off.indexOf("addOfflineTaskURIs")<0) return "toast://115Offline基线与 Stable 1.1.0 不一致，停止覆盖";

var helper=`
// Test 1.2.0-test.1: 官方云下载目录 + 短时自动追踪 + 当前页快速文件夹
function _115Json(text){
    try { return JSON.parse(String(text||"")); } catch(e) { return null; }
}
function _115CloudCidFrom(obj){
    if(!obj) return "";
    let x=(obj.data&&typeof obj.data==="object")?obj.data:obj;
    let id=x.dest_cid!==undefined?x.dest_cid:(x.destCid!==undefined?x.destCid:x.cid);
    id=String(id===undefined||id===null?"":id);
    return id&&id!=="0"?id:"";
}
function _115ValidDir(c,id){
    if(!id||id==="0") return false;
    try { let f=c.getFile(String(id)); return !!(f&&f.fileId&&f.isDirectory); } catch(e) { return false; }
}
function resolveCloudDownloadCid(c){
    let cached="";
    try { cached=String(getItem("115CloudDownloadCid","")||""); } catch(e0){}
    if(cached&&_115ValidDir(c,cached)) return cached;
    if(cached){ try{setItem("115CloudDownloadCid","");}catch(e1){} }
    let cookie="";
    try { cookie=String(getCookie("https://115.com/")||""); } catch(e2){}
    let urls=[
        "https://clouddownload.115.com/?ac=get_id&torrent=1&_="+Date.now(),
        "https://115.com/?ct=lixian&ac=get_id&torrent=1&_="+Date.now()
    ];
    for(let i=0;i<urls.length;i++){
        try{
            let txt=fetch(urls[i],{timeout:4500,headers:{"User-Agent":MOBILE_UA,"Referer":"https://115.com/","Cookie":cookie}});
            let cid=_115CloudCidFrom(_115Json(txt));
            if(cid){
                try{setItem("115CloudDownloadCid",cid);setItem("115CloudDownloadCidMode","official-get-id");}catch(e3){}
                return cid;
            }
        }catch(e4){}
    }
    // 极端兼容兜底：只在根目录寻找已有“云下载/离线下载”目录，不创建猜测目录。
    try{
        let r=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"});
        let a=(r&&r.files)||[];
        for(let j=0;j<a.length;j++){
            let f=a[j]||{};
            if(f.isDirectory&&/^(云下载|离线下载)$/i.test(String(f.name||""))){
                let cid2=String(f.fileId||"");
                if(cid2){ try{setItem("115CloudDownloadCid",cid2);setItem("115CloudDownloadCidMode","root-name-fallback");}catch(e5){} return cid2; }
            }
        }
    }catch(e6){}
    try{setItem("115CloudDownloadCidMode","root-fallback");}catch(e7){}
    return "0";
}
function _115Sleep(ms){
    try { java.lang.Thread.sleep(ms); return; } catch(e){}
    try { Packages.java.lang.Thread.sleep(ms); } catch(e2){}
}
function _115FindTaskByHashOrUrl(tasks,hash,link){
    let hh=String(hash||"").toLowerCase(),raw=String(link||"").trim();
    for(let i=0;i<tasks.length;i++){
        let t=tasks[i]||{};
        if(hh&&String(t.infoHash||"").toLowerCase()===hh) return t;
        if(raw&&String(t.url||"").trim()===raw) return t;
    }
    return null;
}
function pollCurrentTask(link,hash){
    let waits=[260,420,650,900,1250];
    let last=null;
    for(let n=0;n<waits.length;n++){
        try{
            let a=listTasks(2);
            let t=_115FindTaskByHashOrUrl(a,hash,link);
            if(t){
                last=t;
                if(t.status===2||t.status===-1||String(t.fileId||"")) return t;
            }
        }catch(e){}
        if(n<waits.length-1) _115Sleep(waits[n]);
    }
    return last;
}
function _115TaskRoot(c,t){
    if(!t) return null;
    if(t.fileId){
        try { let f=c.getFile(String(t.fileId)); if(f&&f.fileId) return f; } catch(e){}
    }
    if(t.dirId){
        try{
            let r=c.getFiles(String(t.dirId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"});
            let a=(r&&r.files)||[];
            for(let i=0;i<a.length;i++) if(String(a[i].name||"")===String(t.name||"")) return a[i];
        }catch(e2){}
    }
    return null;
}
function appendFastResultItems(t,out){
    if(!t||t.status!==2) return false;
    let c;
    try{c=api.newClient();}catch(e){return false;}
    let root=_115TaskRoot(c,t);
    if(!root) return false;
    out.push({title:'<b>📂 '+String(root.name||t.name||"离线结果")+'</b>',desc:"离线完成 · 已进入文件夹，点视频直接播放",col_type:"rich_text",extra:{textSize:17}});
    let arr=[];
    if(root.isDirectory){
        try{
            let r=c.getFiles(String(root.fileId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"});
            arr=(r&&r.files)||[];
        }catch(e2){arr=[];}
    }else arr=[root];
    arr.sort((a,b)=>{
        if(!!a.isDirectory!==!!b.isDirectory) return a.isDirectory?-1:1;
        return String(a.name||"").localeCompare(String(b.name||""),"zh-CN",{numeric:true});
    });
    let shown=0;
    for(let i=0;i<arr.length&&shown<80;i++){
        let f=arr[i]||{};
        let name=String(f.name||"未命名");
        if(f.isDirectory){
            out.push({title:"📁 "+name,desc:"文件夹",col_type:"text_1",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简·测试"))+"&page=fypage&cid="+encodeURIComponent(String(f.fileId||""))+"&cname="+encodeURIComponent(name)});
            shown++;
            continue;
        }
        let kind="";
        try{kind=api.tool.fileKind(name);}catch(e3){}
        if(kind==="video"){
            let payload=JSON.stringify({pc:f.pickCode||"",fid:f.fileId||"",name:name,kind:"video"});
            out.push({title:"▶ "+name,desc:api.tool.formatSize(f.size||0)+" · 点击播放",col_type:"text_1",url:$().lazyRule((p)=>{let a=$.require("115Api");return a.player.resolve(p);},payload)});
            shown++;
        }
    }
    if(root.isDirectory){
        out.push({title:"📂 打开完整文件夹",desc:arr.length>80?("当前快速展示前80项 · 共"+arr.length+"项"):"进入原版115文件浏览",col_type:"text_2",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简·测试"))+"&page=fypage&cid="+encodeURIComponent(String(root.fileId||""))+"&cname="+encodeURIComponent(String(root.name||t.name||"离线结果"))});
    }
    return shown>0;
}
`;

off=off.replace("function statusLine(t) {",helper+"\nfunction statusLine(t) {");
off=off.replace(/client\.addOfflineTaskURIs\(\[autoAdd\],\s*[\"']0[\"']\)/g,"client.addOfflineTaskURIs([autoAdd], resolveCloudDownloadCid(client))");
off=off.replace(/c\.addOfflineTaskURIs\(\[link\],\s*[\"']0[\"']\)/g,"c.addOfflineTaskURIs([link], resolveCloudDownloadCid(c))");
off=off.replace(/c\.addOfflineTaskURIs\(add,\s*[\"']0[\"']\)/g,"c.addOfflineTaskURIs(add, resolveCloudDownloadCid(c))");

var marker="if (myPage === 1) {\n    d.push({";
var poll=`if (focusMode && currentHash && (!currentTask || currentTask.status !== 2)) {
    let ptask = pollCurrentTask(autoAdd, currentHash);
    if (ptask) {
        currentTask = ptask;
        currentHash = String(ptask.infoHash || currentHash || "");
        autoMessage = ptask.status === 2 ? "离线已完成，文件已就绪" :
            (ptask.status === -1 ? "离线任务失败，可删除后重试" : "任务已创建，正在由115处理");
    }
}

`;
if(off.indexOf(marker)<0) return "toast://Test补丁定位失败：未找到首屏标记";
off=off.replace(marker,poll+marker);
var itemMarker="d.push(makeTaskItem(currentTask, true));";
if(off.indexOf(itemMarker)<0) return "toast://Test补丁定位失败：未找到当前任务卡";
off=off.replace(itemMarker,itemMarker+"\n            if (currentTask.status === 2) appendFastResultItems(currentTask, d);");

pages[idx].rule=off.replace(/115\.简·测试/g,"115.简·测试");
rule.title="115.简·测试";
rule.author="AI&三鲜汤 · 云下载目录/快速离线 Test 1.2.0-test.1";
rule.version=2026092202;
rule.pages=JSON.stringify(pages);
try{
  var fr=String(rule.find_rule||"");
  fr=fr.replace(/115\.简(?!·测试)/g,"115.简·测试");
  rule.find_rule=fr;
}catch(e3){}
var out="hiker://files/cache/115_test_12001_fast_offline.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()