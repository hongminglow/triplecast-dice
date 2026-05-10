import { Dices } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  MAX_NICKNAME_LENGTH,
  STARTING_BALANCE,
} from "@/features/game/constants";
import { formatCredits } from "@/lib/utils";

type NicknameGateProps = {
  onSubmit: (nickname: string) => void;
};

export function NicknameGate({ onSubmit }: NicknameGateProps) {
  const [nameDraft, setNameDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = nameDraft.trim().slice(0, MAX_NICKNAME_LENGTH);
    if (!cleanName) return;
    onSubmit(cleanName);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] border border-amber-100/20 bg-[#08110e] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.8)]"
      >
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
            Player check-in
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Choose a nickname
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            You will receive {formatCredits(STARTING_BALANCE)} session credits.
          </p>
        </div>
        <label className="block">
          <span className="text-sm font-bold text-stone-300">Nickname</span>
          <input
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            maxLength={MAX_NICKNAME_LENGTH}
            autoFocus
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-lg font-bold text-white outline-none transition placeholder:text-stone-600 focus:border-amber-200/70"
            placeholder="Lucky player"
          />
        </label>
        <button
          type="submit"
          disabled={!nameDraft.trim()}
          className="group relative mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border border-amber-300/60 bg-[#1a1007] px-5 text-sm font-black uppercase tracking-[0.18em] text-amber-100 shadow-[0_18px_44px_rgba(0,0,0,0.45),0_0_26px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,236,179,0.24)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-200/90 hover:bg-[#241508] hover:shadow-[0_24px_58px_rgba(0,0,0,0.52),0_0_34px_rgba(245,158,11,0.28),inset_0_1px_0_rgba(255,236,179,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-white/8 disabled:bg-black/25 disabled:text-stone-600 disabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(252,211,77,0.22),transparent_40%)] opacity-90 group-disabled:hidden"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-amber-100/45 group-disabled:hidden"
          />
          <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-amber-200/50 bg-amber-300/15 text-amber-200 shadow-[inset_0_0_12px_rgba(251,191,36,0.18)] group-disabled:border-white/5 group-disabled:bg-white/5 group-disabled:text-stone-600">
            <Dices size={16} />
          </span>
          <span className="relative">Enter table</span>
        </button>
      </form>
    </div>
  );
}
