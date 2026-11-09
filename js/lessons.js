/* معمل الرسم الفني — العمليات الهندسية (تمارين موجّهة بخطوات الكتاب وتصحيح فوري)
   Designed & Developed by Mohamed-Eldawly */
(function () {
  'use strict';
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function segD(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)); return dist(p, [a[0] + dx * t, a[1] + dy * t]); }
  function angIn(a, a0, sw) { if (Math.abs(sw) >= 2 * Math.PI - 0.05) return true; var d = a - a0; if (sw >= 0) { d = ((d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return d <= sw + 0.03; } d = ((-d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return d <= -sw + 0.03; }
  function fx(n) { return Math.round(n * 10) / 10; }
  function arcD(cx, cy, r, a0, sw) {
    if (Math.abs(sw) >= 2 * Math.PI - 0.02) return 'M' + fx(cx + r) + ' ' + fx(cy) + 'A' + fx(r) + ' ' + fx(r) + ' 0 1 1 ' + fx(cx - r) + ' ' + fx(cy) + 'A' + fx(r) + ' ' + fx(r) + ' 0 1 1 ' + fx(cx + r) + ' ' + fx(cy);
    var a1 = a0 + sw; return 'M' + fx(cx + r * Math.cos(a0)) + ' ' + fx(cy + r * Math.sin(a0)) + 'A' + fx(r) + ' ' + fx(r) + ' 0 ' + (Math.abs(sw) > Math.PI ? 1 : 0) + ' ' + (sw > 0 ? 1 : 0) + ' ' + fx(cx + r * Math.cos(a1)) + ' ' + fx(cy + r * Math.sin(a1));
  }

  /* ---- lesson definitions (all sizes in mm, A4 landscape worksheet) ---- */
  function defs() {
    var D = [];
    function add(group, short, title, given, build) { D.push({ group: group, short: short, title: title, given: given, build: build }); }
    // helpers are bound per build call: T = { P(x,y), pol(c,r,deg), axes(c), circle(c,r), ... }
    add('أولًا: التنصيف والأعمدة', 'تنصيف قطعة مستقيمة', 'تنصيف قطعة مستقيمة معلومة', 'المعطى: القطعة المستقيمة أ ب طولها 60 مم. المطلوب رسم العمود المنصّف لها.', function (T) {
      var A = T.P(120, 112), B = T.P(180, 112), h = Math.sqrt(40 * 40 - 30 * 30), U = T.P(150, 112 - h), Dn = T.P(150, 112 + h);
      return { given: { segs: [[A, B]], pts: [[A, 'أ', -8, 26], [B, 'ب', -8, 26]] }, steps: [
        { title: 'ارسم قوسين من أ', text: 'افتح الفرجار 40 مم (أكبر من نصف أ ب)، ضع السن في أ وارسم قوسًا فوق القطعة وقوسًا تحتها.', req: [{ t: 'arc', c: A, r: 40, at: [U, Dn] }] },
        { title: 'ارسم قوسين من ب', text: 'بنفس الفتحة ضع السن في ب وارسم قوسين يقطعان القوسين السابقين في نقطتين.', req: [{ t: 'arc', c: B, r: 40, at: [U, Dn] }] },
        { title: 'ارسم العمود المنصّف', text: 'صِل نقطتي التقاطع بالمسطرة؛ هذا الخط عمودي على أ ب ويقسمها نصفين متساويين (30 مم لكل نصف).', req: [{ t: 'line', a: U, b: Dn, ext: 10 }] }] };
    });
    add('أولًا: التنصيف والأعمدة', 'عمود من نقطة على مستقيم', 'رسم خط عمودي على قطعة مستقيمة من نقطة عليها', 'المعطى: المستقيم أ ب والنقطة ن عليه. المطلوب إقامة عمود على أ ب من النقطة ن.', function (T) {
      var A = T.P(90, 130), B = T.P(210, 130), N = T.P(150, 130), C = T.P(125, 130), Dd = T.P(175, 130), Q = T.P(150, 130 - Math.sqrt(40 * 40 - 25 * 25));
      return { given: { segs: [[A, B]], pts: [[A, 'أ', -8, 26], [B, 'ب', -8, 26], [N, 'ن', -6, 26]] }, steps: [
        { title: 'حدّد نقطتين على جانبي ن', text: 'افتح الفرجار 25 مم، ضع السن في ن وارسم قوسين يقطعان المستقيم في ج و د.', req: [{ t: 'arc', c: N, r: 25, at: [C, Dd] }] },
        { title: 'ارسم قوسين متقاطعين', text: 'افتح الفرجار 40 مم، ومن ج ثم من د ارسم قوسين يتقاطعان فوق المستقيم في هـ.', req: [{ t: 'arc', c: C, r: 40, at: [Q] }, { t: 'arc', c: Dd, r: 40, at: [Q] }] },
        { title: 'ارسم العمود', text: 'صِل ن بـ هـ بالمسطرة فتحصل على العمود المطلوب (زاوية 90°).', req: [{ t: 'line', a: N, b: Q, ext: 10 }] }] };
    });
    function bisect(T, deg, O) {
      var A = T.pol(O, 40, 0), B = T.pol(O, 40, deg), r2 = 35, c = Math.cos(deg / 2 * Math.PI / 180), b = 2 * 40 * c, t = (b + Math.sqrt(b * b - 4 * (1600 - r2 * r2))) / 2, Pp = T.pol(O, t, deg / 2);
      return { given: { segs: [[O, T.pol(O, 95, 0)], [O, T.pol(O, 95, deg)]], pts: [[O, 'و', -22, 18]] }, steps: [
        { title: 'ارسم قوسًا من رأس الزاوية', text: 'افتح الفرجار 40 مم، ضع السن في رأس الزاوية و وارسم قوسًا يقطع الضلعين في أ و ب.', req: [{ t: 'arc', c: O, r: 40, at: [A, B] }] },
        { title: 'ارسم قوسين متقاطعين', text: 'افتح الفرجار 35 مم، ومن أ ثم من ب ارسم قوسين يتقاطعان داخل الزاوية في ج.', req: [{ t: 'arc', c: A, r: 35, at: [Pp] }, { t: 'arc', c: B, r: 35, at: [Pp] }] },
        { title: 'ارسم منصّف الزاوية', text: 'صِل الرأس و بالنقطة ج؛ فينقسم الزاوية إلى زاويتين متساويتين قيمة كل منهما ' + (deg / 2) + '°.', req: [{ t: 'line', a: O, b: Pp, ext: 18 }] }] };
    }
    add('أولًا: التنصيف والأعمدة', 'تنصيف زاوية حادة', 'تنصيف زاوية حادة (50°)', 'المعطى: زاوية حادة قيمتها 50° رأسها و. المطلوب تنصيفها بالفرجار والمسطرة.', function (T) { return bisect(T, 50, T.P(100, 155)); });
    add('أولًا: التنصيف والأعمدة', 'تنصيف زاوية قائمة', 'تنصيف زاوية قائمة (90°)', 'المعطى: زاوية قائمة رأسها و. المطلوب تنصيفها للحصول على زاويتين 45°.', function (T) { return bisect(T, 90, T.P(110, 165)); });

    function poly(T, n, start, R) { var V = [], C = T.C; for (var k = 0; k < n; k++) V.push(T.pol(C, R || 40, start + 360 / n * k)); return V; }
    var givenC = function (T) { return { pts: [[T.C, 'م', -24, -10]] }; };
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'مثلث متساوي الأضلاع', 'رسم مثلث متساوي الأضلاع داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المطلوب رسم مثلث متساوي الأضلاع داخلها.', function (T) {
      var D = T.pol(T.C, 40, -90), V = [T.pol(T.C, 40, 90), T.pol(T.C, 40, -30), T.pol(T.C, 40, 210)];
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'حدّد رأسي القاعدة', text: 'بنفس الفتحة (40 مم) ضع السن في نقطة تقاطع المحور الرأسي مع الدائرة من أسفل، وارسم قوسًا يقطع الدائرة في نقطتين.', req: [{ t: 'arc', c: D, r: 40, at: [V[1], V[2]] }] },
        { title: 'صِل الرؤوس', text: 'صِل النقطتين بالنقطة العليا للمحور الرأسي بالخط الظاهر، فتحصل على المثلث متساوي الأضلاع (كل زاوية 60°).', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'مربع', 'رسم مربع داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المطلوب رسم مربع داخلها.', function (T) {
      var V = poly(T, 4, 0);
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'صِل نقاط التقاطع', text: 'المحوران يقطعان الدائرة في أربع نقاط؛ صِلها بالترتيب بالخط الظاهر فينتج المربع (أقطاره هي المحاور).', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'خماسي منتظم', 'رسم شكل خماسي منتظم داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المطلوب رسم شكل خماسي منتظم داخلها.', function (T) {
      var M = T.pol(T.C, 20, 0), N = T.pol(T.C, Math.sqrt(20 * 20 + 40 * 40) - 20, 180), s = 2 * 40 * Math.sin(Math.PI / 5), V = poly(T, 5, 90);
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'حدّد طول الضلع', text: 'حدّد هـ منتصف نصف القطر الأفقي الأيمن (20 مم من م). ضع السن في هـ وافتح الفرجار حتى النقطة العليا للدائرة، وارسم قوسًا يقطع المحور الأفقي في ن.', req: [{ t: 'arc', c: M, r: Math.sqrt(20 * 20 + 40 * 40), at: [N] }] },
        { title: 'قسّم الدائرة', text: 'المسافة من النقطة العليا إلى ن هي طول الضلع (' + fx(s) + ' مم). افتح الفرجار بها وابدأ من النقطة العليا وحدّد الرؤوس الخمسة على الدائرة.', req: [{ t: 'step', pts: V, r: s }] },
        { title: 'صِل الرؤوس', text: 'صِل الرؤوس الخمسة بالترتيب بالخط الظاهر.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'سداسي منتظم', 'رسم شكل سداسي منتظم داخل دائرة', 'المعطى: النقطة م مركز الدائرة، وطول ضلع السداسي 40 مم (يساوي نصف قطر الدائرة).', function (T) {
      var V = poly(T, 6, 0), A = V[0], B = V[3];
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'حدّد رؤوس السداسي', text: 'بنفس الفتحة ضع السن في أ (يمين المحور الأفقي) وارسم قوسين يقطعان الدائرة، ثم كرّر من ب (يسار المحور).', req: [{ t: 'arc', c: A, r: 40, at: [V[1], V[5]] }, { t: 'arc', c: B, r: 40, at: [V[2], V[4]] }] },
        { title: 'صِل الرؤوس', text: 'صِل النقاط الست المتجاورة بالخط الظاهر فينتج السداسي المنتظم.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'سباعي منتظم', 'رسم شكل سباعي منتظم داخل دائرة (طريقة تقريبية)', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. نصف ضلع المثلث المرسوم داخل الدائرة يساوي تقريبًا ضلع السباعي.', function (T) {
      var D = T.pol(T.C, 40, -90), E = T.pol(T.C, 40, -30), F = T.pol(T.C, 40, 210), s = 40 * Math.sqrt(3) / 2, th = 2 * Math.asin(s / 80) * 180 / Math.PI, V = [];
      for (var k = 0; k < 7; k++) V.push(T.pol(T.C, 40, 90 - th * k));
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'ارسم وتر المثلث', text: 'ضع السن في النقطة السفلى للدائرة وبنفس الفتحة ارسم قوسًا يقطع الدائرة في هـ و ي، ثم صِل هـ ي بخط إنشاء خفيف.', req: [{ t: 'arc', c: D, r: 40, at: [E, F] }, { t: 'line', a: E, b: F }] },
        { title: 'قسّم الدائرة', text: 'نصف الوتر (من هـ إلى المحور الرأسي) = ' + fx(s) + ' مم هو طول الضلع. افتح الفرجار به وحدّد الرؤوس السبعة بدءًا من النقطة العليا.', req: [{ t: 'step', pts: V, r: s }] },
        { title: 'صِل الرؤوس', text: 'صِل الرؤوس السبعة بالترتيب بالخط الظاهر.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'ثماني منتظم', 'رسم شكل ثماني منتظم داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المطلوب رسم شكل ثماني منتظم داخلها.', function (T) {
      var V = poly(T, 8, 0);
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'ارسم القطرين المائلين', text: 'بالمثلث 45° على المسطرة ارسم خطّين يمرّان بالمركز م بزاويتي 45° و135° (خط المحور)، فتنقسم الدائرة إلى 8 أجزاء متساوية.', req: [{ t: 'line', a: T.pol(T.C, 45, 45), b: T.pol(T.C, 45, 225), lt: 'center' }, { t: 'line', a: T.pol(T.C, 45, 135), b: T.pol(T.C, 45, 315), lt: 'center' }] },
        { title: 'صِل الرؤوس', text: 'صِل نقاط التقاطع الثماني بالترتيب بالخط الظاهر.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'عشاري منتظم', 'رسم شكل عشاري منتظم داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المسافة م ن في طريقة الخماسي تساوي ضلع العشاري.', function (T) {
      var M = T.pol(T.C, 20, 0), on = Math.sqrt(20 * 20 + 40 * 40) - 20, N = T.pol(T.C, on, 180), V = poly(T, 10, 90);
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'حدّد طول الضلع', text: 'كما في الخماسي: من منتصف نصف القطر الأيمن هـ ارسم قوسًا يمر بالنقطة العليا ويقطع المحور الأفقي في ن. المسافة م ن = ' + fx(on) + ' مم هي ضلع العشاري.', req: [{ t: 'arc', c: M, r: Math.sqrt(20 * 20 + 40 * 40), at: [N] }] },
        { title: 'قسّم الدائرة', text: 'افتح الفرجار بمقدار م ن وحدّد الرؤوس العشرة على الدائرة بدءًا من النقطة العليا.', req: [{ t: 'step', pts: V, r: on }] },
        { title: 'صِل الرؤوس', text: 'صِل الرؤوس العشرة بالترتيب بالخط الظاهر.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثانيًا: المضلعات المنتظمة داخل دائرة', 'اثنا عشر ضلعًا', 'رسم شكل منتظم ذي اثني عشر ضلعًا داخل دائرة', 'المعطى: النقطة م مركز دائرة نصف قطرها 40 مم. المطلوب تقسيم الدائرة إلى 12 جزءًا متساويًا.', function (T) {
      var V = poly(T, 12, 0), P0 = V[0], P3 = V[3], P6 = V[6], P9 = V[9];
      return { given: givenC(T), steps: [T.axesStep(), T.circleStep(40),
        { title: 'قسّم الدائرة إلى 12 جزءًا', text: 'بنفس الفتحة (40 مم) ضع السن في كل نقطة من نقاط تقاطع المحورين مع الدائرة وارسم قوسين يقطعان الدائرة.', req: [{ t: 'arc', c: P0, r: 40, at: [V[2], V[10]] }, { t: 'arc', c: P3, r: 40, at: [V[1], V[5]] }, { t: 'arc', c: P6, r: 40, at: [V[4], V[8]] }, { t: 'arc', c: P9, r: 40, at: [V[7], V[11]] }] },
        { title: 'صِل الرؤوس', text: 'صِل النقاط الاثنتي عشرة بالترتيب بالخط الظاهر.', req: [{ t: 'sides', pts: V }] }] };
    });
    add('ثالثًا: المماسات والتقسيم', 'قوس يمس ضلعي زاوية', 'رسم قوس نصف قطره 25 مم يمس ضلعي زاوية قائمة', 'المعطى: زاوية قائمة رأسها و، ونصف قطر القوس 25 مم.', function (T) {
      var O = T.P(110, 160), Q = T.P(135, 135), T1 = T.P(135, 160), T2 = T.P(110, 135);
      return { given: { segs: [[O, T.P(215, 160)], [O, T.P(110, 55)]], pts: [[O, 'و', -22, 18]] }, steps: [
        { title: 'ارسم موازيًا للضلع الأفقي', text: 'ارسم خطًا موازيًا للضلع الأفقي على بُعد 25 مم منه (خط إنشاء خفيف).', req: [{ t: 'line', a: T.P(120, 135), b: T.P(200, 135) }] },
        { title: 'ارسم موازيًا للضلع الرأسي', text: 'ارسم خطًا موازيًا للضلع الرأسي على بُعد 25 مم منه؛ تقاطع الخطين هو مركز القوس م.', req: [{ t: 'line', a: T.P(135, 150), b: T.P(135, 70) }] },
        { title: 'ارسم القوس المماس', text: 'افتح الفرجار 25 مم، ضع السن في م وارسم القوس من الضلع الأفقي إلى الضلع الرأسي.', req: [{ t: 'arc', c: Q, r: 25, at: [T1, T2, T.pol(Q, 25, 225)] }] }] };
    });
    add('ثالثًا: المماسات والتقسيم', 'قوس يمس دائرتين من الخارج', 'رسم قوس نصف قطره 30 مم يمس دائرتين من الخارج', 'المعطى: دائرتان نصفا قطريهما 15 مم و20 مم، والمسافة بين مركزيهما 70 مم.', function (T) {
      var C1 = T.P(115, 145), C2 = T.P(185, 145), r1 = 15, r2 = 20, R = 30, a = R + r1, b = R + r2, d = 70, x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(a * a - x * x), P = T.P(115 + x, 145 - h);
      function tp(Cc, rr) { var dd = dist(P, Cc); return [Cc[0] + (P[0] - Cc[0]) / dd * rr * T.K, Cc[1] + (P[1] - Cc[1]) / dd * rr * T.K]; }
      var T1 = tp(C1, r1), T2 = tp(C2, r2), mid = [(T1[0] + T2[0]) / 2, (T1[1] + T2[1]) / 2], md = dist(mid, P), M = [P[0] + (mid[0] - P[0]) / md * R * T.K, P[1] + (mid[1] - P[1]) / md * R * T.K];
      return { given: { circles: [[C1, r1], [C2, r2]], pts: [[C1, 'م١', -14, 24], [C2, 'م٢', -14, 24]] }, steps: [
        { title: 'قوس من مركز الدائرة الأولى', text: 'افتح الفرجار 30 + 15 = 45 مم، ضع السن في م١ وارسم قوسًا فوق الدائرتين.', req: [{ t: 'arc', c: C1, r: a, at: [P] }] },
        { title: 'قوس من مركز الدائرة الثانية', text: 'افتح الفرجار 30 + 20 = 50 مم، ضع السن في م٢ وارسم قوسًا يقطع القوس السابق في م (مركز القوس المطلوب).', req: [{ t: 'arc', c: C2, r: b, at: [P] }] },
        { title: 'ارسم القوس المماس', text: 'افتح الفرجار 30 مم، ضع السن في م وارسم القوس من نقطة التماس الأولى إلى الثانية.', req: [{ t: 'arc', c: P, r: R, at: [T1, T2, M] }] }] };
    });
    add('ثالثًا: المماسات والتقسيم', 'قوس يمس دائرتين من الداخل', 'رسم قوس نصف قطره 60 مم يمس دائرتين من الداخل', 'المعطى: دائرتان نصف قطر كل منهما 15 مم، والمسافة بين مركزيهما 50 مم.', function (T) {
      var C1 = T.P(125, 125), C2 = T.P(175, 125), r = 15, R = 60, a = R - r, h = Math.sqrt(a * a - 25 * 25), P = T.P(150, 125 - h);
      function tp(Cc) { var dd = dist(P, Cc); return [P[0] + (Cc[0] - P[0]) / dd * R * T.K, P[1] + (Cc[1] - P[1]) / dd * R * T.K]; }
      var T1 = tp(C1), T2 = tp(C2), M = T.P(150, 125 - h + R);
      return { given: { circles: [[C1, r], [C2, r]], pts: [[C1, 'م١', -14, 26], [C2, 'م٢', -14, 26]] }, steps: [
        { title: 'قوس من مركز الدائرة الأولى', text: 'افتح الفرجار 60 − 15 = 45 مم، ضع السن في م١ وارسم قوسًا فوق الدائرتين.', req: [{ t: 'arc', c: C1, r: a, at: [P] }] },
        { title: 'قوس من مركز الدائرة الثانية', text: 'بنفس الفتحة ضع السن في م٢ وارسم قوسًا يقطع القوس السابق في م.', req: [{ t: 'arc', c: C2, r: a, at: [P] }] },
        { title: 'ارسم القوس المماس', text: 'افتح الفرجار 60 مم، ضع السن في م وارسم القوس الذي يحيط بالدائرتين ويمسّهما من الداخل.', req: [{ t: 'arc', c: P, r: R, at: [T1, T2, M] }] }] };
    });
    add('ثالثًا: المماسات والتقسيم', 'تقسيم قطعة مستقيمة', 'تقسيم قطعة مستقيمة إلى 5 أقسام متساوية', 'المعطى: القطعة المستقيمة أ ب طولها 70 مم. المطلوب تقسيمها إلى 5 أقسام متساوية دون قياس طولها.', function (T) {
      var A = T.P(100, 150), B = T.P(170, 150), Rk = [], Dk = [];
      for (var k = 0; k <= 5; k++) Rk.push(T.pol(A, 12 * k, 35));
      for (var j = 1; j <= 4; j++) Dk.push(T.P(100 + 14 * j, 150));
      return { given: { segs: [[A, B]], pts: [[A, 'أ', -8, 26], [B, 'ب', -8, 26]] }, steps: [
        { title: 'ارسم خطًا مساعدًا', text: 'من النقطة أ ارسم خطًا مائلًا بزاوية 35° تقريبًا وطوله أكبر من 60 مم (خط إنشاء خفيف).', req: [{ t: 'line', a: A, b: Rk[5] }] },
        { title: 'قسّم الخط المساعد', text: 'افتح الفرجار 12 مم وابدأ من أ، وحدّد على الخط المساعد 5 أقسام متساوية.', req: [{ t: 'chain', pts: Rk, r: 12 }] },
        { title: 'صِل آخر نقطة بـ ب', text: 'صِل النقطة الخامسة على الخط المساعد بالنقطة ب.', req: [{ t: 'line', a: Rk[5], b: B }] },
        { title: 'ارسم خطوطًا موازية', text: 'بالمثلثين ارسم من النقاط 1 و2 و3 و4 خطوطًا موازية للخط الأخير؛ فتقسم أ ب إلى 5 أقسام متساوية (14 مم لكل قسم).', req: [1, 2, 3, 4].map(function (k) { return { t: 'line', a: Rk[k], b: Dk[k - 1] }; }) }] };
    });
    return D;
  }
  var DEFS = defs();

  function build(i, K, PX) {
    var d = DEFS[i] || DEFS[0];
    var T = { K: K, C: [PX.x + 150 * K, PX.y + 112 * K] };
    T.P = function (x, y) { return [PX.x + x * K, PX.y + y * K]; };
    T.pol = function (c, r, deg) { var a = deg * Math.PI / 180; return [c[0] + r * K * Math.cos(a), c[1] - r * K * Math.sin(a)]; };
    T.axesStep = function () { return { title: 'ارسم خطّي المحور', text: 'بالمسطرة والمثلث ارسم خطًا أفقيًا وخطًا رأسيًا يمرّان بالمركز م باستخدام «خط المحور».', req: [{ t: 'line', a: T.pol(T.C, 47, 180), b: T.pol(T.C, 47, 0), lt: 'center' }, { t: 'line', a: T.pol(T.C, 47, 90), b: T.pol(T.C, 47, 270), lt: 'center' }] }; };
    T.circleStep = function (r) { return { title: 'ارسم الدائرة', text: 'افتح الفرجار ' + r + ' مم، ضع السن في م وارسم دائرة كاملة.', req: [{ t: 'circle', c: T.C, r: r }] }; };
    var spec = d.build(T);
    spec.title = d.title; spec.given.text = d.given;
    spec.given.segs = spec.given.segs || []; spec.given.circles = spec.given.circles || []; spec.given.pts = spec.given.pts || [];
    // radii in px
    spec.steps.forEach(function (st) { st.req.forEach(function (q) { if (q.r !== undefined) q.rp = q.r * K; }); });
    spec.snap = spec.given.pts.map(function (p) { return p[0]; }).concat(spec.given.circles.map(function (c) { return c[0]; }));
    spec.given.segs.forEach(function (sg) { spec.snap.push(sg[0], sg[1]); });
    return spec;
  }
  function check(spec, st, K) {
    var tol = 1.6 * K, lines = st.filter(function (s) { return s.k === 'line'; }), arcs = st.filter(function (s) { return s.k === 'arc'; });
    var res = [], extra = '';
    function lineOK(q) { return lines.some(function (l) { return (!q.lt || l.lt === q.lt) && segD(q.a, [l.x1, l.y1], [l.x2, l.y2]) < tol && segD(q.b, [l.x1, l.y1], [l.x2, l.y2]) < tol; }); }
    function arcCovers(c, rp, p) { var a = Math.atan2(p[1] - c[1], p[0] - c[0]); return arcs.some(function (x) { return dist([x.cx, x.cy], c) < tol && Math.abs(x.r - rp) < tol && angIn(a, x.a0, x.sw); }); }
    function sideOK(P, Q) { return lines.some(function (l) { return l.lt === 'visible' && ((dist([l.x1, l.y1], P) < tol && dist([l.x2, l.y2], Q) < tol) || (dist([l.x1, l.y1], Q) < tol && dist([l.x2, l.y2], P) < tol)); }); }
    spec.steps.forEach(function (stp, si) {
      var ok = stp.req.every(function (q) {
        if (q.t === 'line') return lineOK(q);
        if (q.t === 'circle') return arcs.some(function (x) { return dist([x.cx, x.cy], q.c) < tol && Math.abs(x.r - q.rp) < tol && Math.abs(x.sw) > 2 * Math.PI - 0.25; });
        if (q.t === 'arc') return q.at.every(function (p) { return arcCovers(q.c, q.rp, p); });
        if (q.t === 'sides') { var n = q.pts.length, c = 0; for (var k = 0; k < n; k++) if (sideOK(q.pts[k], q.pts[(k + 1) % n])) c++; if (c && c < n) extra = c + '/' + n; q._c = c; return c === n; }
        if (q.t === 'step') { var m = q.pts.length; for (var j = 1; j < m; j++) { var pj = q.pts[j]; if (!(arcCovers(q.pts[j - 1], q.rp, pj) || arcCovers(q.pts[(j + 1) % m], q.rp, pj))) return false; } return true; }
        if (q.t === 'chain') { for (var i = 1; i < q.pts.length; i++) if (!arcCovers(q.pts[i - 1], q.rp, q.pts[i])) return false; return true; }
        return true;
      });
      res.push(ok);
    });
    res.extra = extra; return res;
  }
  function lineType(spec, i) { var st = spec.steps[i]; if (!st) return null; for (var k = 0; k < st.req.length; k++) { var q = st.req[k]; if (q.t === 'line' && q.lt) return q.lt; if (q.t === 'sides') return 'visible'; } return null; }
  function arcFeedback(spec, i, cp, K) {
    var st = spec.steps[i], tol = 1.6 * K; if (!st) return '';
    for (var k = 0; k < st.req.length; k++) { var q = st.req[k]; if ((q.t === 'arc' || q.t === 'circle') && dist([cp.cx, cp.cy], q.c) < tol && Math.abs(cp.r - q.rp) >= tol) return 'نصف القطر ' + (Math.round(cp.r / K * 10) / 10) + ' مم — المطلوب ' + (Math.round(q.r * 10) / 10) + ' مم'; }
    for (var j = 0; j < st.req.length; j++) { var r = st.req[j]; if ((r.t === 'arc' || r.t === 'circle') && Math.abs(cp.r - r.rp) < tol && dist([cp.cx, cp.cy], r.c) >= tol) return 'الفتحة صحيحة، لكن ضع سن الفرجار في النقطة المطلوبة بالضبط'; }
    return '';
  }
  function ghost(spec, i) {
    var st = spec.steps[i], d = ''; if (!st) return '';
    st.req.forEach(function (q) {
      if (q.t === 'line') { var u = [q.b[0] - q.a[0], q.b[1] - q.a[1]], L = Math.hypot(u[0], u[1]) || 1, e = 14; d += 'M' + fx(q.a[0] - u[0] / L * e) + ' ' + fx(q.a[1] - u[1] / L * e) + 'L' + fx(q.b[0] + u[0] / L * e) + ' ' + fx(q.b[1] + u[1] / L * e); }
      else if (q.t === 'circle') d += arcD(q.c[0], q.c[1], q.rp, 0, 2 * Math.PI);
      else if (q.t === 'arc') q.at.forEach(function (p) { var a = Math.atan2(p[1] - q.c[1], p[0] - q.c[0]); d += arcD(q.c[0], q.c[1], q.rp, a - 0.25, 0.5); });
      else if (q.t === 'sides') d += 'M' + q.pts.map(function (v) { return fx(v[0]) + ' ' + fx(v[1]); }).join('L') + 'Z';
      else if (q.t === 'step' || q.t === 'chain') for (var j = 1; j < q.pts.length; j++) { var c = q.pts[j - 1], p = q.pts[j], a2 = Math.atan2(p[1] - c[1], p[0] - c[0]); d += arcD(c[0], c[1], q.rp, a2 - 0.2, 0.4); }
    });
    return d;
  }
  /* actions to animate a step: [{k:'line',a,b,lt},{k:'arc',c,r,a0,sw}] */
  function demo(spec, i) {
    var st = spec.steps[i], out = []; if (!st) return out;
    st.req.forEach(function (q) {
      if (q.t === 'line') { var u = [q.b[0] - q.a[0], q.b[1] - q.a[1]], L = Math.hypot(u[0], u[1]) || 1, e = q.ext !== undefined ? q.ext * spec._K : 10; out.push({ k: 'line', a: [q.a[0] - u[0] / L * e, q.a[1] - u[1] / L * e], b: [q.b[0] + u[0] / L * e, q.b[1] + u[1] / L * e], lt: q.lt || (q.ext !== undefined ? 'visible' : 'cons'), pc: q.lt === 'center' ? 'h' : (q.ext !== undefined ? 'hb' : 'h') }); }
      else if (q.t === 'circle') out.push({ k: 'arc', c: q.c, r: q.rp, a0: -Math.PI / 2, sw: 2 * Math.PI });
      else if (q.t === 'arc') {
        var angs = q.at.map(function (p) { return Math.atan2(p[1] - q.c[1], p[0] - q.c[0]); });
        if (angs.length === 3) { var a0 = angs[0], a1 = angs[1], am = angs[2]; var sw = a1 - a0; while (sw > Math.PI * 2) sw -= Math.PI * 2; while (sw < -Math.PI * 2) sw += Math.PI * 2; if (!angIn(am, a0, sw)) sw = sw > 0 ? sw - 2 * Math.PI : sw + 2 * Math.PI; out.push({ k: 'arc', c: q.c, r: q.rp, a0: a0 - Math.sign(sw) * 0.08, sw: sw + Math.sign(sw) * 0.16 }); }
        else angs.forEach(function (a) { out.push({ k: 'arc', c: q.c, r: q.rp, a0: a - 0.3, sw: 0.6 }); });
      }
      else if (q.t === 'sides') { var n = q.pts.length; for (var k = 0; k < n; k++) out.push({ k: 'line', a: q.pts[k], b: q.pts[(k + 1) % n], lt: 'visible', pc: 'm07' }); }
      else if (q.t === 'step' || q.t === 'chain') for (var j = 1; j < q.pts.length; j++) { var c = q.pts[j - 1], p = q.pts[j], a2 = Math.atan2(p[1] - c[1], p[0] - c[0]); out.push({ k: 'arc', c: c, r: q.rp, a0: a2 - 0.22, sw: 0.44 }); }
    });
    return out;
  }
  window.DLLessons = {
    list: DEFS.map(function (d, i) { return { i: i, group: d.group, short: d.short, title: d.title }; }),
    build: function (i, K, PX) { var s = build(i, K, PX); s._K = K; return s; },
    check: check, lineType: lineType, arcFeedback: arcFeedback, ghost: ghost, demo: demo
  };
})();
