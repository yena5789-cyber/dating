"use client";

import { useEffect, useMemo, useState } from "react";
import { CandidateCard } from "@/components/CandidateCard";
import { RegisterModal } from "@/components/RegisterModal";
import { RequestModal } from "@/components/RequestModal";
import type { Candidate, ConnectionDegree, Gender } from "@/lib/candidates";
import { candidates as initialCandidates } from "@/lib/candidates";
import { CANDIDATE_STORAGE_EVENT, loadCandidates } from "@/lib/candidateStorage";

type FilterValue = "전체" | Gender | ConnectionDegree;

const filters: FilterValue[] = ["전체", "여성", "남성", "1촌", "2촌", "3촌"];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("전체");
  const [managedCandidates, setManagedCandidates] = useState<Candidate[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    const syncCandidates = () => setManagedCandidates(loadCandidates());

    syncCandidates();
    window.addEventListener("storage", syncCandidates);
    window.addEventListener(CANDIDATE_STORAGE_EVENT, syncCandidates);

    return () => {
      window.removeEventListener("storage", syncCandidates);
      window.removeEventListener(CANDIDATE_STORAGE_EVENT, syncCandidates);
    };
  }, []);

  const filteredCandidates = useMemo(() => {
    if (activeFilter === "전체") {
      return managedCandidates;
    }

    return managedCandidates.filter(
      (candidate) =>
        candidate.gender === activeFilter || candidate.connectionDegree === activeFilter,
    );
  }, [activeFilter, managedCandidates]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 pt-5 sm:px-6 sm:pb-12">
      <section className="rounded-[2.25rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(120,72,38,0.12)] backdrop-blur sm:p-8">
        <p className="mb-3 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-700">
          지인이니까 믿고, 지인이니까 편하게
        </p>
        <h1 className="text-5xl font-black tracking-tight text-stone-950 sm:text-6xl">
          에나버스
        </h1>
        <p className="mt-4 text-xl font-extrabold leading-8 text-stone-800">
          에나의 지인망 안에서 시작되는 비공개 소개
        </p>
        <p className="mt-4 text-base leading-7 text-stone-700">
          모든 후보는 실제 지인 연결 경로를 확인한 뒤 등록됩니다.<br />
          사진과 연락처는 양측 동의 후에만 전달됩니다.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href="#candidates"
            className="rounded-2xl bg-orange-500 px-5 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-orange-200 transition active:scale-[0.98]"
          >
            소개 후보 보기
          </a>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="rounded-2xl bg-stone-900 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-stone-200 transition active:scale-[0.98]"
          >
            내 프로필 등록하기
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-stone-700">
          이름, 사진, 연락처는 공개되지 않습니다.<br />
          관심 있는 후보가 있다면 카카오톡으로 소개 요청을 남겨주세요.
        </div>
      </section>

      <section id="candidates" className="mt-8 scroll-mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-orange-600">비공개 후보 카드</p>
            <h2 className="mt-1 text-3xl font-black text-stone-950">소개 후보 보기</h2>
          </div>
          <p className="shrink-0 rounded-full bg-white/85 px-3 py-2 text-sm font-bold text-stone-700">
            {filteredCandidates.length}명
          </p>
        </div>

        <p className="mb-4 rounded-3xl bg-white/75 p-4 text-sm leading-6 text-stone-700 shadow-sm">
          1촌은 에나 직접 지인, 2촌은 에나 친구의 친구, 3촌은 지인 경로 확인 완료를 의미합니다.
        </p>

        <div className="sticky top-0 z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto bg-[#fff8f1]/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-3xl">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  isActive
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white text-stone-700 shadow-sm"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onRequest={setSelectedCandidate}
              />
            ))
          ) : (
            <div className="rounded-[2rem] bg-white/90 p-8 text-center text-stone-700 shadow-sm">
              지금은 해당 조건의 후보가 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-orange-100 bg-white/85 p-5 shadow-sm">
        <h2 className="text-lg font-black text-stone-950">안심 안내</h2>
        <p className="mt-3 text-sm leading-6 text-stone-700">
          본 서비스는 지인 기반 비공개 소개 요청 서비스입니다.<br />
          프로필 정보는 당사자의 동의를 받은 범위 내에서만 공개됩니다.<br />
          사진 및 연락처는 양측 동의 후에만 전달됩니다.<br />
          무단 캡처, 공유, 외부 유포를 금지합니다.
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-orange-100 bg-white/92 p-3 shadow-[0_-12px_32px_rgba(120,72,38,0.10)] backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={() => setIsRegisterOpen(true)}
          className="w-full rounded-2xl bg-stone-900 px-5 py-4 text-base font-extrabold text-white"
        >
          내 프로필 등록하기
        </button>
      </div>

      <RequestModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </main>
  );
}
