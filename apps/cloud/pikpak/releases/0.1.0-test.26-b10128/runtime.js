/* PikPak Test26 Build10128 - session diagnostics and runtime identity. */
(function(C,R){
    var original=R.module;
    R.version='0.1.0-test.26';R.build=10128;
    R.module=function(){
        var m=original();
        m.verifySessionAction=function(){
            showLoading('正在检测官方云盘授权…');
            var r=C.webSessionDiagnostic();
            hideLoading();
            toast(r.ok?'PikPak 云盘授权正常':r.message);
            return 'hiker://empty';
        };
        m.version='0.1.0-test.26';m.build=10128;
        return m;
    };
})(PikPakCore,PikPakRemoteRuntime);
