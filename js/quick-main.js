/* =========================
   QUICK MAIN
========================= */

/* =========================
   요소 가져오기
========================= */

const roomTitle = document.getElementById("roomTitle");

const editRoomButton = document.getElementById("editRoomButton");

const itemName = document.getElementById("itemName");

const itemAmount = document.getElementById("itemAmount");

const currencySelect = document.getElementById("currencySelect");

const currencySymbol = document.getElementById("currencySymbol");

const exchangeRate = document.getElementById("exchangeRate");

const participantButtons = document.getElementById("participantButtons");

const addItemButton = document.getElementById("addItemButton");

const settlementItems = document.getElementById("settlementItems");

const settleButton = document.getElementById("settleButton");

/* =========================
   방 정보
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const currentRoom = rooms.length > 0 ? rooms[rooms.length - 1] : null;

if (currentRoom) {
  roomTitle.textContent = currentRoom.name || "정산방";
}

/* =========================
   현재 방 ID

   방마다 정산 항목을
   따로 저장하기 위해 사용
========================= */

const currentRoomId = currentRoom?.id || "default";

const quickItemsKey = `quickItems_${currentRoomId}`;

/* =========================
   참여자 가져오기
========================= */

const participants =
  JSON.parse(sessionStorage.getItem("quickParticipants")) || [];

/* =========================
   정산 항목 가져오기

   방마다 다른 key 사용
========================= */

let items = JSON.parse(sessionStorage.getItem(quickItemsKey)) || [];

/* 현재 선택된 참여자 */

let selectedParticipantIds = [];

/* 현재 수정 중인 항목 ID */

let editingItemId = null;

/* =========================
   통화 정보
========================= */

const currencies = {
  KRW: {
    symbol: "₩",
  },

  USD: {
    symbol: "$",
  },

  JPY: {
    symbol: "¥",
  },

  EUR: {
    symbol: "€",
  },

  GBP: {
    symbol: "£",
  },
};

/* =========================
   참여자 버튼 출력
========================= */

function renderParticipantButtons() {
  participantButtons.innerHTML = "";

  participants.forEach(function (participant) {
    const button = document.createElement("button");

    button.type = "button";

    button.classList.add("participant-select-button");

    button.innerHTML = `
        <span
          class="participant-dot"
          style="background-color: ${participant.color}"
        ></span>

        <span>
          ${participant.isMe ? `${participant.name} (나)` : participant.name}
        </span>
      `;

    /* =========================
         참여자 선택 / 해제
      ========================= */

    button.addEventListener("click", function () {
      const participantId = participant.id;

      if (selectedParticipantIds.includes(participantId)) {
        selectedParticipantIds = selectedParticipantIds.filter(function (id) {
          return id !== participantId;
        });

        button.classList.remove("selected");
      } else {
        selectedParticipantIds.push(participantId);

        button.classList.add("selected");
      }
    });

    participantButtons.appendChild(button);
  });
}

renderParticipantButtons();

/* =========================
   통화 변경
========================= */

currencySelect.addEventListener("change", function () {
  const currency = currencySelect.value;

  currencySymbol.textContent = currencies[currency].symbol;

  updateExchangeRate();
});

/* =========================
   환율 가져오기
========================= */

async function updateExchangeRate() {
  const currency = currencySelect.value;

  /* KRW면 환율 표시 필요 없음 */

  if (currency === "KRW") {
    exchangeRate.textContent = "";

    return;
  }

  exchangeRate.textContent = "현재 환율을 불러오는 중...";

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=KRW`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    const rate = data.rates.KRW;

    if (!rate) {
      throw new Error("KRW 환율 데이터 없음");
    }

    const symbol = currencies[currency].symbol;

    exchangeRate.textContent = `현재 환율 · ${symbol}1 = ₩${rate.toLocaleString(
      "ko-KR",
      {
        maximumFractionDigits: 2,
      },
    )}`;
  } catch (error) {
    console.error("환율 불러오기 실패:", error);

    exchangeRate.textContent = "현재 환율을 불러오지 못했습니다.";
  }
}

/* =========================
   항목 추가 / 수정
========================= */

addItemButton.addEventListener("click", function () {
  const name = itemName.value.trim();

  const amount = Number(itemAmount.value);

  const currency = currencySelect.value;

  /* 항목명 검사 */

  if (name === "") {
    alert("항목명을 입력해 주세요.");

    return;
  }

  /* 금액 검사 */

  if (!amount || amount <= 0) {
    alert("금액을 입력해 주세요.");

    return;
  }

  /* 참여자 검사 */

  if (selectedParticipantIds.length === 0) {
    alert("참여 인원을 선택해 주세요.");

    return;
  }

  /* =========================
       수정 중인 경우
    ========================= */

  if (editingItemId !== null) {
    const targetItem = items.find(function (item) {
      return item.id === editingItemId;
    });

    if (targetItem) {
      targetItem.name = name;

      targetItem.amount = amount;

      targetItem.currency = currency;

      targetItem.participantIds = [...selectedParticipantIds];
    }

    editingItemId = null;

    addItemButton.innerHTML = "<span>+</span> 항목 추가하기";
  } else {
    /* =========================
       새 항목 추가
    ========================= */
    items.push({
      id: Date.now(),

      name: name,

      amount: amount,

      currency: currency,

      participantIds: [...selectedParticipantIds],
    });
  }

  saveItems();

  renderItems();

  resetInput();
});

/* =========================
   정산 항목 저장

   ★ 방별 key 사용
========================= */

function saveItems() {
  sessionStorage.setItem(quickItemsKey, JSON.stringify(items));
}

/* =========================
   입력창 초기화
========================= */

function resetInput() {
  itemName.value = "";

  itemAmount.value = "";

  selectedParticipantIds = [];

  document
    .querySelectorAll(".participant-select-button")
    .forEach(function (button) {
      button.classList.remove("selected");
    });
}

/* =========================
   정산 항목 출력
========================= */

function renderItems() {
  settlementItems.innerHTML = "";

  items.forEach(function (item) {
    /* =========================
         전체 wrapper
      ========================= */

    const wrapper = document.createElement("div");

    wrapper.classList.add("settlement-item");

    /* =========================
         수정 / 삭제 버튼 영역
      ========================= */

    const actions = document.createElement("div");

    actions.classList.add("item-actions");

    /* 수정 버튼 */

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.classList.add("item-action-button", "edit-item-button");

    editButton.textContent = "수정";

    /* 삭제 버튼 */

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.classList.add("item-action-button", "delete-item-button");

    deleteButton.textContent = "삭제";

    actions.appendChild(editButton);

    actions.appendChild(deleteButton);

    /* =========================
         실제 항목 내용
      ========================= */

    const content = document.createElement("div");

    content.classList.add("settlement-item-content");

    /* 참여자 색상 동그라미 */

    const participantDots = item.participantIds
      .map(function (id) {
        const participant = participants.find(function (person) {
          return person.id === id;
        });

        if (!participant) {
          return "";
        }

        return `
                <span
                  class="item-participant-dot"
                  style="background-color: ${participant.color}"
                ></span>
              `;
      })
      .join("");

    /* 통화 기호 */

    const symbol = currencies[item.currency]?.symbol || "";

    /* 실제 항목 HTML */

    content.innerHTML = `
        <span class="item-name">
          ${item.name}
        </span>

        <div class="item-right">

          <span class="item-amount">
            ${symbol}${item.amount.toLocaleString()}
          </span>

          <div class="item-participants">
            ${participantDots}
          </div>

        </div>
      `;

    wrapper.appendChild(actions);

    wrapper.appendChild(content);

    /* =========================
         스와이프
      ========================= */

    let startX = null;

    let currentX = 0;

    let isDragging = false;

    /* 터치 시작 */

    content.addEventListener("pointerdown", function (event) {
      startX = event.clientX;

      currentX = 0;

      isDragging = true;

      content.setPointerCapture(event.pointerId);
    });

    /* 움직이는 중 */

    content.addEventListener("pointermove", function (event) {
      if (!isDragging || startX === null) {
        return;
      }

      currentX = event.clientX - startX;

      /*
            왼쪽으로만 이동

            수정 64px
            삭제 64px
            총 128px
          */

      if (currentX < 0) {
        const moveX = Math.max(currentX, -128);

        content.style.transform = `translateX(${moveX}px)`;
      }
    });

    /* 터치 끝 */

    content.addEventListener("pointerup", function () {
      if (!isDragging) {
        return;
      }

      if (currentX < -50) {
        content.style.transform = "translateX(-128px)";
      } else {
        content.style.transform = "translateX(0)";
      }

      startX = null;

      currentX = 0;

      isDragging = false;
    });

    /* 터치 취소 */

    content.addEventListener("pointercancel", function () {
      startX = null;

      currentX = 0;

      isDragging = false;
    });

    /* =========================
         수정 버튼
      ========================= */

    editButton.addEventListener("click", function () {
      editItem(item.id);
    });

    /* =========================
         삭제 버튼
      ========================= */

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm(`${item.name} 항목을 삭제할까요?`);

      if (!shouldDelete) {
        return;
      }

      items = items.filter(function (targetItem) {
        return targetItem.id !== item.id;
      });

      /*
            삭제했으면
            수정 상태도 전부 초기화
          */

      editingItemId = null;

      resetInput();

      addItemButton.innerHTML = "<span>+</span> 항목 추가하기";

      saveItems();

      renderItems();
    });

    settlementItems.appendChild(wrapper);
  });
}

/* =========================
   처음 화면 표시
========================= */

renderItems();

/* =========================
   항목 수정
========================= */

function editItem(id) {
  const item = items.find(function (targetItem) {
    return targetItem.id === id;
  });

  if (!item) {
    return;
  }

  /* 수정 중인 항목 기억 */

  editingItemId = id;

  /* 기존 내용 넣기 */

  itemName.value = item.name;

  itemAmount.value = item.amount;

  currencySelect.value = item.currency;

  currencySymbol.textContent = currencies[item.currency].symbol;

  /* 참여자 다시 선택 */

  selectedParticipantIds = [...item.participantIds];

  document
    .querySelectorAll(".participant-select-button")
    .forEach(function (button, index) {
      const participant = participants[index];

      if (participant && selectedParticipantIds.includes(participant.id)) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    });

  /* 버튼 수정 모드 */

  addItemButton.textContent = "수정 완료";

  /* 환율 다시 표시 */

  updateExchangeRate();

  /* 입력창 위치로 이동 */

  document.querySelector(".item-input-card").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =========================
   방 정보 수정
========================= */

editRoomButton.addEventListener("click", function () {
  location.href = "15_edit-quick-room.html";
});

/* =========================
   정산하기
========================= */

settleButton.addEventListener("click", function () {
  if (items.length === 0) {
    alert("정산 항목을 하나 이상 추가해 주세요.");

    return;
  }

  location.href = "16_quick-summary.html";
});

/* =========================
   초기 환율 표시
========================= */

updateExchangeRate();
