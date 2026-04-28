const res = await fetch('./nav.html')
const html = await res.text()
document.body.insertAdjacentHTML('afterbegin', html)

document.querySelectorAll('.main-nav a').forEach(a => {
    if (new URL(a.href).pathname === window.location.pathname) a.classList.add('active')
})
