/* RC40 cached loader: fixed require cache -> local manager/bootstrap -> Stable 3.5.5 runtime */
(function(){
var R='hiker://files/rules/asset-core-local/rule-repo-test-rc40/startup/';
function put(p,us,m){var es=[];for(var i=0;i<us.length;i++){try{var t=String(fetch(String(us[i]),{timeout:6000,headers:{'Cache-Control':'no-cache'}})||'');if(!t||t.indexOf(m)<0)throw new Error('响应校验失败');writeFile(p,t);if(!fileExist(p))throw new Error('本地文件写入失败');return;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('启动胶囊下载失败：'+es.join(' | '));}
function req(p,us,m){if(!fileExist(p))put(p,us,m);try{require(getPath(p));}catch(e){try{deleteFile(p);}catch(x){}put(p,us,m);require(getPath(p));}}
req(R+'remote_manager_204.js',[
'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@fe26fe9f8f9c40efd60f93753b84b350af6a7612/libs/updater/v2.0.4/remote_manager.js',
'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/fe26fe9f8f9c40efd60f93753b84b350af6a7612/libs/updater/v2.0.4/remote_manager.js',
'https://github.com/huoguotiankong/asset-core-7f3/raw/fe26fe9f8f9c40efd60f93753b84b350af6a7612/libs/updater/v2.0.4/remote_manager.js'
],'Remote Module Manager v2.0.4');
req(R+'startup_bootstrap.js',[
'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@1993d2657f61af17ed8c675fde0bf50c0a853ab7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_bootstrap.js',
'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/1993d2657f61af17ed8c675fde0bf50c0a853ab7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_bootstrap.js',
'https://github.com/huoguotiankong/asset-core-7f3/raw/1993d2657f61af17ed8c675fde0bf50c0a853ab7/apps/tools/rule-repo/releases/test-3.5.6-rc40/startup_bootstrap.js'
],'RULE_REPO_LOCAL_BOOT_VERSION');
})();
