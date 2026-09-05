const signupForm = document.getElementById("signupForm");

const password = document.getElementById("password");
const passwordConfirm = document.getElementById("passwordConfirm");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const verificationCode = document.getElementById("verificationCode");

const sendCodeButton = document.getElementById("sendCodeButton");
const verifyCodeButton = document.getElementById("verifyCodeButton");

const signupMessage = document.getElementById("signupMessage");

// 실제 휴대폰 인증이 완료됐는지 저장
let isPhoneVerified = false;

// ===============================
// 휴대폰 번호 정리 함수
// 010-1234-5678 → 01012345678
// ===============================

function getCleanPhoneNumber() {
  return phone.value.trim().replace(/-/g, "");
}

// ===============================
// 휴대폰 인증번호 보내기
// ===============================

sendCodeButton.addEventListener("click", function () {
  const phoneValue = phone.value.trim();

  if (!phoneValue) {
    alert("휴대폰 번호를 입력해주세요.");
    return;
  }

  // 하이픈 제거
  const phoneNumber = getCleanPhoneNumber();

  // 01012345678 / 010-1234-5678 둘 다 허용
  const phoneRegex = /^01[0-9][0-9]{7,8}$/;

  if (!phoneRegex.test(phoneNumber)) {
    alert("올바른 휴대폰 번호를 입력해주세요.");
    return;
  }

  /*
    나중에 백엔드 연결하면 여기서
    실제 인증번호 발송 API 호출

    예:

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

  // 새 인증번호를 요청했으므로 다시 미인증 상태로 변경
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
    나중에 백엔드 연결하면
    입력한 인증번호를 백엔드로 보내서 확인

    예:

    fetch("백엔드주소/api/verify-code/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: getCleanPhoneNumber(),
        code: code,
      }),
    });

    인증 성공 시:

    isPhoneVerified = true;
  */

  // 현재는 백엔드 연결 전
  alert("현재는 백엔드 연결 전이라 실제 인증 확인은 되지 않습니다.");
});

// ===============================
// 회원가입
// ===============================

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value.trim();
  const name = document.getElementById("name").value.trim();

  const passwordValue = password.value;
  const passwordConfirmValue = passwordConfirm.value;

  const phoneNumber = getCleanPhoneNumber();
  const emailValue = email.value.trim();

  signupMessage.textContent = "";

  // ===============================
  // ID 검사
  // ===============================

  if (!userId) {
    signupMessage.textContent = "ID를 입력해주세요.";
    return;
  }

  if (userId.length < 4 || userId.length > 12) {
    signupMessage.textContent = "ID는 4~12자로 입력해주세요.";
    return;
  }

  // ===============================
  // 비밀번호 검사
  // ===============================

  if (!passwordValue) {
    signupMessage.textContent = "비밀번호를 입력해주세요.";
    return;
  }

  // 5자 미만
  if (passwordValue.length < 5) {
    signupMessage.textContent = "비밀번호는 5자 이상이어야 합니다.";
    return;
  }

  // 20자 초과
  if (passwordValue.length > 20) {
    signupMessage.textContent = "비밀번호는 20자 이하여야 합니다.";
    return;
  }

  // 영문 + 숫자만 사용 가능
  const passwordRegex = /^[A-Za-z0-9]+$/;

  if (!passwordRegex.test(passwordValue)) {
    signupMessage.textContent = "비밀번호는 영문과 숫자만 사용할 수 있습니다.";
    return;
  }

  // 영문과 숫자가 둘 다 들어있는지 확인
  const hasLetter = /[A-Za-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  if (!hasLetter || !hasNumber) {
    signupMessage.textContent =
      "비밀번호에는 영문과 숫자가 모두 포함되어야 합니다.";
    return;
  }

  // ===============================
  // 비밀번호 확인
  // ===============================

  if (!passwordConfirmValue) {
    signupMessage.textContent = "비밀번호 확인을 입력해주세요.";
    return;
  }

  if (passwordValue !== passwordConfirmValue) {
    signupMessage.textContent = "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
    return;
  }

  // ===============================
  // 이름 검사
  // ===============================

  if (!name) {
    signupMessage.textContent = "이름을 입력해주세요.";
    return;
  }

  // ===============================
  // 휴대폰 번호 검사
  // ===============================

  if (!phone.value.trim()) {
    signupMessage.textContent = "휴대폰 번호를 입력해주세요.";
    return;
  }

  const phoneRegex = /^01[0-9][0-9]{7,8}$/;

  if (!phoneRegex.test(phoneNumber)) {
    signupMessage.textContent = "올바른 휴대폰 번호를 입력해주세요.";
    return;
  }

  // ===============================
  // 휴대폰 인증 여부
  // ===============================

  /*
    백엔드 연결 후에는 아래 코드 주석 해제

    if (!isPhoneVerified) {
      signupMessage.textContent =
        "휴대폰 인증을 완료해주세요.";
      return;
    }
  */

  // ===============================
  // 이메일 검사
  // ===============================

  if (!emailValue) {
    signupMessage.textContent = "이메일을 입력해주세요.";
    return;
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(emailValue)) {
    signupMessage.textContent = "올바른 이메일 형식을 입력해주세요.";
    return;
  }

  // ===============================
  // 모든 입력값 검사 완료
  // ===============================

  alert("입력값 검사가 완료되었습니다.");

  /*
    나중에 백엔드 연결하면
    여기서 실제 회원가입 API 호출

    fetch("http://127.0.0.1:8000/api/auth/signup/", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        username: userId,

        password: passwordValue,

        name: name,

        // 백엔드에는 하이픈 제거된 번호 전달
        phone: phoneNumber,

        email: emailValue,

      }),

    });
  */
});
