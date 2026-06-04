import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ElectionCard from '@/components/ElectionCard';
import { Loader2 } from 'lucide-react';

export interface Election {
  _id: string;
  name: string;
  description: string;
  type: 'village' | 'district' | 'state' | 'national';
  startDate: string;
  endDate: string;
  status: 'active' | 'ended';
  hasVoted?: boolean;
}

export default function VoterDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get('http://localhost:4000/api/election');
      const {electionsdata} = response.data
      setElections(electionsdata);
    } catch (error: any) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleViewElection = (electionId: string) => {
    navigate(`/voter/election/${electionId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading elections...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Active Elections</h1>
            <p className="text-muted-foreground">
              View and participate in ongoing elections
            </p>
          </div>

          {elections.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🗳️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Active Elections</h3>
              <p className="text-muted-foreground">
                There are no elections available at the moment. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
                <ElectionCard
                  key={election._id}
                  election={election}
                  onView={handleViewElection}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
