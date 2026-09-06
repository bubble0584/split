/* =========================
   URL 정보
========================= */

const params = new URLSearchParams(window.location.search);

const mode = params.get("mode") || "quick";

const itemId = Number(params.get("itemId"));

/* =========================
   요소
========================= */

const detailItemName = document.getElementById("detailItemName");

const detailItemAmount = document.getElementById("detailItemAmount");

const detailParticipantTitle = document.getElementById(
  "detailParticipantTitle",
);

const detailParticipantList = document.getElementById("detailParticipantList");

/* =========================
   결제자 요소
========================= */

const payerRow = document.getElementById("payerRow");

const payerProfileImage = document.getElementById("payerProfileImage");

const payerName = document.getElementById("payerName");

const payerAmount = document.getElementById("payerAmount");

/* =========================
   드래그 요소
========================= */

const detailSheet = document.getElementById("detailSheet");

const sheetHandle = document.getElementById("sheetHandle");

const detailBackdrop = document.getElementById("detailBackdrop");

/* =========================
   방 정보
========================= */

const rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const currentRoom = rooms.length > 0 ? rooms[rooms.length - 1] : null;

const currentRoomId = currentRoom?.id || "default";

/* =========================
   저장 key
========================= */

const itemsKey =
  mode === "together"
    ? `togetherItems_${currentRoomId}`
    : `quickItems_${currentRoomId}`;

/* =========================
   항목 가져오기
========================= */

const items = JSON.parse(sessionStorage.getItem(itemsKey)) || [];

const item = items.find(function (target) {
  return target.id === itemId;
});

/* =========================
   참여자 가져오기
========================= */

let participants = [];

if (mode === "together") {
  const invitedParticipants =
    JSON.parse(sessionStorage.getItem("togetherParticipants")) || [];

  const host = {
    id: "host",
    name: "나",
    isHost: true,
    isMe: true,
    color: "#F5C04A",
    profileImage: null,
  };

  participants = [host, ...invitedParticipants];
} else {
  participants = JSON.parse(sessionStorage.getItem("quickParticipants")) || [];
}

/* =========================
   통화
========================= */

const currencies = {
  KRW: {
    symbol: "₩",
    suffix: "원",
  },

  USD: {
    symbol: "$",
    suffix: "",
  },

  JPY: {
    symbol: "¥",
    suffix: "",
  },

  EUR: {
    symbol: "€",
    suffix: "",
  },

  GBP: {
    symbol: "£",
    suffix: "",
  },
};

/* =========================
   참여자 이름
========================= */

function getParticipantName(participant) {
  if (mode === "together" && participant.isHost) {
    return `${participant.name} (방장)`;
  }

  if (mode === "quick" && participant.isMe) {
    return `${participant.name} (나)`;
  }

  return participant.name;
}

/* =========================
   금액 표시
========================= */

function formatAmount(amount, currencyCode) {
  const currency = currencies[currencyCode];

  if (currencyCode === "KRW") {
    return `${Math.round(amount).toLocaleString()}원`;
  }

  return `${currency.symbol}${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

/* =========================
   화면 출력
========================= */

function renderDetail() {
  if (!item) {
    alert("항목 정보를 찾을 수 없습니다.");

    history.back();

    return;
  }

  /* =========================
     항목 이름
  ========================= */

  detailItemName.textContent = item.name;

  /* =========================
     QUICK / TOGETHER 금액 분리
  ========================= */

  if (mode === "together") {
    /*
      together에서는
      제목 아래 총금액 숨김
    */

    detailItemAmount.classList.add("hidden");
  } else {
    /*
      quick에서는
      제목 아래 총금액 표시
    */

    detailItemAmount.classList.remove("hidden");

    detailItemAmount.textContent = formatAmount(item.amount, item.currency);
  }

  /* =========================
     결제자 표시
     together 전용
  ========================= */

  if (mode === "together" && item.payerId) {
    const payer = participants.find(function (participant) {
      return participant.id === item.payerId;
    });

    if (payer) {
      payerRow.classList.remove("hidden");

      payerName.textContent = getParticipantName(payer);

      payerAmount.textContent = formatAmount(item.amount, item.currency);

      payerProfileImage.src = payer.profileImage || "./image/프로필.svg";
    } else {
      payerRow.classList.add("hidden");
    }
  } else {
    payerRow.classList.add("hidden");
  }

  /* =========================
     선택된 참여자
  ========================= */

  const selectedParticipants = participants.filter(function (participant) {
    return (
      Array.isArray(item.participantIds) &&
      item.participantIds.includes(participant.id)
    );
  });

  detailParticipantTitle.textContent = `참여자 (${selectedParticipants.length}명)`;

  detailParticipantList.innerHTML = "";

  /* =========================
     균등 정산
  ========================= */

  const perPersonAmount =
    selectedParticipants.length > 0
      ? item.amount / selectedParticipants.length
      : 0;

  /* =========================
     참여자 출력
  ========================= */

  selectedParticipants.forEach(function (participant) {
    const row = document.createElement("div");

    row.className = "detail-participant-item";

    const amountText = formatAmount(perPersonAmount, item.currency);

    row.innerHTML = `

        <div class="detail-participant-avatar">

          ${
            participant.profileImage
              ? `
                <img
                  src="${participant.profileImage}"
                  alt="${participant.name}"
                />
              `
              : `
                <img
                  src="./image/프로필.svg"
                  alt="기본 프로필"
                />
              `
          }

        </div>


        <div class="detail-participant-name">

          ${getParticipantName(participant)}

        </div>


        <div class="detail-participant-amount">

          ${amountText}

        </div>

      `;

    detailParticipantList.appendChild(row);
  });
}

/* =========================
   아래로 드래그해서 닫기
========================= */

let dragStartY = 0;
let dragDistanceY = 0;
let isDragging = false;

/* 드래그 시작 */

sheetHandle.addEventListener("pointerdown", function (event) {
  dragStartY = event.clientY;

  dragDistanceY = 0;

  isDragging = true;

  detailSheet.style.transition = "none";

  sheetHandle.setPointerCapture(event.pointerId);
});

/* 드래그 중 */

sheetHandle.addEventListener("pointermove", function (event) {
  if (!isDragging) {
    return;
  }

  dragDistanceY = event.clientY - dragStartY;

  /*
      아래 방향으로만 이동
    */

  if (dragDistanceY > 0) {
    detailSheet.style.transform = `translate(-50%, ${dragDistanceY}px)`;
  }
});

/* 드래그 종료 */

sheetHandle.addEventListener("pointerup", function () {
  if (!isDragging) {
    return;
  }

  isDragging = false;

  detailSheet.style.transition = "transform 0.25s ease";

  /*
      100px 이상 내렸으면
      화면 밖으로 내려가고 뒤로가기
    */

  if (dragDistanceY > 100) {
    detailSheet.style.transform = "translate(-50%, 100%)";

    setTimeout(function () {
      history.back();
    }, 250);
  } else {
    /*
        충분히 안 내렸으면
        원래 위치로 복귀
      */

    detailSheet.style.transform = "translate(-50%, 0)";
  }

  dragDistanceY = 0;
});

/* =========================
   드래그 취소
========================= */

sheetHandle.addEventListener("pointercancel", function () {
  isDragging = false;

  dragDistanceY = 0;

  detailSheet.style.transition = "transform 0.25s ease";

  detailSheet.style.transform = "translate(-50%, 0)";
});

/* =========================
   어두운 배경 누르면 닫기
========================= */

if (detailBackdrop) {
  detailBackdrop.addEventListener("click", function () {
    history.back();
  });
}

/* =========================
   실행
========================= */

renderDetail();
