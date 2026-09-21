(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请先安装/保留115.简 Stable 1.1.0";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115页面失败："+e2.message;}

// 永远从已实机验证的 Stable 1.1.0 磁链模块重建，避免旧 Test 补丁残留/重复声明。
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c473d00a292010a63c9f5364cf45d66dbfc9593d/apps/cloud/pan115/test/test4/";
var offlineRule="",resultRule="";
try{
  offlineRule=fetch(base+"offline_part1.txt")+fetch(base+"offline_part2.txt")+fetch(base+"offline_part3.txt")+fetch(base+"offline_part4.txt");
  resultRule=fetch(base+"result.js");
}catch(e3){return "toast://下载115 Stable模块失败："+e3.message;}
if(!offlineRule||offlineRule.indexOf("115Offline")<0) return "toast://115离线模块下载失败";
if(!resultRule||resultRule.indexOf("115OfflineResult")<0) return "toast://115结果模块下载失败";

offlineRule=offlineRule.replace(/115\.简·测试/g,"115.简").replace(/Test4/g,"Stable1.1.0+FastCloud");
resultRule=resultRule.replace(/115\.简·测试/g,"115.简").replace(/Test4/g,"Stable1.1.0+FastCloud");

var helper=`
/* 1.2.0-test.4 in-place：同名115.简 / 快速进入 / 云下载目录 */
function _115SavedCloudCid(){
    try{
        let x=String(getItem("115CloudDownloadCid","0")||"0");
        return x&&x!=="0"?x:"0";
    }catch(e){return "0";}
}
function _115FastCloudCid(c){
    let cached=_115SavedCloudCid();
    if(cached!=="0") return cached;
    try{
        let r=c.getFiles("0",{offset:0,pageSize:80,order:"file_name",asc:"1",showDir:"1"});
        let a=(r&&r.files)||[];
        for(let i=0;i<a.length;i++){
            let f=a[i]||{};
            if(f.isDirectory&&/^(云下载|离线下载)$/i.test(String(f.name||""))){
                let cid=String(f.fileId||"");
                if(cid){
                    try{setItem("115CloudDownloadCid",cid);setItem("115CloudDownloadCidMode","root-name-fast");}catch(e1){}
                    return cid;
                }
            }
        }
    }catch(e2){}
    try{setItem("115CloudDownloadCidMode","root-fallback");}catch(e3){}
    return "0";
}
function _115TimeoutLike(e){
    return /timed?\\s*out|timeout|sockettimeout/i.test(String((e&&e.message)||e||""));
}
function _115TaskRoot(c,t){
    if(!t) return null;
    if(t.fileId){
        try{let f=c.getFile(String(t.fileId));if(f&&f.fileId)return f;}catch(e){}
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
    if(!t||(!t.fileId&&t.status!==2)) return false;
    let c;
    try{c=api.newClient();}catch(e){return false;}
    let root=_115TaskRoot(c,t);
    if(!root) return false;
    out.push({title:"<b>📂 "+String(root.name||t.name||"离线结果")+"</b>",desc:(t.status===2?"离线完成":"115已返回文件结果")+" · 点视频直接播放",col_type:"rich_text",extra:{textSize:17}});
    let arr=[];
    if(root.isDirectory){
        try{let r=c.getFiles(String(root.fileId),{offset:0,pageSize:100,order:"file_name",asc:"1",showDir:"1"});arr=(r&&r.files)||[];}catch(e2){arr=[];}
    }else arr=[root];
    arr.sort((a,b)=>{if(!!a.isDirectory!==!!b.isDirectory)return a.isDirectory?-1:1;return String(a.name||"").localeCompare(String(b.name||""),"zh-CN",{numeric:true});});
    let shown=0;
    for(let i=0;i<arr.length&&shown<60;i++){
        let f=arr[i]||{},name=String(f.name||"未命名");
        if(f.isDirectory){
            out.push({title:"📁 "+name,desc:"文件夹",col_type:"text_1",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(String(f.fileId||""))+"&cname="+encodeURIComponent(name)});
            shown++;continue;
        }
        let kind="";try{kind=api.tool.fileKind(name);}catch(e3){}
        if(kind==="video"){
            let payload=JSON.stringify({pc:f.pickCode||"",fid:f.fileId||"",name:name,kind:"video"});
            out.push({title:"▶ "+name,desc:api.tool.formatSize(f.size||0)+" · 点击播放",col_type:"text_1",url:$().lazyRule((p)=>{let a=$.require("115Api");return a.player.resolve(p);},payload)});
            shown++;
        }
    }
    if(root.isDirectory) out.push({title:"📂 打开完整文件夹",desc:arr.length>60?("当前快速展示前60项 · 共"+arr.length+"项"):"进入115文件浏览",col_type:"text_2",url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简"))+"&page=fypage&cid="+encodeURIComponent(String(root.fileId||""))+"&cname="+encodeURIComponent(String(root.name||t.name||"离线结果"))});
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
    _115FastCloudCid(client);
}
if (focusMode) {`;
offlineRule=offlineRule.replace(focusMarker,preFocus);

offlineRule=offlineRule.replace(/client\.addOfflineTaskURIs\(\[autoAdd\],\s*["']0["']\)/g,'client.addOfflineTaskURIs([autoAdd], _115SavedCloudCid())');
offlineRule=offlineRule.replace(/c\.addOfflineTaskURIs\(\[link\],\s*["']0["']\)/g,'_115FastCloudCid(c); c.addOfflineTaskURIs([link], _115SavedCloudCid())');
offlineRule=offlineRule.replace(/c\.addOfflineTaskURIs\(add,\s*["']0["']\)/g,'_115FastCloudCid(c); c.addOfflineTaskURIs(add, _115SavedCloudCid())');

var catchMarker='} catch (e) {\n        autoMessage = "处理磁链失败：" + e.message;\n    }\n}';
if(offlineRule.indexOf(catchMarker)<0) return "toast://115磁链补丁定位失败：catch";
offlineRule=offlineRule.replace(catchMarker,`} catch (e) {
        autoMessage = _115TimeoutLike(e) ? "115接口响应超时，任务可能已受理；点刷新即可确认" : ("处理磁链失败：" + e.message);
    }
}`);

var msgMarker='d.push({ title: autoMessage || "正在处理磁链", col_type: "text_center_1", extra: { lineVisible: false } });';
if(offlineRule.indexOf(msgMarker)<0) return "toast://115磁链补丁定位失败：message";
offlineRule=offlineRule.replace(msgMarker,msgMarker+`
        d.push({
            title: _115SavedCloudCid() !== "0" ? "☁ 保存到 115 云下载" : "⚠ 暂未识别云下载目录",
            desc: _115SavedCloudCid() !== "0" ? ("CID: " + _115SavedCloudCid() + " · " + String(getItem("115CloudDownloadCidMode","cache")||"cache")) : "首次会快速扫描根目录；失败时临时回退根目录",
            col_type:"text_center_1",extra:{lineVisible:false}
        });`);
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
rule.author="AI&三鲜汤 · 磁链秒开/云下载优化 1.2.0-test.4";
rule.version=2026092205;
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
var out="hiker://files/cache/115_12004_inplace.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
