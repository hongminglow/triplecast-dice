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
          className="group relative mt-5 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl border border-amber-100/55 bg-gradient-to-r from-amber-200 via-yellow-300 to-emerald-200 px-5 py-4 text-base font-black text-[#140903] shadow-[0_18px_48px_rgba(245,158,11,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(245,158,11,0.34)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-stone-600/40 disabled:bg-none disabled:bg-stone-800 disabled:text-stone-500 disabled:shadow-none"
        >
          <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/35 opacity-0 blur-sm transition duration-300 group-hover:left-full group-hover:opacity-100 group-disabled:hidden" />
          <Dices size={18} className="relative" />
          <span className="relative">Enter table</span>
        </button>
      </form>
    </div>
  );
}
