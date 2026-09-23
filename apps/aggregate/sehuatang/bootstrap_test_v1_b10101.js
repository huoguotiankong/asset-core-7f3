/* 色花堂 Remote Test Bootstrap 0.1.0-test.1 - immutable direct loader */
var SEHUATANG_BOOT_CONFIG = {
    id: 'sehuatang-test',
    branch: 'main',
    repoRawRoot: 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',
    version: '0.1.0-test.1',
    build: 10101,
    modules: [
        { name: 'runtime', path: 'apps/aggregate/sehuatang/releases/0.1.0-test.1/runtime.js' }
    ]
};
var SeHuaTangBoot = {
    loadOnly: function () {
        var root = SEHUATANG_BOOT_CONFIG.repoRawRoot + SEHUATANG_BOOT_CONFIG.branch + '/', loaded = [], i, m, url;
        for (i = 0; i < SEHUATANG_BOOT_CONFIG.modules.length; i++) {
            m = SEHUATANG_BOOT_CONFIG.modules[i];
            url = root + m.path + '?sehuatang_release=0.1.0-test.1';
            require(url, { headers: { 'Cache-Control': 'no-cache' } }, 10101);
            loaded.push({ name: m.name, url: url });
        }
        if (typeof SeHuaTangRemoteRuntime === 'undefined' || String(SeHuaTangRemoteRuntime.version) !== '0.1.0-test.1') throw new Error('色花堂 Test1 运行时校验失败');
        return { ok: true, release: { id: 'sehuatang-test', version: '0.1.0-test.1', build: 10101 }, loaded: loaded };
    },
    module: function () { this.loadOnly(); return SeHuaTangRemoteRuntime.module(); },
    info: function () { return { managerVersion: 'direct-loader', current: { id: 'sehuatang-test', version: '0.1.0-test.1', build: 10101 } }; },
    check: function () { return { ok: true, current: { id: 'sehuatang-test', version: '0.1.0-test.1', build: 10101 }, hasUpdate: false }; },
    update: function () { return { ok: false, changed: false, error: '测试版采用完整导入口令覆盖更新' }; },
    rollback: function () { return { ok: false, error: '需要时手动覆盖导入上一测试版' }; },
    reinstall: function () { return this.loadOnly(); }
};
