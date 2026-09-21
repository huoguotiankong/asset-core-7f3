js:
var d = [];
addListener("onClose", $.toString(function(){
    clearMyVar("mjre_name");
    clearMyVar("mjre_find");
    clearMyVar("mjre_resolve");
    clearMyVar("mjre_basic");
    clearMyVar("mjre_page");
}));
var idx = Number(getParam("index", "-1"));
if (!isFinite(idx)) idx = -1;
var arr = $.require("configs").getJson();
var obj = idx >= 0 && arr[idx] ? arr[idx] : { type:"script", page:true, name:"", find:"", findAliUrl:"", basicUrl:"" };
if (obj.type === "builtin") {
    d.push({ title:"内置规则不提供脚本编辑，可在规则管理中禁用、删除或排序。", col_type:"text_center_1", url:"hiker://empty", extra:{lineVisible:false} });
    setResult(d);
} else {
    setPageTitle(idx >= 0 ? ("编辑规则：" + obj.name) : "新增搜索规则");
    d.push({
        title:"兼容原版磁力君规则格式",
        desc:"find 内置变量：s 搜索词、page 页码、user 用户信息、basicUrl 基础地址。返回数组，每项至少包含 title 和 url/magnet。单个规则报错只影响自身。",
        col_type:"long_text",
        url:"hiker://empty"
    });
    d.push({ col_type:"input", desc:"名字（必填）", extra:{ defaultValue:obj.name||"", titleVisible:false, onChange:"putMyVar('mjre_name',input)" } });
    d.push({ col_type:"input", desc:"搜索规则 find（必填）", extra:{ type:"textarea", height:6, highlight:true, defaultValue:obj.find||"", titleVisible:false, onChange:"putMyVar('mjre_find',input)" } });
    d.push({ col_type:"input", desc:"URL解析 findAliUrl（选填；当搜索结果不是 magnet 时使用）", extra:{ type:"textarea", height:4, highlight:true, defaultValue:obj.findAliUrl||"", titleVisible:false, onChange:"putMyVar('mjre_resolve',input)" } });
    d.push({ col_type:"input", desc:"基本链接 basicUrl（选填）", extra:{ defaultValue:obj.basicUrl||"", titleVisible:false, onChange:"putMyVar('mjre_basic',input)" } });
    d.push({
        title:"允许翻页：" + (obj.page !== false),
        col_type:"text_1",
        url: $("#noLoading#").lazyRule(function(def){
            var now = getMyVar("mjre_page", def ? "1" : "0") === "1";
            putMyVar("mjre_page", now ? "0" : "1");
            refreshPage(false);
            return "hiker://empty";
        }, obj.page !== false)
    });
    d.push({
        title:"保存",
        col_type:"text_2",
        url: $("#noLoading#").lazyRule(function(idx, oldObj){
            var name = getMyVar("mjre_name", oldObj.name || "").trim();
            var find = getMyVar("mjre_find", oldObj.find || "");
            if (!name) return "toast://名字不能为空";
            if (!find) return "toast://搜索规则不能为空";
            try { new Function("s","page","user","basicUrl",find); }
            catch(e){ return "toast://find 语法错误：" + e.message; }
            var resolve = getMyVar("mjre_resolve", oldObj.findAliUrl || "");
            if (resolve) {
                try { new Function("input","basicUrl",resolve); }
                catch(e2){ return "toast://findAliUrl 语法错误：" + e2.message; }
            }
            var cfg = $.require("configs");
            var rules = cfg.getJson();
            for (var i=0;i<rules.length;i++) {
                if (i !== idx && rules[i].name === name) return "toast://已存在同名规则";
            }
            var pageFlag = getMyVar("mjre_page", oldObj.page !== false ? "1" : "0") === "1";
            var obj = {};
            for (var k in oldObj) obj[k] = oldObj[k];
            obj.type="script"; obj.name=name; obj.find=find; obj.findAliUrl=resolve; obj.basicUrl=getMyVar("mjre_basic", oldObj.basicUrl || ""); obj.page=pageFlag; obj.lastModify=Date.now();
            if (idx >= 0 && rules[idx]) rules[idx]=obj; else rules.unshift(obj);
            cfg.saveJson(rules);
            setItem("mj6_provider","all");
            back(true);
            return "toast://保存成功";
        }, idx, obj)
    });
    if (idx >= 0) {
        d.push({
            title:"删除",
            col_type:"text_2",
            url: $("确定删除【" + obj.name + "】？").confirm(function(idx){
                var cfg=$.require("configs"); var rules=cfg.getJson(); rules.splice(idx,1); cfg.saveJson(rules); setItem("mj6_provider","all"); back(true); return "toast://删除成功";
            }, idx)
        });
    }
    setResult(d);
}