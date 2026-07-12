'use client';
import { useEditorPanel } from '@/components/editor-panel-context';
import { useState, useEffect } from 'react';

function GenericView({title,endpoint}:{title:string;endpoint:string}) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetch(endpoint).then(r=>r.json()).then(setData).catch(()=>setData({error:'Failed to load'})).finally(()=>setLoading(false)); },[endpoint]);
  if(loading) return <div style={{padding:24,color:'var(--color-muted-foreground)'}}>Loading {title}...</div>;
  return (
    <div style={{padding:16,overflow:'auto',height:'100%'}}>
      <pre style={{fontSize:11,color:'var(--color-foreground)',whiteSpace:'pre-wrap',fontFamily:'monospace',background:'var(--color-surface-2)',padding:16,borderRadius:8,border:'1px solid var(--color-border)'}}>
        {JSON.stringify(data,null,2)}
      </pre>
    </div>
  );
}

function AgentsView() {
  const [agents, setAgents] = useState<{name:string;handle:string;system_prompt:string;status:string}[]>([]);
  useEffect(()=>{ fetch('/api/agents/xab').then(r=>r.json()).then(d=>setAgents(d.agents||d||[])).catch(()=>{}); },[]);
  const emojis: Record<string,string> = {'@xab':'⬡','@juno':'🔨','@scout':'🔍','@mira':'📊','@rex':'🚀','@aria':'💬','@kai':'✅'};
  const colors: Record<string,string> = {'@xab':'#6366f1','@juno':'#10B981','@scout':'#F59E0B','@mira':'#8B5CF6','@rex':'#EF4444','@aria':'#EC4899','@kai':'#06B6D4'};
  return (
    <div style={{padding:16,overflow:'auto',height:'100%'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        {agents.map((a,i)=>(
          <div key={i} style={{background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:12,padding:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:8,background:colors[a.handle]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{emojis[a.handle]||'🤖'}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--color-foreground)'}}>{a.name}</div>
                <div style={{fontSize:11,color:'var(--color-muted-foreground)'}}>{a.handle}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:'var(--color-muted-foreground)',lineHeight:1.5}}>{a.system_prompt?.slice(0,80)}...</div>
            <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4}}>
              <div className='status-dot online'/>
              <span style={{fontSize:10,color:'var(--color-success)'}}>active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{padding:24,overflow:'auto',height:'100%'}}>
      <h2 style={{fontSize:20,fontWeight:700,color:'var(--color-foreground)',marginBottom:4}}>XAB — Xtreme Auto Builder</h2>
      <p style={{fontSize:13,color:'var(--color-muted-foreground)',marginBottom:24}}>Autonomous App & System Factory</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:24}}>
        {[['⬡','Swarm Command','swarm'],['✅','Validation','validation'],['📊','Scoring','score'],['🔭','Discovery','discovery'],['🤖','Agents','agents'],['🧠','Memory','memory'],['🌐','Browser Agent','browser'],['🔌','Connectors','connectors'],['📈','Lead Pipeline','leads'],['💬','WhatsApp','whatsapp'],['👁','Sentinel','sentinel'],['🔄','Evolution','evolution']].map(([icon,label,view])=>(
          <div key={label} style={{background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:12,padding:16,cursor:'pointer'}} onClick={()=>window.dispatchEvent(new CustomEvent('xab:open-panel',{detail:{view,title:label}}))}>
            <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:12,fontWeight:600,color:'var(--color-foreground)'}}>{label as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const VIEW_MAP: Record<string,()=>React.ReactElement> = {
  agents: ()=><AgentsView/>,
  memory: ()=><GenericView title='Memory' endpoint='/api/memory'/>,
  browser: ()=><GenericView title='Browser Agent' endpoint='/api/browser-agent/sessions'/>,
  connectors: ()=><GenericView title='Connectors' endpoint='/api/connectors'/>,
  validation: ()=><GenericView title='Validation' endpoint='/api/validation'/>,
  swarm: ()=><GenericView title='Swarm' endpoint='/api/swarm/agents'/>,
  sentinel: ()=><GenericView title='Sentinel' endpoint='/api/sentinel'/>,
  evolution: ()=><GenericView title='Evolution' endpoint='/api/evolution'/>,
  missions: ()=><GenericView title='Missions' endpoint='/api/swarm/queue'/>,
  leads: ()=><GenericView title='Leads' endpoint='/api/xps/leads'/>,
  whatsapp: ()=><GenericView title='WhatsApp' endpoint='/api/whatsapp/status'/>,
  mcp: ()=><GenericView title='MCP Tools' endpoint='/api/mcp-minimal/mcp'/>,
  score: ()=><GenericView title='Score' endpoint='/api/validation'/>,
  discovery: ()=><GenericView title='Discovery' endpoint='/api/discovery'/>,
};

import React from 'react';
export function XABEditorPanel() {
  const { panel, closePanel } = useEditorPanel();

  useEffect(()=>{
    const h=(e:Event)=>{ const ce=e as CustomEvent; if(ce.detail?.view) {} };
    window.addEventListener('xab:open-panel',h);
    return ()=>window.removeEventListener('xab:open-panel',h);
  },[]);

  if(!panel.view) return <Dashboard/>;

  const ViewComponent = VIEW_MAP[panel.view];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',borderBottom:'1px solid var(--color-border)',background:'var(--color-surface-2)',flexShrink:0}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'var(--color-foreground)'}}>{panel.title}</div>
          {panel.subtitle&&<div style={{fontSize:11,color:'var(--color-muted-foreground)'}}>{panel.subtitle}</div>}
        </div>
        <button onClick={closePanel} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--color-muted-foreground)',padding:'4px 8px'}}>✕</button>
      </div>
      <div style={{flex:1,overflow:'hidden'}}>
        {ViewComponent ? <ViewComponent/> : <GenericView title={panel.title} endpoint={}/>}
      </div>
    </div>
  );
}

