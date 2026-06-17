# 상품 이미지 (ProductSection 카드)

이 폴더의 이미지는 `ProductSection.jsx`가 빌드 시 자동 수집합니다.
**파일명(확장자 앞)이 카드의 `img` 키와 일치하면** 해당 카드에 사진이 노출되고,
파일이 없으면 기존 회색 플레이스홀더로 표시됩니다.

| 파일명 (확장자 자유: jpg/jpeg/png/webp) | 상품 | 첨부 이미지 |
| --- | --- | --- |
| `foliage` | 대형 관엽화분 | 흰 원통 화분의 키 큰 녹색 나무 |
| `oriental-orchid` | 동양란 | 청자 화병(금색 장식)의 난초 |
| `phalaenopsis` | 호접난 | 노란 호접난(사무실 책상) |
| `flower-basket` | 꽃바구니 | 분홍·흰 꽃바구니 |
| `wreath-condolence` | 근조화환 | (추후 추가 예정) |
| `wreath-celebration` | 축하화환 | (추후 추가 예정) |

예) `foliage.jpg`, `oriental-orchid.webp` 처럼 저장하면 됩니다.

- 카드는 `object-cover`로 채우므로 **세로형(약 10:12 이상)** 사진을 권장합니다.
- 하단에는 흰 텍스트 가독성을 위한 그라데이션 스크림이 자동으로 깔립니다.
