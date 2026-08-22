/* Hanime1 Bootstrap v3 / Test17 incremental */
var HANIME_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HANIME_BOOT_CONFIG={id:'hanime1-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/hanime1/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:20017,defaultRelease:{"schema":1,"id":"hanime1-test","name":"Hanime1","version":"2.0.0-test.17","build":20017,"ref":"main","baseVersion":"2.0.0-test.16","modules":[{"name":"recovery17","path":"apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js"}],"verify":{"global":"HanimePages","property":"build","equals":"2.0.0-test.17"},"notes":"Minimal Test17 increment on verified Test16: author avatar fallback from official artist search and uploader public user video listing."}};
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
