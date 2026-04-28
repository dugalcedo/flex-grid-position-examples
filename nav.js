const res = await fetch('/nav.html')
const html = await res.text()
document.body.insertAdjacentHTML('afterbegin', html)

const path = window.location.pathname.replace(/\/$/, '') || '/index.html'
document.querySelectorAll('.main-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active')
})
