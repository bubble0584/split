/* =========================
   SIGNUP
========================= */

const signupForm = document.getElementById("signupForm");

const userId = document.getElementById("userId");

const password = document.getElementById("password");

const passwordConfirm = document.getElementById("passwordConfirm");

const nameInput = document.getElementById("name");

const email = document.getElementById("email");

const emailCode = document.getElementById("emailCode");

const bank = document.getElementById("bank");

const accountNumber = document.getElementById("accountNumber");

const checkIdButton = document.getElementById("checkIdButton");

const sendEmailCodeButton = document.getElementById("sendEmailCodeButton");

const verifyEmailCodeButton = document.getElementById("verifyEmailCodeButton");

const emailVerificationMessage = document.getElementById(
  "emailVerificationMessage",
);

/* =========================
   상태
========================= */

let isIdChecked = false;

let isEmailVerified = false;

/* =========================
   ID 변경 시 중복확인 초기화
========================= */

userId.addEventListener("input", function () {
  isIdChecked = false;

  checkIdButton.textContent = "중복 확인";

  checkIdButton.classList.remove("active");
});

/* =========================
   ID 중복확인
   백엔드 연결 전 임시 처리
========================= */

checkIdButton.addEventListener("click", function () {
  const id = userId.value.trim();

  if (id.length < 4 || id.length > 12) {
    alert("ID는 4~12자로 입력해주세요.");

    return;
  }

  const idRegex = /^[A-Za-z0-9]+$/;

  if (!idRegex.test(id)) {
    alert("ID는 영문과 숫자만 사용할 수 있습니다.");

    return;
  }

  isIdChecked = true;

  checkIdButton.textContent = "확인완료";

  checkIdButton.classList.add("active");

  alert("사용 가능한 ID입니다.");
});

/* =========================
   이메일 형식
========================= */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* =========================
   이메일 변경
========================= */

email.addEventListener("input", function () {
  isEmailVerified = false;

  emailCode.value = "";

  emailCode.disabled = true;

  verifyEmailCodeButton.disabled = true;

  emailVerificationMessage.textContent = "";

  emailVerificationMessage.className = "verification-message";
});

/* =========================
   이메일 인증번호 보내기
========================= */

sendEmailCodeButton.addEventListener("click", function () {
  const emailValue = email.value.trim();

  if (!emailValue) {
    alert("이메일을 입력해주세요.");

    return;
  }

  if (!isValidEmail(emailValue)) {
    alert("올바른 이메일 형식을 입력해주세요.");

    return;
  }

  emailCode.disabled = false;

  verifyEmailCodeButton.disabled = false;

  emailCode.focus();

  emailVerificationMessage.textContent =
    "인증번호를 전송했어요. 테스트용 인증번호는 123456입니다.";

  /*
      백엔드 연결 후
      여기에서 실제 이메일 인증 API 호출
    */

  alert("인증번호가 전송되었습니다.\n테스트용 인증번호: 123456");
});

/* =========================
   이메일 인증번호 확인
========================= */

verifyEmailCodeButton.addEventListener("click", function () {
  const code = emailCode.value.trim();

  if (!code) {
    alert("인증번호를 입력해주세요.");

    return;
  }

  if (code === "123456") {
    isEmailVerified = true;

    emailVerificationMessage.textContent = "이메일 인증이 완료되었습니다.";

    emailVerificationMessage.className = "verification-message success";

    verifyEmailCodeButton.textContent = "인증완료";

    verifyEmailCodeButton.classList.add("active");

    emailCode.disabled = true;

    return;
  }

  isEmailVerified = false;

  emailVerificationMessage.textContent = "인증번호가 일치하지 않습니다.";

  emailVerificationMessage.className = "verification-message error";
});

/* =========================
   계좌번호 숫자만
========================= */

accountNumber.addEventListener("input", function () {
  accountNumber.value = accountNumber.value.replace(/[^0-9]/g, "");
});

/* =========================
   회원가입
========================= */

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = userId.value.trim();

  const pw = password.value.trim();

  const pwConfirm = passwordConfirm.value.trim();

  const userName = nameInput.value.trim();

  const emailValue = email.value.trim();

  const bankValue = bank.value;

  const accountValue = accountNumber.value.trim();

  /* ID */

  if (!id) {
    alert("ID를 입력해주세요.");

    return;
  }

  if (id.length < 4 || id.length > 12) {
    alert("ID는 4~12자로 입력해주세요.");

    return;
  }

  if (!isIdChecked) {
    alert("ID 중복 확인을 해주세요.");

    return;
  }

  /* 비밀번호 */

  if (pw.length < 5 || pw.length > 20) {
    alert("비밀번호는 5~20자로 입력해주세요.");

    return;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*[0-9]).+$/;

  if (!passwordRegex.test(pw)) {
    alert("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");

    return;
  }

  if (pw !== pwConfirm) {
    alert("비밀번호가 일치하지 않습니다.");

    return;
  }

  /* 이름 */

  if (!userName) {
    alert("이름을 입력해주세요.");

    return;
  }

  /* 이메일 */

  if (!isValidEmail(emailValue)) {
    alert("올바른 이메일 주소를 입력해주세요.");

    return;
  }

  if (!isEmailVerified) {
    alert("이메일 인증을 완료해주세요.");

    return;
  }

  /* 은행 */

  if (!bankValue) {
    alert("은행을 선택해주세요.");

    return;
  }

  /* 계좌 */

  if (!accountValue) {
    alert("계좌번호를 입력해주세요.");

    return;
  }

  if (accountValue.length < 8) {
    alert("계좌번호를 확인해주세요.");

    return;
  }

  /* =========================
       임시 회원정보 저장
    ========================= */

  const userData = {
    id: id,

    name: userName,

    email: emailValue,

    bank: bankValue,

    accountNumber: accountValue,
  };

  localStorage.setItem("signupUser", JSON.stringify(userData));

  /* =========================
       마이페이지용 데이터
    ========================= */

  const profileData = {
    name: userName,

    id: `@${id}`,

    account: `${bankValue} ${accountValue}`,

    phone: "",

    email: emailValue,

    image: "image/profile.svg",
  };

  localStorage.setItem("userProfile", JSON.stringify(profileData));

  /* Together 결과에서도 사용 */

  localStorage.setItem("bankName", bankValue);

  localStorage.setItem("accountNumber", accountValue);

  alert("회원가입이 완료되었습니다.");

  location.href = "02_login.html";
});
