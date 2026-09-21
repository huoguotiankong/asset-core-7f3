(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到原版115.简，请先保留原版";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取原版115.简失败："+e.message;}
var page=null;
for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path==="115Offline"){page=pages[i];break;}}
if(!page) return "toast://原版115.简缺少115Offline页面";
var code=String(page.rule||"");
var marker='        // 已完成的任务：点击直接跳转到文件保存目录，快速定位文件';
var start=code.indexOf(marker);
var end=start>=0?code.indexOf('        d.push(item);',start):-1;
if(start<0||end<0) return "toast://原版115Offline结构与当前补丁不匹配";
var block=`        // 已完成任务：从 fileId 直接定位本次离线结果，自动播放主视频。
        // dirId 是父目录，只在 fileId 无法定位时才兜底。
        if (t.status === 2) {
            item.url = $().lazyRule((fid, pid, taskName, ruleTitle) => {
                let api2 = $.require("115Api");
                let c = api2.newClient();
                let videos = [];
                let queue = [];
                let seen = {};
                let scanned = 0;

                function addFile(f) {
                    if (!f || f.isDirectory) return;
                    try {
                        if (api2.tool.fileKind(f.name) === "video") videos.push(f);
                    } catch (e) { }
                }

                // fileId 通常就是本次离线生成的目录，也可能直接是文件。
                if (fid) {
                    try {
                        let root = c.getFile(String(fid));
                        if (root && root.fileId) {
                            if (root.isDirectory) queue.push({ id: String(root.fileId), depth: 0 });
                            else addFile(root);
                        } else {
                            queue.push({ id: String(fid), depth: 0 });
                        }
                    } catch (e) {
                        queue.push({ id: String(fid), depth: 0 });
                    }
                }

                // 最多递归4层、扫描500项，避免大型目录拖慢页面。
                while (queue.length && scanned < 500) {
                    let cur = queue.shift();
                    if (!cur || seen[cur.id]) continue;
                    seen[cur.id] = true;
                    let offset = 0;
                    let loops = 0;
                    while (loops < 10 && scanned < 500) {
                        let r;
                        try {
                            r = c.getFiles(String(cur.id), {
                                offset: offset,
                                pageSize: 50,
                                order: "file_size",
                                asc: "0",
                                showDir: "1"
                            });
                        } catch (e) { break; }
                        let arr = (r && r.files) || [];
                        if (!arr.length) break;
                        for (let j = 0; j < arr.length && scanned < 500; j++) {
                            let f = arr[j];
                            scanned++;
                            if (f && f.isDirectory) {
                                if (cur.depth < 3) queue.push({ id: String(f.fileId), depth: cur.depth + 1 });
                            } else {
                                addFile(f);
                            }
                        }
                        offset += 50;
                        loops++;
                        if (r.count !== undefined && offset >= r.count) break;
                    }
                }

                if (videos.length) {
                    // 默认取体积最大的主视频，自动避开常见 sample/预告片。
                    videos.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
                    let f = videos[0];
                    return api2.player.resolve(JSON.stringify({
                        pc: f.pickCode || "",
                        fid: f.fileId || "",
                        name: f.name || taskName || "",
                        kind: "video"
                    }));
                }

                // 未识别到视频才回退到目录浏览，优先 fileId，最后才用父目录 dirId。
                let cid = fid || pid || "0";
                return "hiker://page/115List?rule=" + encodeURIComponent(ruleTitle) +
                    "&page=fypage&cid=" + encodeURIComponent(String(cid)) +
                    "&cname=" + encodeURIComponent("离线 - " + String(taskName || "").slice(0, 18));
            }, String(t.fileId || ""), String(t.dirId || ""), String(t.name || ""), String(MY_RULE.title || "115.简·测试"));
            item.desc = line + " · " + api.tool.formatSize(t.size) + " · 点击直接播放主视频";
        }
`;
page.rule=code.slice(0,start)+block+code.slice(end);
rule.title="115.简·测试";
rule.author="AI&三鲜汤 · 磁链直播放增强 Test2";
rule.version=2026092107;
try{
  rule.find_rule=String(rule.find_rule||"").replace(
    '"hiker://page/115Search?rule=" + rule + "&page=fypage&kw=" + encodeURIComponent(url);',
    '"hiker://page/115Offline?rule=" + rule + "&page=fypage&add=" + encodeURIComponent(url);'
  );
}catch(e2){}
rule.pages=JSON.stringify(pages);
return "海阔视界，首页频道￥home_rule￥"+JSON.stringify(rule);
})()
