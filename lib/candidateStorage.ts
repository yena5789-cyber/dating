import type { Candidate, ConnectionDegree, Gender } from "@/lib/candidates";
import { candidates } from "@/lib/candidates";

export const CANDIDATE_STORAGE_KEY = "enaverse:candidates";
export const CANDIDATE_STORAGE_EVENT = "enaverse:candidates-updated";

type StoredCandidate = Partial<Candidate> & {
  personality?: string;
  hobbies?: string;
};

export function getConnectionLabel(connectionDegree: ConnectionDegree) {
  const labels: Record<ConnectionDegree, string> = {
    "1촌": "에나 직접 지인",
    "2촌": "에나 친구의 친구",
    "3촌": "지인 경로 확인 완료",
  };

  return labels[connectionDegree];
}

function mergePersonalityAndHobbies(candidate: StoredCandidate) {
  if (candidate.personalityAndHobbies) {
    return candidate.personalityAndHobbies;
  }

  const personality = candidate.personality?.trim();
  const hobbies = candidate.hobbies?.trim();

  if (personality && hobbies) {
    if (personality === hobbies) {
      return `성격 및 취미: ${personality}`;
    }

    return `성격: ${personality} / 취미: ${hobbies}`;
  }

  return personality || hobbies || "추가 확인 필요";
}

export function normalizeCandidate(candidate: StoredCandidate): Candidate {
  const connectionDegree = candidate.connectionDegree ?? "3촌";

  return {
    id: candidate.id?.trim() ?? "",
    birthYear: Number(candidate.birthYear ?? 1997),
    gender: candidate.gender ?? ("여성" as Gender),
    height: candidate.height?.trim() ?? "",
    region: candidate.region?.trim() ?? "서울",
    jobCategory: candidate.jobCategory?.trim() ?? "",
    mbti: candidate.mbti?.trim().toUpperCase() ?? "",
    connectionDegree,
    connectionLabel: getConnectionLabel(connectionDegree),
    personalityAndHobbies: mergePersonalityAndHobbies(candidate).trim(),
    datingStyle: candidate.datingStyle?.trim() ?? "",
    preferredPartner: candidate.preferredPartner?.trim() ?? "",
    intro: candidate.intro?.trim() ?? "",
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

  return parsedCandidates.map((candidate) => normalizeCandidate(candidate as StoredCandidate));
}

export function saveCandidates(nextCandidates: StoredCandidate[]) {
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
