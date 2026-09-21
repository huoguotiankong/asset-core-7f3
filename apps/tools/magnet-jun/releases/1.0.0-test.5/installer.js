(function(){
var raw=fetch("hiker://home@磁力君.简");
if(!raw||raw==="null") return "toast://未找到正式版磁力君.简，请先保留原版";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取正式版磁力君.简失败："+e.message;}
var pages;
try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e2){return "toast://解析原版页面失败："+e2.message;}

var baseCore="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@e442dd37c98a01bd06e0e701a39a43cc529ce7f7/apps/tools/magnet-jun/releases/1.0.0-test.5/search_core.js";
var baseSou="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@bf0f0d27d4bf31f8abe93bb58e905a14b5f4b1a2/apps/tools/magnet-jun/releases/1.0.0-test.5/search_page.js";
var baseSel="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@37ec1612df91a84af19238375dd510888a7ccd1e/apps/tools/magnet-jun/releases/1.0.0-test.5/select_torrent.js";
var core="",sou="",sel="";
try{
    core=fetch(baseCore);
    sou=fetch(baseSou);
    sel=fetch(baseSel);
}catch(e3){return "toast://下载 Test5 搜索模块失败："+e3.message;}
if(!core||core.indexOf("mjSearch")<0||core.indexOf("$.exports")<0) return "toast://Test5 搜索核心下载异常";
if(!sou||sou.indexOf("MJSearchCore")<0||sou.indexOf("mj5_provider")<0) return "toast://Test5 搜索页下载异常";
if(!sel||sel.indexOf("MJSearchCore")<0||sel.indexOf("whatslink.info")<0) return "toast://Test5 云数据页下载异常";

function findPage(path){
    for(var i=0;i<pages.length;i++){
        if(pages[i]&&pages[i].path===path) return pages[i];
    }
    return null;
}
var pCore=findPage("MJSearchCore");
if(pCore){
    pCore.name="磁力搜索核心";
    pCore.rule=core;
}else{
    pages.push({col_type:"movie_3",name:"磁力搜索核心",path:"MJSearchCore",rule:core});
}
var pSou=findPage("sou");
if(!pSou) return "toast://原版缺少 sou 页面";
pSou.rule=sou;
var pSel=findPage("SelectTorrent");
if(!pSel) return "toast://原版缺少 SelectTorrent 页面";
pSel.rule=sel;

rule.preRule="";
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"")+" · 全新搜索 Test5";
rule.version=2026092105;
rule.pages=JSON.stringify(pages);

var out="hiker://files/cache/magnetjun_test5_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()