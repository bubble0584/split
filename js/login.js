const userId = document.getElementById("userId");
const saveId = document.getElementById("saveId");

const savedId = localStorage.getItem("savedId");

if (savedId) {
  userId.value = savedId;
  saveId.checked = true;
}

saveId.addEventListener("change", function () {
  if (saveId.checked) {
    localStorage.setItem("savedId", userId.value);
  } else {
    localStorage.removeItem("savedId");
  }
});

userId.addEventListener("input", function () {
  if (saveId.checked) {
    localStorage.setItem("savedId", userId.value);
  }
});

document.querySelector(".kakao-login").addEventListener("click", function () {
  window.location.href = "http://127.0.0.1:8000/api/auth/kakao/login/";
});
