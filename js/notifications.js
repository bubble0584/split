/* =========================
   NOTIFICATIONS
========================= */

const notificationList = document.getElementById("notificationList");

const emptyNotification = document.getElementById("emptyNotification");

const backButton = document.getElementById("backButton");

const readAllButton = document.getElementById("readAllButton");

/* =========================
   임시 알림 데이터
========================= */

const defaultNotifications = [
  {
    id: 1,

    type: "payment",

    title: "시카고 정산에 새로운 항목이 추가됐어요.",

    message: "새로운 결제 내역이 추가되었습니다.",

    time: "5분 전",

    read: false,
  },

  {
    id: 2,

    type: "request",

    title: "코코아비치 정산 요청이 도착했어요.",

    message: "아직 송금하지 않은 금액이 있어요.",

    time: "2시간 전",

    read: false,
  },

  {
    id: 3,

    type: "complete",

    title: "정산이 완료됐어요.",

    message: "강남역 저녁 모임 정산이 모두 완료되었습니다.",

    time: "어제",

    read: true,
  },

  {
    id: 4,

    type: "invite",

    title: "새로운 정산방에 초대됐어요.",

    message: "올랜도 여행 정산방에 참여해 주세요.",

    time: "어제",

    read: true,
  },
];

/* =========================
   알림 불러오기
========================= */

function getNotifications() {
  const saved = JSON.parse(localStorage.getItem("notifications"));

  if (!saved) {
    localStorage.setItem("notifications", JSON.stringify(defaultNotifications));

    return [...defaultNotifications];
  }

  return saved;
}

/* =========================
   저장
========================= */

function saveNotifications(notifications) {
  localStorage.setItem(
    "notifications",

    JSON.stringify(notifications),
  );
}

/* =========================
   타입별 아이콘
========================= */

function getNotificationIcon(type) {
  if (type === "payment") {
    return "₩";
  }

  if (type === "request") {
    return "↗";
  }

  if (type === "complete") {
    return "✓";
  }

  if (type === "invite") {
    return "+";
  }

  return "!";
}

/* =========================
   렌더링
========================= */

function renderNotifications() {
  const notifications = getNotifications();

  notificationList.innerHTML = "";

  if (notifications.length === 0) {
    emptyNotification.classList.remove("hidden");

    return;
  }

  emptyNotification.classList.add("hidden");

  notifications.forEach(function (notification) {
    const item = document.createElement("article");

    item.className = "notification-item";

    if (!notification.read) {
      item.classList.add("unread");
    }

    item.innerHTML = `
  <div class="notification-icon ${
    notification.type === "invite" ? "plus-icon" : ""
  }">
    ${getNotificationIcon(notification.type)}
  </div>

  <div class="notification-content">
    <h2 class="notification-title">
      ${notification.title}
    </h2>

    <p class="notification-message">
      ${notification.message}
    </p>

    <span class="notification-time">
      ${notification.time}
    </span>
  </div>

  ${notification.read ? "" : `<span class="unread-dot"></span>`}
`;

    item.addEventListener("click", function () {
      markAsRead(notification.id);
    });

    notificationList.appendChild(item);
  });
}

/* =========================
   하나 읽음 처리
========================= */

function markAsRead(id) {
  const notifications = getNotifications();

  const target = notifications.find(function (notification) {
    return notification.id === id;
  });

  if (!target) {
    return;
  }

  target.read = true;

  saveNotifications(notifications);

  renderNotifications();
}

/* =========================
   모두 읽음
========================= */

readAllButton.addEventListener("click", function () {
  const notifications = getNotifications();

  notifications.forEach(function (notification) {
    notification.read = true;
  });

  saveNotifications(notifications);

  renderNotifications();
});

/* =========================
   뒤로가기
========================= */

backButton.addEventListener("click", function () {
  location.href = "05_home.html";
});

/* =========================
   최초 실행
========================= */

renderNotifications();
