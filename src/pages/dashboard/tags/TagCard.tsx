import { QrCode, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { ApiTag } from '../../../types';

interface TagsCardProps {
  tag: ApiTag;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}

export default function TagsCard({ tag, onDelete, onToggleActive }: TagsCardProps) {
  const childName = tag.child ? tag.child.name : 'Not assigned';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 16,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: '#f5f3ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QrCode size={30} style={{ color: 'var(--brand-purple, #6366f1)' }} />
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: tag.isActive ? '#ecfdf5' : '#f1f5f9',
          color: tag.isActive ? '#059669' : '#64748b'
        }}>
          {tag.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Assigned Child</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{childName}</h3>
        <div style={{ fontSize: 14, color: '#475569' }}>
          Tag Code: <strong style={{ color: 'var(--brand-purple, #6366f1)', letterSpacing: 0.5 }}>{tag.tagCode}</strong>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
          Added on {new Date(tag.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTop: '1px solid #f1f5f9'
      }}>
        <button
          onClick={() => onToggleActive(tag.id, !tag.isActive)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: tag.isActive ? '#059669' : '#64748b'
          }}
          title={tag.isActive ? 'Deactivate tag' : 'Activate tag'}
        >
          {tag.isActive ? <ToggleRight size={22} color="#059669" /> : <ToggleLeft size={22} color="#94a3b8" />}
          <span>{tag.isActive ? 'Active' : 'Paused'}</span>
        </button>

        <button
          onClick={() => onDelete(tag.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: '#ef4444'
          }}
          title="Delete tag"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
