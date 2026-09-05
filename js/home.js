const settlementList = document.getElementById("settlementList");

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const today = new Date();

const activeRooms = rooms.filter(function (room) {
  const deadlineDate = new Date(room.deadline);

  return (
    room.isActive === true &&
    room.isCompleted === false &&
    room.hasLeft === false &&
    deadlineDate >= today
  );
});

if (activeRooms.length === 0) {
  settlementList.innerHTML = "";
} else {
  activeRooms.forEach(function (room) {
    const card = document.createElement("div");

    card.classList.add("settlement-card");

    card.innerHTML = `
      <div class="settlement-title">
        <span>${room.name}</span>
        <span>(${room.current}/${room.total})</span>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: ${room.progress}%"
        >
          ${room.progress}%
        </div>
      </div>
    `;

    settlementList.appendChild(card);
  });
}

// ===============================
// 가운데 + 버튼 메뉴
// ===============================

const mainAddButton = document.querySelector(".main-add-button");
const settlementOverlay = document.getElementById("settlementOverlay");
const joinRoomButton = document.getElementById("joinRoomButton");

mainAddButton.addEventListener("click", function () {
  settlementOverlay.classList.toggle("active");
});

settlementOverlay.addEventListener("click", function (e) {
  if (e.target === settlementOverlay) {
    settlementOverlay.classList.remove("active");
  }
});

joinRoomButton.addEventListener("click", function () {
  alert("기존 정산방 참여하기는 아직 연결 전입니다.");
});
