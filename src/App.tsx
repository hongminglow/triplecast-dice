import { useState } from "react";

import { AppHeader } from "@/components/chrome/AppHeader";
import { NicknameGate } from "@/components/chrome/NicknameGate";
import { BetBoard } from "@/components/betting/BetBoard";
import { BetSlip } from "@/components/betting/BetSlip";
import { DiceStage } from "@/components/dice-stage/DiceStage";
import { RoundHistory } from "@/components/summary/RoundHistory";
import { useGameLoop } from "@/features/game/useGameLoop";

function App() {
  const [nickname, setNickname] = useState("");
  const [selectedChip, setSelectedChip] = useState(100);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [state, actions] = useGameLoop({ nickname });
  const {
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
  } = state;

  const canConfirmBets =
    canBet && pendingBets.length > 0 && pendingTotal <= balance;
  const revealingWin = hasWon && (phase === "reveal" || phase === "settling");

  return (
    <main className="h-[100svh] overflow-x-hidden overflow-y-auto bg-[#050403] text-stone-100 lg:overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(245,158,11,0.28),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(244,63,94,0.2),transparent_25%),radial-gradient(circle_at_54%_108%,rgba(16,185,129,0.24),transparent_38%),linear-gradient(135deg,#140604,#06140e_50%,#190d03)]" />

      <section className="mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col gap-2 px-2 py-2 sm:px-3 lg:h-[100svh] lg:px-4">
        <AppHeader
          nickname={nickname}
          balance={balance}
          roundNumber={roundNumber}
          history={history}
          isHistoryOpen={isHistoryOpen}
          onToggleHistory={() => setIsHistoryOpen((current) => !current)}
          onCloseHistory={() => setIsHistoryOpen(false)}
        />

        <div className="grid min-h-0 flex-1 gap-2">
          <section className="flex min-h-0 min-w-0 flex-col gap-4">
            <div className="h-[17vh] min-h-[112px] max-h-[150px] rounded-[1.55rem] bg-black/25 shadow-2xl shadow-black/40">
              <DiceStage
                phase={phase}
                result={result}
                secondsLeft={secondsLeft}
                winning={revealingWin}
              />
            </div>

            <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_286px]">
              <BetBoard
                nickname={nickname}
                canBet={canBet}
                selectedChip={selectedChip}
                onSelectChip={setSelectedChip}
                pendingBets={pendingBets}
                pendingTotal={pendingTotal}
                canConfirmBets={canConfirmBets}
                availableBalance={availableBalance}
                onQueueBet={(option) => actions.queueBet(option, selectedChip)}
                onConfirmPending={actions.confirmPendingBets}
                onClearPending={actions.clearPendingBets}
              />

              <aside className="flex min-h-0 flex-col gap-2">
                <BetSlip
                  bets={bets}
                  totalStaked={totalStaked}
                  summary={summary}
                />
                <RoundHistory history={history} />
              </aside>
            </div>
          </section>
        </div>
      </section>

      {!nickname && <NicknameGate onSubmit={setNickname} />}
    </main>
  );
}

export default App;
