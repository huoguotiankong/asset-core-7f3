/* Legacy updater compatibility note.
 * v1.0.0 曾把业务 JS 下载到规则私有文件。
 * 新项目请改用 libs/updater/remote_manager.js。
 */
var HikerCloudUpdater = {
    version: 'legacy-1.0.0',
    deprecated: true,
    message: '该更新器已废弃，请使用 Remote Module Manager：libs/updater/remote_manager.js'
};
