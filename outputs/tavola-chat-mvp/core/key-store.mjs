import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const appRoot=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const keyFile=process.env.TAVOLA_KEY_FILE||path.join(appRoot,'data','openai-key.protected');
const binding=`tavola-local-key-v1|${os.userInfo().username}|${os.hostname()}`;

export function saveProtectedKey(plain){
  fs.mkdirSync(path.dirname(keyFile),{recursive:true});
  const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12);
  const key=crypto.scryptSync(binding,salt,32);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted=Buffer.concat([cipher.update(plain,'utf8'),cipher.final()]);
  const payload={version:1,salt:salt.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:encrypted.toString('base64')};
  fs.writeFileSync(keyFile,JSON.stringify(payload),{encoding:'utf8',mode:0o600});
}

export function loadProtectedKey(){
  try{
    const payload=JSON.parse(fs.readFileSync(keyFile,'utf8'));
    const salt=Buffer.from(payload.salt,'base64'),iv=Buffer.from(payload.iv,'base64');
    const key=crypto.scryptSync(binding,salt,32);
    const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);
    decipher.setAuthTag(Buffer.from(payload.tag,'base64'));
    return Buffer.concat([decipher.update(Buffer.from(payload.data,'base64')),decipher.final()]).toString('utf8');
  }catch{return ''}
}
