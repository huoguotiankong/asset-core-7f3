# Incident: Hiker Page Parameters May Remain Percent-Encoded

Date: 2026-08-26
Status: real-device incident observed; mitigation published in Pornhub V2 Test2, awaiting device regression pass
Primary evidence: Pornhub V2 `0.2.0-test.1 / Build20001`

## Symptom
A page route was generated with `encodeURIComponent`:

```text
hiker://page/<path>?rule=...&simple=true&u=<encoded-url>&n=<encoded-title>
```

On the real device, the destination page received values such as:

```text
%E7%86%9F%E5%A5%B3...
https%3A%2F%2Fwww.pornhub.com%2Fview_video.php%3Fviewkey%3D...
```

The page title visibly displayed `%E7...`; the encoded URL was then passed into the Provider request layer, causing category secondary pages to be empty and video detail loading to fail.

## Incorrect assumption
Do not assume that `getParam(name)` or a page parameter object always returns a fully decoded value on every current Hiker route/runtime combination.

The following pattern is unsafe for values that were explicitly encoded when building the route:

```js
var v=getParam(name);
return String(v||'');
```

## Required boundary
Route serialization and route restoration are a pair:

```text
Page A
model value
→ encodeURIComponent
→ hiker://page route

Page B
MY_PARAMS / getParam / MY_URL
→ controlled parameter restore
→ Page Model
→ Provider
```

A Provider must receive a real URL/model value, not a route-transport representation.

Recommended current mitigation pattern:

```js
function decodePageParam(v){
  var x=String(v==null?'':v);
  if(/%[0-9a-f]{2}/i.test(x)){
    try{x=decodeURIComponent(x);}catch(e){}
  }
  return x;
}
```

Apply at the Page Boundary, not independently in every Provider.

## Why only once
A page parameter may itself contain a URL whose query values have their own encoding semantics. Repeated blind decoding can corrupt nested URL data. Current mitigation performs one controlled decode only when `%xx` sequences are present.

## Regression scope
After changing the boundary, retest every cross-page entity whose primary key is carried in the URL:

- Category URL + category title
- Video detail URL
- Creator/profile URL
- Playlist/collection URL
- Search keyword
- Image seed URL when carried as a route parameter
- Any Chinese route title/label

## Release rule
- Never overwrite an immutable Test release after this failure is observed.
- Create a higher Test build.
- Record the failed device result in the app CHANGELOG/release metadata.
- Do not promote the mitigation to Stable until the affected routes pass real-device regression.

## Current Pornhub evidence

```text
0.2.0-test.1 / Build20001
→ category title showed literal %E7...
→ category Provider received encoded URL
→ video detail Provider received encoded URL
→ partial-fail

0.2.0-test.2 / Build20002
→ Page Boundary decodeParam added
→ device retest pending
```
