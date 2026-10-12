import { useState, useMemo } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  Table2, 
  Search, 
  X, 
  Tag as TagIcon, 
  ShieldCheck, 
  Activity, 
  Zap
} from 'lucide-react';
import { useDashboardContext } from '../context';
import { initialChildrenData } from '../mockData';
import TagsCard from './TagCard';
import TagTable from './TagTable';
import TagQrModal from './TagQrModal';
import TagScanSimulatorModal from './TagScanSimulatorModal';
import { type TagWithChild } from './tagUtils';
import './tags.css';

interface TagsPageProps {
  onBackToLanding?: () => void;
  onOpenActivation?: () => void;
}

type LayoutMode = 'grid' | 'table';
type SortOption = 'recent' | 'scans-desc' | 'id-asc' | 'type-asc';

export default function TagsPage({ onOpenActivation: propOpenActivation }: TagsPageProps) {
  const ctx = useDashboardContext();
  const childrenData = ctx?.childrenData || initialChildrenData;
  const onOpenActivation = propOpenActivation || ctx?.onOpenActivation;

  // Layout mode state (persists in localStorage)
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

  // Compile all tags with child metadata
  const allTagsWithChild: TagWithChild[] = useMemo(() => {
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
  }, [childrenData]);

  // Filtered & Sorted Tags
  const filteredTags = useMemo(() => {
    return allTagsWithChild
      .filter((tag) => {
        // Child filter
        if (childFilter !== 'all') {
          const matchedChild = childrenData[childFilter];
          if (matchedChild && tag.childName !== matchedChild.name) {
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
        // default recent
        return 0;
      });
  }, [allTagsWithChild, childFilter, childrenData, statusFilter, searchQuery, sortBy]);

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
      {/* -------------------------------------------------------------
          1. HEADER ROW: TITLE & ACTION
          ------------------------------------------------------------- */}
      <div className="dash-section-headline-row">
        <div>
          <h2 className="dash-section-h2">Physical Smart Tags ({allTagsWithChild.length})</h2>
          <p className="dash-card-sub">
            Dual Passive NFC & Micro QR tags assigned to your children. 100% waterproof, zero charging required.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => onOpenActivation?.()}
          title="Register or pair a new physical KiddieTag"
        >
          <Plus size={16} />
          <span>Register Another Tag</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          2. SUMMARY METRICS RIBBON (4 KPI Cards)
          ------------------------------------------------------------- */}
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

      {/* -------------------------------------------------------------
          3. CONTROLS BAR: SEARCH, CHILD FILTER, STATUS, SORT & VIEW SWITCHER
          ------------------------------------------------------------- */}
      <div className="dash-tags-controls-bar">
        {/* Left Side: Search & Child Selection */}
        <div className="dash-tags-controls-left">
          {/* Search Box */}
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

          {/* Child Filter Tabs */}
          <div className="tags-filter-pill-group">
            <button 
              type="button"
              className={`tags-filter-pill-btn ${childFilter === 'all' ? 'active' : ''}`}
              onClick={() => setChildFilter('all')}
            >
              <span>All Children</span>
              <span className="tags-filter-count-badge">{allTagsWithChild.length}</span>
            </button>

            {Object.entries(childrenData).map(([key, child]) => (
              <button 
                key={key}
                type="button"
                className={`tags-filter-pill-btn ${childFilter === key ? 'active' : ''}`}
                onClick={() => setChildFilter(key)}
              >
                <span>{child.avatar} {child.name.split(' ')[0]}</span>
                <span className="tags-filter-count-badge">{child.tags.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Status Filter, Sort By & Layout Switcher */}
        <div className="dash-tags-controls-right">
          {/* Status Filter */}
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

          {/* Sort Dropdown */}
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

          {/* Dual Layout Switcher Toggle */}
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

      {/* -------------------------------------------------------------
          4. MAIN VIEW CONTENT (GRID OR TABLE)
          ------------------------------------------------------------- */}
      {filteredTags.length === 0 ? (
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
        /* GRID LAYOUT */
        <div className="dash-cards-grid-3">
          {filteredTags.map((tag) => (
            <TagsCard 
              key={tag.id} 
              tag={tag}
              childName={tag.childName}
              childAvatar={tag.childAvatar}
              onInspectQr={(t) => setSelectedInspectTag({ ...t, childName: tag.childName, childAvatar: tag.childAvatar })}
              onSimulateScan={(t) => setSelectedSimulateTag({ ...t, childName: tag.childName, childAvatar: tag.childAvatar })}
            />
          ))}
        </div>
      ) : (
        /* LIST / TABLE LAYOUT */
        <TagTable 
          tags={filteredTags}
          onInspectQr={(t) => setSelectedInspectTag(filteredTags.find((item) => item.id === t.id) || null)}
          onSimulateScan={(t) => setSelectedSimulateTag(filteredTags.find((item) => item.id === t.id) || null)}
        />
      )}

      {/* -------------------------------------------------------------
          5. INTERACTIVE QR INSPECT MODAL
          ------------------------------------------------------------- */}
      {selectedInspectTag && (
        <TagQrModal 
          tag={selectedInspectTag}
          childName={selectedInspectTag.childName}
          childAvatar={selectedInspectTag.childAvatar}
          onClose={() => setSelectedInspectTag(null)}
          onSimulateScan={(t) => setSelectedSimulateTag({ ...t, childName: selectedInspectTag.childName, childAvatar: selectedInspectTag.childAvatar })}
        />
      )}

      {/* -------------------------------------------------------------
          6. INTERACTIVE SCAN SIMULATOR MODAL
          ------------------------------------------------------------- */}
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
