/* =========================
   QUICK / TOGETHER SUMMARY
========================= */

/* =========================
   요소
========================= */

const roomTitle = document.getElementById("roomTitle");

const totalAmount = document.getElementById("totalAmount");

const baseCurrencyInfo = document.getElementById("baseCurrencyInfo");

const paymentCount = document.getElementById("paymentCount");

const participantCount = document.getElementById("participantCount");

const participantList = document.getElementById("participantList");

const sendMoneyButton = document.getElementById("sendMoneyButton");

/* =========================
   URL 정보
========================= */

const urlParams = new URLSearchParams(window.location.search);

const mode = urlParams.get("mode") || "quick";

const roomIdFromUrl = urlParams.get("roomId");

console.log("정산 요약 모드:", mode);

/* =========================
   rooms
========================= */

let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

/* =========================
   현재 방 찾기
========================= */

let currentRoom = null;

/* 1순위: URL */

if (roomIdFromUrl) {
  currentRoom =
    rooms.find(function (room) {
      return String(room.id) === String(roomIdFromUrl);
    }) || null;
}

/* 2순위: session */

if (!currentRoom) {
  const savedRoomId = sessionStorage.getItem("currentRoomId");

  if (savedRoomId) {
    currentRoom =
      rooms.find(function (room) {
        return String(room.id) === String(savedRoomId);
      }) || null;
  }
}

/* 3순위: 마지막 방 */

if (!currentRoom && rooms.length > 0) {
  currentRoom = rooms[rooms.length - 1];
}

/* 방 없음 */

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
   제목
========================= */

roomTitle.textContent = currentRoom.name || "정산방";

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
   참여자
========================= */

let participants = [];

/* =========================
   TOGETHER 참여자
========================= */

if (mode === "together") {
  let invitedParticipants =
    JSON.parse(
      sessionStorage.getItem(`togetherParticipants_${currentRoomId}`),
    ) ||
    JSON.parse(sessionStorage.getItem("togetherParticipants")) ||
    [];

  const host = {
    id: "host",

    name: "나",

    isMe: true,

    isHost: true,

    color: "#F5C04A",

    profileImage: null,
  };

  participants = [host, ...invitedParticipants];
} else {
  /* =========================
   QUICK 참여자
========================= */
  participants =
    JSON.parse(sessionStorage.getItem(`quickParticipants_${currentRoomId}`)) ||
    JSON.parse(sessionStorage.getItem("quickParticipants")) ||
    [];
}

/* =========================
   항목
========================= */

const itemsKey =
  mode === "together"
    ? `togetherItems_${currentRoomId}`
    : `quickItems_${currentRoomId}`;

const items = JSON.parse(sessionStorage.getItem(itemsKey)) || [];

/* =========================
   기준 통화
========================= */

const baseCurrency =
  currentRoom.baseCurrency ||
  sessionStorage.getItem(`${mode}BaseCurrency`) ||
  "KRW";

/* =========================
   이름 표시
========================= */

function getParticipantDisplayName(participant) {
  if (mode === "together") {
    if (participant.isHost) {
      return `${participant.name} (방장)`;
    }

    return participant.name;
  }

  if (participant.isMe) {
    return `${participant.name} (나)`;
  }

  return participant.name;
}

/* =========================
   참여자 출력
========================= */

function renderParticipants() {
  participantList.innerHTML = "";

  participantCount.textContent = `참여자 (${participants.length}명)`;

  participants.forEach(function (participant) {
    const item = document.createElement("div");

    item.className = "summary-participant-item";

    item.innerHTML = `
        <span
          class="summary-participant-color"
          style="
            background-color:
            ${participant.color || "#52AEAD"};
          "
        ></span>

        <span
          class="summary-participant-name"
        >
          ${getParticipantDisplayName(participant)}
        </span>
      `;

    participantList.appendChild(item);
  });
}

/* =========================
   환율
========================= */

async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data.rates[toCurrency] || null;
  } catch (error) {
    console.error("환율 가져오기 실패:", fromCurrency, toCurrency, error);

    return null;
  }
}

/* =========================
   기준 통화 환산
========================= */

function convertWithRates(amount, currency, rates) {
  if (currency === baseCurrency) {
    return Number(amount);
  }

  const rate = Number(rates[currency]);

  if (!rate) {
    return 0;
  }

  return Number(amount) * rate;
}

/* =========================
   환율 + 총 결제액 계산
========================= */

async function calculateBaseData() {
  totalAmount.textContent = "계산 중...";

  let total = 0;

  const rateCache = {};

  for (const item of items) {
    const itemCurrency = item.currency || "KRW";

    if (itemCurrency === baseCurrency) {
      total += Number(item.amount);

      continue;
    }

    let rate = rateCache[itemCurrency];

    if (!rate) {
      rate = await getExchangeRate(itemCurrency, baseCurrency);

      if (rate) {
        rateCache[itemCurrency] = rate;
      }
    }

    if (!rate) {
      totalAmount.textContent = "환율 계산 실패";

      baseCurrencyInfo.textContent = "일부 통화의 환율을 불러오지 못했습니다.";

      return null;
    }

    total += Number(item.amount) * rate;
  }

  return {
    total,
    rateCache,
  };
}

/* =========================
   QUICK 결과 계산
========================= */

function calculateQuickResult(rateCache) {
  return participants.map(function (participant) {
    let participantTotal = 0;

    const detailItems = [];

    items.forEach(function (item) {
      const ids = Array.isArray(item.participantIds) ? item.participantIds : [];

      const isIncluded = ids.some(function (id) {
        return String(id) === String(participant.id);
      });

      if (!isIncluded) {
        return;
      }

      if (ids.length === 0) {
        return;
      }

      const itemCurrency = item.currency || "KRW";

      const originalShare = Number(item.amount) / ids.length;

      const convertedShare = convertWithRates(
        originalShare,
        itemCurrency,
        rateCache,
      );

      participantTotal += convertedShare;

      detailItems.push({
        itemId: item.id,

        name: item.name,

        originalShare: originalShare,

        originalCurrency: itemCurrency,

        convertedShare: convertedShare,
      });
    });

    return {
      id: participant.id,

      name: participant.name,

      color: participant.color || "#52AEAD",

      isMe: participant.isMe === true,

      total: participantTotal,

      items: detailItems,
    };
  });
}

/* =========================
   TOGETHER 개인별 잔액 계산

   paid
   = 실제로 결제한 돈

   owed
   = 본인이 부담해야 할 돈

   balance
   = paid - owed

   +면 받을 돈
   -면 보낼 돈
========================= */

function calculateTogetherBalances(rateCache) {
  const results = participants.map(function (participant) {
    return {
      id: participant.id,

      name: participant.name,

      color: participant.color || "#52AEAD",

      isMe: participant.isMe === true,

      isHost: participant.isHost === true,

      paid: 0,

      owed: 0,

      balance: 0,

      paidItems: [],

      sharedItems: [],
    };
  });

  function findResult(participantId) {
    return results.find(function (result) {
      return String(result.id) === String(participantId);
    });
  }

  items.forEach(function (item) {
    const itemCurrency = item.currency || "KRW";

    const convertedAmount = convertWithRates(
      Number(item.amount),
      itemCurrency,
      rateCache,
    );

    /* =========================
         누가 결제했는지
      ========================= */

    const payerId = item.payerId;

    const payer = findResult(payerId);

    if (payer) {
      payer.paid += convertedAmount;

      payer.paidItems.push({
        itemId: item.id,

        name: item.name,

        amount: convertedAmount,

        originalAmount: Number(item.amount),

        originalCurrency: itemCurrency,
      });
    }

    /* =========================
         이 항목 참여자
      ========================= */

    const ids = Array.isArray(item.participantIds) ? item.participantIds : [];

    if (ids.length === 0) {
      return;
    }

    const convertedShare = convertedAmount / ids.length;

    const originalShare = Number(item.amount) / ids.length;

    ids.forEach(function (participantId) {
      const person = findResult(participantId);

      if (!person) {
        return;
      }

      person.owed += convertedShare;

      person.sharedItems.push({
        itemId: item.id,

        name: item.name,

        originalShare: originalShare,

        originalCurrency: itemCurrency,

        convertedShare: convertedShare,

        payerId: item.payerId,

        payerName: item.payerName || "",
      });
    });
  });

  results.forEach(function (result) {
    result.balance = result.paid - result.owed;
  });

  return results;
}

/* =========================
   TOGETHER 송금 관계 계산
========================= */

function createTransfers(participantResults) {
  const debtors = participantResults
    .filter(function (person) {
      return person.balance < -0.01;
    })
    .map(function (person) {
      return {
        id: person.id,

        name: person.name,

        amount: Math.abs(person.balance),
      };
    });

  const creditors = participantResults
    .filter(function (person) {
      return person.balance > 0.01;
    })
    .map(function (person) {
      return {
        id: person.id,

        name: person.name,

        amount: person.balance,
      };
    });

  const transfers = [];

  let debtorIndex = 0;

  let creditorIndex = 0;

  let transferIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];

    const creditor = creditors[creditorIndex];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transfers.push({
        id: `transfer_${currentRoomId}_${transferIndex}`,

        fromId: debtor.id,

        fromName: debtor.name,

        toId: creditor.id,

        toName: creditor.name,

        amount: amount,

        currency: baseCurrency,

        isCompleted: false,
      });

      transferIndex += 1;
    }

    debtor.amount -= amount;

    creditor.amount -= amount;

    if (debtor.amount <= 0.01) {
      debtorIndex += 1;
    }

    if (creditor.amount <= 0.01) {
      creditorIndex += 1;
    }
  }

  return transfers;
}

/* =========================
   총액 표시
========================= */

function showTotal(total) {
  const symbol = currencies[baseCurrency]?.symbol || "";

  const maximumFractionDigits =
    baseCurrency === "KRW" || baseCurrency === "JPY" ? 0 : 2;

  totalAmount.textContent = `${symbol}${Number(total).toLocaleString("ko-KR", {
    minimumFractionDigits: 0,

    maximumFractionDigits: maximumFractionDigits,
  })}`;

  baseCurrencyInfo.textContent = `기준 통화 · ${baseCurrency}`;
}

/* =========================
   최초 화면
========================= */

renderParticipants();

paymentCount.textContent = `${items.length}건`;

calculateBaseData().then(function (result) {
  if (!result) {
    return;
  }

  showTotal(result.total);
});

/* =========================
   정산하기
========================= */

sendMoneyButton.addEventListener("click", async function () {
  if (items.length === 0) {
    alert("정산 항목이 없습니다.");

    return;
  }

  //   if (participants.length < 2) {
  //     alert("정산하려면 참여자가 2명 이상 필요합니다.");

  //     return;
  //   }

  sendMoneyButton.disabled = true;

  sendMoneyButton.textContent = "계산 중...";

  const baseData = await calculateBaseData();

  if (!baseData) {
    sendMoneyButton.disabled = false;

    sendMoneyButton.textContent = "정산하기";

    return;
  }

  showTotal(baseData.total);

  /* =========================
       QUICK
    ========================= */

  if (mode === "quick") {
    const participantResults = calculateQuickResult(baseData.rateCache);

    const resultData = {
      roomId: currentRoomId,

      roomName: currentRoom.name,

      mode: "quick",

      createdAt: Date.now(),

      baseCurrency: baseCurrency,

      totalAmount: baseData.total,

      participants: participants,

      items: items,

      rates: baseData.rateCache,

      participantResults: participantResults,
    };

    localStorage.setItem(
      `quickSettlementResult_${currentRoomId}`,
      JSON.stringify(resultData),
    );

    sessionStorage.setItem(
      `quickSettlementRates_${currentRoomId}`,
      JSON.stringify(baseData.rateCache),
    );

    sessionStorage.setItem(
      `quickSettlementTotal_${currentRoomId}`,
      String(baseData.total),
    );

    const roomIndex = rooms.findIndex(function (room) {
      return String(room.id) === String(currentRoomId);
    });

    if (roomIndex !== -1) {
      const payableParticipants = participants.filter(function (participant) {
        return !participant.isMe;
      });

      rooms[roomIndex].resultCreated = true;

      rooms[roomIndex].resultPage = "17_quick-result.html";

      rooms[roomIndex].mode = "quick";

      rooms[roomIndex].current = 0;

      rooms[roomIndex].total = payableParticipants.length;

      rooms[roomIndex].progress = 0;

      rooms[roomIndex].isCompleted = false;

      localStorage.setItem("rooms", JSON.stringify(rooms));
    }

    localStorage.removeItem(`quickPaidParticipants_${currentRoomId}`);

    location.href = `17_quick-result.html?roomId=${currentRoomId}`;

    return;
  }

  /* =========================
       TOGETHER
    ========================= */

  if (mode === "together") {
    const participantResults = calculateTogetherBalances(baseData.rateCache);

    const transfers = createTransfers(participantResults);

    const resultData = {
      roomId: currentRoomId,

      roomName: currentRoom.name,

      mode: "together",

      createdAt: Date.now(),

      baseCurrency: baseCurrency,

      totalAmount: baseData.total,

      participants: participants,

      items: items,

      rates: baseData.rateCache,

      participantResults: participantResults,

      transfers: transfers,
    };

    /* =========================
         결과 스냅샷
      ========================= */

    localStorage.setItem(
      `togetherSettlementResult_${currentRoomId}`,
      JSON.stringify(resultData),
    );

    sessionStorage.setItem(
      `togetherSettlementRates_${currentRoomId}`,
      JSON.stringify(baseData.rateCache),
    );

    sessionStorage.setItem(
      `togetherSettlementTotal_${currentRoomId}`,
      String(baseData.total),
    );

    /* =========================
         방 상태
      ========================= */

    const roomIndex = rooms.findIndex(function (room) {
      return String(room.id) === String(currentRoomId);
    });

    if (roomIndex !== -1) {
      /*
          현재 프론트에서는
          로그인 사용자를 host라고 가정.

          host가 직접 보내야 하는
          송금 건수를 진행도 기준으로 사용.
        */

      const hostTransfers = transfers.filter(function (transfer) {
        return String(transfer.fromId) === "host";
      });

      rooms[roomIndex].resultCreated = true;

      rooms[roomIndex].resultPage = "19_together-result.html";

      rooms[roomIndex].mode = "together";

      rooms[roomIndex].current = 0;

      rooms[roomIndex].total = hostTransfers.length;

      rooms[roomIndex].progress = 0;

      rooms[roomIndex].isCompleted = false;

      localStorage.setItem("rooms", JSON.stringify(rooms));
    }

    /* =========================
         기존 테스트 진행도 초기화
      ========================= */

    localStorage.removeItem(`togetherTransferProgress_${currentRoomId}_host`);

    localStorage.removeItem(`togetherProgressSummary_${currentRoomId}_host`);

    /* =========================
         결과 화면
      ========================= */

    location.href = `19_together-result.html?roomId=${currentRoomId}`;

    return;
  }

  alert("정산 방식을 확인할 수 없습니다.");

  sendMoneyButton.disabled = false;

  sendMoneyButton.textContent = "정산하기";
});
