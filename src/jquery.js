function Fn(selector) {
  if (selector instanceof Fn) {
    return selector;
  }

  this.element = selector;

  if (typeof selector === 'string') {
    if (selector.indexOf('#') === 0) {
      this.element = document.getElementById(selector.slice(1));
    }
  }

  return this;
}

Fn.prototype.html = function html(value) {
  if (this.element) {
    this.element.innerHTML = value;
  }

  return this;
}

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
