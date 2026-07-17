import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  phone: string | null;
}

interface NotifyMatchPopoverProps {
  matchId: string;
  matchNumber: number;
  team1: Team | null;
  team2: Team | null;
  notifications: { team_id: string; status: string; sent_at: string }[];
  onNotificationSent: () => void;
}

export function NotifyMatchPopover({
  matchId,
  matchNumber,
  team1,
  team2,
  notifications,
  onNotificationSent,
}: NotifyMatchPopoverProps) {
  const [timeEstimate, setTimeEstimate] = useState('15');
  const [courtNumber, setCourtNumber] = useState<string>('');
  const [sending, setSending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const sendNotification = async (teamId: string, teamName: string) => {
    setSending(teamId);
    try {
      const response = await supabase.functions.invoke('send-whatsapp', {
        body: {
          match_id: matchId,
          team_id: teamId,
          time_estimate: parseInt(timeEstimate),
          court_number: courtNumber ? parseInt(courtNumber) : null,
        },
      });

      if (response.error) {
        toast.error(`Erro ao notificar ${teamName}: ${response.error.message}`);
      } else {
        toast.success(`Notificação enviada para ${teamName}!`);
        onNotificationSent();
      }
    } catch {
      toast.error(`Erro inesperado ao notificar ${teamName}`);
    } finally {
      setSending(null);
    }
  };

  const sendBoth = async () => {
    if (team1?.phone) await sendNotification(team1.id, team1.name);
    if (team2?.phone) await sendNotification(team2.id, team2.name);
  };

  const isTeamNotified = (teamId: string) =>
    notifications.some((n) => n.team_id === teamId && n.status === 'sent');

  const hasAnyPhone = team1?.phone || team2?.phone;

  if (!hasAnyPhone) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-500 hover:text-green-400">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <p className="font-semibold text-sm">
            Jogo #{matchNumber}: {team1?.name ?? 'TBD'} vs {team2?.name ?? 'TBD'}
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Tempo estimado</label>
              <Select value={timeEstimate} onValueChange={setTimeEstimate}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground">Quadra</label>
              <Select value={courtNumber} onValueChange={setCourtNumber}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">-</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={!team1?.phone || sending !== null}
              onClick={() => team1 && sendNotification(team1.id, team1.name)}
              className="justify-start"
            >
              {isTeamNotified(team1?.id ?? '') && <span className="text-green-500 mr-1">✓</span>}
              Notificar {team1?.name ?? 'Time 1'}
              {!team1?.phone && <span className="ml-auto text-xs text-muted-foreground">sem tel</span>}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!team2?.phone || sending !== null}
              onClick={() => team2 && sendNotification(team2.id, team2.name)}
              className="justify-start"
            >
              {isTeamNotified(team2?.id ?? '') && <span className="text-green-500 mr-1">✓</span>}
              Notificar {team2?.name ?? 'Time 2'}
              {!team2?.phone && <span className="ml-auto text-xs text-muted-foreground">sem tel</span>}
            </Button>
            <Button
              size="sm"
              disabled={(!team1?.phone && !team2?.phone) || sending !== null}
              onClick={sendBoth}
            >
              {sending ? 'Enviando...' : 'Notificar Ambos'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
