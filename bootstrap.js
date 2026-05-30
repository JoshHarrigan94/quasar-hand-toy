import("./src/main.js").catch((error) => {
  console.error("BOOT FAILURE:", error);

  const box = document.createElement("pre");
  box.style.position = "fixed";
  box.style.inset = "12px";
  box.style.zIndex = "99999";
  box.style.padding = "16px";
  box.style.overflow = "auto";
  box.style.background = "rgba(0,0,0,.92)";
  box.style.color = "#ff8080";
  box.style.font = "12px monospace";
  box.style.border = "1px solid rgba(255,255,255,.2)";
  box.style.borderRadius = "12px";

  box.textContent =
    "BOOT FAILURE\n\n" +
    error.message +
    "\n\n" +
    (error.stack || "");

  document.body.appendChild(box);
});