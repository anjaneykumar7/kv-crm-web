import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchUserById } from '../services/api';
import { User, LoadingState } from '../types';
import { ArrowLeft, Mail, Phone, MapPin, Shield, Calendar, CheckCircle, AlertCircle, User as UserIcon, MessageCircle } from 'lucide-react';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    setStatus(LoadingState.LOADING);
    try {
      const data = await fetchUserById(userId);
      setUser(data);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  if (status === LoadingState.LOADING) {
    return (
      <Layout title="User Profile">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (status === LoadingState.ERROR || !user) {
    return (
      <Layout title="User Profile">
        <div className="text-center py-12">
          <h3 className="text-xl text-red-600 mb-4">Failed to load user details</h3>
          <button onClick={() => navigate('/users')} className="text-blue-600 hover:underline">
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-purple-600 bg-purple-100';
      case 'OWNER': return 'text-amber-600 bg-amber-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <Layout title="User Profile">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 sm:p-8 flex flex-col items-center border-b border-slate-200">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
              {user.name?.charAt(0).toUpperCase() || <UserIcon size={40} />}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">{user.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRoleColor(user.userType)}`}>
                {user.userType}
              </span>
              {user.activeStatus === 'ACTIVE' ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle size={14} className="mr-1" /> Active
                </span>
              ) : (
                <span className="flex items-center text-slate-500 text-sm font-medium">
                  <AlertCircle size={14} className="mr-1" /> Inactive
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-100">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                  <Mail size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-500 mb-1">Email Address</div>
                  <a 
                    href={`mailto:${user.email}`} 
                    className="font-medium text-blue-600 hover:underline truncate block" 
                    title={user.email}
                  >
                    {user.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Phone Number</div>
                  <div className="font-medium text-slate-800 mb-2">{user.phone || 'Not Provided'}</div>
                  
                  {user.phone && (
                    <div className="flex gap-2">
                      <a 
                        href={`tel:${user.phone}`}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        <Phone size={12} /> Call
                      </a>
                      <button 
                        onClick={() => openWhatsApp(user.phone)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 mt-1">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Location</div>
                  <div className="font-medium text-slate-800">{user.addressCity || 'Unknown City'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-1">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Account Status</div>
                  <div className="font-medium text-slate-800">
                    {user.isVerified ? 'Verified Account' : 'Unverified'}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-100">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm">Joined: {user.created_at}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
                <Shield size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-sm truncate">User ID: <span className="font-mono bg-slate-100 px-1 rounded">{user.id}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;