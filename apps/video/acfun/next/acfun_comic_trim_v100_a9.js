/** ACFun comic first-page trimmer - alpha9 isolated decoder */
const ACFunComicTrim = {
    trimTop: function(cacheAbsPath) {
        const FileUtil = com.example.hikerview.utils.FileUtil;
        let data = FileUtil.toBytes(input);
        if (!data || data.length < 4) return FileUtil.toInputStream(data);
        const u = i => data[i] & 0xff;
        const validMagic = () =>
            (data.length > 2 && u(0) === 0xff && u(1) === 0xd8 && u(2) === 0xff) ||
            (data.length > 7 && u(0) === 0x89 && u(1) === 0x50 && u(2) === 0x4e && u(3) === 0x47 && u(4) === 0x0d && u(5) === 0x0a && u(6) === 0x1a && u(7) === 0x0a) ||
            (data.length > 11 && u(0) === 0x52 && u(1) === 0x49 && u(2) === 0x46 && u(3) === 0x46 && u(8) === 0x57 && u(9) === 0x45 && u(10) === 0x42 && u(11) === 0x50);
        if (!validMagic()) {
            const key = '2020-zq3-888'.split('').map(c => c.charCodeAt(0));
            const limit = Math.min(100, data.length);
            for (let i = 0; i < limit; i++) data[i] = data[i] ^ key[i % key.length];
        }
        let outData = data;
        try {
            const bmp = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length);
            if (bmp) {
                const w = bmp.getWidth(), h = bmp.getHeight();
                const maxScan = Math.min(Math.floor(h * 0.35), 1200);
                const sx = Math.max(2, Math.floor(w / 160));
                const sy = Math.max(2, Math.floor(maxScan / 240));
                let first = 0, found = false;
                for (let y = 0; y < maxScan; y += sy) {
                    let nonBlank = 0, sampled = 0;
                    for (let x = 0; x < w; x += sx) {
                        const p = bmp.getPixel(x, y), a = (p >>> 24) & 255, r = (p >>> 16) & 255, g = (p >>> 8) & 255, b = p & 255;
                        sampled++;
                        if (a > 20 && (r < 244 || g < 244 || b < 244) && (Math.max(r,g,b)-Math.min(r,g,b) > 5 || (r+g+b) < 720)) nonBlank++;
                    }
                    if (nonBlank >= Math.max(2, Math.floor(sampled * 0.008))) { first = y; found = true; break; }
                }
                if (found && first > 24) {
                    const pad = Math.min(12, first);
                    const top = Math.max(0, first - pad);
                    const crop = android.graphics.Bitmap.createBitmap(bmp, 0, top, w, h - top);
                    const baos = new java.io.ByteArrayOutputStream();
                    crop.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos);
                    outData = baos.toByteArray();
                    baos.close();
                    if (crop !== bmp) crop.recycle();
                }
                bmp.recycle();
            }
        } catch (e) {}
        if (cacheAbsPath) {
            try {
                let p = String(cacheAbsPath);
                if (p.indexOf('file://') === 0) p = p.replace(/^file:\/\/+/,'/');
                const f = new java.io.File(p), parent = f.getParentFile();
                if (parent && !parent.exists()) parent.mkdirs();
                const tmp = new java.io.File(p + '.tmp.' + java.lang.Thread.currentThread().getId());
                const fos = new java.io.FileOutputStream(tmp);fos.write(outData);fos.flush();fos.close();
                if (!f.exists()) tmp.renameTo(f);if (tmp.exists()) tmp.delete();
            } catch (e2) {}
        }
        return FileUtil.toInputStream(outData);
    }
};
$.exports = ACFunComicTrim;
