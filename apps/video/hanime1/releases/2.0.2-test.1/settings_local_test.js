/* Hanime1 2.0.2-test.1 - Local-First test settings/identity */
(function(C,E,H){
  var BUILD='2.0.2-test.1',BUILDNO=20101;
  E.renderSettings=function(d){
    var st=C.state(),acc=null;try{acc=C.activeAccount();}catch(e){}
    d.push(H.sec('账号',acc?(acc.name+(acc.email?' · '+acc.email:'')):'未同步账号资料'));
    d.push(H.btn(acc?'账号中心':'到“我的”同步账号',acc?H.route('hanimeAccount',{}):'hiker://empty','text_center_1'));
    d.push(H.sec('性能','继承 Stable 2.0.1 / Test40 的 profile 递归隔离与账号分区缓存；本轮只迁移 Local-First 交付，不改账号/回复/搜索业务。'));
    d.push(H.btn('页面封面布局',H.route('hanimeLayoutSettings',{}),'text_center_1'));
    d.push(H.sec('网络','当前线路 · '+st.base));
    d.push(H.btn('重新检测线路',$('#noLoading#').lazyRule(function(){clearItem('hanime2_active_host');clearItem('hanime2_host_ts');try{var h=$.require('hanime').core().resolveHost(true);refreshPage(false);return 'toast://当前线路 '+h;}catch(e){return 'toast://'+String(e.message||e);}}),'text_2'));
    d.push(H.btn('浏览器验证',H.route('hanimeVerify',{url:st.base}),'text_2'));
    var pkg=false;try{pkg=fileExist('__hclocal22_hanime1-test_b20101.json');}catch(e2){}
    d.push(H.sec('测试版本',BUILD+' · Build '+BUILDNO+' · Local-First'));
    d.push(H.btn('本地运行包',pkg?'已安装 Build20101':'本地包未检测到','text_2'));
    d.push(H.sec('维护','本 Test 不在运行时提供远程检查/更新/回退按钮，避免旧 Test40/Stable Bootstrap URL 重新进入 serialized lazyRule。切换版本统一从“我的规则仓库”完成。'));
    d.push(H.btn('版本切换说明','正式版 2.0.1 保持冻结；需要恢复时从规则仓重新导入正式版。','text_1'));
  };
  HanimePages.build=BUILD;HanimeCore.build=BUILD;HanimeProvider.build=BUILD;
})(HanimeCore,HanimePages,HanimeUI9);
