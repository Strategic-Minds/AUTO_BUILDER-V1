'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PanelView = 'swarm'|'sandbox'|'quarantine'|'validation'|'discovery'|'docs'|'playbooks'|'deploy'|'score'|'builder'|'queue'|'approvals'|'sentinel'|'evolution'|'mcp'|'auto-fix'|'missions'|'templates'|'agents'|'memory'|'browser'|'connectors'|'leads'|'research'|'whatsapp'|'analytics'|'admin'|null;

export interface EditorPanelState { view: PanelView; title: string; subtitle?: string; props?: Record<string,unknown>; }

interface EditorPanelContextType {
  panel: EditorPanelState;
  openPanel: (view: PanelView, title: string, subtitle?: string, props?: Record<string,unknown>) => void;
  closePanel: () => void;
  isOpen: boolean;
}

const EditorPanelContext = createContext<EditorPanelContextType>({
  panel:{view:null,title:''}, openPanel:()=>{}, closePanel:()=>{}, isOpen:false
});

export function EditorPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<EditorPanelState>({ view: null, title: '' });
  const openPanel = useCallback((view: PanelView, title: string, subtitle?: string, props?: Record<string,unknown>) => {
    setPanel({view,title,subtitle,props});
  }, []);
  const closePanel = useCallback(() => setPanel({view:null,title:''}), []);
  return (
    <EditorPanelContext.Provider value={{panel,openPanel,closePanel,isOpen:panel.view!==null}}>
      {children}
    </EditorPanelContext.Provider>
  );
}
export const useEditorPanel = () => useContext(EditorPanelContext);

