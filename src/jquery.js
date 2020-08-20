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
    if (value === undefined) {
      return this.element.innerHTML;
    }

    this.element.innerHTML = value;
  }

  return this;
};

Fn.prototype.click = function click(start, move, end) {
  const that = this;

  if (this.element) {
    const hasMouse = 'ontouchstart' in document.documentElement === false;
    const startEventName = hasMouse ? 'mousedown' : 'touchstart';
    const moveEventName = hasMouse ? 'mousemove' : 'touchmove';
    const endEventName = hasMouse ? 'mouseup' : 'touchend';

    const onMove = (moveEvent) => {
      if (that.canHandleMove) {
        moveEvent.preventDefault();

        if (move) {
          move(that, moveEvent);
        }
      }
    };

    const onEnd = (endEvent) => {
      that.canHandleMove = undefined;

      if (end) {
        end(that, endEvent);
      }

      document.removeEventListener(moveEventName, onMove);
      document.removeEventListener(endEventName, onEnd);
    };

    const onStart = (startEvent) => {
      that.canHandleMove = true;

      if (start) {
        start(that, startEvent);
      }

      document.addEventListener(moveEventName, onMove);
      document.addEventListener(endEventName, onEnd);
    };

    this.element.addEventListener(startEventName, onStart);
  }

  return this;
};

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
