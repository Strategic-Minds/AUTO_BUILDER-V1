'use client';
import { useEditorPanel, PanelView } from '@/components/editor-panel-context';
import { useTheme } from '@/components/theme-provider';

const navSections = [
  { section: 'OVERVIEW', items: [
    { icon: '⬡', label: 'Dashboard', view: null as PanelView },
    { icon: '💬', label: 'AI Chat', view: null as PanelView },
  ]},
  { section: 'INTELLIGENCE', items: [
    { icon: '🔍', label: 'Research', view: 'research' as PanelView },
    { icon: '🌐', label: 'Browser Agent', view: 'browser' as PanelView },
    { icon: '📚', label: 'Knowledge', view: 'docs' as PanelView },
    { icon: '🧠', label: 'Memory', view: 'memory' as PanelView },
  ]},
  { section: 'BUILD', items: [
    { icon: '🔨', label: 'Builder', view: 'builder' as PanelView },
    { icon: '🌐', label: 'Website Factory', view: 'builder' as PanelView },
    { icon: '⚙️', label: 'Workflow Factory', view: 'queue' as PanelView },
    { icon: '🤖', label: 'Agent Factory', view: 'agents' as PanelView },
  ]},
  { section: 'SWARM OS', items: [
    { icon: '🐝', label: 'Swarm Command', view: 'swarm' as PanelView },
    { icon: '📋', label: 'Mission Queue', view: 'missions' as PanelView },
    { icon: '📦', label: 'Sandbox', view: 'sandbox' as PanelView },
    { icon: '🚫', label: 'Quarantine', view: 'quarantine' as PanelView },
    { icon: '📖', label: 'Playbooks', view: 'playbooks' as PanelView },
  ]},
  { section: 'VALIDATION', items: [
    { icon: '✅', label: 'Validation', view: 'validation' as PanelView },
    { icon: '🔭', label: 'Discovery', view: 'discovery' as PanelView },
    { icon: '📊', label: 'Scoring', view: 'score' as PanelView },
    { icon: '🔧', label: 'Auto Fix', view: 'auto-fix' as PanelView },
  ]},
  { section: 'XPS', items: [
    { icon: '📈', label: 'Lead Pipeline', view: 'leads' as PanelView },
    { icon: '🏆', label: 'Competitors', view: 'research' as PanelView },
    { icon: '🔎', label: 'SEO Pages', view: 'analytics' as PanelView },
  ]},
  { section: 'SYSTEM', items: [
    { icon: '👁', label: 'Sentinel', view: 'sentinel' as PanelView },
    { icon: '🔄', label: 'Evolution', view: 'evolution' as PanelView },
    { icon: '🔌', label: 'Connectors', view: 'connectors' as PanelView },
    { icon: '💬', label: 'WhatsApp', view: 'whatsapp' as PanelView },
    { icon: '🛠', label: 'MCP Tools', view: 'mcp' as PanelView },
    { icon: '✔️', label: 'Approvals', view: 'approvals' as PanelView },
    { icon: '⚙️', label: 'Admin', view: 'admin' as PanelView },
  ]},
];

export function XABSidebar() {
  const { panel, openPanel } = useEditorPanel();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{
      width: 216, flexShrink: 0, height: '100vh', overflow: 'hidden auto',
      background: 'var(--color-sidebar)', borderRight: '1px solid var(--color-sidebar-border)',
      display: 'flex', flexDirection: 'column', userSelect: 'none'
    }}>
      {/* Logo */}
      <div style={{padding:'16px 12px 12px',borderBottom:'1px solid var(--color-border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:6,background:'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff',fontWeight:700}}>⬡</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--color-foreground)'}}>XAB</div>
            <div style={{fontSize:10,color:'var(--color-muted-foreground)'}}>v3.0 · Auto Builder</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{flex:1,overflow:'auto',padding:'8px 8px'}}>
        {navSections.map(({section,items}) => (
          <div key={section} style={{marginBottom:4}}>
            <div style={{fontSize:10,fontWeight:600,color:'var(--color-muted-foreground)',padding:'8px 8px 4px',letterSpacing:1,textTransform:'uppercase'}}>{section}</div>
            {items.map(({icon,label,view}) => (
              <div key={label}
                className={'nav-item' + (panel.view===view && view!==null?' active':'')}
                onClick={()=>view ? openPanel(view,label) : null}
                style={{marginBottom:1}}
              >
                <span style={{fontSize:13}}>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{padding:'8px 12px',borderTop:'1px solid var(--color-border)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div className='status-dot online'/>
            <span style={{fontSize:11,color:'var(--color-muted-foreground)'}}>XPS AI online</span>
          </div>
          <button onClick={toggleTheme} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,color:'var(--color-muted-foreground)'}}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
        </div>
      </div>
    </div>
  );
}

