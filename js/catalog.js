/* F.T.T.U Footwear — shared catalog.
   Single source of truth for the showroom (index.html) and the guide (guide.html).
   Images live in the public Supabase bucket "fttu-footwear". To add a design:
   upload the image to the bucket, then add one line below. Both pages pick it up. */
(function (global) {
  var BASE = 'https://mlgmigguhljsiopctkkj.supabase.co/storage/v1/object/public/fttu-footwear/';

  var CATEGORIES = [
    { key: 'sneakers',     label: 'Sneakers',     one: 'Sneaker',          code: 'SNK' },
    { key: 'boots',        label: 'Boots',        one: 'Boot',             code: 'BOT' },
    { key: 'sandals',      label: 'Sandals',      one: 'Sandal',           code: 'SDL' },
    { key: 'flip-flops',   label: 'Flip-flops',   one: 'Flip-flop',        code: 'FLP' },
    { key: 'high-heels',   label: 'High heels',   one: 'Heel',             code: 'HHL' },
    { key: 'hiking-boots', label: 'Hiking boots', one: 'Hiking Boot',      code: 'HIK' },
    { key: 'kids',         label: 'Kids',         one: 'Kids\u2019 Sneaker', code: 'KID' },
    { key: 'baby-shoes',   label: 'Baby shoes',   one: 'Baby Shoe',        code: 'BBY' },
    { key: 'snowboard',    label: 'Snowboard',    one: 'Snowboard',        code: 'SNB' },
    { key: 'skis',         label: 'Skis',         one: 'Skis',             code: 'SKI' },
    { key: 'apparel',      label: 'Apparel',      one: 'Track Jacket',     code: 'APP' }
  ];

  // colorway: core | spring | summer | fall | winter | ice-blue
  var D = [
    ['sneakers','core','sneakers/sneaker-og.jpg','Knit low-top that fades from seafoam at the collar to deep teal at the toe, with a navy heel panel, navy toe cap and a chunky seafoam sole.'],
    ['sneakers','spring','sneakers/sneaker-spring.jpg','Pastel gradient knit — peach and blush up top, a buttercup-yellow heel, lilac sole.'],
    ['sneakers','summer','sneakers/sneaker-summer.jpg','Coral-orange knit on a sunflower-yellow sole, shot in warm sunset light.'],
    ['sneakers','fall','sneakers/sneaker-fall.jpg','Rust knit with an olive heel panel and a dark cocoa toe cap and sole, among autumn leaves.'],
    ['sneakers','winter','sneakers/sneaker-winter.jpg','Ice-blue knit with a navy heel panel and toe cap on a white sole.'],

    ['boots','core','boots/boot-og.jpg','High-top sneaker boot in seafoam-to-teal knit with a padded collar, navy heel counter and lugged sole.'],
    ['boots','spring','boots/boot-spring.jpg','Blush-pink and cream high-top with a sky-blue heel panel.'],
    ['boots','summer','boots/boot-summer.jpg','Butter-yellow high-top with a peach toe cap on a white sole.'],
    ['boots','fall','boots/boot-fall.jpg','Olive knit high-top with a burnt-orange padded collar and a rust lugged sole.'],
    ['boots','winter','boots/boot-winter.jpg','Navy knit high-top with a slate collar, dusted with snow.'],

    ['sandals','core','sandals/sandal-og.jpg','Crossover-strap sandal in deep teal with the shield emblem, on a two-tone seafoam footbed.'],
    ['sandals','spring','sandals/sandal-spring.jpg','Lilac crossover straps on a mint footbed.'],
    ['sandals','summer','sandals/sandal-summer.jpg','Sunflower-yellow crossover straps on a cream footbed.'],
    ['sandals','fall','sandals/sandal-fall.jpg','Rust crossover straps with a dark shield panel on a cream footbed.'],
    ['sandals','winter','sandals/sandal-winter.jpg','Navy crossover straps on a pale footbed, set in snow.'],
    ['sandals','ice-blue','sandals/sandal-ice-blue.jpg','Pale ice-blue straps on a white footbed — a bonus colorway outside the four seasons.'],

    ['flip-flops','core','flip-flops/ff-og.jpg','Teal thong strap with the shield emblem on a thick seafoam footbed.'],
    ['flip-flops','spring','flip-flops/ff-spring.jpg','Coral strap on a cream footbed, framed by spring flowers.'],
    ['flip-flops','summer','flip-flops/ff-summer.jpg','Sunshine-yellow strap on a sand-colored footbed.'],
    ['flip-flops','fall','flip-flops/ff-fall.jpg','Olive strap on a cream footbed with a rust midsole stripe.'],
    ['flip-flops','winter','flip-flops/ff-winter.jpg','Navy strap on a charcoal sole in a snowy scene.'],

    ['high-heels','core','high-heels/hh-og.jpg','Pointed pump fading seafoam to teal, with a navy heel panel and a white stiletto.'],
    ['high-heels','spring','high-heels/hh-spring.jpg','Coral-to-cream pump on a pale stiletto.'],
    ['high-heels','summer','high-heels/hh-summer.jpg','Sunflower-yellow pump with a coral heel panel and coral stiletto.'],
    ['high-heels','fall','high-heels/hh-fall.jpg','Rust and mustard pump among fallen leaves.'],
    ['high-heels','winter','high-heels/hh-winter.jpg','Midnight-navy pump on a silver stiletto.'],

    ['hiking-boots','core','hiking-boots/hiking-boot-og.jpg','Teal knit hiker with a navy toe cap, speed laces and a lugged seafoam sole.'],
    ['kids','core','kids/kid-og.jpg','Kids\u2019 sneaker covered in a bright star print, with a red heel, a yellow toe and toggle laces on a mint sole.'],
    ['baby-shoes','core','baby-shoes/baby-og.jpg','Soft first-walker in seafoam and teal with one hook-and-loop strap and a flexible mint sole.'],
    ['snowboard','core','snowboard/snowboard-og.jpg','Seafoam-to-teal board with the round emblem centered on the topsheet.'],
    ['skis','core','skis/skis-og.jpg','Pair of seafoam skis with navy tips and the round emblem near each tip.'],
    ['apparel','core','future/future-og.jpg','Zip-up track jacket fading seafoam to teal with an F.T.T.U. chest patch — the first piece of the planned clothing line.']
  ];

  var COLORWAY_LABEL = { core: 'Core', spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter', 'ice-blue': 'Ice blue' };
  var SEASONS = ['spring', 'summer', 'fall', 'winter'];

  var catByKey = {};
  CATEGORIES.forEach(function (c) { catByKey[c.key] = c; });

  var DESIGNS = D.map(function (r) {
    var cat = catByKey[r[0]];
    var cw = r[1];
    var shortCw = cw === 'ice-blue' ? 'ICE' : cw.toUpperCase();
    return {
      id: cat.code + '-' + shortCw,
      category: cat.key,
      categoryLabel: cat.label,
      one: cat.one,
      colorway: cw,
      colorwayLabel: COLORWAY_LABEL[cw],
      season: SEASONS.indexOf(cw) > -1 ? cw : null,
      name: 'F.T.T.U ' + cat.one + ' \u2014 ' + COLORWAY_LABEL[cw],
      description: r[3],
      image: BASE + r[2],
      path: r[2]
    };
  });

  /* Real photos with the concept jacket digitally added. Guide only. */
  var MOCKUPS = [
    { path: 'future/solo-guy-1.jpg',   alt: 'Man in sunglasses wearing the concept jacket outdoors' , w: 896, h: 1193 },
    { path: 'future/couple-2.jpg',     alt: 'Couple taking a selfie, both wearing the concept jacket' , w: 896, h: 1193 },
    { path: 'future/father-son.jpg',   alt: 'Father and son side by side in the concept jacket' , w: 1041, h: 1008 },
    { path: 'future/parents.jpg',      alt: 'Older couple at a family gathering in the concept jacket' , w: 1195, h: 896 },
    { path: 'future/couple-1.jpg',     alt: 'Couple smiling at home in the concept jacket' , w: 895, h: 1200 },
    { path: 'future/couple-3.jpg',     alt: 'Couple in front of a holiday tree wearing the concept jacket' , w: 1024, h: 1024 },
    { path: 'future/couple-4.jpg',     alt: 'Couple outdoors in the concept jacket' , w: 896, h: 1200 },
    { path: 'future/bodybuilder-1.jpg', alt: 'Athlete flexing in a locker room wearing the concept jacket' , w: 896, h: 1200 }
  ].map(function (m) { m.image = BASE + m.path; return m; });

  /* The shield emblem (concept render). */
  var EMBLEM = { path: 'emblem.jpg', image: BASE + 'emblem.jpg', w: 1264, h: 847, title: 'The F.T.U. shield', caption: 'The footwear emblem \u00b7 concept render',
    story: 'The footwear emblem is a silver shield that reads F.T.U. \u2014 one bold T stands for both T\u2019s in From Them To Us. Under it: Est. 2026, and M W for men and women. Around the bottom edge: From Them\u2026 To Us\u2026 The footwear carries this shield; the clothing line will use its own F.T.T.U. lettering.' };

  /* Every image, in one ordered list — the lookbook carousel shows all of them. */
  function lookbook() {
    var out = [{ src: EMBLEM.image, w: EMBLEM.w, h: EMBLEM.h, title: EMBLEM.title, caption: EMBLEM.caption, group: 'brand', alt: 'Silver F.T.U. shield emblem reading Est. 2026, M W, From Them To Us, concept render' }];
    CATEGORIES.forEach(function (c) {
      DESIGNS.forEach(function (d) {
        if (d.category === c.key) out.push({ src: d.image, w: 1264, h: 848, title: d.name, caption: c.label + ' \u00b7 ' + d.colorwayLabel + ' colorway \u00b7 concept render', group: c.key, id: d.id, alt: d.name + ', concept render' });
      });
    });
    MOCKUPS.forEach(function (m) {
      out.push({ src: m.image, w: m.w, h: m.h, title: 'F.T.T.U Track Jacket, worn', caption: 'Concept mockup \u00b7 jacket added to a real photo', group: 'mockups', alt: m.alt + ' (concept mockup)' });
    });
    return out;
  }

  /* Meteorological seasons (Northern Hemisphere): full calendar months,
     so the site switches cleanly on the 1st. */
  function seasonFor(date) {
    var m = (date || new Date()).getMonth();
    if (m === 11 || m <= 1) return 'winter';
    if (m <= 4) return 'spring';
    if (m <= 7) return 'summer';
    return 'fall';
  }
  var SEASON_INFO = {
    winter: { label: 'Winter', months: 'December \u2013 February', start: 'Dec 1', end: 'Feb 28/29', astro: 'Dec 21, 2026' },
    spring: { label: 'Spring', months: 'March \u2013 May',          start: 'Mar 1', end: 'May 31',   astro: 'Mar 20, 2026' },
    summer: { label: 'Summer', months: 'June \u2013 August',        start: 'Jun 1', end: 'Aug 31',   astro: 'Jun 20, 2026' },
    fall:   { label: 'Fall',   months: 'September \u2013 November', start: 'Sep 1', end: 'Nov 30',   astro: 'Sep 22, 2026' }
  };

  global.FTTU = {
    BASE: BASE,
    CATEGORIES: CATEGORIES,
    DESIGNS: DESIGNS,
    MOCKUPS: MOCKUPS,
    EMBLEM: EMBLEM,
    lookbook: lookbook,
    COLORWAY_LABEL: COLORWAY_LABEL,
    SEASON_INFO: SEASON_INFO,
    seasonFor: seasonFor,
    byId: function (id) {
      var k = String(id || '').trim().toUpperCase();
      for (var i = 0; i < DESIGNS.length; i++) if (DESIGNS[i].id === k) return DESIGNS[i];
      return null;
    },
    inCategory: function (key) { return DESIGNS.filter(function (d) { return d.category === key; }); },
    /* the colorway to lead with for a category right now */
    leadFor: function (key, season) {
      var list = DESIGNS.filter(function (d) { return d.category === key; });
      for (var i = 0; i < list.length; i++) if (list[i].colorway === season) return list[i];
      for (var j = 0; j < list.length; j++) if (list[j].colorway === 'core') return list[j];
      return list[0];
    }
  };
})(window);
