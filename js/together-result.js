/* =========================
   TOGETHER RESULT
========================= */

/* =========================
   요소
========================= */

const resultParticipantSection = document.getElementById(
  "resultParticipantSection",
);

const resultParticipantList = document.getElementById("resultParticipantList");

const personDetailView = document.getElementById("personDetailView");

const resultBackButton = document.getElementById("resultBackButton");

const detailBackButton = document.getElementById("detailBackButton");

const detailPersonName = document.getElementById("detailPersonName");

const personalProgressPercent = document.getElementById(
  "personalProgressPercent",
);

const personalProgressFill = document.getElementById("personalProgressFill");

const personalProgressText = document.getElementById("personalProgressText");

const transferList = document.getElementById("transferList");

const receiveSection = document.getElementById("receiveSection");

const receiveList = document.getElementById("receiveList");

const settlementCompleteCard = document.getElementById(
  "settlementCompleteCard",
);

const resultConfirmButton = document.getElementById("resultConfirmButton");

/* =========================
   URL roomId
========================= */

const params = new URLSearchParams(window.location.search);

const roomIdFromUrl = params.get("roomId");

/* =========================
   rooms
========================= */

let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

/* =========================
   현재 방 찾기
========================= */

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

/* 방이 없음 */

if (!currentRoom) {
  alert("정산방 정보를 찾을 수 없습니다.");

  location.href = "05_home.html";
}

/* =========================
   현재 roomId
========================= */

const currentRoomId = String(currentRoom.id);

sessionStorage.setItem("currentRoomId", currentRoomId);

/* =========================
   저장된 결과 스냅샷
========================= */

const resultKey = `togetherSettlementResult_${currentRoomId}`;

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

const transfers = Array.isArray(settlementResult.transfers)
  ? settlementResult.transfers
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
   선택된 사람
========================= */

let selectedPersonId = null;

/* =========================
   이름 표시
========================= */

function getParticipantName(participant) {
  if (!participant) {
    return "";
  }

  if (participant.isHost) {
    return `${participant.name} (방장)`;
  }

  if (participant.isMe) {
    return `${participant.name} (나)`;
  }

  return participant.name;
}

/* =========================
   참여자 찾기
========================= */

function getParticipantById(id) {
  return participants.find(function (participant) {
    return String(participant.id) === String(id);
  });
}

/* =========================
   금액 표시
========================= */

function formatAmount(amount) {
  const number = Number(amount) || 0;

  if (baseCurrency === "KRW") {
    return Math.round(number).toLocaleString("ko-KR") + "원";
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
   개인 진행도 key
========================= */

function getProgressKey(participantId) {
  return `togetherTransferProgress_` + `${currentRoomId}_` + `${participantId}`;
}

/* =========================
   완료 송금 가져오기
========================= */

function getCompletedTransferIds(participantId) {
  return JSON.parse(localStorage.getItem(getProgressKey(participantId))) || [];
}

/* =========================
   완료 송금 저장
========================= */

function saveCompletedTransferIds(participantId, completedIds) {
  localStorage.setItem(
    getProgressKey(participantId),

    JSON.stringify(completedIds),
  );
}

/* =========================
   보낼 송금
========================= */

function getOutgoingTransfers(participantId) {
  return transfers.filter(function (transfer) {
    return String(transfer.fromId) === String(participantId);
  });
}

/* =========================
   받을 송금
========================= */

function getIncomingTransfers(participantId) {
  return transfers.filter(function (transfer) {
    return String(transfer.toId) === String(participantId);
  });
}

/* =========================
   개인 진행도
========================= */

function getParticipantProgress(participantId) {
  const outgoing = getOutgoingTransfers(participantId);

  const completedIds = getCompletedTransferIds(participantId);

  const completedCount = outgoing.filter(function (transfer) {
    return completedIds.includes(transfer.id);
  }).length;

  const totalCount = outgoing.length;

  const percent =
    totalCount === 0 ? 100 : Math.round((completedCount / totalCount) * 100);

  return {
    totalCount,
    completedCount,
    percent,
  };
}

/* =========================
   보낼 총액
========================= */

function getOutgoingTotal(participantId) {
  return getOutgoingTransfers(participantId).reduce(function (total, transfer) {
    return total + Number(transfer.amount);
  }, 0);
}

/* =========================
   받을 총액
========================= */

function getIncomingTotal(participantId) {
  return getIncomingTransfers(participantId).reduce(function (total, transfer) {
    return total + Number(transfer.amount);
  }, 0);
}

/* =========================
   참여자 결과 찾기
========================= */

function getParticipantResult(participantId) {
  return (
    participantResults.find(function (result) {
      return String(result.id) === String(participantId);
    }) || null
  );
}

/* =========================
   참여자 카드
========================= */

function renderParticipantCards() {
  resultParticipantList.innerHTML = "";

  participants.forEach(function (participant) {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "result-person-card";

    if (participant.isMe || participant.isHost) {
      button.classList.add("current-user");
    }

    const outgoingTotal = getOutgoingTotal(participant.id);

    const incomingTotal = getIncomingTotal(participant.id);

    const progress = getParticipantProgress(participant.id);

    const personResult = getParticipantResult(participant.id);

    let statusText = "정산 완료";

    let statusClass = "done";

    /* =========================
         보내야 하는 사람
      ========================= */

    if (outgoingTotal > 0.01) {
      if (progress.percent === 100) {
        statusText = "송금 완료";

        statusClass = "done";
      } else {
        statusText = `${formatAmount(outgoingTotal)} 보내기`;

        statusClass = "send";
      }
    } else if (incomingTotal > 0.01) {
      /* =========================
         받을 사람
      ========================= */
      statusText = `${formatAmount(incomingTotal)} 받기`;

      statusClass = "receive";
    } else if (personResult && Math.abs(Number(personResult.balance)) < 0.01) {
      /* =========================
         아무것도 없음
      ========================= */
      statusText = "정산 완료";

      statusClass = "done";
    }

    button.innerHTML = `
        <div
          class="result-person-left"
        >
          <img
            class="result-person-profile"
            src="${participant.profileImage || "./image/profile.svg"}"
            alt="${participant.name} 프로필"
          />

          <div
            class="result-person-info"
          >
            <span
              class="result-person-name"
            >
              ${getParticipantName(participant)}
            </span>

            <span
              class="result-person-progress"
            >
              개인 진행도
              ${progress.percent}%
            </span>
          </div>
        </div>

        <span
          class="
            result-person-status
            ${statusClass}
          "
        >
          ${statusText}
        </span>
      `;

    button.addEventListener("click", function () {
      openPersonDetail(participant.id);
    });

    resultParticipantList.appendChild(button);
  });
}

/* =========================
   상세 열기
========================= */

function openPersonDetail(participantId) {
  const participant = getParticipantById(participantId);

  if (!participant) {
    return;
  }

  selectedPersonId = participant.id;

  resultParticipantSection.classList.add("hidden");

  personDetailView.classList.remove("hidden");

  resultConfirmButton.classList.add("hidden");

  detailPersonName.textContent = `${getParticipantName(participant)}의 정산`;

  renderPersonDetail();
}

/* =========================
   개인 상세
========================= */

function renderPersonDetail() {
  const participant = getParticipantById(selectedPersonId);

  if (!participant) {
    return;
  }

  const outgoingTransfers = getOutgoingTransfers(participant.id);

  const incomingTransfers = getIncomingTransfers(participant.id);

  const completedIds = getCompletedTransferIds(participant.id);

  const progress = getParticipantProgress(participant.id);

  /* =========================
     진행도
  ========================= */

  personalProgressPercent.textContent = `${progress.percent}%`;

  personalProgressFill.style.width = `${progress.percent}%`;

  personalProgressText.textContent = `${progress.totalCount}건 중 ${progress.completedCount}건 완료`;

  /* =========================
     보낼 송금
  ========================= */

  transferList.innerHTML = "";

  if (outgoingTransfers.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-transfer-message";

    empty.textContent = "보내야 할 금액이 없습니다.";

    transferList.appendChild(empty);
  } else {
    outgoingTransfers.forEach(function (transfer) {
      renderTransferCard(participant, transfer, completedIds);
    });
  }

  /* =========================
     받을 금액
  ========================= */

  receiveList.innerHTML = "";

  if (incomingTransfers.length > 0) {
    receiveSection.classList.remove("hidden");

    incomingTransfers.forEach(function (transfer) {
      const sender = getParticipantById(transfer.fromId);

      if (!sender) {
        return;
      }

      const card = document.createElement("article");

      card.className = "receive-card";

      card.innerHTML = `
          <div
            class="receive-card-top"
          >
            <span
              class="receive-from"
            >
              ${getParticipantName(sender)}님에게서
            </span>

            <strong
              class="receive-amount"
            >
              ${formatAmount(transfer.amount)}
            </strong>
          </div>
        `;

      receiveList.appendChild(card);
    });
  } else {
    receiveSection.classList.add("hidden");
  }

  /* =========================
     송금 완료 메시지
  ========================= */

  if (progress.percent === 100) {
    settlementCompleteCard.classList.remove("hidden");
  } else {
    settlementCompleteCard.classList.add("hidden");
  }
}

/* =========================
   송금 카드
========================= */

function renderTransferCard(participant, transfer, completedIds) {
  const receiver = getParticipantById(transfer.toId);

  if (!receiver) {
    return;
  }

  const isCompleted = completedIds.includes(transfer.id);

  const card = document.createElement("article");

  card.className = "transfer-card";

  if (isCompleted) {
    card.classList.add("completed");
  }

  /* =========================
     테스트용 계좌 정보

     실제 백엔드 연결 후
     사용자 계좌 데이터 사용
  ========================= */

  const bankName = receiver.bankName || "신한은행";

  const accountNumber = receiver.accountNumber || "110-123-456789";

  card.innerHTML = `
    <div
      class="transfer-card-top"
    >
      <span
        class="transfer-target"
      >
        ${getParticipantName(receiver)}님께
      </span>

      <strong
        class="transfer-amount"
      >
        ${formatAmount(transfer.amount)}
      </strong>
    </div>

    <div
      class="account-box"
    >
      <div
        class="account-info"
      >
        <span
          class="account-bank"
        >
          ${bankName}
        </span>

        <span
          class="account-number"
        >
          ${accountNumber}
        </span>
      </div>

      <button
        type="button"
        class="copy-account-button"
      >
        복사
      </button>
    </div>

    <button
      type="button"
      class="
        transfer-complete-button
        ${isCompleted ? "completed" : ""}
      "
      ${isCompleted ? "disabled" : ""}
    >
      ${isCompleted ? "송금완료" : "송금완료"}
    </button>
  `;

  /* =========================
     계좌 복사
  ========================= */

  const copyButton = card.querySelector(".copy-account-button");

  copyButton.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(accountNumber);

      copyButton.textContent = "복사됨";

      setTimeout(function () {
        copyButton.textContent = "복사";
      }, 1200);
    } catch (error) {
      console.error("계좌 복사 실패:", error);

      alert(accountNumber);
    }
  });

  /* =========================
     송금 완료
  ========================= */

  const completeButton = card.querySelector(".transfer-complete-button");

  completeButton.addEventListener("click", function () {
    if (isCompleted) {
      return;
    }

    const confirmed = confirm(
      `${getParticipantName(receiver)}님께 ${formatAmount(
        transfer.amount,
      )} 송금 완료하셨나요?`,
    );

    if (!confirmed) {
      return;
    }

    markTransferCompleted(participant.id, transfer.id);
  });

  transferList.appendChild(card);
}

/* =========================
   송금 완료 처리
========================= */

function markTransferCompleted(participantId, transferId) {
  const completedIds = getCompletedTransferIds(participantId);

  if (!completedIds.includes(transferId)) {
    completedIds.push(transferId);
  }

  saveCompletedTransferIds(participantId, completedIds);

  /* =========================
     개인 진행도 저장
  ========================= */

  const progress = getParticipantProgress(participantId);

  localStorage.setItem(
    `togetherProgressSummary_${currentRoomId}_${participantId}`,

    JSON.stringify({
      roomId: currentRoomId,

      participantId: participantId,

      completed: progress.completedCount,

      total: progress.totalCount,

      percent: progress.percent,
    }),
  );

  /* =========================
     방 전체 진행도
  ========================= */

  updateRoomProgress();

  renderPersonDetail();

  renderParticipantCards();
}

/* =========================
   방 전체 진행도
========================= */

function updateRoomProgress() {
  const total = transfers.length;

  let completed = 0;

  transfers.forEach(function (transfer) {
    const completedIds = getCompletedTransferIds(transfer.fromId);

    if (completedIds.includes(transfer.id)) {
      completed += 1;
    }
  });

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

  rooms[roomIndex].mode = "together";

  rooms[roomIndex].resultPage = "19_together-result.html";

  /*
    모든 실제 송금이 완료되면
    정산 완료
  */

  rooms[roomIndex].isCompleted = total > 0 && completed >= total;

  localStorage.setItem("rooms", JSON.stringify(rooms));

  /* =========================
     방 전체 요약
  ========================= */

  localStorage.setItem(
    `togetherRoomProgress_${currentRoomId}`,

    JSON.stringify({
      roomId: currentRoomId,

      completed: completed,

      total: total,

      percent: percent,
    }),
  );
}

/* =========================
   상세 → 목록
========================= */

detailBackButton.addEventListener("click", function () {
  selectedPersonId = null;

  personDetailView.classList.add("hidden");

  resultParticipantSection.classList.remove("hidden");

  resultConfirmButton.classList.remove("hidden");

  renderParticipantCards();
});

/* =========================
   상단 뒤로가기
========================= */

resultBackButton.addEventListener("click", function () {
  if (!personDetailView.classList.contains("hidden")) {
    selectedPersonId = null;

    personDetailView.classList.add("hidden");

    resultParticipantSection.classList.remove("hidden");

    resultConfirmButton.classList.remove("hidden");

    renderParticipantCards();

    return;
  }

  location.href = "05_home.html";
});

/* =========================
   홈으로
========================= */

resultConfirmButton.addEventListener("click", function () {
  updateRoomProgress();

  location.href = "05_home.html";
});

/* =========================
   최초 실행
========================= */

updateRoomProgress();

renderParticipantCards();
