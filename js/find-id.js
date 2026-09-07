/* =========================
   ID 찾기
========================= */

const email = document.getElementById("email");

const verificationCode = document.getElementById("verificationCode");

const sendCodeButton = document.getElementById("sendCodeButton");

const verifyCodeButton = document.getElementById("verifyCodeButton");

const findIdButton = document.getElementById("findIdButton");

let isEmailVerified = false;

/* =========================
   이메일 인증번호 발송
========================= */

sendCodeButton.addEventListener("click", function () {
  const emailValue = email.value.trim();

  if (!emailValue) {
    alert("이메일 주소를 입력해주세요.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailValue)) {
    alert("올바른 이메일 주소를 입력해주세요.");
    return;
  }

  /*
    백엔드 연결 전 임시 처리

    나중에는 여기에서
    이메일 인증번호 발송 API 호출
  */

  alert("인증번호가 이메일로 전송되었습니다.");

  verificationCode.focus();
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

  /*
    백엔드 연결 전 임시 처리

    현재는 아무 번호나 입력하면
    인증 성공으로 처리
  */

  isEmailVerified = true;

  verifyCodeButton.textContent = "인증완료";

  alert("이메일 인증이 완료되었습니다.");
});

/* =========================
   ID 찾기
========================= */

findIdButton.addEventListener("click", function () {
  if (!email.value.trim()) {
    alert("이메일 주소를 입력해주세요.");
    return;
  }

  if (!isEmailVerified) {
    alert("이메일 인증을 완료해주세요.");
    return;
  }

  /*
    백엔드 연결 후에는

    입력한 이메일을 기준으로
    해당 사용자의 ID를 받아오면 됨.
  */

  alert("회원님의 ID는 song050 입니다.");
});
