/* ACFun Remote Shell Bootstrap v1.0.0
 * 云仓库只需安装轻量规则壳；业务代码由 HikerCloudRemote 通过 require 版本缓存加载。
 */
var ACFUN_BOOTSTRAP_VERSION = '1.0.0';
var ACFUN_BOOTSTRAP_URL = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1';
var ACFUN_MANAGER_URL = 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/remote_manager.js?v=2';

var ACFUN_HC_CONFIG = {
    id: 'acfun',
    branch: 'main',
    repoRawRoot: 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/',
    latestPath: 'apps/video/acfun/latest.json',
    moduleHeaders: {'Cache-Control': 'no-cache'},
    defaultRelease: {
        schema: 1,
        id: 'acfun',
        name: 'ACFun',
        version: '0.1.9',
        build: 109,
        ref: 'main',
        modules: [
            {name: 'core', path: 'acfun_core_v018.js'},
            {name: 'protocol', path: 'acfun_patch_v019.js'},
            {name: 'diagnostics', path: 'acfun_diag_v019.js'}
        ],
        verify: {
            global: 'ac',
            property: 'build',
            equals: '2026.08.20-v0.1.9'
        }
    }
};

var ACFunBoot = {
    requireManager: function () {
        require(ACFUN_MANAGER_URL, {headers: {'Cache-Control': 'no-cache'}}, 200);
        if (typeof HikerCloudRemote !== 'object') {
            throw new Error('远程模块管理器加载失败');
        }
        return HikerCloudRemote;
    },

    legacyLoaderCode: function () {
        return "require('" + ACFUN_BOOTSTRAP_URL + "',{},100);ACFunBoot.loadOnly();";
    },

    installCompatibility: function () {
        // 旧版 ACFun 的部分 lazyRule 会读取这两个 key 再 eval。
        // 这里仅保存约百字节的“远程加载指令”，不保存业务源码。
        var loader = this.legacyLoaderCode();
        setItem('acfun_core_src_v018', loader);
        setItem('acfun_core_src_v019', loader);
    },

    patchNav: function () {
        if (typeof ac !== 'object' || ac.__hcRemoteNavPatched) return;
        var oldNav = ac.nav;
        if (typeof oldNav !== 'function') return;
        ac.nav = function (d) {
            oldNav.call(ac, d);
            d.push({
                title: '更新',
                col_type: 'scroll_button',
                url: 'hiker://page/acfun_update?rule=' + encodeURIComponent(MY_RULE.title) + '&simple=true#noRecordHistory#',
                extra: {inheritTitle: false, pageTitle: 'ACFun 远程更新'}
            });
        };
        ac.__hcRemoteNavPatched = true;
    },

    loadOnly: function () {
        var manager = this.requireManager();
        var result = manager.load(ACFUN_HC_CONFIG);
        if (!result || !result.ok || typeof ac !== 'object') {
            throw new Error('ACFun远程核心加载失败');
        }
        this.installCompatibility();
        this.patchNav();
        return result;
    },

    run: function (action) {
        this.loadOnly();
        switch (String(action || 'home')) {
            case 'home': return ac.home();
            case 'search': return ac.search();
            case 'detail': return ac.detail();
            case 'comments': return ac.comments();
            case 'favorites': return ac.localPage('fav');
            case 'history': return ac.localPage('hist');
            case 'settings': return ac.settings();
            case 'diag': return ac.diag();
            default: throw new Error('未知ACFun页面动作: ' + action);
        }
    },

    info: function () {
        return this.requireManager().info(ACFUN_HC_CONFIG);
    },

    check: function () {
        var r = this.requireManager().check(ACFUN_HC_CONFIG);
        setItem('hc_acfun_last_check', JSON.stringify(r));
        return r;
    },

    update: function () {
        var r = this.requireManager().update(ACFUN_HC_CONFIG);
        setItem('hc_acfun_last_result', JSON.stringify(r));
        if (r.ok) this.installCompatibility();
        return r;
    },

    rollback: function () {
        var r = this.requireManager().rollback(ACFUN_HC_CONFIG);
        setItem('hc_acfun_last_result', JSON.stringify(r));
        if (r.ok) this.installCompatibility();
        return r;
    },

    reinstall: function () {
        var r = this.requireManager().reinstall(ACFUN_HC_CONFIG);
        setItem('hc_acfun_last_result', JSON.stringify(r));
        if (r.ok) this.installCompatibility();
        return r;
    },

    resetDefault: function () {
        var r = this.requireManager().resetToDefault(ACFUN_HC_CONFIG);
        setItem('hc_acfun_last_result', JSON.stringify(r));
        if (r.ok) this.installCompatibility();
        return r;
    },

    updatePage: function () {
        var d = [];
        setPageTitle('ACFun 远程更新');

        var info;
        try {
            info = this.info();
        } catch (e) {
            d.push({
                title: '更新管理器加载失败',
                desc: String(e.message || e),
                col_type: 'long_text',
                url: 'hiker://empty'
            });
            setResult(d);
            return;
        }

        var current = info.current || ACFUN_HC_CONFIG.defaultRelease;
        var previous = info.previous || null;
        var lastCheck = {};
        try { lastCheck = JSON.parse(getItem('hc_acfun_last_check', '{}')) || {}; } catch (e0) {}
        var latest = lastCheck.latest || null;

        d.push({
            title: '当前业务版本  ' + current.version,
            desc:
                'Build：' + current.build +
                '\n启动壳：' + ACFUN_BOOTSTRAP_VERSION +
                '\n模块管理器：' + info.managerVersion +
                '\n运行方式：GitHub远程模块 + 海阔require缓存' +
                (previous ? '\n上一版本：' + previous.version + ' / ' + previous.build : ''),
            col_type: 'long_text',
            url: 'hiker://empty'
        });

        d.push({
            title: latest ? ('云端版本  ' + latest.version + (lastCheck.hasUpdate ? '  ↑ 可更新' : '  ✓ 已是最新')) : '检查云端版本',
            desc: latest ? ('Build：' + latest.build + (lastCheck.notes ? '\n' + lastCheck.notes : '')) : '只有点击这里才访问 latest.json；正常打开小程序不会检查 GitHub 最新版本。',
            col_type: 'text_1',
            url: $('hiker://empty#noLoading#').lazyRule(function () {
                showLoading('检查 ACFun 更新…');
                try {
                    require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1', {}, 100);
                    var r = ACFunBoot.check();
                    hideLoading();
                    refreshPage(false);
                    return 'toast://' + (r.hasUpdate ? ('发现新版本 ' + r.latest.version) : '已是最新版');
                } catch (e) {
                    hideLoading();
                    return 'toast://检查失败：' + (e.message || e);
                }
            })
        });

        d.push({
            title: '立即更新',
            desc: '先让海阔下载并执行新版本模块，校验通过后才切换 activeVersion；失败时继续使用当前版本。',
            col_type: 'text_1',
            url: $('hiker://empty#noLoading#').lazyRule(function () {
                showLoading('更新 ACFun…');
                require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1', {}, 100);
                var r = ACFunBoot.update();
                hideLoading();
                if (r.ok) {
                    clearItem('hc_acfun_last_check');
                    refreshPage(false);
                    return 'toast://' + (r.changed ? ('已更新到 ' + r.current.version) : '当前已经是最新版');
                }
                return 'toast://更新失败：' + r.error;
            })
        });

        d.push({
            title: '回退上一版本',
            desc: previous ? ('可回退到 ' + previous.version + ' / ' + previous.build) : '当前没有上一版本记录',
            col_type: 'text_1',
            url: $('hiker://empty#noLoading#').lazyRule(function () {
                require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1', {}, 100);
                var r = ACFunBoot.rollback();
                if (r.ok) {
                    clearItem('hc_acfun_last_check');
                    refreshPage(false);
                    return 'toast://已回退到 ' + r.current.version;
                }
                return 'toast://' + r.error;
            })
        });

        d.push({
            title: '重新加载当前版本',
            desc: '删除当前版本对应的海阔 require 缓存，再从 GitHub 重新获取同一版本。用于缓存异常，不改变版本号。',
            col_type: 'text_1',
            url: $('hiker://empty#noLoading#').lazyRule(function () {
                showLoading('重新加载当前版本…');
                require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1', {}, 100);
                var r = ACFunBoot.reinstall();
                hideLoading();
                return 'toast://' + (r.ok ? '当前版本已重新缓存' : ('重新加载失败：' + r.error));
            })
        });

        d.push({
            title: '恢复随壳默认版本',
            desc: '恢复到启动壳内置的稳定版本 ' + ACFUN_HC_CONFIG.defaultRelease.version + '。不会删除收藏、历史和接口设置。',
            col_type: 'text_1',
            url: $('hiker://empty#noLoading#').lazyRule(function () {
                require('https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap.js?v=1', {}, 100);
                var r = ACFunBoot.resetDefault();
                if (r.ok) {
                    clearItem('hc_acfun_last_check');
                    refreshPage(false);
                    return 'toast://已恢复默认版本 ' + r.current.version;
                }
                return 'toast://恢复失败：' + r.error;
            })
        });

        if (info.lastFallbackError) {
            d.push({
                title: '自动回退记录',
                desc: info.lastFallbackError,
                col_type: 'long_text',
                url: 'hiker://empty'
            });
        }

        d.push({
            title: '更新机制说明',
            desc: '云仓库只保存约几KB的启动壳。业务JS保存在 GitHub，海阔 require 第一次加载后自动缓存；相同版本正常启动直接使用缓存。只有检查更新、切换版本或重新加载时才需要访问远程版本信息。',
            col_type: 'long_text',
            url: 'hiker://empty'
        });

        setResult(d);
    }
};
