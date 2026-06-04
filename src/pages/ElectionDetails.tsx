import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import CandidateCard from '@/components/CandidateCard';
import CandidateResultCard from '@/components/CandidateResultCard'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Calendar, MapPin } from 'lucide-react';
import { Election } from '@/pages/VoterDashboard';
import { ethers } from 'ethers';
import contractJSON from "../blockchain/contract.json"
export interface Candidate {
  _id: string;
  name: string;
  party: string;
  voterId: string;
  address: string;
  district?: string;
  state?: string;
  voteCount?: number;
}

export default function ElectionDetails() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedCandidateIndex , setSelectedCandidateIndex] = useState(0)
  useEffect(() => {
    fetchElectionDetails();
  }, [electionId]);
  useEffect(() => {
    if (election){
      getResult()
    }
  },[election])
  const fetchElectionDetails = async () => {
    try {
      const electionRes = await api.get(`http://localhost:4000/api/election/${electionId}`)
      const {electionData} = electionRes.data
      setElection(electionData);
      setCandidates(electionData.candidates);

    } catch (error: any) {
      
      toast.error('Failed to load election details');
      navigate('/voter');
    } finally {
      setLoading(false);
    }
  };

const getResult = async() => {
  console.log(election.status)
  if(election.status !== "ended"){
    return
  }
  try{
    const res = await api.get(`http://localhost:4000/api/election/${election._id}/results`)
    if (!res.data.success) {
      toast.error("Failed to fetch results");
      return;
    }
    
    const { results } = res.data.results; // results = [{ name, votes }, ...]

    // Update candidates with voteCount
    const updatedCandidates = candidates.map((candidate) => {
      const match = results.find((r: any) => r.name === candidate.name);
      return {
        ...candidate,
        voteCount: match ? match.votes : 0,
      };
    });

    setCandidates(updatedCandidates);
    toast.success("Election results loaded");
  } catch (error: any) {
    console.error("Error fetching results:", error);
    toast.error("Error loading election results");
  }
}
const handleVote = async (index: number) => {
  if (!election || election.hasVoted) return;

  setVoting(true);
  setSelectedCandidateIndex(index);

  try {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    // Request account access if needed
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractJSON.address, contractJSON.abi, signer);

    // Call vote function on-chain
    const tx = await contract.vote(election._id, index);
    await tx.wait(); // wait for confirmation

    toast.success("Vote cast successfully!");

    // Update local state
    setElection({ ...election, hasVoted: true });
  } catch (err: any) {
    console.error("Error casting vote:", err);
    const message = err.data?.message || err.reason || "Failed to cast vote";
    toast.error(message);
  } finally {
    setVoting(false);
    setSelectedCandidateIndex(null);
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading election details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!election) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/voter')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Elections
          </Button>

          <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{election.name}</h1>
                <p className="text-muted-foreground">{election.description}</p>
              </div>
              <Badge className="text-sm">
                {election.type.charAt(0).toUpperCase() + election.type.slice(1)}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {formatDate(election.startDate)} - {formatDate(election.endDate)}
                </span>
              </div>
            </div>

            {election.hasVoted && (
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-md">
                <p className="text-success font-medium">
                  ✓ You have already voted in this election
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Candidates</h2>
            <p className="text-muted-foreground">
              {election.status === "ended" 
                ? 'View the candidates in this election' 
                : 'Select a candidate to cast your vote'}
            </p>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No candidates available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {election.status === "active" ? (
                candidates.map((candidate,index) => (
                <CandidateCard
                  key={index}
                  candidateIndex = {index}
                  candidate={candidate}
                  onVote={handleVote}
                  disabled={election.hasVoted || voting}
                  voting={voting && candidates[selectedCandidateIndex]._id === candidate._id}
                />
              ))):(
              candidates.map((candidate,index) => (
                <CandidateResultCard
                  key={index}
                  candidateIndex = {index}
                  candidate={candidate}
                />
              )))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
