import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray<HTMLElement>('.ts-index-section');
  const mql = window.matchMedia('(min-width: 768px)');

  sections.forEach(section => {
    const slot = section.querySelector('.ts-index-section-slot');
    const mask = section.querySelector('.ts-index-section-mask');
    const title = section.querySelector('.ts-index-section-title');
    const separator = section.querySelector('.ts-index-section-separator');

    gsap
      .timeline({
        scrollTrigger: section,
        start: `${mql.matches ? 'top top' : 'top bottom'}`,
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
          duration: 0.3,
        }
      )
      .fromTo(
        [title, separator],
        {
          autoAlpha: 0,
          width: 0,
        },
        {
          autoAlpha: 1,
          width: '100%',
          duration: 0.3,
        }
      )
      .fromTo(
        slot,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.2,
        }
      );
  });
};

export default animation;
