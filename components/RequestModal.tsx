"use client";

import { useMemo, useState } from "react";
import type { Candidate } from "@/lib/candidates";
import { KAKAO_CHAT_URL } from "@/lib/constants";
import { makeRequestTemplate } from "@/lib/utils";

interface RequestModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function RequestModal({ candidate, onClose }: RequestModalProps) {
  const [copied, setCopied] = useState(false);
  const template = useMemo(
    () => (candidate ? makeRequestTemplate(candidate.id) : ""),
    [candidate],
  );

  if (!candidate) {
    return null;
  }

  const handleCopy = async () => {
    await copyText(template);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-6">
      <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-orange-600">소개 요청</p>
            <h2 className="mt-1 text-2xl font-black text-stone-950">
              관심 후보 ID: {candidate.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <p className="rounded-3xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
          사진과 연락처는 바로 공개되지 않습니다.<br />
          카카오톡으로 소개 요청을 남기면 운영자가 확인 후 안내합니다.
        </p>

        <pre className="mt-4 whitespace-pre-wrap rounded-3xl bg-stone-950 p-4 text-sm leading-6 text-stone-50">
          {template}
        </pre>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl bg-stone-900 px-5 py-4 text-base font-extrabold text-white transition active:scale-[0.98]"
          >
            {copied ? "복사 완료!" : "신청문구 복사하기"}
          </button>
          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-yellow-300 px-5 py-4 text-center text-base font-extrabold text-stone-950 transition active:scale-[0.98]"
          >
            카카오톡으로 문의하기
          </a>
        </div>
      </section>
    </div>
  );
}
