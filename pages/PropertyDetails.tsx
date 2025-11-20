import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchPropertyById, parsePhotos } from '../services/api';
import { Property, LoadingState } from '../types';
import { MapPin, Bed, Bath, Home, ArrowLeft, Car, Zap } from 'lucide-react';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId: string) => {
    setStatus(LoadingState.LOADING);
    try {
      const data = await fetchPropertyById(propertyId);
      setProperty(data);
      const images = parsePhotos(data.photos);
      if (images.length > 0) {
        setActiveImage(images[0]);
      }
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  if (status === LoadingState.LOADING) {
    return (
      <Layout title="Property Details">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (status === LoadingState.ERROR || !property) {
    return (
      <Layout title="Property Details">
        <div className="text-center py-12">
          <h3 className="text-xl text-red-600 mb-4">Failed to load property details</h3>
          <button onClick={() => navigate('/properties')} className="text-blue-600 hover:underline">
            Back to Properties
          </button>
        </div>
      </Layout>
    );
  }

  const images = parsePhotos(property.photos);

  return (
    <Layout title="Property Details">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Hero Section */}
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{property.name || `${property.bedrooms}BHK in ${property.area}`}</h1>
                <div className="flex items-start sm:items-center text-slate-500 mt-2 text-sm sm:text-base">
                  <MapPin size={18} className="mr-1 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>{property.landmark ? `${property.landmark}, ` : ''}{property.area}, {property.city}</span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{property.price}</div>
                <div className="text-sm text-slate-500">Maint: ₹{property.maintenance}/mo</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${property.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {property.status === 1 ? 'Available' : 'Unavailable'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700">
                For {property.propertyFor}
              </span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-slate-100 text-slate-700">
                {property.furnishType}
              </span>
            </div>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="bg-slate-50 p-4 sm:p-6">
              <div className="rounded-xl overflow-hidden bg-white shadow-sm h-64 sm:h-96 mb-4 flex items-center justify-center">
                <img 
                  src={activeImage || images[0]} 
                  alt="Property View" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {property.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Bed className="text-blue-500" size={20} />
                    <div>
                      <div className="text-xs text-slate-500">Bedrooms</div>
                      <div className="font-medium text-slate-800">{property.bedrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Bath className="text-blue-500" size={20} />
                    <div>
                      <div className="text-xs text-slate-500">Bathrooms</div>
                      <div className="font-medium text-slate-800">{property.bathrooms}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Home className="text-blue-500" size={20} />
                    <div>
                      <div className="text-xs text-slate-500">Area Size</div>
                      <div className="font-medium text-slate-800">{property.size}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Zap className="text-amber-500" size={20} />
                    <div>
                      <div className="text-xs text-slate-500">Lift</div>
                      <div className="font-medium text-slate-800">{property.hasLift}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Car className="text-green-600" size={20} />
                    <div>
                      <div className="text-xs text-slate-500">Parking</div>
                      <div className="font-medium text-slate-800">
                        {property.carParking === 'Yes' ? 'Available' : property.carParking}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-4">Property Summary</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-500">ID</span>
                    <span className="font-mono text-slate-700 truncate ml-2">{property.id.substring(0, 8)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Added On</span>
                    <span className="text-slate-700">{property.created_at.split(' ')[0]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="text-slate-700">{property.updated_at?.split(' ')[0] || '-'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Bike Parking</span>
                    <span className="text-slate-700">{property.bikeParking}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;