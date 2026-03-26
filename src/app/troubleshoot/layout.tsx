import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 육아 트러블슈팅',
  description: '아이가 울어요, 열이 나요, 먹지 않아요 — AI가 체크리스트와 단계별 대응 가이드를 알려드려요.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
