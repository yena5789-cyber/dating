"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidate, ConnectionDegree, Gender } from "@/lib/candidates";
import { candidates as initialCandidates } from "@/lib/candidates";
import { ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/lib/constants";
import {
  getConnectionLabel,
  loadCandidates,
  normalizeCandidate,
  resetCandidates,
  saveCandidates,
} from "@/lib/candidateStorage";

const emptyCandidate: Candidate = {
  id: "",
  birthYear: 1997,
  gender: "여성",
  height: "",
  region: "서울",
  jobCategory: "",
  mbti: "",
  connectionDegree: "1촌",
  connectionLabel: "에나 직접 지인",
  personality: "",
  hobbies: "",
  datingStyle: "",
  preferredPartner: "",
  intro: "",
};

const textFields: Array<{
  key: keyof Pick<
    Candidate,
    | "height"
    | "region"
    | "jobCategory"
    | "mbti"
    | "personality"
    | "hobbies"
    | "datingStyle"
    | "preferredPartner"
    | "intro"
  >;
  label: string;
  multiline?: boolean;
  placeholder: string;
}> = [
  { key: "height", label: "키", placeholder: "예: 168cm" },
  { key: "region", label: "거주 지역", placeholder: "예: 서울" },
  { key: "jobCategory", label: "직군", placeholder: "예: 스타트업" },
  { key: "mbti", label: "MBTI", placeholder: "예: ENFP" },
  {
    key: "personality",
    label: "성격",
    placeholder: "예: 긍정적 / 공감능력이 좋음 / 리액션 담당",
    multiline: true,
  },
  { key: "hobbies", label: "취미", placeholder: "예: 여행, 방탈출, 영화", multiline: true },
  {
    key: "datingStyle",
    label: "연애 스타일",
    placeholder: "예: 서로 배려하고 존중하는 연애",
    multiline: true,
  },
  {
    key: "preferredPartner",
    label: "원하는 상대",
    placeholder: "예: 대화 잘 통하는 사람",
    multiline: true,
  },
  { key: "intro", label: "한 줄 소개", placeholder: "예: 같이 재밌는 시간 보내요!!", multiline: true },
];

function makeNextId(candidateList: Candidate[]) {
  const largestNumber = candidateList.reduce((largest, candidate) => {
    const matchedNumber = candidate.id.match(/^A-(\d+)$/)?.[1];

    if (!matchedNumber) {
      return largest;
    }

    return Math.max(largest, Number(matchedNumber));
  }, 0);

  return `A-${String(largestNumber + 1).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [candidateList, setCandidateList] = useState<Candidate[]>(initialCandidates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Candidate>(emptyCandidate);
  const [notice, setNotice] = useState("후보를 선택하거나 새 후보를 등록해 주세요.");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setCandidateList(loadCandidates());
    setIsAuthorized(window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  }, []);

  const handlePasswordSubmit = () => {
    if (password.trim() !== ADMIN_PASSWORD) {
      setPasswordError("비밀번호가 맞지 않습니다.");
      return;
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setIsAuthorized(true);
    setPasswordError("");
  };

  const sortedCandidates = useMemo(
    () => [...candidateList].sort((a, b) => a.id.localeCompare(b.id, "ko")),
    [candidateList],
  );

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyCandidate,
      id: makeNextId(candidateList),
    });
    setNotice("새 후보 정보를 입력한 뒤 저장해 주세요.");
  };

  const startEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setForm(candidate);
    setNotice(`${candidate.id} 후보를 편집 중입니다.`);
  };

  const updateForm = <Key extends keyof Candidate>(key: Key, value: Candidate[Key]) => {
    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [key]: value,
      };

      if (key === "connectionDegree") {
        nextForm.connectionLabel = getConnectionLabel(value as ConnectionDegree);
      }

      return nextForm;
    });
  };

  const handleSave = () => {
    if (!form.id.trim()) {
      setNotice("후보 ID는 꼭 필요합니다.");
      return;
    }

    const normalizedCandidate = normalizeCandidate(form);
    const hasDuplicateId = candidateList.some(
      (candidate) => candidate.id === normalizedCandidate.id && candidate.id !== editingId,
    );

    if (hasDuplicateId) {
      setNotice("이미 같은 후보 ID가 있습니다. 다른 ID를 사용해 주세요.");
      return;
    }

    const nextCandidates = editingId
      ? candidateList.map((candidate) =>
          candidate.id === editingId ? normalizedCandidate : candidate,
        )
      : [...candidateList, normalizedCandidate];

    setCandidateList(saveCandidates(nextCandidates));
    setEditingId(normalizedCandidate.id);
    setForm(normalizedCandidate);
    setNotice(`${normalizedCandidate.id} 후보 정보가 저장되었습니다.`);
  };

  const handleDelete = (candidateId: string) => {
    const nextCandidates = candidateList.filter((candidate) => candidate.id !== candidateId);

    setCandidateList(saveCandidates(nextCandidates));

    if (editingId === candidateId) {
      setEditingId(null);
      setForm(emptyCandidate);
    }

    setNotice(`${candidateId} 후보가 삭제되었습니다.`);
  };

  const handleReset = () => {
    const restoredCandidates = resetCandidates();

    setCandidateList(restoredCandidates);
    setEditingId(null);
    setForm(emptyCandidate);
    setNotice("기본 후보 목록으로 되돌렸습니다.");
  };

  if (!isAuthorized) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
        <section className="w-full rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(120,72,38,0.10)] backdrop-blur">
          <p className="mb-2 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-700">
            에나버스 관리자
          </p>
          <h1 className="text-3xl font-black text-stone-950">비밀번호 입력</h1>
          <p className="mt-3 rounded-3xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
            후보군 관리 페이지는 관리자 비밀번호 입력 후 들어갈 수 있습니다.
          </p>

          <label className="mt-4 grid gap-2 text-sm font-bold text-stone-800">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handlePasswordSubmit();
                }
              }}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
              placeholder="관리자 비밀번호"
            />
          </label>

          {passwordError ? (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {passwordError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handlePasswordSubmit}
            className="mt-4 w-full rounded-2xl bg-stone-900 px-5 py-4 text-base font-extrabold text-white transition active:scale-[0.98]"
          >
            관리자 페이지로 들어가기
          </button>
          <a
            href="/"
            className="mt-3 block rounded-2xl bg-stone-100 px-5 py-4 text-center text-base font-extrabold text-stone-700 transition active:scale-[0.98]"
          >
            공개 페이지로 돌아가기
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-16 pt-5 sm:px-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(120,72,38,0.10)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-700">
              에나버스 관리자
            </p>
            <h1 className="text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
              후보군 관리
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-700 sm:text-base">
              후보를 바로 등록, 편집, 삭제할 수 있습니다. 변경 내용은 이 브라우저에 저장되고 소개 후보 목록에도 반영됩니다.
            </p>
          </div>
          <a
            href="/"
            className="rounded-2xl bg-stone-900 px-5 py-3 text-center text-sm font-extrabold text-white transition active:scale-[0.98]"
          >
            공개 페이지 보기
          </a>
        </div>

        <div className="mt-5 rounded-3xl bg-amber-50 p-4 text-sm font-bold leading-6 text-stone-700">
          {notice}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]">
        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-orange-600">현재 후보</p>
              <h2 className="text-2xl font-black text-stone-950">{candidateList.length}명</h2>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition active:scale-[0.98]"
            >
              새 후보 등록
            </button>
          </div>

          <div className="grid gap-3">
            {sortedCandidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-stone-950">[{candidate.id}]</p>
                    <p className="mt-1 text-sm font-bold text-stone-700">
                      {candidate.gender} · {candidate.birthYear} · {candidate.region} · {candidate.connectionDegree}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {candidate.jobCategory} / {candidate.mbti || "MBTI 미입력"}
                    </p>
                  </div>
                  <div className="grid shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(candidate)}
                      className="rounded-full bg-stone-900 px-4 py-2 text-xs font-extrabold text-white"
                    >
                      편집
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(candidate.id)}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-orange-600">
                {editingId ? "후보 편집" : "후보 등록"}
              </p>
              <h2 className="text-2xl font-black text-stone-950">
                {editingId ? `[${editingId}] 수정` : "새 후보 입력"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-stone-100 px-4 py-2 text-xs font-extrabold text-stone-700"
            >
              기본값 복구
            </button>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-bold text-stone-800">
              후보 ID
              <input
                value={form.id}
                onChange={(event) => updateForm("id", event.target.value)}
                className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
                placeholder="예: A-10"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm font-bold text-stone-800">
                출생년도
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={(event) => updateForm("birthYear", Number(event.target.value))}
                  className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
                  placeholder="예: 1994"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-stone-800">
                성별
                <select
                  value={form.gender}
                  onChange={(event) => updateForm("gender", event.target.value as Gender)}
                  className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
                >
                  <option value="여성">여성</option>
                  <option value="남성">남성</option>
                </select>
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-bold text-stone-800">
              지인 연결
              <select
                value={form.connectionDegree}
                onChange={(event) =>
                  updateForm("connectionDegree", event.target.value as ConnectionDegree)
                }
                className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
              >
                <option value="1촌">1촌 - 에나 직접 지인</option>
                <option value="2촌">2촌 - 에나 친구의 친구</option>
                <option value="3촌">3촌 - 지인 경로 확인 완료</option>
              </select>
            </label>

            {textFields.map((field) => (
              <label key={field.key} className="grid gap-1.5 text-sm font-bold text-stone-800">
                {field.label}
                {field.multiline ? (
                  <textarea
                    value={form[field.key]}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                    className="min-h-24 rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold leading-6 outline-none focus:border-orange-400"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    value={form[field.key]}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                    className="rounded-2xl border border-orange-100 bg-white px-4 py-3 font-semibold outline-none focus:border-orange-400"
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="sticky bottom-0 -mx-5 mt-5 grid gap-3 border-t border-orange-100 bg-white/90 p-5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-orange-500 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition active:scale-[0.98]"
            >
              저장하기
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="rounded-2xl bg-stone-100 px-5 py-4 text-base font-extrabold text-stone-700 transition active:scale-[0.98]"
            >
              입력 비우고 새 후보 등록
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
