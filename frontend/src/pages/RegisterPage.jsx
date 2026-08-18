import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { UserPlus, Hash, User, Lock, Award } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    password: '',
    backlogCount: 0,
    cgpa: '',
    percentage: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { registerStudent } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number is required';
    if (!formData.name.trim()) errs.name = 'Student name is required';
    if (!formData.password) errs.password = 'Password is required';

    const backlogs = Number(formData.backlogCount);
    if (formData.backlogCount === '' || isNaN(backlogs) || backlogs < 0 || !Number.isInteger(backlogs)) {
      errs.backlogCount = 'Must be a non-negative integer (0, 1, 2...)';
    }

    const cgpa = Number(formData.cgpa);
    if (formData.cgpa === '' || isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errs.cgpa = 'CGPA must be between 0.00 and 10.00';
    }

    const pct = Number(formData.percentage);
    if (formData.percentage === '' || isNaN(pct) || pct < 0 || pct > 100) {
      errs.percentage = 'Percentage must be between 0.00 and 100.00';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showError('Please correct validation errors before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const student = await registerStudent({
        ...formData,
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        backlogCount: Number(formData.backlogCount),
        cgpa: Number(formData.cgpa),
        percentage: Number(formData.percentage)
      });
      showSuccess(`Registration successful! Welcome ${student.name}`);
      navigate('/student-dashboard');
    } catch (err) {
      showError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Student Account Registration</h2>
            <p className="text-xs text-slate-500">Enter your official academic records to calculate your ClassRank</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Roll Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Roll Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    placeholder="e.g. 23JD1A0501"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-semibold uppercase ${
                      errors.rollNumber ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    }`}
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.rollNumber && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.rollNumber}</p>}
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-semibold ${
                      errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {errors.name && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm ${
                    errors.password ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Academic Records
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Backlog Count */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Backlog Count *
                  </label>
                  <input
                    type="number"
                    name="backlogCount"
                    min="0"
                    step="1"
                    required
                    placeholder="0"
                    value={formData.backlogCount}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-mono font-bold ${
                      errors.backlogCount ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.backlogCount && <p className="text-[10px] text-rose-600 mt-1">{errors.backlogCount}</p>}
                </div>

                {/* CGPA */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    CGPA (0 - 10) *
                  </label>
                  <input
                    type="number"
                    name="cgpa"
                    min="0"
                    max="10"
                    step="0.01"
                    required
                    placeholder="8.75"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-mono font-bold ${
                      errors.cgpa ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.cgpa && <p className="text-[10px] text-rose-600 mt-1">{errors.cgpa}</p>}
                </div>

                {/* Percentage */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Percentage (%) *
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    placeholder="83.50"
                    value={formData.percentage}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-mono font-bold ${
                      errors.percentage ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.percentage && <p className="text-[10px] text-rose-600 mt-1">{errors.percentage}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating Student Profile...' : 'Submit Academic Profile & Register'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
