const ms3 = {
  config: {},
  init () {
    this.config = document.ms3Config
    this.checkToken()
    ms3.form.init()
    ms3.cart.init()
    ms3.customer.init()
    ms3.order.init()
  },
  checkToken () {
    const ms3Token = localStorage.getItem(ms3.config.tokenName)
    if (ms3Token === null) {
      ms3.setToken()
      return false
    }

    if (!ms3.isJSON(ms3Token)) {
      localStorage.removeItem(ms3.config.tokenName)
      ms3.setToken()
      return false
    }

    const ms3TokenData = JSON.parse(ms3Token)
    const now = new Date()
    if (now.getTime() > parseInt(ms3TokenData.expiry)) {
      localStorage.removeItem(ms3.config.tokenName)
      ms3.setToken()
    } else {
      ms3.updateToken()
    }
  },
  async setToken () {
    this.request.setHeaders()
    const formData = new FormData()
    formData.append('ms3_action', 'customer/token/get')
    const response = await this.request.get(formData)
    if (response.success === true) {
      const now = new Date()
      const tokenData = {
        token: response.data.token,
        expiry: now.getTime() + parseInt(response.data.lifetime)
      }
      localStorage.setItem(ms3.config.tokenName, JSON.stringify(tokenData))
    }
  },
  async updateToken () {
    this.request.setHeaders()
    const formData = new FormData()
    formData.append('ms3_action', 'customer/token/update')
    const response = await this.request.post(formData)
    if (response.success === true) {
      const now = new Date()
      const tokenData = {
        token: response.data.token,
        expiry: now.getTime() + parseInt(response.data.lifetime)
      }
      localStorage.setItem(ms3.config.tokenName, JSON.stringify(tokenData))
    }
  },
  isJSON (str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ms3.init()
})

document.addEventListener('ms3_send_success', () => {
  // Время на перерисовку DOM
  setTimeout(() => {
    ms3.cart.init()
  }, 300)
})
