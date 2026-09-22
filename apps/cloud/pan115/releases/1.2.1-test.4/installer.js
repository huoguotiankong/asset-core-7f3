(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092224)return "toast://当前已是115 Test 1.2.1-test.4";
if(ver!==2026092220&&ver!==2026092221&&ver!==2026092222&&ver!==2026092223)return "toast://请先覆盖到115 Stable 1.2.0或1.2.1 Test1-Test3再导入本版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@9529ab752c3937bf3ee8f9bde16afc32705d59c7/apps/cloud/pan115/modules/";
var fm="",fi="",fo="",rb="",ops="",batch="",picker="";
try{
 fm=fetch(base+"file_manage_v8.js");
 fi=fetch(base+"file_info_v1.js");
 fo=fetch(base+"file_ops_v1.js");
 rb=fetch(base+"recycle_v5.js");
 ops=fetch(base+"batch_ops_v1.js");
 batch=fetch(base+"file_batch_v2.js");
 picker=fetch(base+"folder_picker_v2.js");
}catch(e2){return "toast://下载115文件管理Test4模块失败："+e2.message;}
if(!fm||fm.indexOf("115FileInfo")<0||fm.indexOf("115FMSortV1")<0||fm.indexOf("115FMFilterV1")<0)return "toast://文件管理V8模块校验失败";
if(!fi||fi.indexOf("PickCode")<0||fi.indexOf("文件ID")<0)return "toast://文件信息模块校验失败";
if(!fo||fo.indexOf("/open/folder/add")<0||fo.indexOf("/files/edit")<0)return "toast://文件操作模块校验失败";
if(!rb||rb.indexOf("清空回收站")<0||rb.indexOf("cleanRecycleBin")<0)return "toast://回收站模块校验失败";
if(!ops||ops.indexOf("/files/copy")<0||ops.indexOf("/open/ufile/move")<0)return "toast://批量操作模块校验失败";
if(!batch||batch.indexOf("sourceTrail")<0||batch.indexOf("↩ 浏览")<0)return "toast://批量管理V2模块校验失败";
if(!picker||picker.indexOf("115TargetHistoryV1")<0||picker.indexOf("最近使用的目标目录")<0)return "toast://目标文件夹V2模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115FileInfo","文件信息",fi);
replacePage("115FileOps","文件操作核心",fo);
replacePage("115Recycle","回收站",rb);
replacePage("115BatchOps","批量操作核心",ops);
replacePage("115FileBatch","批量管理",batch);
replacePage("115FolderPicker","选择目标文件夹",picker);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 文件管理UX增强";
rule.version=2026092224;
var out="hiker://files/cache/115_12104_file_manage_ux_test.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
