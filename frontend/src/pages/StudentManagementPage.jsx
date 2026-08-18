import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StudentTable from '../components/StudentTable';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { studentService } from '../services/api';
import { UserPlus, Search, Filter, Hash, User, Mail, Award, Trash2 } from 'lucide-react';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [backlogFilter, setBacklogFilter] = useState('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    backlogCount: 0,
    cgpa: '',
    percentage: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [search, backlogFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ search, backlogFilter });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      rollNumber: '',
      name: '',
      email: '',
      backlogCount: 0,
      cgpa: '',
      percentage: ''
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      backlogCount: student.backlogCount,
      cgpa: student.cgpa,
      percentage: student.percentage
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await studentService.create({
        ...formData,
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        backlogCount: Number(formData.backlogCount),
        cgpa: Number(formData.cgpa),
        percentage: Number(formData.percentage)
      });
      showSuccess(`Student ${formData.name} added successfully!`);
      setAddModalOpen(false);
      fetchStudents();
    } catch (err) {
      showError(err.message || 'Failed to add student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await studentService.update(selectedStudent._id, {
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        backlogCount: Number(formData.backlogCount),
        cgpa: Number(formData.cgpa),
        percentage: Number(formData.percentage)
      });
      showSuccess(`Student ${formData.name} updated successfully!`);
      setEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      showError(err.message || 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await studentService.delete(selectedStudent._id);
      showSuccess(`Student record deleted.`);
      setDeleteModalOpen(false);
      fetchStudents();
    } catch (err) {
      showError(err.message || 'Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Management</h1>
            <p className="text-xs text-slate-500">Create, update, or remove student academic records</p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Student Manually
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by roll number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Backlogs:</span>
            {['all', ...Array.from(new Set(students.map(s => String(s.backlogCount)))).sort((a, b) => Number(a) - Number(b))].map((f) => (
              <button
                key={f}
                onClick={() => setBacklogFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                  backlogFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : `${f} Backlog${f === '1' ? '' : 's'}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-500">Loading student records...</p>
          </div>
        ) : (
          <StudentTable
            students={students}
            isAdmin={true}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </main>

      {/* Add Student Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Student Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="23JD1A0501"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Optional email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Backlog Count *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.backlogCount}
                onChange={(e) => setFormData({ ...formData, backlogCount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">CGPA (0-10) *</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                required
                placeholder="8.50"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                placeholder="81.20"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {actionLoading ? 'Saving...' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Record">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Backlog Count</label>
              <input
                type="number"
                min="0"
                required
                value={formData.backlogCount}
                onChange={(e) => setFormData({ ...formData, backlogCount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {actionLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the student record for{' '}
            <strong className="text-slate-900">{selectedStudent?.name}</strong> ({selectedStudent?.rollNumber})?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl font-medium">
            This action cannot be undone and will permanently adjust class leaderboard ranks.
          </p>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
            >
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagementPage;
