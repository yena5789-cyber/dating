export function getAgeRange(birthYear: number) {
  const ranges: Record<number, string> = {
    1997: "20대 후반",
    1996: "30대 초반",
    1995: "30대 초반",
    1994: "30대 초반",
    1991: "30대 중반",
  };

  return ranges[birthYear] ?? "나이대 확인 중";
}

export function makeRequestTemplate(candidateId: string) {
  return `[에나버스 소개 요청]\n\n관심 후보 ID: ${candidateId}\n이름/닉네임:\n출생년도:\n성별:\n거주 지역:\n에나와의 관계 / 소개 경로:\n간단한 자기소개:\n관심 있는 이유:`;
}

export const registerTemplate = `[에나버스 후보 카드용]\n\n- 출생년도 (예: 1994):\n- 성별:\n- 키:\n- 거주 지역 (대충):\n- 직업/직군:\n\n- 성격 키워드 3개\n  예: 차분함, 유머감각, 책임감\n\n- 취미\n  예: 운동, 카페, 여행, 전시 등\n\n- 연애 스타일\n  예: 편안한 관계 / 자주 연락 / 서로 존중하는 스타일 등\n\n- 원하는 상대\n  예: 대화 잘 통하는 사람 / 예의 있는 사람 / 자기 일 열심히 하는 사람 등\n\n- MBTI:\n\n- 한 줄 소개:\n\n사진은 같이 보내주세요.\n사진은 매칭될 때만 상대에게 전달됩니다.`;
