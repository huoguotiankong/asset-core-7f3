// ACFun image decoder v0.3.7 - exact proven Hiker pattern
const ACFunImageDecoder = {
    image: function() {
        const FileUtil = com.example.hikerview.utils.FileUtil;
        let data = FileUtil.toBytes(input);
        let key = '2020-zq3-888'.split('').map(c => c.charCodeAt(0));
        let keyLen = key.length;
        let limit = Math.min(100, data.length);
        for (let i = 0; i < limit; i++) {
            data[i] = data[i] ^ key[i % keyLen];
        }
        return FileUtil.toInputStream(data);
    }
};
$.exports = ACFunImageDecoder;
