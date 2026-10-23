const fields=['id','oldId','name','dob','gender','address','issued'];
function parseQR(text){const p=text.trim().split('|');if(p.length!==7||!/^\d{12}$/.test(p[0])||!p[2].trim())throw Error('QR không đúng định dạng CCCD 7 trường.');for(const i of [3,6])if(!/^\d{8}$/.test(p[i]))throw Error('Ngày trong QR không hợp lệ.');return Object.fromEntries(fields.map((k,i)=>[k,p[i]]));}
function csv(rows){return '\ufeff'+[fields,...rows.map(r=>fields.map(k=>r[k]||''))].map(r=>r.map(v=>'"'+String(/^[=+@\-\t\r]/.test(String(v))?"'"+v:v).replaceAll('"','""')+'"').join(',')).join('\r\n');}
module.exports={fields,parseQR,csv};
