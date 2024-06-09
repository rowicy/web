import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const items = gsap.utils.toArray<HTMLElement>('.ts-index-member-item');
  const mql = window.matchMedia('(min-width: 768px)');

  items.forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: `${mql.matches ? 'top 50%' : 'top bottom'}`,
      toggleClass: 'is-active',
    });
  });
};

export default animation;
