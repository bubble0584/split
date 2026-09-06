const MAX_PARTICIPANTS = 4;

/* =========================
   요소
========================= */

const participantList = document.getElementById("participantList");

const participantCount = document.getElementById("participantCount");

const shareButton = document.getElementById("shareButton");

const shareModal = document.getElementById("shareModal");

const qrCode = document.getElementById("qrCode");

const kakaoShareButton = document.getElementById("kakaoShareButton");

const backButton = document.getElementById("backButton");

const deleteRoomButton = document.getElementById("deleteRoomButton");

const startItemButton = document.getElementById("startItemButton");

const roomTitle = document.getElementById("roomTitle");

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const currentRoom = rooms.length > 0 ? rooms[rooms.length - 1] : null;

if (currentRoom) {
  roomTitle.textContent = currentRoom.name || "정산방";
}

/* =========================
   현재 사용자가 방장인지
========================= */

const isCurrentUserHost = true;

/* =========================
   참여자
========================= */

let participants = [];

/* =========================
   랜덤 색
========================= */

const participantColors = [
  "#52B8B8",
  "#F3A35C",
  "#7B8DEB",
  "#B879D9",
  "#E87575",
  "#70B77E",
  "#E5B94B",
  "#659DBD",
];

function getRandomColor() {
  const index = Math.floor(Math.random() * participantColors.length);

  return participantColors[index];
}

/* =========================
   참여자 출력
========================= */

function renderParticipants() {
  participantList.innerHTML = "";

  participants.forEach((participant) => {
    const item = document.createElement("div");

    item.className = "participant-item";

    const deleteButton = isCurrentUserHost
      ? `
            <button
              class="remove-participant-button"
              data-id="${participant.id}"
              type="button"
            >
              삭제
            </button>
          `
      : "";

    item.innerHTML = `

        <div
          class="participant-avatar"
          style="
            --participant-color:
            ${participant.color}
          "
        >

          ${
            participant.profileImage
              ? `
                <img
                  src="${participant.profileImage}"
                  alt="${participant.name}"
                />
              `
              : "👤"
          }

        </div>


        <div class="participant-name">
          ${participant.name}
        </div>


        ${deleteButton}

      `;

    participantList.appendChild(item);
  });

  participantCount.textContent = `(${participants.length}/${MAX_PARTICIPANTS})`;

  addRemoveParticipantEvents();
}

/* =========================
   참여자 삭제
========================= */

function addRemoveParticipantEvents() {
  const buttons = document.querySelectorAll(".remove-participant-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);

      const participant = participants.find((person) => person.id === id);

      if (!participant) return;

      const confirmed = confirm(`${participant.name}님을 삭제하시겠습니까?`);

      if (!confirmed) return;

      participants = participants.filter((person) => person.id !== id);

      renderParticipants();
    });
  });
}

/* =========================
   공유 모달
========================= */

const roomInviteUrl = window.location.origin + "/join-room.html?room=1234";

shareButton.addEventListener("click", () => {
  /*
      기존 QR 삭제
    */

  qrCode.innerHTML = "";

  /*
      QR 새로 생성
    */

  new QRCode(qrCode, {
    text: roomInviteUrl,
    width: 132,
    height: 132,
  });

  /*
      모달 표시
    */

  shareModal.classList.remove("hidden");
});

/* =========================
   모달 바깥 클릭하면 닫기
========================= */

shareModal.addEventListener("click", (event) => {
  if (
    event.target === shareModal ||
    event.target.classList.contains("share-modal")
  ) {
    shareModal.classList.add("hidden");
  }
});

/* =========================
   카카오 공유 버튼
========================= */

kakaoShareButton.addEventListener("click", () => {
  /*
      실제 카카오톡 공유는
      카카오 JavaScript SDK 및
      앱 키 연결이 필요함.

      지금은 프론트 UI만 구현.
    */

  alert("카카오톡 공유 기능은 추후 연결 예정입니다.");
});

/* =========================
   뒤로가기
========================= */

backButton.addEventListener("click", () => {
  history.back();
});

/* =========================
   방 삭제
========================= */

deleteRoomButton.addEventListener("click", () => {
  if (!isCurrentUserHost) {
    return;
  }

  const confirmed = confirm("방을 삭제하시겠습니까?");

  if (!confirmed) return;

  window.location.href = "05_home.html";
});

/* =========================
   항목 입력하기
========================= */

startItemButton.addEventListener("click", () => {
  //   if (participants.length === 0) {
  //     alert("먼저 참여자를 초대해주세요.");
  //     return;
  //   }

  sessionStorage.setItem("togetherParticipants", JSON.stringify(participants));

  window.location.href = "14_quick-main.html?mode=together";
});

/* =========================
   최초 실행
========================= */

renderParticipants();
