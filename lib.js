const {fields,parseQR}=require('./ui/qr-parser');
function csv(rows){return '\ufeff'+[fields,...rows.map(r=>fields.map(k=>r[k]||''))].map(r=>r.map(v=>'"'+String(/^[=+@\-\t\r]/.test(String(v))?"'"+v:v).replaceAll('"','""')+'"').join(',')).join('\r\n');}
module.exports={fields,parseQR,csv};
