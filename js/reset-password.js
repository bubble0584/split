/* =========================
   RESET PASSWORD
========================= */

/* =========================
   요소
========================= */

const newPassword = document.getElementById("newPassword");

const newPasswordConfirm = document.getElementById("newPasswordConfirm");

const resetMessage = document.getElementById("resetMessage");

const resetCompleteButton = document.getElementById("resetCompleteButton");

/* =========================
   비밀번호 재설정 대상
========================= */

const resetUserId = sessionStorage.getItem("resetPasswordUserId");

const resetUserEmail = sessionStorage.getItem("resetPasswordEmail");

/* =========================
   비밀번호 검사
========================= */

function isValidPassword(password) {
  /*
    조건

    5~20자
    영문 최소 1개
    숫자 최소 1개
    특수문자 사용 가능
  */

  if (password.length < 5 || password.length > 20) {
    return false;
  }

  const hasLetter = /[A-Za-z]/.test(password);

  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
}

/* =========================
   메시지 초기화
========================= */

function clearMessage() {
  resetMessage.textContent = "";
}

newPassword.addEventListener("input", clearMessage);

newPasswordConfirm.addEventListener("input", clearMessage);

/* =========================
   완료
========================= */

resetCompleteButton.addEventListener("click", function () {
  const password = newPassword.value;

  const passwordConfirm = newPasswordConfirm.value;

  /* =========================
       입력 확인
    ========================= */

  if (!password) {
    resetMessage.textContent = "새 비밀번호를 입력해주세요.";

    return;
  }

  if (!isValidPassword(password)) {
    resetMessage.textContent =
      "비밀번호는 5~20자이며 영문과 숫자를 모두 포함해야 합니다.";

    return;
  }

  if (!passwordConfirm) {
    resetMessage.textContent = "비밀번호 확인을 입력해주세요.";

    return;
  }

  if (password !== passwordConfirm) {
    resetMessage.textContent = "비밀번호가 일치하지 않습니다.";

    return;
  }

  /* =========================
       프론트 테스트용 저장
    ========================= */

  const signupUser = JSON.parse(localStorage.getItem("signupUser"));

  if (signupUser && resetUserId && signupUser.id === resetUserId) {
    signupUser.password = password;

    localStorage.setItem("signupUser", JSON.stringify(signupUser));
  }

  /*
      백엔드 연결 후에는 여기에서

      reset token +
      새 비밀번호

      를 서버로 보내서
      실제 비밀번호 변경 API 호출
    */

  /* =========================
       임시 재설정 정보 삭제
    ========================= */

  sessionStorage.removeItem("resetPasswordUserId");

  sessionStorage.removeItem("resetPasswordEmail");

  /* =========================
       완료
    ========================= */

  alert("비밀번호가 변경되었습니다.");

  location.href = "02_login.html";
});
