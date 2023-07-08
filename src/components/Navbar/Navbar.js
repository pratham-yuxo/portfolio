import { Icon } from 'components/Icon';
import { Monogram } from 'components/Monogram';
import { useTheme } from 'components/ThemeProvider';
import { tokens } from 'components/ThemeProvider/theme';
import { Transition } from 'components/Transition';
import { useAppContext, useScrollToHash, useWindowSize } from 'hooks';
import RouterLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { cssProps, media, msToNum, numToMs } from 'utils/style';
import { NavToggle } from './NavToggle';
import styles from './Navbar.module.css';
import { ThemeToggle } from './ThemeToggle';
import { navLinks, socialLinks } from './navData';

export const Navbar = () => {
  const [current, setCurrent] = useState();
  const [target, setTarget] = useState();
  const { themeId } = useTheme();
  const { menuOpen, dispatch } = useAppContext();
  const { route, asPath } = useRouter();
  const windowSize = useWindowSize();
  const headerRef = useRef();
  const isMobile = windowSize.width <= media.mobile || windowSize.height <= 696;
  const scrollToHash = useScrollToHash();

  useEffect(() => {
    // Prevent ssr mismatch by storing this in state
    setCurrent(asPath);
  }, [asPath]);

  // Handle smooth scroll nav items
  useEffect(() => {
    if (!target || route !== '/') return;
    setCurrent(`${route}${target}`);
    scrollToHash(target, () => setTarget(null));
  }, [route, scrollToHash, target]);

  // Handle swapping the theme when intersecting with inverse themed elements
  useEffect(() => {
    const navItems = document.querySelectorAll('[data-navbar-item]');
    const inverseTheme = themeId === 'dark' ? 'light' : 'dark';
    const { innerHeight } = window;

    let inverseMeasurements = [];
    let navItemMeasurements = [];

    const isOverlap = (rect1, rect2, scrollY) => {
      return !(rect1.bottom - scrollY < rect2.top || rect1.top - scrollY > rect2.bottom);
    };

    const resetNavTheme = () => {
      for (const measurement of navItemMeasurements) {
        measurement.element.dataset.theme = '';
      }
    };

    const handleInversion = () => {
      const invertedElements = document.querySelectorAll(
        `[data-theme='${inverseTheme}'][data-invert]`
      );

      if (!invertedElements) return;

      inverseMeasurements = Array.from(invertedElements).map(item => ({
        element: item,
        top: item.offsetTop,
        bottom: item.offsetTop + item.offsetHeight,
      }));

      const { scrollY } = window;

      resetNavTheme();

      for (const inverseMeasurement of inverseMeasurements) {
        if (
          inverseMeasurement.top - scrollY > innerHeight ||
          inverseMeasurement.bottom - scrollY < 0
        ) {
          continue;
        }

        for (const measurement of navItemMeasurements) {
          if (isOverlap(inverseMeasurement, measurement, scrollY)) {
            measurement.element.dataset.theme = inverseTheme;
          } else {
            measurement.element.dataset.theme = '';
          }
        }
      }
    };

    // Currently only the light theme has dark full-width elements
    if (themeId === 'light') {
      navItemMeasurements = Array.from(navItems).map(item => {
        const rect = item.getBoundingClientRect();

        return {
          element: item,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      document.addEventListener('scroll', handleInversion);
      handleInversion();
    }

    return () => {
      document.removeEventListener('scroll', handleInversion);
      resetNavTheme();
    };
  }, [themeId, windowSize, asPath]);

  // Check if a nav item should be active
  const getCurrent = (url = '') => {
    const nonTrailing = current?.endsWith('/') ? current?.slice(0, -1) : current;

    if (url === nonTrailing) {
      return 'page';
    }

    return '';
  };

  // Store the current hash to scroll to
  const handleNavItemClick = event => {
    const hash = event.currentTarget.href.split('#')[1];
    setTarget(null);

    if (hash && route === '/') {
      setTarget(`#${hash}`);
      event.preventDefault();
    }
  };

  const handleMobileNavClick = event => {
    handleNavItemClick(event);
    if (menuOpen) dispatch({ type: 'toggleMenu' });
  };

  return (
    <header className={styles.navbar} ref={headerRef}>
      <RouterLink href={route === '/' ? '/#intro' : '/'} scroll={false}>
        <a
          data-navbar-item
          className={styles.logo}
          aria-label="Hamish Williams, Designer"
          onClick={handleMobileNavClick}
        >
          <img
            className={styles.logoP}
            src="/logo.png"
            alt=""
            style={{
              width: '60px',
              height: '45px',
              filter: `${themeId == 'dark' ? 'invert(1)' : 'invert(0)'} `,
            }}
          />
          {/* <Monogram highlight /> */}
        </a>
      </RouterLink>
      <NavToggle onClick={() => dispatch({ type: 'toggleMenu' })} menuOpen={menuOpen} />
      <nav className={`${styles.nav} he`}>
        <div className={styles.navList}>
          {navLinks.map(({ label, pathname }) => (
            <RouterLink href={pathname} scroll={false} key={label}>
              <a
                data-navbar-item
                className={styles.navLink}
                aria-current={getCurrent(pathname)}
                onClick={handleNavItemClick}
              >
                {label}
              </a>
            </RouterLink>
          ))}
        </div>
        <NavbarIcons desktop />
      </nav>
      <Transition unmount in={menuOpen} timeout={msToNum(tokens.base.durationL)}>
        {visible => (
          <nav className={styles.mobileNav} data-visible={visible}>
            {navLinks.map(({ label, pathname }, index) => (
              <RouterLink href={pathname} scroll={false} key={label}>
                <a
                  className={styles.mobileNavLink}
                  data-visible={visible}
                  aria-current={getCurrent(pathname)}
                  onClick={handleMobileNavClick}
                  style={cssProps({
                    transitionDelay: numToMs(
                      Number(msToNum(tokens.base.durationS)) + index * 50
                    ),
                  })}
                >
                  {label}
                </a>
              </RouterLink>
            ))}
            <NavbarIcons />
            <ThemeToggle isMobile />
          </nav>
        )}
      </Transition>
      {!isMobile && <ThemeToggle data-navbar-item />}
    </header>
  );
};

const NavbarIcons = ({ desktop }) => (
  <div className={styles.navIcons}>
    {socialLinks.map(({ label, url, icon }) => (
      <a
        key={label}
        data-navbar-item={desktop || undefined}
        className={styles.navIconLink}
        aria-label={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon className={styles.navIcon} icon={icon} />
      </a>
    ))}
  </div>
);

{
  /* <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="524.000000pt" height="476.000000pt" viewBox="0 0 524.000000 476.000000" preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.16, written by Peter Selinger 2001-2019
</metadata>
<g transform="translate(0.000000,476.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
<path d="M2364 4381 c-58 -15 -143 -92 -166 -150 -13 -32 -59 -204 -55 -206 1 -2 137 -4 302 -6 l300 -4 3 84 c2 51 -2 97 -9 115 -19 47 -66 103 -116 138 -42 28 -54 31 -137 34 -50 2 -105 0 -122 -5z"/>
<path d="M1865 3900 c-104 -8 -172 -14 -360 -36 -46 -5 -258 -37 -354 -54 -397 -68 -901 -261 -1054 -403 -40 -38 -33 -43 23 -19 116 49 247 97 346 126 122 36 348 91 419 101 22 4 47 8 55 10 8 3 32 7 54 11 21 3 48 8 60 10 79 16 364 45 541 55 223 12 603 7 830 -11 229 -19 553 -68 695 -105 14 -3 36 -8 50 -11 14 -3 50 -12 80 -20 30 -9 62 -17 70 -19 35 -7 223 -71 313 -106 277 -110 478 -250 560 -390 31 -53 67 -152 67 -185 0 -39 -46 -160 -81 -210 -96 -140 -298 -273 -574 -380 -55 -21 -109 -44 -120 -51 -18 -12 -17 -13 15 -8 263 44 574 141 784 246 317 158 475 325 501 528 5 42 -19 151 -45 202 -95 185 -387 376 -764 501 -118 38 -273 82 -331 92 -16 3 -41 8 -55 11 -72 15 -188 37 -210 40 -14 2 -68 11 -120 19 -270 44 -478 58 -880 61 -217 2 -449 0 -515 -5z"/>
<path d="M2016 3609 c-2 -8 -16 -59 -31 -114 -15 -55 -35 -127 -46 -160 -10 -33 -47 -166 -84 -295 -36 -129 -72 -257 -80 -285 -17 -60 -160 -567 -211 -750 -20 -71 -42 -150 -49 -175 -7 -25 -20 -72 -30 -105 -9 -33 -21 -71 -26 -85 -4 -14 -10 -36 -13 -50 -2 -14 -9 -37 -15 -52 -6 -16 -8 -28 -5 -28 2 0 0 -8 -5 -18 -6 -11 -12 -30 -15 -43 -3 -13 -21 -80 -41 -149 -19 -69 -43 -152 -52 -185 -9 -33 -24 -87 -35 -120 -10 -33 -20 -69 -23 -80 -2 -11 -8 -35 -14 -53 -16 -53 -9 -211 12 -249 21 -39 91 -108 132 -131 45 -25 219 -23 260 3 43 27 114 96 130 126 11 20 51 151 71 229 2 8 12 47 23 85 11 39 32 111 46 160 14 50 34 122 45 160 10 39 26 91 34 118 8 26 15 48 14 50 0 1 9 34 21 74 12 40 30 105 41 145 10 40 52 190 93 333 120 416 293 1030 327 1155 34 128 56 204 94 330 29 94 32 129 14 135 -26 8 -239 25 -405 31 -143 6 -173 5 -177 -7z"/>
<path d="M4025 2686 c-54 -30 -253 -112 -294 -122 -9 -2 -72 -20 -141 -40 -69 -20 -135 -38 -147 -40 -12 -2 -35 -9 -50 -15 -16 -6 -29 -10 -31 -9 -1 1 -15 -1 -30 -4 -15 -3 -38 -7 -52 -10 -14 -2 -36 -7 -50 -10 -160 -37 -482 -75 -781 -91 l-116 -7 -22 -74 c-12 -41 -19 -79 -16 -85 9 -13 292 3 455 26 29 4 245 44 275 50 11 3 63 14 114 24 52 11 102 23 110 27 9 3 27 8 41 11 45 8 273 85 360 120 171 71 340 162 433 235 71 56 36 65 -58 14z"/>
</g>
</svg> */
}
