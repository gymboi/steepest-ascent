$(document).ready(function () {
    let header = $('#header');
    let buttonWrapper = $('#button-wrapper');
    let menuButton = $('#hamburger');
    let discussionButton = $('#discussion');
    let exampleButton = $('#example');
    let aboutButton = $('#about');

    menuButton.on('click', () => {
        header.toggleClass('open');
        buttonWrapper.toggleClass('open');
    });

    let tableHeaders = ['i', 'x<sub>l</sub>', 'x<sub>u</sub>', 'f(x<sub>l</sub>)', 'f(x<sub>u</sub>)', 'x<sub>r</sub>', 'f(x<sub>r</sub>)', 'ε<sub>a</sub>'];
    let results = $("#results");

    let hr = $('<tr></tr>');
    tableHeaders.forEach(e => {
        hr.append($(`<th>${e}</th>`));
    });
    results.append(hr);

    // Function code
    let functionText = $("#function");
    let formula = "";
    functionText.on('input', (ev) => {
        formula = (ev.target.getValue());
    });

    let xd = "";
    $("#x-derivative").on('input', (ev) => {
        xd = (ev.target.getValue());
    });
    let yd = "";
    $("#y-derivative").on('input', (ev) => {
        yd = (ev.target.getValue());
    });

    const ce = new ComputeEngine.ComputeEngine();
    ce.numericMode = 'machine';

    MathLive.renderMathInDocument();

    let calculateButton = $("#calculate");

    calculateButton.on("click", () => {
        results.empty();
        hr = $('<tr></tr>');
        tableHeaders.forEach(e => {
            hr.append($(`<th>${e}</th>`));
        });
        results.append(hr);

        let iterations = [];
        console.log(iterations);
        let repetitions = $("#repetitions").val();
        console.log(repetitions);
        iterations = calculate(ce, formula, $("#x0").val(), $("#y0").val(), xd, yd, repetitions);

        //clears iterations-wrapper content
        let clearIteration = document.querySelector(".iterations-wrapper");
        clearIteration.innerHTML = "";

        //add iterations-wrapper content
        let iterationsWrapper = $(".iterations-wrapper");

        let iterationDiv = $('<div class="iteration"></div>');
        iterationsWrapper.append($('<span class="solution-title">Solution</span>'));
        for (let i = 0; i < repetitions; i++) {
        }
        console.log(iterations);
    });
});

// xd = x derivative
// yd = y derivative
function calculate(ce, expression, x0, y0, xd, yd, repetitions) {
    let iterations = [];
    // expression, x0, y0, xd, yd, xdv, ydv, fxy, gh, ghd, h

    let x;
    let y;

    let xdv;
    let ydv;
    for (let i = 0; i < repetitions; i++) {
        if (i == 0) {
            x = parseFloat(x0);
            y = parseFloat(y0);
        }
        // Get partial derivative of x
        xdv = ce.parse(xd);
        xdv = xdv.subs({ x: ce.box(x), y: ce.box(y) });

        // Get partial derivative of y
        ydv = ce.parse(yd);
        ydv = ydv.subs({ x: ce.box(x), y: ce.box(y) });

        // Get function value of xy
        let fxy = expression;
        fxy = fxy.replaceAll("x", `\\left(${x}+${xdv.N().numericValue}h\\right)`);
        fxy = fxy.replaceAll("y", `\\left(${y}+${ydv.N().numericValue}h\\right)`);
        fxy = ce.parse(fxy);

        let gh = ce.box(['Expand', fxy]).evaluate().latex;
        let ghd = math.derivative(gh, 'h').toString();
        let h;
        iterations.push([x, y, xdv.N().numericValue, ydv.N().numericValue, fxy.latex, gh, ghd, h]);
    }
    return iterations;
}

// xr = approximate root, xro = old approximate root
function calculateApproximateError(xr, xro) {
    let e = Math.abs((xr - xro) / xr) * 100;
    e = parseFloat(e.toFixed(4)) + "%";
    return e;
}