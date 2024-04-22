ms3.callback = {
  cart: {
    render: function (response) {
      const cartRender = response.data.render.cart

      for (const key in cartRender) {
        const { selector, render } = cartRender[key]
        const $element = document.querySelector(selector)

        if ($element) {
          $element.innerHTML = render
        }
      }
    }
  }
}
