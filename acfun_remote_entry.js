// ACFun REMOTE ENTRY 2026.08.20-v0.2.0
(function(){
var __ver='2026.08.20-v0.2.0';
var __repo='huoguotiankong/asset-core-7f3';
function __fetchFile(path,mark){
    var t=Date.now(),raw='';
    try{raw=fetch('https://raw.githubusercontent.com/'+__repo+'/main/'+path+'?_t='+t,{timeout:6500,headers:{'Cache-Control':'no-cache'}})||'';}catch(e){}
    if(String(raw).indexOf(mark)>=0)return String(raw);
    var api='';
    try{api=fetch('https://api.github.com/repos/'+__repo+'/contents/'+path+'?ref=main&_t='+t,{timeout:6500,headers:{'Accept':'application/vnd.github+json','Cache-Control':'no-cache'}})||'';}catch(e2){}
    if(String(api).trim()){
        try{
            var j=JSON.parse(String(api));
            if(j&&j.content){
                var x=base64Decode(String(j.content).replace(/\s+/g,''));
                if(String(x).indexOf(mark)>=0)return String(x);
            }
        }catch(e3){}
    }
    throw new Error('ACFun远程模块加载失败：'+path);
}
var cache=getItem('acfun_remote_bundle_src','');
if(!cache||String(cache).indexOf("ac.build='"+__ver+"'")<0){
    var core=__fetchFile('acfun_core_v018.js','var ac = {');
    var protocol=__fetchFile('acfun_patch_v019.js','ACFun v0.1.9 protocol patch');
    var diag=__fetchFile('acfun_diag_v019.js','v0.1.9 protocol diagnostics');
    var ui=__fetchFile('acfun_ui_v020.js','ACFun v0.2.0 UI/runtime patch');
    cache=String(core)+'\n'+String(protocol)+'\n'+String(diag)+'\n'+String(ui);
    if(cache.indexOf("ac.build='"+__ver+"'")<0)throw new Error('ACFun远程核心版本校验失败');
    setItem('acfun_remote_bundle_src',cache);
    setItem('acfun_remote_bundle_version',__ver);
    setItem('acfun_remote_bundle_ts',String(Date.now()));
}
// 兼容旧页面/懒加载代码，统一指向同一份远程组合核心。
setItem('acfun_core_src_v018',cache);
setItem('acfun_core_src_v019',cache);
eval(cache);
})();
