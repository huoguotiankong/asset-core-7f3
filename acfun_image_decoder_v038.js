// ACFun image decoder v0.3.8 - proven XOR + plaintext guard
const ACFunImageDecoder = {
    image: function() {
        const FileUtil = com.example.hikerview.utils.FileUtil;
        let data = FileUtil.toBytes(input);
        if (!data || data.length < 4) return FileUtil.toInputStream(data);
        const u = i => data[i] & 0xff;
        const isJpg = data.length > 2 && u(0) === 0xff && u(1) === 0xd8 && u(2) === 0xff;
        const isPng = data.length > 7 && u(0) === 0x89 && u(1) === 0x50 && u(2) === 0x4e && u(3) === 0x47 && u(4) === 0x0d && u(5) === 0x0a && u(6) === 0x1a && u(7) === 0x0a;
        const isGif = data.length > 2 && u(0) === 0x47 && u(1) === 0x49 && u(2) === 0x46;
        const isWebp = data.length > 11 && u(0) === 0x52 && u(1) === 0x49 && u(2) === 0x46 && u(3) === 0x46 && u(8) === 0x57 && u(9) === 0x45 && u(10) === 0x42 && u(11) === 0x50;
        if (!(isJpg || isPng || isGif || isWebp)) {
            let key = '2020-zq3-888'.split('').map(c => c.charCodeAt(0));
            let limit = Math.min(100, data.length);
            for (let i = 0; i < limit; i++) data[i] = data[i] ^ key[i % key.length];
        }
        return FileUtil.toInputStream(data);
    }
};
$.exports = ACFunImageDecoder;
