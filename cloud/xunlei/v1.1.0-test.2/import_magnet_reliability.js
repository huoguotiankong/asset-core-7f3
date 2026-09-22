(function(){
function getInstalledRule(name){
    var raw='';
    try{raw=String(request('hiker://home@'+name)||'');}catch(e){raw='';}
    if(!raw||raw==='null')throw new Error('未找到已安装的“'+name+'”规则');
    var p=raw.indexOf('￥home_rule￥');
    if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);
    else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
    try{return JSON.parse(raw);}catch(e2){throw new Error('读取当前迅雷规则失败：'+String(e2.message||e2));}
}
function findFunctionEnd(code,start){
    var open=code.indexOf('{',start),depth=0,quote='',esc=false,i,c;
    if(open<0)return-1;
    for(i=open;i<code.length;i++){
        c=code.charAt(i);
        if(quote){
            if(esc)esc=false;
            else if(c==='\\')esc=true;
            else if(c===quote)quote='';
        }else{
            if(c==='"'||c==="'"||c==='`')quote=c;
            else if(c==='{')depth++;
            else if(c==='}'){
                depth--;
                if(depth===0)return i+1;
            }
        }
    }
    return-1;
}
function replaceFunc(code,name,newCode){
    var re=new RegExp('function\\s+'+name+'\\s*\\([^)]*\\)\\s*\\{'),m=re.exec(code),end;
    if(!m)throw new Error('迅雷源码中找不到函数：'+name);
    end=findFunctionEnd(code,m.index);
    if(end<0)throw new Error('迅雷函数边界解析失败：'+name);
    return code.substring(0,m.index)+newCode+code.substring(end);
}
var o=getInstalledRule('迅雷');
var pages=[];
try{pages=typeof o.pages==='string'?JSON.parse(o.pages):(o.pages||[]);}catch(e3){throw new Error('迅雷 pages 解析失败');}
var hi=-1,i;
for(i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==='hanshu')hi=i;
if(hi<0)throw new Error('当前迅雷版本缺少 hanshu 页面');
var r=String(pages[hi].rule||'');
if(r.indexOf('function resolvePlay(')<0)throw new Error('当前不是 Test1 磁链加速版，请先保留现有迅雷并重新导入上一版 Test1');

var newYunbo=`function yunbo(name, url, file_index) {
    function createTask() {
        let body1 = JSON.stringify({"kind":"drive#file","name":name,"upload_type":"UPLOAD_TYPE_URL","url":{"url":url,"files":[file_index]},"parent_id":""});
        return post1error("https://api-pan.xunlei.com/drive/v1/files", "undefined", body1);
    }
    let html1 = createTask();
    if (html1 && html1.error_description && /(次数|权益|privilege|fluent|play)/i.test(String(html1.error_description))) {
        if (activity(true)) html1 = createTask();
    }
    if (!html1) return "";
    if (html1.error_description) {toast(html1.error_description);return "";}
    let taskId = html1.task && html1.task.id ? String(html1.task.id) : "";
    if (!taskId) return "";
    // 只信任离线任务真正落盘后的 task.file_id。
    // Test1 过早采用 reference_resource.id / create response id，实机出现“文件(夹)不存在”。
    let waits = [0,100,160,260,420,650,900];
    for (let i=0;i<waits.length;i++) {
        if (waits[i] > 0) java.lang.Thread.sleep(waits[i]);
        let url2 = 'https://api-pan.xunlei.com/drive/v1/tasks?type=offline&page_token=&filters={"id":{"in":"'+taskId+'"}}&with=reference_resource';
        let t = get1error(url2, "undefined");
        let task = t && t.tasks && t.tasks.length ? t.tasks[0] : null;
        if (task && task.file_id) return String(task.file_id);
        if (task && task.error_description && !/(处理中|等待|pending|running)/i.test(String(task.error_description))) break;
    }
    return "";
}`;

var newResolvePlay=`function resolvePlay(id,mime_type,isTemp) {
    if (!id) return "hiker://empty";
    let url1="https://api-pan.xunlei.com/drive/v1/files/"+id+"?_magic=2021&usage=PLAY&with=hdr10&with=subtitle_files";
    let waits=[0,140,240,380,600,850],html1=null,lastErr="";
    for (let i=0;i<waits.length;i++) {
        if (waits[i]>0) java.lang.Thread.sleep(waits[i]);
        html1=get1error(url1,"undefined");
        if (!html1) continue;
        if (html1.error_description) {
            lastErr=String(html1.error_description||"");
            // 迅雷离线文件刚生成后存在短暂最终一致性窗口，此类错误继续等，不立即判死。
            if (/(文件.*不存在|文件\(夹\)不存在|not.?found|不存在)/i.test(lastErr)) continue;
            toast(lastErr);return "hiker://empty";
        }
        let linksReady=html1.links && JSON.stringify(html1.links)!=="{}";
        if (linksReady || !String(html1.mime_type||mime_type||"").includes("video")) break;
    }
    if (!html1 || html1.error_description) {
        if (lastErr) toast(lastErr);
        return "hiker://empty";
    }
    if (html1.audit && html1.audit.title) {toast(html1.audit.title);return "hiker://empty";}
    if (isTemp) queueTempFile(id);
    let links=html1.links||{}, raw=links["application/octet-stream"]&&links["application/octet-stream"].url?links["application/octet-stream"].url:"";
    let realMime=String(html1.mime_type||mime_type||"");
    if (realMime.includes("video")) {
        let names=[],urls=[];
        if (raw) {names.push("原始画质");urls.push(raw);}
        let medias=html1.medias||[];
        for (let i=0;i<medias.length;i++) if (medias[i]&&medias[i].link&&medias[i].link.url) {names.push(String(medias[i].media_name||("转码线路"+(i+1))));urls.push(medias[i].link.url);}
        if (!urls.length) return "hiker://empty";
        return JSON.stringify({names:names,urls:urls})+"#isVideo=true#";
    }
    if (realMime.includes("image")) return raw?raw+"#.jpg":"hiker://empty";
    if (realMime.includes("audio")) return raw?raw+"#isMusic=true#":"hiker://empty";
    return raw?"download://"+raw:"hiker://empty";
}`;

var newLazy3=`function lazy3(input) {
    return $("").lazyRule((input) => {
        let name=input[0], meta=JSON.parse(input[1]), dir=input[2], file_size=input[3], file_index=input[4];
        if (dir !== "null") return $("hiker://empty?page=fypage#"+MY_URL.split("#")[1]+"#noLoading##noHistory##noRecordHistory#").rule((dir) => {
            let H=$.require("hanshu"), d=[], list1=JSON.parse(dir).resources;
            list1.forEach(item => d.push({title:item.name,desc:H.bytesToSize(item.file_size),img:item.meta.icon,url:H.lazy3(item.name+"#"+JSON.stringify(item.meta)+"#"+JSON.stringify(item.dir)+"#"+item.file_size+"#"+item.file_index),col_type:"avatar",extra:{pageTitle:item.name}}));
            setResult(d);
        }, dir);
        let H=$.require("hanshu");
        // 保留原版权益刷新语义，但 Test1 的 activity() 已带本地 TTL：首次需要时刷新，后续快速命中。
        H.activity(false);
        let id=H.yunbo(name, MY_URL.split("#")[1], file_index);
        if (!id) return "toast://迅雷离线任务尚未落盘，请稍后再点一次";
        return H.resolvePlay(id, meta.mime_type || "video", true);
    }, input.split("#"));
}`;

r=replaceFunc(r,'yunbo',newYunbo);
r=replaceFunc(r,'resolvePlay',newResolvePlay);
r=replaceFunc(r,'lazy3',newLazy3);
pages[hi].rule=r;
o.version=3;
o.author='zhao · Test2磁链可靠性修复';
o.pages=JSON.stringify(pages);
return JSON.stringify(o);
})()