/* =========================
   MYPAGE
========================= */

/* =========================
   요소
========================= */

const mypageView = document.getElementById("mypageView");

const profileEditView = document.getElementById("profileEditView");

const backButton = document.getElementById("backButton");

const editBackButton = document.getElementById("editBackButton");

const profileEditButton = document.getElementById("profileEditButton");

const profileSaveButton = document.getElementById("profileSaveButton");

/* 보기 */

const profileImage = document.getElementById("profileImage");

const profileName = document.getElementById("profileName");

const profileId = document.getElementById("profileId");

const profileAccount = document.getElementById("profileAccount");

const profilePhone = document.getElementById("profilePhone");

const profileEmail = document.getElementById("profileEmail");

/* 수정 */

const editProfileImage = document.getElementById("editProfileImage");

const editProfileImageButton = document.getElementById(
  "editProfileImageButton",
);

const profileImageInput = document.getElementById("profileImageInput");

const editName = document.getElementById("editName");

const editAccount = document.getElementById("editAccount");

const editPhone = document.getElementById("editPhone");

const editEmail = document.getElementById("editEmail");

/* =========================
   임시 기본 데이터
========================= */

const defaultProfile = {
  name: "승주",

  id: "@songs083",

  account: "한국은행 000-000000-00000",

  phone: "010-0000-0000",

  email: "abcdef@gmail.com",

  image: "image/프로필.svg",
};

/* =========================
   프로필 불러오기
========================= */

function getProfile() {
  const saved = JSON.parse(localStorage.getItem("userProfile"));

  if (!saved) {
    return {
      ...defaultProfile,
    };
  }

  return {
    ...defaultProfile,
    ...saved,
  };
}

/* =========================
   프로필 저장
========================= */

function saveProfile(profile) {
  localStorage.setItem(
    "userProfile",

    JSON.stringify(profile),
  );
}

/* =========================
   화면 출력
========================= */

function renderProfile() {
  const profile = getProfile();

  profileName.textContent = profile.name;

  profileId.textContent = profile.id;

  profileAccount.textContent = profile.account;

  profilePhone.textContent = profile.phone;

  profileEmail.textContent = profile.email;

  profileImage.src = profile.image || "image/프로필.svg";
}

/* =========================
   수정 화면 값 채우기
========================= */

function fillEditForm() {
  const profile = getProfile();

  editName.value = profile.name;

  editAccount.value = profile.account;

  editPhone.value = profile.phone;

  editEmail.value = profile.email;

  editProfileImage.src = profile.image || "image/프로필.svg";
}

/* =========================
   수정 화면 열기
========================= */

profileEditButton.addEventListener("click", function () {
  fillEditForm();

  mypageView.classList.add("hidden");

  profileEditView.classList.remove("hidden");
});

/* =========================
   수정 화면 뒤로가기
========================= */

editBackButton.addEventListener("click", function () {
  profileEditView.classList.add("hidden");

  mypageView.classList.remove("hidden");
});

/* =========================
   마이페이지 뒤로가기
========================= */

backButton.addEventListener("click", function () {
  location.href = "05_home.html";
});

/* =========================
   프로필 사진 선택
========================= */

editProfileImageButton.addEventListener("click", function () {
  profileImageInput.click();
});

/* =========================
   사진 미리보기
========================= */

profileImageInput.addEventListener("change", function () {
  const file = profileImageInput.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    editProfileImage.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

/* =========================
   수정 완료
========================= */

profileSaveButton.addEventListener("click", function () {
  const name = editName.value.trim();

  const account = editAccount.value.trim();

  const phone = editPhone.value.trim();

  const email = editEmail.value.trim();

  if (!name) {
    alert("이름을 입력해주세요.");

    return;
  }

  const currentProfile = getProfile();

  const updatedProfile = {
    ...currentProfile,

    name: name,

    account: account,

    phone: phone,

    email: email,

    image: editProfileImage.src,
  };

  saveProfile(updatedProfile);

  /*
      Together 결과 페이지에서
      계좌 정보 읽는 코드와도 연결
    */

  localStorage.setItem("bankName", account.split(" ")[0] || "");

  localStorage.setItem("accountNumber", account.split(" ").slice(1).join(" "));

  renderProfile();

  profileEditView.classList.add("hidden");

  mypageView.classList.remove("hidden");
});

/* =========================
   최초 실행
========================= */

renderProfile();
