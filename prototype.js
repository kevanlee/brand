const stepButtons = document.querySelectorAll("[data-step]");

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.step);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const fileInputs = document.querySelectorAll(".upload-box input");

fileInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const label = input.closest(".upload-box");
    const fileName = input.files?.[0]?.name;
    if (!label || !fileName) return;
    const small = label.querySelector("small");
    if (small) {
      small.textContent = `Selected: ${fileName}`;
    }
  });
});
