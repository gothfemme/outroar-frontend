const BASEURL = 'https://outroar-backend.herokuapp.com/'
// const BASEURL = 'http://localhost:3000/'

function checkError(res) {
  if (res.ok) {
    return res;
  } else {
    throw res;
  }
}

export const getToken = (data) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(data)
  }
  return fetch(`${BASEURL}user_token`, opts)
    .then(checkError)
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
  return fetch(`${BASEURL}conversations?search=${search}`, opts)
    .then(r => r.json())
}

export const patchConversation = (body, id) => {
  const opts = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify({ conversation: body })
  }
  return fetch(`${BASEURL}conversations/${id}`, opts)
}

export const deleteConversation = (id) => {
  const opts = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`${BASEURL}conversations/${id}`, opts)
    .then(r => r.json())
}

export const validateConversationPassword = (password, id) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify(password)
  }
  return fetch(`${BASEURL}conversations/${id}/validate`, opts)
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
  return fetch(`${BASEURL}users`, opts)
    .then(checkError)
    .then(r => r.json())
}

export const getSplash = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`${BASEURL}splash`, opts)
    .then(checkError)
    .then(r => r.json())
}

export const getRandom = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`${BASEURL}conversations/random`, opts)
    .then(r => r.json())
}

export const getPopular = () => {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    }
  }
  return fetch(`${BASEURL}conversations?popular=`, opts)
    .then(r => r.json())
}

export const patchUser = (body) => {
  const opts = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify(body)
  }
  return fetch(`${BASEURL}users/`, opts)
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
  return fetch(`${BASEURL}conversations`, opts)
    .then(r => r.json())
}

export const postFavorite = (id) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify({ conversation_id: id })
  }
  return fetch(`${BASEURL}favorites`, opts)
}

export const deleteFavorite = (id) => {
  const opts = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
      "Authorization": `Bearer ${localStorage.jwt}`
    },
    body: JSON.stringify({ conversation_id: id })
  }
  return fetch(`${BASEURL}favorites`, opts)
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
  return fetch(`${BASEURL}conversations/${id}`, opts)
    .then(checkError)
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
  return fetch(`${BASEURL}messages`, opts)
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
  return fetch(`${BASEURL}current`, opts)
    .then(checkError)
    .then(r => r.json())
}

// export const