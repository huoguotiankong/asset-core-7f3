/* Hanime1 Shell v4 installer bootstrap / advertised Test build 20026 */
var HANIME_BOOT_MANAGER='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=201';
var HANIME_BOOT_CONFIG={id:'hanime1-test',branch:'main',repoRawRoot:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',latestPath:'apps/video/hanime1/test.json',moduleHeaders:{'Cache-Control':'no-cache'},minBuild:20026,defaultRelease:{"schema":1,"id":"hanime1-test","name":"Hanime1","version":"2.0.0-test.26","build":20026,"ref":"main","baseVersion":"2.0.0-test.25","supersedes":"2.0.0-test.25","modules":[{"name":"recovery26","path":"apps/video/hanime1/releases/2.0.0-test.26/recovery_loader.js"}],"verify":{"global":"HanimePages","property":"build","equals":"2.0.0-test.26"},"notes":"Test26 cloud-repository installer baseline. Fresh/re-imported test shell must enter build >= 20026."}};
var HanimeBoot={
manager:function(){require(HANIME_BOOT_MANAGER,{headers:{'Cache-Control':'no-cache'}},201);return HikerCloudRemote;},
loadOnly:function(){var r=this.manager().load(HANIME_BOOT_CONFIG);if(!r||!r.ok||typeof HanimePages!=='object')throw new Error('Hanime1 runtime load failed');return r;},
module:function(){this.loadOnly();return HanimePages;},
info:function(){return this.manager().info(HANIME_BOOT_CONFIG);},
check:function(){return this.manager().check(HANIME_BOOT_CONFIG);},
update:function(){return this.manager().update(HANIME_BOOT_CONFIG);},
rollback:function(){return this.manager().rollback(HANIME_BOOT_CONFIG);},
reinstall:function(){return this.manager().reinstall(HANIME_BOOT_CONFIG);},
reset:function(){return this.manager().resetToDefault(HANIME_BOOT_CONFIG);}
};