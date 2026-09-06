const roomTitle = document.getElementById("roomTitle");

const participantInput = document.getElementById("participantInput");

const participantList = document.getElementById("participantList");

const startSettlementButton = document.getElementById("startSettlementButton");

/* =========================
   방 이름 가져오기
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

if (rooms.length > 0) {
  const latestRoom = rooms[rooms.length - 1];

  roomTitle.textContent = latestRoom.name || "정산방";
}

/* =========================
   사용자 이름 가져오기
========================= */

const userName = localStorage.getItem("userName") || "나";

/* =========================
   참여자 데이터
========================= */

const participants = [];

/* =========================
   참여자 색상 팔레트

   서로 최대한 구분되는 색상으로 구성
========================= */

const participantColors = [
  "#52AEAD", // 청록
  "#F2C14E", // 노랑
  "#8F6CCF", // 보라
  "#F28C52", // 주황
  "#5B8FD1", // 파랑
  "#69C48D", // 초록
  "#E66B8C", // 핑크
  "#56C6D8", // 하늘
  "#B58A5A", // 브라운
  "#A7C957", // 연두
];

/* =========================
   색상 순서 랜덤 섞기
========================= */

const shuffledColors = [...participantColors];

for (let i = shuffledColors.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));

  [shuffledColors[i], shuffledColors[j]] = [
    shuffledColors[j],
    shuffledColors[i],
  ];
}

/* =========================
   다음 색상 가져오기
========================= */

let colorIndex = 0;

function getNextColor() {
  const color = shuffledColors[colorIndex % shuffledColors.length];

  colorIndex++;

  return color;
}

/* =========================
   나를 기본 참여자로 추가
========================= */

participants.push({
  id: "me",
  name: userName,
  color: getNextColor(),
  isMe: true,
});

/* =========================
   참여자 화면에 출력
========================= */

function renderParticipants() {
  participantList.innerHTML = "";

  participants.forEach(function (participant) {
    const item = document.createElement("div");

    item.classList.add("participant-item");

    item.innerHTML = `
      <span
        class="participant-color"
        style="background-color: ${participant.color}"
      ></span>

      <span class="participant-name">
        ${participant.name}
        ${participant.isMe ? '<span class="me-label">(나)</span>' : ""}
      </span>
    `;

    participantList.appendChild(item);
  });
}

/* =========================
   처음 화면 열릴 때
   나 표시
========================= */

renderParticipants();

/* =========================
   참여자 추가
========================= */

function addParticipant() {
  const name = participantInput.value.trim();

  /* 빈 값이면 추가 안 함 */

  if (name === "") {
    return;
  }

  /* =========================
     중복 이름 확인
  ========================= */

  const alreadyExists = participants.some(function (participant) {
    return participant.name === name;
  });

  if (alreadyExists) {
    alert("이미 추가된 참여자입니다.");

    participantInput.value = "";

    participantInput.focus();

    return;
  }

  /* =========================
     참여자 객체 생성
  ========================= */

  const participant = {
    id: Date.now(),
    name: name,
    color: getNextColor(),
    isMe: false,
  };

  /* 배열에 추가 */

  participants.push(participant);

  /* 화면 다시 그리기 */

  renderParticipants();

  /* 입력창 비우기 */

  participantInput.value = "";

  /* 다시 입력 가능하도록 포커스 */

  participantInput.focus();
}

/* =========================
   한글 IME 입력 처리
========================= */

let isComposing = false;

/* 한글 입력 시작 */

participantInput.addEventListener("compositionstart", function () {
  isComposing = true;
});

/* 한글 입력 완료 */

participantInput.addEventListener("compositionend", function () {
  isComposing = false;
});

/* =========================
   Enter 입력
========================= */

participantInput.addEventListener("keydown", function (event) {
  if (event.key !== "Enter") {
    return;
  }

  /* 한글 조합 중 Enter는 무시 */

  if (isComposing || event.isComposing || event.keyCode === 229) {
    return;
  }

  event.preventDefault();

  /*
      한글 입력 완료 후
      실제 input 값이 확정된 다음 추가
    */

  setTimeout(function () {
    addParticipant();
  }, 0);
});

/* =========================
   정산 시작하기
========================= */

startSettlementButton.addEventListener("click", function () {
  // 나 외에 최소 1명은 있어야 함
  if (participants.length < 2) {
    alert("정산할 참여자를 한 명 이상 추가해 주세요.");
    return;
  }

  // 참여자 정보 저장
  sessionStorage.setItem("quickParticipants", JSON.stringify(participants));

  // 빠르게 정산 메인방으로 이동
  window.location.href = "14_quick-main.html?mode=quick";
});
