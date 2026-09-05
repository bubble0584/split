/* =========================
   QUICK SUMMARY
========================= */

/* =========================
   요소 가져오기
========================= */

const roomTitle = document.getElementById("roomTitle");

const totalAmount = document.getElementById("totalAmount");

const baseCurrencyInfo = document.getElementById("baseCurrencyInfo");

const paymentCount = document.getElementById("paymentCount");

const participantCount = document.getElementById("participantCount");

const participantList = document.getElementById("participantList");

const sendMoneyButton = document.getElementById("sendMoneyButton");

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
   방 정보
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const currentRoom = rooms.length > 0 ? rooms[rooms.length - 1] : null;

if (currentRoom) {
  roomTitle.textContent = currentRoom.name || "정산방";
}

/* =========================
   참여자
========================= */

const participants =
  JSON.parse(sessionStorage.getItem("quickParticipants")) || [];

/* =========================
   현재 방 ID
========================= */

const currentRoomId = currentRoom?.id || "default";

/* =========================
   현재 방의 정산 항목 key
========================= */

const quickItemsKey = `quickItems_${currentRoomId}`;

/* =========================
   현재 방 정산 항목 가져오기
========================= */

const items = JSON.parse(sessionStorage.getItem(quickItemsKey)) || [];
/* =========================
   기준 통화

   나중에 수정하기 페이지에서
   이 값을 저장하면 됨.

   없으면 일단 KRW
========================= */

const baseCurrency = sessionStorage.getItem("quickBaseCurrency") || "KRW";

/* =========================
   참여자 출력
========================= */

function renderParticipants() {
  participantList.innerHTML = "";

  participantCount.textContent = `참여자 (${participants.length}명)`;

  participants.forEach(function (participant) {
    const item = document.createElement("div");

    item.classList.add("summary-participant-item");

    item.innerHTML = `
        <span
          class="summary-participant-color"
          style="
            background-color:
            ${participant.color}
          "
        ></span>

        <span class="summary-participant-name">
          ${participant.name}

          ${
            participant.isMe ? '<span class="summary-me-label">(나)</span>' : ""
          }
        </span>
      `;

    participantList.appendChild(item);
  });
}

renderParticipants();

/* =========================
   결제 내역 개수
========================= */

paymentCount.textContent = `${items.length}건`;

/* =========================
   환율 가져오기
========================= */

async function getExchangeRate(fromCurrency, toCurrency) {
  /* 같은 통화면 1 */

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

    return data.rates[toCurrency];
  } catch (error) {
    console.error("환율 가져오기 실패:", fromCurrency, toCurrency, error);

    return null;
  }
}

/* =========================
   총 결제 금액 계산
========================= */

async function calculateTotal() {
  totalAmount.textContent = "계산 중...";

  let total = 0;

  /*
    같은 통화의 환율을
    여러 번 API 호출하지 않도록
    캐시
  */

  const rateCache = {};

  for (const item of items) {
    const itemCurrency = item.currency || "KRW";

    /* 기준 통화와 같으면 그대로 */

    if (itemCurrency === baseCurrency) {
      total += Number(item.amount);

      continue;
    }

    /* =========================
       환율 가져오기
    ========================= */

    let rate = rateCache[itemCurrency];

    if (!rate) {
      rate = await getExchangeRate(itemCurrency, baseCurrency);

      if (rate) {
        rateCache[itemCurrency] = rate;
      }
    }

    /* 환율 실패 */

    if (!rate) {
      totalAmount.textContent = "환율 계산 실패";

      baseCurrencyInfo.textContent = "일부 통화의 환율을 불러오지 못했습니다.";

      return;
    }

    /* 기준 통화로 환산 */

    total += Number(item.amount) * rate;
  }

  /* =========================
     표시
  ========================= */

  const symbol = currencies[baseCurrency]?.symbol || "";

  /*
    KRW / JPY 등은 소수점 없이
    USD / EUR / GBP는 2자리
  */

  const maximumFractionDigits =
    baseCurrency === "KRW" || baseCurrency === "JPY" ? 0 : 2;

  totalAmount.textContent = `${symbol}${total.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maximumFractionDigits,
  })}`;

  baseCurrencyInfo.textContent = `기준 통화 · ${baseCurrency}`;

  /* =========================
     계산 당시 환율 저장

     이후 결과 화면에서도
     같은 환율 사용 가능
  ========================= */

  sessionStorage.setItem("quickSettlementRates", JSON.stringify(rateCache));

  sessionStorage.setItem("quickSettlementTotal", String(total));
}

calculateTotal();

/* =========================
   송금하기
========================= */

sendMoneyButton.addEventListener("click", function () {
  location.href = "17_quick-result.html";

  console.log("송금 단계로 이동");
});
