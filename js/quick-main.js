/* =========================
   QUICK / TOGETHER MAIN
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
   현재 정산 모드
========================= */

const urlParams = new URLSearchParams(window.location.search);

const mode = urlParams.get("mode") || "quick";

console.log("현재 정산 모드:", mode);

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
========================= */

const currentRoomId = currentRoom?.id || "default";

/* =========================
   항목 저장 key

   quick / together 분리
========================= */

const itemsKey =
  mode === "together"
    ? `togetherItems_${currentRoomId}`
    : `quickItems_${currentRoomId}`;

/* =========================
   참여자 가져오기
========================= */

let participants = [];

/* =========================
   함께 정산
========================= */

if (mode === "together") {
  const invitedParticipants =
    JSON.parse(sessionStorage.getItem("togetherParticipants")) || [];

  /*
    현재 프론트 테스트에서는
    로그인한 사용자를 host로 사용.

    나중에 백엔드 연결 후
    실제 로그인 사용자 정보로 교체.
  */

  const host = {
    id: "host",
    name: "나",
    isMe: true,
    isHost: true,
    color: "#F5C04A",
    profileImage: null,
  };

  participants = [host, ...invitedParticipants];

  /* =========================
   빠르게 정산
========================= */
} else {
  participants = JSON.parse(sessionStorage.getItem("quickParticipants")) || [];
}

/* =========================
   참여자 이름 표시
========================= */

function getParticipantDisplayName(participant) {
  /*
    함께 정산
  */

  if (mode === "together") {
    if (participant.isHost) {
      return `${participant.name} (방장)`;
    }

    return participant.name;
  }

  /*
    빠르게 정산
  */

  if (participant.isMe) {
    return `${participant.name} (나)`;
  }

  return participant.name;
}

/* =========================
   현재 사용자
========================= */

const currentUser =
  participants.find((participant) => participant.isMe) || null;

/* =========================
   정산 항목 가져오기
========================= */

let items = JSON.parse(sessionStorage.getItem(itemsKey)) || [];

/* =========================
   기존 together 항목 보정

   payer 기능 추가 전에 만든
   테스트 항목용.

   나중에 백엔드 연결 후 제거 가능.
========================= */

if (mode === "together" && currentUser) {
  let needsSave = false;

  items = items.map(function (item) {
    if (!item.payerId) {
      needsSave = true;

      return {
        ...item,

        payerId: currentUser.id,

        payerName: getParticipantDisplayName(currentUser),
      };
    }

    return item;
  });

  if (needsSave) {
    sessionStorage.setItem(itemsKey, JSON.stringify(items));
  }
}

/* =========================
   현재 선택된 참여자
========================= */

let selectedParticipantIds = [];

/* =========================
   현재 수정 중인 항목 ID
========================= */

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
          style="
            background-color:
            ${participant.color}
          "
        ></span>

        <span>
          ${getParticipantDisplayName(participant)}
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

  /*
    KRW면 환율 표시 없음
  */

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

  /* =========================
       항목명 검사
    ========================= */

  if (name === "") {
    alert("항목명을 입력해 주세요.");

    return;
  }

  /* =========================
       금액 검사
    ========================= */

  if (!amount || amount <= 0) {
    alert("금액을 입력해 주세요.");

    return;
  }

  /* =========================
       참여자 검사
    ========================= */

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

      /*
          together 항목인데
          payer가 없는 예전 데이터라면
          현재 사용자로 보정
        */

      if (mode === "together" && !targetItem.payerId && currentUser) {
        targetItem.payerId = currentUser.id;

        targetItem.payerName = getParticipantDisplayName(currentUser);
      }
    }

    editingItemId = null;

    addItemButton.innerHTML = "<span>+</span> 항목 추가하기";
  } else {
    /* =========================
         새 항목 추가
      ========================= */

    const newItem = {
      id: Date.now(),

      name: name,

      amount: amount,

      currency: currency,

      participantIds: [...selectedParticipantIds],
    };

    /* =========================
         together이면 결제자 저장
      ========================= */

    if (mode === "together" && currentUser) {
      newItem.payerId = currentUser.id;

      newItem.payerName = getParticipantDisplayName(currentUser);
    }

    items.push(newItem);
  }

  saveItems();

  renderItems();

  resetInput();
});

/* =========================
   정산 항목 저장
========================= */

function saveItems() {
  sessionStorage.setItem(itemsKey, JSON.stringify(items));
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
    const wrapper = document.createElement("div");

    wrapper.classList.add("settlement-item");

    /* =========================
         수정 / 삭제 영역
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
         항목 내용
      ========================= */

    const content = document.createElement("div");

    content.classList.add("settlement-item-content");

    /* =========================
         참여자 색상 점
      ========================= */

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
                  style="
                    background-color:
                    ${participant.color}
                  "
                ></span>
              `;
      })
      .join("");

    /* =========================
         통화 기호
      ========================= */

    const symbol = currencies[item.currency]?.symbol || "";

    /* =========================
         항목 이름

         QUICK
         밥

         TOGETHER
         밥 (나 (방장))
      ========================= */

    const displayItemName =
      mode === "together" && item.payerName
        ? `${item.name} (${item.payerName})`
        : item.name;

    content.innerHTML = `
        <span class="item-name">
          ${displayItemName}
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

    let didSwipe = false;

    content.addEventListener("pointerdown", function (event) {
      startX = event.clientX;

      currentX = 0;

      isDragging = true;

      didSwipe = false;

      content.setPointerCapture(event.pointerId);
    });

    content.addEventListener("pointermove", function (event) {
      if (!isDragging || startX === null) {
        return;
      }

      currentX = event.clientX - startX;

      if (Math.abs(currentX) > 10) {
        didSwipe = true;
      }

      if (currentX < 0) {
        const moveX = Math.max(currentX, -128);

        content.style.transform = `translateX(${moveX}px)`;
      }
    });

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

    content.addEventListener("pointercancel", function () {
      startX = null;

      currentX = 0;

      isDragging = false;
    });

    /* =========================
         항목 상세 페이지 이동
      ========================= */

    content.addEventListener("click", function () {
      if (didSwipe) {
        return;
      }

      location.href = `18_quick-item-detail.html?mode=${mode}&itemId=${item.id}`;
    });

    /* =========================
         수정
      ========================= */

    editButton.addEventListener("click", function () {
      editItem(item.id);
    });

    /* =========================
         삭제
      ========================= */

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm(`${item.name} 항목을 삭제할까요?`);

      if (!shouldDelete) {
        return;
      }

      items = items.filter(function (targetItem) {
        return targetItem.id !== item.id;
      });

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

  editingItemId = id;

  itemName.value = item.name;

  itemAmount.value = item.amount;

  currencySelect.value = item.currency;

  currencySymbol.textContent = currencies[item.currency].symbol;

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

  addItemButton.textContent = "수정 완료";

  updateExchangeRate();

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

  location.href = `16_quick-summary.html?mode=${mode}`;
});

/* =========================
   초기 환율
========================= */

updateExchangeRate();
