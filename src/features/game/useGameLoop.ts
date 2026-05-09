import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateBetId } from "@/features/game/bets";
import {
  COUNTDOWN_SECONDS,
  IDLE_SECONDS,
  LOCKDOWN_SECONDS,
  MAX_HISTORY_ITEMS,
  REVEAL_SECONDS,
  ROLLING_SECONDS,
  SETTLE_SECONDS,
  STARTING_BALANCE,
} from "@/features/game/constants";
import { randomDice } from "@/features/game/dice";
import { createRoundRecord, settleBets } from "@/features/game/payouts";
import type {
  BetOption,
  DiceResult,
  GamePhase,
  PayoutSummary,
  PendingBet,
  PlacedBet,
  RoundRecord,
} from "@/features/game/types";
import { createLoopingSfx, playSfx } from "@/lib/audio";

export type GameLoopState = {
  balance: number;
  roundNumber: number;
  phase: GamePhase;
  secondsLeft: number;
  bets: PlacedBet[];
  pendingBets: PendingBet[];
  result: DiceResult;
  summary: PayoutSummary | null;
  history: RoundRecord[];
  pendingTotal: number;
  totalStaked: number;
  availableBalance: number;
  canBet: boolean;
  hasWon: boolean;
};

export type GameLoopActions = {
  queueBet: (option: BetOption, chip: number) => void;
  confirmPendingBets: () => void;
  clearPendingBets: () => void;
};

export type UseGameLoopOptions = {
  nickname: string;
};

export function useGameLoop({ nickname }: UseGameLoopOptions): [
  GameLoopState,
  GameLoopActions,
] {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [roundNumber, setRoundNumber] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(IDLE_SECONDS);
  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [result, setResult] = useState<DiceResult>(() => randomDice());
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [history, setHistory] = useState<RoundRecord[]>([]);

  const betsRef = useRef(bets);
  const rollingAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickSecondRef = useRef<number | null>(null);

  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const totalStaked = useMemo(
    () => bets.reduce((sum, bet) => sum + bet.stake, 0),
    [bets],
  );
  const pendingTotal = useMemo(
    () => pendingBets.reduce((sum, bet) => sum + bet.stake, 0),
    [pendingBets],
  );

  const canBet = Boolean(nickname) && phase === "countdown";
  const hasWon = Boolean(summary && summary.totalPayout > 0);
  const availableBalance = balance - pendingTotal;

  // Countdown tick chime for the last 10 seconds of the countdown.
  useEffect(() => {
    if (!nickname || phase !== "countdown" || secondsLeft !== 10) {
      if (phase !== "countdown") {
        lastTickSecondRef.current = null;
      }
      return;
    }

    if (lastTickSecondRef.current === secondsLeft) return;

    lastTickSecondRef.current = secondsLeft;
    playSfx("countdown-chime");
  }, [nickname, phase, secondsLeft]);

  // Phase-entry SFX cues:
  //   - game-start plays when the betting window opens (player can place bets)
  //   - chain-lock plays when the betting window closes (countdown → lockdown)
  //   - kaching plays on reveal if the player actually won credits
  useEffect(() => {
    if (!nickname) return;
    if (phase === "countdown") playSfx("game-start");
    if (phase === "lockdown") playSfx("chain-lock");
    if (phase === "reveal" && summary && summary.totalPayout > summary.totalStake) {
      playSfx("kaching");
    }
  }, [nickname, phase, summary]);

  // Rolling audio lifecycle.
  useEffect(() => {
    if (!nickname || phase !== "rolling") {
      rollingAudioRef.current?.pause();
      rollingAudioRef.current = null;
      return;
    }

    const audio = createLoopingSfx("dice-shake");
    rollingAudioRef.current = audio;
    void audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      rollingAudioRef.current = null;
    };
  }, [nickname, phase]);

  // Core state machine driven by a 1s tick.
  useEffect(() => {
    if (!nickname) return;

    const timeout = window.setTimeout(() => {
      if (phase === "idle") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("rolling");
        setSecondsLeft(ROLLING_SECONDS);
        setBets([]);
        setPendingBets([]);
        setSummary(null);
        setResult(randomDice());
        return;
      }

      if (phase === "rolling") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setResult(randomDice());
        setPhase("countdown");
        setSecondsLeft(COUNTDOWN_SECONDS);
        return;
      }

      if (phase === "countdown") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("lockdown");
        setSecondsLeft(LOCKDOWN_SECONDS);
        setPendingBets([]);
        return;
      }

      if (phase === "lockdown") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        const nextResult = result;
        const activeBets = betsRef.current;
        const nextSummary = settleBets(activeBets, nextResult);
        setResult(nextResult);
        setSummary(nextSummary);
        setBalance((current) => current + nextSummary.totalPayout);
        setHistory((current) =>
          [
            createRoundRecord(roundNumber, nextResult, nextSummary),
            ...current,
          ].slice(0, MAX_HISTORY_ITEMS),
        );
        setPhase("reveal");
        setSecondsLeft(REVEAL_SECONDS);
        return;
      }

      if (phase === "reveal") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("settling");
        setSecondsLeft(SETTLE_SECONDS);
        return;
      }

      if (secondsLeft > 1) {
        setSecondsLeft((current) => current - 1);
        return;
      }

      setRoundNumber((current) => current + 1);
      setPhase("idle");
      setSecondsLeft(IDLE_SECONDS);
      setBets([]);
      setPendingBets([]);
      setSummary(null);
      setResult(randomDice());
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [nickname, phase, result, roundNumber, secondsLeft]);

  const queueBet = useCallback(
    (option: BetOption, chip: number) => {
      if (!canBet) return;
      if (balance - pendingTotal < chip) return;

      playSfx("button-click");
      setPendingBets((current) => {
        const existingBet = current.find((bet) => bet.option.id === option.id);
        if (!existingBet) {
          return [...current, { option, stake: chip }];
        }
        return current.map((bet) =>
          bet.option.id === option.id
            ? { ...bet, stake: bet.stake + chip }
            : bet,
        );
      });
    },
    [balance, canBet, pendingTotal],
  );

  const confirmPendingBets = useCallback(() => {
    if (!canBet || pendingBets.length === 0 || pendingTotal > balance) return;

    const confirmedBets = pendingBets.map((bet) => ({
      id: generateBetId(),
      option: bet.option,
      stake: bet.stake,
    }));

    setBets((current) => [...current, ...confirmedBets]);
    setBalance((current) => current - pendingTotal);
    setPendingBets([]);
    playSfx("confirm-bet");
  }, [balance, canBet, pendingBets, pendingTotal]);

  const clearPendingBets = useCallback(() => {
    if (!canBet) return;
    playSfx("button-click");
    setPendingBets([]);
  }, [canBet]);

  const state: GameLoopState = {
    balance,
    roundNumber,
    phase,
    secondsLeft,
    bets,
    pendingBets,
    result,
    summary,
    history,
    pendingTotal,
    totalStaked,
    availableBalance,
    canBet,
    hasWon,
  };

  const actions: GameLoopActions = {
    queueBet,
    confirmPendingBets,
    clearPendingBets,
  };

  return [state, actions];
}
