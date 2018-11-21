export const getToken = (data) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(data)
  }
  return fetch('http://localhost:3000/user_token', opts)
    .then(r => r.json())
}

export const getSplash = () => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch('http://localhost:3000/splash', opts)
    .then(r => r.json())
}

// export const