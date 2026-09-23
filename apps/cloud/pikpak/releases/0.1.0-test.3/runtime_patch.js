/* PikPak 0.1.0-test.3 Runtime identity patch */
(function(R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.3';
        m.build=10103;
        return m;
    };
    R.version='0.1.0-test.3';
    R.build=10103;
})(PikPakRemoteRuntime);