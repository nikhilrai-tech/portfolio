// Runs before first paint: applies a saved theme, and decides whether to play the boot screen
// (once per browser session, never for reduced motion). Kept tiny and dependency-free.
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t}catch(e){}try{if(!sessionStorage.getItem("booted")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("booting")}catch(e){}})();`;
