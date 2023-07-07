import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
// import * as random from 'maath/random/dist/maath-random.esm';
// import { _ as _classCallCheck } from './classCallCheck-9098b006.esm.js';
// import {
//   a as _defineProperty,
//   _ as _objectSpread2,
// } from 'maath/dist/objectSpread2-284232a6.esm.js';

const Stars = props => {
  const ref = useRef();

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
      }
    }

    return target;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  function normalizeSeed(seed) {
    if (typeof seed === 'number') {
      seed = Math.abs(seed);
    } else if (typeof seed === 'string') {
      var string = seed;
      seed = 0;

      for (var i = 0; i < string.length; i++) {
        seed = (seed + (i + 1) * (string.charCodeAt(i) % 96)) % 2147483647;
      }
    }

    if (seed === 0) {
      seed = 311;
    }

    return seed;
  }

  function lcgRandom(seed) {
    var state = normalizeSeed(seed);
    return function () {
      var result = (state * 48271) % 2147483647;
      state = result;
      return result / 2147483647;
    };
  }
  var Generator = function Generator(_seed) {
    var _this = this;

    _classCallCheck(this, Generator);

    _defineProperty(this, 'seed', 0);

    _defineProperty(this, 'init', function (seed) {
      _this.seed = seed;
      _this.value = lcgRandom(seed);
    });

    _defineProperty(this, 'value', lcgRandom(this.seed));

    this.init(_seed);
  };
  var defaultGen = new Generator(Math.random());
  var defaultSphere = {
    radius: 1,
    center: [0, 0, 0],
  };
  function inSphere(buffer, sphere) {
    var rng =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultGen;

    var _defaultSphere$sphere2 = _objectSpread2(
        _objectSpread2({}, defaultSphere),
        sphere
      ),
      radius = _defaultSphere$sphere2.radius,
      center = _defaultSphere$sphere2.center;

    for (var i = 0; i < buffer.length; i += 3) {
      var u = Math.pow(rng.value(), 1 / 3);
      var x = rng.value() * 2 - 1;
      var y = rng.value() * 2 - 1;
      var z = rng.value() * 2 - 1;
      var mag = Math.sqrt(x * x + y * y + z * z);
      x = (u * x) / mag;
      y = (u * y) / mag;
      z = (u * z) / mag;
      buffer[i] = x * radius + center[0];
      buffer[i + 1] = y * radius + center[1];
      buffer[i + 2] = z * radius + center[2];
    }

    return buffer;
  }
  const [sphere] = useState(() => inSphere(new Float32Array(5000), { radius: 1.2 }));

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  return (
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;
