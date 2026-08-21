/*
 * 海阔小程序稳定启动壳示例。
 * 正常启动只执行本地 bundle；更新按钮再访问 GitHub。
 */
var HC_APP = {
    id: 'demo-app',
    localEntry: 'hc_demo_app_bundle.js',
    manifestPath: 'apps/tools/demo-app/manifest.json',
    updaterUrl: 'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/libs/updater/updater.js'
};

function hcRunLocal() {
    if (!fileExist(HC_APP.localEntry)) {
        setResult([{
            title: '尚未安装运行代码，请先执行首次安装/更新',
            col_type: 'text_1'
        }]);
        return;
    }
    eval(readFile(HC_APP.localEntry, 0));
}

/*
 * 推荐在设置页/更新按钮的 lazyRule 中：
 * 1. deleteCache(HC_APP.updaterUrl)
 * 2. require(HC_APP.updaterUrl)
 * 3. HikerCloudUpdater.update(HC_APP.manifestPath)
 *
 * 更新器只在点击更新时联网，GitHub不可用不影响 hcRunLocal()。
 */

hcRunLocal();
