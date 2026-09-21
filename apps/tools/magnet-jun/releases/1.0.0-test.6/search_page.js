js:
var d=[];
var core=$.require("hiker://page/MJSearchCore");
var s=getMyVar("mj6_s",getParam("searchTerms",""));
var provider=getItem("mj6_provider","all");
var precise=getItem("mj6_precise","0")==="1";
var openMode=getItem("openMode","海阔视界");
var modes=["海阔视界","查询云数据","复制磁链","115云盘","迅雷云盘","PikPak","光鸭云盘","123云盘"];
if(modes.indexOf(openMode)<0){openMode="海阔视界";setItem("openMode",openMode);}
addListener("onClose",$.toString(function(){clearMyVar("mj6_s");}));

d.push({title:"搜索："+(precise?"精准":"默认"),url:$("#noLoading#").lazyRule(function(){setItem("mj6_precise",getItem("mj6_precise","0")==="1"?"0":"1");refreshPage(false);return "hiker://empty";}),col_type:"icon_2_round",pic_url:"hiker://images/icon_search6"});
d.push({title:"模式："+openMode,url:"select://"+JSON.stringify({title:"磁力君.简设置",options:modes.map(function(v){return "模式："+v;}).concat(["规则管理"]),col:2,js:$.toString(function(){var v=String(input||"");if(v==="规则管理")return "hiker://page/ruleManage#noRecordHistory##noHistory#";v=v.replace("模式：","");setItem("openMode",v);refreshPage(false);return "toast://已切换到 "+v;})}),col_type:"icon_2_round",pic_url:"hiker://images/icon_menu6"});
d.push({title:"🔎",desc:"搜索磁力资源",col_type:"input",url:$.toString(function(){input=String(input||"").trim();if(input.indexOf("magnet:?")===0||input.indexOf("ed2k://")===0)return $.require("hiker://page/MJSearchCore").routeMagnet(input,getItem("openMode","海阔视界"));putMyVar("mj6_s",input);refreshPage(false);return "hiker://empty";}),extra:{id:"mj6_input",onChange:"putMyVar('mj6_s',input)",defaultValue:s,pageTitle:"磁力搜索"}});

var ps=core.providers(),valid=false;
for(var i=0;i<ps.length;i++){if(ps[i].id===provider){valid=true;break;}}
if(!valid){provider="all";setItem("mj6_provider","all");}
for(var j=0;j<ps.length;j++)(function(p){d.push({title:p.id===provider?"““"+p.name+"””":p.name,url:$("#noLoading#").lazyRule(function(id){setItem("mj6_provider",id);refreshPage(false);return "hiker://empty";},p.id),col_type:"scroll_button"});})(ps[j]);
d.push({title:"⚙ 规则",url:"hiker://page/ruleManage#noRecordHistory##noHistory#",col_type:"scroll_button"});

if(!s){d.push({title:"输入关键词开始搜索",desc:"搜索源可在「规则管理」中导入、删除、禁用和自定义排序。",url:"hiker://empty",col_type:"text_center_1",extra:{lineVisible:false}});setResult(d);}else{
    var res;try{res=core.search(s,MY_PAGE,provider,precise);}catch(e){res={items:[],errors:["搜索核心："+e.message]};}
    var items=res.items||[];if(!items.length)d.push({title:"没有搜索到资源",desc:"关键词："+s,url:"hiker://empty",col_type:"text_center_1",extra:{lineVisible:false}});
    for(var k=0;k<items.length;k++)(function(it){var meta=[];if(it.source)meta.push(it.source);if(it.seeders>=0)meta.push("做种 "+it.seeders);if(it.bytes>0)meta.push(core.bytes(it.bytes));if(it.date)meta.push(String(it.date).substring(0,10));if(it.desc)meta.push(it.desc);d.push({title:it.title,desc:meta.join(" · "),url:$("#noLoading#").lazyRule(function(item){return $.require("hiker://page/MJSearchCore").routeItem(item,getItem("openMode","海阔视界"));},it),pic_url:it.pic_url||"",col_type:it.pic_url?"movie_1_vertical_pic":"text_1",extra:{inheritTitle:false,noPic:true}});})(items[k]);
    if(res.errors&&res.errors.length)d.push({title:"搜索源诊断",desc:res.errors.join("\n"),url:"hiker://empty",col_type:"text_1",extra:{lineVisible:false}});
    setResult(d);
}