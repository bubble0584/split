/* =========================
   HOME
========================= */

/* =========================
   요소
========================= */

const settlementList = document.getElementById("settlementList");

const mainAddButton = document.querySelector(".main-add-button");

const settlementOverlay = document.getElementById("settlementOverlay");

const joinRoomButton = document.getElementById("joinRoomButton");

/* =========================
   rooms
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

/* =========================
   오늘
========================= */

const today = new Date();

today.setHours(0, 0, 0, 0);

/* =========================
   해당 방의 결과가
   실제로 존재하는지
========================= */

function hasSettlementResult(room) {
  if (room.mode === "quick") {
    return Boolean(localStorage.getItem(`quickSettlementResult_${room.id}`));
  }

  if (room.mode === "together") {
    /*
      Together는 다음 단계에서
      togetherSettlementResult_${roomId}
      구조로 맞출 예정.

      지금 이미 resultCreated가 있는
      together 방은 임시로 허용.
    */

    return room.resultCreated === true;
  }

  return false;
}

/* =========================
   진행 중인 방 필터
========================= */

const activeRooms = rooms.filter(function (room) {
  /*
        방 활성화
      */

  if (room.isActive !== true) {
    return false;
  }

  /*
        정산 완료된 방 제거
      */

  if (room.isCompleted === true) {
    return false;
  }

  /*
        나간 방 제거
      */

  if (room.hasLeft === true) {
    return false;
  }

  /*
        정산 결과가 만들어진 적 없는
        예전 테스트 방 제거
      */

  if (!hasSettlementResult(room)) {
    return false;
  }

  /*
        마감일 지난 방
      */

  if (room.deadline) {
    const deadlineDate = new Date(`${room.deadline}T00:00:00`);

    if (deadlineDate < today) {
      return false;
    }
  }

  /*
        100% 완료 데이터 제거
      */

  if (Number(room.progress) >= 100) {
    return false;
  }

  return true;
});

/* =========================
   카드 이동
========================= */

function openRoomResult(room) {
  sessionStorage.setItem("currentRoomId", String(room.id));

  /* QUICK */

  if (room.mode === "quick") {
    location.href = `17_quick-result.html?roomId=${room.id}`;

    return;
  }

  /* TOGETHER */

  if (room.mode === "together") {
    location.href = `19_together-result.html?roomId=${room.id}`;

    return;
  }

  alert("정산 방식을 확인할 수 없습니다.");
}

/* =========================
   카드 출력
========================= */

function renderSettlementRooms() {
  settlementList.innerHTML = "";

  activeRooms.forEach(function (room) {
    const current = Number(room.current) || 0;

    const total = Number(room.total) || 0;

    const percent = Math.max(0, Math.min(100, Number(room.progress) || 0));

    const card = document.createElement("div");

    card.className = "settlement-card";

    card.setAttribute("role", "button");

    card.setAttribute("tabindex", "0");

    card.innerHTML = `
        <div class="settlement-title">

          <span class="settlement-room-name">
            ${room.name}
          </span>

          <span class="settlement-progress-count">
            (${current}/${total})
          </span>

        </div>

        <div class="progress-bar">

          <div
            class="
              progress-fill
              ${percent === 0 ? "zero" : ""}
            "
            style="
              width: ${percent}%;
            "
          >
            ${percent > 0 ? `${percent}%` : ""}
          </div>

        </div>
      `;

    card.addEventListener("click", function () {
      openRoomResult(room);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        openRoomResult(room);
      }
    });

    settlementList.appendChild(card);
  });
}

/* =========================
   최초 출력
========================= */

renderSettlementRooms();

/* =========================
   가운데 +
========================= */

mainAddButton.addEventListener("click", function () {
  settlementOverlay.classList.toggle("active");
});

/* =========================
   오버레이 닫기
========================= */

settlementOverlay.addEventListener("click", function (event) {
  if (event.target === settlementOverlay) {
    settlementOverlay.classList.remove("active");
  }
});

/* =========================
   기존 방 참여
========================= */

joinRoomButton.addEventListener("click", function () {
  alert("기존 정산방 참여하기는 아직 연결 전입니다.");
});
