(function(root){
  const fields=['id','oldId','name','dob','gender','address','issued'];
  function parseQR(text){
    if(typeof text!=='string')throw Error('Nội dung QR phải là văn bản.');
    const parts=text.replace(/^\uFEFF/,'').trim().split('|').map(p=>p.trim());
    // Some readers append an empty separator. Never discard populated extra fields.
    while(parts.length>7&&parts.at(-1)==='')parts.pop();
    if(parts.length!==7)throw Error(`QR có ${parts.length} trường; ứng dụng cần 7 trường ngăn cách bằng dấu |. Có thể đây là loại QR chưa được hỗ trợ hoặc mã ghép đôi, hãy kiểm tra đúng mã trên thẻ.`);
    if(!/^\d{12}$/.test(parts[0]))throw Error(`Trường số CCCD phải có 12 chữ số (nhận ${parts[0].length} ký tự).`);
    if(!parts[2])throw Error('QR thiếu trường họ tên.');
    for(const i of [3,6]){
      let date=parts[i];
      const match=/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/.exec(date);
      if(match)date=match.slice(1).join('');
      if(!/^\d{8}$/.test(date))throw Error(`${i===3?'Ngày sinh':'Ngày cấp'} cần dạng DDMMYYYY hoặc DD/MM/YYYY.`);
      const d=Number(date.slice(0,2)),m=Number(date.slice(2,4)),y=Number(date.slice(4));
      const check=new Date(Date.UTC(y,m-1,d));
      if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)throw Error(`${i===3?'Ngày sinh':'Ngày cấp'} không phải ngày hợp lệ.`);
      parts[i]=date;
    }
    return Object.fromEntries(fields.map((k,i)=>[k,parts[i]]));
  }
  function decodeQR(qr){
    const bytes=Uint8Array.from(qr.binaryData||[]);
    const candidates=[];
    // jsQR silently drops a whole byte segment when its UTF-8 decoding fails.
    // Decode the original bytes together, including UTF-16 only when identified.
    const le=(bytes[0]===255&&bytes[1]===254)||
      (bytes.length>=24&&Array.from({length:12},(_,i)=>bytes[2*i]>=48&&bytes[2*i]<=57&&bytes[2*i+1]===0).every(Boolean));
    const be=(bytes[0]===254&&bytes[1]===255)||
      (bytes.length>=24&&Array.from({length:12},(_,i)=>bytes[2*i]===0&&bytes[2*i+1]>=48&&bytes[2*i+1]<=57).every(Boolean));
    for(const encoding of le?['utf-16le']:be?['utf-16be']:['utf-8']){
      try{if(bytes.length)candidates.push(new TextDecoder(encoding,{fatal:true}).decode(bytes));}catch{}
    }
    const lostByteSegment=(qr.chunks||[]).some(c=>c.type==='byte'&&c.bytes?.length&&!c.text);
    if(!lostByteSegment&&typeof qr.data==='string')candidates.push(qr.data);
    for(const text of candidates){try{return {text,record:parseQR(text)};}catch{}}
    const text=typeof qr.data==='string'?qr.data:'';
    const separators=(text.match(/\|/g)||[]).length;
    throw Error(`Đã nhận mã QR nhưng chưa đọc được dữ liệu CCCD: ${bytes.length} byte, ${text.length} ký tự, ${separators} dấu |. Vui lòng báo lại các con số này; không gửi nội dung QR hoặc ảnh thẻ.`);
  }
  const api={fields,parseQR,decodeQR};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CCCD=api;
})(typeof globalThis!=='undefined'?globalThis:this);
