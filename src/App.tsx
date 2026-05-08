import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, RoundedBox, Sparkles } from '@react-three/drei'
import {
  CircleDollarSign,
  History,
  LockKeyhole,
  Timer,
  Trophy,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { MathUtils } from 'three'
import type { Group } from 'three'

type GamePhase = 'betting' | 'lockdown' | 'reveal' | 'settling'
type DieValue = 1 | 2 | 3 | 4 | 5 | 6
type DiceResult = [DieValue, DieValue, DieValue]
type BetGroup = 'Quick Bets' | 'Totals' | 'Singles' | 'Doubles' | 'Triples'
type BetKind =
  | 'small'
  | 'big'
  | 'odd'
  | 'even'
  | 'single'
  | 'anyDouble'
  | 'specificDouble'
  | 'anyTriple'
  | 'specificTriple'
  | 'exactTotal'

type BetOption = {
  id: string
  label: string
  group: BetGroup
  description: string
  payoutLabel: string
  kind: BetKind
  target?: number
}

type PlacedBet = {
  id: string
  option: BetOption
  stake: number
}

type BetOutcome = {
  bet: PlacedBet
  didWin: boolean
  multiplier: number
  payout: number
  profit: number
}

type PayoutSummary = {
  totalStake: number
  totalPayout: number
  net: number
  outcomes: BetOutcome[]
}

type RoundRecord = {
  round: number
  result: DiceResult
  total: number
  betCount: number
  totalStake: number
  totalPayout: number
  net: number
}

const STARTING_BALANCE = 5000
const ROUND_SECONDS = 60
const LOCKDOWN_SECONDS = 10
const REVEAL_SECONDS = 3
const SETTLE_SECONDS = 5
const CHIP_VALUES = [10, 50, 100, 500, 1000]
const BET_GROUPS: BetGroup[] = ['Quick Bets', 'Totals', 'Singles', 'Doubles', 'Triples']
const DIE_VALUES: DieValue[] = [1, 2, 3, 4, 5, 6]

const exactTotalPayouts: Record<number, number> = {
  4: 60,
  5: 30,
  6: 18,
  7: 12,
  8: 8,
  9: 6,
  10: 5,
  11: 5,
  12: 6,
  13: 8,
  14: 12,
  15: 18,
  16: 30,
  17: 60,
}

const phaseLabels: Record<GamePhase, string> = {
  betting: 'Betting open',
  lockdown: 'Lockdown',
  reveal: 'Dice open',
  settling: 'Settling',
}

const numberFormatter = new Intl.NumberFormat('en-US')

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function createBetOptions(): BetOption[] {
  const quickBets: BetOption[] = [
    {
      id: 'small',
      label: 'Small',
      group: 'Quick Bets',
      description: 'Total 4-10. Triples lose.',
      payoutLabel: '1:1',
      kind: 'small',
    },
    {
      id: 'big',
      label: 'Big',
      group: 'Quick Bets',
      description: 'Total 11-17. Triples lose.',
      payoutLabel: '1:1',
      kind: 'big',
    },
    {
      id: 'odd',
      label: 'Odd',
      group: 'Quick Bets',
      description: 'Odd total wins.',
      payoutLabel: '1:1',
      kind: 'odd',
    },
    {
      id: 'even',
      label: 'Even',
      group: 'Quick Bets',
      description: 'Even total wins.',
      payoutLabel: '1:1',
      kind: 'even',
    },
  ]

  const totals = Array.from({ length: 14 }, (_, index) => {
    const total = index + 4
    return {
      id: `total-${total}`,
      label: `${total}`,
      group: 'Totals' as const,
      description: `Exact total ${total}.`,
      payoutLabel: `${exactTotalPayouts[total]}:1`,
      kind: 'exactTotal' as const,
      target: total,
    }
  })

  const singles = DIE_VALUES.map((value) => ({
    id: `single-${value}`,
    label: `Single ${value}`,
    group: 'Singles' as const,
    description: 'Pays for each matching die.',
    payoutLabel: '1x-3x',
    kind: 'single' as const,
    target: value,
  }))

  const doubles: BetOption[] = [
    {
      id: 'any-double',
      label: 'Any double',
      group: 'Doubles',
      description: 'Any pair appears.',
      payoutLabel: '3:1',
      kind: 'anyDouble',
    },
    ...DIE_VALUES.map((value) => ({
      id: `double-${value}`,
      label: `${value}-${value}`,
      group: 'Doubles' as const,
      description: `Specific double ${value}-${value}.`,
      payoutLabel: '8:1',
      kind: 'specificDouble' as const,
      target: value,
    })),
  ]

  const triples: BetOption[] = [
    {
      id: 'any-triple',
      label: 'Any triple',
      group: 'Triples',
      description: 'Any three of a kind.',
      payoutLabel: '24:1',
      kind: 'anyTriple',
    },
    ...DIE_VALUES.map((value) => ({
      id: `triple-${value}`,
      label: `${value}-${value}-${value}`,
      group: 'Triples' as const,
      description: `Specific triple ${value}.`,
      payoutLabel: '150:1',
      kind: 'specificTriple' as const,
      target: value,
    })),
  ]

  return [...quickBets, ...totals, ...singles, ...doubles, ...triples]
}

const BET_OPTIONS = createBetOptions()

function formatCredits(value: number) {
  return numberFormatter.format(value)
}

function randomDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue
}

function randomDice(): DiceResult {
  return [randomDie(), randomDie(), randomDie()]
}

function totalDice(result: DiceResult) {
  return result[0] + result[1] + result[2]
}

function getCounts(result: DiceResult) {
  return DIE_VALUES.map((value) => result.filter((die) => die === value).length)
}

function hasTriple(result: DiceResult) {
  return result[0] === result[1] && result[1] === result[2]
}

function countTarget(result: DiceResult, target: number) {
  return result.filter((die) => die === target).length
}

function evaluateBet(option: BetOption, result: DiceResult) {
  const total = totalDice(result)
  const counts = getCounts(result)
  const triple = hasTriple(result)

  switch (option.kind) {
    case 'small':
      return !triple && total >= 4 && total <= 10 ? 1 : 0
    case 'big':
      return !triple && total >= 11 && total <= 17 ? 1 : 0
    case 'odd':
      return total % 2 === 1 ? 1 : 0
    case 'even':
      return total % 2 === 0 ? 1 : 0
    case 'single':
      return option.target ? countTarget(result, option.target) : 0
    case 'anyDouble':
      return counts.some((count) => count >= 2) ? 3 : 0
    case 'specificDouble':
      return option.target && countTarget(result, option.target) >= 2 ? 8 : 0
    case 'anyTriple':
      return triple ? 24 : 0
    case 'specificTriple':
      return option.target && countTarget(result, option.target) === 3 ? 150 : 0
    case 'exactTotal':
      return option.target === total ? exactTotalPayouts[total] ?? 0 : 0
  }
}

function settleBets(bets: PlacedBet[], result: DiceResult): PayoutSummary {
  const outcomes = bets.map((bet) => {
    const multiplier = evaluateBet(bet.option, result)
    const didWin = multiplier > 0
    const profit = didWin ? bet.stake * multiplier : -bet.stake
    const payout = didWin ? bet.stake + bet.stake * multiplier : 0
    return { bet, didWin, multiplier, payout, profit }
  })
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0)
  const totalPayout = outcomes.reduce((sum, outcome) => sum + outcome.payout, 0)

  return {
    totalStake,
    totalPayout,
    net: totalPayout - totalStake,
    outcomes,
  }
}

function createRoundRecord(
  round: number,
  result: DiceResult,
  summary: PayoutSummary,
): RoundRecord {
  return {
    round,
    result,
    total: totalDice(result),
    betCount: summary.outcomes.length,
    totalStake: summary.totalStake,
    totalPayout: summary.totalPayout,
    net: summary.net,
  }
}

function getBetId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function pipPositions(value: DieValue) {
  const near = 0.28
  const far = -0.28
  const center = 0
  const positions: Record<DieValue, Array<[number, number]>> = {
    1: [[center, center]],
    2: [
      [far, near],
      [near, far],
    ],
    3: [
      [far, near],
      [center, center],
      [near, far],
    ],
    4: [
      [far, near],
      [near, near],
      [far, far],
      [near, far],
    ],
    5: [
      [far, near],
      [near, near],
      [center, center],
      [far, far],
      [near, far],
    ],
    6: [
      [far, near],
      [near, near],
      [far, center],
      [near, center],
      [far, far],
      [near, far],
    ],
  }
  return positions[value]
}

const faceRotations: Record<DieValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [Math.PI / 2, 0, 0],
  3: [0, -Math.PI / 2, 0],
  4: [0, Math.PI / 2, 0],
  5: [-Math.PI / 2, 0, 0],
  6: [0, Math.PI, 0],
}

type PipFace = {
  value: DieValue
  rotation: [number, number, number]
  position: (x: number, y: number) => [number, number, number]
}

const pipFaces: PipFace[] = [
  { value: 1, rotation: [0, 0, 0], position: (x, y) => [x, y, 0.584] },
  { value: 6, rotation: [0, Math.PI, 0], position: (x, y) => [-x, y, -0.584] },
  { value: 3, rotation: [0, Math.PI / 2, 0], position: (x, y) => [0.584, y, -x] },
  { value: 4, rotation: [0, -Math.PI / 2, 0], position: (x, y) => [-0.584, y, x] },
  { value: 2, rotation: [-Math.PI / 2, 0, 0], position: (x, y) => [x, 0.584, -y] },
  { value: 5, rotation: [Math.PI / 2, 0, 0], position: (x, y) => [x, -0.584, y] },
]

function DiePips() {
  return (
    <>
      {pipFaces.map((face) =>
        pipPositions(face.value).map(([x, y], index) => (
          <mesh
            key={`${face.value}-${index}`}
            position={face.position(x, y)}
            rotation={face.rotation}
          >
            <circleGeometry args={[0.075, 24]} />
            <meshStandardMaterial color="#16120c" roughness={0.5} metalness={0.05} />
          </mesh>
        )),
      )}
    </>
  )
}

function DiceModel({
  value,
  phase,
  position,
  index,
}: {
  value: DieValue
  phase: GamePhase
  position: [number, number, number]
  index: number
}) {
  const groupRef = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const isRolling = phase === 'betting' || phase === 'lockdown'
    const speed = phase === 'lockdown' ? 5.8 : 3.2
    const bob = Math.sin(state.clock.elapsedTime * 2.6 + index) * 0.07

    groupRef.current.position.y = position[1] + bob

    if (isRolling) {
      groupRef.current.rotation.x += delta * speed * (1.1 + index * 0.12)
      groupRef.current.rotation.y += delta * speed * (0.82 + index * 0.1)
      groupRef.current.rotation.z += delta * speed * 0.55
      return
    }

    const target = faceRotations[value]
    groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, target[0], 8, delta)
    groupRef.current.rotation.y = MathUtils.damp(groupRef.current.rotation.y, target[1], 8, delta)
    groupRef.current.rotation.z = MathUtils.damp(groupRef.current.rotation.z, target[2], 8, delta)
  })

  return (
    <group ref={groupRef} position={position} scale={phase === 'reveal' ? 1.08 : 1}>
      <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.13} smoothness={7}>
        <meshStandardMaterial
          color="#fff6df"
          roughness={0.34}
          metalness={0.08}
          emissive="#2d1a08"
          emissiveIntensity={0.03}
        />
      </RoundedBox>
      <DiePips />
    </group>
  )
}

function DiceStage({
  phase,
  result,
  winning,
}: {
  phase: GamePhase
  result: DiceResult
  winning: boolean
}) {
  const [displayValues, setDisplayValues] = useState<DiceResult>(result)
  const visibleValues = phase === 'betting' || phase === 'lockdown' ? displayValues : result

  useEffect(() => {
    if (phase === 'betting' || phase === 'lockdown') {
      const interval = window.setInterval(
        () => setDisplayValues(randomDice()),
        phase === 'lockdown' ? 130 : 230,
      )
      return () => window.clearInterval(interval)
    }
  }, [phase])

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[radial-gradient(circle_at_50%_15%,rgba(245,183,86,0.22),transparent_28%),linear-gradient(145deg,#07140f,#101816_45%,#050607)] shadow-[0_35px_120px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-x-6 top-4 z-10 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-amber-100/70">
        <span>Live dice feed</span>
        <span className={phase === 'lockdown' ? 'text-red-300' : 'text-emerald-200'}>
          {phaseLabels[phase]}
        </span>
      </div>
      <Canvas camera={{ position: [0, 2.4, 6.2], fov: 42 }} shadows>
        <color attach="background" args={['#06100d']} />
        <ambientLight intensity={0.8} />
        <spotLight
          position={[0, 5.5, 3.2]}
          angle={0.48}
          penumbra={0.8}
          intensity={3.2}
          castShadow
        />
        <pointLight position={[-4, 2, 4]} intensity={3} color="#f0b35b" />
        <pointLight position={[4, 2, 3]} intensity={2.4} color="#4ade80" />
        <group rotation={[-0.18, 0, 0]}>
          <DiceModel value={visibleValues[0]} phase={phase} position={[-1.55, 0.1, 0]} index={0} />
          <DiceModel value={visibleValues[1]} phase={phase} position={[0, 0.15, 0.06]} index={1} />
          <DiceModel value={visibleValues[2]} phase={phase} position={[1.55, 0.1, 0]} index={2} />
        </group>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
          <planeGeometry args={[8.5, 4]} />
          <meshStandardMaterial color="#073d2b" roughness={0.88} metalness={0.02} />
        </mesh>
        <ContactShadows position={[0, -0.7, 0]} opacity={0.55} scale={7} blur={2.8} far={3} />
        {winning && (
          <Sparkles
            count={90}
            speed={0.8}
            opacity={0.85}
            color="#f7c76b"
            size={4}
            scale={[5.5, 2.5, 2.5]}
            position={[0, 0.25, 0]}
          />
        )}
        <Environment preset="night" />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}

function App() {
  const [nickname, setNickname] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [roundNumber, setRoundNumber] = useState(1)
  const [phase, setPhase] = useState<GamePhase>('betting')
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [selectedChip, setSelectedChip] = useState(100)
  const [bets, setBets] = useState<PlacedBet[]>([])
  const [result, setResult] = useState<DiceResult>(() => randomDice())
  const [summary, setSummary] = useState<PayoutSummary | null>(null)
  const [history, setHistory] = useState<RoundRecord[]>([])
  const betsRef = useRef(bets)

  const groupedOptions = useMemo(
    () =>
      BET_GROUPS.map((group) => ({
        group,
        options: BET_OPTIONS.filter((option) => option.group === group),
      })),
    [],
  )

  const totalStaked = useMemo(() => bets.reduce((sum, bet) => sum + bet.stake, 0), [bets])
  const canBet = Boolean(nickname) && phase === 'betting'
  const hasWon = Boolean(summary && summary.totalPayout > 0)
  const resultTotal = totalDice(result)

  useEffect(() => {
    betsRef.current = bets
  }, [bets])

  useEffect(() => {
    if (!nickname) return

    const timeout = window.setTimeout(() => {
      if (phase === 'betting' || phase === 'lockdown') {
        if (secondsLeft > 1) {
          const nextSeconds = secondsLeft - 1
          setSecondsLeft(nextSeconds)
          setPhase(nextSeconds <= LOCKDOWN_SECONDS ? 'lockdown' : 'betting')
          return
        }

        const nextResult = randomDice()
        const activeBets = betsRef.current
        const nextSummary = settleBets(activeBets, nextResult)
        setResult(nextResult)
        setSummary(nextSummary)
        setBalance((current) => current + nextSummary.totalPayout)
        setHistory((current) => [
          createRoundRecord(roundNumber, nextResult, nextSummary),
          ...current,
        ].slice(0, 8))
        setPhase('reveal')
        setSecondsLeft(REVEAL_SECONDS)
        return
      }

      if (phase === 'reveal') {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1)
          return
        }
        setPhase('settling')
        setSecondsLeft(SETTLE_SECONDS)
        return
      }

      if (secondsLeft > 1) {
        setSecondsLeft((current) => current - 1)
        return
      }

      setRoundNumber((current) => current + 1)
      setPhase('betting')
      setSecondsLeft(ROUND_SECONDS)
      setBets([])
      setSummary(null)
      setResult(randomDice())
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [nickname, phase, roundNumber, secondsLeft])

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = nameDraft.trim().slice(0, 18)
    if (!cleanName) return
    setNickname(cleanName)
    setNameDraft(cleanName)
  }

  function placeBet(option: BetOption) {
    if (!canBet || balance < selectedChip) return
    const placedBet: PlacedBet = {
      id: getBetId(),
      option,
      stake: selectedChip,
    }
    setBets((current) => [...current, placedBet])
    setBalance((current) => current - selectedChip)
  }

  function removeBet(betId: string) {
    if (!canBet) return

    const targetBet = bets.find((bet) => bet.id === betId)
    if (!targetBet) return

    setBets((current) => current.filter((bet) => bet.id !== betId))
    setBalance((current) => current + targetBet.stake)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040706] text-stone-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(251,191,36,0.14),transparent_28%),linear-gradient(135deg,#04130f,#090b0b_44%,#120b07)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/35 p-3 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-200/20">
              <CircleDollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-100/60">
                Three Dice Studio
              </p>
              <h1 className="text-xl font-black tracking-normal text-white sm:text-2xl">
                Broadcast Dice Table
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 md:min-w-[620px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-stone-400">
                <UserRound size={13} /> Player
              </p>
              <p className="truncate font-bold text-white">{nickname || 'Guest'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/[0.06] px-3 py-2">
              <p className="text-xs text-stone-400">Balance</p>
              <p className="font-bold text-emerald-100">{formatCredits(balance)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-xs text-stone-400">Round</p>
              <p className="font-bold text-white">#{roundNumber}</p>
            </div>
            <div
              className={cx(
                'rounded-2xl border px-3 py-2',
                phase === 'lockdown'
                  ? 'border-red-300/30 bg-red-500/10 text-red-100'
                  : 'border-amber-200/20 bg-amber-300/[0.06] text-amber-100',
              )}
            >
              <p className="flex items-center gap-1 text-xs text-stone-400">
                <Timer size={13} /> Timer
              </p>
              <p className="font-bold">
                {phaseLabels[phase]} - {secondsLeft}s
              </p>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="flex min-w-0 flex-col gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-2 shadow-2xl shadow-black/40">
              <DiceStage phase={phase} result={result} winning={hasWon && phase !== 'betting'} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/65">
                      Pick your chip
                    </p>
                    <h2 className="text-2xl font-black text-white">Bet board</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CHIP_VALUES.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSelectedChip(chip)}
                        className={cx(
                          'min-h-10 rounded-full border px-4 text-sm font-black transition',
                          selectedChip === chip
                            ? 'border-amber-200 bg-amber-300 text-black shadow-lg shadow-amber-300/20'
                            : 'border-white/10 bg-black/35 text-stone-200 hover:border-amber-200/50',
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {groupedOptions.map(({ group, options }) => (
                    <section key={group}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-300">
                          {group}
                        </h3>
                        {group === 'Quick Bets' && !canBet && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-200">
                            <LockKeyhole size={12} /> Locked
                          </span>
                        )}
                      </div>
                      <div
                        className={cx(
                          'grid gap-2',
                          group === 'Totals'
                            ? 'grid-cols-4 sm:grid-cols-7'
                            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
                        )}
                      >
                        {options.map((option) => {
                          const disabled = !canBet || balance < selectedChip
                          return (
                            <button
                              key={option.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => placeBet(option)}
                              className={cx(
                                'group min-h-[86px] rounded-2xl border p-3 text-left transition',
                                disabled
                                  ? 'cursor-not-allowed border-white/5 bg-white/[0.025] text-stone-500'
                                  : 'border-white/10 bg-[#0d1712] text-stone-100 hover:-translate-y-0.5 hover:border-amber-200/50 hover:bg-[#142018] hover:shadow-lg hover:shadow-amber-400/10',
                              )}
                            >
                              <span className="block text-base font-black text-white group-disabled:text-stone-500">
                                {option.label}
                              </span>
                              <span className="mt-1 block text-xs leading-snug text-stone-400">
                                {option.description}
                              </span>
                              <span className="mt-2 inline-flex rounded-full bg-amber-300/10 px-2 py-1 text-xs font-black text-amber-100">
                                {option.payoutLabel}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <aside className="flex flex-col gap-4">
                <section
                  className={cx(
                    'rounded-3xl border p-4 shadow-xl shadow-black/20',
                    summary
                      ? hasWon
                        ? 'animate-[winPulse_900ms_ease-out] border-amber-200/35 bg-amber-300/10'
                        : 'border-white/10 bg-white/[0.045]'
                      : 'border-white/10 bg-white/[0.045]',
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">
                        Result
                      </p>
                      <h2 className="text-xl font-black text-white">Round summary</h2>
                    </div>
                    <Trophy className={hasWon ? 'text-amber-200' : 'text-stone-500'} />
                  </div>

                  {summary ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl bg-black/30 p-3">
                        <span className="text-sm text-stone-400">Dice</span>
                        <span className="text-lg font-black text-white">
                          {result.join(' + ')} = {resultTotal}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-2xl bg-black/25 p-3">
                          <p className="text-stone-400">Staked</p>
                          <p className="font-black">{formatCredits(summary.totalStake)}</p>
                        </div>
                        <div className="rounded-2xl bg-black/25 p-3">
                          <p className="text-stone-400">Paid</p>
                          <p className="font-black text-emerald-100">
                            {formatCredits(summary.totalPayout)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cx(
                          'rounded-2xl p-3 text-center text-lg font-black',
                          summary.net > 0
                            ? 'bg-amber-300 text-black'
                            : 'bg-white/[0.05] text-stone-300',
                        )}
                      >
                        {summary.net > 0
                          ? `Won +${formatCredits(summary.net)}`
                          : summary.net < 0
                            ? `Lost ${formatCredits(Math.abs(summary.net))}`
                            : 'No net change'}
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-black/25 p-4 text-sm leading-6 text-stone-400">
                      Place bets before lockdown. The dice reveal automatically when the countdown
                      hits zero.
                    </p>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/60">
                        Slip
                      </p>
                      <h2 className="text-xl font-black text-white">Current bets</h2>
                    </div>
                    <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100">
                      {formatCredits(totalStaked)}
                    </span>
                  </div>

                  <div className="max-h-[310px] space-y-2 overflow-y-auto pr-1">
                    {bets.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-500">
                        Your bet slip is empty.
                      </p>
                    ) : (
                      bets.map((bet) => {
                        const outcome = summary?.outcomes.find((item) => item.bet.id === bet.id)
                        return (
                          <div
                            key={bet.id}
                            className={cx(
                              'flex items-center justify-between gap-3 rounded-2xl border p-3',
                              outcome?.didWin
                                ? 'border-amber-200/35 bg-amber-300/10'
                                : outcome
                                  ? 'border-white/5 bg-black/25 opacity-60'
                                  : 'border-white/10 bg-black/25',
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold text-white">{bet.option.label}</p>
                              <p className="text-xs text-stone-400">
                                Stake {formatCredits(bet.stake)} - {bet.option.payoutLabel}
                              </p>
                            </div>
                            {canBet ? (
                              <button
                                type="button"
                                onClick={() => removeBet(bet.id)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-stone-300 hover:border-red-300/50 hover:text-red-200"
                                aria-label={`Remove ${bet.option.label}`}
                              >
                                <X size={16} />
                              </button>
                            ) : outcome ? (
                              <span
                                className={cx(
                                  'shrink-0 text-sm font-black',
                                  outcome.didWin ? 'text-amber-100' : 'text-stone-500',
                                )}
                              >
                                {outcome.didWin ? `+${formatCredits(outcome.profit)}` : 'Lost'}
                              </span>
                            ) : (
                              <LockKeyhole className="shrink-0 text-stone-500" size={17} />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-5">
            <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                    Session only
                  </p>
                  <h2 className="text-2xl font-black text-white">History</h2>
                </div>
                <History className="text-amber-100/70" />
              </div>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-500">
                    Completed rounds will appear here until refresh.
                  </p>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.round}
                      className="rounded-2xl border border-white/10 bg-black/25 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-white">Round #{record.round}</p>
                        <p
                          className={cx(
                            'text-sm font-black',
                            record.net > 0
                              ? 'text-amber-100'
                              : record.net < 0
                                ? 'text-red-200'
                                : 'text-stone-400',
                          )}
                        >
                          {record.net > 0
                            ? `+${formatCredits(record.net)}`
                            : record.net < 0
                              ? `-${formatCredits(Math.abs(record.net))}`
                              : '0'}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-stone-400">
                        {record.result.join('-')} total {record.total} - {record.betCount} bets
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200/15 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50/80">
              <p className="font-black text-amber-100">Fun-play table</p>
              <p className="mt-1">
                Credits are local session points only. Refreshing the page resets nickname, balance,
                bets, and round history.
              </p>
            </section>
          </aside>
        </div>
      </section>

      {!nickname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
          <form
            onSubmit={handleJoin}
            className="w-full max-w-md rounded-[2rem] border border-amber-100/20 bg-[#08110e] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
                Player check-in
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">Choose a nickname</h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                You will receive {formatCredits(STARTING_BALANCE)} session credits. No account or
                storage is used.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-stone-300">Nickname</span>
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                maxLength={18}
                autoFocus
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-lg font-bold text-white outline-none transition placeholder:text-stone-600 focus:border-amber-200/70"
                placeholder="Lucky player"
              />
            </label>
            <button
              type="submit"
              disabled={!nameDraft.trim()}
              className="mt-5 w-full rounded-2xl bg-amber-300 px-5 py-4 text-base font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-500"
            >
              Enter table
            </button>
          </form>
        </div>
      )}
    </main>
  )
}

export default App
