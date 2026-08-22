/* Hanime1 Test9 account helpers */
var HanimeAccount9=(function(C,W){
function attr(t,n){return W&&W.attr?W.attr(t,n):((String(t||'').match(new RegExp('\\b'+n+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'))||[])[2]||'');}
function inputVal(h,n){if(W&&W.inputVal)return W.inputVal(h,n);var re=new RegExp('<input\\b[^>]*name\\s*=\\s*(["\\\'])'+n.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+'\\1[^>]*>','i'),m=String(h||'').match(re);return m?attr(m[0],'value'):'';}
function meta(h,n){if(W&&W.meta)return W.meta(h,n);var m=String(h||'').match(new RegExp('<meta\\b[^>]*(?:name|property)\\s*=\\s*(["\\\'])'+n+'\\1[^>]*>','i'));return m?attr(m[0],'content'):'';}
function token(h){return inputVal(h,'_token')||meta(h,'csrf-token')||((String(h||'').match(/name\s*=\s*(["'])_token\1[^>]*value\s*=\s*(["'])([^"']+)\2/i)||[])[3]||'');}
function failed(h){h=String(h||'');return /(?:invalid-feedback|credentials do not match|登入失敗|登录失败|帳號或密碼|账号或密码)/i.test(h)||(/name\s*=\s*(["'])password\1/i.test(h)&&/name\s*=\s*(["'])email\1/i.test(h));}
return {attr:attr,inputVal:inputVal,meta:meta,token:token,failed:failed};
})(HanimeCore,HanimeWeb6);
