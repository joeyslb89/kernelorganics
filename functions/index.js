const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineString,defineSecret}=require('firebase-functions/params');
const logger=require('firebase-functions/logger');
const admin=require('firebase-admin');
const nodemailer=require('nodemailer');
const T=require('./templates');
admin.initializeApp();
const HOST=defineString('SMTP_HOST',{default:'smtp.gmail.com'}),PORT=defineString('SMTP_PORT',{default:'465'}),USER=defineString('SMTP_USER'),ADMIN=defineString('ADMIN_EMAIL'),PASS=defineSecret('SMTP_PASS'),SENDER=defineString('SENDER_NAME',{default:'Kernel Organics'}),REPLY=defineString('REPLY_TO',{default:''}),FROM=defineString('FROM_EMAIL',{default:''});
const ok=e=>/^\S+@\S+\.\S+$/.test(e||'');
async function send(to,m,replyTo){
  if(!ok(to))return 'skipped (no valid email)';
  const tx=nodemailer.createTransport({host:HOST.value(),port:+PORT.value(),secure:+PORT.value()===465,auth:{user:USER.value(),pass:PASS.value()}});
  await tx.sendMail({from:`"${SENDER.value().replace(/"/g,'')}" <${FROM.value()||USER.value()}>`,to,replyTo:ok(replyTo)?replyTo:undefined,subject:m.subject,html:m.html});
  return 'sent';
}
const attempt=p=>p.then(r=>r,err=>{logger.error('mail failed',err);return 'error: '+String((err&&err.message)||err).slice(0,200)});
exports.onOrder=onDocumentCreated({document:'orders/{id}',secrets:[PASS]},async e=>{
  const o=e.data.data(),id=e.params.id.slice(0,6).toUpperCase();
  const [a,c]=await Promise.all([attempt(send(ADMIN.value(),T.orderAdmin(id,o,SENDER.value()),o.e)),attempt(send(o.e,T.orderCustomer(id,o,SENDER.value()),REPLY.value()||ADMIN.value()))]);
  await e.data.ref.update({mailAdmin:a,mailCustomer:c});
});
exports.onMessage=onDocumentCreated({document:'messages/{id}',secrets:[PASS]},async e=>{
  const m=e.data.data();
  const [a,c]=await Promise.all([attempt(send(ADMIN.value(),T.messageAdmin(m,SENDER.value()),m.e)),attempt(send(m.e,T.messageCustomer(m,SENDER.value()),REPLY.value()||ADMIN.value()))]);
  await e.data.ref.update({mailAdmin:a,mailCustomer:c});
});
exports.sendTest=onCall({secrets:[PASS]},async req=>{
  if(!req.auth)throw new HttpsError('unauthenticated','Sign in to the admin first.');
  try{await send(ADMIN.value(),{subject:SENDER.value()+': test email',html:'<p>If you read this, order emails work. 🌸</p><p>Sent as <b>'+SENDER.value()+'</b>. Customers who reply will write to <b>'+(REPLY.value()||ADMIN.value())+'</b>.</p>'});return{msg:'Test email sent to '+ADMIN.value()+'. Check your inbox and spam folder.'}}
  catch(err){throw new HttpsError('internal','Email failed: '+String((err&&err.message)||err))}
});
