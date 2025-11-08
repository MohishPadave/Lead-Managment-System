'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLeads, createLead, updateLead, deleteLead, exportLeads, importLeads, getLeadNotes, addLeadNote, deleteLeadNote, Lead, Note } from '@/app/lib/api';
import { isAuthenticated, removeToken } from '@/app/lib/auth';
import { createToast, Toast as ToastType } from '@/app/lib/toast';
import Toast from '@/app/components/Toast';
import LeadModal from '@/app/components/LeadModal';
import NotesModal from '@/app/components/NotesModal';
import LeadsTable from '@/app/components/LeadsTable';
import SearchFilters from '@/app/components/SearchFilters';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchLeads();
  }, [page, searchQuery, statusFilter, sortBy, sortDir]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = createToast(message, type);
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchLeads = async () => {
    try {
      const data = await getLeads({
        page,
        per_page: 10,
        q: searchQuery,
        status: statusFilter,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setLeads(data.leads);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      showToast('Failed to fetch leads', 'error');
      removeToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const handleSubmit = async (formData: { name: string; email: string; phone: string; status: 'New' | 'In Progress' | 'Converted' }) => {
    const tempId = Date.now();
    const optimisticLead: Lead = {
      id: tempId,
      ...formData,
      created_at: new Date().toISOString(),
    };

    if (editingLead) {
      setLeads(prev => prev.map(l => l.id === editingLead.id ? { ...optimisticLead, id: editingLead.id } : l));
    } else {
      setLeads(prev => [optimisticLead, ...prev]);
    }

    setShowModal(false);
    setEditingLead(null);

    try {
      if (editingLead) {
        await updateLead(editingLead.id, formData);
        showToast('Lead updated successfully', 'success');
      } else {
        await createLead(formData);
        showToast('Lead created successfully', 'success');
      }
      fetchLeads();
    } catch (error) {
      showToast('Failed to save lead', 'error');
      fetchLeads();
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setLeads(prev => prev.filter(l => l.id !== id));
      
      try {
        await deleteLead(id);
        showToast('Lead deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete lead', 'error');
        fetchLeads();
      }
    }
  };

  const openAddModal = () => {
    setEditingLead(null);
    setShowModal(true);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleExport = async () => {
    try {
      await exportLeads();
      showToast('Leads exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export leads', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importLeads(file);
      showToast(result.message, 'success');
      fetchLeads();
    } catch (error) {
      showToast('Failed to import leads', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openNotesModal = async (lead: Lead) => {
    setSelectedLead(lead);
    setShowNotesModal(true);
    try {
      const data = await getLeadNotes(lead.id);
      setNotes(data.notes);
    } catch (error) {
      showToast('Failed to fetch notes', 'error');
    }
  };

  const handleAddNote = async (content: string) => {
    if (!selectedLead) return;

    try {
      await addLeadNote(selectedLead.id, content);
      const data = await getLeadNotes(selectedLead.id);
      setNotes(data.notes);
      showToast('Note added successfully', 'success');
    } catch (error) {
      showToast('Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!selectedLead) return;

    try {
      await deleteLeadNote(selectedLead.id, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete note', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lead Management</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{total} total leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setPage={setPage}
          onAddLead={openAddModal}
          onExport={handleExport}
          onImport={handleImport}
          fileInputRef={fileInputRef}
        />

        <LeadsTable
          leads={leads}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenNotes={openNotesModal}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <LeadModal
          lead={editingLead}
          onClose={() => {
            setShowModal(false);
            setEditingLead(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showNotesModal && selectedLead && (
        <NotesModal
          lead={selectedLead}
          notes={notes}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedLead(null);
            setNotes([]);
          }}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
