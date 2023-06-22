import "../lib/index.js";
window.onload = () => {
  setTimeout(() => {
    const niBtn = document.getElementsByTagName("ni-button")[0]
    niBtn.addEventListener("click", (e) => {
      alert("警告！！！")
    })
    // console.log(document.getElementsByTagName("ni-button")[0].disabled)
  }, 2000)
};
