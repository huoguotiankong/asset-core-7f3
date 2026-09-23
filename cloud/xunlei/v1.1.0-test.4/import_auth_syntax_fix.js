(function(){
function getInstalledRule(name){
    var raw='';
    try{raw=String(request('hiker://home@'+name)||'');}catch(e){raw='';}
    if(!raw||raw==='null')throw new Error('未找到已安装的“'+name+'”规则');
    var p=raw.indexOf('￥home_rule￥');
    if(p>=0)raw=raw.substring(p+'￥home_rule￥'.length);
    else{p=raw.indexOf('{');if(p>0)raw=raw.substring(p);}
    try{return JSON.parse(raw);}catch(e2){throw new Error('读取当前迅雷规则失败：'+String(e2.message||e2));}
}
function findFunctionEnd(code,start){
    var open=code.indexOf('{',start),depth=0,quote='',esc=false,i,c;
    if(open<0)return-1;
    for(i=open;i<code.length;i++){
        c=code.charAt(i);
        if(quote){
            if(esc)esc=false;
            else if(c==='\\')esc=true;
            else if(c===quote)quote='';
        }else{
            if(c==='"'||c==="'"||c==='`')quote=c;
            else if(c==='{')depth++;
            else if(c==='}'){
                depth--;
                if(depth===0)return i+1;
            }
        }
    }
    return-1;
}
function replaceFunc(code,name,newCode){
    var re=new RegExp('function\\s+'+name+'\\s*\\([^)]*\\)\\s*\\{'),m=re.exec(code),end;
    if(!m)throw new Error('迅雷源码中找不到函数：'+name);
    end=findFunctionEnd(code,m.index);
    if(end<0)throw new Error('迅雷函数边界解析失败：'+name);
    return code.substring(0,m.index)+newCode+code.substring(end);
}
var o=getInstalledRule('迅雷');
var pages=[];
try{pages=typeof o.pages==='string'?JSON.parse(o.pages):(o.pages||[]);}catch(e3){throw new Error('迅雷 pages 解析失败');}
var hi=-1,i;
for(i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==='hanshu')hi=i;
if(hi<0)throw new Error('当前迅雷版本缺少 hanshu 页面');
var r=String(pages[hi].rule||'');
if(r.indexOf('function ensureAuth(')<0 || r.indexOf('function signin(')<0){
    throw new Error('当前不是 Test3 登录授权版，请先覆盖导入 Test3 后再使用本修复版');
}
var safeLogin=`function login() {
    monishebei();
    let deviceId = String(getItem("x_device_id", "") || "");
    let deviceSign = "div101." + deviceId + String(getItem("devicesign", "") || "");
    let body1 = JSON.stringify({"protocolVersion":"301","sequenceNo":"1000001","platformVersion":"10","isCompressed":"0","appid":"40","clientVersion":"8.03.0.9067","peerID":"c9b076a446517969dff638cd37fa9ff1","appName":"ANDROID-com.xunlei.downloadprovider","sdkVersion":"231500","devicesign":deviceSign,"netWorkType":"2G","providerName":"NONE","deviceModel":deviceId.substring(0,10),"deviceName":"Xiaomi_"+deviceId.substring(0,10),"OSVersion":"12","creditkey":"","hl":"zh-CN","userName":getItem("mobile"),"passWord":getMyVar("passWord", getItem("passWord", "")),"verifyKey":"","verifyCode":"","isMd5Pwd":"0"});
    let html1 = post1error("https://xluser-ssl.xunlei.com/xluser.core.login/v3/login", {}, body1);
    if (html1 && String(html1.errorCode) === "0") {
        setItem("sessionID", String(html1.sessionID || ""));
        if (html1.userID) setItem("user_id", String(html1.userID));
        clearItem("authorization");
        clearItem("refresh_token");
        clearItem("xunlei_activity_ts");
        clearItem("xunlei_temp_queue");
        clearMyVar("captcha_token");
        let err = signin();
        if (err === "") {
            clearItem("passWord");
            clearMyVar("passWord");
            toast("登录成功，云盘授权已同步");
            return "";
        }
        toast("基础登录成功，但云盘授权同步失败：" + err);
        return err;
    }
    let msg = String((html1 && (html1.errorDesc || html1.error_description || html1.error || html1.message)) || "登录失败");
    toast(msg + "；请尝试手机号验证码登录");
    return msg;
}`;
r=replaceFunc(r,'login',safeLogin);
var lf=String.fromCharCode(10),cr=String.fromCharCode(13);
r=r.split('toast(msg + "'+lf+'请尝试手机号验证码登录");').join('toast(msg + "；请尝试手机号验证码登录");');
r=r.split('toast(msg + "'+cr+lf+'请尝试手机号验证码登录");').join('toast(msg + "；请尝试手机号验证码登录");');
pages[hi].rule=r;
o.version=5;
o.author='zhao · Test4登录语法兼容修复';
o.pages=JSON.stringify(pages);
return JSON.stringify(o);
})()