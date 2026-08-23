/* 汤头条 0.1.0-test.7 Session Migration Gate */
(function(){
  if(typeof TangTouTiaoProtocolV015!=='object')throw new Error('Test7 session gate: protocol missing');
  var P=TangTouTiaoProtocolV015,baseCall=P.call;
  P.call=function(path,payload,opt){
    opt=opt||{};
    if(!opt.skipBootstrap&&String(getItem('ttt_version_checked','')||'')!=='1')P.bootstrapSession(false);
    return baseCall(path,payload,opt);
  };
  P.version='0.1.0-test.7';
})();
