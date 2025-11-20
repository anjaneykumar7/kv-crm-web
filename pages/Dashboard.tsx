import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchProperties, fetchUsers } from '../services/api';
import { Property, User, LoadingState } from '../types';
import { Building, Users, CheckCircle, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalTenants: 0,
    totalOwners: 0
  });
  
  // We keep a small subset for charts
  const [chartProperties, setChartProperties] = useState<Property[]>([]);
  const [chartUsers, setChartUsers] = useState<User[]>([]);
  
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Parallel requests for counts (using limit=1 to minimize data transfer)
        const [
          propsTotal, 
          usersTotal,
          tenantsTotal,
          ownersTotal,
          recentProps,
          recentUsers
        ] = await Promise.all([
          fetchProperties({ page: 1, limit: 1 }),
          fetchUsers({ page: 1, limit: 1 }),
          fetchUsers({ page: 1, limit: 1, filters: [{ field: 'userType', match: 'eq', value: 'TENANT' }] }),
          fetchUsers({ page: 1, limit: 1, filters: [{ field: 'userType', match: 'eq', value: 'OWNER' }] }),
          fetchProperties({ page: 1, limit: 50 }), // Fetch 50 for charts
          fetchUsers({ page: 1, limit: 50 })      // Fetch 50 for charts
        ]);

        setStats({
          totalProperties: propsTotal.total,
          totalUsers: usersTotal.total,
          totalTenants: tenantsTotal.total,
          totalOwners: ownersTotal.total
        });

        setChartProperties(recentProps.records);
        setChartUsers(recentUsers.records);

        setStatus(LoadingState.SUCCESS);
      } catch (error) {
        console.error(error);
        setStatus(LoadingState.ERROR);
      }
    };
    loadData();
  }, []);

  if (status === LoadingState.LOADING) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Data for Charts based on fetched subset
  const userTypeData = [
    { name: 'Tenants', value: stats.totalTenants },
    { name: 'Owners', value: stats.totalOwners },
    { name: 'Admins', value: stats.totalUsers - stats.totalTenants - stats.totalOwners },
  ];

  const propertyTypeData = chartProperties.reduce((acc: any[], curr) => {
    const type = curr.bedrooms ? `${curr.bedrooms} BHK` : 'Other';
    const existing = acc.find(i => i.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Layout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Properties</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalProperties}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Building size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Active Tenants</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalTenants}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Property Owners</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalOwners}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Property Distribution (BHK)</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Based on recent 50</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Types */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">User Composition</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {userTypeData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
