(function(){
var raw=fetch("hiker://home@115.简·测试");
if(!raw||raw==="null") return "toast://未找到115.简·测试，请先导入 Test 1.2.0-test.2";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115测试版失败："+e.message;}
if(Number(rule.version||0)<2026092203) return "toast://当前115测试版过旧，请先更新 Test 1.2.0-test.2";
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析115测试页面失败："+e2.message;}
var idx=-1;
for(var i=0;i<pages.length;i++) if(pages[i]&&pages[i].path==="115Offline"){idx=i;break;}
if(idx<0) return "toast://当前115测试版缺少115Offline页面";
var off=String(pages[idx].rule||"");
if(off.indexOf("_115SavedCloudCid")<0||off.indexOf("_115FastCloudCid")<0) return "toast://当前测试版不是 Test2 基线，停止热修复";

// Test 1.2.0-test.3：彻底移除页面级 _115CloudCid 变量，避免海阔 JS 引擎重复声明。
// 目录 CID 始终通过本地缓存函数读取；需要探测时只调用函数，不再把结果保存在顶层变量。
off=off.replace(/\b(?:let|var)\s+_115CloudCid\s*=\s*[^;]+;\s*/g,"");
off=off.replace(/_115CloudCid\s*=\s*_115FastCloudCid\(client\)\s*;/g,"_115FastCloudCid(client);");
off=off.replace(/client\.addOfflineTaskURIs\(\[autoAdd\],\s*_115CloudCid\s*\|\|\s*["']0["']\)/g,"client.addOfflineTaskURIs([autoAdd], _115SavedCloudCid())");
off=off.replace(/\b_115CloudCid\b/g,"_115SavedCloudCid()");

// 额外保护：若重复导入或局部缓存导致同名声明残留，再清理一次。
off=off.replace(/\b(?:let|var)\s+_115SavedCloudCid\(\)\s*=\s*[^;]+;\s*/g,"");

if(/\b(?:let|var)\s+_115CloudCid\b/.test(off)) return "toast://Test3修复失败：仍检测到_115CloudCid声明";

pages[idx].rule=off;
rule.title="115.简·测试";
rule.author="AI&三鲜汤 · 秒开/云下载 Test 1.2.0-test.3";
rule.version=2026092204;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_test_12003_redeclare_fix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()