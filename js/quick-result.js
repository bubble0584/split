/* =========================
   QUICK RESULT
========================= */

/* =========================
   요소
========================= */

const resultList = document.getElementById("resultList");

const paymentCompleteButton = document.getElementById("paymentCompleteButton");

const homeButton = document.getElementById("homeButton");

const backButton = document.getElementById("backButton");

const shareButton = document.getElementById("shareButton");

/* =========================
   URL roomId
========================= */

const params = new URLSearchParams(window.location.search);

const roomIdFromUrl = params.get("roomId");

/* =========================
   방 정보
========================= */

let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

let currentRoom = null;

/* URL 우선 */

if (roomIdFromUrl) {
  currentRoom =
    rooms.find(function (room) {
      return String(room.id) === String(roomIdFromUrl);
    }) || null;
}

/* session fallback */

if (!currentRoom) {
  const savedRoomId = sessionStorage.getItem("currentRoomId");

  if (savedRoomId) {
    currentRoom =
      rooms.find(function (room) {
        return String(room.id) === String(savedRoomId);
      }) || null;
  }
}

/* 마지막 방 fallback */

if (!currentRoom && rooms.length > 0) {
  currentRoom = rooms[rooms.length - 1];
}

/* 방 없음 */

if (!currentRoom) {
  alert("정산방 정보를 찾을 수 없습니다.");

  location.href = "05_home.html";
}

/* =========================
   현재 방 ID
========================= */

const currentRoomId = String(currentRoom.id);

sessionStorage.setItem("currentRoomId", currentRoomId);

/* =========================
   저장된 결과
========================= */

const resultKey = `quickSettlementResult_${currentRoomId}`;

const settlementResult = JSON.parse(localStorage.getItem(resultKey));

if (!settlementResult) {
  alert("아직 생성된 정산 결과가 없습니다.");

  location.href = "05_home.html";
}

/* =========================
   결과 데이터
========================= */

const participants = Array.isArray(settlementResult.participants)
  ? settlementResult.participants
  : [];

const participantResults = Array.isArray(settlementResult.participantResults)
  ? settlementResult.participantResults
  : [];

const baseCurrency = settlementResult.baseCurrency || "KRW";

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
   선택된 참여자
========================= */

let selectedParticipantIds = [];

/* =========================
   송금 완료 참여자
========================= */

function getPaidParticipantIds() {
  return (
    JSON.parse(
      localStorage.getItem(`quickPaidParticipants_${currentRoomId}`),
    ) || []
  );
}

function savePaidParticipantIds(ids) {
  localStorage.setItem(
    `quickPaidParticipants_${currentRoomId}`,
    JSON.stringify(ids),
  );
}

/* =========================
   금액 표시
========================= */

function formatAmount(amount) {
  const number = Number(amount) || 0;

  if (baseCurrency === "KRW") {
    return "₩" + Math.round(number).toLocaleString("ko-KR");
  }

  const symbol = currencies[baseCurrency]?.symbol || "";

  const digits = baseCurrency === "JPY" ? 0 : 2;

  return (
    symbol +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })
  );
}

/* =========================
   원래 통화 금액
========================= */

function formatOriginalAmount(amount, currency) {
  const number = Number(amount) || 0;

  if (currency === "KRW") {
    return "₩" + Math.round(number).toLocaleString("ko-KR");
  }

  const symbol = currencies[currency]?.symbol || currency;

  const digits = currency === "JPY" ? 0 : 2;

  return (
    symbol +
    number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    })
  );
}

/* =========================
   결과 찾기
========================= */

function getParticipantResult(participantId) {
  return (
    participantResults.find(function (result) {
      return String(result.id) === String(participantId);
    }) || null
  );
}

/* =========================
   참여자 선택 / 해제
========================= */

function toggleParticipantSelection(participantId) {
  const exists = selectedParticipantIds.some(function (id) {
    return String(id) === String(participantId);
  });

  if (exists) {
    selectedParticipantIds = selectedParticipantIds.filter(function (id) {
      return String(id) !== String(participantId);
    });
  } else {
    selectedParticipantIds.push(participantId);
  }

  renderResults();
}

/* =========================
   카드 출력
========================= */

function renderResults() {
  resultList.innerHTML = "";

  const paidIds = getPaidParticipantIds();

  participants.forEach(function (participant) {
    const result = getParticipantResult(participant.id);

    if (!result) {
      return;
    }

    const isPaid = paidIds.some(function (id) {
      return String(id) === String(participant.id);
    });

    const isSelected = selectedParticipantIds.some(function (id) {
      return String(id) === String(participant.id);
    });

    const card = document.createElement("article");

    card.className = "result-card";

    if (isPaid) {
      card.classList.add("paid");
    }

    if (isSelected) {
      card.classList.add("selected");
    }

    const detailItems = Array.isArray(result.items) ? result.items : [];

    const detailHtml = detailItems
      .map(function (item) {
        return `
              <div
                class="result-detail-item"
              >
                <div
                  class="result-detail-left"
                >
                  <span
                    class="result-detail-name"
                  >
                    ${item.name || "항목"}
                  </span>

                  <span
                    class="result-original-amount"
                  >
                    ${formatOriginalAmount(
                      item.originalShare,
                      item.originalCurrency,
                    )}
                  </span>
                </div>

                <span
                  class="result-detail-amount"
                >
                  ${formatAmount(item.convertedShare)}
                </span>
              </div>
            `;
      })
      .join("");

    card.innerHTML = `
        <div
          class="result-card-header"
        >
          <div
            class="result-card-left"
          >
            <div
              class="result-profile"
              style="
                background-color:
                ${participant.color || "#52AEAD"};
              "
            ></div>

            <div
              class="result-name-wrap"
            >
              <span
                class="result-name"
              >
                ${participant.name}
              </span>

              ${
                participant.isMe
                  ? `
                    <span
                      class="me-label"
                    >
                      (나)
                    </span>
                  `
                  : ""
              }
            </div>
          </div>

          <div
            class="result-card-right"
          >
            <strong
              class="result-amount"
            >
              ${formatAmount(result.total)}
            </strong>

            <span
              class="detail-toggle"
              title="자세히 보기"
            >
              ⌄
            </span>
          </div>
        </div>

        <div
          class="result-detail"
        >
          <div
            class="result-detail-divider"
          ></div>

          ${detailHtml}

          ${
            isPaid
              ? `
                <div
                  class="paid-label"
                >
                  송금 완료
                </div>
              `
              : ""
          }
        </div>
      `;

    /* =========================
         자세히 보기 버튼
         → 상세만 열기
      ========================= */

    const detailToggle = card.querySelector(".detail-toggle");

    detailToggle.addEventListener("click", function (event) {
      event.stopPropagation();

      card.classList.toggle("open");
    });

    /* =========================
         상세 영역 클릭 시
         선택되지 않게 막기
      ========================= */

    const resultDetail = card.querySelector(".result-detail");

    resultDetail.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    /* =========================
         카드 클릭
         → 송금 대상 선택
      ========================= */

    card.addEventListener("click", function () {
      /*
            나 자신은 선택 불가
          */

      if (participant.isMe) {
        return;
      }

      /*
            이미 송금완료한 사람
            다시 선택 불가
          */

      if (isPaid) {
        return;
      }

      toggleParticipantSelection(participant.id);
    });

    resultList.appendChild(card);
  });

  updatePaymentButton();
}

/* =========================
   송금완료 버튼 상태
========================= */

function updatePaymentButton() {
  const selectedCount = selectedParticipantIds.length;

  /* 아무도 선택 안 함 */

  if (selectedCount === 0) {
    paymentCompleteButton.disabled = true;

    paymentCompleteButton.textContent = "송금완료";

    return;
  }

  /* 1명 이상 선택 */

  paymentCompleteButton.disabled = false;

  paymentCompleteButton.textContent = `${selectedCount}명 송금완료`;
}

/* =========================
   송금 완료
========================= */

paymentCompleteButton.addEventListener("click", function () {
  if (selectedParticipantIds.length === 0) {
    return;
  }

  const confirmed = confirm(
    `${selectedParticipantIds.length}명의 송금을 완료 처리할까요?`,
  );

  if (!confirmed) {
    return;
  }

  const paidIds = getPaidParticipantIds();

  selectedParticipantIds.forEach(function (participantId) {
    const alreadyPaid = paidIds.some(function (id) {
      return String(id) === String(participantId);
    });

    if (!alreadyPaid) {
      paidIds.push(participantId);
    }
  });

  savePaidParticipantIds(paidIds);

  selectedParticipantIds = [];

  updateRoomProgress();

  renderResults();
});

/* =========================
   방 진행도
========================= */

function updateRoomProgress() {
  const payableParticipants = participants.filter(function (participant) {
    return participant.isMe !== true;
  });

  const paidIds = getPaidParticipantIds();

  const completed = payableParticipants.filter(function (participant) {
    return paidIds.some(function (id) {
      return String(id) === String(participant.id);
    });
  }).length;

  const total = payableParticipants.length;

  const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

  const roomIndex = rooms.findIndex(function (room) {
    return String(room.id) === String(currentRoomId);
  });

  if (roomIndex === -1) {
    return;
  }

  rooms[roomIndex].current = completed;

  rooms[roomIndex].total = total;

  rooms[roomIndex].progress = percent;

  rooms[roomIndex].resultCreated = true;

  rooms[roomIndex].mode = "quick";

  rooms[roomIndex].resultPage = "17_quick-result.html";

  rooms[roomIndex].isCompleted = total > 0 && completed >= total;

  localStorage.setItem("rooms", JSON.stringify(rooms));

  localStorage.setItem(
    `quickProgressSummary_${currentRoomId}_me`,

    JSON.stringify({
      roomId: currentRoomId,

      participantId: "me",

      completed: completed,

      total: total,

      percent: percent,
    }),
  );
}

/* =========================
   홈으로
========================= */

homeButton.addEventListener("click", function () {
  updateRoomProgress();

  location.href = "05_home.html";
});

/* =========================
   뒤로가기
========================= */

backButton.addEventListener("click", function () {
  location.href = "05_home.html";
});

/* =========================
   공유하기
========================= */

shareButton.addEventListener("click", function () {
  alert("공유 기능은 백엔드 연결 후 추가할 예정입니다.");
});

/* =========================
   최초 실행
========================= */

updateRoomProgress();

renderResults();
