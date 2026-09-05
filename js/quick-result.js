/* =========================
   QUICK RESULT
========================= */

/* =========================
   요소
========================= */

const resultList = document.getElementById("resultList");

const paymentCompleteButton = document.getElementById("paymentCompleteButton");

/* =========================
   방 정보
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const currentRoom = rooms.length > 0 ? rooms[rooms.length - 1] : null;

const currentRoomId = currentRoom?.id || "default";

/* =========================
   방별 저장 KEY
========================= */

const quickItemsKey = `quickItems_${currentRoomId}`;

const paidParticipantsKey = `quickPaidParticipants_${currentRoomId}`;

/* =========================
   참여자
========================= */

const participants =
  JSON.parse(sessionStorage.getItem("quickParticipants")) || [];

/* =========================
   정산 항목
========================= */

const items = JSON.parse(sessionStorage.getItem(quickItemsKey)) || [];

/* =========================
   기준 통화
========================= */

const baseCurrency = sessionStorage.getItem("quickBaseCurrency") || "KRW";

/* =========================
   정산할 때 저장된 환율
========================= */

const savedRates =
  JSON.parse(sessionStorage.getItem("quickSettlementRates")) || {};

/* =========================
   송금 완료 참여자
========================= */

let paidParticipantIds =
  JSON.parse(localStorage.getItem(paidParticipantsKey)) || [];

/* 현재 선택 */

let selectedParticipantIds = [];

/* =========================
   통화
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
   금액 표시
========================= */

function formatMoney(amount, currency) {
  const symbol = currencies[currency]?.symbol || "";

  const digits = currency === "KRW" || currency === "JPY" ? 0 : 2;

  return (
    symbol +
    Number(amount).toLocaleString("ko-KR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })
  );
}

/* =========================
   기준 통화로 환산
========================= */

function convertToBase(amount, currency) {
  if (currency === baseCurrency) {
    return Number(amount);
  }

  const rate = savedRates[currency];

  if (!rate) {
    return 0;
  }

  return Number(amount) * Number(rate);
}

/* =========================
   참여자별 정산 계산
========================= */

function calculateParticipantResult(participantId) {
  let total = 0;

  const detailItems = [];

  items.forEach(function (item) {
    /* 이 사람이 참여하지 않은 항목 */

    if (!item.participantIds.includes(participantId)) {
      return;
    }

    const peopleCount = item.participantIds.length;

    if (peopleCount === 0) {
      return;
    }

    /*
        해당 사람 몫
        원본 통화 기준
      */

    const originalShare = Number(item.amount) / peopleCount;

    /*
        기준 통화로 환산
      */

    const convertedShare = convertToBase(originalShare, item.currency);

    total += convertedShare;

    detailItems.push({
      name: item.name,

      originalShare: originalShare,

      originalCurrency: item.currency,

      convertedShare: convertedShare,
    });
  });

  return {
    total: total,
    items: detailItems,
  };
}

/* =========================
   결과 카드 출력
========================= */

function renderResults() {
  resultList.innerHTML = "";

  participants.forEach(function (participant) {
    const result = calculateParticipantResult(participant.id);

    const isPaid = paidParticipantIds.includes(participant.id);

    const isSelected = selectedParticipantIds.includes(participant.id);

    /* =========================
         카드
      ========================= */

    const card = document.createElement("article");

    card.classList.add("result-card");

    if (isPaid) {
      card.classList.add("paid");
    }

    if (isSelected) {
      card.classList.add("selected");
    }

    /* =========================
         헤더
      ========================= */

    const header = document.createElement("div");

    header.classList.add("result-card-header");

    header.innerHTML = `
        <span
          class="result-profile"
          style="
            background-color:
            ${participant.color}
          "
        ></span>


        <span class="result-name">

          ${participant.name}

          ${participant.isMe ? '<span class="me-label">(나)</span>' : ""}

          ${isPaid ? '<span class="paid-label">송금완료</span>' : ""}

        </span>


        <span class="result-amount">

          ${formatMoney(result.total, baseCurrency)}

        </span>


        <button
          type="button"
          class="detail-toggle"
        >
          ⌄
        </button>
      `;

    /* =========================
         상세 내역
      ========================= */

    const detail = document.createElement("div");

    detail.classList.add("result-detail");

    result.items.forEach(function (detailItem) {
      const row = document.createElement("div");

      row.classList.add("detail-item");

      /*
            원래 통화와
            기준 통화가 같음
          */

      if (detailItem.originalCurrency === baseCurrency) {
        row.innerHTML = `
              <span
                class="detail-item-name"
              >
                · ${detailItem.name}
              </span>

              <span
                class="detail-item-amount"
              >
                ${formatMoney(detailItem.convertedShare, baseCurrency)}
              </span>
            `;
      } else {
        /*
            다른 통화
          */
        row.innerHTML = `
              <span
                class="detail-item-name"
              >
                · ${detailItem.name}
              </span>

              <span
                class="detail-item-amount"
              >

                <span
                  class="original-amount"
                >
                  ${formatMoney(
                    detailItem.originalShare,
                    detailItem.originalCurrency,
                  )}
                </span>

                →

                ${formatMoney(detailItem.convertedShare, baseCurrency)}

              </span>
            `;
      }

      detail.appendChild(row);
    });

    /* =========================
         카드 선택
      ========================= */

    header.addEventListener("click", function (event) {
      /*
            화살표 버튼 클릭은
            선택으로 처리하지 않음
          */

      if (event.target.closest(".detail-toggle")) {
        return;
      }

      /*
            나는 나한테
            송금하는 사람이 아님
          */

      if (participant.isMe) {
        return;
      }

      /*
            이미 완료된 사람도
            다시 선택 못 함
          */

      if (isPaid) {
        return;
      }

      if (selectedParticipantIds.includes(participant.id)) {
        selectedParticipantIds = selectedParticipantIds.filter(function (id) {
          return id !== participant.id;
        });
      } else {
        selectedParticipantIds.push(participant.id);
      }

      renderResults();

      updateCompleteButton();
    });

    /* =========================
         상세 펼치기
      ========================= */

    const toggleButton = header.querySelector(".detail-toggle");

    toggleButton.addEventListener("click", function (event) {
      event.stopPropagation();

      card.classList.toggle("open");

      if (card.classList.contains("open")) {
        toggleButton.textContent = "⌃";
      } else {
        toggleButton.textContent = "⌄";
      }
    });

    card.appendChild(header);

    card.appendChild(detail);

    resultList.appendChild(card);
  });
}

/* =========================
   송금완료 버튼 상태
========================= */

function updateCompleteButton() {
  if (selectedParticipantIds.length === 0) {
    paymentCompleteButton.disabled = true;

    paymentCompleteButton.textContent = "송금완료";
  } else {
    paymentCompleteButton.disabled = false;

    paymentCompleteButton.textContent = `${selectedParticipantIds.length}명 송금완료`;
  }
}

/* =========================
   송금 완료 처리
========================= */

paymentCompleteButton.addEventListener("click", function () {
  if (selectedParticipantIds.length === 0) {
    return;
  }

  selectedParticipantIds.forEach(function (id) {
    if (!paidParticipantIds.includes(id)) {
      paidParticipantIds.push(id);
    }
  });

  /* =========================
       송금 완료 저장
    ========================= */

  localStorage.setItem(paidParticipantsKey, JSON.stringify(paidParticipantIds));

  /* =========================
       홈 진행도 업데이트
    ========================= */

  updateRoomProgress();

  /* 선택 초기화 */

  selectedParticipantIds = [];

  renderResults();

  updateCompleteButton();
});

/* =========================
   정산 진행도
========================= */

function updateRoomProgress() {
  if (!currentRoom) {
    return;
  }

  /*
    나는 제외

    예:
    총 5명
    → 실제 송금할 사람 4명
  */

  const payableParticipants = participants.filter(function (participant) {
    return !participant.isMe;
  });

  const total = payableParticipants.length;

  const current = paidParticipantIds.filter(function (id) {
    return payableParticipants.some(function (participant) {
      return participant.id === id;
    });
  }).length;

  const progress = total === 0 ? 100 : Math.round((current / total) * 100);

  /* =========================
     rooms 배열 업데이트
  ========================= */

  const roomIndex = rooms.findIndex(function (room) {
    return String(room.id) === String(currentRoomId);
  });

  if (roomIndex === -1) {
    return;
  }

  rooms[roomIndex].current = current;

  rooms[roomIndex].total = total;

  rooms[roomIndex].progress = progress;

  /*
    모두 송금 완료됐다고 해서
    방 자체를 바로 종료시키지는 않음.

    나중에 별도의
    "정산 종료" 기능을 만들 수 있음.
  */

  localStorage.setItem("rooms", JSON.stringify(rooms));
}

/* =========================
   최초 실행
========================= */

renderResults();

updateCompleteButton();

updateRoomProgress();
