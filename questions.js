/* SHSAT Math Practice: question data. Edit this file to add or change questions. */

/* =====================================================================
   QUESTION DATA
   ---------------------------------------------------------------------
   Every question lives in the QUESTIONS array below. To add one, copy
   an entry of the same type and edit it.

   MATH: wrap inline math in \( ... \) and stand-alone math in \[ ... \].
   Use the tex`...` tag (instead of "quotes") for any text with math in
   it, so backslashes stay as written. Dollar signs ($70) are plain text.

   COMMON FIELDS
     id        unique text id
     form      1 or 2 (used by the "choose your questions" buttons)
     item      original item number in the PDF
     active    set to false to hide a question without deleting it
     type      "mc" | "multi" | "numeric" | "dropdown" | "classify" | "graph"
     prompt    question text (HTML allowed)
     figure    optional picture: a key from FIGURES (bottom of file) or an image URL
     explanation  worked solution shown after the student answers (HTML allowed).
                  <img data-fig="key"> inside it shows a picture from FIGURES.

   TYPE-SPECIFIC FIELDS
     mc        choices: [...], answer: "C"
     multi     choices: [...], answer: ["B","E"]   (student must pick all of them)
     numeric   answer: 12
     dropdown  blanks: HTML with {{0}}, {{1}}... where each menu goes,
               options: [[menu 0 options], [menu 1 options], ...],
               answer: [menu 0 answer, menu 1 answer, ...]
     classify  categories: ["Linear","Non-linear"],
               items: [{label: "..."} or {figure: "key", label: "..."}],
               answer: [category for item 0, item 1, ...]
     graph     grid, tools, given, check(state), solution, answerText (see examples)
   ===================================================================== */

const tex = String.raw;

/* Small helpers used by the graph questions' check() functions */
const near = (a, b) => Math.abs(a - b) < 1e-6;
const samePt = (p, q) => p && q && near(p[0], q[0]) && near(p[1], q[1]);
const filled = (arr) => arr.filter(Boolean);

const QUESTIONS = [

  /* ===================== FORM 1 ===================== */
  {
    id: "F1-01", form: 1, item: 1, active: true, type: "mc",
    prompt: tex`Which of the following expressions is <b>negative</b> in value?`,
    choices: [tex`\(4 - \pi\)`, tex`\(3\pi - 9\)`, tex`\(12 - 4\pi\)`, tex`\(36 - 9\pi\)`],
    answer: "C",
    explanation: tex`
      <p>Substitute the approximation \(\pi \approx 3.14\) into each expression and see which one comes out negative:</p>
      \[4 - \pi = 0.86\]
      \[3\pi - 9 = 0.42\]
      \[12 - 4\pi = -0.56\]
      \[36 - 9\pi = 7.74\]
      <p>So the answer is \(12 - 4\pi\).</p>`
  },
  {
    id: "F1-02", form: 1, item: 2, active: true, type: "graph",
    // Adapted: the original lets students drag a pre-made triangle shape.
    // Here students plot the three vertices A′, B′, C′ instead.
    prompt: tex`<p>Triangle ABC is graphed on the coordinate plane. Triangle ABC is reflected across the line \(y = -1\) to create image A′B′C′. Graph triangle A′B′C′ on the coordinate plane.</p>
      <p>Tap the grid to plot A′, then B′, then C′.</p>`,
    grid: { xMin: -9, xMax: 9, yMin: -9, yMax: 9, step: 1, snap: 1, xLabelStep: 1, yLabelStep: 1 },
    given: [{ kind: "polygon", points: [[-7, 7], [-7, 2], [-4, 2]], labels: ["A", "B", "C"] }],
    tools: [{ id: "tri", label: "Triangle A′B′C′", kind: "polygon", slots: 3, labels: ["A′", "B′", "C′"], color: "#2f55d4" }],
    check: (s) => samePt(s.tri[0], [-7, -9]) && samePt(s.tri[1], [-7, -4]) && samePt(s.tri[2], [-4, -4]),
    solution: { tri: [[-7, -9], [-7, -4], [-4, -4]] },
    answerText: tex`A′ \((-7, -9)\), B′ \((-7, -4)\), C′ \((-4, -4)\)`,
    explanation: tex`
      <p>After the triangle is reflected across the line \(y = -1\):</p>
      <p>A′ is at \((-7, -9)\)<br>B′ is at \((-7, -4)\)<br>C′ is at \((-4, -4)\)</p>`
  },
  {
    id: "F1-03", form: 1, item: 3, active: true, type: "mc",
    prompt: tex`The symbol \(\langle x, y, z \rangle\) means \(\dfrac{xz + xy}{2} + zy\). What is the value of \(\langle 3, 4, 8 \rangle\)?`,
    choices: ["15", "34", "50", "56"],
    answer: "C",
    explanation: tex`
      <p>Here \(x = 3\), \(y = 4\), and \(z = 8\). Substitute those values into the expression and simplify:</p>
      \[\frac{(3\cdot 8) + (3\cdot 4)}{2} + (8\cdot 4)\]
      \[= \frac{24 + 12}{2} + 32\]
      \[= \frac{36}{2} + 32\]
      \[= 18 + 32 = 50\]`
  },
  {
    id: "F1-04", form: 1, item: 4, active: true, type: "mc",
    prompt: tex`<p>Simplify:</p>\[\frac{p^{12}\cdot p^{0}}{p^{-4}}\]`,
    choices: [tex`\(0\)`, tex`\(p^{-3}\)`, tex`\(p^{8}\)`, tex`\(p^{16}\)`],
    answer: "D",
    explanation: tex`
      <p>Dividing by \(p^{-4}\) is the same as multiplying by \(p^{4}\). Then add the exponents:</p>
      \[\frac{p^{12}\cdot p^{0}}{p^{-4}} = \left(p^{12}\cdot p^{0}\right)\frac{p^{4}}{1} = p^{(12+0+4)} = p^{(12+4)} = p^{16}\]`
  },
  {
    id: "F1-05", form: 1, item: 5, active: true, type: "dropdown",
    prompt: tex`<p>A container initially contains \(n\) gallons of water. A student adds 15 gallons of water, making the container 60% full. After the student adds 10 more gallons of water, the container is 80% full.</p>
      <p>Select the correct answers from each drop-down to complete the sentences.</p>
      <p>Let \(x\) represent the total number of gallons the container can hold.</p>`,
    blanks: tex`<p>The equation that represents the situation immediately after the student adds 15 gallons of water is \(n + 15 =\) {{0}}.</p>
      <p>The equation that represents the situation after the student adds 10 gallons of water is \(n + 25 =\) {{1}}.</p>
      <p>The number of gallons, \(n\), in the container initially is {{2}} gallons.</p>`,
    options: [["0.50x", "0.60x", "0.80x"], ["0.60x", "0.70x", "0.80x"], ["15", "25", "35", "50"]],
    answer: ["0.60x", "0.80x", "15"],
    explanation: tex`
      <p>Let \(x\) represent the total number of gallons the container can hold.</p>
      <p><b>First blank:</b> Right after the student adds 15 gallons, the container is 60% full. Multiply 0.60 by \(x\) and set it equal to the water in the container (the initial amount \(n\) plus 15 gallons): \(n + 15 = 0.60x\).</p>
      <p><b>Second blank:</b> After 10 more gallons, the container is 80% full. The water in it is now \(n\) plus 15 plus 10 gallons: \(n + 25 = 0.80x\).</p>
      <p><b>Third blank:</b> Subtract the first equation from the second to eliminate \(n\):</p>
      \[(n + 25) - (n + 15) = 0.80x - 0.60x\]
      \[10 = 0.2x \;\;\Rightarrow\;\; x = \frac{10}{0.2} = 50\]
      <p>Substitute 50 for \(x\) in the first equation and solve for \(n\):</p>
      \[n + 15 = 0.60(50) \;\;\Rightarrow\;\; n + 15 = 30 \;\;\Rightarrow\;\; n = 15\]`
  },
  {
    id: "F1-06", form: 1, item: 6, active: true, type: "mc",
    figure: "f1_q6",
    prompt: tex`Straight line \(l\) passes through the origin, as shown in the figure above. What is the slope of line \(l\) in terms of \(a\) and \(b\)?`,
    choices: [tex`\(\dfrac{a}{b}\)`, tex`\(\dfrac{2b}{a}\)`, tex`\(\dfrac{2a}{b}\)`, tex`\(\dfrac{b}{a}\)`],
    answer: "D",
    explanation: tex`
      <p>Use the slope formula with the two points \((a, b)\) and \((2a, 2b)\):</p>
      \[\text{slope of } l = \frac{y_2 - y_1}{x_2 - x_1} = \frac{2b - b}{2a - a} = \frac{b}{a}\]`
  },
  {
    id: "F1-07", form: 1, item: 7, active: true, type: "multi",
    prompt: tex`<p>A scatter plot displays the number of cars sold each month at a car dealership over the past year. A student has drawn a line of best fit to model the data and wants to determine whether the line accurately represents the data. What are two characteristics of an accurate line of best fit for a scatter plot?</p>
      <p>Select the <b>two</b> correct answers.</p>`,
    choices: [
      "The line of best fit is accurate if it passes through at least one of the data points.",
      "The line of best fit is accurate if about half of the data points are above the line and half are below the line.",
      "The line of best fit is accurate if it touches every single data point on the scatter plot.",
      "The line of best fit should always pass through the origin (0, 0).",
      "The line of best fit should capture the overall trend of the data."
    ],
    answer: ["B", "E"],
    explanation: tex`
      <p>An accurate line of best fit has approximately half of the data points above the line and half below it.</p>
      <p>One of the main purposes of a line of best fit is to model the general direction, or trend, of the data, even if it does not pass through any of the specific data points.</p>`
  },
  {
    id: "F1-08", form: 1, item: 8, active: true, type: "mc",
    prompt: tex`To determine the price of servicing a car, a mechanic charges a fixed fee plus an hourly rate for each hour he works. If his price for 4 hours of work is $270, and his price for 7 hours of work is $420, what is the fixed fee that the mechanic charges?`,
    choices: ["$50", "$60", "$70", "$120"],
    answer: "C",
    explanation: tex`
      <p>Let \(y\) be the fixed fee and \(x\) the price per hour. Set up the two equations and subtract one from the other to find the price per hour:</p>
      \[(y + 7x = 420) - (y + 4x = 270)\]
      \[3x = 150\]
      \[x = 50\]
      <p>To find the fixed fee, use one of the equations and solve for \(y\) using \(x = 50\):</p>
      \[y + 4(50) = 270\]
      \[y + 200 = 270\]
      \[y = 70\]
      <p>The fixed fee is $70.</p>`
  },
  {
    id: "F1-09", form: 1, item: 9, active: true, type: "mc",
    figure: "f1_q9",
    prompt: tex`Rectangle PQRS above is rotated \(180^\circ\) about the origin to form rectangle P′Q′R′S′. What are the coordinates of R′?`,
    choices: [tex`\((4, -3)\)`, tex`\((-4, 3)\)`, tex`\((-4, 1)\)`, tex`\((-4, -3)\)`],
    answer: "D",
    explanation: tex`
      <p>Point R is at \((4, 3)\). When a point \((x, y)\) is rotated \(180^\circ\) about the origin, it moves to \((-x, -y)\).</p>
      <p>Therefore, \(R(4, 3) \to R'(-4, -3)\).</p>`
  },
  {
    id: "F1-10", form: 1, item: 10, active: true, type: "mc",
    prompt: tex`\[\frac{15.3 \times 10^{-8}}{1.5 \times 10^{4}}\]<p>What is the quotient of the expression above, expressed in scientific notation?</p>`,
    choices: [tex`\(1.02 \times 10^{-13}\)`, tex`\(1.02 \times 10^{-11}\)`, tex`\(1.02 \times 10^{-4}\)`, tex`\(1.02 \times 10^{12}\)`],
    answer: "B",
    explanation: tex`
      \[\frac{15.3\times 10^{-8}}{1.5\times 10^{4}} = \left(\frac{15.3}{1.5}\right)\times\frac{10^{-8}}{10^{4}} = 10.2\times\frac{10^{-8}}{10^{4}}\]
      <p>Use the rule of exponents to simplify:</p>
      \[10.2\times 10^{(-8-4)} = 10.2\times 10^{-12}\]
      <p>Rewrite the answer so that it is in standard scientific notation form:</p>
      \[1.02\times 10^{-11}\]`
  },
  {
    id: "F1-11", form: 1, item: 11, active: true, type: "graph",
    prompt: tex`<p>A system of linear equations is shown.</p>
      \[\begin{cases} 2x + y = 5 \\ x - y = 1 \end{cases}\]
      <p>Graph the solution to the system of linear equations.</p>
      <ul>
        <li>Select the <b>Line 1</b> button to graph line 1. Select two points on the coordinate plane. A line will be drawn through the two points.</li>
        <li>Select the <b>Line 2</b> button to graph line 2. Select two points on the coordinate plane. A line will be drawn through the two points.</li>
        <li>Select the <b>Solution</b> button. Select a place on the coordinate plane to plot the point.</li>
      </ul>`,
    grid: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, step: 1, snap: 1, xLabelStep: 1, yLabelStep: 1 },
    tools: [
      { id: "line1", label: "Line 1", kind: "line", slots: 2, color: "#2f55d4" },
      { id: "line2", label: "Line 2", kind: "line", slots: 2, color: "#a8327a" },
      { id: "sol", label: "Solution", kind: "point", slots: 1, color: "#1b2040" }
    ],
    // Each line must match one of the two equations (either order is accepted).
    check: (s) => {
      const onA = (p) => near(2 * p[0] + p[1], 5);   // 2x + y = 5
      const onB = (p) => near(p[0] - p[1], 1);       // x - y = 1
      const fits = (pts, f) => pts.length === 2 && !samePt(pts[0], pts[1]) && pts.every(f);
      const l1 = filled(s.line1), l2 = filled(s.line2);
      const linesOk = (fits(l1, onA) && fits(l2, onB)) || (fits(l1, onB) && fits(l2, onA));
      return linesOk && samePt(s.sol[0], [2, 1]);
    },
    solution: { line1: [[0, 5], [1, 3]], line2: [[-1, -2], [2, 1]], sol: [[2, 1]] },
    answerText: tex`Line 1: \(y = -2x + 5\) &nbsp;·&nbsp; Line 2: \(y = x - 1\) &nbsp;·&nbsp; Solution: \((2, 1)\)`,
    explanation: tex`
      <p>Graph line 1: \(y = -2x + 5\) with slope \(-2\) and \(y\)-intercept \((0, 5)\), using points \((0, 5)\) and \((1, 3)\).</p>
      <p>Graph line 2: \(y = x - 1\) with slope \(1\) and \(y\)-intercept \((0, -1)\), using points \((-1, -2)\) and \((2, 1)\).</p>
      <p>The lines intersect at the point \((2, 1)\).</p>`
  },
  {
    id: "F1-12", form: 1, item: 12, active: true, type: "numeric",
    prompt: tex`<p>Assume \(S(x)\) equals the sum of all positive even integers less than or equal to \(x\). What is the value of \(S(7)\)?</p><p>Enter your answer in the space.</p>`,
    answer: 12,
    explanation: tex`
      <p>\(S(x)\) is the sum of all positive even integers less than or equal to \(x\). The positive integers less than or equal to 7 are 1, 2, 3, 4, 5, 6, and 7. Take the even integers from the list and find the sum:</p>
      \[S(7) = 2 + 4 + 6 = 12\]`
  },
  {
    id: "F1-13", form: 1, item: 13, active: true, type: "mc",
    figure: "f1_q13",
    prompt: tex`In the figure above, \(\triangle MPR\) is similar to \(\triangle NPQ\). If the length of \(\overline{NQ}\) is 10 centimeters, what is the length of \(\overline{MR}\) in terms of \(x\)?`,
    choices: [tex`\(2x\)`, tex`\(2x + 10\)`, tex`\(x + 5\)`, tex`\(\tfrac{1}{2}x + 5\)`],
    answer: "B",
    explanation: tex`
      <p>Triangles NPQ and MPR are similar, so their corresponding sides are proportional. Set up a proportion to find \(\overline{MR}\). (Side MP is \(x + 5\).)</p>
      \[\frac{\overline{MR}}{\overline{MP}} = \frac{\overline{NQ}}{\overline{NP}}\]
      \[\frac{\overline{MR}}{x + 5} = \frac{10}{5}\]
      \[5\left(\overline{MR}\right) = 10(x + 5)\]
      \[5\left(\overline{MR}\right) = 10x + 50\]
      \[\overline{MR} = 2x + 10\]`
  },

  /* ===================== FORM 2 ===================== */
  {
    id: "F2-01", form: 2, item: 1, active: true, type: "mc",
    prompt: tex`Which number has a value that is located between 7 and 8 on a number line?`,
    choices: [tex`\(\sqrt{37}\)`, tex`\(\sqrt{47}\)`, tex`\(\sqrt{57}\)`, tex`\(\sqrt{67}\)`],
    answer: "C",
    explanation: tex`
      <p>57 is located between the perfect squares 49 and 64.</p>
      <p>\(\sqrt{49}\) is located at 7 on a number line, and \(\sqrt{64}\) is located at 8. Therefore, \(\sqrt{57}\) is located between 7 and 8.</p>`
  },
  {
    id: "F2-02", form: 2, item: 2, active: true, type: "mc",
    figure: "f2_q2",
    prompt: tex`In the figure above, \(k \parallel m\). Straight line \(p\) intersects both line \(k\) and line \(m\). The measure of \(\angle T\) is \(47^\circ\). What is the measure of \(\angle J\)?`,
    choices: ["43°", "47°", "133°", "137°"],
    answer: "C",
    explanation: tex`
      <p>Angle T \((47^\circ)\) and the angle immediately to its right (call it \(x\)) are supplementary, so their measures add to \(180^\circ\):</p>
      \[47^\circ + x = 180^\circ\]
      \[x = 133^\circ\]
      <p>Lines \(k\) and \(m\) are parallel and both are cut by line \(p\), a transversal, so corresponding angles are congruent. The \(133^\circ\) angle and angle J are corresponding angles, so angle J measures \(133^\circ\).</p>`
  },
  {
    id: "F2-03", form: 2, item: 3, active: true, type: "mc",
    prompt: tex`Which of these numbers is irrational?`,
    choices: [tex`\(0.\overline{7}\)`, tex`\(\sqrt{9}\)`, tex`\(\dfrac{9}{7}\)`, tex`\(\sqrt{7}\)`],
    answer: "D",
    explanation: tex`
      <p>\(\sqrt{7}\) is an irrational number because its value, \(2.645751311\ldots\), is a non-repeating, non-terminating decimal, and non-repeating, non-terminating decimals are irrational numbers.</p>`
  },
  {
    id: "F2-04", form: 2, item: 4, active: true, type: "classify",
    prompt: tex`<p>Determine whether each function is linear or non-linear.</p><p>Select one answer in each row.</p>`,
    categories: ["Linear", "Non-linear"],
    items: [
      { label: tex`\(y = \dfrac{x}{4}\)` },
      { label: tex`\(y = \dfrac{2}{x} + 1\)` },
      { label: tex`\(y = -5x + 9\)` }
    ],
    answer: ["Linear", "Non-linear", "Linear"],
    explanation: tex`
      <p>A linear equation is one that can take the form \(y = mx + b\).</p>
      <p>\(y = \dfrac{x}{4}\): <b>Linear.</b> It is in the form \(y = mx + b\) with \(m = \tfrac{1}{4}\) and \(b = 0\). It is a straight line with a constant rate of change (slope).</p>
      <p>\(y = \dfrac{2}{x} + 1\): <b>Non-linear.</b> It has a variable in the denominator, so it cannot be written in the form \(y = mx + b\). Its graph is a curve (a hyperbola), not a straight line.</p>
      <p>\(y = -5x + 9\): <b>Linear.</b> It is in the form \(y = mx + b\) with slope \(-5\) and \(y\)-intercept 9. It has a constant rate of change, so its graph is a line.</p>`
  },
  {
    id: "F2-05", form: 2, item: 5, active: true, type: "mc",
    figure: "f2_q5",
    prompt: tex`<p>Triangles JKL and J″K″L″ are congruent triangles.</p><p>Which two transformations were used to transform JKL to J″K″L″?</p>`,
    choices: [
      tex`A translation to the right, and then a reflection across the \(y\)-axis`,
      tex`A reflection across the \(x\)-axis, and then a clockwise rotation of 270°`,
      tex`A rotation of 180° about the origin, and then a translation across the \(x\)-axis`,
      tex`A reflection across the \(y\)-axis, and then a counterclockwise rotation of 90° about its center`
    ],
    answer: "D",
    explanation: tex`
      <p>First, reflect JKL over the \(y\)-axis to get J′K′L′. You can tell from the reversed vertices.</p>
      <img data-fig="f2_q5_exp1" alt="Triangle JKL reflected over the y-axis to make J′K′L′">
      <p>Then rotate J′K′L′ 90° counterclockwise about its center. The order of the vertices stays the same, just rotated.</p>
      <img data-fig="f2_q5_exp2" alt="J′K′L′ rotated 90° counterclockwise to make J″K″L″">`
  },
  {
    id: "F2-06", form: 2, item: 6, active: true, type: "classify",
    // Note: the answer key flagged the bottom-right graph for review. At full
    // resolution it is two separate pieces that overlap between x = -1 and 0,
    // which matches the explanation ("Not a Function").
    prompt: tex`<p>Determine whether each graph represents a function or not.</p><p>Choose an answer for each graph. Each answer may be used more than once.</p>`,
    categories: ["Function", "Not a Function"],
    items: [
      { figure: "f2_q6_tl", label: "Top left" },
      { figure: "f2_q6_tr", label: "Top right" },
      { figure: "f2_q6_bl", label: "Bottom left" },
      { figure: "f2_q6_br", label: "Bottom right" }
    ],
    answer: ["Function", "Not a Function", "Function", "Not a Function"],
    explanation: tex`
      <p>A function assigns each input exactly one output: for each value of \(x\) there is exactly one value of \(y\). If any vertical line crosses the graph more than once, it is not a function. This is called the <i>vertical line test</i>.</p>
      <p><b>Top left (linear graph): Function.</b> A diagonal straight line passes the vertical line test. Every \(x\)-value has exactly one \(y\)-value.</p>
      <p><b>Top right (vertical line): Not a function.</b> It fails the vertical line test. The \(x\)-value \(-3\) has an infinite number of \(y\)-values.</p>
      <p><b>Bottom left (piecewise graph): Function.</b> No vertical line touches the graph in more than one spot.</p>
      <p><b>Bottom right (piecewise graph): Not a function.</b> It fails the vertical line test. For each value of \(x\) between \(-1\) and \(0\), there are 2 values for \(y\).</p>`
  },
  {
    id: "F2-07", form: 2, item: 7, active: true, type: "mc",
    figure: "f2_q7",
    prompt: tex`<p>The scatter plot shows a set of data.</p><p>Which equation represents the most accurate line of best fit for the data shown in the scatter plot?</p>`,
    choices: [tex`\(y = (-x)\)`, tex`\(y = x\)`, tex`\(y = (-x) + 2\)`, tex`\(y = x + 2\)`],
    answer: "B",
    explanation: tex`
      <p>The line \(y = x\) has a positive slope, and the data points trend in a positive direction.</p>
      <p>The line \(y = x\) has 5 of the data points above it and 5 below it. This makes it the most accurate line of best fit for this data.</p>`
  },
  {
    id: "F2-08", form: 2, item: 8, active: true, type: "mc",
    prompt: tex`What is the point of intersection of the graphs of \(y = -4x + 3\) and \(y = 2x + 5\)?`,
    choices: [
      tex`\(\left(-\dfrac{1}{3},\ 4\dfrac{1}{3}\right)\)`,
      tex`\(\left(-\dfrac{1}{3},\ 5\dfrac{2}{3}\right)\)`,
      tex`\(\left(\dfrac{1}{3},\ 1\dfrac{2}{3}\right)\)`,
      tex`\(\left(\dfrac{1}{3},\ 5\dfrac{2}{3}\right)\)`
    ],
    answer: "A",
    explanation: tex`
      <p>To find where the lines meet, set the equations equal:</p>
      \[-4x + 3 = 2x + 5\]
      <p>Solve for \(x\):</p>
      \[-6x = 2 \;\;\Rightarrow\;\; x = \frac{2}{-6} = -\frac{1}{3}\]
      <p>Substitute \(-\tfrac{1}{3}\) for \(x\) in either equation to find \(y\):</p>
      \[y = 2\left(-\tfrac{1}{3}\right) + 5 = -\tfrac{2}{3} + 5 = 4\tfrac{1}{3}\]
      \[\text{or}\quad y = -4\left(-\tfrac{1}{3}\right) + 3 = \tfrac{4}{3} + 3 = 4\tfrac{1}{3}\]
      <p>The point of intersection is \(\left(-\tfrac{1}{3},\ 4\tfrac{1}{3}\right)\).</p>`
  },
  {
    id: "F2-09", form: 2, item: 9, active: true, type: "mc",
    prompt: tex`<p>The table below represents a linear function.</p>
      <table class="data">
        <tr><th>\(x\)</th><th>\(y\)</th></tr>
        <tr><td>12</td><td>30</td></tr>
        <tr><td>24</td><td>40</td></tr>
        <tr><td>36</td><td>50</td></tr>
      </table>
      <p>A second linear function is represented by the equation \(y = 4x + 3\). Which statement comparing the rates of change of the two functions is true?</p>`,
    choices: [
      tex`The rate of change for \(y = 4x + 3\) is less because \(3 < 20\).`,
      tex`The rate of change for \(y = 4x + 3\) is less because \(-\tfrac{3}{4} > -24\).`,
      tex`The rate of change for \(y = 4x + 3\) is greater because \(4 > \tfrac{5}{6}\).`,
      tex`The rate of change for \(y = 4x + 3\) is greater because \(-\tfrac{3}{4} < \tfrac{5}{6}\).`
    ],
    answer: "C",
    explanation: tex`
      <p>The rate of change is equal to the slope. Find the rate of change for the function in the table:</p>
      \[\frac{y_2 - y_1}{x_2 - x_1} = \frac{40 - 30}{24 - 12} = \frac{10}{12} = \frac{5}{6}\]
      <p>In \(y = mx + b\), the slope is \(m\), so the rate of change of \(y = 4x + 3\) is 4.</p>
      <p>The rate of change of \(y = 4x + 3\) is greater because \(4 > \tfrac{5}{6}\).</p>`
  },
  {
    id: "F2-10", form: 2, item: 10, active: true, type: "numeric",
    prompt: tex`The function \(y = 2x - 4\) is graphed. The line of the graph travels through point \((0, -4)\) and point \((12, y)\). What is the value of \(y\) in point \((12, y)\)?`,
    answer: 20,
    explanation: tex`
      <p>The function \(y = 2x - 4\) is linear because it is in the form \(y = mx + b\).</p>
      <p>Find \(y\) by substituting the \(x\)-value from \((12, y)\), which is 12, into the equation:</p>
      \[y = 2(12) - 4\]
      \[y = 24 - 4\]
      \[y = 20\]`
  },
  {
    id: "F2-11", form: 2, item: 11, active: true, type: "mc",
    prompt: tex`How many solutions are there to the equation \(|4x + 6| = -2\)?`,
    choices: ["No solutions", "One solution", "Two solutions", "An infinite number of solutions"],
    answer: "A",
    explanation: tex`<p>No solutions are possible, because an absolute value can never be negative.</p>`
  },
  {
    id: "F2-12", form: 2, item: 12, active: true, type: "graph",
    prompt: tex`<p>The metered fare for a taxi in New York City is:</p>
      <ul>
        <li>$3.00 initial charge</li>
        <li>Plus $0.70 per \(\tfrac{1}{5}\) mile</li>
        <li>Plus $0.50 MTA State Surcharge for all trips ending in New York City</li>
        <li>Plus $1.00 Improvement Surcharge</li>
        <li>Plus $2.50 Rush Hour Surcharge from 4 p.m. to 8 p.m. on weekdays</li>
      </ul>
      <p>Create the graph of the linear function that models the cost, \(y\), of a taxi ride on a Saturday for \(x\) miles that ends in New York City.</p>
      <p>Select a location on the coordinate grid to plot each data point. A line will connect the points.</p>`,
    grid: { xMin: 0, xMax: 6, yMin: 0, yMax: 12, step: 0.5, snap: 0.5, xLabelStep: 0.5, yLabelStep: 1,
            title: "Taxi Ride Cost", xTitle: "Distance (miles)", yTitle: "Cost (dollars)", height: 420 },
    tools: [{ id: "pts", label: "Points", kind: "path", slots: 6, min: 2, color: "#2f55d4" }],
    // At least two different points, and every point must be on y = 3.5x + 4.5
    check: (s) => {
      const pts = filled(s.pts);
      const distinct = pts.filter((p, i) => pts.findIndex((q) => samePt(p, q)) === i);
      return distinct.length >= 2 && pts.every((p) => near(p[1], 3.5 * p[0] + 4.5));
    },
    solution: { pts: [[0, 4.5], [1, 8]] },
    answerText: tex`\(y = 3.5x + 4.5\), through \((0, 4.5)\) and \((1, 8)\)`,
    explanation: tex`
      <p>The function \(y = mx + b\) will be plotted on the graph.</p>
      <p><b>First, find \(b\), the \(y\)-intercept, from the fixed costs:</b> $3.00 initial charge + $0.50 MTA State Surcharge + $1.00 Improvement Surcharge = $4.50, so \(b = 4.50\). (The ride is on a Saturday, so the $2.50 weekday rush hour surcharge does not apply.)</p>
      <p><b>Next, find \(m\), the slope:</b> $0.70 per \(\tfrac{1}{5}\) mile = $3.50 per 1 mile, so \(m = 3.50\).</p>
      <p>Let \(x\) be the number of miles and \(y\) the total cost of the ride. Then \(y = 3.50x + 4.50\).</p>
      <p>To graph it, plot at least two points and draw a straight line. For example:</p>
      <p>When \(x = 0\), \(y = 4.50\): point \((0, 4.5)\)<br>When \(x = 1\), \(y = 3.5(1) + 4.5 = 8.0\): point \((1, 8)\)</p>`
  },
  {
    id: "F2-13", form: 2, item: 13, active: true, type: "numeric",
    prompt: tex`\[0.44 = \frac{x}{25}\]<p>What is the value of \(x\) in the equation?</p>`,
    answer: 11,
    explanation: tex`
      <p>To find \(x\), isolate it on one side of the equation by multiplying both sides by 25:</p>
      \[0.44 = \frac{x}{25}\]
      \[25(0.44) = \left(\frac{x}{25}\right)25\]
      \[11 = x\]`
  }
];
