export interface Tag {
  id: string;
  type: string;
  color: string;
  status: 'Active' | 'Inactive' | 'Pending';
  scans: number;
  lastScan: string;
  location: string;
}

export interface ApiTag {
  id: number;
  tagCode: string;
  isActive: boolean;
  childId: number | null;
  child: {
    id: number;
    name: string;
    medicalInfo: string | null;
    allergies: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  priority: string;
  status: 'Verified' | 'Pending' | 'Active';
}

export interface ScanHistoryRecord {
  id: number;
  location: string;
  time: string;
  scanner: string;
  action: string;
  resolved: boolean;
  coords: string;
}

export interface ChildProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  avatar: string;
  tags: Tag[];
  contacts: EmergencyContact[];
  scanHistory: ScanHistoryRecord[];
}

export interface User {
  id?: number | string;
  userName: string;
  email?: string;
  name?: string;
  role?: string;
  accountId?: number;
  account_id?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
