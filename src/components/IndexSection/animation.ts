import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray<HTMLElement>('.ts-index-section');

  sections.forEach(section => {
    const slot = section.querySelector('.ts-index-section-slot');
    const mask = section.querySelector('.ts-index-section-mask');
    const title = section.querySelector('.ts-index-section-title');
    const separator = section.querySelector('.ts-index-section-separator');

    gsap
      .timeline({
        scrollTrigger: section,
        start: 'top center',
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
  });
};

export default animation;
