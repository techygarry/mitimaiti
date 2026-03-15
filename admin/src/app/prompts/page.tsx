'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/cn';
import { format } from 'date-fns';
import {
  Loader2,
  RefreshCw,
  Plus,
  Sparkles,
  Calendar,
  Tag,
  Edit3,
  Trash2,
  Check,
  X,
  AlertCircle,
  Inbox,
} from 'lucide-react';

interface Prompt {
  id: string;
  question: string;
  category: string;
  date: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  'icebreaker',
  'values',
  'lifestyle',
  'dreams',
  'culture',
  'fun',
  'deep',
  'family',
  'relationship',
];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('icebreaker');
  const [newDate, setNewDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getPrompts({ upcoming: true });
      setPrompts(response.data?.data?.prompts || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleCreate = async () => {
    if (!newQuestion.trim()) return;

    try {
      setCreating(true);
      setError('');
      await adminApi.createPrompt({
        question: newQuestion.trim(),
        category: newCategory,
        date: newDate || undefined,
      });
      setShowCreate(false);
      setNewQuestion('');
      setNewCategory('icebreaker');
      setNewDate('');
      fetchPrompts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prompt');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setSaving(true);
      await adminApi.updatePrompt(id, {
        question: editQuestion.trim(),
        category: editCategory,
      });
      setEditingId(null);
      fetchPrompts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deletePrompt(id);
      setDeletingId(null);
      fetchPrompts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete prompt');
    }
  };

  const handleOverrideToday = async () => {
    if (!newQuestion.trim()) return;

    try {
      setCreating(true);
      setError('');
      const today = new Date().toISOString().split('T')[0];
      await adminApi.createPrompt({
        question: newQuestion.trim(),
        category: newCategory,
        date: today,
      });
      setShowCreate(false);
      setNewQuestion('');
      setNewCategory('icebreaker');
      setNewDate('');
      fetchPrompts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to override prompt');
    } finally {
      setCreating(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPrompt = prompts.find((p) => p.date === todayStr && p.is_active);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Daily Prompts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage the daily question prompts shown to users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPrompts}
              disabled={loading}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => {
                setShowCreate(true);
                setNewDate('');
              }}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus size={14} />
              Add Prompt
            </button>
          </div>
        </div>

        {/* Today's prompt highlight */}
        {todayPrompt && (
          <div className="card p-6 border-brand-gold bg-brand-gold/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-brand-gold" />
              <h2 className="font-semibold text-brand-charcoal">Today&apos;s Prompt</h2>
              <span className="badge bg-brand-gold/20 text-brand-gold ml-auto text-xs">
                Active
              </span>
            </div>
            <p className="text-lg font-medium text-brand-charcoal mb-2">
              &ldquo;{todayPrompt.question}&rdquo;
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Tag size={12} /> {todayPrompt.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {format(new Date(todayPrompt.date), 'EEEE, MMMM d')}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="card p-6">
            <h3 className="font-semibold text-brand-charcoal mb-4">
              New Prompt
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. What's a Sindhi tradition you want to keep alive?"
                  className="input-field min-h-[80px] resize-y"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">{newQuestion.length}/200</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-field"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={todayStr}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to add to the bank
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newQuestion.trim()}
                  className="btn-primary flex items-center gap-1.5"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {newDate ? 'Schedule Prompt' : 'Add to Bank'}
                </button>
                <button
                  onClick={handleOverrideToday}
                  disabled={creating || !newQuestion.trim()}
                  className="bg-brand-gold hover:bg-brand-gold-light text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  Override Today
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewQuestion('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompts list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-rose" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No prompts yet</h3>
            <p className="text-sm text-gray-400 mt-1">
              Add daily prompts for users to answer.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header w-1/2">Question</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prompts.map((prompt) => (
                  <tr
                    key={prompt.id}
                    className={cn(
                      'transition-colors',
                      prompt.date === todayStr && prompt.is_active
                        ? 'bg-brand-gold/5'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <td className="table-cell">
                      {editingId === prompt.id ? (
                        <textarea
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="input-field text-sm min-h-[60px]"
                        />
                      ) : (
                        <p className="text-sm font-medium text-brand-charcoal line-clamp-2">
                          {prompt.question}
                        </p>
                      )}
                    </td>
                    <td className="table-cell">
                      {editingId === prompt.id ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="input-field text-sm py-1"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-700 capitalize">
                          {prompt.category}
                        </span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-600">
                      {prompt.date
                        ? format(new Date(prompt.date + 'T00:00:00'), 'MMM d, yyyy')
                        : 'Bank'}
                    </td>
                    <td className="table-cell">
                      {prompt.is_active ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500">Inactive</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {editingId === prompt.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(prompt.id)}
                            disabled={saving}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                          >
                            {saving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : deletingId === prompt.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                            title="Confirm delete"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(prompt.id);
                              setEditQuestion(prompt.question);
                              setEditCategory(prompt.category);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-rose transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingId(prompt.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
