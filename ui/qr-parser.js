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
  const api={fields,parseQR};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CCCD=api;
})(typeof globalThis!=='undefined'?globalThis:this);
