import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Election } from '@/pages/VoterDashboard';

interface ElectionCardProps {
  election: Election;
  onView: (electionId: string) => void;
}

const typeColors = {
  village: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  district: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  state: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  national: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ElectionCard({ election, onView }: ElectionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{election.name}</CardTitle>
          <Badge className={typeColors[election.type] || 'bg-secondary'}>
            {election.type.charAt(0).toUpperCase() + election.type.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {election.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {formatDate(election.startDate)} - {formatDate(election.endDate)}
          </span>
        </div>

        {election.hasVoted && (
          <div className="flex items-center text-sm text-success font-medium bg-success/10 px-3 py-2 rounded-md">
            <CheckCircle className="h-4 w-4 mr-2" />
            You have voted in this election
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onView(election._id)}
          className="w-full"
          variant={election.hasVoted ? 'outline' : 'default'}
        >
          {election.hasVoted ? 'View Details' : 'Vote Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
