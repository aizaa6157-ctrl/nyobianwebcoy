'use client';

import { useState, useEffect } from 'react';
import { License } from '@/lib/database';
import { generateLicenseKey } from '@/lib/license';

export default function Home() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    revoked: 0,
  });

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/licenses');
      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);

      const data = result.data;
      setLicenses(data);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter((l: License) => l.status === 'ACTIVE').length || 0;
      const pending = data?.filter((l: License) => l.status === 'PENDING').length || 0;
      const revoked = data?.filter((l: License) => l.status === 'REVOKED').length || 0;
      
      setStats({ total, active, pending, revoked });
    } catch (error: any) {
      console.error('Error loading licenses:', error);
      alert('Error loading licenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLicense = async () => {
    try {
      setGenerating(true);
      
      const licenseKey = generateLicenseKey();
      
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey }),
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert(`License generated!\n\n${licenseKey}\n\nCopy dan kirim ke customer.`);
      
      await loadLicenses();
    } catch (error: any) {
      console.error('Error generating license:', error);
      alert('Error: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleResetDevice = async (license: License) => {
    if (!confirm(`Reset device binding untuk license:\n${license.license_key}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/licenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: license.id,
          device_id: null,
          device_name: null,
          status: 'PENDING',
          reset_count: (license.reset_count || 0) + 1,
        }),
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert('Device berhasil direset!');
      await loadLicenses();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleRevoke = async (license: License) => {
    if (!confirm(`Revoke license:\n${license.license_key}?\n\nLicense tidak bisa digunakan lagi!`)) {
      return;
    }

    try {
      const response = await fetch('/api/licenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: license.id,
          status: 'REVOKED'
        }),
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert('License berhasil di-revoke!');
      await loadLicenses();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVOKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KasirKu Admin</h1>
              <p className="text-gray-600 mt-1">License Management System</p>
            </div>
            <button
              onClick={handleGenerateLicense}
              disabled={generating}
              className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {generating ? 'Generating...' : '+ Generate License'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total License</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Revoked</div>
            <div className="text-3xl font-bold text-red-600">{stats.revoked}</div>
          </div>
        </div>

        {/* License Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">License List</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : licenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada license. Klik "Generate License" untuk membuat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {licenses.map((license) => (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-gray-900">
                          {license.license_key}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reset: {license.reset_count}x
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(license.status)}`}>
                          {license.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {license.device_name || '-'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {license.device_id || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {license.activated_at
                          ? new Date(license.activated_at).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {license.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleResetDevice(license)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Reset
                          </button>
                        )}
                        {license.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleRevoke(license)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
