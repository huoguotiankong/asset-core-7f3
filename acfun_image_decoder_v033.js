// ACFun image decoder v0.3.3 - Hiker page module
var ACFunImageDecoder={
    key:'2020-zq3-888',
    decode:function(limit){
        var javaImport=new JavaImporter();
        javaImport.importPackage(Packages.com.example.hikerview.utils);
        with(javaImport){
            var bytes=FileUtil.toBytes(input);
            var key=[50,48,50,48,45,122,113,51,45,56,56,56];
            var n=Number(limit||100);
            if(!isFinite(n)||n<=0)n=bytes.length;
            n=Math.min(n,bytes.length);
            for(var i=0;i<n;i++){
                bytes[i]=bytes[i]^key[i%key.length];
            }
            return FileUtil.toInputStream(bytes);
        }
    }
};
$.exports=ACFunImageDecoder;
