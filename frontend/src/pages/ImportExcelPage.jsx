import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { excelService } from '../services/api';
import { FileUp, FileSpreadsheet, CheckCircle2, AlertCircle, Upload, ArrowRight, Download } from 'lucide-react';

const ImportExcelPage = () => {
  const [file, setFile] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const { showSuccess, showError } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handlePreviewUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showError('Please select an Excel or CSV file first');
      return;
    }

    setPreviewing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await excelService.importFile(formData, false);
      setResult(res.data);
      showSuccess(`File validated: ${res.data.summary.validCount} valid records found.`);
    } catch (err) {
      showError(err.message || 'Error processing Excel file');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await excelService.importFile(formData, true);
      setResult(res.data);
      showSuccess(`Import complete! ${res.data.summary.insertedCount} student records added to database.`);
    } catch (err) {
      showError(err.message || 'Failed to commit import');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = `Roll Number,Name,Backlogs,CGPA,Percentage\n23JD1A0501,Rahul,0,9.12,86.64\n23JD1A0502,Ravi,1,8.75,83.12\n23JD1A0503,Kiran,0,8.90,84.55`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ClassRank_Import_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Excel Batch Import</h1>
            <p className="text-xs text-slate-500">Upload Excel or CSV rosters with automated validation & duplicate checks</p>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download Sample CSV Template
          </button>
        </div>

        {/* Upload Zone Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Upload Student Roster</h3>
            <p className="text-xs text-slate-500">
              Required Columns: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Roll Number | Name | Backlogs | CGPA | Percentage</code>
            </p>
          </div>

          <form onSubmit={handlePreviewUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 transition-colors cursor-pointer bg-slate-50/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
            </div>

            {file && (
              <p className="text-xs font-bold text-indigo-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}

            <button
              type="submit"
              disabled={previewing || !file}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {previewing ? (
                'Validating File Rows...'
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Validate & Preview Import
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Summary & Detailed Validation Table */}
        {result && (
          <div className="space-y-6">
            {/* Import Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Import Analysis Summary</h3>
                  <p className="text-xs text-slate-500">
                    File contains {result.summary.totalRows} records evaluated against validation rules.
                  </p>
                </div>

                {!result.committed && result.summary.validCount > 0 && (
                  <button
                    onClick={handleCommitImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all shrink-0"
                  >
                    {importing ? (
                      'Importing to Database...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Commit & Import {result.summary.validCount} Valid Students
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Successfully Validated</div>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-1">{result.summary.validCount}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Ready for insertion</div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-800">Invalid / Error Rows</div>
                  <div className="text-3xl font-extrabold text-rose-700 mt-1">{result.summary.invalidCount}</div>
                  <div className="text-[10px] text-rose-600 mt-0.5">Skipped due to validation issues</div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-800">Import Status</div>
                  <div className="text-lg font-extrabold text-indigo-900 mt-2">
                    {result.committed ? '✅ Imported to Database' : '⏳ Ready for Review'}
                  </div>
                </div>
              </div>
            </div>

            {/* Valid Rows Table */}
            {result.validRows.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Valid Records Ready for Import ({result.validRows.length})
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                        <th className="p-3 text-center">Row</th>
                        <th className="p-3">Roll Number</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 text-center">Backlogs</th>
                        <th className="p-3 text-right">CGPA</th>
                        <th className="p-3 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.validRows.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-slate-50">
                          <td className="p-3 text-center font-mono font-bold text-slate-400">#{row.rowNumber}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{row.rollNumber}</td>
                          <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                          <td className="p-3 text-center font-bold text-amber-600">{row.backlogCount}</td>
                          <td className="p-3 text-right font-mono text-slate-800">{row.cgpa.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-extrabold text-indigo-600">{row.percentage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invalid Rows Table */}
            {result.invalidRows.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Invalid Rows & Rejection Reasons ({result.invalidRows.length})
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-100/60 text-rose-900 font-bold uppercase border-b border-rose-200">
                        <th className="p-3 text-center">Row #</th>
                        <th className="p-3">Roll Number</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Validation Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {result.invalidRows.map((row) => (
                        <tr key={row.rowNumber} className="bg-white/80">
                          <td className="p-3 text-center font-mono font-bold text-rose-400">#{row.rowNumber}</td>
                          <td className="p-3 font-mono font-bold text-slate-800">{row.rollNumber}</td>
                          <td className="p-3 font-semibold text-slate-700">{row.name}</td>
                          <td className="p-3 text-rose-700 font-medium">
                            <ul className="list-disc list-inside space-y-0.5">
                              {row.reasons.map((r, idx) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ImportExcelPage;
