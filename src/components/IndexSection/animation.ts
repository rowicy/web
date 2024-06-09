import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray<HTMLElement>('.ts-index-section');

  sections.forEach(section => {
    const height = section.offsetHeight;
    const slot = section.querySelector('.ts-index-section-slot');
    const mask = section.querySelector('.ts-index-section-mask');
    const title = section.querySelector('.ts-index-section-title');
    const separator = section.querySelector('.ts-index-section-separator');
    const appName = section.querySelector('.ts-index-section-app-name');

    gsap
      .timeline({
        scrollTrigger: section,
        start: 'top top',
      })
      .fromTo(
        mask,
        {
          autoAlpha: 0,
          width: 0,
        },
        {
          autoAlpha: 1,
          width: '100%',
        }
      )
      .fromTo(
        title,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
        }
      )
      .fromTo(
        separator,
        {
          width: 0,
        },
        {
          width: '100%',
        },
        '<'
      )
      .fromTo(
        slot,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
        }
      );

    gsap.to(appName, {
      ease: 'none',
      opacity: opacity => {
        if (opacity >= 5) {
          return 1;
        } else {
          return Math.ceil(opacity) + 1;
        }
      },
      scrollTrigger: {
        trigger: section,
        scrub: 1,
        start: 'top top',
        end: `+=${height}`,
      },
    });
  });
};

export default animation;
