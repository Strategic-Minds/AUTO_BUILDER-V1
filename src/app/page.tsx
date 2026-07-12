import { XABSidebar } from '@/components/xab-sidebar';
import { XABChatPanel } from '@/components/xab-chat-panel';
import { XABEditorPanel } from '@/components/xab-editor-panel';

export default function HomePage() {
  return (
    <div className='xab-shell'>
      <XABSidebar />
      <XABChatPanel />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'var(--color-surface-1)'}}>
        <XABEditorPanel />
      </div>
    </div>
  );
}

