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
   기본 프로필
========================= */

const defaultProfile = {
  name: "승주",
  id: "@songs083",
  account: "한국은행 000-000000-00000",
  phone: "010-0000-0000",
  email: "abcdef@gmail.com",
  image: "image/profile.svg",
};

/* =========================
   프로필 불러오기
========================= */

function getProfile() {
  let saved = null;

  try {
    saved = JSON.parse(localStorage.getItem("userProfile"));
  } catch (error) {
    console.error("프로필 데이터 오류:", error);
  }

  if (!saved) {
    return {
      ...defaultProfile,
    };
  }

  return {
    ...defaultProfile,
    ...saved,

    image:
      saved.image && saved.image !== "image/프로필.svg"
        ? saved.image
        : "image/profile.svg",
  };
}

/* =========================
   프로필 저장
========================= */

function saveProfile(profile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

/* =========================
   프로필 화면 출력
========================= */

function renderProfile() {
  const profile = getProfile();

  if (profileName) {
    profileName.textContent = profile.name;
  }

  if (profileId) {
    profileId.textContent = profile.id;
  }

  if (profileAccount) {
    profileAccount.textContent = profile.account;
  }

  if (profilePhone) {
    profilePhone.textContent = profile.phone || "";
  }

  if (profileEmail) {
    profileEmail.textContent = profile.email;
  }

  if (profileImage) {
    profileImage.src = profile.image || "image/profile.svg";
  }
}

/* =========================
   수정 폼 채우기
========================= */

function fillEditForm() {
  const profile = getProfile();

  if (editName) {
    editName.value = profile.name;
  }

  if (editAccount) {
    editAccount.value = profile.account;
  }

  if (editPhone) {
    editPhone.value = profile.phone || "";
  }

  if (editEmail) {
    editEmail.value = profile.email;
  }

  if (editProfileImage) {
    editProfileImage.src = profile.image || "image/profile.svg";
  }
}

/* =========================
   마이페이지 뒤로가기
========================= */

if (backButton) {
  backButton.addEventListener("click", function () {
    window.location.href = "05_home.html";
  });
}

/* =========================
   프로필 수정 화면 열기
========================= */

if (profileEditButton) {
  profileEditButton.addEventListener("click", function () {
    fillEditForm();

    if (mypageView) {
      mypageView.classList.add("hidden");
    }

    if (profileEditView) {
      profileEditView.classList.remove("hidden");
    }
  });
}

/* =========================
   수정 화면 뒤로가기
========================= */

if (editBackButton) {
  editBackButton.addEventListener("click", function () {
    if (profileEditView) {
      profileEditView.classList.add("hidden");
    }

    if (mypageView) {
      mypageView.classList.remove("hidden");
    }
  });
}

/* =========================
   사진 선택
========================= */

if (editProfileImageButton && profileImageInput) {
  editProfileImageButton.addEventListener("click", function () {
    profileImageInput.click();
  });
}

/* =========================
   사진 미리보기
========================= */

if (profileImageInput) {
  profileImageInput.addEventListener("change", function () {
    const file = profileImageInput.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      if (editProfileImage) {
        editProfileImage.src = event.target.result;
      }
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   프로필 수정 완료
========================= */

if (profileSaveButton) {
  profileSaveButton.addEventListener("click", function () {
    const currentProfile = getProfile();

    const name = editName ? editName.value.trim() : currentProfile.name;

    const account = editAccount
      ? editAccount.value.trim()
      : currentProfile.account;

    const phone = editPhone ? editPhone.value.trim() : currentProfile.phone;

    const email = editEmail ? editEmail.value.trim() : currentProfile.email;

    if (!name) {
      alert("이름을 입력해주세요.");

      return;
    }

    const updatedProfile = {
      ...currentProfile,

      name: name,

      account: account,

      phone: phone,

      email: email,

      image: editProfileImage ? editProfileImage.src : currentProfile.image,
    };

    saveProfile(updatedProfile);

    /* 계좌 정보 */

    const accountParts = account.split(" ");

    localStorage.setItem("bankName", accountParts[0] || "");

    localStorage.setItem("accountNumber", accountParts.slice(1).join(" "));

    renderProfile();

    if (profileEditView) {
      profileEditView.classList.add("hidden");
    }

    if (mypageView) {
      mypageView.classList.remove("hidden");
    }
  });
}

/* =========================
   최초 실행
========================= */

renderProfile();
