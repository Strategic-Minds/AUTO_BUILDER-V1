'use client';
import { useState, useRef, useEffect } from 'react';
import { useEditorPanel } from '@/components/editor-panel-context';

const AGENTS = [
  {handle:'@xab',name:'XAB',emoji:'⬡',color:'#6366f1'},
  {handle:'@juno',name:'Juno',emoji:'🔨',color:'#10B981'},
  {handle:'@scout',name:'Scout',emoji:'🔍',color:'#F59E0B'},
  {handle:'@mira',name:'Mira',emoji:'📊',color:'#8B5CF6'},
  {handle:'@rex',name:'Rex',emoji:'🚀',color:'#EF4444'},
  {handle:'@aria',name:'Aria',emoji:'💬',color:'#EC4899'},
  {handle:'@kai',name:'Kai',emoji:'✅',color:'#06B6D4'},
];

const CODE_REGEX = /```[\s\S]*?```|<html[\s\S]*?<\/html>/gi;

export function XABChatPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role:string;content:string;agent?:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState(AGENTS[0]);
  const [showAgents, setShowAgents] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { openPanel } = useEditorPanel();

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  useEffect(()=>{
    const h = (e:Event) => {
      const ce = e as CustomEvent;
      if(ce.detail?.text) send(ce.detail.text);
    };
    window.addEventListener('xab:prompt', h);
    return ()=>window.removeEventListener('xab:prompt', h);
  },[]);

  const detectIntent = (text:string) => {
    if(/swarm|agent team/i.test(text)) openPanel('swarm','Swarm Command');
    else if(/validat|score|test/i.test(text)) openPanel('validation','Validation Matrix');
    else if(/deploy|vercel|github/i.test(text)) openPanel('deploy','Deploy Status');
    else if(/playbook/i.test(text)) openPanel('playbooks','Playbooks');
    else if(/mission|queue|job/i.test(text)) openPanel('missions','Mission Queue');
    else if(/memory|remember/i.test(text)) openPanel('memory','Memory System');
    else if(/connector|github|gmail|drive/i.test(text)) openPanel('connectors','Connectors');
    else if(/lead|xps|client/i.test(text)) openPanel('leads','Lead Pipeline');
    else if(/browser|scrape|crawl/i.test(text)) openPanel('browser','Browser Agent');
  };

  const cleanForChat = (text:string) => {
    const hasCode = CODE_REGEX.test(text);
    CODE_REGEX.lastIndex = 0;
    if(hasCode) {
      const cleaned = text.replace(CODE_REGEX, '').trim();
      window.dispatchEvent(new CustomEvent('xab:canvas',{detail:{type:'generation_complete',artifact:{id:Date.now().toString(),type:'component',title:'Generated',html:text.match(CODE_REGEX)?.[0]||'',code:text,created_at:new Date().toISOString()}}}));
      return (cleaned||'Done!') + '\n\n_→ Generated · see canvas ↗_';
    }
    return text;
  };

  const send = async (msg?: string) => {
    const text = (msg || input).trim();
    if(!text || loading) return;
    setInput('');
    const userMsg = {role:'user',content:text,agent:agent.handle};
    setMessages(p=>[...p,userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/agents/message',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:text,agent_handle:agent.handle,history:messages.slice(-10)})
      });
      const data = await res.json();
      const raw = data.response || data.message || 'No response.';
      const clean = cleanForChat(raw);
      setMessages(p=>[...p,{role:'assistant',content:clean,agent:agent.handle}]);
      detectIntent(raw);
    } catch(e) {
      setMessages(p=>[...p,{role:'assistant',content:'Connection error. Check API.',agent:agent.handle}]);
    }
    setLoading(false);
  };

  const quickActions = [
    {label:'🌐 Website', prompt:'Build a modern landing page'},
    {label:'📱 App', prompt:'Build a dashboard app'},
    {label:'🎨 Logo', prompt:'Create a professional logo'},
    {label:'📋 Form', prompt:'Build a lead capture form'},
    {label:'📊 Chart', prompt:'Build an analytics dashboard'},
  ];

  return (
    <div style={{width:380,flexShrink:0,height:'100vh',display:'flex',flexDirection:'column',background:'var(--color-surface-1)',borderRight:'1px solid var(--color-border)'}}>
      {/* Header */}
      <div style={{padding:'8px 12px',borderBottom:'1px solid var(--color-border)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,position:'relative'}}>
            <button onClick={()=>setShowAgents(!showAgents)} style={{display:'flex',alignItems:'center',gap:6,background:'var(--color-surface-3)',border:'1px solid var(--color-border)',borderRadius:8,padding:'4px 10px',cursor:'pointer',color:'var(--color-foreground)'}}>
              <span style={{fontSize:16}}>{agent.emoji}</span>
              <span style={{fontSize:12,fontWeight:600}}>{agent.name}</span>
              <span style={{fontSize:10,color:'var(--color-muted-foreground)'}}>▾</span>
            </button>
            {showAgents && (
              <div style={{position:'absolute',top:'100%',left:0,zIndex:100,background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:8,padding:4,minWidth:160,marginTop:4}}>
                {AGENTS.map(a=>(
                  <div key={a.handle} onClick={()=>{setAgent(a);setShowAgents(false);}} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:6,cursor:'pointer',fontSize:13,background:agent.handle===a.handle?'var(--color-surface-4)':'transparent',color:'var(--color-foreground)'}}>
                    <span>{a.emoji}</span><span>{a.name}</span>
                    <div className='status-dot online' style={{marginLeft:'auto'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span style={{fontSize:10,color:'var(--color-muted-foreground)'}}>{agent.handle}</span>
        </div>
        {/* Quick actions */}
        <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
          {quickActions.map(q=>(
            <button key={q.label} onClick={()=>send(q.prompt)} style={{fontSize:10,padding:'3px 8px',borderRadius:12,border:'1px solid var(--color-border)',background:'var(--color-surface-2)',color:'var(--color-foreground)',cursor:'pointer'}}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflow:'auto',padding:'12px 12px'}}>
        {messages.length===0 && (
          <div style={{textAlign:'center',paddingTop:40,color:'var(--color-muted-foreground)'}}>
            <div style={{fontSize:32,marginBottom:8}}>{agent.emoji}</div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{agent.name}</div>
            <div style={{fontSize:11}}>How can I help you today?</div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:12,flexDirection:m.role==='user'?'row-reverse':'row'}}>
            <div style={{width:24,height:24,borderRadius:6,background:m.role==='user'?'var(--color-primary)':'var(--color-surface-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0}}>
              {m.role==='user'?'J':AGENTS.find(a=>a.handle===m.agent)?.emoji||'⬡'}
            </div>
            <div style={{maxWidth:'75%',background:m.role==='user'?'rgba(99,102,241,0.15)':'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:10,padding:'8px 12px',fontSize:12,lineHeight:1.6,color:'var(--color-foreground)'}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <div style={{width:24,height:24,borderRadius:6,background:'var(--color-surface-4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>{agent.emoji}</div>
            <div style={{background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:10,padding:'8px 12px',fontSize:12,color:'var(--color-muted-foreground)'}}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'8px 12px',borderTop:'1px solid var(--color-border)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder='Ask me anything...'
            rows={2}
            style={{flex:1,resize:'none',background:'var(--color-surface-2)',border:'1px solid var(--color-border)',borderRadius:8,padding:'8px 10px',fontSize:12,color:'var(--color-foreground)',fontFamily:'inherit',outline:'none'}}
          />
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{background:'var(--color-primary)',color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0,opacity:(!input.trim()||loading)?0.5:1}}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

