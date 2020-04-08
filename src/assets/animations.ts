import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  animateChild,
  group,
  keyframes,
} from '@angular/animations';

//ROUTER ANIMATIONS
export const fader =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'scale(0) translateY(100%)',
        }),
      ]),
      query(':enter', [
        animate('600ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ])
    ]),
]);


// Positioned

export const slider =
  trigger('routeAnimations', [
    transition('* => isLeft', slideTo('left') ),
    transition('* => isRight', slideTo('right') ),
    transition('isRight => *', slideTo('left') ),
    transition('isLeft => *', slideTo('right') )
  ]);


export const transformer =
  trigger('routeAnimations', [
    transition('* => isLeft', translateTo({ x: -100, y: -100, rotate: -720 }) ),
    transition('* => isRight', translateTo({ x: 100, y: -100, rotate: 90 }) ),
    transition('isRight => *', translateTo({ x: -100, y: -100, rotate: 360 }) ),
    transition('isLeft => *', translateTo({ x: 100, y: -100, rotate: -360 }) )
]);




function slideTo(direction) {
  const optional = { optional: true };
  return [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        [direction]: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '-100%'})
    ]),
    group([
      query(':leave', [
        animate('600ms ease', style({ [direction]: '100%'}))
      ], optional),
      query(':enter', [
        animate('600ms ease', style({ [direction]: '0%'}))
      ])
    ]),
    // Normalize the page style... Might not be necessary

    // Required only if you have child animations on the page
    // query(':leave', animateChild()),
    // query(':enter', animateChild()),
  ];
}


function translateTo({x = 100, y = 0, rotate = 0}) {
  const optional = { optional: true };
  return [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ transform: `translate(${x}%, ${y}%) rotate(${rotate}deg)`})
    ]),
    group([
      query(':leave', [
        animate('600ms ease-out', style({ transform: `translate(${x}%, ${y}%) rotate(${rotate}deg)`}))
      ], optional),
      query(':enter', [
        animate('600ms ease-out', style({ transform: `translate(0, 0) rotate(0)`}))
      ])
    ]),
  ];
}


// Keyframes

export const stepper =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
        }),
      ]),
      group([
        query(':enter', [
          animate('2000ms ease', keyframes([
            style({ transform: 'scale(0) translateX(100%)', offset: 0 }),
            style({ transform: 'scale(0.5) translateX(25%)', offset: 0.3 }),
            style({ transform: 'scale(1) translateX(0%)', offset: 1 }),
          ])),
        ]),
        query(':leave', [
          animate('2000ms ease', keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(0.5) translateX(-25%) rotate(0)', offset: 0.35 }),
            style({ opacity: 0, transform: 'translateX(-50%) rotate(-180deg) scale(6)', offset: 1 }),
          ])),
        ])
      ]),
    ])

]);


//CARD ANIMATIONS

//Landing page cards
export const cardHover = 
    trigger('onHover', [

      state('stable', style({
        bottom : '0px',
        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',

      })),
      state('up', style({
        bottom : '15px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.8)',

      })),

      transition('stable => up',[
        animate('0.1s')
      ]),

      transition('up => stable',[
        animate('0.1s')
      ]),
    ]);



//Services page cards :


export const contentFadeIn = 
    trigger('onSlide',[
      state('transitionStart',style({

          opacity : '1.0',
          
      })),
      state('transitionEnd',style({

          opacity : '0',
      })),

      transition('transitionEnd <=> transitionStart',[
        animate('200ms ease-in-out')
      ]),


    ]);
export const logoFadeIn = 
    trigger('onSwipe',[
      state('transitionStart',style({
          transform : 'scale(1) translate3d(0, 0px,0)',
          filter: 'blur(0px)',

          

      })),
      state('transitionEnd',style({
          transform : 'scale(1.25)  translate3d(0, 20px,0px)',
          filter: 'blur(4px)',
          
      })),

      transition('transitionEnd <=> transitionStart',[
        animate('300ms  ease-in-out')
      ]),


    ]);



export const technologiesCardHover = 
    trigger('onHover', [


      //Large viewports cards states :

      state('stable', style({
        bottom : '0px',
        boxShadow: '0 4px 7px rgba(0,0,0,0.3)',

        opacity : '0.5',
        

      })),
      state('up', style({
        bottom : '15px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
        backgroundColor : 'midnightBlue',
        opacity : '1',
      })),

      //Mobile cards states :

      state('transitionStart', style({
        boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
        transform : 'scale(1)',
        opacity :'1',        

      })),
      state('transitionEnd', style({
        transform : 'scale(0.9)',
        opacity : '0.5',

      })),


      transition('stable => up',[
         query('@onSwipe', animateChild()),
        query('@onSlide', animateChild()),
        animate('400ms ease-in-out')
      ]),

      transition('up => stable',[
        query('@onSlide', animateChild()),
        query('@onSwipe', animateChild()),
        animate('450ms ease-in-out')
      ]),


      transition('transitionStart => transitionEnd',[
        query('@onSlide', animateChild()),
        query('@onSwipe', animateChild()),
        
        animate('450ms ease-in-out')
      ]),

      transition('transitionEnd => transitionStart',[
        query('@onSwipe', animateChild()),
        query('@onSlide', animateChild()),
        
        animate('400ms ease-in-out')
      ]),

      
    ]);



//LOOP ANIMATION :
export const floatingContainer = 
        trigger('floater',[
          state('inactive',style({
                boxShadow: '0px 0px 0px 0px rgba(0,0,0,0.3)',
                transform: 'scale(1) translate3d(0, 12px,0px)', 
                offset: 0.1
              
          })),
          state('active',style({
                boxShadow: '0px 5px 20px 0px rgba(0,0,0,0.8)',
                transform: 'scale(1.05) translate3d(0, 0px, 0)', 
                offset: 0.2

          })),

          state('end',style({


          })),


          transition('inactive => active', [
            animate('1000ms')
           ]),

          transition('active => inactive', [
            animate('1000ms')
           ]),

           transition('*=>end',[
            animate('0ms')
           ]),
        ]);

//CONTACT FORM ANIMATIONS

//ON HOVER OVER CARD
export const formCard = 
    trigger(('onEnter'),[
      state('landed', style({
        bottom : '0px',
        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',

      })),
      state('floating', style({
        bottom : '25px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.8)',

      })),

      transition('landed => floating',[
        animate('0.3s')
      ]),

      transition('floating => landed',[
        animate('0.2s')
      ]),
    ]);

//ON SUBMITTING FORM
export const shake = 
  trigger('shakeit', [
        state('shakestart', style({
            transform: 'scale(1)',
        })),
        state('shakeend', style({
            transform: 'scale(1)',
        })),
        
        state('submittedForm',
        style({
          opacity : '0.0',
          transform: 'scale(0.5)',
        })),
        transition('*=>submittedForm',[
          animate('400ms ease-in')

        ]),
        transition('submittedForm=>*',[
          animate('400ms ease-in')
        ]),
        transition('shakestart => shakeend', animate('1000ms ease-in',     
        keyframes([
          style({transform: 'translate3d(-1px, 0, 0)', offset: 0.1}),
          style({transform: 'translate3d(2px, 0, 0)', offset: 0.2}),
          style({transform: 'translate3d(-4px, 0, 0)', offset: 0.3}),
          style({transform: 'translate3d(4px, 0, 0)', offset: 0.4}),
          style({transform: 'translate3d(-4px, 0, 0)', offset: 0.5}),
          style({transform: 'translate3d(4px, 0, 0)', offset: 0.6}),
          style({transform: 'translate3d(-4px, 0, 0)', offset: 0.7}),
          style({transform: 'translate3d(2px, 0, 0)', offset: 0.8}),
          style({transform: 'translate3d(-1px, 0, 0)', offset: 0.9}),
        ]))),
  ]);



export const fadeIn = 
  trigger('fadeFormIn',[

    state('faded', style({
        opacity : '0.0',
        transform: 'scale(0.1)',

    })),
    state('fadeend',style({
        opacity : '1.0',
        transform: 'scale(1)',
       

    })),

    transition ('faded<=>fadeend',[animate ('600ms 1000ms ease-out')]),






  ]);


//Game HUD animations
export const gameScreen =
  trigger('ScaleScreen',[
    state('scaleDown',style({
      transform : 'scale(0.7)',
    })),
    state('scaleUp',style({

      transform : 'scale(1.0)',
    })),

    transition('scaleUp<=>scaleDown',[animate ('600ms ease-out')]),
    
  ]);

export const previewPanel = 
  trigger('HUDHide',[
    state('visible',style({
      opacity : '1.0',
      transform : 'scale(1.0)',
      display: 'inline'
    })),
    state('hidden',style({
      opacity : '0.0',
      transform : 'scale(0.0)',
      display: 'none'
    })),

    transition('visible<=>hidden',[animate ('200ms  ease-out')]),
  ]);

export const gameMenu = 
  trigger('HUDFadeIn',[
    state('fadeIn',style({
      opacity : '1.0',
      transform : 'scale(1)',
    })),
    state('fadeOut',style({
      opacity : '0.0',
      transform : 'scale(0)',
    })),

    transition('fadeIn<=>fadeOut',[animate ('600ms 200ms ease-out')]),
  ]);


//CAROUSEL ANIMATIONS :

export const carouselSlide = 
  trigger('simpleTranslation', [
      state('outright', style({ transform: `translateX(100%)` })),
      state('outleft', style({ transform: `translateX(-100%)` })),
      transition('*=>inright',[
        style({transform:`translateX(-100%)`}),
        animate('260ms ease-in',style({ transform: `translateX(0)` }))
      ]),
      transition('*=>inleft',[
        style({transform:`translateX(100%)`}),
        animate('260ms ease-in',style({ transform: `translateX(0)` }))
      ]),
      transition('*=>outleft', [
        animate('260ms ease-in', style({ transform: `translateX(-100%)` }))
      ]),
      transition('*=>outright', [
        animate('260ms ease-in',style({ transform: `translateX(100%)` }))
      ]),
  ]);


//TOP NAVBAR ANIMATIONS :
enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

//1 - OVERLAY ANIMATION
export const categorySlide = 
  trigger('messageAnimation', [

      state('visible', 
        style({

          opacity: 1.0,
          transform: 'translateX(0%)',
        }),
      ),

      state('hidden',   style({
        opacity: 0,
        transform: 'translateX(-100%)',
      })),

      transition('hidden => visible', animate('800ms 300ms ease')),
      transition('visible => hidden', animate('200ms ease-out'))
  ]);

//2.TOGGLE TOP BAR STATE
export const toggleBar =     
  trigger('toggle', [
        state(
          VisibilityState.Hidden,
          style({
            transform: 'translate(0, -100%)',
            filter: 'blur(4px)',


          })
        ),
        state(
          VisibilityState.Visible,
          style({
              transform: 'translate(0, 0)',
              filter: 'blur(0px)',


          })
        ),
        transition('visible <=> hidden', [
             query('@titleFade', animateChild()),
              animate('400ms 100ms ease-in-out'),
                       

        ]),


       

  ]);
    
//3. TOP BAR CATEGORIES ANIMATION:
export const topCategoryFade =
  trigger('titleFade',[
    state('visible',
        style({
        //opacity : 1.0,
      })
    ),state('hidden',
      style({
        //opacity : 0,
        
      })
    ),
    transition('* => *', animate('200ms  ease-in-out'))

  ]);