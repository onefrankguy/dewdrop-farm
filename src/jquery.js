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

Fn.prototype.addClass = function addClass(value) {
  if (this.element && this.element.classList && value) {
    this.element.classList.add(value);
  }

  return this;
};

Fn.prototype.removeClass = function removeClass(value) {
  if (this.element && this.element.classList) {
    this.element.classList.remove(value);
  }

  return this;
};

Fn.prototype.html = function html(value) {
  if (this.element) {
    this.element.innerHTML = value;
  }

  return this;
};

Fn.prototype.click = function click(start, end) {
  const that = this;

  if (this.element) {
    if ('ontouchstart' in document.documentElement === false) {
      this.element.onmousedown = function onmousedown(mouseDownEvent) {
        if (start) {
          start(that, mouseDownEvent);
        }

        document.onmousemove = function onmousemove(mouseMoveEvent) {
          mouseMoveEvent.preventDefault();
        };

        document.onmouseup = function onmouseup(mouseUpEvent) {
          if (end) {
            end(that, mouseUpEvent);
          }

          document.onmousemove = undefined;
          document.onmouseup = undefined;
        };
      };
    } else {
      this.element.ontouchstart = function ontouchstart(touchStartEvent) {
        if (start) {
          start(that, touchStartEvent);
        }

        document.ontouchmove = function ontouchmove(touchMoveEvent) {
          touchMoveEvent.preventDefault();
        };

        document.ontouchend = function ontouchend(touchEndEvent) {
          if (end) {
            end(that, touchEndEvent);
          }

          document.ontouchmove = undefined;
          document.ontouchend = undefined;
        };
      }
    }
  }

  return this;
};

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
