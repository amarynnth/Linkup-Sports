import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { SPORTS, PARISHES } from '../data/mockData';
import { useSessions } from '../context/SessionsContext';
import { useFavoriteVenues } from '../context/FavoritesContext';
import PageHeader from '../components/PageHeader';
import type { PaymentType } from '../types';

const SKILLS = ['Open', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function CreateSession() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const { favorites, addFavorite, isFavorite } = useFavoriteVenues();

  const [sportId, setSportId] = useState(SPORTS[0].id);
  const [venueName, setVenueName] = useState('');
  const [parish, setParish] = useState(PARISHES[0]);
  const [facilityName, setFacilityName] = useState('');
  const [saveToFavorites, setSaveToFavorites] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [capacity, setCapacity] = useState(4);
  const [skill, setSkill] = useState<typeof SKILLS[number]>('Open');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Privacy: public sessions show up in the discover feed for anyone
  // nearby; private sessions only show up via an invite code, for the
  // weekly pickleball/football crew.
  const [isPrivate, setIsPrivate] = useState(false);

  // Cost: public sessions charge a flat per-person amount; private
  // sessions split a total cost across whoever ends up joining. Either
  // can be free.
  const [isFree, setIsFree] = useState(false);
  const [costPerPerson, setCostPerPerson] = useState(500);
  const [totalCost, setTotalCost] = useState(4000);

  // Payment method note — how the organizer wants to get paid.
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [accountInfo, setAccountInfo] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const sport = SPORTS.find((s) => s.id === sportId)!;

  const canSubmit = Boolean(venueName.trim() && parish && date && time) && !submitting;

  const pickFavorite = (name: string, p: string) => {
    setVenueName(name);
    setParish(p);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    const payment = isFree
      ? undefined
      : {
          type: paymentType,
          accountInfo: paymentType !== 'cash' ? accountInfo.trim() || undefined : undefined,
          note: paymentNote.trim() || undefined,
        };
    try {
      const id = await createSession({
        venueName: venueName.trim(),
        parish,
        facilityName: facilityName.trim() || undefined,
        sportId,
        startsAt,
        durationMins,
        capacity,
        skillLevel: skill,
        isPrivate,
        costPerPersonJmd: !isPrivate ? (isFree ? 0 : costPerPerson) : undefined,
        totalCostJmd: isPrivate ? (isFree ? 0 : totalCost) : undefined,
        payment,
        notes: notes.trim() || undefined,
      });
      if (saveToFavorites) {
        addFavorite(venueName, parish);
      }
      navigate(`/session/${id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Couldn't post this session — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-48">
      <PageHeader title="Start Open Play" subtitle="Any sport, any venue, one feed" />

      <div className="flex flex-col gap-6 px-5">
        <Section label="1 · Sport">
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSportId(s.id);
                  setDurationMins(s.defaultDurationMins);
                  setCapacity(s.maxPlayers);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  sportId === s.id ? 'border-transparent text-void' : 'border-line bg-surface text-ink-dim'
                }`}
                style={sportId === s.id ? { backgroundColor: s.color } : undefined}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </Section>

        <Section
          label="2 · Venue"
          hint="Type it in — no fixed list yet"
        >
          {favorites.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {favorites.map((f) => (
                <button
                  key={f.id}
                  onClick={() => pickFavorite(f.name, f.parish)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    venueName.trim().toLowerCase() === f.name.toLowerCase() && parish === f.parish
                      ? 'border-lime bg-lime/10 text-lime'
                      : 'border-line bg-surface text-ink-dim'
                  }`}
                >
                  <Star size={11} fill="currentColor" />
                  {f.name}
                </button>
              ))}
            </div>
          )}

          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Venue name — e.g. New Kingston Courts"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
          />

          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-semibold text-ink-faint">Parish</label>
            <select
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink focus:border-lime focus:outline-none"
            >
              {PARISHES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <input
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            placeholder="Court / pitch / table (optional) — e.g. Court 2"
            className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
          />

          {venueName.trim() && !isFavorite(venueName, parish) && (
            <label className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
              <input
                type="checkbox"
                checked={saveToFavorites}
                onChange={(e) => setSaveToFavorites(e.target.checked)}
                className="h-4 w-4 accent-lime"
              />
              <span className="text-sm font-semibold text-ink">Save as a favorite for next time</span>
            </label>
          )}
        </Section>

        <Section label="3 · When">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink focus:border-lime focus:outline-none [color-scheme:dark]"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink focus:border-lime focus:outline-none [color-scheme:dark]"
            />
          </div>
        </Section>

        <Section label="4 · Details">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Duration (min)" value={durationMins} onChange={setDurationMins} step={15} min={15} />
            <NumberField label="Capacity" value={capacity} onChange={setCapacity} step={1} min={sport.minPlayers} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-faint">Skill level</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as typeof SKILLS[number])}
                className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink focus:border-lime focus:outline-none"
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for players (optional) — e.g. bring your own paddle"
            rows={3}
            className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
          />
        </Section>

        <Section label="5 · Who can see this" hint="Private = friends only, via invite code">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPrivate(false)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                !isPrivate ? 'border-lime bg-lime/10' : 'border-line bg-surface'
              }`}
            >
              <p className="text-sm font-bold text-ink">Public</p>
              <p className="mt-0.5 text-xs text-ink-faint">Shows up in the discover feed nearby</p>
            </button>
            <button
              onClick={() => setIsPrivate(true)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isPrivate ? 'border-cyan bg-cyan/10' : 'border-line bg-surface'
              }`}
            >
              <p className="text-sm font-bold text-ink">Private</p>
              <p className="mt-0.5 text-xs text-ink-faint">Only joinable with an invite code</p>
            </button>
          </div>
          {isPrivate && (
            <p className="mt-2 text-[11px] text-ink-faint">
              You'll get a 6-character code after posting — share it with your crew so they can join.
            </p>
          )}
        </Section>

        <Section label="6 · Cost">
          <label className="mb-3 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 accent-lime"
            />
            <span className="text-sm font-semibold text-ink">This session is free</span>
          </label>

          {!isFree && !isPrivate && (
            <NumberField label="Cost / person (JMD)" value={costPerPerson} onChange={setCostPerPerson} step={50} min={0} />
          )}

          {!isFree && isPrivate && (
            <div>
              <NumberField label="Total cost to split (JMD)" value={totalCost} onChange={setTotalCost} step={100} min={0} />
              <p className="mt-1.5 text-[11px] text-ink-faint">
                Split evenly across everyone currently joined — updates automatically as people join.
              </p>
            </div>
          )}
        </Section>

        {!isFree && (
          <Section label="7 · How should people pay you?">
            <div className="grid grid-cols-3 gap-2">
              <PaymentTypeButton label="Cash" active={paymentType === 'cash'} onClick={() => setPaymentType('cash')} />
              <PaymentTypeButton label="Account" active={paymentType === 'account'} onClick={() => setPaymentType('account')} />
              <PaymentTypeButton label="Both" active={paymentType === 'both'} onClick={() => setPaymentType('both')} />
            </div>

            {paymentType !== 'cash' && (
              <input
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                placeholder="Account number / handle to send to — e.g. NCB 000-123-456"
                className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
              />
            )}
            <input
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Note for payers (optional) — e.g. send before Friday"
              className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-lime focus:outline-none"
            />
          </Section>
        )}
      </div>

      {submitError && (
        <div className="fixed bottom-[184px] left-0 right-0 z-30 px-5">
          <p className="mx-auto max-w-md rounded-xl border border-coral/40 bg-coral/10 px-4 py-2.5 text-center text-xs font-semibold text-coral">
            {submitError}
          </p>
        </div>
      )}

      <div className="safe-bottom fixed bottom-20 left-0 right-0 z-30 border-t border-line bg-void/95 p-4 backdrop-blur-lg">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`w-full rounded-xl py-3.5 text-sm font-bold transition-colors ${
            canSubmit ? 'bg-lime text-void glow-lime' : 'bg-surface-3 text-ink-faint'
          }`}
        >
          {submitting ? 'Posting…' : 'Post open play session'}
        </button>
      </div>
    </div>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</p>
        {hint && <p className="text-[11px] text-ink-faint">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-faint">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink focus:border-lime focus:outline-none"
      />
    </div>
  );
}

function PaymentTypeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
        active ? 'border-lime bg-lime/10 text-lime' : 'border-line bg-surface text-ink-dim'
      }`}
    >
      {label}
    </button>
  );
}
