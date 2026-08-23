/** ACFun comic first-page trimmer - alpha10 robust sustained-content scan */
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
        let outData = data, diag = 'decode=unknown';
        try {
            const bmp = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length);
            if (bmp) {
                const w = bmp.getWidth(), h = bmp.getHeight();
                const maxScan = Math.min(Math.floor(h * 0.55), 2200);
                const x0 = Math.floor(w * 0.025), x1 = Math.max(x0 + 1, Math.floor(w * 0.975));
                const sx = Math.max(2, Math.floor((x1 - x0) / 220));
                const sy = Math.max(2, Math.floor(maxScan / 360));
                const minRatio = 0.025;
                let first = 0, found = false, streak = 0, streakStart = 0, bestRatio = 0;
                for (let y = 0; y < maxScan; y += sy) {
                    let content = 0, sampled = 0;
                    for (let x = x0; x < x1; x += sx) {
                        const p = bmp.getPixel(x, y), a = (p >>> 24) & 255, r = (p >>> 16) & 255, g = (p >>> 8) & 255, b = p & 255;
                        sampled++;
                        const mn = Math.min(r, g, b), mx = Math.max(r, g, b), spread = mx - mn;
                        if (a > 24 && (mn < 238 || spread > 18)) content++;
                    }
                    const ratio = sampled ? content / sampled : 0;
                    if (ratio > bestRatio) bestRatio = ratio;
                    if (ratio >= minRatio) {
                        if (!streak) streakStart = y;
                        streak++;
                        if (streak >= 3) { first = streakStart; found = true; break; }
                    } else {
                        streak = 0;
                    }
                }
                let top = 0;
                if (found && first > Math.max(24, Math.floor(h * 0.008))) {
                    const pad = Math.min(10, first);
                    top = Math.max(0, first - pad);
                    const crop = android.graphics.Bitmap.createBitmap(bmp, 0, top, w, h - top);
                    const baos = new java.io.ByteArrayOutputStream();
                    crop.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos);
                    outData = baos.toByteArray();
                    baos.close();
                    if (crop !== bmp) crop.recycle();
                }
                diag = 'w=' + w + ' h=' + h + ' maxScan=' + maxScan + ' found=' + found + ' first=' + first + ' top=' + top + ' bestRatio=' + bestRatio;
                bmp.recycle();
            }
        } catch (e) { diag = 'ERR ' + String(e && (e.message || e)); }
        try { setItem('acfun_next_diag|comic_trim', diag); } catch (e0) {}
        if (cacheAbsPath) {
            try {
                let p = String(cacheAbsPath);
                if (p.indexOf('file://') === 0) p = p.replace(/^file:\/\/+/,'/');
                const f = new java.io.File(p), parent = f.getParentFile();
                if (parent && !parent.exists()) parent.mkdirs();
                const tmp = new java.io.File(p + '.tmp.' + java.lang.Thread.currentThread().getId());
                const fos = new java.io.FileOutputStream(tmp); fos.write(outData); fos.flush(); fos.close();
                if (!f.exists()) tmp.renameTo(f); if (tmp.exists()) tmp.delete();
            } catch (e2) {}
        }
        return FileUtil.toInputStream(outData);
    }
};
$.exports = ACFunComicTrim;
