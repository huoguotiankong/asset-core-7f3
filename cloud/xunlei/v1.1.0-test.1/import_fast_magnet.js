(function(){
function getInstalledRule(name){
    var raw='';
    try{raw=String(request('hiker://home@'+name)||'');}catch(e){raw='';}
    if(!raw||raw==='null')throw new Error('未找到已安装的“'+name+'”规则，请先保留当前迅雷小程序再覆盖导入测试版');
    var p=raw.indexOf('￥home_rule￥');
    if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);
    else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
    var o=null;
    try{o=JSON.parse(raw);}catch(e2){throw new Error('读取当前迅雷规则失败：'+String(e2.message||e2));}
    return o;
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
var hi=-1,di=-1,i;
for(i=0;i<pages.length;i++){
    if(pages[i]&&pages[i].path==='hanshu')hi=i;
    if(pages[i]&&pages[i].path==='diaoyong')di=i;
}
if(hi<0||di<0)throw new Error('当前迅雷版本缺少 hanshu/diaoyong 页面，无法安全覆盖');
var r=String(pages[hi].rule||'');
if(r.indexOf('function resolvePlay(')<0){
var newActivity=`function activity(force) {
    let now = new Date().getTime();
    let last = parseInt(getItem("xunlei_activity_ts", "0") || "0");
    if (!force && last > 0 && now - last < 72000000) return true;
    try {
        let header1 = {"User-Agent":"Android","x-device-id":"99d8a3167df79d0f40fcdc8623ed3266"};
        let body1 = JSON.stringify({"action":"POST:/activity/v1/reward","captcha_token":"","client_id":"Xp6vsxz_7IYVw2BB","device_id":"99d8a3167df79d0f40fcdc8623ed3266","meta":{"captcha_sign":"1.e2e60e5abbf66f6b21cd7855f13d70ad","user_id":getItem("user_id"),"package_name":"com.xunlei.downloadprovider","client_version":"7.49.0.8129","timestamp":String(now)},"redirect_uri":"xlaccsdk01://xunlei.com/callback?state=harbor"});
        let html1 = post1error("https://xluser-ssl.xunlei.com/v1/shield/captcha/init?client_id=Xp6vsxz_7IYVw2BB", header1, body1);
        if (!html1 || !html1.captcha_token) return false;
        let header2 = {"User-Agent":"Android","x-device-id":"99d8a3167df79d0f40fcdc8623ed3266","authorization":getItem("authorization", ""),"x-captcha-token":html1.captcha_token};
        let body2 = JSON.stringify({"activity_id":"VMscyjVu-cpUNfirqXGW4wfa00","reward_count":1,"params":{"urck":"99d8a3167df79d0f40fcdc8623ed3266"}});
        let html2 = post1error("https://api-shoulei-ssl.xunlei.com/activity/v1/reward", header2, body2);
        if (!html2 || !html2.error_description) {setItem("xunlei_activity_ts", String(now));return true;}
    } catch (e) {log("迅雷权益刷新失败：" + e.message);}
    return false;
}`;
var newYunbo=`function yunbo(name, url, file_index) {
    function fileIdOf(o) {
        if (!o || typeof o !== "object") return "";
        if (o.file_id) return String(o.file_id);
        if (o.file && o.file.id) return String(o.file.id);
        if (o.reference_resource && o.reference_resource.id) return String(o.reference_resource.id);
        if (o.result && o.result.file_id) return String(o.result.file_id);
        return "";
    }
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
    let id = fileIdOf(html1);
    if (id) return id;
    let taskId = html1.task && html1.task.id ? String(html1.task.id) : "";
    if (!taskId) return "";
    let waits = [0,100,180,300,500];
    for (let i=0;i<waits.length;i++) {
        if (waits[i] > 0) java.lang.Thread.sleep(waits[i]);
        let url2 = 'https://api-pan.xunlei.com/drive/v1/tasks?type=offline&page_token=&filters={"id":{"in":"'+taskId+'"}}&with=reference_resource';
        let t = get1error(url2, "undefined");
        let task = t && t.tasks && t.tasks.length ? t.tasks[0] : null;
        id = fileIdOf(task);
        if (id) return id;
        if (task && task.error_description) break;
    }
    return "";
}`;
var newLazy1=`function lazy1(input) {
    return $("").lazyRule((input) => {
        let id=input[0], mime_type=input[1];
        if (mime_type === "") return $("hiker://empty?page=fypage#"+id+"#noLoading#").rule(() => {let d=[];$.require("hanshu").yunpan1(d);setResult(d);});
        return $.require("hanshu").resolvePlay(id, mime_type, input[2] === "临时");
    }, input.split("#"));
}`;
var newLazy2=`function lazy2(input) {
    return $("").lazyRule((input) => {
        let id=input[0], mime_type=input[1];
        if (mime_type === "") {
            if (MY_URL.includes("xunlei")) putMyVar("ancestor_ids", id);
            return $("hiker://empty?page=fypage#"+id+"#noLoading##noHistory##noRecordHistory#").rule(() => {let d=[];$.require("hanshu").yunpan2(d);setResult(d);});
        }
        let H=$.require("hanshu"), id1=H.zhuancun(id), a=String(id1||"").split("#");
        return H.resolvePlay(a[0], a[1] || mime_type, true);
    }, input.split("#"));
}`;
var newLazy3=`function lazy3(input) {
    return $("").lazyRule((input) => {
        let name=input[0], meta=JSON.parse(input[1]), dir=input[2], file_size=input[3], file_index=input[4];
        if (dir !== "null") return $("hiker://empty?page=fypage#"+MY_URL.split("#")[1]+"#noLoading##noHistory##noRecordHistory#").rule((dir) => {
            let H=$.require("hanshu"), d=[], list1=JSON.parse(dir).resources;
            list1.forEach(item => d.push({title:item.name,desc:H.bytesToSize(item.file_size),img:item.meta.icon,url:H.lazy3(item.name+"#"+JSON.stringify(item.meta)+"#"+JSON.stringify(item.dir)+"#"+item.file_size+"#"+item.file_index),col_type:"avatar",extra:{pageTitle:item.name}}));
            setResult(d);
        }, dir);
        let H=$.require("hanshu"), id=H.yunbo(name, MY_URL.split("#")[1], file_index);
        if (!id) return "toast://迅雷离线任务尚未就绪，请稍后重试";
        return H.resolvePlay(id, meta.mime_type || "video", true);
    }, input.split("#"));
}`;
r=replaceFunc(r,'activity',newActivity);
r=replaceFunc(r,'yunbo',newYunbo);
r=replaceFunc(r,'lazy1',newLazy1);
r=replaceFunc(r,'lazy2',newLazy2);
r=replaceFunc(r,'lazy3',newLazy3);
var helpers=`// Test1 快速磁链播放 helpers
function queueTempFile(id) {
    if (!id) return;
    try {
        let a=JSON.parse(getItem("xunlei_temp_queue","[]")||"[]");
        if (!(a instanceof Array)) a=[];
        for (let i=a.length-1;i>=0;i--) if (String(a[i].id)===String(id)) a.splice(i,1);
        a.push({id:String(id),ts:new Date().getTime()});
        if (a.length>30) a=a.slice(a.length-30);
        setItem("xunlei_temp_queue",JSON.stringify(a));
    } catch(e) {}
}
function cleanupTempFiles() {
    try {
        let now=new Date().getTime(), a=JSON.parse(getItem("xunlei_temp_queue","[]")||"[]");
        if (!(a instanceof Array)||!a.length) return;
        let ids=[],keep=[];
        for (let i=0;i<a.length;i++) {
            if (ids.length<12 && now-Number(a[i].ts||0)>900000) ids.push(String(a[i].id)); else keep.push(a[i]);
        }
        if (ids.length) post1error("https://api-pan.xunlei.com/drive/v1/files:batchDelete","undefined",JSON.stringify({"ids":ids,"space":""}));
        setItem("xunlei_temp_queue",JSON.stringify(keep));
    } catch(e) {log("迅雷临时文件清理失败："+e.message);}
}
function resolvePlay(id,mime_type,isTemp) {
    if (!id) return "hiker://empty";
    let url1="https://api-pan.xunlei.com/drive/v1/files/"+id+"?_magic=2021&usage=PLAY&with=hdr10&with=subtitle_files";
    let waits=[0,120,250,420],html1=null;
    for (let i=0;i<waits.length;i++) {
        if (waits[i]>0) java.lang.Thread.sleep(waits[i]);
        html1=get1error(url1,"undefined");
        if (!html1||html1.error_description) break;
        let linksReady=html1.links && JSON.stringify(html1.links)!=="{}";
        if (linksReady || !String(html1.mime_type||mime_type||"").includes("video")) break;
    }
    if (!html1) return "hiker://empty";
    if (html1.error_description) {toast(html1.error_description);return "hiker://empty";}
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
}
`;
var anchor=r.indexOf('// 网盘容量')>=0?'// 网盘容量':'function rongliang()';
if(r.indexOf(anchor)<0)throw new Error('迅雷源码结构变化：无法插入快速播放 helper');
r=r.replace(anchor,helpers+anchor);
r=r.replace('function yunpan1(d) {\n    try{','function yunpan1(d) {\n    try{\n        cleanupTempFiles();');
r=r.replace('    activity,\n    yunbo,','    activity,\n    yunbo,\n    resolvePlay,\n    cleanupTempFiles,');
pages[hi].rule=r;
}
var dr=String(pages[di].rule||'');
dr=dr.replace('let {\n    rongliang,\n    rule1\n} = $.require("hanshu");','let {\n    rule1\n} = $.require("hanshu");');
dr=dr.replace('    desc: rongliang() || "未登录",','    desc: getItem("authorization", "") ? "已登录 · 快速磁链调用" : "未登录",');
pages[di].rule=dr;
o.version=2;
o.author='zhao · Test1磁链加速';
o.pages=JSON.stringify(pages);
return JSON.stringify(o);
})()