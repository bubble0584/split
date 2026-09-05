const createRoomButton = document.getElementById("createRoomButton");

/* =========================
   URL에서 mode 읽기

   together = 함께 정산
   quick = 빠르게 정산
========================= */

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

/* =========================
   방 생성
========================= */

createRoomButton.addEventListener("click", function () {
  const roomName = document.getElementById("roomName").value.trim();

  const deadline = document.getElementById("deadline").value;

  const description = document.getElementById("description").value.trim();

  const baseCurrency = document.getElementById("baseCurrency").value;

  /* =========================
     입력 검사
  ========================= */

  if (!roomName) {
    alert("모임 이름을 입력해주세요.");
    return;
  }

  if (!deadline) {
    alert("정산 기한을 선택해주세요.");
    return;
  }

  /* =========================
     새로운 방
  ========================= */

  const newRoom = {
    id: Date.now(),

    name: roomName,
    deadline: deadline,
    description: description,

    baseCurrency: baseCurrency,

    current: 0,
    total: 1,
    progress: 0,

    isActive: true,
    isCompleted: false,
    hasLeft: false,

    mode: mode,
  };

  /* =========================
     기존 방 가져오기
  ========================= */

  const savedRooms = JSON.parse(localStorage.getItem("rooms")) || [];

  /* 새 방 저장 */

  savedRooms.push(newRoom);

  localStorage.setItem("rooms", JSON.stringify(savedRooms));

  /* =========================
     현재 방 ID 저장
  ========================= */

  sessionStorage.setItem("currentRoomId", String(newRoom.id));

  /* =========================
     페이지 이동
  ========================= */

  if (mode === "together") {
    window.location.href = `09_together-room.html?roomId=${newRoom.id}`;
  } else if (mode === "quick") {
    window.location.href = `10_quick-room.html?roomId=${newRoom.id}`;
  } else {
    alert("정산 방식을 확인할 수 없습니다.");
  }
});
