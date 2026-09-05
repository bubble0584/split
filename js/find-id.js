const phone = document.getElementById("phone");
const verificationCode = document.getElementById("verificationCode");

const sendCodeButton = document.getElementById("sendCodeButton");
const verifyCodeButton = document.getElementById("verifyCodeButton");
const findIdButton = document.getElementById("findIdButton");

const findIdMessage = document.getElementById("findIdMessage");

let isPhoneVerified = false;

// 휴대폰 번호에서 하이픈 제거
function getCleanPhoneNumber() {
  return phone.value.trim().replace(/-/g, "");
}

// ===============================
// 인증번호 발송
// ===============================

sendCodeButton.addEventListener("click", function () {
  const phoneNumber = getCleanPhoneNumber();

  if (!phoneNumber) {
    alert("휴대폰 번호를 입력해주세요.");
    return;
  }

  const phoneRegex = /^01[0-9][0-9]{7,8}$/;

  if (!phoneRegex.test(phoneNumber)) {
    alert("올바른 휴대폰 번호를 입력해주세요.");
    return;
  }

  /*
    나중에 백엔드 연결

    fetch("백엔드주소/api/send-code/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
      }),
    });
  */

  alert("인증번호 발송 요청이 완료되었습니다.");

  isPhoneVerified = false;
});

// ===============================
// 인증번호 확인
// ===============================

verifyCodeButton.addEventListener("click", function () {
  const code = verificationCode.value.trim();

  if (!code) {
    alert("인증번호를 입력해주세요.");
    return;
  }

  /*
    실제로는 백엔드에서 인증번호 확인

    인증 성공 시:
    isPhoneVerified = true;
  */

  alert("현재는 백엔드 연결 전이라 실제 인증 확인은 되지 않습니다.");
});

// ===============================
// ID 찾기
// ===============================

findIdButton.addEventListener("click", function () {
  findIdMessage.textContent = "";

  const phoneNumber = getCleanPhoneNumber();

  if (!phoneNumber) {
    findIdMessage.textContent = "휴대폰 번호를 입력해주세요.";
    return;
  }

  const phoneRegex = /^01[0-9][0-9]{7,8}$/;

  if (!phoneRegex.test(phoneNumber)) {
    findIdMessage.textContent = "올바른 휴대폰 번호를 입력해주세요.";
    return;
  }

  if (!verificationCode.value.trim()) {
    findIdMessage.textContent = "인증번호를 입력해주세요.";
    return;
  }

  /*
    백엔드 연결 후 사용

    if (!isPhoneVerified) {
      findIdMessage.textContent =
        "휴대폰 인증을 완료해주세요.";
      return;
    }

    이후 백엔드에서
    해당 전화번호로 가입된 ID를 받아서 표시
  */

  alert("현재는 백엔드 연결 전이라 ID 조회는 되지 않습니다.");
});
