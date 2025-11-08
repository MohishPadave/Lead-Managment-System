import { getToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'In Progress' | 'Converted';
  created_at: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface Note {
  id: number;
  lead_id: number;
  content: string;
  created_at: string;
}

export interface LeadFilters {
  page?: number;
  per_page?: number;
  q?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  return response.json();
};

export const getLeads = async (filters: LeadFilters = {}): Promise<LeadsResponse> => {
  const token = getToken();
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.per_page) params.append('per_page', filters.per_page.toString());
  if (filters.q) params.append('q', filters.q);
  if (filters.status) params.append('status', filters.status);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);
  
  const response = await fetch(`${API_BASE_URL}/leads?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }

  return response.json();
};

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'In Progress' | 'Converted';
}

export const createLead = async (lead: LeadInput) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error('Failed to create lead');
  }

  return response.json();
};

export const updateLead = async (id: number, lead: LeadInput) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error('Failed to update lead');
  }

  return response.json();
};

export const deleteLead = async (id: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete lead');
  }

  return response.json();
};

export const exportLeads = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/export`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export leads');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const importLeads = async (file: File) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/leads/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to import leads');
  }

  return response.json();
};

export const getLeadNotes = async (leadId: number): Promise<{ notes: Note[] }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
};

export const addLeadNote = async (leadId: number, content: string) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to add note');
  }

  return response.json();
};

export const deleteLeadNote = async (leadId: number, noteId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }

  return response.json();
};

// Watchers
export const getWatchers = async (leadId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/watchers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch watchers');
  }

  return response.json();
};

export const addWatcher = async (leadId: number, userId?: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/watchers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to add watcher');
  }

  return response.json();
};

export const removeWatcher = async (leadId: number, userId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/watchers/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove watcher');
  }

  return response.json();
};

// Activities
export interface Activity {
  id: number;
  lead_id: number;
  user_id: number;
  user_name: string;
  action: string;
  details: any;
  created_at: string;
}

export const getActivities = async (leadId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/activities`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }

  return response.json();
};

// Notifications
export interface Notification {
  id: number;
  user_id: number;
  lead_id: number;
  lead_name?: string;
  type: string;
  message: string;
  related_id?: number;
  read: boolean;
  created_at: string;
}

export const getNotifications = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
};

export const markNotificationRead = async (notificationId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return response.json();
};

export const markAllNotificationsRead = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }

  return response.json();
};

// Read Receipts
export const markNoteRead = async (leadId: number, noteId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes/${noteId}/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark note as read');
  }

  return response.json();
};

export const getReadReceipts = async (leadId: number, noteId: number) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes/${noteId}/receipts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch read receipts');
  }

  return response.json();
};

// Users
export interface User {
  id: number;
  username: string;
  name: string;
}

export const getUsers = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};
