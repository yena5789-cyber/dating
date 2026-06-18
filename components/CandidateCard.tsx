import type { Candidate } from "@/lib/candidates";
import { getAgeRange } from "@/lib/utils";

interface CandidateCardProps {
  candidate: Candidate;
  onRequest: (candidate: Candidate) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm leading-6 text-stone-700">
      <span className="shrink-0 font-semibold text-stone-900">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-orange-50/70 p-4">
      <p className="mb-1 text-xs font-bold text-orange-700">{label}</p>
      <p className="text-sm leading-6 text-stone-800">{value}</p>
    </div>
  );
}

export function CandidateCard({ candidate, onRequest }: CandidateCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(120,72,38,0.10)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-stone-900 px-3 py-1 text-sm font-bold text-white">
            [{candidate.id}]
          </p>
          <h3 className="text-lg font-extrabold text-stone-950">
            {candidate.gender} · {getAgeRange(candidate.birthYear)} · {candidate.region}
          </h3>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          {candidate.connectionDegree}
        </span>
      </div>

      <div className="mb-4 grid gap-1.5 rounded-3xl bg-stone-50 p-4">
        <InfoRow label="직군" value={candidate.jobCategory} />
        <InfoRow label="키" value={candidate.height} />
        <InfoRow label="MBTI" value={candidate.mbti} />
        <InfoRow
          label="지인 연결"
          value={`${candidate.connectionDegree} (${candidate.connectionLabel})`}
        />
      </div>

      <div className="grid gap-3">
        <TextBlock label="성격 및 취미" value={candidate.personalityAndHobbies} />
        <TextBlock label="연애 스타일" value={candidate.datingStyle} />
        <TextBlock label="원하는 상대" value={candidate.preferredPartner} />
        <TextBlock label="한 줄 소개" value={candidate.intro} />
      </div>

      <button
        type="button"
        onClick={() => onRequest(candidate)}
        className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition active:scale-[0.98]"
      >
        소개 요청하기
      </button>
    </article>
  );
}
