import { Database } from '@/integrations/supabase/types';

export type Match = Database['public']['Tables']['matches']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];

export type RoundGroup = {
  name: string;
  /** Logical lane: winners (upper) bracket, losers (lower) bracket, or finals column */
  lane: 'winners' | 'losers' | 'finals';
  matches: Match[];
};

const inRange = (matches: Match[], min: number, max: number) =>
  matches.filter((m) => m.match_number >= min && m.match_number <= max);

const single = (matches: Match[], n: number) =>
  matches.filter((m) => m.match_number === n);

/**
 * Returns rounds in display order — winners lane first, then losers, then finals.
 * Mirrors the original BracketView grouping logic but adds a `lane` per round
 * so the classic (Challonge-style) view can stack winners on top and losers below.
 */
/**
 * Reorders matches inside each round so that each match sits at the same
 * row position as its descendant in the next column of the same lane.
 * Sweeps right→left within each lane and minimises connector crossings.
 */
function reorderRoundsByDependencies(rounds: RoundGroup[]): RoundGroup[] {
  const lanes: Record<string, RoundGroup[]> = { winners: [], losers: [], finals: [] };
  rounds.forEach((r) => lanes[r.lane].push(r));

  Object.values(lanes).forEach((laneRounds) => {
    for (let c = laneRounds.length - 2; c >= 0; c--) {
      const nextCol = laneRounds[c + 1].matches;
      const sortKey = new Map<number, [number, number]>();
      laneRounds[c].matches.forEach((m, idx) => {
        let placed = false;
        for (let i = 0; i < nextCol.length; i++) {
          const t = nextCol[i];
          if (t.depends_on_match1 === m.match_number) {
            sortKey.set(m.match_number, [i, 1]);
            placed = true;
            break;
          }
          if (t.depends_on_match2 === m.match_number) {
            sortKey.set(m.match_number, [i, 2]);
            placed = true;
            break;
          }
        }
        if (!placed) sortKey.set(m.match_number, [Number.POSITIVE_INFINITY, idx]);
      });
      laneRounds[c].matches = [...laneRounds[c].matches].sort((a, b) => {
        const ka = sortKey.get(a.match_number)!;
        const kb = sortKey.get(b.match_number)!;
        if (ka[0] !== kb[0]) return ka[0] - kb[0];
        return ka[1] - kb[1];
      });
    }
  });
  return rounds;
}

export function buildRounds(numTeams: number, matches: Match[]): RoundGroup[] {
  const W = (name: string, matches: Match[]): RoundGroup => ({ name, lane: 'winners', matches });
  const L = (name: string, matches: Match[]): RoundGroup => ({ name, lane: 'losers', matches });
  const F = (name: string, matches: Match[]): RoundGroup => ({ name, lane: 'finals', matches });
  // Final + 3rd place always grouped together in a single "Finais" column
  const Finais = (third: number, final: number): RoundGroup =>
    F('Finais', [...single(matches, final), ...single(matches, third)]);

  const built = ((): RoundGroup[] => {
  switch (numTeams) {
    case 8:
      return [
        W('Primeira Rodada', inRange(matches, 1, 4)),
        L('Chave de Perdedores R1', inRange(matches, 5, 6)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 7, 8)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 9, 10)),
        W('Semifinais Cruzadas', inRange(matches, 11, 12)),
        Finais(13, 14),
      ];
    case 9:
      return [
        W('Primeira Rodada', single(matches, 1)),
        W('Segunda Rodada', inRange(matches, 2, 5)),
        L('Chave de Perdedores R1', inRange(matches, 6, 7)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 8, 9)),
        L('Chave de Perdedores R2', inRange(matches, 10, 11)),
        L('Vaga para a Semi-Final - Perdedores', single(matches, 12)),
        W('Semifinais', inRange(matches, 13, 14)),
        Finais(15, 16),
      ];
    case 12:
      return [
        W('Primeira Rodada', inRange(matches, 1, 4)),
        W('Segunda Rodada', inRange(matches, 5, 8)),
        L('Chave de Perdedores R1', inRange(matches, 9, 12)),
        L('Chave de Perdedores R2', inRange(matches, 13, 14)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 15, 16)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 17, 18)),
        W('Semifinais', inRange(matches, 19, 20)),
        Finais(21, 22),
      ];
    case 14:
      return [
        W('Primeira Rodada', inRange(matches, 1, 6)),
        W('Segunda Rodada', inRange(matches, 7, 10)),
        L('Chave de Perdedores R1', inRange(matches, 11, 13)),
        L('Chave de Perdedores R2', inRange(matches, 14, 16)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 17, 18)),
        L('Chave de Perdedores R3', inRange(matches, 19, 20)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 21, 22)),
        W('Semifinais', inRange(matches, 23, 24)),
        Finais(25, 26),
      ];
    case 16:
      return [
        W('Primeira Rodada', inRange(matches, 1, 8)),
        W('Quartas de Final', inRange(matches, 9, 12)),
        L('Chave de Perdedores R1', inRange(matches, 13, 16)),
        L('Chave de Perdedores R2', inRange(matches, 17, 20)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 21, 22)),
        L('Chave de Perdedores R3', inRange(matches, 23, 24)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 25, 26)),
        W('Semifinais', inRange(matches, 27, 28)),
        Finais(29, 30),
      ];
    case 18:
      return [
        W('Primeira Rodada', inRange(matches, 1, 8)),
        W('Segunda Rodada', inRange(matches, 9, 10)),
        L('Chave de Perdedores R1', inRange(matches, 11, 12)),
        W('Quartas — Vencedores', inRange(matches, 13, 16)),
        L('Chave de Perdedores R2', inRange(matches, 17, 20)),
        L('Chave de Perdedores R3', inRange(matches, 21, 24)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 25, 26)),
        L('Chave de Perdedores R4', inRange(matches, 27, 28)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 29, 30)),
        W('Semifinais', inRange(matches, 31, 32)),
        Finais(33, 34),
      ];
    case 20:
      return [
        W('Primeira Rodada', inRange(matches, 1, 4)),
        W('Segunda Rodada', inRange(matches, 5, 12)),
        L('Chave de Perdedores R1', inRange(matches, 13, 16)),
        W('Chave de Vencedores', inRange(matches, 17, 20)),
        L('Chave de Perdedores R2', inRange(matches, 21, 24)),
        L('Chave de Perdedores R3', inRange(matches, 25, 28)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 29, 30)),
        L('Chave de Perdedores R4', inRange(matches, 31, 32)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 33, 34)),
        W('Semifinais', inRange(matches, 35, 36)),
        Finais(37, 38),
      ];
    case 24:
      return [
        W('Primeira Rodada', inRange(matches, 1, 8)),
        W('Segunda Rodada', inRange(matches, 9, 16)),
        L('Chave de Perdedores R1', inRange(matches, 17, 24)),
        W('Chave de Vencedores R1', inRange(matches, 25, 28)),
        L('Chave de Perdedores R2', inRange(matches, 29, 32)),
        L('Chave de Perdedores R3', inRange(matches, 33, 36)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 37, 38)),
        L('Chave de Perdedores R4', inRange(matches, 39, 40)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 41, 42)),
        W('Semifinais', inRange(matches, 43, 44)),
        Finais(45, 46),
      ];
    case 25:
      return [
        W('Primeira Rodada', inRange(matches, 1, 9)),
        L('Chave de Perdedores R1', single(matches, 10)),
        W('Segunda Rodada', inRange(matches, 11, 18)),
        L('Chave de Perdedores R2', inRange(matches, 19, 26)),
        L('Chave de Perdedores R3', inRange(matches, 27, 30)),
        W('Quartas — Vencedores', inRange(matches, 31, 34)),
        L('Chave de Perdedores R4', inRange(matches, 35, 38)),
        L('Chave de Perdedores R5', inRange(matches, 39, 40)),
        W('Vaga para a Semi-Final - Vencedores', inRange(matches, 41, 42)),
        L('Vaga para a Semi-Final - Perdedores', inRange(matches, 43, 44)),
        W('Semifinais', inRange(matches, 45, 46)),
        Finais(47, 48),
      ];
    default:
      return [];
  }
  })();
  return reorderRoundsByDependencies(built);
}

export type FinalsInfo = {
  finalMatchNumber: number;
  thirdPlaceMatchNumber: number;
};

export function getFinalsMatchNumbers(numTeams: number): FinalsInfo {
  switch (numTeams) {
    case 8:  return { finalMatchNumber: 14, thirdPlaceMatchNumber: 13 };
    case 9:  return { finalMatchNumber: 16, thirdPlaceMatchNumber: 15 };
    case 12: return { finalMatchNumber: 22, thirdPlaceMatchNumber: 21 };
    case 14: return { finalMatchNumber: 26, thirdPlaceMatchNumber: 25 };
    case 16: return { finalMatchNumber: 30, thirdPlaceMatchNumber: 29 };
    case 18: return { finalMatchNumber: 34, thirdPlaceMatchNumber: 33 };
    case 20: return { finalMatchNumber: 38, thirdPlaceMatchNumber: 37 };
    case 24: return { finalMatchNumber: 46, thirdPlaceMatchNumber: 45 };
    case 25: return { finalMatchNumber: 48, thirdPlaceMatchNumber: 47 };
    default: return { finalMatchNumber: 30, thirdPlaceMatchNumber: 29 };
  }
}

export function getTeamLabel(
  match: Match,
  teams: Record<string, Team>,
  slot: 1 | 2,
): string {
  const teamId = slot === 1 ? match.team1_id : match.team2_id;
  const dependsOn = slot === 1 ? match.depends_on_match1 : match.depends_on_match2;
  const takesWinner = slot === 1 ? match.takes_winner_match1 : match.takes_winner_match2;

  if (teamId && teams[teamId]) return teams[teamId].name;
  if (dependsOn) {
    const prefix = takesWinner === false ? 'Perdedor' : 'Vencedor';
    return `${prefix} J${dependsOn}`;
  }
  return '—';
}
