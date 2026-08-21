/* 海阔静态字符串兼容辅助层。
 * 原则：UI显示文本可做零宽隔断；功能字符串优先运行时恢复，避免改变真实值。
 */
var HikerSafeText = {
    zeroWidth: '\u200B',

    displaySplit: function (text) {
        return Array.from(String(text || '')).join(this.zeroWidth);
    },

    decode64: function (encoded) {
        return base64Decode(String(encoded || ''));
    },

    join: function (parts) {
        return (parts || []).join('');
    },

    scan: function (source, words) {
        var text = String(source || '');
        var hit = [];
        (words || []).forEach(function (word) {
            if (word && text.indexOf(word) >= 0) hit.push(word);
        });
        return hit;
    }
};

try {
    $.exports = HikerSafeText;
} catch (e) {}
