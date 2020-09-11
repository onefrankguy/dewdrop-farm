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
    const contextEventName = 'contextmenu';

    const onMove = (moveEvent) => {
      if (that.active) {
        moveEvent.preventDefault();

        if (move) {
          move(that, moveEvent);
        }
      }
    };

    const onContext = (contextEvent) => {
      if (that.active) {
        if (end) {
          end(that, contextEvent);
        }

        delete that.active;
      }
    };

    const onEnd = (endEvent) => {
      if (that.active) {
        endEvent.preventDefault();

        if (end) {
          end(that, endEvent);
        }

        delete that.active;
      }
    };

    const onStart = (startEvent) => {
      that.active = true;
      startEvent.preventDefault();

      if (start) {
        start(that, startEvent);
      }
    };

    this.element.addEventListener(startEventName, onStart);
    this.element.addEventListener(moveEventName, onMove);
    document.addEventListener(endEventName, onEnd);
    document.addEventListener(contextEventName, onContext);
  }

  return this;
};

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
