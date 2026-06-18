interface MatchProgressionRule {
  sourceMatch: number;
  targetMatch: number;
  takesWinner: boolean;
  position: 'team1' | 'team2';
}

// Regras de progressão para 8 duplas (14 jogos)
export const progressionRules8: MatchProgressionRule[] = [
  // Jogo 5: Perdedor do jogo 3 x Perdedor do jogo 4
  { sourceMatch: 3, targetMatch: 5, takesWinner: false, position: 'team1' },
  { sourceMatch: 4, targetMatch: 5, takesWinner: false, position: 'team2' },

  // Jogo 6: Perdedor do jogo 1 x Perdedor do jogo 2
  { sourceMatch: 1, targetMatch: 6, takesWinner: false, position: 'team1' },
  { sourceMatch: 2, targetMatch: 6, takesWinner: false, position: 'team2' },

  // Jogo 7: Vencedor do Jogo 1 x vencedor do jogo 2
  { sourceMatch: 1, targetMatch: 7, takesWinner: true, position: 'team1' },
  { sourceMatch: 2, targetMatch: 7, takesWinner: true, position: 'team2' },

  // Jogo 8: Vencedor do jogo 3 x Vencedor do jogo 4
  { sourceMatch: 3, targetMatch: 8, takesWinner: true, position: 'team1' },
  { sourceMatch: 4, targetMatch: 8, takesWinner: true, position: 'team2' },

  // Jogo 9: Vencedor do jogo 5 x Perdedor do jogo 8
  { sourceMatch: 5, targetMatch: 9, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 9, takesWinner: false, position: 'team2' },

  // Jogo 10: perdedor do jogo 7 x vencedor do jogo 6
  { sourceMatch: 7, targetMatch: 10, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 10, takesWinner: true, position: 'team2' },

  // Jogo 11: Vencedor do jogo 9 x Vencedor do jogo 7
  { sourceMatch: 9, targetMatch: 11, takesWinner: true, position: 'team1' },
  { sourceMatch: 7, targetMatch: 11, takesWinner: true, position: 'team2' },

  // Jogo 12: Vencedor do jogo 8 x Vencedor do jogo 10
  { sourceMatch: 8, targetMatch: 12, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 12, takesWinner: true, position: 'team2' },

  // Jogo 13: Perdedor do jogo 12 x Perdedor do jogo 11
  { sourceMatch: 12, targetMatch: 13, takesWinner: false, position: 'team1' },
  { sourceMatch: 11, targetMatch: 13, takesWinner: false, position: 'team2' },

  // Jogo 14: Vencedor do jogo 11 x Vencedor do jogo 12
  { sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 14, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 9 duplas (16 jogos)
export const progressionRules9: MatchProgressionRule[] = [
  // Jogo 5: Vencedor do jogo 1 x Dupla 9
  { sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1' },
  
  // Jogo 6: Perdedor do jogo 1 x Perdedor do jogo 4
  { sourceMatch: 1, targetMatch: 6, takesWinner: false, position: 'team1' },
  { sourceMatch: 4, targetMatch: 6, takesWinner: false, position: 'team2' },
  
  // Jogo 7: Perdedor do jogo 2 x Perdedor do jogo 3
  { sourceMatch: 2, targetMatch: 7, takesWinner: false, position: 'team1' },
  { sourceMatch: 3, targetMatch: 7, takesWinner: false, position: 'team2' },
  
  // Jogo 8: Vencedor do jogo 5 x Vencedor do jogo 2
  { sourceMatch: 5, targetMatch: 8, takesWinner: true, position: 'team1' },
  { sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team2' },
  
  // Jogo 9: Vencedor do jogo 3 x Vencedor do jogo 4
  { sourceMatch: 3, targetMatch: 9, takesWinner: true, position: 'team1' },
  { sourceMatch: 4, targetMatch: 9, takesWinner: true, position: 'team2' },
  
  // Jogo 10: Vencedor do jogo 7 x Perdedor do jogo 5
  { sourceMatch: 7, targetMatch: 10, takesWinner: true, position: 'team1' },
  { sourceMatch: 5, targetMatch: 10, takesWinner: false, position: 'team2' },
  
  // Jogo 11: Perdedor do jogo 8 x Vencedor do jogo 6
  { sourceMatch: 8, targetMatch: 11, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 11, takesWinner: true, position: 'team2' },
  
  // Jogo 12: Vencedor do jogo 10 x Perdedor do jogo 9
  { sourceMatch: 10, targetMatch: 12, takesWinner: true, position: 'team1' },
  { sourceMatch: 9, targetMatch: 12, takesWinner: false, position: 'team2' },
  
  // Jogo 13 (Semi 1): Vencedor do jogo 8 x Vencedor do jogo 12
  { sourceMatch: 8, targetMatch: 13, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 13, takesWinner: true, position: 'team2' },
  
  // Jogo 14 (Semi 2): Vencedor do jogo 9 x Vencedor do jogo 11
  { sourceMatch: 9, targetMatch: 14, takesWinner: true, position: 'team1' },
  { sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team2' },
  
  // Jogo 15 (Terceiro): Perdedor do jogo 13 x Perdedor do jogo 14
  { sourceMatch: 13, targetMatch: 15, takesWinner: false, position: 'team1' },
  { sourceMatch: 14, targetMatch: 15, takesWinner: false, position: 'team2' },
  
  // Jogo 16 (Final): Vencedor do jogo 13 x Vencedor do jogo 14
  { sourceMatch: 13, targetMatch: 16, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 16, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 14 duplas (26 jogos)
export const progressionRules14: MatchProgressionRule[] = [
  // Jogo 7: vencedor do jogo 1 x dupla 13
  { sourceMatch: 1, targetMatch: 7, takesWinner: true, position: 'team1' },
  
  // Jogo 8: vencedor do jogo 2 x vencedor do jogo 3
  { sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team1' },
  { sourceMatch: 3, targetMatch: 8, takesWinner: true, position: 'team2' },
  
  // Jogo 9: vencedor do jogo 4 x vencedor do jogo 5
  { sourceMatch: 4, targetMatch: 9, takesWinner: true, position: 'team1' },
  { sourceMatch: 5, targetMatch: 9, takesWinner: true, position: 'team2' },
  
  // Jogo 10: vencedor do jogo 6 x dupla 14
  { sourceMatch: 6, targetMatch: 10, takesWinner: true, position: 'team1' },
  
  // Jogo 11: perdedor do jogo 4 x perdedor do jogo 5
  { sourceMatch: 4, targetMatch: 11, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 11, takesWinner: false, position: 'team2' },
  
  // Jogo 12: perdedor do jogo 2 x perdedor do jogo 3
  { sourceMatch: 2, targetMatch: 12, takesWinner: false, position: 'team1' },
  { sourceMatch: 3, targetMatch: 12, takesWinner: false, position: 'team2' },
  
  // Jogo 13: perdedor do jogo 6 x perdedor do jogo 7
  { sourceMatch: 6, targetMatch: 13, takesWinner: false, position: 'team1' },
  { sourceMatch: 7, targetMatch: 13, takesWinner: false, position: 'team2' },
  
  // Jogo 14: vencedor do jogo 11 x perdedor do jogo 8
  { sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 14, takesWinner: false, position: 'team2' },
  
  // Jogo 15: vencedor do jogo 12 x perdedor do jogo 9
  { sourceMatch: 12, targetMatch: 15, takesWinner: true, position: 'team1' },
  { sourceMatch: 9, targetMatch: 15, takesWinner: false, position: 'team2' },
  
  // Jogo 16: perdedor do jogo 1 x perdedor do jogo 10
  { sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team1' },
  { sourceMatch: 10, targetMatch: 16, takesWinner: false, position: 'team2' },
  
  // Jogo 17: vencedor do jogo 7 x vencedor do jogo 8
  { sourceMatch: 7, targetMatch: 17, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 17, takesWinner: true, position: 'team2' },
  
  // Jogo 18: vencedor do jogo 9 x vencedor do jogo 10
  { sourceMatch: 9, targetMatch: 18, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 18, takesWinner: true, position: 'team2' },
  
  // Jogo 19: vencedor do jogo 13 x vencedor do jogo 14
  { sourceMatch: 13, targetMatch: 19, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 19, takesWinner: true, position: 'team2' },
  
  // Jogo 20: vencedor do jogo 15 x vencedor do jogo 16
  { sourceMatch: 15, targetMatch: 20, takesWinner: true, position: 'team1' },
  { sourceMatch: 16, targetMatch: 20, takesWinner: true, position: 'team2' },
  
  // Jogo 21: perdedor do jogo 18 x vencedor do jogo 19
  { sourceMatch: 18, targetMatch: 21, takesWinner: false, position: 'team1' },
  { sourceMatch: 19, targetMatch: 21, takesWinner: true, position: 'team2' },
  
  // Jogo 22: perdedor do jogo 17 x vencedor do jogo 20
  { sourceMatch: 17, targetMatch: 22, takesWinner: false, position: 'team1' },
  { sourceMatch: 20, targetMatch: 22, takesWinner: true, position: 'team2' },
  
  // Jogo 23 (Semi Final): vencedor do jogo 17 x vencedor do jogo 21
  { sourceMatch: 17, targetMatch: 23, takesWinner: true, position: 'team1' },
  { sourceMatch: 21, targetMatch: 23, takesWinner: true, position: 'team2' },
  
  // Jogo 24 (Semi Final): vencedor do jogo 18 x vencedor do jogo 22
  { sourceMatch: 18, targetMatch: 24, takesWinner: true, position: 'team1' },
  { sourceMatch: 22, targetMatch: 24, takesWinner: true, position: 'team2' },
  
  // Jogo 25 (Terceiro Lugar): perdedor do jogo 23 x perdedor do jogo 24
  { sourceMatch: 23, targetMatch: 25, takesWinner: false, position: 'team1' },
  { sourceMatch: 24, targetMatch: 25, takesWinner: false, position: 'team2' },
  
  // Jogo 26 (Final): vencedor do jogo 23 x vencedor do jogo 24
  { sourceMatch: 23, targetMatch: 26, takesWinner: true, position: 'team1' },
  { sourceMatch: 24, targetMatch: 26, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 18 duplas (34 jogos)
export const progressionRules18: MatchProgressionRule[] = [
  // Jogo 9: Vencedor do jogo 1 x Dupla 17
  { sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1' },
  
  // Jogo 10: Vencedor do jogo 2 x Dupla 18
  { sourceMatch: 2, targetMatch: 10, takesWinner: true, position: 'team1' },
  
  // Jogo 11: Perdedor do jogo 2 x Perdedor do jogo 9
  { sourceMatch: 2, targetMatch: 11, takesWinner: false, position: 'team1' },
  { sourceMatch: 9, targetMatch: 11, takesWinner: false, position: 'team2' },
  
  // Jogo 12: Perdedor do jogo 10 x Perdedor do jogo 1
  { sourceMatch: 10, targetMatch: 12, takesWinner: false, position: 'team1' },
  { sourceMatch: 1, targetMatch: 12, takesWinner: false, position: 'team2' },
  
  // Jogo 13: Vencedor do jogo 9 x Vencedor do jogo 3
  { sourceMatch: 9, targetMatch: 13, takesWinner: true, position: 'team1' },
  { sourceMatch: 3, targetMatch: 13, takesWinner: true, position: 'team2' },
  
  // Jogo 14: Vencedor do jogo 4 x Vencedor do jogo 5
  { sourceMatch: 4, targetMatch: 14, takesWinner: true, position: 'team1' },
  { sourceMatch: 5, targetMatch: 14, takesWinner: true, position: 'team2' },
  
  // Jogo 15: Vencedor do jogo 6 x Vencedor do jogo 7
  { sourceMatch: 6, targetMatch: 15, takesWinner: true, position: 'team1' },
  { sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team2' },
  
  // Jogo 16: Vencedor do jogo 8 x Vencedor do jogo 10
  { sourceMatch: 8, targetMatch: 16, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 16, takesWinner: true, position: 'team2' },
  
  // Jogo 17: Vencedor do jogo 12 x Perdedor do jogo 8
  { sourceMatch: 12, targetMatch: 17, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 17, takesWinner: false, position: 'team2' },
  
  // Jogo 18: Perdedor do jogo 7 x Perdedor do jogo 6
  { sourceMatch: 7, targetMatch: 18, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 18, takesWinner: false, position: 'team2' },
  
  // Jogo 19: Perdedor do jogo 5 x Perdedor do jogo 4
  { sourceMatch: 5, targetMatch: 19, takesWinner: false, position: 'team1' },
  { sourceMatch: 4, targetMatch: 19, takesWinner: false, position: 'team2' },
  
  // Jogo 20: Perdedor do jogo 3 x Vencedor do jogo 11
  { sourceMatch: 3, targetMatch: 20, takesWinner: false, position: 'team1' },
  { sourceMatch: 11, targetMatch: 20, takesWinner: true, position: 'team2' },
  
  // Jogo 21: Vencedor do jogo 17 x Perdedor do jogo 13
  { sourceMatch: 17, targetMatch: 21, takesWinner: true, position: 'team1' },
  { sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team2' },
  
  // Jogo 22: Vencedor do jogo 18 x Perdedor do jogo 14
  { sourceMatch: 18, targetMatch: 22, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team2' },
  
  // Jogo 23: Vencedor do jogo 19 x Perdedor do jogo 15
  { sourceMatch: 19, targetMatch: 23, takesWinner: true, position: 'team1' },
  { sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team2' },
  
  // Jogo 24: Vencedor do jogo 20 x Perdedor do jogo 16
  { sourceMatch: 20, targetMatch: 24, takesWinner: true, position: 'team1' },
  { sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team2' },
  
  // Jogo 25: Vencedor do jogo 13 x Vencedor do jogo 14
  { sourceMatch: 13, targetMatch: 25, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 25, takesWinner: true, position: 'team2' },
  
  // Jogo 26: Vencedor do jogo 15 x Vencedor do jogo 16
  { sourceMatch: 15, targetMatch: 26, takesWinner: true, position: 'team1' },
  { sourceMatch: 16, targetMatch: 26, takesWinner: true, position: 'team2' },
  
  // Jogo 27: Vencedor do jogo 21 x Vencedor do jogo 22
  { sourceMatch: 21, targetMatch: 27, takesWinner: true, position: 'team1' },
  { sourceMatch: 22, targetMatch: 27, takesWinner: true, position: 'team2' },
  
  // Jogo 28: Vencedor do jogo 23 x Vencedor do jogo 24
  { sourceMatch: 23, targetMatch: 28, takesWinner: true, position: 'team1' },
  { sourceMatch: 24, targetMatch: 28, takesWinner: true, position: 'team2' },
  
  // Jogo 29: Perdedor do jogo 26 x Vencedor do jogo 27
  { sourceMatch: 26, targetMatch: 29, takesWinner: false, position: 'team1' },
  { sourceMatch: 27, targetMatch: 29, takesWinner: true, position: 'team2' },
  
  // Jogo 30: Perdedor do jogo 25 x Vencedor do jogo 28
  { sourceMatch: 25, targetMatch: 30, takesWinner: false, position: 'team1' },
  { sourceMatch: 28, targetMatch: 30, takesWinner: true, position: 'team2' },
  
  // Jogo 31 (Semi Final): Vencedor do jogo 25 x Vencedor do jogo 29
  { sourceMatch: 25, targetMatch: 31, takesWinner: true, position: 'team1' },
  { sourceMatch: 29, targetMatch: 31, takesWinner: true, position: 'team2' },
  
  // Jogo 32 (Semi Final): Vencedor do jogo 26 x Vencedor do jogo 30
  { sourceMatch: 26, targetMatch: 32, takesWinner: true, position: 'team1' },
  { sourceMatch: 30, targetMatch: 32, takesWinner: true, position: 'team2' },
  
  // Jogo 33 (3o Lugar): Perdedor do jogo 31 x Perdedor do jogo 32
  { sourceMatch: 31, targetMatch: 33, takesWinner: false, position: 'team1' },
  { sourceMatch: 32, targetMatch: 33, takesWinner: false, position: 'team2' },
  
  // Jogo 34 (Final): Vencedor do jogo 31 x Vencedor do jogo 32
  { sourceMatch: 31, targetMatch: 34, takesWinner: true, position: 'team1' },
  { sourceMatch: 32, targetMatch: 34, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 25 duplas (48 jogos)
export const progressionRules25: MatchProgressionRule[] = [
  // Jogo 10: Perdedor do jogo 2 X perdedor do jogo 3
  { sourceMatch: 2, targetMatch: 10, takesWinner: false, position: 'team1' },
  { sourceMatch: 3, targetMatch: 10, takesWinner: false, position: 'team2' },
  
  // Jogo 11: Vencedor do jogo 1 x Dupla 19
  { sourceMatch: 1, targetMatch: 11, takesWinner: true, position: 'team1' },
  
  // Jogo 12: Vencedor do jogo 2 x Vencedor do jogo 3
  { sourceMatch: 2, targetMatch: 12, takesWinner: true, position: 'team1' },
  { sourceMatch: 3, targetMatch: 12, takesWinner: true, position: 'team2' },
  
  // Jogo 13: Vencedor do jogo 4 x Dupla 20
  { sourceMatch: 4, targetMatch: 13, takesWinner: true, position: 'team1' },
  
  // Jogo 14: Vencedor do jogo 5 x Dupla 21
  { sourceMatch: 5, targetMatch: 14, takesWinner: true, position: 'team1' },
  
  // Jogo 15: Vencedor do jogo 6 x Dupla 22
  { sourceMatch: 6, targetMatch: 15, takesWinner: true, position: 'team1' },
  
  // Jogo 16: Vencedor do jogo 7 x Dupla 23
  { sourceMatch: 7, targetMatch: 16, takesWinner: true, position: 'team1' },
  
  // Jogo 17: Vencedor do jogo 8 x Dupla 24
  { sourceMatch: 8, targetMatch: 17, takesWinner: true, position: 'team1' },
  
  // Jogo 18: Vencedor do jogo 9 x Dupla 25
  { sourceMatch: 9, targetMatch: 18, takesWinner: true, position: 'team1' },
  
  // Jogo 19: Perdedor do jogo 11 x Perdedor do jogo 9
  { sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team1' },
  { sourceMatch: 9, targetMatch: 19, takesWinner: false, position: 'team2' },
  
  // Jogo 20: Perdedor do jogo 12 x Perdedor do jogo 8
  { sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team1' },
  { sourceMatch: 8, targetMatch: 20, takesWinner: false, position: 'team2' },
  
  // Jogo 21: Perdedor do jogo 13 x Perdedor do jogo 7
  { sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team1' },
  { sourceMatch: 7, targetMatch: 21, takesWinner: false, position: 'team2' },
  
  // Jogo 22: Perdedor do jogo 14 x Perdedor do jogo 6
  { sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 22, takesWinner: false, position: 'team2' },
  
  // Jogo 23: Perdedor do jogo 15 x Perdedor do jogo 5
  { sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 23, takesWinner: false, position: 'team2' },
  
  // Jogo 24: Perdedor do jogo 16 x Perdedor do jogo 4
  { sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team1' },
  { sourceMatch: 4, targetMatch: 24, takesWinner: false, position: 'team2' },
  
  // Jogo 25: Perdedor do jogo 17 x Vencedor do jogo 10
  { sourceMatch: 17, targetMatch: 25, takesWinner: false, position: 'team1' },
  { sourceMatch: 10, targetMatch: 25, takesWinner: true, position: 'team2' },
  
  // Jogo 26: Perdedor do jogo 18 x Perdedor do jogo 1
  { sourceMatch: 18, targetMatch: 26, takesWinner: false, position: 'team1' },
  { sourceMatch: 1, targetMatch: 26, takesWinner: false, position: 'team2' },
  
  // Jogo 27: Vencedor do jogo 19 x Vencedor do jogo 20
  { sourceMatch: 19, targetMatch: 27, takesWinner: true, position: 'team1' },
  { sourceMatch: 20, targetMatch: 27, takesWinner: true, position: 'team2' },
  
  // Jogo 28: Vencedor do jogo 21 x Vencedor do jogo 22
  { sourceMatch: 21, targetMatch: 28, takesWinner: true, position: 'team1' },
  { sourceMatch: 22, targetMatch: 28, takesWinner: true, position: 'team2' },
  
  // Jogo 29: Vencedor do jogo 23 x Vencedor do jogo 24
  { sourceMatch: 23, targetMatch: 29, takesWinner: true, position: 'team1' },
  { sourceMatch: 24, targetMatch: 29, takesWinner: true, position: 'team2' },
  
  // Jogo 30: Vencedor do jogo 25 x Vencedor do jogo 26
  { sourceMatch: 25, targetMatch: 30, takesWinner: true, position: 'team1' },
  { sourceMatch: 26, targetMatch: 30, takesWinner: true, position: 'team2' },
  
  // Jogo 31: Vencedor do jogo 11 x Vencedor do jogo 12
  { sourceMatch: 11, targetMatch: 31, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 31, takesWinner: true, position: 'team2' },
  
  // Jogo 32: Vencedor do jogo 13 x Vencedor do jogo 14
  { sourceMatch: 13, targetMatch: 32, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 32, takesWinner: true, position: 'team2' },
  
  // Jogo 33: Vencedor do jogo 15 x Vencedor do jogo 16
  { sourceMatch: 15, targetMatch: 33, takesWinner: true, position: 'team1' },
  { sourceMatch: 16, targetMatch: 33, takesWinner: true, position: 'team2' },
  
  // Jogo 34: Vencedor do jogo 17 x Vencedor do jogo 18
  { sourceMatch: 17, targetMatch: 34, takesWinner: true, position: 'team1' },
  { sourceMatch: 18, targetMatch: 34, takesWinner: true, position: 'team2' },
  
  // Jogo 35: Perdedor do jogo 32 x Vencedor do jogo 30
  { sourceMatch: 32, targetMatch: 35, takesWinner: false, position: 'team1' },
  { sourceMatch: 30, targetMatch: 35, takesWinner: true, position: 'team2' },
  
  // Jogo 36: Perdedor do jogo 31 x Vencedor do jogo 29
  { sourceMatch: 31, targetMatch: 36, takesWinner: false, position: 'team1' },
  { sourceMatch: 29, targetMatch: 36, takesWinner: true, position: 'team2' },
  
  // Jogo 37: Perdedor do jogo 34 X Vencedor do jogo 28
  { sourceMatch: 34, targetMatch: 37, takesWinner: false, position: 'team1' },
  { sourceMatch: 28, targetMatch: 37, takesWinner: true, position: 'team2' },
  
  // Jogo 38: Perdedor do jogo 33 x Vencedor do jogo 27
  { sourceMatch: 33, targetMatch: 38, takesWinner: false, position: 'team1' },
  { sourceMatch: 27, targetMatch: 38, takesWinner: true, position: 'team2' },
  
  // Jogo 39: Vencedor do jogo 36 x Vencedor do jogo 35
  { sourceMatch: 36, targetMatch: 39, takesWinner: true, position: 'team1' },
  { sourceMatch: 35, targetMatch: 39, takesWinner: true, position: 'team2' },
  
  // Jogo 40: Vencedor do jogo 38 x Vencedor do jogo 37
  { sourceMatch: 38, targetMatch: 40, takesWinner: true, position: 'team1' },
  { sourceMatch: 37, targetMatch: 40, takesWinner: true, position: 'team2' },
  
  // Jogo 41: Vencedor do jogo 31 x Vencedor do jogo 32
  { sourceMatch: 31, targetMatch: 41, takesWinner: true, position: 'team1' },
  { sourceMatch: 32, targetMatch: 41, takesWinner: true, position: 'team2' },
  
  // Jogo 42: Vencedor do jogo 33 x Vencedor do jogo 34
  { sourceMatch: 33, targetMatch: 42, takesWinner: true, position: 'team1' },
  { sourceMatch: 34, targetMatch: 42, takesWinner: true, position: 'team2' },
  
  // Jogo 43: Perdedor do jogo 41 x Vencedor do jogo 40
  { sourceMatch: 41, targetMatch: 43, takesWinner: false, position: 'team1' },
  { sourceMatch: 40, targetMatch: 43, takesWinner: true, position: 'team2' },
  
  // Jogo 44: Perdedor do jogo 42 x Vencedor do jogo 39
  { sourceMatch: 42, targetMatch: 44, takesWinner: false, position: 'team1' },
  { sourceMatch: 39, targetMatch: 44, takesWinner: true, position: 'team2' },
  
  // Jogo 45 (Semi Final): Vencedor do jogo 44 x Vencedor do jogo 41
  { sourceMatch: 44, targetMatch: 45, takesWinner: true, position: 'team1' },
  { sourceMatch: 41, targetMatch: 45, takesWinner: true, position: 'team2' },
  
  // Jogo 46 (Semi Final): Vencedor do jogo 42 x Vencedor do jogo 43
  { sourceMatch: 42, targetMatch: 46, takesWinner: true, position: 'team1' },
  { sourceMatch: 43, targetMatch: 46, takesWinner: true, position: 'team2' },
  
  // Jogo 47 (Terceiro Lugar): Perdedor do jogo 45 x Perdedor do jogo 46
  { sourceMatch: 45, targetMatch: 47, takesWinner: false, position: 'team1' },
  { sourceMatch: 46, targetMatch: 47, takesWinner: false, position: 'team2' },
  
  // Jogo 48 (Final): Vencedor do jogo 45 x Vencedor do jogo 46
  { sourceMatch: 45, targetMatch: 48, takesWinner: true, position: 'team1' },
  { sourceMatch: 46, targetMatch: 48, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 12 duplas (22 jogos)
export const progressionRules12: MatchProgressionRule[] = [
  // Jogo 5: Vencedor do jogo 1 x Dupla 9
  { sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1' },
  
  // Jogo 6: Vencedor do jogo 2 x Dupla 10
  { sourceMatch: 2, targetMatch: 6, takesWinner: true, position: 'team1' },
  
  // Jogo 7: Vencedor do jogo 3 x Dupla 11
  { sourceMatch: 3, targetMatch: 7, takesWinner: true, position: 'team1' },
  
  // Jogo 8: Vencedor do jogo 4 x Dupla 12
  { sourceMatch: 4, targetMatch: 8, takesWinner: true, position: 'team1' },

  // Jogo 9: Perdedor do jogo 1 x Perdedor do jogo 5
  { sourceMatch: 1, targetMatch: 9, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 9, takesWinner: false, position: 'team2' },
  
  // Jogo 10: Perdedor do jogo 2 x Perdedor do jogo 6
  { sourceMatch: 2, targetMatch: 10, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 10, takesWinner: false, position: 'team2' },
  
  // Jogo 11: Perdedor do jogo 4 x Perdedor do jogo 7
  { sourceMatch: 4, targetMatch: 11, takesWinner: false, position: 'team1' },
  { sourceMatch: 7, targetMatch: 11, takesWinner: false, position: 'team2' },
  
  // Jogo 12: Perdedor do jogo 3 x Perdedor do jogo 8
  { sourceMatch: 3, targetMatch: 12, takesWinner: false, position: 'team1' },
  { sourceMatch: 8, targetMatch: 12, takesWinner: false, position: 'team2' },

  // Jogo 13: Vencedor do jogo 9 x Vencedor do jogo 10
  { sourceMatch: 9, targetMatch: 13, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 13, takesWinner: true, position: 'team2' },
  
  // Jogo 14: Vencedor do jogo 11 x Vencedor do jogo 12
  { sourceMatch: 11, targetMatch: 14, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 14, takesWinner: true, position: 'team2' },

  // Jogo 15: Vencedor do jogo 7 x Vencedor do jogo 8
  { sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 15, takesWinner: true, position: 'team2' },
  
  // Jogo 16: Vencedor do jogo 5 x Vencedor do jogo 6
  { sourceMatch: 5, targetMatch: 16, takesWinner: true, position: 'team1' },
  { sourceMatch: 6, targetMatch: 16, takesWinner: true, position: 'team2' },

  // Jogo 17: Perdedor do jogo 15 x Vencedor do jogo 14
  { sourceMatch: 15, targetMatch: 17, takesWinner: false, position: 'team1' },
  { sourceMatch: 14, targetMatch: 17, takesWinner: true, position: 'team2' },
  
  // Jogo 18: Perdedor do jogo 16 x Vencedor do jogo 13
  { sourceMatch: 16, targetMatch: 18, takesWinner: false, position: 'team1' },
  { sourceMatch: 13, targetMatch: 18, takesWinner: true, position: 'team2' },

  // Jogo 19: Vencedor do jogo 16 x Vencedor do jogo 17
  { sourceMatch: 16, targetMatch: 19, takesWinner: true, position: 'team1' },
  { sourceMatch: 17, targetMatch: 19, takesWinner: true, position: 'team2' },
  
  // Jogo 20: Vencedor do jogo 18 x Vencedor do jogo 15
  { sourceMatch: 18, targetMatch: 20, takesWinner: true, position: 'team1' },
  { sourceMatch: 15, targetMatch: 20, takesWinner: true, position: 'team2' },

  // Jogo 21: Perdedor do jogo 19 x Perdedor do jogo 20
  { sourceMatch: 19, targetMatch: 21, takesWinner: false, position: 'team1' },
  { sourceMatch: 20, targetMatch: 21, takesWinner: false, position: 'team2' },

  // Jogo 22: Vencedor do jogo 19 x Vencedor do jogo 20
  { sourceMatch: 19, targetMatch: 22, takesWinner: true, position: 'team1' },
  { sourceMatch: 20, targetMatch: 22, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 16 duplas (30 jogos)
export const progressionRules16: MatchProgressionRule[] = [
  // Jogos 9-12: Vencedores dos jogos 1-8
  { sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1' },
  { sourceMatch: 2, targetMatch: 9, takesWinner: true, position: 'team2' },
  { sourceMatch: 3, targetMatch: 10, takesWinner: true, position: 'team1' },
  { sourceMatch: 4, targetMatch: 10, takesWinner: true, position: 'team2' },
  { sourceMatch: 5, targetMatch: 11, takesWinner: true, position: 'team1' },
  { sourceMatch: 6, targetMatch: 11, takesWinner: true, position: 'team2' },
  { sourceMatch: 7, targetMatch: 12, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 12, takesWinner: true, position: 'team2' },

  // Jogos 13-16: Perdedores dos jogos 1-8 (invertido)
  { sourceMatch: 8, targetMatch: 13, takesWinner: false, position: 'team1' },
  { sourceMatch: 7, targetMatch: 13, takesWinner: false, position: 'team2' },
  { sourceMatch: 6, targetMatch: 14, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 14, takesWinner: false, position: 'team2' },
  { sourceMatch: 4, targetMatch: 15, takesWinner: false, position: 'team1' },
  { sourceMatch: 3, targetMatch: 15, takesWinner: false, position: 'team2' },
  { sourceMatch: 2, targetMatch: 16, takesWinner: false, position: 'team1' },
  { sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team2' },

  // Jogos 17-20: Vencedores de 13-16 x Perdedores de 9-12
  { sourceMatch: 13, targetMatch: 17, takesWinner: true, position: 'team1' },
  { sourceMatch: 9, targetMatch: 17, takesWinner: false, position: 'team2' },
  { sourceMatch: 14, targetMatch: 18, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 18, takesWinner: false, position: 'team2' },
  { sourceMatch: 15, targetMatch: 19, takesWinner: true, position: 'team1' },
  { sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team2' },
  { sourceMatch: 16, targetMatch: 20, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team2' },

  // Jogos 21-22: Valendo vaga para Semi-Final - Vencedores
  { sourceMatch: 9, targetMatch: 21, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 21, takesWinner: true, position: 'team2' },
  { sourceMatch: 11, targetMatch: 22, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 22, takesWinner: true, position: 'team2' },

  // Jogos 23-24: Losers bracket intermediário
  { sourceMatch: 17, targetMatch: 23, takesWinner: true, position: 'team1' },
  { sourceMatch: 18, targetMatch: 23, takesWinner: true, position: 'team2' },
  { sourceMatch: 19, targetMatch: 24, takesWinner: true, position: 'team1' },
  { sourceMatch: 20, targetMatch: 24, takesWinner: true, position: 'team2' },

  // Jogos 25-26: Valendo vaga para Semi-Final - Perdedores
  { sourceMatch: 23, targetMatch: 25, takesWinner: true, position: 'team1' },
  { sourceMatch: 22, targetMatch: 25, takesWinner: false, position: 'team2' },
  { sourceMatch: 24, targetMatch: 26, takesWinner: true, position: 'team1' },
  { sourceMatch: 21, targetMatch: 26, takesWinner: false, position: 'team2' },

  // Jogos 27-28: Semifinais
  { sourceMatch: 21, targetMatch: 27, takesWinner: true, position: 'team1' },
  { sourceMatch: 25, targetMatch: 27, takesWinner: true, position: 'team2' },
  { sourceMatch: 22, targetMatch: 28, takesWinner: true, position: 'team1' },
  { sourceMatch: 26, targetMatch: 28, takesWinner: true, position: 'team2' },

  // Jogo 29: Terceiro Lugar
  { sourceMatch: 27, targetMatch: 29, takesWinner: false, position: 'team1' },
  { sourceMatch: 28, targetMatch: 29, takesWinner: false, position: 'team2' },

  // Jogo 30: Final
  { sourceMatch: 27, targetMatch: 30, takesWinner: true, position: 'team1' },
  { sourceMatch: 28, targetMatch: 30, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 20 duplas (38 jogos)
export const progressionRules20: MatchProgressionRule[] = [
  // Jogo 5: Vencedor do jogo 1 x Dupla 9
  { sourceMatch: 1, targetMatch: 5, takesWinner: true, position: 'team1' },
  // Jogo 8: Vencedor do jogo 2 x Dupla 14
  { sourceMatch: 2, targetMatch: 8, takesWinner: true, position: 'team1' },
  // Jogo 9: Vencedor do jogo 3 x Dupla 15
  { sourceMatch: 3, targetMatch: 9, takesWinner: true, position: 'team1' },
  // Jogo 12: Vencedor do jogo 4 x Dupla 20
  { sourceMatch: 4, targetMatch: 12, takesWinner: true, position: 'team1' },

  // Jogo 13: Perdedor do jogo 4 x Perdedor do jogo 5
  { sourceMatch: 4, targetMatch: 13, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 13, takesWinner: false, position: 'team2' },
  // Jogo 14: Perdedor do jogo 3 x Perdedor do jogo 8
  { sourceMatch: 3, targetMatch: 14, takesWinner: false, position: 'team1' },
  { sourceMatch: 8, targetMatch: 14, takesWinner: false, position: 'team2' },
  // Jogo 15: Perdedor do jogo 2 x Perdedor do jogo 9
  { sourceMatch: 2, targetMatch: 15, takesWinner: false, position: 'team1' },
  { sourceMatch: 9, targetMatch: 15, takesWinner: false, position: 'team2' },
  // Jogo 16: Perdedor do jogo 1 x Perdedor do jogo 12
  { sourceMatch: 1, targetMatch: 16, takesWinner: false, position: 'team1' },
  { sourceMatch: 12, targetMatch: 16, takesWinner: false, position: 'team2' },

  // Jogo 17: Vencedor do jogo 5 x Vencedor do jogo 6
  { sourceMatch: 5, targetMatch: 17, takesWinner: true, position: 'team1' },
  { sourceMatch: 6, targetMatch: 17, takesWinner: true, position: 'team2' },
  // Jogo 18: Vencedor do jogo 7 x Vencedor do jogo 8
  { sourceMatch: 7, targetMatch: 18, takesWinner: true, position: 'team1' },
  { sourceMatch: 8, targetMatch: 18, takesWinner: true, position: 'team2' },
  // Jogo 19: Vencedor do jogo 9 x Vencedor do jogo 10
  { sourceMatch: 9, targetMatch: 19, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 19, takesWinner: true, position: 'team2' },
  // Jogo 20: Vencedor do jogo 11 x Vencedor do jogo 12
  { sourceMatch: 11, targetMatch: 20, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 20, takesWinner: true, position: 'team2' },

  // Jogo 21: Vencedor do jogo 16 x Perdedor do jogo 11
  { sourceMatch: 16, targetMatch: 21, takesWinner: true, position: 'team1' },
  { sourceMatch: 11, targetMatch: 21, takesWinner: false, position: 'team2' },
  // Jogo 22: Vencedor do jogo 15 x Perdedor do jogo 10
  { sourceMatch: 15, targetMatch: 22, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 22, takesWinner: false, position: 'team2' },
  // Jogo 23: Vencedor do jogo 14 x Perdedor do jogo 7
  { sourceMatch: 14, targetMatch: 23, takesWinner: true, position: 'team1' },
  { sourceMatch: 7, targetMatch: 23, takesWinner: false, position: 'team2' },
  // Jogo 24: Vencedor do jogo 13 x Perdedor do jogo 6
  { sourceMatch: 13, targetMatch: 24, takesWinner: true, position: 'team1' },
  { sourceMatch: 6, targetMatch: 24, takesWinner: false, position: 'team2' },

  // Jogo 25: Vencedor do jogo 21 x Perdedor do jogo 17
  { sourceMatch: 21, targetMatch: 25, takesWinner: true, position: 'team1' },
  { sourceMatch: 17, targetMatch: 25, takesWinner: false, position: 'team2' },
  // Jogo 26: Vencedor do jogo 22 x Perdedor do jogo 18
  { sourceMatch: 22, targetMatch: 26, takesWinner: true, position: 'team1' },
  { sourceMatch: 18, targetMatch: 26, takesWinner: false, position: 'team2' },
  // Jogo 27: Vencedor do jogo 23 x Perdedor do jogo 19
  { sourceMatch: 23, targetMatch: 27, takesWinner: true, position: 'team1' },
  { sourceMatch: 19, targetMatch: 27, takesWinner: false, position: 'team2' },
  // Jogo 28: Vencedor do jogo 24 x Perdedor do jogo 20
  { sourceMatch: 24, targetMatch: 28, takesWinner: true, position: 'team1' },
  { sourceMatch: 20, targetMatch: 28, takesWinner: false, position: 'team2' },

  // Jogo 29: Valendo vaga para a Semi-Final - Vencedores
  { sourceMatch: 17, targetMatch: 29, takesWinner: true, position: 'team1' },
  { sourceMatch: 18, targetMatch: 29, takesWinner: true, position: 'team2' },
  // Jogo 30: Valendo vaga para a Semi-Final - Vencedores
  { sourceMatch: 19, targetMatch: 30, takesWinner: true, position: 'team1' },
  { sourceMatch: 20, targetMatch: 30, takesWinner: true, position: 'team2' },

  // Jogo 31: Vencedor do jogo 25 x Vencedor do jogo 26
  { sourceMatch: 25, targetMatch: 31, takesWinner: true, position: 'team1' },
  { sourceMatch: 26, targetMatch: 31, takesWinner: true, position: 'team2' },
  // Jogo 32: Vencedor do jogo 27 x Vencedor do jogo 28
  { sourceMatch: 27, targetMatch: 32, takesWinner: true, position: 'team1' },
  { sourceMatch: 28, targetMatch: 32, takesWinner: true, position: 'team2' },

  // Jogo 33: Valendo a Vaga para a Semi-Final - Perdedores
  { sourceMatch: 30, targetMatch: 33, takesWinner: false, position: 'team1' },
  { sourceMatch: 31, targetMatch: 33, takesWinner: true, position: 'team2' },
  // Jogo 34: Valendo a Vaga para a Semi-Final - Perdedores
  { sourceMatch: 29, targetMatch: 34, takesWinner: false, position: 'team1' },
  { sourceMatch: 32, targetMatch: 34, takesWinner: true, position: 'team2' },

  // Jogo 35: Semi Final
  { sourceMatch: 29, targetMatch: 35, takesWinner: true, position: 'team1' },
  { sourceMatch: 33, targetMatch: 35, takesWinner: true, position: 'team2' },
  // Jogo 36: Semi Final
  { sourceMatch: 30, targetMatch: 36, takesWinner: true, position: 'team1' },
  { sourceMatch: 34, targetMatch: 36, takesWinner: true, position: 'team2' },

  // Jogo 37: Terceiro Lugar
  { sourceMatch: 35, targetMatch: 37, takesWinner: false, position: 'team1' },
  { sourceMatch: 36, targetMatch: 37, takesWinner: false, position: 'team2' },
  // Jogo 38: Final
  { sourceMatch: 35, targetMatch: 38, takesWinner: true, position: 'team1' },
  { sourceMatch: 36, targetMatch: 38, takesWinner: true, position: 'team2' },
];

// Regras de progressão para 24 duplas (46 jogos)
export const progressionRules24: MatchProgressionRule[] = [
  // Jogo 9: Vencedor do jogo 1 x Dupla 17
  { sourceMatch: 1, targetMatch: 9, takesWinner: true, position: 'team1' },
  // Jogo 10: Vencedor do jogo 2 x Dupla 18
  { sourceMatch: 2, targetMatch: 10, takesWinner: true, position: 'team1' },
  // Jogo 11: Vencedor do jogo 3 x Dupla 19
  { sourceMatch: 3, targetMatch: 11, takesWinner: true, position: 'team1' },
  // Jogo 12: Vencedor do jogo 4 x Dupla 20
  { sourceMatch: 4, targetMatch: 12, takesWinner: true, position: 'team1' },
  // Jogo 13: Vencedor do jogo 5 x Dupla 21
  { sourceMatch: 5, targetMatch: 13, takesWinner: true, position: 'team1' },
  // Jogo 14: Vencedor do jogo 6 x Dupla 22
  { sourceMatch: 6, targetMatch: 14, takesWinner: true, position: 'team1' },
  // Jogo 15: Vencedor do jogo 7 x Dupla 23
  { sourceMatch: 7, targetMatch: 15, takesWinner: true, position: 'team1' },
  // Jogo 16: Vencedor do jogo 8 x Dupla 24
  { sourceMatch: 8, targetMatch: 16, takesWinner: true, position: 'team1' },
  
  // Jogo 17: Perdedor do jogo 8 x Perdedor do jogo 9
  { sourceMatch: 8, targetMatch: 17, takesWinner: false, position: 'team1' },
  { sourceMatch: 9, targetMatch: 17, takesWinner: false, position: 'team2' },
  // Jogo 18: Perdedor do jogo 10 x Perdedor do jogo 7
  { sourceMatch: 10, targetMatch: 18, takesWinner: false, position: 'team1' },
  { sourceMatch: 7, targetMatch: 18, takesWinner: false, position: 'team2' },
  // Jogo 19: Perdedor do jogo 11 X Perdedor do jogo 6
  { sourceMatch: 11, targetMatch: 19, takesWinner: false, position: 'team1' },
  { sourceMatch: 6, targetMatch: 19, takesWinner: false, position: 'team2' },
  // Jogo 20: Perdedor do jogo 12 x Perdedor do jogo 5
  { sourceMatch: 12, targetMatch: 20, takesWinner: false, position: 'team1' },
  { sourceMatch: 5, targetMatch: 20, takesWinner: false, position: 'team2' },
  // Jogo 21: Perdedor do jogo 13 x Perdedor do jogo 4
  { sourceMatch: 13, targetMatch: 21, takesWinner: false, position: 'team1' },
  { sourceMatch: 4, targetMatch: 21, takesWinner: false, position: 'team2' },
  // Jogo 22: Perdedor do jogo 14 x Perdedor do jogo 3
  { sourceMatch: 14, targetMatch: 22, takesWinner: false, position: 'team1' },
  { sourceMatch: 3, targetMatch: 22, takesWinner: false, position: 'team2' },
  // Jogo 23: Perdedor do jogo 15 x Perdedor do jogo 2
  { sourceMatch: 15, targetMatch: 23, takesWinner: false, position: 'team1' },
  { sourceMatch: 2, targetMatch: 23, takesWinner: false, position: 'team2' },
  // Jogo 24: Perdedor do jogo 16 x Perdedor do jogo 1
  { sourceMatch: 16, targetMatch: 24, takesWinner: false, position: 'team1' },
  { sourceMatch: 1, targetMatch: 24, takesWinner: false, position: 'team2' },
  
  // Jogo 25: Vencedor do jogo 9 x Vencedor do jogo 10
  { sourceMatch: 9, targetMatch: 25, takesWinner: true, position: 'team1' },
  { sourceMatch: 10, targetMatch: 25, takesWinner: true, position: 'team2' },
  // Jogo 26: Vencedor do jogo 11 x Vencedor do jogo 12
  { sourceMatch: 11, targetMatch: 26, takesWinner: true, position: 'team1' },
  { sourceMatch: 12, targetMatch: 26, takesWinner: true, position: 'team2' },
  // Jogo 27: Vencedor do jogo 13 x Vencedor do jogo 14
  { sourceMatch: 13, targetMatch: 27, takesWinner: true, position: 'team1' },
  { sourceMatch: 14, targetMatch: 27, takesWinner: true, position: 'team2' },
  // Jogo 28: Vencedor do jogo 15 x Vencedor do jogo 16
  { sourceMatch: 15, targetMatch: 28, takesWinner: true, position: 'team1' },
  { sourceMatch: 16, targetMatch: 28, takesWinner: true, position: 'team2' },
  
  // Jogo 29: Vencedor do jogo 24 x Vencedor do jogo 23
  { sourceMatch: 24, targetMatch: 29, takesWinner: true, position: 'team1' },
  { sourceMatch: 23, targetMatch: 29, takesWinner: true, position: 'team2' },
  // Jogo 30: Vencedor do jogo 22 x Vencedor do jogo 21
  { sourceMatch: 22, targetMatch: 30, takesWinner: true, position: 'team1' },
  { sourceMatch: 21, targetMatch: 30, takesWinner: true, position: 'team2' },
  // Jogo 31: Vencedor do jogo 20 x Vencedor do jogo 19
  { sourceMatch: 20, targetMatch: 31, takesWinner: true, position: 'team1' },
  { sourceMatch: 19, targetMatch: 31, takesWinner: true, position: 'team2' },
  // Jogo 32: Vencedor do jogo 18 x Vencedor do jogo 17
  { sourceMatch: 18, targetMatch: 32, takesWinner: true, position: 'team1' },
  { sourceMatch: 17, targetMatch: 32, takesWinner: true, position: 'team2' },
  
  // Jogo 33: Vencedor do jogo 29 x Perdedor do jogo 25
  { sourceMatch: 29, targetMatch: 33, takesWinner: true, position: 'team1' },
  { sourceMatch: 25, targetMatch: 33, takesWinner: false, position: 'team2' },
  // Jogo 34: Vencedor do jogo 30 x Perdedor do jogo 26
  { sourceMatch: 30, targetMatch: 34, takesWinner: true, position: 'team1' },
  { sourceMatch: 26, targetMatch: 34, takesWinner: false, position: 'team2' },
  // Jogo 35: Vencedor do jogo 31 x Perdedor do jogo 27
  { sourceMatch: 31, targetMatch: 35, takesWinner: true, position: 'team1' },
  { sourceMatch: 27, targetMatch: 35, takesWinner: false, position: 'team2' },
  // Jogo 36: Vencedor do jogo 32 x Perdedor do jogo 28
  { sourceMatch: 32, targetMatch: 36, takesWinner: true, position: 'team1' },
  { sourceMatch: 28, targetMatch: 36, takesWinner: false, position: 'team2' },
  
  // Jogo 37: Vencedor do jogo 25 x Vencedor do jogo 26
  { sourceMatch: 25, targetMatch: 37, takesWinner: true, position: 'team1' },
  { sourceMatch: 26, targetMatch: 37, takesWinner: true, position: 'team2' },
  // Jogo 38: Vencedor do jogo 27 x Vencedor do jogo 28
  { sourceMatch: 27, targetMatch: 38, takesWinner: true, position: 'team1' },
  { sourceMatch: 28, targetMatch: 38, takesWinner: true, position: 'team2' },
  
  // Jogo 39: Vencedor do jogo 33 x Vencedor do jogo 34
  { sourceMatch: 33, targetMatch: 39, takesWinner: true, position: 'team1' },
  { sourceMatch: 34, targetMatch: 39, takesWinner: true, position: 'team2' },
  // Jogo 40: Vencedor do jogo 35 x Vencedor do jogo 36
  { sourceMatch: 35, targetMatch: 40, takesWinner: true, position: 'team1' },
  { sourceMatch: 36, targetMatch: 40, takesWinner: true, position: 'team2' },
  
  // Jogo 41: Perdedor do jogo 38 x Vencedor do jogo 39
  { sourceMatch: 38, targetMatch: 41, takesWinner: false, position: 'team1' },
  { sourceMatch: 39, targetMatch: 41, takesWinner: true, position: 'team2' },
  // Jogo 42: Perdedor do jogo 37 x Vencedor do jogo 40
  { sourceMatch: 37, targetMatch: 42, takesWinner: false, position: 'team1' },
  { sourceMatch: 40, targetMatch: 42, takesWinner: true, position: 'team2' },
  
  // Jogo 43: Vencedor do jogo 37 x Vencedor do jogo 41
  { sourceMatch: 37, targetMatch: 43, takesWinner: true, position: 'team1' },
  { sourceMatch: 41, targetMatch: 43, takesWinner: true, position: 'team2' },
  // Jogo 44: Vencedor do jogo 38 x Vencedor do jogo 42
  { sourceMatch: 38, targetMatch: 44, takesWinner: true, position: 'team1' },
  { sourceMatch: 42, targetMatch: 44, takesWinner: true, position: 'team2' },
  
  // Jogo 45: Perdedor do jogo 43 x Perdedor do jogo 44
  { sourceMatch: 43, targetMatch: 45, takesWinner: false, position: 'team1' },
  { sourceMatch: 44, targetMatch: 45, takesWinner: false, position: 'team2' },
  // Jogo 46: Vencedor do jogo 43 x Vencedor do jogo 44
  { sourceMatch: 43, targetMatch: 46, takesWinner: true, position: 'team1' },
  { sourceMatch: 44, targetMatch: 46, takesWinner: true, position: 'team2' },
];
