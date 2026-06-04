import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Vote, Users, Loader2, Calendar, MapPin } from 'lucide-react';
import { Election } from '@/pages/VoterDashboard';

export default function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string>('');
  
  // Election form
  const [electionForm, setElectionForm] = useState({
    name: '',
    description: '',
    type: 'village' as 'village' | 'district' | 'state' | 'national',
    startDate: '',
    endDate: '',
    location:''
  });

  // Candidate form
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    party: '',
    voterId: '',
    address: '',
    village:'',
    district: '',
    state: '',
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await api.get('http://localhost:4000/api/election');
      const {electionsdata} = response.data
      console.log(electionsdata)
      setElections(electionsdata);
      console.log(elections)
    } catch (error: any) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await api.post('http://localhost:4000/api/admin/create', electionForm,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      toast.success('Election created successfully!');
      setCreateDialogOpen(false);
      setElectionForm({
        name: '',
        description: '',
        type: 'village',
        startDate: '',
        endDate: '',
        location:''
      });
      fetchElections();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create election';
      toast.error(message);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedElection) {
      toast.error('Please select an election');
      return;
    }

    try {
      await api.post(`http://localhost:4000/api/admin/${selectedElection}/candidate`, {
        ...candidateForm,
      });
      toast.success('Candidate added successfully!');
      setCandidateDialogOpen(false);
      setCandidateForm({
        name: '',
        party: '',
        voterId: '',
        address: '',
        village:'',
        district: '',
        state: '',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add candidate';
      toast.error(message);
    }
  };

  const handleCloseElection = async (electionId: string) => {
    if (!confirm('Are you sure you want to close this election? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`http://localhost:4000/api/admin/${electionId}/close`);
      toast.success('Election closed successfully!');
      fetchElections();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to close election';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage elections and candidates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gradient-primary p-4 rounded-full mb-4">
                      <Plus className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Create New Election</h3>
                    <p className="text-sm text-muted-foreground">Set up a new voting event</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Election</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new election
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateElection} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Election Name *</Label>
                    <Input
                      id="name"
                      value={electionForm.name}
                      onChange={(e) => setElectionForm({ ...electionForm, name: e.target.value })}
                      required
                      placeholder="e.g., Village Council Election 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={electionForm.description}
                      onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                      required
                      placeholder="Describe the purpose and scope of this election"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Election Type *</Label>
                    <Select
                      value={electionForm.type}
                      onValueChange={(value: any) => setElectionForm({ ...electionForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="village">Village</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="country">National</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Location *</Label>
                    <Input
                      id="name"
                      value={electionForm.location}
                      onChange={(e) => setElectionForm({ ...electionForm, location: e.target.value })}
                      required
                      placeholder="e.g., Maharashtra"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={electionForm.startDate}
                        onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={electionForm.endDate}
                        onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary">
                    Create Election
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gradient-success p-4 rounded-full mb-4">
                      <Users className="h-8 w-8 text-success-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Add Candidate</h3>
                    <p className="text-sm text-muted-foreground">Register a new candidate</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
                  <DialogDescription>
                    Fill in the candidate details
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="election">Select Election *</Label>
                    <Select value={selectedElection} onValueChange={setSelectedElection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an election" />
                      </SelectTrigger>
                      <SelectContent>
                        {elections.filter(e => e.status === 'active').map((election) => (
                          <SelectItem key={election._id} value={election._id}>
                            {election.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Candidate Name *</Label>
                    <Input
                      id="candidateName"
                      value={candidateForm.name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      required
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="party">Party *</Label>
                    <Input
                      id="party"
                      value={candidateForm.party}
                      onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                      required
                      placeholder="Political party"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voterId">Voter ID *</Label>
                    <Input
                      id="voterId"
                      value={candidateForm.voterId}
                      onChange={(e) => setCandidateForm({ ...candidateForm, voterId: e.target.value })}
                      required
                      placeholder="Voter identification number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={candidateForm.address}
                      onChange={(e) => setCandidateForm({ ...candidateForm, address: e.target.value })}
                      required
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <Input
                        id="village"
                        value={candidateForm.village}
                        onChange={(e) => setCandidateForm({ ...candidateForm, village: e.target.value })}
                        placeholder="Village"
                      />
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={candidateForm.district}
                        onChange={(e) => setCandidateForm({ ...candidateForm, district: e.target.value })}
                        placeholder="District"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={candidateForm.state}
                        onChange={(e) => setCandidateForm({ ...candidateForm, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-success">
                    Add Candidate
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">Active Elections</TabsTrigger>
              <TabsTrigger value="closed">Closed Elections</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {elections.filter(e => e.status === 'active').length === 0 ? (
                <div className="text-center py-16">
                  <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Active Elections</h3>
                  <p className="text-muted-foreground">Create a new election to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {elections.filter(e => e.status == 'active').map((election) => (
                    <Card key={election._id} className="shadow-card">
                      <CardHeader>
                        <CardTitle>{election.name}</CardTitle>
                        <CardDescription>{election.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="capitalize">{election.type}</span>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleCloseElection(election._id)}
                          className="w-full mt-4"
                        >
                          Close Election
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="mt-6">
              {elections.filter(e => e.status === 'ended').length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No closed elections yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {elections.filter(e => e.status === 'ended').map((election) => (
                    <Card key={election._id} className="shadow-card opacity-75">
                      <CardHeader>
                        <CardTitle>{election.name}</CardTitle>
                        <CardDescription>{election.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="capitalize">{election.type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
