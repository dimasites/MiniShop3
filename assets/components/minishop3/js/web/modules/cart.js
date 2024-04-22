ms3.cart = {
  init () {
    const countBtns = document.querySelectorAll('.qty-btn')
    const countInputs = document.querySelectorAll('.qty-input')
    const changeOptionSelects = document.querySelectorAll('.ms3_cart_options')

    ms3.cart.countBtnsListener(countBtns)
    ms3.cart.countInputsListener(countInputs)
    ms3.cart.changeOptionSelectListener(changeOptionSelects)
  },

  async add (formData) {
    formData.append('ms3_action', 'cart/add')
    const response = await ms3.request.send(formData)
    if (response.shouldRender) {
      ms3.callback.cart.render(response)
    }
  },

  async change (formData) {
    formData.append('ms3_action', 'cart/change')
    const response = await ms3.request.send(formData)
    if (response.shouldRender) {
      ms3.callback.cart.render(response)
    }
  },

  async remove (formData) {
    formData.append('ms3_action', 'cart/remove')
    const response = await ms3.request.send(formData)
    if (response.shouldRender) {
      ms3.callback.cart.render(response)
    }
  },

  async clean (formData) {
    formData.append('ms3_action', 'cart/clean')
    const response = await ms3.request.send(formData)
    if (response.shouldRender) {
      ms3.callback.cart.render(response)
    }
  },

  async changeOption (formData) {
    formData.append('ms3_action', 'cart/changeOption')
    const response = await ms3.request.send(formData)
    if (response.shouldRender) {
      ms3.callback.cart.render(response)
    }
  },

  countBtnsListener (countBtns = []) {
    countBtns.forEach($btn => $btn.addEventListener('click', ms3.cart.countBtnClickListener))
  },

  countInputsListener (countInputs = []) {
    countInputs.forEach($input => $input.addEventListener('change', ms3.cart.countInputChangeListener))
  },

  countBtnClickListener (event) {
    const $btn = event.target
    const form = $btn.closest('.ms3_form')
    const input = form.querySelector('.qty-input')

    let quantity = parseInt(input.value, 10)
    if ($btn.classList.contains('inc-qty')) {
      quantity++
    }

    if ($btn.classList.contains('dec-qty') && quantity > 0) {
      quantity--
    }

    input.value = quantity

    const formData = new FormData(form)
    if (ms3Config.render) {
      formData.append('render', JSON.stringify(ms3Config.render))
    }
    ms3.cart.change(formData)
  },

  countInputChangeListener (event) {
    const $input = event.target
    const form = $input.closest('.ms3_form')
    const quantity = parseInt($input.value, 10)

    if (!quantity) {
      return
    }

    const formData = new FormData(form)
    if (ms3Config.render) {
      formData.append('render', JSON.stringify(ms3Config.render))
    }
    ms3.cart.change(formData)
  },

  changeOptionSelectListener (changeOptionSelects = []) {
    changeOptionSelects.forEach($select => $select.addEventListener('change', ms3.cart.changeOptionSelectChangeListener))
  },

  changeOptionSelectChangeListener (event) {
    const $input = event.target
    const form = $input.closest('.ms3_form')
    const formData = new FormData(form)

    if (ms3Config.render) {
      formData.append('render', JSON.stringify(ms3Config.render))
    }
    ms3.cart.changeOption(formData)
  }

}
