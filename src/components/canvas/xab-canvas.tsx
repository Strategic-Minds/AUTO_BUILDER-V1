'use client';
import { useState, useRef, useEffect } from 'react';

type CanvasTab = 'preview'|'code'|'files'|'console';

interface Artifact { id:string; type:string; title:string; html?:string; code?:string; created_at:string; }

export function XABCanvas() {
  const [tab, setTab] = useState<CanvasTab>('preview');
  const [artifact, setArtifact] = useState<Artifact|null>(null);
  const [generating, setGenerating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(()=>{
    const h=(e:Event)=>{
      const ce=e as CustomEvent;
      if(ce.detail?.type==='generation_start'){setGenerating(true);setLog([]);setTab('preview');}
      if(ce.detail?.type==='generation_log'){setLog(p=>[...p,ce.detail.message]);}
      if(ce.detail?.type==='generation_complete'){setGenerating(false);setArtifact(ce.detail.artifact);}
    };
    window.addEventListener('xab:canvas',h as EventListener);
    return ()=>window.removeEventListener('xab:canvas',h as EventListener);
  },[]);

  useEffect(()=>{
    if(artifact?.html&&iframeRef.current){
      const doc=iframeRef.current.contentDocument;
      if(doc){doc.open();doc.write(artifact.html);doc.close();}
    }
  },[artifact]);

  const prompts = ['Build a landing page','Create a logo','Design a dashboard','Build an estimator form'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'var(--color-surface-0,#000)'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',borderBottom:'1px solid var(--color-border)',background:'var(--color-surface-1)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,fontWeight:700,color:'var(--color-primary)',textTransform:'uppercase',letterSpacing:1}}>XAB CANVAS</span>
          {artifact&&<span style={{fontSize:11,color:'var(--color-muted-foreground)'}}>{artifact.title.slice(0,40)}</span>}
        </div>
        <div style={{display:'flex',gap:4}}>
          {(['preview','code','files','console'] as CanvasTab[]).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'3px 10px',borderRadius:4,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,textTransform:'capitalize',background:tab===t?'var(--color-primary)':'var(--color-surface-3)',color:tab===t?'#fff':'var(--color-muted-foreground)'}}>
              {t}
            </button>
          ))}
        </div>
        {artifact&&<button onClick={()=>{setArtifact(null);setLog([]);}} style={{background:'none',border:'1px solid var(--color-border)',borderRadius:4,padding:'3px 8px',fontSize:11,cursor:'pointer',color:'var(--color-muted-foreground)'}}>Clear</button>}
      </div>
      {/* Body */}
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>
        {generating&&(
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--color-surface-0,#000)',zIndex:10}}>
            <div style={{width:40,height:40,border:'3px solid var(--color-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
            <p style={{marginTop:12,color:'var(--color-muted-foreground)',fontSize:12}}>Generating...</p>
            <div style={{marginTop:8,maxWidth:300,width:'90%'}}>
              {log.map((l,i)=><p key={i} style={{fontSize:10,color:'var(--color-muted-foreground)',margin:'2px 0'}}>{l}</p>)}
            </div>
          </div>
        )}
        {!artifact&&!generating&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12}}>
            <div style={{fontSize:40,opacity:0.15}}>⬡</div>
            <p style={{color:'var(--color-muted-foreground)',fontSize:13}}>Canvas ready</p>
            <p style={{color:'var(--color-muted-foreground)',fontSize:11,opacity:0.6}}>Ask the AI to build something in the chat</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',maxWidth:360}}>
              {prompts.map(p=>(
                <button key={p} onClick={()=>window.dispatchEvent(new CustomEvent('xab:prompt',{detail:{text:p}}))} style={{padding:'5px 12px',borderRadius:16,border:'1px solid var(--color-border)',background:'var(--color-surface-2)',color:'var(--color-foreground)',fontSize:11,cursor:'pointer'}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {artifact&&tab==='preview'&&<iframe ref={iframeRef} style={{width:'100%',height:'100%',border:'none'}} sandbox='allow-scripts allow-same-origin' title='XAB Preview'/>}
        {artifact&&tab==='code'&&<div style={{height:'100%',overflow:'auto',padding:16}}><pre style={{fontSize:11,color:'var(--color-foreground)',whiteSpace:'pre-wrap',fontFamily:'monospace',lineHeight:1.6}}>{artifact.code||artifact.html}</pre></div>}
        {artifact&&tab==='console'&&<div style={{height:'100%',overflow:'auto',padding:16,fontFamily:'monospace',fontSize:11}}>{log.map((l,i)=><div key={i} style={{color:'var(--color-success)',marginBottom:3}}>{'>'} {l}</div>)}</div>}
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

