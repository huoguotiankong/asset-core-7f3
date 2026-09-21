(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请先安装/保留当前115.简";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115页面失败："+e2.message;}

var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c473d00a292010a63c9f5364cf45d66dbfc9593d/apps/cloud/pan115/test/test4/";
var offlineRule="",resultRule="";
try{
  offlineRule=fetch(base+"offline_part1.txt")+fetch(base+"offline_part2.txt")+fetch(base+"offline_part3.txt")+fetch(base+"offline_part4.txt");
  resultRule=fetch(base+"result.js");
}catch(e3){return "toast://下载115 Stable模块失败："+e3.message;}
if(!offlineRule||offlineRule.indexOf("115Offline")<0) return "toast://115离线模块下载失败";
if(!resultRule||resultRule.indexOf("115OfflineResult")<0) return "toast://115结果模块下载失败";

offlineRule=offlineRule.replace(/115\.简·测试/g,"115.简").replace(/Test4/g,"Stable1.1.0+HikerFolder");
resultRule=resultRule.replace(/115\.简·测试/g,"115.简").replace(/Test4/g,"Stable1.1.0+HikerFolder");

var helper=`
/* 1.2.0-test.6：海阔视界目录优先；云下载兜底；同名覆盖 */
function _115SavedCloudCid(){
    try{let x=String(getItem("115CloudDownloadCid","0")||"0");return x&&x!=="0"?x:"0";}catch(e){return "0";}
}
function _115SavedHikerCid(){
    try{let x=String(getItem("115HikerVisionCid","0")||"0");return x&&x!=="0"?x:"0";}catch(e){return "0";}
}
function _115TargetMode(){
    try{return String(getItem("115OfflineTargetMode","root-fallback")||"root-fallback");}catch(e){return "root-fallback";}
}
function _115ResolveTargetCid(c){
    let h=_115SavedHikerCid();
    if(h!=="0"){
        try{setItem("115OfflineTargetMode","hiker-cache");}catch(e0){}
        return h;
    }
    let cloudFound="";
    try{
        let r=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"});
        let a=(r&&r.files)||[];
        for(let i=0;i<a.length;i++){
            let f=a[i]||{};
            if(!f.isDirectory) continue;
            let n=String(f.name||"").trim(),cid=String(f.fileId||"");
            if(!cid) continue;
            if(n==="海阔视界"){
                try{setItem("115HikerVisionCid",cid);setItem("115OfflineTargetMode","hiker-root");}catch(e1){}
                return cid;
            }
            if(!cloudFound&&/^(云下载|离线下载)$/i.test(n)) cloudFound=cid;
        }
    }catch(e2){}
    if(cloudFound){
        try{setItem("115CloudDownloadCid",cloudFound);setItem("115OfflineTargetMode","cloud-root-fallback");}catch(e3){}
        return cloudFound;
    }
    let cachedCloud=_115SavedCloudCid();
    if(cachedCloud!=="0"){
        try{setItem("115OfflineTargetMode","cloud-cache-fallback");}catch(e4){}
        return cachedCloud;
    }
    try{setItem("115OfflineTargetMode","root-fallback");}catch(e5){}
    return "0";
}
function _115SavedTargetCid(){
    let h=_115SavedHikerCid();
    if(h!=="0") return h;
    let c=_115SavedCloudCid();
    return c!=="0"?c:"0";
}
function _115TimeoutLike(e){return /timed?\\s*out|timeout|sockettimeout/i.test(String((e&&e.message)||e||""));}
function _115TaskRoot(c,t){
    if(!t) return null;
    if(t.fileId){try{let f=c.getFile(String(t.fileId));if(f&&f.fileId)return f;}catch(e){}}
    if(t.dirId){
        try{let r=c.getFiles(String(t.dirId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"});let a=(r&&r.files)||[];for(let i=0;i<a.length;i++)if(String(a[i].name||"")===String(t.name||""))return a[i];}catch(e2){}
    }
    return null;
}
function appendFastResultItems(t,out){
    if(!t||(!t.fileId&&t.status!==2)) return false;
    let c;try{c=api.newClient();}catch(e){return false;}
    let root=_115TaskRoot(c,t);if(!root)return false;
    out.push({title:"<b>📂 "+String(root.name||t.name||"离线结果")+"</b>",desc:(t.status===2?"离线完成":"115已返回文件结果")+" · 点视频直接播放",col_type:"rich_text",extra:{textSize:17}});
    let arr=[];
    if(root.isDirectory){try{let r=c.getFiles(String(root.fileId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"});arr=(r&&r.files)||[];}catch(e2){arr=[];}}else arr=[root];
    arr.sort((a,b)=>{if(!!a.isDirectory!==!!b.isDirectory)return a.isDirectory?-1:1;return String(a.name||"").localeCompare(String(b.name||""),"zh-CN",{numeric:true});});
    let shown=0;
    for(let i=0;i<arr.length&&shown<60;i++){
        let f=arr[i]||{},name=String(f.name||"未命名");
        if(f.isDirectory){out.push({title:"📁 "+name,desc:"文件夹",col_type:"text_1",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(String(f.fileId||""))+"&cname="+encodeURIComponent(name)});shown++;continue;}
        let kind="";try{kind=api.tool.fileKind(name);}catch(e3){}
        if(kind==="video"){
            let payload=JSON.stringify({pc:f.pickCode||"",fid:f.fileId||"",name:name,kind:"video"});
            out.push({title:"▶ "+name,desc:api.tool.formatSize(f.size||0)+" · 点击播放",col_type:"text_1",url:$().lazyRule((p)=>{let a=$.require("115Api");return a.player.resolve(p);},payload)});shown++;
        }
    }
    if(root.isDirectory)out.push({title:"📂 打开完整文件夹",desc:arr.length>60?("当前快速展示前60项 · 共"+arr.length+"项"):"进入115文件浏览",col_type:"text_2",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(String(root.fileId||""))+"&cname="+encodeURIComponent(String(root.name||t.name||"离线结果"))});
    return true;
}
`;
offlineRule=offlineRule.replace("function statusLine(t) {",helper+"\nfunction statusLine(t) {");
offlineRule=offlineRule.replace("let all = listTasks(10);","let all = listTasks(2);");
offlineRule=offlineRule.replace("let latest = listTasks(2);","let latest = listTasks(1);");

var focusMarker='// 外部磁链调用模式：先查重；任务记录已清理时允许复用已经识别过的网盘结果。\nif (focusMode) {';
if(offlineRule.indexOf(focusMarker)<0) return "toast://115磁链补丁定位失败：focus";
var preFocus=`// 外部磁链调用模式：先给出页面，再处理任务。
if (focusMode && myPage === 1) {
    setResult([
        {title:'<b>🎬 115 磁链播放</b>'.fontcolor("#2B6CB0"),col_type:"rich_text",extra:{textSize:19}},
        {title:"正在连接 115…",desc:"页面已打开，正在提交/确认离线任务",col_type:"text_center_1",extra:{id:"115FastStatus",lineVisible:false}},
        {title:"🔄 刷新当前状态",col_type:"text_2",url:$("刷新").lazyRule(()=>{refreshPage();return false;})},
        {title:"📋 全部离线任务",col_type:"text_2",url:"hiker://page/115Offline?rule="+MY_RULE.title+"&page=fypage"}
    ]);
    _115ResolveTargetCid(client);
}
if (focusMode) {`;
offlineRule=offlineRule.replace(focusMarker,preFocus);

offlineRule=offlineRule.replace(/client\.addOfflineTaskURIs\(\[autoAdd\],\s*["']0["']\)/g,'client.addOfflineTaskURIs([autoAdd], _115SavedTargetCid())');

var lazyResolve=`let _dest="0",_cloud="";
try{
    let _h=String(getItem("115HikerVisionCid","0")||"0");
    if(_h&&_h!=="0"){
        _dest=_h;setItem("115OfflineTargetMode","hiker-cache");
    }else{
        let _r=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"});
        let _a=(_r&&_r.files)||[];
        for(let _i=0;_i<_a.length;_i++){
            let _f=_a[_i]||{};
            if(!_f.isDirectory)continue;
            let _n=String(_f.name||"").trim(),_cid=String(_f.fileId||"");
            if(!_cid)continue;
            if(_n==="海阔视界"){
                _dest=_cid;setItem("115HikerVisionCid",_cid);setItem("115OfflineTargetMode","hiker-root");break;
            }
            if(!_cloud&&/^(云下载|离线下载)$/i.test(_n))_cloud=_cid;
        }
        if(_dest==="0"&&_cloud){_dest=_cloud;setItem("115CloudDownloadCid",_cloud);setItem("115OfflineTargetMode","cloud-root-fallback");}
        if(_dest==="0"){
            let _cc=String(getItem("115CloudDownloadCid","0")||"0");
            if(_cc&&_cc!=="0"){_dest=_cc;setItem("115OfflineTargetMode","cloud-cache-fallback");}
        }
    }
}catch(_e){
    try{let _cc=String(getItem("115CloudDownloadCid","0")||"0");if(_cc&&_cc!=="0"){_dest=_cc;setItem("115OfflineTargetMode","cloud-cache-fallback");}}catch(_e2){}
}
if(_dest==="0")try{setItem("115OfflineTargetMode","root-fallback");}catch(_e3){}
`;

offlineRule=offlineRule.replace(/c\.addOfflineTaskURIs\(\[link\],\s*["']0["']\)/g,lazyResolve+'c.addOfflineTaskURIs([link], _dest)');
offlineRule=offlineRule.replace(/c\.addOfflineTaskURIs\(add,\s*["']0["']\)/g,lazyResolve+'c.addOfflineTaskURIs(add, _dest)');

var catchMarker='} catch (e) {\n        autoMessage = "处理磁链失败：" + e.message;\n    }\n}';
if(offlineRule.indexOf(catchMarker)<0) return "toast://115磁链补丁定位失败：catch";
offlineRule=offlineRule.replace(catchMarker,`} catch (e) {
        autoMessage = _115TimeoutLike(e) ? "115接口响应超时，任务可能已受理；点刷新即可确认" : ("处理磁链失败：" + e.message);
    }
}`);

var msgMarker='d.push({ title: autoMessage || "正在处理磁链", col_type: "text_center_1", extra: { lineVisible: false } });';
if(offlineRule.indexOf(msgMarker)<0) return "toast://115磁链补丁定位失败：message";
offlineRule=offlineRule.replace(msgMarker,msgMarker+`
        let _targetMode=_115TargetMode();
        let _targetCid=_115SavedTargetCid();
        let _targetTitle=_targetMode.indexOf("hiker")===0?"📁 保存到 115 / 海阔视界":(_targetMode.indexOf("cloud")===0?"☁ 海阔视界未找到，保存到 115 / 云下载":"⚠ 未识别目标目录，暂退根目录");
        let _targetDesc=_targetCid!=="0"?("CID: "+_targetCid+" · "+_targetMode):"根目录中未识别到 海阔视界 / 云下载";
        d.push({title:_targetTitle,desc:_targetDesc,col_type:"text_center_1",extra:{lineVisible:false}});`);
var itemMarker='d.push(makeTaskItem(currentTask, true));';
if(offlineRule.indexOf(itemMarker)<0) return "toast://115磁链补丁定位失败：task";
offlineRule=offlineRule.replace(itemMarker,itemMarker+`\n            if (currentTask.status === 2 || currentTask.fileId) appendFastResultItems(currentTask, d);`);

var foundOffline=false,foundResult=false;
for(var i=0;i<pages.length;i++){
  if(pages[i]&&pages[i].path==="115Offline"){pages[i].rule=offlineRule;foundOffline=true;}
  if(pages[i]&&pages[i].path==="115OfflineResult"){pages[i].rule=resultRule;pages[i].name="115离线结果";foundResult=true;}
}
if(!foundOffline) return "toast://115.简缺少115Offline页面";
if(!foundResult) pages.push({col_type:"movie_3",name:"115离线结果",path:"115OfflineResult",rule:resultRule});

rule.title="115.简";
rule.author="AI&三鲜汤 · 海阔视界目录优先 1.2.0-test.6";
rule.version=2026092207;
try{
  var fr=String(rule.find_rule||"");
  fr=fr.replace("输入文件名关键词搜索；粘贴 115 分享链接可直接打开；粘贴 magnet / ed2k / HTTP 链接则离线下载","文件名 / 115分享 / 磁链");
  fr=fr.replace('title: "复制调用"','title: "复制磁链调用"');
  var oldCopy='return "copy://"+"\\"hiker://page/115Search?rule=" + rule + "&page=fypage&kw=\\" + encodeURIComponent(url);"';
  var newCopy='return "copy://"+"\\"hiker://page/115Offline?rule=" + rule + "&page=fypage&add=\\" + encodeURIComponent(url);"';
  fr=fr.replace(oldCopy,newCopy);
  rule.find_rule=fr;
}catch(e4){}
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_12006_hiker_folder.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
