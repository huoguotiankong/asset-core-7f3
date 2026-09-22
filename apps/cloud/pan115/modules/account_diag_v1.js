(function(){
/*__PAN115_ACCOUNT_DIAG_V1__*/
var d=[],api=$.require("115Api"),client=null,auth="未连接";
try{client=api.newClient();auth="已连接";}catch(e){auth="未连接";}
function g(k,v){try{return String(getItem(k,v||"")||v||"");}catch(e){return String(v||"");}}
function countHistory(){try{var a=JSON.parse(g("115TargetHistoryV1","[]"));return a instanceof Array?a.length:0;}catch(e){return 0;}}
function ruleVer(){try{return String((typeof MY_RULE!=="undefined"&&MY_RULE&&MY_RULE.version)||"");}catch(e){return"";}}
var h=g("115HikerVisionCid","0"),c=g("115CloudDownloadCid","0"),mode=g("115OfflineTargetMode","root-fallback"),sort=g("115FMSortV1","0"),filter=g("115FMFilterV1","0"),offFilter=g("115OfflineCenterFilterV1","all"),hist=countHistory(),ver=ruleVer();
d.push({title:"运行状态",desc:"115连接："+auth+(ver?" · 规则版本 "+ver:""),col_type:"text_1",extra:{lineVisible:false}});
d.push({title:"离线目录缓存",desc:"海阔视界 CID："+h+"\n云下载 CID："+c+"\n模式："+mode,col_type:"text_1",extra:{lineVisible:false}});
d.push({title:"界面状态",desc:"文件排序索引："+sort+" · 筛选索引："+filter+"\n离线筛选："+offFilter+" · 最近目标："+hist+" 个",col_type:"text_1",extra:{lineVisible:false}});
d.push({title:"复制诊断摘要",col_type:"text_2",url:$.toString(function(v,a,hc,cc,m,s,f,of,hn){var x="115.简 诊断摘要\n版本："+v+"\n连接："+a+"\n海阔视界CID："+hc+"\n云下载CID："+cc+"\n离线目录模式："+m+"\n文件排序："+s+"\n文件筛选："+f+"\n离线筛选："+of+"\n最近目标目录："+hn;return"copy://"+x;},ver,auth,h,c,mode,sort,filter,offFilter,hist)});
d.push({title:"重置界面状态",desc:"只清排序/筛选/最近目标，不影响登录、文件和离线任务",col_type:"text_2",url:$("确认重置115界面状态？\n不会退出账号，也不会删除网盘文件").confirm(function(){try{clearItem("115FMSortV1");clearItem("115FMFilterV1");clearItem("115OfflineCenterFilterV1");clearItem("115TargetHistoryV1");return"toast://界面状态已重置";}catch(e){return"toast://重置失败："+String(e.message||e);}})});
d.push({title:"重新识别离线保存目录",desc:"清除目录缓存；下次提交离线任务时重新查找“海阔视界/云下载”",col_type:"text_2",url:$("确认清除离线保存目录缓存？\n不会删除任何网盘目录或文件").confirm(function(){try{clearItem("115HikerVisionCid");clearItem("115CloudDownloadCid");clearItem("115OfflineTargetMode");return"toast://目录缓存已清除，下次提交任务时重新识别";}catch(e){return"toast://清理失败："+String(e.message||e);}})});
d.push({title:"安全说明",desc:"诊断页不显示 Cookie、SEID、KID、登录凭证，也不会修改115账号数据。",col_type:"text_center_1"});
setResult(d);
})();
