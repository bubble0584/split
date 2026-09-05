const userId = document.getElementById("userId");
const phone = document.getElementById("phone");
const verificationCode = document.getElementById("verificationCode");

const sendCodeButton = document.getElementById("sendCodeButton");
const verifyCodeButton = document.getElementById("verifyCodeButton");
const nextButton = document.getElementById("nextButton");

const findPasswordMessage = document.getElementById("findPasswordMessage");

// 실제 휴대폰 인증 완료 여부
let isPhoneVerified = false;

// ===============================
// 휴대폰 번호 정리
// 010-1234-5678 → 01012345678
// ===============================

function normalizePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/-/g, "");
}

// ===============================
// 인증번호 발송
// ===============================

sendCodeButton.addEventListener("click", function () {
  const userIdValue = userId.value.trim();

  const phoneValue = normalizePhoneNumber(phone.value.trim());

  // ID 확인
  if (!userIdValue) {
    findPasswordMessage.textContent = "ID를 입력해 주세요.";

    return;
  }

  // 휴대폰 번호 확인
  if (!phoneValue) {
    findPasswordMessage.textContent = "휴대폰 번호를 입력해 주세요.";

    return;
  }

  // 숫자 10~11자리 확인
  const phoneRegex = /^[0-9]{10,11}$/;

  if (!phoneRegex.test(phoneValue)) {
    findPasswordMessage.textContent = "올바른 휴대폰 번호를 입력해 주세요.";

    return;
  }

  findPasswordMessage.textContent = "";

  /*
    ===============================
    나중에 백엔드 연결
    ===============================

    여기서 백엔드가

    1. 입력한 ID가 존재하는지 확인
    2. ID와 휴대폰 번호가 일치하는지 확인
    3. 인증번호 생성
    4. 실제 문자 발송

    을 처리해야 함.
  */

  alert(
    "인증번호 발송 요청이 완료되었습니다.\n현재는 백엔드 연결 전이라 실제 문자는 발송되지 않습니다.",
  );

  // 새 인증을 시작했으므로 다시 false
  isPhoneVerified = false;
});

// ===============================
// 인증번호 확인
// ===============================

verifyCodeButton.addEventListener("click", function () {
  const code = verificationCode.value.trim();

  if (!code) {
    findPasswordMessage.textContent = "인증번호를 입력해 주세요.";

    return;
  }

  /*
    나중에는 여기서 인증번호를
    백엔드로 보내서 실제로 확인해야 함.
  */

  findPasswordMessage.textContent = "";

  alert("현재는 백엔드 연결 전이라 실제 인증번호 확인은 되지 않습니다.");

  /*
    백엔드 연결 후 인증 성공했을 때만:

    isPhoneVerified = true;
  */
});

// ===============================
// 다음 버튼
// ===============================

nextButton.addEventListener("click", function () {
  const userIdValue = userId.value.trim();

  const phoneValue = normalizePhoneNumber(phone.value.trim());

  if (!userIdValue) {
    findPasswordMessage.textContent = "ID를 입력해 주세요.";

    return;
  }

  if (!phoneValue) {
    findPasswordMessage.textContent = "휴대폰 번호를 입력해 주세요.";

    return;
  }

  /*
    ★ 백엔드 연결 후에는 반드시 활성화

    if (!isPhoneVerified) {
      findPasswordMessage.textContent =
        "휴대폰 인증을 완료해 주세요.";

      return;
    }
  */

  findPasswordMessage.textContent = "";

  // 다음 페이지에서 사용할 ID 임시 저장
  sessionStorage.setItem("passwordResetUserId", userIdValue);

  // 새 비밀번호 설정 페이지
  window.location.href = "13_reset-password.html";
});
