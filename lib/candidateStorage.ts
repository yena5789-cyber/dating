import type { Candidate, ConnectionDegree } from "@/lib/candidates";
import { candidates } from "@/lib/candidates";

export const CANDIDATE_STORAGE_KEY = "enaverse:candidates";
export const CANDIDATE_STORAGE_EVENT = "enaverse:candidates-updated";

export function getConnectionLabel(connectionDegree: ConnectionDegree) {
  const labels: Record<ConnectionDegree, string> = {
    "1촌": "에나 직접 지인",
    "2촌": "에나 친구의 친구",
    "3촌": "지인 경로 확인 완료",
  };

  return labels[connectionDegree];
}

export function normalizeCandidate(candidate: Candidate): Candidate {
  return {
    ...candidate,
    id: candidate.id.trim(),
    birthYear: Number(candidate.birthYear),
    height: candidate.height.trim(),
    region: candidate.region.trim(),
    jobCategory: candidate.jobCategory.trim(),
    mbti: candidate.mbti.trim().toUpperCase(),
    connectionLabel: getConnectionLabel(candidate.connectionDegree),
    personality: candidate.personality.trim(),
    hobbies: candidate.hobbies.trim(),
    datingStyle: candidate.datingStyle.trim(),
    preferredPartner: candidate.preferredPartner.trim(),
    intro: candidate.intro.trim(),
  };
}

export function loadCandidates() {
  if (typeof window === "undefined") {
    return candidates;
  }

  const storedCandidates = window.localStorage.getItem(CANDIDATE_STORAGE_KEY);

  if (!storedCandidates) {
    return candidates;
  }

  const parsedCandidates: unknown = JSON.parse(storedCandidates);

  if (!Array.isArray(parsedCandidates)) {
    return candidates;
  }

  return parsedCandidates.map((candidate) => normalizeCandidate(candidate as Candidate));
}

export function saveCandidates(nextCandidates: Candidate[]) {
  const normalizedCandidates = nextCandidates.map(normalizeCandidate);

  window.localStorage.setItem(
    CANDIDATE_STORAGE_KEY,
    JSON.stringify(normalizedCandidates),
  );
  window.dispatchEvent(new Event(CANDIDATE_STORAGE_EVENT));

  return normalizedCandidates;
}

export function resetCandidates() {
  window.localStorage.removeItem(CANDIDATE_STORAGE_KEY);
  window.dispatchEvent(new Event(CANDIDATE_STORAGE_EVENT));

  return candidates;
}
