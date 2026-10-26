// Runs before first paint so a saved theme never flashes. Kept tiny and dependency-free.
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})();`;
