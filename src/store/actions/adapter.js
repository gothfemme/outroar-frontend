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

export const searchConversations = (search) => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`http://localhost:3000/conversations?search=${search}`, opts)
    .then(r => r.json())
}

export const postUser = (data) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(data)
  }
  return fetch('http://localhost:3000/users', opts)
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

export const postConversation = (name) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify({ name: name })
  }
  return fetch('http://localhost:3000/conversations', opts)
    .then(r => r.json())
}

export const fetchCurrentConversation = (id) => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`http://localhost:3000/conversations/${id}`, opts)
    .then(r => r.json())
}

export const postMessage = (message) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify(message)
  }
  return fetch('http://localhost:3000/messages', opts)
    .then(r => r.json())
}

export const fetchCurrentUser = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch('http://localhost:3000/current', opts)
    .then(r => r.json())
}

// export const