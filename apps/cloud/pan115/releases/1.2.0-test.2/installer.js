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
/* Test 1.2.0-test.2: 秒开页面 + 本地云下载目录优先 + 非阻塞式状态确认 */
function _115FastCloudCid(c){
    let cached="";
    try{cached=String(getItem("115CloudDownloadCid","")||"");}catch(e0){}
    if(cached&&cached!=="0") return cached;
    try{
        let r=c.getFiles("0",{offset:0,pageSize:120,order:"file_name",asc:"1",showDir:"1"});
        let a=(r&&r.files)||[];
        for(let i=0;i<a.length;i++){
            let f=a[i]||{};
            if(f.isDirectory&&/^(云下载|离线下载)$/i.test(String(f.name||""))){
                let cid=String(f.fileId||"");
                if(cid){
                    try{
                        setItem("115CloudDownloadCid",cid);
                        setItem("115CloudDownloadCidMode","root-name-fast");
                    }catch(e1){}
                    return cid;
                }
            }
        }
    }catch(e2){}
    try{setItem("115CloudDownloadCidMode","root-fallback");}catch(e3){}
    return "0";
}
function _115SavedCloudCid(){
    try{
        let x=String(getItem("115CloudDownloadCid","0")||"0");
        return x&&x!=="0"?x:"0";
    }catch(e){return "0";}
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
            for(let i=0;i<a.length;i++){
                if(String(a[i].name||"")===String(t.name||"")) return a[i];
            }
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
    out.push({
        title:"<b>📂 "+String(root.name||t.name||"离线结果")+"</b>",
        desc:(t.status===2?"离线完成":"115已返回文件结果")+" · 点视频直接播放",
        col_type:"rich_text",
        extra:{textSize:17}
    });
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
    for(let i=0;i<arr.length&&shown<60;i++){
        let f=arr[i]||{};
        let name=String(f.name||"未命名");
        if(f.isDirectory){
            out.push({
                title:"📁 "+name,
                desc:"文件夹",
                col_type:"text_1",
                url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简·测试"))+
                    "&page=fypage&cid="+encodeURIComponent(String(f.fileId||""))+
                    "&cname="+encodeURIComponent(name)
            });
            shown++;
            continue;
        }
        let kind="";
        try{kind=api.tool.fileKind(name);}catch(e3){}
        if(kind==="video"){
            let payload=JSON.stringify({pc:f.pickCode||"",fid:f.fileId||"",name:name,kind:"video"});
            out.push({
                title:"▶ "+name,
                desc:api.tool.formatSize(f.size||0)+" · 点击播放",
                col_type:"text_1",
                url:$().lazyRule((p)=>{
                    let a=$.require("115Api");
                    return a.player.resolve(p);
                },payload)
            });
            shown++;
        }
    }
    if(root.isDirectory){
        out.push({
            title:"📂 打开完整文件夹",
            desc:arr.length>60?("当前快速展示前60项 · 共"+arr.length+"项"):"进入原版115文件浏览",
            col_type:"text_2",
            url:"hiker://page/115List?rule="+encodeURIComponent(String(MY_RULE.title||"115.简·测试"))+
                "&page=fypage&cid="+encodeURIComponent(String(root.fileId||""))+
                "&cname="+encodeURIComponent(String(root.name||t.name||"离线结果"))
        });
    }
    return true;
}
`;

off=off.replace("function statusLine(t) {",helper+"\nfunction statusLine(t) {");

// 外部磁链只查最近 3 页，避免首屏扫描 10 页历史任务。
off=off.replace("let all = listTasks(10);","let all = listTasks(3);");

// 所有新离线任务默认写入已识别的 115 云下载目录。
off=off.replace(/client\.addOfflineTaskURIs\(\[autoAdd\],\s*["']0["']\)/g,'client.addOfflineTaskURIs([autoAdd], _115CloudCid || "0")');
off=off.replace(/c\.addOfflineTaskURIs\(\[link\],\s*["']0["']\)/g,'c.addOfflineTaskURIs([link], _115SavedCloudCid())');
off=off.replace(/c\.addOfflineTaskURIs\(add,\s*["']0["']\)/g,'c.addOfflineTaskURIs(add, _115SavedCloudCid())');

// 首屏先给出可见骨架，再做网络动作；云下载目录只走缓存/根目录快速识别，不再自动访问 get_id。
var stateMarker='let currentTask = null;';
if(off.indexOf(stateMarker)<0) return "toast://Test2补丁定位失败：未找到任务状态";
off=off.replace(stateMarker,'let _115CloudCid = "";\n'+stateMarker);

var focusMarker='// 外部磁链调用模式：先查重；任务记录已清理时允许复用已经识别过的网盘结果。\nif (focusMode) {';
if(off.indexOf(focusMarker)<0) return "toast://Test2补丁定位失败：未找到外部磁链入口";
var preFocus=`// 外部磁链调用模式：先查重；任务记录已清理时允许复用已经识别过的网盘结果。
if (focusMode && myPage === 1) {
    setResult([
        {title:'<b>🎬 115 磁链播放</b>'.fontcolor("#2B6CB0"),col_type:"rich_text",extra:{textSize:19}},
        {title:"正在连接 115…",desc:"页面已打开，正在提交/确认离线任务",col_type:"text_center_1",extra:{id:"115FastStatus",lineVisible:false}},
        {title:"🔄 刷新当前状态",col_type:"text_2",url:$("刷新").lazyRule(()=>{refreshPage();return false;})},
        {title:"📋 全部离线任务",col_type:"text_2",url:"hiker://page/115Offline?rule="+MY_RULE.title+"&page=fypage"}
    ]);
    _115CloudCid=_115FastCloudCid(client);
}
if (focusMode) {`;
off=off.replace(focusMarker,preFocus);

// 提交成功后只查第一页一次，不再在首屏重复扫两页。
off=off.replace("let latest = listTasks(2);","let latest = listTasks(1);");

// 超时并不等价于提交失败：115 端可能已受理，给出可刷新确认的状态。
var catchMarker='} catch (e) {\n        autoMessage = "处理磁链失败：" + e.message;\n    }\n}';
if(off.indexOf(catchMarker)<0) return "toast://Test2补丁定位失败：未找到外部磁链异常处理";
off=off.replace(catchMarker,`} catch (e) {
        if (_115TimeoutLike(e)) {
            autoMessage = "115 接口响应超时，任务可能已受理；点刷新即可快速确认";
        } else {
            autoMessage = "处理磁链失败：" + e.message;
        }
    }
}`);

// 页面明确展示落盘目录；结果一旦有 fileId 就直接展开。
var msgMarker='d.push({ title: autoMessage || "正在处理磁链", col_type: "text_center_1", extra: { lineVisible: false } });';
if(off.indexOf(msgMarker)<0) return "toast://Test2补丁定位失败：未找到磁链状态";
off=off.replace(msgMarker,msgMarker+`
        d.push({
            title: (_115CloudCid && _115CloudCid !== "0") ? "☁ 保存到 115 云下载" : "⚠ 未识别云下载目录，暂退根目录",
            desc: (_115CloudCid && _115CloudCid !== "0")
                ? ("CID: " + _115CloudCid + " · " + String(getItem("115CloudDownloadCidMode","cache")||"cache"))
                : "不再首屏联网探测；如设备已有云下载目录，刷新后会缓存复用",
            col_type: "text_center_1",
            extra: { lineVisible: false }
        });`);

var itemMarker='d.push(makeTaskItem(currentTask, true));';
if(off.indexOf(itemMarker)<0) return "toast://Test2补丁定位失败：未找到当前任务卡";
off=off.replace(itemMarker,itemMarker+`
            if (currentTask.status === 2 || currentTask.fileId) appendFastResultItems(currentTask, d);`);

pages[idx].rule=off;
rule.title="115.简·测试";
rule.author="AI&三鲜汤 · 秒开/云下载 Test 1.2.0-test.2";
rule.version=2026092203;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_test_12002_fast_open.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()