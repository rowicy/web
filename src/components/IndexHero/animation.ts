import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const animation = () => {
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const mask = document.getElementById('hero-mask');
  const social = document.getElementById('hero-social');

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
      { scale: 12, opacity: 0, ease: 'Power4.out' }
    );

  gsap
    .timeline()
    .fromTo(
      mask,
      {
        autoAlpha: 0,
        height: 0,
      },
      {
        autoAlpha: 1,
        height: '100%',
      }
    )
    .fromTo(
      [title, social],
      {
        autoAlpha: 0,
        translateY: 10,
      },
      {
        autoAlpha: 1,
        translateY: 0,
      }
    );
};

export default animation;
