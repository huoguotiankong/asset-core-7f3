/* Hanime1 2.0.2-test.1 - flattened local recovery bundles */
(function(){
  var ROOT='hiker://files/rules/asset-core-local/hanime1-test/bundles/';
  var files=['base_b20101.js','mid_b20101.js','upper_b20101.js'];
  for(var i=0;i<files.length;i++){
    var p=ROOT+files[i];
    if(!fileExist(p))throw new Error('Hanime1 本地恢复 Bundle 缺失：'+files[i]);
    require(getPath(p));
  }
  var missing=[];
  if(typeof HanimeCore!=='object')missing.push('HanimeCore');
  if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');
  if(typeof HanimePages!=='object')missing.push('HanimePages');
  if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');
  if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');
  if(missing.length)throw new Error('Hanime1 Local-First runtime preflight missing: '+missing.join(', '));
})();
