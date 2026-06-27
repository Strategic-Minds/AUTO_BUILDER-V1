import { NextResponse } from 'next/server';
const SITES=[
  {name:'PEP',url:'https://phoenix-epoxy-pros-site.vercel.app'},
  {name:'XPS',url:'https://xpswebsites.vercel.app'},
  {name:'NEP',url:'https://national-epoxy-pros-strategic-minds-advisory.vercel.app'},
  {name:'AUTO_BUILDER',url:'https://auto-builder-strategic-minds-advisory.vercel.app/api/health'},
  {name:'SM_QA',url:'https://sm-qa-agent.vercel.app'},
];
const SUPA_URL='https://prhppuuwcnmfdhwsagug.supabase.co';
const SUPA_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const TSID=process.env.TWILIO_ACCOUNT_SID||'';
const TAUTH=process.env.TWILIO_API_SECRET||'';
const WA_FROM=process.env.TWILIO_WA_FROM||'whatsapp:+15559730487';
const JEREMY_WA=process.env.JEREMY_WA||'whatsapp:+17722090266';

async function sendWA(b:string){
  if(!TAUTH||!TSID)return;
  await fetch('https://api.twilio.com/2010-04-01/Accounts/'+TSID+'/Messages.json',{
    method:'POST',
    headers:{Authorization:'Basic '+btoa(TSID+':'+TAUTH),'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({From:WA_FROM,To:JEREMY_WA,Body:b}).toString()
  });
}

export async function GET(){
  const results=await Promise.all(SITES.map(async s=>{
    try{const r=await fetch(s.url,{signal:AbortSignal.timeout(8000)});return{name:s.name,status:r.status,ok:r.status===200,score:r.status===200?90:40};}
    catch{return{name:s.name,status:0,ok:false,score:0};}
  }));
  const failed=results.filter(r=>!r.ok);
  const avg=Math.round(results.reduce((a,r)=>a+r.score,0)/results.length);
  if(failed.length>0)await sendWA('APEX QA ALERT - '+failed.map(f=>f.name+' DOWN').join(', ')+' - Avg: '+avg+'/100');
  if(SUPA_KEY){
    await fetch(SUPA_URL+'/rest/v1/agent_memory',{
      method:'POST',
      headers:{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({agent_id:'VALIDATOR',key:'qa_'+Date.now(),value:JSON.stringify({results,avg,failed:failed.length,src:'vercel_cron'}),importance:failed.length>0?9:4,tags:['qa','vercel_cron']})
    });
  }
  return NextResponse.json({ok:true,avg,sites:results,failed:failed.length,source:'vercel_cron'});
}
