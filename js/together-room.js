const inviteOverlay = document.getElementById("inviteOverlay");

const inviteCloseButton = document.getElementById("inviteCloseButton");

const copyLinkButton = document.getElementById("copyLinkButton");

const copyCodeButton = document.getElementById("copyCodeButton");

const shareLinkButton = document.getElementById("shareLinkButton");

const inviteLink = document.getElementById("inviteLink");

const inviteCode = document.getElementById("inviteCode");

const shareButton = document.getElementById("shareButton");

/* =========================
   임시 참여 코드
========================= */

const tempJoinCode = "58321";

const tempInviteLink = `https://split.app/join/${tempJoinCode}`;

/* =========================
   화면 표시
========================= */

inviteCode.textContent = tempJoinCode;

inviteLink.textContent = tempInviteLink;

/* =========================
   초대 모달 열기
========================= */

shareButton.addEventListener("click", function () {
  inviteOverlay.classList.remove("hidden");
});

/* =========================
   초대 모달 닫기
========================= */

inviteCloseButton.addEventListener("click", function () {
  inviteOverlay.classList.add("hidden");
});

/* 바깥 영역 눌러도 닫기 */

inviteOverlay.addEventListener("click", function (event) {
  if (event.target === inviteOverlay) {
    inviteOverlay.classList.add("hidden");
  }
});

/* =========================
   링크 복사
========================= */

copyLinkButton.addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(tempInviteLink);

    copyLinkButton.textContent = "복사됨";
  } catch (error) {
    alert("링크 복사 기능은 배포 환경에서 확인해주세요.");
  }
});

/* =========================
   참여 코드 복사
========================= */

copyCodeButton.addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(tempJoinCode);

    copyCodeButton.textContent = "복사됨";
  } catch (error) {
    alert("참여 코드 복사 기능은 배포 환경에서 확인해주세요.");
  }
});

/* =========================
   링크 공유
========================= */

shareLinkButton.addEventListener("click", async function () {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "스플릿 정산방 초대",

        text: "정산방에 참여해 주세요.",

        url: tempInviteLink,
      });
    } catch (error) {
      console.log("공유 취소", error);
    }

    return;
  }

  try {
    await navigator.clipboard.writeText(tempInviteLink);

    alert("초대 링크가 복사되었습니다.");
  } catch (error) {
    alert("공유 기능은 배포 환경에서 확인해주세요.");
  }
});

/* =========================
   항목 입력하기
========================= */

const startItemButton = document.getElementById("startItemButton");

startItemButton.addEventListener("click", function () {
  const params = new URLSearchParams(window.location.search);
  const roomId =
    params.get("roomId") || sessionStorage.getItem("currentRoomId");

  if (!roomId) {
    alert("정산방 정보를 찾을 수 없습니다.");
    return;
  }

  sessionStorage.setItem("currentRoomId", roomId);

  window.location.href = `14_quick-main.html?roomId=${roomId}&mode=together`;
});
