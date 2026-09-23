/* PikPak 0.1.0-test.7 Runtime identity patch */
(function(R){
    var baseModule=R.module;
    R.module=function(){
        var m=baseModule();
        m.version='0.1.0-test.7';
        m.build=10107;
        return m;
    };
    R.version='0.1.0-test.7';
    R.build=10107;
})(PikPakRemoteRuntime);
