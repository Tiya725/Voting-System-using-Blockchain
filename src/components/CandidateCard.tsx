import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Hash, Loader2 } from 'lucide-react';
import { Candidate } from '@/pages/ElectionDetails';

interface CandidateCardProps {
  candidate: Candidate;
  candidateIndex : number;
  onVote: (candidateIndex: number) => void;
  disabled: boolean;
  voting: boolean;
}

export default function CandidateCard({ candidate, candidateIndex, onVote, disabled, voting }: CandidateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-gradient-primary p-3 rounded-full">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{candidate.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {candidate.party}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex items-start text-muted-foreground">
          <Hash className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="break-all">Voter ID: {candidate.voterId}</span>
        </div>

        <div className="flex items-start text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{candidate.address}</span>
        </div>

        {candidate.district && (
          <div className="text-muted-foreground">
            <span className="font-medium">District:</span> {candidate.district}
          </div>
        )}

        {candidate.state && (
          <div className="text-muted-foreground">
            <span className="font-medium">State:</span> {candidate.state}
          </div>
        )}

        {typeof candidate.voteCount !== 'undefined' && (
          <div className="pt-2 border-t border-border">
            <div className="text-primary font-semibold">
              Votes: {candidate.voteCount}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onVote(candidateIndex)}
          disabled={disabled}
          className="w-full bg-gradient-success hover:opacity-90 transition-opacity"
        >
          {voting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Casting Vote...
            </>
          ) : (
            'Vote for this Candidate'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
