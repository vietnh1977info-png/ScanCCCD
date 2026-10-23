const {test}=require('node:test');const assert=require('node:assert/strict');const {parseQR,csv}=require('./lib');const raw='012345678901|123456789|NGUYEN VAN A|01011990|Nam|Ha Noi|01012022';test('parse CCCD QR preserves identifiers and dates',()=>{const r=parseQR(raw);assert.equal(r.id,'012345678901');assert.equal(r.dob,'01011990');assert.equal(r.name,'NGUYEN VAN A');});test('reject unrelated QR and malformed dates',()=>{assert.throws(()=>parseQR('https://example.com'));assert.throws(()=>parseQR(raw.replace('01011990','bad')));});test('CSV escapes quotes, protects spreadsheet formulas and keeps UTF-8 BOM',()=>{const r=parseQR(raw);r.name='=1+1';r.address='A,"B"';const out=csv([r]);assert.ok(out.startsWith('\ufeff'));assert.ok(out.includes('"\'=1+1"'));assert.ok(out.includes('"A,""B"""'));});

test('normalize whitespace, BOM, optional empty CMND and empty trailing delimiter',()=>{
 const result=parseQR('\ufeff 012345678901 | | Nguyễn Văn A | 01/01/1990 | Nam | Hà Nội | 01-01-2022 | ');
 assert.equal(result.id,'012345678901');assert.equal(result.oldId,'');assert.equal(result.dob,'01011990');assert.equal(result.issued,'01012022');assert.equal(result.name,'Nguyễn Văn A');
});
test('reject extra populated fields, missing fields and impossible dates with safe diagnostics',()=>{
 assert.throws(()=>parseQR(raw+'|extra'),/8 trường/);
 assert.throws(()=>parseQR(raw.replace('|123456789','')),/6 trường/);
 assert.throws(()=>parseQR(raw.replace('01011990','31021990')),/không phải ngày/);
 try{parseQR('secret-personal-data');assert.fail();}catch(e){assert.ok(!e.message.includes('secret-personal-data'));}
});
test('browser parser matches backend parsing',()=>{
 const vm=require('node:vm'),fs=require('node:fs');const context=vm.createContext({});vm.runInContext(fs.readFileSync('ui/qr-parser.js','utf8'),context);
 assert.equal(JSON.stringify(context.CCCD.parseQR(raw)),JSON.stringify(parseQR(raw)));
});
