import { NextResponse } from 'next/server';
const MCP='https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended';
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
  const ts=new Date().toISOString();
  try{
    const r=await fetch(MCP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'swarm_intelligence_sweep',arguments:{pack:'master',priority:'high',targets:105,triggered_by:'vercel_cron_sunday'}}})});
    const d=await r.json();
    const result=d?.result?.content?.[0]?.text||'dispatched';
    await sendWA('SUNDAY MASTER SWARM - 105 targets dispatched - '+ts.split('T')[0]+' - Intel ready in 30min');
    return NextResponse.json({ok:true,ts,targets:105,result,source:'vercel_cron_sunday'});
  }catch(e){return NextResponse.json({ok:false,error:String(e)});}
}
