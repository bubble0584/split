/* =========================
   비밀번호 찾기
========================= */

const userId = document.getElementById("userId");

const email = document.getElementById("email");

const verificationCode = document.getElementById("verificationCode");

const sendCodeButton = document.getElementById("sendCodeButton");

const verifyCodeButton = document.getElementById("verifyCodeButton");

const verificationMessage = document.getElementById("verificationMessage");

const nextButton = document.getElementById("nextButton");

let isEmailVerified = false;

/* =========================
   이메일 형식
========================= */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* =========================
   ID / 이메일 변경 시 인증 초기화
========================= */

function resetVerification() {
  isEmailVerified = false;

  verificationCode.value = "";

  verificationCode.disabled = true;

  verifyCodeButton.disabled = true;

  verifyCodeButton.textContent = "인증확인";

  verifyCodeButton.classList.remove("active");

  verificationMessage.textContent = "";

  verificationMessage.className = "verification-message";
}

userId.addEventListener("input", resetVerification);

email.addEventListener("input", resetVerification);

/* =========================
   인증번호 보내기
========================= */

sendCodeButton.addEventListener("click", function () {
  const idValue = userId.value.trim();

  const emailValue = email.value.trim();

  if (!idValue) {
    alert("ID를 입력해주세요.");
    return;
  }

  if (!emailValue) {
    alert("이메일 주소를 입력해주세요.");
    return;
  }

  if (!isValidEmail(emailValue)) {
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  /*
      백엔드 연결 전 임시 회원 확인
    */

  const signupUser = JSON.parse(localStorage.getItem("signupUser"));

  if (signupUser) {
    if (signupUser.id !== idValue || signupUser.email !== emailValue) {
      alert("ID와 이메일 정보가 일치하지 않습니다.");

      return;
    }
  }

  /*
      백엔드 연결 후:
      여기에서 ID + 이메일 확인 후
      이메일 인증번호 발송 API 호출
    */

  verificationCode.disabled = false;

  verifyCodeButton.disabled = false;

  verificationCode.focus();

  verificationMessage.textContent =
    "인증번호를 전송했어요. 테스트용 인증번호는 123456입니다.";

  alert("인증번호가 전송되었습니다.\n테스트용 인증번호: 123456");
});

/* =========================
   인증번호 확인
========================= */

verifyCodeButton.addEventListener("click", function () {
  const code = verificationCode.value.trim();

  if (!code) {
    alert("인증번호를 입력해주세요.");
    return;
  }

  if (code !== "123456") {
    isEmailVerified = false;

    verificationMessage.textContent = "인증번호가 일치하지 않습니다.";

    verificationMessage.className = "verification-message error";

    return;
  }

  isEmailVerified = true;

  verifyCodeButton.textContent = "인증완료";

  verifyCodeButton.classList.add("active");

  verificationCode.disabled = true;

  verificationMessage.textContent = "이메일 인증이 완료되었습니다.";

  verificationMessage.className = "verification-message success";
});

/* =========================
   다음
========================= */

nextButton.addEventListener("click", function () {
  const idValue = userId.value.trim();

  const emailValue = email.value.trim();

  if (!idValue) {
    alert("ID를 입력해주세요.");
    return;
  }

  if (!emailValue) {
    alert("이메일 주소를 입력해주세요.");
    return;
  }

  if (!isEmailVerified) {
    alert("이메일 인증을 완료해주세요.");
    return;
  }

  /*
      비밀번호 재설정 대상 저장
      나중에는 백엔드 토큰으로 대체
    */

  sessionStorage.setItem("resetPasswordUserId", idValue);

  sessionStorage.setItem("resetPasswordEmail", emailValue);

  location.href = "13_reset-password.html";
});
