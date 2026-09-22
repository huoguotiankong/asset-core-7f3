(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请保留当前已登录的115.简";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092212&&ver!==2026092213) return "toast://当前115版本不是Test11/Test12基线，停止覆盖";
var fr=String(rule.find_rule||"");
if(!fr) return "toast://当前115首页规则为空，停止覆盖";
fr=fr.split("encodeURIComponent(ruleTitle)").join("ruleTitle");
fr=fr.split("encodeURIComponent(r)").join("r");
fr=fr.split('title:"搜索文件 / 粘贴115分享 / 磁链",desc:"自动识别后进入对应功能",col_type:"input"').join('title:"",desc:"搜索 / 粘贴链接",col_type:"input"');
fr=fr.split('extra:{titleVisible:true,lineVisible:false}').join('extra:{titleVisible:false,lineVisible:false}');
fr=fr.split('title:"快捷访问",desc:"常用功能"').join('title:"快捷访问",desc:""');
fr=fr.split('title:"我的内容",desc:"账号与文件管理"').join('title:"我的内容",desc:""');
fr=fr.split('title:"磁链与工具",desc:"给其它海阔小程序调用"').join('title:"磁链与工具",desc:""');
var simpleDescs=['desc:"全部文件",','desc:hcid?"默认离线目录":"等待首次识别",','desc:"磁链 / ed2k / HTTP",','desc:"115分享资源",','desc:"收藏内容",','desc:"最近访问",','desc:"已删除文件",','desc:connected?"账号已连接":"需要登录",','desc:"离线后定位视频并播放",','desc:"查看下载状态",','desc:"JavDB / 磁力君可直接调用",'];
for(var i=0;i<simpleDescs.length;i++) fr=fr.split(simpleDescs[i]).join('desc:"",');
fr=fr.split('desc:connected?"已连接 · 文件、分享、离线与播放统一入口":"未登录 · 点击进入账号登录"').join('desc:connected?"已连接":"未登录"');
var lines=fr.split("\n"),keep=[];
for(var j=0;j<lines.length;j++){
 var line=lines[j];
 if(line.indexOf('d.push({title:"当前状态"')>=0) continue;
 if(line.indexOf('d.push({title:"115.简 · APP化首页 Phase 1')>=0) continue;
 keep.push(line);
}
fr=keep.join("\n");
rule.find_rule=fr;
rule.title="115.简";
rule.author="AI&三鲜汤 · APP化首页 Phase1 Test13 精简UI";
rule.version=2026092214;
var out="hiker://files/cache/115_12013_app_home_clean.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
