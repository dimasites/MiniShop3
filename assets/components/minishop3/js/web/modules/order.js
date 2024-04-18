ms3.order = {
  init () {
    const orderForms = document.querySelectorAll('.ms3_order_form')
    orderForms.forEach(orderForm => ms3.order.formListener(orderForm))
  },

  formListener (customerForm) {
    const inputs = customerForm.querySelectorAll('input, textarea')
    inputs.forEach(input => ms3.order.changeInputListener(input))
  },

  changeInputListener (input) {
    input.addEventListener('change', async () => {
      const form = input.closest('.ms3_order_form')
      form.classList.remove('was-validated')
      input.classList.remove('is-invalid')
      input.closest('div').querySelector('.invalid-feedback').textContent = ''

      const formData = new FormData()
      formData.append('key', input.name)
      formData.append('value', input.value)

      const response = await ms3.order.add(formData)

      if (response.success === true) {
        form.classList.add('was-validated')
        // TODO не менять radio, checkbox, select
        input.value = response.data[input.name]
      } else {
        input.classList.add('is-invalid')
        input.closest('div').querySelector('.invalid-feedback').textContent = response.message
      }
    })
  },

  async add (formData) {
    formData.append('ms3_action', 'order/add')
    const response = await ms3.request.send(formData)
    // TODO callback, event
    return response
  },

  async remove (formData) {
    formData.append('ms3_action', 'order/remove')
    await ms3.request.send(formData)
  }
}
