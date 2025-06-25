import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  collection, addDoc, getDocs, query, where,
  deleteDoc, doc, updateDoc, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import Header from './Header';

export default function Dashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentApp, setCurrentApp] = useState({
    id: '',
    company: '',
    position: '',
    location: '',
    status: 'Applied',
    date: new Date().toISOString().split('T')[0],
    salaryRange: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [jobApplications, setJobApplications] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('dracula');

  // Add the useEffect here to log the authenticated user
  useEffect(() => {
    console.log('Authenticated user:', user);
  }, [user]);

  // Theme handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Firestore data fetching
  const fetchApplications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date || new Date(doc.data().createdAt?.toDate() || new Date()).toISOString().split('T')[0],
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      setJobApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (!searchTerm) return jobApplications;
    const term = searchTerm.toLowerCase();
    return jobApplications.filter(app =>
      (app.company?.toLowerCase().includes(term) || false) ||
      (app.position?.toLowerCase().includes(term) || false)
    );
  }, [jobApplications, searchTerm]);

  const handleAddApplication = () => {
    setCurrentApp({
      id: '',
      company: '',
      position: '',
      location: '',
      status: 'Applied',
      date: new Date().toISOString().split('T')[0],
      salaryRange: ''
    });
    setIsEditing(false);
    setShowForm(true);
    setError(null);
  };

  const handleEditApplication = (app) => {
    setCurrentApp({
      ...app,
      date: app.date || new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setShowForm(true);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentApp(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!currentApp.company || !currentApp.position || !currentApp.location) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError(null);
      if (isEditing) {
        await updateDoc(doc(db, 'applications', currentApp.id), {
          company: currentApp.company.trim(),
          position: currentApp.position.trim(),
          location: currentApp.location.trim(),
          status: currentApp.status,
          date: currentApp.date,
          salaryRange: currentApp.salaryRange.trim(),
          userId: user.uid,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'applications'), {
          company: currentApp.company.trim(),
          position: currentApp.position.trim(),
          location: currentApp.location.trim(),
          status: currentApp.status,
          date: currentApp.date,
          salaryRange: currentApp.salaryRange.trim(),
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      
      await fetchApplications();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving application:", error);
      setError("Failed to save application. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    
    try {
      setError(null);
      await deleteDoc(doc(db, 'applications', id));
      await fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
      setError("Failed to delete application. Please try again.");
    }
  };

  const statusCounts = useMemo(() => ({
    Applied: jobApplications.filter(app => app.status === 'Applied').length,
    Interview: jobApplications.filter(app => app.status === 'Interview').length,
    Offer: jobApplications.filter(app => app.status === 'Offer').length
  }), [jobApplications]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Header currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-base-200 p-6 rounded-lg animate-pulse h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard max-w-4xl mx-auto p-6">
      <Header currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />

      {/* Error Display */}
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-base-100 p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Applications</h2>
          <button 
            onClick={handleAddApplication}
            className="btn btn-primary"
          >
            + Add New
          </button>
        </div>
        
        <div className="flex items-center mb-6">
          <input 
            type="text" 
            placeholder="Search by company or position..."
            className="input input-bordered flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 text-center mb-6">
          <div className="bg-base-200 p-3 rounded-lg border border-base-300">
            <p className="text-base-content/80">Total</p>
            <p className="text-xl font-bold">{jobApplications.length}</p>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className={`bg-${status === 'Applied' ? 'primary' : status === 'Interview' ? 'warning' : 'success'}/10 p-3 rounded-lg border border-${status === 'Applied' ? 'primary' : status === 'Interview' ? 'warning' : 'success'}/20`}>
              <p className="text-base-content/80">{status}</p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Application' : 'Add Application'}
            </h2>
            <form onSubmit={handleSubmit}>
              {['company', 'position', 'location'].map((field) => (
                <div key={field} className="mb-4">
                  <label className="block text-base-content mb-2 capitalize">{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={currentApp[field] || ''}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-base-content mb-2">Date Applied</label>
                <input
                  type="date"
                  name="date"
                  value={currentApp.date}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base-content mb-2">Status</label>
                <select
                  name="status"
                  value={currentApp.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  {['Applied', 'Interview', 'Offer'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-base-content mb-2">Salary Range</label>
                <input
                  type="text"
                  name="salaryRange"
                  value={currentApp.salaryRange || ''}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="e.g. $80k - $100k"
                />
              </div>
              {error && (
                <div className="text-error mb-4">{error}</div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((job) => (
            <div key={job.id} className="bg-base-100 p-6 rounded-lg shadow-md relative group hover:shadow-lg transition-shadow">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditApplication(job)}
                  className="text-base-content/40 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-base-content/40 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {job.company} <span className={
                      job.status === 'Applied' ? 'text-primary' : 
                      job.status === 'Interview' ? 'text-warning' : 
                      'text-success'
                    }>
                      {job.status}
                    </span>
                  </h3>
                  <div className="ml-4 mt-2">
                    <p className="text-base-content">{job.position}</p>
                    <p className="text-base-content/80">{job.location}</p>
                    <p className="text-base-content/60">Applied: {new Date(job.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {job.salaryRange && (
                  <p className="text-success font-medium">{job.salaryRange}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-base-100 p-6 rounded-lg">
            <p className="text-base-content/60 text-center">
              {searchTerm ? 'No matches found' : 'No applications yet. Click "Add New" to start tracking!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}