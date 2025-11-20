import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchProperties, fetchCities, parsePhotos } from '../services/api';
import { Property, City, LoadingState, Filter } from '../types';
import { MapPin, Bed, Bath, Home, Filter as FilterIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  
  // API State
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  
  // Filter States
  const [searchArea, setSearchArea] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterBHK, setFilterBHK] = useState('All');
  const [filterFurnish, setFilterFurnish] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Load Cities on Mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await fetchCities({ page: 1, limit: 100, sort: 'active', order: 'DESC' });
        setCities(data.records);
      } catch (error) {
        console.error("Failed to load cities", error);
      }
    };
    loadCities();
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProperties();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchArea, filterCity, filterBHK, filterFurnish, filterStatus, page]);

  const loadProperties = async () => {
    setStatus(LoadingState.LOADING);
    try {
      const filters: Filter[] = [];
      
      if (searchArea) {
        filters.push({ field: 'area', match: 'cs', value: searchArea });
      }
      if (filterCity !== 'All') {
        filters.push({ field: 'city', match: 'eq', value: filterCity });
      }
      if (filterBHK !== 'All') {
        filters.push({ field: 'bedrooms', match: 'eq', value: filterBHK });
      }
      if (filterFurnish !== 'All') {
        filters.push({ field: 'furnishType', match: 'eq', value: filterFurnish });
      }
      if (filterStatus !== 'All') {
        filters.push({ field: 'status', match: 'eq', value: filterStatus });
      }

      const data = await fetchProperties({
        page,
        limit,
        filters,
        sort: 'created_at',
        order: 'DESC'
      });
      
      setProperties(data.records);
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

  const renderPagination = () => {
    if (total === 0) return null;

    return (
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-6 bg-white rounded-lg">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft size={16} />
              </button>
              
              <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>
        {/* Mobile View */}
        <div className="flex items-center justify-between w-full sm:hidden">
           <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
                Prev
           </button>
           <span className="text-sm text-slate-700">
                {page} / {totalPages}
           </span>
           <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
                Next
           </button>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Properties">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Area (e.g. Whitefield)..." 
              value={searchArea}
              onChange={(e) => {
                  setSearchArea(e.target.value);
                  setPage(1); // Reset page on filter change
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select 
              className="px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full"
              value={filterCity}
              onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>

            <select 
              className="px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full"
              value={filterBHK}
              onChange={(e) => { setFilterBHK(e.target.value); setPage(1); }}
            >
              <option value="All">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>

            <select 
              className="px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full"
              value={filterFurnish}
              onChange={(e) => { setFilterFurnish(e.target.value); setPage(1); }}
            >
              <option value="All">Any Furnish</option>
              <option value="Full Furnished">Full</option>
              <option value="Semi Furnished">Semi</option>
              <option value="Unfurnished">None</option>
            </select>

            <select 
              className="px-2 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="All">Any Status</option>
              <option value="1">Available</option>
              <option value="0">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {status === LoadingState.LOADING ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : status === LoadingState.ERROR ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load properties</p>
          <button onClick={loadProperties} className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Home size={48} className="mx-auto mb-3 opacity-50" />
          <p>No properties found matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const images = parsePhotos(property.photos);
              const mainImage = images.length > 0 ? images[0] : 'https://picsum.photos/400/300';

              return (
                <Link to={`/properties/${property.id}`} key={property.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="h-48 overflow-hidden relative group">
                    <img 
                      src={mainImage} 
                      alt={property.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                      {property.propertyFor}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs flex items-center gap-1">
                      <MapPin size={12} /> {property.area}, {property.city}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg line-clamp-1" title={property.name}>
                        {property.name || `${property.bedrooms}BHK Apartment`}
                      </h3>
                      <p className="text-blue-600 font-bold whitespace-nowrap">{property.price}</p>
                    </div>

                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between py-3 border-t border-slate-100 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Bed size={16} className="text-slate-400" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={16} className="text-slate-400" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home size={16} className="text-slate-400" />
                        <span className="truncate max-w-[80px]">{property.size}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded ${property.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {property.status === 1 ? 'Available' : 'Unavailable'}
                        </span>
                        <span className="text-slate-400 italic truncate ml-2">{property.furnishType}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {renderPagination()}
        </>
      )}
    </Layout>
  );
};

export default Properties;