# 📈 통합 자산 관리 대시보드 (Personal Asset Management Dashboard)
> **현재 릴리즈 버전**: `v4.2.3`

## 📌 프로젝트 개요
HTML, CSS, Vanilla JavaScript로 작성된 프론트엔드 대시보드와 이를 지원하는 **Node.js Express 백엔드 API 서버**로 구성된 자산 관리 애플리케이션입니다.

기존 브라우저 환경(Chrome, Edge 등)에서 로컬 파일 실행 시 발생하는 CORS(Cross-Origin Resource Sharing) 제약 및 외부 API 직접 호출의 불안정함을 해결하기 위해 백엔드 중계 서버를 도입하였습니다. 토스증권 Open API를 통한 실시간 시세 조회 및 네이버 금융을 활용한 안정적인 Fallback 스크래핑 기능을 통해 항상 최신의 자산 가치와 포트폴리오 상태를 시각화합니다.

모든 자산 원장 데이터는 서버의 `data/db.json` 파일에 안전하게 보관(브라우저 LocalStorage에 백업 유지)되며, 백엔드는 실시간 시세 중계 및 자산 데이터 영속성 관리를 담당하여 프라이버시와 기기 간 동기화를 동시에 실현합니다.

---

## ✨ 주요 기능
1. **Express 백엔드 API & CORS 문제 완벽 해결**
   - Node.js 24 기반 백엔드 서버(`server.js`)가 토스증권 Open API 연동 및 데이터 가공을 전담하여 브라우저 CORS 오류를 100% 원천 차단합니다.
   - 단일 엔드포인트 `/api/prices`를 통해 다수의 종목 현재가를 병렬 수집하여 일괄 응답합니다.
2. **토스증권 API & 네이버 금융 Fallback 연동**
   - 토스증권 Open API(OAuth2 토큰 인증)를 사용하여 정확하고 빠른 실시간 시세를 조회합니다.
   - 토스증권 토큰 오류 또는 지원되지 않는 종목 번호 조회 시, **네이버 금융 시세 페이지를 실시간으로 크롤링**하여 막힘없는 Fallback 서비스를 지원합니다.
3. **단일 원장 기반 무결성 (Ledger Sync)**
   - 현금 입출금, 계좌 간 자금 이동, 주식 매수 및 매도시 모든 내역이 거래 장부(History)에 기록되며 계좌 잔고가 실시간 동적 재계산됩니다.
4. **직관적인 UI / 시각화 대시보드**
   - Chart.js를 사용한 **포트폴리오 비중** 및 **자산 카테고리 분포** 도넛 차트.
   - 순입금(원금) 대비 총자산의 증감 추이를 확인할 수 있는 **시계열 라인 차트**.
   - 계좌별 손익 상태를 한눈에 보여주는 **현금 흐름 Bar 차트**.
5. **안전한 데이터 관리 (백업/복구)**
   - JSON 형태로 데이터를 로컬 장치에 백업하거나 불러와 손쉽게 데이터를 복원할 수 있습니다.

---

## 🚀 실행 및 배포 가이드 (Getting Started)

### 방법 A. Docker로 실행하기 (Synology NAS / 로컬 Docker 등)
본 프로젝트는 Docker 환경에서 24시간 상시 가동할 수 있습니다. 특히 **Synology NAS의 Container Manager(Docker)** 등을 활용해 쉽게 배포할 수 있습니다.

#### [방안 1] Docker CLI로 기동하기
1. **도커 이미지 빌드**
   ```bash
   docker build -t stock-dashboard:latest .
   ```
2. **컨테이너 실행 (환경변수 주입)**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e TOSS_CLIENT_ID="발급받은_TOSS_CLIENT_ID" \
     -e TOSS_CLIENT_SECRET="발급받은_TOSS_CLIENT_SECRET" \
     --name stock-app \
     stock-dashboard:latest
   ```

#### [방안 2] Synology NAS Container Manager GUI로 기동하기
1. **레지스트리 다운로드**:
   - Container Manager의 '레지스트리' 메뉴에서 `node`를 검색하여 최신 공식 이미지(예: `node:24-alpine`)를 다운로드합니다.
2. **볼륨 매핑(Volume Mount)**:
   - NAS의 프로젝트 폴더(예: `docker/stock`)를 컨테이너 내부의 `/app` 경로로 매핑(마운트)합니다.
   - *주의: 최초 배포 및 구동 시에는 해당 NAS 폴더 경로에서 파워셸 또는 터미널을 열고 `npm install` 명령을 실행해 라이브러리 폴더(`node_modules`)를 한 번 생성해주어야 정상 작동합니다.*
3. **포트 설정(Port Settings)**:
   - 로컬 포트 `3000` -> 컨테이너 포트 `3000`으로 매핑합니다.
4. **환경변수 추가(Environment)**:
   - 컨테이너 설정 단계의 환경변수 목록에 아래 두 키 값을 직접 등록합니다.
     * `TOSS_CLIENT_ID` : `발급받은_CLIENT_ID`
     * `TOSS_CLIENT_SECRET` : `발급받은_CLIENT_SECRET`
5. **실행 명령(Command) 설정**:
   - 컨테이너 고급 설정의 **실행 명령(Command)** 칸에는 늘 사용하시던 방식 그대로 아래 명령어를 입력합니다:
     ```bash
     node /app/server.js
     ```
6. **실행**:
   - 설정을 완료하고 컨테이너를 시작한 후 브라우저에서 `http://[NAS_IP]:3000`으로 접속하면 시세가 즉시 정상 작동합니다.

---

### 방법 B. 로컬 Node.js로 직접 실행하기
Node.js(v18 이상, v24 권장)가 설치된 환경에서 수동으로 구동하는 방법입니다.

1. **의존성 모듈 설치**
   ```bash
   npm install
   ```
2. **환경변수 설정 및 실행**
   - **Windows PowerShell**:
     ```powershell
     $env:TOSS_CLIENT_ID="발급받은_TOSS_CLIENT_ID"
     $env:TOSS_CLIENT_SECRET="발급받은_TOSS_CLIENT_SECRET"
     node server.js
     ```
   - **Linux / macOS / Bash**:
     ```bash
     TOSS_CLIENT_ID="발급받은_TOSS_CLIENT_ID" TOSS_CLIENT_SECRET="발급받은_TOSS_CLIENT_SECRET" node server.js
     ```
3. **접속**
   브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 🛠 기술 스택
* **Front-end**: HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js
* **Back-end**: Node.js 24, Express, Axios, Cheerio
* **Database / Storage**: JSON File Database (`data/db.json` 서버 영속 보관) 및 Web LocalStorage 백업

---

## 🛡️ 보안 및 프라이버시 주의사항
* API Key 및 Secret Key는 절대로 Git 저장소 소스코드에 하드코딩하지 마십시오. 반드시 호스트(또는 도커 컨테이너) 환경변수(`TOSS_CLIENT_ID`, `TOSS_CLIENT_SECRET`)로 관리하십시오.
* 개발 이력 및 에이전트 캐싱 파일(`.agent/docs/`) 등은 이미 `.gitignore`에 등록되어 GitHub 퍼블릭 저장소로 노출되는 것이 방지되고 있습니다.

---
**Designed by 돼지지렁이 (PigWorm) v4.2.1**
---

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다.  
Copyright (c) 2026 **돼지지렁이**. All rights reserved.

---

### 👑 Contributor
- **돼지지렁이** (Antigravity Developer)
