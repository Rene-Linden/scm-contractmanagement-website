const knop = document.querySelector(".menuknop");
const links = document.getElementById("menu");

function zet(open) {
  links.classList.toggle("open", open);
  knop.setAttribute("aria-expanded", String(open));
  knop.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
}

knop.addEventListener("click", () => zet(!links.classList.contains("open")));
links.addEventListener("click", (e) => { if (e.target.closest("a")) zet(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && links.classList.contains("open")) { zet(false); knop.focus(); }
});
