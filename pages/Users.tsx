import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchUsers } from '../services/api';
import { User, LoadingState, Filter } from '../types';
import { Search, UserCheck, Shield, Key, Phone, Mail, MapPin, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters State
  const [searchName, setSearchName] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [pageTitle, setPageTitle] = useState('User Management');

  // Detect route changes and set filter
  useEffect(() => {
    const path = location.pathname;
    setPage(1); // Reset to page 1 on route change

    if (path === '/owners') {
      setRoleFilter('OWNER');
      setPageTitle('Owner/Agent Management');
    } else if (path === '/tenants') {
      setRoleFilter('TENANT');
      setPageTitle('Tenant Management');
    } else if (path === '/admins') {
      setRoleFilter('ADMIN');
      setPageTitle('Admin Management');
    } else {
      setRoleFilter('All');
      setPageTitle('User Management');
    }
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchName, roleFilter]);

  const loadUsers = async () => {
    setStatus(LoadingState.LOADING);
    try {
      const filters: Filter[] = [];
      
      if (searchName) {
        // Filtering by Name
        filters.push({ field: 'name', match: 'cs', value: searchName });
      }
      if (roleFilter !== 'All') {
        filters.push({ field: 'userType', match: 'eq', value: roleFilter });
      }

      const data = await fetchUsers({
        page,
        limit,
        filters,
        sort: 'created_at',
        order: 'DESC'
      });
      
      setUsers(data.records);
      setTotal(data.total);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'OWNER': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'TENANT': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield size={14} />;
      case 'OWNER': return <Key size={14} />;
      case 'TENANT': return <UserCheck size={14} />;
      default: return <UserCheck size={14} />;
    }
  };

  const handleWhatsApp = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const isSpecificRolePage = ['/owners', '/tenants', '/admins'].includes(location.pathname);

  return (
    <Layout title={pageTitle}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header / Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-slate-800">Total Records: {total}</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search name..."
                value={searchName}
                onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-900"
              />
            </div>

            {!isSpecificRolePage && (
              <select 
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
              >
                <option value="All">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
                <option value="TENANT">Tenant</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        {status === LoadingState.LOADING ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-slate-200">User</th>
                    <th className="p-4 font-medium border-b border-slate-200">Role</th>
                    <th className="p-4 font-medium border-b border-slate-200">Contact</th>
                    <th className="p-4 font-medium border-b border-slate-200">Location</th>
                    <th className="p-4 font-medium border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr 
                        key={user.id} 
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-[150px]">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.userType)}`}>
                          {getRoleIcon(user.userType)}
                          {user.userType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <div 
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                            onClick={(e) => handleEmail(e, user.email)}
                          >
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate max-w-[180px]" title={user.email}>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 text-xs">{user.phone}</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={(e) => handleCall(e, user.phone)}
                                  className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                  title="Call"
                                >
                                  <Phone size={14} />
                                </button>
                                <button 
                                  onClick={(e) => handleWhatsApp(e, user.phone)}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                           <MapPin size={14} className="flex-shrink-0" />
                           <span className="truncate max-w-[120px]">{user.addressCity || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          user.activeStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.activeStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">No users found.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <div className="flex-1 flex justify-between sm:hidden">
                   <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="flex items-center text-sm text-gray-700">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Users;