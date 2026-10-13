import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  Table2, 
  Search, 
  X, 
  Tag as TagIcon, 
  ShieldCheck, 
  Activity, 
  Zap,
  Loader2
} from 'lucide-react';
import { useDashboardContext } from '../context';
import { initialChildrenData } from '../mockData';
import TagsCard from './TagCard';
import TagTable from './TagTable';
import TagQrModal from './TagQrModal';
import TagScanSimulatorModal from './TagScanSimulatorModal';
import { type TagWithChild } from './tagUtils';
import { useAuth } from '../../../context/AuthContext';
import { useTags } from '../../../hooks/useTags';
import { useChildren } from '../../../hooks/useChildren';
import './tags.css';

type LayoutMode = 'grid' | 'table';
type SortOption = 'recent' | 'scans-desc' | 'id-asc' | 'type-asc';

interface TagsPageProps {
  onBackToLanding?: () => void;
  onOpenActivation?: () => void;
}

export default function TagsPage({ onOpenActivation: propOpenActivation }: TagsPageProps) {
  const ctx = useDashboardContext();
  const childrenData = ctx?.childrenData || initialChildrenData;
  const onOpenActivation = propOpenActivation || ctx?.onOpenActivation;

  // Custom Hooks
  const { isAuthenticated } = useAuth();
  const { tags: apiTags, loading, error, createTag, updateTag, deleteTag } = useTags();
  const { children, createChild } = useChildren();

  // Local Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [tagCode, setTagCode] = useState('');
  const [childId, setChildId] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [adding, setAdding] = useState(false);

  // Default selected child
  useEffect(() => {
    if (children.length > 0 && !childId) {
      setChildId(String(children[0].id));
    } else if (children.length === 0 && !childId) {
      setChildId('__new__');
    }
  }, [children, childId]);

  // Add tag handler using custom hook
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCode) return;

    setAdding(true);
    try {
      let targetChildId = childId;

      // If user chose to create a new child or has no children
      if ((targetChildId === '__new__' || !targetChildId) && newChildName.trim()) {
        const createdChild = await createChild(newChildName.trim());
        if (createdChild?.id) {
          targetChildId = String(createdChild.id);
        } else {
          alert('Failed to create child');
          setAdding(false);
          return;
        }
      }

      if (!targetChildId || targetChildId === '__new__') {
        alert('Please select a child or enter a new child name');
        setAdding(false);
        return;
      }

      await createTag(tagCode, Number(targetChildId));
      setShowAddForm(false);
      setTagCode('');
      setNewChildName('');
    } catch (err: any) {
      alert(err.message || 'Failed to add tag');
    } finally {
      setAdding(false);
    }
  };

  // Delete tag handler using custom hook
  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await deleteTag(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete tag');
    }
  };

  // Toggle active tag handler using custom hook
  const handleToggleActive = async (id: number | string, isActive: boolean) => {
    try {
      await updateTag(id, { isActive });
    } catch (err: any) {
      alert(err.message || 'Failed to update tag');
    }
  };

  // Layout mode state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem('kidditag_tags_layout_mode');
      return saved === 'table' ? 'table' : 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleSetLayoutMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    try {
      localStorage.setItem('kidditag_tags_layout_mode', mode);
    } catch {
      // ignore
    }
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Modals state
  const [selectedInspectTag, setSelectedInspectTag] = useState<TagWithChild | null>(null);
  const [selectedSimulateTag, setSelectedSimulateTag] = useState<TagWithChild | null>(null);

  // Compile all tags with child metadata (prefer real API tags when authenticated, fallback to mock only if guest)
  const allTagsWithChild: (TagWithChild & { apiId?: number })[] = useMemo(() => {
    if (isAuthenticated) {
      return apiTags.map((tag) => ({
        id: tag.tagCode,
        apiId: tag.id,
        type: 'Smart Safety Tag',
        color: 'Electric Purple',
        status: tag.isActive ? 'Active' : 'Inactive',
        scans: 0,
        lastScan: new Date(tag.createdAt).toLocaleDateString(),
        location: 'Safe Zone',
        childName: tag.child?.name || 'Child',
        childAvatar: '👧',
      }));
    }

    const list: TagWithChild[] = [];
    Object.values(childrenData).forEach((child) => {
      child.tags.forEach((tag) => {
        list.push({
          ...tag,
          childName: child.name,
          childAvatar: child.avatar,
        });
      });
    });
    return list;
  }, [apiTags, childrenData, isAuthenticated]);

  // Filtered & Sorted Tags
  const filteredTags = useMemo(() => {
    return allTagsWithChild
      .filter((tag) => {
        // Child filter
        if (childFilter !== 'all') {
          if (tag.childName.toLowerCase() !== childFilter.toLowerCase()) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'all' && tag.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = tag.id.toLowerCase().includes(q);
          const matchesType = tag.type.toLowerCase().includes(q);
          const matchesColor = tag.color.toLowerCase().includes(q);
          const matchesLocation = (tag.location || '').toLowerCase().includes(q);
          const matchesChild = tag.childName.toLowerCase().includes(q);
          if (!matchesId && !matchesType && !matchesColor && !matchesLocation && !matchesChild) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'scans-desc') {
          return b.scans - a.scans;
        }
        if (sortBy === 'id-asc') {
          return a.id.localeCompare(b.id);
        }
        if (sortBy === 'type-asc') {
          return a.type.localeCompare(b.type);
        }
        return 0;
      });
  }, [allTagsWithChild, childFilter, statusFilter, searchQuery, sortBy]);

  // Overall metric statistics
  const totalTagsCount = allTagsWithChild.length;
  const activeTagsCount = allTagsWithChild.filter((t) => t.status === 'Active').length;
  const totalScansCount = allTagsWithChild.reduce((acc, t) => acc + (t.scans || 0), 0);

  const resetFilters = () => {
    setSearchQuery('');
    setChildFilter('all');
    setStatusFilter('all');
    setSortBy('recent');
  };

  return (
    <div className="dash-view-container">
      {/* 1. HEADER ROW: TITLE & ACTION */}
      <div className="dash-section-headline-row">
        <div>
          <h2 className="dash-section-h2">Physical Smart Tags ({allTagsWithChild.length})</h2>
          <p className="dash-card-sub">
            Dual Passive NFC & Micro QR tags assigned to your children. 100% waterproof, zero charging required.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddForm(prev => !prev)}
          title="Register or pair a new physical KiddieTag"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Close Form' : 'Register Another Tag'}</span>
        </button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

      {/* ADD TAG FORM */}
      {showAddForm && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 24,
          marginBottom: 28,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            Register & Assign New Smart Tag
          </h3>
          <form onSubmit={handleAddTag} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#475569' }}>
                Tag Code (Serial / Barcode)
              </label>
              <input
                className="input-field"
                placeholder="e.g. KT-9902"
                value={tagCode}
                onChange={e => setTagCode(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
            </div>
            
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#475569' }}>
                Assign to Child
              </label>
              {children.length > 0 ? (
                <>
                  <select
                    value={childId}
                    onChange={e => setChildId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#1e293b',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Register New Child...</option>
                  </select>

                  {childId === '__new__' && (
                    <input
                      placeholder="Enter new child name"
                      value={newChildName}
                      onChange={e => setNewChildName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        marginTop: 8
                      }}
                    />
                  )}
                </>
              ) : (
                <input
                  placeholder="Enter child name (e.g. Maya)"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={adding}
                style={{ height: 42, padding: '0 20px', borderRadius: 8 }}
              >
                {adding ? 'Saving...' : 'Save Tag'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
                style={{ height: 42, padding: '0 18px', borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. SUMMARY METRICS RIBBON (4 KPI Cards) */}
      <div className="dash-tags-summary-ribbon">
        <div className="tags-summary-card">
          <div className="tags-summary-icon-box purple">
            <TagIcon size={22} />
          </div>
          <div className="tags-summary-meta">
            <span className="tags-summary-value">{totalTagsCount}</span>
            <span className="tags-summary-label">Total Smart Tags</span>
          </div>
        </div>

        <div className="tags-summary-card">
          <div className="tags-summary-icon-box green">
            <ShieldCheck size={22} />
          </div>
          <div className="tags-summary-meta">
            <span className="tags-summary-value">{activeTagsCount} Active</span>
            <span className="tags-summary-label">100% Protected Status</span>
          </div>
        </div>

        <div className="tags-summary-card">
          <div className="tags-summary-icon-box blue">
            <Activity size={22} />
          </div>
          <div className="tags-summary-meta">
            <span className="tags-summary-value">{totalScansCount}</span>
            <span className="tags-summary-label">Total Scans Recorded</span>
          </div>
        </div>

        <div className="tags-summary-card">
          <div className="tags-summary-icon-box amber">
            <Zap size={22} />
          </div>
          <div className="tags-summary-meta">
            <span className="tags-summary-value">Passive NFC</span>
            <span className="tags-summary-label">Zero Battery Required</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH, CHILD FILTER, STATUS, SORT & VIEW SWITCHER */}
      <div className="dash-tags-controls-bar">
        {/* Left Side: Search & Child Selection */}
        <div className="dash-tags-controls-left">
          <div className="tags-search-input-wrapper">
            <Search size={16} className="tags-search-icon" />
            <input 
              type="text"
              className="tags-search-input"
              placeholder="Search by code, type, color, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="tags-search-clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="tags-filter-pill-group">
            <button 
              type="button"
              className={`tags-filter-pill-btn ${childFilter === 'all' ? 'active' : ''}`}
              onClick={() => setChildFilter('all')}
            >
              <span>All Children</span>
              <span className="tags-filter-count-badge">{allTagsWithChild.length}</span>
            </button>

            {children.map(c => (
              <button 
                key={c.id}
                type="button"
                className={`tags-filter-pill-btn ${childFilter.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => setChildFilter(c.name)}
              >
                <span>👧 {c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Status Filter, Sort By & Layout Switcher */}
        <div className="dash-tags-controls-right">
          <div className="tags-select-wrapper">
            <select 
              className="tags-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by tag status"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="tags-select-wrapper">
            <select 
              className="tags-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort tags"
            >
              <option value="recent">Latest Activity</option>
              <option value="scans-desc">Most Scans</option>
              <option value="id-asc">Tag ID (A-Z)</option>
              <option value="type-asc">Tag Type (A-Z)</option>
            </select>
          </div>

          <div className="tags-layout-switcher" role="radiogroup" aria-label="Layout view mode">
            <button 
              type="button"
              role="radio"
              aria-checked={layoutMode === 'grid'}
              className={`tags-layout-btn ${layoutMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleSetLayoutMode('grid')}
              title="Grid Card Layout"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>

            <button 
              type="button"
              role="radio"
              aria-checked={layoutMode === 'table'}
              className={`tags-layout-btn ${layoutMode === 'table' ? 'active' : ''}`}
              onClick={() => handleSetLayoutMode('table')}
              title="List & Table Layout"
            >
              <Table2 size={15} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT (GRID OR TABLE) */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--brand-purple)' }} />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="tags-empty-state">
          <div className="tags-empty-icon-wrap">
            <TagIcon size={28} />
          </div>
          <h3 className="tags-empty-title">No Smart Tags Found</h3>
          <p className="tags-empty-sub">
            {searchQuery 
              ? `No tags matched your search term "${searchQuery}". Try searching for tag ID or color.` 
              : 'No tags matched your current filters.'}
          </p>
          <button className="btn-secondary" onClick={resetFilters}>
            Reset Search & Filters
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="dash-cards-grid-3">
          {filteredTags.map((tag) => (
            <TagsCard 
              key={tag.id} 
              tag={tag}
              childName={tag.childName}
              childAvatar={tag.childAvatar}
              onInspectQr={(t) => setSelectedInspectTag({ ...t, childName: tag.childName, childAvatar: tag.childAvatar })}
              onSimulateScan={(t) => setSelectedSimulateTag({ ...t, childName: tag.childName, childAvatar: tag.childAvatar })}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <TagTable 
          tags={filteredTags}
          onInspectQr={(t) => setSelectedInspectTag(filteredTags.find((item) => item.id === t.id) || null)}
          onSimulateScan={(t) => setSelectedSimulateTag(filteredTags.find((item) => item.id === t.id) || null)}
        />
      )}

      {/* 5. INTERACTIVE QR INSPECT MODAL */}
      {selectedInspectTag && (
        <TagQrModal 
          tag={selectedInspectTag}
          childName={selectedInspectTag.childName}
          childAvatar={selectedInspectTag.childAvatar}
          onClose={() => setSelectedInspectTag(null)}
          onSimulateScan={(t) => setSelectedSimulateTag({ ...t, childName: selectedInspectTag.childName, childAvatar: selectedInspectTag.childAvatar })}
        />
      )}

      {/* 6. INTERACTIVE SCAN SIMULATOR MODAL */}
      {selectedSimulateTag && (
        <TagScanSimulatorModal 
          tag={selectedSimulateTag}
          childName={selectedSimulateTag.childName}
          childAvatar={selectedSimulateTag.childAvatar}
          onClose={() => setSelectedSimulateTag(null)}
        />
      )}
    </div>
  );
}
