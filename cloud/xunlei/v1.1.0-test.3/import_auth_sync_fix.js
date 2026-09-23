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
var hi=-1,di=-1,li=-1,i;
for(i=0;i<pages.length;i++){
    if(pages[i]&&pages[i].path==='hanshu')hi=i;
    if(pages[i]&&pages[i].path==='diaoyong')di=i;
    if(pages[i]&&pages[i].path==='denglu')li=i;
}
if(hi<0)throw new Error('当前迅雷版本缺少 hanshu 页面');
var r=String(pages[hi].rule||'');

var newSignin=`function signin() {
    let sessionID = String(getItem("sessionID", "") || "");
    if (!sessionID || sessionID === "undefined" || sessionID === "null") return "NO_SESSION";
    let deviceId = String(getItem("x_device_id", "") || "");
    let h = {"User-Agent":"Android","x-device-id":deviceId};
    let body1 = JSON.stringify({"client_id":"Xp6vsxz_7IYVw2BB","client_secret":"Xp6vsy4tN9toTVdMSpomVdXpRmES","provider":"access_end_point_token","signin_token":sessionID});
    try {
        let html1 = post1("https://xluser-ssl.xunlei.com/v1/auth/signin/token?client_id=Xp6vsxz_7IYVw2BB", h, body1);
        if (html1 && !html1.error && html1.access_token) {
            let tokenType = String(html1.token_type || "Bearer");
            setItem("authorization", tokenType + " " + html1.access_token);
            if (html1.refresh_token) setItem("refresh_token", String(html1.refresh_token));
            if (html1.user_id) setItem("user_id", String(html1.user_id));
            clearMyVar("captcha_token");
            return "";
        }
        return String((html1 && (html1.error_description || html1.error || html1.errorDesc || html1.message)) || "AUTH_SIGNIN_FAILED");
    } catch (e) {
        return "AUTH_SIGNIN_ERROR:" + String(e.message || e);
    }
}`;

var newAccessToken=`function access_token() {
    let refreshToken = String(getItem("refresh_token", "") || "");
    if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") return "NO_REFRESH_TOKEN";
    let deviceId = String(getItem("x_device_id", "") || "");
    let h = {"User-Agent":"Android","x-device-id":deviceId};
    let body1 = JSON.stringify({"client_id":"Xp6vsxz_7IYVw2BB","client_secret":"Xp6vsy4tN9toTVdMSpomVdXpRmES","grant_type":"refresh_token","refresh_token":refreshToken});
    try {
        let html1 = post1("https://xluser-ssl.xunlei.com/v1/auth/token?client_id=Xp6vsxz_7IYVw2BB", h, body1);
        if (html1 && !html1.error && html1.access_token) {
            let tokenType = String(html1.token_type || "Bearer");
            setItem("authorization", tokenType + " " + html1.access_token);
            if (html1.refresh_token) setItem("refresh_token", String(html1.refresh_token));
            if (html1.user_id) setItem("user_id", String(html1.user_id));
            clearMyVar("captcha_token");
            return "";
        }
        return String((html1 && (html1.error_description || html1.error || html1.errorDesc || html1.message)) || "AUTH_REFRESH_FAILED");
    } catch (e) {
        return "AUTH_REFRESH_ERROR:" + String(e.message || e);
    }
}`;

var newGet1Error=`function isAuthValue(v) {
    v = String(v == null ? "" : v);
    return !!v && v !== "undefined" && v !== "null";
}
function isAuthError(html1) {
    if (!html1 || typeof html1 !== "object") return false;
    let text = String(html1.error_description || html1.error || html1.errorDesc || html1.message || "");
    let code = String(html1.error_code == null ? (html1.code == null ? "" : html1.code) : html1.error_code);
    return /帐号认证失败|账号认证失败|重新登录|未登录|unauthenticated|invalid.?token|token.*expired/i.test(text) || code === "16" || code === "2" || code === "401";
}
function ensureAuth(forceRefresh) {
    let authorization = getItem("authorization", "");
    if (!forceRefresh && isAuthValue(authorization)) return true;
    if (forceRefresh) clearItem("authorization");
    let refreshToken = getItem("refresh_token", "");
    if (isAuthValue(refreshToken) && access_token() === "" && isAuthValue(getItem("authorization", ""))) return true;
    let sessionID = getItem("sessionID", "");
    if (isAuthValue(sessionID) && signin() === "" && isAuthValue(getItem("authorization", ""))) return true;
    clearItem("authorization");
    return false;
}
function get1error(url1, header1) {
    let protectedRequest = header1 === "undefined";
    if (protectedRequest && !ensureAuth(false)) return {error_description:"未登录，请先登录"};
    let html1 = get1(url1, header1);
    if (protectedRequest && isAuthError(html1)) {
        if (ensureAuth(true)) html1 = get1(url1, header1);
    }
    if (html1 && html1.error_description === "验证码无效") {
        captcha();
        html1 = get1(url1, header1);
    }
    return html1;
}`;

var newPost1Error=`function post1error(url1, header1, body1) {
    let protectedRequest = header1 === "undefined";
    if (protectedRequest && !ensureAuth(false)) return {error_description:"未登录，请先登录",error:"unauthenticated"};
    let html1 = post1(url1, header1, body1);
    if (protectedRequest && isAuthError(html1)) {
        if (ensureAuth(true)) html1 = post1(url1, header1, body1);
    }
    if (html1 && html1.error === "captcha_invalid") {
        captcha();
        html1 = post1(url1, header1, body1);
    }
    return html1;
}`;

var newSmsLogin=`function smslogin() {
    let deviceId = String(getItem("x_device_id", "") || "");
    let body1 = JSON.stringify({"protocolVersion":"301","sequenceNo":"1000002","platformVersion":"10","isCompressed":"0","appid":"40","clientVersion":"8.03.0.9067","peerID":"c9b076a446517969dff638cd37fa9ff1","appName":"ANDROID-com.xunlei.downloadprovider","sdkVersion":"231500","devicesign":getMyVar("deviceid"),"netWorkType":"2G","providerName":"NONE","deviceModel":deviceId.substring(0,10),"deviceName":"Xiaomi_"+deviceId.substring(0,10),"OSVersion":"12","creditkey":getMyVar("creditkey"),"hl":"zh-CN","mobile":getItem("mobile"),"smsCode":getMyVar("smsCode"),"token":getMyVar("token"),"register":"0"});
    let html1 = post1error("https://xluser-ssl.xunlei.com/xluser.core.login/v3/smslogin", {}, body1);
    if (html1 && String(html1.errorCode) === "0") {
        setItem("sessionID", String(html1.sessionID || ""));
        if (html1.userID) setItem("user_id", String(html1.userID));
        clearItem("authorization");
        clearItem("refresh_token");
        clearItem("xunlei_activity_ts");
        clearItem("xunlei_temp_queue");
        clearMyVar("captcha_token");
        let err = signin();
        if (err === "") {clearItem("passWord");clearMyVar("passWord");toast("登录成功，云盘授权已同步");return "";}
        toast("基础登录成功，但云盘授权同步失败：" + err);
        return err;
    }
    let msg = String((html1 && (html1.errorDesc || html1.error_description || html1.error || html1.message)) || "登录失败");
    toast(msg);
    return msg;
}`;

var newLogin=`function login() {
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
        if (err === "") {clearItem("passWord");clearMyVar("passWord");toast("登录成功，云盘授权已同步");return "";}
        toast("基础登录成功，但云盘授权同步失败：" + err);
        return err;
    }
    let msg = String((html1 && (html1.errorDesc || html1.error_description || html1.error || html1.message)) || "登录失败");
    toast(msg + "\n请尝试手机号验证码登录");
    return msg;
}`;

var newRongliang=`function rongliang() {
    let authorization = String(getItem("authorization", "") || "");
    let refreshToken = String(getItem("refresh_token", "") || "");
    if ((authorization && authorization !== "undefined" && authorization !== "null") || (refreshToken && refreshToken !== "undefined" && refreshToken !== "null")) return "已登录 · 授权已同步";
    return "未登录";
}`;

r=replaceFunc(r,'signin',newSignin);
r=replaceFunc(r,'access_token',newAccessToken);
r=replaceFunc(r,'get1error',newGet1Error);
r=replaceFunc(r,'post1error',newPost1Error);
r=replaceFunc(r,'smslogin',newSmsLogin);
r=replaceFunc(r,'login',newLogin);
r=replaceFunc(r,'rongliang',newRongliang);
pages[hi].rule=r;

if(li>=0){
    var lr=String(pages[li].rule||'');
    lr=lr.replace('onChange: "setItem(\'passWord\',input)"','onChange: "putMyVar(\'passWord\',input)"');
    lr=lr.replace('        setItem("passWord", getItem(\'passWord\'))\n        $.require("hanshu").login()','        $.require("hanshu").login()');
    pages[li].rule=lr;
}

if(di>=0){
    var dr=String(pages[di].rule||'');
    dr=dr.replace('desc: getItem("authorization", "") ? "已登录 · 快速磁链调用" : "未登录",','desc: (getItem("authorization", "") || getItem("refresh_token", "")) ? "已登录 · 授权已同步" : "未登录",');
    dr=dr.replace('["mobile", "passWord", "sessionID", "user_id", "authorization", "refresh_token"]','["mobile", "passWord", "sessionID", "user_id", "authorization", "refresh_token", "xunlei_activity_ts", "xunlei_temp_queue"]');
    pages[di].rule=dr;
}

var fr=String(o.find_rule||'');
fr=fr.replace(/if\s*\(getItem\("mobile"\)\s*!={1,2}\s*"undefined"\)\s*\{/,
    'if ((getItem("authorization", "") && getItem("authorization", "") !== "undefined") || (getItem("refresh_token", "") && getItem("refresh_token", "") !== "undefined")) {');
fr=fr.replace('["mobile", "passWord", "sessionID", "user_id", "authorization", "refresh_token"]','["mobile", "passWord", "sessionID", "user_id", "authorization", "refresh_token", "xunlei_activity_ts", "xunlei_temp_queue"]');
o.find_rule=fr;
try{clearItem("passWord");}catch(e4){}
o.version=4;
o.author='zhao · Test3登录授权修复';
o.pages=JSON.stringify(pages);
return JSON.stringify(o);
})()
