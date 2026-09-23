/* PikPak 0.1.0-test.8 Runtime identity patch */
(function(R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.8';
        m.build=10108;
        return m;
    };
    R.version='0.1.0-test.8';
    R.build=10108;
})(PikPakRemoteRuntime);
