const {test}=require('node:test');
const assert=require('node:assert/strict');
const QRCode=require('qrcode');
const jsQR=require('jsqr');
const {decodeQR}=require('./ui/qr-parser');
const text='012345678901||Nguyễn Văn A|01011990|Nam|Hà Nội|01012022';
function scan(segments){
 const qr=QRCode.create(segments,{errorCorrectionLevel:'M'}),scale=6,pad=4;
 const width=(qr.modules.size+pad*2)*scale;
 const pixels=new Uint8ClampedArray(width*width*4);
 for(let y=0;y<width;y++)for(let x=0;x<width;x++){
  const col=Math.floor(x/scale)-pad,row=Math.floor(y/scale)-pad;
  const black=row>=0&&col>=0&&row<qr.modules.size&&col<qr.modules.size&&qr.modules.get(row,col);
  const i=(y*width+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=black?0:255;pixels[i+3]=255;
 }
 const result=jsQR(pixels,width,width);assert.ok(result,'QR image must decode');return result;
}
test('decode real rendered UTF-8 QR including Vietnamese text',()=>{
 const result=decodeQR(scan([{data:Buffer.from(text),mode:'byte'}]));
 assert.equal(result.record.name,'Nguyễn Văn A');assert.equal(result.record.address,'Hà Nội');
});
test('recover UTF-8 split across byte segments without losing personal fields',()=>{
 const bytes=Buffer.from(text),cut=bytes.indexOf(Buffer.from('ễ'))+1;
 const qr=scan([{data:bytes.subarray(0,cut),mode:'byte'},{data:bytes.subarray(cut),mode:'byte'}]);
 assert.notEqual(qr.data,text);assert.equal(decodeQR(qr).text,text);
});
test('recover identified UTF-16LE QR from original bytes',()=>{
 const qr=scan([{data:Buffer.from(text,'utf16le'),mode:'byte'}]);
 assert.equal(decodeQR(qr).record.name,'Nguyễn Văn A');
});
test('reject unrelated QR with metadata only and never disclose payload',()=>{
 assert.throws(()=>decodeQR(scan('https://example.com/private-secret')),e=>!e.message.includes('private-secret')&&e.message.includes('byte'));
});
test('do not accept partially decoded data when a byte segment is lost',()=>{
 assert.throws(()=>decodeQR({data:text,binaryData:[255],chunks:[{type:'byte',bytes:[255],text:''}]}),/chưa đọc được/);
});
