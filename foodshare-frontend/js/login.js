function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

const login = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
    const role = parseJwt(data.token).role;
    window.location.href = `${role.toLowerCase()}_dashboard.html`;
  } else {
    alert(data.message || "Login failed");
  }
};

// Attach to the login button click event
document.getElementById("loginBtn").addEventListener("click", login);
