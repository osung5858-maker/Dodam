const SITE_URL = 'https://dodam.life'

function sendKakao(params: { title: string; description: string; link?: string; buttonTitle?: string }) {
  if (typeof window === 'undefined' || !window.Kakao?.isInitialized()) {
    alert('카카오톡 공유를 사용할 수 없어요')
    return
  }
  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: params.title,
      description: params.description,
      imageUrl: `${SITE_URL}/icon-512x512.png`,
      link: { mobileWebUrl: params.link || SITE_URL, webUrl: params.link || SITE_URL },
    },
    buttons: [{ title: params.buttonTitle || '도담 열기', link: { mobileWebUrl: params.link || SITE_URL, webUrl: params.link || SITE_URL } }],
  })
}

export function shareTodayRecord(childName: string, ageMonths: number, feedCount: number, sleepCount: number, poopCount: number) {
  sendKakao({
    title: `📋 ${childName}의 오늘 (${ageMonths}개월)`,
    description: `🍼 수유 ${feedCount}회 · 💤 수면 ${sleepCount}회 · 🩲 배변 ${poopCount}회\n\n오늘도 도담하게 잘 자라고 있어요 💚`,
    buttonTitle: '기록 보기',
  })
}

export function shareWeeklyReport(childName: string, ageMonths: number, avgFeed: number, avgSleep: number) {
  sendKakao({
    title: `📊 ${childName} 주간 리포트 (${ageMonths}개월)`,
    description: `이번 주 평균\n🍼 수유 ${avgFeed}회/일 · 💤 수면 ${avgSleep}시간/일\n\n꾸준히 기록하면 AI가 패턴을 분석해드려요`,
    buttonTitle: '리포트 보기',
  })
}

export function shareBirth(childName: string) {
  sendKakao({
    title: `🎉 ${childName}이(가) 태어났어요!`,
    description: `드디어 만났어요!\n임신 준비부터 출산까지, 긴 여정을 함께해주셔서 감사해요.\n\n이제 도담하게 함께 자라요 💛`,
    buttonTitle: '축하하러 가기',
  })
}
