import { Z_UNKNOWN } from 'zlib';



export class InputManager {
  canvas;
  keys = {};
  constructor() {
    this.canvas = document.querySelector('#c');

    const keyMap = new Map();
    const setKey = (keyName, pressed) => {
      const keyState = this.keys[keyName];
      keyState.justPressed = pressed && !keyState.down
      keyState.down = pressed;

    };

    const addKey = (keyCode, name) => {
      this.keys[name] = { down: false, justPressed: false };
      keyMap.set(keyCode, name)

    }

    const setKeyFromKeyCode = (keyCode, pressed) => {
      const keyName = keyMap.get(keyCode);
      if (!keyName) {
        return;
      }
      setKey(keyName, pressed);
    };

    addKey(37, 'left');
    addKey(39, 'right');
    addKey(38, 'up');
    addKey(40, 'down');
    addKey(90, 'a');
    addKey(88, 'b');

    window.addEventListener('keydown', (e) => {
      setKeyFromKeyCode(e.keyCode, true);
    });

    window.addEventListener('keyup', (e) => {
      setKeyFromKeyCode(e.keyCode, false);
    });

    const sides = [
      { elem: document.querySelector('#left'), key: 'left' },
      { elem: document.querySelector('#right'), key: 'right' },
    ];

    const clearKeys = () => {
      for (const { key } of sides) {
        setKey(key, false);
      }
    };

    const checkSides = (e) => {
      for (const { elem, key } of sides) {
        let pressed = false;
        const rect = elem.getBoundingClientRect();
        for (const touch of e.touches) {
          const x = touch.clientX;
          const y = touch.clientY;
          const inRect = x >= rect.left && x < rect.right &&
            y >= rect.top && y < rect.bottom;
          if (inRect) {
            pressed = true;
          }
        }
        setKey(key, pressed);
      }
    };

    const uiElem = document.querySelector('#controls');
    uiElem.addEventListener('touchstart', (e) => {
      e.preventDefault();
      checkSides(e);
    }, { passive: false });
    uiElem.addEventListener('touchmove', (e) => {
      e.preventDefault();  // prevent scroll
      checkSides(e);
    }, { passive: false });
    uiElem.addEventListener('touchend', () => {
      clearKeys();
    });

    function handleMouseMove(e) {
      e.preventDefault();
      checkSides({
        touches: [e],
      });
    }

    function handleMouseUp() {
      clearKeys();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    uiElem.addEventListener('mousedown', (e) => {
      // this is needed because we call preventDefault();
      // we also gave the canvas a tabindex so it can
      // become the focus
      this.canvas.focus();
      handleMouseMove(e);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }, { passive: false });

  }

  update() {

   

  }



}