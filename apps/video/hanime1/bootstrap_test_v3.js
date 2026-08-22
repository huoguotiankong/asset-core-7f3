/* Hanime1 Bootstrap v3 / Test16 incremental */
var HANIME_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HANIME_BOOT_CONFIG={id:'hanime1-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/hanime1/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:20016,defaultRelease:{"schema":1,"id":"hanime1-test","name":"Hanime1","version":"2.0.0-test.16","build":20016,"ref":"main","baseVersion":"2.0.0-test.15","modules":[{"name":"recovery16","path":"apps/video/hanime1/releases/2.0.0-test.16/recovery_loader.js"}],"verify":{"global":"HanimePages","property":"build","equals":"2.0.0-test.16"},"notes":"Test16 incremental recovery: keep the device-verified Test15/Test12 runtime and add only creator/uploader separation plus avatar recovery on video detail."}};
var HanimeBoot={
manager:function(){require(HANIME_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);return HikerCloudRemote;},
loadOnly:function(){var r=this.manager().load(HANIME_BOOT_CONFIG);if(!r||!r.ok||typeof HanimePages!=='object')throw new Error('Hanime1 runtime load failed');return r;},
module:function(){this.loadOnly();return HanimePages;},
info:function(){return this.manager().info(HANIME_BOOT_CONFIG);},
check:function(){return this.manager().check(HANIME_BOOT_CONFIG);},
update:function(){return this.manager().update(HANIME_BOOT_CONFIG);},
rollback:function(){return this.manager().rollback(HANIME_BOOT_CONFIG);},
reinstall:function(){return this.manager().reinstall(HANIME_BOOT_CONFIG);}
};
