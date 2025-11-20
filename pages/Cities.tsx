import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchCities } from '../services/api';
import { City, LoadingState } from '../types';
import { MapPin, Calendar, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const Cities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    loadCities();
  }, [page]);

  const loadCities = async () => {
    setStatus(LoadingState.LOADING);
    try {
      const data = await fetchCities({
        page,
        limit,
        sort: 'active',
        order: 'DESC'
      });
      
      setCities(data.records);
      setTotal(data.total);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(total / limit);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout title="City Management">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Total Cities: {total}</h3>
          <button 
            onClick={loadCities}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Content */}
        {status === LoadingState.LOADING ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : status === LoadingState.ERROR ? (
          <div className="p-12 text-center text-red-500">
            Failed to load cities. Please try again.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-slate-200">City Name</th>
                    <th className="p-4 font-medium border-b border-slate-200">Sub Name</th>
                    <th className="p-4 font-medium border-b border-slate-200">Status</th>
                    <th className="p-4 font-medium border-b border-slate-200">Created At</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {cities.map((city) => (
                    <tr key={city.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                          <MapPin size={16} className="text-blue-500" />
                          {city.city}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {city.subName || '-'}
                      </td>
                      <td className="p-4">
                        {city.active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {city.created_at?.split(' ')[0]}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">No cities found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center text-sm text-slate-500">
                  Page <span className="font-medium mx-1">{page}</span> of <span className="font-medium mx-1">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cities;