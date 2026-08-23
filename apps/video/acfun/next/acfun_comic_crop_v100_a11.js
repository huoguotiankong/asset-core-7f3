/** ACFun comic page cropper - alpha11 all-edge near-white border removal */
const ACFunComicCrop = {
    crop: function(cacheAbsPath) {
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
                const sx = Math.max(1, Math.floor(w / 260));
                const sy = Math.max(1, Math.floor(h / 520));
                const isBlank = p => {
                    const a = (p >>> 24) & 255, r = (p >>> 16) & 255, g = (p >>> 8) & 255, b = p & 255;
                    const mn = Math.min(r,g,b), mx = Math.max(r,g,b);
                    // Only trim genuinely white / very light neutral canvas. Pale colored comic art is content.
                    return a < 16 || (mn >= 242 && (mx - mn) <= 18);
                };
                const rowRatio = y => {
                    let content = 0, n = 0;
                    const x0 = Math.floor(w * 0.01), x1 = Math.max(x0 + 1, Math.ceil(w * 0.99));
                    for (let x=x0; x<x1; x+=sx) { n++; if (!isBlank(bmp.getPixel(x,y))) content++; }
                    return n ? content / n : 0;
                };
                const colRatio = x => {
                    let content = 0, n = 0;
                    const y0 = Math.floor(h * 0.005), y1 = Math.max(y0 + 1, Math.ceil(h * 0.995));
                    for (let y=y0; y<y1; y+=sy) { n++; if (!isBlank(bmp.getPixel(x,y))) content++; }
                    return n ? content / n : 0;
                };
                const rowMin = 0.018, colMin = 0.012;
                let top=0,bottom=h-1,left=0,right=w-1;
                let streak=0,start=0;
                for(let y=0;y<h;y+=sy){const r=rowRatio(y);if(r>=rowMin){if(!streak)start=y;streak++;if(streak>=2){top=start;break;}}else streak=0;}
                streak=0;start=h-1;
                for(let y=h-1;y>=0;y-=sy){const r=rowRatio(y);if(r>=rowMin){if(!streak)start=y;streak++;if(streak>=2){bottom=start;break;}}else streak=0;}
                streak=0;start=0;
                for(let x=0;x<w;x+=sx){const r=colRatio(x);if(r>=colMin){if(!streak)start=x;streak++;if(streak>=2){left=start;break;}}else streak=0;}
                streak=0;start=w-1;
                for(let x=w-1;x>=0;x-=sx){const r=colRatio(x);if(r>=colMin){if(!streak)start=x;streak++;if(streak>=2){right=start;break;}}else streak=0;}

                // Small safety padding avoids cutting antialiased borders/text strokes.
                const padX = Math.max(3, Math.min(8, Math.floor(w * 0.006)));
                const padY = Math.max(3, Math.min(8, Math.floor(h * 0.003)));
                left=Math.max(0,left-padX); right=Math.min(w-1,right+padX); top=Math.max(0,top-padY); bottom=Math.min(h-1,bottom+padY);
                const cw=right-left+1, ch=bottom-top+1;
                const marginX=(w-cw)/w, marginY=(h-ch)/h;
                // Crop only meaningful outer canvas and reject pathological tiny detections.
                const sane=cw>=Math.floor(w*0.20)&&ch>=Math.floor(h*0.08)&&cw>16&&ch>16;
                const worthwhile=marginX>=0.025||marginY>=0.02;
                if(sane&&worthwhile){
                    const crop=android.graphics.Bitmap.createBitmap(bmp,left,top,cw,ch);
                    const baos=new java.io.ByteArrayOutputStream();
                    crop.compress(android.graphics.Bitmap.CompressFormat.JPEG,96,baos);
                    outData=baos.toByteArray();baos.close();if(crop!==bmp)crop.recycle();
                }
                bmp.recycle();
            }
        } catch (e) {}
        if (cacheAbsPath) {
            try {
                let p=String(cacheAbsPath);if(p.indexOf('file://')===0)p=p.replace(/^file:\/\/+/,'/');
                const f=new java.io.File(p),parent=f.getParentFile();if(parent&&!parent.exists())parent.mkdirs();
                const tmp=new java.io.File(p+'.tmp.'+java.lang.Thread.currentThread().getId());
                const fos=new java.io.FileOutputStream(tmp);fos.write(outData);fos.flush();fos.close();
                if(f.exists())f.delete();tmp.renameTo(f);if(tmp.exists())tmp.delete();
            } catch(e2) {}
        }
        return FileUtil.toInputStream(outData);
    }
};
$.exports = ACFunComicCrop;
