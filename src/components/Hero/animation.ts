import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const mask = document.getElementById('hero-mask');

  gsap
    .timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=900',
        scrub: true,
        pin: true,
      },
    })
    .fromTo(
      title,
      {
        scale: 1,
        opacity: 1,
      },
      { scale: 4, opacity: 0, ease: 'Power4.out' }
    );

  gsap.timeline().fromTo(
    mask,
    {
      opacity: 0,
      height: 0,
    },
    {
      opacity: 1,
      height: '100%',
    }
  );
};

export default animation;
