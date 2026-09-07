/* =========================
   SETTLEMENT ROOM
========================= */

/* =========================
   요소
========================= */

const settlementRoomList = document.getElementById("settlementRoomList");

const showHistoryCheckbox = document.getElementById("showHistoryCheckbox");

const roomListTitle = document.getElementById("roomListTitle");

const emptyRoomMessage = document.getElementById("emptyRoomMessage");

const backButton = document.getElementById("backButton");

/* =========================
   rooms
========================= */

function getRooms() {
  return JSON.parse(localStorage.getItem("rooms")) || [];
}

/* =========================
   결과 존재 여부
========================= */

function hasSettlementResult(room) {
  if (!room) {
    return false;
  }

  if (room.mode === "quick") {
    return Boolean(localStorage.getItem(`quickSettlementResult_${room.id}`));
  }

  if (room.mode === "together") {
    return Boolean(localStorage.getItem(`togetherSettlementResult_${room.id}`));
  }

  return room.resultCreated === true;
}

/* =========================
   완료 여부
========================= */

function isRoomCompleted(room) {
  return room.isCompleted === true || Number(room.progress) >= 100;
}

/* =========================
   표시할 방
========================= */

function getVisibleRooms() {
  const rooms = getRooms();

  const showHistory = showHistoryCheckbox.checked;

  return rooms
    .filter(function (room) {
      if (room.hasLeft === true) {
        return false;
      }

      if (!hasSettlementResult(room)) {
        return false;
      }

      if (!showHistory && isRoomCompleted(room)) {
        return false;
      }

      return true;
    })
    .sort(function (a, b) {
      const aCompleted = isRoomCompleted(a);

      const bCompleted = isRoomCompleted(b);

      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }

      return Number(b.id) - Number(a.id);
    });
}

/* =========================
   결과 페이지 이동
========================= */

function openSettlementRoom(room) {
  sessionStorage.setItem("currentRoomId", String(room.id));

  if (room.mode === "together") {
    location.href = `19_together-result.html?roomId=${room.id}`;

    return;
  }

  if (room.mode === "quick") {
    location.href = `17_quick-result.html?roomId=${room.id}`;

    return;
  }

  if (room.resultPage) {
    location.href = `${room.resultPage}?roomId=${room.id}`;

    return;
  }

  alert("정산 결과 페이지를 찾을 수 없습니다.");
}

/* =========================
   진행도
========================= */

function getProgress(room) {
  const progress = Number(room.progress) || 0;

  return Math.min(100, Math.max(0, progress));
}

/* =========================
   카드 생성
========================= */

function createRoomCard(room) {
  const completed = isRoomCompleted(room);

  const progress = getProgress(room);

  const current = Number(room.current) || 0;

  const total = Number(room.total) || 0;

  const card = document.createElement("article");

  card.className = "settlement-room-card";

  if (completed) {
    card.classList.add("completed");
  }

  card.innerHTML = `
    <div class="room-card-top">

      <span class="room-card-name">
        ${room.name || "정산방"}
      </span>

      <span class="room-card-count">
        (${current}/${total})
      </span>

    </div>


    <div class="room-progress-bar">

      <div
        class="room-progress-fill"
        style="width: ${progress}%"
      >

        <span class="room-progress-text">
          ${progress}%
        </span>

      </div>

    </div>


    ${
      completed
        ? `
          <span class="room-history-label">
            완료된 정산
          </span>
        `
        : ""
    }
  `;

  card.addEventListener("click", function () {
    openSettlementRoom(room);
  });

  return card;
}

/* =========================
   목록 출력
========================= */

function renderRooms() {
  settlementRoomList.innerHTML = "";

  const showHistory = showHistoryCheckbox.checked;

  const visibleRooms = getVisibleRooms();

  if (showHistory) {
    roomListTitle.textContent = "전체 정산";
  } else {
    roomListTitle.textContent = "진행 중인 정산";
  }

  if (visibleRooms.length === 0) {
    emptyRoomMessage.classList.remove("hidden");

    if (showHistory) {
      emptyRoomMessage.innerHTML = `
        <strong>
          아직 정산 기록이 없어요.
        </strong>

        <p>
          새로운 정산을 시작해 보세요.
        </p>
      `;
    } else {
      emptyRoomMessage.innerHTML = `
        <strong>
          진행 중인 정산이 없어요.
        </strong>

        <p>
          과거 정산 보기를 켜거나
          새로운 정산을 시작해 보세요.
        </p>
      `;
    }

    return;
  }

  emptyRoomMessage.classList.add("hidden");

  visibleRooms.forEach(function (room) {
    settlementRoomList.appendChild(createRoomCard(room));
  });
}

/* =========================
   과거 정산 보기
========================= */

showHistoryCheckbox.addEventListener("change", function () {
  renderRooms();
});

/* =========================
   뒤로가기
========================= */

backButton.addEventListener("click", function () {
  location.href = "05_home.html";
});

/* =========================
   최초 실행
========================= */

renderRooms();
