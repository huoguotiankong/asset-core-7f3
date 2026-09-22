(function(){
var src=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@2d271c6975931c9efca3798fa7b5902b7bcc1bae/apps/cloud/pan115/releases/1.2.0-test.8/installer.js");
if(!src||src.indexOf("Test8补丁定位失败")<0) return "toast://Test9读取Test8安装器失败";
var b=String.fromCharCode(92);
// Test8 把需要匹配真实换行的字符串写成了两个反斜杠+n，导致 focus 定位必然失败。
src=src.split(b+b+"nif (focusMode && myPage === 1) {").join(b+"nif (focusMode && myPage === 1) {");
src=src.split(b+b+"n"+b+b+"nif (myPage === 1) {").join(b+"n"+b+"nif (myPage === 1) {");
// 同时修复底部 focusMode setResult 分支的换行匹配，避免动态页生成后又被旧分支覆盖。
var oldTail="if (focusMode) {"+b+b+"n    if (myPage === 1) setResult(d);"+b+b+"n} else {";
var newTail="if (focusMode) {"+b+"n    if (myPage === 1) setResult(d);"+b+"n} else {";
src=src.split(oldTail).join(newTail);
src=src.replace(/Test8补丁/g,"Test9补丁")
       .replace(/1\.2\.0-test\.8/g,"1.2.0-test.9")
       .replace(/2026092209/g,"2026092210")
       .replace(/115_12008_safe_focus\.json/g,"115_12009_safe_focus.json")
       .replace(/安全低频磁链页 1\.2\.0-test\.8/g,"安全低频磁链页 1.2.0-test.9");
try{return eval(src);}catch(e){return "toast://Test9安装器执行失败："+e.message;}
})()
